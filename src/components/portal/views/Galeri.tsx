'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Images, Camera, Star, RefreshCw, X, Filter, Sparkles } from 'lucide-react'
import { useGallery } from '@/hooks/use-data'
import { useSocket } from '@/hooks/use-socket'
import { usePortal } from '@/lib/store'
import { timeAgo } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { HIGHLIGHT_CATEGORIES } from '@/lib/types'
import { cn } from '@/lib/utils'

export function Galeri() {
  const { data: gallery, loading, refetch } = useGallery()
  const { setUploadOpen } = usePortal()
  const { socket } = useSocket()
  const [filter, setFilter] = useState<string>('all')
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    if (!socket) return
    const onUpdate = () => refetch()
    socket.on('gallery:new', onUpdate)
    socket.on('gallery:update', onUpdate)
    return () => {
      socket.off('gallery:new', onUpdate)
      socket.off('gallery:update', onUpdate)
    }
  }, [socket, refetch])

  const photos = gallery?.photos ?? []
  const count = gallery?.count ?? 0
  const mode = gallery?.mode ?? 'auto'

  const highlights = photos.filter((p) => p.highlight)
  const filtered = useMemo(() => {
    if (filter === 'all') return photos
    if (filter === 'highlights') return highlights
    return photos.filter((p) => p.highlightCategory === filter)
  }, [photos, highlights, filter])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
          <Camera className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs text-gold-light">Karnival Kita, Momen Kita</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold-shimmer">
          Live Carnival Gallery
        </h1>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 live-dot" />
          <span className="text-sm font-semibold text-emerald-300">
            📸 {count} moments shared
          </span>
        </div>
        {mode === 'approval' && (
          <p className="mt-2 text-[11px] text-cream/50">
            Gambar akan dipaparkan selepas diluluskan urusetia
          </p>
        )}
      </div>

      {/* Upload CTA */}
      <div className="glass-gold rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="font-display text-lg font-semibold text-gold-shimmer">Share Your Moment 📸</h3>
          <p className="text-xs text-cream/70 mt-1">
            Kongsi gambar anda ke Live Gallery — menjadi sebahagian daripada Karnival 40 Tahun!
          </p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold shrink-0"
        >
          <Camera className="h-4 w-4 mr-2" /> Kongsi Momen
        </Button>
      </div>

      {/* Highlights section */}
      {highlights.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-gold fill-gold" />
            <h2 className="font-display text-lg font-semibold text-gold-shimmer">Carnival Highlights</h2>
            <span className="text-xs text-cream/50">({highlights.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {highlights.slice(0, 8).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'relative group rounded-xl overflow-hidden glass-gold aspect-square cursor-pointer',
                  i === 0 && 'sm:col-span-2 sm:row-span-2'
                )}
                onClick={() => setLightbox(p.imageUrl)}
              >
                <img src={p.imageUrl} alt={p.caption || 'moment'} className="h-full w-full object-cover transition group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/90 px-2 py-0.5 text-[9px] font-bold text-maroon-dark">
                    <Star className="h-2.5 w-2.5 fill-maroon-dark" /> {p.highlightCategory}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition">
                  <div className="text-[10px] text-cream font-medium truncate">{p.contributorName}</div>
                  {p.caption && <div className="text-[9px] text-cream/70 truncate">{p.caption}</div>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto custom-scroll pb-2">
        <Filter className="h-4 w-4 text-gold shrink-0" />
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
            filter === 'all' ? 'bg-gold text-maroon-dark' : 'glass text-cream/70 hover:text-gold'
          )}
        >
          Semua Momen
        </button>
        <button
          onClick={() => setFilter('highlights')}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition flex items-center gap-1',
            filter === 'highlights' ? 'bg-gold text-maroon-dark' : 'glass text-cream/70 hover:text-gold'
          )}
        >
          <Sparkles className="h-3 w-3" /> Highlight
        </button>
        {HIGHLIGHT_CATEGORIES.map((cat) => (
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

      {/* Photo wall */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-cream flex items-center gap-2">
          <Images className="h-4 w-4 text-gold" /> Latest Moments
        </h2>
        <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-gold/70 hover:text-gold">
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Segar
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl bg-maroon/30" />
          ))}
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 8) * 0.04 }}
              className="break-inside-avoid mb-3 relative group rounded-xl overflow-hidden glass cursor-pointer"
              onClick={() => setLightbox(p.imageUrl)}
            >
              <img src={p.imageUrl} alt={p.caption || 'moment'} className="w-full object-cover transition group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition">
                <div className="text-[11px] text-cream font-medium truncate">{p.contributorName}</div>
                <div className="text-[9px] text-cream/60">{timeAgo(p.createdAt)}</div>
              </div>
              {p.highlight && (
                <div className="absolute top-2 right-2">
                  <Star className="h-3.5 w-3.5 text-gold fill-gold drop-shadow" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Images className="h-12 w-12 text-gold/30 mx-auto mb-3" />
          <p className="text-cream/50 text-sm">Belum ada momen dalam kategori ini.</p>
          <Button onClick={() => setUploadOpen(true)} className="mt-4 bg-gold text-maroon-dark hover:bg-gold-light">
            <Camera className="h-4 w-4 mr-2" /> Kongsi Momen Pertama
          </Button>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-maroon-dark/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-4 right-4 rounded-full bg-gold/20 p-2 text-cream hover:bg-gold/30">
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={lightbox}
              alt="moment"
              className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain glow-gold"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
