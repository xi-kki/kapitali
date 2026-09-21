'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn, generateId } from '@/lib/utils'
import { fetchStream } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Send, Sparkles, ThumbsUp, ThumbsDown, Copy, FileText,
  Loader2, Plus, Search, ChevronDown, PanelRightOpen, Trash2,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { title: string; snippet: string }[]
  timestamp: Date
}

interface Conversation {
  id: number
  title: string
  folder?: string
  message_count: number
  updated_at?: string
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const suggestedPrompts = [
  'Summarize all interactions with Sequoia in the last 12 months',
  'Find investors similar to Sequoia who invested in AI infrastructure',
  'Generate a diligence memo for Anthropic using our past notes',
  "What's the latest on Company Z's Series B?",
  'Find me 3 AI infrastructure companies at Series A',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `# Welcome to Kapitali\n\nI'm your AI investor copilot. I can help you:\n\n- **Research** — Find investors, companies, and market intelligence\n- **Summarize** — Pull together interactions from your CRM and documents\n- **Generate** — Create diligence memos, reports, and summaries\n- **Monitor** — Keep track of portfolio companies and market moves\n\nWhat would you like to explore today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const res = await fetch(`${API}/api/conversations`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch {}
  }

  const saveConversation = async (msgs: Message[], title?: string) => {
    const apiMsgs = msgs.filter((m) => m.id !== 'welcome').map((m) => ({
      role: m.role,
      content: m.content,
    }))
    if (apiMsgs.length === 0) return

    try {
      if (activeConvId) {
        await fetch(`${API}/api/conversations/${activeConvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMsgs,
            title: title || undefined,
          }),
        })
      } else {
        const res = await fetch(`${API}/api/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || msgs.find((m) => m.role === 'user')?.content.slice(0, 60) || 'New chat',
            messages: apiMsgs,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setActiveConvId(data.id)
        }
      }
      loadConversations()
    } catch {}
  }

  const loadConversation = async (id: number) => {
    try {
      const res = await fetch(`${API}/api/conversations/${id}`)
      if (res.ok) {
        const data = await res.json()
        const loaded: Message[] = (data.messages || []).map((m: { role: string; content: string }, i: number) => ({
          id: `loaded-${i}`,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(),
        }))
        setMessages([
          { id: 'welcome', role: 'assistant', content: messages[0].content, timestamp: new Date() },
          ...loaded,
        ])
        setActiveConvId(id)
      }
    } catch {}
  }

  const newConversation = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `# Welcome to Kapitali\n\nI'm your AI investor copilot. What would you like to explore today?`,
        timestamp: new Date(),
      },
    ])
    setActiveConvId(null)
    setInput('')
  }

  const deleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`${API}/api/conversations/${id}`, { method: 'DELETE' })
      if (activeConvId === id) newConversation()
      loadConversations()
    } catch {}
  }

  const handleSubmit = async () => {
    if (!input.trim() || isStreaming) return

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    const assistantId = generateId()
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }

    const newMsgs = [...messages, userMsg, assistantMsg]
    setMessages(newMsgs)
    setInput('')
    setIsStreaming(true)

    const chatHistory = newMsgs
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.content }))

    await fetchStream(
      chatHistory,
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
        )
      },
      () => {
        setIsStreaming(false)
        setMessages((prev) => {
          const final = prev.map((m) =>
            m.id === assistantId
              ? { ...m, sources: [{ title: 'CRM Data', snippet: 'Retrieved from knowledge base' }] }
              : m
          )
          saveConversation(final)
          return final
        })
      },
      () => setIsStreaming(false),
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex h-full">
      {sidebarOpen && (
        <div className="w-72 border-r border-surface-150 bg-surface/30 flex flex-col">
          <div className="p-4 border-b border-surface-150">
            <Button variant="outline" className="w-full justify-start gap-2 text-sm h-10" onClick={newConversation}>
              <Plus className="h-4 w-4" />
              New conversation
            </Button>
          </div>
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9 h-9 text-sm" />
            </div>
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={cn(
                      'w-full text-left rounded-lg px-3 py-2.5 transition-colors group',
                      conv.id === activeConvId ? 'bg-surface-100 border border-surface-200' : 'hover:bg-surface-50 border border-transparent',
                    )}
                  >
                    <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{conv.message_count} messages</span>
                        {conv.folder && (
                          <Badge variant="secondary" className="text-[10px] h-4">{conv.folder}</Badge>
                        )}
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-surface-150">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => setSidebarOpen(false)}>
              <PanelRightOpen className="h-4 w-4 rotate-180" />
              Close sidebar
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {!sidebarOpen && (
          <div className="flex items-center gap-3 px-6 py-3 border-b border-surface-150">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <PanelRightOpen className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-foreground">Current conversation</span>
          </div>
        )}

        <ScrollArea className="flex-1 px-6">
          <div className="mx-auto max-w-3xl py-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-4', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 shadow-glow">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={cn('max-w-[85%] space-y-2', msg.role === 'user' && 'order-first')}>
                  <div className={cn(
                    'rounded-2xl px-5 py-3',
                    msg.role === 'user' ? 'bg-brand-500 text-white' : 'bg-surface-50 border border-surface-150 text-foreground',
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:font-semibold prose-strong:text-white prose-code:text-brand-400 prose-code:bg-surface-100 prose-code:px-1 prose-code:rounded prose-li:text-muted-foreground prose-p:text-muted-foreground prose-p:leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content || (isStreaming && msg.id === messages[messages.length - 1]?.id ? '' : msg.content)}
                        </ReactMarkdown>
                        {isStreaming && msg.id === messages[messages.length - 1]?.id && !msg.content && (
                          <span className="inline-flex gap-1">
                            <span className="h-2 w-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="h-2 w-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="h-2 w-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        )}
                        {isStreaming && msg.id === messages[messages.length - 1]?.id && msg.content && (
                          <span className="inline-block h-4 w-0.5 bg-brand-400 animate-pulse ml-0.5" />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-white/90">{msg.content}</p>
                    )}
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="space-y-1.5 px-1">
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <FileText className="h-3 w-3" />
                        {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {msg.sources.slice(0, 2).map((source) => (
                        <div key={source.title} className="rounded-lg border border-surface-150 bg-surface-50/50 p-2.5">
                          <p className="text-xs font-medium text-foreground">{source.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{source.snippet}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.content && !isStreaming && (
                    <div className="flex items-center gap-1 px-2">
                      <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-100 transition-colors">
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-100 transition-colors">
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-100 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {messages.length <= 1 && (
          <div className="px-6 pb-2">
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); inputRef.current?.focus() }}
                    className="text-xs text-muted-foreground hover:text-foreground bg-surface-50 hover:bg-surface-100 rounded-full px-3.5 py-2 transition-all border border-surface-200 hover:border-surface-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-surface-150 px-6 py-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 glass rounded-2xl p-1">
              <div className="flex-1 px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your network, deals, or market..."
                  className="w-full bg-transparent border-0 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none"
                  disabled={isStreaming}
                />
              </div>
              <Button onClick={handleSubmit} disabled={!input.trim() || isStreaming} size="icon" className="h-10 w-10 shrink-0">
                {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/50 text-center mt-2">
              Kapitali uses Groq for fast, accurate responses. Answers are cited from your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
