"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { getSiteURL } from "@/utils/url";
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    console.log('Navigating to signup page...');
    router.push('/signup');
  };

  const handleForgotPassword = async () => {
    setIsResettingPassword(true);
    try {
      const redirectUrl = `${getSiteURL()}/auth/confirm?next=/update-password`;
      console.log('Password Reset: Using redirect URL -', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
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
    <div className="min-h-screen text-white flex items-center">
      <div className="m-auto w-full max-w-md px-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-white">Welcome to AI Emojis</CardTitle>
            <CardDescription className="text-zinc-300 text-center">Sign in or create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  autoComplete="email"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-zinc-300 hover:text-white w-full text-right"
                  onClick={handleForgotPassword}
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? "Sending reset link..." : "Forgot your password?"}
                </Button>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{error}</div>
              )}

              {message && (
                <div className="text-green-500 text-sm text-center bg-green-900/20 p-2 rounded">{message}</div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-zinc-300">Or continue with</span>
              </div>
            </div>

            <GoogleSignInButton />

            <div className="text-center mt-4">
              <Button
                variant="link"
                className="text-zinc-300 hover:text-white"
                onClick={handleSignUp}
              >
                Don&apos;t have an account? Create one
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

