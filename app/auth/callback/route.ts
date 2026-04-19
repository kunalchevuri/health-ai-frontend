import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const redirect = await getSmartRedirect(supabase, user.id)
        return NextResponse.redirect(`${origin}${redirect}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth`)
}

async function getSmartRedirect(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string> {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("occupation")
    .eq("id", userId)
    .single()

  if (!profile?.occupation) return "/onboarding/profile"

  const { data: logs } = await supabase
    .from("score_logs")
    .select("id")
    .eq("user_id", userId)
    .not("routine_score", "is", null)
    .limit(1)

  if (!logs || logs.length === 0) return "/onboarding/analyze"

  return "/dashboard"
}
