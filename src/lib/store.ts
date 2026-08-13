import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PortalView } from './types'

interface PortalState {
  view: PortalView
  setView: (v: PortalView) => void
  adminToken: string | null
  adminName: string | null
  setAdmin: (token: string, name: string) => void
  logoutAdmin: () => void
  shareOpen: boolean
  setShareOpen: (b: boolean) => void
  uploadOpen: boolean
  setUploadOpen: (b: boolean) => void
}

export const usePortal = create<PortalState>()(
  persist(
    (set) => ({
      view: 'beranda',
      setView: (v) => {
        set({ view: v })
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      },
      adminToken: null,
      adminName: null,
      setAdmin: (token, name) => set({ adminToken: token, adminName: name }),
      logoutAdmin: () => set({ adminToken: null, adminName: null, view: 'beranda' }),
      shareOpen: false,
      setShareOpen: (b) => set({ shareOpen: b }),
      uploadOpen: false,
      setUploadOpen: (b) => set({ uploadOpen: b }),
    }),
    {
      name: 'ppaab-portal',
      partialize: (s) => ({ adminToken: s.adminToken, adminName: s.adminName }),
    }
  )
)
