'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api'

// Simple data fetch hook with refetch + retry capability
export function useFetch<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const retryCount = useRef(0)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const d = await fetcher()
      setData(d)
      retryCount.current = 0
    } catch (e: any) {
      const msg = e?.message || 'Gagal memuatkan data'
      console.error('[useFetch] Error:', msg)
      // Auto-retry for network errors (Failed to fetch)
      if (msg.includes('Failed to fetch') && retryCount.current < 3) {
        retryCount.current++
        console.log(`[useFetch] Auto-retry ${retryCount.current}/3 in ${retryCount.current * 1000}ms...`)
        setTimeout(() => refetch(), retryCount.current * 1000)
        return
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    retryCount.current = 0
    refetch()
  }, [refetch])

  return { data, loading, error, refetch, setData }
}

export const useEvent = () => useFetch(api.event, [])
export const useSchedule = () => useFetch(api.schedule, [])
export const useActivities = () => useFetch(api.activities, [])
export const useAnnouncements = () => useFetch(api.announcements, [])
export const useGallery = () => useFetch(api.gallery, [])
export const useUcapan = () => useFetch(api.ucapan, [])
export const useBooths = () => useFetch(api.booths, [])
export const useMap = () => useFetch(api.map, [])
export const useJourney = () => useFetch(api.journey, [])
export const useSettings = () => useFetch(api.settings, [])
export const useStatus = () => useFetch(api.status, [])
export const useLive = () => useFetch(api.live, [])
export const useSeating = () => useFetch(api.seating, [])
