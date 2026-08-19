'use client'

import { Heart, MapPin, Calendar, Facebook, Instagram, AtSign } from 'lucide-react'
import { usePortal } from '@/lib/store'
import { K40Logo } from './K40Logo'

export function Footer() {
  const { setView } = usePortal()

  return (
    <footer className="mt-auto border-t border-gold/20 glass-strong">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6">
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
          {/* Brand + official logos */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <K40Logo size="sm" />
              <span className="font-display text-sm font-semibold text-gold-shimmer">
                Karnival 40 Tahun PPAAB
              </span>
            </div>
            <p className="text-xs text-cream/60 leading-relaxed">
              Portal digital rasmi sempena ulang tahun ke-40
              Pusat Pendidikan Al-Amin Berhad.
            </p>
            {/* Official institutional logos */}
            <div className="flex items-center gap-2 sm:gap-3 pt-1">
              <img
                src="/images/logo-sekolah.jpeg"
                alt="Logo Sekolah Rendah Islam Al-Amin"
                title="Sekolah Rendah Islam Al-Amin"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white object-contain p-0.5"
              />
              <img
                src="/images/logo-edu-oasis.png"
                alt="Logo Edu Oasis Al-Amin Sdn Bhd"
                title="Edu Oasis Al-Amin Sdn Bhd"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-full bg-white p-1"
              />
              <div className="h-7 w-px bg-gold/20" />
              <K40Logo size="sm" />
            </div>
          </div>

          {/* Event info */}
          <div className="space-y-2 text-xs text-cream/70">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold/70 mb-2">Maklumat Acara</div>
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-3.5 w-3.5 text-gold shrink-0" />
              <span>23 Ogos 2026 (Ahad) · Majlis Makan Malam Amal</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 text-gold shrink-0" />
              <span>Dewan Majestic Elissa Garden, Terminal Bersepadu Gombak, Selangor</span>
            </div>
            {/* Social media handle */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-cream/70 hover:text-gold transition"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-cream/70 hover:text-gold transition"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-cream/70 hover:text-gold transition"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
              </a>
              <span className="flex items-center gap-1 text-gold-light font-medium">
                <AtSign className="h-3.5 w-3.5" />
                karnival40tahunppaab
              </span>
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
              <button onClick={() => setView('tempat-duduk')} className="text-cream/70 hover:text-gold transition">
                Tempat Duduk
              </button>
              <button onClick={() => setView('buku-program')} className="text-cream/70 hover:text-gold transition">
                Buku Program
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
