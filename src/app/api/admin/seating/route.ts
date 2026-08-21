import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

// POST — add guest to a table (admin only)
// Body: { tableId, guestName }
export async function POST(request: Request) {
  try {
    const token = request.headers.get('x-admin-token')
    const admin = verifyAdmin(token)
    if (!admin) {
      return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
    }

    const body = await request.json()
    const { tableId, guestName } = body

    if (!tableId || !guestName?.trim()) {
      return NextResponse.json({ error: 'ID meja dan nama tetamu diperlukan' }, { status: 400 })
    }

    const table = await db.seatingTable.findUnique({ where: { id: tableId } })
    if (!table) {
      return NextResponse.json({ error: 'Meja tidak dijumpai' }, { status: 404 })
    }

    if (table.guests.length >= table.capacity) {
      return NextResponse.json({ error: `Meja penuh (kapasiti: ${table.capacity})` }, { status: 400 })
    }

    const updated = await db.seatingTable.update({
      where: { id: tableId },
      data: { guests: [...table.guests, guestName.trim()] },
    })

    return NextResponse.json({ table: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE — remove guest from a table (admin only)
// Query: ?tableId=...&guestIndex=...
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('x-admin-token')
    const admin = verifyAdmin(token)
    if (!admin) {
      return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get('tableId')
    const guestIndex = parseInt(searchParams.get('guestIndex') || '-1')

    if (!tableId || guestIndex < 0) {
      return NextResponse.json({ error: 'Parameter tidak sah' }, { status: 400 })
    }

    const table = await db.seatingTable.findUnique({ where: { id: tableId } })
    if (!table) {
      return NextResponse.json({ error: 'Meja tidak dijumpai' }, { status: 404 })
    }

    const newGuests = table.guests.filter((_: string, i: number) => i !== guestIndex)
    const updated = await db.seatingTable.update({
      where: { id: tableId },
      data: { guests: newGuests },
    })

    return NextResponse.json({ table: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT — update table capacity (admin only)
// Body: { tableId, capacity }
export async function PUT(request: Request) {
  try {
    const token = request.headers.get('x-admin-token')
    const admin = verifyAdmin(token)
    if (!admin) {
      return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
    }

    const body = await request.json()
    const { tableId, capacity } = body

    if (!tableId || !capacity || capacity < 1 || capacity > 20) {
      return NextResponse.json({ error: 'Kapasiti tidak sah (1-20)' }, { status: 400 })
    }

    const updated = await db.seatingTable.update({
      where: { id: tableId },
      data: { capacity },
    })

    return NextResponse.json({ table: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
