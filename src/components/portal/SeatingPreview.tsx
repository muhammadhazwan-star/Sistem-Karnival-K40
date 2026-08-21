'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Armchair, X, Users, Crown, Search, Sparkles, ChevronRight,
} from 'lucide-react'
import { useSeating } from '@/hooks/use-data'
import { usePortal } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function SeatingPreview() {
  const { data: seatingData, loading } = useSeating()
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [search, setSearch] = useState('')

  const tables = seatingData?.tables ?? []

  const searchResults = search.trim()
    ? tables
        .map((t: any) => ({
          table: t,
          matches: (t.guests as string[]).filter((g: string) =>
            g.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((r: any) => r.matches.length > 0)
    : null

  return (
    <>
      {/* Mini floor plan preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass-strong rounded-2xl overflow-hidden border border-gold/30"
      >
        {/* Title bar */}
        <div className="bg-gradient-to-r from-maroon-deep via-burgundy to-maroon-deep py-2 px-4 text-center border-b border-gold/20">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3 text-gold animate-twinkle" />
            <span className="font-display text-xs sm:text-sm font-bold text-gold-shimmer tracking-wide">
              KEDUDUKAN MEJA · 60 MEJA
            </span>
            <Sparkles className="h-3 w-3 text-gold animate-twinkle" />
          </div>
        </div>

        {/* Mini floor plan */}
        <div className="relative w-full bg-gradient-to-br from-maroon-dark via-maroon to-maroon-deep p-3" style={{ aspectRatio: '5/3' }}>
          {loading ? (
            <Skeleton className="h-full w-full rounded-xl bg-maroon/30" />
          ) : (
            <>
              {/* Grid background */}
              <div
                className="absolute inset-2 opacity-5"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px',
                }}
              />
              {/* Stage label */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[10%]">
                <div className="rounded bg-red-900/60 border border-gold/30 py-1 text-center">
                  <span className="text-[7px] text-gold/60 uppercase">Pentas</span>
                </div>
              </div>

              {/* Tables */}
              {tables.slice(0, 60).map((table: any, i: number) => {
                const isVIP = table.zone === 'vip'
                return (
                  <div
                    key={table.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${table.x}%`, top: `${table.y}%` }}
                  >
                    <div
                      className={cn(
                        'flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border',
                        isVIP
                          ? 'bg-gradient-to-br from-gold to-gold-deep border-gold-light'
                          : 'bg-maroon-dark border-gold/30'
                      )}
                    >
                      <span className={cn(
                        'font-display font-bold text-[7px] sm:text-[8px]',
                        isVIP ? 'text-maroon-dark' : 'text-gold-light'
                      )}>
                        {table.tableNumber}
                      </span>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Button */}
        <div className="p-3">
          <Button
            onClick={() => usePortal.getState().setView('tempat-duduk')}
            className="w-full bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
          >
            <Armchair className="h-4 w-4 mr-2" /> Ketahui Meja Anda
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          <p className="text-center text-[10px] text-cream/40 mt-2">
            Klik untuk cari kedudukan meja anda (60 meja)
          </p>
        </div>
      </motion.div>

      {/* Full interactive modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-maroon-dark/90 backdrop-blur-md flex items-center justify-center p-3"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-strong rounded-2xl border border-gold/40 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20 bg-gradient-to-r from-maroon to-maroon-dark">
                <div className="flex items-center gap-2">
                  <Armchair className="h-4 w-4 text-gold" />
                  <h3 className="font-display text-base font-bold text-gold-shimmer">
                    Kedudukan Meja
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-cream/50 hover:text-cream"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search bar */}
              <div className="p-3 border-b border-gold/10">
                <div className="relative max-w-xs mx-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gold/50" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama anda..."
                    className="pl-9 h-9 bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30 text-sm"
                  />
                </div>
              </div>

              {/* Search results */}
              <AnimatePresence>
                {searchResults && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 border-b border-gold/10">
                      <div className="text-[10px] text-gold-light font-semibold mb-2">
                        Hasil carian ({searchResults.length} meja)
                      </div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scroll">
                        {searchResults.map((r: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => { setSelected(r.table); setSearch('') }}
                            className="w-full flex items-center gap-2 rounded-lg bg-gold/5 hover:bg-gold/15 px-2 py-1.5 transition text-left"
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-maroon-dark text-[10px] font-bold">
                              {r.table.tableNumber}
                            </span>
                            <div className="min-w-0">
                              <div className="text-[11px] text-cream font-medium">
                                Meja {r.table.tableNumber}
                                {r.table.label && <span className="text-gold/60"> · {r.table.label}</span>}
                              </div>
                              <div className="text-[9px] text-cream/50 truncate">{r.matches.join(', ')}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floor plan */}
              <div className="flex-1 overflow-y-auto custom-scroll p-3">
                {loading ? (
                  <Skeleton className="h-64 rounded-xl bg-maroon/30" />
                ) : tables.length === 0 ? (
                  <div className="text-center py-8 text-cream/50 text-sm">Tiada data meja</div>
                ) : (
                  <div className="relative w-full bg-gradient-to-br from-maroon-dark via-maroon to-maroon-deep rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    {/* Grid */}
                    <div
                      className="absolute inset-0 opacity-5"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '30px 30px',
                      }}
                    />
                    {/* Center aisle */}
                    <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-1 bg-gold/15 rounded-full" />

                    {/* Stage */}
                    <div className="absolute left-1 top-2 bottom-2 w-[10%] flex flex-col gap-1">
                      <div className="flex-1 rounded bg-maroon-dark/60 border border-gold/20 flex items-center justify-center">
                        <span className="text-[7px] text-gold/50 rotate-[-90deg] whitespace-nowrap">ARTIS</span>
                      </div>
                      <div className="flex-[2] rounded bg-gradient-to-br from-red-900 to-red-950 border border-gold/30 flex items-center justify-center">
                        <span className="text-[7px] text-gold/70 font-bold rotate-[-90deg] whitespace-nowrap">PENTAS</span>
                      </div>
                      <div className="flex-1 rounded bg-maroon-dark/60 border border-gold/20 flex items-center justify-center">
                        <span className="text-[7px] text-gold/50 rotate-[-90deg] whitespace-nowrap">AV</span>
                      </div>
                    </div>

                    {/* Tables */}
                    {tables.map((table: any, i: number) => {
                      const isVIP = table.zone === 'vip'
                      const isSpecial = table.zone === 'special'
                      return (
                        <motion.button
                          key={table.id}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.01 }}
                          whileHover={{ scale: 1.2, zIndex: 10 }}
                          onClick={() => setSelected(table)}
                          className="absolute -translate-x-1/2 -translate-y-1/2 group"
                          style={{ left: `${table.x}%`, top: `${table.y}%` }}
                        >
                          <div className="relative">
                            {isVIP && (
                              <div className="absolute -inset-0.5 rounded-full bg-gold/30 blur-sm animate-pulse" />
                            )}
                            <div
                              className={cn(
                                'relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 transition-all',
                                isVIP
                                  ? 'bg-gradient-to-br from-gold to-gold-deep border-gold-light'
                                  : isSpecial
                                  ? 'bg-gradient-to-br from-amber-900/60 to-maroon-dark border-amber-400/50'
                                  : 'bg-maroon-dark border-gold/40 group-hover:border-gold group-hover:from-gold/20'
                              )}
                            >
                              <span className={cn(
                                'font-display font-bold text-[8px] sm:text-[9px]',
                                isVIP ? 'text-maroon-dark' : 'text-gold-light'
                              )}>
                                {table.tableNumber}
                              </span>
                            </div>
                            {isVIP && (
                              <Crown className="absolute -top-1 -right-1 h-2.5 w-2.5 text-gold fill-gold" />
                            )}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-gold to-gold-deep border border-gold-light" />
                    <span className="text-[9px] text-cream/60">VIP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-900/60 to-maroon-dark border border-amber-400/50" />
                    <span className="text-[9px] text-cream/60">Kehormat</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-maroon-dark border border-gold/40" />
                    <span className="text-[9px] text-cream/60">Tetamu</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest list modal (nested) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-maroon-dark/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-strong rounded-2xl border border-gold/40 max-w-sm w-full max-h-[70vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gold/20 bg-gradient-to-r from-maroon to-maroon-dark">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 text-cream/50 hover:text-cream"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full font-display font-bold',
                    selected.zone === 'vip'
                      ? 'bg-gradient-to-br from-gold to-gold-deep text-maroon-dark'
                      : 'glass-gold text-gold-light'
                  )}>
                    {selected.tableNumber}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-gold-shimmer">
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
                    <Crown className="h-4 w-4 text-gold fill-gold ml-auto mr-6" />
                  )}
                </div>
              </div>

              {/* Guest list */}
              <div className="flex-1 overflow-y-auto custom-scroll p-3">
                <div className="space-y-1.5">
                  {(selected.guests as string[]).map((guest: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-2 rounded-lg bg-gold/5 hover:bg-gold/10 transition px-2.5 py-2"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-gold/10 text-gold text-[10px] font-bold">
                        {i + 1}
                      </div>
                      <span className="text-xs text-cream/85 flex-1">{guest}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
