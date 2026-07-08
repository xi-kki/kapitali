'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  TrendingUp,
  Users,
  Building2,
  FileText,
  ArrowUpRight,
  Sparkles,
  Clock,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

const stats = [
  { label: 'Active Deals', value: '24', change: '+3', icon: TrendingUp, color: 'text-emerald-400' },
  { label: 'Contacts', value: '342', change: '+12', icon: Users, color: 'text-brand-400' },
  { label: 'Companies', value: '186', change: '+5', icon: Building2, color: 'text-blue-400' },
  { label: 'Documents', value: '89', change: '+8', icon: FileText, color: 'text-amber-400' },
]

const recentQueries = [
  { q: 'Summarize all interactions with Sequoia in the last 12 months', time: '2h ago' },
  { q: 'Find investors similar to Sequoia who invested in AI infrastructure', time: '5h ago' },
  { q: 'Generate a diligence memo for Anthropic using our past notes', time: '1d ago' },
]

const suggestedPrompts = [
  'Summarize my interactions with Investor X',
  'Find investors similar to...',
  "What's the latest on Company Z?",
  'Generate a weekly digest',
]

export default function Dashboard() {
  const [query, setQuery] = useState('')

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-brand-400 text-sm font-medium mb-1">
          <Sparkles className="h-4 w-4" />
          Good morning, Sarah
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">
          Intelligence Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Your portfolio and network at a glance.
        </p>
      </div>

      {/* Quick Query Bar */}
      <div className="glass rounded-2xl p-1 mb-8">
        <div className="flex items-center gap-2 px-4">
          <Sparkles className="h-5 w-5 text-brand-400 shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your network, deals, or market..."
            className="border-0 bg-transparent h-12 text-base placeholder:text-muted-foreground/50 focus-visible:ring-0"
          />
          <Button size="sm" className="shrink-0">
            <MessageSquare className="h-4 w-4 mr-2" />
            Ask
          </Button>
        </div>
        <div className="flex items-center gap-2 px-4 pb-3 pt-1">
          {suggestedPrompts.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              onClick={() => setQuery(prompt)}
              className="text-xs text-muted-foreground hover:text-foreground bg-surface-100 hover:bg-surface-200 rounded-full px-3 py-1.5 transition-colors border border-surface-200"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass rounded-xl p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`h-5 w-5 ${stat.color}`} />
                <Badge variant="success" className="text-[10px]">
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Queries */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Queries
            </h2>
            <Link href="/chat" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentQueries.map((item) => (
              <Link
                key={item.q}
                href="/chat"
                className="flex items-start justify-between gap-3 rounded-lg p-2.5 hover:bg-surface-100 transition-colors group"
              >
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
                  {item.q}
                </p>
                <span className="text-xs text-muted-foreground/60 shrink-0 pt-0.5">{item.time}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Proactive Insights */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-400" />
              Proactive Insights
            </h2>
            <Badge variant="default" className="text-[10px]">AI-powered</Badge>
          </div>
          <div className="space-y-3">
            {[
              { text: 'You haven\'t connected with Alex from Sequoia in 3 months. Consider a check-in.', type: 'action' },
              { text: 'Anthropic just raised a $2B Series E — update your diligence memo.', type: 'alert' },
              { text: '3 new AI infrastructure companies match your portfolio criteria.', type: 'opportunity' },
            ].map((insight) => (
              <div key={insight.text} className="flex items-start gap-3 rounded-lg p-2.5 bg-surface-50 border border-surface-150">
                <div className={cn(
                  'h-2 w-2 rounded-full mt-1.5 shrink-0',
                  insight.type === 'action' ? 'bg-amber-400' : insight.type === 'alert' ? 'bg-brand-400' : 'bg-emerald-400'
                )} />
                <p className="text-sm text-muted-foreground">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
