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
    const { comment } = body;

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
          status: "APPROVED",
          comment: comment || "Approved by admin",
        },
      });

      // Update or create user wallet balance
      const currentBalance = existingDeposit.user.wallet?.balance || 0;
      const newBalance = currentBalance + existingDeposit.amount;
      
      const wallet = await tx.wallet.upsert({
        where: { userId: existingDeposit.user.id },
        update: { balance: newBalance },
        create: {
          userId: existingDeposit.user.id,
          balance: newBalance,
        },
      });

       // Create transaction record
       const transaction = await tx.transaction.create({
         data: {
           amount: existingDeposit.amount,
           type: "DEPOSIT",
           status: "COMPLETED",
           userId: existingDeposit.user.id,
           adminId: session.user.id,
           walletId: wallet.id,
           depositId: id,
         },
       });

      return { updatedDeposit, transaction };
    });

    // Log the approval action
    await logActivity({
      userId: session.user.id,
      action: "APPROVE",
      model: "Deposit",
      modelId: id,
      oldData: JSON.stringify({ status: "PENDING" }),
      newData: JSON.stringify({ status: "APPROVED", amount: existingDeposit.amount }),
      description: `Admin approved deposit of ${existingDeposit.amount} THB for user ${existingDeposit.user.username}`,
      ipAddress: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: "Deposit approved successfully",
      deposit: result.updatedDeposit,
    });
  } catch (error) {
    console.error("Error approving deposit:", error);
    return NextResponse.json(
      { error: "Failed to approve deposit" },
      { status: 500 }
    );
  }
}
