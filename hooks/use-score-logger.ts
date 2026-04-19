"use client"

import { createClient } from "@/lib/supabase/client"

interface ScorePayload {
  routine_score: number
  sub_scores: Record<string, number>
  counterfactuals: Array<{
    label: string
    predicted_score: number
    delta: number
  }>
  inputs: Record<string, unknown>
  report?: string
}

// Returns today's date in YYYY-MM-DD using the user's local timezone, not UTC,
// so a midnight submission isn't accidentally counted as yesterday.
function localDateString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function yesterdayDateString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

async function updateStreak(supabase: ReturnType<typeof createClient>, userId: string): Promise<void> {
  const today = localDateString()
  const yesterday = yesterdayDateString()

  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak, best_streak, last_submission_date")
    .eq("user_id", userId)
    .single()

  if (!streak) {
    // First check-in ever → create the row
    await supabase.from("streaks").insert({
      user_id: userId,
      current_streak: 1,
      best_streak: 1,
      last_submission_date: today,
    })
    return
  }

  if (streak.last_submission_date === today) {
    // Already submitted today — don't double-count
    return
  }

  if (streak.last_submission_date === yesterday) {
    // Consecutive day → increment
    const newStreak = streak.current_streak + 1
    await supabase
      .from("streaks")
      .update({
        current_streak: newStreak,
        best_streak: Math.max(newStreak, streak.best_streak),
        last_submission_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
    return
  }

  // Gap (missed at least one day) → reset to 1, preserve best
  await supabase
    .from("streaks")
    .update({
      current_streak: 1,
      best_streak: streak.best_streak,
      last_submission_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
}

export function useScoreLogger() {
  const logScore = async (payload: ScorePayload): Promise<void> => {
    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Silently skip if not signed in — no error thrown
      if (!user) return

      const { error } = await supabase.from("score_logs").insert({
        user_id: user.id,
        routine_score: payload.routine_score,
        sub_scores: payload.sub_scores,
        counterfactuals: payload.counterfactuals,
        inputs: payload.inputs,
        report: payload.report ?? null,
      })

      if (error) {
        console.error("Failed to log score:", error.message)
        return
      }

      // Update streak after a successful score log — fire-and-forget,
      // a failure here should not surface as a user-visible error
      updateStreak(supabase, user.id).catch((err) =>
        console.error("Streak update error:", err)
      )
    } catch (err) {
      console.error("Score logging error:", err)
    }
  }

  return { logScore }
}
