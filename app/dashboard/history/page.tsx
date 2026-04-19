import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ClipboardList } from "lucide-react"
import { ProgressTabs } from "@/components/progress-tabs"

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: rawLogs }, { data: checkins }] = await Promise.all([
    supabase.from("score_logs").select("*").order("created_at", { ascending: false }),
    supabase.from("daily_checkins").select("created_at").order("created_at", { ascending: false }).limit(30),
  ])

  // Only rows that have a real score
  const scoreLogs = (rawLogs ?? [])
    .filter((l) => l.routine_score !== null)
    .map((l) => ({
      id: l.id as string,
      created_at: l.created_at as string,
      routine_score: Number(l.routine_score),
      sub_scores: (l.sub_scores ?? {}) as Record<string, number>,
      type: "Analysis" as const,
    }))

  // Saved reports
  const { data: rawReports } = await supabase
    .from("saved_reports")
    .select("id, title, notes, created_at, score_log_id")
    .order("created_at", { ascending: false })

  // Attach score from joined log
  const savedReports = (rawReports ?? []).map((r) => {
    const matchedLog = scoreLogs.find((l) => l.id === r.score_log_id)
    return {
      id: r.id as string,
      title: r.title as string,
      notes: r.notes as string | null,
      created_at: r.created_at as string,
      score: matchedLog ? Math.round(matchedLog.routine_score) : 0,
    }
  })

  if (scoreLogs.length === 0) {
    return (
      <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Progress</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your health journey over time.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-12 text-center flex flex-col items-center gap-4">
          <ClipboardList className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="font-bold text-foreground text-lg">No history yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete your first analysis to start tracking your progress.
            </p>
          </div>
          <Link
            href="/dashboard/analyze"
            className="mt-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: "#22c55e", color: "#0f0f0f" }}
          >
            Analyze Now
          </Link>
        </div>
      </div>
    )
  }

  // Stats for tabs — streak from both tables merged
  const allDates = [
    ...(rawLogs ?? []).map((r) => r.created_at),
    ...(checkins ?? []).map((r) => r.created_at),
  ]
    .map((d) => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt.getTime() })
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => b - a)

  let streak = 0
  {
    const today = new Date(); today.setHours(0,0,0,0)
    let checkDate = new Date(today)
    for (const ts of allDates) {
      if (ts === checkDate.getTime()) { streak++; checkDate.setDate(checkDate.getDate() - 1) }
      else break
    }
  }

  const currentScore = scoreLogs.length > 0 ? Math.round(scoreLogs[0].routine_score) : null
  const bestScore = scoreLogs.length > 0 ? Math.round(Math.max(...scoreLogs.map((l) => l.routine_score))) : null

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Progress</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your health journey over time.</p>
      </div>
      <ProgressTabs
        scoreLogs={scoreLogs}
        savedReports={savedReports}
        currentScore={currentScore}
        bestScore={bestScore}
        streak={streak}
      />
    </div>
  )
}
