# worldmaker-v2

Nick // Worldmaker v2 — built to `Worldmaker_v2_Design_Decisions.md`. Single
Cloudflare Worker, single D1 database, no accounts, no build step for the frontend.

## Stack

- **Worker**: `src/index.js` — plain routing, no framework.
- **D1** (`worldmaker-v2-db`): 5 tables — `missions`, `submissions`, `skills`,
  `events`, `world_state`. Schema in `schema/schema.sql`. Self-seeds from
  `src/data/missions.js` on first request to a fresh database.
- **Auth**: one shared password (`SITE_PASSWORD` secret), signed cookie
  (`src/lib/auth.js`), no session table, no per-user rows anywhere.
- **AI**: real calls to `api.anthropic.com` (`src/lib/anthropic.js`). Grading and
  planning use `MODEL_STRONG`; the Help button uses `MODEL_FAST` (see `wrangler.toml`
  `[vars]`).
- **Prompts** (`src/lib/prompts.js`) import `Beginner_Lesson_and_Evidence_Standard.md`,
  `Worldmaker_Canonical_Facts.md`, and `Worldmaker_v2_Design_Decisions.md` verbatim as
  text (via a wrangler `Text` module rule) — the planner and grader always see the
  real current governing docs, never a paraphrase of them.

## Pages

| Route | Auth | What it is |
|---|---|---|
| `/` | public | Landing page (`landing.css`) |
| `/login` | public | Password entry |
| `/hq` | required | Capability roadmap (design doc §5) |
| `/lesson/:id` | required | One mission — content, steps, tests, submit form, chat |
| `/parent` | required | Pull-based daily-ish report, generated on view |
| `/api/submit` | required | Grades a submission, approves/rejects, plans next mission on approval |
| `/api/help` | required | Per-step hint, fast model |
| `/api/chat` | required | Open chat, strong model |

## Known simplification

The original front page's CSS (`landing.css`) was in the project knowledge base, but
its HTML/JS (the animated island demo, stage-track click handlers) was not — only the
stylesheet. `src/lib/render.js`'s `landingPage()` uses the same classes and palette so
it matches visually, but the interactive demo widget itself is a simplified,
non-animated version, not a recreation of markup I never had. Flag if you want the
richer interactive version rebuilt.

## Local dev

```
cp .dev.vars.example .dev.vars   # fill in real values
npm install
npx wrangler dev
```

## Deploy

See `README_DEPLOY.md`.
