import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function getKualaLumpurDate(): Date {
  // Current instant mapped to Asia/Kuala_Lumpur calendar date as a Date
  // at local midnight of that calendar day.
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const y = parts.find((p) => p.type === 'year')?.value ?? '1970'
  const m = parts.find((p) => p.type === 'month')?.value ?? '01'
  const d = parts.find((p) => p.type === 'day')?.value ?? '01'
  return new Date(`${y}-${m}-${d}T00:00:00Z`)
}

function computeStatus(
  date: Date,
  endDate: Date,
): 'before' | 'live' | 'after' {
  const today = getKualaLumpurDate()
  // Normalise event boundaries to start-of-day (date) and end-of-day (endDate)
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
  const end = new Date(
    Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  )
  if (today < start) return 'before'
  if (today > end) return 'after'
  return 'live'
}

export async function GET() {
  try {
    const event = await db.eventInfo.findUnique({ where: { id: 'event' } })
    if (!event) {
      return NextResponse.json({ status: 'before', event: null })
    }

    const mode = event.statusMode ?? 'auto'
    const status =
      mode === 'auto'
        ? computeStatus(event.date, event.endDate)
        : (['before', 'live', 'after'].includes(mode)
            ? mode
            : 'before')

    return NextResponse.json({ status, event })
  } catch {
    return NextResponse.json(
      { error: 'Gagal membaca status acara' },
      { status: 500 },
    )
  }
}
