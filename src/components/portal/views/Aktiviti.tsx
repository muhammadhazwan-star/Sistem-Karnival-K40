'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Compass, Clock, MapPin, Star, Filter } from 'lucide-react'
import { useActivities } from '@/hooks/use-data'
import { fmtTime } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { ACTIVITY_CATEGORIES } from '@/lib/types'
import { cn } from '@/lib/utils'

export function Aktiviti() {
  const { data: activities, loading } = useActivities()
  const [filter, setFilter] = useState<string>('all')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const filtered = useMemo(() => {
    const list = activities ?? []
    if (filter === 'all') return list
    if (filter === 'featured') return list.filter((a) => a.featured)
    return list.filter((a) => a.category === filter)
  }, [activities, filter])

  const computeStatus = (a: any) => {
    const start = new Date(a.startTime)
    const end = a.endTime ? new Date(a.endTime) : new Date(start.getTime() + 3600000)
    if (start <= now && end > now) return 'live'
    if (start > now) return 'upcoming'
    return 'ended'
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
          <Compass className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs text-gold-light">Explore Carnival</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold-shimmer">
          Aktiviti & Program
        </h1>
        <p className="mt-2 text-sm text-cream/60">Semua aktiviti, booth dan acara pentas karnival</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto custom-scroll pb-2">
        <Filter className="h-4 w-4 text-gold shrink-0" />
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
            filter === 'all' ? 'bg-gold text-maroon-dark' : 'glass text-cream/70 hover:text-gold'
          )}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter('featured')}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition flex items-center gap-1',
            filter === 'featured' ? 'bg-gold text-maroon-dark' : 'glass text-cream/70 hover:text-gold'
          )}
        >
          <Star className="h-3 w-3" /> Terpilih
        </button>
        {ACTIVITY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
              filter === cat ? 'bg-gold text-maroon-dark' : 'glass text-cream/70 hover:text-gold'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl bg-maroon/30" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => {
            const status = computeStatus(a)
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'glass rounded-2xl p-5 flex flex-col',
                  a.featured && 'glass-gold',
                  status === 'live' && 'glow-gold-sm'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">
                    {a.category}
                  </span>
                  {status === 'live' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 live-dot" /> LIVE NOW
                    </span>
                  ) : status === 'upcoming' ? (
                    <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-300">
                      Akan Datang
                    </span>
                  ) : (
                    <span className="rounded-full bg-maroon/40 px-2 py-0.5 text-[10px] font-medium text-cream/50">
                      Tamat
                    </span>
                  )}
                </div>
                <h3 className="font-display text-base font-semibold text-cream flex items-center gap-1.5">
                  {a.featured && <Star className="h-3.5 w-3.5 text-gold fill-gold" />}
                  {a.name}
                </h3>
                <p className="mt-1.5 text-xs text-cream/60 leading-relaxed flex-1">{a.description}</p>
                <div className="mt-3 pt-3 border-t border-gold/10 space-y-1.5 text-[11px] text-cream/70">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-gold" />
                    {fmtTime(a.startTime)}{a.endTime ? ` — ${fmtTime(a.endTime)}` : ''}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-gold" />
                    {a.location}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-cream/50 text-sm">
          Tiada aktiviti dalam kategori ini.
        </div>
      )}
    </div>
  )
}
