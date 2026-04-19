"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Log {
  id: string
  created_at: string
  routine_score: number
  sub_scores: Record<string, number>
  report?: string
}

const SUB_SCORE_KEYS = [
  "Sleep Quality",
  "Physical Activity",
  "Diet & Nutrition",
  "Recovery & Stress",
  "Work-Life Balance",
]

export function HistoryLogCard({ log }: { log: Log }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          {new Date(log.created_at).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="text-2xl font-bold text-green-400">
          {Math.round(log.routine_score)}
          <span className="text-sm text-muted-foreground font-normal">/100</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {SUB_SCORE_KEYS.map((key) => {
          const val = log.sub_scores[key] ?? 0
          const color =
            val >= 70 ? "text-green-400" : val >= 50 ? "text-yellow-400" : "text-red-400"
          return (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">
                {key}
              </span>
              <span className={`text-lg font-bold ${color}`}>{Math.round(val)}</span>
            </div>
          )
        })}
      </div>

      {log.report && (
        <>
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-4 flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Hide AI report
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                View AI report
              </>
            )}
          </button>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-border prose prose-sm prose-invert max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-base [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:text-sm [&_h3]:mt-4 [&_h3]:mb-1 [&_strong]:text-foreground [&_ul]:mt-2 [&_ul]:space-y-1 [&_li]:text-sm [&_p]:text-sm [&_p]:leading-relaxed">
              <ReactMarkdown>{log.report}</ReactMarkdown>
            </div>
          )}
        </>
      )}
    </div>
  )
}
