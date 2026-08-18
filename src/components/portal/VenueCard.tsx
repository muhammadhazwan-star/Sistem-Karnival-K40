'use client'

import { motion } from 'framer-motion'
import { MapPin, ExternalLink, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'

const VENUE_LINK = 'https://share.google/X6d9e9gVy3eTFK6iU'

export function VenueCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      {/* Decorative glow */}
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-gold/15 via-transparent to-maroon/15 blur-lg" />

      <div className="relative glass-strong rounded-2xl overflow-hidden border border-gold/30">
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src="/images/elissa-garden.png"
            alt="Dewan Majestic Elissa Garden — venue Karnival 40 Tahun PPAAB"
            className="w-full h-48 sm:h-56 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/90 via-maroon-dark/20 to-transparent" />

          {/* Overlay label */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="rounded-full glass-gold px-2 py-0.5">
                <span className="text-[9px] uppercase tracking-wider text-gold-light font-bold">Venue</span>
              </div>
            </div>
            <h3 className="font-display text-lg font-bold text-gold-shimmer drop-shadow">
              Dewan Majestic Elissa Garden
            </h3>
            <p className="text-[11px] text-cream/80 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-gold" />
              Terminal Bersepadu Gombak, Selangor
            </p>
          </div>
        </div>

        {/* Action area */}
        <div className="p-4">
          <p className="text-xs text-cream/70 leading-relaxed mb-3">
            Majestic Hall, Elissa Garden, Level 6 — lokasi rasmi Majlis Makan Malam Amal
            Karnival 40 Tahun PPAAB pada 23 Ogos 2026.
          </p>
          <a href={VENUE_LINK} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold group/btn">
              <Navigation className="h-4 w-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
              Lokasi — Tekan Sini
              <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-70" />
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  )
}
