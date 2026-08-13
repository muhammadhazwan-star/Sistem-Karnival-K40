'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Radio,
  Send,
  ImagePlus,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react'
import { useLive } from '@/hooks/use-data'
import { useSocket } from '@/hooks/use-socket'
import { api } from '@/lib/api'
import { timeAgo } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function LiveWall() {
  const { data: liveData, refetch, setData } = useLive()
  const { socket } = useSocket()
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [showComposer, setShowComposer] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const posts = liveData?.posts ?? []

  // Real-time: listen for new live posts
  useEffect(() => {
    if (!socket) return
    const onNew = (post: any) => {
      setData((prev) =>
        prev ? { posts: [post, ...prev.posts] } : { posts: [post] }
      )
      toast.success('Momen baharu dikongsi!', { duration: 2000 })
    }
    socket.on('live:new', onNew)
    return () => {
      socket.off('live:new', onNew)
    }
  }, [socket, setData])

  const handleFile = (f: File | null) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      toast.error('Sila pilih fail gambar sahaja')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('Saiz fail maksimum 10MB')
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  const submit = async () => {
    if (!name.trim()) {
      toast.error('Sila masukkan nama anda')
      return
    }
    if (!text.trim() && !file) {
      toast.error('Tulis sesuatu atau pilih gambar untuk dikongsi')
      return
    }
    setPosting(true)
    try {
      if (file) {
        const fd = new FormData()
        fd.append('authorName', name.trim())
        fd.append('content', text.trim())
        fd.append('image', file)
        await api.createLivePost(fd)
      } else {
        await api.createLiveText({ authorName: name.trim(), content: text.trim() })
      }
      toast.success('Momen anda telah dikongsi secara live!')
      setText('')
      setFile(null)
      setPreview(null)
      setShowComposer(false)
      refetch()
    } catch (e: any) {
      toast.error(e.message || 'Gagal menghantar')
    } finally {
      setPosting(false)
    }
  }

  const reset = () => {
    setText('')
    setFile(null)
    setPreview(null)
    setShowComposer(false)
  }

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl glass-gold p-2.5">
            <Radio className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-gold-shimmer flex items-center gap-2">
              Karnival Live
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 live-dot" /> LIVE
              </span>
            </h2>
            <p className="text-xs text-cream/60 mt-0.5">
              Kongsi gambar & ucapan anda — muncul serta-merta!
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowComposer((v) => !v)}
          className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 shrink-0"
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-1.5" /> Kongsi
        </Button>
      </div>

      {/* Composer */}
      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-strong rounded-2xl p-5 space-y-3 border border-gold/30">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama anda"
                className="bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30"
              />
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tulis ucapan, perasaan, atau penyampaian anda... (cth: Selamat hari jadi Al-Amin!)"
                rows={3}
                className="bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30 resize-none"
              />
              {/* Photo preview / picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-gold/30">
                  <img src={preview} alt="preview" className="w-full max-h-48 object-cover" />
                  <button
                    onClick={() => { setFile(null); setPreview(null) }}
                    className="absolute top-2 right-2 rounded-full bg-maroon-dark/80 p-1.5 text-cream hover:bg-maroon-dark"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/30 bg-gold/5 p-3 hover:bg-gold/10 transition text-sm text-cream/70"
                >
                  <ImagePlus className="h-4 w-4 text-gold" /> Tambah gambar (pilihan)
                </button>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={submit}
                  disabled={posting}
                  className="flex-1 bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
                >
                  {posting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menghantar...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> Hantar Live</>
                  )}
                </Button>
                <Button onClick={reset} variant="outline" className="border-gold/30 text-cream/70">
                  Batal
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Feed */}
      <div className="max-h-[600px] overflow-y-auto custom-scroll space-y-3 pr-1">
        {posts.length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl">
            <Radio className="h-10 w-10 text-gold/30 mx-auto mb-3" />
            <p className="text-cream/50 text-sm">Belum ada momen live. Jadilah yang pertama!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-gold to-gold-deep flex items-center justify-center text-maroon-dark font-bold text-sm">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gold-light">{post.authorName}</span>
                      <span className="text-[10px] text-cream/40">{timeAgo(post.createdAt)}</span>
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                        post.type === 'text' && 'bg-blue-500/20 text-blue-300',
                        post.type === 'photo' && 'bg-emerald-500/20 text-emerald-300',
                        post.type === 'both' && 'bg-gold/20 text-gold'
                      )}>
                        {post.type === 'text' ? 'Ucapan' : post.type === 'photo' ? 'Gambar' : 'Foto + Teks'}
                      </span>
                    </div>
                    {post.content && (
                      <p className="mt-1.5 text-sm text-cream/85 leading-relaxed">{post.content}</p>
                    )}
                    {post.imageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-gold/20">
                        <img
                          src={post.imageUrl}
                          alt="momen"
                          className="w-full max-h-72 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  )
}
