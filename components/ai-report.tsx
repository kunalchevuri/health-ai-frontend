"use client"

import ReactMarkdown from "react-markdown"

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTION_DEFS = [
  { emoji: "📊", color: "#94a3b8", border: "#94a3b822", bg: "#94a3b80a", label: "Overall Score"         },
  { emoji: "🎯", color: "#22c55e", border: "#22c55e30", bg: "#22c55e0d", label: "Top Priorities"        },
  { emoji: "💪", color: "#4ade80", border: "#4ade8028", bg: "#4ade800a", label: "What's Working"        },
  { emoji: "⚠️", color: "#f97316", border: "#f9731628", bg: "#f973160a", label: "Watch Out"             },
  { emoji: "🚀", color: "#60a5fa", border: "#60a5fa28", bg: "#60a5fa0a", label: "Quick Win"             },
] as const

interface ParsedSection {
  emoji: string
  color: string
  border: string
  bg: string
  label: string
  headerText: string   // header line text with emoji stripped
  lines: string[]      // content lines after the header
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseReport(report: string): ParsedSection[] | null {
  const sections: ParsedSection[] = []
  let current: ParsedSection | null = null

  for (const raw of report.split("\n")) {
    const line = raw.trim()
    if (!line) continue

    const def = SECTION_DEFS.find((s) => line.startsWith(s.emoji))
    if (def) {
      if (current) sections.push(current)
      // Strip the leading emoji(s) and whitespace to get the header text
      const headerText = line.replace(/^[\p{Emoji}\uFE0F\u20E3]+\s*/u, "").trim()
      current = { ...def, headerText, lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  if (current) sections.push(current)

  // Need at least 3 recognised sections to count as new format
  return sections.length >= 3 ? sections : null
}

// ─── Line renderers ───────────────────────────────────────────────────────────

function ReportLine({ line, accentColor }: { line: string; accentColor: string }) {
  // → action lines
  if (line.startsWith("→")) {
    return (
      <div className="flex items-start gap-2 ml-5 mt-0.5">
        <span className="text-sm flex-shrink-0 font-bold mt-px" style={{ color: accentColor }}>→</span>
        <p className="text-sm font-semibold leading-snug" style={{ color: accentColor }}>
          {line.slice(1).trim()}
        </p>
      </div>
    )
  }

  // • bullet lines
  if (line.startsWith("•")) {
    return (
      <div className="flex items-start gap-2">
        <span className="text-muted-foreground flex-shrink-0 mt-px text-sm">•</span>
        <p className="text-sm text-foreground leading-snug">{line.slice(1).trim()}</p>
      </div>
    )
  }

  // 1. / 2. numbered priority lines
  const numbered = line.match(/^([1-3])\.\s+(.+)/)
  if (numbered) {
    return (
      <div className="flex items-start gap-2.5 mt-1.5">
        <span
          className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${accentColor}22`, color: accentColor }}
        >
          {numbered[1]}
        </span>
        <p className="text-sm text-foreground font-medium leading-snug">{numbered[2]}</p>
      </div>
    )
  }

  // Regular text
  return <p className="text-sm text-muted-foreground leading-relaxed">{line}</p>
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ section }: { section: ParsedSection }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2.5"
      style={{ background: section.bg, border: `1px solid ${section.border}` }}
    >
      {/* Header */}
      <p
        className="text-[11px] font-black uppercase tracking-widest leading-none"
        style={{ color: section.color }}
      >
        {section.emoji} {section.headerText}
      </p>

      {/* Content lines */}
      {section.lines.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {section.lines.map((line, i) => (
            <ReportLine key={i} line={line} accentColor={section.color} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Fallback: old markdown format ────────────────────────────────────────────

function MarkdownReport({ report }: { report: string }) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-lg font-bold text-foreground mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-foreground mb-2 mt-4">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold text-foreground mb-1 mt-3">{children}</h3>,
          p:  ({ children }) => <p  className="text-sm mb-3 text-muted-foreground leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-muted-foreground">{children}</li>,
        }}
      >
        {report}
      </ReactMarkdown>
    </div>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

interface AiReportProps {
  report: string
  compact?: boolean   // true = skip the outer card wrapper (for embedding in reports list)
}

export function AiReport({ report, compact = false }: AiReportProps) {
  const sections = parseReport(report)

  const content = sections ? (
    <div className="flex flex-col gap-3">
      {sections.map((s, i) => (
        <SectionCard key={i} section={s} />
      ))}
    </div>
  ) : (
    <MarkdownReport report={report} />
  )

  if (compact) return content

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p
        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4"
      >
        AI Report
      </p>
      {content}
    </div>
  )
}

// Export the parser so other components can detect report format
export function isNewReportFormat(report: string): boolean {
  return parseReport(report) !== null
}
