import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    // Check if deposit exists
    const existingDeposit = await prisma.deposit.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            wallet: true,
          },
        },
        slipImage: {
          select: {
            id: true,
            imageUrl: true,
            nameFile: true,
          },
        },
      },
    });

    if (!existingDeposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    if (existingDeposit.status !== "PENDING") {
      return NextResponse.json(
        { error: "Deposit is not pending" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update deposit status
      const updatedDeposit = await tx.deposit.update({
        where: { id },
        data: {
          status: "REJECTED",
          comment: reason || "Rejected by admin",
        },
      });

      // Get or create wallet for transaction record
      let walletId = existingDeposit.user.wallet?.id;
      if (!walletId) {
        const wallet = await tx.wallet.upsert({
          where: { userId: existingDeposit.user.id },
          update: {},
          create: {
            userId: existingDeposit.user.id,
            balance: 0,
          },
        });
        walletId = wallet.id;
      }

      // Create transaction record for rejected deposit
      const transaction = await tx.transaction.create({
        data: {
          amount: existingDeposit.amount,
          type: "DEPOSIT",
          status: "FAILED",
          userId: existingDeposit.user.id,
          adminId: session.user.id,
          walletId: walletId,
          depositId: id,
        },
      });

      return { updatedDeposit, transaction };
    });

    // Log the rejection action
    await logActivity({
      userId: session.user.id,
      action: "REJECT",
      model: "Deposit",
      modelId: id,
      oldData: JSON.stringify({ status: "PENDING" }),
      newData: JSON.stringify({ status: "REJECTED", reason }),
      description: `Admin rejected deposit of ${existingDeposit.amount} THB for user ${existingDeposit.user.username}. Reason: ${reason || "No reason provided"}`,
      ipAddress: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: "Deposit rejected successfully",
      deposit: result.updatedDeposit,
    });
  } catch (error) {
    console.error("Error rejecting deposit:", error);
    return NextResponse.json(
      { error: "Failed to reject deposit" },
      { status: 500 }
    );
  }
}
