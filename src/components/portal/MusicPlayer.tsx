'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Play, Pause, Volume2, VolumeX, X, Heart } from 'lucide-react'

const AUDIO_SRC = '/audio/hijjaz-terima-kasih.mp3'
const TRACK_NAME = 'Hijjaz — Terima Kasih Segalanya'

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const playedRef = useRef(false) // track if music has ever started
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.6)
  const [showControls, setShowControls] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  const startMusic = useCallback(async () => {
    if (playedRef.current) return
    const audio = audioRef.current
    if (!audio) return
    try {
      audio.volume = volume
      await audio.play()
      playedRef.current = true
      setPlaying(true)
      setShowWelcome(false)
    } catch {
      // Still blocked — ignore
    }
  }, [volume])

  // Attempt autoplay + set up first-interaction listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume

    // Strategy 1: Try autoplay on load
    const tryAutoplay = async () => {
      try {
        await audio.play()
        playedRef.current = true
        setPlaying(true)
      } catch {
        // Autoplay blocked — show welcome prompt + set up interaction listeners
        setShowWelcome(true)
        // Strategy 2: Listen for FIRST user interaction anywhere on the page
        const events = ['click', 'touchstart', 'keydown', 'pointerdown']
        const onFirstInteraction = () => {
          startMusic()
          events.forEach((ev) => document.removeEventListener(ev, onFirstInteraction, true))
        }
        events.forEach((ev) => document.addEventListener(ev, onFirstInteraction, { capture: true, once: true }))
      }
    }
    const timer = setTimeout(tryAutoplay, 300)
    return () => clearTimeout(timer)
  }, [startMusic, volume])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (playing) {
        audio.pause()
        setPlaying(false)
      } else {
        await audio.play()
        playedRef.current = true
        setPlaying(true)
        setShowWelcome(false)
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

  const dismissWelcome = () => {
    setShowWelcome(false)
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" autoPlay />

      {/* Full-screen welcome prompt — click anywhere starts music */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-maroon-dark/80 backdrop-blur-md cursor-pointer"
            onClick={startMusic}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-strong rounded-3xl border-2 border-gold/50 p-8 sm:p-10 text-center max-w-md mx-4 relative"
              onClick={(e) => { e.stopPropagation(); startMusic() }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); dismissWelcome() }}
                className="absolute top-3 right-3 text-cream/40 hover:text-cream"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Animated music icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center justify-center mb-5"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gold/30 blur-xl animate-pulse-glow" />
                  <div className="relative rounded-full glass-gold p-4">
                    <Music className="h-8 w-8 text-gold" />
                  </div>
                </div>
              </motion.div>

              <h3 className="font-display text-2xl font-bold text-gold-shimmer mb-2">
                Selamat Datang ke Karnival 40 Tahun
              </h3>
              <p className="font-serif text-sm italic text-cream/70 mb-5">
                Nikmati lagu tema sambutan kami
              </p>

              <div className="text-xs text-cream/50 mb-4">
                🎵 {TRACK_NAME}
              </div>

              {/* Big play button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); startMusic() }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-light text-maroon-dark px-8 py-3 font-semibold hover:opacity-90 shadow-lg"
              >
                <Play className="h-5 w-5 fill-maroon-dark" />
                Mainkan Muzik
              </motion.button>

              <p className="text-[10px] text-cream/40 mt-4">
                Klik mana-mana untuk mula
              </p>

              {/* Decorative heart */}
              <div className="mt-5 flex items-center justify-center gap-2 text-gold/40">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/30" />
                <Heart className="h-3 w-3 fill-gold/30" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/30" />
              </div>
            </motion.div>
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
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  className="w-0.5 bg-gold rounded-full"
                />
              ))}
            </div>
          ) : (
            <Music className="h-5 w-5 text-gold" />
          )}
        </motion.button>

        {/* Quick play/pause toggle when controls open */}
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
