"use client"

import type React from "react"
import { useState } from "react"
import { Scale, Database, AlertTriangle, Feather, ChevronRight, Lock, Mail, User, Building, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { ChatPage } from "@/components/chat/chat-page"

type ViewType = "landing" | "login" | "signup" | "reset-password" | "chat"

export default function SheriaBot() {
  return <SheriaBotContent />
}

function SheriaBotContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentView, setCurrentView] = useState<ViewType>("landing")

  if (isAuthenticated) {
    return <ChatPage />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {currentView === "landing" && <LandingPage onNavigate={setCurrentView} />}
      {currentView === "login" && <LoginScreen onNavigate={setCurrentView} />}
      {currentView === "signup" && <SignupScreen onNavigate={setCurrentView} />}
      {currentView === "reset-password" && <ResetPasswordScreen onNavigate={setCurrentView} />}
    </div>
  )
}

function LandingPage({ onNavigate }: { onNavigate: (view: ViewType) => void }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
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

          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate("login")} className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              Log In
            </button>
            <button
              onClick={() => onNavigate("signup")}
              className="px-4 py-2 text-sm font-medium bg-zinc-100 text-zinc-950 rounded-lg hover:bg-white transition-colors"
            >
              Request Access
            </button>
          </div>
        </div>
      </nav>

      <section className="flex-1 flex items-center justify-center relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="0.5" cy="0.5" r="0.3" className="fill-zinc-700" />
              </pattern>
              <radialGradient id="fade" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <mask id="fadeMask">
                <rect width="100" height="100" fill="url(#fade)" />
              </mask>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" mask="url(#fadeMask)" />
            <g className="stroke-zinc-700" strokeWidth="0.1" fill="none" opacity="0.5">
              <line x1="20" y1="30" x2="40" y2="50" />
              <line x1="40" y1="50" x2="60" y2="35" />
              <line x1="60" y1="35" x2="80" y2="55" />
              <line x1="30" y1="60" x2="50" y2="45" />
              <line x1="50" y1="45" x2="70" y2="65" />
              <circle cx="20" cy="30" r="1" className="fill-zinc-600" />
              <circle cx="40" cy="50" r="1" className="fill-zinc-600" />
              <circle cx="60" cy="35" r="1" className="fill-zinc-600" />
              <circle cx="80" cy="55" r="1" className="fill-zinc-600" />
              <circle cx="30" cy="60" r="1" className="fill-zinc-600" />
              <circle cx="50" cy="45" r="1" className="fill-zinc-600" />
              <circle cx="70" cy="65" r="1" className="fill-zinc-600" />
            </g>
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-tight mb-6 text-balance">
            Regulatory Intelligence for Kenya&apos;s Digital Future.
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed text-pretty">
            The AI co-pilot for regulators and innovators. Draft policy, analyze gaps, and ensure compliance with the Data
            Protection Act and CBK Guidelines.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate("signup")}
              className="group px-8 py-3 text-base font-medium bg-zinc-100 text-zinc-950 rounded-lg hover:bg-white transition-colors flex items-center gap-2"
            >
              Request Access
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate("login")}
              className="px-8 py-3 text-base font-medium border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      <section id="platform" className="border-t border-zinc-800 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={Database} title="Retrieval-Augmented Generation" description="Grounded in verified Kenyan statutes." />
            <FeatureCard icon={AlertTriangle} title="Gap Analysis" description="Identify regulatory voids instantly." />
            <FeatureCard icon={Feather} title="Instant Drafting" description="Generate policy frameworks in seconds." />
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8 px-6">
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
          <p className="text-sm text-zinc-500">&copy; 2025 SheriaBot. All rights reserved.</p>
        </div>
      </footer>
    </div>
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
    <div className="p-6 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300">
      <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="font-serif text-xl font-medium mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function AuthLayout({
  children,
  onNavigate,
}: {
  children: React.ReactNode
  onNavigate: (view: ViewType) => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="authGrid" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="0.5" cy="0.5" r="0.2" className="fill-zinc-700" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#authGrid)" />
        </svg>
      </div>

      <button
        onClick={() => onNavigate("landing")}
        className="absolute top-6 left-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-400 transition-colors"
      >
        <Scale className="w-5 h-5" />
        <span className="font-serif font-bold">SheriaBot</span>
      </button>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  )
}

function LoginScreen({ onNavigate }: { onNavigate: (view: ViewType) => void }) {
  const { login, error, isLoading, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <AuthLayout onNavigate={onNavigate}>
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-normal mb-2">Welcome Back</h2>
        <p className="text-zinc-400 text-sm">Sign in to access your regulatory intelligence.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={Mail}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearError()
          }}
        />
        <InputField
          icon={Lock}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            clearError()
          }}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 text-base font-medium bg-zinc-100 text-zinc-950 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign In
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => onNavigate("reset-password")}
          className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          Forgot Password?
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
        <p className="text-sm text-zinc-400">
          New here?{" "}
          <button onClick={() => onNavigate("signup")} className="text-zinc-100 hover:underline">
            Request Access
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}

function SignupScreen({ onNavigate }: { onNavigate: (view: ViewType) => void }) {
  const { signup, error, isLoading, clearError } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [organization, setOrganization] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signup({ name, email, organization, password })
  }

  return (
    <AuthLayout onNavigate={onNavigate}>
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-normal mb-2">Request Platform Access</h2>
        <p className="text-zinc-400 text-sm">Join Kenya&apos;s premier regulatory intelligence platform.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={User}
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            clearError()
          }}
        />
        <InputField
          icon={Mail}
          type="email"
          placeholder="Work Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearError()
          }}
        />
        <InputField
          icon={Building}
          type="text"
          placeholder="Organization"
          value={organization}
          onChange={(e) => {
            setOrganization(e.target.value)
            clearError()
          }}
        />
        <InputField
          icon={Lock}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            clearError()
          }}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 text-base font-medium bg-zinc-100 text-zinc-950 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Request
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
        <p className="text-sm text-zinc-400">
          Already have an account?{" "}
          <button onClick={() => onNavigate("login")} className="text-zinc-100 hover:underline">
            Log In
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}

function ResetPasswordScreen({ onNavigate }: { onNavigate: (view: ViewType) => void }) {
  const { forgotPassword, error, isLoading, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await forgotPassword(email)
    if (success) setSubmitted(true)
  }

  if (submitted) {
    return (
      <AuthLayout onNavigate={onNavigate}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-600/20 flex items-center justify-center">
            <Mail className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="font-serif text-3xl font-normal mb-2">Check Your Email</h2>
          <p className="text-zinc-400 text-sm mb-6">We&apos;ve sent password reset instructions to {email}</p>
          <button onClick={() => onNavigate("login")} className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            Return to Login
          </button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout onNavigate={onNavigate}>
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-normal mb-2">Reset Password</h2>
        <p className="text-zinc-400 text-sm">Enter your email to receive reset instructions.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={Mail}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearError()
          }}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 text-base font-medium bg-zinc-100 text-zinc-950 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Send Reset Instructions
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => onNavigate("login")}
          className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-2 mx-auto"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Login
        </button>
      </div>
    </AuthLayout>
  )
}

function InputField({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>
  type: string
  placeholder: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg",
          "text-zinc-100 placeholder:text-zinc-500",
          "focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600",
          "transition-all duration-200",
        )}
      />
    </div>
  )
}
