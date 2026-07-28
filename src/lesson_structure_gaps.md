# Lesson Structure Gaps — Known Incidents

Log every incident where a mission's step text described what code *does*
instead of giving Nick a literal, placeable instruction.

## Incident 1 — V1-M06, "Walk to the Resource" (2026-07-27)

What happened: the step's action text said the walk code goes "inside the
handler," its own checkpoint said "near the top" (i.e. above the handler) —
contradicting itself — and no code block ever showed the actual call.

Rule this produced: Gate 2 item 9 — every code-introducing step must state a
concrete insertion anchor, and that anchor must not contradict the step's own
checkpoint text.
