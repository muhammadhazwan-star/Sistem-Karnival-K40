'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin, Music, ClipboardCheck, UtensilsCrossed, Building2, Gamepad2,
  Baby, Car, Moon, HeartPulse, DoorOpen, Info, X,
} from 'lucide-react'
import { useMap } from '@/hooks/use-data'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, typeof Music> = {
  Music, ClipboardCheck, UtensilsCrossed, Building2, Gamepad2,
  Baby, Car, Moon, HeartPulse, DoorOpen, Info,
}

const TYPE_COLORS: Record<string, string> = {
  'Main Stage': 'bg-purple-500/80',
  Registration: 'bg-blue-500/80',
  'Food Area': 'bg-amber-500/80',
  Booth: 'bg-cyan-500/80',
  'Competition Area': 'bg-rose-500/80',
  'Kids Area': 'bg-emerald-500/80',
  Parking: 'bg-slate-500/80',
  Surau: 'bg-indigo-500/80',
  Medical: 'bg-red-500/80',
  Toilet: 'bg-gray-500/80',
  Information: 'bg-gold/80',
}

export function Peta() {
  const { data: locations, loading } = useMap()
  const [selected, setSelected] = useState<any | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const locs = locations ?? []
  const types = Array.from(new Set(locs.map((l) => l.type)))
  const filtered = filter === 'all' ? locs : locs.filter((l) => l.type === filter)

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
          <MapPin className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs text-gold-light">📍 Carnival Map</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold-shimmer">
          Peta Karnival
        </h1>
        <p className="mt-2 text-sm text-cream/60">Lokasi penting di Dewan Majestic Elissa Garden</p>
      </div>

      {/* Legend filter */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto custom-scroll pb-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
            filter === 'all' ? 'bg-gold text-maroon-dark' : 'glass text-cream/70 hover:text-gold'
          )}
        >
          Semua
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
              filter === t ? 'bg-gold text-maroon-dark' : 'glass text-cream/70 hover:text-gold'
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', TYPE_COLORS[t] || 'bg-gold')} />
            {t}
          </button>
        ))}
      </div>

      {/* Map */}
      {loading ? (
        <Skeleton className="h-[400px] rounded-3xl bg-maroon/30" />
      ) : (
        <div className="relative glass-strong rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/10]">
          {/* Map background pattern */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 30% 40%, rgba(122, 31, 43, 0.4), transparent 50%),
                radial-gradient(ellipse at 70% 60%, rgba(60, 18, 26, 0.5), transparent 50%),
                linear-gradient(135deg, rgba(45, 10, 16, 0.8), rgba(61, 13, 20, 0.8))
              `,
            }}
          />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(212,175,55,0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(212,175,55,0.15) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          {/* Path lines connecting main areas */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M 20 75 Q 35 50 50 30 Q 65 35 75 40" stroke="rgba(212,175,55,0.25)" strokeWidth="0.4" fill="none" strokeDasharray="2,1.5" />
            <path d="M 50 30 L 50 75 L 65 80" stroke="rgba(212,175,55,0.2)" strokeWidth="0.4" fill="none" strokeDasharray="2,1.5" />
            <path d="M 75 40 L 80 70 L 65 80" stroke="rgba(212,175,55,0.2)" strokeWidth="0.4" fill="none" strokeDasharray="2,1.5" />
          </svg>

          {/* Location pins */}
          {filtered.map((loc, i) => {
            const Icon = ICON_MAP[loc.icon] || MapPin
            return (
              <motion.button
                key={loc.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(loc)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              >
                <div className={cn('flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-gold/50 shadow-lg transition group-hover:scale-125', TYPE_COLORS[loc.type] || 'bg-gold/80')}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap rounded bg-maroon-dark/90 px-2 py-0.5 text-[9px] sm:text-[10px] text-cream opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  {loc.name}
                </div>
              </motion.button>
            )
          })}

          {/* Compass */}
          <div className="absolute top-4 right-4 glass rounded-full p-2">
            <div className="text-[9px] text-gold font-bold text-center">N</div>
            <div className="h-8 w-px bg-gold/40 mx-auto" />
            <div className="text-[9px] text-cream/50 text-center">S</div>
          </div>
        </div>
      )}

      {/* Location list */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((loc) => {
          const Icon = ICON_MAP[loc.icon] || MapPin
          return (
            <button
              key={loc.id}
              onClick={() => setSelected(loc)}
              className="glass rounded-xl p-4 text-left hover:bg-gold/10 transition flex items-start gap-3"
            >
              <div className={cn('shrink-0 rounded-lg p-2', TYPE_COLORS[loc.type] || 'bg-gold/30')}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-cream truncate">{loc.name}</div>
                <div className="text-[10px] text-gold/60 uppercase tracking-wide">{loc.type}</div>
                <div className="text-[11px] text-cream/60 mt-1 line-clamp-2">{loc.description}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-maroon-dark/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-strong rounded-2xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 text-cream/60 hover:text-cream">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('rounded-xl p-3', TYPE_COLORS[selected.type] || 'bg-gold/30')}>
                {(() => { const Icon = ICON_MAP[selected.icon] || MapPin; return <Icon className="h-6 w-6 text-white" /> })()}
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-gold-shimmer">{selected.name}</h3>
                <span className="text-[10px] text-gold/60 uppercase tracking-wide">{selected.type}</span>
              </div>
            </div>
            <p className="text-sm text-cream/80 leading-relaxed">{selected.description}</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
