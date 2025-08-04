
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { sendPasswordReset } from "@/lib/auth.ts";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import LoadingSpinner from "@/components/layout/loading-spinner";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for instructions to reset your password.",
      });
      setIsSent(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Sending reset link..." />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900/10 py-12 px-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <KeyRound className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="text-2xl font-headline">Forgot Password</CardTitle>
          <CardDescription>
            {isSent 
              ? "A reset link has been sent to your email."
              : "Enter your email and we'll send you a link to reset your password."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSent ? (
            <form onSubmit={handleResetPassword}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Reset Link
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Didn't receive an email? Check your spam folder or try again.
              </p>
              <Button onClick={() => setIsSent(false)} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          )}
           <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline">
              Back to Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
