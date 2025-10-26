import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ImageListDB from "@/lib/ImageListDB";

export async function GET(
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

    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
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

    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deposit,
    });
  } catch (error) {
    console.error("Error fetching deposit:", error);
    return NextResponse.json(
      { error: "Failed to fetch deposit" },
      { status: 500 }
    );
  }
}

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
    const { status, comment, amount, rate } = body;

    // Check if deposit exists
    const existingDeposit = await prisma.deposit.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!existingDeposit) {
      return NextResponse.json(
        { error: "Deposit not found" },
        { status: 404 }
      );
    }

    // Update deposit
    const updatedDeposit = await prisma.deposit.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(comment !== undefined && { comment }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(rate && { rate: parseFloat(rate) }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
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

    return NextResponse.json({
      success: true,
      data: updatedDeposit,
    });
  } catch (error) {
    console.error("Error updating deposit:", error);
    return NextResponse.json(
      { error: "Failed to update deposit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Get deposit with slipImage info
    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: {
        slipImage: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit not found" },
        { status: 404 }
      );
    }

    // Delete deposit (this will cascade delete related records)
    await prisma.deposit.delete({
      where: { id },
    });

    // Clean up image from Cloudflare if exists
    if (deposit.slipImage) {
      try {
        await fetch('/api/images/cleanup', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageId: deposit.slipImage.id,
            imageUrl: deposit.slipImage.imageUrl 
          }),
        });
        console.log('🧹 Cleaned up deposit slip image');
      } catch (cleanupError) {
        console.error('❌ Error cleaning up deposit slip image:', cleanupError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Deposit deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting deposit:", error);
    return NextResponse.json(
      { error: "Failed to delete deposit" },
      { status: 500 }
    );
  }
}
