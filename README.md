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
URL saved by user
      │
      ▼
[Ingestion Job] ──► Fetch metadata (title, image, description)
      │               YouTube API / Reddit JSON / OpenGraph
      ▼
[AI Analysis Job] ──► Score 0–100, verdict, summary, tags
      │                Based on your personal profile
      ▼
[Inbox] ──► Review ──► [Vault] (permanent archive)
                  └──► [Trash]
```

---

## ✨ Features

### 🤖 AI-Powered Inbox
- Every saved resource is scored **0–100** based on your personal profile
- AI generates a **verdict**, **summary**, and **tags**
- Scoring uses a two-axis system: **Intrinsic Quality** × **Relevance to your profile**
- Protects against keyword hallucination — "AI" in title ≠ match if content is a gimmick

### 📥 Inbox & 🏛️ Vault
- **Inbox** — staging area for new resources, shows AI score and verdict
- **Vault** — permanent curated archive with categories, notes, and detailed AI summaries
- One-click promotion from Inbox → Vault with automatic re-analysis
- Smart Mix — surfaces forgotten Vault items across different categories

### 🌐 Multi-source ingestion
| Source | What gets fetched |
|--------|------------------|
| **YouTube** | Title, channel, duration, views, transcript excerpt |
| **Articles / Websites** | Title, description, author, `og:image`, favicon fallback |

### 🗂️ Categories & Tags
- User-defined categories for Vault organization
- AI suggests category based on existing ones (or proposes new)
- Auto-tagging with niche, profile-relevant vocabulary

### 👤 User Profile
- `ProfessionalContext` — who you are, what you do
- `LearningGoals` — what you want to learn
- `Hobbies` — your interests (genuinely used for scoring, not decoration)
- `TopicsToAvoid` — hard filter, caps score at 0–10

### ⚙️ Background Jobs
- Hangfire-powered async processing pipeline
- Automatic retry with error recovery job
- `ErrorRecoveryJob` — periodically rescues stuck resources

---
## 🖼️ See in action
### Login and Register
![Register and Login](./promo/register_n_login.gif)

### Dashboard & Navigation
![Dashboard](./promo/dashboard.png)
![Modal](./promo/modal.png)

### Features
* **Adding to Vault:**
  ![Adding to Vault](./promo/adding_to_vault.gif)
* **Inbox Management:**
  ![Good Example Inbox](./promo/good_example_inbox.gif)
  *Avoid mistakes like this:*
  ![Bad Example Inbox](./promo/bad_example_onbox.gif)

### Settings & Customization
* **Themes:**
  ![Themes](./promo/themes.gif)
* **Preferences:**
  ![Setting Preferences](./promo/setting_preferences.gif)

### Static Views
![Add](./promo/add.png)
![Add Category](./promo/add_category.png)
![Inbox Static](./promo/inbox.png)
![Vault Static](./promo/vault.png)
![Settings Static](./promo/settings.png)
---
## 🧩 Extension

There is an official browser extension in development to enhance your workflow by saving resources with a single click.

> IMPORTANT
> The extension is currently **under development (WIP)** and not yet fully functional, but you can check the progress here: <br>
> 👉 [KnowledgeOS Extension Repository](https://github.com/neliodass/KnowledgeOS.BrowserExtension)

---
## 🏗️ Architecture

### Backend

```
KnowledgeOS.Backend/
├── Controllers/          # REST API endpoints
├── Services/
│   ├── Ai/               # OpenRouter provider, AI service, prompt builder
│   ├── Content/          # YouTube, Reddit, Website content fetchers
│   ├── Processors/       # Resource processors
│   └── Abstractions/     # Interfaces
├── Jobs/                 # Hangfire background jobs (Ingestion, AI Analysis, Error Recovery)
├── Entities/
│   ├── Resources/        # Resource (base), VideoResource, ArticleResource, RedditResource
│   │   ├── InboxMetadata # AI score, verdict, inbox summary
│   │   └── VaultMetadata # Detailed summary, category, user notes
│   ├── Tagging/          # Tag, Category
│   └── Users/            # ApplicationUser, UserPreference
├── DTOs/                 # Data Transfer Objects
├── Data/                 # AppDbContext, EF Core (TPT strategy)
└── Migrations/           # EF Core migrations
```

### Frontend

```
knowledgeos-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/        # Login page
│   │   └── register/     # Registration page
│   └── dashboard/
│       ├── inbox/        # Inbox view — scored resources awaiting review
│       ├── vault/        # Vault view — curated archive with filters
│       ├── add/          # Add new resource by URL
│       ├── settings/     # User preferences & account settings
│       └── layout.tsx    # Dashboard shell with navigation
├── components/
│   ├── InboxCard.tsx     # Resource card for inbox (score, verdict, tags)
│   ├── InboxDetailModal.tsx  # Full resource detail view for inbox
│   ├── VaultCard.tsx     # Resource card for vault (category, notes)
│   └── VaultDetailModal.tsx  # Full resource detail view for vault
└── lib/
    ├── api.ts            # All API calls (typed fetch wrappers)
    ├── types.ts          # Shared TypeScript types
    ├── categoryColor.ts  # Category color mapping utility
    └── ThemeProvider.tsx # Dark/light theme context
```

### Key design decisions

- **Table Per Type (TPT)** — `VideoResource`, `ArticleResource`, `RedditResource` each have their own table, sharing the base `Resources` table
- **1:1 Metadata composition** — `InboxMetadata` and `VaultMetadata` are separate tables linked by FK, not flat columns on `Resource`
- **Global query filters** — all queries are automatically scoped to `CurrentUser.UserId`
- **AI provider abstraction** — multiple models registered as `IAiProvider`, `AiService` tries them in order with fallback
- **Next.js App Router** — full server/client component split, JWT stored in `localStorage`, all API calls typed via shared `lib/types.ts`

---

## 🚀 Getting Started

### 🐳 Docker Deployment

The entire stack (PostgreSQL, Go backend, and Next.js frontend) is managed via Docker Compose. This is the official way to run the application.

#### 1. Configure Environment
Create your .env file from the template:

```
cp .env.example .env
```

Open .env and fill in the required variables. The frontend uses Next.js rewrites to communicate with the backend internally via the /api route.

**Key Network Configuration:**
* **INTERNAL_API_URL**: The address Next.js uses server-side to reach the backend (uses the Docker service name).
* **JWT_KEY**: Must be at least 32 characters long.

``` 
# Network (Internal Docker communication)
INTERNAL_API_URL=http://backend:8080

# Ports (External access)
FRONTEND_PORT=3000
BACKEND_PORT=5000

# Secrets
JWT_KEY=your_min_32_char_secret_here
OPENROUTER_API_KEY=sk-or-...
```

#### 2. Launch the Stack
Run the following command to build and start all services:

```
docker compose up -d --build
```

#### 3. Access the Services

| Service | Address | Description |
| :--- | :--- | :--- |
| **Frontend** | http://localhost:3000 | Main Web Application |
| **Backend API** | http://localhost:5000 | REST API Root |

---

## 🛣️ Roadmap

### 🔧 In Progress

- [ ] **Browser extension** — save to KnowledgeOS directly from any webpage with one click
- [ ] **Extension for Shortcut app for iOS** — add to KnowledgeOS from iPhone share sheet
### 📋 Planned

#### Core Features

- [ ] **PWA (Progressive Web App)** — installable mobile/desktop app with offline support and home screen shortcut
- [ ] **Vector search** — semantic similarity search across saved resources using embeddings
- [ ] **Reddit as a source** — support saving Reddit posts and comments with appropriate metadata and AI analysis

#### AI & Intelligence
- [ ] **AI re-analysis** — manually trigger re-analysis after updating your profile
- [ ] **Duplicate detection** — warn when saving content already in vault (semantic, not just URL match)
- [ ] **Trend surfacing** — detect recurring themes across saved resources

#### Organization
- [ ] **Nested categories** — subcategories for deeper organization
- [ ] **Collections / reading lists** — group resources manually across categories
- [ ] **Resource relations** — link related resources together

#### UX & Settings
- [ ] **Settings page** — manage account, preferences, AI model choice, and danger zone
- [ ] **Admin panel** — user management, job queue monitoring, system health
- [ ] **Password reset via email** — forgot password flow with email token
- [ ] **Email verification** — verify email on registration

#### Integrations
- [ ] **Pocket / Readwise import** — migrate existing bookmarks
- [ ] **Obsidian export** — export vault as Obsidian-compatible Markdown vault
- [ ] **RSS / Atom feed ingestion** — auto-import from feeds

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | ASP.NET Core 10, C# |
| **Database** | PostgreSQL + EF Core 10 (TPT) |
| **Auth** | ASP.NET Core Identity + JWT |
| **AI** | OpenRouter API (multi-model with fallback) |
| **Background Jobs** | Hangfire + PostgreSQL storage |
| **Content Fetching** | YoutubeExplode, HtmlAgilityPack, Reddit JSON API |
| **API Docs** | Swagger / OpenAPI |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with curiosity, need and too many saved tabs. Also with a dash of AI (especially frontend ^^)</sub>
</div>
