# KnowledgeOS — Agent Guide

Self-hosted knowledge vault: save URLs → background ingestion → AI scoring → Inbox review → Vault archive.

## Repository layout

| Path | Role |
|------|------|
| `KnowledgeOS.Backend/` | ASP.NET Core 10 API, EF Core, Hangfire jobs |
| `knowledgeos-frontend/` | Next.js 16 App Router, React 19, Tailwind 4 |
| `docker-compose.yaml` | Official run path: `db`, `backend`, `frontend` |
| `.env` | Secrets & ports (copy from `.env.example`) |

## Run & URLs

```bash
docker compose up -d --build   # from repo root
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 (container listens on 8080) |
| Swagger | http://localhost:5000/swagger (dev) |

Required env: `JWT_KEY` (≥32 chars), `OPENROUTER_API_KEY`, `INTERNAL_API_URL=http://backend:8080` in Docker.

## Core user flow

1. User POSTs URL via `POST /api/resources` (`addToVault`, optional `categoryId`).
2. Hangfire enqueues `UrlIngestionJob` → fetches metadata (YouTube / website OpenGraph).
3. `AiAnalysisJob` scores 0–100 using OpenRouter (multi-model fallback via `IAiProvider`).
4. Resource lands in **Inbox** (`ResourceStatus.Inbox`) or **Vault** if `IsVaultTarget`.
5. User promotes/archives via `PATCH /api/resources/{id}/status`.

## Resource lifecycle (`ResourceStatus`)

```
New → Processing → AiAnalysing → Inbox | Vault
                              ↘ Archived | Trash | Error
```

Enum (`Entities/Resources/ResourceStatus.cs`): `New=0`, `Processing=1`, `AiAnalysing=2`, `Inbox=3`, `Vault=4`, `Archived=5`, `Trash=6`, `Error=7`.

## Data model (backend)

- **TPT inheritance**: `Resource` base → `VideoResource`, `ArticleResource` (separate tables).
- **1:1 metadata**: `InboxMetadata` (score, verdict, summary), `VaultMetadata` (category, notes, `PromotedToVaultAt`).
- **Global filters**: queries scoped to `ICurrentUserService.UserId` in `AppDbContext`.
- **Tags & categories**: per-user unique `(Name, UserId)`.

Key files:
- `Data/AppDbContext.cs` — mappings, filters
- `Services/ResourceService.cs` — CRUD, inbox/vault queries, status transitions
- `Services/ResourceFactory.cs` — URL → concrete resource type
- `Jobs/UrlIngestionJob.cs`, `Jobs/AiAnalysisJob.cs`, `Jobs/ErrorRecoveryJob.cs` (hourly cron)

## API surface (all under `/api`, JWT required except auth)

| Controller | Endpoints |
|------------|-----------|
| `AuthController` | `POST register`, `POST login`, `GET me`, `PUT me/password`, `PUT me/display-name` |
| `ResourcesController` | `POST /`, `DELETE {id}`, `PATCH {id}/status`, `POST {id}/retry` |
| `InboxController` | `GET /`, `GET mix`, `GET {id}` |
| `VaultController` | `GET /` (paged), `GET mix`, `GET {id}`, `PATCH {id}/category` |
| `CategoriesController` | `GET /`, `POST /`, `DELETE {id}` |
| `PreferencesController` | `GET /`, `PUT /` — `ProfessionalContext`, `LearningGoals`, `Hobbies`, `TopicsToAvoid` |

Registration of services: `Extensions/ApplicationServicesExtensions.cs`.  
Startup: `Program.cs` (migrations, seed admin, Hangfire dashboard).

## Frontend conventions

- **Routes**: `/login`, `/register`, `/dashboard` (+ `inbox`, `vault`, `add`, `settings`).
- **API client**: `lib/api.ts` — all HTTP via `fetchWithAuth`, base `NEXT_PUBLIC_API_URL` (`/api`).
- **Types**: `lib/types.ts` — mirror backend DTOs (`InboxResource`, `VaultResource`, etc.).
- **Proxy**: `next.config.ts` rewrites `/api/*` → `INTERNAL_API_URL/api/*`.
- **Auth token**: `localStorage` key `token` + optional cookie `token`.

UI components: `components/InboxCard.tsx`, `InboxDetailModal.tsx`, `VaultCard.tsx`, `VaultDetailModal.tsx`.

## Where to change what

| Task | Start here |
|------|------------|
| New API endpoint | `Controllers/`, register logic in `Services/` |
| AI prompts / scoring | `Services/Ai/` |
| Content fetchers | `Services/Content/` (`YouTubeContentFetcher`, `WebsiteContentFetcher`) |
| DB schema | Entity + `Migrations/` (`dotnet ef migrations add`) |
| New dashboard page | `knowledgeos-frontend/app/dashboard/` |
| API call from UI | `lib/api.ts` + `lib/types.ts` |

## Do not

- Commit `.env` or secrets.
- Assume Reddit ingestion is live (README: planned; only Video + Article in factory).
- Edit generated migrations by hand unless you know the diff.

## Cursor rules

Focused context lives in `.cursor/rules/*.mdc` (overview always on; backend/frontend when matching files are open).
