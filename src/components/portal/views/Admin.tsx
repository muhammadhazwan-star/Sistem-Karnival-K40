'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  ShieldCheck,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  Calendar,
  Clock,
  User,
  Star,
  Image as ImageIcon,
  MessageSquare,
  Settings as SettingsIcon,
  QrCode,
  Download,
  Megaphone,
  Check,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Pin,
  Sparkles,
  Camera,
  Printer,
  CheckCircle2,
  XCircle,
  Hourglass,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePortal } from '@/lib/store'
import { api } from '@/lib/api'
import {
  useEvent,
  useSchedule,
  useActivities,
  useSettings,
} from '@/hooks/use-data'
import { timeAgo, fmtTime } from '@/lib/format'
import { HIGHLIGHT_CATEGORIES, ACTIVITY_CATEGORIES } from '@/lib/types'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

// ============================================================================
// Helpers
// ============================================================================

/** Convert ISO date to yyyy-MM-ddTHH:mm for datetime-local inputs. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

/** Convert datetime-local string back to ISO. */
function fromLocalInput(value: string): string | null {
  if (!value) return null
  const d = new Date(value)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

const SCHEDULE_CATEGORIES = [
  'utama',
  'protokol',
  'ucapan',
  'persembahan',
  'istimewa',
  'anugerah',
] as const

const ACTIVITY_STATUS = ['upcoming', 'live', 'ended'] as const
const ANNOUNCEMENT_TYPES = ['info', 'urgent', 'update'] as const
const STATUS_MODES = ['auto', 'before', 'live', 'after'] as const

// ============================================================================
// Admin fetch hook (for endpoints that require token)
// ============================================================================

function useAdminFetch<T>(token: string, path: string, enabled = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.adminCall<T>(path, 'GET', undefined, token)
      setData(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuatkan data')
    } finally {
      setLoading(false)
    }
  }, [token, path, enabled])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch, setData }
}

// ============================================================================
// Reusable UI bits
// ============================================================================

function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string
  children: React.ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-cream/70 text-xs font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-cream/40">{hint}</p>}
    </div>
  )
}

function EmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  message: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-12">
      <Icon className="h-10 w-10 text-gold/30 mx-auto mb-3" />
      <p className="text-cream/50 text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

function LoadingRows({
  count = 4,
  height = 'h-16',
}: {
  count?: number
  height?: string
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn(height, 'rounded-xl bg-maroon/30')} />
      ))}
    </div>
  )
}

function StatCard({
  label,
  value,
  color = 'gold',
}: {
  label: string
  value: number | string
  color?: 'gold' | 'amber' | 'emerald' | 'red'
}) {
  const colorMap: Record<string, string> = {
    gold: 'text-gold-light',
    amber: 'text-amber-300',
    emerald: 'text-emerald-300',
    red: 'text-red-300',
  }
  return (
    <div className="glass rounded-xl p-3 sm:p-4 text-center">
      <div
        className={cn(
          'font-display text-2xl sm:text-3xl font-bold tabular-nums',
          colorMap[color],
        )}
      >
        {value}
      </div>
      <div className="text-[10px] text-cream/60 mt-0.5 uppercase tracking-wide">
        {label}
      </div>
    </div>
  )
}

function CrudDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onOpenChange: (b: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-gold/30 text-cream max-h-[90vh] overflow-y-auto custom-scroll sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-gold-shimmer">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-cream/60">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-3">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  message,
}: {
  open: boolean
  onOpenChange: (b: boolean) => void
  onConfirm: () => void
  loading?: boolean
  message?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-red-500/30 text-cream sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Sahkan Padam
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-cream/70">
          {message ||
            'Adakah anda pasti mahu memadam item ini? Tindakan ini tidak boleh diundur.'}
        </p>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-cream/70 hover:text-cream"
          >
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            Padam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Login Screen
// ============================================================================

function LoginScreen() {
  const { setAdmin } = usePortal()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('Sila isi username dan kata laluan')
      return
    }
    setLoading(true)
    try {
      const { token, name } = await api.login({
        username: username.trim(),
        password,
      })
      setAdmin(token, name)
      toast.success(`Selamat datang, ${name}!`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Log masuk gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Decorative header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-full glass-gold mb-4 relative"
          >
            <ShieldCheck className="h-9 w-9 text-gold" />
            <div className="absolute inset-0 rounded-full glow-gold opacity-50" />
          </motion.div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gold-shimmer">
            Dashboard Urusetia
          </h1>
          <p className="text-sm text-cream/60 mt-1.5">
            Portal Digital Karnival 40 Tahun PPAAB
          </p>
        </div>

        <form
          onSubmit={submit}
          className="glass-strong rounded-2xl p-6 border border-gold/25 space-y-4"
        >
          <Field label="Nama Pengguna">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/50" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                className="bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30 pl-9"
              />
            </div>
          </Field>

          <Field label="Kata Laluan">
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/50" />
              <Input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-maroon-dark/40 border-gold/25 text-cream placeholder:text-cream/30 pl-9 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/50 hover:text-gold"
                aria-label={showPass ? 'Sembunyi kata laluan' : 'Tunjuk kata laluan'}
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold h-11"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mengesahkan...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" /> Log Masuk Admin
              </>
            )}
          </Button>

          <div className="rounded-lg bg-gold/10 border border-gold/20 p-3 text-center">
            <p className="text-[10px] text-cream/60 uppercase tracking-wide mb-1">
              Akaun Demo
            </p>
            <div className="flex items-center justify-center gap-3 text-xs">
              <span className="text-gold-light font-mono">admin</span>
              <span className="text-cream/30">/</span>
              <span className="text-gold-light font-mono">karnival40</span>
            </div>
          </div>
        </form>

        <p className="text-center text-[10px] text-cream/40 mt-4">
          Akses terhad kepada urusetia rasmi sahaja.
        </p>
      </motion.div>
    </div>
  )
}

// ============================================================================
// Tab 1: Maklumat Event
// ============================================================================

function EventTab({ token }: { token: string }) {
  const { data: event, loading, refetch } = useEvent()
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (event) {
      setForm({
        name: event.name ?? '',
        tagline: event.tagline ?? '',
        date: toLocalInput(event.date),
        endDate: toLocalInput(event.endDate),
        location: event.location ?? '',
        venue: event.venue ?? '',
        description: event.description ?? '',
        logoText: event.logoText ?? '',
        statusMode: event.statusMode ?? 'auto',
      })
    }
  }, [event])

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    if (!String(form.name ?? '').trim()) {
      toast.error('Nama acara diperlukan')
      return
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        date: form.date ? fromLocalInput(form.date as string) : null,
        endDate: form.endDate
          ? fromLocalInput(form.endDate as string)
          : null,
      }
      await api.adminCall('/admin/event', 'PUT', body, token)
      toast.success('Maklumat acara disimpan')
      refetch()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !event) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-maroon/30" />
        <LoadingRows count={5} height="h-14" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-gold-shimmer flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gold" /> Maklumat Acara
        </h3>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nama Acara" className="sm:col-span-2">
            <Input
              value={String(form.name ?? '')}
              onChange={(e) => set('name', e.target.value)}
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
          <Field label="Tagline" className="sm:col-span-2">
            <Input
              value={String(form.tagline ?? '')}
              onChange={(e) => set('tagline', e.target.value)}
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
          <Field label="Tarikh & Masa Mula">
            <Input
              type="datetime-local"
              value={String(form.date ?? '')}
              onChange={(e) => set('date', e.target.value)}
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
          <Field label="Tarikh & Masa Tamat">
            <Input
              type="datetime-local"
              value={String(form.endDate ?? '')}
              onChange={(e) => set('endDate', e.target.value)}
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
          <Field label="Lokasi">
            <Input
              value={String(form.location ?? '')}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Gombak, Selangor"
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
          <Field label="Dewan / Venue">
            <Input
              value={String(form.venue ?? '')}
              onChange={(e) => set('venue', e.target.value)}
              placeholder="Dewan Majestic Elissa Garden"
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
          <Field label="Logo Text (Nombor)">
            <Input
              value={String(form.logoText ?? '')}
              onChange={(e) => set('logoText', e.target.value)}
              placeholder="40"
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
          <Field label="Status Mode" hint="auto = dikira mengikut tarikh">
            <Select
              value={String(form.statusMode ?? 'auto')}
              onValueChange={(v) => set('statusMode', v)}
            >
              <SelectTrigger className="bg-maroon-dark/40 border-gold/25 text-cream w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-gold/30">
                {STATUS_MODES.map((m) => (
                  <SelectItem
                    key={m}
                    value={m}
                    className="text-cream focus:bg-gold/20 focus:text-gold"
                  >
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Penerangan" className="sm:col-span-2">
            <Textarea
              value={String(form.description ?? '')}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="bg-maroon-dark/40 border-gold/25 text-cream resize-none"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gold/10">
          <Button
            variant="ghost"
            onClick={() => refetch()}
            className="text-cream/70 hover:text-cream"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Muat Semula
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Tab 2: Atur Cara (Schedule)
// ============================================================================

interface ScheduleItem {
  id: string
  time: string
  endTime: string | null
  title: string
  speaker: string | null
  category: string
  order: number
}

function ScheduleTab({ token }: { token: string }) {
  const { data: schedule, loading, refetch } = useSchedule()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ScheduleItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<Record<string, unknown>>({})

  const openCreate = () => {
    setEditing(null)
    setForm({
      time: '',
      endTime: '',
      title: '',
      speaker: '',
      category: 'utama',
      order: 0,
    })
    setDialogOpen(true)
  }

  const openEdit = (item: ScheduleItem) => {
    setEditing(item)
    setForm({
      time: toLocalInput(item.time),
      endTime: toLocalInput(item.endTime),
      title: item.title,
      speaker: item.speaker ?? '',
      category: item.category,
      order: item.order ?? 0,
    })
    setDialogOpen(true)
  }

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.time || !String(form.title ?? '').trim()) {
      toast.error('Masa dan tajuk diperlukan')
      return
    }
    setSaving(true)
    try {
      const body = {
        time: fromLocalInput(form.time as string),
        endTime: form.endTime
          ? fromLocalInput(form.endTime as string)
          : null,
        title: String(form.title).trim(),
        speaker: String(form.speaker ?? '').trim() || null,
        category: String(form.category ?? 'utama'),
        order: Number(form.order) || 0,
      }
      if (editing) {
        await api.adminCall(
          '/admin/schedule',
          'PUT',
          { id: editing.id, ...body },
          token,
        )
        toast.success('Atur cara dikemas kini')
      } else {
        await api.adminCall('/admin/schedule', 'POST', body, token)
        toast.success('Atur cara baharu ditambah')
      }
      setDialogOpen(false)
      refetch()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.adminCall(
        `/admin/schedule?id=${deleteId}`,
        'DELETE',
        undefined,
        token,
      )
      toast.success('Item dipadam')
      setDeleteId(null)
      refetch()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal memadam')
    } finally {
      setDeleting(false)
    }
  }

  const items = (schedule ?? []) as ScheduleItem[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-display text-lg font-semibold text-gold-shimmer flex items-center gap-2">
          <Clock className="h-4 w-4 text-gold" /> Atur Cara Karnival
          <Badge
            variant="outline"
            className="border-gold/30 text-gold-light text-[10px]"
          >
            {items.length}
          </Badge>
        </h3>
        <Button
          onClick={openCreate}
          size="sm"
          className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
        >
          <Plus className="h-4 w-4 mr-1" /> Tambah Item
        </Button>
      </div>

      {loading ? (
        <LoadingRows count={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Clock}
          message="Belum ada atur cara."
          action={
            <Button
              onClick={openCreate}
              size="sm"
              className="bg-gold text-maroon-dark hover:bg-gold-light"
            >
              <Plus className="h-4 w-4 mr-1" /> Tambah Item Pertama
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4 flex items-center gap-3 flex-wrap sm:flex-nowrap"
            >
              <div className="shrink-0 w-20 text-center">
                <div className="font-display text-sm font-bold text-gold tabular-nums">
                  {fmtTime(item.time)}
                </div>
                {item.endTime && (
                  <div className="text-[10px] text-cream/50">
                    → {fmtTime(item.endTime)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-medium text-cream">
                    {item.title}
                  </h4>
                  <Badge
                    variant="outline"
                    className="border-gold/30 text-gold/70 text-[9px] capitalize"
                  >
                    {item.category}
                  </Badge>
                </div>
                {item.speaker && (
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-cream/60">
                    <User className="h-3 w-3" /> {item.speaker}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gold/70 hover:text-gold hover:bg-gold/10"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => setDeleteId(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Edit Atur Cara' : 'Tambah Atur Cara'}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-cream/70 hover:text-cream"
            >
              Batal
            </Button>
            <Button
              onClick={submit}
              disabled={saving}
              className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {editing ? 'Simpan' : 'Tambah'}
            </Button>
          </>
        }
      >
        <Field label="Masa Mula" hint="Tarikh dan masa">
          <Input
            type="datetime-local"
            value={String(form.time ?? '')}
            onChange={(e) => set('time', e.target.value)}
            className="bg-maroon-dark/40 border-gold/25 text-cream"
          />
        </Field>
        <Field label="Masa Tamat (pilihan)">
          <Input
            type="datetime-local"
            value={String(form.endTime ?? '')}
            onChange={(e) => set('endTime', e.target.value)}
            className="bg-maroon-dark/40 border-gold/25 text-cream"
          />
        </Field>
        <Field label="Tajuk">
          <Input
            value={String(form.title ?? '')}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Upacara Pembukaan Rasmi"
            className="bg-maroon-dark/40 border-gold/25 text-cream"
          />
        </Field>
        <Field label="Penceramah / Jurucakap (pilihan)">
          <Input
            value={String(form.speaker ?? '')}
            onChange={(e) => set('speaker', e.target.value)}
            placeholder="Tuan Pengerusi"
            className="bg-maroon-dark/40 border-gold/25 text-cream"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori">
            <Select
              value={String(form.category ?? 'utama')}
              onValueChange={(v) => set('category', v)}
            >
              <SelectTrigger className="bg-maroon-dark/40 border-gold/25 text-cream w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-gold/30">
                {SCHEDULE_CATEGORIES.map((c) => (
                  <SelectItem
                    key={c}
                    value={c}
                    className="text-cream focus:bg-gold/20 focus:text-gold capitalize"
                  >
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Susunan (order)">
            <Input
              type="number"
              value={Number(form.order ?? 0)}
              onChange={(e) => set('order', e.target.value)}
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(b) => !b && setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}

// ============================================================================
// Tab 3: Aktiviti
// ============================================================================

interface Activity {
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

const ACTIVITY_STATUS_STYLES: Record<string, string> = {
  upcoming: 'border-amber-400/40 text-amber-300',
  live: 'border-emerald-400/40 text-emerald-300',
  ended: 'border-cream/30 text-cream/60',
}

function ActivityTab({ token }: { token: string }) {
  const { data: activities, loading, refetch } = useActivities()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<Record<string, unknown>>({})

  const openCreate = () => {
    setEditing(null)
    setForm({
      name: '',
      category: ACTIVITY_CATEGORIES[0],
      startTime: '',
      endTime: '',
      location: '',
      description: '',
      status: 'upcoming',
      featured: false,
      order: 0,
    })
    setDialogOpen(true)
  }

  const openEdit = (item: Activity) => {
    setEditing(item)
    setForm({
      name: item.name,
      category: item.category,
      startTime: toLocalInput(item.startTime),
      endTime: toLocalInput(item.endTime),
      location: item.location,
      description: item.description,
      status: item.status,
      featured: item.featured,
      order: item.order ?? 0,
    })
    setDialogOpen(true)
  }

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!String(form.name ?? '').trim() || !form.startTime) {
      toast.error('Nama, kategori dan masa mula diperlukan')
      return
    }
    setSaving(true)
    try {
      const body = {
        name: String(form.name).trim(),
        category: String(form.category),
        startTime: fromLocalInput(form.startTime as string),
        endTime: form.endTime
          ? fromLocalInput(form.endTime as string)
          : null,
        location: String(form.location ?? '').trim(),
        description: String(form.description ?? '').trim(),
        status: String(form.status ?? 'upcoming'),
        featured: Boolean(form.featured),
        order: Number(form.order) || 0,
      }
      if (editing) {
        await api.adminCall(
          '/admin/activities',
          'PUT',
          { id: editing.id, ...body },
          token,
        )
        toast.success('Aktiviti dikemas kini')
      } else {
        await api.adminCall('/admin/activities', 'POST', body, token)
        toast.success('Aktiviti baharu ditambah')
      }
      setDialogOpen(false)
      refetch()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.adminCall(
        `/admin/activities?id=${deleteId}`,
        'DELETE',
        undefined,
        token,
      )
      toast.success('Aktiviti dipadam')
      setDeleteId(null)
      refetch()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal memadam')
    } finally {
      setDeleting(false)
    }
  }

  const items = (activities ?? []) as Activity[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-display text-lg font-semibold text-gold-shimmer flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" /> Aktiviti Karnival
          <Badge
            variant="outline"
            className="border-gold/30 text-gold-light text-[10px]"
          >
            {items.length}
          </Badge>
        </h3>
        <Button
          onClick={openCreate}
          size="sm"
          className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
        >
          <Plus className="h-4 w-4 mr-1" /> Tambah Aktiviti
        </Button>
      </div>

      {loading ? (
        <LoadingRows count={5} />
      ) : items.length === 0 ? (
        <EmptyState icon={Sparkles} message="Belum ada aktiviti." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {item.featured && (
                      <Star className="h-3.5 w-3.5 text-gold fill-gold shrink-0" />
                    )}
                    <h4 className="text-sm font-medium text-cream truncate">
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    <Badge
                      variant="outline"
                      className="border-gold/30 text-gold/70 capitalize"
                    >
                      {item.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        'capitalize',
                        ACTIVITY_STATUS_STYLES[item.status] ||
                          'border-cream/30 text-cream/60',
                      )}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-cream/60">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {fmtTime(item.startTime)}
                </span>
                {item.location && (
                  <span className="truncate">{item.location}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Edit Aktiviti' : 'Tambah Aktiviti'}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-cream/70 hover:text-cream"
            >
              Batal
            </Button>
            <Button
              onClick={submit}
              disabled={saving}
              className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {editing ? 'Simpan' : 'Tambah'}
            </Button>
          </>
        }
      >
        <Field label="Nama Aktiviti">
          <Input
            value={String(form.name ?? '')}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Pertandingan Robotik"
            className="bg-maroon-dark/40 border-gold/25 text-cream"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori">
            <Select
              value={String(form.category ?? ACTIVITY_CATEGORIES[0])}
              onValueChange={(v) => set('category', v)}
            >
              <SelectTrigger className="bg-maroon-dark/40 border-gold/25 text-cream w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-gold/30">
                {ACTIVITY_CATEGORIES.map((c) => (
                  <SelectItem
                    key={c}
                    value={c}
                    className="text-cream focus:bg-gold/20 focus:text-gold"
                  >
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={String(form.status ?? 'upcoming')}
              onValueChange={(v) => set('status', v)}
            >
              <SelectTrigger className="bg-maroon-dark/40 border-gold/25 text-cream w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-gold/30">
                {ACTIVITY_STATUS.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="text-cream focus:bg-gold/20 focus:text-gold capitalize"
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Masa Mula">
            <Input
              type="datetime-local"
              value={String(form.startTime ?? '')}
              onChange={(e) => set('startTime', e.target.value)}
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
          <Field label="Masa Tamat (pilihan)">
            <Input
              type="datetime-local"
              value={String(form.endTime ?? '')}
              onChange={(e) => set('endTime', e.target.value)}
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
        </div>
        <Field label="Lokasi">
          <Input
            value={String(form.location ?? '')}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Dewan Utama"
            className="bg-maroon-dark/40 border-gold/25 text-cream"
          />
        </Field>
        <Field label="Penerangan">
          <Textarea
            value={String(form.description ?? '')}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            className="bg-maroon-dark/40 border-gold/25 text-cream resize-none"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 items-end">
          <Field label="Susunan (order)">
            <Input
              type="number"
              value={Number(form.order ?? 0)}
              onChange={(e) => set('order', e.target.value)}
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
          <div className="flex items-center justify-between glass rounded-lg px-3 py-2.5 border border-gold/20">
            <Label className="text-cream/70 text-xs font-medium flex items-center gap-1.5">
              <Star className="h-3 w-3 text-gold" /> Featured
            </Label>
            <Switch
              checked={Boolean(form.featured)}
              onCheckedChange={(v) => set('featured', v)}
            />
          </div>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(b) => !b && setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}

// ============================================================================
// Tab 4: Pengumuman
// ============================================================================

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  pinned: boolean
  published: boolean
  author: string
  createdAt: string
}

const ANNOUNCEMENT_TYPE_STYLES: Record<string, string> = {
  info: 'border-blue-400/40 text-blue-300',
  urgent: 'border-red-400/40 text-red-300',
  update: 'border-amber-400/40 text-amber-300',
}

function AnnouncementTab({ token }: { token: string }) {
  const { data: announcements, loading, refetch } =
    useAdminFetch<Announcement[]>(token, '/admin/announcements')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<Record<string, unknown>>({})

  const openCreate = () => {
    setEditing(null)
    setForm({
      title: '',
      content: '',
      type: 'info',
      pinned: false,
      published: true,
      author: 'Urusetia Karnival',
    })
    setDialogOpen(true)
  }

  const openEdit = (item: Announcement) => {
    setEditing(item)
    setForm({
      title: item.title,
      content: item.content,
      type: item.type,
      pinned: item.pinned,
      published: item.published,
      author: item.author,
    })
    setDialogOpen(true)
  }

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!String(form.title ?? '').trim() || !String(form.content ?? '').trim()) {
      toast.error('Tajuk dan kandungan diperlukan')
      return
    }
    setSaving(true)
    try {
      const body = {
        title: String(form.title).trim(),
        content: String(form.content).trim(),
        type: String(form.type ?? 'info'),
        pinned: Boolean(form.pinned),
        published: Boolean(form.published),
        author: String(form.author ?? 'Urusetia Karnival').trim(),
      }
      if (editing) {
        await api.adminCall(
          '/admin/announcements',
          'PUT',
          { id: editing.id, ...body },
          token,
        )
        toast.success('Pengumuman dikemas kini')
      } else {
        await api.adminCall('/admin/announcements', 'POST', body, token)
        toast.success('Pengumuman baharu diterbitkan')
      }
      setDialogOpen(false)
      refetch()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.adminCall(
        `/admin/announcements?id=${deleteId}`,
        'DELETE',
        undefined,
        token,
      )
      toast.success('Pengumuman dipadam')
      setDeleteId(null)
      refetch()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal memadam')
    } finally {
      setDeleting(false)
    }
  }

  const items = (announcements ?? []) as Announcement[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-display text-lg font-semibold text-gold-shimmer flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-gold" /> Pengumuman
          <Badge
            variant="outline"
            className="border-gold/30 text-gold-light text-[10px]"
          >
            {items.length}
          </Badge>
        </h3>
        <Button
          onClick={openCreate}
          size="sm"
          className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
        >
          <Plus className="h-4 w-4 mr-1" /> Pengumuman Baru
        </Button>
      </div>

      {loading ? (
        <LoadingRows count={4} height="h-20" />
      ) : items.length === 0 ? (
        <EmptyState icon={Megaphone} message="Belum ada pengumuman." />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'glass rounded-xl p-4',
                item.pinned && 'glass-gold border-gold/40',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {item.pinned && (
                      <Badge className="bg-gold/20 text-gold border border-gold/40 text-[9px]">
                        <Pin className="h-2.5 w-2.5 mr-0.5" /> Pin
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        'capitalize',
                        ANNOUNCEMENT_TYPE_STYLES[item.type] ||
                          'border-cream/30 text-cream/60',
                      )}
                    >
                      {item.type}
                    </Badge>
                    {!item.published && (
                      <Badge
                        variant="outline"
                        className="border-cream/30 text-cream/50 text-[9px]"
                      >
                        <EyeOff className="h-2.5 w-2.5 mr-0.5" /> Draf
                      </Badge>
                    )}
                    <h4 className="text-sm font-medium text-cream">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-cream/70 leading-relaxed line-clamp-2">
                    {item.content}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-gold/50">
                    <span>— {item.author}</span>
                    <span>·</span>
                    <span>{timeAgo(item.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Edit Pengumuman' : 'Pengumuman Baru'}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-cream/70 hover:text-cream"
            >
              Batal
            </Button>
            <Button
              onClick={submit}
              disabled={saving}
              className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {editing ? 'Simpan' : 'Terbit'}
            </Button>
          </>
        }
      >
        <Field label="Tajuk">
          <Input
            value={String(form.title ?? '')}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Perubahan jadual upacara penutup"
            className="bg-maroon-dark/40 border-gold/25 text-cream"
          />
        </Field>
        <Field label="Kandungan">
          <Textarea
            value={String(form.content ?? '')}
            onChange={(e) => set('content', e.target.value)}
            rows={4}
            placeholder="Maklumat lanjut..."
            className="bg-maroon-dark/40 border-gold/25 text-cream resize-none"
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Jenis">
            <Select
              value={String(form.type ?? 'info')}
              onValueChange={(v) => set('type', v)}
            >
              <SelectTrigger className="bg-maroon-dark/40 border-gold/25 text-cream w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-gold/30">
                {ANNOUNCEMENT_TYPES.map((t) => (
                  <SelectItem
                    key={t}
                    value={t}
                    className="text-cream focus:bg-gold/20 focus:text-gold capitalize"
                  >
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Penulis">
            <Input
              value={String(form.author ?? '')}
              onChange={(e) => set('author', e.target.value)}
              className="bg-maroon-dark/40 border-gold/25 text-cream"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between glass rounded-lg px-3 py-2.5 border border-gold/20">
            <Label className="text-cream/70 text-xs font-medium flex items-center gap-1.5">
              <Pin className="h-3 w-3 text-gold" /> Pin
            </Label>
            <Switch
              checked={Boolean(form.pinned)}
              onCheckedChange={(v) => set('pinned', v)}
            />
          </div>
          <div className="flex items-center justify-between glass rounded-lg px-3 py-2.5 border border-gold/20">
            <Label className="text-cream/70 text-xs font-medium flex items-center gap-1.5">
              {form.published ? (
                <Eye className="h-3 w-3 text-emerald-400" />
              ) : (
                <EyeOff className="h-3 w-3 text-cream/50" />
              )}
              Diterbitkan
            </Label>
            <Switch
              checked={Boolean(form.published)}
              onCheckedChange={(v) => set('published', v)}
            />
          </div>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(b) => !b && setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}

// ============================================================================
// Tab 5: Moderation Gallery
// ============================================================================

interface GalleryPhoto {
  id: string
  contributorName: string
  imageUrl: string
  caption: string | null
  status: string
  highlight: boolean
  highlightCategory: string | null
  createdAt: string
}

function GalleryTab({ token }: { token: string }) {
  const { data: photos, loading, refetch } = useAdminFetch<GalleryPhoto[]>(
    token,
    '/admin/gallery',
  )
  const [acting, setActing] = useState<string | null>(null)

  const moderate = async (
    id: string,
    action: 'approve' | 'reject' | 'delete',
  ) => {
    setActing(id + action)
    try {
      await api.adminCall(
        '/admin/gallery/moderate',
        'POST',
        { id, action },
        token,
      )
      toast.success(
        action === 'approve'
          ? 'Foto diluluskan'
          : action === 'reject'
            ? 'Foto ditolak'
            : 'Foto dipadam',
      )
      refetch()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal')
    } finally {
      setActing(null)
    }
  }

  const setHighlight = async (
    id: string,
    highlight: boolean,
    highlightCategory?: string,
  ) => {
    try {
      await api.adminCall(
        '/admin/gallery/highlight',
        'PUT',
        highlightCategory
          ? { id, highlight, highlightCategory }
          : { id, highlight },
        token,
      )
      refetch()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal')
    }
  }

  const all = photos ?? []
  const pending = all.filter((p) => p.status === 'pending')
  const approved = all.filter((p) => p.status === 'approved')
  const highlighted = approved.filter((p) => p.highlight)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-display text-lg font-semibold text-gold-shimmer flex items-center gap-2">
          <Camera className="h-4 w-4 text-gold" /> Moderasi Galeri
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="text-gold/70 hover:text-gold"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Muat Semula
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Menunggu"
          value={pending.length}
          color={pending.length > 0 ? 'amber' : 'gold'}
        />
        <StatCard label="Diluluskan" value={approved.length} color="emerald" />
        <StatCard
          label="Highlight"
          value={highlighted.length}
          color="gold"
        />
      </div>

      {loading ? (
        <LoadingRows count={4} height="h-32" />
      ) : (
        <>
          {/* Pending */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-amber-300" />
              <h4 className="font-display text-sm font-semibold text-amber-200">
                Menunggu Kelulusan
              </h4>
              <Badge
                variant="outline"
                className="border-amber-400/40 text-amber-300 text-[10px]"
              >
                {pending.length}
              </Badge>
            </div>

            {pending.length === 0 ? (
              <div className="glass rounded-xl p-4 text-center text-xs text-cream/50">
                <CheckCircle2 className="h-6 w-6 text-emerald-400/50 mx-auto mb-1.5" />
                Tiada foto menunggu kelulusan.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pending.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl overflow-hidden border-amber-400/30"
                  >
                    <div className="aspect-video bg-maroon-dark/40 relative">
                      <img
                        src={p.imageUrl}
                        alt={p.caption || 'pending'}
                        className="h-full w-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-amber-500/90 text-maroon-dark text-[9px]">
                        <Hourglass className="h-2.5 w-2.5 mr-0.5" /> Pending
                      </Badge>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="text-xs font-medium text-cream truncate">
                        {p.contributorName}
                      </div>
                      {p.caption && (
                        <div className="text-[11px] text-cream/60 line-clamp-2">
                          {p.caption}
                        </div>
                      )}
                      <div className="text-[10px] text-cream/40">
                        {timeAgo(p.createdAt)}
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <Button
                          size="sm"
                          onClick={() => moderate(p.id, 'approve')}
                          disabled={acting === p.id + 'approve'}
                          className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          {acting === p.id + 'approve' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Lulus
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moderate(p.id, 'reject')}
                          disabled={acting === p.id + 'reject'}
                          className="flex-1 h-8 text-amber-300 hover:bg-amber-500/10 text-xs"
                        >
                          {acting === p.id + 'reject' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          Tolak
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moderate(p.id, 'delete')}
                          disabled={acting === p.id + 'delete'}
                          className="h-8 text-red-400 hover:bg-red-500/10 text-xs px-2"
                        >
                          {acting === p.id + 'delete' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Approved */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <h4 className="font-display text-sm font-semibold text-emerald-200">
                Foto Diluluskan
              </h4>
              <Badge
                variant="outline"
                className="border-emerald-400/40 text-emerald-300 text-[10px]"
              >
                {approved.length}
              </Badge>
            </div>

            {approved.length === 0 ? (
              <div className="glass rounded-xl p-4 text-center text-xs text-cream/50">
                Tiada foto diluluskan lagi.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {approved.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'glass rounded-xl overflow-hidden',
                      p.highlight && 'glass-gold border-gold/40',
                    )}
                  >
                    <div className="aspect-video bg-maroon-dark/40 relative">
                      <img
                        src={p.imageUrl}
                        alt={p.caption || 'photo'}
                        className="h-full w-full object-cover"
                      />
                      {p.highlight && (
                        <Badge className="absolute top-2 left-2 bg-gold/90 text-maroon-dark text-[9px]">
                          <Star className="h-2.5 w-2.5 mr-0.5 fill-maroon-dark" />
                          {p.highlightCategory || 'Highlight'}
                        </Badge>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="text-xs font-medium text-cream truncate">
                        {p.contributorName}
                      </div>
                      {p.caption && (
                        <div className="text-[11px] text-cream/60 line-clamp-1">
                          {p.caption}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gold/10">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={p.highlight}
                            onCheckedChange={(v) => setHighlight(p.id, v)}
                          />
                          <Label className="text-[10px] text-cream/70 flex items-center gap-1">
                            <Star className="h-2.5 w-2.5 text-gold" /> Highlight
                          </Label>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moderate(p.id, 'delete')}
                          disabled={acting === p.id + 'delete'}
                          className="h-7 text-red-400 hover:bg-red-500/10 text-xs px-2"
                        >
                          {acting === p.id + 'delete' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      {p.highlight && (
                        <Select
                          value={p.highlightCategory ?? ''}
                          onValueChange={(v) => setHighlight(p.id, true, v)}
                        >
                          <SelectTrigger className="bg-maroon-dark/40 border-gold/25 text-cream w-full h-8 text-xs">
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent className="glass-strong border-gold/30">
                            {HIGHLIGHT_CATEGORIES.map((c) => (
                              <SelectItem
                                key={c}
                                value={c}
                                className="text-cream focus:bg-gold/20 focus:text-gold text-xs"
                              >
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================================
// Tab 6: Moderation Ucapan
// ============================================================================

interface Ucapan {
  id: string
  authorName: string
  role: string
  content: string
  status: string
  createdAt: string
}

function UcapanTab({ token }: { token: string }) {
  const { data: items, loading, refetch } = useAdminFetch<Ucapan[]>(
    token,
    '/admin/ucapan',
  )
  const [acting, setActing] = useState<string | null>(null)

  const moderate = async (
    id: string,
    action: 'approve' | 'reject' | 'delete',
  ) => {
    setActing(id + action)
    try {
      await api.adminCall(
        '/admin/ucapan/moderate',
        'POST',
        { id, action },
        token,
      )
      toast.success(
        action === 'approve'
          ? 'Ucapan diluluskan'
          : action === 'reject'
            ? 'Ucapan ditolak'
            : 'Ucapan dipadam',
      )
      refetch()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal')
    } finally {
      setActing(null)
    }
  }

  const all = items ?? []
  const pending = all.filter((u) => u.status === 'pending')
  const approved = all.filter((u) => u.status === 'approved')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-display text-lg font-semibold text-gold-shimmer flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gold" /> Moderasi Ucapan
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="text-gold/70 hover:text-gold"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Muat Semula
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Menunggu"
          value={pending.length}
          color={pending.length > 0 ? 'amber' : 'gold'}
        />
        <StatCard label="Diluluskan" value={approved.length} color="emerald" />
      </div>

      {loading ? (
        <LoadingRows count={4} height="h-24" />
      ) : (
        <>
          {/* Pending */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-amber-300" />
              <h4 className="font-display text-sm font-semibold text-amber-200">
                Menunggu Kelulusan
              </h4>
              <Badge
                variant="outline"
                className="border-amber-400/40 text-amber-300 text-[10px]"
              >
                {pending.length}
              </Badge>
            </div>

            {pending.length === 0 ? (
              <div className="glass rounded-xl p-4 text-center text-xs text-cream/50">
                <CheckCircle2 className="h-6 w-6 text-emerald-400/50 mx-auto mb-1.5" />
                Tiada ucapan menunggu kelulusan.
              </div>
            ) : (
              <div className="space-y-2">
                {pending.map((u) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4 border-amber-400/30"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px]">
                            {u.role}
                          </Badge>
                          <span className="text-xs font-medium text-cream">
                            {u.authorName}
                          </span>
                          <span className="text-[10px] text-cream/40">
                            {timeAgo(u.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-cream/80 italic font-serif leading-relaxed line-clamp-3">
                          “{u.content}”
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-2 pt-2 border-t border-gold/10">
                      <Button
                        size="sm"
                        onClick={() => moderate(u.id, 'approve')}
                        disabled={acting === u.id + 'approve'}
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      >
                        {acting === u.id + 'approve' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        Lulus
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moderate(u.id, 'reject')}
                        disabled={acting === u.id + 'reject'}
                        className="h-8 text-amber-300 hover:bg-amber-500/10 text-xs"
                      >
                        {acting === u.id + 'reject' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        Tolak
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moderate(u.id, 'delete')}
                        disabled={acting === u.id + 'delete'}
                        className="h-8 text-red-400 hover:bg-red-500/10 text-xs ml-auto"
                      >
                        {acting === u.id + 'delete' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-1" />
                        )}
                        Padam
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Approved */}
          {approved.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <h4 className="font-display text-sm font-semibold text-emerald-200">
                  Ucapan Diluluskan
                </h4>
                <Badge
                  variant="outline"
                  className="border-emerald-400/40 text-emerald-300 text-[10px]"
                >
                  {approved.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {approved.map((u) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className="border-gold/30 text-gold/70 text-[9px]"
                          >
                            {u.role}
                          </Badge>
                          <span className="text-xs font-medium text-cream">
                            {u.authorName}
                          </span>
                          <span className="text-[10px] text-cream/40">
                            {timeAgo(u.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-cream/80 italic font-serif leading-relaxed line-clamp-2">
                          “{u.content}”
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moderate(u.id, 'delete')}
                        disabled={acting === u.id + 'delete'}
                        className="h-7 text-red-400 hover:bg-red-500/10 text-xs px-2 shrink-0"
                      >
                        {acting === u.id + 'delete' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ============================================================================
// Tab 7: Tetapan (Settings)
// ============================================================================

function SettingsTab({ token }: { token: string }) {
  const { data: settings, loading, refetch } = useSettings()
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setForm({
        galleryMode: settings.galleryMode ?? 'auto',
        ucapanMode: settings.ucapanMode ?? 'approval',
        portalUrl: settings.portalUrl ?? '',
      })
    }
  }, [settings])

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await api.adminCall('/admin/settings', 'PUT', form, token)
      toast.success('Tetapan disimpan')
      refetch()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-maroon/30" />
        <LoadingRows count={3} height="h-14" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-gold-shimmer flex items-center gap-2">
        <SettingsIcon className="h-4 w-4 text-gold" /> Tetapan Portal
      </h3>

      <div className="glass rounded-2xl p-5 space-y-4">
        <Field
          label="Mod Galeri"
          hint="auto = foto dipaparkan terus; approval = perlu kelulusan urusetia"
        >
          <Select
            value={String(form.galleryMode ?? 'auto')}
            onValueChange={(v) => set('galleryMode', v)}
          >
            <SelectTrigger className="bg-maroon-dark/40 border-gold/25 text-cream w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border-gold/30">
              <SelectItem
                value="auto"
                className="text-cream focus:bg-gold/20 focus:text-gold"
              >
                Auto (paparan terus)
              </SelectItem>
              <SelectItem
                value="approval"
                className="text-cream focus:bg-gold/20 focus:text-gold"
              >
                Approval (perlu kelulusan)
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Mod Ucapan"
          hint="auto = ucapan dipaparkan terus; approval = perlu kelulusan urusetia"
        >
          <Select
            value={String(form.ucapanMode ?? 'approval')}
            onValueChange={(v) => set('ucapanMode', v)}
          >
            <SelectTrigger className="bg-maroon-dark/40 border-gold/25 text-cream w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border-gold/30">
              <SelectItem
                value="auto"
                className="text-cream focus:bg-gold/20 focus:text-gold"
              >
                Auto (paparan terus)
              </SelectItem>
              <SelectItem
                value="approval"
                className="text-cream focus:bg-gold/20 focus:text-gold"
              >
                Approval (perlu kelulusan)
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="URL Portal"
          hint="URL rasmi portal — digunakan untuk menjana QR code"
        >
          <Input
            value={String(form.portalUrl ?? '')}
            onChange={(e) => set('portalUrl', e.target.value)}
            placeholder="https://karnival40.alaamin.edu.my"
            className="bg-maroon-dark/40 border-gold/25 text-cream"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2 border-t border-gold/10">
          <Button
            variant="ghost"
            onClick={() => refetch()}
            className="text-cream/70 hover:text-cream"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Muat Semula
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Simpan Tetapan
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Tab 8: QR Code
// ============================================================================

function QRTab({ token }: { token: string }) {
  const { data: settings } = useSettings()
  const [url, setUrl] = useState('')
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (settings?.portalUrl && !url) {
      setUrl(settings.portalUrl)
    }
  }, [settings, url])

  const generate = async () => {
    if (!url.trim()) {
      toast.error('Sila masukkan URL')
      return
    }
    setLoading(true)
    setDataUrl(null)
    try {
      const result = await api.adminCall<{ dataUrl: string }>(
        `/admin/qr?url=${encodeURIComponent(url.trim())}`,
        'GET',
        undefined,
        token,
      )
      setDataUrl(result.dataUrl)
      toast.success('QR code dijana')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal menjana QR')
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'portal-karnival-40-qr.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('QR code dimuat turun')
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-gold-shimmer flex items-center gap-2">
        <QrCode className="h-4 w-4 text-gold" /> Penjana QR Code
      </h3>

      <div className="glass rounded-2xl p-5 space-y-4">
        <Field
          label="URL untuk QR Code"
          hint="Lalai kepada URL portal daripada Tetapan"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://karnival40.alaamin.edu.my"
              className="bg-maroon-dark/40 border-gold/25 text-cream flex-1"
            />
            <Button
              onClick={generate}
              disabled={loading}
              className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4 mr-2" />
              )}
              Jana QR
            </Button>
          </div>
        </Field>

        {dataUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 pt-4 border-t border-gold/10"
          >
            <div className="glass-strong rounded-2xl p-4 border border-gold/30">
              <img
                src={dataUrl}
                alt="QR Code"
                className="h-48 w-48 sm:h-56 sm:w-56"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gold-light break-all max-w-xs">
                {url}
              </p>
              <p className="text-[10px] text-cream/40 mt-0.5">
                Imbas untuk akses portal Karnival 40 Tahun PPAAB
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                onClick={download}
                className="bg-gradient-to-r from-gold to-gold-light text-maroon-dark hover:opacity-90 font-semibold"
              >
                <Download className="h-4 w-4 mr-2" /> Muat Turun PNG
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.print()}
                className="text-cream/70 hover:text-cream border border-gold/20"
              >
                <Printer className="h-4 w-4 mr-2" /> Cetak
              </Button>
            </div>
            <p className="text-[10px] text-cream/40 text-center max-w-sm">
              Tip: Untuk cetakan berkualiti tinggi, gunakan butang Muat Turun
              dan cetak fail PNG tersebut pada saiz sekurang-kurangnya 5×5 cm.
            </p>
          </motion.div>
        )}

        {!dataUrl && !loading && (
          <div className="text-center py-10 border-t border-gold/10">
            <QrCode className="h-12 w-12 text-gold/30 mx-auto mb-3" />
            <p className="text-cream/50 text-sm">
              Masukkan URL dan klik &ldquo;Jana QR&rdquo; untuk menjana kod QR.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Dashboard shell + main Admin component
// ============================================================================

function Dashboard({
  token,
  name,
  onLogout,
}: {
  token: string
  name: string | null
  onLogout: () => void
}) {
  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-10">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-4 sm:p-5 mb-6 flex items-center justify-between gap-3 border border-gold/25"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="inline-flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full glass-gold shrink-0">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-gold" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-base sm:text-xl font-bold text-gold-shimmer truncate">
              Dashboard Urusetia
            </h1>
            <p className="text-[11px] sm:text-xs text-cream/60 truncate">
              Selamat datang,{' '}
              <span className="text-gold-light font-medium">
                {name || 'Admin'}
              </span>
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="text-red-300/80 hover:text-red-300 hover:bg-red-500/10 shrink-0"
          size="sm"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Log Keluar</span>
        </Button>
      </motion.div>

      <Tabs defaultValue="event" className="w-full">
        <TabsList className="bg-maroon-dark/40 border border-gold/20 p-1 h-auto flex w-full overflow-x-auto custom-scroll gap-1">
          <TabsTrigger
            value="event"
            className="text-cream/70 data-[state=active]:bg-gold data-[state=active]:text-maroon-dark data-[state=active]:font-semibold shrink-0 gap-1.5 px-3 py-2 text-xs"
          >
            <Calendar className="h-3.5 w-3.5" /> Event
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="text-cream/70 data-[state=active]:bg-gold data-[state=active]:text-maroon-dark data-[state=active]:font-semibold shrink-0 gap-1.5 px-3 py-2 text-xs"
          >
            <Clock className="h-3.5 w-3.5" /> Atur Cara
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="text-cream/70 data-[state=active]:bg-gold data-[state=active]:text-maroon-dark data-[state=active]:font-semibold shrink-0 gap-1.5 px-3 py-2 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" /> Aktiviti
          </TabsTrigger>
          <TabsTrigger
            value="announcements"
            className="text-cream/70 data-[state=active]:bg-gold data-[state=active]:text-maroon-dark data-[state=active]:font-semibold shrink-0 gap-1.5 px-3 py-2 text-xs"
          >
            <Megaphone className="h-3.5 w-3.5" /> Pengumuman
          </TabsTrigger>
          <TabsTrigger
            value="gallery"
            className="text-cream/70 data-[state=active]:bg-gold data-[state=active]:text-maroon-dark data-[state=active]:font-semibold shrink-0 gap-1.5 px-3 py-2 text-xs"
          >
            <Camera className="h-3.5 w-3.5" /> Galeri
          </TabsTrigger>
          <TabsTrigger
            value="ucapan"
            className="text-cream/70 data-[state=active]:bg-gold data-[state=active]:text-maroon-dark data-[state=active]:font-semibold shrink-0 gap-1.5 px-3 py-2 text-xs"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Ucapan
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-cream/70 data-[state=active]:bg-gold data-[state=active]:text-maroon-dark data-[state=active]:font-semibold shrink-0 gap-1.5 px-3 py-2 text-xs"
          >
            <SettingsIcon className="h-3.5 w-3.5" /> Tetapan
          </TabsTrigger>
          <TabsTrigger
            value="qr"
            className="text-cream/70 data-[state=active]:bg-gold data-[state=active]:text-maroon-dark data-[state=active]:font-semibold shrink-0 gap-1.5 px-3 py-2 text-xs"
          >
            <QrCode className="h-3.5 w-3.5" /> QR Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="event" className="mt-4 sm:mt-6">
          <EventTab token={token} />
        </TabsContent>
        <TabsContent value="schedule" className="mt-4 sm:mt-6">
          <ScheduleTab token={token} />
        </TabsContent>
        <TabsContent value="activities" className="mt-4 sm:mt-6">
          <ActivityTab token={token} />
        </TabsContent>
        <TabsContent value="announcements" className="mt-4 sm:mt-6">
          <AnnouncementTab token={token} />
        </TabsContent>
        <TabsContent value="gallery" className="mt-4 sm:mt-6">
          <GalleryTab token={token} />
        </TabsContent>
        <TabsContent value="ucapan" className="mt-4 sm:mt-6">
          <UcapanTab token={token} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4 sm:mt-6">
          <SettingsTab token={token} />
        </TabsContent>
        <TabsContent value="qr" className="mt-4 sm:mt-6">
          <QRTab token={token} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function Admin() {
  const { adminToken, adminName, logoutAdmin } = usePortal()

  if (!adminToken) return <LoginScreen />
  return (
    <Dashboard
      token={adminToken}
      name={adminName}
      onLogout={() => {
        logoutAdmin()
        toast.success('Anda telah log keluar')
      }}
    />
  )
}
