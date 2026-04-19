"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  occupation: string | null
  user_context: string | null
  activity_level: string | null
  goals: string[] | null
  stressors?: string[] | null
  life_context?: string | null
  grade_year?: string | null
}

export function ProfileContextEditor({
  userId,
  initialProfile,
}: {
  userId: string
  initialProfile: Profile
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<Profile>({ ...initialProfile })
  const [saved, setSaved] = useState<Profile>({ ...initialProfile })

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.from("user_profiles").upsert({
        id: userId,
        occupation: draft.occupation,
        user_context: draft.user_context,
        activity_level: draft.activity_level,
        goals: draft.goals,
        life_context: draft.life_context,
        grade_year: draft.grade_year,
        updated_at: new Date().toISOString(),
      })
      setSaved({ ...draft })
      setEditing(false)
    } catch {
      // keep editing open on failure
    } finally {
      setSaving(false)
    }
  }

  const fields: { key: keyof Profile; label: string; placeholder: string }[] = [
    { key: "occupation",    label: "Who you are",    placeholder: "e.g. high school student & competitive swimmer" },
    { key: "grade_year",    label: "Grade / Year",   placeholder: "e.g. Junior year, Grade 11" },
    { key: "activity_level",label: "Activity level",  placeholder: "e.g. athlete, moderately active" },
    { key: "life_context",  label: "Life situation",  placeholder: "e.g. AP exams in 3 weeks, training 2x/day" },
    { key: "user_context",  label: "Extra context",   placeholder: "Anything else the AI should know" },
  ]

  const current = editing ? draft : saved

  return (
    <div className="rounded-2xl border border-border bg-card p-7">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm font-bold text-foreground mb-0.5">Your context</p>
          <p className="text-xs" style={{ color: "#22c55e" }}>Powers every AI report</p>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={saving}
          className="px-4 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-60"
          style={{
            background: editing ? "#22c55e" : "#141414",
            color: editing ? "#0f0f0f" : "var(--foreground)",
            border: `1px solid ${editing ? "#22c55e" : "#252525"}`,
          }}
        >
          {saving ? "Saving…" : editing ? "Save" : "Edit"}
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {fields.map((f) => (
          <div key={f.key}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              {f.label}
            </p>
            {editing ? (
              <input
                value={(draft[f.key] as string) ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-foreground border border-border outline-none focus:border-green-500 transition-colors"
                style={{ background: "#141414" }}
              />
            ) : (
              <p
                className="text-sm text-foreground border-b border-border pb-3 leading-relaxed"
              >
                {(current[f.key] as string) || "—"}
              </p>
            )}
          </div>
        ))}

        {/* Goals */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Goals
          </p>
          <div className="flex flex-wrap gap-2">
            {(saved.goals ?? []).length > 0 ? (
              (saved.goals ?? []).map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(34,197,94,0.10)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    color: "#22c55e",
                  }}
                >
                  {g}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No goals set</span>
            )}
          </div>
        </div>

        {/* How it works callout */}
        <div
          className="rounded-xl p-4 text-xs text-muted-foreground leading-relaxed"
          style={{ background: "#141414", border: "1px solid #252525" }}
        >
          <p className="text-xs font-bold mb-1.5" style={{ color: "#22c55e" }}>✦ How this works</p>
          Every time you run an analysis or check in, Velora sends your context to the AI. The more
          specific you are, the smarter your recommendations become.
        </div>
      </div>
    </div>
  )
}
