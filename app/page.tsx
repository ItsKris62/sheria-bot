"use client"

import type React from "react"
import { useMemo, useState } from "react"
import {
  Scale,
  Database,
  AlertTriangle,
  Feather,
  ChevronRight,
  Lock,
  Mail,
  User,
  Building,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { ChatPage } from "@/components/chat/chat-page"

type ViewType = "landing" | "auth" | "reset-password" | "chat"
type AuthMode = "login" | "signup"

const PASSWORD_MIN = 12

export default function SheriaBot() {
  return <SheriaBotContent />
}

function SheriaBotContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentView, setCurrentView] = useState<ViewType>("landing")
  const [authMode, setAuthMode] = useState<AuthMode>("login")

  if (isAuthenticated) return <ChatPage />

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {currentView === "landing" && (
        <LandingPage
          onNavigate={(view) => {
            if (view === "auth") setAuthMode("signup")
            setCurrentView(view)
          }}
          onLogin={() => {
            setAuthMode("login")
            setCurrentView("auth")
          }}
          onSignup={() => {
            setAuthMode("signup")
            setCurrentView("auth")
          }}
        />
      )}

      {currentView === "auth" && (
        <AuthShell
          mode={authMode}
          onModeChange={setAuthMode}
          onBack={() => setCurrentView("landing")}
          onForgotPassword={() => setCurrentView("reset-password")}
        />
      )}

      {currentView === "reset-password" && (
        <ResetPasswordShell onBack={() => setCurrentView("auth")} />
      )}
    </div>
  )
}

/* =====================================================================================
 * LANDING (kept clean + aligned with Harvey-style hero)
 * ===================================================================================== */

function LandingPage({
  onNavigate,
  onLogin,
  onSignup,
}: {
  onNavigate: (view: ViewType) => void
  onLogin: () => void
  onSignup: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav
        onLogin={onLogin}
        onSignup={onSignup}
      />

      <section className="flex-1 flex items-center justify-center relative overflow-hidden px-6 py-20 sm:py-24">
        <AmbientBackground />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-950/40 backdrop-blur">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs sm:text-sm text-zinc-300">
              Grounded answers • Citations • Audit-ready
            </span>
          </div>

          <h1 className="mt-6 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.05] text-balance">
            Regulatory Intelligence for Kenya&apos;s Digital Future.
          </h1>

          <p className="mt-5 text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed text-pretty">
            The AI co-pilot for regulators and innovators. Draft policy, analyze gaps, and ensure compliance
            with the Data Protection Act and CBK Guidelines.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onSignup}
              className="group w-full sm:w-auto px-7 py-3 text-sm sm:text-base font-medium bg-zinc-100 text-zinc-950 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              Request Access
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onLogin}
              className="w-full sm:w-auto px-7 py-3 text-sm sm:text-base font-medium border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
            >
              Sign In
            </button>
          </div>

          <div className="mt-12 grid sm:grid-cols-3 gap-4 sm:gap-6 text-left">
            <FeatureCard icon={Database} title="RAG, done right" description="Grounded in verified Kenyan statutes and your org knowledge." />
            <FeatureCard icon={AlertTriangle} title="Gap Analysis" description="Identify regulatory voids and operational risks instantly." />
            <FeatureCard icon={Feather} title="Drafting & Review" description="Generate policy frameworks and reviews with traceable sources." />
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure by design • Least privilege • Token rotation</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900/80 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-zinc-500" />
            <span className="text-sm text-zinc-500">SheriaBot</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
              Contact
            </a>
          </div>
          <p className="text-sm text-zinc-600">&copy; 2025 SheriaBot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function TopNav({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-zinc-100" />
          <span className="font-serif font-bold text-xl tracking-tight">SheriaBot</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            About
          </a>
          <a href="#platform" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Platform
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onLogin} className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Log In
          </button>
          <button
            onClick={onSignup}
            className="px-4 py-2 text-sm font-medium bg-zinc-100 text-zinc-950 rounded-xl hover:bg-white transition-colors"
          >
            Request Access
          </button>
        </div>
      </div>
    </nav>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="p-5 sm:p-6 border border-zinc-900 rounded-2xl bg-zinc-950/30 backdrop-blur hover:border-zinc-800 transition-colors">
      <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-zinc-300" />
      </div>
      <h3 className="font-serif text-lg sm:text-xl font-medium mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function AmbientBackground() {
  return (
    <div className="absolute inset-0">
      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[0.18]">
        <svg className="w-full h-full" viewBox="0 0 120 120" preserveAspectRatio="none">
          <defs>
            <pattern id="gridDots" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.6" className="fill-zinc-700" />
            </pattern>
            <radialGradient id="fadeRadial" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="fadeMask2">
              <rect width="120" height="120" fill="url(#fadeRadial)" />
            </mask>
          </defs>
          <rect width="120" height="120" fill="url(#gridDots)" mask="url(#fadeMask2)" />
        </svg>
      </div>

      {/* glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-emerald-500/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-48 left-16 w-[700px] h-[700px] bg-zinc-200/5 blur-3xl rounded-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/10 to-zinc-950" />
    </div>
  )
}

/* =====================================================================================
 * AUTH SHELL (Harvey-like: premium, minimal, interactive)
 * ===================================================================================== */

function AuthShell({
  mode,
  onModeChange,
  onBack,
  onForgotPassword,
}: {
  mode: AuthMode
  onModeChange: (m: AuthMode) => void
  onBack: () => void
  onForgotPassword: () => void
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AmbientBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-zinc-200" />
            <span className="font-serif font-semibold tracking-tight">SheriaBot</span>
          </div>

          <div className="w-[64px]" />
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          {/* Left: value prop */}
          <div className="hidden lg:block">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-900 bg-zinc-950/40 backdrop-blur">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-zinc-300">Security-first authentication</span>
              </div>

              <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-balance">
                Ground every answer in trusted data.
              </h1>

              <p className="mt-4 text-zinc-400 leading-relaxed">
                Purpose-built for regulatory work: citations, audit trails, and clear governance.
              </p>

              <div className="mt-7 grid gap-3">
                <MiniBullet icon={Database} title="Cited answers" desc="Sentence-level citations and sources." />
                <MiniBullet icon={AlertTriangle} title="Risk visibility" desc="Gap analysis and compliance signals." />
                <MiniBullet icon={Feather} title="Drafting speed" desc="Policy, memos, and reviews in minutes." />
              </div>
            </div>
          </div>

          {/* Right: auth card */}
          <div className="w-full">
            <AuthCard mode={mode} onModeChange={onModeChange} onForgotPassword={onForgotPassword} />
            <p className="mt-4 text-center text-xs text-zinc-500">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniBullet({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl border border-zinc-900 bg-zinc-950/30 backdrop-blur">
      <div className="mt-0.5 w-9 h-9 rounded-xl border border-zinc-900 bg-zinc-950 flex items-center justify-center">
        <Icon className="w-4 h-4 text-zinc-300" />
      </div>
      <div>
        <div className="text-sm text-zinc-100">{title}</div>
        <div className="text-xs text-zinc-400 mt-0.5">{desc}</div>
      </div>
    </div>
  )
}

function AuthCard({
  mode,
  onModeChange,
  onForgotPassword,
}: {
  mode: AuthMode
  onModeChange: (m: AuthMode) => void
  onForgotPassword: () => void
}) {
  return (
    <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-zinc-800/80 via-zinc-900/40 to-zinc-950/60">
      <div className="rounded-3xl border border-zinc-900 bg-zinc-950/50 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
        {/* Tabs */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl border border-zinc-900 bg-zinc-950 flex items-center justify-center">
              <Scale className="w-5 h-5 text-zinc-200" />
            </div>
            <div>
              <div className="font-serif text-lg leading-none">SheriaBot</div>
              <div className="text-xs text-zinc-500 mt-1">Secure access</div>
            </div>
          </div>

          <div className="flex rounded-2xl border border-zinc-900 bg-zinc-950/40 p-1">
            <TabButton active={mode === "login"} onClick={() => onModeChange("login")}>
              Log in
            </TabButton>
            <TabButton active={mode === "signup"} onClick={() => onModeChange("signup")}>
              Request access
            </TabButton>
          </div>
        </div>

        <div className="mt-7">
          {mode === "login" ? (
            <LoginForm onForgotPassword={onForgotPassword} onSwitch={() => onModeChange("signup")} />
          ) : (
            <SignupForm onSwitch={() => onModeChange("login")} />
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl transition-colors",
        active ? "bg-zinc-100 text-zinc-950" : "text-zinc-300 hover:text-zinc-100",
      )}
    >
      {children}
    </button>
  )
}

/* =====================================================================================
 * LOGIN / SIGNUP FORMS
 * ===================================================================================== */

function LoginForm({ onForgotPassword, onSwitch }: { onForgotPassword: () => void; onSwitch: () => void }) {
  const { login, error, isLoading, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const canSubmit = email.trim().length > 3 && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    await login(email, password)
  }

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl font-normal">Welcome back</h2>
      <p className="mt-2 text-sm text-zinc-400">Sign in to access your regulatory intelligence workspace.</p>

      {error && <InlineError message={error.message} />}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <TextField
          icon={Mail}
          type="email"
          label="Email"
          placeholder="name@company.com"
          value={email}
          autoComplete="email"
          onChange={(e) => {
            setEmail(e.target.value)
            clearError()
          }}
        />

        <TextField
          icon={Lock}
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="Your password"
          value={password}
          autoComplete="current-password"
          rightSlot={
            <IconButton
              label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((s) => !s)}
              icon={showPassword ? EyeOff : Eye}
            />
          }
          onChange={(e) => {
            setPassword(e.target.value)
            clearError()
          }}
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Forgot password?
          </button>

          <button
            type="button"
            onClick={onSwitch}
            className="text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Need access? <span className="text-zinc-200">Request</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="w-full py-3 text-sm sm:text-base font-medium bg-zinc-100 text-zinc-950 rounded-2xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign in
        </button>

        <div className="mt-3 text-xs text-zinc-500 leading-relaxed">
          Tip: If you enabled refresh tokens (httpOnly cookie), your session can be rotated securely without storing tokens in localStorage.
        </div>
      </form>
    </div>
  )
}

function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  const { signup, error, isLoading, clearError } = useAuth()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [organization, setOrganization] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const strength = useMemo(() => passwordStrength(password), [password])

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim())
  const passOk = password.length >= PASSWORD_MIN
  const canSubmit = emailOk && passOk && fullName.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    await signup({
      full_name: fullName,
      email,
      password,
      organization: organization.trim() || null,
    })
  }

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl font-normal">Request access</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Create your account to start drafting and researching with citations.
      </p>

      {error && <InlineError message={error.message} />}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <TextField
          icon={User}
          type="text"
          label="Full name"
          placeholder="Your name"
          value={fullName}
          autoComplete="name"
          onChange={(e) => {
            setFullName(e.target.value)
            clearError()
          }}
        />

        <TextField
          icon={Mail}
          type="email"
          label="Work email"
          placeholder="name@company.com"
          value={email}
          autoComplete="email"
          helper={
            email.length > 0 && !emailOk ? (
              <span className="text-xs text-amber-300/90">Enter a valid email address.</span>
            ) : (
              <span className="text-xs text-zinc-500">We’ll never share your email.</span>
            )
          }
          onChange={(e) => {
            setEmail(e.target.value)
            clearError()
          }}
        />

        <TextField
          icon={Building}
          type="text"
          label="Organization (optional)"
          placeholder="Company / Agency"
          value={organization}
          autoComplete="organization"
          onChange={(e) => {
            setOrganization(e.target.value)
            clearError()
          }}
        />

        <TextField
          icon={Lock}
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder={`Minimum ${PASSWORD_MIN} characters`}
          value={password}
          autoComplete="new-password"
          rightSlot={
            <IconButton
              label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((s) => !s)}
              icon={showPassword ? EyeOff : Eye}
            />
          }
          helper={<PasswordHelper password={password} strength={strength} />}
          onChange={(e) => {
            setPassword(e.target.value)
            clearError()
          }}
        />

        <button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="w-full py-3 text-sm sm:text-base font-medium bg-zinc-100 text-zinc-950 rounded-2xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create account
        </button>

        <div className="pt-2 text-center">
          <button type="button" onClick={onSwitch} className="text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            Already have an account? <span className="text-zinc-200">Log in</span>
          </button>
        </div>
      </form>
    </div>
  )
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="mt-4 p-3 rounded-2xl border border-red-500/20 bg-red-500/10">
      <p className="text-sm text-red-300">{message}</p>
    </div>
  )
}

/* =====================================================================================
 * RESET PASSWORD (request token)
 * ===================================================================================== */

function ResetPasswordShell({ onBack }: { onBack: () => void }) {
  const { forgotPassword, error, isLoading, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailOk) return
    const ok = await forgotPassword(email)
    if (ok) setSubmitted(true)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AmbientBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-zinc-200" />
            <span className="font-serif font-semibold tracking-tight">SheriaBot</span>
          </div>

          <div className="w-[64px]" />
        </div>

        <div className="mt-10 max-w-xl mx-auto">
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-zinc-800/80 via-zinc-900/40 to-zinc-950/60">
            <div className="rounded-3xl border border-zinc-900 bg-zinc-950/50 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
              {!submitted ? (
                <>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal">Reset password</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Enter your email. If an account exists, we’ll send reset instructions.
                  </p>

                  {error && <InlineError message={error.message} />}

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <TextField
                      icon={Mail}
                      type="email"
                      label="Email"
                      placeholder="name@company.com"
                      value={email}
                      autoComplete="email"
                      helper={
                        email.length > 0 && !emailOk ? (
                          <span className="text-xs text-amber-300/90">Enter a valid email address.</span>
                        ) : (
                          <span className="text-xs text-zinc-500">You’ll receive a reset token or link.</span>
                        )
                      }
                      onChange={(e) => {
                        setEmail(e.target.value)
                        clearError()
                      }}
                    />

                    <button
                      type="submit"
                      disabled={isLoading || !emailOk}
                      className="w-full py-3 text-sm sm:text-base font-medium bg-zinc-100 text-zinc-950 rounded-2xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Send reset instructions
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-emerald-600/15 border border-emerald-500/20 flex items-center justify-center">
                    <Mail className="w-7 h-7 text-emerald-300" />
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal">Check your email</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    If an account exists for <span className="text-zinc-200">{email}</span>, you’ll receive reset instructions shortly.
                  </p>
                  <button
                    onClick={onBack}
                    className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-2xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-colors text-sm"
                  >
                    Return to sign in
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-zinc-500">
            For security, this flow doesn’t confirm whether an email exists.
          </p>
        </div>
      </div>
    </div>
  )
}

/* =====================================================================================
 * FIELDS + HELPERS
 * ===================================================================================== */

function TextField({
  icon: Icon,
  type,
  label,
  placeholder,
  value,
  onChange,
  rightSlot,
  helper,
  autoComplete,
}: {
  icon: React.ComponentType<{ className?: string }>
  type: string
  label: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  rightSlot?: React.ReactNode
  helper?: React.ReactNode
  autoComplete?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-400">{label}</label>
      </div>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          minLength={type === "password" ? PASSWORD_MIN : undefined}
          onChange={onChange}
          className={cn(
            "w-full pl-12 pr-12 py-3 bg-zinc-950/50 border border-zinc-900 rounded-2xl",
            "text-zinc-100 placeholder:text-zinc-600",
            "focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700",
            "transition-all duration-200",
          )}
        />
        {rightSlot && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {helper && <div className="pt-1">{helper}</div>}
    </div>
  )
}

function IconButton({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="p-2 rounded-xl border border-zinc-900 bg-zinc-950/50 hover:bg-zinc-900/60 hover:border-zinc-800 transition-colors"
    >
      <Icon className="w-4 h-4 text-zinc-300" />
    </button>
  )
}

function PasswordHelper({ password, strength }: { password: string; strength: ReturnType<typeof passwordStrength> }) {
  const hasMin = password.length >= PASSWORD_MIN
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  return (
    <div className="space-y-2">
      <PasswordMeter value={strength.score} label={strength.label} />

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Rule ok={hasMin} text={`${PASSWORD_MIN}+ chars`} />
        <Rule ok={hasUpper} text="Uppercase" />
        <Rule ok={hasLower} text="Lowercase" />
        <Rule ok={hasNumber} text="Number" />
        <Rule ok={hasSymbol} text="Symbol" />
      </div>

      <div className="text-[11px] text-zinc-500 leading-relaxed">
        Your backend enforces a minimum of {PASSWORD_MIN} characters for security.
      </div>
    </div>
  )
}

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border px-2.5 py-2", ok ? "border-emerald-500/20 bg-emerald-500/5" : "border-zinc-900 bg-zinc-950/30")}>
      <div className={cn("w-2 h-2 rounded-full", ok ? "bg-emerald-400" : "bg-zinc-700")} />
      <span className={cn(ok ? "text-emerald-200" : "text-zinc-400")}>{text}</span>
    </div>
  )
}

function PasswordMeter({ value, label }: { value: number; label: string }) {
  // value is 0..100
  const width = Math.min(100, Math.max(0, value))
  const tone =
    value >= 80 ? "bg-emerald-400" : value >= 55 ? "bg-amber-300" : value >= 30 ? "bg-orange-300" : "bg-red-400"

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">Password strength</span>
        <span className="text-xs text-zinc-300">{label}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-900">
        <div className={cn("h-full transition-all duration-300", tone)} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

function passwordStrength(pw: string) {
  if (!pw) return { score: 0, label: "—" }

  let score = 0

  // length
  score += Math.min(40, pw.length * 3) // up to 40

  // variety
  if (/[a-z]/.test(pw)) score += 10
  if (/[A-Z]/.test(pw)) score += 15
  if (/\d/.test(pw)) score += 15
  if (/[^A-Za-z0-9]/.test(pw)) score += 20

  // penalty for very short
  if (pw.length < PASSWORD_MIN) score -= 15

  const s = Math.max(0, Math.min(100, score))

  const label = s >= 80 ? "Strong" : s >= 55 ? "Good" : s >= 30 ? "Fair" : "Weak"
  return { score: s, label }
}
