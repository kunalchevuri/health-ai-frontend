"use client"

import { useState, useRef } from "react"
import { HealthForm } from "@/components/health-form"
import { HealthResults } from "@/components/health-results"
import { useScoreLogger } from "@/hooks/use-score-logger"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface HealthResultsData {
  routine_score: number
  sub_scores: {
    "Sleep Quality": number
    "Physical Activity": number
    "Diet & Nutrition": number
    "Recovery & Stress": number
    "Work-Life Balance": number
  }
  counterfactuals: Array<{
    label: string
    predicted_score: number
    delta: number
  }>
  report: string
}

const LOADING_STEPS = [
  "Validating your inputs…",
  "Running ML model…",
  "Calculating sub-scores…",
  "Running counterfactuals…",
  "Generating your report…",
]

interface Props {
  occupation: string | null
  userContext: string | null
}

export function AnalyzeClient({ occupation, userContext }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [results, setResults] = useState<HealthResultsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const { logScore } = useScoreLogger()

  const handleSubmit = async (data: Record<string, number>) => {
    setIsLoading(true)
    setLoadingStep(0)
    setError(null)
    setResults(null)

    setTimeout(() => {
      loadingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 1800)

    try {
      const payload = {
        ...data,
        occupation: occupation ?? "",
        user_context: userContext ?? "",
      }
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to analyze health data")
      }
      const result = await response.json()
      setResults(result)
      logScore({
        routine_score: result.routine_score,
        sub_scores: result.sub_scores,
        counterfactuals: result.counterfactuals,
        inputs: data,
        report: result.report,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      clearInterval(stepInterval)
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Full Analysis</h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <p className="text-muted-foreground text-sm">Fill in your daily habits to get your personalized health score.</p>
          {occupation && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#22c55e" }} />
              {occupation}{userContext ? ` · ${userContext}` : ""}
            </span>
          )}
        </div>

        {occupation && (
          <div
            className="mt-4 rounded-xl px-4 py-3 text-xs leading-relaxed"
            style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)" }}
          >
            <span className="font-bold" style={{ color: "#22c55e" }}>✦ Context active — </span>
            <span className="text-muted-foreground">
              Your AI report will be personalized for{" "}
              <span className="text-foreground font-medium">{occupation}</span>
              {userContext ? `. ${userContext}` : ""}
            </span>
          </div>
        )}
      </div>

      <HealthForm onSubmit={handleSubmit} isLoading={isLoading} />

      {isLoading && (
        <div ref={loadingRef} className="mt-8 rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-4 text-center">
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
        <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {results && !isLoading && (
        <div className="mt-8">
          <HealthResults data={results} onBack={() => setResults(null)} />
          <div className="mt-6 text-center flex flex-col gap-2">
            <Link href="/dashboard/history" className="text-sm text-green-400 hover:text-green-300 transition-colors">
              View your progress →
            </Link>
            <Link href="/dashboard/planner" className="text-sm text-green-400 hover:text-green-300 transition-colors">
              Generate your weekly plan →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
