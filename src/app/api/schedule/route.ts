import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const items = await db.scheduleItem.findMany({
      orderBy: [{ order: 'asc' }, { time: 'asc' }],
    })
    return NextResponse.json(items)
  } catch {
    return NextResponse.json(
      { error: 'Gagal membaca atur cara' },
      { status: 500 },
    )
  }
}
