import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/user-profile"
import Link from "next/link"
import { ScoreRing } from "@/components/score-ring"
import { ContextBadge } from "@/components/context-badge"
import { HistoryChart } from "@/components/history-chart"
import { Moon, Footprints, Apple, Brain, Scale } from "lucide-react"
import type { LucideIcon } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

const SUB_SCORE_KEYS = [
  "Sleep Quality",
  "Physical Activity",
  "Diet & Nutrition",
  "Recovery & Stress",
  "Work-Life Balance",
] as const

type SubScoreKey = (typeof SUB_SCORE_KEYS)[number]

interface FocusConfig {
  icon: LucideIcon
  color: string
  action: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SHORT_LABELS: Record<SubScoreKey, string> = {
  "Sleep Quality": "Sleep",
  "Physical Activity": "Activity",
  "Diet & Nutrition": "Diet",
  "Recovery & Stress": "Recovery",
  "Work-Life Balance": "Balance",
}

const FOCUS_CONFIG: Record<SubScoreKey, FocusConfig> = {
  "Sleep Quality":     { icon: Moon,      color: "#60a5fa", action: "Tonight: aim for 8h sleep. Set an alarm for 10:30 PM." },
  "Physical Activity": { icon: Footprints, color: "#f97316", action: "Get 8,000 steps or 30 min of movement today." },
  "Diet & Nutrition":  { icon: Apple,      color: "#22c55e", action: "Drink 2.5L water. Skip one junk food meal today." },
  "Recovery & Stress": { icon: Brain,      color: "#a78bfa", action: "10 min breathing exercise before bed tonight." },
  "Work-Life Balance": { icon: Scale,      color: "#eab308", action: "Protect 1 hour of personal time. Log off by 7:00 PM." },
}

const PLACEHOLDER_FOCUS = [
  { icon: Moon,      color: "#60a5fa", label: "Sleep",      action: "Aim for 7–9 hours of quality sleep each night." },
  { icon: Footprints, color: "#f97316", label: "Activity",   action: "Take a 20-minute walk to reset your energy." },
  { icon: Apple,      color: "#22c55e", label: "Nutrition",  action: "Drink 2L of water and eat at least one proper meal." },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getFirstName(user: { email?: string | null; user_metadata?: { full_name?: string; name?: string } }): string {
  if (user.user_metadata?.full_name) return user.user_metadata.full_name.split(" ")[0]
  if (user.user_metadata?.name) return user.user_metadata.name.split(" ")[0]
  return user.email?.split("@")[0].split(".")[0] ?? "there"
}

function scoreColorHex(score: number): string {
  if (score >= 71) return "#22c55e"
  if (score >= 56) return "#eab308"
  if (score >= 41) return "#f97316"
  return "#ef4444"
}

function dotColorClass(score: number): string {
  if (score >= 70) return "bg-green-400"
  if (score >= 50) return "bg-yellow-400"
  return "bg-red-400"
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: logs }, { data: streakRow }, profile] = await Promise.all([
    supabase
      .from("score_logs")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("streaks")
      .select("current_streak, best_streak, last_submission_date")
      .eq("user_id", user?.id)
      .single(),
    user ? getUserProfile(user.id) : Promise.resolve(null),
  ])

  // Only real analyses
  const scoreLogs = (logs ?? []).filter((l) => l.routine_score !== null)
  const latestScoreLog = scoreLogs[0] ?? null

  // Streak from dedicated table (Phase 4)
  const streak     = streakRow?.current_streak ?? 0
  const bestStreak = streakRow?.best_streak    ?? 0

  // Stats
  const avgScore =
    scoreLogs.length > 0
      ? Math.round(scoreLogs.reduce((s, l) => s + Number(l.routine_score), 0) / scoreLogs.length)
      : null

  // Score change delta vs previous
  const prevScoreLog = scoreLogs[1] ?? null
  const delta =
    latestScoreLog && prevScoreLog
      ? Math.round(Number(latestScoreLog.routine_score) - Number(prevScoreLog.routine_score))
      : null

  // Days until next full re-analysis (7-day cycle)
  const daysUntilReanalysis = (() => {
    if (!latestScoreLog) return null
    const lastDate = new Date(latestScoreLog.created_at)
    const diffMs = Date.now() - lastDate.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.ceil(7 - diffDays))
  })()

  // Checked in today via streaks table
  const todayLocal = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })()
  const checkedInToday = streakRow?.last_submission_date === todayLocal

  // Latest score + sub-scores
  const latestScore = latestScoreLog ? Math.round(Number(latestScoreLog.routine_score)) : null
  const subScores = latestScoreLog
    ? (latestScoreLog.sub_scores as Record<SubScoreKey, number>)
    : null

  // 3 weakest sub-score areas
  const priorityAreas: SubScoreKey[] = subScores
    ? ([...SUB_SCORE_KEYS]
        .sort((a, b) => (subScores[a] ?? 0) - (subScores[b] ?? 0))
        .slice(0, 3) as SubScoreKey[])
    : []

  // Trend chart: last 5 real analyses (oldest→newest for the minitrend, all for chart)
  const trendLogs = scoreLogs.slice(0, 5).reverse()
  const chartData = [...scoreLogs]
    .reverse()
    .map((log) => ({
      date: new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: Math.round(Number(log.routine_score)),
    }))

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })

  const firstName = getFirstName(user!)

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-5xl mx-auto w-full flex flex-col gap-6">

      {/* ── Section 1: Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5 font-medium tracking-wide">{today}</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">
            {getGreeting()}, {firstName} 👋
          </h1>
          {profile?.occupation && (
            <ContextBadge occupation={profile.occupation} userContext={profile.user_context} />
          )}
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {!checkedInToday && (
            <Link
              href="/dashboard/checkin"
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: "#22c55e", color: "#0f0f0f" }}
            >
              ⚡ Daily check-in
            </Link>
          )}
          <Link
            href="/dashboard/analyze"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border bg-card text-foreground hover:bg-accent transition-colors"
          >
            Run analysis
          </Link>
        </div>
      </div>

      {/* ── Section 2: Main Grid ────────────────────────────────────────────── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "340px 1fr" }}>

        {/* Score card */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center">
          {latestScore !== null && (
            <div className="flex items-center gap-1.5 mb-3 self-start">
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}
              >
                📋 Official Score
              </span>
              {daysUntilReanalysis !== null && daysUntilReanalysis > 0 && (
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "#141414", border: "1px solid #252525", color: "#6b7280" }}
                >
                  🔒 locked {daysUntilReanalysis}d
                </span>
              )}
            </div>
          )}
          {latestScore !== null ? (
            <ScoreRing score={latestScore} size={160} />
          ) : (
            <div className="w-40 h-40 flex flex-col items-center justify-center gap-2">
              <span className="text-5xl font-black text-muted-foreground">—</span>
              <span className="text-xs text-muted-foreground">No score yet</span>
            </div>
          )}

          {/* Sub-score bars */}
          {subScores && (
            <div className="w-full mt-5 flex flex-col gap-2.5">
              {SUB_SCORE_KEYS.map((key) => {
                const val = Math.round(subScores[key] ?? 0)
                const color = scoreColorHex(val)
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{SHORT_LABELS[key]}</span>
                      <span className="text-xs font-bold" style={{ color }}>{val}</span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: "#252525" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${val}%`, background: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!subScores && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Run your first analysis to see your breakdown.
            </p>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Streak */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-3xl font-black tracking-tight mb-1 text-foreground">
                {streak}
              </div>
              <div className="text-xs font-semibold text-foreground mb-0.5">Day streak 🔥</div>
              <div className="text-xs text-muted-foreground">
                {bestStreak > streak ? `Best: ${bestStreak}` : bestStreak > 0 ? "Personal best!" : "Start today"}
              </div>
            </div>

            {/* Score change */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div
                className="text-3xl font-black tracking-tight mb-1"
                style={{ color: delta !== null ? (delta >= 0 ? "#22c55e" : "#ef4444") : "var(--foreground)" }}
              >
                {delta !== null ? `${delta > 0 ? "+" : ""}${delta}` : "—"}
              </div>
              <div className="text-xs font-semibold text-foreground mb-0.5">Score change</div>
              <div className="text-xs text-muted-foreground">Since last analysis</div>
            </div>

            {/* Next analysis countdown */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div
                className="text-3xl font-black tracking-tight mb-1"
                style={{ color: daysUntilReanalysis === 0 ? "#22c55e" : "var(--foreground)" }}
              >
                {daysUntilReanalysis === null ? "—" : daysUntilReanalysis === 0 ? "Now" : `${daysUntilReanalysis}d`}
              </div>
              <div className="text-xs font-semibold text-foreground mb-0.5">Next analysis</div>
              <div className="text-xs text-muted-foreground">
                {daysUntilReanalysis === 0 ? "Re-analysis unlocked" : daysUntilReanalysis === null ? "No analysis yet" : "Until re-analysis"}
              </div>
            </div>
          </div>

          {/* Today's focus */}
          <div className="rounded-2xl border border-border bg-card p-5 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-foreground">Today&apos;s focus</h2>
              <span className="text-xs text-muted-foreground">Based on weakest areas</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {priorityAreas.length > 0
                ? priorityAreas.map((area) => {
                    const cfg = FOCUS_CONFIG[area]
                    const Icon = cfg.icon
                    const val = subScores ? Math.round(subScores[area] ?? 0) : 0
                    return (
                      <div
                        key={area}
                        className="flex items-start gap-3 px-3.5 py-3 rounded-xl border border-border"
                        style={{ background: "#141414" }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${cfg.color}18` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider mb-1"
                            style={{ color: cfg.color }}
                          >
                            {SHORT_LABELS[area]} · {val}/100
                          </p>
                          <p className="text-sm text-foreground leading-snug">{cfg.action}</p>
                        </div>
                      </div>
                    )
                  })
                : PLACEHOLDER_FOCUS.map((p) => {
                    const Icon = p.icon
                    return (
                      <div
                        key={p.label}
                        className="flex items-start gap-3 px-3.5 py-3 rounded-xl border border-border"
                        style={{ background: "#141414" }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${p.color}18` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: p.color }} />
                        </div>
                        <div>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider mb-1"
                            style={{ color: p.color }}
                          >
                            {p.label}
                          </p>
                          <p className="text-sm text-foreground leading-snug">{p.action}</p>
                        </div>
                      </div>
                    )
                  })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Trend chart (≥3 logs) ────────────────────────────────── */}
      {trendLogs.length >= 3 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-sm font-bold text-foreground">Score over time</h2>
            <Link
              href="/dashboard/history"
              className="text-xs font-semibold text-green-400 hover:text-green-300 transition-colors"
            >
              View full progress →
            </Link>
          </div>
          <HistoryChart data={chartData} />
        </div>
      )}

      {/* ── Quick stats (bottom) ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Avg Score",    value: avgScore !== null ? String(avgScore) : "—" },
          { label: "Best Streak",  value: bestStreak > 0 ? `${bestStreak}d` : "—" },
          { label: "Days Tracked", value: String(scoreLogs.length) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card"
          >
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-bold text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
