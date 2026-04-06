"use client"

import { FileText } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AiReportProps {
  report: string
}

export function AiReport({ report }: AiReportProps) {
  return (
    <Card style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderRadius: "0.75rem" }}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          AI Health Analysis Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-lg font-bold text-foreground mb-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-bold text-foreground mb-2 mt-4">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-bold text-foreground mb-1 mt-3">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-sm mb-3" style={{ color: "#a3a3a3" }}>{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-sm" style={{ color: "#a3a3a3" }}>{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-primary pl-4 italic" style={{ color: "#a3a3a3" }}>
                  {children}
                </blockquote>
              ),
            }}
          >
            {report}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
