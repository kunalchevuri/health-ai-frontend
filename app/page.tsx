"use client"

import { useState, useRef } from "react"
import { HealthForm } from "@/components/health-form"
import { HealthResults } from "@/components/health-results"
import { Activity } from "lucide-react"

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

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [results, setResults] = useState<HealthResultsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (data: Record<string, number>) => {
    setIsLoading(true)
    setLoadingStep(0)
    setError(null)

    setTimeout(() => {
      loadingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 1800)

    try {
      const response = await fetch("https://health-ai-platform-n7a0.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to analyze health data")
      }

      const result = await response.json()
      setResults(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(`Something went wrong: ${errorMessage}. Please try again.`)
    } finally {
      clearInterval(stepInterval)
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setResults(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Health Routine Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get AI-powered insights into your daily health habits and personalized recommendations
            to improve your overall wellness.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        {isLoading && (
          <div ref={loadingRef} className="flex flex-col items-center justify-center py-16">
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-6 w-full max-w-md">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">Analyzing Your Health Routine</p>
                <p className="text-sm text-primary mt-1 transition-all duration-500">
                  {LOADING_STEPS[loadingStep]}
                </p>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-700"
                  style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                />
              </div>
              <div className="flex gap-2">
                {LOADING_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{ backgroundColor: i <= loadingStep ? "#22c55e" : "#262626" }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {results ? (
              <HealthResults data={results} onBack={handleBack} />
            ) : (
              <HealthForm onSubmit={handleSubmit} isLoading={isLoading} />
            )}
          </>
        )}

        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Your data is processed securely and not stored. Results are for informational purposes only.
          </p>
        </footer>
      </div>
    </main>
  )
}