import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

function authFail() {
  return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
}

export async function GET(request: Request) {
  if (!verifyAdmin(request.headers.get('x-admin-token'))) return authFail()
  try {
    const { searchParams } = new URL(request.url)
    let url = searchParams.get('url')

    if (!url) {
      const settings = await db.setting.findUnique({
        where: { id: 'settings' },
      })
      url = settings?.portalUrl ?? 'https://karnival40.alaamin.edu.my'
    }

    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 512,
      color: {
        dark: '#3d0a14', // maroon
        light: '#FFFFFF',
      },
    })

    return NextResponse.json({ dataUrl, url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal menjana kod QR'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
