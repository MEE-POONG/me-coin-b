import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/setting-web/[id] - Get single setting
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const setting = await prisma.settingWeb.findUnique({
      where: { id }
    })

    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: setting
    })
  } catch (error) {
    console.error('Error fetching setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch setting' },
      { status: 500 }
    )
  }
}

// PUT /api/setting-web/[id] - Update setting
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await req.json()

    const {
      name,
      logo,
      logoColor,
      logoText,
      logoRingOne,
      logoRingTwo,
      description,
      copyright,
      contactEmail,
      contactPhone,
      contactAddress,
      contactFacebook,
      contactInstagram,
      contactTwitter,
      contactLinkedin
    } = body

    // Check if setting exists
    const existingSetting = await prisma.settingWeb.findUnique({
      where: { id }
    })

    if (!existingSetting) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const updatedSetting = await prisma.settingWeb.update({
      where: { id },
      data: {
        name,
        logo,
        logoColor,
        logoText,
        logoRingOne,
        logoRingTwo,
        description,
        copyright,
        contactEmail,
        contactPhone,
        contactAddress,
        contactFacebook,
        contactInstagram,
        contactTwitter,
        contactLinkedin
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedSetting,
      message: 'Setting updated successfully'
    })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update setting' },
      { status: 500 }
    )
  }
}

// DELETE /api/setting-web/[id] - Delete setting
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Check if setting exists
    const existingSetting = await prisma.settingWeb.findUnique({
      where: { id }
    })

    if (!existingSetting) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      )
    }

    await prisma.settingWeb.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete setting' },
      { status: 500 }
    )
  }
}
