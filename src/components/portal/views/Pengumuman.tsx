'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Pin, Info, AlertTriangle, RefreshCw } from 'lucide-react'
import { useAnnouncements } from '@/hooks/use-data'
import { useSocket } from '@/hooks/use-socket'
import { timeAgo } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TYPE_STYLES: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-300', bg: 'bg-blue-500/15' },
  urgent: { icon: AlertTriangle, color: 'text-red-300', bg: 'bg-red-500/15' },
  update: { icon: RefreshCw, color: 'text-amber-300', bg: 'bg-amber-500/15' },
}

export function Pengumuman() {
  const { data: announcements, loading, refetch } = useAnnouncements()
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return
    const onUpdate = () => refetch()
    socket.on('announcement:new', onUpdate)
    socket.on('announcement:update', onUpdate)
    return () => {
      socket.off('announcement:new', onUpdate)
      socket.off('announcement:update', onUpdate)
    }
  }, [socket, refetch])

  const items = announcements ?? []
  const pinned = items.filter((a) => a.pinned)
  const others = items.filter((a) => !a.pinned)

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
          <Megaphone className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs text-gold-light">📢 Live Updates</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold-shimmer">
          Pengumuman LIVE
        </h1>
        <p className="mt-2 text-sm text-cream/60">Maklumat penting sepanjang karnival</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-maroon/30" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {[...pinned, ...others].map((a, i) => {
            const style = TYPE_STYLES[a.type] || TYPE_STYLES.info
            const Icon = style.icon
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'glass rounded-2xl p-5 flex gap-4',
                  a.pinned && 'glass-gold border-gold/40'
                )}
              >
                <div className={cn('shrink-0 rounded-xl p-2.5', style.bg)}>
                  <Icon className={cn('h-4 w-4', style.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {a.pinned && (
                      <span className="inline-flex items-center gap-1 rounded bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold text-gold uppercase">
                        <Pin className="h-2.5 w-2.5" /> Pin
                      </span>
                    )}
                    <span className={cn('text-[10px] font-bold uppercase tracking-wide', style.color)}>
                      {a.type}
                    </span>
                    <h3 className="font-semibold text-cream text-sm">{a.title}</h3>
                  </div>
                  <p className="text-sm text-cream/70 leading-relaxed">{a.content}</p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-gold/50">
                    <span>— {a.author}</span>
                    <span>·</span>
                    <span>{timeAgo(a.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16">
          <Megaphone className="h-12 w-12 text-gold/30 mx-auto mb-3" />
          <p className="text-cream/50 text-sm">Belum ada pengumuman. Sila semak semula nanti.</p>
        </div>
      )}

      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="text-gold/70 hover:text-gold"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Muat semula
        </Button>
      </div>
    </div>
  )
}
