"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check if user is authenticated and in password reset flow
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUserEmail(user.email || null);
      }
    };
    checkAuth();
  }, [router, supabase.auth]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setMessage("Password updated successfully!");
      // Redirect to home page after a short delay
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-white">Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  value={userEmail || ''}
                  disabled
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-400 cursor-not-allowed"
                />
                <Input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800/50 border border-zinc-700 text-lg placeholder-zinc-500 focus-visible:ring-purple-500 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:border-purple-500"
                  autoComplete="new-password"
                />
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-zinc-800/50 border border-zinc-700 text-lg placeholder-zinc-500 focus-visible:ring-purple-500 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:border-purple-500"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-500/10 p-4 rounded-lg">{error}</div>
              )}

              {message && (
                <div className="text-green-500 text-sm text-center bg-green-500/10 p-4 rounded-lg">{message}</div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Updating password..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 