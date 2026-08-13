import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

function authFail() {
  return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
}

const ALLOWED_FIELDS = ['galleryMode', 'ucapanMode', 'portalUrl'] as const

export async function PUT(request: Request) {
  if (!verifyAdmin(request.headers.get('x-admin-token'))) return authFail()
  try {
    const body = await request.json()

    const data: Record<string, unknown> = {}
    for (const key of ALLOWED_FIELDS) {
      if (body?.[key] === undefined) continue
      data[key] = body[key]
    }

    const settings = await db.setting.upsert({
      where: { id: 'settings' },
      create: {
        id: 'settings',
        galleryMode: (data.galleryMode as string) ?? 'auto',
        ucapanMode: (data.ucapanMode as string) ?? 'approval',
        portalUrl:
          (data.portalUrl as string) ??
          'https://karnival40.alaamin.edu.my',
        ...(data as any),
      },
      update: data,
    })

    return NextResponse.json(settings)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal mengemas kini tetapan'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
