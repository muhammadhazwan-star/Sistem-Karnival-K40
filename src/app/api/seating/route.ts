import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET — return all seating tables with guests
export async function GET() {
  try {
    // Safety check: if seatingTable model is missing from the Prisma client,
    // return a helpful error instead of crashing with "undefined"
    if (!db?.seatingTable) {
      return NextResponse.json(
        { error: 'Model SeatingTable tidak tersedia. Jalankan: bun run db:generate' },
        { status: 500 }
      )
    }

    const tables = await db.seatingTable.findMany({
      orderBy: { tableNumber: 'asc' },
    })
    return NextResponse.json({ tables })
  } catch (e: any) {
    const msg = e?.message || 'Unknown error'
    // If the error is about undefined model, give a helpful hint
    if (msg.includes('undefined') || msg.includes('findMany')) {
      return NextResponse.json(
        { error: 'Prisma client perlu dijana semula. Jalankan: bun run db:generate' },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
