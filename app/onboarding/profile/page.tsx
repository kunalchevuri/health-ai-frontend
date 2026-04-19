"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

const ACTIVITY_LEVELS = ["Sedentary", "Lightly active", "Moderately active", "Very active", "Athlete"]

const STRESSOR_OPTIONS = [
  "Academic pressure",
  "Work deadlines",
  "Financial stress",
  "Relationship issues",
  "Physical training load",
  "Sleep deprivation",
  "Social anxiety",
  "Burnout",
]

const GOAL_OPTIONS = [
  "Better sleep",
  "More energy",
  "Lose weight",
  "Build muscle",
  "Reduce stress",
  "Improve focus",
  "Better nutrition",
  "Work-life balance",
]

export default function OnboardingProfilePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [occupation, setOccupation] = useState("")
  const [gradeYear, setGradeYear] = useState("")
  const [activityLevel, setActivityLevel] = useState("")
  const [lifeContext, setLifeContext] = useState("")
  const [selectedStressors, setSelectedStressors] = useState<string[]>([])
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const toggleItem = (
    item: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item])
  }

  const handleSave = async () => {
    if (!occupation.trim()) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth"); return }

      await supabase.from("user_profiles").upsert({
        id: user.id,
        occupation: occupation.trim(),
        grade_year: gradeYear.trim() || null,
        activity_level: activityLevel || null,
        life_context: lifeContext.trim() || null,
        stressors: selectedStressors.length > 0 ? selectedStressors : null,
        goals: selectedGoals.length > 0 ? selectedGoals : null,
        updated_at: new Date().toISOString(),
      })

      router.push("/onboarding/analyze")
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#22c55e" }}>Step 1 of 2</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Tell us about yourself</h1>
        <p className="text-sm text-muted-foreground mt-1">
          This powers every AI report. The more specific, the smarter your recommendations.
        </p>
      </div>

      {/* Who you are */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Who you are <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder="e.g. high school student & competitive swimmer"
          className="w-full px-3.5 py-2.5 rounded-lg text-sm text-foreground border border-border outline-none focus:border-green-500 transition-colors"
          style={{ background: "#141414" }}
        />
      </div>

      {/* Grade / Year */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Grade / Year</label>
        <input
          value={gradeYear}
          onChange={(e) => setGradeYear(e.target.value)}
          placeholder="e.g. Junior year, Grade 11, Freshman"
          className="w-full px-3.5 py-2.5 rounded-lg text-sm text-foreground border border-border outline-none focus:border-green-500 transition-colors"
          style={{ background: "#141414" }}
        />
      </div>

      {/* Activity level */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Activity level</label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setActivityLevel(activityLevel === lvl ? "" : lvl)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
              style={{
                background: activityLevel === lvl ? "rgba(34,197,94,0.15)" : "#141414",
                border: activityLevel === lvl ? "1px solid rgba(34,197,94,0.5)" : "1px solid #252525",
                color: activityLevel === lvl ? "#22c55e" : "#6b7280",
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Stressors */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current stressors</label>
        <div className="flex flex-wrap gap-2">
          {STRESSOR_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => toggleItem(s, selectedStressors, setSelectedStressors)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
              style={{
                background: selectedStressors.includes(s) ? "rgba(239,68,68,0.10)" : "#141414",
                border: selectedStressors.includes(s) ? "1px solid rgba(239,68,68,0.4)" : "1px solid #252525",
                color: selectedStressors.includes(s) ? "#f87171" : "#6b7280",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your goals</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => toggleItem(g, selectedGoals, setSelectedGoals)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
              style={{
                background: selectedGoals.includes(g) ? "rgba(34,197,94,0.10)" : "#141414",
                border: selectedGoals.includes(g) ? "1px solid rgba(34,197,94,0.4)" : "1px solid #252525",
                color: selectedGoals.includes(g) ? "#22c55e" : "#6b7280",
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Life situation */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Life situation</label>
        <textarea
          value={lifeContext}
          onChange={(e) => setLifeContext(e.target.value)}
          placeholder="e.g. AP exams in 3 weeks, training twice a day, struggling to sleep"
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-lg text-sm text-foreground border border-border outline-none focus:border-green-500 transition-colors resize-none"
          style={{ background: "#141414" }}
        />
      </div>

      {/* CTA */}
      <button
        onClick={handleSave}
        disabled={saving || !occupation.trim()}
        className="w-full h-12 rounded-xl font-bold text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: "#22c55e", color: "#0f0f0f" }}
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Continue →"}
      </button>
    </div>
  )
}
