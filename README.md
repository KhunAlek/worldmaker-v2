# worldmaker-v2

Nick // Worldmaker v2 — built to `Worldmaker_v2_Design_Decisions.md`. Single
Cloudflare Worker, single D1 database, no accounts, no build step for the frontend.

**Note on this file (July 27, 2026 reconciliation):** this repo had drifted
significantly from what was actually live — old modular source with no automated
QA gate, no `await` fix on the route handlers, and static Mission 4 seed data still
containing the original buggy `Highlight.Adornee = nil` code with no `Enabled`
switch. A from-scratch database reseed from this repo, as it stood, would have
silently reintroduced a bug already fixed in production. This push replaces that
stale tree with the source actually running in production as of this commit,
verified via `wrangler deploy --dry-run` and a live post-deploy smoke test
(`/health` plus an authenticated `/api/chat` round trip). See the
`worldmaker-deploy-check` skill for the checklist this push followed.

## Stack

- **Worker**: `src/index.js` — a single file containing routing, auth, the
  Anthropic API client, all system prompts (planning, QA, grading, help, chat),
  page rendering, and D1 access. This project was originally split into
  `src/lib/*.js` / `src/data/*.js` modules (see git history before this commit),
  but production has been running as one flattened file since the July 24, 2026
  emergency fixes, and this repo now matches that reality rather than describing
  an architecture that no longer exists live. If re-splitting into modules again,
  do it as its own deliberate change, verified against a live deploy — not as a
  side effect of an unrelated fix.
- **D1** (`worldmaker-v2-db`): 5 tables — `missions`, `submissions`, `skills`,
  `events`, `world_state`. Schema in `schema/schema.sql`. Self-seeds from the
  `STATIC_MISSIONS` object in `src/index.js` on first request to a fresh database.
- **Auth**: one shared password (`SITE_PASSWORD` secret), a signed session cookie.
  No session table, no per-user rows anywhere.
- **AI**: real calls to `api.anthropic.com`. Grading, planning, the mandatory QA
  pass, and open chat use `MODEL_STRONG`; the quick Help button uses `MODEL_FAST`
  (see `wrangler.toml` `[vars]`).
- **Governing docs** (`src/evidence_standard.md`, `src/canonical_facts.md`,
  `src/design_decisions.md`) are imported as raw text (via the `wrangler.toml`
  `Text` module rule) so the planner and grader always see the real current
  documents, never a paraphrase that could quietly drift out of sync with them.
- **QA gate**: `src/lesson_qa_skill.md` and `src/known_engine_behaviors.md` are
  bundled the same way and embedded into a mandatory second Claude call
  (`qaSystemPrompt`, run inside `planNextMission`) before any dynamically-planned
  mission is saved. This call cannot be skipped by a future session forgetting to
  run a manual check — it's structural, inside the Worker itself. As of this
  reconciliation, the QA pass also confirms every entry in a mission's `tests[]`
  array is explicitly provable from a named `submission.fields[]` entry, closing
  the gap that let V1-M05 demand evidence Nick had no field to submit.
- **Assets**: `src/styles.css`, `src/landing.css`, `src/lesson_components.css`
  are served verbatim from `/assets/*` and also styled the CSS blocks written
  directly into the HTML the Worker renders.

## Known limitation carried forward

This repo is a backup and disaster-recovery source, not a CI/CD deployment
pipeline — per the project's design decisions, there is deliberately no build
step, no automated push-triggers-deploy workflow, and no audit-log
infrastructure beyond the `events` table already in D1. Keeping this repo in
sync with production is a manual step, done via the `worldmaker-deploy-check`
skill, not an automatic guarantee. Treat any long gap since the last commit as
a signal to re-verify this repo against what's actually live before trusting it
for a from-scratch reseed.
