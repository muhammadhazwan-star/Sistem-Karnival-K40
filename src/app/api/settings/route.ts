import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const settings = await db.setting.findUnique({ where: { id: 'settings' } })
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json(
      { error: 'Gagal membaca tetapan' },
      { status: 500 },
    )
  }
}
