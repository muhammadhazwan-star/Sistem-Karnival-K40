'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  CalendarClock,
  Compass,
  Megaphone,
  Images,
  MessageSquareHeart,
  MapPin,
  Store,
  Milestone,
  Shield,
  Menu,
  X,
  Share2,
} from 'lucide-react'
import { usePortal } from '@/lib/store'
import type { PortalView } from '@/lib/types'
import { cn } from '@/lib/utils'

const NAV_ITEMS: { id: PortalView; label: string; icon: typeof Home }[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'atur-cara', label: 'Atur Cara', icon: CalendarClock },
  { id: 'aktiviti', label: 'Aktiviti', icon: Compass },
  { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone },
  { id: 'galeri', label: 'Galeri', icon: Images },
  { id: 'ucapan', label: 'Ucapan', icon: MessageSquareHeart },
  { id: 'peta', label: 'Peta', icon: MapPin },
  { id: 'booth', label: 'Booth', icon: Store },
  { id: 'perjalanan', label: 'Perjalanan', icon: Milestone },
]

export function Navigation() {
  const { view, setView, setShareOpen, adminToken } = usePortal()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong border-b border-gold/20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <button
            onClick={() => setView('beranda')}
            className="flex items-center gap-3 group"
            aria-label="Beranda"
          >
            <div className="relative h-10 w-10 shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-deep animate-pulse-glow" />
              <div className="absolute inset-[2px] rounded-full bg-maroon-dark flex items-center justify-center">
                <span className="font-display font-bold text-gold text-sm leading-none">40</span>
              </div>
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="font-display text-sm font-semibold text-gold-shimmer tracking-wide">
                KARNIVAL 40 TAHUN
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-cream/60">
                Pusat Pendidikan Al-Amin
              </div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = view === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all',
                    active
                      ? 'text-maroon-dark'
                      : 'text-cream/70 hover:text-gold hover:bg-gold/10'
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-gold to-gold-light"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShareOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-medium text-gold hover:bg-gold/20 transition-all"
            >
              <Share2 className="h-3.5 w-3.5" />
              Kongsi
            </button>
            <button
              onClick={() => setView('admin')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all',
                view === 'admin'
                  ? 'bg-gold text-maroon-dark'
                  : 'border border-gold/30 text-gold hover:bg-gold/10'
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{adminToken ? 'Dashboard' : 'Admin'}</span>
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden glass-strong border-b border-gold/20"
          >
            <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-2 p-4 sm:grid-cols-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const active = view === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id)
                      setMobileOpen(false)
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all',
                      active
                        ? 'bg-gradient-to-r from-gold to-gold-light text-maroon-dark'
                        : 'border border-gold/20 text-cream/80 hover:bg-gold/10'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
              <button
                onClick={() => {
                  setShareOpen(true)
                  setMobileOpen(false)
                }}
                className="flex items-center gap-2 rounded-xl border border-gold/30 px-3 py-2.5 text-xs font-medium text-gold hover:bg-gold/10"
              >
                <Share2 className="h-4 w-4" />
                Kongsi
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
