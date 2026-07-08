const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function fetchStream(
  messages: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (chunk: string) => void,
  onDone?: () => void,
  onError?: (err: Error) => void,
) {
  try {
    const response = await fetch(`${API_BASE}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader available')

    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        onDone?.()
        break
      }

      const text = decoder.decode(value, { stream: true })
      const lines = text.split('\n').filter((l) => l.startsWith('data: '))

      for (const line of lines) {
        const data = line.slice(6)
        if (data === '[DONE]') {
          onDone?.()
          return
        }
        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            onChunk(parsed.content)
          }
        } catch {
          onChunk(data)
        }
      }
    }
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error(String(err)))
  }
}

export async function uploadDocument(file: File, onProgress?: (pct: number) => void) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) throw new Error('Upload failed')
  return response.json()
}

export async function searchEntities(query: string, type?: string) {
  const params = new URLSearchParams({ query })
  if (type) params.set('type', type)

  const response = await fetch(`${API_BASE}/api/entities/search?${params}`)
  if (!response.ok) throw new Error('Search failed')
  return response.json()
}

export async function getHealth() {
  const response = await fetch(`${API_BASE}/health`)
  return response.json()
}
