<div align="center">

# 🧠 KnowledgeOS

**Your personal AI-powered knowledge management system.**  
Save anything from the web. Let AI score, summarize, and organize it — based on *your* profile, not generic algorithms.

![.NET](https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter_AI-000000?style=for-the-badge&logo=openai&logoColor=white)
![Hangfire](https://img.shields.io/badge/Hangfire-FF4500?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## 📖 What is KnowledgeOS?

KnowledgeOS is a self-hosted knowledge vault — a place where everything you find on the internet lands, gets evaluated by AI, and either gets archived or filtered out.

Instead of mindlessly saving bookmarks you never revisit, KnowledgeOS uses a **personalized AI scoring pipeline** to decide how relevant each piece of content is *to you* — based on your hobbies, professional context, and learning goals.

### Core flow

```
URL saved by user (Inbox or Vault target)
      │
      ▼
[Ingestion Job] ──► Fetch metadata (title, image, description)
      │               YouTube API / website OpenGraph
      ▼
[AI Analysis Job] ──► Multi-axis tiers, verdict, summary, tags
      │                Substance · intent · relevance (+ avoidance)
      ▼
[Inbox] ──► Review (tier chips, feedback) ──► [Vault]
                  └──► [Trash] / [Archive]
```

---

## ✨ Features

### 🤖 AI-Powered Inbox
- Every saved resource is analyzed on **three axes**: **Substance depth**, **Content intent**, and **Relevance** to your profile
- The model returns **discrete tiers** (not a raw 0–100 guess); the backend computes **sort priority** and stores axis labels for a stable, explainable UI
- **Tier chips** with per-tier colors and icons — no misleading progress bars
- AI generates a **verdict**, **summary**, **takeaway**, and **tags**
- Protects against keyword hallucination — "AI" in the title ≠ match if the content is shallow or off-topic
- Short or sparse profiles use **conservative relevance** rules (no guessing from title keywords alone)
- **Topics to avoid** hard-cap relevance when matched
- Visible **processing state** while ingestion / AI analysis runs; inbox **auto-refreshes** when jobs finish

### 🔄 Profile evolution
- **Profile refine chat** in Settings — describe what changed; AI proposes updates to your four preference fields with a preview before save
- **Scoring feedback** from Inbox detail — disagree with a score, send a comment; the same refine flow can use that resource as context
- **Profile embeddings (pgvector)** — preferences are embedded via OpenRouter on save; cosine similarity nudges relevance scoring
- After preference changes, up to **20 inbox items** are scheduled for **re-analysis** automatically

### 📥 Inbox & 🏛️ Vault
- **Inbox** — staging area with multi-axis tiers, verdict, and one-click promote to Vault
- **Vault** — curated archive with categories, notes, and detailed summaries
- **Add flow** — choose Inbox (review first) or Vault (library immediately); redirects to the right list after submit
- **Vault processing** — resources still being ingested / analysed appear in Vault with a processing indicator; list **auto-refreshes** like Inbox
- **Uncategorized filter** on Vault; **AI category suggestions** in resource detail (apply, create new, or ignore)
- **Always-editable category** picker in Vault detail
- **Smart Mix** — surfaces forgotten Vault items across categories

### 🌐 Multi-source ingestion
| Source | What gets fetched |
|--------|------------------|
| **YouTube** | Title, channel, duration, views, transcript excerpt |
| **Articles / Websites** | Title, description, author, `og:image`, favicon fallback |

> Reddit is planned; the factory currently creates **Video** and **Article** resources only.

### 🗂️ Categories & Tags
- User-defined categories for Vault organization
- AI suggests a category from your existing list (or proposes a new name)
- Auto-tagging with niche, profile-relevant vocabulary

### 👤 User Profile & Settings
- `ProfessionalContext` — who you are, what you do
- `LearningGoals` — what you want to learn
- `Hobbies` — genuinely used for scoring, not decoration
- `TopicsToAvoid` — hard filter when content matches
- **Theme switcher** (light / dark / system) and account settings on one page

### 🔐 Auth & admin
- **JWT** in `localStorage` and **httpOnly-style cookie** (`token`) for SSR-friendly auth
- Dashboard routes are **protected by default**; login supports **callback URL** to return where you left off
- On first startup, an **Admin** role and default admin user are seeded (see `Data/DbSeeder.cs` — change the password in production)

### ⚙️ Background Jobs
- Hangfire-powered async pipeline: ingestion → AI analysis
- Automatic retry; **`ErrorRecoveryJob`** rescues stuck resources on a schedule

---
## 🖼️ Screenshots & demos (coming soon)

This section will include short GIF demos and screenshots for:

- Login / Register
- Dashboard navigation
- Inbox (multi-axis tiers + feedback)
- Vault (processing indicator + category suggestion)
- Settings (profile refine + themes)

---
## 🧩 Extension

There is an official browser extension in development to enhance your workflow by saving resources with a single click.

> **IMPORTANT**  
> The extension is currently **under development (WIP)** and not yet fully functional. Progress:  
> 👉 [KnowledgeOS Extension Repository](https://github.com/neliodass/KnowledgeOS.BrowserExtension)

---
## 🏗️ Architecture

### Backend

```
KnowledgeOS.Backend/
├── Controllers/          # REST API (auth, resources, inbox, vault, preferences, categories)
├── Services/
│   ├── Ai/
│   │   ├── Scoring/      # Tier enums, sort priority, JSON parsing
│   │   └── Prompts/      # Inbox analysis, profile refine, category suggestion
│   ├── Content/          # YouTube, Website content fetchers
│   └── Abstractions/
├── Jobs/                 # UrlIngestionJob, AiAnalysisJob, ErrorRecoveryJob, embedding sync
├── Entities/
│   ├── Resources/        # Resource (TPT), VideoResource, ArticleResource, Inbox/Vault metadata
│   ├── Tagging/
│   └── Users/            # ApplicationUser, UserPreferences (+ pgvector embedding)
├── DTOs/
├── Data/                 # AppDbContext, global ownership filters, DbSeeder (roles/admin)
└── Migrations/
```

### Frontend

```
knowledgeos-frontend/
├── app/
│   ├── (auth)/login, register
│   └── dashboard/        # inbox, vault, add, settings
├── components/
│   ├── ui/               # shadcn-style primitives (Button, Card, Badge, …)
│   ├── InboxCard.tsx, InboxDetailModal.tsx, InboxAxisBars.tsx
│   ├── VaultCard.tsx, VaultDetailModal.tsx
│   └── *ProcessingIndicator.tsx
└── lib/
    ├── api.ts, types.ts, inboxTiers.ts, vaultProcessing.ts
    └── ThemeProvider.tsx, useVaultAutoRefresh.ts
```

### Key design decisions

- **Table Per Type (TPT)** — `VideoResource` and `ArticleResource` extend `Resource` with separate tables
- **1:1 metadata** — `InboxMetadata` (axes, verdict, summary) and `VaultMetadata` (category, notes) as linked tables
- **Global query filters** — queries scoped to `CurrentUser.UserId`; Admin role can bypass ownership via permission claims
- **AI provider abstraction** — multiple `IAiProvider` beans from `Ai:Model_*` config; `AiService` tries them in order
- **Deterministic ordering** — tier parsing + `InboxSortPriority` from substance, intent, relevance, and avoidance
- **Profile embeddings** — OpenRouter embeddings on `PUT /api/preferences`; cosine hint in scoring; batch re-score after profile update
- **Next.js App Router** — JWT in `localStorage` + cookie; typed API via `lib/types.ts`; `/api` proxied to backend in Docker

### API highlights (JWT required except auth)

| Area | Notable endpoints |
|------|-------------------|
| Resources | `POST /`, `PATCH {id}/status`, `POST {id}/promote`, `POST {id}/retry`, `POST {id}/scoring-feedback` |
| Preferences | `GET /`, `PUT /`, `POST /refine` |
| Inbox / Vault | `GET /`, `GET mix`, `GET {id}`; Vault `PATCH {id}/category` |

---

## 🚀 Getting Started

### 🐳 Docker Deployment

The stack (PostgreSQL, **ASP.NET Core** backend, Next.js frontend) runs via Docker Compose. This is the official way to run the app.

#### 1. Configure environment

```bash
cp .env.example .env
```

Fill in required variables. The frontend reaches the backend via Next.js rewrites on `/api`.

| Variable | Purpose |
|----------|---------|
| `INTERNAL_API_URL` | Server-side backend URL (`http://backend:8080` in Docker) |
| `JWT_KEY` | ≥ 32 characters |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `AI_MODEL_1` … `AI_MODEL_3` | Models tried in order for JSON tier responses |

#### Backend tests

From `KnowledgeOS.Backend/`:

```bash
dotnet test ../KnowledgeOS.Backend.Tests/KnowledgeOS.Backend.Tests.csproj
```

Covers tier parsing, inbox JSON mapping, sort priority, transcript excerpts, and related scoring helpers.

#### 2. Launch

```bash
docker compose up -d --build
```

#### 3. Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Swagger (dev) | http://localhost:5000/swagger |

---

## 🛣️ Roadmap

### 🔧 In progress

- [ ] **Browser extension** — save from any webpage in one click
- [ ] **iOS Shortcuts** — share sheet → KnowledgeOS

### 📋 Planned

#### Core
- [ ] **PWA** — installable app, offline shell
- [ ] **Full vector search** — semantic search across all vault content (profile embeddings exist today)
- [ ] **Reddit ingestion** — posts/comments with dedicated metadata

#### AI
- [ ] **Manual re-analysis** trigger per resource from UI (batch re-score after profile edit exists)
- [ ] **Duplicate detection** — semantic, not URL-only
- [ ] **Trend surfacing** — recurring themes across saves

#### Organization
- [ ] **Nested categories**
- [ ] **Collections / reading lists**
- [ ] **Resource relations**

#### Platform
- [ ] **Admin panel UI** — users, jobs, health (backend Admin role + claims exist)
- [ ] **Password reset / email verification**
- [ ] **Pocket / Readwise import**, **Obsidian export**, **RSS ingestion**

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn-style UI |
| **Backend** | ASP.NET Core 10, C# |
| **Database** | PostgreSQL, EF Core 10 (TPT), **pgvector** for profile embeddings |
| **Auth** | ASP.NET Core Identity, JWT, role claims |
| **AI** | OpenRouter (multi-model fallback, embeddings) |
| **Jobs** | Hangfire + PostgreSQL |
| **Fetching** | YoutubeExplode, HtmlAgilityPack |
| **API docs** | Swagger / OpenAPI |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with curiosity, need and too many saved tabs. Also with a dash of AI (especially frontend ^^)</sub>
</div>
