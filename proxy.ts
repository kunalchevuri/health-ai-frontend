import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: do not add any logic between createServerClient and getUser()
  // A stale session will cause an infinite redirect loop
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect /dashboard: unauthenticated users go to /auth
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Protect /onboarding: returning users (who completed onboarding) go to /dashboard.
  // We detect "onboarding complete" via user_metadata set during the analyze step —
  // this avoids a DB query on every request. The auth callback handles the initial
  // routing from login; this guard only blocks direct URL access by returning users.
  if (
    pathname.startsWith('/onboarding') &&
    user?.user_metadata?.onboarding_complete === true
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect /onboarding: unauthenticated users cannot reach it directly
  if (pathname.startsWith('/onboarding') && !user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
