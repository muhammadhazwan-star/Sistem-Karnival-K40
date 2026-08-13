import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'
import { broadcast } from '@/lib/broadcast'

function authFail() {
  return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
}

export async function PUT(request: Request) {
  if (!verifyAdmin(request.headers.get('x-admin-token'))) return authFail()
  try {
    const body = await request.json()
    const { id, highlight, highlightCategory } = body ?? {}

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (highlight !== undefined) {
      data.highlight = Boolean(highlight)
      // Clear category when un-highlighting
      if (!highlight) data.highlightCategory = null
    }
    if (highlightCategory !== undefined) {
      data.highlightCategory = highlightCategory || null
      // Setting a category implies highlight = true
      if (highlightCategory) data.highlight = true
    }

    const item = await db.galleryPhoto.update({ where: { id }, data })
    await broadcast('gallery:update')
    return NextResponse.json(item)
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : 'Gagal mengemas kini highlight foto'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
