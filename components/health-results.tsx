"use client"

import { useEffect, useRef } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScoreGauge } from "@/components/score-gauge"
import { SubScoreCard } from "@/components/sub-score-card"
import { Counterfactuals } from "@/components/counterfactuals"
import { AiReport } from "@/components/ai-report"

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
  mode?: "full_analysis" | "daily_checkin"
}

interface HealthResultsProps {
  data: HealthResultsData
  onBack: () => void
}

const SUB_SCORE_ORDER = [
  "Sleep Quality",
  "Physical Activity",
  "Diet & Nutrition",
  "Recovery & Stress",
  "Work-Life Balance",
] as const

export function HealthResults({ data, onBack }: HealthResultsProps) {
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const row1 = SUB_SCORE_ORDER.slice(0, 3)
  const row2 = SUB_SCORE_ORDER.slice(3)

  return (
    <div ref={topRef} className="space-y-8">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground px-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Analyze Again
        </Button>
      </div>

      {/* Title + Gauge */}
      <section
        className="flex flex-col items-center gap-4 animate-in fade-in fill-mode-forwards"
        style={{ animationDuration: "500ms", animationDelay: "0ms" }}
      >
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground text-center">Your Health Score</h2>
          {data.mode && (
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
              style={
                data.mode === "daily_checkin"
                  ? { background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa" }
                  : { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }
              }
            >
              {data.mode === "daily_checkin" ? "⚡ Daily Check-In" : "📋 Full Analysis"}
            </span>
          )}
        </div>
        <ScoreGauge score={data.routine_score} />
      </section>

      {/* Detailed Breakdown */}
      <section
        className="animate-in fade-in fill-mode-forwards"
        style={{ animationDuration: "500ms", animationDelay: "200ms" }}
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">Detailed Breakdown</h3>
        {/* Row 1: 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {row1.map((name) => (
            <SubScoreCard
              key={name}
              name={name}
              score={data.sub_scores[name]}
            />
          ))}
        </div>
        {/* Row 2: 2 columns centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:max-w-[66%] sm:mx-auto">
          {row2.map((name) => (
            <SubScoreCard
              key={name}
              name={name}
              score={data.sub_scores[name]}
            />
          ))}
        </div>
      </section>

      {/* Counterfactuals */}
      <section
        className="animate-in fade-in fill-mode-forwards"
        style={{ animationDuration: "500ms", animationDelay: "400ms" }}
      >
        <Counterfactuals
          counterfactuals={data.counterfactuals}
          baseScore={data.routine_score}
        />
      </section>

      {/* AI Report */}
      <section
        className="animate-in fade-in fill-mode-forwards"
        style={{ animationDuration: "500ms", animationDelay: "600ms" }}
      >
        <AiReport report={data.report} />
      </section>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Your data is processed securely and not stored. Results are for informational purposes only.
      </p>
    </div>
  )
}
