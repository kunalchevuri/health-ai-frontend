import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/user-profile"
import { WeeklyPlannerClient } from "@/components/weekly-planner-client"
import Link from "next/link"
import { Calendar } from "lucide-react"

export default async function PlannerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = user ? await getUserProfile(user.id) : null

  // Get latest real analysis for sub-scores
  const { data: logs } = await supabase
    .from("score_logs")
    .select("sub_scores, routine_score, created_at")
    .not("routine_score", "is", null)
    .order("created_at", { ascending: false })
    .limit(10)

  const latestLog = logs?.[0] ?? null

  // Compute streak
  const { data: allLogs } = await supabase
    .from("score_logs")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(10)

  let streak = 0
  if (allLogs && allLogs.length > 0) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    let checkDate = new Date(today)
    for (const log of allLogs) {
      const d = new Date(log.created_at); d.setHours(0, 0, 0, 0)
      if (d.getTime() === checkDate.getTime()) { streak++; checkDate.setDate(checkDate.getDate() - 1) }
      else break
    }
  }

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0]?.split(".")[0] ??
    "You"

  if (!latestLog) {
    return (
      <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Weekly Plan</h1>
          <p className="text-muted-foreground mt-1 text-sm">Personalized to your life. Updates after each analysis.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-12 text-center flex flex-col items-center gap-4">
          <Calendar className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="font-bold text-foreground text-lg">No analysis yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete your first full analysis to unlock your personalized weekly plan.
            </p>
          </div>
          <Link
            href="/dashboard/analyze"
            className="mt-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: "#22c55e", color: "#0f0f0f" }}
          >
            Run Full Analysis
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-4xl mx-auto w-full">
      <WeeklyPlannerClient
        name={displayName}
        occupation={profile?.occupation ?? ""}
        userContext={profile?.user_context ?? ""}
        activityLevel={profile?.activity_level ?? ""}
        subScores={(latestLog.sub_scores ?? {}) as Record<string, number>}
        streak={streak}
      />
    </div>
  )
}
