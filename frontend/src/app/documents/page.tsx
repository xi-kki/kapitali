'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Search, Trash2, Download, Clock, X, CheckCircle2, Loader2 } from 'lucide-react'

const initialDocs = [
  { name: 'Sequoia Meeting Notes.pdf', type: 'PDF', size: '2.4 MB', date: '2 days ago', status: 'indexed' },
  { name: 'AI Infrastructure Market Map.xlsx', type: 'XLSX', size: '4.1 MB', date: '5 days ago', status: 'indexed' },
  { name: 'Anthropic Due Diligence.docx', type: 'DOCX', size: '1.8 MB', date: '1 week ago', status: 'indexed' },
  { name: 'Portfolio Q2 Review.pdf', type: 'PDF', size: '3.2 MB', date: '2 weeks ago', status: 'indexed' },
  { name: 'Fundraising Deck v3.pdf', type: 'PDF', size: '8.7 MB', date: '3 weeks ago', status: 'indexed' },
  { name: 'Competitive Landscape Analysis.csv', type: 'CSV', size: '0.6 MB', date: '1 month ago', status: 'indexed' },
]

export default function DocumentsPage() {
  const [query, setQuery] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [docs, setDocs] = useState(initialDocs)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    setUploading(true)
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(Math.round(((i + 1) / files.length) * 100))
      await new Promise((r) => setTimeout(r, 1000))
      setDocs((prev) => [
        {
          name: files[i].name,
          type: files[i].name.split('.').pop()?.toUpperCase() || 'FILE',
          size: `${(files[i].size / (1024 * 1024)).toFixed(1)} MB`,
          date: 'just now',
          status: 'indexed',
        },
        ...prev,
      ])
    }
    setUploading(false)
    setUploadProgress(0)
  }, [])

  const filtered = docs.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white tracking-tight">Document Library</h1>
        <p className="text-muted-foreground mt-1">Upload PDFs, memos, financials — instantly searchable by Kapitali.</p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`glass rounded-2xl p-8 mb-6 text-center transition-all duration-200 ${
          isDragging ? 'border-brand-500 bg-brand-500/5 scale-[1.01]' : ''
        }`}
      >
        {uploading ? (
          <div className="py-4">
            <Loader2 className="h-8 w-8 text-brand-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-2">Processing documents...</p>
            <div className="w-full max-w-md mx-auto bg-surface-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{uploadProgress}%</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-brand-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">or click to browse — PDF, CSV, DOCX, XLSX, TXT, MD</p>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Browse files
            </Button>
          </>
        )}
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-1 mb-6">
        <div className="flex items-center gap-2 px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="border-0 bg-transparent h-10 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_100px_80px_40px] gap-4 px-5 py-3 border-b border-surface-150 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Name</span>
          <span>Type</span>
          <span>Size</span>
          <span>Date</span>
          <span></span>
        </div>
        <div className="divide-y divide-surface-150">
          {filtered.map((doc) => (
            <div key={doc.name} className="grid grid-cols-[1fr_80px_100px_80px_40px] gap-4 px-5 py-3.5 items-center hover:bg-surface-50 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-4 w-4 text-brand-400 shrink-0" />
                <span className="text-sm text-foreground truncate">{doc.name}</span>
              </div>
              <Badge variant="secondary" className="text-[10px] w-fit">{doc.type}</Badge>
              <span className="text-xs text-muted-foreground">{doc.size}</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground/60" />
                <span className="text-xs text-muted-foreground">{doc.date}</span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
