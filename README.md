# Kapitali — Intelligence for Capital

> AI-native investor copilot that turns scattered relationships, notes, and market data into instant answers and polished deliverables.

**Tagline:** *Intelligence for Capital*

---

## 🚀 Overview

Kapitali is a modern, internal RAG-powered Investor Intelligence Platform that deeply integrates with and enhances your existing CRM. It enables investment teams to interact with investor data, deals, portfolio companies, documents, and market intelligence through natural language.

- **Fast:** Groq-powered sub-3-second responses
- **Accurate:** Cited, hallucination-resistant answers
- **Premium:** Exceptional UI/UX — dark mode, streaming, delightful interactions

## 🏗️ Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15 + TypeScript + Tailwind + shadcn/ui |
| Backend | Python + FastAPI + LlamaIndex |
| LLM | Groq (llama-3.3-70b-versatile) |
| Database | PostgreSQL + pgvector |
| Auth | Clerk or Auth.js |

## 📁 Project Structure

```
kapitali/
├── frontend/          # Next.js 15 App Router
├── backend/           # Python + FastAPI API
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🛠️ Getting Started

```bash
# Clone
git clone https://github.com/xi-kki/kapitali.git
cd kapitali

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install

# Run (from root)
docker-compose up
```

## 📋 Blueprint

See [kapitali-blueprint.md](./kapitali-blueprint.md) for the full PRD, architecture, and build plan.

## 📊 Success Metrics

- > 80% user adoption within first month
- > 50% reduction in research & reporting time
- < 3s average response latency
- > 95% citation accuracy
