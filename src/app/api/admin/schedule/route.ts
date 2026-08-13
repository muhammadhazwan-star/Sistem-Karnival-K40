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
    const { time, endTime, title, speaker, category, order } = body ?? {}

    if (!time || !title) {
      return NextResponse.json(
        { error: 'Masa dan tajuk diperlukan' },
        { status: 400 },
      )
    }

    const item = await db.scheduleItem.create({
      data: {
        time: new Date(time),
        endTime: endTime ? new Date(endTime) : null,
        title,
        speaker: speaker ?? null,
        category: category ?? 'utama',
        order: typeof order === 'number' ? order : 0,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal mencipta atur cara'
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
    if (fields.time !== undefined) data.time = new Date(fields.time)
    if (fields.endTime !== undefined)
      data.endTime = fields.endTime ? new Date(fields.endTime) : null
    if (fields.title !== undefined) data.title = fields.title
    if (fields.speaker !== undefined) data.speaker = fields.speaker ?? null
    if (fields.category !== undefined) data.category = fields.category
    if (fields.order !== undefined) data.order = fields.order

    const item = await db.scheduleItem.update({ where: { id }, data })
    return NextResponse.json(item)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal mengemas kini atur cara'
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
    await db.scheduleItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal memadam atur cara'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
