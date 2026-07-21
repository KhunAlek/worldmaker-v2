# Nick // Worldmaker
## Beginner Lesson and Evidence Standard

**Status:** Permanent project-source document  
**Purpose:** Define the required learner-facing writing, recovery, evidence, and human-review standard for every Worldmaker mission.

---

## 1. Core rule

A mission is not ready for Nick merely because:

- the code is correct;
- automated tests pass;
- canonical names and test IDs are present;
- the evaluator can understand the lesson;
- the required technical terms appear;
- the lesson has the correct headings.

A learner-facing mission is ready only when Nick can follow it from beginning to end without repeated adult translation, hidden assumptions, or routine parent-led debugging.

Beginner usability is a release requirement equal to:

- code correctness;
- evaluator correctness;
- acceptance-test coverage;
- unlock safety;
- learner-state safety.

An unclear mission must remain unreleased.

---

## 2. Learner profile

Nick is:

- 11 years old;
- a native English speaker;
- intelligent and capable;
- new to Roblox Studio;
- new to Luau;
- motivated by visible playable results;
- not expected to understand developer terminology before it is taught.

Instructions must be clear without being childish or patronising.

---

## 3. Permanent lesson sequence

Every mission must follow this learning flow:

**Understand → Do → Observe → Experiment → Fix → Prove**

These are section organizers, not complete instructions.

The text under each section must still explain the actual action in concrete language.

The project must not optimize for:

**Read specification → Copy code → Collect evidence → Submit**

The project must optimize for:

**Understand the idea → Build something visible → See what happens → Try one safe change → Repair mistakes → Prove it works**

---

## 4. Required lesson structure

Every learner-facing mission must include the following.

### 4.1 Visible mission result

Start with one sentence describing what Nick will see or be able to do when finished.

Example:

> When you finish, clicking NPC_1 will place one bright outline around it.

Avoid abstract openings such as:

> Implement local NPC selection.

---

### 4.2 Exact starting state

State what should already exist before Nick begins.

Include:

- required folders;
- required objects;
- required scripts;
- current values;
- what must not exist yet.

When useful, show the expected Explorer structure.

---

### 4.3 One new idea at a time

Explain only the concepts needed for the next action.

Do not introduce several new Roblox or Luau ideas in one paragraph when they can be separated.

---

### 4.4 Guided action

For every important action, the lesson must state:

1. **Where to look**
   - Explorer;
   - Properties;
   - Script Editor;
   - Output;
   - 3D world;
   - Play controls;
   - GUI.

2. **What to open or select**
   - exact object name;
   - exact script path;
   - exact service or folder.

3. **What to click, type, move, rename, or change**
   - no abstract task label.

4. **Why Nick is doing it**
   - ordinary English before the technical term.

5. **What should appear afterward**
   - exact visible checkpoint.

6. **What must not happen**
   - no duplicate object;
   - no wrong location;
   - no red project-code error;
   - no later-mission behavior;
   - no unwanted resource change.

7. **What to check when the result differs**
   - one concrete recovery action.

8. **How to restore temporary experiments**
   - remove temporary Parts;
   - remove temporary prints;
   - restore renamed objects;
   - restore test values;
   - remove test code.

---

## 5. First-use interface rule

The first time Nick uses any Roblox Studio interface action, the lesson must explain it fully.

Examples:

- opening Explorer;
- opening Properties;
- inserting an object;
- using the small `+` button;
- renaming an object;
- changing a property;
- opening a Script;
- pressing Play;
- stopping Play;
- clearing Output;
- taking a screenshot;
- expanding Explorer branches.

A first-use instruction should look like this:

> In Explorer, move your mouse over `ServerScriptService`. Click the small `+` button that appears. Choose `Script`. A new Script appears underneath it. Rename it to `WorldServer`.

It must not look like this:

> Create `WorldServer` in `ServerScriptService`.

---

## 6. Ordinary explanation before technical vocabulary

Explain the ordinary idea first and introduce the technical term second.

Examples:

> Roblox tries to calculate a route around obstacles. This built-in tool is called `PathfindingService`.

> The route is divided into small destinations. Roblox calls them waypoints.

> The function gives back `true` when the full walk succeeds and `false` when it must stop safely. This is the function’s return value.

The following words must not appear for the first time without immediate explanation:

- hierarchy;
- nesting;
- parent;
- child object;
- instance;
- server;
- client;
- property;
- argument;
- function;
- event;
- RemoteEvent;
- replicated;
- state;
- asynchronous;
- waypoint;
- path status;
- authoritative;
- validation;
- regression;
- generation token.

No new technical term should be required to understand the sentence that introduces it.

---

## 7. Forbidden instruction style

These phrases may not be used as complete learner instructions:

- “Create the canonical structure.”
- “Paste the hierarchy.”
- “Validate the instance.”
- “Check the object path.”
- “Create the handler.”
- “Get PathfindingService.”
- “Check success.”
- “Follow the waypoints.”
- “Protect later-mission work.”
- “Run canonical tests.”
- “Submit evidence.”
- “Debug the problem.”
- “Fix the architecture.”

They may appear only after the exact action has already been explained in child-readable language.

---

## 8. Required checkpoints

After every meaningful action, the lesson must provide an immediate checkpoint.

Examples:

> Your Explorer should now show:

```text
ServerScriptService
└── WorldServer
```

> In Properties, `Anchored` should now show a check mark.

> In Output, you should see exactly one line saying `VERSION 1 SERVER READY`.

Checkpoints must show both:

- what should appear;
- what should not appear.

---

## 9. Before-writing, before-running, and after-running checks

Every coding mission must include three separate checks.

### 9.1 Before writing code

Confirm:

- correct Script type;
- correct location;
- correct object name;
- no duplicate Script;
- no old default code that should be removed.

### 9.2 Before running

Confirm:

- no unfinished temporary line;
- no extra test code;
- no duplicate object;
- expected Explorer structure is visible;
- temporary experiments are either intentional or already restored.

### 9.3 After running

Explain:

- what should happen in the 3D world;
- what should happen in the HUD;
- what should appear in Output;
- what must not happen;
- exactly what to inspect when the result differs.

---

## 10. Mistake prevention and recovery

Every mission must anticipate likely beginner mistakes.

Use this pattern:

**Symptom → likely cause → exact next check → recovery**

Example:

> **Symptom:** Output shows `Hello world!` twice.  
> **Likely cause:** An extra Script still exists.  
> **Check:** In Explorer, look under `Workspace` and `ServerScriptService`.  
> **Recovery:** Delete the extra Script, keep only `ServerScriptService > WorldServer`, then press Play again.

Recovery instructions must not say only:

- “try again”;
- “debug it”;
- “check your code”;
- “fix the hierarchy.”

---

## 11. Script and object audits

When duplicate or misplaced objects are a realistic risk, the lesson must include an audit before Play.

A Script audit may require Nick to confirm:

- exactly one intended Script exists;
- it has the correct name;
- it is in the correct service;
- there is no Script directly under `Workspace`;
- no old Script still prints `Hello world!`;
- no duplicate `CommandClient` exists.

An object audit may require Nick to confirm:

- exact required names;
- correct parent folder;
- no duplicate TargetPoint;
- no temporary obstacle remains;
- no later-mission object was introduced early.

---

## 12. Safe experiment rule

Every mission should include one small, controlled experiment when appropriate.

The experiment must:

- change one thing;
- have a clear predicted result;
- be safe;
- be reversible;
- include exact restoration instructions.

The lesson must not leave temporary objects, test values, prints, or code behind.

---

## 13. Project errors versus unrelated Studio or plugin noise

The lesson and evaluator must distinguish three categories.

### 13.1 Nick’s project code

Examples:

- `WorldServer`;
- `CommandClient`;
- project-owned ModuleScripts;
- paths inside the canonical game hierarchy.

### 13.2 Old or extra project scripts

Examples:

- `Workspace.Script`;
- duplicate `Hello world!` scripts;
- accidental extra LocalScripts;
- copied test code left behind.

### 13.3 Studio or plugin noise

Examples:

- paths beginning with `cloud_`;
- plugin names;
- unrelated packages;
- errors from code Nick did not create and that is outside the project.

Rules:

- Do not tell Nick to repair unrelated plugin code.
- Do not fail a mission solely because unrelated plugin noise exists.
- Confirm whether Nick’s required project behavior worked.
- Give separate cleanup advice when plugin noise interferes with testing.
- Use `BLOCKED_NEEDS_HELP` only when the external issue prevents reliable testing.

---

## 14. Evidence standard

Evidence must prove the mission without becoming repetitive clerical work.

Preferred evidence forms:

1. Explorer or Properties screenshot;
2. complete relevant code;
3. current Output;
4. short video for movement, repeated action, timing, concurrency, or reset;
5. guided checklist;
6. short understanding answer when genuinely useful.

Manual hierarchy transcription is not the preferred learner workflow.

Prefer:

> Take one screenshot with these Explorer folders expanded.

Do not prefer:

> Paste the object hierarchy.

---

## 15. Submission wording

Submission instructions must tell Nick exactly:

- what to capture;
- where to find it;
- what must be visible;
- whether it should be a screenshot, video, copied text, or code;
- what temporary items must be removed first;
- what happens after submission.

Good examples:

- “Take one screenshot with `Workspace > World > Resources` expanded.”
- “Copy the current Output lines from this Play test.”
- “Record a short video showing the NPC walk to Wood.”
- “Show that Wood and Stone totals did not increase.”
- “Remove `M8_TemporaryBlock` before taking the final screenshot.”

Avoid evaluator language such as:

- canonical evidence;
- hierarchy evidence;
- proof mapping;
- runtime artifact;
- evaluator bundle.

---

## 16. Minimal-evidence rule

Do not ask Nick to prove the same requirement several times without a clear reason.

One screenshot or video may prove several requirements when all necessary details are visible.

For early missions, use the smallest complete submission possible.

Mission 1 is normally limited to:

- complete `WorldServer` code;
- one Explorer screenshot;
- one Output screenshot or copied Output;
- one short understanding answer when useful.

---

## 17. Understanding questions

Use an understanding question only when it genuinely helps verify ownership or the central idea.

Rules:

- Ask after Nick has seen the behavior.
- Ask one question, not a quiz.
- A rough but sensible answer is enough.
- Imperfect English or wording does not fail a working mission.
- Do not ask abstract questions only to create more evidence.
- Do not use the question as punishment for strong AI help.

---

## 18. Human beginner-usability review

For challenging missions, automated checks are necessary but not sufficient.

Before release, a human reviewer must answer:

> Could Nick follow this lesson from beginning to end without repeated adult translation or unexplained technical assumptions?

The reviewer should perform the lesson while assuming:

- no prior Roblox Studio knowledge;
- no prior Luau knowledge;
- no knowledge of Explorer;
- no knowledge of developer terminology.

Every hesitation must be documented and fixed.

When the whole teaching flow is unclear, rebuild the lesson as a whole. Do not treat a whole-lesson failure as minor wording polish.

---

## 19. Mistake-path review

Before release, the reviewer should deliberately test likely beginner mistakes, including where relevant:

- object created in the wrong place;
- wrong object type;
- default code left behind;
- duplicate object;
- duplicate Script;
- syntax error;
- wrong property;
- blocked route;
- temporary object not removed;
- unrelated plugin noise.

The lesson must provide a usable recovery path for each likely failure.

---

## 20. Motivation check

A mission must produce a visible or meaningful result before requiring a large amount of invisible setup.

The lesson should keep the game result central:

- “the NPC reached the tree”;
- “the selection outline moved”;
- “the hut appeared”;
- “the world reset cleanly.”

Avoid framing progress mainly as:

- completing lesson steps;
- collecting evidence;
- satisfying the evaluator;
- finishing setup paperwork.

---

## 21. Parent-burden check

A mission must not require the parent to:

- translate developer language;
- diagnose ordinary beginner errors without guidance;
- inspect architecture;
- rewrite Nick’s scripts;
- manually convert Explorer into text;
- determine whether an error belongs to a plugin or project without support;
- perform routine Studio actions for Nick.

Adult help is appropriate for:

- account and privacy decisions;
- publishing eligibility;
- security settings;
- restoring a damaged project from backup;
- human beginner-usability review.

---

## 22. Release gates

No mission may be released until all applicable gates pass.

### Gate 1 — Technical correctness

- canonical names preserved;
- mission boundaries preserved;
- acceptance tests match;
- evaluator fields match;
- unlock logic preserved;
- no later-mission behavior introduced early.

### Gate 2 — First-time-user usability

- all first-use actions explained;
- no unexplained technical term;
- no hidden interface assumption;
- every important action has a checkpoint.

### Gate 3 — Mistake recovery

- likely wrong paths tested;
- exact recovery guidance exists;
- temporary experiments are restored.

### Gate 4 — Submission clarity

- Nick knows exactly what to provide;
- evidence is minimal and sufficient;
- no evaluator-only language appears.

### Gate 5 — Motivation

- the mission produces a visible or meaningful result;
- setup does not bury the payoff.

### Gate 6 — Parent burden

- routine completion does not require Alex to translate or debug.

### Gate 7 — Regression safety

- website navigation works;
- mission locks work;
- progress storage works;
- hint levels work;
- review rendering works;
- parent view works;
- approval and unlock flow work.

### Gate 8 — Human review when required

- challenging lesson passed the human beginner-usability question.

---

## 23. Definition of “ready for Nick”

A mission is ready only when:

- Nick can complete it without repeated parent translation;
- every unfamiliar term is explained before use;
- every first-time interface action is demonstrated;
- every important action has a visible checkpoint;
- likely mistakes are prevented or recoverable;
- temporary experiments have exact cleanup instructions;
- evidence requirements are concrete and minimal;
- project errors are distinguished from plugin noise;
- the mission produces a meaningful result;
- all technical and website systems remain intact;
- required human review has passed.

“Technically complete” is not enough.

---

## 24. Source relationships

Use this document together with:

- `Worldmaker_Project_Charter_and_Canonical_Contract.md`
- `Version_1_Mission_Contracts.md`
- `Version_1_Acceptance_Test_Specification.md`
- `AI_Evaluator_Policy_and_Mission_Rubrics.md`
- `AI_Evaluator_Response_Schema.md`
- the current project tracker

Authority:

- The charter controls project purpose, canonical architecture, constants, ownership, and source authority.
- Mission contracts control mission-specific technical boundaries.
- Acceptance tests control exact test behavior and proof.
- Evaluator policy controls review decisions and hints.
- The response schema controls machine-readable output.
- This document controls learner-facing wording, usability, recovery, evidence wording, and human beginner review.
- The current tracker controls actual project, release, repository, and learner state.
