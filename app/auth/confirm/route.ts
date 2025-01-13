import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Email Confirmation Handler
 * 
 * This route handles all email-based authentication flows:
 * 1. Email Verification: When a new user signs up with email/password
 * 2. Password Reset: When a user requests to reset their password
 * 
 * The flow works as follows:
 * 1. User receives an email with a secure token (from signup or password reset)
 * 2. Clicking the email link brings them to this route
 * 3. We verify the token with Supabase
 * 4. User is redirected based on the flow:
 *    - For signup: to the app with a verified account
 *    - For password reset: to the update password page
 * 
 * URL Pattern: /auth/confirm?token_hash={hash}&type={type}&next={redirect_path}
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'

  if (code) {
    const supabase = createClient()
    const supabaseClient = await supabase
    
    const { error } = await supabaseClient.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If there is no code or an error occurred, redirect to auth-code-error
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
} 