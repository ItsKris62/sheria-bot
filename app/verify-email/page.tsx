"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, XCircle, Mail } from "lucide-react"
import Link from "next/link"

type VerificationState = "loading" | "success" | "error"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyEmail } = useAuth()

  const [state, setState] = useState<VerificationState>("loading")
  const [message, setMessage] = useState<string>("")
  const [email, setEmail] = useState<string>("")

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setState("error")
      setMessage("No verification token provided. Please check your email link.")
      return
    }

    const verify = async () => {
      try {
        const result = await verifyEmail(token)

        if (result.success) {
          setState("success")
          setMessage(result.message || "Email verified successfully!")

          // Auto-redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?verified=true")
          }, 3000)
        } else {
          setState("error")
          setMessage(result.message || "Verification failed. The link may be expired or invalid.")
        }
      } catch (error) {
        setState("error")
        setMessage("An unexpected error occurred. Please try again.")
      }
    }

    verify()
  }, [searchParams, verifyEmail, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>Verifying your SheriaBot account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {state === "loading" && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Spinner className="mb-4 h-12 w-12 text-primary" />
              <p className="text-muted-foreground">Verifying your email address...</p>
            </div>
          )}

          {state === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="ml-2 text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {state === "error" && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="ml-2 text-red-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {state === "success" && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-600">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {state === "success" && (
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          )}

          {state === "error" && (
            <>
              <Button asChild variant="default" className="w-full">
                <Link href="/resend-verification">
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
