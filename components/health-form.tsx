"use client"

import { useState } from "react"
import { Activity, Moon, Footprints, Utensils, Monitor, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface HealthFormProps {
  // page.tsx types this as Record<string, number>; we cast when calling
  onSubmit: (data: Record<string, number>) => void
  isLoading: boolean
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  displayValue,
  onChange,
  disabled = false,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  displayValue: string
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <span className="text-sm font-medium text-primary">{displayValue}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        disabled={disabled}
        className={disabled ? "opacity-40" : ""}
      />
    </div>
  )
}

export function HealthForm({ onSubmit, isLoading }: HealthFormProps) {
  const [age, setAge] = useState(30)
  const [sex, setSex] = useState(0)
  const [fitnessLevel, setFitnessLevel] = useState("1")
  const [heightFt, setHeightFt] = useState(5)
  const [heightIn, setHeightIn] = useState(8)
  const [weightLbs, setWeightLbs] = useState(150)

  const [sleepHours, setSleepHours] = useState(7)
  const [sleepConsistencyEnabled, setSleepConsistencyEnabled] = useState(false)
  const [sleepConsistency, setSleepConsistency] = useState(70)

  const [steps, setSteps] = useState(8000)
  const [exerciseMinutes, setExerciseMinutes] = useState(30)

  const [meals, setMeals] = useState(3)
  const [junkFoodMeals, setJunkFoodMeals] = useState(1)
  const [waterIntake, setWaterIntake] = useState(2)
  const [caloricIntake, setCaloricIntake] = useState(2000)

  const [screenTime, setScreenTime] = useState(6)
  const [workHours, setWorkHours] = useState(8)
  const [stressLevel, setStressLevel] = useState(5)

  const [occupation, setOccupation] = useState("")
  const [userContext, setUserContext] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      age,
      sex,
      sleep_hours: sleepHours,
      steps,
      exercise_minutes: exerciseMinutes,
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
      sleep_consistency: sleepConsistencyEnabled ? sleepConsistency : null,
      occupation,
      user_context: userContext,
    }
    onSubmit(payload as unknown as Record<string, number>)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Activity className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Health Routine Analyzer</h2>
        <p className="text-muted-foreground mt-1">
          Fill in your daily habits to get personalized health insights
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: About You */}
        <Card style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderRadius: "0.75rem" }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5 text-primary" />
              About You
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Occupation</Label>
              <Input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. high school student, software engineer"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Context</Label>
                <span className="text-xs text-muted-foreground">{userContext.length}/200</span>
              </div>
              <Textarea
                value={userContext}
                onChange={(e) => setUserContext(e.target.value.slice(0, 200))}
                placeholder="e.g. I train twice a day, I have AP exams coming up"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Personal Information */}
        <Card style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderRadius: "0.75rem" }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SliderRow
              label="Age"
              value={age}
              min={1}
              max={100}
              displayValue={`${age} years`}
              onChange={setAge}
            />
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Height</Label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    value={heightFt}
                    onChange={(e) => setHeightFt(Math.min(8, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">ft</span>
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    type="number"
                    min={0}
                    max={11}
                    value={heightIn}
                    onChange={(e) => setHeightIn(Math.min(11, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">in</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Weight (lbs)</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={weightLbs}
                onChange={(e) => setWeightLbs(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Sex</Label>
              <div className="flex rounded-md border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSex(0)}
                  className="flex-1 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: sex === 0 ? "#22c55e" : "#262626",
                    color: sex === 0 ? "#0f0f0f" : "#a3a3a3",
                  }}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setSex(1)}
                  className="flex-1 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: sex === 1 ? "#22c55e" : "#262626",
                    color: sex === 1 ? "#0f0f0f" : "#a3a3a3",
                  }}
                >
                  Female
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Fitness Level</Label>
              <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Beginner</SelectItem>
                  <SelectItem value="1">Intermediate</SelectItem>
                  <SelectItem value="2">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Sleep */}
        <Card style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderRadius: "0.75rem" }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Moon className="h-5 w-5 text-primary" />
              Sleep
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SliderRow
              label="Sleep Hours"
              value={sleepHours}
              min={0}
              max={12}
              step={0.5}
              displayValue={`${sleepHours} hrs`}
              onChange={setSleepHours}
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Sleep Consistency (optional)</Label>
                <Switch
                  checked={sleepConsistencyEnabled}
                  onCheckedChange={setSleepConsistencyEnabled}
                />
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[sleepConsistency]}
                onValueChange={(v) => setSleepConsistency(v[0])}
                disabled={!sleepConsistencyEnabled}
                className={!sleepConsistencyEnabled ? "opacity-40" : ""}
              />
              {sleepConsistencyEnabled && (
                <span className="text-sm font-medium text-primary text-right">
                  {sleepConsistency}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Physical Activity */}
        <Card style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderRadius: "0.75rem" }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Footprints className="h-5 w-5 text-primary" />
              Physical Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SliderRow
              label="Daily Steps"
              value={steps}
              min={0}
              max={20000}
              step={500}
              displayValue={steps.toLocaleString()}
              onChange={setSteps}
            />
            <SliderRow
              label="Exercise Minutes"
              value={exerciseMinutes}
              min={0}
              max={180}
              step={5}
              displayValue={`${exerciseMinutes} min`}
              onChange={setExerciseMinutes}
            />
          </CardContent>
        </Card>

        {/* Card 4: Diet & Nutrition */}
        <Card style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderRadius: "0.75rem" }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Utensils className="h-5 w-5 text-primary" />
              Diet &amp; Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SliderRow
              label="Meals per Day"
              value={meals}
              min={1}
              max={6}
              displayValue={`${meals}`}
              onChange={setMeals}
            />
            <SliderRow
              label="Junk Food Meals"
              value={junkFoodMeals}
              min={0}
              max={6}
              displayValue={`${junkFoodMeals}`}
              onChange={setJunkFoodMeals}
            />
            <SliderRow
              label="Water Intake"
              value={waterIntake}
              min={0}
              max={5}
              step={0.25}
              displayValue={`${waterIntake} L`}
              onChange={setWaterIntake}
            />
            <SliderRow
              label="Caloric Intake"
              value={caloricIntake}
              min={500}
              max={5000}
              step={100}
              displayValue={`${caloricIntake} kcal`}
              onChange={setCaloricIntake}
            />
          </CardContent>
        </Card>

        {/* Card 5: Lifestyle */}
        <Card style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderRadius: "0.75rem" }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Monitor className="h-5 w-5 text-primary" />
              Lifestyle
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SliderRow
              label="Screen Time"
              value={screenTime}
              min={0}
              max={16}
              step={0.5}
              displayValue={`${screenTime} hrs`}
              onChange={setScreenTime}
            />
            <SliderRow
              label="Work Hours"
              value={workHours}
              min={0}
              max={16}
              step={0.5}
              displayValue={`${workHours} hrs`}
              onChange={setWorkHours}
            />
            <SliderRow
              label="Stress Level"
              value={stressLevel}
              min={0}
              max={10}
              displayValue={`${stressLevel}/10`}
              onChange={setStressLevel}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold"
          style={{ backgroundColor: "#22c55e", color: "#0f0f0f" }}
        >
          {isLoading ? "Analyzing..." : "Analyze My Health Routine"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Your data is processed securely and not stored. Results are for informational purposes only.
        </p>
      </form>
    </div>
  )
}
