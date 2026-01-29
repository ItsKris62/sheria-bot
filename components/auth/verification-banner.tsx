"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Mail, X, CheckCircle2, AlertCircle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export function VerificationBanner() {
  const { user, isAuthenticated, resendVerification } = useAuth()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Don't show banner if:
  // 1. User is not authenticated
  // 2. Email is already verified
  // 3. User has dismissed the banner
  const shouldShow = isAuthenticated && !user?.email_verified && !isDismissed

  useEffect(() => {
    if (shouldShow) {
      // Slight delay for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [shouldShow])

  const handleResend = async () => {
    if (!user?.email) return

    setIsResending(true)
    setShowSuccess(false)

    try {
      const result = await resendVerification(user.email)

      if (result.success) {
        setShowSuccess(true)
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 5000)
      }
    } catch (error) {
      console.error("Failed to resend verification email:", error)
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => setIsDismissed(true), 300)
  }

  if (!shouldShow) {
    return null
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border border-amber-200/50
        bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50
        shadow-sm transition-all duration-300 ease-out
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
      `}
    >
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/30 to-transparent animate-pulse" />

      {/* Content */}
      <div className="relative px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-3">
            {/* Icon with subtle animation */}
            <div className="flex-shrink-0 rounded-full bg-amber-100 p-2">
              <AlertCircle className="h-5 w-5 text-amber-600 animate-pulse" />
            </div>

            <div className="flex-1 space-y-3">
              {/* Main message */}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900">
                  Email Verification Required
                </p>
                <p className="text-sm text-amber-800/90 leading-relaxed">
                  Please verify your email address to access all features. Check your inbox for the verification link.
                </p>
              </div>

              {/* Success message with animation */}
              {showSuccess && (
                <div
                  className="
                    flex items-center gap-2 rounded-lg
                    bg-gradient-to-r from-emerald-50 to-green-50
                    border border-emerald-200/50
                    px-3 py-2.5 shadow-sm
                    animate-in slide-in-from-top-2 duration-300
                  "
                >
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">
                    Verification email sent! Check your inbox and spam folder.
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResend}
                  disabled={isResending}
                  className="
                    border-amber-300/70 bg-white/80 backdrop-blur-sm
                    hover:bg-amber-50 hover:border-amber-400
                    hover:shadow-md hover:scale-105
                    disabled:hover:scale-100
                    transition-all duration-200
                    font-medium text-amber-900
                  "
                >
                  {isResending ? (
                    <>
                      <Spinner className="mr-2 h-3.5 w-3.5" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-3.5 w-3.5" />
                      Resend Verification
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-amber-700/70">Sent to:</span>
                  <span className="font-medium text-amber-900 bg-amber-100/50 px-2 py-0.5 rounded">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dismiss button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="
              flex-shrink-0 h-8 w-8 p-0 rounded-full
              text-amber-600 hover:bg-amber-100/80 hover:text-amber-900
              hover:scale-110 transition-all duration-200
            "
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
    </div>
  )
}
