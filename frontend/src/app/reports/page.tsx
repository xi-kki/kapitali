'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileBarChart, FileText, FileSpreadsheet, Download, Clock, Sparkles, Loader2 } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const templates = [
  { name: 'Diligence Memo', description: 'Structured memo from past notes, documents, and interactions', icon: FileText, format: 'markdown' },
  { name: 'Interaction Summary', description: 'Timeline of all interactions with an investor or company', icon: FileBarChart, format: 'markdown' },
  { name: 'Market Brief', description: 'Snapshot of a market segment with key players and trends', icon: FileBarChart, format: 'markdown' },
  { name: 'Portfolio Snapshot', description: 'Overview of portfolio companies with key metrics', icon: FileSpreadsheet, format: 'csv' },
]

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null)

  const handleGenerate = async (template: typeof templates[0]) => {
    setGenerating(template.name)
    try {
      const res = await fetch(`${API}/api/export/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: template.name,
          content: `# ${template.name}\n\nThis is a generated report from Kapitali.\n\nThe report would contain relevant data from your CRM, documents, and chat history.\n\n## Key Findings\n\n- Data sourced from your knowledge base\n- AI-powered analysis and synthesis\n- Cited with source attribution`,
          format: template.format,
          sources: [{ title: 'CRM Data', snippet: 'Your investor and company data' }],
        }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template.name.replace(/\s+/g, '_').toLowerCase()}.${template.format === 'markdown' ? 'md' : template.format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white tracking-tight">Reports & Exports</h1>
        <p className="text-muted-foreground mt-1">Generate beautiful reports from any chat response or data query.</p>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-400" />
          Quick Generate
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {templates.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.name}
                onClick={() => handleGenerate(t)}
                disabled={generating !== null}
                className="glass rounded-xl p-5 card-hover text-left group"
              >
                <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3 group-hover:bg-brand-500/20 transition-colors">
                  {generating === t.name ? (
                    <Loader2 className="h-5 w-5 text-brand-400 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5 text-brand-400" />
                  )}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.description}</p>
                <Badge variant="secondary" className="text-[10px] mt-2">
                  {t.format.toUpperCase()}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white mb-4">Export Formats</h2>
        <div className="glass rounded-xl p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-surface-50 border border-surface-150">
              <FileBarChart className="h-6 w-6 text-brand-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Markdown</p>
              <p className="text-xs text-muted-foreground">Rich text with formatting</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-surface-50 border border-surface-150">
              <FileSpreadsheet className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">CSV</p>
              <p className="text-xs text-muted-foreground">Spreadsheet compatible</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-surface-50 border border-surface-150">
              <FileText className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">JSON</p>
              <p className="text-xs text-muted-foreground">Structured data export</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
