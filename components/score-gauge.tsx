"use client"

import { useEffect, useRef, useState } from "react"

interface ScoreGaugeProps {
  score: number
}

function getColor(score: number): string {
  if (score < 40) return "#ef4444"
  if (score < 60) return "#f97316"
  if (score < 80) return "#eab308"
  return "#22c55e"
}

function getLabel(score: number): string {
  if (score < 40) return "Poor"
  if (score < 60) return "Needs Improvement"
  if (score < 80) return "Good"
  return "Excellent"
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const duration = 1500

  useEffect(() => {
    startTimeRef.current = null
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(eased * score)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [score])

  const radius = 80
  const strokeWidth = 12
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference
  const color = getColor(score)

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* Background ring */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#262626"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke 0.3s ease" }}
        />
        {/* Score text */}
        <text
          x="100"
          y="90"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="36"
          fontWeight="bold"
          fontFamily="inherit"
        >
          {Math.round(displayed)}
        </text>
        <text
          x="100"
          y="116"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#a3a3a3"
          fontSize="12"
          fontFamily="inherit"
        >
          out of 100
        </text>
      </svg>
      <p className="text-sm font-medium mt-1" style={{ color }}>{getLabel(score)}</p>
    </div>
  )
}
