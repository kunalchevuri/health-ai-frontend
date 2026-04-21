"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ClipboardList, CheckCircle2, Edit2 } from "lucide-react"
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
  { key: "sleep_hours",         label: "Sleep last night", min: 4,  max: 10,    step: 0.5,  defaultValue: 7,    format: (v) => `${v}h` },
  { key: "stress_level",        label: "Stress level",     min: 1,  max: 10,    step: 1,    defaultValue: 5,    format: (v) => `${v}/10` },
  { key: "steps",               label: "Steps today",      min: 0,  max: 20000, step: 500,  defaultValue: 5000, format: (v) => v.toLocaleString() },
  { key: "water_intake_liters", label: "Water intake",     min: 0,  max: 4,     step: 0.25, defaultValue: 2,    format: (v) => `${v}L` },
  { key: "exercise_minutes",    label: "Exercise",         min: 0,  max: 120,   step: 5,    defaultValue: 30,   format: (v) => `${v} min` },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Returns ISO boundaries of today in local time (expressed as UTC strings).
// This matches what DATE(created_at) in Postgres returns when we store UTC timestamps
// aligned to local-midnight boundaries.
function todayLocalRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end   = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}

function getTimeUntilMidnight(): string {
  const now      = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const diff     = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((diff % (1000 * 60)) / 1000)
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckinRecord {
  id: string
  created_at: string
  inputs: Record<string, number>
}

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
        <div className="absolute left-0 right-0 h-1 rounded-full" style={{ background: "#252525" }} />
        <div className="absolute left-0 h-1 rounded-full" style={{ width: `${pct}%`, background: "#22c55e" }} />
        <div
          className="absolute w-5 h-5 rounded-full pointer-events-none"
          style={{
            left: `calc(${pct}% - 10px)`,
            background: "#22c55e",
            border: "2px solid #0c0c0c",
            boxShadow: "0 0 0 2px rgba(34,197,94,0.3)",
          }}
        />
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
  const [pageLoading, setPageLoading]     = useState(true)
  const [submitting, setSubmitting]       = useState(false)
  const [done, setDone]                   = useState(false)
  const [noLog, setNoLog]                 = useState(false)
  const [streak, setStreak]               = useState(0)
  const [todayCheckin, setTodayCheckin]   = useState<CheckinRecord | null>(null)
  const [editMode, setEditMode]           = useState(false)
  const [countdown, setCountdown]         = useState("")

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

      // Require at least one full analysis
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

      // Check if user already checked in today (local calendar day)
      const { start, end } = todayLocalRange()
      const { data: existing } = await supabase
        .from("daily_checkins")
        .select("id, created_at, inputs")
        .eq("user_id", user.id)
        .gte("created_at", start)
        .lt("created_at", end)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existing) {
        setTodayCheckin(existing)
        // Pre-fill form with today's values so edit mode starts with current data
        if (existing.inputs) {
          setValues((prev) => ({ ...prev, ...existing.inputs }))
        }
      }

      // Streak from score_logs + daily_checkins
      const [{ data: checkins }, { data: scoreLogs }] = await Promise.all([
        supabase.from("daily_checkins").select("created_at").order("created_at", { ascending: false }).limit(30),
        supabase.from("score_logs").select("created_at").order("created_at", { ascending: false }).limit(30),
      ])

      const allDates = [
        ...(checkins ?? []).map((r) => r.created_at),
        ...(scoreLogs ?? []).map((r) => r.created_at),
      ]
        .map((d) => { const dt = new Date(d); dt.setHours(0, 0, 0, 0); return dt.getTime() })
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => b - a)

      let s = 0
      const today = new Date(); today.setHours(0, 0, 0, 0)
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

  // Countdown ticker — only active when locked (checked in, not editing)
  useEffect(() => {
    if (!todayCheckin || editMode) return
    setCountdown(getTimeUntilMidnight())
    const interval = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000)
    return () => clearInterval(interval)
  }, [todayCheckin, editMode])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (editMode && todayCheckin) {
        // Update the existing record
        const { error } = await supabase
          .from("daily_checkins")
          .update({ inputs: values })
          .eq("id", todayCheckin.id)
          .eq("user_id", user.id)
        if (error) throw error
        setTodayCheckin({ ...todayCheckin, inputs: values })
        setEditMode(false)
      } else {
        // First submission today
        const { error } = await supabase.from("daily_checkins").insert({
          user_id: user.id,
          inputs: values,
        })
        if (error) {
          // Unique-constraint violation: another tab or race condition
          if (error.code === "23505") {
            window.location.reload()
            return
          }
          throw error
        }
      }

      setDone(true)
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch {
      router.push("/dashboard")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    )
  }

  // ── No prior analysis ────────────────────────────────────────────────────────
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

  // ── Success screen ───────────────────────────────────────────────────────────
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
          <h2 className="text-2xl font-black tracking-tight text-foreground mb-2">
            {editMode ? "Updated!" : "Done for today!"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {editMode ? "Your check-in has been updated." : `Your streak is now ${streak + 1} days 🔥`}
          </p>
        </div>
      </div>
    )
  }

  // ── Already checked in today (not in edit mode) ───────────────────────────────
  if (todayCheckin && !editMode) {
    const checkinTime = new Date(todayCheckin.created_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })

    return (
      <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Daily check-in</h1>
          <p className="text-muted-foreground mt-1 text-sm">Takes 30 seconds. Targeting your weakest areas.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-6 text-center">
          {/* Check icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: "#22c55e" }} />
          </div>

          <div>
            <p className="text-xl font-black tracking-tight text-foreground mb-1">
              Already checked in today
            </p>
            <p className="text-sm text-muted-foreground">
              Submitted at <span className="text-foreground font-medium">{checkinTime}</span>
            </p>
          </div>

          {/* Today's values summary */}
          <div
            className="w-full rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3"
            style={{ background: "#141414", border: "1px solid #252525" }}
          >
            {SLIDERS.map((s) => {
              const val = todayCheckin.inputs?.[s.key] ?? s.defaultValue
              return (
                <div key={s.key} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</span>
                  <span className="text-sm font-bold text-foreground">{s.format(val)}</span>
                </div>
              )
            })}
          </div>

          {/* Countdown */}
          <div
            className="rounded-xl px-5 py-3.5 text-center"
            style={{ background: "#141414", border: "1px solid #252525" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Next check-in available in</p>
            <p className="text-lg font-black tabular-nums" style={{ color: "#22c55e" }}>{countdown}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button
              onClick={() => setEditMode(true)}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: "#22c55e", color: "#0f0f0f" }}
            >
              <Edit2 className="w-4 h-4" />
              Edit today&apos;s check-in
            </button>
            <Link
              href="/dashboard"
              className="w-full py-3 rounded-xl font-semibold text-sm text-center border border-border text-foreground hover:bg-accent transition-colors"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Main form (first submission or edit mode) ─────────────────────────────────
  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-1.5">
              {editMode ? "Edit today's check-in" : "Daily check-in"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {editMode ? "Update your values for today." : "Takes 30 seconds. Targeting your weakest areas."}
            </p>
          </div>
          {editMode && (
            <button
              onClick={() => setEditMode(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5"
            >
              Cancel
            </button>
          )}
        </div>
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
        ) : editMode ? (
          "Update check-in →"
        ) : (
          "Submit check-in →"
        )}
      </button>
    </div>
  )
}
