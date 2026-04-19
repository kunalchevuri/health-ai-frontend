import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Activity } from "lucide-react"

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth")

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.07) 0%, transparent 60%)" }}
    >
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#22c55e" }}>
          <Activity className="w-4 h-4" style={{ color: "#0f0f0f" }} />
        </div>
        <span className="text-xl font-black tracking-tight">velora</span>
      </div>
      <div className="w-full max-w-lg">
        {children}
      </div>
    </div>
  )
}
