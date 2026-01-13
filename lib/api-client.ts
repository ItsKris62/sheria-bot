// lib/api-client.ts
// Centralized API client for SheriaBot backend communication (aligned with backend contract)

const API_BASE_URL_RAW = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
const API_BASE_URL = API_BASE_URL_RAW.replace(/\/+$/, "")

export interface ApiError {
  message: string
  code: string
  status: number
  details?: unknown
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

// --------------------------
// Backend contract types
// --------------------------

export interface UserPublic {
  id: string
  email: string
  full_name?: string | null
  is_active: boolean
}

export interface Tokens {
  access_token: string
  expires_in: number
}

export interface AuthResponse {
  user: UserPublic
  tokens: Tokens
}

export interface ChatRequest {
  message: string
  conversation_id?: string | null
}

export interface ChatResponse {
  conversation_id: string
  answer: string
  citations: Record<string, any>[]
  sources: Record<string, any>[]
  suggestions?: string[]
}

export interface ChatSessionPublic {
  conversation_id: string
  title?: string | null
  created_at: string
  updated_at: string
}

export interface ChatMessagePublic {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  created_at: string
  citations?: Record<string, any>[] | null
  sources?: Record<string, any>[] | null
}

export interface ChatSessionWithMessages {
  session: ChatSessionPublic
  messages: ChatMessagePublic[]
}

export interface RenameSessionRequest {
  title: string
}

type RequestOptions = RequestInit & {
  timeoutMs?: number
  // If true, the client will attempt /auth/refresh once on 401 and retry the request.
  retryOn401?: boolean
}

function safeJsonParse(text: string): any | null {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function safeReadBody(response: Response): Promise<{ text: string; json: any | null }> {
  try {
    const text = await response.text()
    return { text, json: safeJsonParse(text) }
  } catch {
    return { text: "", json: null }
  }
}

function buildErrorFromResponse(status: number, parsed: any | null, fallbackText: string): ApiError {
  const detail =
    (parsed &&
      typeof parsed === "object" &&
      ("detail" in parsed || "message" in parsed) &&
      // ts-expect-error dynamic read
      (parsed.detail || parsed.message)) ||
    null

  const message =
    typeof detail === "string"
      ? detail
      : status >= 500
        ? "Server error. Please try again later."
        : status === 401
          ? "Session expired. Please log in again."
          : status === 429
            ? "Too many requests. Please slow down."
            : "An error occurred"

  const code =
    status === 401
      ? "UNAUTHORIZED"
      : status === 429
        ? "RATE_LIMITED"
        : (parsed && typeof parsed === "object" && typeof (parsed as any).code === "string" && (parsed as any).code) ||
          "HTTP_ERROR"

  return { message, code, status, details: parsed ?? fallbackText }
}

class ApiClient {
  // Access token is held in memory. AuthContext decides persistence.
  private accessToken: string | null = null

  setToken(token: string | null) {
    this.accessToken = token
  }

  getToken(): string | null {
    return this.accessToken
  }

  private async rawRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const token = this.getToken()

    const hasBody = typeof options.body === "string" ? options.body.length > 0 : !!options.body

    const headers: HeadersInit = {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    const timeoutMs = options.timeoutMs ?? 20_000
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort("timeout"), timeoutMs)

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        // IMPORTANT: allows refresh cookie to be sent/received cross-origin
        credentials: "include",
        signal: controller.signal,
      })

      if (response.status === 204) {
        return { data: undefined as unknown as T }
      }

      const { text, json } = await safeReadBody(response)

      if (!response.ok) {
        return { error: buildErrorFromResponse(response.status, json, text) }
      }

      if (text.length === 0) {
        return { data: undefined as unknown as T }
      }

      if (json === null) {
        return {
          error: {
            message: "Server returned a non-JSON response.",
            code: "INVALID_RESPONSE",
            status: response.status,
            details: text,
          },
        }
      }

      return { data: json as T }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        const isTimeout = controller.signal.reason === "timeout"
        return {
          error: {
            message: isTimeout ? "Request timed out." : "Request aborted.",
            code: isTimeout ? "TIMEOUT" : "ABORTED",
            status: 0,
            details: err,
          },
        }
      }

      return {
        error: {
          message: "Network error. Please check your connection / CORS / API base URL.",
          code: "NETWORK_ERROR",
          status: 0,
          details: err,
        },
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const res = await this.rawRequest<T>(endpoint, options)

    // If unauthorized and caller wants retry, do refresh once and retry
    if (options.retryOn401 && res.error?.status === 401) {
      const refreshed = await this.refresh()
      if (refreshed.data?.access_token) {
        this.setToken(refreshed.data.access_token)
        return this.rawRequest<T>(endpoint, options)
      }
    }

    return res
  }

  // --------------------------
  // Health check
  // --------------------------
  async healthCheck(): Promise<boolean> {
    const result = await this.request<{ status: string }>("/health", { method: "GET", timeoutMs: 10_000 })
    return !result.error && result.data?.status === "ok"
  }

  // --------------------------
  // Auth endpoints (match backend)
  // --------------------------

  async login(email: string, password: string) {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async signup(data: { full_name: string; email: string; organization?: string | null; password: string }) {
    return this.request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        organization: data.organization ?? null,
      }),
    })
  }

  async refresh() {
  const res = await this.rawRequest<Tokens>("/auth/refresh", { method: "POST", retryOn401: false })
  if (res.error?.status === 401) return {} // silent unauthenticated
  return res
}

  async logout() {
    return this.request<void>("/auth/logout", {
      method: "POST",
      retryOn401: false,
    })
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>("/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    })
  }

  // NOTE: You currently do NOT have /auth/me on backend.
  // If you add it later, you can wire it here.

  // --------------------------
  // Chat endpoints (match backend)
  // --------------------------

  async chat(req: ChatRequest) {
    return this.request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify(req),
      timeoutMs: 30_000,
      retryOn401: true,
    })
  }

  async listSessions() {
    return this.request<ChatSessionPublic[]>("/chat/sessions", {
      method: "GET",
      retryOn401: true,
    })
  }

  async getSession(conversationId: string) {
    return this.request<ChatSessionWithMessages>(`/chat/sessions/${encodeURIComponent(conversationId)}`, {
      method: "GET",
      retryOn401: true,
    })
  }

  async renameSession(conversationId: string, title: string) {
    return this.request<ChatSessionPublic>(`/chat/sessions/${encodeURIComponent(conversationId)}`, {
      method: "PATCH",
      body: JSON.stringify({ title } satisfies RenameSessionRequest),
      retryOn401: true,
    })
  }

  async deleteSession(conversationId: string) {
    return this.request<void>(`/chat/sessions/${encodeURIComponent(conversationId)}`, {
      method: "DELETE",
      retryOn401: true,
    })
  }

  async regenerate(conversationId: string) {
    return this.request<ChatResponse>(`/chat/sessions/${encodeURIComponent(conversationId)}/regenerate`, {
      method: "POST",
      retryOn401: true,
      timeoutMs: 30_000,
    })
  }
}

export const apiClient = new ApiClient()
