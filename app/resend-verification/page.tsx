"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, XCircle, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

type ResendState = "idle" | "loading" | "success" | "error"

export default function ResendVerificationPage() {
  const { resendVerification } = useAuth()

  const [email, setEmail] = useState("")
  const [state, setState] = useState<ResendState>("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setState("error")
      setMessage("Please enter your email address")
      return
    }

    setState("loading")
    setMessage("")

    try {
      const result = await resendVerification(email.trim())

      if (result.success) {
        setState("success")
        setMessage(
          result.message ||
            "If an account exists with this email, a new verification link has been sent. Please check your inbox and spam folder."
        )
        setEmail("") // Clear form on success
      } else {
        setState("error")
        setMessage(result.message || "Failed to resend verification email. Please try again.")
      }
    } catch (error) {
      setState("error")
      setMessage("An unexpected error occurred. Please try again later.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Resend Verification Email</CardTitle>
          <CardDescription>
            Didn't receive your verification email? Enter your email address below to get a new verification link.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === "loading"}
                required
                autoFocus
              />
            </div>

            {state === "success" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="ml-2 text-green-800">{message}</AlertDescription>
              </Alert>
            )}

            {state === "error" && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="ml-2 text-red-800">{message}</AlertDescription>
              </Alert>
            )}

            {state === "success" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Check your spam folder</strong> if you don't see the email in your inbox within a few
                  minutes.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={state === "loading"}>
              {state === "loading" ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
