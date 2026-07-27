# Nick // Worldmaker v2 — Design Decisions

**Status:** Permanent project-source document, supersedes the fixed mission-sequence
sections of the original Charter (v1). Where this document and the original Charter
disagree, this document wins. Where this document is silent, the original Charter's
sections on the game concept, canonical object hierarchy, and gameplay constants still
apply — those haven't changed, only how missions get planned and delivered has.

---

## 1. Why this exists

Nick's homeschool platform freed up real time. Worldmaker uses part of it for a
self-paced project Nick actually owns. It must not become a second version of the
pacing problem it was meant to escape — including via one adult (the parent) spending
hours fighting the *system* meant to teach Nick, instead of Nick spending that time
building.

## 2. What Nick is building

A first-person civilization game: the player starts with two settlers and grows a
settlement — commands, gathering, construction, and eventually population, threats,
and rivals. The near-term goal (formerly "Version 1") is the first complete command
loop: select a settler, send it to gather Wood or Stone, watch resources total up,
unlock and build one hut, reset cleanly. The canonical object names, gameplay
constants (Wood +2/trip, Stone +1/trip, hut cost 6 Wood + 3 Stone, etc.), and
Explorer hierarchy from the original Charter are still the source of truth for these
facts — reuse them rather than re-deriving them.

## 3. Who it's for, and the ownership rule

Nick is 11, an intelligent native English speaker, genuinely new to Roblox Studio and
Luau. Nick writes and tests the real code. AI support explains, teaches, and reviews
— it does not write Nick's code for him or take ownership of the build.

## 4. How lessons get planned (this is the main change from v1)

There is no fixed, pre-written mission list anymore. Instead, an AI planner decides
each next lesson dynamically, using:
- the game concept above, as the destination;
- a running record of what Nick has actually already learned and built (see §7);
- a loose checklist of what a complete first version needs (select → command →
  gather → build → reset) — a destination to steer toward, not a script to follow
  step-by-step.

The planner should keep lessons building toward a complete, playable game, but is
free to reorder, combine, split, or add a lesson the original fixed plan didn't have,
if that's what actually fits how Nick is progressing.

## 5. Showing Nick the goal and his progress toward it

Nick needs to see the whole path, not just what's next — that's genuinely motivating
for an 11-year-old and worth preserving from the old site. It can't be a grid of 15
pre-named missions anymore, because future mission titles don't exist until the
planner writes them. Show it using the game's own outcome capabilities instead —
these are stable and fully specified regardless of how many lessons any of them
takes to teach:

1. Two settlers exist in the world
2. Select a settler
3. Send it a Wood or Stone command
4. It walks to the correct resource
5. Gather and return home
6. Shared resource totals grow
7. Construction unlocks at the correct cost
8. Build the first hut
9. Restart the world cleanly
10. Prove it in Studio, then publish

Show each as a card in the same visual style as the current mission grid. Completed
capabilities are marked done and click back to the real saved lesson that taught them
(per §8 — never a claim about which mission number taught it). The capability Nick is
actively working on is marked current, using its plain description even before that
lesson has been written. Everything after that shows as its real future capability,
not a placeholder mission title or count. This survives the planner reordering,
splitting, or combining lessons, because the capability list describes the finished
game, not the teaching chunks — it doesn't change even when the lesson plan does.

Past this list, the longer-term vision (population growth, threats, rivals, and
beyond) stays exactly as vague as it is today — an aspirational horizon on the front
page, not an itemized list. Don't itemize what isn't designed yet.

## 6. How a lesson gets written

Every lesson must be written to the **Beginner Lesson and Evidence Standard**
(separate document, still fully authoritative — it is a living document and does get
revised; check its own contents rather than assuming it matches an earlier reading of
it) — plain-English explanation before any technical term, one new idea introduced at
a time, a visible result stated up front, concrete recovery steps for likely
mistakes, minimal evidence requested at the end.

Two separate things are worth matching in `mission-lessons.js` (Mission 3) and the
Mission 4 lesson, and they are not the same bar:

- **Teaching shape and tone** — the Understand → Do → Observe → Experiment → Fix →
  Prove flow, plain English before jargon, concrete checkpoints and recovery steps.
  M3 and M4 are the concrete bar for this, and stay the bar regardless of any future
  edit to either file's specific content.
- **Evidence field shape** — what Nick actually submits at the end. This is governed
  entirely by the Standard document's own evidence-set rule (§16.1 as of this
  writing), not by copying whatever fields M3 or M4 happen to contain. M3 and M4 are
  currently examples that comply with that rule, but the rule is the source of truth,
  not the examples — if the rule changes again later, update the examples to match
  it, not the other way around.

## 7. The running skills record

The system keeps an automatically-updated record of every concept Nick has actually
been taught and proven, not just what a plan says he should know. New lessons should
introduce genuinely new concepts in full, and only briefly remind him of concepts
already on record — this is what keeps later lessons from becoming exhausting even as
the game grows more complex.

## 8. Reopening a lesson after it's approved

Once a lesson is written and shown to Nick, save that generated text permanently —
do not regenerate it later if he reopens it. If he goes back to an approved mission
to recall something (how he added a ClickDetector, what a specific line of code did),
he should see the exact same lesson he actually learned from, not a fresh AI rewrite
that might word it differently the second time. This matters specifically because
lessons are now planned and written dynamically instead of being fixed files that
already sit on disk — without saving each one the first time it's written, there
would be nothing to reopen at all. This is lesson content, not evidence or review
history, so it doesn't conflict with §15's "no audit trail" — keep the lesson text
itself, not a log of every attempt or every past AI review.

## 9. Progress still gates

Nick must submit real proof that a lesson's result actually works — following the
evidence set defined in the Beginner Lesson and Evidence Standard §16.1 — and which
tests passed, before the AI plans his next lesson. This is not optional and not
softened by the move to dynamic planning: the point is still that Nick understands
and proves what he built, not that he accumulates lessons.

## 10. Getting help

Two ways, both AI-based: a quick "Help" button scoped to whatever step Nick is
currently on, and an open chat for anything else. Neither writes Nick's code for him
— both explain, ask questions, and point him toward the fix.

## 11. Your (parent) role

Once a day, a report: what Nick did, whether it passed, what the AI told him, and
anything worth attention. Pull-based — you check it on your schedule, nothing pushes
notifications at you. You are not expected to translate developer language, diagnose
beginner mistakes yourself, or manually verify the AI's technical judgment call by
call — that's what the daily check is for.

## 12. Login and security

One shared password for the whole site. No per-user accounts, no roles, no session
infrastructure beyond what's needed to keep that one password gated. This is a
deliberate simplicity choice, not an oversight — there is no sensitive data at stake
that justifies more than that.

## 13. Visual design

Keep the current look and feel exactly — dark theme, the existing color palette and
layout language (see the attached `styles.css`, `lesson-components.css`, and
`landing.css`). This project is a systems and content rebuild, not a redesign.

## 14. Budget

Real but small — API calls for planning, writing, grading, hints, and chat should
comfortably fit a few dollars to roughly fifteen dollars a month at Nick's actual
usage level. Prefer a cheaper/faster model for small jobs (quick hints) and a
stronger model for anything that requires real judgment (planning, writing, grading,
open chat).

## 15. What NOT to build

No fixed fifteen-mission list. No formal multi-status evaluator workflow
(NOT_SUBMITTED / NEEDS_EVIDENCE / etc.) beyond a simple pass/needs-more-work
distinction, unless it turns out to be genuinely needed. No audit-log/closure-report
paperwork trail. No per-user accounts. If a piece of infrastructure doesn't directly
serve Nick learning, building, and proving his work — or you getting your daily
report — leave it out.