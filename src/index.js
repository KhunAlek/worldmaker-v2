var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
import STYLES_CSS from "./styles.css";
import LANDING_CSS from "./landing.css";
import LESSON_CSS from "./lesson_components.css";
import EVIDENCE_STANDARD from "./evidence_standard.md";
import CANONICAL_FACTS from "./canonical_facts.md";
import DESIGN_DECISIONS from "./design_decisions.md";
import QA_SKILL from "./lesson_qa_skill.md";
import KNOWN_ENGINE_BEHAVIORS from "./known_engine_behaviors.md";
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __defProp22 = Object.defineProperty;
var __name22 = /* @__PURE__ */ __name2((target, value) => __defProp22(target, "name", { value, configurable: true }), "__name");
var __defProp222 = Object.defineProperty;
var __name222 = /* @__PURE__ */ __name22((target, value) => __defProp222(target, "name", { value, configurable: true }), "__name");
var COOKIE_NAME = "wm_session";
var SESSION_HOURS = 24 * 30;
async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}
__name(hmacKey, "hmacKey");
__name2(hmacKey, "hmacKey");
__name22(hmacKey, "hmacKey");
__name222(hmacKey, "hmacKey");
async function sign(secret, payload) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" })[c]);
}
__name(sign, "sign");
__name2(sign, "sign");
__name22(sign, "sign");
__name222(sign, "sign");
async function makeSessionCookie(env) {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1e3;
  const payload = `ok.${expires}`;
  const sig = await sign(env.SESSION_SECRET, payload);
  const value = `${payload}.${sig}`;
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}`;
}
__name(makeSessionCookie, "makeSessionCookie");
__name2(makeSessionCookie, "makeSessionCookie");
__name22(makeSessionCookie, "makeSessionCookie");
__name222(makeSessionCookie, "makeSessionCookie");
function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
__name(clearSessionCookie, "clearSessionCookie");
__name2(clearSessionCookie, "clearSessionCookie");
__name22(clearSessionCookie, "clearSessionCookie");
__name222(clearSessionCookie, "clearSessionCookie");
async function isAuthenticated(request, env) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  const value = decodeURIComponent(match[1]);
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [tag, expiresStr, sig] = parts;
  const payload = `${tag}.${expiresStr}`;
  const expected = await sign(env.SESSION_SECRET, payload);
  if (expected !== sig) return false;
  if (tag !== "ok") return false;
  if (Date.now() > Number(expiresStr)) return false;
  return true;
}
__name(isAuthenticated, "isAuthenticated");
__name2(isAuthenticated, "isAuthenticated");
__name22(isAuthenticated, "isAuthenticated");
__name222(isAuthenticated, "isAuthenticated");
function checkPassword(submitted, env) {
  const a = String(submitted || "");
  const b = String(env.SITE_PASSWORD || "");
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
__name(checkPassword, "checkPassword");
__name2(checkPassword, "checkPassword");
__name22(checkPassword, "checkPassword");
__name222(checkPassword, "checkPassword");
var ANTHROPIC_VERSION = "2023-06-01";
async function callClaude(env, { model, system, messages, maxTokens = 2e3 }) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": ANTHROPIC_VERSION
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages,
      // Claude Sonnet 5 runs adaptive thinking by default, and thinking tokens are
      // billed against the same max_tokens budget as the actual answer — without
      // this, a call can spend its entire budget "thinking" and return nothing.
      // This app needs a complete, predictable JSON/text answer, not exposed
      // reasoning, so thinking is turned off outright rather than budgeted around.
      thinking: { type: "disabled" }
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errText}`);
  }
  const data = await response.json();
  const textBlocks = (data.content || []).filter((block) => block.type === "text");
  if (textBlocks.length === 0) {
    throw new Error(`Anthropic API returned no text (stop_reason: ${data.stop_reason}). Raw: ${JSON.stringify(data).slice(0, 500)}`);
  }
  return textBlocks.map((block) => block.text).join("\n");
}
__name(callClaude, "callClaude");
__name2(callClaude, "callClaude");
__name22(callClaude, "callClaude");
__name222(callClaude, "callClaude");
function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model output");
  }
  return JSON.parse(text.slice(start, end + 1));
}
__name(extractJson, "extractJson");
__name2(extractJson, "extractJson");
__name22(extractJson, "extractJson");
__name222(extractJson, "extractJson");
var MISSION_JSON_SHAPE = `{
  "id": "V1-M05",
  "number": 5,
  "title": "string, short mission name",
  "difficulty": "Easy" | "Moderate" | "Challenging",
  "objective": "one or two sentences, what gets built",
  "whyItMatters": "one or two sentences, why this matters for the finished game",
  "startingState": "one sentence, what already exists before Nick begins",
  "visibleResult": "one sentence, what Nick will see or be able to do when finished",
  "capability_key": "one of the ten capability keys this mission delivers, or null if it's pure setup",
  "concepts": [ { "name": "string", "text": "plain-English definition, technical term introduced second" } ],
  "requiredHierarchy": "a text Explorer tree, using the exact canonical object names",
  "code": "optional \u2014 a short single required Luau snippet if there is exactly one",
  "steps": [
    {
      "title": "string, one of Understand / Do / Observe / Experiment / Fix / Prove followed by a short description",
      "actions": ["concrete, first-use-explained, one-idea-at-a-time instructions"],
      "codeBlocks": [ { "label": "string", "code": "Luau code, fully commented", "explanation": "string" } ],
      "checkpoint": "exact visible checkpoint \u2014 what should and should not appear",
      "recovery": "one concrete recovery action, never just 'try again' or 'debug it'"
    }
  ],
  "mistakes": ["likely beginner mistakes, for the mistake-prevention list"],
  "tests": [ { "id": "V1-M05-T01", "name": "string", "setup": "string", "action": "string", "expected": "string" } ],
  "submission": {
    "fields": [ { "key": "string", "label": "string", "type": "screenshot" | "text", "help": "exactly what to capture and where" } ]
  }
}
Evidence rule (Standard \xA716.1, non-negotiable): fields must be, in order \u2014 one
or more type:"screenshot" entries (only more than one if a single frame genuinely
can't show the result; name each to an exact moment, e.g. "after clicking NPC_1"),
then a type:"text" entry with key "code" ONLY if Nick wrote new code this mission,
then exactly one closing type:"text" entry with key "reflection", label "What
happened, and what was hardest?". Never a separate understanding question. Never
video by default \u2014 only if a result truly cannot be shown by any number of stills.`;
function planningSystemPrompt() {
  return `You are the mission planner for Nick // Worldmaker v2, a Roblox Studio/Luau teaching
project for an 11-year-old named Nick. You write exactly one new mission at a time,
in strict JSON matching the shape given below, and nothing else \u2014 no prose before or
after the JSON.

You will be given: what Nick has actually built and been taught so far (treat this as
ground truth over any assumption about where a learner "should" be), the ten fixed
game capabilities and which are already done, and the canonical object names and
gameplay constants. Steer toward the next undone capability, but you are free to
split it into a smaller mission, combine it with setup, or reorder \u2014 there is no
fixed mission list to follow.

Hard rules, non-negotiable:
- Never invent or alter a canonical object name, gameplay constant, or ownership rule.
  Use only what's in the canonical facts document below.
- Follow the Beginner Lesson and Evidence Standard document below exactly: no
  technical term before its plain-English explanation, one new idea at a time, a
  concrete recovery for every step, minimal evidence requested at the end.
- Evidence fields must exactly match \xA716.1 of the Standard and the required JSON
  shape below \u2014 screenshot(s), optional code, one closing "reflection" field. Do
  not add any other field type, and never request video unless truly nothing else
  can prove the result.
- Only introduce concepts genuinely new to Nick. If the skills record shows a concept
  already fully taught, use at most a one-line reminder, not a full explanation.
- The mission must be small enough to complete in one sitting and must produce a
  visible or meaningful result, not just invisible setup.
- Match the tone, concreteness, and step granularity of the four existing missions
  you'll see as ground truth for "done right."

=== Beginner Lesson and Evidence Standard ===
${EVIDENCE_STANDARD}

=== Worldmaker Canonical Facts ===
${CANONICAL_FACTS}

=== Worldmaker v2 Design Decisions (operating rules) ===
${DESIGN_DECISIONS}

=== Required JSON shape for your output ===
${MISSION_JSON_SHAPE}

Return only the JSON object. No markdown fences, no commentary.`;
}
__name(planningSystemPrompt, "planningSystemPrompt");
__name2(planningSystemPrompt, "planningSystemPrompt");
__name22(planningSystemPrompt, "planningSystemPrompt");
__name222(planningSystemPrompt, "planningSystemPrompt");
function qaSystemPrompt() {
  return `You are running a mandatory QA pass on a Worldmaker mission that was just
generated by the planner, before it is saved and shown to Nick (age 11). This is
the exact same check described in the worldmaker-lesson-qa skill below \\u2014 you
are that skill, running automatically as part of the pipeline instead of being
invoked by hand, which is the whole point: a lesson with a real behavioral bug
already reached Nick once (V1-M04's Highlight/Adornee red-screen bug) because
nobody checked engine behavior against assumption before it shipped, and it
happened a second time with V1-M05 (two buttons left at default Position, so they
silently overlapped and one was unclickable) because that check was skipped again
by a human process instead of being automatic. This call exists so it can never be
skipped a third time.

=== worldmaker-lesson-qa skill ===
${QA_SKILL}

=== Known Roblox engine behaviors already on record (check here before reasoning from scratch) ===
${KNOWN_ENGINE_BEHAVIORS}

Your job: apply Step 1 (trace every property or object state the mission's own
visibleResult sentence depends on, through creation / before-first-action /
after-first-action, checking real engine behavior not comment intent), Step 2
(re-check against the Beginner Lesson and Evidence Standard's Gates 1-8), and
Step 3 (confirm every entry in this mission's tests[] array is explicitly provable
from an entry in submission.fields[] -- either a dedicated field, or a stated joint
mapping -- since this exact gap is what let V1-M05 demand evidence Nick had no field
to submit) to the specific mission JSON you're given.

If you find a real issue \u2014 an unverified default, a property left at a class
default that breaks the visible result, a missing checkpoint/recovery/mistake entry
for a real failure mode, an unmapped test in tests[], or a Gate violation \u2014 fix
it directly in the mission JSON: add explicit values, add the missing
mistakes/checkpoint/recovery text or evidence mapping, and
make sure the fix is explained in plain English matching this mission's existing
teaching voice. Do not soften or remove existing correct content to do this.

If you find nothing wrong, return the mission exactly as given, unchanged.

Reply with ONLY this JSON object, no other text, no markdown fences:
{
  "passed_without_changes": true | false,
  "issues_found": ["short description of each real issue found, empty array if none"],
  "mission": { ...the complete mission object, corrected if needed, matching the exact same shape it was given in... }
}`;
}
__name(qaSystemPrompt, "qaSystemPrompt");
__name2(qaSystemPrompt, "qaSystemPrompt");
__name22(qaSystemPrompt, "qaSystemPrompt");
__name222(qaSystemPrompt, "qaSystemPrompt");
function gradingSystemPrompt(mission) {
  return `You are grading Nick's submission for mission ${mission.id} \u2014 "${mission.title}" \u2014 in
Nick // Worldmaker v2. Nick is 11. Per design doc \xA715, this project deliberately does
NOT use a formal multi-status evaluator workflow \u2014 grade as a simple pass / needs-more-work
distinction, nothing more elaborate.

Mission objective: ${mission.objective}
Mandatory checks (every test below must be satisfied by the evidence): ${JSON.stringify(mission.tests)}
Likely mistakes to check for: ${JSON.stringify(mission.mistakes)}

Each attached screenshot is preceded by a text line naming which requirement it's
meant to prove \u2014 match it against that specific check, not against the mission in
general.

Evidence rules:
- Judge only what the submitted text and any attached images actually show. Do not
  assume a step was done correctly just because Nick says so \u2014 check it against the
  mission's tests and mistakes list.
- Checkbox or self-report claims alone are never sufficient proof.
- Distinguish Nick's own project code/objects from unrelated Roblox Studio or plugin
  noise (Beginner Lesson standard \xA713) \u2014 never fail a mission solely for unrelated
  plugin noise, and never ask Nick to fix code that isn't his.
- The closing "reflection" field (what happened, and what was hardest) is where a
  problem with the lesson's own content \u2014 not just Nick's understanding \u2014 can show
  up in his own words (Standard \xA716.1, \xA717). Imperfect English or a rough-but-honest
  answer is enough; do not fail a working mission over wording.
- If evidence is genuinely missing or unreadable, that's needs_work with clear
  guidance on exactly what to capture and resubmit \u2014 not a guess at "probably fine."

Formatting: every text field below is shown to Nick and you as plain text, not
rendered Markdown. Write ordinary sentences only \u2014 no #, *, **, backticks, or bullet
dashes inside any field's value.

Reply with ONLY this JSON object, no other text:
{
  "verdict": "approved" | "needs_work",
  "headline": "one sentence, plain language, said directly to Nick",
  "what_worked": ["short concrete points \u2014 only things actually shown in the evidence"],
  "what_to_fix": ["short concrete points, each with a specific next action \u2014 empty array if approved"],
  "understanding_feedback": "one short sentence responding to what Nick wrote in the reflection field",
  "parent_note": "one or two sentences for the daily report, plain language, no jargon"
}`;
}
__name(gradingSystemPrompt, "gradingSystemPrompt");
__name2(gradingSystemPrompt, "gradingSystemPrompt");
__name22(gradingSystemPrompt, "gradingSystemPrompt");
__name222(gradingSystemPrompt, "gradingSystemPrompt");
function helpSystemPrompt(mission, stepTitle) {
  return `You are the quick "Help" button for Nick, age 11, on mission ${mission.id} \u2014 "${mission.title}"
\u2014 currently on this exact step: "${stepTitle}".

Per design doc \xA73 and \xA710: you explain, teach, and ask questions \u2014 you never write
Nick's code for him or take ownership of the build. Give a short, concrete nudge
scoped ONLY to this step: what to look at, what's likely wrong, or what to try next.
Plain English before any technical term. No more than 4-5 sentences. Do not paste a
finished code block unless the step's own required code block already shows it.

Formatting: your reply is shown to Nick as plain text, not rendered Markdown. Write
in ordinary sentences and paragraphs only. Do not use #, *, **, backticks, bullet
dashes, or any other Markdown symbols \u2014 they will show up as literal punctuation on
screen, not formatting.`;
}
__name(helpSystemPrompt, "helpSystemPrompt");
__name2(helpSystemPrompt, "helpSystemPrompt");
__name22(helpSystemPrompt, "helpSystemPrompt");
__name222(helpSystemPrompt, "helpSystemPrompt");
function chatSystemPrompt(worldStateNarrative) {
  return `You are the open-chat helper for Nick, age 11, in Nick // Worldmaker v2 \u2014 a
Roblox Studio/Luau teaching project. Per design doc \xA73 and \xA710: you explain, teach,
and ask questions \u2014 you never write Nick's code for him or take ownership of the
build. Explain the ordinary idea before any technical term (Beginner Lesson standard
\xA76). Keep answers short and concrete, not lecture-length, unless Nick is asking for a
deeper explanation.

Formatting: your reply is shown to Nick as plain text, not rendered Markdown. Write
in ordinary sentences and paragraphs only. Do not use #, *, **, backticks, bullet
dashes, or any other Markdown symbols \u2014 they will show up as literal punctuation on
screen, not formatting.

What's actually true about Nick's project right now, so you don't assume more or less
than he's actually built and been taught:
${worldStateNarrative}

=== Worldmaker Canonical Facts (never invent or alter these) ===
${CANONICAL_FACTS}`;
}
__name(chatSystemPrompt, "chatSystemPrompt");
__name2(chatSystemPrompt, "chatSystemPrompt");
__name22(chatSystemPrompt, "chatSystemPrompt");
__name222(chatSystemPrompt, "chatSystemPrompt");
function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
__name(esc, "esc");
__name2(esc, "esc");
__name22(esc, "esc");
__name222(esc, "esc");
function shell({ title, active, body, extraHead = "" }) {
  const nav = [
    ["/hq", "Build HQ"],
    ["/parent", "Parent Report"]
  ];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} \u2014 Worldmaker</title>
<link rel="stylesheet" href="/assets/styles.css" />
<link rel="stylesheet" href="/assets/lesson-components.css" />
${extraHead}
</head>
<body>
<a href="#main" class="skip-link">Skip to content</a>
<header class="site-header">
  <div class="site-shell header-inner">
    <a class="brand" href="/hq"><span class="brand-mark">W</span> WORLDMAKER</a>
    <nav class="site-nav" aria-label="Main">
      ${nav.map(([href, label]) => `<a href="${href}"${active === href ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
      <a href="/logout">Sign out</a>
    </nav>
  </div>
</header>
<main id="main" class="site-shell">
${body}
</main>
<footer class="footer">Nick // Worldmaker v2</footer>
</body>
</html>`;
}
__name(shell, "shell");
__name2(shell, "shell");
__name22(shell, "shell");
__name222(shell, "shell");
function loginPage({ error } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sign in \u2014 Worldmaker</title>
<link rel="stylesheet" href="/assets/styles.css" />
</head>
<body>
<main class="site-shell" style="max-width:440px;padding-top:14vh;">
  <div class="card card-pad">
    <div class="card-kicker">Worldmaker</div>
    <h1 style="font-size:2.2rem;margin-top:6px;">Sign in</h1>
    <p class="lead">One shared password gets you into Build HQ, the lessons, and the parent report.</p>
    ${error ? `<p class="local-notice" style="border-color:rgba(255,127,145,.4);color:#ffd7dc;background:rgba(255,127,145,.08);">${esc(error)}</p>` : ""}
    <form method="POST" action="/login" class="form-grid" style="margin-top:18px;">
      <div class="field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autofocus />
      </div>
      <div class="form-actions">
        <button type="submit" class="button button-primary">Enter</button>
      </div>
    </form>
  </div>
</main>
</body>
</html>`;
}
__name(loginPage, "loginPage");
__name2(loginPage, "loginPage");
__name22(loginPage, "loginPage");
__name222(loginPage, "loginPage");
function landingPage() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Worldmaker</title>
<link rel="stylesheet" href="/assets/landing.css" />
</head>
<body>
<div class="stars"></div>
<div class="glow-orb orb-a"></div>
<div class="glow-orb orb-b"></div>
<div class="wrap">
  <div class="topbar">
    <div class="logo"><span class="logo-cube">W</span> WORLDMAKER</div>
    <div class="topbar-actions">
      <span class="idea-badge">Nick's project</span>
      <a class="top-hq-link" href="/hq">Enter Build HQ</a>
    </div>
  </div>

  <section class="hero">
    <div class="hero-copy-col">
      <span class="eyebrow"><span class="pulse-dot"></span> Self-paced \xB7 AI-planned</span>
      <h1>Build a<span class="gradient">civilization</span>game.</h1>
      <p class="hero-copy">A first-person settlement game, built one real lesson at a time in Roblox Studio \u2014 <strong>select a settler, send it to gather, watch resources grow, build the first hut, reset it clean.</strong></p>
      <div class="hero-punch">
        <span class="chip"><b>+2</b> Wood / trip</span>
        <span class="chip"><b>+1</b> Stone / trip</span>
        <span class="chip"><b>6 Wood + 3 Stone</b> per hut</span>
      </div>
      <div class="actions">
        <a class="btn btn-primary btn-hq" href="/hq">Enter Build HQ</a>
      </div>
      <p class="access-note">One shared password gets you in \u2014 ask whoever set this up if you don't have it.</p>
    </div>
    <div class="world-shell">
      <div class="world-frame">
        <div class="game-top">
          <div class="mini-title">WORLDMAKER</div>
          <div class="resources"><div class="resource" id="woodCount">\u{1FAB5} Wood: 0</div><div class="resource" id="stoneCount">\u{1FAA8} Stone: 0</div></div>
        </div>
        <div class="world-map">
          <div class="ground-glow"></div>
          <div class="island"></div>
          <div class="river"></div>
          <div class="node tree t1">\u{1F332}</div>
          <div class="node tree t2">\u{1F332}</div>
          <div class="node tree t3">\u{1F332}</div>
          <div class="node rock">\u{1FAA8}</div>
          <div class="node flag">\u{1F6A9}</div>
          <div class="node monster">\u{1F479}</div>
          <div class="hut" id="demoHut">\u{1F3E0}</div>
          <div class="npc n1" id="npcWood" data-home-left="44" data-home-top="54" data-target-left="24" data-target-top="37" data-gathers="wood"><span></span></div>
          <div class="npc n2" id="npcStone" data-home-left="52" data-home-top="59" data-target-left="70" data-target-top="41" data-gathers="stone"><span></span></div>
          <div class="build-flash" id="buildFlash"></div>
          <div class="confetti" id="confetti"></div>
        </div>
        <div class="command-panel">
          <div class="command-label">Command</div>
          <div class="command-text" id="commandText">Click a settler to select them</div>
          <div class="command-bar" id="commandBar"><span></span></div>
        </div>
        <button class="demo-button" id="demoButton" disabled>Select a settler</button>
      </div>
    </div>
  </section>

  <script>
    (function () {
      var wood = 0, stone = 0, selected = null, busy = false, built = false;
      var npcWood = document.getElementById("npcWood");
      var npcStone = document.getElementById("npcStone");
      var button = document.getElementById("demoButton");
      var commandText = document.getElementById("commandText");
      var commandBar = document.getElementById("commandBar");
      var woodCount = document.getElementById("woodCount");
      var stoneCount = document.getElementById("stoneCount");
      var hut = document.getElementById("demoHut");
      var flash = document.getElementById("buildFlash");
      var confetti = document.getElementById("confetti");

      function selectNpc(npc) {
        if (busy) return;
        if (selected) selected.classList.remove("selected");
        selected = npc;
        npc.classList.add("selected");
        updateButton();
      }
      npcWood.addEventListener("click", function () { selectNpc(npcWood); });
      npcStone.addEventListener("click", function () { selectNpc(npcStone); });

      function updateButton() {
        if (busy) return;
        if (built) { button.textContent = "Reset the demo"; button.disabled = false; return; }
        if (wood >= 6 && stone >= 3) { button.textContent = "Build the hut"; button.disabled = false; return; }
        if (!selected) { button.textContent = "Select a settler"; button.disabled = true; return; }
        var resource = selected.dataset.gathers === "wood" ? "Wood (+2)" : "Stone (+1)";
        button.textContent = "Gather " + resource;
        button.disabled = false;
      }

      function walkTo(npc, left, top, duration, done) {
        npc.classList.add("walking");
        npc.style.left = left + "%";
        npc.style.top = top + "%";
        setTimeout(function () { npc.classList.remove("walking"); if (done) done(); }, duration);
      }

      function gather() {
        busy = true;
        button.disabled = true;
        var npc = selected;
        var isWood = npc.dataset.gathers === "wood";
        commandText.textContent = "Gathering " + (isWood ? "Wood" : "Stone") + "...";
        commandBar.classList.remove("run"); void commandBar.offsetWidth; commandBar.classList.add("run");
        walkTo(npc, Number(npc.dataset.targetLeft), Number(npc.dataset.targetTop), 1000, function () {
          setTimeout(function () {
            walkTo(npc, Number(npc.dataset.homeLeft), Number(npc.dataset.homeTop), 1000, function () {
              if (isWood) { wood += 2; woodCount.textContent = "\u{1FAB5} Wood: " + wood; }
              else { stone += 1; stoneCount.textContent = "\u{1FAA8} Stone: " + stone; }
              commandText.textContent = "Click a settler to select them";
              busy = false;
              updateButton();
            });
          }, 400);
        });
      }

      function spawnConfetti() {
        var colors = ["#56f6ff", "#a66bff", "#ff5fd2", "#97ff82", "#ffd66b"];
        confetti.innerHTML = "";
        for (var i = 0; i < 24; i++) {
          var el = document.createElement("i");
          var angle = Math.random() * Math.PI * 2;
          var dist = 80 + Math.random() * 120;
          el.style.setProperty("--x", (Math.cos(angle) * dist) + "px");
          el.style.setProperty("--y", (Math.sin(angle) * dist - 40) + "px");
          el.style.setProperty("--r", (Math.random() * 480 - 240) + "deg");
          el.style.background = colors[i % colors.length];
          confetti.appendChild(el);
        }
        confetti.classList.remove("go"); void confetti.offsetWidth; confetti.classList.add("go");
      }

      function buildHut() {
        busy = true;
        button.disabled = true;
        commandText.textContent = "Building the hut...";
        setTimeout(function () {
          hut.classList.add("show");
          flash.classList.add("flash");
          spawnConfetti();
          built = true;
          busy = false;
          commandText.textContent = "Hut built! Click reset to try again";
          updateButton();
          setTimeout(function () { flash.classList.remove("flash"); }, 900);
        }, 500);
      }

      function resetDemo() {
        wood = 0; stone = 0; built = false;
        woodCount.textContent = "\u{1FAB5} Wood: 0";
        stoneCount.textContent = "\u{1FAA8} Stone: 0";
        hut.classList.remove("show");
        if (selected) selected.classList.remove("selected");
        selected = null;
        commandText.textContent = "Click a settler to select them";
        updateButton();
      }

      button.addEventListener("click", function () {
        if (busy) return;
        if (built) { resetDemo(); return; }
        if (wood >= 6 && stone >= 3) { buildHut(); return; }
        if (selected) gather();
      });

      updateButton();
    })();
  <\/script>

  <section id="roadmap">
    <div class="section-head">
      <span class="kicker">The build</span>
      <h2>Ten things this game has to do</h2>
      <p class="section-copy">Not fifteen fixed lessons \u2014 ten real outcomes. Whatever it takes to get from one to the next is planned as it's needed.</p>
    </div>
    <div class="value-grid">
      <div class="value-card"><div class="value-icon">\u{1F9CD}</div><h3>Two settlers</h3><p>They exist, stand safely, and are ready to move.</p></div>
      <div class="value-card"><div class="value-icon">\u{1F446}</div><h3>Select and command</h3><p>Click a settler, send it to gather.</p></div>
      <div class="value-card"><div class="value-icon">\u{1F3E0}</div><h3>Build and reset</h3><p>Grow resources, build the first hut, reset the world cleanly.</p></div>
    </div>
  </section>

  <section class="final">
    <div class="final-card">
      <h2>Start building.</h2>
      <p>Real Roblox Studio. Real Luau. Real proof, every step.</p>
      <a class="btn btn-primary btn-hq" href="/hq">Enter Build HQ</a>
    </div>
  </section>
</div>
</body>
</html>`;
}
__name(landingPage, "landingPage");
__name2(landingPage, "landingPage");
__name22(landingPage, "landingPage");
__name222(landingPage, "landingPage");
function hqPage({ capabilities, currentMission, approvedCount }) {
  const cards = capabilities.map((cap) => {
    const cls = cap.status === "done" ? "approved" : "";
    const statusLabel = cap.status === "done" ? "Done" : cap.status === "current" ? "In progress" : "Not started";
    const statusClass = cap.status === "done" ? "status-approved" : cap.status === "current" ? "status-under-review" : "status-locked";
    const inner = `
      <div class="mission-number">CAPABILITY ${String(cap.order).padStart(2, "0")}</div>
      <h3>${cap.icon} ${esc(cap.title)}</h3>
      <p>${cap.missionTitle ? esc(cap.missionTitle) : "Not planned yet."}</p>
      <span class="status ${statusClass}">${statusLabel}</span>`;
    return cap.missionId ? `<a class="mission-node ${cls}" href="/lesson/${encodeURIComponent(cap.missionId)}">${inner}</a>` : `<div class="mission-node locked">${inner}</div>`;
  }).join("");
  return shell({
    title: "Build HQ",
    active: "/hq",
    body: `
<div class="page-hero">
  <div>
    <span class="eyebrow">Build HQ</span>
    <h1>Your Path</h1>
    <p class="lead">${approvedCount} mission${approvedCount === 1 ? "" : "s"} approved so far. Ten capabilities to a finished first version.</p>
  </div>
  ${currentMission ? `<a class="button button-primary" href="/lesson/${encodeURIComponent(currentMission.id)}">Continue: ${esc(currentMission.title)}</a>` : ""}
</div>
<div class="section">
  <div class="mission-map">${cards}</div>
</div>`
  });
}
__name(hqPage, "hqPage");
__name2(hqPage, "hqPage");
__name22(hqPage, "hqPage");
__name222(hqPage, "hqPage");
function conceptCard(c) {
  return `<div class="concept"><b>${esc(c.name)}.</b> ${esc(c.text)}</div>`;
}
__name(conceptCard, "conceptCard");
__name2(conceptCard, "conceptCard");
__name22(conceptCard, "conceptCard");
__name222(conceptCard, "conceptCard");
function stepCard(step, index) {
  const actions = step.actions.map((a) => `<li>${esc(a)}</li>`).join("");
  const codeBlocks = (step.codeBlocks || []).map(
    (cb) => `<p><strong>${esc(cb.label)}</strong></p><pre class="code-block">${esc(cb.code)}</pre>${cb.explanation ? `<p class="field-help">${esc(cb.explanation)}</p>` : ""}`
  ).join("");
  return `<details class="step-card" ${index === 0 ? "open" : ""}>
  <summary>Step ${index + 1} \u2014 ${esc(step.title)}</summary>
  <div class="step-body">
    <ol>${actions}</ol>
    ${codeBlocks}
    <div class="checkpoint"><strong>Checkpoint:</strong> ${esc(step.checkpoint)}</div>
    <div class="triage warn"><strong>If it's not right yet:</strong> ${esc(step.recovery)}</div>
    <button type="button" class="button button-secondary help-btn" data-step="${esc(step.title)}">Help with this step</button>
    <div class="hint-box" data-hint-for="${esc(step.title)}" hidden></div>
  </div>
</details>`;
}
__name(stepCard, "stepCard");
__name2(stepCard, "stepCard");
__name22(stepCard, "stepCard");
__name222(stepCard, "stepCard");
function lessonPage({ mission, submitResult, missionAvailable, notice }) {
  const codeBlock = mission.code ? `<h3>Starting code reference</h3><pre class="code-block">${esc(mission.code)}</pre>` : "";
  const steps = mission.steps.map(stepCard).join("");
  const tests = mission.tests.map((t) => `
    <div class="test-card">
      <strong>${esc(t.id)} \u2014 ${esc(t.name)}</strong>
      <dl><dt>Setup</dt><dd>${esc(t.setup)}</dd><dt>Action</dt><dd>${esc(t.action)}</dd><dt>Expected</dt><dd>${esc(t.expected)}</dd></dl>
    </div>`).join("");
  const evidenceItems = (mission.submission?.fields || []).map((f) => {
    if (f.type === "screenshot") {
      return `
    <div class="evidence-field">
      <h3>${esc(f.label)}</h3>
      <p class="instructions">${esc(f.help)}</p>
      <div class="shot-row">
        <div class="shot-preview" id="preview_${esc(f.key)}">Preview<br>appears here</div>
        <div>
          <label class="upload-btn">\u{1F4F7} Choose screenshot<input type="file" id="f_${esc(f.key)}" name="${esc(f.key)}" accept="image/png,image/jpeg" data-required-field data-field-type="screenshot" style="display:none" /></label>
          <div class="upload-status" id="status_${esc(f.key)}">\u2713 Looks good \u2014 you can replace it any time before submitting.</div>
        </div>
      </div>
    </div>`;
    }
    return `
    <div class="evidence-field">
      <h3>${esc(f.label)}</h3>
      <p class="instructions">${esc(f.help)}</p>
      <textarea id="f_${esc(f.key)}" name="${esc(f.key)}" class="evidence-input${f.key === "code" ? " code" : ""}" data-required-field data-field-type="text"></textarea>
    </div>`;
  }).join("");
  const selfChecks = (mission.tests || []).map((t) => `
    <label><input type="checkbox" data-selfcheck /> <span><strong>${esc(t.id)}</strong> \u2014 ${esc(t.expected)}</span></label>`).join("");
  const alreadyApproved = mission.status === "approved";
  if (!missionAvailable) {
    return shell({ title: mission.title, active: "/hq", body: `<div class="empty">This mission isn't unlocked yet. <a href="/hq">Back to Build HQ</a>.</div>` });
  }
  return shell({
    title: mission.title,
    active: "/hq",
    body: `
<div class="mission-header card">
  <div class="mission-meta"><span class="status status-not-submitted">${esc(mission.difficulty)}</span><span class="status">${esc(mission.id)}</span></div>
  <h1>${esc(mission.title)}</h1>
  <p class="lead">${esc(mission.objective)}</p>
</div>
${notice ? `<p class="local-notice">${esc(notice)}</p>` : ""}
<style>
  .page-layout { display: grid; grid-template-columns: 360px minmax(0,1fr); gap: 24px; align-items: start; }
  .ask-panel { position: sticky; top: 84px; border: 1px solid rgba(86,246,255,.34); border-radius: 22px; padding: 22px; background: linear-gradient(150deg, rgba(180,122,255,.12), rgba(255,255,255,.025)); box-shadow: 0 24px 70px rgba(0,0,0,.38); }
  .ask-panel h2 { font-size: 1.15rem; margin: 0 0 6px; }
  .ask-panel textarea#chatInput { min-height: 220px; }
  .evidence-divider { display:flex; align-items:center; gap:14px; margin: 30px 0 18px; color: var(--muted); font-size: .78rem; text-transform: uppercase; letter-spacing: .1em; font-weight: 900; }
  .evidence-divider::before, .evidence-divider::after { content:""; flex:1; height:1px; background: var(--line); }
  .evidence-field { border: 1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 18px; background: rgba(255,255,255,.03); margin-bottom: 16px; }
  .evidence-field h3 { margin: 0 0 6px; font-size: 1.02rem; }
  .evidence-field .instructions { color: var(--muted); font-size: .9rem; margin: 0 0 14px; line-height: 1.5; }
  .shot-row { display: grid; grid-template-columns: 140px 1fr; gap: 16px; align-items: start; }
  .shot-preview { width: 140px; height: 90px; border-radius: 12px; border: 1px dashed rgba(255,255,255,.22); background: rgba(255,255,255,.025); display: grid; place-items: center; overflow: hidden; color: var(--muted); font-size: .7rem; text-align: center; padding: 6px; }
  .shot-preview img { width: 100%; height: 100%; object-fit: cover; }
  .upload-btn { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,.14); border-radius: 12px; padding: 11px 15px; background: rgba(255,255,255,.06); color: var(--text); font-weight: 850; cursor: pointer; font-size: .9rem; }
  .upload-btn:hover { border-color: rgba(86,246,255,.34); }
  .upload-status { margin-top: 8px; font-size: .82rem; color: var(--lime); display: none; }
  .upload-status.show { display: block; }
  @media (max-width: 980px) { .page-layout { grid-template-columns: 1fr; } .ask-panel { position: static; } .shot-row { grid-template-columns: 1fr; } }
</style>
<div class="page-layout">
  <aside class="ask-panel card">
    <h2>Ask a question</h2>
    <div id="chatLog" style="max-height:260px;overflow:auto;display:grid;gap:8px;margin-bottom:10px;"></div>
    <form id="chatForm" class="form-grid">
      <textarea id="chatInput" placeholder="Ask anything about this mission..."></textarea>
      <div class="form-actions"><button type="submit" class="button button-secondary">Ask</button></div>
    </form>
  </aside>
  <div>
    <div class="content-card">
      <h2>Why it matters</h2><p>${esc(mission.whyItMatters)}</p>
      <h2 style="margin-top:18px;">Before you start</h2><p>${esc(mission.startingState)}</p>
      <h2 style="margin-top:18px;">When you're done</h2><p class="expected">${esc(mission.visibleResult)}</p>
    </div>
    <div class="content-card">
      <h2>New ideas in this mission</h2>
      <div class="concepts">${mission.concepts.map(conceptCard).join("")}</div>
    </div>
    <div class="content-card">
      <h2>Target Explorer structure</h2>
      <pre class="code-block">${esc(mission.requiredHierarchy)}</pre>
      ${codeBlock}
    </div>
    <div class="content-card lesson-path">
      <h2>Steps</h2>
      ${steps}
    </div>
    <div class="content-card">
      <h2>Mission tests</h2>
      <div class="test-list">${tests}</div>
    </div>

    <div class="evidence-divider">Prove it worked</div>
    <div class="form-card card" id="submitCard">
      ${alreadyApproved ? `<div class="callout"><strong>Approved.</strong> This mission is done \u2014 you're just looking back at it. <a href="/hq">Back to Build HQ</a></div>` : `
      <h2>Submit this mission</h2>
      <p class="field-help">Fill in everything below honestly \u2014 this gets checked for real, not skimmed.</p>
      <form id="submitForm" enctype="multipart/form-data">
        ${evidenceItems}
        ${selfChecks ? `<h3 style="margin-top:22px;">Before you submit, check each one</h3><div class="screen-check" id="selfCheckList">${selfChecks}</div>` : ""}
        <div class="form-actions" style="margin-top:16px;">
          <button type="submit" class="button button-primary" id="submitBtn" disabled>Fill in everything above first</button>
        </div>
      </form>`}
      <div id="feedbackBox"></div>
    </div>
  </div>
</div>
<script>
const MISSION_ID = ${JSON.stringify(mission.id)};

document.querySelectorAll(".help-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const step = btn.dataset.step;
    const box = document.querySelector('[data-hint-for="' + CSS.escape(step) + '"]');
    box.hidden = false;
    box.textContent = "Thinking...";
    const res = await fetch("/api/help", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mission_id: MISSION_ID, step_title: step })
    });
    const data = await res.json();
    box.textContent = data.hint || data.error || "Couldn't get a hint right now.";
  });
});

function escHtml(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function listItems(arr, empty) { return (arr && arr.length ? arr.map(x => "<li>" + escHtml(x) + "</li>").join("") : "<li>" + empty + "</li>"); }

const submitFormEl = document.getElementById("submitForm");

if (submitFormEl) {
  submitFormEl.querySelectorAll('input[type="file"][data-field-type="screenshot"]').forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      const preview = document.getElementById("preview_" + input.name);
      const status = document.getElementById("status_" + input.name);
      if (!file || !preview) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML = '<img src="' + e.target.result + '">';
        if (status) status.classList.add("show");
      };
      reader.readAsDataURL(file);
      checkFormComplete();
    });
  });
}

function checkFormComplete() {
  if (!submitFormEl) return;
  const requiredFields = submitFormEl.querySelectorAll("[data-required-field]");
  const allFieldsFilled = Array.from(requiredFields).every((el) => el.value.trim().length > 0);
  const selfChecks = submitFormEl.querySelectorAll("[data-selfcheck]");
  const allChecked = Array.from(selfChecks).every((el) => el.checked);
  const btn = document.getElementById("submitBtn");
  if (!btn) return;
  const ready = allFieldsFilled && allChecked;
  btn.disabled = !ready;
  btn.textContent = ready ? "Submit for review" : "Fill in everything above first";
}
if (submitFormEl) {
  submitFormEl.querySelectorAll("[data-required-field]").forEach((el) => el.addEventListener("input", checkFormComplete));
  submitFormEl.querySelectorAll("[data-selfcheck]").forEach((el) => el.addEventListener("change", checkFormComplete));
  checkFormComplete();
}

if (submitFormEl) submitFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  const originalLabel = btn.textContent;
  btn.textContent = "Reviewing...";
  const fd = new FormData();
  submitFormEl.querySelectorAll("[data-required-field]").forEach((el) => {
    if (el.type === "file") {
      if (el.files && el.files[0]) fd.append(el.name, el.files[0]);
    } else {
      fd.append(el.name, el.value);
    }
  });
  let data;
  try {
    const res = await fetch("/api/submit", { method: "POST", body: fd, headers: { "x-mission-id": MISSION_ID } });
    data = await res.json();
  } catch (err) {
    btn.disabled = false; btn.textContent = originalLabel;
    alert("Something went wrong reaching the server. Try again.");
    return;
  }
  btn.textContent = originalLabel;
  checkFormComplete();
  if (data.error) { alert(data.error); return; }
  const approved = data.verdict === "approved";
  document.getElementById("feedbackBox").innerHTML =
    '<div class="feedback ' + (approved ? "approved" : "needs-fix") + '" style="margin-top:18px;">' +
    "<h2>" + (approved ? "Approved" : "Not quite yet") + "</h2>" +
    "<p>" + escHtml(data.headline) + "</p>" +
    '<div class="feedback-grid">' +
    '<div class="feedback-section"><h3>What worked</h3><ul>' + listItems(data.what_worked, "&mdash;") + "</ul></div>" +
    '<div class="feedback-section"><h3>What to fix</h3><ul>' + listItems(data.what_to_fix, "Nothing &mdash; you&#39;re done.") + "</ul></div>" +
    "</div>" +
    (data.understanding_feedback ? '<p class="field-help" style="margin-top:12px;">' + escHtml(data.understanding_feedback) + "</p>" : "") +
    (approved ? '<p class="callout" style="margin-top:16px;">Nice work. <a href="/hq">Back to Build HQ</a> &mdash; the next mission is being planned now.</p>' : "") +
    "</div>";
  if (approved) submitFormEl.style.display = "none";
});

const chatLog = document.getElementById("chatLog");
document.getElementById("chatForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  chatLog.insertAdjacentHTML("beforeend", '<div><strong>You:</strong> ' + text.replace(/</g,"&lt;") + '</div>');
  input.value = "";
  chatLog.insertAdjacentHTML("beforeend", '<div id="pending"><em>Thinking...</em></div>');
  chatLog.scrollTop = chatLog.scrollHeight;
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: text, mission_id: MISSION_ID })
  });
  const data = await res.json();
  document.getElementById("pending").remove();
  chatLog.insertAdjacentHTML("beforeend", '<div><strong>Claude:</strong> ' + (data.reply || data.error || "Something went wrong.").replace(/</g,"&lt;") + '</div>');
  chatLog.scrollTop = chatLog.scrollHeight;
});
<\/script>`
  });
}
__name(lessonPage, "lessonPage");
__name2(lessonPage, "lessonPage");
__name22(lessonPage, "lessonPage");
__name222(lessonPage, "lessonPage");
function parentReportPage({ events, missionSummaries }) {
  const rows = events.map((e) => `
    <div class="attempt">
      <div class="attempt-head"><strong>${esc(e.kind)}</strong><span class="muted">${esc(e.ts)}</span></div>
      <p>${esc(e.message)}</p>
    </div>`).join("") || `<div class="empty">No activity recorded yet.</div>`;
  const missions = missionSummaries.map((m) => `
    <div class="progress-row">
      <span class="status ${m.status === "approved" ? "status-approved" : "status-under-review"}">${esc(m.status)}</span>
      <a href="/lesson/${encodeURIComponent(m.id)}">${esc(m.title)}</a>
      <span class="muted">${esc(m.id)}</span>
      <span class="muted">${m.approved_at ? new Date(m.approved_at).toLocaleDateString() : "\u2014"}</span>
    </div>`).join("");
  return shell({
    title: "Parent Report",
    active: "/parent",
    body: `
<div class="page-hero"><div><span class="eyebrow">Pull-based, on your schedule</span><h1>Parent Report</h1><p class="lead">What Nick did, whether it passed, and anything worth attention. Nothing is pushed to you \u2014 check this whenever you like.</p></div></div>
<div class="section"><div class="section-head"><h2>Missions</h2></div><div class="progress-list">${missions || '<div class="empty">Nothing yet.</div>'}</div></div>
<div class="section"><div class="section-head"><h2>Recent activity</h2></div><div class="attempt-list">${rows}</div></div>`
  });
}
__name(parentReportPage, "parentReportPage");
__name2(parentReportPage, "parentReportPage");
__name22(parentReportPage, "parentReportPage");
__name222(parentReportPage, "parentReportPage");
var CAPABILITIES = [
  { key: "two_settlers", order: 1, icon: "\u{1F9CD}", title: "Two settlers exist in the world" },
  { key: "select_settler", order: 2, icon: "\u{1F446}", title: "Select a settler" },
  { key: "send_command", order: 3, icon: "\u{1F4DC}", title: "Send it a Wood or Stone command" },
  { key: "walk_to_resource", order: 4, icon: "\u{1F6B6}", title: "It walks to the correct resource" },
  { key: "gather_return", order: 5, icon: "\u{1FAB5}", title: "Gather and return home" },
  { key: "totals_grow", order: 6, icon: "\u{1F4C8}", title: "Shared resource totals grow" },
  { key: "construction_unlocks", order: 7, icon: "\u{1F513}", title: "Construction unlocks at the correct cost" },
  { key: "build_hut", order: 8, icon: "\u{1F3E0}", title: "Build the first hut" },
  { key: "restart_clean", order: 9, icon: "\u{1F504}", title: "Restart the world cleanly" },
  { key: "prove_publish", order: 10, icon: "\u{1F680}", title: "Prove it in Studio, then publish" }
];
var STATIC_MISSIONS = {
  "V1-M01": {
    id: "V1-M01",
    number: 1,
    title: "Studio Ready",
    difficulty: "Easy",
    objective: "Create the project structure, run the first server script, and prove Studio is showing useful Output.",
    whyItMatters: "A reliable project structure and readable Output are the foundation for every later test and review.",
    startingState: "Roblox Studio is installed and you can sign in. Start with a new Baseplate.",
    visibleResult: "Play mode starts normally and Output contains VERSION 1 SERVER READY once.",
    concepts: [
      { name: "Explorer", text: "Shows where every object lives." },
      { name: "Properties", text: "Shows settings for the selected object." },
      { name: "Output", text: "Shows messages and errors from a running game." },
      { name: "Script", text: "A normal Script in ServerScriptService runs shared server code." }
    ],
    requiredHierarchy: "Workspace\n\u2514\u2500\u2500 World\n    \u251C\u2500\u2500 Ground\n    \u251C\u2500\u2500 NPCs\n    \u251C\u2500\u2500 NPCHomes\n    \u251C\u2500\u2500 Resources\n    \u2514\u2500\u2500 Buildings\n\nReplicatedStorage\n\u251C\u2500\u2500 Remotes\n\u2514\u2500\u2500 GameState\n\nServerStorage\n\u2514\u2500\u2500 Templates\n\nServerScriptService\n\u2514\u2500\u2500 WorldServer (Script)",
    code: 'print("VERSION 1 SERVER READY")',
    steps: [
      { title: "Step 1 \u2014 Make the Studio windows visible", actions: ["At the top of Roblox Studio, click Window.", "Click Explorer.", "Open Window again and click Properties.", "Open Window again and click Output.", "Explorer is the list of objects in the game. Output is where code messages and errors appear."], checkpoint: "I can see Explorer. I can see Output. I can still see the Baseplate.", recovery: "If a panel is missing, reopen it from the Window menu \u2014 panels can be closed accidentally without affecting the project." },
      { title: "Step 2 \u2014 Create the World folder", actions: ["In Explorer, find Workspace.", "Move the mouse over Workspace. Click the small + that appears.", "Choose Folder.", "A new Folder appears underneath Workspace. Rename it exactly World."], checkpoint: "Workspace > World. If World is not directly under Workspace, drag it onto Workspace before continuing.", recovery: "Do not type this structure anywhere as text \u2014 build it by clicking, then compare it visually against the target hierarchy below." },
      { title: "Step 3 \u2014 Add the empty folders", actions: ["Repeat the same + \u2192 Folder \u2192 rename action for each of these.", "Under World, add: Ground, NPCs, NPCHomes, Resources, and Buildings.", "Under ReplicatedStorage, add: Remotes and GameState.", "Under ServerStorage, add: Templates."], checkpoint: "Expand the folders in Explorer and compare them with the full target hierarchy below. Do not type this structure anywhere.", recovery: "If a folder ended up in the wrong place, drag it in Explorer onto the correct parent rather than deleting and recreating it." },
      { title: "Step 4 \u2014 Create exactly one Script", actions: ["In Explorer, find ServerScriptService.", "Move the mouse over it and click +.", "Choose Script. Do not choose LocalScript or ModuleScript.", "Rename the new Script exactly WorldServer.", "Double-click WorldServer.", 'Delete the starter line print("Hello world!").'], checkpoint: "Correct: ServerScriptService > WorldServer. Wrong: a Script sitting directly under Workspace.", recovery: "If the Script ended up under Workspace instead of ServerScriptService, delete it and insert a fresh one in the right place \u2014 a normal Script, not a LocalScript." },
      { title: "Step 5 \u2014 Type the first Luau line", actions: ["print tells Roblox to place a message in Output. Build the line in three pieces.", "Type print.", "Add parentheses: print().", "Put the exact message inside quotation marks: VERSION 1 SERVER READY.", 'The completed line should read exactly: print("VERSION 1 SERVER READY")', "Before pressing Play, predict what will appear: only a new line in Output. Nothing new should appear on the Baseplate."], checkpoint: 'The line reads exactly print("VERSION 1 SERVER READY") with no red underline.', recovery: "Check the quotation marks and parentheses are both present and matched \u2014 a missing one is the most common typo here." },
      { title: "Step 6 \u2014 Script audit before Play", actions: ["This check prevents the exact problem that creates repeated Hello world! messages.", "Use the Explorer search box and search for Script.", "Open every Script shown by the search.", "Keep the one named WorldServer under ServerScriptService.", "Delete accidental Scripts directly under Workspace.", 'Delete unnecessary Scripts that still contain print("Hello world!").', "Clear the Explorer search box when done."], checkpoint: "There is exactly one intended Script (WorldServer, under ServerScriptService), no Script directly under Workspace, no leftover Hello world! script, and WorldServer contains one complete print line.", recovery: "If you see Hello world! later, an old or accidental Script is still running \u2014 repeat this search-and-remove audit." },
      { title: "Step 7 \u2014 Play, read Output, and test again", actions: ["Clear old Output messages.", "Press Play.", "Find VERSION 1 SERVER READY in Output.", "Press Stop.", "Clear Output and press Play a second time.", "The readiness message should appear once again."], checkpoint: "VERSION 1 SERVER READY appears exactly once, both times you press Play.", recovery: "An error containing a name such as cloud_...MA2Theme comes from a plugin or external package, not your project \u2014 it doesn't by itself mean WorldServer failed." },
      { title: "Fix \u2014 Match your symptom to a recovery", actions: ["I see Hello world!: an old or accidental Script is still running. Search Explorer for Script, open each result, and remove unnecessary Scripts containing the Hello world line.", "I see Workspace.Script: that Script is in the wrong place. Stop Play, delete the accidental Script under Workspace, and keep WorldServer under ServerScriptService.", 'I see "Incomplete statement": one line is unfinished. Open the Script named in the error, check its line number, and repair the missing quote, parenthesis, or incomplete text.', "I see cloud_... or MA2Theme: this is usually plugin code. First check whether VERSION 1 SERVER READY still appears \u2014 that's the real test, not the plugin noise."], checkpoint: "The specific problem you saw is fixed, and Step 7 passes cleanly on a fresh Play.", recovery: "If none of these match what you're seeing, stop and get adult help rather than guessing further." }
    ],
    mistakes: ["Script placed in Workspace instead of ServerScriptService.", "Extra Hello world Scripts left over from the default template.", "WorldServer created as a LocalScript instead of a normal Script.", "A folder name misspelled or placed under the wrong parent.", "A plugin error mistaken for a project error."],
    tests: [
      { id: "V1-M01-T01", name: "Server script runs", setup: "Clear Output.", action: "Press Play.", expected: "VERSION 1 SERVER READY appears once with no project Script error." },
      { id: "V1-M01-T02", name: "Structure is clean", setup: "Stop Play.", action: "Inspect Explorer and search for Scripts.", expected: "Required folders exist; WorldServer is under ServerScriptService." },
      { id: "V1-M01-T03", name: "Restart is clean", setup: "Stop after the first test.", action: "Press Play again.", expected: "The readiness message appears once again without duplicate starter Scripts." }
    ],
    submission: {
      fields: [
        { key: "explorer_screenshot", type: "screenshot", label: "Explorer screenshot", help: "One screenshot with Workspace, ReplicatedStorage, ServerStorage, and ServerScriptService all expanded, so every required folder and WorldServer are visible together." },
        { key: "output_screenshot", type: "screenshot", label: "Output screenshot", help: "Press Play, then take one screenshot of the Output panel showing VERSION 1 SERVER READY." },
        { key: "code", type: "text", label: "Complete WorldServer code", help: "Open WorldServer, select all its code, copy, and paste it here." },
        { key: "reflection", type: "text", label: "What happened, and what was hardest?", help: "A sentence or two \u2014 what worked, and what part gave you the most trouble." }
      ]
    }
  },
  "V1-M02": {
    id: "V1-M02",
    number: 2,
    title: "Build the Island",
    difficulty: "Easy",
    objective: "Turn the empty Baseplate into a small settlement area where the player can spawn, walk, and reach both future resource zones.",
    whyItMatters: "Every later mission needs somewhere to stand, a place to build, and open paths between them. This mission builds that ground once, safely, so nothing later has to fight with the world falling apart or routes being blocked.",
    startingState: "Mission 1 is approved. The World and Ground folders already exist.",
    visibleResult: "The player appears safely on a compact island with a clear BuildSite and open walking routes.",
    concepts: [
      { name: "Part", text: "A Part is a solid 3D block you can place, resize, and color \u2014 the basic building block for ground, walls, or markers." },
      { name: "Anchored", text: "Anchored is a setting on a Part. When it's turned on, the Part stays fixed in place instead of falling or being pushed around by physics." },
      { name: "SpawnLocation", text: "A SpawnLocation is a special Part that decides where the player's character appears when the game starts." }
    ],
    requiredHierarchy: "Workspace\n\u2514\u2500\u2500 World\n    \u251C\u2500\u2500 Ground\n    \u2502   \u251C\u2500\u2500 MainGround\n    \u2502   \u2514\u2500\u2500 Obstacle\n    \u251C\u2500\u2500 PlayerSpawn\n    \u251C\u2500\u2500 BuildSite\n    \u251C\u2500\u2500 NPCs\n    \u251C\u2500\u2500 NPCHomes\n    \u251C\u2500\u2500 Resources\n    \u2514\u2500\u2500 Buildings",
    steps: [
      { title: "Understand \u2014 Open the correct place", actions: ["Open the same Roblox Studio project you used for Mission 1.", "In Explorer, expand Workspace.", "Expand World.", "Expand the empty folder named Ground."], checkpoint: "You can see Workspace \u2192 World \u2192 Ground. Do not create anything outside World in this mission.", recovery: "If Ground doesn't exist yet, Mission 1 isn't actually finished \u2014 check that before continuing." },
      { title: "Do \u2014 Make the main ground", actions: ["Move the mouse over the Ground folder and click its small + button.", "Choose Part.", "Rename the new Part exactly MainGround.", "Select MainGround. In Properties, set Anchored to true \u2014 this keeps it from falling or moving once the game starts.", "Use the Scale tool to make a compact platform large enough to walk around, but small enough to see most of it on screen.", "Move it so its top surface is easy to stand on."], checkpoint: "MainGround is directly inside Ground, and Anchored is checked.", recovery: "If the ground falls when you press Play, stop Play, select MainGround, and set Anchored to true in Properties." },
      { title: "Do \u2014 Add the player spawn", actions: ["In Explorer, move the mouse over World and click +.", "Choose SpawnLocation \u2014 this decides where your character appears when Play starts.", "Rename it exactly PlayerSpawn.", "Move PlayerSpawn onto the top of MainGround, near one side of the island.", "Make sure it is not hanging over an edge and is not inside another Part.", "In Properties, confirm Anchored is true."], checkpoint: "Workspace > World contains Ground (with MainGround inside) and PlayerSpawn, both directly under World.", recovery: "If you spawn beside or under the island, move PlayerSpawn onto the top surface of MainGround and keep it away from the edge." },
      { title: "Do \u2014 Create the BuildSite", actions: ["Move the mouse over World and click +.", "Choose Part.", "Rename it exactly BuildSite.", "Move it onto the middle area of MainGround.", "Scale it into a flat marker. Keep it low enough that the player can walk across or around it.", "In Properties, set Anchored to true.", "Choose a colour that makes it easy to recognise."], checkpoint: "BuildSite is directly under World \u2014 not inside Ground or Buildings.", recovery: "If you can't find BuildSite in the right place, drag it directly onto World in Explorer so it lines up with PlayerSpawn, Ground, NPCs, and the other World folders." },
      { title: "Do \u2014 Leave two future resource areas", actions: ["Look at the island from above.", "Choose one open area for a future wood resource.", "Choose a different open area for a future stone resource.", "Keep both areas reachable from the centre.", "Do not add WoodNode or StoneNode yet \u2014 those belong to Mission 5."], checkpoint: "There is room for two settlers near the centre, and two separate future resource zones.", recovery: "If the island feels cramped, make MainGround a little bigger before continuing \u2014 it's easier to resize now than after more objects exist." },
      { title: "Do \u2014 Add one obstacle with a route around it", actions: ["Inside Ground, create one more Part.", "Rename it exactly Obstacle.", "Set Anchored to true.", "Place it between the centre and one future resource area.", "Keep enough empty space on at least one side for a player and a future NPC to walk around it."], checkpoint: "Wrong: a wall that blocks the full width of the island. Correct: an obstacle that forces a turn but still leaves a clear route.", recovery: "If you can't walk to one resource area, move or shrink the obstacle until a wide route remains around at least one side." },
      { title: "Do \u2014 Check every important object", actions: ["Select each object and check Properties one at a time.", "Confirm MainGround is inside World > Ground and Anchored is true.", "Confirm Obstacle is inside World > Ground and Anchored is true.", "Confirm PlayerSpawn is directly under World, on safe ground, and Anchored is true.", "Confirm BuildSite is directly under World, is flat, and Anchored is true."], checkpoint: "Explorer matches: World > Ground (MainGround, Obstacle), plus PlayerSpawn, BuildSite, NPCs, NPCHomes, Resources, Buildings all directly under World.", recovery: "Fix whichever object doesn't match before moving on \u2014 a missing Anchored checkbox is the most common cause of a broken test later." },
      { title: "Do \u2014 Check for unwanted scripts", actions: ["Use the Explorer search box and search for Script.", "Keep your approved ServerScriptService > WorldServer.", "If you inserted any Toolbox model, expand it completely.", "Remove any unknown Script, LocalScript, or ModuleScript inside imported decoration.", "Clear the Explorer search box when done."], checkpoint: "Safety rule: do not keep free-model code you cannot explain. Simple Parts made by you are safest.", recovery: "If you're not sure what a script does, remove it \u2014 decoration doesn't need code to look good." },
      { title: "Fix \u2014 Match your symptom to a recovery", actions: ["The ground falls when you press Play: stop Play, select each ground Part, and set Anchored to true in Properties.", "You spawn beside or under the island: stop Play, move PlayerSpawn onto the top surface of MainGround, away from the edge.", "You can't walk to one resource area: move or shrink the obstacle until a wide route remains around at least one side.", "You can't find BuildSite in the correct place: drag it directly onto World in Explorer so it lines up with PlayerSpawn, Ground, and the other World folders."], checkpoint: "The specific problem you saw is fixed, and walking around the island works the way the tests below expect.", recovery: "If none of these match what you're seeing, stop and get adult help rather than guessing further." }
    ],
    mistakes: ["Any ground or obstacle Part has Anchored turned off.", "BuildSite is inside Ground instead of directly under World.", "PlayerSpawn is over an edge, buried in another Part, or named incorrectly.", "The obstacle blocks every route to one side.", "An imported model contains an unknown executable script.", "The screenshot was taken before the latest change."],
    tests: [
      { id: "V1-M02-T01", name: "Safe spawn", setup: "Stop any old Play session.", action: "Press Play and wait for the character to appear.", expected: "The character stands on solid ground and can move without immediately falling." },
      { id: "V1-M02-T02", name: "World stays put", setup: "Stay in the same Play session for several seconds.", action: "Walk across the island and around the BuildSite.", expected: "MainGround, Obstacle, PlayerSpawn, and BuildSite do not fall, tip, or drift." },
      { id: "V1-M02-T03", name: "Route exists", setup: "Remain in Play mode.", action: "Walk from the centre around the obstacle toward both future resource areas.", expected: "At least one clear walking route reaches each area." }
    ],
    submission: {
      fields: [
        { key: "explorer_screenshot", type: "screenshot", label: "Explorer screenshot", help: "One screenshot with World and Ground both expanded, showing MainGround, Obstacle, PlayerSpawn, and BuildSite together." },
        { key: "play_screenshot", type: "screenshot", label: "Play-mode screenshot", help: "One clear screenshot while in Play mode, showing your character standing safely on the island." },
        { key: "reflection", type: "text", label: "What happened, and what was hardest?", help: "A sentence or two \u2014 what worked, and what part gave you the most trouble." }
      ]
    }
  },
  "V1-M03": {
    id: "V1-M03",
    number: 3,
    title: "Add Two Settlers",
    difficulty: "Easy",
    objective: "Create two complete Roblox characters that stand safely in the world and are ready to move in later missions.",
    whyItMatters: "Your game begins with two settlers. Each one must be a complete character, not a statue or a loose collection of body parts.",
    startingState: "Mission 2 is approved. Workspace > World already contains safe ground plus empty folders named NPCs and NPCHomes.",
    visibleResult: "NPC_1 and NPC_2 stand apart on the island during Play, stay together, and remain upright.",
    concepts: [
      { name: "Character rig", text: "A ready-made Roblox character with connected body parts. Roblox calls this complete character a rig." },
      { name: "Model", text: "One top row in Explorer that holds all parts of one character. Roblox calls this container a Model." },
      { name: "Humanoid", text: "The object inside the character that gives it character behavior such as standing and walking." },
      { name: "HumanoidRootPart", text: "The hidden central body piece Roblox uses to locate and move the whole character." },
      { name: "PrimaryPart", text: "A setting on the complete character that names its main positioning piece. Roblox calls this setting PrimaryPart." }
    ],
    requiredHierarchy: "CORRECT EXPLORER STRUCTURE\n\nWorkspace\n\u2514\u2500\u2500 World\n    \u251C\u2500\u2500 NPCs\n    \u2502   \u251C\u2500\u2500 NPC_1 (Model)\n    \u2502   \u2502   \u251C\u2500\u2500 Humanoid\n    \u2502   \u2502   \u251C\u2500\u2500 HumanoidRootPart\n    \u2502   \u2502   \u2514\u2500\u2500 body parts and joints\n    \u2502   \u2514\u2500\u2500 NPC_2 (Model)\n    \u2502       \u251C\u2500\u2500 Humanoid\n    \u2502       \u251C\u2500\u2500 HumanoidRootPart\n    \u2502       \u2514\u2500\u2500 body parts and joints\n    \u2514\u2500\u2500 NPCHomes\n        \u251C\u2500\u2500 NPC_1_Home (Part)\n        \u2514\u2500\u2500 NPC_2_Home (Part)\n\nCOMMON WRONG STRUCTURE\n\nWorkspace\n\u251C\u2500\u2500 NPC_1\n\u251C\u2500\u2500 NPC_2\n\u2514\u2500\u2500 World\n    \u251C\u2500\u2500 NPCs (empty)\n    \u2514\u2500\u2500 NPCHomes\n        \u251C\u2500\u2500 Part\n        \u2514\u2500\u2500 Part\n\nWrong because the settlers are outside World > NPCs and the markers do not have the required names.",
    steps: [
      { title: "Understand \u2014 Stop the running game before editing", actions: ["Look at the top toolbar. If the square Stop button is active, the game is in Play mode.", "Click the square Stop button. Wait until your player character disappears and the normal editing tools return.", "If you cannot see Explorer or Properties, open the View tab at the top and click Explorer and Properties. Some Studio layouts place these buttons under Window instead."], checkpoint: "You are back in Edit mode. Your player character is gone, Explorer is visible, and you can select saved objects without the game running.", recovery: "If Stop does nothing, press Shift+F5 once. Do not insert or rename settlers while Play mode is running because Play-mode changes disappear when you stop." },
      { title: "Understand \u2014 Open Roblox Studio's character tool", actions: ["At the top of Studio, click the Avatar tab.", "Look for a button named Rig Builder, Build Rig, or Character. Roblox has used different labels in different Studio versions.", "Click that button. A small rig-selection window should open.", "If the Avatar tab or button is hidden, widen the Studio window and look for a double-arrow or three-dot overflow button at the right end of the top toolbar.", "If it is still missing, open the Plugins tab and look for Build Rig there. Do not use Toolbox search results or a random free model."], checkpoint: "A rig-selection window is open and shows basic character choices.", recovery: "Close any unrelated Toolbox window and try Avatar > Rig Builder again. If Studio shows no built-in rig control in Avatar, overflow, or Plugins, restart Studio once and reopen the project before continuing." },
      { title: "Do \u2014 Insert one clean basic character", actions: ["In the rig-selection window, choose R15.", "Choose the plain Block Rig or another plain basic R15 option. R15 is used because it is Roblox's modern character format and already contains the pieces needed for later walking missions.", "Click the option once and wait. Do not click it repeatedly.", "Look in the 3D world and in Explorer under Workspace. A complete character should appear."], checkpoint: "Explorer has one new top row directly under Workspace. Expanding that row shows many body parts plus Humanoid and HumanoidRootPart.", recovery: "If nothing appears, confirm you are in Edit mode and repeat the insertion once. If several characters appeared, keep one complete character and delete the extra complete copies before continuing." },
      { title: "Do \u2014 Move the complete character into World > NPCs", actions: ["In Explorer, expand Workspace and find the new character's top row. It is the row that contains Head, body parts, Humanoid, and HumanoidRootPart underneath it.", "Click that top row once. Do not select Head, an arm, a leg, Humanoid, or HumanoidRootPart.", "Drag the selected top row onto the NPCs folder inside Workspace > World.", "Release the mouse only when the NPCs folder is highlighted.", "Expand World, then NPCs. The complete character row should now appear indented underneath NPCs. The outer folder that holds an object is called its parent in Roblox."], checkpoint: "Explorer reads Workspace > World > NPCs > [new character]. Expanding the character still shows all body parts, Humanoid, and HumanoidRootPart together.", recovery: "If only one body part moved, press Ctrl+Z immediately. Then select the character's top row and try again. If the character disappeared from view, use Explorer to select its top row and press F to focus the camera on it." },
      { title: "Do \u2014 Rename the first settler and inspect its required pieces", actions: ["In Explorer under World > NPCs, right-click the complete character's top row and choose Rename. You can also select it and press F2.", "Type exactly NPC_1 and press Enter.", "Click the small arrow beside NPC_1 to expand it.", "Find an item named Humanoid and an item named HumanoidRootPart. Do not rename either one.", "If either item is missing, stop here. This is not a complete usable character."], checkpoint: "World > NPCs contains NPC_1, and NPC_1 contains both Humanoid and HumanoidRootPart.", recovery: "If Humanoid or HumanoidRootPart is missing, delete the whole broken NPC_1 Model and insert one fresh basic R15 Block Rig. Do not try to rebuild character joints by hand." },
      { title: "Do \u2014 Set the character's main positioning piece", actions: ["Click the NPC_1 top row in Explorer, not HumanoidRootPart itself.", "In Properties, click the search box and type PrimaryPart.", "PrimaryPart is the setting that tells Roblox which body piece represents the whole character when it is positioned.", "Click the empty value or its selection button, then choose HumanoidRootPart from inside NPC_1.", "Look at the value again. It should now say HumanoidRootPart."], checkpoint: "With NPC_1 selected, Properties shows PrimaryPart = HumanoidRootPart.", recovery: "If PrimaryPart does not appear, make sure the NPC_1 Model row is selected. If HumanoidRootPart is not offered, confirm it is still inside NPC_1 rather than beside it in Explorer." },
      { title: "Fix \u2014 Remove only unwanted inserted scripts", actions: ["Expand NPC_1 in Explorer and look specifically for rows whose type is Script or LocalScript. Their icons look like script pages, not body blocks.", "Do not delete Humanoid, HumanoidRootPart, body parts, Motor6D joints, attachments, clothing, or accessories.", "A plain Rig Builder character normally needs no demo Script for this mission. Delete only Script or LocalScript objects that were inserted inside NPC_1 and are not part of Nick's project.", "If you are unsure about an item, select it and read its type at the top of Properties before deleting it."], checkpoint: "NPC_1 is still a complete character with Humanoid, HumanoidRootPart, body parts, and joints, but no unknown Script or LocalScript remains inside it.", recovery: "If you deleted a required character object, press Ctrl+Z. If the character is already damaged or confusing, delete the whole NPC_1 Model and restart from a fresh built-in rig." },
      { title: "Do \u2014 Duplicate the cleaned complete character", actions: ["Select the NPC_1 top row in Explorer.", "Press Ctrl+D once. A complete copy should appear beside NPC_1 under the same NPCs folder.", "Rename the new top row exactly NPC_2 and press Enter.", "Expand NPC_2 and confirm Humanoid and HumanoidRootPart are present.", "Select NPC_2, search Properties for PrimaryPart, and confirm it says HumanoidRootPart."], checkpoint: "World > NPCs contains exactly two complete Models named NPC_1 and NPC_2. Both contain Humanoid and HumanoidRootPart, and both use HumanoidRootPart as PrimaryPart.", recovery: "If duplication created a loose body part, delete that loose copy and duplicate the NPC_1 top row again. If there are more than two complete settlers, delete the extras." },
      { title: "Do \u2014 Move the settlers apart without breaking them", actions: ["Select the NPC_1 top row in Explorer. At the top of Studio, click the Move tool.", "Use the colored arrows in the 3D view to move the complete character onto clear solid ground.", "Repeat with the NPC_2 top row. Leave at least one full character-width of empty space between them.", "Keep both feet slightly above the ground surface rather than buried inside it.", "Do not drag individual arms, legs, or HumanoidRootPart to separate the settlers."], checkpoint: "Both complete settlers are visible, stand over solid ground, do not overlap, and remain inside World > NPCs in Explorer.", recovery: "If a character bends or one limb separates, press Ctrl+Z and move the complete Model row instead. If the settlers overlap, move NPC_2 sideways using the Model selection until there is a clear gap." },
      { title: "Do \u2014 Confirm the body parts can move", actions: ["Expand NPC_1 and click one body part such as Head or UpperTorso.", "In Properties, find Anchored. It must be false, which means the body can move with the character.", "Check several body parts, including HumanoidRootPart. None should have Anchored set to true.", "Repeat the same check inside NPC_2.", "Do not change the ground or home-marker anchoring during this check."], checkpoint: "Body parts in NPC_1 and NPC_2 have Anchored = false. The settlers themselves are movable characters, not fixed statues.", recovery: "If a body part is anchored, select that body part and turn Anchored off. If many body parts have unexpected settings, replace the damaged character with a fresh built-in rig and duplicate it again." },
      { title: "Do \u2014 Create NPC_1_Home under World > NPCHomes", actions: ["In Explorer, move the mouse over NPCHomes inside Workspace > World and click the small + button.", "Choose Part. A new block should appear underneath NPCHomes.", "Rename the Part exactly NPC_1_Home.", "With NPC_1_Home selected, set Anchored to true, CanCollide to false, and Transparency to 1 in Properties.", "Transparency 1 makes the marker invisible. Temporarily use 0.5 while positioning it if needed.", "Use the Move tool to place the marker on the ground directly below NPC_1's starting position, near the middle between its feet. Then return Transparency to 1."], checkpoint: "World > NPCHomes contains NPC_1_Home. Its settings are Anchored = true, CanCollide = false, Transparency = 1, and it sits under NPC_1's start.", recovery: "If the Part appeared somewhere else in Explorer, drag its Part row onto NPCHomes. If you cannot see it while positioning, temporarily set Transparency to 0.5 and return it to 1 afterward." },
      { title: "Do \u2014 Duplicate the second home marker", actions: ["Select NPC_1_Home in Explorer and press Ctrl+D once.", "Rename the copy exactly NPC_2_Home.", "Confirm it remains under World > NPCHomes.", "Confirm Anchored is true, CanCollide is false, and Transparency is 1.", "Temporarily set Transparency to 0.5, move it directly below NPC_2's starting position, then return Transparency to 1."], checkpoint: "NPCHomes contains exactly NPC_1_Home and NPC_2_Home, each below the matching settler and using the three required values.", recovery: "If both markers are under one settler, select NPC_2_Home and move it below NPC_2. The names and positions must match." },
      { title: "Observe \u2014 Pre-Play checklist", actions: ["Confirm you are still in Edit mode and save the project.", "Expand World > NPCs. Confirm it contains exactly NPC_1 and NPC_2.", "Expand each settler. Confirm Humanoid and HumanoidRootPart are present.", "Select each settler top row. Confirm PrimaryPart = HumanoidRootPart.", "Confirm no unknown Script or LocalScript remains inside either settler.", "Confirm body parts are not anchored and the two settlers do not overlap.", "Expand World > NPCHomes. Confirm exactly NPC_1_Home and NPC_2_Home with Anchored true, CanCollide false, and Transparency 1."], checkpoint: "Every pre-Play check passes. The correct Explorer structure is visible in the Explorer target section below.", recovery: "Do not press Play while a check is wrong. Use the recovery note from the matching step, then repeat this checklist from the top." },
      { title: "Experiment \u2014 Run the M3 Play test", actions: ["Open Output from View > Output or Window > Output, then clear old messages.", "Before clicking Play, predict: both settlers should drop only a tiny amount onto the ground, stay upright, remain separate, and keep all body parts connected.", "Click Play and watch both settlers for at least ten seconds.", "Walk around them once. Confirm neither disappears, breaks apart, falls through the ground, or starts inside the other.", "Success means both complete characters remain standing separately on solid ground. No movement code is required yet.", "Click Stop before making any correction or taking Explorer evidence."], checkpoint: "During Play, NPC_1 and NPC_2 remain upright, separate, complete, and on the island. No red Output error points to Nick's project objects or scripts.", recovery: "If a rig falls, check that no body part is anchored and that the ground is solid. If it breaks apart, replace it with a fresh generated rig. If it disappears or falls through, move it above the ground in Edit mode. If both spawn together, move NPC_2 farther away. If unwanted scripts run, stop and delete only those Script or LocalScript objects." },
      { title: "Fix \u2014 Use the shortest safe recovery", actions: ["Rig falls over: Stop, select the complete Model, place both feet above flat ground, and confirm no body part is anchored.", "Rig breaks into pieces: Stop, delete the whole damaged rig, insert a fresh basic R15 Block Rig, clean it, and duplicate again.", "Rig disappears or falls through: Stop, select its Model in Explorer, press F to find it, and move it back above approved solid ground.", "Rigs begin inside each other: Stop and move NPC_2 sideways until a full character-width gap is visible.", "Unexpected animation or code runs: Stop, expand both Models, and remove only unknown Script or LocalScript objects."], checkpoint: "After any repair, repeat the complete pre-Play checklist and the ten-second Play test.", recovery: "When several things look wrong, replacing one damaged settler with a fresh built-in rig is safer than repairing joints or guessing which character pieces are missing." },
      { title: "Prove \u2014 Capture only the evidence the reviewer needs", actions: ["After a successful Play test, take one screenshot in Play mode showing NPC_1 and NPC_2 standing separately on the island.", "Stop Play. In Explorer, expand World > NPCs, NPC_1, NPC_2, and World > NPCHomes so all required names are visible. Select NPC_1 so Properties shows PrimaryPart, and take a second screenshot of Explorer and Properties together.", "Write one or two sentences about what happened and what was hardest.", "Tick only the three tests you actually completed, and send the mission once."], checkpoint: "The two screenshots and the reflection all describe the same final saved version.", recovery: "If one screenshot cannot show every Explorer row, that's fine \u2014 the Play-mode screenshot and the Explorer/Properties screenshot together are the required evidence, not a single combined image." }
    ],
    mistakes: ["Editing while Play mode is running, so changes disappear after Stop.", "Using a Toolbox statue or free model instead of Studio's built-in character rig.", "Moving one arm, leg, or root part instead of the complete Model top row.", "Leaving NPC_1 or NPC_2 directly under Workspace instead of under World > NPCs.", "Deleting Humanoid, HumanoidRootPart, joints, or body parts while trying to remove scripts.", "Leaving PrimaryPart blank or selecting something other than HumanoidRootPart.", "Anchoring character body parts.", "Creating home markers outside NPCHomes or leaving their default names and values.", "Starting Play with the two settlers overlapping.", "Submitting stale evidence captured before the final repair."],
    tests: [
      { id: "V1-M03-T01", name: "Two valid rigs", setup: "Edit mode", action: "Inspect World > NPCs and both Model properties", expected: "Exactly NPC_1 and NPC_2; each contains Humanoid and HumanoidRootPart; each PrimaryPart is HumanoidRootPart." },
      { id: "V1-M03-T02", name: "Stable play", setup: "Fresh Play with clear Output", action: "Observe both NPCs", expected: "Both remain upright, separate, and on solid ground with no relevant project error." },
      { id: "V1-M03-T03", name: "Home markers", setup: "Edit mode", action: "Inspect World > NPCHomes and marker properties", expected: "Exactly NPC_1_Home and NPC_2_Home; both anchored, non-colliding, invisible, and placed under matching starts." }
    ],
    submission: {
      fields: [
        { key: "explorer_screenshot", type: "screenshot", label: "Explorer screenshot", help: "One screenshot with World > NPCs and World > NPCHomes both expanded, and NPC_1 selected so Properties shows PrimaryPart." },
        { key: "play_screenshot", type: "screenshot", label: "Play-mode screenshot", help: "One screenshot from the final Play test showing both settlers upright, separate, and on the island." },
        { key: "reflection", type: "text", label: "What happened, and what was hardest?", help: "A sentence or two \u2014 what worked, and what part gave you the most trouble." }
      ]
    }
  },
  "V1-M04": {
    "id": "V1-M04",
    "number": 4,
    "title": "Select a Settler",
    "difficulty": "Moderate",
    "objective": "Let the player click either settler and move one visible selection marker between them, remembering which settler will receive the next command.",
    "whyItMatters": "Every future command \u2014 gathering wood, gathering stone, building \u2014 needs to know which settler it is for. This mission builds the one piece of memory and the one visible marker that makes that possible.",
    "startingState": "Mission 3 is approved. Workspace > World > NPCs contains NPC_1 and NPC_2, each a working character with Humanoid and HumanoidRootPart. There is no selection system yet.",
    "visibleResult": "Clicking either settler moves one bright selection marker onto that settler. Switching repeatedly never creates a second marker.",
    "concepts": [
      {
        "name": "ClickDetector",
        "text": "A ClickDetector lets Roblox notice when a player clicks a 3D object. Each settler gets one under its HumanoidRootPart."
      },
      {
        "name": "LocalScript",
        "text": "A LocalScript runs for one player on that player's device. Selection belongs only to the player who clicked, so this mission uses one LocalScript named CommandClient."
      },
      {
        "name": "Variable",
        "text": "A variable is a named place where code remembers one value. The variable selectedNPC remembers which settler should receive the player's next command in a later mission."
      },
      {
        "name": "Event connection",
        "text": "A click is something that happens while the game is running. Roblox calls this an event. Connecting a function to an event tells Roblox what code to run when that event happens."
      },
      {
        "name": "Highlight",
        "text": "A Highlight draws a visible marker around a 3D object. This mission creates one Highlight named SelectedNPCHighlight and moves that same marker between settlers."
      },
      {
        "name": "Enabled",
        "text": "A Highlight has an on/off switch. When it's off, the outline doesn't draw at all \u2014 not around anyone. Roblox calls that switch Enabled. This mission starts the switch off and only turns it on once a settler has actually been picked."
      },
      {
        "name": "Local player state",
        "text": "The currently selected settler is remembered only on this player's device. It is not stored on the server and is not shared with another player."
      },
      {
        "name": "Instance",
        "text": "An object created by code, instead of by hand in Explorer, is called an Instance."
      },
      {
        "name": "Function and argument",
        "text": "A function is a named group of instructions that can be run later. The name written between its parentheses is a value it's given each time it runs \u2014 Luau calls that an argument."
      },
      {
        "name": "Adornee",
        "text": "Adornee means the object a Highlight is currently drawing its outline around."
      }
    ],
    "requiredHierarchy": "Workspace\n\u2514\u2500\u2500 World\n    \u2514\u2500\u2500 NPCs\n        \u251C\u2500\u2500 NPC_1\n        \u2502   \u2514\u2500\u2500 HumanoidRootPart\n        \u2502       \u2514\u2500\u2500 ClickDetector\n        \u2514\u2500\u2500 NPC_2\n            \u2514\u2500\u2500 HumanoidRootPart\n                \u2514\u2500\u2500 ClickDetector\n\nStarterGui\n\u2514\u2500\u2500 CommandGui\n    \u2514\u2500\u2500 CommandClient",
    "code": `-- Ask Roblox for its built-in player system
local Players = game:GetService("Players")

-- Remember which player is using THIS device
local localPlayer = Players.LocalPlayer

-- Find the NPCs folder. WaitForChild waits until it's really there,
-- instead of guessing it has already loaded.
local npcFolder = workspace:WaitForChild("World"):WaitForChild("NPCs")

-- Find the two exact settlers
local npc1 = npcFolder:WaitForChild("NPC_1")
local npc2 = npcFolder:WaitForChild("NPC_2")

-- This is our one "sticky note." It remembers who is selected.
-- Nothing is selected yet, so it starts blank (nil).
local selectedNPC = nil

-- Create the ONE glowing outline we will reuse for every selection.
-- We only ever make this once - never again after this.
local selectionHighlight = Instance.new("Highlight")
selectionHighlight.Name = "SelectedNPCHighlight"
selectionHighlight.FillTransparency = 0.5
selectionHighlight.OutlineTransparency = 0
selectionHighlight.Adornee = nil -- nothing outlined yet
selectionHighlight.Enabled = false -- keep the outline switched off until someone is actually picked
selectionHighlight.Parent = workspace

-- This function runs every time we want to select a settler.
-- "npc" is whichever settler gets handed to it when it's called.
local function selectNPC(npc)
	selectedNPC = npc -- update the sticky note
	selectionHighlight.Adornee = selectedNPC -- move the SAME outline to match
	selectionHighlight.Enabled = true -- switch the outline on now that someone is picked
end

-- This function connects one settler's click to selectNPC above
local function connectNPC(npc)
	local rootPart = npc:WaitForChild("HumanoidRootPart")
	local clickDetector = rootPart:WaitForChild("ClickDetector")

	-- MouseClick is the event that fires when this ClickDetector is clicked.
	-- Connect tells Roblox: "when that happens, run this code."
	clickDetector.MouseClick:Connect(function(playerWhoClicked)
		-- Only react to MY OWN click, not another player's
		if playerWhoClicked ~= localPlayer then
			return
		end

		selectNPC(npc)
	end)
end

-- Set up the click connection for each settler, ONE TIME each
connectNPC(npc1)
connectNPC(npc2)`,
    "steps": [
      {
        "title": "Understand \u2014 Confirm the starting point",
        "actions": [
          "Open your Worldmaker place in Roblox Studio.",
          "In Explorer, check that NPC_1 and NPC_2 are both directly inside Workspace > World > NPCs.",
          "Check that each one contains a Humanoid and a HumanoidRootPart.",
          "Check there is not already a ClickDetector under either root part.",
          "Check StarterGui does not already contain an unfinished CommandGui.",
          "Do not create a command panel, buttons, resources, movement code, or RemoteEvents in this mission \u2014 those belong to later missions."
        ],
        "checkpoint": "Both settlers exist with a Humanoid and HumanoidRootPart, and nothing from this mission has been started yet.",
        "recovery": "If one settler is missing or has no HumanoidRootPart, stop. Mission 3 is not actually finished \u2014 fix that before continuing."
      },
      {
        "title": "Understand \u2014 One sticky note, one moving outline",
        "actions": [
          "Picture one sticky note. Every time you pick a different settler, you cross out the old name and write the new one \u2014 you never grab a second sticky note. That sticky note is a variable, and we're naming it selectedNPC. Right now it's blank. In code, blank is written as nil.",
          "Now picture the glowing outline that will appear around whichever settler is selected. That outline is one object, made only once, called a Highlight.",
          "Instead of drawing a brand new outline every time you click a different settler, the code moves that SAME outline to point at whoever is selected now. The setting that controls 'who it's pointing at right now' is called Adornee.",
          "One more piece: the outline also has its own on/off switch, separate from who it's pointing at. Right now, before anyone has clicked anything, nobody is picked yet \u2014 so the switch starts OFF, and the outline doesn't draw at all. The moment a settler gets picked, the code flips that same switch ON. Roblox calls this switch Enabled.",
          "Put together: one sticky note (the variable) remembers who's picked. One outline (the Highlight) moves to match it, and stays switched off until someone actually is picked. That's the entire idea behind this whole mission."
        ],
        "checkpoint": "You could explain this to someone else using the sticky note, the outline, and its switch, without using the words 'variable', 'Adornee', or 'Enabled' at all.",
        "recovery": "If the sticky note idea doesn't click yet, stop and ask before moving on \u2014 every step after this assumes you've got this part. It's fine to ask again."
      },
      {
        "title": "Understand \u2014 A quick heads-up about naming things",
        "actions": [
          "In a couple of the next steps, Roblox Studio will only let you search for a general kind of object \u2014 like ScreenGui or LocalScript. You'll add that general object first, and then rename it to the exact name this mission needs, like CommandGui or CommandClient.",
          "That's still just ONE object the whole time \u2014 you are not making two different things. You're giving it its real name right after you create it, the same way you might get a blank name tag and then write your name on it."
        ],
        "checkpoint": "You understand that 'insert ScreenGui, then rename it CommandGui' makes one object, not two.",
        "recovery": "If a step below says to search for one name and rename it to another, that's this pattern \u2014 come back and re-read this note."
      },
      {
        "title": "Do \u2014 Add a ClickDetector to NPC_1",
        "actions": [
          "In Explorer, expand Workspace > World > NPCs > NPC_1.",
          "Select HumanoidRootPart inside NPC_1.",
          "Move the mouse over HumanoidRootPart and click the small + button.",
          "Type ClickDetector into the search box and click ClickDetector.",
          "A ClickDetector must sit inside the exact part you want Roblox to notice clicks on \u2014 for a character, that's HumanoidRootPart."
        ],
        "checkpoint": "NPC_1 > HumanoidRootPart contains exactly one ClickDetector, directly underneath it \u2014 not under NPC_1 or NPCs directly.",
        "recovery": "If you created an extra ClickDetector, select the extra one in Explorer and press Delete. Keep exactly one."
      },
      {
        "title": "Do \u2014 Add a ClickDetector to NPC_2",
        "actions": [
          "Repeat the exact same steps for Workspace > World > NPCs > NPC_2 > HumanoidRootPart."
        ],
        "checkpoint": "Both NPC_1 and NPC_2 have exactly one ClickDetector each, directly under their HumanoidRootPart.",
        "recovery": "If either root part has two ClickDetectors, delete the extra one."
      },
      {
        "title": "Do \u2014 Create CommandGui",
        "actions": [
          "In Explorer, move the mouse over StarterGui and click the small + button.",
          "Search for ScreenGui and click it.",
          "Select the new ScreenGui, press F2, and rename it exactly CommandGui.",
          "With CommandGui selected, find ResetOnSpawn in Properties and turn it off (unchecked).",
          "Why: when the player's character respawns later, this GUI and its selection script should not be copied again and create duplicate click connections.",
          "Do not add a Panel, Frame, TextLabel, or button here \u2014 the visible command HUD belongs to Mission 6."
        ],
        "checkpoint": "StarterGui > CommandGui exists, and in Properties, ResetOnSpawn shows false.",
        "recovery": "If StarterGui already contains an unfinished CommandGui from an earlier attempt, delete it and create a fresh one."
      },
      {
        "title": "Do \u2014 Create CommandClient",
        "actions": [
          "Move the mouse over StarterGui > CommandGui and click the small + button.",
          "Search for LocalScript and click it.",
          "Rename the new LocalScript exactly CommandClient.",
          "Before writing any code, check: it is a LocalScript (not a normal Script), it sits directly inside CommandGui, and there is exactly one CommandClient."
        ],
        "checkpoint": "Explorer shows StarterGui > CommandGui > CommandClient, and it is a LocalScript.",
        "recovery": "If it was created as a normal Script instead of a LocalScript, delete it and insert a LocalScript instead \u2014 selection must run on the player's own device, not the server."
      },
      {
        "title": "Do \u2014 Write the complete selection code",
        "actions": [
          "Double-click CommandClient to open it, and delete all default code inside it.",
          "Paste the complete code shown below exactly as written.",
          "Every line that starts with -- is a comment \u2014 Roblox ignores it when running, it's only there to explain that line to you. Read through them once before moving on.",
          "The two functions near the bottom, selectNPC and connectNPC, are the ones doing the sticky-note-and-outline idea from the Understand step. Find them and re-read their comments once you've pasted the code in.",
          "Do not delete the comment lines \u2014 leave them in for now, they don't affect how the code runs."
        ],
        "codeBlocks": [
          {
            "label": "CommandClient \u2014 complete code",
            "code": `-- Ask Roblox for its built-in player system
local Players = game:GetService("Players")

-- Remember which player is using THIS device
local localPlayer = Players.LocalPlayer

-- Find the NPCs folder. WaitForChild waits until it's really there,
-- instead of guessing it has already loaded.
local npcFolder = workspace:WaitForChild("World"):WaitForChild("NPCs")

-- Find the two exact settlers
local npc1 = npcFolder:WaitForChild("NPC_1")
local npc2 = npcFolder:WaitForChild("NPC_2")

-- This is our one "sticky note." It remembers who is selected.
-- Nothing is selected yet, so it starts blank (nil).
local selectedNPC = nil

-- Create the ONE glowing outline we will reuse for every selection.
-- We only ever make this once - never again after this.
local selectionHighlight = Instance.new("Highlight")
selectionHighlight.Name = "SelectedNPCHighlight"
selectionHighlight.FillTransparency = 0.5
selectionHighlight.OutlineTransparency = 0
selectionHighlight.Adornee = nil -- nothing outlined yet
selectionHighlight.Enabled = false -- keep the outline switched off until someone is actually picked
selectionHighlight.Parent = workspace

-- This function runs every time we want to select a settler.
-- "npc" is whichever settler gets handed to it when it's called.
local function selectNPC(npc)
	selectedNPC = npc -- update the sticky note
	selectionHighlight.Adornee = selectedNPC -- move the SAME outline to match
	selectionHighlight.Enabled = true -- switch the outline on now that someone is picked
end

-- This function connects one settler's click to selectNPC above
local function connectNPC(npc)
	local rootPart = npc:WaitForChild("HumanoidRootPart")
	local clickDetector = rootPart:WaitForChild("ClickDetector")

	-- MouseClick is the event that fires when this ClickDetector is clicked.
	-- Connect tells Roblox: "when that happens, run this code."
	clickDetector.MouseClick:Connect(function(playerWhoClicked)
		-- Only react to MY OWN click, not another player's
		if playerWhoClicked ~= localPlayer then
			return
		end

		selectNPC(npc)
	end)
end

-- Set up the click connection for each settler, ONE TIME each
connectNPC(npc1)
connectNPC(npc2)`,
            "explanation": "Every -- line is a comment explaining the line below it. Read them once, then paste the whole block into CommandClient."
          }
        ],
        "checkpoint": "The code matches exactly, with no red underline anywhere in the script, and you've read through the comments at least once.",
        "recovery": "Compare each line against the required code one at a time. A single misspelled name, like NPC1 instead of NPC_1, will stop it from working. If a comment doesn't make sense, ask about that specific line rather than guessing."
      },
      {
        "title": "Do \u2014 Check everything before pressing Play",
        "actions": [
          "Confirm there is only one line declaring selectedNPC.",
          "Confirm the Highlight name is exactly SelectedNPCHighlight.",
          "Confirm the code changes selectionHighlight.Adornee and does not create a new Highlight inside selectNPC.",
          "Confirm selectionHighlight.Enabled is set to false right after the Highlight is created, and set to true inside selectNPC.",
          "Confirm connectNPC(npc1) and connectNPC(npc2) each appear exactly once.",
          "Confirm no temporary print line remains, and no command, resource, movement, or server code was added.",
          "In Explorer, confirm exactly two ClickDetectors total (one per settler), exactly one CommandGui, and exactly one CommandClient \u2014 with no visible command Panel."
        ],
        "checkpoint": "Every item on this checklist passes.",
        "recovery": "Fix whichever checklist item does not match before pressing Play."
      },
      {
        "title": "Observe \u2014 Test the first selection",
        "actions": [
          "Clear Output. Press Play and wait for your character to appear.",
          "Before clicking anything: the screen should look completely normal \u2014 no red tint, no outline around anything at all, neither settler should move, and no command panel should appear.",
          "Click NPC_1 once in the 3D world.",
          "Expected: one Highlight appears around NPC_1, NPC_2 is not highlighted, neither NPC moves, and Output shows no red error from CommandClient.",
          "While still in Play, expand Workspace in Explorer and find exactly one object named SelectedNPCHighlight. Select it \u2014 its Adornee should point to NPC_1."
        ],
        "checkpoint": "NPC_1 is highlighted, nothing else changed, and there's exactly one SelectedNPCHighlight with Adornee = NPC_1.",
        "recovery": "If nothing happens when you click, or the Highlight doesn't appear, go to the Fix step below and match your exact symptom."
      },
      {
        "title": "Observe \u2014 Move the same selection marker",
        "actions": [
          "Without stopping Play, click NPC_2.",
          "Expected: the marker leaves NPC_1 and appears around NPC_2, only one settler is highlighted, Explorer still shows only one SelectedNPCHighlight, and its Adornee now points to NPC_2.",
          "Click NPC_1 again \u2014 the same marker should return to NPC_1."
        ],
        "checkpoint": "The same single marker moves back and forth correctly between both settlers.",
        "recovery": "If a second marker appears, or the marker doesn't move, go to the Fix step below and match your exact symptom."
      },
      {
        "title": "Experiment \u2014 Make the marker softer, then restore it",
        "actions": [
          "Stop Play. Open CommandClient and find the line selectionHighlight.FillTransparency = 0.5.",
          "Predict: a larger transparency number should make the inside color less visible.",
          "Change only that number to 0.8. Press Play and click a settler.",
          "Expected: selection still works, the inside of the Highlight looks fainter, and there's still only one Highlight.",
          "Stop Play. Change the number back to exactly 0.5. Press Play once more and confirm the stronger fill returns."
        ],
        "checkpoint": "Selection still worked at 0.8, and the code is now back to 0.5.",
        "recovery": "If you forget to change it back, compare the line to the required code and fix it before submitting \u2014 do not leave 0.8 in the final version."
      },
      {
        "title": "Fix \u2014 Match your symptom to a recovery",
        "actions": [
          "The whole screen turns red (or looks outlined everywhere) the moment you press Play, before you click anything: selectionHighlight.Enabled is missing or was never set to false. Stop Play, open CommandClient, and confirm selectionHighlight.Enabled = false appears right after the Highlight is created, and selectionHighlight.Enabled = true appears inside selectNPC.",
          "Clicking does nothing: a ClickDetector is likely missing, misplaced, or a name is misspelled. Stop Play, confirm each ClickDetector is directly under the correct HumanoidRootPart, confirm the names World, NPCs, NPC_1, NPC_2 are exact, then check Output for the first red line mentioning CommandClient.",
          "Output says it waited forever for ClickDetector: the ClickDetector is not under the root part the code expects \u2014 move it into HumanoidRootPart directly.",
          `Two markers appear: there's a duplicate CommandClient, a duplicate script, or Instance.new("Highlight") runs more than once. Stop Play, search Explorer for CommandClient and SelectedNPCHighlight, keep only one of each, and confirm Instance.new("Highlight") appears only once in the code and is outside selectNPC.`,
          "Selection works once but switching later fails: check that connectNPC(npc1) and connectNPC(npc2) both appear exactly once, at the bottom of the script \u2014 not inside selectNPC or inside MouseClick.",
          "Selection works before respawn but duplicates afterward: CommandGui.ResetOnSpawn is still true. Stop Play, select StarterGui > CommandGui, and set ResetOnSpawn to false.",
          "Output shows an error mentioning a plugin or a path starting with cloud_: that's likely unrelated Studio noise, not your code. Confirm clicking still works and CommandClient itself has no red error before worrying about it. Don't edit plugin code."
        ],
        "checkpoint": "The specific problem you saw is fixed, and the Observe steps above work again from a fresh Play.",
        "recovery": "If none of these symptoms match what you're seeing, stop and get adult help rather than guessing further."
      },
      {
        "title": "Prove \u2014 Run all four mission tests",
        "actions": [
          "Remove any leftover temporary changes. Confirm the code uses selectionHighlight.FillTransparency = 0.5. Clear Output.",
          "V1-M04-T01 \u2014 Start a fresh Play session, click nothing first. Pass: the screen looks completely normal, no highlight anywhere. Then click NPC_1. Pass: exactly one Highlight appears on NPC_1.",
          "V1-M04-T02 \u2014 In the same session, click NPC_2. Pass: the marker moves to NPC_2, NPC_1 is no longer highlighted, still only one marker.",
          "V1-M04-T03 \u2014 Alternate clicking between both settlers at least five times. Pass: only one Highlight ever exists, it follows every switch, and Output stays free of red errors from your code.",
          "V1-M04-T04 \u2014 Stop Play completely, clear Output, start a fresh Play, and click NPC_2 first. Pass: NPC_2 is selected immediately, still exactly one SelectedNPCHighlight, switching back to NPC_1 still works, and Output stays clean."
        ],
        "checkpoint": "All four tests pass.",
        "recovery": "If a test fails, go back to the matching symptom in the Fix step, repair it, then re-run all four tests from the start."
      }
    ],
    "mistakes": [
      "ClickDetector placed outside HumanoidRootPart, or a duplicate one created.",
      "CommandClient created as a normal Script instead of a LocalScript.",
      "A second Highlight created, or one created inside selectNPC instead of once at the top of the script.",
      "selectionHighlight.Enabled left out or left true before any settler is picked, which highlights the whole screen red on spawn instead of nothing.",
      "connectNPC(npc1) or connectNPC(npc2) missing, duplicated, or placed inside another function.",
      "ResetOnSpawn left true on CommandGui.",
      "The experiment value 0.8 left in the code instead of restored to 0.5.",
      "A Panel, buttons, or resource code added early \u2014 those belong to later missions."
    ],
    "tests": [
      {
        "id": "V1-M04-T01",
        "name": "Select first",
        "setup": "Play with no selection",
        "action": "Click NPC_1",
        "expected": "Before the click, the screen looks completely normal with no highlight anywhere. After the click, exactly one Highlight appears on NPC_1."
      },
      {
        "id": "V1-M04-T02",
        "name": "Move selection",
        "setup": "Continue T01",
        "action": "Click NPC_2",
        "expected": "Same marker moves to NPC_2; NPC_1 no longer highlighted."
      },
      {
        "id": "V1-M04-T03",
        "name": "No duplication",
        "setup": "Continue",
        "action": "Alternate clicks at least five times",
        "expected": "Only one Highlight exists and Output stays clean."
      },
      {
        "id": "V1-M04-T04",
        "name": "Fresh restart",
        "setup": "Stop and Play again",
        "action": "Click NPC_2 first",
        "expected": "Selection works after restart without duplicated connections."
      }
    ],
    "submission": {
      "fields": [
        {
          "key": "screenshot_npc1",
          "type": "screenshot",
          "label": "Screenshot \u2014 after clicking NPC_1",
          "help": "Click NPC_1 once in the 3D world, then take one screenshot. The Highlight should be around NPC_1."
        },
        {
          "key": "screenshot_npc2",
          "type": "screenshot",
          "label": "Screenshot \u2014 after clicking NPC_2",
          "help": "Without stopping Play, click NPC_2, then take one screenshot. The same marker should now be around NPC_2, not NPC_1."
        },
        {
          "key": "screenshot_after_switches",
          "type": "screenshot",
          "label": "Screenshot \u2014 after five clicks back and forth",
          "help": "Alternate clicking both settlers a few more times. Take one screenshot with Explorer expanded so only one SelectedNPCHighlight is visible."
        },
        {
          "key": "code",
          "type": "text",
          "label": "CommandClient code",
          "help": "Open CommandClient, select all its code, copy, and paste it here."
        },
        {
          "key": "reflection",
          "type": "text",
          "label": "What happened, and what was hardest?",
          "help": "A sentence or two \u2014 what worked, and what part gave you the most trouble."
        }
      ]
    }
  }
};
var STATIC_MISSION_ORDER = ["V1-M01", "V1-M02", "V1-M03", "V1-M04"];
var DEFAULT_WORLD_STATE = `Missions completed and approved: Studio Ready (V1-M01), Build the Island
(V1-M02), Add Two Settlers (V1-M03), and Select a Settler (V1-M04) are all approved.
Current state of Nick's actual Roblox place: Workspace > World contains Ground
(MainGround, Obstacle), PlayerSpawn, BuildSite, NPCs (NPC_1, NPC_2 - full rigs with
Humanoid/HumanoidRootPart/PrimaryPart set, each with a ClickDetector under
HumanoidRootPart), NPCHomes (NPC_1_Home, NPC_2_Home), Resources (empty, not started),
Buildings (empty, not started). ServerScriptService > WorldServer still only prints
readiness, no gameplay logic yet. StarterGui > CommandGui (ResetOnSpawn = false) >
CommandClient (LocalScript) implements local NPC selection: clicking either settler
moves one reusable Highlight (SelectedNPCHighlight) between them, using Enabled to
keep it off until a settler is actually picked (Highlight.Adornee = nil does not mean
nothing is highlighted, it highlights everything in view - this was a real bug in the
original mission code, fixed by giving the Highlight its own Enabled on/off switch).
Evidence note on V1-M04: T01 and T02 were verified working via screenshots. T03 and
T04 were not independently verified with distinct evidence. Approved on Alex's manual
check in Studio after the fix, given the lesson's own defect. Treat switching-under-
repetition and restart-safety for selection as plausible but not independently
confirmed when planning anything that builds on it.
No RemoteEvents, GameState values, resource nodes, or server/client command split
exist yet - selection is currently purely a client-side visual with no effect on
shared game state.`;
async function ensureSeeded(env) {
  const row = await env.DB.prepare("SELECT COUNT(*) AS c FROM missions").first();
  if (row && row.c > 0) return;
  const seedMeta = {
    "V1-M01": { status: "approved", approved_at: "2026-07-05T00:00:00.000Z", capability_key: null },
    "V1-M02": { status: "approved", approved_at: "2026-07-10T00:00:00.000Z", capability_key: null },
    "V1-M03": { status: "approved", approved_at: "2026-07-13T00:00:00.000Z", capability_key: "two_settlers" },
    "V1-M04": { status: "approved", approved_at: "2026-07-24T16:07:59.000Z", capability_key: "select_settler" }
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
__name(ensureSeeded, "ensureSeeded");
__name2(ensureSeeded, "ensureSeeded");
__name22(ensureSeeded, "ensureSeeded");
__name222(ensureSeeded, "ensureSeeded");
async function getWorldState(env) {
  const row = await env.DB.prepare("SELECT narrative FROM world_state WHERE id = 1").first();
  return row ? row.narrative : DEFAULT_WORLD_STATE;
}
__name(getWorldState, "getWorldState");
__name2(getWorldState, "getWorldState");
__name22(getWorldState, "getWorldState");
__name222(getWorldState, "getWorldState");
async function setWorldState(env, narrative) {
  await env.DB.prepare(
    "INSERT INTO world_state(id, narrative, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET narrative = excluded.narrative, updated_at = excluded.updated_at"
  ).bind(narrative).run();
}
__name(setWorldState, "setWorldState");
__name2(setWorldState, "setWorldState");
__name22(setWorldState, "setWorldState");
__name222(setWorldState, "setWorldState");
async function logEvent(env, kind, message) {
  await env.DB.prepare("INSERT INTO events(kind, message) VALUES (?, ?)").bind(kind, message).run();
}
__name(logEvent, "logEvent");
__name2(logEvent, "logEvent");
__name22(logEvent, "logEvent");
__name222(logEvent, "logEvent");
async function getAllMissions(env) {
  const rows = await env.DB.prepare("SELECT * FROM missions ORDER BY number ASC").all();
  return rows.results.map((r) => ({ ...JSON.parse(r.content_json), status: r.status, approved_at: r.approved_at, capability_key: r.capability_key }));
}
__name(getAllMissions, "getAllMissions");
__name2(getAllMissions, "getAllMissions");
__name22(getAllMissions, "getAllMissions");
__name222(getAllMissions, "getAllMissions");
async function getMission(env, id) {
  const row = await env.DB.prepare("SELECT * FROM missions WHERE id = ?").bind(id).first();
  if (!row) return null;
  return { ...JSON.parse(row.content_json), status: row.status, approved_at: row.approved_at, capability_key: row.capability_key };
}
__name(getMission, "getMission");
__name2(getMission, "getMission");
__name22(getMission, "getMission");
__name222(getMission, "getMission");
async function getCurrentMission(env) {
  const row = await env.DB.prepare("SELECT * FROM missions WHERE status = 'active' ORDER BY number DESC LIMIT 1").first();
  if (!row) return null;
  return { ...JSON.parse(row.content_json), status: row.status, approved_at: row.approved_at, capability_key: row.capability_key };
}
__name(getCurrentMission, "getCurrentMission");
__name2(getCurrentMission, "getCurrentMission");
__name22(getCurrentMission, "getCurrentMission");
__name222(getCurrentMission, "getCurrentMission");
async function saveDynamicMission(env, missionObj) {
  await env.DB.prepare(
    "INSERT INTO missions(id, number, title, status, capability_key, content_json) VALUES (?, ?, ?, 'active', ?, ?)"
  ).bind(missionObj.id, missionObj.number, missionObj.title, missionObj.capability_key || null, JSON.stringify(missionObj)).run();
}
__name(saveDynamicMission, "saveDynamicMission");
__name2(saveDynamicMission, "saveDynamicMission");
__name22(saveDynamicMission, "saveDynamicMission");
__name222(saveDynamicMission, "saveDynamicMission");
async function approveMission(env, id) {
  await env.DB.prepare("UPDATE missions SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();
}
__name(approveMission, "approveMission");
__name2(approveMission, "approveMission");
__name22(approveMission, "approveMission");
__name222(approveMission, "approveMission");
async function nextSubmissionAttempt(env, missionId) {
  const row = await env.DB.prepare("SELECT COUNT(*) AS c FROM submissions WHERE mission_id = ?").bind(missionId).first();
  return (row?.c || 0) + 1;
}
__name(nextSubmissionAttempt, "nextSubmissionAttempt");
__name2(nextSubmissionAttempt, "nextSubmissionAttempt");
__name22(nextSubmissionAttempt, "nextSubmissionAttempt");
__name222(nextSubmissionAttempt, "nextSubmissionAttempt");
async function saveSubmission(env, { id, missionId, attempt, fields, understanding, verdict, feedback }) {
  await env.DB.prepare(
    "INSERT INTO submissions(id, mission_id, attempt_number, fields_json, understanding_answer, verdict, feedback_json) VALUES (?,?,?,?,?,?,?)"
  ).bind(id, missionId, attempt, JSON.stringify(fields), understanding || null, verdict, JSON.stringify(feedback)).run();
}
__name(saveSubmission, "saveSubmission");
__name2(saveSubmission, "saveSubmission");
__name22(saveSubmission, "saveSubmission");
__name222(saveSubmission, "saveSubmission");
async function recordSkills(env, concepts, missionId) {
  for (const c of concepts) {
    await env.DB.prepare(
      "INSERT INTO skills(concept_name, explained_fully, taught_in_mission, note) VALUES (?,1,?,?) ON CONFLICT(concept_name) DO UPDATE SET explained_fully = 1, taught_in_mission = excluded.taught_in_mission"
    ).bind(c.name, missionId, c.text).run();
  }
}
__name(recordSkills, "recordSkills");
__name2(recordSkills, "recordSkills");
__name22(recordSkills, "recordSkills");
__name222(recordSkills, "recordSkills");
async function capabilitiesWithStatus(env) {
  const missions = await getAllMissions(env);
  const byKey = {};
  for (const m of missions) if (m.capability_key) byKey[m.capability_key] = m;
  let seenCurrent = false;
  return CAPABILITIES.map((cap) => {
    const m = byKey[cap.key];
    let status = "future";
    if (m && m.status === "approved") status = "done";
    else if (m && m.status === "active") {
      status = "current";
      seenCurrent = true;
    } else if (!seenCurrent && !m) {
      status = "current";
      seenCurrent = true;
    }
    return { ...cap, status, missionId: m ? m.id : null, missionTitle: m ? m.title : null };
  });
}
__name(capabilitiesWithStatus, "capabilitiesWithStatus");
__name2(capabilitiesWithStatus, "capabilitiesWithStatus");
__name22(capabilitiesWithStatus, "capabilitiesWithStatus");
__name222(capabilitiesWithStatus, "capabilitiesWithStatus");
var ASSET_FILES = { "styles.css": STYLES_CSS, "landing.css": LANDING_CSS, "lesson-components.css": LESSON_CSS };
var PUBLIC_PATHS = /* @__PURE__ */ new Set(["/", "/login", "/logout"]);
function html(body, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}
__name(html, "html");
__name2(html, "html");
__name22(html, "html");
__name222(html, "html");
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}
__name(json, "json");
__name2(json, "json");
__name22(json, "json");
__name222(json, "json");
function redirect(location, extraHeaders = {}) {
  return new Response(null, { status: 302, headers: { location, ...extraHeaders } });
}
__name(redirect, "redirect");
__name2(redirect, "redirect");
__name22(redirect, "redirect");
__name222(redirect, "redirect");
var index_default = {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
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
        if (!env.SITE_PASSWORD) return html(loginPage({ error: "Server isn't configured with a site password yet \u2014 set the SITE_PASSWORD secret." }), 500);
        if (!checkPassword(password, env)) return html(loginPage({ error: "That password isn't right. Try again." }), 401);
        const cookie = await makeSessionCookie(env);
        return redirect("/hq", { "set-cookie": cookie });
      }
      if (path === "/logout") {
        return redirect("/", { "set-cookie": clearSessionCookie() });
      }
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
        return await handleSubmit(request, env);
      }
      if (path === "/api/help" && request.method === "POST") {
        return await handleHelp(request, env);
      }
      if (path === "/api/chat" && request.method === "POST") {
        return await handleChat(request, env);
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
__name(fileToImageBlock, "fileToImageBlock");
__name2(fileToImageBlock, "fileToImageBlock");
__name22(fileToImageBlock, "fileToImageBlock");
__name222(fileToImageBlock, "fileToImageBlock");
async function handleSubmit(request, env) {
  const missionId = request.headers.get("x-mission-id");
  const mission = missionId && await getMission(env, missionId);
  if (!mission) return json({ error: "Unknown mission." }, 404);
  if (mission.status === "approved") return json({ error: "This mission is already approved." }, 409);
  const form = await request.formData();
  const fieldList = mission.submission?.fields || [];
  const fields = {};
  const labeledImages = [];
  for (const f of fieldList) {
    if (f.type === "screenshot") {
      const file = form.get(f.key);
      const hasFile = file && typeof file === "object" && file.size > 0;
      fields[f.key] = hasFile ? "[screenshot attached, see below]" : "";
      if (hasFile) {
        const block = await fileToImageBlock(file);
        if (block) labeledImages.push({ label: f.label, block });
      }
    } else {
      fields[f.key] = String(form.get(f.key) || "").trim();
    }
  }
  const understanding = null;
  const missingRequired = fieldList.filter((f) => !fields[f.key]).map((f) => f.label);
  if (missingRequired.length) {
    return json({ error: `Fill in before submitting: ${missingRequired.join(", ")}` }, 400);
  }
  const textFieldsOnly = {};
  for (const f of fieldList) if (f.type !== "screenshot") textFieldsOnly[f.key] = fields[f.key];
  const userContent = [{ type: "text", text: `Submitted fields:
${JSON.stringify(textFieldsOnly, null, 2)}

${labeledImages.length} screenshot(s) attached, each labeled below with the exact requirement it's meant to prove.` }];
  for (const { label, block } of labeledImages) {
    userContent.push({ type: "text", text: `Screenshot \u2014 ${label}:` });
    userContent.push(block);
  }
  const raw = await callClaude(env, {
    model: env.MODEL_STRONG,
    system: gradingSystemPrompt(mission),
    messages: [{ role: "user", content: userContent }],
    maxTokens: 2e3
  });
  const review = extractJson(raw);
  const attempt = await nextSubmissionAttempt(env, mission.id);
  await saveSubmission(env, {
    id: crypto.randomUUID(),
    missionId: mission.id,
    attempt,
    fields,
    understanding,
    verdict: review.verdict === "approved" ? "approved" : "needs_work",
    feedback: review
  });
  await logEvent(env, "submission", `${mission.id} (${mission.title}) \u2014 attempt ${attempt} \u2014 ${review.verdict}. ${review.parent_note || ""}`);
  if (review.verdict === "approved") {
    await approveMission(env, mission.id);
    await recordSkills(env, mission.concepts || [], mission.id);
    const state = await getWorldState(env);
    await setWorldState(env, `${state}

Update: ${mission.id} (${mission.title}) approved. Visible result now true: ${mission.visibleResult}`);
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
__name(handleSubmit, "handleSubmit");
__name2(handleSubmit, "handleSubmit");
__name22(handleSubmit, "handleSubmit");
__name222(handleSubmit, "handleSubmit");
async function planNextMission(env) {
  const already = await getCurrentMission(env);
  if (already) return already;
  const worldState = await getWorldState(env);
  const skillsRows = await env.DB.prepare("SELECT concept_name, taught_in_mission, note FROM skills").all();
  const caps = await capabilitiesWithStatus(env);
  const allMissions = await getAllMissions(env);
  const nextNumber = Math.max(...allMissions.map((m) => m.number)) + 1;
  const context = `Current world state and skills record:
${worldState}

Skills already fully taught (only remind briefly, don't re-teach): ${JSON.stringify(skillsRows.results)}

Capability status: ${JSON.stringify(caps.map((c) => ({ key: c.key, title: c.title, status: c.status })))}

The next mission should be numbered ${nextNumber}, with id "V1-M${String(nextNumber).padStart(2, "0")}".`;
  const raw = await callClaude(env, {
    model: env.MODEL_STRONG,
    system: planningSystemPrompt(),
    messages: [{ role: "user", content: context }],
    maxTokens: 8e3
  });
  const mission = extractJson(raw);
  const validCapKeys = new Set(CAPABILITIES.map((c) => c.key));
  if (mission.capability_key && !validCapKeys.has(mission.capability_key)) mission.capability_key = null;
  mission.id = `V1-M${String(nextNumber).padStart(2, "0")}`;
  mission.number = nextNumber;
  let qaIssues = [];
  try {
    const qaRaw = await callClaude(env, {
      model: env.MODEL_STRONG,
      system: qaSystemPrompt(),
      messages: [{ role: "user", content: JSON.stringify(mission) }],
      maxTokens: 8e3
    });
    const qaResult = extractJson(qaRaw);
    if (qaResult.mission && qaResult.mission.id) {
      qaResult.mission.id = mission.id;
      qaResult.mission.number = mission.number;
      Object.assign(mission, qaResult.mission);
    }
    qaIssues = Array.isArray(qaResult.issues_found) ? qaResult.issues_found : [];
  } catch (qaErr) {
    console.error("QA pass failed:", qaErr);
    await logEvent(env, "qa_error", `QA pass on ${mission.id} failed to run (${String(qaErr.message || qaErr)}) -- mission was saved WITHOUT an automated QA check. Review it by hand before Nick reaches it.`);
  }
  await saveDynamicMission(env, mission);
  if (qaIssues.length > 0) {
    await logEvent(env, "qa_fix", `QA pass on ${mission.id} found and fixed ${qaIssues.length} issue(s) before it was saved: ${qaIssues.join(" | ")}`);
  } else {
    await logEvent(env, "qa_pass", `QA pass on ${mission.id} found no issues.`);
  }
  await logEvent(env, "plan", `Planned ${mission.id}: ${mission.title}`);
  return mission;
}
__name(planNextMission, "planNextMission");
__name2(planNextMission, "planNextMission");
__name22(planNextMission, "planNextMission");
__name222(planNextMission, "planNextMission");
async function handleHelp(request, env) {
  const body = await request.json();
  const mission = await getMission(env, body.mission_id);
  if (!mission) return json({ error: "Unknown mission." }, 404);
  const step = (mission.steps || []).find((s) => s.title === body.step_title);
  const hint = await callClaude(env, {
    model: env.MODEL_FAST,
    system: helpSystemPrompt(mission, body.step_title || "(unspecified step)"),
    messages: [{ role: "user", content: step ? `The step's own instructions:
${JSON.stringify(step)}` : "Give a general nudge for this mission." }],
    maxTokens: 400
  });
  await logEvent(env, "help", `Help requested on ${mission.id}, step: ${body.step_title}`);
  return json({ hint });
}
__name(handleHelp, "handleHelp");
__name2(handleHelp, "handleHelp");
__name22(handleHelp, "handleHelp");
__name222(handleHelp, "handleHelp");
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
__name(handleChat, "handleChat");
__name2(handleChat, "handleChat");
__name22(handleChat, "handleChat");
__name222(handleChat, "handleChat");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map