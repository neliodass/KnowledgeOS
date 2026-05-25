# Profile evolution — plan działań

Każdy wiersz = **osobny branch** + **jeden commit** (merge do `dev` po review / testach lokalnych).

Workflow:

```bash
git checkout dev && git pull
git checkout -b feat/...
# implementacja
dotnet test KnowledgeOS.Backend/../KnowledgeOS.Backend.Tests  # gdy dotyczy backendu
git commit -m "..."
git push -u origin HEAD
# merge do dev (PR lub lokalnie)
```

---

## Faza 0 — Done (na `dev`)

| Branch | Opis |
|--------|------|
| `feat/backend/newScoring` | Tier’y AI + `ScoreCalculator` + testy jednostkowe |

---

## Faza A — Profil przez rozmowę (bez embeddingów)

| # | Branch | Commit message (szkic) | Zakres |
|---|--------|------------------------|--------|
| A1 | `feat/backend/profile-chat-dtos` | Add profile refine chat DTOs | Kontrakt API request/response |
| A2 | `feat/backend/profile-chat-service` | Add profile refine AI service | Prompt + strict JSON → proponowane 4 pola |
| A3 | `feat/backend/profile-chat-api` | Add POST preferences/refine endpoint | `IProfileChatService`, kontroler, rejestracja DI |
| A4 | `feat/frontend/profile-refine-ui` | Add profile refine chat in settings | Zakładka „Coś się zmieniło”, podgląd + zapis `PUT` |

**Flow UX:** użytkownik pisze → `POST /api/preferences/refine` → podgląd zmian → „Zastosuj” → istniejące `PUT /api/preferences`.

---

## Faza B — Feedback z Inbox

| # | Branch | Commit message (szkic) | Zakres |
|---|--------|------------------------|--------|
| B1 | `feat/backend/scoring-feedback-entity` | Add ScoringFeedback entity and migration | `UserId`, `ResourceId`, `Comment`, `CreatedAt` |
| B2 | `feat/backend/scoring-feedback-api` | Add scoring feedback API | `POST /api/resources/{id}/scoring-feedback` |
| B3 | `feat/backend/feedback-to-profile-refine` | Wire feedback into profile refine | Opcjonalny kontekst resource + score w `refine` |
| B4 | `feat/frontend/inbox-scoring-feedback` | Add inbox score feedback UI | Przycisk w `InboxDetailModal` → refine z kontekstem |

---

## Faza C — Embeddingi (później, po A+B)

| # | Branch | Commit message (szkic) | Zakres |
|---|--------|------------------------|--------|
| C1 | `feat/backend/pgvector-user-preference` | Enable pgvector and profile embedding column | Migracja, `ProfileEmbedding` |
| C2 | `feat/backend/sync-profile-embedding` | Embed profile on preference save | Job / hook po `UpdatePreferences` |
| C3 | `feat/backend/relevance-embedding-hint` | Use embedding similarity for relevance tier hint | Hybryda z LLM tier + progi w C# |
| C4 | `feat/backend/reanalyze-after-profile-change` | Optional re-queue inbox items after profile update | Hangfire, limit batch |

---

## Zasady

- Nie łączyć faz w jednym branchu.
- Po każdym merge: `dotnet test` na backendzie.
- OpenRouter: ten sam klucz / fallback `Model_*`; profil-chat może używać `Model_1` (stabilny JSON).
- Embeddingi (C) dopiero gdy A+B działają w UI.

## Aktualny status

| # | Status |
|---|--------|
| A1 | done |
| A2 | done |
| A3 | done |
| A4 | done |
| B1 | done |
| B2 | in progress |
| B3–C4 | pending |
