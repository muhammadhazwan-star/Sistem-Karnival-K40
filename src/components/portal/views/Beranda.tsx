'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Camera,
  Compass,
  ArrowRight,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { usePortal } from '@/lib/store'
import { useEvent, useStatus, useAnnouncements, useSchedule, useActivities } from '@/hooks/use-data'
import { getCountdown, fmtTime, fmtTimeShort } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { useSocket } from '@/hooks/use-socket'
import { K40Logo } from '../K40Logo'
import { LiveWall } from '../LiveWall'

export function Beranda() {
  const { setView, setUploadOpen } = usePortal()
  const { data: event } = useEvent()
  const { data: statusData } = useStatus()
  const { data: announcements, refetch: refetchAnn } = useAnnouncements()
  const { data: schedule } = useSchedule()
  const { data: activities } = useActivities()
  const { socket } = useSocket()
  const [countdown, setCountdown] = useState(getCountdown(event?.date ?? '2026-08-23T18:30:00+08:00'))

  useEffect(() => {
    if (!event?.date) return
    const t = setInterval(() => setCountdown(getCountdown(event.date)), 1000)
    return () => clearInterval(t)
  }, [event?.date])

  useEffect(() => {
    if (!socket) return
    const onUpdate = () => refetchAnn()
    socket.on('announcement:new', onUpdate)
    socket.on('announcement:update', onUpdate)
    return () => {
      socket.off('announcement:new', onUpdate)
      socket.off('announcement:update', onUpdate)
    }
  }, [socket, refetchAnn])

  const status = statusData?.status ?? 'before'

  // Now happening logic — use first live activity or current schedule item
  const now = new Date()
  const liveActivity = activities?.find((a) => {
    const start = new Date(a.startTime)
    const end = a.endTime ? new Date(a.endTime) : null
    return start <= now && (!end || end > now)
  })
  const upcomingActivity = activities?.find((a) => new Date(a.startTime) > now)
  const currentSchedule = schedule?.find((s) => {
    const start = new Date(s.time)
    const end = s.endTime ? new Date(s.endTime) : new Date(start.getTime() + 30 * 60000)
    return start <= now && end > now
  })
  const nextSchedule = schedule?.find((s) => new Date(s.time) > now)

  const latestAnn = announcements?.[0]

  return (
    <div>
      {/* HERO — Premium Islamic Gala Poster */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-gala.jpg"
            alt="Karnival 40 Tahun PPAAB"
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-maroon-dark/70 via-maroon-deep/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-maroon-dark/50 via-transparent to-maroon-dark/50" />
        </div>

        {/* Gold ribbon sweep */}
        <div className="absolute top-1/3 left-0 right-0 h-32 ribbon-sweep opacity-60" />

        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32 text-center">
          {/* Top badges */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
          >
            <div className="glass-gold inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="text-gold-light">Ulang Tahun ke-40</span>
            </div>
            {status === 'live' && (
              <div className="inline-flex items-center gap-2 rounded-full bg-red-600/90 px-4 py-1.5 text-xs font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-white live-dot" />
                LIVE TODAY
              </div>
            )}
            {status === 'before' && (
              <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-cream">
                <Clock className="h-3.5 w-3.5 text-gold" />
                23 Ogos 2026
              </div>
            )}
          </motion.div>

          {/* Logo / 40 emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-6 flex justify-center"
          >
            <K40Logo size="xl" showRing className="animate-float" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight"
          >
            <span className="text-gold-shimmer block">Karnival 40 Tahun</span>
            <span className="text-cream block text-2xl sm:text-3xl lg:text-4xl mt-1">
              Pusat Pendidikan Al-Amin Berhad
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-5 font-serif text-lg sm:text-2xl italic text-gold-light/90 max-w-2xl mx-auto"
          >
            “40 Tahun Membina Generasi, Menginspirasi Masa Depan.”
          </motion.p>

          {/* Event info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-cream/80"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold" />
              23 Ogos 2026
            </div>
            <div className="hidden sm:block w-px h-4 bg-gold/30" />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" />
              Dewan Majestic Elissa Garden, Gombak
            </div>
          </motion.div>

          {/* Countdown */}
          {status === 'before' && !countdown.done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-8"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-gold/70 mb-3">Karnival Bermula Dalam</div>
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                {[
                  { label: 'Hari', value: countdown.days },
                  { label: 'Jam', value: countdown.hours },
                  { label: 'Minit', value: countdown.minutes },
                  { label: 'Saat', value: countdown.seconds },
                ].map((u) => (
                  <div key={u.label} className="glass-gold rounded-2xl px-3 py-3 sm:px-5 sm:py-4 min-w-[64px] sm:min-w-[80px]">
                    <div className="font-display text-2xl sm:text-4xl font-bold text-gold-shimmer tabular-nums">
                      {u.value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-cream/60 mt-1">{u.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              onClick={() => setView('atur-cara')}
              className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold px-6"
            >
              <Compass className="h-4 w-4 mr-2" /> Explore Carnival
            </Button>
            <Button
              onClick={() => setUploadOpen(true)}
              variant="outline"
              className="border-gold/40 text-gold hover:bg-gold/10 hover:text-gold-light px-6"
            >
              <Camera className="h-4 w-4 mr-2" /> Share Your Moment 📸
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* What's Happening Now */}
        <section>
          <SectionHeader
            icon={Radio}
            title="What's Happening Now"
            subtitle="Status aktiviti terkini karnival"
          />
          <div className="grid gap-4 sm:grid-cols-2 mt-6">
            {/* Now Happening */}
            <div className="glass rounded-2xl p-5 border-l-4 border-l-emerald-400">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 live-dot" />
                <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">Now Happening</span>
              </div>
              {liveActivity || currentSchedule ? (
                <div>
                  <h3 className="font-display text-lg text-gold-light">
                    {(liveActivity || currentSchedule)?.name || (liveActivity || currentSchedule)?.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-cream/70">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {fmtTime((liveActivity || currentSchedule)?.startTime || (liveActivity || currentSchedule)?.time)}
                    </span>
                    {((liveActivity || currentSchedule) as any)?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {((liveActivity || currentSchedule) as any).location}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-cream/50">
                  Tiada aktiviti sedang berlangsung sekarang.
                </div>
              )}
            </div>
            {/* Up Next */}
            <div className="glass rounded-2xl p-5 border-l-4 border-l-gold">
              <div className="flex items-center gap-2 mb-3">
                <ChevronRight className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs uppercase tracking-wider text-gold font-semibold">Up Next</span>
              </div>
              {upcomingActivity || nextSchedule ? (
                <div>
                  <h3 className="font-display text-lg text-gold-light">
                    {(upcomingActivity || nextSchedule)?.name || (upcomingActivity || nextSchedule)?.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-cream/70">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {fmtTime((upcomingActivity || nextSchedule)?.startTime || (upcomingActivity || nextSchedule)?.time)}
                    </span>
                    {((upcomingActivity || nextSchedule) as any)?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {((upcomingActivity || nextSchedule) as any).location}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-cream/50">
                  Atur cara karnival telah tamat. Terima kasih!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Live Wall — real-time photo + text updates */}
        <LiveWall />

        {/* Latest Announcement */}
        {latestAnn && (
          <section>
            <SectionHeader
              icon={Radio}
              title="Pengumuman Terkini"
              subtitle="Maklumat terbaru daripada urusetia"
              action={() => setView('pengumuman')}
              actionLabel="Semua Pengumuman"
            />
            <div className="glass-gold rounded-2xl p-5 mt-6">
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-full bg-gold/20 p-2">
                  <Radio className="h-4 w-4 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {latestAnn.pinned && (
                      <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold text-gold uppercase">Pin</span>
                    )}
                    <h3 className="font-semibold text-cream text-sm">{latestAnn.title}</h3>
                  </div>
                  <p className="text-xs text-cream/70 leading-relaxed line-clamp-2">{latestAnn.content}</p>
                  <div className="mt-2 text-[10px] text-gold/60">— {latestAnn.author}</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Digital Experience with Al-Amin */}
        <section>
          <SectionHeader
            icon={Sparkles}
            title="Digital Experience with Al-Amin"
            subtitle="Pengalaman digital sepanjang Karnival 40 Tahun"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            {[
              { label: 'DISCOVER', desc: 'Terokai atur cara & aktiviti karnival', icon: Compass, color: 'from-amber-500/20 to-amber-700/10' },
              { label: 'PARTICIPATE', desc: 'Sertai pengalaman digital Al-Amin', icon: Radio, color: 'from-rose-500/20 to-rose-700/10' },
              { label: 'SHARE', desc: 'Kongsi momen ke Live Gallery', icon: Camera, color: 'from-emerald-500/20 to-emerald-700/10' },
              { label: 'REMEMBER', desc: 'Kenang 40 Tahun Al-Amin selamanya', icon: Sparkles, color: 'from-purple-500/20 to-purple-700/10' },
            ].map((p, i) => {
              const Icon = p.icon
              return (
                <motion.button
                  key={p.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setView(p.label === 'SHARE' ? 'galeri' : p.label === 'DISCOVER' ? 'atur-cara' : p.label === 'PARTICIPATE' ? 'galeri' : 'ucapan')}
                  className={`glass rounded-2xl p-4 sm:p-5 text-left bg-gradient-to-br ${p.color} hover:scale-[1.03] transition-transform`}
                >
                  <Icon className="h-6 w-6 text-gold mb-3" />
                  <div className="font-display text-sm sm:text-base font-bold text-gold-shimmer tracking-wide">{p.label}</div>
                  <div className="text-[11px] sm:text-xs text-cream/60 mt-1">{p.desc}</div>
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* Quick access cards */}
        <section className="grid sm:grid-cols-3 gap-4">
          <QuickCard
            title="Atur Cara Karnival"
            desc="Timeline majlis makan malam amal"
            icon={Calendar}
            onClick={() => setView('atur-cara')}
          />
          <QuickCard
            title="Live Gallery"
            desc="Lihat & kongsi gambar karnival"
            icon={Camera}
            onClick={() => setView('galeri')}
          />
          <QuickCard
            title="Ucapan 40 Tahun"
            desc="Tinggalkan ucapan & kenangan"
            icon={Sparkles}
            onClick={() => setView('ucapan')}
          />
        </section>
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle, action, actionLabel }: {
  icon: typeof Calendar
  title: string
  subtitle?: string
  action?: () => void
  actionLabel?: string
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl glass-gold p-2.5">
          <Icon className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-gold-shimmer">{title}</h2>
          {subtitle && <p className="text-xs text-cream/60 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && actionLabel && (
        <button
          onClick={action}
          className="hidden sm:flex items-center gap-1 text-xs text-gold hover:text-gold-light transition"
        >
          {actionLabel} <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function QuickCard({ title, desc, icon: Icon, onClick }: {
  title: string
  desc: string
  icon: typeof Calendar
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="glass rounded-2xl p-5 text-left hover:bg-gold/10 transition group"
    >
      <div className="flex items-center justify-between">
        <Icon className="h-6 w-6 text-gold" />
        <ArrowRight className="h-4 w-4 text-gold/40 group-hover:text-gold group-hover:translate-x-1 transition" />
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-cream">{title}</h3>
      <p className="text-xs text-cream/60 mt-1">{desc}</p>
    </button>
  )
}
