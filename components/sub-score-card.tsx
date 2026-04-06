"use client"

import { Moon, Activity, Utensils, Heart, Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { LucideIcon } from "lucide-react"

interface SubScoreCardProps {
  name: string
  score: number
}

const iconMap: Record<string, LucideIcon> = {
  "Sleep Quality": Moon,
  "Physical Activity": Activity,
  "Diet & Nutrition": Utensils,
  "Recovery & Stress": Heart,
  "Work-Life Balance": Briefcase,
}

function getColor(score: number): string {
  if (score < 40) return "#ef4444"
  if (score <= 70) return "#eab308"
  return "#22c55e"
}

export function SubScoreCard({ name, score }: SubScoreCardProps) {
  const Icon = iconMap[name] ?? Activity
  const color = getColor(score)

  return (
    <Card style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderRadius: "0.75rem" }}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="p-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground leading-tight">{name}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold" style={{ color }}>
                {score}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
        </div>
        <div className="mt-2 relative h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#262626" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
