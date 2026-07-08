'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileBarChart, FileText, FileSpreadsheet, Download, Clock, Sparkles } from 'lucide-react'

const reports = [
  { title: 'Sequoia Capital — Interaction Summary', type: 'PDF', date: '2 hours ago', size: '1.2 MB', status: 'ready' },
  { title: 'AI Infrastructure Market Map', type: 'PDF', date: '1 day ago', size: '3.4 MB', status: 'ready' },
  { title: 'Anthropic Due Diligence Memo', type: 'DOCX', date: '3 days ago', size: '2.1 MB', status: 'ready' },
  { title: 'Weekly Digest — Week 27', type: 'PDF', date: '5 days ago', size: '0.8 MB', status: 'ready' },
  { title: 'Portfolio Overview Q2 2025', type: 'XLSX', date: '1 week ago', size: '1.5 MB', status: 'ready' },
]

const templates = [
  { name: 'Diligence Memo', description: 'Structured memo from past notes, documents, and interactions', icon: FileText },
  { name: 'Interaction Summary', description: 'Timeline of all interactions with an investor or company', icon: FileBarChart },
  { name: 'Market Brief', description: 'Snapshot of a market segment with key players and trends', icon: FileBarChart },
  { name: 'Portfolio Snapshot', description: 'Overview of portfolio companies with key metrics', icon: FileSpreadsheet },
]

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white tracking-tight">Reports & Exports</h1>
        <p className="text-muted-foreground mt-1">Generate beautiful reports from any chat response or data query.</p>
      </div>

      {/* Templates */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-400" />
          Quick Generate
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {templates.map((t) => {
            const Icon = t.icon
            return (
              <button key={t.name} className="glass rounded-xl p-5 card-hover text-left group">
                <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3 group-hover:bg-brand-500/20 transition-colors">
                  <Icon className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Reports</h2>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">View all</Button>
        </div>
        <div className="glass rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_100px_100px_60px] gap-4 px-5 py-3 border-b border-surface-150 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Name</span>
            <span>Format</span>
            <span>Size</span>
            <span>Date</span>
            <span></span>
          </div>
          <div className="divide-y divide-surface-150">
            {reports.map((report) => (
              <div key={report.title} className="grid grid-cols-[1fr_80px_100px_100px_60px] gap-4 px-5 py-3.5 items-center hover:bg-surface-50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <FileBarChart className="h-4 w-4 text-brand-400 shrink-0" />
                  <span className="text-sm text-foreground truncate">{report.title}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] w-fit">{report.type}</Badge>
                <span className="text-xs text-muted-foreground">{report.size}</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground/60" />
                  <span className="text-xs text-muted-foreground">{report.date}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
