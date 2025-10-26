import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ImageListDB from "@/lib/ImageListDB";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const status = searchParams.get("status") || "";
    const keyword = searchParams.get("keyword") || "";
    const sting =
      searchParams.get("sting") === "true" ||
      searchParams.get("sting") === "1";

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    // ถ้า sting เปิด จะ override ให้เป็น PENDING เสมอ
    if (sting) {
      where.status = "PENDING";
    } else if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { user: { username: { contains: keyword, mode: "insensitive" } } },
        { user: { email: { contains: keyword, mode: "insensitive" } } },
      ];
    }

    const [deposits, totalItems] = await Promise.all([
      prisma.deposit.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.deposit.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return NextResponse.json({
      data: deposits,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        currentPage: page,
        // สะท้อนสถานะที่ใช้จริงกลับไป (กรณี sting เปิดจะเป็น PENDING)
        status: sting ? "PENDING" : status || "",
        keyword,
      },
    });
  } catch (error) {
    console.error("Error fetching deposits:", error);
    return NextResponse.json(
      { error: "Failed to fetch deposits" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, amount, rate, slipImage, comment } = body;
    console.log(107, ` : 107 : `, userId);
    console.log(107, ` : 107 : `, amount);

    // Validate required fields
    if (!userId || !amount || !rate) {
      return NextResponse.json(
        { error: "userId, amount, and rate are required" },
        { status: 400 }
      );
    }

    // Check if user exists - try by ID first, then by discordId

    const user = await prisma.user.findFirst({
        where: { discordId: userId },
      });
    console.log(127, ` : 127 : `, user);

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please check the User ID or Discord ID." },
        { status: 404 }
      );
    }
    console.log(134, ` : 134 : `, user);

    let slipImageId = null;

    // If slipImage URL is provided, create GalleryDB entry
    if (slipImage) {
      const imageData = await ImageListDB.create({
        imageUrl: slipImage,
        nameFile: `deposit_slip_${Date.now()}.jpg`,
        modalName: "deposit",
        createdBy: session.user.id,
      });
      slipImageId = imageData.id;
    }

    // Create deposit
    const deposit = await prisma.deposit.create({
      data: {
        userId: user.id, // Use the actual user.id from database
        amount: parseFloat(amount),
        rate: parseFloat(rate),
        slipImageId,
        comment: comment || null,
        status: "PENDING",
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
      data: deposit,
    });
  } catch (error) {
    console.error("Error creating deposit:", error);
    return NextResponse.json(
      { error: "Failed to create deposit" },
      { status: 500 }
    );
  }
}