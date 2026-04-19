"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import {
  Activity,
  LayoutDashboard,
  History,
  User as UserIcon,
  LogOut,
  Calendar,
  Zap,
  FileText,
} from "lucide-react"

const desktopNavItems = [
  { href: "/dashboard",          label: "Home",     icon: LayoutDashboard },
  { href: "/dashboard/checkin",  label: "Today",    icon: Zap },
  { href: "/dashboard/history",  label: "Progress", icon: History },
  { href: "/dashboard/planner",  label: "Plan",     icon: Calendar },
  { href: "/dashboard/reports",  label: "Reports",  icon: FileText },
  { href: "/dashboard/profile",  label: "Profile",  icon: UserIcon },
]

const mobileNavItems = [
  { href: "/dashboard",          label: "Home",     icon: LayoutDashboard },
  { href: "/dashboard/checkin",  label: "Today",    icon: Zap },
  { href: "/dashboard/history",  label: "Progress", icon: History },
  { href: "/dashboard/reports",  label: "Reports",  icon: FileText },
  { href: "/dashboard/profile",  label: "Profile",  icon: UserIcon },
]

export function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col border-r border-border min-h-screen sticky top-0 h-screen"
        style={{ width: 240, background: "#141414" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-7 border-b border-border">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#22c55e" }}
          >
            <Activity className="w-4 h-4" style={{ color: "#0f0f0f" }} />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">velora</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {desktopNavItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: active ? "rgba(34,197,94,0.10)" : "transparent",
                  border: active ? "1px solid rgba(34,197,94,0.25)" : "1px solid transparent",
                  color: active ? "#22c55e" : "#6b7280",
                }}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border mb-1"
            style={{ background: "#1a1a1a" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{
                background: "rgba(34,197,94,0.10)",
                border: "1.5px solid #22c55e",
                color: "#22c55e",
              }}
            >
              {(user.email ?? "U")[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-foreground truncate">
                {user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav (4 items) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border flex items-center justify-around px-2 py-2"
        style={{ background: "#141414" }}
      >
        {mobileNavItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors"
              style={{ color: active ? "#22c55e" : "#4b5563" }}
            >
              <Icon style={{ width: 22, height: 22 }} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
