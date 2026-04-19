"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Activity, ArrowLeft, AlertCircle, Loader2, CheckCircle } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const switchTab = (tab: "signin" | "signup") => {
    setActiveTab(tab)
    setError(null)
    setLoading(false)
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setSignUpSuccess(false)
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.refresh()
      // Smart redirect: check profile completion
      const userId = data.user?.id
      if (userId) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("occupation")
          .eq("id", userId)
          .single()
        if (!profile?.occupation) {
          router.push("/onboarding/profile")
          return
        }
        const { data: logs } = await supabase
          .from("score_logs")
          .select("id")
          .eq("user_id", userId)
          .not("routine_score", "is", null)
          .limit(1)
        if (!logs || logs.length === 0) {
          router.push("/onboarding/analyze")
          return
        }
      }
      router.push("/dashboard")
    }
  }

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setError(null)
      setSignUpSuccess(true)
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(34, 197, 94, 0.08) 0%, transparent 60%)",
      }}
    >
      {/* Back link */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      {/* Main card */}
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 flex flex-col gap-6">
        {/* Card header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity size={20} style={{ color: "#22c55e" }} />
            <span className="font-bold text-foreground">Velora</span>
          </div>
          <h1 className="text-2xl font-bold text-center text-foreground">Welcome to Velora</h1>
          <p className="text-sm text-muted-foreground text-center">
            Track your health. Optimize your life.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex rounded-xl border border-border p-1 gap-1">
          <button
            onClick={() => switchTab("signin")}
            className={
              activeTab === "signin"
                ? "flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-background text-foreground shadow-sm transition-colors"
                : "flex-1 py-2 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            Sign In
          </button>
          <button
            onClick={() => switchTab("signup")}
            className={
              activeTab === "signup"
                ? "flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-background text-foreground shadow-sm transition-colors"
                : "flex-1 py-2 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            Sign Up
          </button>
        </div>

        {/* Sign In form */}
        {activeTab === "signin" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        )}

        {/* Sign Up form */}
        {activeTab === "signup" && (
          <>
            {signUpSuccess ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">Check your email!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We sent a confirmation link to{" "}
                    <span className="text-foreground font-medium">{email}</span>. Click it to
                    activate your account.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSignUpSuccess(false)
                    switchTab("signin")
                  }}
                  className="text-sm text-green-400 hover:text-green-300 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors text-sm"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google OAuth button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-foreground font-medium text-sm transition-colors flex items-center justify-center gap-3"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )
}
