---
name: worldmaker-lesson-qa
description: Mandatory QA pass for Nick's Worldmaker Roblox/Luau lessons. Use this before marking any new or edited lesson code "ready to serve," before answering in the in-mission Help chat about a bug or unexpected behavior Nick reports, and before grading any submission. Also use whenever writing or reviewing any lesson code that creates an Instance, sets a property, or leaves a value at nil/default/empty, since an unverified default is exactly the class of bug this skill exists to catch. Do not skip this because a lesson seems simple or a property's behavior seems obvious — obvious-looking defaults are precisely what slipped through last time.
---

# Worldmaker Lesson QA

## Why this exists

The official Mission 4 code (`mission-lessons-m04.js`) set `Highlight.Adornee = nil`
meaning "nothing highlighted yet." Roblox's actual engine behavior is that a nil
`Adornee` highlights *everything* in the scene — a real, documented quirk, confirmed
on the Roblox Developer Forum. It painted Nick's whole screen red on spawn.

Neither the in-Studio Help chat nor the grader caught it. Both reasoned from the
code's comments and intent ("nil means nothing is selected, so it shouldn't do
anything") instead of checking what Roblox actually does. The grader even wrote,
in its feedback, "Adornee is nil, so it should not be highlighting anything red" —
restating the same wrong assumption as a fact.

This skill exists to make the actual check automatic, every time, for every AI pass
that touches a lesson — lesson-writing, the Help chat, and grading alike.

## When to use this

- Before marking any new or edited lesson code "ready to serve" (the final version
  Nick will actually see)
- Before responding in the in-mission Help chat to any bug or unexpected-behavior
  report from Nick
- Before approving or requesting changes on any submission
- Any time you're writing new lesson code that creates an Instance, sets a
  property, or leaves something at nil/default/empty

## Step 1 — Trace every property; don't trust the comment

For every property or object state the lesson's own visible-result sentence depends
on, trace it through three real moments:

1. Immediately after creation, before any player action
2. Immediately before the first player action the lesson describes
3. Immediately after that first player action

At each moment, ask what the Roblox engine actually does with that value — not what
the comment or variable name implies it means. `selectionHighlight.Adornee = nil
-- nothing outlined yet` is a comment describing intent, not a description of
engine behavior, and here it was wrong.

If you are not fully certain — and "this looks obviously right" does not count as
certain — check `references/known-engine-behaviors.md` first, then verify with a
live search of Roblox's official docs (create.roblox.com/docs) and the Developer
Forum (devforum.roblox.com) before asserting behavior in lesson code, a Help
response, or grading feedback. Any claim of the shape "X should have no effect
because it's nil/empty/default" needs verification before it gets written down —
that exact claim was wrong last time.

## Step 2 — Re-run the Standard's actual gates

Open `Beginner_Lesson_and_Evidence_Standard.md` and go through Gates 1–8 explicitly,
one at a time, against the specific lesson in front of you — don't rely on memory of
what they generally require. Gate 1 (Technical correctness) specifically includes
the property-tracing check from Step 1: "the code compiles" and "tests pass" are
not the same claim as "it behaves the way the lesson's visible-result sentence
says it will."

## Step 3 — Confirm every test maps to actual, provable evidence

Before marking any mission's lesson content "ready to serve" — hand-written or
dynamically planned — check that every entry in that mission's `tests[]` array is
provable from what `submission.fields[]` actually lets the learner submit. This
check exists because V1-M05 shipped with a `tests[]` array and a
`submission.fields[]` array that were never explicitly linked: the grader
reasonably inferred each test needed its own dedicated evidence, demanded a
screenshot field that didn't exist, and rejected Nick three times over evidence he
had no way to provide.

For each test ID, confirm one of the following, explicitly, in the mission data
itself — never leave it to be inferred later by a grader or by Nick:

- a dedicated submission field exists that proves that test on its own, or
- the mission data states which existing field jointly proves it, and how — e.g.
  "field X proves both T01 and T02: T01 by absence (the invalid click must add no
  line), T02 by presence (the two valid lines appear)."

Also check the reverse direction: no submission field should exist that isn't
tied to a real test purpose — an unlinked field is its own beginner-burden
problem under §16's minimal-evidence rule.

If a test is meant to be proven by absence (nothing should appear, nothing should
change), the mission data must say so in those terms, and the learner-facing field
help text must tell Nick what he's looking at and why the one screenshot covers
both cases — not just when to take it.

This is a Gate 1 (technical correctness) and Gate 4 (submission clarity) concern
together. A mission can be code-correct and still fail this check if the grader
and the learner have no shared, explicit account of which evidence proves which
requirement.

## Step 4 — For grading specifically, check evidence against §16.1 exactly

Before approving or requesting changes on a submission:

- Confirm the submitted evidence matches the Standard's §16.1 fixed evidence set —
  no more fields, no fewer, and each one actually present and actually showing what
  it claims to.
- If a screenshot is claimed to prove a specific test (e.g. "after five alternating
  clicks"), confirm it isn't a duplicate or reused image from an earlier step —
  same camera angle plus same on-screen state is a strong signal it's stale, not
  fresh proof.
- Don't write a behavior claim ("X should have no effect," "this shouldn't matter")
  into feedback without having verified it per Step 1 first.
- If a submission is rejected for missing evidence, confirm first that the
  evidence being requested actually has a field it can go in per Step 3 — never
  ask Nick to submit something the form has no place for.

## Step 4a — Nick-perspective execution trace

In addition to the gate checks above, read through the mission step by step as
Nick would, using only what he has actually been taught in prior *approved*
missions (`Nick_Current_Progress.md`) and nothing else. At each step, state
plainly whether Nick could complete it without guessing. If any step requires
knowledge, an object, or a prior script state that hasn't actually been
established for him, fail the gate and name the missing prerequisite.

## Step 5 — Log new engine findings

If this pass surfaces a previously-unknown engine quirk, add it to
`references/known-engine-behaviors.md` so future passes don't have to rediscover
it. Check that file first, before searching, in case the quirk in front of you is
already on record.
