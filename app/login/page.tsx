"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { getSiteURL } from "@/utils/url";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in error:', error);

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('Invalid email or password. If you signed up with Google, please use the "Sign in with Google" button below. Or click "Forgot your password?" if you need to reset it.');
          return;
        }
        throw error;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleSignUp = () => {
    console.log('Navigating to signup page...');
    router.push('/signup');
  };

  const handleForgotPassword = async () => {
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getSiteURL()}/auth/confirm?next=/update-password`,
      });

      if (error) {
        throw error;
      }

      setMessage("Check your email for a password reset link.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="m-auto w-full max-w-md space-y-8 px-4">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Welcome to AI Emojis</h1>
          <p className="text-gray-400">Sign in or create an account</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
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
            <Button
              type="button"
              variant="link"
              className="text-sm text-gray-400 hover:text-white w-full text-right"
              onClick={handleForgotPassword}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? "Sending reset link..." : "Forgot your password?"}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {message && (
            <div className="text-green-500 text-sm text-center">{message}</div>
          )}

          <Button type="submit" className="w-full">
            Sign in
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
            onClick={handleSignUp}
          >
            Don&apos;t have an account? Create one
          </Button>
        </div>
      </div>
    </div>
  );
} 