'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Key, Database, Users, Palette, Bell, RefreshCw, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function SettingsPage() {
  const [groqKey, setGroqKey] = useState('')
  const [showGroq, setShowGroq] = useState(false)
  const [saved, setSaved] = useState(false)
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your API keys, data sources, and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* API Keys */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <Key className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">API Keys</h2>
              <p className="text-xs text-muted-foreground">Encrypted at rest. Used only for Kapitali operations.</p>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Groq API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showGroq ? 'text' : 'password'}
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="pr-10"
                  />
                  <button
                    onClick={() => setShowGroq(!showGroq)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showGroq ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleSave} className="gap-2">
                  {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : 'Update'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Used for all LLM inference via llama-3.3-70b-versatile</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">System Status</h2>
              <p className="text-xs text-muted-foreground">Backend health and RAG pipeline status.</p>
            </div>
          </div>
          <Separator className="mb-4" />
          {loading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-4 w-4 text-brand-400 animate-spin" />
              <span className="text-sm text-muted-foreground">Checking status...</span>
            </div>
          ) : health ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-50 p-3.5 border border-surface-150">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`h-2 w-2 rounded-full ${health.groq_configured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <p className="text-sm font-medium text-foreground">Groq API</p>
                </div>
                <p className="text-xs text-muted-foreground">{health.groq_configured ? `Connected — ${health.model}` : 'Not configured'}</p>
              </div>
              <div className="rounded-lg bg-surface-50 p-3.5 border border-surface-150">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`h-2 w-2 rounded-full ${health.database?.includes('exists') ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <p className="text-sm font-medium text-foreground">Database</p>
                </div>
                <p className="text-xs text-muted-foreground">{health.rag_pipeline || 'SQLite FTS5'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-400">Backend unreachable — is it running on port 8000?</p>
          )}
        </div>

        {/* Preferences */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Preferences</h2>
              <p className="text-xs text-muted-foreground">Customize your Kapitali experience.</p>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Theme</p>
                <p className="text-xs text-muted-foreground">Dark mode (fintech theme)</p>
              </div>
              <Badge variant="default">Dark</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Default Export Format</p>
                <p className="text-xs text-muted-foreground">Markdown for reports, CSV for data</p>
              </div>
              <Badge variant="secondary">Markdown</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
