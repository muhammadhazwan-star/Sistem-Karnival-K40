'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Armchair, X, Search, Users, Crown, Star, Music, Volume2, DoorOpen, Sparkles,
} from 'lucide-react'
import { useSeating } from '@/hooks/use-data'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function TempatDuduk() {
  const { data: seatingData, loading, error, refetch } = useSeating()
  const [selected, setSelected] = useState<any | null>(null)
  const [search, setSearch] = useState('')

  const tables = seatingData?.tables ?? []

  console.log('[TempatDuduk] loading:', loading, 'error:', error, 'tables:', tables.length)

  // Search: find tables containing the searched name
  const searchResults = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return tables
      .map((t: any) => ({
        table: t,
        matches: (t.guests as string[]).filter((g: string) => g.toLowerCase().includes(q)),
      }))
      .filter((r: any) => r.matches.length > 0)
  }, [search, tables])

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
          <Armchair className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs text-gold-light">Pelan Tempat Duduk</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gold-shimmer">
          Carta Tempat Duduk
        </h1>
        <p className="mt-2 text-sm text-cream/60">
          Karnival 40 Tahun PPAAB · Dewan Majestic Elissa Garden
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4 max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/50" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama anda..."
          className="pl-10 bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30"
        />
      </div>

      {/* Search results */}
      <AnimatePresence>
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass rounded-2xl p-4">
              <div className="text-xs text-gold-light font-semibold mb-2">
                Hasil carian ({searchResults.length} meja)
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scroll">
                {searchResults.map((r: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => { setSelected(r.table); setSearch('') }}
                    className="w-full flex items-center justify-between gap-2 rounded-xl bg-gold/5 hover:bg-gold/15 px-3 py-2 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-maroon-dark text-xs font-bold">
                        {r.table.tableNumber}
                      </span>
                      <div>
                        <div className="text-xs text-cream font-medium">
                          Meja {r.table.tableNumber}
                          {r.table.label && <span className="text-gold/60"> · {r.table.label}</span>}
                        </div>
                        <div className="text-[10px] text-cream/50">{r.matches.join(', ')}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floor plan */}
      {loading ? (
        <div className="glass rounded-3xl p-8 text-center h-[400px] flex flex-col items-center justify-center">
          <div className="relative h-12 w-12 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
            <div className="absolute inset-0 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          </div>
          <p className="text-cream/60 text-sm">Memuatkan pelan tempat duduk...</p>
          <p className="text-cream/40 text-xs mt-1">30 meja · 300 tetamu</p>
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-cream/60 text-sm mb-3">Gagal memuatkan data tempat duduk</p>
          <p className="text-cream/40 text-xs mb-4">{error}</p>
          <button onClick={() => refetch()} className="rounded-full bg-gold/20 px-4 py-2 text-xs text-gold hover:bg-gold/30">
            Cuba semula
          </button>
        </div>
      ) : tables.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-cream/60 text-sm">Tiada meja ditemui. Sila tambah data meja.</p>
        </div>
      ) : (
        <div className="relative glass-strong rounded-3xl overflow-hidden border-2 border-gold/30 p-1">
          {/* Title bar */}
          <div className="relative bg-gradient-to-r from-maroon-deep via-burgundy to-maroon-deep py-2 px-4 text-center border-b border-gold/20">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-gold animate-twinkle" />
              <h2 className="font-display text-sm sm:text-base font-bold text-gold-shimmer tracking-wide">
                KARNIVAL 40 TAHUN PPAAB
              </h2>
              <Sparkles className="h-3.5 w-3.5 text-gold animate-twinkle" />
            </div>
          </div>

          {/* Floor plan canvas */}
          <div
            className="relative w-full bg-gradient-to-br from-maroon-dark via-maroon to-maroon-deep"
            style={{ aspectRatio: '4/3', minHeight: '400px' }}
          >
            {/* Decorative grid */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Center aisle (vertical) */}
            <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-2 bg-gradient-to-b from-gold/10 via-gold/20 to-gold/10 rounded-full" />
            {/* Horizontal aisle */}
            <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-gold/10 via-gold/15 to-gold/10 rounded-full" />

            {/* Left side: Stage + rooms */}
            <div className="absolute left-1 top-2 bottom-2 w-[14%] flex flex-col gap-1.5">
              {/* Artis Room */}
              <div className="relative flex-1 rounded-lg bg-maroon-dark/60 border border-gold/30 flex items-center justify-center p-1">
                <div className="text-center">
                  <Music className="h-3.5 w-3.5 text-gold/70 mx-auto mb-0.5" />
                  <span className="text-[7px] sm:text-[8px] text-gold/60 uppercase tracking-wide">Artis</span>
                </div>
              </div>
              {/* Stage */}
              <div className="relative flex-[2] rounded-lg bg-gradient-to-br from-red-900 to-red-950 border-2 border-gold/40 flex items-center justify-center overflow-hidden">
                {/* Curtain effect */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-red-700 to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-red-700 to-transparent" />
                <span className="font-display text-[8px] sm:text-[10px] font-bold text-gold/80 uppercase tracking-widest rotate-[-90deg] whitespace-nowrap">
                  PENTAS
                </span>
              </div>
              {/* AV Room */}
              <div className="relative flex-1 rounded-lg bg-maroon-dark/60 border border-gold/30 flex items-center justify-center p-1">
                <div className="text-center">
                  <Volume2 className="h-3.5 w-3.5 text-gold/70 mx-auto mb-0.5" />
                  <span className="text-[7px] sm:text-[8px] text-gold/60 uppercase tracking-wide">AV</span>
                </div>
              </div>
            </div>

            {/* Right side: rooms */}
            <div className="absolute right-1 top-2 bottom-2 w-[14%] flex flex-col gap-1.5">
              {/* Holding Room */}
              <div className="relative flex-1 rounded-lg bg-maroon-dark/60 border border-gold/30 flex items-center justify-center p-1">
                <div className="text-center">
                  <DoorOpen className="h-3.5 w-3.5 text-gold/70 mx-auto mb-0.5" />
                  <span className="text-[7px] sm:text-[8px] text-gold/60 uppercase tracking-wide">Holding</span>
                </div>
              </div>
              {/* Dressing Room */}
              <div className="relative flex-1 rounded-lg bg-maroon-dark/60 border border-gold/30 flex items-center justify-center p-1">
                <div className="text-center">
                  <Users className="h-3.5 w-3.5 text-gold/70 mx-auto mb-0.5" />
                  <span className="text-[7px] sm:text-[8px] text-gold/60 uppercase tracking-wide">Dressing</span>
                </div>
              </div>
            </div>

            {/* Tables — positioned in center area */}
            {tables.map((table: any, i: number) => {
              const isVIP = table.zone === 'vip'
              const isSpecial = table.zone === 'special'
              return (
                <motion.button
                  key={table.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ scale: 1.15, zIndex: 20 }}
                  onClick={() => setSelected(table)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${table.x}%`, top: `${table.y}%` }}
                  aria-label={`Meja ${table.tableNumber}`}
                >
                  <div className="relative">
                    {/* Glow ring for VIP */}
                    {isVIP && (
                      <div className="absolute -inset-1 rounded-full bg-gold/30 blur-sm animate-pulse-glow" />
                    )}
                    {/* Table circle */}
                    <div
                      className={cn(
                        'relative flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 transition-all',
                        isVIP
                          ? 'bg-gradient-to-br from-gold to-gold-deep border-gold-light shadow-lg'
                          : isSpecial
                          ? 'bg-gradient-to-br from-amber-900/60 to-maroon-dark border-amber-400/50'
                          : 'bg-gradient-to-br from-maroon to-maroon-dark border-gold/40 group-hover:border-gold group-hover:from-gold/20'
                      )}
                    >
                      <span className={cn(
                        'font-display font-bold text-[8px] sm:text-[10px] tabular-nums',
                        isVIP ? 'text-maroon-dark' : 'text-gold-light'
                      )}>
                        {table.tableNumber}
                      </span>
                      {/* Chair dots around table */}
                      {Array.from({ length: 8 }).map((_, ci) => {
                        const angle = (ci / 8) * Math.PI * 2
                        const r = 18
                        return (
                          <div
                            key={ci}
                            className={cn(
                              'absolute h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full',
                              isVIP ? 'bg-gold-light' : 'bg-cream/40'
                            )}
                            style={{
                              left: `calc(50% + ${Math.cos(angle) * r}px - 2px)`,
                              top: `calc(50% + ${Math.sin(angle) * r}px - 2px)`,
                            }}
                          />
                        )
                      })}
                    </div>
                    {/* VIP badge */}
                    {isVIP && (
                      <div className="absolute -top-1.5 -right-1.5">
                        <Crown className="h-3 w-3 text-gold fill-gold drop-shadow" />
                      </div>
                    )}
                    {/* Label on hover */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 whitespace-nowrap rounded bg-maroon-dark/90 px-1.5 py-0.5 text-[8px] text-gold opacity-0 group-hover:opacity-100 transition pointer-events-none z-30">
                      Meja {table.tableNumber}
                      {table.label && ` · ${table.label}`}
                    </div>
                  </div>
                </motion.button>
              )
            })}

            {/* Exits */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-gold/30">
              <DoorOpen className="h-4 w-4" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-gold/30">
              <DoorOpen className="h-4 w-4" />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-3 px-4 border-t border-gold/20">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-gold to-gold-deep border border-gold-light" />
              <span className="text-[10px] text-cream/70">VIP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-amber-900/60 to-maroon-dark border border-amber-400/50" />
              <span className="text-[10px] text-cream/70">Kehormat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-maroon to-maroon-dark border border-gold/40" />
              <span className="text-[10px] text-cream/70">Tetamu</span>
            </div>
            <div className="w-px h-3 bg-gold/20" />
            <div className="flex items-center gap-1.5 text-[10px] text-cream/60">
              <Armchair className="h-3 w-3 text-gold/50" />
              Klik meja untuk lihat senarai tetamu
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
        <div className="glass rounded-xl p-3 text-center">
          <div className="font-display text-lg sm:text-2xl font-bold text-gold-shimmer">{tables.length}</div>
          <div className="text-[10px] text-cream/60">Jumlah Meja</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <div className="font-display text-lg sm:text-2xl font-bold text-gold-shimmer">
            {tables.reduce((s: number, t: any) => s + (t.guests?.length || 0), 0)}
          </div>
          <div className="text-[10px] text-cream/60">Tetamu</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <div className="font-display text-lg sm:text-2xl font-bold text-gold-shimmer">
            {tables.filter((t: any) => t.zone === 'vip').length}
          </div>
          <div className="text-[10px] text-cream/60">Meja VIP</div>
        </div>
      </div>

      {/* Guest list modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-maroon-dark/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-strong rounded-2xl border border-gold/40 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="relative px-5 py-4 border-b border-gold/20 bg-gradient-to-r from-maroon to-maroon-dark">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 text-cream/50 hover:text-cream"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full font-display font-bold text-lg',
                    selected.zone === 'vip'
                      ? 'bg-gradient-to-br from-gold to-gold-deep text-maroon-dark'
                      : 'glass-gold text-gold-light'
                  )}>
                    {selected.tableNumber}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-gold-shimmer">
                      Meja {selected.tableNumber}
                    </h3>
                    <div className="flex items-center gap-2">
                      {selected.label && (
                        <span className="text-[10px] text-gold-light">{selected.label}</span>
                      )}
                      <span className="text-[10px] text-cream/50">
                        {selected.guests?.length || 0} tetamu
                      </span>
                    </div>
                  </div>
                  {selected.zone === 'vip' && (
                    <Crown className="h-5 w-5 text-gold fill-gold ml-auto mr-8" />
                  )}
                </div>
              </div>

              {/* Guest list */}
              <div className="flex-1 overflow-y-auto custom-scroll p-4">
                <div className="space-y-2">
                  {(selected.guests as string[]).map((guest: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 rounded-xl bg-gold/5 hover:bg-gold/10 transition px-3 py-2.5"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-gold/10 text-gold text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm text-cream/85 flex-1">{guest}</span>
                      <Users className="h-3.5 w-3.5 text-gold/30" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gold/20 flex items-center justify-center gap-2 text-gold/40">
                <Armchair className="h-3.5 w-3.5" />
                <span className="text-[10px]">Kapasiti: {selected.capacity} orang</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
