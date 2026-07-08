# Kapitali — CLAUDE.md

## 🎯 Overview
- **Tagline:** Intelligence for Capital
- **One-liner:** AI-native investor copilot with Groq-powered RAG
- **Type:** Web2 SaaS + AI Agent Layer
- **Status:** 🟢 Phase 1 scaffold complete

## 🏗️ Tech Stack
- Frontend: Next.js 15 (App Router) + Tailwind + shadcn/ui + Radix
- Backend:  Python + FastAPI + LlamaIndex + Groq
- Database: PostgreSQL + pgvector
- Auth:     Clerk or Auth.js
- Hosting:  Vercel (frontend) + Fly.io / Railway (backend)
- Streaming: Vercel AI SDK + SSE

## 📁 Structure
```
kapitali/
├── frontend/          # Next.js 15 — all 6 screens built
│   ├── src/app/       # Dashboard, Chat, Explore, Docs, Reports, Settings
│   └── src/components/# UI primitives + feature components
├── backend/           # FastAPI + LlamaIndex RAG pipeline
│   └── app/
│       ├── api/       # Chat, Documents, Entities routes
│       └── services/  # RAG engine, document ingestion
├── .github/workflows/ # CI pipeline
├── .husky/            # Git hooks
├── docker-compose.yml # PostgreSQL + backend + frontend
└── kapitali-blueprint.md
```

## 🧠 Architecture
- **Data flow:** User query → Groq LLM + LlamaIndex RAG → cited answer
- **Key modules:**
  1. Chat + streaming — primary UX (frontend/chat + backend/api/chat)
  2. RAG engine — document + CRM retrieval (backend/services/rag)
  3. Document ingestion — PDF + CSV processing (backend/services/ingestion)
  4. Entity explorer — search across investors/companies/deals

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
Phase 1 complete — scaffold, RAG pipeline, all 6 screens, CI/CD, Docker
Next: Phase 2 — agentic workflows, proactive digests, multi-agent system
