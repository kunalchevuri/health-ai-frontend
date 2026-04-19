import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardTopBar } from "@/components/dashboard-topbar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth")

  // Belt-and-suspenders: if the proxy somehow lets through a user with no profile
  // (e.g. user_metadata flag is stale), send them back to onboarding.
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("occupation")
    .eq("id", user.id)
    .single()

  if (!profile?.occupation) redirect("/onboarding/profile")

  // Fetch score_logs (for latestScore) and streaks row in parallel
  const [{ data: scoreLogs }, { data: streakRow }] = await Promise.all([
    supabase
      .from("score_logs")
      .select("routine_score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("streaks")
      .select("current_streak, best_streak, last_submission_date")
      .eq("user_id", user.id)
      .single(),
  ])

  const currentStreak = streakRow?.current_streak ?? 0
  const bestStreak    = streakRow?.best_streak    ?? 0

  // Use the streaks table's last_submission_date for checkedInToday.
  // Compare as YYYY-MM-DD strings so timezone handling matches the hook.
  const todayLocal = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })()
  const checkedInToday = streakRow?.last_submission_date === todayLocal

  const realScoreLogs = (scoreLogs ?? []).filter((l) => l.routine_score !== null)
  const latestScore = realScoreLogs.length > 0 ? Math.round(Number(realScoreLogs[0].routine_score)) : null

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DashboardNav user={user} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <DashboardTopBar
          streak={currentStreak}
          bestStreak={bestStreak}
          latestScore={latestScore}
          checkedInToday={checkedInToday}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
