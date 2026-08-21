import { db } from '../src/lib/db'
import { config } from 'dotenv'
config({ override: true })

async function main() {
  console.log('🗑️  Removing dummy data from Supabase...\n')

  const tables = [
    { name: 'LivePost', model: db.livePost },
    { name: 'GalleryPhoto', model: db.galleryPhoto },
    { name: 'Ucapan', model: db.ucapan },
    { name: 'Announcement', model: db.announcement },
    { name: 'Activity', model: db.activity },
    { name: 'ScheduleItem', model: db.scheduleItem },
    { name: 'Booth', model: db.booth },
    { name: 'MapLocation', model: db.mapLocation },
    { name: 'JourneyItem', model: db.journeyItem },
  ]

  for (const t of tables) {
    const count = await t.model.count()
    await t.model.deleteMany()
    console.log(`  ✓ ${t.name}: ${count} records deleted`)
  }

  console.log('\n📋 Keeping system config:')
  const adminCount = await db.adminUser.count()
  const eventCount = await db.eventInfo.count()
  const settingsCount = await db.setting.count()
  console.log(`  - AdminUser: ${adminCount} (kept)`)
  console.log(`  - EventInfo: ${eventCount} (kept)`)
  console.log(`  - Setting: ${settingsCount} (kept)`)

  console.log('\n✅ Dummy data removed. Database is now clean.')
  console.log('   Admin login still works: admin / admink40')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
