import { db } from '../src/lib/db'

const EVENT_DATE = new Date('2026-08-23T18:30:00+08:00')
const EVENT_END = new Date('2026-08-23T23:00:00+08:00')

function at(hour: number, minute: number) {
  const d = new Date('2026-08-23T00:00:00+08:00')
  d.setHours(hour, minute, 0, 0)
  return d
}

async function main() {
  console.log('🌱 Seeding Portal Digital Karnival 40 Tahun PPAAB...')

  // Clean
  await db.galleryPhoto.deleteMany()
  await db.ucapan.deleteMany()
  await db.announcement.deleteMany()
  await db.activity.deleteMany()
  await db.scheduleItem.deleteMany()
  await db.booth.deleteMany()
  await db.mapLocation.deleteMany()
  await db.journeyItem.deleteMany()
  await db.eventInfo.deleteMany()
  await db.setting.deleteMany()
  await db.adminUser.deleteMany()

  // 1. Event Info
  await db.eventInfo.create({
    data: {
      id: 'event',
      name: 'Karnival 40 Tahun Pusat Pendidikan Al-Amin Berhad',
      tagline: '40 Tahun Membina Generasi, Menginspirasi Masa Depan',
      date: EVENT_DATE,
      endDate: EVENT_END,
      location: 'Dewan Majestic Elissa Garden, Terminal Bersepadu Gombak, Selangor',
      venue: 'Dewan Majestic Elissa Garden',
      description:
        'Majlis Makan Malam Amal sempena Ulang Tahun ke-40 Pusat Pendidikan Al-Amin Berhad — sebuah malam penuh istimewa merangkumi perasmian, persembahan artis jemputan, pelancaran Al-Amin 3.0, dan penyampaian anugerah Tokoh Alumni, Ikon Ibu Bapa, Guru Legenda serta Digital Champion Teacher.',
      coverImage: '/images/hero-gala.jpg',
      logoText: '40 TAHUN PPAAB',
      statusMode: 'auto',
    },
  })

  // 2. Settings
  await db.setting.create({
    data: {
      id: 'settings',
      galleryMode: 'auto',
      ucapanMode: 'approval',
      portalUrl: 'https://karnival40.alaamin.edu.my',
    },
  })

  // 3. Admin user
  await db.adminUser.create({
    data: {
      username: 'admin',
      password: 'karnival40',
      name: 'Urusetia Karnival',
      role: 'admin',
    },
  })

  // 4. Schedule items (official atur cara)
  const schedule = [
    { t: [18, 30], title: 'Pendaftaran', cat: 'protokol' },
    { t: [19, 45], title: 'Ketibaan Tetamu Kehormat', cat: 'protokol' },
    { t: [20, 0], title: 'Alunan Al-Quran', cat: 'utama' },
    { t: [20, 5], title: 'Aluan Pengerusi Majlis', cat: 'utama' },
    { t: [20, 10], title: 'Majlis Makan Malam, Persembahan Johan Nasyid K40 & Artis Jemputan RABITHAH', cat: 'persembahan' },
    { t: [20, 30], title: 'Ucapan Aluan Pengarah Program', cat: 'ucapan' },
    { t: [20, 40], title: 'Ucapan Pengerusi PPAAB', cat: 'ucapan' },
    { t: [20, 50], title: 'Ucapan Perasmian Penutup', cat: 'ucapan' },
    { t: [21, 10], title: 'Pelancaran Al-Amin 3.0 & Peluncuran Buku Coffee Table', cat: 'istimewa' },
    { t: [21, 20], title: 'Slot Istimewa bersama PU Riz', speaker: 'PU Riz', cat: 'istimewa' },
    { t: [21, 25], title: 'Tayangan Montaj 40 Tahun PPAAB', cat: 'istimewa' },
    { t: [21, 40], title: 'Penyampaian Hadiah — Tokoh Alumni & Ikon Ibu Bapa', cat: 'anugerah' },
    { t: [21, 50], title: 'Cabutan Bertuah', cat: 'istimewa' },
    { t: [22, 0], title: 'Persembahan Artis Jemputan HIJJAZ', speaker: 'HIJJAZ', cat: 'persembahan' },
    { t: [22, 15], title: 'Penyampaian Hadiah — Guru Legenda & Digital Champion Teacher', cat: 'anugerah' },
    { t: [22, 30], title: 'Cabutan Bertuah', cat: 'istimewa' },
    { t: [22, 40], title: 'Persembahan Artis Jemputan RABITHAH & HIJJAZ', speaker: 'RABITHAH & HIJJAZ', cat: 'persembahan' },
    { t: [23, 0], title: 'Sesi Fotografi, Doa Penutup & Bersurai', cat: 'protokol' },
  ]
  for (let i = 0; i < schedule.length; i++) {
    const s = schedule[i]
    await db.scheduleItem.create({
      data: {
        time: at(s.t[0], s.t[1]),
        title: s.title,
        speaker: s.speaker || null,
        category: s.cat,
        order: i,
      },
    })
  }

  // 5. Activities (Explore Carnival)
  const activities = [
    { name: 'Fun Run 40 Tahun', cat: 'Sukan', start: [7, 0], end: [9, 0], loc: 'Laluan Perimeter Karnival', desc: 'Larian keserongan sempena 40 tahun PPAAB dengan jarak 4km. Terbuka kepada semua ahli keluarga.', feat: true },
    { name: 'Rider Day Carnival', cat: 'Sukan', start: [8, 0], end: [11, 0], loc: 'Parking Kawasan Luar', desc: 'Perhimpunan pengguna motorsikal dan basikal bersama keluarga Al-Amin.', feat: false },
    { name: 'Young Coder Challenge', cat: 'Digital/Teknologi', start: [10, 0], end: [12, 30], loc: 'Makmal Komputer', desc: 'Pertandingan pengekodan untuk murid sekolah rendah dan menengah. Tema: Aplikasi Pendidikan Islam.', feat: true },
    { name: 'E-Sports Tournament', cat: 'Digital/Teknologi', start: [13, 0], end: [17, 0], loc: 'Hall B - Arena Digital', desc: 'Pertandingan e-sports antara rumah sukan dengan hadiah wang tunai.', feat: false },
    { name: 'Pertandingan Nasyid K40', cat: 'Pentas', start: [14, 0], end: [16, 0], loc: 'Panggung Utama', desc: 'Pertandingan nasyid di antara kumpulan murid dan alumni Al-Amin.', feat: true },
    { name: 'Aktiviti Kanak-Kanak', cat: 'Keluarga', start: [9, 0], end: [17, 0], loc: 'Kids Zone', desc: 'Sudut permainan, mewarna, dan cerita nabi untuk kanak-kanak.', feat: false },
    { name: 'Family Games Carnival', cat: 'Keluarga', start: [10, 0], end: [15, 0], loc: 'Kawasan Lapang Tengah', desc: 'Pelbagai permainan tradisional dan moden untuk seisi keluarga.', feat: false },
    { name: 'Pameran Sejarah 40 Tahun', cat: 'Pameran', start: [9, 0], end: [18, 0], loc: 'Hall A - Galeri Utama', desc: 'Pameran kronologi perjalanan PPAAB dari 1986 hingga 2026 dengan artifak dan arkib foto.', feat: true },
    { name: 'Booth Pendidikan Al-Amin', cat: 'Pameran', start: [9, 0], end: [18, 0], loc: 'Hall A - Stand 12', desc: 'Pameran program akademik Al-Amin 3.0 yang baharu dilancarkan.', feat: false },
    { name: 'Food & Beverage Festival', cat: 'Keluarga', start: [11, 0], end: [22, 0], loc: 'Kawasan Luar - Food Court', desc: 'Lebih 30 gerai makanan dari seluruh negeri dengan hidangan istimewa.', feat: false },
    { name: 'Perlumbaan Drone', cat: 'Digital/Teknologi', start: [15, 0], end: [17, 0], loc: 'Padang Utama', desc: 'Pertunjukan dan perlumbaan drone oleh kelab teknologi murid.', feat: false },
    { name: 'Pertandingan Azan', cat: 'Pentas', start: [16, 0], end: [17, 30], loc: 'Panggung Utama', desc: 'Pertandingan lantunan azan dari pelbagai peringkat umur.', feat: false },
  ]
  for (let i = 0; i < activities.length; i++) {
    const a = activities[i]
    await db.activity.create({
      data: {
        name: a.name,
        category: a.cat,
        startTime: at(a.start[0], a.start[1]),
        endTime: at(a.end[0], a.end[1]),
        location: a.loc,
        description: a.desc,
        status: 'upcoming',
        featured: a.feat,
        order: i,
      },
    })
  }

  // 6. Announcements
  const announcements = [
    { title: 'Selamat Datang ke Karnival 40 Tahun PPAAB!', content: 'Selamat datang ke Karnival 40 Tahun Pusat Pendidikan Al-Amin Berhad. Imbas QR di setiap lokasi untuk maklumat aktiviti. Selamat menikmati pengalaman karnival!', type: 'info', pinned: true },
    { title: 'Pertandingan Young Coder bermula jam 10:00 pagi', content: 'Pertandingan Young Coder akan bermula pada jam 10:00 pagi di Makmal Komputer. Semua peserta diminta berdaftar 15 minit awal.', type: 'update' },
    { title: 'Persembahan Artis Jemputan HIJJAZ', content: 'Jangan lepaskan peluang menyaksikan persembahan istimewa HIJJAZ pada jam 10:00 malam di Panggung Utama. Tempat duduk terhad!', type: 'info' },
    { title: 'Parkir penuh di Kawasan A', content: 'Kawasan parkir A telah penuh. Sila gunakan kawasan parkir B dan C berhampiran pintu masuk timur. Bas ulang-alik disediakan.', type: 'urgent' },
    { title: 'Sesi Fotografi 40 Tahun', content: 'Sesi fotografi kenangan 40 Tahun akan diadakan di tangga utama selepas persembahan terakhir. Semua hadirin dialu-alukan.', type: 'info' },
    { title: 'Cabutan Bertuah Akhir', content: 'Cabutan bertuah akhir akan diadakan pada jam 10:30 malam di Panggung Utama. Simpan nombor peserta anda!', type: 'update' },
  ]
  for (let i = 0; i < announcements.length; i++) {
    const a = announcements[i]
    await db.announcement.create({
      data: {
        title: a.title,
        content: a.content,
        type: a.type,
        pinned: a.pinned || false,
        published: true,
        author: 'Urusetia Karnival',
      },
    })
  }

  // 7. Gallery photos (dummy - using placeholder generated images)
  const photos = [
    { name: 'Aisyah Rahman', cap: 'Sambutan meriah di Panggung Utama', cat: 'Best Moment' },
    { name: 'Mohd Hafiz', cap: 'Guru dan murid bersama selepas persembahan nasyid', cat: 'Teacher Moment' },
    { name: 'Siti Khadijah', cap: 'Keluarga Al-Amin bergambar di Galeri 40 Tahun', cat: 'Family Moment' },
    { name: 'Ahmad Faizal', cap: 'Alumni batch 1996 berkumpul semula', cat: 'Alumni Moment' },
    { name: 'Nurul Ain', cap: 'Kanak-kanak menikmati Kids Zone', cat: 'Student Moment' },
    { name: 'Zulkifli Ibrahim', cap: 'Persembahan HIMMAH di pentas utama', cat: 'Community Moment' },
    { name: 'Fatimah Zahirah', cap: 'Keindahan dewan majlis persiapan 40 tahun', cat: '40th Anniversary' },
    { name: 'Abdullah Yusof', cap: 'Pengerusi PPAAB menyampaikan ucapan', cat: 'Best Moment' },
    { name: 'Rohani Mahmod', cap: 'Penyampaian anugerah Guru Legenda', cat: 'Teacher Moment' },
    { name: 'Khairul Anwar', cap: 'Artis HIJJAZ membawa lagu nasyid terbaru', cat: 'Community Moment' },
  ]
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i]
    await db.galleryPhoto.create({
      data: {
        contributorName: p.name,
        imageUrl: `/images/gallery/gallery-${i + 1}.jpg`,
        caption: p.cap,
        status: 'approved',
        highlight: i < 7,
        highlightCategory: i < 7 ? p.cat : null,
      },
    })
  }
  // Add some pending photos for moderation demo
  await db.galleryPhoto.create({
    data: {
      contributorName: 'Ismail Ramli',
      imageUrl: '/images/gallery/gallery-pending-1.jpg',
      caption: 'Momen indah di sudut pameran',
      status: 'pending',
      highlight: false,
      highlightCategory: null,
    },
  })
  await db.galleryPhoto.create({
    data: {
      contributorName: 'Zainab Hassan',
      imageUrl: '/images/gallery/gallery-pending-2.jpg',
      caption: 'Suasana meriah Food Court',
      status: 'pending',
      highlight: false,
      highlightCategory: null,
    },
  })

  // 8. Ucapan
  const ucapan = [
    { name: 'Dato\' Dr. Rahman Abdullah', role: 'Alumni', text: 'Selamat ulang tahun ke-40 Pusat Pendidikan Al-Amin Berhad. Semoga terus melahirkan generasi yang berilmu, beriman dan berakhlak mulia. Bangga menjadi sebahagian daripada keluarga Al-Amin.' },
    { name: 'Puan Hajjah Salmah Yusof', role: 'Guru', text: '40 tahun mendidik di Al-Amin adalah 40 tahun penuh kenangan manis. Terima kasih kepada semua yang menyokong perjuangan kami. Al-Amin kekal di hati.' },
    { name: 'Encik Ibrahim Mohamad', role: 'Ibu Bapa', text: 'Tiga anak saya dididik di Al-Amin dan kesemuanya menjadi insan yang hebat. Jutaan terima kasih kepada guru-guru yang tidak pernah jemu. Semoga Al-Amin terus cemerang.' },
    { name: 'Aisyah Puteri', role: 'Murid', text: 'Bangga menjadi murid Al-Amin! Sekolah ini bukan sahaja mengajar ilmu dunia tetapi juga ilmu akhirat. Selamat hari jadi Al-Amin, tempat saya membesar.' },
    { name: 'Haji Abdullah Lim', role: 'Komuniti', text: 'Sebagai jiran komuniti Al-Amin selama 20 tahun, saya menyaksikan sendiri perkembangan institusi ini. Tahniah 40 tahun! Semoga terus menjadi kebanggaan komuniti.' },
    { name: 'Mohd Fauzi Ahmad', role: 'Alumni', text: 'Batch 1996 menyambut ulang tahun ke-40 Al-Amin dengan penuh emosi. Banyak yang berubah, tapi semangat Al-Amin kekal sama. Maju terus Al-Amin!' },
    { name: 'Puan Norliza Hashim', role: 'Guru', text: 'Mendidik di Al-Amin bukan sekadar kerjaya, ia satu ibadah. 40 tahun perjalanan ini bukan pengakhirannya, tetapi permulaan era baharu yang lebih gemilang.' },
  ]
  for (const u of ucapan) {
    await db.ucapan.create({
      data: {
        authorName: u.name,
        role: u.role,
        content: u.text,
        status: 'approved',
      },
    })
  }
  // pending ucapan
  await db.ucapan.create({
    data: {
      authorName: 'Ahmad Sazali',
      role: 'Alumni',
      content: 'Tahniah 40 tahun Al-Amin! Semoga terus menjadi tonggak pendidikan Islam di Malaysia.',
      status: 'pending',
    },
  })

  // 9. Booths
  const booths = [
    { name: 'Al-Amin Education Booth', cat: 'Pendidikan', loc: 'Hall A - Stand 12', desc: 'Pameran program akademik Al-Amin 3.0 dan pendaftaran murid baharu.', act: 'Konsultasi pendidikan, demo kelas', hours: '9:00 pagi - 6:00 petang' },
    { name: 'Food & Beverage Court', cat: 'Makanan', loc: 'Kawasan Luar - Food Court', desc: 'Lebih 30 gerai makanan tradisional dan moden.', act: 'Jualan makanan & minuman', hours: '11:00 pagi - 10:00 malam' },
    { name: 'Digital & Tech Pavilion', cat: 'Teknologi', loc: 'Hall B - Stand 1-8', desc: 'Pameran teknologi pendidikan, robotik, dan inovasi murid.', act: 'Demo robotik, VR pendidikan', hours: '9:00 pagi - 6:00 petang' },
    { name: 'Alumni Corner', cat: 'Komuniti', loc: 'Hall A - Stand 5', desc: 'Pendaftaran alumni dan jualan cenderamata 40 tahun.', act: 'Pendaftaran, jualan merch', hours: '9:00 pagi - 8:00 malam' },
    { name: 'Health & Wellness Booth', cat: 'Kesihatan', loc: 'Medical Station', desc: 'Pemeriksaan kesihatan percuma dan konsultasi.', act: 'Pemeriksaan tekanan darah, BMI', hours: '9:00 pagi - 5:00 petang' },
    { name: 'Islamic Book Fair', cat: 'Pendidikan', loc: 'Hall A - Stand 8-11', desc: 'Jualan buku Islam, al-Quran, dan bahan pendidikan.', act: 'Jualan buku, bacaan percuma', hours: '9:00 pagi - 8:00 malam' },
    { name: 'Kids Creative Zone', cat: 'Keluarga', loc: 'Kids Zone', desc: 'Aktiviti kreatif untuk kanak-kanak 4-12 tahun.', act: 'Mewarna, DIY craft, cerita nabi', hours: '9:00 pagi - 5:00 petang' },
    { name: 'Sports & Recreation', cat: 'Sukan', loc: 'Kawasan Lapang', desc: 'Pertandingan sukan riadah dan permainan tradisional.', act: 'Sepak takraw, congkak, larian', hours: '8:00 pagi - 6:00 petang' },
  ]
  for (let i = 0; i < booths.length; i++) {
    const b = booths[i]
    await db.booth.create({
      data: {
        name: b.name,
        category: b.cat,
        location: b.loc,
        description: b.desc,
        activities: b.act,
        operatingHours: b.hours,
        order: i,
      },
    })
  }

  // 10. Map locations
  const mapLocs = [
    { name: 'Panggung Utama', type: 'Main Stage', desc: 'Pentas utama untuk semua persembahan dan majlis rasmi.', x: 50, y: 30, icon: 'Music' },
    { name: 'Pendaftaran', type: 'Registration', desc: 'Kaunter pendaftaran tetamu kehormat dan peserta.', x: 20, y: 75, icon: 'ClipboardCheck' },
    { name: 'Food Court', type: 'Food Area', desc: 'Kawasan gerai makanan dan minuman.', x: 80, y: 70, icon: 'UtensilsCrossed' },
    { name: 'Hall A - Galeri', type: 'Booth', desc: 'Galeri pameran 40 tahun dan booth pendidikan.', x: 25, y: 40, icon: 'Building2' },
    { name: 'Hall B - Arena Digital', type: 'Competition Area', desc: 'Pertandingan e-sports dan young coder.', x: 75, y: 40, icon: 'Gamepad2' },
    { name: 'Kids Zone', type: 'Kids Area', desc: 'Kawasan aktiviti kanak-kanak.', x: 65, y: 80, icon: 'Baby' },
    { name: 'Parkir A, B, C', type: 'Parking', desc: 'Kawasan letak kenderaan dengan bas ulang-alik.', x: 15, y: 15, icon: 'Car' },
    { name: 'Surau', type: 'Surau', desc: 'Surau lelaki dan perempuan dengan kemudahan wuduk.', x: 88, y: 20, icon: 'Moon' },
    { name: 'Medical First Aid', type: 'Medical', desc: 'Pusat kesihatan dan kecemasan.', x: 50, y: 88, icon: 'HeartPulse' },
    { name: 'Tandas', type: 'Toilet', desc: 'Tandas lelaki dan perempuan.', x: 35, y: 60, icon: 'DoorOpen' },
    { name: 'Information Counter', type: 'Information', desc: 'Kaunter maklumat dan bantuan.', x: 50, y: 75, icon: 'Info' },
  ]
  for (let i = 0; i < mapLocs.length; i++) {
    const m = mapLocs[i]
    await db.mapLocation.create({
      data: {
        name: m.name,
        type: m.type,
        description: m.desc,
        x: m.x,
        y: m.y,
        icon: m.icon,
        order: i,
      },
    })
  }

  // 11. Journey timeline
  const journey = [
    { year: '1986', phase: 'Permulaan', desc: 'Pusat Pendidikan Al-Amin ditubuhkan dengan visi menyediakan pendidikan Islam bersepadu untuk generasi baharu.', milestone: 'Kumpulan pertama 40 orang murid' },
    { year: '1996', phase: 'Perkembangan', desc: 'Pembukaan cawangan baharu dan pengenalan kurikulum akademik yang lebih komprehensif.', milestone: '3 cawangan baharu' },
    { year: '2006', phase: 'Pengukuhan', desc: 'Pengiktirafan rasmi sebagai institusi pendidikan Islam terkemuka di Lembah Klang.', milestone: 'Pengiktirafan JPN' },
    { year: '2016', phase: 'Generasi Baharu', desc: 'Transformasi digital pendidikan dan pelancaran program Al-Amin 2.0.', milestone: 'Program digital pertama' },
    { year: '2026', phase: '40 Tahun', desc: 'Menyambut ulang tahun ke-40 dengan pelancaran Al-Amin 3.0 — era pendidikan Islam masa depan.', milestone: 'Al-Amin 3.0 dilancarkan' },
  ]
  for (let i = 0; i < journey.length; i++) {
    const j = journey[i]
    await db.journeyItem.create({
      data: {
        year: j.year,
        phase: j.phase,
        description: j.desc,
        milestone: j.milestone,
        order: i,
      },
    })
  }

  console.log('✅ Seed complete!')
  console.log(`   - Schedule items: ${schedule.length}`)
  console.log(`   - Activities: ${activities.length}`)
  console.log(`   - Announcements: ${announcements.length}`)
  console.log(`   - Gallery photos: ${photos.length + 2}`)
  console.log(`   - Ucapan: ${ucapan.length + 1}`)
  console.log(`   - Booths: ${booths.length}`)
  console.log(`   - Map locations: ${mapLocs.length}`)
  console.log(`   - Journey items: ${journey.length}`)
  console.log('   - Admin: admin / karnival40')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
