"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { AiReport, isNewReportFormat } from "@/components/ai-report"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportEntry {
  id: string
  routine_score: number
  sub_scores: Record<string, number> | null
  report: string
  inputs: Record<string, number> | null
  created_at: string
}

type FilterTab = "all" | "new" | "legacy"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColorHex(score: number): string {
  if (score >= 71) return "#22c55e"
  if (score >= 56) return "#eab308"
  if (score >= 41) return "#f97316"
  return "#ef4444"
}

function scoreLabel(score: number): string {
  if (score >= 86) return "Thriving"
  if (score >= 71) return "Good"
  if (score >= 56) return "Improving"
  if (score >= 41) return "Needs Work"
  return "Critical"
}

// ─── Report card ──────────────────────────────────────────────────────────────

function ReportCard({ report }: { report: ReportEntry }) {
  const [expanded, setExpanded] = useState(false)
  const score    = Math.round(Number(report.routine_score))
  const color    = scoreColorHex(score)
  const label    = scoreLabel(score)
  const isNew    = isNewReportFormat(report.report)

  const date = new Date(report.created_at).toLocaleDateString("en-US", {
    weekday: "short", month: "long", day: "numeric", year: "numeric",
  })

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          {/* Score badge */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}40`, color }}
          >
            {score}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-foreground">{date}</p>
              {/* Format badge */}
              <span
                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={
                  isNew
                    ? { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }
                    : { background: "rgba(107,114,128,0.12)", border: "1px solid rgba(107,114,128,0.25)", color: "#6b7280" }
                }
              >
                {isNew ? "📋 Full Analysis" : "Legacy"}
              </span>
            </div>
            <p className="text-xs mt-0.5 font-semibold" style={{ color }}>{label}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {expanded ? "Hide" : "View"}
          </span>
          {expanded
            ? <ChevronUp  className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
        </div>
      </button>

      {/* Sub-score chips */}
      {report.sub_scores && (
        <div className="flex gap-2 px-6 pb-4 flex-wrap">
          {Object.entries(report.sub_scores).map(([key, val]) => {
            const v = Math.round(Number(val))
            const c = scoreColorHex(v)
            const SHORT: Record<string, string> = {
              "Sleep Quality": "Sleep", "Physical Activity": "Activity",
              "Diet & Nutrition": "Diet", "Recovery & Stress": "Recovery",
              "Work-Life Balance": "Balance",
            }
            return (
              <div
                key={key}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: `${c}10`, border: `1px solid ${c}25`, color: c }}
              >
                {SHORT[key] ?? key}: {v}
              </div>
            )
          })}
        </div>
      )}

      {/* Expanded report */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          <AiReport report={report.report} compact />
        </div>
      )}
    </div>
  )
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

function FilterTabs({
  active,
  onChange,
  counts,
}: {
  active: FilterTab
  onChange: (t: FilterTab) => void
  counts: Record<FilterTab, number>
}) {
  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all",    label: `All (${counts.all})`    },
    { id: "new",    label: `New Format (${counts.new})`    },
    { id: "legacy", label: `Legacy (${counts.legacy})` },
  ]

  return (
    <div className="flex gap-1.5 flex-wrap">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={
            active === t.id
              ? { background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#22c55e" }
              : { background: "#141414", border: "1px solid #252525", color: "#6b7280" }
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ReportsClient({ reports }: { reports: ReportEntry[] }) {
  const [filter, setFilter] = useState<FilterTab>("all")

  const newReports    = reports.filter((r) => isNewReportFormat(r.report))
  const legacyReports = reports.filter((r) => !isNewReportFormat(r.report))

  const counts: Record<FilterTab, number> = {
    all:    reports.length,
    new:    newReports.length,
    legacy: legacyReports.length,
  }

  const visible =
    filter === "all"    ? reports :
    filter === "new"    ? newReports :
                          legacyReports

  return (
    <div className="flex flex-col gap-5">
      <FilterTabs active={filter} onChange={setFilter} counts={counts} />

      {visible.length === 0 ? (
        <div
          className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground"
        >
          No reports in this category.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  )
}
