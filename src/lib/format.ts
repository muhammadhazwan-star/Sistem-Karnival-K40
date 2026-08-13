'use client'

import { format } from 'date-fns'

// Format time for display (Malay context)
export function fmtTime(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const suffix = h >= 12 ? 'mlm' : 'ptg'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}.${m} ${suffix}`
}

export function fmtTimeShort(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${m}`
}

export function fmtDate(iso: string): string {
  return format(new Date(iso), 'dd MMMM yyyy')
}

export function fmtDateTime(iso: string): string {
  return `${fmtDate(iso)}, ${fmtTime(iso)}`
}

// Relative time "1 min ago" etc
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'baru saja'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min yang lalu`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} jam yang lalu`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} hari yang lalu`
  return fmtDate(iso)
}

// Countdown parts
export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

export function getCountdown(target: string | Date): Countdown {
  const targetMs = new Date(target).getTime()
  const now = Date.now()
  const diff = targetMs - now
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds, done: false }
}
