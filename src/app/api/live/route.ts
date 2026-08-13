import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { broadcast } from '@/lib/broadcast'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// GET — return recent live posts (public)
export async function GET() {
  try {
    const posts = await db.livePost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ posts })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — create a live post (multipart/form-data for photo, or JSON for text)
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let authorName: string
    let content: string | null = null
    let imageUrl: string | null = null
    let type: string = 'text'

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      authorName = (formData.get('authorName') as string)?.trim() || 'Pengunjung'
      content = (formData.get('content') as string)?.trim() || null
      const image = formData.get('image') as File | null

      if (image) {
        if (!image.type.startsWith('image/')) {
          return NextResponse.json({ error: 'Fail mesti berupa gambar' }, { status: 400 })
        }
        if (image.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: 'Saiz fail maksimum 10MB' }, { status: 400 })
        }
        const ext = image.name.split('.').pop()?.toLowerCase() || 'jpg'
        const filename = `${crypto.randomUUID()}.${ext}`
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
        const buffer = Buffer.from(await image.arrayBuffer())
        fs.writeFileSync(path.join(uploadDir, filename), buffer)
        imageUrl = `/uploads/${filename}`
      }
    } else {
      const body = await request.json()
      authorName = body.authorName?.trim() || 'Pengunjung'
      content = body.content?.trim() || null
    }

    // Determine type
    if (imageUrl && content) type = 'both'
    else if (imageUrl) type = 'photo'
    else type = 'text'

    if (!content && !imageUrl) {
      return NextResponse.json({ error: 'Sekurang-kurangnya teks atau gambar diperlukan' }, { status: 400 })
    }

    const post = await db.livePost.create({
      data: { authorName, content, imageUrl, type },
    })

    // Broadcast to all clients for real-time update
    await broadcast('live:new', post)

    return NextResponse.json({ post }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
