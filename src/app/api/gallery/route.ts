import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { broadcast } from '@/lib/broadcast'
import { uploadImage } from '@/lib/supabase'
import crypto from 'crypto'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function GET() {
  try {
    const settings = await db.setting.findUnique({ where: { id: 'settings' } })
    const mode = settings?.galleryMode ?? 'auto'

    const photos = await db.galleryPhoto.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ photos, count: photos.length, mode })
  } catch {
    return NextResponse.json(
      { error: 'Gagal membaca galeri' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const contributorName = (formData.get('contributorName') as string | null)?.trim()
    const caption = (formData.get('caption') as string | null)?.trim() || null
    const image = formData.get('image')

    if (!contributorName) {
      return NextResponse.json(
        { error: 'Nama penyumbang diperlukan' },
        { status: 400 },
      )
    }

    if (!image || !(image instanceof File)) {
      return NextResponse.json(
        { error: 'Fail imej diperlukan' },
        { status: 400 },
      )
    }

    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Fail mesti berformat imej' },
        { status: 400 },
      )
    }

    if (image.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Saiz fail melebihi 10MB' },
        { status: 400 },
      )
    }

    // Upload to Supabase Storage
    const ext = image.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = /^(jpe?g|png|webp|gif|avif)$/.test(ext) ? ext : 'jpg'
    const filename = `gallery/${crypto.randomUUID()}.${safeExt}`
    const buffer = Buffer.from(await image.arrayBuffer())
    const imageUrl = await uploadImage(buffer, filename, image.type)

    const settings = await db.setting.findUnique({ where: { id: 'settings' } })
    const mode = settings?.galleryMode ?? 'auto'
    const status = mode === 'auto' ? 'approved' : 'pending'

    const photo = await db.galleryPhoto.create({
      data: {
        contributorName,
        imageUrl,
        caption,
        status,
      },
    })

    await broadcast(status === 'approved' ? 'gallery:new' : 'gallery:update')

    return NextResponse.json(photo, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal memuat naik foto'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
