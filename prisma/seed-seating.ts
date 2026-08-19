import { db } from '../src/lib/db'
import { config } from 'dotenv'
config({ override: true })

// Generate ~30 tables with guest names in a grid layout
// Layout: center grid, stage left, rooms on sides

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
  'Tn. Hj. Shafiq', 'Puan Ema', 'Encik Aiman', 'Cik Firah',
  'Tn. Hj. Bazli', 'Puan Liza', 'Encik Faizul', 'Cik Izzah',
]

function getGuests(startIdx: number, count: number): string[] {
  const guests: string[] = []
  for (let i = 0; i < count; i++) {
    guests.push(MALAY_NAMES[(startIdx + i) % MALAY_NAMES.length])
  }
  return guests
}

async function main() {
  await db.seatingTable.deleteMany()
  console.log('🌱 Seeding seating tables...\n')

  const tables: any[] = []
  let nameIdx = 0

  // Grid: 5 columns × 6 rows = 30 tables
  // Center area: x 25-85%, y 15-85%
  const cols = 5
  const rows = 6
  const startX = 28
  const startY = 18
  const stepX = 13 // column spacing
  const stepY = 12 // row spacing

  let tableNum = 1
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Skip center aisle (col 2 area shifted)
      const x = startX + col * stepX + (col >= 3 ? 4 : 0) // gap for center aisle
      const y = startY + row * stepY
      const isVip = (row === 0 && (col === 0 || col === 4))
      const label = isVip ? 'VIP' : (row === 0 ? 'Kehormat' : undefined)
      const zone = isVip ? 'vip' : (row === 0 ? 'special' : 'main')
      const guests = getGuests(nameIdx, 10)
      nameIdx += 10

      tables.push({
        tableNumber: tableNum,
        label,
        capacity: 10,
        x: x,
        y: y,
        zone,
        order: tableNum - 1,
        guests,
      })
      tableNum++
    }
  }

  for (const t of tables) {
    await db.seatingTable.create({ data: t })
  }

  console.log(`✅ Seeded ${tables.length} seating tables`)
  console.log(`   Total guests: ${tables.reduce((s: number, t: any) => s + t.guests.length, 0)}`)
  console.log(`   VIP tables: ${tables.filter((t: any) => t.zone === 'vip').length}`)
  console.log('\nSample tables:')
  tables.slice(0, 3).forEach((t: any) => {
    console.log(`  Table ${t.tableNumber} (${t.zone}): ${t.guests.slice(0, 3).join(', ')}...`)
  })
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await db.$disconnect() })
