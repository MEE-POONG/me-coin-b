import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: session.user.id },
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

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: adminUser 
    })
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
