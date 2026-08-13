import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'
import { broadcast } from '@/lib/broadcast'

function authFail() {
  return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
}

// Returns ALL announcements (including unpublished drafts) for admin.
// Public /api/announcements only returns published=true.
export async function GET(request: Request) {
  if (!verifyAdmin(request.headers.get('x-admin-token'))) return authFail()
  try {
    const items = await db.announcement.findMany({
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(items)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal membaca pengumuman'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!verifyAdmin(request.headers.get('x-admin-token'))) return authFail()
  try {
    const body = await request.json()
    const { title, content, type, pinned, published, author } = body ?? {}

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Tajuk dan kandungan diperlukan' },
        { status: 400 },
      )
    }

    const item = await db.announcement.create({
      data: {
        title,
        content,
        type: type ?? 'info',
        pinned: Boolean(pinned),
        published: published !== undefined ? Boolean(published) : true,
        author: author ?? 'Urusetia Karnival',
      },
    })

    await broadcast('announcement:new')
    return NextResponse.json(item, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal mencipta pengumuman'
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
    if (fields.title !== undefined) data.title = fields.title
    if (fields.content !== undefined) data.content = fields.content
    if (fields.type !== undefined) data.type = fields.type
    if (fields.pinned !== undefined) data.pinned = Boolean(fields.pinned)
    if (fields.published !== undefined)
      data.published = Boolean(fields.published)
    if (fields.author !== undefined) data.author = fields.author

    const item = await db.announcement.update({ where: { id }, data })
    await broadcast('announcement:update')
    return NextResponse.json(item)
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : 'Gagal mengemas kini pengumuman'
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
    await db.announcement.delete({ where: { id } })
    await broadcast('announcement:update')
    return NextResponse.json({ success: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal memadam pengumuman'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
