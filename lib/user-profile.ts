import { createClient } from "@/lib/supabase/server"

export interface UserProfile {
  id: string
  occupation: string | null
  user_context: string | null
  grade_year: string | null
  activity_level: string | null
  goals: string[] | null
  stressors: string[] | null
  life_context: string | null
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single()
  if (error) return null
  return data as UserProfile
}
