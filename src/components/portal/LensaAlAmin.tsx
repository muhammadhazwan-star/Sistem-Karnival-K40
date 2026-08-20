'use client'

import { motion } from 'framer-motion'
import { Play, Film, Sparkles } from 'lucide-react'

const YOUTUBE_URL = 'https://youtu.be/o9YRs8pD27o'
// Convert to embed URL
const YOUTUBE_EMBED = 'https://www.youtube.com/embed/o9YRs8pD27o'

export function LensaAlAmin() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Decorative glow */}
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-gold/15 via-transparent to-maroon/15 blur-lg" />

      <div className="relative glass-strong rounded-3xl border-2 border-gold/30 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-maroon-deep via-burgundy to-maroon-deep py-4 px-5 text-center border-b border-gold/20">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Film className="h-4 w-4 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold/70 font-semibold">Video Rasmi</span>
            <Film className="h-4 w-4 text-gold" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-gold-shimmer">
            LENSA AL-AMIN
          </h2>
          <p className="font-serif text-sm sm:text-base italic text-cream/70 mt-1">
            Menelusuri 40 Tahun Perjalanan dan Legasi
          </p>
        </div>

        {/* Video embed */}
        <div className="relative bg-maroon-dark">
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={YOUTUBE_EMBED}
              title="LENSA AL-AMIN — Menelusuri 40 Tahun Perjalanan dan Legasi"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              style={{ border: 'none' }}
            />
          </div>
        </div>

        {/* Footer with link */}
        <div className="px-5 py-3 border-t border-gold/20 flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-gold animate-twinkle" />
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gold-light hover:text-gold transition flex items-center gap-1"
          >
            <Play className="h-3 w-3 fill-gold-light" />
            Tonton di YouTube
          </a>
          <Sparkles className="h-3.5 w-3.5 text-gold animate-twinkle" />
        </div>
      </div>
    </motion.section>
  )
}
