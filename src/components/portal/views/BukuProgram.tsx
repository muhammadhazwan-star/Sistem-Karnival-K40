'use client'

import { useState } from 'react'
import { BookOpen, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CANVA_URL = 'https://canva.link/giv0dxr90ux77v4'

export function BukuProgram() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
          <BookOpen className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs text-gold-light">Buku Program Rasmi</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold-shimmer">
          Buku Program
        </h1>
        <p className="mt-2 text-sm text-cream/60">
          Karnival 40 Tahun Pusat Pendidikan Al-Amin Berhad
        </p>
      </div>

      {/* Canva embed */}
      <div className="relative glass-strong rounded-2xl overflow-hidden border border-gold/30">
        {loading && !error && (
          <div className="flex flex-col items-center justify-center h-[600px] gap-3">
            <Loader2 className="h-8 w-8 text-gold animate-spin" />
            <p className="text-sm text-cream/60">Memuatkan buku program...</p>
          </div>
        )}
        {error ? (
          <div className="flex flex-col items-center justify-center h-[600px] gap-4 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-gold/60" />
            <div>
              <p className="text-sm text-cream/70 mb-2">
                Buku program tidak dapat dipaparkan dalam embedded view.
              </p>
              <p className="text-xs text-cream/50 mb-4">
                Anda boleh membukanya terus di Canva.
              </p>
            </div>
            <a href={CANVA_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90">
                <ExternalLink className="h-4 w-4 mr-2" /> Buka di Canva
              </Button>
            </a>
          </div>
        ) : (
          <iframe
            src={CANVA_URL}
            className="w-full"
            style={{ minHeight: '600px', border: 'none' }}
            allow="fullscreen"
            onLoad={() => setLoading(false)}
            onError={() => { setError(true); setLoading(false) }}
            title="Buku Program Karnival 40 Tahun PPAAB"
          />
        )}
      </div>

      {/* Fallback button */}
      <div className="mt-4 flex justify-center">
        <a href={CANVA_URL} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="border-gold/40 text-gold hover:bg-gold/10">
            <ExternalLink className="h-4 w-4 mr-2" /> Buka Buku Program di tab baharu
          </Button>
        </a>
      </div>
    </div>
  )
}
