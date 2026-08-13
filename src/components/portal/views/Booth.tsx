'use client'

import { motion } from 'framer-motion'
import { Store, MapPin, Clock, Activity } from 'lucide-react'
import { useBooths } from '@/hooks/use-data'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const CAT_COLORS: Record<string, string> = {
  Pendidikan: 'from-amber-500/20 to-amber-700/5 border-amber-400/30',
  Makanan: 'from-rose-500/20 to-rose-700/5 border-rose-400/30',
  Teknologi: 'from-cyan-500/20 to-cyan-700/5 border-cyan-400/30',
  Komuniti: 'from-purple-500/20 to-purple-700/5 border-purple-400/30',
  Kesihatan: 'from-emerald-500/20 to-emerald-700/5 border-emerald-400/30',
  Keluarga: 'from-pink-500/20 to-pink-700/5 border-pink-400/30',
  Sukan: 'from-blue-500/20 to-blue-700/5 border-blue-400/30',
}

export function Booth() {
  const { data: booths, loading } = useBooths()
  const [filter, setFilter] = useState('all')
  const list = booths ?? []
  const cats = Array.from(new Set(list.map((b) => b.category)))
  const filtered = filter === 'all' ? list : list.filter((b) => b.category === filter)

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
          <Store className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs text-gold-light">Explore Our Booths</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold-shimmer">
          Direktori Booth
        </h1>
        <p className="mt-2 text-sm text-cream/60">Senarai booth & gerai di Karnival 40 Tahun</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto custom-scroll pb-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
            filter === 'all' ? 'bg-gold text-maroon-dark' : 'glass text-cream/70 hover:text-gold'
          )}
        >
          Semua Booth
        </button>
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
              filter === c ? 'bg-gold text-maroon-dark' : 'glass text-cream/70 hover:text-gold'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl bg-maroon/30" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn('rounded-2xl p-5 bg-gradient-to-br border glass', CAT_COLORS[b.category] || 'border-gold/20')}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">
                  {b.category}
                </span>
                <Store className="h-4 w-4 text-gold/60" />
              </div>
              <h3 className="font-display text-base font-semibold text-cream mb-1">{b.name}</h3>
              <p className="text-xs text-cream/65 leading-relaxed mb-3">{b.description}</p>
              <div className="space-y-1.5 pt-3 border-t border-gold/10 text-[11px] text-cream/70">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-gold" /> {b.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-gold" /> {b.operatingHours}
                </div>
                <div className="flex items-start gap-1.5">
                  <Activity className="h-3 w-3 text-gold mt-0.5" /> {b.activities}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
