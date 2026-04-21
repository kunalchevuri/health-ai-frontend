"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Slider } from "@/components/ui/slider"
import { Loader2, ChevronRight, ChevronLeft, Check } from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVITY_LEVELS = ["Sedentary", "Lightly active", "Moderately active", "Very active", "Athlete"]
const FITNESS_LABELS: Record<string, string> = { "0": "Beginner", "1": "Intermediate", "2": "Advanced" }

const STRESSOR_OPTIONS = [
  "Academic pressure", "Work deadlines", "Financial stress",
  "Relationship issues", "Physical training load", "Sleep deprivation",
  "Social anxiety", "Burnout",
]
const GOAL_OPTIONS = [
  "Better sleep", "More energy", "Lose weight", "Build muscle",
  "Reduce stress", "Improve focus", "Better nutrition", "Work-life balance",
]

const LOADING_STEPS = [
  "Saving your profile…",
  "Running your baseline analysis…",
  "Calculating sub-scores…",
  "Generating your report…",
  "Almost done…",
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function localDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function Toggle({
  item, selected, onClick, color = "green",
}: { item: string; selected: boolean; onClick: () => void; color?: "green" | "red" }) {
  const bg   = color === "green" ? "rgba(34,197,94,0.12)"  : "rgba(239,68,68,0.10)"
  const bdr  = color === "green" ? "rgba(34,197,94,0.40)"  : "rgba(239,68,68,0.35)"
  const clr  = color === "green" ? "#22c55e"               : "#f87171"
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
      style={selected
        ? { background: bg,      border: `1px solid ${bdr}`, color: clr }
        : { background: "#141414", border: "1px solid #252525", color: "#6b7280" }
      }
    >
      {item}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function SliderField({
  label, value, min, max, step = 1, display, onChange,
}: { label: string; value: number; min: number; max: number; step?: number; display: string; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-bold" style={{ color: "#22c55e" }}>{display}</span>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={(v) => onChange(v[0])} />
    </div>
  )
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg text-sm text-foreground border border-border outline-none focus:border-green-500 transition-colors bg-[#141414]"
const selectCls = inputCls + " appearance-none cursor-pointer"

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingProfilePage() {
  const router = useRouter()
  const [step, setStep]       = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError]     = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState("")

  // ── Step 1 fields ──
  const [firstName, setFirstName]     = useState("")
  const [occupation, setOccupation]   = useState("")
  const [gradeYear, setGradeYear]     = useState("")
  const [activityLevel, setActivityLevel] = useState("")
  const [lifeContext, setLifeContext] = useState("")
  const [stressors, setStressors]     = useState<string[]>([])
  const [goals, setGoals]             = useState<string[]>([])

  // ── Step 2 fields ──
  const [age, setAge]             = useState(17)
  const [sex, setSex]             = useState<0 | 1>(0)
  const [fitnessLevel, setFitnessLevel] = useState("1")
  const [heightFt, setHeightFt]   = useState(5)
  const [heightIn, setHeightIn]   = useState(8)
  const [weightLbs, setWeightLbs] = useState(150)
  const [sleepHours, setSleepHours]   = useState(7)
  const [steps, setSteps]           = useState(8000)
  const [exerciseMinutes, setExerciseMinutes] = useState(30)
  const [meals, setMeals]           = useState(3)
  const [junkFoodMeals, setJunkFoodMeals] = useState(1)
  const [waterIntake, setWaterIntake] = useState(2)
  const [caloricIntake, setCaloricIntake] = useState(2000)
  const [screenTime, setScreenTime] = useState(4)
  const [workHours, setWorkHours]   = useState(6)
  const [stressLevel, setStressLevel] = useState(5)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email)
      if (user?.user_metadata?.full_name) setFirstName(user.user_metadata.full_name.split(" ")[0])
    })
  }, [])

  const toggle = (item: string, list: string[], setList: (v: string[]) => void) =>
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

  // ── Step 1 validation ──
  const step1Valid = occupation.trim().length > 0 && activityLevel.length > 0

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    setLoadingStep(0)

    const stepTimer = setInterval(() => {
      setLoadingStep((p) => Math.min(p + 1, LOADING_STEPS.length - 1))
    }, 1800)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth"); return }

      // Update display name in auth metadata
      if (firstName.trim()) {
        await supabase.auth.updateUser({ data: { full_name: firstName.trim() } })
      }

      // Save profile
      await supabase.from("user_profiles").upsert({
        id: user.id,
        occupation: occupation.trim(),
        grade_year: gradeYear.trim() || null,
        activity_level: activityLevel,
        stressors: stressors.length > 0 ? stressors : null,
        goals: goals.length > 0 ? goals : null,
        life_context: lifeContext.trim() || null,
        updated_at: new Date().toISOString(),
      })

      // Build health metrics payload
      const healthInputs = {
        age,
        sex,
        sleep_hours: sleepHours,
        steps,
        exercise_minutes: Math.min(exerciseMinutes, 120),
        stress_level: stressLevel,
        screen_time_hours: screenTime,
        work_hours: workHours,
        junk_food_meals: junkFoodMeals,
        water_intake_liters: waterIntake,
        meals,
        caloric_intake: caloricIntake,
        fitness_level: parseInt(fitnessLevel),
        height_ft: heightFt,
        height_in: heightIn,
        weight_lbs: weightLbs,
      }

      const apiPayload = {
        ...healthInputs,
        occupation: occupation.trim(),
        user_context: lifeContext.trim(),
        activity_level: activityLevel,
        stressors,
        goals,
      }

      // Call predict
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(apiPayload),
      })
      if (!response.ok) throw new Error(await response.text() || "Analysis failed")

      const result = await response.json()

      // Save score_log and get its ID
      const { data: logData } = await supabase
        .from("score_logs")
        .insert({
          user_id: user.id,
          routine_score: result.routine_score,
          sub_scores: result.sub_scores,
          counterfactuals: result.counterfactuals,
          inputs: healthInputs,
          report: result.report ?? null,
        })
        .select("id")
        .single()

      // Save baseline report entry
      const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      await supabase.from("saved_reports").insert({
        user_id: user.id,
        score_log_id: logData?.id ?? null,
        title: `Baseline Analysis · ${today} · Score ${Math.round(result.routine_score)}`,
        notes: "",
      })

      // Create/update streak
      const todayStr = localDateString()
      const { data: existingStreak } = await supabase
        .from("streaks")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!existingStreak) {
        await supabase.from("streaks").insert({
          user_id: user.id,
          current_streak: 1,
          best_streak: 1,
          last_submission_date: todayStr,
        })
      } else {
        await supabase.from("streaks").update({
          current_streak: 1,
          best_streak: 1,
          last_submission_date: todayStr,
          updated_at: new Date().toISOString(),
        }).eq("user_id", user.id)
      }

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setSubmitting(false)
    } finally {
      clearInterval(stepTimer)
    }
  }

  // ─── Loading overlay ────────────────────────────────────────────────────────
  if (submitting) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 flex flex-col items-center gap-6 text-center">
        <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
        <div>
          <p className="text-lg font-black text-foreground mb-1">Setting up your profile</p>
          <p className="text-sm text-muted-foreground">{LOADING_STEPS[loadingStep]}</p>
        </div>
        <div className="flex gap-1.5">
          {LOADING_STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-8 rounded-full transition-colors"
              style={{ background: i <= loadingStep ? "#22c55e" : "#252525" }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ─── Step indicator ─────────────────────────────────────────────────────────
  const StepBar = () => (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
            style={{
              background: step > s ? "#22c55e" : step === s ? "rgba(34,197,94,0.15)" : "#1a1a1a",
              border: step >= s ? "1px solid rgba(34,197,94,0.5)" : "1px solid #252525",
              color: step >= s ? "#22c55e" : "#4b5563",
            }}
          >
            {step > s ? <Check className="w-3 h-3" /> : s}
          </div>
          {s < 3 && (
            <div className="flex-1 h-px" style={{ background: step > s ? "#22c55e" : "#252525" }} />
          )}
        </div>
      ))}
    </div>
  )

  // ─── Step 1: Who You Are ────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-6">
        <StepBar />
        <div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#22c55e" }}>Step 1 of 3</span>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">Who are you?</h1>
          <p className="text-sm text-muted-foreground mt-1">Tell us about yourself so your AI report can be personalized.</p>
        </div>

        {/* Name + email row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name">
            <input
              className={inputCls}
              placeholder="e.g. Alex"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input className={inputCls + " opacity-60 cursor-not-allowed"} value={userEmail} readOnly />
          </Field>
        </div>

        {/* Occupation + grade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Occupation *">
            <input
              className={inputCls}
              placeholder="e.g. high school student, software engineer"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
          </Field>
          <Field label="Grade / Year">
            <input
              className={inputCls}
              placeholder="e.g. Junior, Grade 11, N/A"
              value={gradeYear}
              onChange={(e) => setGradeYear(e.target.value)}
            />
          </Field>
        </div>

        {/* Activity level */}
        <Field label="Activity level *">
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_LEVELS.map((lvl) => (
              <Toggle
                key={lvl}
                item={lvl}
                selected={activityLevel === lvl}
                onClick={() => setActivityLevel(activityLevel === lvl ? "" : lvl)}
              />
            ))}
          </div>
        </Field>

        {/* Life context */}
        <Field label="Life situation">
          <textarea
            className={inputCls + " resize-none"}
            rows={3}
            placeholder="e.g. AP exams in 3 weeks, training soccer twice a day, struggling to sleep"
            value={lifeContext}
            onChange={(e) => setLifeContext(e.target.value)}
          />
        </Field>

        {/* Stressors */}
        <Field label="Current stressors">
          <div className="flex flex-wrap gap-2">
            {STRESSOR_OPTIONS.map((s) => (
              <Toggle key={s} item={s} selected={stressors.includes(s)}
                onClick={() => toggle(s, stressors, setStressors)} color="red" />
            ))}
          </div>
        </Field>

        {/* Goals */}
        <Field label="Your goals">
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((g) => (
              <Toggle key={g} item={g} selected={goals.includes(g)}
                onClick={() => toggle(g, goals, setGoals)} />
            ))}
          </div>
        </Field>

        <button
          onClick={() => setStep(2)}
          disabled={!step1Valid}
          className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
          style={{ background: "#22c55e", color: "#0f0f0f" }}
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // ─── Step 2: Health Baseline ─────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-6">
        <StepBar />
        <div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#22c55e" }}>Step 2 of 3</span>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">Health baseline</h1>
          <p className="text-sm text-muted-foreground mt-1">Your typical daily habits — be honest for an accurate score.</p>
        </div>

        {/* Personal */}
        <div className="rounded-xl border border-border p-5 flex flex-col gap-5" style={{ background: "#141414" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">About You</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Age">
              <input
                type="number" min={8} max={100}
                className={inputCls}
                value={age}
                onChange={(e) => setAge(Math.max(8, Math.min(100, parseInt(e.target.value) || 8)))}
              />
            </Field>
            <Field label="Sex">
              <div className="flex rounded-lg overflow-hidden border border-border">
                {(["Male", "Female"] as const).map((s, i) => (
                  <button
                    key={s} type="button"
                    onClick={() => setSex(i as 0 | 1)}
                    className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                    style={{
                      background: sex === i ? "#22c55e" : "#1a1a1a",
                      color: sex === i ? "#0f0f0f" : "#6b7280",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Height">
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <input type="number" min={1} max={8} className={inputCls}
                    value={heightFt}
                    onChange={(e) => setHeightFt(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                  />
                  <span className="text-xs text-muted-foreground">ft</span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <input type="number" min={0} max={11} className={inputCls}
                    value={heightIn}
                    onChange={(e) => setHeightIn(Math.max(0, Math.min(11, parseInt(e.target.value) || 0)))}
                  />
                  <span className="text-xs text-muted-foreground">in</span>
                </div>
              </div>
            </Field>
            <Field label="Weight (lbs)">
              <input type="number" min={50} max={500} className={inputCls}
                value={weightLbs}
                onChange={(e) => setWeightLbs(Math.max(50, Math.min(500, parseInt(e.target.value) || 50)))}
              />
            </Field>
            <Field label="Fitness level">
              <select className={selectCls} value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)}>
                <option value="0">Beginner</option>
                <option value="1">Intermediate</option>
                <option value="2">Advanced</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Sleep */}
        <div className="rounded-xl border border-border p-5 flex flex-col gap-5" style={{ background: "#141414" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sleep</p>
          <SliderField label="Sleep last night" value={sleepHours} min={0} max={12} step={0.5}
            display={`${sleepHours}h`} onChange={setSleepHours} />
        </div>

        {/* Activity */}
        <div className="rounded-xl border border-border p-5 flex flex-col gap-5" style={{ background: "#141414" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Physical Activity</p>
          <SliderField label="Daily steps" value={steps} min={0} max={20000} step={500}
            display={steps.toLocaleString()} onChange={setSteps} />
          <SliderField label="Exercise minutes" value={exerciseMinutes} min={0} max={120} step={5}
            display={`${exerciseMinutes} min`} onChange={setExerciseMinutes} />
        </div>

        {/* Diet */}
        <div className="rounded-xl border border-border p-5 flex flex-col gap-5" style={{ background: "#141414" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Diet &amp; Nutrition</p>
          <SliderField label="Meals today" value={meals} min={1} max={6}
            display={`${meals}`} onChange={setMeals} />
          <SliderField label="Junk food meals" value={junkFoodMeals} min={0} max={5}
            display={`${junkFoodMeals}`} onChange={setJunkFoodMeals} />
          <SliderField label="Water intake" value={waterIntake} min={0} max={4} step={0.25}
            display={`${waterIntake}L`} onChange={setWaterIntake} />
          <Field label="Caloric intake (optional)">
            <input type="number" min={500} max={6000} className={inputCls}
              value={caloricIntake}
              onChange={(e) => setCaloricIntake(parseInt(e.target.value) || 2000)}
            />
          </Field>
        </div>

        {/* Mental */}
        <div className="rounded-xl border border-border p-5 flex flex-col gap-5" style={{ background: "#141414" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mental &amp; Recovery</p>
          <SliderField label="Stress level" value={stressLevel} min={1} max={10}
            display={`${stressLevel}/10`} onChange={setStressLevel} />
          <SliderField label="Screen time" value={screenTime} min={0} max={16}
            display={`${screenTime}h`} onChange={setScreenTime} />
          <SliderField label="Work/study hours" value={workHours} min={0} max={16}
            display={`${workHours}h`} onChange={setWorkHours} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 px-5 h-12 rounded-xl font-semibold text-sm border border-border text-foreground hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => setStep(3)}
            className="flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: "#22c55e", color: "#0f0f0f" }}
          >
            Review <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // ─── Step 3: Review ──────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-6">
      <StepBar />
      <div>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#22c55e" }}>Step 3 of 3</span>
        <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">Looks good?</h1>
        <p className="text-sm text-muted-foreground mt-1">Review your info, then submit to get your baseline score.</p>
      </div>

      {/* Profile summary */}
      <div className="rounded-xl border border-border p-5 flex flex-col gap-3" style={{ background: "#141414" }}>
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profile</p>
          <button onClick={() => setStep(1)} className="text-xs text-green-400 hover:text-green-300 transition-colors">Edit</button>
        </div>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
          {firstName && <div><span className="text-muted-foreground">Name: </span><span className="text-foreground font-medium">{firstName}</span></div>}
          <div><span className="text-muted-foreground">Occupation: </span><span className="text-foreground font-medium">{occupation}</span></div>
          {gradeYear && <div><span className="text-muted-foreground">Grade/Year: </span><span className="text-foreground font-medium">{gradeYear}</span></div>}
          <div><span className="text-muted-foreground">Activity: </span><span className="text-foreground font-medium">{activityLevel}</span></div>
          {lifeContext && <div className="col-span-2"><span className="text-muted-foreground">Context: </span><span className="text-foreground font-medium">{lifeContext}</span></div>}
        </div>
        {stressors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {stressors.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(239,68,68,0.10)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>{s}</span>
            ))}
          </div>
        )}
        {goals.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {goals.map((g) => (
              <span key={g} className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(34,197,94,0.10)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}>{g}</span>
            ))}
          </div>
        )}
      </div>

      {/* Health summary */}
      <div className="rounded-xl border border-border p-5 flex flex-col gap-3" style={{ background: "#141414" }}>
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Health Metrics</p>
          <button onClick={() => setStep(2)} className="text-xs text-green-400 hover:text-green-300 transition-colors">Edit</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm">
          <div><span className="text-muted-foreground">Age: </span><span className="font-medium text-foreground">{age}</span></div>
          <div><span className="text-muted-foreground">Sex: </span><span className="font-medium text-foreground">{sex === 0 ? "Male" : "Female"}</span></div>
          <div><span className="text-muted-foreground">Height: </span><span className="font-medium text-foreground">{heightFt}&#39;{heightIn}&quot;</span></div>
          <div><span className="text-muted-foreground">Weight: </span><span className="font-medium text-foreground">{weightLbs} lbs</span></div>
          <div><span className="text-muted-foreground">Fitness: </span><span className="font-medium text-foreground">{FITNESS_LABELS[fitnessLevel]}</span></div>
          <div><span className="text-muted-foreground">Sleep: </span><span className="font-medium text-foreground">{sleepHours}h</span></div>
          <div><span className="text-muted-foreground">Steps: </span><span className="font-medium text-foreground">{steps.toLocaleString()}</span></div>
          <div><span className="text-muted-foreground">Exercise: </span><span className="font-medium text-foreground">{exerciseMinutes} min</span></div>
          <div><span className="text-muted-foreground">Stress: </span><span className="font-medium text-foreground">{stressLevel}/10</span></div>
          <div><span className="text-muted-foreground">Water: </span><span className="font-medium text-foreground">{waterIntake}L</span></div>
          <div><span className="text-muted-foreground">Meals: </span><span className="font-medium text-foreground">{meals}</span></div>
          <div><span className="text-muted-foreground">Screen: </span><span className="font-medium text-foreground">{screenTime}h</span></div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-1.5 px-5 h-12 rounded-xl font-semibold text-sm border border-border text-foreground hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{ background: "#22c55e", color: "#0f0f0f" }}
        >
          Submit &amp; get my score →
        </button>
      </div>
    </div>
  )
}
