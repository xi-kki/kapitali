'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { searchEntities } from '@/lib/api'
import { Search, Building2, Users, DollarSign, ArrowUpRight, Loader2 } from 'lucide-react'

interface Entity {
  id: string
  name: string
  type: string
  description: string
  tags: string[]
  strength: string
  stage?: string
  last_interaction?: string
}

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntities()
  }, [])

  const loadEntities = async () => {
    setLoading(true)
    try {
      const data = await searchEntities('')
      setEntities(data.results || [])
    } catch {
      // Fallback to seed data display
      setEntities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchEntities(query, activeFilter === 'all' ? undefined : activeFilter)
        .then((data) => setEntities(data.results || []))
        .catch(() => {})
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, activeFilter])

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white tracking-tight">Entity Explorer</h1>
        <p className="text-muted-foreground mt-1">Search investors, companies, and deals with AI summaries.</p>
      </div>

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
        {[
          { key: 'all', label: 'All' },
          { key: 'investor', label: 'Investors', icon: Building2 },
          { key: 'company', label: 'Companies', icon: Users },
          { key: 'deal', label: 'Deals', icon: DollarSign },
        ].map((f) => (
          <Button
            key={f.key}
            variant={activeFilter === f.key ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setActiveFilter(f.key)}
          >
            {f.icon && <f.icon className="h-3.5 w-3.5 mr-1.5" />}
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-brand-400 animate-spin" />
          <span className="ml-3 text-muted-foreground">Loading entities...</span>
        </div>
      ) : entities.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No entities found. Import CRM data or upload documents.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {entities.map((entity) => (
            <div key={entity.id} className="glass rounded-xl p-5 card-hover group">
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
                        <span className={cn('text-xs', entity.strength === 'strong' ? 'text-emerald-400' : 'text-amber-400')}>
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
                  {(entity.tags || []).slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                  {(entity.tags || []).length > 2 && (
                    <Badge variant="secondary" className="text-[10px]">+{(entity.tags || []).length - 2}</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground/60">
                  {entity.type === 'deal' ? `Stage: ${entity.stage || 'Unknown'}` : `Last: ${entity.last_interaction || 'N/A'}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
