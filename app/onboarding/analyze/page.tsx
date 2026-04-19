"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HealthForm } from "@/components/health-form"
import { createClient } from "@/lib/supabase/client"
import { useScoreLogger } from "@/hooks/use-score-logger"
import { Loader2 } from "lucide-react"

const LOADING_STEPS = [
  "Validating your inputs…",
  "Running ML model…",
  "Calculating sub-scores…",
  "Running counterfactuals…",
  "Generating your report…",
]

export default function OnboardingAnalyzePage() {
  const router = useRouter()
  const { logScore } = useScoreLogger()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ occupation: string | null; user_context: string | null } | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("user_profiles")
        .select("occupation, user_context")
        .eq("id", user.id)
        .single()
      if (data) setProfile(data)
    }
    load()
  }, [])

  const handleSubmit = async (data: Record<string, number>) => {
    setIsLoading(true)
    setLoadingStep(0)
    setError(null)

    setTimeout(() => {
      loadingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 1800)

    try {
      const payload = {
        ...data,
        occupation: profile?.occupation ?? "",
        user_context: profile?.user_context ?? "",
      }
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error(await response.text() || "Failed to analyze")

      const result = await response.json()

      logScore({
        routine_score: result.routine_score,
        sub_scores: result.sub_scores,
        counterfactuals: result.counterfactuals,
        inputs: data,
        report: result.report,
      })

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && result.report) {
        await supabase.from("saved_reports").insert({
          user_id: user.id,
          title: `Baseline Analysis · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · Score ${Math.round(result.routine_score)}`,
          notes: "",
        })

        // Mark onboarding complete in user_metadata so the proxy can detect
        // returning users via JWT without making a DB call on every request.
        await supabase.auth.updateUser({ data: { onboarding_complete: true } })
      }

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      clearInterval(stepInterval)
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#22c55e" }}>Step 2 of 2</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Your baseline analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in your typical daily habits to get your first health score.
        </p>
      </div>

      <HealthForm onSubmit={handleSubmit} isLoading={isLoading} />

      {isLoading && (
        <div ref={loadingRef} className="rounded-2xl border border-border bg-background p-8 flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-green-400 animate-spin" />
          <p className="text-foreground font-semibold">{LOADING_STEPS[loadingStep]}</p>
          <div className="flex gap-1.5 mt-1">
            {LOADING_STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-8 rounded-full transition-colors"
                style={{ background: i <= loadingStep ? "#22c55e" : "#252525" }}
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
