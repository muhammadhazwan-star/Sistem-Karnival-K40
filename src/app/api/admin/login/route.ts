import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { issueToken } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const username = (body?.username as string | undefined)?.trim()
    const password = (body?.password as string | undefined)?.trim()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan kata laluan diperlukan' },
        { status: 400 },
      )
    }

    const admin = await db.adminUser.findUnique({ where: { username } })
    if (!admin || admin.password !== password) {
      return NextResponse.json(
        { error: 'Akaun tidak dijumpai atau kata laluan salah' },
        { status: 401 },
      )
    }

    const token = issueToken(admin.username, admin.name)
    return NextResponse.json({ token, name: admin.name })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal log masuk'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
