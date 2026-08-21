import { db } from '../src/lib/db'
import { config } from 'dotenv'
config({ override: true })

// 60 Malay guest names for dummy data
const MALAY_NAMES = [
  'Dato\' Hj. Abdullah', 'Datin Hajah Salmah', 'Tn. Hj. Ibrahim', 'Puan Hajjah Norliza',
  'Dr. Hj. Shaharom', 'Puan Sri Aishah', 'Tn. Hj. Hanifuddin', 'Datin Norhayati',
  'Encik Ahmad Faizal', 'Puan Siti Khadijah', 'Tn. Hj. Rahman', 'Puan Fatimah',
  'Encik Mohd Hafiz', 'Cik Nurul Ain', 'Tn. Zulkifli', 'Puan Rohani',
  'Encik Khairul Anwar', 'Cik Zainab', 'Tn. Hj. Yusof', 'Puan Aisyah',
  'Dr. Hasan', 'Puan Khadijah', 'Encik Ismail', 'Cik Maryam',
  'Tn. Hj. Othman', 'Puan Hajjah Zaitun', 'Encik Fauzi', 'Cik Habsah',
  'Tn. Hj. Rizal', 'Puan Sakinah', 'Encik Ramli', 'Cik Nadia',
  'Tn. Hj. Aziz', 'Puan Faridah', 'Encik Abdullah', 'Cik Munirah',
  'Tn. Hj. Salleh', 'Puan Azizah', 'Encik Halim', 'Cik Suraya',
  'Tn. Hj. Rashid', 'Puan Latifah', 'Encik Najib', 'Cik Hayati',
  'Tn. Hj. Kamal', 'Puan Jamilah', 'Encik Faiz', 'Cik Zulaikha',
  'Tn. Hj. Anuar', 'Puan Rokiah', 'Encik Wafi', 'Cik Anis',
  'Tn. Hj. Fuad', 'Puan Intan', 'Encik Danial', 'Cik Balqis',
  'Tn. Hj. Hafiz', 'Puan Wani', 'Encik Iqbal', 'Cik Nabilah',
]

function getGuests(startIdx: number): string[] {
  const guests: string[] = []
  for (let i = 0; i < 10; i++) {
    guests.push(MALAY_NAMES[(startIdx + i) % MALAY_NAMES.length])
  }
  return guests
}

// EXACT positions from image analysis (X%, Y%)
const TABLE_POSITIONS = [
  // Row 1 (Top - y=30.8%)
  { num: 12, x: 35.2, y: 30.8 },
  { num: 18, x: 40.6, y: 30.8 },
  { num: 24, x: 46.0, y: 30.8 },
  { num: 30, x: 51.4, y: 30.8 },
  { num: 36, x: 56.9, y: 30.8 },
  { num: 42, x: 62.3, y: 30.8 },
  { num: 48, x: 67.7, y: 30.8 },
  { num: 54, x: 73.2, y: 30.8 },
  { num: 60, x: 78.6, y: 30.8 },
  // Row 2 (y=38.6%)
  { num: 6, x: 30.3, y: 38.6 },
  { num: 11, x: 35.6, y: 38.6 },
  { num: 17, x: 41.0, y: 38.6 },
  { num: 23, x: 46.4, y: 38.6 },
  { num: 29, x: 51.8, y: 38.6 },
  { num: 35, x: 57.3, y: 38.6 },
  { num: 41, x: 62.7, y: 38.6 },
  { num: 47, x: 68.1, y: 38.6 },
  { num: 53, x: 73.5, y: 38.6 },
  { num: 59, x: 79.0, y: 38.6 },
  // Row 3 (y=46.6%) - Inner top, closest to carpet
  { num: 2, x: 25.3, y: 46.6 },
  { num: 5, x: 30.6, y: 46.6 },
  { num: 10, x: 36.0, y: 46.6 },
  { num: 16, x: 41.4, y: 46.6 },
  { num: 22, x: 46.8, y: 46.6 },
  { num: 28, x: 52.3, y: 46.6 },
  { num: 34, x: 57.7, y: 46.6 },
  { num: 40, x: 63.1, y: 46.6 },
  { num: 46, x: 68.5, y: 46.6 },
  { num: 52, x: 74.0, y: 46.6 },
  { num: 58, x: 79.4, y: 46.6 },
  // Row 4 (y=61.4%) - Inner bottom, closest to carpet
  { num: 1, x: 25.3, y: 61.4 },
  { num: 4, x: 30.6, y: 61.4 },
  { num: 9, x: 36.0, y: 61.4 },
  { num: 15, x: 41.4, y: 61.4 },
  { num: 21, x: 46.8, y: 61.4 },
  { num: 27, x: 52.3, y: 61.4 },
  { num: 33, x: 57.7, y: 61.4 },
  { num: 39, x: 63.1, y: 61.4 },
  { num: 45, x: 68.5, y: 61.4 },
  { num: 51, x: 74.0, y: 61.4 },
  { num: 57, x: 79.4, y: 61.4 },
  // Row 5 (y=69.2%)
  { num: 3, x: 30.3, y: 69.2 },
  { num: 8, x: 35.6, y: 69.2 },
  { num: 14, x: 41.0, y: 69.2 },
  { num: 20, x: 46.4, y: 69.2 },
  { num: 26, x: 51.8, y: 69.2 },
  { num: 32, x: 57.3, y: 69.2 },
  { num: 38, x: 62.7, y: 69.2 },
  { num: 44, x: 68.1, y: 69.2 },
  { num: 50, x: 73.5, y: 69.2 },
  { num: 56, x: 79.0, y: 69.2 },
  // Row 6 (Bottom - y=77.0%)
  { num: 7, x: 35.2, y: 77.0 },
  { num: 13, x: 40.6, y: 77.0 },
  { num: 19, x: 46.0, y: 77.0 },
  { num: 25, x: 51.4, y: 77.0 },
  { num: 31, x: 56.9, y: 77.0 },
  { num: 37, x: 62.3, y: 77.0 },
  { num: 43, x: 67.7, y: 77.0 },
  { num: 49, x: 73.2, y: 77.0 },
  { num: 55, x: 78.6, y: 77.0 },
]

async function main() {
  await db.seatingTable.deleteMany()
  console.log('🌱 Seeding 60 tables with EXACT positions from image...\n')

  const tables: any[] = []
  let nameIdx = 0

  for (const pos of TABLE_POSITIONS) {
    const isVIP = pos.num <= 2 // Only Tables 1 and 2 are VIP
    const label = isVIP ? 'VIP' : undefined
    const zone = isVIP ? 'vip' : 'main'
    const guests = getGuests(nameIdx)
    nameIdx += 10

    tables.push({
      tableNumber: pos.num,
      label,
      capacity: 10,
      x: pos.x,
      y: pos.y,
      zone,
      order: pos.num - 1,
      guests,
    })
  }

  // Sort by tableNumber
  tables.sort((a, b) => a.tableNumber - b.tableNumber)

  for (const t of tables) {
    await db.seatingTable.create({ data: t })
  }

  console.log(`✅ Seeded ${tables.length} tables`)
  console.log(`   Guests: ${tables.reduce((s, t) => s + t.guests.length, 0)}`)
  console.log(`   VIP: ${tables.filter(t => t.zone === 'vip').length}`)
  console.log('\nFirst 5 tables:')
  tables.slice(0, 5).forEach(t => console.log(`  Table ${t.tableNumber}: (${t.x}%, ${t.y}%) - ${t.guests.length} guests`))
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await db.$disconnect() })
