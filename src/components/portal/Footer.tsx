'use client'

import { Heart, MapPin, Calendar } from 'lucide-react'
import { usePortal } from '@/lib/store'
import { K40Logo } from './K40Logo'

export function Footer() {
  const { setView } = usePortal()

  return (
    <footer className="mt-auto border-t border-gold/20 glass-strong">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <K40Logo size="sm" />
              <span className="font-display text-sm font-semibold text-gold-shimmer">
                Karnival 40 Tahun PPAAB
              </span>
            </div>
            <p className="text-xs text-cream/60 leading-relaxed">
              One QR. One Carnival Experience. Portal digital rasmi sempena ulang tahun ke-40
              Pusat Pendidikan Al-Amin Berhad.
            </p>
          </div>

          {/* Event info */}
          <div className="space-y-2 text-xs text-cream/70">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-3.5 w-3.5 text-gold shrink-0" />
              <span>23 Ogos 2026 · Majlis Makan Malam Amal</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 text-gold shrink-0" />
              <span>Dewan Majestic Elissa Garden, Terminal Bersepadu Gombak, Selangor</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold/70">Navigasi Pantas</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <button onClick={() => setView('atur-cara')} className="text-cream/70 hover:text-gold transition">
                Atur Cara
              </button>
              <button onClick={() => setView('galeri')} className="text-cream/70 hover:text-gold transition">
                Galeri
              </button>
              <button onClick={() => setView('ucapan')} className="text-cream/70 hover:text-gold transition">
                Ucapan
              </button>
              <button onClick={() => setView('perjalanan')} className="text-cream/70 hover:text-gold transition">
                Perjalanan 40 Tahun
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gold/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-cream/50">
          <div className="flex items-center gap-1.5">
            Dibangunkan dengan <Heart className="h-3 w-3 text-gold fill-gold" /> untuk komuniti Al-Amin
          </div>
          <div>© 1986–2026 Pusat Pendidikan Al-Amin Berhad · Hak Cipta Terpelihara</div>
        </div>
      </div>
    </footer>
  )
}
