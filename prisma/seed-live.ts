import { db } from '../src/lib/db'

async function main() {
  await db.livePost.deleteMany()
  const posts = [
    { authorName: 'Aisyah Rahman', content: 'Alhamdulillah, sampai juga di Karnival 40 Tahun Al-Amin! Suasana sangat meriah!', type: 'text' },
    { authorName: 'Cikgu Hassan', content: 'Bangga melihat perkembangan Al-Amin selama 40 tahun. Teruskan usaha murni ini!', type: 'text' },
    { authorName: 'Mohd Hafiz', content: 'Persembahan RABITHAH tadi sangat mengasyikkan!', imageUrl: '/images/gallery/gallery-2.jpg', type: 'both' },
    { authorName: 'Siti Khadijah', content: 'Selamat hari jadi Al-Amin! Semoga terus cemerang', type: 'text' },
    { authorName: 'Alumni 1996', content: 'Reuni batch 1996 hari ini penuh emosi. Terima kasih Al-Amin!', imageUrl: '/images/gallery/gallery-4.jpg', type: 'both' },
    { authorName: 'Nurul Ain', content: null, imageUrl: '/images/gallery/gallery-5.jpg', type: 'photo' },
  ]
  for (const p of posts) {
    await db.livePost.create({ data: p })
  }
  const count = await db.livePost.count()
  console.log(`Seeded ${count} live posts`)
}
main().then(() => db.$disconnect())
