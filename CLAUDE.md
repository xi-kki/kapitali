# Kapitali — CLAUDE.md

## 🎯 Overview
- **Tagline:** Intelligence for Capital
- **One-liner:** AI-native investor copilot with Groq-powered RAG
- **Type:** Web2 SaaS + AI Agent Layer
- **Status:** 🟢 Phase 1 complete — all 6 screens, RAG pipeline, conversation persistence, exports

## 🏗️ Tech Stack
- Frontend: Next.js 15 (App Router) + Tailwind + shadcn/ui + Radix
- Backend:  Python + FastAPI + LlamaIndex + Groq
- Database: SQLite FTS5 (MVP) → PostgreSQL + pgvector (production)
- Auth:     Clerk or Auth.js (planned)
- Hosting:  Vercel (frontend) + Fly.io / Railway (backend)
- Streaming: Vercel AI SDK + SSE

## 📁 Structure
```
kapitali/
├── frontend/          # Next.js 15 — all 6 screens built + wired to backend
│   ├── src/app/       # Dashboard, Chat, Explore, Documents, Reports, Settings
│   └── src/components/# UI primitives + error boundary + layout
├── backend/           # FastAPI + Groq RAG pipeline
│   └── app/
│       ├── api/       # Chat, Documents, Entities, Conversations, Export routes
│       └── services/  # RAG pipeline, document ingestion
├── .github/workflows/ # CI pipeline
├── .husky/            # Git hooks
├── docker-compose.yml # PostgreSQL + backend + frontend
└── kapitali-blueprint.md
```

## 🧠 Architecture
- **Data flow:** User query → SQLite FTS5 search → Groq LLM + context → streamed cited answer
- **Key modules:**
  1. Chat + streaming + conversation persistence — primary UX
  2. RAG engine — FTS5 keyword retrieval + Groq generation
  3. Document ingestion — CSV/TXT/MD processing + chunking
  4. Entity explorer — search across investors/companies/deals (DB-backed)
  5. Export engine — Markdown, CSV, JSON report generation

## 🔐 Security (NON-NEGOTIABLE)
1. NEVER commit .env or API keys — .env is gitignored
2. Validate ALL user inputs on API endpoints
3. No console.log in production code
4. Handle loading/empty/error states in all UI

## 🚫 What NOT To Do
- Don't chase edge cases before core works
- Don't optimize prematurely
- Don't hardcode secrets
- Don't add features outside current phase

## 📋 Current Phase
Phase 1 complete — scaffold, RAG pipeline, all 6 screens wired to backend, CI/CD, Docker
Next: Phase 2 — agentic workflows, proactive digests, multi-agent system
