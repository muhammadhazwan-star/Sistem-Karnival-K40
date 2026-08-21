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

// Floor plan layout: 6 rows, 60 tables
// Top section (rows 1-3) + Red carpet + Bottom section (rows 4-6)
// Stage on left, Buffet/Holding/Dressing on right

const ROWS = [
  // [rowIndex, y, tableNumbers (left to right)]
  { y: 12, tables: [12, 18, 24, 30, 36, 42, 48, 54, 60] },          // Row 1 (top) - 9 tables
  { y: 22, tables: [6, 11, 17, 23, 29, 35, 41, 47, 53, 59] },       // Row 2 - 10 tables
  { y: 32, tables: [2, 5, 10, 16, 22, 28, 34, 40, 46, 52, 58] },    // Row 3 - 11 tables
  // Red carpet aisle at y: 42-52
  { y: 62, tables: [1, 4, 9, 15, 21, 27, 33, 39, 45, 51, 57] },     // Row 4 - 11 tables
  { y: 72, tables: [3, 8, 14, 20, 26, 32, 38, 44, 50, 56] },        // Row 5 - 10 tables
  { y: 82, tables: [7, 13, 19, 25, 31, 37, 43, 49, 55] },           // Row 6 (bottom) - 9 tables
]

// Calculate x position for each table in a row
function calcX(index: number, total: number): number {
  const startX = 20
  const endX = 80
  if (total === 1) return (startX + endX) / 2
  const step = (endX - startX) / (total - 1)
  return startX + index * step
}

async function main() {
  await db.seatingTable.deleteMany()
  console.log('🌱 Seeding 60 seating tables...\n')

  const tables: any[] = []
  let nameIdx = 0

  for (const row of ROWS) {
    const total = row.tables.length
    row.tables.forEach((tableNum, colIdx) => {
      const x = calcX(colIdx, total)
      const isVIP = tableNum <= 4 // Tables 1-4 are VIP (near stage)
      const label = isVIP ? 'VIP' : undefined
      const zone = isVIP ? 'vip' : 'main'
      const guests = getGuests(nameIdx)
      nameIdx += 10

      tables.push({
        tableNumber: tableNum,
        label,
        capacity: 10,
        x,
        y: row.y,
        zone,
        order: tableNum - 1,
        guests,
      })
    })
  }

  // Sort by tableNumber for consistent ordering
  tables.sort((a, b) => a.tableNumber - b.tableNumber)

  for (const t of tables) {
    await db.seatingTable.create({ data: t })
  }

  console.log(`✅ Seeded ${tables.length} seating tables`)
  console.log(`   Total guests: ${tables.reduce((s, t) => s + t.guests.length, 0)}`)
  console.log(`   VIP tables: ${tables.filter(t => t.zone === 'vip').length}`)
  console.log('\nLayout:')
  ROWS.forEach((row, i) => {
    console.log(`  Row ${i + 1} (y=${row.y}): ${row.tables.join(', ')}`)
  })
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await db.$disconnect() })
