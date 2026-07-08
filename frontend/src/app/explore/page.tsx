'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Building2, Users, DollarSign, Sparkles, ArrowUpRight, Filter } from 'lucide-react'

const entities = [
  {
    type: 'investor',
    name: 'Sequoia Capital',
    description: 'Leading VC firm with $85B AUM. Focus on AI, enterprise, and consumer tech. Known for early investments in Google, Stripe, and OpenAI.',
    tags: ['AI Infrastructure', 'Enterprise', 'Growth Stage'],
    lastInteraction: 'Jun 2025',
    strength: 'strong',
  },
  {
    type: 'investor',
    name: 'Andreessen Horowitz',
    description: 'Silicon Valley VC with $42B AUM. Heavy focus on AI, crypto, and bio/fintech. Active in Series A-B rounds.',
    tags: ['AI', 'Crypto', 'Bio'],
    lastInteraction: 'Mar 2025',
    strength: 'medium',
  },
  {
    type: 'company',
    name: 'Anthropic',
    description: 'AI safety company building Claude LLM. Recently raised $2B Series E at $60B valuation.',
    tags: ['AI Infrastructure', 'Generative AI'],
    lastInteraction: 'Apr 2025',
    strength: 'medium',
  },
  {
    type: 'company',
    name: 'Groq',
    description: 'AI hardware company building LPU for ultra-fast inference. Key partner for Kapitali.',
    tags: ['AI Hardware', 'Infrastructure'],
    lastInteraction: 'Jul 2025',
    strength: 'strong',
  },
  {
    type: 'deal',
    name: 'Anthropic Series E',
    description: '$2B round at $60B valuation. Led by Lightspeed, with participation from existing investors.',
    tags: ['Active', 'AI Infrastructure'],
    stage: 'Closed',
  },
  {
    type: 'deal',
    name: 'Groq Series D',
    description: '$640M round at $2.8B valuation. Expansion of LPU manufacturing capacity.',
    tags: ['Active', 'AI Hardware'],
    stage: 'In Progress',
  },
]

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const filtered = entities.filter((e) => {
    const matchesQuery = !query || e.name.toLowerCase().includes(query.toLowerCase()) || e.description.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = activeFilter === 'all' || e.type === activeFilter
    return matchesQuery && matchesFilter
  })

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white tracking-tight">Entity Explorer</h1>
        <p className="text-muted-foreground mt-1">Search investors, companies, and deals with AI summaries.</p>
      </div>

      {/* Search + Filters */}
      <div className="glass rounded-2xl p-1 mb-6">
        <div className="flex items-center gap-2 px-4">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search investors, companies, deals..."
            className="border-0 bg-transparent h-12 text-base placeholder:text-muted-foreground/50 focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Button variant={activeFilter === 'all' ? 'default' : 'secondary'} size="sm" onClick={() => setActiveFilter('all')}>
          All
        </Button>
        <Button variant={activeFilter === 'investor' ? 'default' : 'secondary'} size="sm" onClick={() => setActiveFilter('investor')}>
          <Building2 className="h-3.5 w-3.5 mr-1.5" /> Investors
        </Button>
        <Button variant={activeFilter === 'company' ? 'default' : 'secondary'} size="sm" onClick={() => setActiveFilter('company')}>
          <Users className="h-3.5 w-3.5 mr-1.5" /> Companies
        </Button>
        <Button variant={activeFilter === 'deal' ? 'default' : 'secondary'} size="sm" onClick={() => setActiveFilter('deal')}>
          <DollarSign className="h-3.5 w-3.5 mr-1.5" /> Deals
        </Button>
      </div>

      {/* Entity Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((entity) => (
          <div key={entity.name} className="glass rounded-xl p-5 card-hover group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  entity.type === 'investor' ? 'bg-brand-500/10 text-brand-400' : entity.type === 'company' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400',
                )}>
                  {entity.type === 'investor' ? <Building2 className="h-5 w-5" /> : entity.type === 'company' ? <Users className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{entity.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={entity.type === 'investor' ? 'default' : entity.type === 'company' ? 'success' : 'warning'} className="text-[10px]">
                      {entity.type}
                    </Badge>
                    {entity.type !== 'deal' && (
                      <span className={cn(
                        'text-xs',
                        entity.strength === 'strong' ? 'text-emerald-400' : 'text-amber-400',
                      )}>
                        {entity.strength === 'strong' ? '● Strong' : '● Moderate'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{entity.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {entity.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                ))}
                {entity.tags.length > 2 && (
                  <Badge variant="secondary" className="text-[10px]">+{entity.tags.length - 2}</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground/60">
                {entity.type === 'deal' ? `Stage: ${entity.stage}` : `Last: ${entity.lastInteraction}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
