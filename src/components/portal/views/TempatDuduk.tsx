'use client'

import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Armchair, X, Search, Users, Crown, Plus, Trash2, Lock,
  ZoomIn, ZoomOut, Shield, Gift, UtensilsCrossed, DoorOpen, Music,
} from 'lucide-react'
import { useSeating } from '@/hooks/use-data'
import { usePortal } from '@/lib/store'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function TempatDuduk() {
  const { data: seatingData, loading, error, refetch } = useSeating()
  const { adminToken } = usePortal()
  const [selected, setSelected] = useState<any | null>(null)
  const [search, setSearch] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const [adminMode, setAdminMode] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPin, setAdminPin] = useState('')
  const [newGuestName, setNewGuestName] = useState('')

  const tables = seatingData?.tables ?? []

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

  const highlightedTableNum = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return null
    return searchResults[0].table.tableNumber
  }, [searchResults])

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3))
  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.25, 1))
    if (zoom <= 1.25) setPan({ x: 0, y: 0 })
  }
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }
  const handleMouseUp = () => setIsDragging(false)

  // Pinch to zoom
  const touchState = useRef<{ dist: number; zoom: number } | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      touchState.current = { dist: Math.hypot(dx, dy), zoom }
    }
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchState.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const scale = dist / touchState.current.dist
      const newZoom = Math.min(Math.max(touchState.current.zoom * scale, 1), 3)
      setZoom(newZoom)
    }
  }
  const handleTouchEnd = () => { touchState.current = null }

  // Admin login with PIN 1234
  const handleAdminLogin = () => {
    if (adminPin === '1234') {
      setAdminMode(true)
      setShowAdminLogin(false)
      setAdminPin('')
      toast.success('Mod Admin diaktifkan')
    } else {
      toast.error('PIN salah')
    }
  }

  // Admin: add guest (uses Supabase if adminToken, else LocalStorage)
  const handleAddGuest = async (tableId: string) => {
    if (!newGuestName.trim()) return
    if (adminToken) {
      try {
        await api.adminAddGuest(adminToken, tableId, newGuestName.trim())
        setNewGuestName('')
        refetch()
        toast.success('Tetamu ditambah')
      } catch (e: any) {
        toast.error(e.message)
      }
    } else {
      // LocalStorage fallback
      const key = `seating-table-${tableId}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.push(newGuestName.trim())
      localStorage.setItem(key, JSON.stringify(existing))
      setNewGuestName('')
      setSelected({ ...selected, guests: [...(selected.guests || []), newGuestName.trim()] })
      toast.success('Tetamu ditambah (LocalStorage)')
    }
  }

  const handleDeleteGuest = async (tableId: string, guestIndex: number) => {
    if (adminToken) {
      try {
        await api.adminDeleteGuest(adminToken, tableId, guestIndex)
        refetch()
        toast.success('Tetamu dipadam')
      } catch (e: any) {
        toast.error(e.message)
      }
    } else {
      const key = `seating-table-${tableId}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.splice(guestIndex, 1)
      localStorage.setItem(key, JSON.stringify(existing))
      setSelected({ ...selected, guests: selected.guests.filter((_: string, i: number) => i !== guestIndex) })
      toast.success('Tetamu dipadam (LocalStorage)')
    }
  }

  const containerStyle = {
    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
  }

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-3">
          <Armchair className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs text-gold-light">Pelan Tempat Duduk</span>
        </div>
        <h1 className="font-display text-xl sm:text-3xl font-bold text-gold-shimmer">
          Majestic Hall — 60 Meja
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-cream/60">
          Dewan Majestic Elissa Garden · Karnival 40 Tahun PPAAB
        </p>
      </div>

      {/* Search bar + Admin toggle */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama anda..."
            className="pl-10 bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30"
          />
        </div>
        {adminMode ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300">
              <Shield className="h-3.5 w-3.5" /> Mod Admin
            </span>
            <Button
              onClick={() => setAdminMode(false)}
              variant="outline"
              size="sm"
              className="border-red-400/40 text-red-300 hover:bg-red-500/10"
            >
              Log Keluar
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowAdminLogin(true)}
            variant="outline"
            size="sm"
            className="border-gold/30 text-gold hover:bg-gold/10"
          >
            <Lock className="h-3.5 w-3.5 mr-1" /> Admin
          </Button>
        )}
      </div>

      {/* Search results */}
      <AnimatePresence>
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4 max-w-2xl mx-auto"
          >
            <div className="glass rounded-2xl p-3">
              <div className="text-xs text-gold-light font-semibold mb-2">
                Hasil carian ({searchResults.length} meja)
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scroll">
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

      {/* Zoom controls */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button onClick={handleZoomOut} className="rounded-full glass p-2 text-gold hover:bg-gold/10 transition" aria-label="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-[10px] text-cream/50 tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={handleZoomIn} className="rounded-full glass p-2 text-gold hover:bg-gold/10 transition" aria-label="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </button>
        {zoom !== 1 && (
          <button onClick={handleReset} className="rounded-full glass p-2 text-gold hover:bg-gold/10 transition" aria-label="Reset">
            <Armchair className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Floor plan — matches image 1:1 */}
      {loading ? (
        <Skeleton className="h-[500px] rounded-3xl bg-maroon/30" />
      ) : error ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-cream/60 text-sm mb-3">Gagal memuatkan data</p>
          <Button onClick={() => refetch()} className="bg-gold text-maroon-dark hover:bg-gold-light">
            Cuba semula
          </Button>
        </div>
      ) : (
        <div className="relative glass-strong rounded-2xl border-2 border-gold/30 overflow-hidden">
          {/* Dimension markers (green text like image) */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 text-[8px] text-emerald-400/60 font-mono">137'ft</div>
          <div className="absolute top-1/2 left-1 -translate-y-1/2 z-30 text-[8px] text-emerald-400/60 font-mono" style={{ writingMode: 'vertical-rl' }}>23'ft</div>
          <div className="absolute top-1/2 right-1 -translate-y-1/2 z-30 text-[8px] text-emerald-400/60 font-mono" style={{ writingMode: 'vertical-rl' }}>13'ft</div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-30 text-[8px] text-emerald-400/60 font-mono">97'ft</div>

          {/* Floor plan canvas */}
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: '16/10', minHeight: '400px', backgroundColor: '#3a3a3a' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute inset-0 origin-center transition-transform" style={containerStyle}>
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px',
                }}
              />

              {/* === STAGE (left, grey rectangle) === */}
              <div className="absolute" style={{ left: '2%', top: '15%', width: '8%', height: '70%' }}>
                <div className="w-full h-full rounded bg-gray-400/60 border-2 border-gray-500/50 flex items-center justify-center">
                  <span className="font-display text-[8px] sm:text-[10px] font-bold text-gray-700 uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>
                    STAGE
                  </span>
                </div>
              </div>

              {/* === GIFT TABLES (blue rectangles) === */}
              {/* Top Gift Table — adjacent to top-right of Stage */}
              <div className="absolute" style={{ left: '11%', top: '18%', width: '3%', height: '12%' }}>
                <div className="w-full h-full rounded bg-[#00AEEF]/80 border border-blue-400 flex items-center justify-center">
                  <Gift className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              {/* Bottom-Left Gift Table — along bottom-left wall */}
              <div className="absolute" style={{ left: '11%', top: '70%', width: '3%', height: '12%' }}>
                <div className="w-full h-full rounded bg-[#00AEEF]/80 border border-blue-400 flex items-center justify-center">
                  <Gift className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              {/* Bottom-Right Gift Table — adjacent to bottom-right of Stage */}
              <div className="absolute" style={{ left: '7%', top: '82%', width: '3%', height: '8%' }}>
                <div className="w-full h-full rounded bg-[#00AEEF]/80 border border-blue-400 flex items-center justify-center">
                  <Gift className="h-2.5 w-2.5 text-white" />
                </div>
              </div>

              {/* === RED CARPET AISLE (horizontal, center) === */}
              <div className="absolute" style={{ left: '12%', right: '16%', top: '50%', height: '8%', transform: 'translateY(-50%)' }}>
                <div className="w-full h-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 rounded border-y-2 border-red-400/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[7px] sm:text-[9px] text-yellow-200/40 uppercase tracking-[0.3em] font-serif italic">
                    Laluan Karpet Merah
                  </span>
                </div>
              </div>

              {/* === RIGHT ZONE: Holding Room, Dressing Room, Buffet Lines === */}
              {/* Holding Room 1 (top-right, light green) */}
              <div className="absolute" style={{ right: '2%', top: '10%', width: '12%', height: '15%' }}>
                <div className="w-full h-full rounded-lg bg-[#90EE90]/30 border-2 border-[#90EE90]/50 flex items-center justify-center p-1">
                  <div className="text-center">
                    <DoorOpen className="h-3 w-3 text-green-300/70 mx-auto mb-0.5" />
                    <span className="text-[6px] sm:text-[8px] text-green-200/80 uppercase tracking-wide">Holding Room 1</span>
                  </div>
                </div>
              </div>
              {/* Dressing Room 1 (bottom-right, light yellow) */}
              <div className="absolute" style={{ right: '2%', bottom: '10%', width: '12%', height: '15%' }}>
                <div className="w-full h-full rounded-lg bg-[#FFFACD]/30 border-2 border-[#FFFACD]/50 flex items-center justify-center p-1">
                  <div className="text-center">
                    <Users className="h-3 w-3 text-yellow-200/70 mx-auto mb-0.5" />
                    <span className="text-[6px] sm:text-[8px] text-yellow-100/80 uppercase tracking-wide">Dressing Room 1</span>
                  </div>
                </div>
              </div>
              {/* Buffet Line — Top wall */}
              <div className="absolute" style={{ left: '20%', top: '4%', width: '15%', height: '3%' }}>
                <div className="w-full h-full rounded bg-[#4A4A4A]/60 border border-gray-600/50 flex items-center justify-center">
                  <span className="text-[6px] text-gray-300/70 uppercase tracking-wide flex items-center gap-0.5">
                    <UtensilsCrossed className="h-2 w-2" /> Buffet Line
                  </span>
                </div>
              </div>
              {/* Buffet Line — Bottom wall */}
              <div className="absolute" style={{ left: '20%', bottom: '4%', width: '15%', height: '3%' }}>
                <div className="w-full h-full rounded bg-[#4A4A4A]/60 border border-gray-600/50 flex items-center justify-center">
                  <span className="text-[6px] text-gray-300/70 uppercase tracking-wide flex items-center gap-0.5">
                    <UtensilsCrossed className="h-2 w-2" /> Buffet Line
                  </span>
                </div>
              </div>
              {/* Buffet Line — Right divider top */}
              <div className="absolute" style={{ right: '15%', top: '15%', width: '3%', height: '12%' }}>
                <div className="w-full h-full rounded bg-[#4A4A4A]/60 border border-gray-600/50 flex items-center justify-center">
                  <UtensilsCrossed className="h-2.5 w-2.5 text-gray-300/70" />
                </div>
              </div>
              {/* Buffet Line — Right divider bottom */}
              <div className="absolute" style={{ right: '15%', bottom: '15%', width: '3%', height: '12%' }}>
                <div className="w-full h-full rounded bg-[#4A4A4A]/60 border border-gray-600/50 flex items-center justify-center">
                  <UtensilsCrossed className="h-2.5 w-2.5 text-gray-300/70" />
                </div>
              </div>

              {/* === 60 TABLES === */}
              {tables.map((table: any, i: number) => {
                const isVIP = table.zone === 'vip'
                const isHighlighted = highlightedTableNum === table.tableNumber
                return (
                  <motion.button
                    key={table.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.005, 0.3) }}
                    whileHover={{ scale: 1.25, zIndex: 20 }}
                    onClick={() => setSelected(table)}
                    className={cn(
                      'absolute -translate-x-1/2 -translate-y-1/2 group z-10',
                      isHighlighted && 'z-30'
                    )}
                    style={{ left: `${table.x}%`, top: `${table.y}%` }}
                    aria-label={`Meja ${table.tableNumber}`}
                  >
                    <div className="relative">
                      {/* Glow */}
                      {(isVIP || isHighlighted) && (
                        <div className={cn(
                          'absolute -inset-1 rounded-full blur-sm animate-pulse',
                          isHighlighted ? 'bg-blue-400/50' : 'bg-gold/40'
                        )} />
                      )}
                      {/* Table circle — cream/beige like image */}
                      <div
                        className={cn(
                          'relative flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 transition-all',
                          isHighlighted
                            ? 'bg-blue-500 border-blue-300 ring-2 ring-blue-400/60'
                            : isVIP
                            ? 'bg-gradient-to-br from-gold to-gold-deep border-gold-light shadow-lg'
                            : 'bg-[#F5E6D3] border-gray-600 group-hover:border-gold group-hover:bg-gold/20'
                        )}
                      >
                        <span className={cn(
                          'font-display font-bold text-[6px] sm:text-[8px] tabular-nums',
                          isHighlighted ? 'text-white' : isVIP ? 'text-maroon-dark' : 'text-gray-800'
                        )}>
                          {table.tableNumber}
                        </span>
                        {/* Chair dots around table */}
                        {Array.from({ length: 10 }).map((_, ci) => {
                          const angle = (ci / 10) * Math.PI * 2
                          const r = 13
                          return (
                            <div
                              key={ci}
                              className="absolute h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-gray-500/60"
                              style={{
                                left: `calc(50% + ${Math.cos(angle) * r}px - 1px)`,
                                top: `calc(50% + ${Math.sin(angle) * r}px - 1px)`,
                              }}
                            />
                          )
                        })}
                      </div>
                      {/* VIP crown */}
                      {isVIP && (
                        <Crown className="absolute -top-1.5 -right-1.5 h-2 w-2 sm:h-2.5 sm:w-2.5 text-gold fill-gold drop-shadow" />
                      )}
                      {/* Hover label */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 whitespace-nowrap rounded bg-maroon-dark/95 px-1.5 py-0.5 text-[7px] sm:text-[8px] text-gold opacity-0 group-hover:opacity-100 transition pointer-events-none z-30">
                        Meja {table.tableNumber}
                        {table.guests?.length > 0 && ` · ${table.guests.length} tetamu`}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2.5 px-4 border-t border-gold/20">
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-gold to-gold-deep border border-gold-light" />
              <span className="text-[9px] text-cream/60">VIP</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-[#F5E6D3] border border-gray-600" />
              <span className="text-[9px] text-cream/60">Tetamu</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 border border-blue-300" />
              <span className="text-[9px] text-cream/60">Carian</span>
            </div>
            <div className="w-px h-3 bg-gold/20" />
            <div className="flex items-center gap-1 text-[9px] text-cream/50">
              <Armchair className="h-3 w-3 text-gold/50" />
              {adminMode ? 'Klik meja untuk urus tetamu' : 'Klik meja untuk lihat tetamu'}
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

      {/* Admin PIN login modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-maroon-dark/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAdminLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-strong rounded-2xl border border-gold/40 max-w-xs w-full p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="inline-flex rounded-full glass-gold p-3 mb-2">
                  <Lock className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-lg font-bold text-gold-shimmer">Mod Admin</h3>
                <p className="text-xs text-cream/60 mt-1">Masukkan PIN untuk urus tetamu</p>
              </div>
              <Input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="PIN (4 digit)"
                className="bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30 mb-3 text-center tracking-[0.5em]"
                maxLength={4}
                autoFocus
              />
              <Button onClick={handleAdminLogin} className="w-full bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90">
                Log Masuk
              </Button>
              <p className="text-center text-[10px] text-cream/40 mt-2">Hint: 1234</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest list / Admin panel modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-maroon-dark/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
            onClick={() => { setSelected(null); setNewGuestName('') }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-strong rounded-2xl border border-gold/40 max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative px-4 py-3 border-b border-gold/20 bg-gradient-to-r from-maroon to-maroon-dark">
                <button
                  onClick={() => { setSelected(null); setNewGuestName('') }}
                  className="absolute top-3 right-3 text-cream/50 hover:text-cream"
                >
                  <X className="h-5 w-5" />
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
                    <h3 className="font-display text-lg font-bold text-gold-shimmer">
                      Meja {selected.tableNumber}
                    </h3>
                    <div className="flex items-center gap-2">
                      {selected.label && (
                        <span className="text-[10px] text-gold-light">{selected.label}</span>
                      )}
                      <span className="text-[10px] text-cream/50">
                        {selected.guests?.length || 0}/{selected.capacity} tetamu
                      </span>
                    </div>
                  </div>
                  {selected.zone === 'vip' && (
                    <Crown className="h-4 w-4 text-gold fill-gold ml-auto mr-8" />
                  )}
                </div>
              </div>

              {/* Guest list */}
              <div className="flex-1 overflow-y-auto custom-scroll p-4">
                <div className="space-y-2">
                  {(selected.guests as string[]).map((guest: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-2 rounded-xl bg-gold/5 hover:bg-gold/10 transition px-3 py-2.5"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-gold/10 text-gold text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm text-cream/85 flex-1">{guest}</span>
                      {adminMode && (
                        <button
                          onClick={() => handleDeleteGuest(selected.id, i)}
                          className="text-red-400/60 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                  {selected.guests?.length === 0 && (
                    <div className="text-center py-6 text-cream/40 text-sm">
                      Tiada tetamu di meja ini
                    </div>
                  )}
                </div>

                {/* Admin: Add guest */}
                {adminMode && (
                  <div className="mt-4 pt-4 border-t border-gold/20">
                    <div className="flex gap-2">
                      <Input
                        value={newGuestName}
                        onChange={(e) => setNewGuestName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddGuest(selected.id)}
                        placeholder="Nama tetamu baharu..."
                        className="bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30 text-sm"
                      />
                      <Button
                        onClick={() => handleAddGuest(selected.id)}
                        size="sm"
                        className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 shrink-0"
                        disabled={selected.guests?.length >= selected.capacity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {selected.guests?.length >= selected.capacity && (
                      <p className="text-[10px] text-red-400/70 mt-1.5 text-center">Meja penuh — kapasiti: {selected.capacity}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-gold/20 flex items-center justify-between text-[10px] text-cream/50">
                <span className="flex items-center gap-1">
                  <Armchair className="h-3 w-3 text-gold/40" />
                  Kapasiti: {selected.capacity} kerusi
                </span>
                {adminMode && (
                  <span className="text-emerald-400/70 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Mod Admin
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
