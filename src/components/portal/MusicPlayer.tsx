'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Play, Pause, Volume2, VolumeX, X } from 'lucide-react'

const AUDIO_SRC = '/audio/hijjaz-terima-kasih.mp3'
const TRACK_NAME = 'Hijjaz — Terima Kasih Segalanya'

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.6)
  const [showControls, setShowControls] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Attempt autoplay on mount
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume

    // Try to autoplay (works in some browsers)
    const tryAutoplay = async () => {
      try {
        await audio.play()
        setPlaying(true)
      } catch {
        // Autoplay blocked by browser — show prompt to user
        setShowPrompt(true)
      }
    }
    // Small delay to ensure audio is loaded
    const timer = setTimeout(tryAutoplay, 500)
    return () => clearTimeout(timer)
  }, [])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (playing) {
        audio.pause()
        setPlaying(false)
      } else {
        await audio.play()
        setPlaying(true)
        setShowPrompt(false)
      }
    } catch {
      // ignore
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !muted
    setMuted(!muted)
  }

  const handleVolume = (v: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = v
    setVolume(v)
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    setDismissed(true)
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" />

      {/* Autoplay prompt — shown if browser blocks autoplay */}
      <AnimatePresence>
        {showPrompt && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] glass-strong rounded-2xl border border-gold/40 p-4 shadow-2xl max-w-sm w-[calc(100%-2rem)]"
          >
            <button
              onClick={dismissPrompt}
              className="absolute top-2 right-2 text-cream/40 hover:text-cream"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-full glass-gold p-2.5 animate-pulse-glow">
                <Music className="h-5 w-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gold-light">Muzik Karnival</p>
                <p className="text-[11px] text-cream/60">Mainkan lagu tema Karnival 40 Tahun</p>
              </div>
              <button
                onClick={togglePlay}
                className="shrink-0 rounded-full bg-gradient-to-r from-gold to-gold-light text-maroon-dark p-2.5 hover:opacity-90 transition"
                aria-label="Main muzik"
              >
                <Play className="h-4 w-4 fill-maroon-dark" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating music control — bottom right */}
      <div className="fixed bottom-4 right-4 z-[150]">
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="glass-strong rounded-2xl border border-gold/30 p-3 mb-2 w-48"
            >
              <div className="text-[10px] text-gold-light font-semibold truncate mb-2">
                🎵 {TRACK_NAME}
              </div>
              {/* Volume slider */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-cream/70 hover:text-gold shrink-0">
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => handleVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 accent-gold cursor-pointer"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main toggle button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowControls((v) => !v)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full glass-gold border border-gold/40 shadow-lg"
          aria-label={playing ? 'Jeda muzik' : 'Main muzik'}
        >
          {playing && (
            <span className="absolute inset-0 rounded-full border border-gold/40 animate-ping" />
          )}
          {playing ? (
            <div className="flex items-end gap-0.5 h-4">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 6, 10, 4] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className="w-0.5 bg-gold rounded-full"
                />
              ))}
            </div>
          ) : (
            <Music className="h-5 w-5 text-gold" />
          )}
        </motion.button>

        {/* Hidden play/pause toggle on double context — click main button to toggle controls,
            but also provide quick toggle */}
        {showControls && (
          <button
            onClick={togglePlay}
            className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold-light text-maroon-dark text-[10px] font-bold"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
        )}
      </div>
    </>
  )
}
