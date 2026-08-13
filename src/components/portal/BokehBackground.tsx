'use client'

import { useMemo } from 'react'

// Festive decorative background: bokeh, sparkles, golden ribbons
export function BokehBackground() {
  const bokeh = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 30 + Math.random() * 90,
        d: Math.random() * 5,
      })),
    []
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* Radial gold glow top */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full opacity-40"
        style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.25), transparent 70%)' }}
      />
      {/* Bokeh circles */}
      {bokeh.map((b, i) => (
        <div
          key={i}
          className="bokeh animate-twinkle"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.s}px`,
            height: `${b.s}px`,
            animationDelay: `${b.d}s`,
          }}
        />
      ))}
      {/* Sparkle dots */}
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={`s${i}`}
          className="absolute animate-twinkle"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            animationDelay: `${(i % 5) * 0.8}s`,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4Z" fill="#e8c874" opacity="0.7" />
          </svg>
        </div>
      ))}
      {/* Subtle Islamic star pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0L37 23H60L41 37L48 60L30 45L12 60L19 37L0 23H23Z' fill='%23d4af37'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  )
}
