"use client"

import { useEffect, useRef, useState } from "react"

function scoreColor(score: number): string {
  if (score >= 71) return "#22c55e"
  if (score >= 56) return "#eab308"
  if (score >= 41) return "#f97316"
  return "#ef4444"
}

function scoreLabel(score: number): string {
  if (score >= 86) return "Thriving"
  if (score >= 71) return "Good"
  if (score >= 56) return "Improving"
  if (score >= 41) return "Needs Work"
  return "Critical"
}

interface ScoreRingProps {
  score: number
  size?: number
  animate?: boolean
}

export function ScoreRing({ score, size = 160, animate: doAnim = true }: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(doAnim ? 0 : score)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!doAnim) {
      setDisplayed(score)
      return
    }
    let start: number | null = null
    const run = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1300, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayed(eased * score)
      if (p < 1) rafRef.current = requestAnimationFrame(run)
    }
    rafRef.current = requestAnimationFrame(run)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [score, doAnim])

  const r = size * 0.375
  const sw = size * 0.075
  const circ = 2 * Math.PI * r
  const offset = circ - (displayed / 100) * circ
  const color = scoreColor(score)
  const cx = size / 2
  const cy = size / 2

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#252525" strokeWidth={sw} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke 0.4s ease" }}
      />
      <text
        x={cx} y={cy - size * 0.07}
        textAnchor="middle" dominantBaseline="middle"
        fill={color}
        fontSize={size * 0.24}
        fontWeight="700"
        fontFamily="Geist, sans-serif"
      >
        {Math.round(displayed)}
      </text>
      <text
        x={cx} y={cy + size * 0.14}
        textAnchor="middle" dominantBaseline="middle"
        fill="#6b7280"
        fontSize={size * 0.085}
        fontFamily="Geist, sans-serif"
      >
        {scoreLabel(score)}
      </text>
    </svg>
  )
}
