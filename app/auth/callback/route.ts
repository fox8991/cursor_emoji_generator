import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * OAuth Callback Handler
 * 
 * This route handles the callback from OAuth providers (e.g., Google Sign-In).
 * When a user signs in with Google:
 * 1. They are redirected to Google's sign-in page
 * 2. After successful sign-in, Google redirects back to this route with an auth code
 * 3. We exchange this code for a session using Supabase
 * 4. User is redirected to the app with an active session
 * 
 * URL Pattern: /auth/callback?code={auth_code}&provider=google
 */

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 