import { createClient } from "@/lib/supabase/server"
import { ReportsClient } from "@/components/reports-client"
import { FileText } from "lucide-react"
import Link from "next/link"

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all real score_logs that have a report field
  const { data: logs } = await supabase
    .from("score_logs")
    .select("id, routine_score, sub_scores, report, inputs, created_at")
    .not("routine_score", "is", null)
    .order("created_at", { ascending: false })

  const reportsData = (logs ?? []).filter((l) => l.report)

  if (reportsData.length === 0) {
    return (
      <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your AI-generated health reports, saved forever.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-12 text-center flex flex-col items-center gap-4">
          <FileText className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="font-bold text-foreground text-lg">No reports yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete a full analysis to generate your first AI report.
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

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {reportsData.length} report{reportsData.length !== 1 ? "s" : ""} saved
        </p>
      </div>
      <ReportsClient reports={reportsData} />
    </div>
  )
}
