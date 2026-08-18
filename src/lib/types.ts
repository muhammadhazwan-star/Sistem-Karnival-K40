// Shared types for Portal Digital Karnival 40 Tahun PPAAB

export type EventStatus = 'before' | 'live' | 'after'

export interface EventInfo {
  id: string
  name: string
  tagline: string
  date: string
  endDate: string
  location: string
  venue: string
  description: string
  coverImage: string | null
  logoText: string
  statusMode: string
}

export interface ScheduleItem {
  id: string
  time: string
  endTime: string | null
  title: string
  speaker: string | null
  category: string
  order: number
}

export interface Activity {
  id: string
  name: string
  category: string
  startTime: string
  endTime: string | null
  location: string
  description: string
  status: string
  featured: boolean
  order: number
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: string
  pinned: boolean
  published: boolean
  author: string
  createdAt: string
}

export interface GalleryPhoto {
  id: string
  contributorName: string
  imageUrl: string
  caption: string | null
  status: string
  highlight: boolean
  highlightCategory: string | null
  createdAt: string
}

export interface Ucapan {
  id: string
  authorName: string
  role: string
  content: string
  status: string
  createdAt: string
}

export interface Booth {
  id: string
  name: string
  category: string
  location: string
  description: string
  activities: string
  operatingHours: string
  order: number
}

export interface MapLocation {
  id: string
  name: string
  type: string
  description: string
  x: number
  y: number
  icon: string
  order: number
}

export interface JourneyItem {
  id: string
  year: string
  phase: string
  description: string
  milestone: string | null
  order: number
}

export interface Setting {
  id: string
  galleryMode: string
  ucapanMode: string
  portalUrl: string
}

export type PortalView =
  | 'beranda'
  | 'atur-cara'
  | 'pengumuman'
  | 'galeri'
  | 'ucapan'
  | 'buku-program'
  | 'tempat-duduk'
  | 'admin'

export const HIGHLIGHT_CATEGORIES = [
  'Best Moment',
  '40th Anniversary',
  'Family Moment',
  'Student Moment',
  'Teacher Moment',
  'Alumni Moment',
  'Community Moment',
] as const

export const ACTIVITY_CATEGORIES = [
  'Sukan',
  'Digital/Teknologi',
  'Keluarga',
  'Pameran',
  'Pentas',
] as const
