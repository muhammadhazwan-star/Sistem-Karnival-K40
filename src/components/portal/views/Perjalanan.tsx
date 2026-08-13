'use client'

import { motion } from 'framer-motion'
import { Milestone, Sparkles, ArrowRight } from 'lucide-react'
import { useJourney } from '@/hooks/use-data'
import { Skeleton } from '@/components/ui/skeleton'

export function Perjalanan() {
  const { data: journey, loading } = useJourney()
  const items = journey ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
          <Milestone className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs text-gold-light">Our Journey</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold-shimmer">
          40 Tahun Bersama Al-Amin
        </h1>
        <p className="mt-3 font-serif text-lg italic text-gold-light/80">1986 → 2026</p>
        <p className="mt-2 text-sm text-cream/60 max-w-xl mx-auto">
          Perjalanan empat dekad Pusat Pendidikan Al-Amin Berhad — dari permulaan hingga generasi baharu
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl bg-maroon/30" />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-gradient-to-b from-gold/50 via-gold/30 to-gold/50 hidden sm:block" />

          <div className="space-y-8 sm:space-y-2">
            {items.map((item, i) => {
              const isLeft = i % 2 === 0
              const isLast = i === items.length - 1
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5 }}
                  className={`relative sm:flex sm:items-center ${isLeft ? '' : 'sm:flex-row-reverse'}`}
                >
                  {/* Year node */}
                  <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 z-10">
                    <div className={`relative h-14 w-14 rounded-full flex items-center justify-center ${isLast ? 'bg-gradient-to-br from-gold to-gold-deep glow-gold animate-pulse-glow' : 'glass-gold'}`}>
                      <span className="font-display text-xs font-bold text-gold-shimmer">{item.year}</span>
                      {isLast && <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-gold animate-twinkle" />}
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`sm:w-[calc(50%-3rem)] ${isLeft ? 'sm:pr-8' : 'sm:pl-8'}`}>
                    <div className={`glass ${isLast ? 'glass-gold glow-gold-sm' : ''} rounded-2xl p-5 relative`}>
                      {/* Mobile year badge */}
                      <div className="sm:hidden flex items-center gap-2 mb-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isLast ? 'bg-gradient-to-br from-gold to-gold-deep' : 'glass-gold'}`}>
                          <span className="font-display text-[9px] font-bold text-gold-shimmer">{item.year.slice(2)}</span>
                        </div>
                        <span className="font-display text-lg font-bold text-gold-shimmer">{item.year}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-display text-xl sm:text-2xl font-bold text-gold-shimmer hidden sm:block">{item.year}</span>
                        <ArrowRight className="h-3 w-3 text-gold/50 hidden sm:block" />
                        <span className="text-xs uppercase tracking-[0.2em] text-gold-light font-semibold">{item.phase}</span>
                      </div>
                      <p className="text-sm text-cream/75 leading-relaxed">{item.description}</p>
                      {item.milestone && (
                        <div className="mt-3 pt-3 border-t border-gold/10 flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-gold" />
                          <span className="text-xs text-gold-light font-medium">{item.milestone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* End cap */}
          <div className="text-center mt-8">
            <div className="inline-flex flex-col items-center gap-2">
              <Sparkles className="h-8 w-8 text-gold animate-twinkle" />
              <p className="font-serif text-lg italic text-gold-light/90">Dan perjalanan ini berterusan...</p>
              <p className="text-xs text-cream/60">Al-Amin 3.0 — Era pendidikan Islam masa depan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
