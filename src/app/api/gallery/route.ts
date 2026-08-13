import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { broadcast } from '@/lib/broadcast'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
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

    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    // Build unique filename — preserve original extension when sensible
    const ext = path.extname(image.name || '').toLowerCase()
    const safeExt = /^\.(jpe?g|png|webp|gif|avif)$/.test(ext) ? ext : '.jpg'
    const filename = `${crypto.randomUUID()}${safeExt}`
    const filePath = path.join(UPLOAD_DIR, filename)

    const buffer = Buffer.from(await image.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    const imageUrl = `/uploads/${filename}`

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
