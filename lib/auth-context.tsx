// lib/auth-context.tsx
"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { apiClient, type ApiError, type UserPublic, type Tokens, type AuthResponse } from "./api-client"

type UserClaims = {
  sub?: string
  email?: string
  name?: string
  roles?: string[]
  permissions?: string[]
  exp?: number
  [k: string]: any
}

interface AuthContextType {
  user: UserPublic | null
  claims: UserClaims | null
  isAuthenticated: boolean
  isLoading: boolean
  error: ApiError | null

  login: (email: string, password: string, opts?: { persistSession?: boolean }) => Promise<boolean>
  signup: (
    data: { full_name?: string | null; email: string; password: string },
    opts?: { persistSession?: boolean },
  ) => Promise<boolean>
  forgotPassword: (email: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void

  getAccessToken: () => string | null
  hasRole: (role: string) => boolean
  hasPermission: (perm: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_TOKEN_KEY = "sheriabot.access_token"
const SESSION_PERSIST_KEY = "sheriabot.persist_session"

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
  try {
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    )
  } catch {
    try {
      return atob(padded)
    } catch {
      return ""
    }
  }
}

function decodeJwtClaims(token: string): UserClaims | null {
  const parts = token.split(".")
  if (parts.length < 2) return null
  const payload = base64UrlDecode(parts[1])
  if (!payload) return null

  try {
    const obj = JSON.parse(payload)
    const roles = Array.isArray(obj.roles) ? obj.roles : typeof obj.roles === "string" ? [obj.roles] : undefined
    const permissions = Array.isArray(obj.permissions)
      ? obj.permissions
      : typeof obj.permissions === "string"
        ? [obj.permissions]
        : undefined
    return { ...obj, roles, permissions }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null)
  const [claims, setClaims] = useState<UserClaims | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const tokenRef = useRef<string | null>(null)

  const applyToken = useCallback((token: string | null, opts?: { persistSession?: boolean }) => {
    tokenRef.current = token
    setAccessToken(token)
    setClaims(token ? decodeJwtClaims(token) : null)
    apiClient.setToken(token)

    const persist = !!opts?.persistSession
    try {
      if (persist && token) {
        sessionStorage.setItem(SESSION_PERSIST_KEY, "1")
        sessionStorage.setItem(SESSION_TOKEN_KEY, token)
      } else {
        sessionStorage.removeItem(SESSION_PERSIST_KEY)
        sessionStorage.removeItem(SESSION_TOKEN_KEY)
      }
    } catch {
      // ignore storage failures
    }
  }, [])

  // Boot strategy (industry-grade with refresh cookie):
  // 1) If user opted to persist session, load last access token (for immediate UI)
  // 2) Always attempt /auth/refresh (cookie-based) to get a fresh access token
  //    - If refresh works, you're logged in
  //    - If refresh fails, clear local token and consider logged out
  useEffect(() => {
    const boot = async () => {
      try {
        const persist = sessionStorage.getItem(SESSION_PERSIST_KEY) === "1"
        if (persist) {
          const token = sessionStorage.getItem(SESSION_TOKEN_KEY)
          if (token) {
            applyToken(token, { persistSession: true })
          }
        }
      } catch {
        // ignore
      }

      // Try refresh (cookie-based session)
      const refreshed = await apiClient.refresh()
      if (refreshed.data?.access_token) {
        // Keep persist flag if user had opted in
        let persist = false
        try {
          persist = sessionStorage.getItem(SESSION_PERSIST_KEY) === "1"
        } catch {
          persist = false
        }
        applyToken(refreshed.data.access_token, { persistSession: persist })
      } else {
        // refresh failed => logged out
        applyToken(null, { persistSession: false })
        setUser(null)
      }

      // User object: backend currently returns user on login/signup only.
      // We can approximate user info from token claims if needed.
      const t = tokenRef.current
      const c = t ? decodeJwtClaims(t) : null
      if (c?.sub) {
        // minimal UI identity (you can replace with /auth/me later)
        setUser((prev) => prev ?? ({ id: c.sub, email: c.email ?? "", full_name: c.name ?? null, is_active: true } as any))
      }

      setIsLoading(false)
    }

    boot()
  }, [applyToken])

  const login = useCallback(
    async (email: string, password: string, opts?: { persistSession?: boolean }) => {
      setError(null)
      setIsLoading(true)

      const result = await apiClient.login(email, password)
      if (result.data) {
        const auth = result.data as AuthResponse
        applyToken(auth.tokens.access_token, { persistSession: !!opts?.persistSession })
        setUser(auth.user)
        setIsLoading(false)
        return true
      }

      setError(result.error || null)
      setIsLoading(false)
      return false
    },
    [applyToken],
  )

  const signup = useCallback(
    async (
      data: { full_name: string; email: string; password: string; organization?: string | null },
      opts?: { persistSession?: boolean },
    ) => {
      setError(null)
      setIsLoading(true)

      const result = await apiClient.signup({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        organization: data.organization ?? null,
      })

      if (result.data) {
        const auth = result.data as AuthResponse
        applyToken(auth.tokens.access_token, { persistSession: !!opts?.persistSession })
        setUser(auth.user)
        setIsLoading(false)
        return true
      }

      setError(result.error || null)
      setIsLoading(false)
      return false
    },
    [applyToken],
  )

  const forgotPassword = useCallback(async (email: string) => {
    setError(null)
    setIsLoading(true)
    const result = await apiClient.forgotPassword(email)
    setIsLoading(false)
    if (result.error) {
      setError(result.error)
      return false
    }
    return true
  }, [])

  const logout = useCallback(async () => {
    // best-effort server logout to revoke refresh + clear cookie
    await apiClient.logout()
    applyToken(null, { persistSession: false })
    setUser(null)
    setError(null)
  }, [applyToken])

  const clearError = useCallback(() => setError(null), [])
  const getAccessToken = useCallback(() => tokenRef.current, [])

  const hasRole = useCallback((role: string) => (claims?.roles ?? []).includes(role), [claims])
  const hasPermission = useCallback((perm: string) => (claims?.permissions ?? []).includes(perm), [claims])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      claims,
      isAuthenticated: !!accessToken,
      isLoading,
      error,
      login,
      signup,
      forgotPassword,
      logout,
      clearError,
      getAccessToken,
      hasRole,
      hasPermission,
    }),
    [user, claims, accessToken, isLoading, error, login, signup, forgotPassword, logout, clearError, getAccessToken, hasRole, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
