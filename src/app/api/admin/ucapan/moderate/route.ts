import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

function authFail() {
  return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
}

export async function POST(request: Request) {
  if (!verifyAdmin(request.headers.get('x-admin-token'))) return authFail()
  try {
    const body = await request.json()
    const { id, action } = body ?? {}

    if (!id || !action) {
      return NextResponse.json(
        { error: 'ID dan tindakan diperlukan' },
        { status: 400 },
      )
    }

    if (action === 'delete') {
      await db.ucapan.delete({ where: { id } })
    } else if (action === 'approve') {
      await db.ucapan.update({ where: { id }, data: { status: 'approved' } })
    } else if (action === 'reject') {
      await db.ucapan.update({ where: { id }, data: { status: 'rejected' } })
    } else {
      return NextResponse.json(
        { error: 'Tindakan tidak sah (approve | reject | delete)' },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal menyederhanakan ucapan'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
