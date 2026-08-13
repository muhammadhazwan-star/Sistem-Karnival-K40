import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const settings = await db.setting.findUnique({ where: { id: 'settings' } })
    const mode = settings?.ucapanMode ?? 'approval'

    const items = await db.ucapan.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ items, mode })
  } catch {
    return NextResponse.json(
      { error: 'Gagal membaca ucapan' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authorName = (body?.authorName as string | undefined)?.trim()
    const role = (body?.role as string | undefined)?.trim() || 'Komuniti'
    const content = (body?.content as string | undefined)?.trim()

    if (!authorName) {
      return NextResponse.json(
        { error: 'Nama penulis diperlukan' },
        { status: 400 },
      )
    }
    if (!content) {
      return NextResponse.json(
        { error: 'Kandungan ucapan diperlukan' },
        { status: 400 },
      )
    }

    const settings = await db.setting.findUnique({ where: { id: 'settings' } })
    const mode = settings?.ucapanMode ?? 'approval'
    const status = mode === 'auto' ? 'approved' : 'pending'

    const item = await db.ucapan.create({
      data: { authorName, role, content, status },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal menghantar ucapan'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
