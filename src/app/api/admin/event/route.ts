import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

function authFail() {
  return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
}

const ALLOWED_FIELDS = [
  'name',
  'tagline',
  'date',
  'endDate',
  'location',
  'venue',
  'description',
  'coverImage',
  'logoText',
  'statusMode',
] as const

export async function PUT(request: Request) {
  if (!verifyAdmin(request.headers.get('x-admin-token'))) return authFail()
  try {
    const body = await request.json()

    const data: Record<string, unknown> = {}
    for (const key of ALLOWED_FIELDS) {
      if (body?.[key] === undefined) continue
      if (key === 'date' || key === 'endDate') {
        data[key] = body[key] === null ? null : new Date(body[key])
      } else {
        data[key] = body[key]
      }
    }

    const event = await db.eventInfo.upsert({
      where: { id: 'event' },
      create: {
        id: 'event',
        name: (data.name as string) ?? 'Karnival 40 Tahun PPAAB',
        tagline: (data.tagline as string) ?? '',
        date: (data.date as Date) ?? new Date(),
        endDate: (data.endDate as Date) ?? new Date(),
        location: (data.location as string) ?? '',
        venue: (data.venue as string) ?? '',
        description: (data.description as string) ?? '',
        logoText: (data.logoText as string) ?? '40',
        ...(data as any),
      },
      update: data,
    })

    return NextResponse.json(event)
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : 'Gagal mengemas kini maklumat acara'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
