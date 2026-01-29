"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Scale,
  Plus,
  Search,
  Settings,
  LogOut,
  MoreHorizontal,
  Trash2,
  Edit3,
  Copy,
  RefreshCw,
  FileText,
  X,
  Send,
  ChevronRight,
  Menu,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useChat } from "@/lib/chat-context"
import type { ChatMessage, Citation, ChatSession } from "@/lib/api-client"
import { VerificationBanner } from "@/components/auth/verification-banner"

export function ChatPage() {
  return <ChatPageContent />
}

function ChatPageContent() {
  const { user, logout } = useAuth()
  const {
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
  } = useChat()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [citationsDrawerOpen, setCitationsDrawerOpen] = useState(false)
  const [selectedCitations, setSelectedCitations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const filteredSessions = sessions.filter((s) => (s.title || "").toLowerCase().includes(searchQuery.toLowerCase()))

  const handleShowCitations = (citations: any[]) => {
    setSelectedCitations(citations || [])
    setCitationsDrawerOpen(true)
  }

  const renderErrorText = () => {
    if (!error) return ""
    if (error.status === 401 || error.code === "UNAUTHORIZED") return "Session expired. Please log in again."
    if (error.status === 429 || error.code === "RATE_LIMITED") return "Too many requests. Please retry later."
    return error.message
  }

  return (
    <div className="h-screen flex bg-zinc-950 text-zinc-100">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-zinc-800 bg-zinc-900/50 transition-all duration-300",
          sidebarOpen ? "w-72" : "w-0 overflow-hidden",
        )}
      >
        <SidebarContent
          user={user}
          sessions={filteredSessions}
          activeSessionId={activeSessionId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewChat={createNewChat}
          onSelectSession={selectSession}
          onDeleteSession={deleteSession}
          onRenameSession={renameSession}
          onLogout={logout}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-zinc-900 border-r border-zinc-800">
            <SidebarContent
              user={user}
              sessions={filteredSessions}
              activeSessionId={activeSessionId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewChat={() => {
                createNewChat()
                setMobileSidebarOpen(false)
              }}
              onSelectSession={(id) => {
                selectSession(id)
                setMobileSidebarOpen(false)
              }}
              onDeleteSession={deleteSession}
              onRenameSession={renameSession}
              onLogout={logout}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-500" />
              <span className="font-serif font-bold text-lg">SheriaBot</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastLatency && <span className="text-xs text-zinc-500">{(lastLatency / 1000).toFixed(1)}s</span>}
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
          </div>
        </header>

        {/* Email Verification Banner */}
        <div className="border-b border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <VerificationBanner />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <EmptyState onSendMessage={sendMessage} />
            ) : (
              <MessageList
                messages={messages}
                isStreaming={isStreaming}
                onShowCitations={handleShowCitations}
                onRegenerate={regenerateLastResponse}
              />
            )}
          </div>

          {/* Citations Drawer */}
          {citationsDrawerOpen && <CitationsDrawer citations={selectedCitations} onClose={() => setCitationsDrawerOpen(false)} />}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <span className="text-sm text-red-400">{renderErrorText()}</span>
              <button onClick={clearError} className="text-red-400 hover:text-red-300" aria-label="Dismiss error">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Composer */}
        <ChatInput onSend={sendMessage} disabled={isStreaming} isStreaming={isStreaming} />
      </main>
    </div>
  )
}

function SidebarContent({
  user,
  sessions,
  activeSessionId,
  searchQuery,
  onSearchChange,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onLogout,
  onClose,
}: {
  user: { name: string; email: string; organization?: string } | null
  sessions: ChatSession[]
  activeSessionId: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onNewChat: () => void
  onSelectSession: (id: string | null) => void
  onDeleteSession: (id: string) => void
  onRenameSession: (id: string, title: string) => void
  onLogout: () => void
  onClose?: () => void
}) {
  return (
    <>
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-500" />
            <span className="font-serif font-bold">SheriaBot</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded" aria-label="Close sidebar">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="p-3 border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">No conversations yet</div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onSelect={() => onSelectSession(session.id)}
                onDelete={() => onDeleteSession(session.id)}
                onRename={(title) => onRenameSession(session.id, title)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors">
          <div className="w-9 h-9 rounded-full bg-emerald-600/20 flex items-center justify-center">
            <span className="text-emerald-500 font-medium text-sm">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}

function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: {
  session: ChatSession
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (title: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(session.title)

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== session.title) onRename(editTitle.trim())
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
        isActive ? "bg-zinc-800" : "hover:bg-zinc-800/50",
      )}
      onClick={() => !isEditing && onSelect()}
    >
      <MessageSquare className="w-4 h-4 text-zinc-500 shrink-0" />

      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
          className="flex-1 bg-zinc-700 px-2 py-0.5 rounded text-sm focus:outline-none"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{session.title}</p>
          <p className="text-xs text-zinc-500">{new Date(session.updated_at).toLocaleDateString()}</p>
        </div>
      )}

      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className={cn("p-1 rounded hover:bg-zinc-700 transition-opacity", showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
          aria-label="Session menu"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-zinc-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-zinc-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ onSendMessage }: { onSendMessage: (msg: string) => void }) {
  const suggestions = [
    "Ask about CBK guidelines",
    "Summarize Data Protection Act penalties",
    "Draft a compliance checklist for mobile lending",
    "Explain sandbox licensing requirements",
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-emerald-500" />
      </div>

      <h2 className="font-serif text-2xl md:text-3xl font-normal text-center mb-2">How can I assist you today?</h2>
      <p className="text-zinc-400 text-center max-w-md mb-8">
        Ask questions about Kenyan regulatory frameworks, compliance requirements, or draft policy documents.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(suggestion)}
            className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800 transition-colors text-left"
          >
            <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-sm">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageList({
  messages,
  isStreaming,
  onShowCitations,
  onRegenerate,
}: {
  messages: ChatMessage[]
  isStreaming: boolean
  onShowCitations: (citations: any[]) => void
  onRegenerate: () => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
          onShowCitations={onShowCitations}
          onRegenerate={onRegenerate}
        />
      ))}

      {isStreaming && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-sm">Retrieving sources...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

function MessageBubble({
  message,
  isLast,
  onShowCitations,
  onRegenerate,
}: {
  message: ChatMessage
  isLast: boolean
  onShowCitations: (citations: any[]) => void
  onRegenerate: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-emerald-600 text-white rounded-2xl rounded-tr-none px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs text-emerald-200/60 mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    )
  }

  const citationsAny = Array.isArray(message.citations) ? message.citations : []

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
        <Scale className="w-4 h-4 text-emerald-500" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3">
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          </div>

          <p className="text-xs text-zinc-500 mt-2">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        <div className="flex items-center gap-1 mt-2">
          {citationsAny.length > 0 && (
            <button
              onClick={() => onShowCitations(citationsAny)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              {citationsAny.length} Citation{citationsAny.length > 1 ? "s" : ""}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy"}
          </button>

          {isLast && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CitationsDrawer({ citations, onClose }: { citations: any[]; onClose: () => void }) {
  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-900/50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h3 className="font-medium">Citations & Evidence</h3>
        <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded transition-colors" aria-label="Close citations">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {citations.map((citation, index) => {
          const isLegacy =
            citation && typeof citation === "object" && ("document_title" in citation || "excerpt" in citation || "source_url" in citation)

          if (!isLegacy) {
            return (
              <div key={index} className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap">{JSON.stringify(citation, null, 2)}</pre>
              </div>
            )
          }

          const c = citation as Citation

          return (
            <div key={index} className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-medium text-emerald-400 leading-tight">{c.document_title}</h4>
                {c.source_url && (
                  <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-zinc-700 rounded shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {c.page_number && <p className="text-xs text-zinc-500 mb-2">Page {c.page_number}</p>}

              <p className="text-xs text-zinc-400 leading-relaxed">&ldquo;{c.excerpt}&rdquo;</p>

              {c.confidence && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.confidence * 100}%` }} />
                  </div>
                  <span className="text-xs text-zinc-500">{Math.round(c.confidence * 100)}%</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChatInput({ onSend, disabled, isStreaming }: { onSend: (message: string) => void; disabled: boolean; isStreaming: boolean }) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput("")
      if (textareaRef.current) textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-4 bg-zinc-950">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 focus-within:border-zinc-700 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask about Kenyan regulations..."
            rows={1}
            className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none resize-none max-h-[200px]"
            disabled={disabled}
          />

          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className={cn(
              "p-2.5 rounded-xl transition-colors shrink-0",
              input.trim() && !disabled ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
            )}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-500 text-center mt-2">
          {isStreaming ? "Generating response..." : "Press Enter to send, Shift + Enter for new line"}
        </p>
      </div>
    </form>
  )
}
