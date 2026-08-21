'use client'

import { motion } from 'framer-motion'
import { Car, Clock, Calendar, Moon, Heart } from 'lucide-react'

const RATES = [
  { icon: Car, label: 'Jam Pertama', price: 'RM1.50' },
  { icon: Clock, label: 'Setiap Jam Berikutnya', price: 'RM1.00' },
  { icon: Calendar, label: 'Parkir Jangka Panjang (8 – 14 Jam)', price: 'RM5.00' },
  { icon: Moon, label: 'Parkir Semalaman (15 – 24 Jam)', price: 'RM10.00' },
]

export function ParkingRates() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-2xl border border-gold/30 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon-deep via-burgundy to-maroon-deep py-3 px-4 text-center border-b border-gold/20">
        <div className="flex items-center justify-center gap-2">
          <Car className="h-4 w-4 text-gold" />
          <h3 className="font-display text-base sm:text-lg font-bold text-gold-shimmer tracking-wide">
            KADAR PARKIR
          </h3>
          <Car className="h-4 w-4 text-gold" />
        </div>
      </div>

      {/* Rates list */}
      <div className="p-4 space-y-2.5">
        {RATES.map((rate, i) => {
          const Icon = rate.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between gap-3 rounded-xl bg-gold/5 hover:bg-gold/10 transition px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0 rounded-lg glass-gold p-1.5">
                  <Icon className="h-3.5 w-3.5 text-gold" />
                </div>
                <span className="text-xs sm:text-sm text-cream/80 truncate">{rate.label}</span>
              </div>
              <span className="font-display text-sm sm:text-base font-bold text-gold-light shrink-0">
                {rate.price}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Thank you message */}
      <div className="px-4 py-3 border-t border-gold/20 bg-maroon-dark/40 text-center">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-3 w-3 text-gold/50 fill-gold/30" />
          <p className="font-serif text-xs sm:text-sm italic text-gold-light/80 leading-relaxed">
            Terima kasih atas sokongan anda.
          </p>
          <Heart className="h-3 w-3 text-gold/50 fill-gold/30" />
        </div>
      </div>
    </motion.div>
  )
}
