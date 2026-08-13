'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'

// Simple data fetch hook with refetch capability
export function useFetch<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const d = await fetcher()
      setData(d)
    } catch (e: any) {
      setError(e.message || 'Gagal memuatkan data')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
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
