'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { uploadDocument } from '@/lib/api'
import { Upload, FileText, Search, Trash2, Clock, Loader2, CheckCircle2 } from 'lucide-react'

interface Doc {
  filename: string
  source: string
  entity_name?: string
  entity_type?: string
  chunks: number
  created_at?: string
}

export default function DocumentsPage() {
  const [query, setQuery] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocs()
  }, [])

  const loadDocs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/documents/list`)
      if (res.ok) {
        const data = await res.json()
        setDocs(data.documents || [])
      }
    } catch {
      setDocs([])
    } finally {
      setLoading(false)
    }
  }

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
    await processFiles(files)
  }, [])

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    await processFiles(files)
  }, [])

  const processFiles = async (files: File[]) => {
    setUploading(true)
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(Math.round(((i + 1) / files.length) * 100))
      setUploadStatus(`Processing ${files[i].name}...`)
      try {
        await uploadDocument(files[i])
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }
    setUploading(false)
    setUploadProgress(0)
    setUploadStatus('')
    await loadDocs()
  }

  const filtered = docs.filter((d) => d.filename.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white tracking-tight">Document Library</h1>
        <p className="text-muted-foreground mt-1">Upload PDFs, memos, financials — instantly searchable by Kapitali.</p>
      </div>

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
            <p className="text-sm font-medium text-foreground mb-2">{uploadStatus || 'Processing...'}</p>
            <div className="w-full max-w-md mx-auto bg-surface-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
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
            <p className="text-xs text-muted-foreground mb-4">or click to browse — PDF, CSV, DOCX, TXT, MD</p>
            <label>
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Browse files
                </span>
              </Button>
              <input type="file" className="hidden" multiple accept=".pdf,.csv,.docx,.txt,.md" onChange={handleFileInput} />
            </label>
          </>
        )}
      </div>

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

      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_80px_80px] gap-4 px-5 py-3 border-b border-surface-150 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Name</span>
          <span>Source</span>
          <span>Chunks</span>
          <span>Added</span>
        </div>
        <div className="divide-y divide-surface-150">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 text-brand-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No documents yet. Upload something to get started.</p>
            </div>
          ) : (
            filtered.map((doc) => (
              <div key={doc.filename} className="grid grid-cols-[1fr_80px_80px_80px] gap-4 px-5 py-3.5 items-center hover:bg-surface-50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-brand-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm text-foreground truncate block">{doc.filename}</span>
                    {doc.entity_name && <span className="text-xs text-muted-foreground">{doc.entity_name}</span>}
                  </div>
                </div>
                <Badge variant={doc.source === 'crm_import' ? 'default' : 'secondary'} className="text-[10px] w-fit">
                  {doc.source === 'crm_import' ? 'CRM' : 'Upload'}
                </Badge>
                <span className="text-xs text-muted-foreground">{doc.chunks}</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs text-muted-foreground">Indexed</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
