'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePortal } from '@/lib/store'
import { BokehBackground } from './BokehBackground'
import { Navigation } from './Navigation'
import { Footer } from './Footer'
import { ShareDialog } from './ShareDialog'
import { UploadDialog } from './UploadDialog'
import { MusicPlayer } from './MusicPlayer'
import { Beranda } from './views/Beranda'
import { AturCara } from './views/AturCara'
import { Pengumuman } from './views/Pengumuman'
import { Galeri } from './views/Galeri'
import { Ucapan } from './views/Ucapan'
import { BukuProgram } from './views/BukuProgram'
import { Admin } from './views/Admin'

const VIEWS = {
  beranda: Beranda,
  'atur-cara': AturCara,
  pengumuman: Pengumuman,
  galeri: Galeri,
  ucapan: Ucapan,
  'buku-program': BukuProgram,
  admin: Admin,
} as const

export function PortalApp() {
  const { view } = usePortal()
  const ViewComponent = VIEWS[view] ?? Beranda

  return (
    <div className="relative flex min-h-screen flex-col">
      <BokehBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <ViewComponent />
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      <ShareDialog />
      <UploadDialog />
      <MusicPlayer />
    </div>
  )
}
