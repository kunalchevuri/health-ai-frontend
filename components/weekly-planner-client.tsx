"use client"

import { useState, useEffect } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskItem {
  cat: string
  color: string
  icon: string
  task: string
  detail: string
}

interface UserContext {
  name: string
  occupation: string
  userContext: string
  activityLevel: string
  subScores: Record<string, number>
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const C = {
  green:  "#22c55e",
  blue:   "#60a5fa",
  orange: "#f97316",
  purple: "#a78bfa",
  yellow: "#eab308",
  red:    "#ef4444",
}

// ─── Plan generation ──────────────────────────────────────────────────────────

function generateWeeklyPlan(user: UserContext): TaskItem[][] {
  const occ  = (user.occupation ?? "").toLowerCase()
  const ctx  = (user.userContext ?? "").toLowerCase()
  const sub  = user.subScores ?? {}

  const isAthlete  = user.activityLevel === "athlete" || occ.includes("swim") || occ.includes("athlet")
  const hasExams   = ctx.includes("exam") || ctx.includes("ap ") || ctx.includes("test")
  const isStudent  = occ.includes("student") || occ.includes("school") || occ.includes("college")
  const sleepWeak  = (sub["Sleep Quality"] ?? 70) < 65
  const dietWeak   = (sub["Diet & Nutrition"] ?? 70) < 65
  const actWeak    = (sub["Physical Activity"] ?? 70) < 65
  const stressWeak = (sub["Recovery & Stress"] ?? 70) < 65

  const plan: TaskItem[][] = [
    // Monday
    [
      isAthlete
        ? { cat:"Training", color:C.orange, icon:"🏊", task:"Morning practice: focus on recovery form — easy pace, no max-effort sets", detail:"Conserve energy for the week ahead." }
        : actWeak
        ? { cat:"Activity", color:C.orange, icon:"🚶", task:"Start the week with a 20-min walk before your first class or commitment", detail:"Morning movement sets your energy baseline for the day." }
        : { cat:"Activity", color:C.orange, icon:"💪", task:"30-min workout — pick something you enjoy, consistency matters more than intensity", detail:"" },
      sleepWeak
        ? { cat:"Sleep", color:C.blue, icon:"🌙", task:"Bedtime alarm at 10:30 PM tonight — non-negotiable this week", detail:"You're starting a new sleep rhythm. The first 3 nights are the hardest." }
        : { cat:"Sleep", color:C.blue, icon:"🌙", task:"Maintain your sleep schedule — same bedtime as last night", detail:"Consistency is more important than total hours." },
      hasExams
        ? { cat:"Study", color:C.purple, icon:"📚", task:"Plan your study sessions for the week — block 90-min focused blocks with 15-min breaks", detail:"Use the Pomodoro method: 90-min deep work, 15-min walk or stretch, repeat." }
        : dietWeak
        ? { cat:"Nutrition", color:C.green, icon:"🥗", task:"Prep healthy snacks for Mon–Wed tonight or tomorrow morning", detail:"Reducing decision fatigue around food is the easiest diet win." }
        : { cat:"Balance", color:C.yellow, icon:"⏰", task:"Define your 'stop time' for today — when work ends, it ends", detail:"Protecting recovery time is a skill, not laziness." },
    ],
    // Tuesday
    [
      isAthlete && hasExams
        ? { cat:"Exams", color:C.purple, icon:"📖", task:"Exam prep: 2-hour focused study block in the morning before afternoon practice", detail:"Morning is your peak cognitive window — use it for your hardest material." }
        : isAthlete
        ? { cat:"Training", color:C.orange, icon:"🏊", task:"Afternoon practice: track effort levels — if stress is above 7/10, drop intensity by 20%", detail:"Overtraining under academic stress is a common injury risk." }
        : { cat:"Activity", color:C.orange, icon:"🚶", task:"Hit your step goal today — set a reminder at noon if you haven't hit 4,000 yet", detail:"" },
      dietWeak
        ? { cat:"Nutrition", color:C.green, icon:"💧", task:"2.5L water today — set a phone alarm every 2 hours as a reminder", detail:isAthlete ? "On training days, dehydration hits before you feel thirsty." : "Hydration impacts focus, mood, and appetite regulation throughout the day." }
        : { cat:"Nutrition", color:C.green, icon:"🥗", task:"Eat a full breakfast before your first commitment — no skipping", detail:"Breakfast within 1 hour of waking stabilizes cortisol and improves focus." },
      stressWeak
        ? { cat:"Recovery", color:C.purple, icon:"🧘", task:"5-min box breathing before bed: 4 counts in, hold 4, out 4, hold 4", detail:"4 repetitions activates your parasympathetic nervous system measurably." }
        : { cat:"Recovery", color:C.purple, icon:"😴", task:"No screens after 10:00 PM — blue light suppresses melatonin production", detail:"Even 30 minutes of screen-free time before bed improves sleep depth." },
    ],
    // Wednesday
    [
      hasExams
        ? { cat:"Exams", color:C.purple, icon:"📖", task:"Mid-week exam check-in: review what's left to cover and adjust your plan", detail:"Reassessing on Wednesday prevents last-minute cramming by the weekend." }
        : { cat:"Balance", color:C.yellow, icon:"⏰", task:"Mid-week reset: how are your energy levels? Adjust today's workload if needed", detail:"Listening to your body is a skill that directly impacts performance." },
      isAthlete
        ? { cat:"Training", color:C.orange, icon:"🏊", task:"Recovery-focused practice — technique drills only, no sprint sets", detail:"Wednesday recovery prevents cumulative fatigue from building into the weekend." }
        : actWeak
        ? { cat:"Activity", color:C.orange, icon:"🚶", task:"Lunchtime walk — 15 minutes outside, no phone", detail:"Midday movement is the single best intervention for afternoon energy slumps." }
        : { cat:"Activity", color:C.orange, icon:"💪", task:"Active recovery: yoga, stretching, or a light walk", detail:"" },
      dietWeak
        ? { cat:"Nutrition", color:C.green, icon:"🥗", task:"Swap one junk food choice today for a whole-food alternative", detail:"One swap per day over a week creates a measurable difference." }
        : sleepWeak
        ? { cat:"Sleep", color:C.blue, icon:"🌙", task:"Earlier dinner tonight (before 7:30 PM) — late eating disrupts sleep quality", detail:"Digestion competes with sleep restoration when meals are too close to bedtime." }
        : { cat:"Recovery", color:C.purple, icon:"🧘", task:"10-min meditation or breathing practice", detail:"" },
    ],
    // Thursday
    [
      hasExams
        ? { cat:"Exams", color:C.purple, icon:"📚", task:"Final exam prep push — prioritize weakest subjects today", detail:"Your brain consolidates memory during sleep. Studying tonight + sleeping well beats an all-nighter." }
        : isStudent
        ? { cat:"Study", color:C.purple, icon:"📚", task:"Complete any outstanding assignments before Friday", detail:"Clearing your plate by Thursday frees up mental energy for the weekend." }
        : { cat:"Balance", color:C.yellow, icon:"⏰", task:"Protect your personal hour tonight — no work, no school content", detail:"" },
      isAthlete
        ? { cat:"Training", color:C.orange, icon:"🏊", task:"Pre-weekend prep: lighter session, focus on starts and turns only", detail:"Sharpening technique rather than building fatigue heading into Friday." }
        : { cat:"Activity", color:C.orange, icon:"🚶", task:"Evening walk or bike ride — 20 to 30 minutes", detail:"Thursday movement sets up better sleep before the end of the week." },
      stressWeak
        ? { cat:"Recovery", color:C.purple, icon:"🧘", task:"Stress audit: what's worrying you most right now? Write it down and set it aside until tomorrow", detail:"Externalizing worry reduces rumination during sleep, measurably improving sleep quality." }
        : { cat:"Nutrition", color:C.green, icon:"💧", task:"Water check: have you hit 2L today? If not, drink 500ml before bed", detail:"" },
    ],
    // Friday
    [
      isAthlete && hasExams
        ? { cat:"Exams", color:C.purple, icon:"📖", task:"If exams are today — eat a full breakfast and avoid caffeine after noon", detail:"Pre-exam nutrition directly impacts working memory and processing speed." }
        : isAthlete
        ? { cat:"Training", color:C.orange, icon:"🏊", task:"High-effort session if energy is good — taper if stress has been above 7 this week", detail:"Friday is the best day for peak-effort training if you've recovered well." }
        : { cat:"Balance", color:C.yellow, icon:"⏰", task:"Finish the week strong — protect the evening for genuine rest", detail:"Friday recovery sets up the quality of your weekend." },
      sleepWeak
        ? { cat:"Sleep", color:C.blue, icon:"🌙", task:"Don't sleep in more than 1 hour this weekend — staying close to your weekday schedule prevents Monday fatigue", detail:"Social jet lag is a real phenomenon — weekend schedule drift makes Monday harder." }
        : { cat:"Sleep", color:C.blue, icon:"🌙", task:"Aim for 8h tonight — Friday is when sleep debt from the week compounds most", detail:"" },
      dietWeak
        ? { cat:"Nutrition", color:C.green, icon:"🥗", task:"Weekend meal plan: decide now what you'll eat this weekend to avoid defaulting to junk", detail:"Decision fatigue peaks on weekends — pre-deciding meals removes the friction." }
        : { cat:"Recovery", color:C.purple, icon:"🧘", task:"End-of-week reflection: what went well this week health-wise? What needs adjusting?", detail:"Reflection is how weekly plans improve over time." },
    ],
    // Saturday
    [
      isAthlete
        ? { cat:"Training", color:C.orange, icon:"🏊", task:"Weekend practice: if optional, base it on your energy — push only if you slept well", detail:isAthlete && hasExams ? "Exam week means prioritizing sleep over extra training sessions." : "Quality over quantity this time of week." }
        : { cat:"Activity", color:C.orange, icon:"💪", task:"Longer activity today — a hike, long walk, bike ride, or a workout you enjoy", detail:"Weekends are your best opportunity for restorative physical activity." },
      hasExams
        ? { cat:"Study", color:C.purple, icon:"📚", task:"2-hour focused study session — then full break for the rest of the day", detail:"Concentrated, time-boxed study on weekends is more effective than marathon sessions." }
        : { cat:"Balance", color:C.yellow, icon:"🤝", task:"Social time today — being around people you enjoy is a measurable stress reducer", detail:"Social connection is a legitimate health intervention." },
      { cat:"Recovery", color:C.purple, icon:"😴", task:"Aim for 9h sleep tonight — weekends are your best recovery opportunity", detail:"Saturday is when your sleep debt from the week can be genuinely paid back." },
    ],
    // Sunday
    [
      { cat:"Planning", color:C.green, icon:"📋", task:"Weekly review: complete your Velora check-in and review your scores", detail:"Sunday is when you reset your context for the week ahead." },
      isAthlete
        ? { cat:"Recovery", color:C.purple, icon:"🧘", task:"Full rest day from training — walk or light stretching only", detail:"Recovery is training. Athletes who skip rest days underperform those who protect them." }
        : { cat:"Activity", color:C.orange, icon:"🚶", task:"Light movement only — a walk, some stretching", detail:"Active rest on Sunday sets up Monday energy better than complete inactivity." },
      hasExams
        ? { cat:"Prep", color:C.blue, icon:"📖", task:"Sunday night: lay out your exam/study plan for next week, then disconnect by 9 PM", detail:"The plan exists so your brain can relax. Once it's written, your work for today is done." }
        : { cat:"Prep", color:C.blue, icon:"📖", task:"Sunday reset: early dinner, early wind-down — aim for your best sleep of the week tonight", detail:"Sunday night sleep quality is the single biggest predictor of how the upcoming week feels." },
    ],
  ]

  return plan
}

function getDateForDay(dayIdx: number): number {
  const today = new Date()
  const todayDow = today.getDay()
  const todayPlanIdx = todayDow === 0 ? 6 : todayDow - 1
  const diff = dayIdx - todayPlanIdx
  const d = new Date(today)
  d.setDate(today.getDate() + diff)
  return d.getDate()
}

// ─── Component ────────────────────────────────────────────────────────────────

interface WeeklyPlannerClientProps {
  name: string
  occupation: string
  userContext: string
  activityLevel: string
  subScores: Record<string, number>
  streak: number
}

export function WeeklyPlannerClient({
  name,
  occupation,
  userContext,
  activityLevel,
  subScores,
  streak,
}: WeeklyPlannerClientProps) {
  const todayIdx = new Date().getDay()
  const todayPlanIdx = todayIdx === 0 ? 6 : todayIdx - 1

  const [selectedDay, setSelectedDay] = useState(todayPlanIdx)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("velora_planner_checks") ?? "{}")
      setChecked(saved)
    } catch { /* ignore */ }
  }, [])

  const user: UserContext = { name, occupation, userContext, activityLevel, subScores }
  const plan = generateWeeklyPlan(user)
  const hasExams = userContext.toLowerCase().includes("exam") ||
    userContext.toLowerCase().includes("ap ") ||
    userContext.toLowerCase().includes("test")

  const totalTasks = plan.flat().length
  const doneTasks = Object.values(checked).filter(Boolean).length

  const toggleCheck = (day: number, task: number) => {
    const key = `${day}-${task}`
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem("velora_planner_checks", JSON.stringify(next))
      return next
    })
  }

  const completedToday = plan[selectedDay].filter((_, i) => checked[`${selectedDay}-${i}`]).length

  return (
    <div className="flex flex-col gap-5">

      {/* Header row */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-1.5">Weekly Plan</h1>
          <p className="text-sm text-muted-foreground">Personalized to your life. Updates after each analysis.</p>
          {occupation && (
            <div className="mt-2.5">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#22c55e" }} />
                {occupation}{userContext ? ` · ${userContext}` : ""}
              </span>
            </div>
          )}
        </div>
        <div
          className="rounded-xl border border-border bg-card p-4 text-center flex-shrink-0"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">THIS WEEK</p>
          <p className="text-2xl font-black" style={{ color: "#22c55e" }}>{doneTasks}/{totalTasks}</p>
          <p className="text-xs text-muted-foreground">tasks done</p>
        </div>
      </div>

      {/* Exam banner */}
      {hasExams && (
        <div
          className="flex gap-3 items-start p-4 rounded-xl"
          style={{ background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.25)" }}
        >
          <span className="text-xl flex-shrink-0">📚</span>
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: "#a78bfa" }}>Exam period detected</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This week&apos;s plan has been adjusted for your exam schedule — study blocks are prioritized,
              training intensity is moderated, and recovery windows are protected.
            </p>
          </div>
        </div>
      )}

      {/* Day selector */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((day, i) => {
          const isToday = i === todayPlanIdx
          const sel = selectedDay === i
          const dayDone = plan[i].filter((_, j) => checked[`${i}-${j}`]).length
          const dayTotal = plan[i].length
          const allDone = dayDone === dayTotal
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className="rounded-xl py-3 px-1 text-center transition-all"
              style={{
                background: sel ? "#22c55e" : isToday ? "rgba(34,197,94,0.10)" : "#1a1a1a",
                border: `1.5px solid ${sel ? "#22c55e" : isToday ? "rgba(34,197,94,0.25)" : "#252525"}`,
              }}
            >
              <p
                className="text-[10px] font-bold uppercase mb-1"
                style={{ color: sel ? "#0f0f0f" : isToday ? "#22c55e" : "#6b7280" }}
              >
                {SHORT_DAYS[i]}
              </p>
              <p
                className="text-base font-black mb-1.5"
                style={{ color: sel ? "#0f0f0f" : isToday ? "#22c55e" : "var(--foreground)" }}
              >
                {getDateForDay(i)}
              </p>
              {allDone
                ? <span className="text-xs" style={{ color: sel ? "#0f0f0f" : "#22c55e" }}>✓</span>
                : <span className="text-[10px]" style={{ color: sel ? "rgba(0,0,0,0.5)" : "#6b7280" }}>{dayDone}/{dayTotal}</span>
              }
            </button>
          )
        })}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-black text-foreground">
            {DAYS[selectedDay]}
            {selectedDay === todayPlanIdx && (
              <span className="text-xs font-semibold ml-2.5" style={{ color: "#22c55e" }}>Today</span>
            )}
          </h2>
          <span className="text-xs text-muted-foreground">{completedToday}/{plan[selectedDay].length} done</span>
        </div>

        {plan[selectedDay].map((item, i) => {
          const key = `${selectedDay}-${i}`
          const done = !!checked[key]
          return (
            <div
              key={i}
              className="rounded-2xl border border-border flex gap-3.5 items-start p-5 transition-all"
              style={{ background: done ? "#141414" : "#1a1a1a", opacity: done ? 0.65 : 1 }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleCheck(selectedDay, i)}
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                style={{
                  border: `2px solid ${done ? "#22c55e" : "#252525"}`,
                  background: done ? "#22c55e" : "none",
                }}
              >
                {done && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#0f0f0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: `${item.color}18`,
                      border: `1px solid ${item.color}30`,
                      color: item.color,
                    }}
                  >
                    {item.icon} {item.cat}
                  </div>
                </div>
                <p
                  className="text-sm leading-snug mb-1"
                  style={{
                    color: done ? "#6b7280" : "var(--foreground)",
                    fontWeight: done ? 400 : 600,
                    textDecoration: done ? "line-through" : "none",
                  }}
                >
                  {item.task}
                </p>
                {item.detail && !done && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Streak info */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-xl">🔥</span>
          <span className="text-sm font-bold text-foreground">How streaks work</span>
          <span className="text-2xl font-black ml-auto" style={{ color: "#22c55e" }}>{streak}</span>
          <span className="text-xs text-muted-foreground">day streak</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { icon: "⚡", title: "Daily check-in", desc: "Complete a 30-second check-in to add +1 to your streak" },
            { icon: "📊", title: "Full analysis",   desc: "Running a full analysis also counts as your daily check-in" },
            { icon: "✗",  title: "Miss a day",      desc: "Missing any day resets your streak back to 0" },
          ].map((rule) => (
            <div
              key={rule.title}
              className="rounded-xl p-3.5 text-center border border-border"
              style={{ background: "#141414" }}
            >
              <div className="text-xl mb-2">{rule.icon}</div>
              <div className="text-xs font-bold text-foreground mb-1">{rule.title}</div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">{rule.desc}</div>
            </div>
          ))}
        </div>
        <div
          className="rounded-xl p-3.5 text-xs text-muted-foreground leading-relaxed"
          style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <strong style={{ color: "#22c55e" }}>Why it matters:</strong> Users who maintain a 7-day
          streak show 2.3× better score improvement over the following month. Consistency, not
          perfection, is what Velora optimizes for.
        </div>
      </div>
    </div>
  )
}
