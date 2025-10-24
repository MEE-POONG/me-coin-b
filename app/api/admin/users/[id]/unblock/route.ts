import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is blocked
    if (!existingUser.isBlocked) {
      return NextResponse.json(
        { error: "User is not blocked" },
        { status: 400 }
      );
    }

    // Update user to unblock
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBlocked: false,
        blockedReason: null,
        blockedAt: null,
        blockedUntil: null,
        blockedBy: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        isBlocked: true,
        blockedReason: true,
        blockedAt: true,
        blockedUntil: true,
      },
    });

    // Log the unblock action
    await logActivity({
      userId: session.user.id,
      action: "UNBLOCK",
      model: "User",
      modelId: id,
      oldData: JSON.stringify({
        isBlocked: true,
        blockedReason: existingUser.blockedReason,
        blockedUntil: existingUser.blockedUntil,
      }),
      newData: JSON.stringify({ isBlocked: false }),
      description: `Admin unblocked user ${existingUser.username}`,
      ipAddress: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: "User unblocked successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return NextResponse.json(
      { error: "Failed to unblock user" },
      { status: 500 }
    );
  }
}
