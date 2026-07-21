// Server-rendered HTML only — no client framework, no build step for the frontend.
// Matches styles.css / lesson-components.css for every page except the front page,
// which uses landing.css the same way the original site did.
//
// Honest caveat, so nobody assumes more than is true: the project's knowledge base
// only contained the *CSS* for the original front page, not its HTML/JS (the
// animated island demo, the stage-track click handlers, confetti, etc). The markup
// below uses the same landing.css classes and palette so the look and feel matches,
// but the original page's interactive demo widget was not something I ever had the
// source for, so it isn't reproduced move-for-move — see the deploy checklist.

function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function shell({ title, active, body, extraHead = "" }) {
  const nav = [
    ["/hq", "Build HQ"],
    ["/parent", "Parent Report"]
  ];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} — Worldmaker</title>
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

export function loginPage({ error } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sign in — Worldmaker</title>
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

export function landingPage() {
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
      <span class="eyebrow"><span class="pulse-dot"></span> Self-paced · AI-planned</span>
      <h1>Build a<span class="gradient">civilization</span>game.</h1>
      <p class="hero-copy">A first-person settlement game, built one real lesson at a time in Roblox Studio — <strong>select a settler, send it to gather, watch resources grow, build the first hut, reset it clean.</strong></p>
      <div class="hero-punch">
        <span class="chip"><b>+2</b> Wood / trip</span>
        <span class="chip"><b>+1</b> Stone / trip</span>
        <span class="chip"><b>6 Wood + 3 Stone</b> per hut</span>
      </div>
      <div class="actions">
        <a class="btn btn-primary btn-hq" href="/hq">Enter Build HQ</a>
      </div>
      <p class="access-note">One shared password gets you in — ask whoever set this up if you don't have it.</p>
    </div>
    <div class="world-shell">
      <div class="world-frame">
        <div class="game-top">
          <div class="mini-title">WORLDMAKER</div>
          <div class="resources"><div class="resource">🪵 Wood</div><div class="resource">🪨 Stone</div></div>
        </div>
        <div class="world-map">
          <div class="ground-glow"></div>
          <div class="island"></div>
          <div class="river"></div>
          <div class="node tree t1">🌲</div>
          <div class="node tree t2">🌲</div>
          <div class="node tree t3">🌲</div>
          <div class="node rock">🪨</div>
          <div class="node flag">🚩</div>
          <div class="npc n1">‌</div>
          <div class="npc n2">‌</div>
        </div>
      </div>
    </div>
  </section>

  <section id="roadmap">
    <div class="section-head">
      <span class="kicker">The build</span>
      <h2>Ten things this game has to do</h2>
      <p class="section-copy">Not fifteen fixed lessons — ten real outcomes. Whatever it takes to get from one to the next is planned as it's needed.</p>
    </div>
    <div class="value-grid">
      <div class="value-card"><div class="value-icon">🧍</div><h3>Two settlers</h3><p>They exist, stand safely, and are ready to move.</p></div>
      <div class="value-card"><div class="value-icon">👆</div><h3>Select and command</h3><p>Click a settler, send it to gather.</p></div>
      <div class="value-card"><div class="value-icon">🏠</div><h3>Build and reset</h3><p>Grow resources, build the first hut, reset the world cleanly.</p></div>
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

export function hqPage({ capabilities, currentMission, approvedCount }) {
  const cards = capabilities.map((cap) => {
    const cls = cap.status === "done" ? "approved" : "";
    const statusLabel = cap.status === "done" ? "Done" : cap.status === "current" ? "In progress" : "Not started";
    const statusClass = cap.status === "done" ? "status-approved" : cap.status === "current" ? "status-under-review" : "status-locked";
    const inner = `
      <div class="mission-number">CAPABILITY ${String(cap.order).padStart(2, "0")}</div>
      <h3>${cap.icon} ${esc(cap.title)}</h3>
      <p>${cap.missionTitle ? esc(cap.missionTitle) : "Not planned yet."}</p>
      <span class="status ${statusClass}">${statusLabel}</span>`;
    return cap.missionId
      ? `<a class="mission-node ${cls}" href="/lesson/${encodeURIComponent(cap.missionId)}">${inner}</a>`
      : `<div class="mission-node locked">${inner}</div>`;
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

function conceptCard(c) {
  return `<div class="concept"><b>${esc(c.name)}.</b> ${esc(c.text)}</div>`;
}

function stepCard(step, index) {
  const actions = step.actions.map((a) => `<li>${esc(a)}</li>`).join("");
  const codeBlocks = (step.codeBlocks || []).map(
    (cb) => `<p><strong>${esc(cb.label)}</strong></p><pre class="code-block">${esc(cb.code)}</pre>${cb.explanation ? `<p class="field-help">${esc(cb.explanation)}</p>` : ""}`
  ).join("");
  return `<details class="step-card" ${index === 0 ? "open" : ""}>
  <summary>Step ${index + 1} — ${esc(step.title)}</summary>
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

export function lessonPage({ mission, submitResult, missionAvailable, notice }) {
  const codeBlock = mission.code ? `<h3>Starting code reference</h3><pre class="code-block">${esc(mission.code)}</pre>` : "";
  const steps = mission.steps.map(stepCard).join("");
  const tests = mission.tests.map((t) => `
    <div class="test-card">
      <strong>${esc(t.id)} — ${esc(t.name)}</strong>
      <dl><dt>Setup</dt><dd>${esc(t.setup)}</dd><dt>Action</dt><dd>${esc(t.action)}</dd><dt>Expected</dt><dd>${esc(t.expected)}</dd></dl>
    </div>`).join("");
  const fields = (mission.submission?.fields || []).map((f) => `
    <div class="field">
      <label for="f_${esc(f.key)}">${esc(f.label)}</label>
      <textarea id="f_${esc(f.key)}" name="${esc(f.key)}"></textarea>
      <small>${esc(f.help)}</small>
    </div>`).join("");
  const imageField = `
    <div class="field">
      <label for="f_image">Optional: attach one screenshot</label>
      <input type="file" id="f_image" name="image" accept="image/png,image/jpeg" />
      <small>PNG or JPEG. Used as visual evidence alongside the text above.</small>
    </div>`;
  const understanding = mission.submission?.understanding
    ? `<div class="field"><label for="f_understanding">${esc(mission.submission.understanding)}</label><textarea id="f_understanding" name="understanding"></textarea></div>`
    : "";

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
<div class="detail-layout">
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
  </div>
  <div class="sidebar-sticky">
    <div class="form-card card" id="submitCard">
      ${alreadyApproved ? `<div class="callout"><strong>Approved.</strong> This mission is done — you're just looking back at it. <a href="/hq">Back to Build HQ</a></div>` : `
      <h2>Submit this mission</h2>
      <form id="submitForm" class="form-grid" enctype="multipart/form-data">
        ${fields}
        ${imageField}
        ${understanding}
        <div class="form-actions">
          <button type="submit" class="button button-primary" id="submitBtn">Submit for review</button>
        </div>
      </form>`}
      <div id="feedbackBox"></div>
    </div>
    <div class="form-card card">
      <h2>Ask a question</h2>
      <div id="chatLog" style="max-height:260px;overflow:auto;display:grid;gap:8px;"></div>
      <form id="chatForm" class="form-grid" style="margin-top:10px;">
        <textarea id="chatInput" placeholder="Ask anything about this mission..." style="min-height:70px;"></textarea>
        <div class="form-actions"><button type="submit" class="button button-secondary">Ask</button></div>
      </form>
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
if (submitFormEl) submitFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.textContent = "Reviewing...";
  const fd = new FormData(e.target);
  let data;
  try {
    const res = await fetch("/api/submit", { method: "POST", body: fd, headers: { "x-mission-id": MISSION_ID } });
    data = await res.json();
  } catch (err) {
    btn.disabled = false; btn.textContent = "Submit for review";
    alert("Something went wrong reaching the server. Try again.");
    return;
  }
  btn.disabled = false;
  btn.textContent = "Submit for review";
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
</script>`
  });
}

export function parentReportPage({ events, missionSummaries }) {
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
      <span class="muted">${m.approved_at ? new Date(m.approved_at).toLocaleDateString() : "—"}</span>
    </div>`).join("");

  return shell({
    title: "Parent Report",
    active: "/parent",
    body: `
<div class="page-hero"><div><span class="eyebrow">Pull-based, on your schedule</span><h1>Parent Report</h1><p class="lead">What Nick did, whether it passed, and anything worth attention. Nothing is pushed to you — check this whenever you like.</p></div></div>
<div class="section"><div class="section-head"><h2>Missions</h2></div><div class="progress-list">${missions || '<div class="empty">Nothing yet.</div>'}</div></div>
<div class="section"><div class="section-head"><h2>Recent activity</h2></div><div class="attempt-list">${rows}</div></div>`
  });
}
