"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AuthErrorPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="m-auto w-full max-w-md px-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-white">Authentication Error</CardTitle>
            <CardDescription className="text-zinc-300 text-center">
              The authentication link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-300 text-center">
              Please try resetting your password again or contact support if the problem persists.
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              onClick={() => router.push('/login')}
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 