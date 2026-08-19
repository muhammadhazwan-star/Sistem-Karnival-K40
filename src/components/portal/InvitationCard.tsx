'use client'

import { motion } from 'framer-motion'
import { Mail, Heart, MapPin, Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePortal } from '@/lib/store'

const VENUE_LINK = 'https://share.google/X6d9e9gVy3eTFK6iU'

export function InvitationCard() {
  const { setView } = usePortal()

  return (
    <section className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-2xl"
      >
        {/* Decorative glow */}
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-gold/15 via-transparent to-maroon/20 blur-xl" />

        {/* Card */}
        <div className="relative glass-strong rounded-3xl border-2 border-gold/40 overflow-hidden">
          {/* Top ornament band */}
          <div className="relative h-2 bg-gradient-to-r from-gold-deep via-gold-light to-gold-deep" />
          <div className="relative px-2 py-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
            </div>
          </div>

          {/* Card content */}
          <div className="px-5 sm:px-10 py-5 sm:py-8 text-center">
            {/* Envelope icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center justify-center mb-5"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gold/20 blur-md animate-pulse-glow" />
                <div className="relative rounded-full glass-gold p-3">
                  <Mail className="h-6 w-6 text-gold" />
                </div>
              </div>
            </motion.div>

            {/* Invitation text */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-serif text-base sm:text-lg italic text-cream/80 leading-relaxed"
            >
              Dengan penuh hormat dan sukacitanya,
            </motion.p>

            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="font-display text-xl sm:text-2xl font-bold text-gold-shimmer mt-2"
            >
              Pusat Pendidikan Al-Amin Berhad
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="font-serif text-base sm:text-lg italic text-cream/80 leading-relaxed mt-3"
            >
              menjemput dan mempersilakan
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="my-4"
            >
              <div className="font-display text-base sm:text-lg font-semibold text-cream tracking-wide leading-relaxed">
                Tan Sri/Puan Sri/Dato&apos;/Datin/<br />
                Tuan/Puan/Encik/Cik
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="font-serif text-base sm:text-lg italic text-cream/80 leading-relaxed"
            >
              hadir memeriahkan
            </motion.p>

            <motion.h4
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="font-display text-2xl sm:text-3xl font-bold text-gold-gradient mt-3 mb-4"
            >
              Majlis Makan Malam Amal Karnival 40 Tahun kami,
            </motion.h4>

            {/* Time badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="inline-flex items-center gap-2 rounded-full glass-gold px-5 py-2 mb-2"
            >
              <Clock className="h-4 w-4 text-gold" />
              <span className="font-display text-sm sm:text-base font-semibold text-gold-light">
                6.30 petang — 11.00 malam
              </span>
            </motion.div>

            {/* Date */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.85 }}
              className="mt-4 pt-4 border-t border-gold/20"
            >
              <div className="font-display text-lg font-bold text-cream">
                23 Ogos 2026
              </div>
              <div className="text-xs text-cream/60 mt-0.5">Ahad</div>
            </motion.div>

            {/* Venue with interactive button */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
              className="mt-5 space-y-3"
            >
              <div className="flex items-center justify-center gap-2 text-sm text-cream/75">
                <MapPin className="h-4 w-4 text-gold shrink-0" />
                <span>Dewan Majestic Elissa Garden, Terminal Bersepadu Gombak, Selangor</span>
              </div>
              <a href={VENUE_LINK} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold">
                  <MapPin className="h-4 w-4 mr-2" /> Lihat Lokasi Venue
                </Button>
              </a>
            </motion.div>

            {/* Closing */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
              className="mt-5 flex items-center justify-center gap-2 text-gold/60"
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/40" />
              <Heart className="h-3.5 w-3.5 fill-gold/40 text-gold/60" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/40" />
            </motion.div>
          </div>

          {/* Bottom ornament band */}
          <div className="px-2 py-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
            </div>
          </div>
          <div className="h-2 bg-gradient-to-r from-gold-deep via-gold-light to-gold-deep" />
        </div>
      </motion.div>
    </section>
  )
}
