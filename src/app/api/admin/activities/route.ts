import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

function authFail() {
  return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
}

export async function POST(request: Request) {
  if (!verifyAdmin(request.headers.get('x-admin-token'))) return authFail()
  try {
    const body = await request.json()
    const {
      name,
      category,
      startTime,
      endTime,
      location,
      description,
      status,
      featured,
      order,
    } = body ?? {}

    if (!name || !category || !startTime) {
      return NextResponse.json(
        { error: 'Nama, kategori dan masa mula diperlukan' },
        { status: 400 },
      )
    }

    const item = await db.activity.create({
      data: {
        name,
        category,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location: location ?? '',
        description: description ?? '',
        status: status ?? 'upcoming',
        featured: Boolean(featured),
        order: typeof order === 'number' ? order : 0,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal mencipta aktiviti'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!verifyAdmin(request.headers.get('x-admin-token'))) return authFail()
  try {
    const body = await request.json()
    const { id, ...fields } = body ?? {}
    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (fields.name !== undefined) data.name = fields.name
    if (fields.category !== undefined) data.category = fields.category
    if (fields.startTime !== undefined)
      data.startTime = new Date(fields.startTime)
    if (fields.endTime !== undefined)
      data.endTime = fields.endTime ? new Date(fields.endTime) : null
    if (fields.location !== undefined) data.location = fields.location
    if (fields.description !== undefined) data.description = fields.description
    if (fields.status !== undefined) data.status = fields.status
    if (fields.featured !== undefined) data.featured = Boolean(fields.featured)
    if (fields.order !== undefined) data.order = fields.order

    const item = await db.activity.update({ where: { id }, data })
    return NextResponse.json(item)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal mengemas kini aktiviti'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!verifyAdmin(request.headers.get('x-admin-token'))) return authFail()
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }
    await db.activity.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal memadam aktiviti'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
