import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const items = await db.booth.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json(items)
  } catch {
    return NextResponse.json(
      { error: 'Gagal membaca senarai booth' },
      { status: 500 },
    )
  }
}
