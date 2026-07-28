# Help-Chat Precedent — Resolved Judgment Calls

## Precedent 1 — V1-M06 mechanical placement question (2026-07-27)

Nick asked where his pathfinding code was supposed to go, after the lesson's
own instructions contradicted themselves about it. The reply explained why the
code was misplaced but never stated where it belonged.

Correct handling: this is a placement question. State the anchor directly in
the first sentence: "The walkTo function goes above your OnServerEvent
handler — right after the line that finds npcFolder. The call goes inside the
handler, right after your confirmation print line."
