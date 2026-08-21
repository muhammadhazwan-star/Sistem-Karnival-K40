'use client'

import { motion } from 'framer-motion'
import { Heart, CalendarDays } from 'lucide-react'

const MONTHS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

const DAYS = ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Aha']

// August 2026 — August 1 2026 is a Saturday
// Jan 1 2026 is Thursday; compute August 1 2026 day of week
const AUG_2026_FIRST_DOW = (() => {
  // August 1, 2026 is a Saturday → index 5 (Mon=0 ... Sat=5, Sun=6)
  const d = new Date(2026, 7, 1)
  // JS: Sunday=0, Monday=1...Saturday=6
  // Convert to Monday-first: (jsDow + 6) % 7
  return (d.getDay() + 6) % 7
})()

const AUG_DAYS_IN_MONTH = 31
const EVENT_DAY = 23

export function CalendarWidget() {
  // Build calendar grid: leading empty cells + days
  const cells: (number | null)[] = []
  for (let i = 0; i < AUG_2026_FIRST_DOW; i++) cells.push(null)
  for (let d = 1; d <= AUG_DAYS_IN_MONTH; d++) cells.push(d)
  // Pad to complete the last week
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()
  const isAugust = today.getMonth() === 7 && today.getFullYear() === 2026
  const todayDate = isAugust ? today.getDate() : -1

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-gold rounded-2xl p-4 sm:p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gold" />
          <span className="text-xs uppercase tracking-wider text-gold-light font-semibold">
            Ogos 2026
          </span>
        </div>
        <span className="text-[10px] text-cream/50">Majlis Makan Malam</span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] sm:text-[10px] font-bold text-cream/50 uppercase tracking-wide py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={i} className="aspect-square" />
          }
          const isEvent = day === EVENT_DAY
          const isToday = day === todayDate
          const isWeekend = i % 7 >= 5

          return (
            <motion.div
              key={i}
              initial={isEvent ? { scale: 0.8 } : false}
              whileInView={isEvent ? { scale: 1 } : {}}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              className={`relative aspect-square flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isEvent
                  ? 'bg-gradient-to-br from-gold to-gold-deep text-maroon-dark font-bold glow-gold-sm'
                  : isToday
                  ? 'bg-gold/20 text-gold border border-gold/40'
                  : isWeekend
                  ? 'text-cream/40'
                  : 'text-cream/70 hover:bg-gold/10'
              }`}
            >
              {day}
              {isEvent && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1"
                >
                  <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 drop-shadow" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-gold/10 flex items-center justify-center gap-3 text-[10px] text-cream/60">
        <div className="flex items-center gap-1.5">
          <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          <span>Majlis Makan Malam</span>
        </div>
        <div className="w-px h-3 bg-gold/20" />
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-gold/20 border border-gold/40" />
          <span>Hari ini</span>
        </div>
      </div>
    </motion.div>
  )
}
