"use client"

import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Counterfactual {
  label: string
  predicted_score: number
  delta: number
}

interface CounterfactualsProps {
  counterfactuals: Counterfactual[]
  baseScore: number
}

export function Counterfactuals({ counterfactuals, baseScore }: CounterfactualsProps) {
  const isCombine = (label: string) =>
    label.toLowerCase().includes("combine") && label.toLowerCase().includes("top")

  const sorted = [...counterfactuals].sort((a, b) => {
    const aCombine = isCombine(a.label)
    const bCombine = isCombine(b.label)
    if (aCombine && !bCombine) return 1
    if (!aCombine && bCombine) return -1
    return b.delta - a.delta
  })

  const maxDelta = Math.max(...sorted.map((c) => c.delta), 1)

  return (
    <Card style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderRadius: "0.75rem" }}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <TrendingUp className="h-5 w-5 text-primary" />
          Ways to Improve Your Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.map((cf) => (
          <div
            key={cf.label}
            className="rounded-lg p-3"
            style={{
              border: isCombine(cf.label) ? "1px solid #22c55e" : "1px solid #2a2a2a",
              backgroundColor: isCombine(cf.label) ? "#22c55e0d" : "transparent",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground font-medium">{cf.label}</span>
              <span className="text-sm font-bold text-primary flex-shrink-0 ml-3">
                +{cf.delta.toFixed(1)} ↑
              </span>
            </div>
            <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#262626" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(cf.delta / maxDelta) * 100}%`,
                  backgroundColor: "#22c55e",
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
