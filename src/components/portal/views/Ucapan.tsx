'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquareHeart, Send, Quote, Loader2 } from 'lucide-react'
import { useUcapan } from '@/hooks/use-data'
import { api } from '@/lib/api'
import { timeAgo } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const ROLE_COLORS: Record<string, string> = {
  Alumni: 'from-purple-500/30 to-purple-700/10 text-purple-200',
  Guru: 'from-emerald-500/30 to-emerald-700/10 text-emerald-200',
  'Ibu Bapa': 'from-rose-500/30 to-rose-700/10 text-rose-200',
  Murid: 'from-amber-500/30 to-amber-700/10 text-amber-200',
  Komuniti: 'from-cyan-500/30 to-cyan-700/10 text-cyan-200',
}

export function Ucapan() {
  const { data: ucapanData, loading, refetch } = useUcapan()
  const [name, setName] = useState('')
  const [role, setRole] = useState('Komuniti')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const items = ucapanData?.items ?? []
  const mode = ucapanData?.mode ?? 'approval'

  const submit = async () => {
    if (!name.trim() || !content.trim()) {
      toast.error('Sila isi nama dan ucapan anda')
      return
    }
    setSubmitting(true)
    try {
      await api.submitUcapan({ authorName: name.trim(), role, content: content.trim() })
      toast.success(mode === 'auto' ? 'Ucapan anda telah dikongsi!' : 'Ucapan dihantar! Ia akan dipaparkan selepas diluluskan.')
      setName('')
      setContent('')
      refetch()
    } catch (e: any) {
      toast.error(e.message || 'Gagal menghantar ucapan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
          <MessageSquareHeart className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs text-gold-light">💬 Tinggalkan Ucapan</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold-shimmer">
          Ucapan 40 Tahun
        </h1>
        <p className="mt-2 text-sm text-cream/60">
          Ucapan & doa daripada komuniti Al-Amin sempena ulang tahun ke-40
        </p>
      </div>

      {/* Submit form */}
      <div className="glass rounded-2xl p-5 mb-8">
        <h3 className="font-display text-base font-semibold text-gold-light mb-4">Tinggalkan Ucapan Anda</h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div className="space-y-1.5">
            <Label className="text-cream/70 text-xs">Nama</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama anda"
              className="bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-cream/70 text-xs">Peranan</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-maroon-dark/40 border-gold/25 text-cream">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-gold/30">
                {['Alumni', 'Guru', 'Ibu Bapa', 'Murid', 'Komuniti'].map((r) => (
                  <SelectItem key={r} value={r} className="text-cream focus:bg-gold/20 focus:text-gold">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5 mb-3">
          <Label className="text-cream/70 text-xs">Ucapan</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contoh: Selamat ulang tahun ke-40 Pusat Pendidikan Al-Amin. Semoga terus melahirkan generasi yang hebat."
            rows={3}
            className="bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30 resize-none"
          />
        </div>
        <Button
          onClick={submit}
          disabled={submitting}
          className="w-full sm:w-auto bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menghantar...</>
          ) : (
            <><Send className="h-4 w-4 mr-2" /> Hantar Ucapan</>
          )}
        </Button>
        {mode === 'approval' && (
          <p className="mt-2 text-[10px] text-cream/40">Ucapan akan dipaparkan selepas diluluskan urusetia.</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-cream">
          Ucapan Komuniti
          <span className="ml-2 text-xs text-cream/50">({items.length})</span>
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-maroon/30" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl p-5 relative overflow-hidden"
            >
              <Quote className="absolute -top-2 -right-2 h-16 w-16 text-gold/5" />
              <div className="flex items-center gap-2 mb-3">
                <div className={cn('rounded-full bg-gradient-to-br px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', ROLE_COLORS[u.role] || ROLE_COLORS.Komuniti)}>
                  {u.role}
                </div>
              </div>
              <p className="text-sm text-cream/85 leading-relaxed italic font-serif">
                “{u.content}”
              </p>
              <div className="mt-3 pt-3 border-t border-gold/10 flex items-center justify-between">
                <span className="text-xs font-medium text-gold-light">— {u.authorName}</span>
                <span className="text-[10px] text-cream/40">{timeAgo(u.createdAt)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16">
          <MessageSquareHeart className="h-12 w-12 text-gold/30 mx-auto mb-3" />
          <p className="text-cream/50 text-sm">Belum ada ucapan. Jadilah yang pertama!</p>
        </div>
      )}
    </div>
  )
}
