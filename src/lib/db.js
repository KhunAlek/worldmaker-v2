import { CAPABILITIES } from "../data/capabilities.js";
import { STATIC_MISSIONS, STATIC_MISSION_ORDER } from "../data/missions.js";

// D1's `missions` table is the one source of truth for mission status. M1-M4's
// *content* started life as static JS (src/data/missions.js) but is seeded into
// this table once (see schema/seed.sql) so every mission — static or planner-
// written — is read the same way. Nothing here special-cases "the first four."

const DEFAULT_WORLD_STATE = `Missions completed and approved: none yet beyond what's built into the seeded
lesson set (Studio Ready, Build the Island, Add Two Settlers are the first three
approved missions; Select a Settler is ready to serve).
Current state of Nick's actual Roblox place: Workspace > World contains Ground
(MainGround, Obstacle), PlayerSpawn, BuildSite, NPCs (NPC_1, NPC_2 - full rigs with
Humanoid/HumanoidRootPart/PrimaryPart set), NPCHomes (NPC_1_Home, NPC_2_Home),
Resources (empty), Buildings (empty). ServerScriptService > WorldServer prints
readiness only.
Concepts already taught and understood: Explorer, Properties, Output, Script,
character rig, Model, Humanoid, HumanoidRootPart, PrimaryPart, parent (concept),
Transparency.
Concepts used but never properly explained yet - explain in full next time they come
up: Part, SpawnLocation, Anchored, CanCollide.
Not yet introduced at all: references/variables in code, functions, events,
ClickDetector, Highlight, RemoteEvents, server/client split, pathfinding, resource
totals, construction, reset.`;

// One-time bootstrap: if `missions` is empty (fresh database), seed it from the
// version-controlled static missions. Cheap to check on every request; only ever
// writes once. This is what makes the database reproducible from git alone —
// point a brand new D1 database at this Worker and it fills itself in.
export async function ensureSeeded(env) {
  const row = await env.DB.prepare("SELECT COUNT(*) AS c FROM missions").first();
  if (row && row.c > 0) return;
  const seedMeta = {
    "V1-M01": { status: "approved", approved_at: "2026-07-05T00:00:00.000Z", capability_key: null },
    "V1-M02": { status: "approved", approved_at: "2026-07-10T00:00:00.000Z", capability_key: null },
    "V1-M03": { status: "approved", approved_at: "2026-07-13T00:00:00.000Z", capability_key: "two_settlers" },
    "V1-M04": { status: "active", approved_at: null, capability_key: "select_settler" }
  };
  const statements = STATIC_MISSION_ORDER.map((id) => {
    const mission = STATIC_MISSIONS[id];
    const meta = seedMeta[id];
    return env.DB.prepare(
      "INSERT INTO missions(id, number, title, status, capability_key, content_json, approved_at) VALUES (?,?,?,?,?,?,?)"
    ).bind(id, mission.number, mission.title, meta.status, meta.capability_key, JSON.stringify(mission), meta.approved_at);
  });
  await env.DB.batch(statements);
  await logEvent(env, "system", "Seeded missions table from static source (first run on fresh database).");
}

export async function getWorldState(env) {
  const row = await env.DB.prepare("SELECT narrative FROM world_state WHERE id = 1").first();
  return row ? row.narrative : DEFAULT_WORLD_STATE;
}

export async function setWorldState(env, narrative) {
  await env.DB.prepare(
    "INSERT INTO world_state(id, narrative, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP) " +
    "ON CONFLICT(id) DO UPDATE SET narrative = excluded.narrative, updated_at = excluded.updated_at"
  ).bind(narrative).run();
}

export async function logEvent(env, kind, message) {
  await env.DB.prepare("INSERT INTO events(kind, message) VALUES (?, ?)").bind(kind, message).run();
}

export async function getAllMissions(env) {
  const rows = await env.DB.prepare("SELECT * FROM missions ORDER BY number ASC").all();
  return rows.results.map((r) => ({ ...JSON.parse(r.content_json), status: r.status, approved_at: r.approved_at, capability_key: r.capability_key }));
}

export async function getMission(env, id) {
  const row = await env.DB.prepare("SELECT * FROM missions WHERE id = ?").bind(id).first();
  if (!row) return null;
  return { ...JSON.parse(row.content_json), status: row.status, approved_at: row.approved_at, capability_key: row.capability_key };
}

export async function getCurrentMission(env) {
  const row = await env.DB.prepare("SELECT * FROM missions WHERE status = 'active' ORDER BY number DESC LIMIT 1").first();
  if (!row) return null;
  return { ...JSON.parse(row.content_json), status: row.status, approved_at: row.approved_at, capability_key: row.capability_key };
}

export async function saveDynamicMission(env, missionObj) {
  await env.DB.prepare(
    "INSERT INTO missions(id, number, title, status, capability_key, content_json) VALUES (?, ?, ?, 'active', ?, ?)"
  ).bind(missionObj.id, missionObj.number, missionObj.title, missionObj.capability_key || null, JSON.stringify(missionObj)).run();
}

export async function approveMission(env, id) {
  await env.DB.prepare("UPDATE missions SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();
}

export async function nextSubmissionAttempt(env, missionId) {
  const row = await env.DB.prepare("SELECT COUNT(*) AS c FROM submissions WHERE mission_id = ?").bind(missionId).first();
  return (row?.c || 0) + 1;
}

export async function saveSubmission(env, { id, missionId, attempt, fields, understanding, verdict, feedback }) {
  await env.DB.prepare(
    "INSERT INTO submissions(id, mission_id, attempt_number, fields_json, understanding_answer, verdict, feedback_json) VALUES (?,?,?,?,?,?,?)"
  ).bind(id, missionId, attempt, JSON.stringify(fields), understanding || null, verdict, JSON.stringify(feedback)).run();
}

export async function recordSkills(env, concepts, missionId) {
  for (const c of concepts) {
    await env.DB.prepare(
      "INSERT INTO skills(concept_name, explained_fully, taught_in_mission, note) VALUES (?,1,?,?) " +
      "ON CONFLICT(concept_name) DO UPDATE SET explained_fully = 1, taught_in_mission = excluded.taught_in_mission"
    ).bind(c.name, missionId, c.text).run();
  }
}

export async function getSkills(env) {
  const rows = await env.DB.prepare("SELECT * FROM skills").all();
  return rows.results;
}

export async function capabilitiesWithStatus(env) {
  const missions = await getAllMissions(env);
  const byKey = {};
  for (const m of missions) if (m.capability_key) byKey[m.capability_key] = m;

  let seenCurrent = false;
  return CAPABILITIES.map((cap) => {
    const m = byKey[cap.key];
    let status = "future";
    if (m && m.status === "approved") status = "done";
    else if (m && m.status === "active") { status = "current"; seenCurrent = true; }
    else if (!seenCurrent && !m) { status = "current"; seenCurrent = true; }
    return { ...cap, status, missionId: m ? m.id : null, missionTitle: m ? m.title : null };
  });
}
