"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { getSiteURL } from "@/utils/url";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getSiteURL()}/auth/confirm`,
        },
      });

      console.log('Supabase response:', { data, error });

      if (error) {
        throw error;
      }

      // If identities array is empty, the email exists but was registered with a different provider
      if (data?.user && data.user.identities?.length === 0) {
        setMessage('This email is already registered with a different provider. Please try signing in with Google instead.');
        return;
      }

      setMessage("Check your email for a confirmation link.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="m-auto w-full max-w-md space-y-8 px-4">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Create an Account</h1>
          <p className="text-gray-400">Sign up to get started</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-900 border-zinc-800"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-900 border-zinc-800"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {message && (
            <div className={`text-sm text-center ${
              message.includes('already registered') 
                ? 'text-yellow-500' 
                : 'text-green-500'
            }`}>
              {message}
            </div>
          )}

          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black text-gray-400">Or continue with</span>
          </div>
        </div>

        <GoogleSignInButton />

        <div className="text-center">
          <Button
            variant="link"
            className="text-gray-400 hover:text-white"
            onClick={() => router.push('/login')}
          >
            Already have an account? Sign in
          </Button>
        </div>
      </div>
    </div>
  );
} 