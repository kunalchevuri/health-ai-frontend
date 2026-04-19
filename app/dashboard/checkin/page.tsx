"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ClipboardList } from "lucide-react"
import Link from "next/link"

// ─── Slider config ────────────────────────────────────────────────────────────

interface SliderConfig {
  key: string
  label: string
  min: number
  max: number
  step: number
  defaultValue: number
  format: (v: number) => string
}

const SLIDERS: SliderConfig[] = [
  { key: "sleep_hours",          label: "Sleep last night",  min: 4,  max: 10,    step: 0.5,  defaultValue: 7,    format: (v) => `${v}h` },
  { key: "stress_level",         label: "Stress level",      min: 1,  max: 10,    step: 1,    defaultValue: 5,    format: (v) => `${v}/10` },
  { key: "steps",                label: "Steps today",       min: 0,  max: 20000, step: 500,  defaultValue: 5000, format: (v) => v.toLocaleString() },
  { key: "water_intake_liters",  label: "Water intake",      min: 0,  max: 4,     step: 0.25, defaultValue: 2,    format: (v) => `${v}L` },
  { key: "exercise_minutes",     label: "Exercise",          min: 0,  max: 120,   step: 5,    defaultValue: 30,   format: (v) => `${v} min` },
]

// ─── Custom slider ────────────────────────────────────────────────────────────

function SliderInput({
  slider,
  value,
  onChange,
}: {
  slider: SliderConfig
  value: number
  onChange: (v: number) => void
}) {
  const pct = ((value - slider.min) / (slider.max - slider.min)) * 100

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{slider.label}</span>
        <span className="text-sm font-bold" style={{ color: "#22c55e" }}>
          {slider.format(value)}
        </span>
      </div>
      <div className="relative h-8 flex items-center">
        {/* Track bg */}
        <div className="absolute left-0 right-0 h-1 rounded-full" style={{ background: "#252525" }} />
        {/* Fill */}
        <div
          className="absolute left-0 h-1 rounded-full"
          style={{ width: `${pct}%`, background: "#22c55e" }}
        />
        {/* Thumb */}
        <div
          className="absolute w-5 h-5 rounded-full pointer-events-none"
          style={{
            left: `calc(${pct}% - 10px)`,
            background: "#22c55e",
            border: "2px solid #0c0c0c",
            boxShadow: "0 0 0 2px rgba(34,197,94,0.3)",
          }}
        />
        {/* Native input (invisible, handles interaction) */}
        <input
          type="range"
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute w-full opacity-0 h-8 cursor-pointer"
        />
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckInPage() {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [noLog, setNoLog] = useState(false)
  const [streak, setStreak] = useState(0)

  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const s of SLIDERS) init[s.key] = s.defaultValue
    return init
  })

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth"); return }

      // Check if user has at least one real analysis
      const { data: analyses } = await supabase
        .from("score_logs")
        .select("id")
        .not("routine_score", "is", null)
        .limit(1)

      if (!analyses || analyses.length === 0) {
        setNoLog(true)
        setPageLoading(false)
        return
      }

      // Compute streak from both daily_checkins + score_logs merged
      const { data: checkins } = await supabase
        .from("daily_checkins")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(30)

      const { data: scoreLogs } = await supabase
        .from("score_logs")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(30)

      const allDates = [
        ...(checkins ?? []).map((r) => r.created_at),
        ...(scoreLogs ?? []).map((r) => r.created_at),
      ]
        .map((d) => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt.getTime() })
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => b - a)

      let s = 0
      const today = new Date(); today.setHours(0,0,0,0)
      let checkDate = new Date(today)
      for (const ts of allDates) {
        if (ts === checkDate.getTime()) { s++; checkDate.setDate(checkDate.getDate() - 1) }
        else break
      }
      setStreak(s)
      setPageLoading(false)
    }
    init()
  }, [router])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("daily_checkins").insert({
        user_id: user.id,
        inputs: values,
      })

      setDone(true)
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch {
      router.push("/dashboard")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    )
  }

  // ── No prior log ───────────────────────────────────────────────────────────
  if (noLog) {
    return (
      <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Daily check-in</h1>
          <p className="text-muted-foreground mt-1 text-sm">Takes 30 seconds. Targeting your weakest areas.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-12 text-center flex flex-col items-center gap-4">
          <ClipboardList className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="font-bold text-foreground text-lg">No analysis found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete your first full analysis to unlock daily check-ins.
            </p>
          </div>
          <Link
            href="/dashboard/analyze"
            className="mt-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: "#22c55e", color: "#0f0f0f" }}
          >
            Run Full Analysis
          </Link>
        </div>
      </div>
    )
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-5"
            style={{ background: "rgba(34,197,94,0.10)", border: "2px solid #22c55e" }}
          >
            ✓
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground mb-2">Done for today!</h2>
          <p className="text-muted-foreground text-sm">
            Your streak is now {streak + 1} days 🔥
          </p>
        </div>
      </div>
    )
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-1.5">
          Daily check-in
        </h1>
        <p className="text-sm text-muted-foreground">Takes 30 seconds. Targeting your weakest areas.</p>
      </div>

      {/* 2-col slider grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {SLIDERS.map((slider) => (
          <div key={slider.key} className="rounded-2xl border border-border bg-card p-5">
            <SliderInput
              slider={slider}
              value={values[slider.key] ?? slider.defaultValue}
              onChange={(v) => setValues((prev) => ({ ...prev, [slider.key]: v }))}
            />
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full h-14 rounded-xl text-base font-bold transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: "#22c55e", color: "#0f0f0f" }}
      >
        {submitting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
        ) : (
          "Submit check-in →"
        )}
      </button>
    </div>
  )
}
