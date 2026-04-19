import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/user-profile"
import { ContextBadge } from "@/components/context-badge"
import { ProfileContextEditor } from "@/components/profile-context-editor"

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
  if (score >= 71) return "#22c55e"
  if (score >= 56) return "#eab308"
  if (score >= 41) return "#f97316"
  return "#ef4444"
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = user ? await getUserProfile(user.id) : null

  const { data: logs } = await supabase
    .from("score_logs")
    .select("routine_score, created_at, sub_scores")
    .order("created_at", { ascending: false })

  const scoreLogs = (logs ?? []).filter((l) => l.routine_score !== null)
  const latestScoreLog = scoreLogs[0] ?? null

  const currentScore = latestScoreLog ? Math.round(Number(latestScoreLog.routine_score)) : null
  const bestScore = scoreLogs.length > 0
    ? Math.round(Math.max(...scoreLogs.map((l) => Number(l.routine_score))))
    : null

  let streak = 0
  if (logs && logs.length > 0) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    let checkDate = new Date(today)
    for (const log of logs) {
      const d = new Date(log.created_at); d.setHours(0, 0, 0, 0)
      if (d.getTime() === checkDate.getTime()) { streak++; checkDate.setDate(checkDate.getDate() - 1) }
      else break
    }
  }

  const subScores = latestScoreLog
    ? (latestScoreLog.sub_scores as Record<string, number>)
    : null

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0]?.split(".")[0] ??
    "User"

  const initLetter = displayName[0]?.toUpperCase() ?? "U"

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Avatar card */}
          <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0"
              style={{
                background: "rgba(34,197,94,0.10)",
                border: "2px solid #22c55e",
                color: "#22c55e",
              }}
            >
              {initLetter}
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-foreground mb-0.5">{displayName}</p>
              <p className="text-sm text-muted-foreground mb-2">{user?.email}</p>
              {profile?.occupation && (
                <ContextBadge
                  occupation={profile.occupation}
                  userContext={profile.user_context}
                />
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-bold text-foreground mb-4">Stats</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Current score", value: currentScore !== null ? currentScore : "—", color: currentScore !== null ? scoreColorHex(currentScore) : "#6b7280" },
                { label: "Best score",    value: bestScore !== null ? bestScore : "—",        color: "#22c55e" },
                { label: "Day streak",    value: `${streak}d`,                                color: "var(--foreground)" },
                { label: "Total sessions",value: scoreLogs.length,                            color: "var(--foreground)" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-4 text-center border border-border"
                  style={{ background: "#141414" }}
                >
                  <div className="text-3xl font-black tracking-tight mb-1" style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-score snapshot */}
          {subScores && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-bold text-foreground mb-4">Latest breakdown</p>
              <div className="flex flex-col gap-3">
                {SUB_SCORE_KEYS.map((key) => {
                  const val = Math.round(subScores[key] ?? 0)
                  const color = scoreColorHex(val)
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm text-foreground">{SHORT_LABELS[key]}</span>
                        <span className="text-sm font-bold" style={{ color }}>{val}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "#252525" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${val}%`, background: color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: context editor ────────────────────────────────── */}
        {user && (
          <ProfileContextEditor
            userId={user.id}
            initialProfile={{
              occupation: profile?.occupation ?? null,
              user_context: profile?.user_context ?? null,
              activity_level: profile?.activity_level ?? null,
              goals: profile?.goals ?? null,
              stressors: profile?.stressors ?? null,
              life_context: profile?.life_context ?? null,
              grade_year: profile?.grade_year ?? null,
            }}
          />
        )}
      </div>
    </div>
  )
}
