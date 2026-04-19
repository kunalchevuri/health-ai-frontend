import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Lightbulb, ClipboardList } from "lucide-react"
import ReactMarkdown from "react-markdown"

const subScoreKeys = ["Sleep Quality", "Physical Activity", "Diet & Nutrition", "Recovery & Stress", "Work-Life Balance"]

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "#22c55e" : value >= 50 ? "#eab308" : "#ef4444"
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold" style={{ color }}>{Math.round(value)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.round(value)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default async function TipsPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from("score_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)

  const latestLog = logs?.[0] ?? null

  if (!latestLog) {
    return (
      <div className="flex-1 p-6 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Personalized Tips</h1>
          <p className="text-muted-foreground mt-1">AI-generated insights based on your latest analysis.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center flex flex-col items-center gap-4">
          <Lightbulb className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="font-semibold text-foreground text-lg">No tips yet</p>
            <p className="text-sm text-muted-foreground mt-1">Complete your first analysis to get personalized health tips.</p>
          </div>
          <Link
            href="/dashboard/analyze"
            className="mt-2 px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Analyze Now
          </Link>
        </div>
      </div>
    )
  }

  const subScores = latestLog.sub_scores as Record<string, number>
  const overallScore = Math.round(Number(latestLog.routine_score))
  const reportText = (latestLog as { report?: string }).report

  return (
    <div className="flex-1 p-6 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Personalized Tips</h1>
        <p className="text-muted-foreground mt-1">Based on your most recent analysis.</p>
      </div>

      {/* Score overview */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-foreground">Your Score Breakdown</h2>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-green-400">{overallScore}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {subScoreKeys.map((key) => (
            <ScoreBar key={key} label={key} value={subScores[key] ?? 0} />
          ))}
        </div>
      </div>

      {/* AI Report */}
      {reportText ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-green-400" />
            <h2 className="font-semibold text-foreground">AI Health Analysis</h2>
          </div>
          <div className="prose prose-sm prose-invert max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-base [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:text-sm [&_h3]:mt-4 [&_h3]:mb-1 [&_strong]:text-foreground [&_ul]:mt-2 [&_ul]:space-y-1 [&_li]:text-sm [&_p]:text-sm [&_p]:leading-relaxed">
            <ReactMarkdown>{reportText}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground text-sm">No report available for this analysis.</p>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/dashboard/analyze" className="text-sm text-green-400 hover:text-green-300 transition-colors">
          Run a new analysis →
        </Link>
      </div>
    </div>
  )
}
