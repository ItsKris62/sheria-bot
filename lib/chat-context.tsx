// lib/chat-context.tsx
"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { apiClient, type ChatMessage, type ChatSession, type ApiError, type ChatRequest, type ChatResponse } from "./api-client"
import { useAuth } from "./auth-context"

interface ChatContextType {
  sessions: ChatSession[]
  activeSessionId: string | null // maps to conversation_id
  messages: ChatMessage[]
  isLoading: boolean
  isStreaming: boolean
  error: ApiError | null
  lastLatency: number | null

  loadSessions: () => Promise<void>
  selectSession: (sessionId: string | null) => Promise<void>
  createNewChat: () => void
  sendMessage: (content: string) => Promise<void>
  regenerateLastResponse: () => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  renameSession: (sessionId: string, title: string) => Promise<void>
  clearError: () => void
}

const ChatContext = createContext<ChatContextType | null>(null)

// Client-side storage for sessions/messages (since backend spec only has /chat)
const SESSIONS_KEY = "sheriabot.sessions"
const SESSION_MESSAGES_KEY_PREFIX = "sheriabot.session.messages."
const ACTIVE_SESSION_KEY = "sheriabot.active_session_id"

function nowISO() {
  return new Date().toISOString()
}

function safeReadSessions(): ChatSession[] {
  try {
    const raw = sessionStorage.getItem(SESSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function safeWriteSessions(sessions: ChatSession[]) {
  try {
    sessionStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  } catch {
    // ignore
  }
}

function safeReadMessages(sessionId: string): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(`${SESSION_MESSAGES_KEY_PREFIX}${sessionId}`)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function safeWriteMessages(sessionId: string, messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(`${SESSION_MESSAGES_KEY_PREFIX}${sessionId}`, JSON.stringify(messages))
  } catch {
    // ignore
  }
}

function safeReadActiveSessionId(): string | null {
  try {
    return sessionStorage.getItem(ACTIVE_SESSION_KEY)
  } catch {
    return null
  }
}

function safeWriteActiveSessionId(sessionId: string | null) {
  try {
    if (sessionId) sessionStorage.setItem(ACTIVE_SESSION_KEY, sessionId)
    else sessionStorage.removeItem(ACTIVE_SESSION_KEY)
  } catch {
    // ignore
  }
}

function sortSessionsByUpdatedDesc(list: ChatSession[]): ChatSession[] {
  const next = [...list]
  next.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
  return next
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [lastLatency, setLastLatency] = useState<number | null>(null)

  // Boot: load sessions + restore active session + restore transcript
  useEffect(() => {
    const boot = () => {
      const storedSessions = safeReadSessions()
      setSessions(storedSessions)

      const storedActive = safeReadActiveSessionId()
      if (storedActive) {
        setActiveSessionId(storedActive)
        setMessages(safeReadMessages(storedActive))
      }
    }
    boot()
  }, [])

  const loadSessions = useCallback(async () => {
    setSessions(safeReadSessions())
  }, [])

  const selectSession = useCallback(async (sessionId: string | null) => {
    setActiveSessionId(sessionId)
    safeWriteActiveSessionId(sessionId)

    setError(null)
    setLastLatency(null)

    if (!sessionId) {
      setMessages([])
      return
    }

    setIsLoading(true)
    setMessages(safeReadMessages(sessionId))
    setIsLoading(false)
  }, [])

  const createNewChat = useCallback(() => {
    setActiveSessionId(null)
    safeWriteActiveSessionId(null)

    setMessages([])
    setError(null)
    setLastLatency(null)
  }, [])

  const upsertSession = useCallback((id: string, title?: string) => {
    const current = safeReadSessions()
    const idx = current.findIndex((s) => s.id === id)

    let next: ChatSession[]

    if (idx === -1) {
      const newSession: ChatSession = {
        id,
        title: title?.slice(0, 60) || "New conversation",
        created_at: nowISO(),
        updated_at: nowISO(),
        message_count: 0,
      }
      next = [newSession, ...current]
    } else {
      const existing = current[idx]
      const updated: ChatSession = {
        ...existing,
        title: title?.trim() ? title.trim() : existing.title,
        updated_at: nowISO(),
      }
      next = [...current]
      next[idx] = updated
      next = sortSessionsByUpdatedDesc(next)
    }

    safeWriteSessions(next)
    setSessions(next)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim()
      if (!text) return

      setError(null)
      setIsStreaming(true)

      // If we don’t have a conversation id yet, create a local one so we can persist transcript immediately.
      const localConversationId = activeSessionId ?? `local-${Date.now()}`
      if (!activeSessionId) {
        setActiveSessionId(localConversationId)
        safeWriteActiveSessionId(localConversationId)
        upsertSession(localConversationId, text)
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: nowISO(),
      }

      const assistantPlaceholderId = `assistant-${Date.now() + 1}`
      const assistantPlaceholder: ChatMessage = {
        id: assistantPlaceholderId,
        role: "assistant",
        content: "Sending…",
        timestamp: nowISO(),
      }

      // Optimistic UI
      setMessages((prev) => {
        const next = [...prev, userMessage, assistantPlaceholder]
        safeWriteMessages(localConversationId, next)
        return next
      })

      const started = performance.now()
      const req: ChatRequest = { message: text, conversation_id: activeSessionId ?? null }

      const result = await apiClient.chat(req)

      if (result.data) {
        const data: ChatResponse = {
          answer: typeof result.data.answer === "string" ? result.data.answer : "",
          conversation_id: result.data.conversation_id ?? null,
          sources: Array.isArray(result.data.sources) ? result.data.sources : [],
          citations: Array.isArray(result.data.citations) ? result.data.citations : [],
        }

        const latencyMs = Math.round(performance.now() - started)
        setLastLatency(latencyMs)

        // Backend may return a real conversation id (preferred). Migrate local -> real if needed.
        const realConversationId = data.conversation_id ?? localConversationId

        if (realConversationId !== localConversationId) {
          // migrate messages storage + session metadata
          const existing = safeReadMessages(localConversationId)
          safeWriteMessages(realConversationId, existing)
          try {
            sessionStorage.removeItem(`${SESSION_MESSAGES_KEY_PREFIX}${localConversationId}`)
          } catch {
            // ignore
          }

          // replace session id in sessions list
          const current = safeReadSessions()
          const migrated = current.map((s) =>
            s.id === localConversationId ? { ...s, id: realConversationId, updated_at: nowISO() } : s,
          )
          safeWriteSessions(migrated)
          setSessions(sortSessionsByUpdatedDesc(migrated))

          setActiveSessionId(realConversationId)
          safeWriteActiveSessionId(realConversationId)
        } else {
          upsertSession(realConversationId)
        }

        setMessages((prev) => {
          const next = prev.map((m) =>
            m.id === assistantPlaceholderId
              ? {
                  ...m,
                  content: data.answer || "(No answer returned.)",
                  citations: data.citations,
                  sources: data.sources,
                }
              : m,
          )
          safeWriteMessages(realConversationId, next)
          return next
        })
      } else if (result.error) {
        setError(result.error)

        // If 401, force logout
        if (result.error.status === 401 || result.error.code === "UNAUTHORIZED") {
          logout()
        }

        // Replace placeholder with a friendly failure bubble
        setMessages((prev) => {
          const next = prev.map((m) =>
            m.id === assistantPlaceholderId ? { ...m, content: "Sorry — I couldn’t complete that request." } : m,
          )
          safeWriteMessages(localConversationId, next)
          return next
        })
      }

      setIsStreaming(false)
    },
    [activeSessionId, logout, upsertSession],
  )

  const regenerateLastResponse = useCallback(async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUser) return

    // Remove last assistant message
    setMessages((prev) => {
      const lastAssistantIdx = prev.map((m) => m.role).lastIndexOf("assistant")
      const next = lastAssistantIdx !== -1 ? prev.slice(0, lastAssistantIdx) : prev
      if (activeSessionId) safeWriteMessages(activeSessionId, next)
      return next
    })

    await sendMessage(lastUser.content)
  }, [messages, sendMessage, activeSessionId])

  const deleteSession = useCallback(
    async (sessionId: string) => {
      const current = safeReadSessions()
      const next = current.filter((s) => s.id !== sessionId)
      safeWriteSessions(next)
      setSessions(next)

      try {
        sessionStorage.removeItem(`${SESSION_MESSAGES_KEY_PREFIX}${sessionId}`)
      } catch {
        // ignore
      }

      if (activeSessionId === sessionId) {
        createNewChat()
      }
    },
    [activeSessionId, createNewChat],
  )

  const renameSession = useCallback(
    async (sessionId: string, title: string) => {
      const trimmed = title.trim()
      if (!trimmed) return
      upsertSession(sessionId, trimmed)
    },
    [upsertSession],
  )

  const clearError = useCallback(() => setError(null), [])

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSessionId,
        messages,
        isLoading,
        isStreaming,
        error,
        lastLatency,
        loadSessions,
        selectSession,
        createNewChat,
        sendMessage,
        regenerateLastResponse,
        deleteSession,
        renameSession,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) throw new Error("useChat must be used within a ChatProvider")
  return context
}
