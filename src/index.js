import STYLES_CSS from "./assets/styles.css";
import LANDING_CSS from "./assets/landing.css";
import LESSON_CSS from "./assets/lesson-components.css";
import { isAuthenticated, makeSessionCookie, clearSessionCookie, checkPassword } from "./lib/auth.js";
import { callClaude, extractJson } from "./lib/anthropic.js";
import { planningSystemPrompt, gradingSystemPrompt, helpSystemPrompt, chatSystemPrompt } from "./lib/prompts.js";
import { shell, loginPage, landingPage, hqPage, lessonPage, parentReportPage } from "./lib/render.js";
import {
  ensureSeeded, getWorldState, setWorldState, logEvent, getAllMissions, getMission,
  getCurrentMission, saveDynamicMission, approveMission, nextSubmissionAttempt,
  saveSubmission, recordSkills, capabilitiesWithStatus
} from "./lib/db.js";
import { CAPABILITIES } from "./data/capabilities.js";

const ASSET_FILES = { "styles.css": STYLES_CSS, "landing.css": LANDING_CSS, "lesson-components.css": LESSON_CSS };
const PUBLIC_PATHS = new Set(["/", "/login", "/logout"]);

function html(body, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}
function redirect(location, extraHeaders = {}) {
  return new Response(null, { status: 302, headers: { location, ...extraHeaders } });
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Static CSS — served straight from bundled text, no separate asset host.
      if (path.startsWith("/assets/")) {
        const file = path.slice("/assets/".length);
        if (ASSET_FILES[file]) {
          return new Response(ASSET_FILES[file], { headers: { "content-type": "text/css; charset=utf-8", "cache-control": "public, max-age=3600" } });
        }
        return new Response("Not found", { status: 404 });
      }

      if (path === "/health") return json({ ok: true, service: "worldmaker-v2" });

      if (path === "/" && request.method === "GET") return html(landingPage());

      if (path === "/login" && request.method === "GET") return html(loginPage({}));

      if (path === "/login" && request.method === "POST") {
        const form = await request.formData();
        const password = form.get("password");
        if (!env.SITE_PASSWORD) return html(loginPage({ error: "Server isn't configured with a site password yet — set the SITE_PASSWORD secret." }), 500);
        if (!checkPassword(password, env)) return html(loginPage({ error: "That password isn't right. Try again." }), 401);
        const cookie = await makeSessionCookie(env);
        return redirect("/hq", { "set-cookie": cookie });
      }

      if (path === "/logout") {
        return redirect("/", { "set-cookie": clearSessionCookie() });
      }

      // Everything below requires the shared password.
      if (!PUBLIC_PATHS.has(path) && !path.startsWith("/assets/")) {
        const authed = await isAuthenticated(request, env);
        if (!authed) return redirect("/login");
      }

      await ensureSeeded(env);

      if (path === "/hq" && request.method === "GET") {
        const capabilities = await capabilitiesWithStatus(env);
        const current = await getCurrentMission(env);
        const all = await getAllMissions(env);
        const approvedCount = all.filter((m) => m.status === "approved").length;
        return html(hqPage({ capabilities, currentMission: current, approvedCount }));
      }

      const lessonMatch = path.match(/^\/lesson\/([A-Za-z0-9-]+)$/);
      if (lessonMatch && request.method === "GET") {
        const mission = await getMission(env, lessonMatch[1]);
        if (!mission) return html(shell({ title: "Not found", active: "/hq", body: `<div class="empty">No such mission. <a href="/hq">Back to Build HQ</a>.</div>` }), 404);
        return html(lessonPage({ mission, missionAvailable: true, submitResult: null, notice: null }));
      }

      if (path === "/api/submit" && request.method === "POST") {
        return handleSubmit(request, env);
      }

      if (path === "/api/help" && request.method === "POST") {
        return handleHelp(request, env);
      }

      if (path === "/api/chat" && request.method === "POST") {
        return handleChat(request, env);
      }

      if (path === "/parent" && request.method === "GET") {
        const eventsRows = await env.DB.prepare("SELECT ts, kind, message FROM events WHERE kind != 'system' ORDER BY id DESC LIMIT 40").all();
        const missions = await getAllMissions(env);
        return html(parentReportPage({ events: eventsRows.results, missionSummaries: missions.map((m) => ({ id: m.id, title: m.title, status: m.status, approved_at: m.approved_at })) }));
      }

      return html(shell({ title: "Not found", active: "", body: `<div class="empty">Page not found. <a href="/hq">Back to Build HQ</a>.</div>` }), 404);
    } catch (err) {
      console.error(err);
      return json({ error: "Server error", detail: String(err && err.message || err) }, 500);
    }
  }
};

async function fileToImageBlock(file) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) return null;
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  const mediaType = file.type && file.type.startsWith("image/") ? file.type : "image/png";
  return { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };
}

async function handleSubmit(request, env) {
  const missionId = request.headers.get("x-mission-id");
  const mission = missionId && await getMission(env, missionId);
  if (!mission) return json({ error: "Unknown mission." }, 404);
  if (mission.status === "approved") return json({ error: "This mission is already approved." }, 409);

  const form = await request.formData();
  const fields = {};
  for (const f of (mission.submission?.fields || [])) fields[f.key] = String(form.get(f.key) || "").trim();
  const understanding = mission.submission?.understanding ? String(form.get("understanding") || "").trim() : null;

  const missingRequired = (mission.submission?.fields || []).filter((f) => !fields[f.key]).map((f) => f.label);
  if (missingRequired.length) {
    return json({ error: `Fill in before submitting: ${missingRequired.join(", ")}` }, 400);
  }

  const imageFile = form.get("image");
  const imageBlock = imageFile && typeof imageFile === "object" ? await fileToImageBlock(imageFile) : null;

  const userContent = [{ type: "text", text: `Submitted fields:\n${JSON.stringify(fields, null, 2)}\n\nUnderstanding answer: ${understanding || "(none required)"}` }];
  if (imageBlock) userContent.push(imageBlock);

  const raw = await callClaude(env, {
    model: env.MODEL_STRONG,
    system: gradingSystemPrompt(mission),
    messages: [{ role: "user", content: userContent }],
    maxTokens: 2000
  });
  const review = extractJson(raw);

  const attempt = await nextSubmissionAttempt(env, mission.id);
  await saveSubmission(env, {
    id: crypto.randomUUID(), missionId: mission.id, attempt, fields, understanding,
    verdict: review.verdict === "approved" ? "approved" : "needs_work", feedback: review
  });
  await logEvent(env, "submission", `${mission.id} (${mission.title}) — attempt ${attempt} — ${review.verdict}. ${review.parent_note || ""}`);

  if (review.verdict === "approved") {
    await approveMission(env, mission.id);
    await recordSkills(env, mission.concepts || [], mission.id);
    const state = await getWorldState(env);
    await setWorldState(env, `${state}\n\nUpdate: ${mission.id} (${mission.title}) approved. Visible result now true: ${mission.visibleResult}`);
    await logEvent(env, "approval", `${mission.id} approved. Planning the next mission now.`);

    try {
      await planNextMission(env);
    } catch (planErr) {
      console.error("Planning failed:", planErr);
      await logEvent(env, "plan_error", `Mission ${mission.id} approved, but planning the next mission failed: ${String(planErr.message || planErr)}. Ask Claude in chat to retry, or check the ANTHROPIC_API_KEY secret.`);
    }
  }

  return json(review);
}

async function planNextMission(env) {
  const already = await getCurrentMission(env);
  if (already) return already; // never plan two active missions at once

  const worldState = await getWorldState(env);
  const skillsRows = await env.DB.prepare("SELECT concept_name, taught_in_mission, note FROM skills").all();
  const caps = await capabilitiesWithStatus(env);
  const allMissions = await getAllMissions(env);
  const nextNumber = Math.max(...allMissions.map((m) => m.number)) + 1;

  const context = `Current world state and skills record:\n${worldState}\n\n` +
    `Skills already fully taught (only remind briefly, don't re-teach): ${JSON.stringify(skillsRows.results)}\n\n` +
    `Capability status: ${JSON.stringify(caps.map((c) => ({ key: c.key, title: c.title, status: c.status })))}\n\n` +
    `The next mission should be numbered ${nextNumber}, with id "V1-M${String(nextNumber).padStart(2, "0")}".`;

  const raw = await callClaude(env, {
    model: env.MODEL_STRONG,
    system: planningSystemPrompt(),
    messages: [{ role: "user", content: context }],
    maxTokens: 8000
  });
  const mission = extractJson(raw);

  const validCapKeys = new Set(CAPABILITIES.map((c) => c.key));
  if (mission.capability_key && !validCapKeys.has(mission.capability_key)) mission.capability_key = null;
  mission.id = `V1-M${String(nextNumber).padStart(2, "0")}`;
  mission.number = nextNumber;

  await saveDynamicMission(env, mission);
  await logEvent(env, "plan", `Planned ${mission.id}: ${mission.title}`);
  return mission;
}

async function handleHelp(request, env) {
  const body = await request.json();
  const mission = await getMission(env, body.mission_id);
  if (!mission) return json({ error: "Unknown mission." }, 404);
  const step = (mission.steps || []).find((s) => s.title === body.step_title);
  const hint = await callClaude(env, {
    model: env.MODEL_FAST,
    system: helpSystemPrompt(mission, body.step_title || "(unspecified step)"),
    messages: [{ role: "user", content: step ? `The step's own instructions:\n${JSON.stringify(step)}` : "Give a general nudge for this mission." }],
    maxTokens: 400
  });
  await logEvent(env, "help", `Help requested on ${mission.id}, step: ${body.step_title}`);
  return json({ hint });
}

async function handleChat(request, env) {
  const body = await request.json();
  const worldState = await getWorldState(env);
  const reply = await callClaude(env, {
    model: env.MODEL_STRONG,
    system: chatSystemPrompt(worldState),
    messages: [{ role: "user", content: body.message || "" }],
    maxTokens: 800
  });
  await logEvent(env, "chat", `Q on ${body.mission_id || "(no mission)"}: ${String(body.message || "").slice(0, 140)}`);
  return json({ reply });
}
