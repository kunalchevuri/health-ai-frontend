"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Sparkles,
  ArrowRight,
  Shield,
  Brain,
  TrendingUp,
  Lightbulb,
  ClipboardList,
  Zap,
  Heart,
} from "lucide-react"

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? {
              backgroundColor: "color-mix(in srgb, var(--background) 80%, transparent)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid var(--border)",
            }
          : undefined
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Activity size={24} style={{ color: "#22c55e" }} />
          <span className="font-bold text-xl text-foreground">Velora</span>
        </div>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="hidden md:inline-flex items-center border border-border text-foreground hover:bg-accent px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── FeatureCard ─────────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
}

function FeatureCard({ icon: Icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:border-green-500/50 transition-colors">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: gradient }}
      >
        <Icon size={22} className="text-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ─── StepCard ────────────────────────────────────────────────────────────────

interface StepCardProps {
  step: number
  title: string
  description: string
  icon: LucideIcon
}

function StepCard({ step, title, description, icon: Icon }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-lg">
        {step}
      </div>
      <Icon size={20} className="text-muted-foreground" />
      <div>
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ─── HeroSection ─────────────────────────────────────────────────────────────

function HeroSection() {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      className="min-h-screen flex flex-col justify-center pt-20"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(34, 197, 94, 0.12) 0%, transparent 60%)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium mb-2">
          <Sparkles size={14} />
          AI-Powered Health Intelligence
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight text-foreground">
          Know your body.
          <br />
          <span className="text-green-400">Optimize your life.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Velora analyzes your daily health habits and delivers an AI-powered score, personalized
          insights, and actionable recommendations — so you can feel your best every day.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-2">
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-base transition-colors"
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
          <button
            onClick={scrollToHowItWorks}
            className="inline-flex items-center border border-border hover:bg-accent text-foreground px-8 py-3 rounded-xl font-semibold text-base transition-colors"
          >
            See How It Works
          </button>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Shield size={14} style={{ color: "#22c55e" }} />
          Free to use · No credit card required · Your data stays private
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 mt-8 pt-8 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">10,000+</div>
            <div className="text-sm text-muted-foreground">Health analyses run</div>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">4.9★</div>
            <div className="text-sm text-muted-foreground">Average rating</div>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">94%</div>
            <div className="text-sm text-muted-foreground">Report improvement after 30 days</div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FeaturesSection ─────────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6">
      <div className="text-center mb-16">
        <p className="text-green-400 text-sm font-semibold uppercase tracking-wider mb-3">
          What Velora does
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Everything you need to optimize your health
        </h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Built for people who want real data about their health, not generic advice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <FeatureCard
          icon={Brain}
          title="AI Health Score"
          description="Get a personalized score from 0–100 based on your real daily habits — sleep, activity, diet, stress, and more."
          gradient="linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))"
        />
        <FeatureCard
          icon={TrendingUp}
          title="Trend Tracking"
          description="Log your habits daily and watch your score evolve over time. See exactly what's improving and what needs work."
          gradient="linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))"
        />
        <FeatureCard
          icon={Lightbulb}
          title="Smart Insights"
          description="Receive AI-generated tips tailored to your unique profile — not generic health advice, but insights built for you."
          gradient="linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))"
        />
      </div>
    </section>
  )
}

// ─── HowItWorksSection ───────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-4 sm:px-6 border-t border-b border-border"
      style={{ backgroundColor: "color-mix(in srgb, var(--card) 30%, transparent)" }}
    >
      <div className="text-center mb-16">
        <p className="text-green-400 text-sm font-semibold uppercase tracking-wider mb-3">
          Simple process
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Up and running in minutes
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <StepCard
          step={1}
          icon={ClipboardList}
          title="Log your habits"
          description="Fill out a quick 5-minute form about your daily sleep, activity, diet, stress, and lifestyle."
        />
        <StepCard
          step={2}
          icon={Zap}
          title="Get your score"
          description="Our AI model instantly calculates your personalized health score with detailed sub-scores across 5 categories."
        />
        <StepCard
          step={3}
          icon={TrendingUp}
          title="Track and improve"
          description="Log daily, watch your trends, and follow AI-generated tips to steadily improve your overall wellness."
        />
      </div>
    </section>
  )
}

// ─── CTASection ──────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-12 flex flex-col items-center gap-6">
          <Heart size={40} className="text-green-400" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Ready to feel your best?
          </h2>
          <p className="text-muted-foreground text-lg">
            Join Velora today and start understanding your health like never before.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Start for Free
            <ArrowRight size={18} />
          </Link>
          <p className="text-sm text-muted-foreground">No credit card required. Free forever.</p>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity size={20} style={{ color: "#22c55e" }} />
          <span className="font-bold text-foreground">Velora</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2025 Velora. All rights reserved.</p>
      </div>
    </footer>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  )
}
