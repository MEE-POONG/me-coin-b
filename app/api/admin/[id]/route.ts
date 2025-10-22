import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - ดึงข้อมูล admin ตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const currentAdmin = await prisma.adminUser.findUnique({
      where: { id: session.user.id }
    })

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        accountNumber: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: admin
    })
  } catch (error) {
    console.error('Error fetching admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - อัปเดต admin
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const currentAdmin = await prisma.adminUser.findUnique({
      where: { id: session.user.id }
    })

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { email, username, password, name, phone, accountNumber } = body

    // Check if admin exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { id: params.id }
    })

    if (!existingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Check if email, username, or account number already exists (excluding current admin)
    if (email || username || accountNumber) {
      const duplicateCheck = await prisma.adminUser.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            {
              OR: [
                ...(email ? [{ email }] : []),
                ...(username ? [{ username }] : []),
                ...(accountNumber ? [{ accountNumber }] : [])
              ]
            }
          ]
        }
      })

      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'Email, username, or account number already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (email) updateData.email = email
    if (username) updateData.username = username
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (accountNumber) updateData.accountNumber = accountNumber
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update admin
    const updatedAdmin = await prisma.adminUser.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        accountNumber: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedAdmin,
      message: 'Admin updated successfully'
    })
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - ลบ admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const currentAdmin = await prisma.adminUser.findUnique({
      where: { id: session.user.id }
    })

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Prevent self-deletion
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if admin exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { id: params.id }
    })

    if (!existingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Delete admin
    await prisma.adminUser.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
