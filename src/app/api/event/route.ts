import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const event = await db.eventInfo.findUnique({ where: { id: 'event' } })
    return NextResponse.json(event)
  } catch {
    return NextResponse.json(
      { error: 'Gagal membaca maklumat acara' },
      { status: 500 },
    )
  }
}
