# Kapitali — Intelligence for Capital

> AI-native investor copilot that turns scattered relationships, notes, and market data into instant answers and polished deliverables.

**Tagline:** *Intelligence for Capital* | **v1.2** | **July 2026**

[![CI](https://github.com/xi-kki/kapitali/actions/workflows/ci.yml/badge.svg)](https://github.com/xi-kki/kapitali/actions/workflows/ci.yml)

---

## 🚀 Overview

Kapitali is a modern, internal RAG-powered Investor Intelligence Platform that deeply integrates with and enhances your existing CRM. It enables investment teams to interact with investor data, deals, portfolio companies, documents, and market intelligence through natural language — without leaving the chat interface.

- **⚡ Fast:** Groq-powered sub-3-second responses
- **🎯 Accurate:** Cited, hallucination-resistant answers with source attribution
- **✨ Premium:** Exceptional UI/UX — dark mode, streaming, delightful interactions

## 🎯 Objectives

| Objective | Target |
|-----------|--------|
| Response Speed | < 3s via Groq LPU inference |
| Time Savings | 50%+ reduction in research & reporting |
| User Adoption | > 80% within first month |
| Trust & Accuracy | > 95% citation accuracy |

## 🏗️ Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Radix |
| **Backend** | Python + FastAPI + LlamaIndex |
| **LLM** | Groq — `llama-3.3-70b-versatile` |
| **Vector Store** | pgvector (PostgreSQL) |
| **Database** | PostgreSQL + SQLAlchemy / Alembic |
| **Streaming** | Vercel AI SDK + SSE |
| **Auth** | Clerk or Auth.js |
| **Deployment** | Docker + Vercel (frontend) + Fly.io / Railway (backend) |

## 📁 Project Structure

```
kapitali/
├── frontend/               # Next.js 15 App Router
│   ├── src/
│   │   ├── app/            # Pages: dashboard, chat, explore, docs, reports, settings
│   │   ├── components/     # UI, chat, entities, documents, dashboard
│   │   └── lib/            # API client, utils
│   ├── Dockerfile
│   └── package.json
│
├── backend/                # Python + FastAPI
│   ├── app/
│   │   ├── api/            # Routes: chat, documents, entities, export, settings
│   │   ├── services/       # RAG pipeline, agents, ingestion, export
│   │   └── models/         # SQLAlchemy models
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── .github/workflows/      # CI pipeline
├── .husky/                 # Git hooks (pre-commit, commit-msg, pre-push)
├── .env.example            # Environment template
├── .env                    # Local env (gitignored)
├── .eslintrc.json          # Linting config
├── .prettierrc             # Formatting config
├── commitlint.config.js    # Conventional commits
├── docker-compose.yml      # PostgreSQL + backend + frontend
├── kapitali-blueprint.md   # Full PRD & architecture
└── README.md
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker (optional, for PostgreSQL)

### Setup

```bash
# 1. Clone
git clone https://github.com/xi-kki/kapitali.git
cd kapitali

# 2. Install deps (frontend tooling)
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env — add your GROQ_API_KEY

# 4. Backend
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows
# source .venv/bin/activate     # Mac/Linux
pip install -r requirements.txt

# 5. Frontend
cd ../frontend
npm install

# 6. Run with Docker
cd ..
docker-compose up
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

### Git Standards

This repo enforces:
- **Conventional commits** — `feat:`, `fix:`, `docs:`, etc.
- **Linting** — ESLint + Prettier on every commit
- **Branch naming** — `feature/xxx`, `fix/xxx`, `chore/xxx`
- **Pre-push checks** — lint + format + test
- **CI pipeline** — quality, commitlint, secrets scan

```bash
# Branch naming
git checkout -b feature/your-feature-name
git checkout -b fix/your-bug-fix
```

## 📋 Blueprint

See [kapitali-blueprint.md](./kapitali-blueprint.md) for the full PRD, architecture diagram, 3-phase feature roadmap, and build plan with 13 phased prompts.

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| User Adoption Rate | > 80% within first month |
| Research & Report Time Reduction | > 50% |
| User Satisfaction (CSAT) | > 4.5 / 5 |
| Response Latency | < 3s average |
| Citation Accuracy | > 95% |

## 📄 License

MIT — see LICENSE file.
