"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/checkin": "Check-in",
  "/dashboard/history": "Progress",
  "/dashboard/analyze": "Full Analysis",
  "/dashboard/planner": "Weekly Plan",
  "/dashboard/profile": "Profile",
}

interface DashboardTopBarProps {
  streak: number
  bestStreak: number
  latestScore: number | null
  checkedInToday: boolean
}

function scoreColorHex(score: number): string {
  if (score >= 70) return "#22c55e"
  if (score >= 50) return "#eab308"
  return "#ef4444"
}

export function DashboardTopBar({ streak, bestStreak, latestScore, checkedInToday }: DashboardTopBarProps) {
  const pathname = usePathname()
  const label = PAGE_LABELS[pathname] ?? "Dashboard"
  const scoreColor = latestScore !== null ? scoreColorHex(latestScore) : "#6b7280"

  return (
    <div
      className="h-14 border-b border-border flex items-center px-8 justify-between flex-shrink-0"
      style={{ background: "#141414" }}
    >
      <span className="text-sm font-bold text-foreground">{label}</span>

      <div className="flex items-center gap-2.5">
        {/* Streak pill */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-card">
          <span className="text-sm leading-none">🔥</span>
          <span className="text-sm font-bold text-foreground">{streak}</span>
          <span className="text-xs text-muted-foreground">day streak</span>
          {bestStreak > 0 && (
            <>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-xs text-muted-foreground">Best:</span>
              <span className="text-xs font-semibold text-foreground">{bestStreak}</span>
            </>
          )}
        </div>

        {/* Score pill */}
        {latestScore !== null && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-card">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: scoreColor }}
            />
            <span className="text-xs text-muted-foreground">Score</span>
            <span className="text-sm font-bold" style={{ color: scoreColor }}>
              {latestScore}
            </span>
          </div>
        )}

        {/* Check-in CTA */}
        {!checkedInToday && pathname !== "/dashboard/checkin" && (
          <Link
            href="/dashboard/checkin"
            className="px-4 py-1.5 rounded-full text-xs font-bold transition-opacity hover:opacity-90"
            style={{ background: "#22c55e", color: "#0f0f0f" }}
          >
            ⚡ Check in
          </Link>
        )}
      </div>
    </div>
  )
}
