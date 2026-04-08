'use client'
// components/resume/ScoreRing.tsx
import { useEffect, useState } from 'react'
import { getScoreColor, getScoreLabel } from '@/lib/utils'

export function ScoreRing({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference
  const color = getScoreColor(score)

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0
      const step = score / 60
      const interval = setInterval(() => {
        current = Math.min(current + step, score)
        setDisplayed(Math.round(current))
        if (current >= score) clearInterval(interval)
      }, 16)
      return () => clearInterval(interval)
    }, 200)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        {/* Track */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="hsl(222 16% 14%)"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.03s linear', filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-display" style={{ color }}>{displayed}</span>
        <span className="text-xs text-muted-foreground">{getScoreLabel(score)}</span>
      </div>
    </div>
  )
}
