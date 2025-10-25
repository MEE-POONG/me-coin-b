import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
