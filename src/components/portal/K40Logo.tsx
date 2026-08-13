'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showRing?: boolean
  rounded?: boolean
}

const SIZE_MAP = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-24 w-24',
  xl: 'h-32 w-32 sm:h-40 sm:w-40',
}

// Official K40 anniversary logo (white background)
export function K40Logo({ size = 'md', className, showRing = false, rounded = true }: LogoProps) {
  return (
    <div className={cn('relative inline-flex shrink-0', SIZE_MAP[size], className)}>
      {showRing && (
        <div
          className="absolute -inset-2 rounded-full border border-gold/30 animate-spin-slow"
          style={{ borderStyle: 'dashed' }}
        />
      )}
      <div
        className={cn(
          'relative h-full w-full overflow-hidden bg-white shadow-lg',
          rounded ? 'rounded-full' : 'rounded-xl',
          size === 'xl' && 'glow-gold'
        )}
      >
        <img
          src="/images/logo-k40.jpeg"
          alt="Logo Ulang Tahun ke-40 PPAAB"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  )
}
