import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/setting-web - list (front เลือกตัวแรก)
export async function GET() {
  try {
    const settings = await prisma.settingWeb.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: settings, total: settings.length })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// POST /api/setting-web - create only if none exists
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

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
      contactLinkedin,
    } = body || {}

    if (!name || !String(name).trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    // บังคับ single record
    const count = await prisma.settingWeb.count()
    if (count > 0) {
      return NextResponse.json(
        { success: false, error: 'Setting already exists. Use PUT /api/setting-web/:id instead.' },
        { status: 409 }
      )
    }

    const setting = await prisma.settingWeb.create({
      data: {
        name: String(name).trim(),
        logo: logo ?? null,
        logoColor: logoColor ?? null,
        logoText: logoText ?? null,
        logoRingOne: logoRingOne ?? null,
        logoRingTwo: logoRingTwo ?? null,
        description: description ?? null,
        copyright: copyright ?? null,
        contactEmail: contactEmail ?? null,
        contactPhone: contactPhone ?? null,
        contactAddress: contactAddress ?? null,
        contactFacebook: contactFacebook ?? null,
        contactInstagram: contactInstagram ?? null,
        contactTwitter: contactTwitter ?? null,
        contactLinkedin: contactLinkedin ?? null,
      },
    })

    return NextResponse.json({
      success: true,
      data: setting,
      message: 'Setting created successfully',
    })
  } catch (error) {
    console.error('Error creating setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create setting' },
      { status: 500 }
    )
  }
}
