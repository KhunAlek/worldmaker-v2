-- worldmaker-v2-db schema
-- This mirrors the tables already created live via Cloudflare MCP tools during the
-- build. It exists so the schema lives in git, not only in Cloudflare's dashboard.
-- Safe to re-run: every statement is IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,                 -- e.g. 'V1-M01'
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('approved','active','planned')),
  capability_key TEXT,                 -- which of the 10 §5 capabilities this teaches, null if setup-only
  content_json TEXT NOT NULL,          -- the full lesson object, saved verbatim (design doc §8)
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id),
  attempt_number INTEGER NOT NULL,
  fields_json TEXT NOT NULL,
  understanding_answer TEXT,
  verdict TEXT CHECK(verdict IN ('approved','needs_work')),
  feedback_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
  concept_name TEXT PRIMARY KEY,
  explained_fully INTEGER NOT NULL DEFAULT 0,
  taught_in_mission TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kind TEXT NOT NULL,                  -- 'submission' | 'approval' | 'help' | 'chat' | 'plan'
  message TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS world_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  narrative TEXT NOT NULL,             -- plain-English equivalent of Nick_Current_Progress.md
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Added for automatic inline name highlighting in lesson text (see
-- Inline_Name_Highlighting_Spec.md). Grows on its own inside planNextMission() --
-- no human ever edits this table directly.
CREATE TABLE IF NOT EXISTS canonical_names (
  name TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('object','value')),
  added_by_mission TEXT,               -- 'seed' for the initial bootstrap, else the mission id that introduced it
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
