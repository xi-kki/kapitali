'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Key, Database, Users, Palette, Bell, RefreshCw, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const [groqKey, setGroqKey] = useState('sk-••••••••••••••••••••••••')
  const [showGroq, setShowGroq] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      {/* Header */}
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

        {/* Data Sources */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Data Sources</h2>
              <p className="text-xs text-muted-foreground">Connected data sources for Kapitali to index and query.</p>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-surface-50 p-3.5 border border-surface-150">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-foreground">CRM — CSV Import</p>
                  <p className="text-xs text-muted-foreground">342 contacts · 186 companies · 24 deals · Last synced 2h ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Sync
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-50 p-3.5 border border-surface-150">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-foreground">Document Library</p>
                  <p className="text-xs text-muted-foreground">89 documents · 156 MB total · All indexed</p>
                </div>
              </div>
              <Badge variant="success" className="text-[10px]">Active</Badge>
            </div>
          </div>
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
                <p className="text-sm font-medium text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Daily digest, proactive insights, deal alerts</p>
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-3.5 w-3.5 mr-1.5" />
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Default Export Format</p>
                <p className="text-xs text-muted-foreground">PDF for reports, Markdown for summaries</p>
              </div>
              <Badge variant="secondary">PDF</Badge>
            </div>
          </div>

          {/* User Permissions */}
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Team Members</p>
                <p className="text-xs text-muted-foreground">1 user — solo plan</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
