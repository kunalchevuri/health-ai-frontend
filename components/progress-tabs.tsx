"use client"

import { useState } from "react"
import { HistoryChart } from "@/components/history-chart"

const SUB_SCORE_KEYS = [
  "Sleep Quality",
  "Physical Activity",
  "Diet & Nutrition",
  "Recovery & Stress",
  "Work-Life Balance",
] as const

const SHORT_LABELS: Record<string, string> = {
  "Sleep Quality": "Sleep",
  "Physical Activity": "Activity",
  "Diet & Nutrition": "Diet",
  "Recovery & Stress": "Recovery",
  "Work-Life Balance": "Balance",
}

function scoreColorHex(score: number): string {
  if (score >= 70) return "#22c55e"
  if (score >= 50) return "#eab308"
  return "#ef4444"
}

interface ScoreLog {
  id: string
  created_at: string
  routine_score: number
  sub_scores: Record<string, number>
  type: "Analysis" | "Check-in"
}

interface SavedReport {
  id: string
  title: string
  notes: string | null
  created_at: string
  score: number
}

interface ProgressTabsProps {
  scoreLogs: ScoreLog[]
  savedReports: SavedReport[]
  currentScore: number | null
  bestScore: number | null
  streak: number
}

export function ProgressTabs({
  scoreLogs,
  savedReports,
  currentScore,
  bestScore,
  streak,
}: ProgressTabsProps) {
  const [tab, setTab] = useState<"trend" | "breakdown" | "reports">("trend")

  const chartData = [...scoreLogs].reverse().map((log) => ({
    date: new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: Math.round(log.routine_score),
  }))

  const latestLog = scoreLogs[0] ?? null
  const prevLog = scoreLogs[1] ?? null

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Current score", value: currentScore !== null ? currentScore : "—", color: currentScore !== null ? scoreColorHex(currentScore) : "#6b7280" },
          { label: "Best score",    value: bestScore !== null ? bestScore : "—",        color: bestScore !== null ? "#22c55e" : "#6b7280" },
          { label: "Day streak",    value: `${streak}d`,                                color: "var(--foreground)" },
          { label: "Total sessions",value: scoreLogs.length,                            color: "var(--foreground)" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-3xl font-black tracking-tight mb-1" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1.5 mb-5">
        {(["trend", "breakdown", "reports"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-full text-xs font-bold transition-all capitalize"
            style={{
              background: tab === t ? "#22c55e" : "#1a1a1a",
              color: tab === t ? "#0f0f0f" : "#6b7280",
              border: `1px solid ${tab === t ? "#22c55e" : "#252525"}`,
            }}
          >
            {t === "reports" ? "Saved Reports" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Trend tab ─────────────────────────────────────────────────────────── */}
      {tab === "trend" && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-bold text-foreground mb-5">Score trend</h3>
            {chartData.length >= 2 ? (
              <HistoryChart data={chartData} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete at least 2 analyses to see your trend.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            {[...scoreLogs].slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-border bg-card px-4 py-3 flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{log.type}</div>
                </div>
                <div
                  className="text-2xl font-black tracking-tight"
                  style={{ color: scoreColorHex(Math.round(log.routine_score)) }}
                >
                  {Math.round(log.routine_score)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Breakdown tab ─────────────────────────────────────────────────────── */}
      {tab === "breakdown" && (
        <div className="rounded-2xl border border-border bg-card p-7">
          <h3 className="text-sm font-bold text-foreground mb-6">Sub-score breakdown</h3>
          {latestLog ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
              {SUB_SCORE_KEYS.map((key) => {
                const val = latestLog.sub_scores[key] ?? 0
                const color = scoreColorHex(Math.round(val))
                const prevVal = prevLog ? (prevLog.sub_scores[key] ?? null) : null
                const diff = prevVal !== null ? Math.round(val - prevVal) : null
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-foreground">{SHORT_LABELS[key]}</span>
                      <div className="flex items-center gap-2">
                        {diff !== null && (
                          <span
                            className="text-xs font-bold"
                            style={{ color: diff >= 0 ? "#22c55e" : "#ef4444" }}
                          >
                            {diff >= 0 ? "+" : ""}{diff}
                          </span>
                        )}
                        <span className="text-base font-black" style={{ color }}>
                          {Math.round(val)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "#252525" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.round(val)}%`, background: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No analysis data yet.</p>
          )}
        </div>
      )}

      {/* ── Saved Reports tab ─────────────────────────────────────────────────── */}
      {tab === "reports" && (
        savedReports.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-5xl mb-4">📋</div>
            <div className="text-lg font-bold text-foreground mb-2">No saved reports yet</div>
            <div className="text-sm">Run a full analysis and save the report</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedReports.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-bold text-foreground pr-3">{r.title}</div>
                  <div
                    className="text-3xl font-black tracking-tight flex-shrink-0"
                    style={{ color: scoreColorHex(r.score) }}
                  >
                    {r.score}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {new Date(r.created_at).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </div>
                {r.notes && (
                  <div className="text-xs text-muted-foreground italic border-t border-border pt-3 mt-2">
                    {r.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
