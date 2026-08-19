'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Check, Facebook, Twitter, Send, MessageCircle, Link2 } from 'lucide-react'
import { usePortal } from '@/lib/store'
import { toast } from 'sonner'

export function ShareDialog() {
  const { shareOpen, setShareOpen } = usePortal()
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : 'https://karnival40.alaamin.edu.my'
  const text = 'Karnival 40 Tahun PPAAB — 23 Ogos 2026!'

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Pautan disalin!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Gagal menyalin pautan')
    }
  }

  const share = (platform: string) => {
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    }
    window.open(links[platform], '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
      <DialogContent className="glass-strong border-gold/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gold-shimmer">Kongsi Sambutan</DialogTitle>
          <DialogDescription className="text-cream/60">
            Ajak keluarga & rakan menyertai Karnival 40 Tahun Al-Amin
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3 py-2">
          {[
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-400' },
            { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-400' },
            { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-sky-400' },
            { id: 'telegram', label: 'Telegram', icon: Send, color: 'text-cyan-400' },
          ].map((p) => {
            const Icon = p.icon
            return (
              <button
                key={p.id}
                onClick={() => share(p.id)}
                className="flex flex-col items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 p-3 hover:bg-gold/15 transition"
              >
                <Icon className={`h-5 w-5 ${p.color}`} />
                <span className="text-[10px] text-cream/70">{p.label}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-maroon-dark/40 p-3">
          <Link2 className="h-4 w-4 text-gold shrink-0" />
          <input
            readOnly
            value={url}
            className="flex-1 bg-transparent text-xs text-cream/70 outline-none"
          />
          <Button size="sm" onClick={copyLink} className="bg-gold text-maroon-dark hover:bg-gold-light shrink-0">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Disalin' : 'Salin'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
