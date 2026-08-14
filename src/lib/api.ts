// API client utilities for Portal Digital Karnival

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || res.statusText)
  }
  return res.json()
}

export const api = {
  // Public reads
  event: () => request<any>('/event'),
  schedule: () => request<any[]>('/schedule'),
  activities: () => request<any[]>('/activities'),
  announcements: () => request<any[]>('/announcements'),
  gallery: () => request<{ photos: any[]; count: number; mode: string }>('/gallery'),
  ucapan: () => request<{ items: any[]; mode: string }>('/ucapan'),
  booths: () => request<any[]>('/booths'),
  map: () => request<any[]>('/map'),
  journey: () => request<any[]>('/journey'),
  settings: () => request<any>('/settings'),
  status: () => request<{ status: string; event: any }>('/status'),
  live: () => request<{ posts: any[] }>('/live'),

  // Public submissions
  uploadPhoto: async (data: FormData) => {
    const res = await fetch(`${BASE}/gallery`, { method: 'POST', body: data })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Gagal memuat naik gambar')
    return json
  },
  submitUcapan: (data: { authorName: string; role: string; content: string }) =>
    request<any>('/ucapan', { method: 'POST', body: JSON.stringify(data) }),
  createLivePost: async (data: FormData) => {
    const res = await fetch(`${BASE}/live`, { method: 'POST', body: data })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Gagal menghantar momen')
    return json
  },
  createLiveText: (data: { authorName: string; content: string }) =>
    request<any>('/live', { method: 'POST', body: JSON.stringify(data) }),

  // Admin auth
  login: (data: { username: string; password: string }) =>
    request<{ token: string; name: string }>('/admin/login', { method: 'POST', body: JSON.stringify(data) }),

  // Admin mutations (token passed as query for simplicity in this portal)
  adminCall: (path: string, method: string, body?: any, token?: string | null) =>
    request<any>(path, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: token ? { 'x-admin-token': token } : {},
    }),
}
