import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET — return all seating tables with guests
export async function GET() {
  try {
    const tables = await db.seatingTable.findMany({
      orderBy: { tableNumber: 'asc' },
    })
    return NextResponse.json({ tables })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
