import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

function authFail() {
  return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
}

// Returns ALL ucapan (all statuses: pending | approved | rejected)
// for admin moderation. Public /api/ucapan only returns approved.
export async function GET(request: Request) {
  if (!verifyAdmin(request.headers.get('x-admin-token'))) return authFail()
  try {
    const items = await db.ucapan.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(items)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal membaca ucapan'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
