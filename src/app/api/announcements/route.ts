import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const items = await db.announcement.findMany({
      where: { published: true },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(items)
  } catch {
    return NextResponse.json(
      { error: 'Gagal membaca pengumuman' },
      { status: 500 },
    )
  }
}
