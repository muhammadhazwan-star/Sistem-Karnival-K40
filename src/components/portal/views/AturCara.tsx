'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarClock, Clock, MapPin, User, CheckCircle2, ChevronRight } from 'lucide-react'
import { useSchedule } from '@/hooks/use-data'
import { fmtTime, fmtTimeShort } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

const CATEGORY_COLORS: Record<string, string> = {
  utama: 'border-l-gold',
  protokol: 'border-l-amber-400',
  ucapan: 'border-l-rose-400',
  persembahan: 'border-l-purple-400',
  istimewa: 'border-l-emerald-400',
  anugerah: 'border-l-cyan-400',
}

export function AturCara() {
  const { data: schedule, loading } = useSchedule()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const items = schedule ?? []
  const currentIndex = items.findIndex((s) => {
    const start = new Date(s.time)
    const end = s.endTime ? new Date(s.endTime) : new Date(start.getTime() + 30 * 60000)
    return start <= now && end > now
  })

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
          <CalendarClock className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs text-gold-light">Atur Cara Rasmi</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold-shimmer">
          Atur Cara Karnival
        </h1>
        <p className="mt-2 text-sm text-cream/60">Apa Yang Berlaku Hari Ini? — Majlis Makan Malam Amal</p>
        <p className="mt-1 text-xs text-gold/60">23 Ogos 2026 · Bermula 6.30 ptg</p>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl bg-maroon/30" />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[20px] sm:left-[88px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/50 via-gold/20 to-transparent" />

          <div className="space-y-3">
            {items.map((item, i) => {
              const start = new Date(item.time)
              const end = item.endTime ? new Date(item.endTime) : new Date(start.getTime() + 30 * 60000)
              const isLive = i === currentIndex
              const isPast = end < now
              const isUpcoming = i === currentIndex + 1

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`relative flex gap-3 sm:gap-5 ${isLive ? 'scale-[1.02]' : ''}`}
                >
                  {/* Time + dot */}
                  <div className="flex flex-col items-center shrink-0 w-[40px] sm:w-[160px]">
                    <div className="hidden sm:block text-right w-full pr-4">
                      <div className="font-display text-lg font-bold text-gold tabular-nums">
                        {fmtTimeShort(item.time)}
                      </div>
                      <div className="text-[10px] text-cream/40">{fmtTime(item.time).split(' ').pop()}</div>
                    </div>
                    <div className="relative z-10">
                      <div
                        className={`h-3 w-3 rounded-full border-2 ${
                          isLive
                            ? 'bg-emerald-400 border-emerald-300 live-dot'
                            : isPast
                            ? 'bg-maroon-dark border-gold/30'
                            : 'bg-maroon-dark border-gold'
                        }`}
                      />
                    </div>
                    <div className="sm:hidden mt-1 text-[10px] text-gold/70 font-medium tabular-nums">
                      {fmtTimeShort(item.time)}
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 glass rounded-2xl p-4 border-l-4 ${
                      CATEGORY_COLORS[item.category] || 'border-l-gold/40'
                    } ${isLive ? 'glass-strong glow-gold-sm' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {isLive && (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 mb-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 live-dot" />
                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">Sedang Berlangsung</span>
                          </div>
                        )}
                        {isUpcoming && (
                          <div className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 mb-2">
                            <ChevronRight className="h-2.5 w-2.5 text-gold" />
                            <span className="text-[10px] font-bold text-gold uppercase tracking-wide">Seterusnya</span>
                          </div>
                        )}
                        <h3 className={`font-medium ${isLive ? 'text-gold-light' : 'text-cream'} text-sm sm:text-base`}>
                          {item.title}
                        </h3>
                        {item.speaker && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-cream/60">
                            <User className="h-3 w-3" />
                            {item.speaker}
                          </div>
                        )}
                      </div>
                      {isPast && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400/50 shrink-0" />
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 glass rounded-2xl p-4">
        <div className="text-xs text-cream/60 mb-2 font-medium">Kategori:</div>
        <div className="flex flex-wrap gap-3 text-[11px]">
          {Object.entries(CATEGORY_COLORS).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full border-l-2 ${v}`} />
              <span className="text-cream/70 capitalize">{k}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
