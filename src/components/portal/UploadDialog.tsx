'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Camera, Upload, Loader2, CheckCircle2, ImageIcon } from 'lucide-react'
import { usePortal } from '@/lib/store'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export function UploadDialog() {
  const { uploadOpen, setUploadOpen } = usePortal()
  const [name, setName] = useState('')
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setName('')
    setCaption('')
    setFile(null)
    setPreview(null)
    setDone(false)
  }

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
    if (!file) {
      toast.error('Sila pilih satu gambar')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('contributorName', name.trim())
      fd.append('caption', caption.trim())
      fd.append('image', file)
      const result = await api.uploadPhoto(fd)
      if (!result || result.error) {
        throw new Error(result?.error || 'Gagal memuat naik gambar')
      }
      setDone(true)
      toast.success('Momen anda telah dikongsi! ❤️')
    } catch (e: any) {
      toast.error(e.message || 'Gagal memuat naik gambar')
    } finally {
      setLoading(false)
    }
  }

  const close = (open: boolean) => {
    setUploadOpen(open)
    if (!open) setTimeout(reset, 300)
  }

  return (
    <Dialog open={uploadOpen} onOpenChange={close}>
      <DialogContent className="glass-strong border-gold/30 max-w-md">
        {done ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="relative">
              <CheckCircle2 className="h-16 w-16 text-gold animate-pulse-glow" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-gold-shimmer mb-2">Momen Dikongsi!</h3>
              <p className="text-sm text-cream/70 max-w-xs">
                Momen anda telah dikongsi! ❤️ — Terima kasih kerana menjadi sebahagian daripada
                Karnival 40 Tahun.
              </p>
            </div>
            <Button onClick={() => close(false)} className="bg-gold text-maroon-dark hover:bg-gold-light">
              Lihat Galeri
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-gold-shimmer flex items-center gap-2">
                <Camera className="h-5 w-5" /> Kongsi Momen Anda
              </DialogTitle>
              <DialogDescription className="text-cream/60">
                Karnival Kita, Momen Kita — kongsi gambar ke Live Gallery
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-cream/80 text-xs">Nama Anda</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Aisyah Rahman"
                  className="bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="caption" className="text-cream/80 text-xs">Keterangan (pilihan)</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ceritakan momen ini..."
                  rows={2}
                  className="bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-cream/80 text-xs">Gambar</Label>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden border border-gold/30">
                    <img src={preview} alt="preview" className="w-full h-48 object-cover" />
                    <button
                      onClick={() => { setFile(null); setPreview(null) }}
                      className="absolute top-2 right-2 rounded-full bg-maroon-dark/80 p-1.5 text-cream hover:bg-maroon-dark"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gold/30 bg-gold/5 p-6 hover:bg-gold/10 transition"
                  >
                    <Upload className="h-6 w-6 text-gold" />
                    <span className="text-xs text-cream/60">Klik untuk pilih gambar</span>
                    <span className="text-[10px] text-cream/40">JPG, PNG · maks 10MB</span>
                  </button>
                )}
              </div>
              <Button
                onClick={submit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memuat naik...</>
                ) : (
                  <><Camera className="h-4 w-4 mr-2" /> Kongsi Momen</>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
