# Authentication Implementation Guide

## Overview
This guide outlines the implementation of authentication in a Next.js application using Supabase Auth, including email/password and Google OAuth sign-in methods.

> **Note**: This implementation follows [Supabase Auth Documentation](https://supabase.com/docs/guides/auth). Please refer to their documentation for the most up-to-date implementation details and best practices.

## Features
- Email/password authentication
- Google OAuth sign-in
- Password reset functionality
- Optional user metadata (name)
- Session management
- Protected routes

## Setup Steps

### 1. Install Dependencies
```bash
npm install @supabase/ssr
```

### 2. Environment Variables
Required environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Utility Functions

#### Browser Client (utils/supabase/client.ts)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### Server Client (utils/supabase/server.ts)
> **Important**: Refer to [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side) for the complete implementation of the server client.

Key functionality includes:
- Creating a server-side Supabase client
- Handling cookies for session management
- Managing server-side authentication state

#### Site URL Utility (utils/url.ts)
```typescript
export function getSiteURL() {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || '';
}
```

### 4. Middleware Implementation

#### Root Middleware (middleware.ts)
> **Important**: Refer to [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers) for the complete middleware implementation.

Key functionality includes:
- Protecting routes
- Updating sessions
- Handling redirects for unauthenticated users

#### Auth Middleware (utils/supabase/middleware.ts)
> **Important**: Refer to [Supabase Middleware Documentation](https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware) for the complete auth middleware implementation.

Key functionality includes:
- Session management
- Token refresh
- Error handling

### 5. Authentication Routes

#### Confirmation Route (app/auth/confirm/route.ts)
Handles email verification and password reset confirmations:
```typescript
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') || '/'

  if (token_hash && type) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}
```

## Implementation Details

### Sign Up Process
1. Collect user information (email, password, optional name)
2. Validate password (minimum 6 characters)
3. Handle existing accounts gracefully
4. Send confirmation email
5. Redirect after confirmation

### Sign In Process
1. Support both email/password and Google OAuth
2. Handle provider-specific errors
3. Provide clear feedback for wrong credentials
4. Support password reset flow

### Password Reset Flow
1. User requests reset
2. Send reset email
3. User clicks link
4. Redirect to password update page
5. Update password and sign in

## Key Learnings & Pitfalls

### Redirect URLs
- Use `getSiteURL()` utility for dynamic redirect URLs
- Configure multiple redirect URLs in Supabase dashboard for development/production
- Avoid hardcoding URLs in the code

### Error Handling
- Provide clear messages for common scenarios:
  - Already registered emails
  - Wrong provider usage
  - Invalid credentials
- Use appropriate message styling (red for errors, yellow for warnings, green for success)

### Loading States
- Implement loading states for all async operations
- Disable buttons during loading
- Use consistent loading indicators (Loader2 from lucide-react)

### Form Validation
- Validate passwords client-side before submission
- Optional fields (like name) should be properly handled
- Use appropriate autocomplete attributes for better UX

### Environment Configuration
- Set up proper environment variables for different environments
- Handle development vs production URLs correctly
- Configure Supabase project settings appropriately

### Google OAuth Setup
1. Create Google Cloud Project
2. Enable Google Identity Platform
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add authorized redirect URLs in both Google Cloud and Supabase

## Security Considerations
- Use HTTPS in production
- Implement proper session management
- Protect sensitive routes with middleware
- Never expose API keys or secrets
- Use appropriate autocomplete attributes
- Implement rate limiting for auth attempts

## UI Components
- Use consistent styling across auth forms
- Implement proper loading states
- Show clear error messages
- Provide feedback for all user actions
- Use appropriate input types and autocomplete attributes

## Testing Checklist
- Sign up with new email
- Sign in with existing email
- Sign in with Google
- Password reset flow
- Invalid credentials handling
- Loading states
- Error messages
- Redirect handling
- Protected routes
- Session management

