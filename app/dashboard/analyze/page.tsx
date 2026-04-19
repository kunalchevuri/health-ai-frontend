import { createClient } from "@/lib/supabase/server"
import { AnalyzeClient } from "@/components/analyze-client"
import { Lock } from "lucide-react"
import Link from "next/link"

export default async function AnalyzePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from("user_profiles")
        .select("occupation, user_context")
        .eq("id", user.id)
        .single()
    : { data: null }

  // Get most recent real analysis
  const { data: logs } = await supabase
    .from("score_logs")
    .select("created_at, routine_score")
    .not("routine_score", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)

  const lastAnalysis = logs?.[0] ?? null

  // 7-day lock check
  if (lastAnalysis) {
    const lastDate = new Date(lastAnalysis.created_at)
    const now = new Date()
    const diffMs = now.getTime() - lastDate.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    if (diffDays < 7) {
      const unlockDate = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      const daysLeft = Math.ceil(7 - diffDays)
      const hoursLeft = Math.ceil((7 * 24) - (diffMs / (1000 * 60 * 60)))

      const timeLabel = daysLeft <= 1
        ? `${Math.max(0, hoursLeft)}h`
        : `${daysLeft}d`

      const unlockFormatted = unlockDate.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric",
      })

      return (
        <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Full Analysis</h1>
            <p className="text-muted-foreground mt-1 text-sm">Deep health analysis powered by AI.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-10 flex flex-col items-center gap-5 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(234,179,8,0.10)", border: "1px solid rgba(234,179,8,0.3)" }}
            >
              <Lock className="w-7 h-7" style={{ color: "#eab308" }} />
            </div>

            <div>
              <p className="text-xl font-black tracking-tight text-foreground mb-1">
                Next analysis in {timeLabel}
              </p>
              <p className="text-sm text-muted-foreground">
                Unlocks on <span className="text-foreground font-medium">{unlockFormatted}</span>
              </p>
            </div>

            <div
              className="rounded-xl px-5 py-3.5 text-xs text-muted-foreground leading-relaxed max-w-sm"
              style={{ background: "#141414", border: "1px solid #252525" }}
            >
              Full analyses run weekly so your data has time to reflect real changes. In the meantime,
              keep up your <span className="text-foreground font-medium">daily check-ins</span> to maintain your streak.
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Link
                href="/dashboard/checkin"
                className="w-full py-3 rounded-xl font-bold text-sm text-center transition-opacity hover:opacity-90"
                style={{ background: "#22c55e", color: "#0f0f0f" }}
              >
                ⚡ Daily check-in
              </Link>
              <Link
                href="/dashboard"
                className="w-full py-3 rounded-xl font-semibold text-sm text-center border border-border text-foreground hover:bg-accent transition-colors"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <AnalyzeClient
      occupation={profile?.occupation ?? null}
      userContext={profile?.user_context ?? null}
    />
  )
}
