# Kapitali — Complete Product Blueprint
> **Version 1.2** | **July 2026**

> *AI-native investor copilot that turns scattered relationships, notes, and market data into instant answers and polished deliverables.*
>
> **Tagline:** *Intelligence for Capital*

---

## 1. OVERVIEW

Kapitali is a modern, internal RAG-powered Investor Intelligence Platform that **deeply integrates with and enhances your existing CRM** with fast, accurate, and context-aware AI capabilities. Rather than replacing your CRM, Kapitali layers on top of it — bringing CRM data (investors, companies, deals, notes) into a conversational AI interface that makes it instantly queryable and actionable.

It enables investment teams to interact with investor data, deals, portfolio companies, documents, and market intelligence through natural language — without leaving the chat interface or switching between tools. Every answer is **secure, cited, and hallucination-resistant** — built on RAG retrieval from trusted data sources with transparent source attribution.

Built for speed and usability, Kapitali uses Groq for lightning-fast LLM inference and focuses on **exceptional UI/UX that feels premium and intuitive** — driving high adoption within the Singapore engineering and investment teams through a delightful, professional experience.

## 2. OBJECTIVES

| Objective | Target |
|-----------|--------|
| **Response Speed** | Deliver sub-3-second intelligent responses using Groq LLM inference |
| **Time Savings** | Reduce research and reporting time by 50%+ for investment teams |
| **User Adoption** | Drive > 80% adoption across investment teams through exceptional UX |
| **Data Integration** | Seamlessly integrate with existing CRM and document workflows |
| **Trust & Accuracy** | Maintain > 95% citation accuracy with traceable sources — hallucination-resistant by design |

---

## 3. EXECUTIVE SUMMARY

| Field | Value |
|-------|-------|
| **Project Name** | **Kapitali** |
| **Tagline** | *Intelligence for Capital* |
| **One-Liner** | AI-native investor copilot that turns scattered relationships, notes, and market data into instant answers and polished deliverables |
| **Type** | Web2 SaaS + AI Agent Layer |
| **Target Users** | VC investors, family offices, corporate development teams |
| **Problem** | Investor relationships, deal research, and diligence notes are scattered across emails, calendars, CRMs, and PDFs — no single source of truth, and no way to ask questions in plain English |
| **Solution** | An AI layer that sits on top of your existing CRM — ingesting CRM data, documents, and communications into a conversational interface that delivers instant answers, summaries, memos, and proactive insights without switching tools |
| **Timeline** | 3 phases — MVP (Core), Agentic, Advanced Analytics |
| **Architecture Style** | Modular monolith (FastAPI backend + Next.js frontend) |

---

## 4. USER PERSONAS & KEY USE CASES

### 👤 Investment Analysts

| Role | Focus | Key Use Cases |
|------|-------|---------------|
| **Investment Analysts** | Deep diligence, company/investor profiling | • "Summarize all interactions with Investor X in the last 12 months"
• "Find investors similar to Sequoia who invested in AI infrastructure"
• "Generate a diligence memo for Target Y using our past notes"
• "What's the latest on Company Z's Series B?" |



---

## 5. PRODUCT REQUIREMENTS — 3-PHASE ROADMAP

### 🎯 Phase 1 — MVP (Core Foundation)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Conversational Interface** | Clean, modern chat with streaming responses — the primary UX |
| 2 | **RAG Engine** | Retrieval-Augmented Generation over documents + structured CRM data for accurate, sourced answers |
| 3 | **CRM Integration** | Import/sync investors, companies, deals, and notes via CSV upload |
| 4 | **Document Intelligence** | Upload & analyze PDFs, memos, financials — extract insights, answer questions |
| 5 | **Cited Answers** | Every response includes inline source references (expandable). Hallucination-resistant by design — grounded in retrieved CRM + document data. |
| 6 | **Export** | Generate and download PDF, Markdown, or CSV reports from any query |

### 🚀 Phase 2 — Agentic Intelligence

| # | Feature | Description |
|---|---------|-------------|
| 7 | **Sidebar + Folders** | Conversation history with folders ("Fundraising", "Diligence", "Market Research") |
| 8 | **Multi-Agent Workflows** | Coordinated agents: research (market search), memo (synthesis from notes), monitoring (news/updates) |
| 9 | **Home Dashboard** | Recent queries, suggested prompts, key metrics, proactive insights |
| 10 | **Entity Explorer** | Searchable views for Investors, Companies, Deals with AI-generated summaries |
| 11 | **Proactive Digests** | Daily/weekly digests with key updates, new interactions, market moves |

### 🔮 Phase 3 — Connected Intelligence

| # | Feature | Description |
|---|---------|-------------|
| 12 | **Advanced Analytics Dashboard** | Visual portfolio overviews, interaction trends, deal pipeline, network maps |
| 13 | **UX Polish** | Animations, micro-interactions, feedback loops, loading skeletons, empty states |
| 14 | **Reports & Exports** | One-click beautiful report generation with templates |

---

## 6. USER FLOW

```
[Home Dashboard] → [Query / Prompt]
       │                    │
       │              [Chat Interface]
       │              ╱        │       ╲
       │        [RAG Query] [Agent Task] [Direct LLM]
       │              ╲        │       ╱
       │           [Cited Answer + Sources]
       │                    │
       │           [Export / Save] or [New Query]
       │                    │
       └──────── [Proactive Digest] ────────┘
```

---

## 7. TECH STACK

| Layer | Decision |
|-------|----------|
| **Frontend** | Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Radix Primitives |
| **Backend** | Python + FastAPI |
| **RAG Framework** | LlamaIndex (primary) |
| **LLM Provider** | Groq — `llama-3.3-70b-versatile` |
| **Vector Store** | pgvector (PostgreSQL) or Chroma (MVP) |
| **Database** | PostgreSQL + SQLAlchemy / Alembic |
| **Streaming** | Vercel AI SDK (frontend) + SSE (backend) |
| **Auth** | Clerk or Auth.js |
| **Deployment** | Docker + Vercel (frontend) + Fly.io / Railway (backend) |
| **Observability** | Query analytics + 👍/👎 feedback on every response |

### Frontend Architecture

| Decision | Value |
|----------|-------|
| **Rendering** | React Server Components (data views) + Client Components (chat, upload, interactivity) |
| **UI** | shadcn/ui + Tailwind + Radix Primitives |
| **Streaming** | Vercel AI SDK for smooth token-by-token streaming |
| **Content** | Markdown rendering with inline expandable citations |
| **Responsive** | Desktop-first with mobile-friendly layout |
| **Theme** | Dark mode default (fintech feel) with light mode toggle |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js 15)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Dashboard   │  │  Chat UI     │  │  Entity Explorer│ │
│  │  (RSC)       │  │  (Client)    │  │  (RSC)          │ │
│  └─────────────┘  └──────┬───────┘  └─────────────────┘ │
│                          │ Vercel AI SDK / SSE           │
├──────────────────────────┼──────────────────────────────┤
│                   API GATEWAY (FastAPI)                  │
├──────────┬───────────────┼───────────────┬──────────────┤
│  Auth    │  RAG Engine   │  Agent System │   Export     │
│  Clerk   │  LlamaIndex   │  Multi-Agent  │  PDF/MD/CSV  │
│  /Auth.js│  + Groq       │  Workflows    │              │
├──────────┴───────┬───────┴───────┬───────┴──────────────┤
│            PostgreSQL + pgvector                         │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────────┐ │
│  │  Users +     │  │  Documents  │  │  Embeddings      │ │
│  │  CRM Data    │  │  (PDFs etc) │  │  (pgvector)      │ │
│  └─────────────┘  └────────────┘  └──────────────────┘ │
├────────────────────────────────────────────────────────┤
│              EXTERNAL INTEGRATIONS                       │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐ │
│  │  Groq    │  │ Embeddings│  │ CRM Data (CSV/API)   │ │
│  └──────────┘  └───────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 8. PROJECT STRUCTURE

```
kapitali/
├── frontend/                    # Next.js 15 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Home Dashboard
│   │   │   ├── chat/            # Chat Interface
│   │   │   ├── explore/         # Entity Explorer
│   │   │   ├── documents/       # Document Library
│   │   │   ├── reports/         # Reports & Exports
│   │   │   └── settings/        # Settings
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── chat/            # Chat bubbles, input, sidebar
│   │   │   ├── entities/        # Entity cards, profiles
│   │   │   ├── documents/       # Upload, library, preview
│   │   │   └── dashboard/       # Metrics, insights
│   │   ├── lib/                 # API client, utils
│   │   └── types/               # TypeScript types
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── package.json
│
├── backend/                     # Python + FastAPI
│   ├── app/
│   │   ├── api/                 # Route handlers
│   │   │   ├── chat.py          # Chat + streaming endpoint
│   │   │   ├── documents.py     # Document upload/ingest
│   │   │   ├── entities.py      # Entity CRUD + search
│   │   │   ├── export.py        # Report generation
│   │   │   └── settings.py      # API key mgmt
│   │   ├── core/                # Config, dependencies
│   │   ├── models/              # SQLAlchemy models
│   │   ├── services/
│   │   │   ├── rag.py           # LlamaIndex RAG pipeline
│   │   │   ├── agents.py        # Multi-agent workflows
│   │   │   ├── ingestion.py     # Document + CSV processing
│   │   │   └── export.py        # Report generation logic
│   │   └── migrations/          # Alembic migrations
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
│
├── docker-compose.yml           # PostgreSQL + backend + frontend
├── .env.example
├── .gitignore
├── CLAUDE.md                    # AI rules file
└── README.md
```

---

## 9. KEY SCREENS

| # | Screen | Description |
|---|--------|-------------|
| 1 | **Home Dashboard** | Recent queries, suggested prompts, key metrics, proactive insights |
| 2 | **Main Chat Interface** | Sidebar + folders + streaming + markdown + citations + typing indicators + prompt chips |
| 3 | **Document Upload & Library** | Drag-and-drop, progress tracking, searchable knowledge base |
| 4 | **Entity Explorer** | Searchable views for Investors, Companies, Deals with AI summaries |
| 5 | **Reports & Exports** | One-click beautiful report generation (PDF, MD, CSV) |
| 6 | **Settings** | API management, data sources, user permissions, theme toggle |

---

## 10. UI/UX PRINCIPLES

| Principle | Implementation |
|-----------|----------------|
| **Premium & Intuitive** | Feels high-end out of the box — zero learning curve. Users should *want* to use it. |
| **Clean & Professional** | Minimal clutter, focus on content. Linear + Bloomberg terminal vibes |
| **Dark Mode Default** | Fintech feel — dark backgrounds, accent colors for data highlights |
| **Light Mode** | Toggle available |
| **Fast** | Groq-powered streaming. Sub-second TTFB. |
| **Responsive** | Desktop-first, mobile-friendly |
| **Delightful** | Micro-interactions, polished typography, smooth animations, thoughtful empty states |
| **Trust Through Clarity** | Citations always visible. Every answer traceable to source. |
| **Streaming-First** | Real-time token-by-token responses with status indicators |

---

## 11. NON-FUNCTIONAL REQUIREMENTS

### Performance

| Requirement | Target | Enabler |
|-------------|--------|---------|
| Response Time | < 3s average | Groq LPU inference |
| Streaming TTFB | < 500ms | Groq + Vercel AI SDK |
| Search Latency | < 1s | pgvector / Chroma |
| Document Processing | < 10s per PDF | Async pipeline |

### Scalability

| Requirement | Target | Strategy |
|-------------|--------|----------|
| Concurrent Users | 50+ initially | Horizontally scalable FastAPI + stateless backend |
| Future Growth | 500+ | Docker + auto-scaling on Fly.io / Railway |

### Reliability

| Requirement | Implementation |
|-------------|----------------|
| Graceful Fallbacks | Groq down → queue + notify. RAG fails → LLM-only fallback. |
| Retry Logic | Exponential backoff on rate limits / transient errors |
| Detailed Logging | Structured logs (request ID, latency, errors) per query |

### Observability

| Requirement | Implementation |
|-------------|----------------|
| Query Analytics | Dashboard tracking queries/day, top queries, avg latency, error rates |
| Feedback Buttons | 👍 Helpful / 👎 Not Helpful on every response |
| Usage Metrics | Active users, conversations, document count, export volume |

### Security

| Requirement | Solution |
|-------------|----------|
| Authentication | Clerk or Auth.js |
| Authorization | Role-based access control (RBAC) |
| Audit Logs | All queries, exports, settings changes logged |
| Data Encryption | At rest (AES-256) + in transit (TLS) |
| API Key Mgmt | Encrypted storage of provider keys |

---

## 12. SUCCESS METRICS

| Metric | Target |
|--------|--------|
| User Adoption Rate | > 80% within first month |
| Research & Report Time Reduction | > 50% reduction |
| User Satisfaction (CSAT) | > 4.5 / 5 |
| Response Latency | < 3s average |
| Citation Accuracy | > 95% |
| Average Session Time | TBD |
| Query Volume | TBD queries/user/session |

---

## 13. BUILD PLAN — PHASED PROMPTS FOR PI

### Phase 1 — Core Foundation

| # | Prompt |
|---|--------|
| 1 | **Scaffold monorepo** — Next.js 15 + FastAPI + Tailwind + shadcn/ui + dark Kapitali theme + Docker + .env.example + .gitignore |
| 2 | **Groq + LlamaIndex RAG pipeline** — Streaming FastAPI backend with pgvector, SSE streaming, citation tracking |
| 3 | **Beautiful chat UI** — shadcn/ui + Vercel AI SDK, streaming messages, markdown rendering, expandable citations, typing indicators, suggested prompt chips |
| 4 | **Document ingestion** — Drag-and-drop PDF upload → LlamaIndex parser → chunking → embedding → pgvector. Progress tracking. |
| 5 | **CRM CSV import** — Upload CSVs with investor/company/deal data → parse → structured DB → auto-embed for RAG queries |

### Phase 2 — Agentic Intelligence

| # | Prompt |
|---|--------|
| 6 | **Sidebar + conversation folders** — Collapsible sidebar with search, folders ("Fundraising", "Diligence"), conversation history |
| 7 | **Multi-Agent Workflows** — Coordinated LlamaIndex agents: research agent (web/market search), memo agent (synthesis from notes + docs), monitoring agent (tracks news/updates) |
| 8 | **Entity Explorer** — Searchable views for Investors, Companies, Deals with AI-generated summaries. Rich profiles with interaction history and linked documents. |
| 9 | **Home Dashboard** — Recent queries, suggested prompts, key metrics (contacts, deals, interactions), proactive insights |

### Phase 3 — Advanced & Analytics

| # | Prompt |
|---|--------|
| 10 | **UX Polish** — Smooth animations (Framer Motion), micro-interactions, feedback loops (👍/👎), loading skeletons, empty states |
| 11 | **Reports & Exports** — One-click beautiful report generation from any chat response. PDF (styled), Markdown, CSV. Report templates (diligence memo, interaction summary, market brief). |
| 12 | **Proactive Digests** — Daily/weekly email digests with key updates, new interactions, market moves |
| 13 | **Analytics Dashboard** — Visual portfolio overviews, interaction trends, deal pipeline, network maps |

---

## 14. SKILLS MAP FOR PI CODING AGENT

| Phase | Skills to Load |
|-------|---------------|
| **Phase 1 — Foundation** | `senior-engineer` (code guardrails), `test-generator` (tests) |
| **Phase 1 — Build** | `senior-engineer` (Next.js + Python code), `ui-ux-fixer` (chat UX) |
| **Phase 2 — Agentic** | `senior-engineer` (agent architecture), `claude-api` (AI patterns) |
| **Phase 3 — Polish** | `ui-ux-fixer` (UX refinements), `design-symmetry-auditor` (visual polish) |
| **Quality (all phases)** | `security_scan` (secrets), `eslint` (frontend linting), `pipeline` (types + tests) |
| **Ship** | `fast-deploy` (deploy automation) |

---

## 15. QUALITY GATES CHECKLIST

| Gate | Status |
|------|--------|
| Secret scan (no .env, no hardcoded keys) | ☐ |
| `.env.example` with all vars documented | ☐ |
| Input validation on all API endpoints | ☐ |
| TypeScript strict mode passes | ☐ |
| Linter clean (frontend + backend) | ☐ |
| Critical path works end-to-end | ☐ |
| Loading / empty / error states on all screens | ☐ |
| Citations render correctly with expandable sources | ☐ |
| Streaming works smoothly (no jank) | ☐ |
| Dark/light mode toggle works | ☐ |
| Responsive on mobile viewport | ☐ |
| Export generates valid PDF/MD/CSV | ☐ |
| README written with setup instructions | ☐ |

---

## 16. REFERENCE REPOSITORIES

| Repo | Why |
|------|-----|
| [LlamaIndex](https://github.com/run-llama/llama_index) | Core RAG framework — data connectors, indexing, query engine, agents |
| [Advanced RAG Techniques](https://github.com/NirDiamant/RAG_Techniques) | Comprehensive RAG patterns — chunking, routing, query transformation, hybrid search |
| [Quivr](https://github.com/QuivrHQ/quivr) | Groq + multi-LLM RAG app — architecture & UX patterns |
| [End-to-End Groq RAG](https://github.com/NebeyouMusie/End-To-End-Advanced-RAG-Project-using-Open-Source-LLM-Models-And-Groq-Inferencing) | Battle-tested Groq + LlamaIndex pipeline — ingestion, retrieval, citation |
| [Groq API Cookbook](https://github.com/groq/groq-api-cookbook) | Official Groq RAG examples — best practices from the source |
| [LangChain Groq Integration](https://github.com/langchain-ai/langchain/tree/master/libs/partners/groq) | LangChain's official Groq partner package — reference patterns |

---

## 17. CLAUDE.MD TEMPLATE

```markdown
# Kapitali — CLAUDE.md

## 🎯 Overview
- **Tagline:** Intelligence for Capital
- **One-liner:** AI-native investor copilot
- **Type:** Web2 SaaS + AI Agent Layer
- **Status:** 🟢 Blueprint approved — ready to build

## 🏗️ Tech Stack
- Frontend: Next.js 15 (App Router) + Tailwind + shadcn/ui + Radix
- Backend:  Python + FastAPI + LlamaIndex + Groq
- Database: PostgreSQL + pgvector
- Auth:     Clerk or Auth.js
- Hosting:  Vercel (frontend) + Fly.io / Railway (backend)
- Streaming: Vercel AI SDK + SSE

## 📁 Structure
See project scaffold in blueprint document.

## 🧠 Architecture
- **Data flow:** User query → Groq LLM + LlamaIndex RAG → cited answer
- **Key modules:**
  1. Chat + streaming — primary UX
  2. RAG engine — document + CRM retrieval
  3. Multi-agent workflows — research, memo, monitoring
  4. Export engine — PDF, MD, CSV reports

## ⚡ Build Order
See 3-phase prompt plan in blueprint document.

## 🔐 Security (NON-NEGOTIABLE)
1. NEVER commit .env or API keys
2. Validate ALL user inputs
3. No console.log in production
4. Handle loading/empty/error states
5. Encrypt all stored API keys

## ✅ Quality Gates Before Ship
See quality gates checklist in blueprint document.

## 🚫 What NOT To Do
- Don't chase edge cases before core works
- Don't optimize prematurely
- Don't write custom auth — use Clerk/Auth.js
- Don't hardcode secrets
- Don't add features outside current phase
```

---

## 18. NEXT STEPS

1. **Review this blueprint** — Any adjustments?
2. **Open decisions** (still need input):
   - Embeddings model: OpenAI `text-embedding-3-small` or open-source?
   - Solo or multi-user/team?
   - CSAT target for session time & query volume
3. **Ready to build?** → Start Phase 1, Prompt 1: Scaffold monorepo

---

*Built with the VibeCoding Structure Blueprinter + Project Launch Template.*
*Blueprint first. Skills auto-loaded. Ship fast.* 🚀
