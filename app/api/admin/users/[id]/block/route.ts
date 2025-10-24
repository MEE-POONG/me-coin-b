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
    const { duration, reason } = body;

    // Validate duration (3 days to 1 month in days)
    if (!duration || duration < 3 || duration > 30) {
      return NextResponse.json(
        { error: "Duration must be between 3 and 30 days" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already blocked
    if (existingUser.isBlocked) {
      return NextResponse.json(
        { error: "User is already blocked" },
        { status: 400 }
      );
    }

    // Calculate block end date
    const blockedAt = new Date();
    const blockedUntil = new Date();
    blockedUntil.setDate(blockedUntil.getDate() + duration);

    // Update user to blocked status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBlocked: true,
        blockedReason: reason || "No reason provided",
        blockedAt,
        blockedUntil,
        blockedBy: session.user.id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        isBlocked: true,
        blockedReason: true,
        blockedAt: true,
        blockedUntil: true,
        blockedBy: true,
      },
    });

    // Log the block action
    await logActivity({
      userId: session.user.id,
      action: "BLOCK",
      model: "User",
      modelId: id,
      oldData: JSON.stringify({ isBlocked: false }),
      newData: JSON.stringify({
        isBlocked: true,
        blockedReason: reason,
        blockedUntil,
        duration,
      }),
      description: `Admin blocked user ${existingUser.username} for ${duration} days. Reason: ${reason || "No reason provided"}`,
      ipAddress: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: `User blocked successfully for ${duration} days`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error blocking user:", error);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}
