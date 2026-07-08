'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn, formatRelativeTime, generateId } from '@/lib/utils'
import { fetchStream } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Send,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Copy,
  FileText,
  Loader2,
  Plus,
  Search,
  ChevronDown,
  PanelRightOpen,
  FolderClosed,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { title: string; snippet: string }[]
  timestamp: Date
}

const suggestedPrompts = [
  'Summarize all interactions with Sequoia in the last 12 months',
  'Find investors similar to Sequoia who invested in AI infrastructure',
  'Generate a diligence memo for Anthropic using our past notes',
  'What\'s the latest on Company Z\'s Series B?',
  'Find me 3 AI infrastructure companies at Series A',
]

const conversations = [
  { id: '1', title: 'Sequoia deep dive', date: '2h ago', folder: 'Diligence' },
  { id: '2', title: 'AI infrastructure market map', date: '5h ago', folder: 'Market Intel' },
  { id: '3', title: 'Anthropic memo generation', date: '1d ago', folder: 'Diligence' },
  { id: '4', title: 'Weekly digest — Week 27', date: '2d ago', folder: '' },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `# Welcome to Kapitali

I'm your AI investor copilot. I can help you:

- **Research** — Find investors, companies, and market intelligence
- **Summarize** — Pull together interactions from your CRM and documents
- **Generate** — Create diligence memos, reports, and summaries
- **Monitor** — Keep track of portfolio companies and market moves

What would you like to explore today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsStreaming(true)

    const chatHistory = [...messages, userMsg].map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    await fetchStream(
      chatHistory,
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
        )
      },
      () => {
        setIsStreaming(false)
        // Simulate sources for demo
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  sources: [
                    { title: 'CRM — Sequoia Profile', snippet: 'Last interaction: Jun 2025. Key contact: Alex Chen.' },
                    { title: 'Email Thread — Series A Discussion', snippet: 'Sequoia expressed interest in AI infrastructure deals...' },
                    { title: 'Meeting Notes — Jun 15', snippet: 'Discussed follow-up on portfolio syncing and market mapping.' },
                  ],
                }
              : m,
          ),
        )
      },
      () => {
        setIsStreaming(false)
      },
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
      {/* Conversation Sidebar */}
      {sidebarOpen && (
        <div className="w-72 border-r border-surface-150 bg-surface/30 flex flex-col">
          <div className="p-4 border-b border-surface-150">
            <Button variant="outline" className="w-full justify-start gap-2 text-sm h-10">
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
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className={cn(
                    'w-full text-left rounded-lg px-3 py-2.5 transition-colors',
                    conv.id === '1' ? 'bg-surface-100 border border-surface-200' : 'hover:bg-surface-50 border border-transparent',
                  )}
                >
                  <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{conv.date}</span>
                    {conv.folder && (
                      <Badge variant="secondary" className="text-[10px] h-4">
                        {conv.folder}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-surface-150">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <PanelRightOpen className="h-4 w-4 rotate-180" />
              Close sidebar
            </Button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        {!sidebarOpen && (
          <div className="flex items-center gap-3 px-6 py-3 border-b border-surface-150">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <PanelRightOpen className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-foreground">Current conversation</span>
            <Badge variant="secondary" className="text-[10px]">Diligence</Badge>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 px-6">
          <div className="mx-auto max-w-3xl py-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-4', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 shadow-glow">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className={cn(
                  'max-w-[85%] space-y-2',
                  msg.role === 'user' && 'order-first',
                )}>
                  {/* Message Bubble */}
                  <div className={cn(
                    'rounded-2xl px-5 py-3',
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-50 border border-surface-150 text-foreground',
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none
                        prose-headings:text-white prose-headings:font-semibold
                        prose-strong:text-white
                        prose-code:text-brand-400 prose-code:bg-surface-100 prose-code:px-1 prose-code:rounded
                        prose-li:text-muted-foreground
                        prose-p:text-muted-foreground prose-p:leading-relaxed">
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

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="space-y-1.5 px-1">
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <FileText className="h-3 w-3" />
                        {msg.sources.length} sources
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

                  {/* Message Actions */}
                  {msg.role === 'assistant' && msg.content && !isStreaming && (
                    <div className="flex items-center gap-1 px-2">
                      <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-100 transition-colors">
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-100 transition-colors">
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-100 transition-colors">
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

        {/* Prompt chips */}
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

        {/* Input Area */}
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
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || isStreaming}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
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
