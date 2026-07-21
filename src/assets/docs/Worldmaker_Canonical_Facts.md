# Worldmaker — Canonical Object Hierarchy and Gameplay Constants

**Status:** Facts only. This file exists to answer one question: "what is this object
actually called, and what are the real numbers?" It does not cover teaching process,
lesson format, or planning logic — those live in the other project files. If you're
tempted to add process or history here, it belongs in Worldmaker_v2_Design_Decisions.md
instead.

---

## Canonical target object hierarchy

This is the complete target shape for the current game (the first full command loop).
Nick's actual current progress toward it is tracked separately, in
Nick_Current_Progress.md — that file says what's really built so far; this file says
what the finished names and locations are.

```text
Workspace
└── World (Folder)
    ├── Ground (Folder)
    ├── NPCs (Folder)
    │   ├── NPC_1 (Model)
    │   │   ├── Humanoid
    │   │   ├── HumanoidRootPart
    │   │   └── ClickDetector
    │   └── NPC_2 (Model)
    │       ├── Humanoid
    │       ├── HumanoidRootPart
    │       └── ClickDetector
    ├── NPCHomes (Folder)
    │   ├── NPC_1_Home (Part)
    │   └── NPC_2_Home (Part)
    ├── Resources (Folder)
    │   ├── WoodNode (Model)
    │   │   └── TargetPoint (Part)
    │   └── StoneNode (Model)
    │       └── TargetPoint (Part)
    ├── Buildings (Folder)
    └── BuildSite (Part)

ReplicatedStorage
├── Remotes (Folder)
│   ├── CommandNPC (RemoteEvent)
│   ├── BuildHut (RemoteEvent)
│   ├── ResetWorld (RemoteEvent)
│   └── StatusMessage (RemoteEvent)
└── GameState (Folder)
    ├── Wood (IntValue)
    ├── Stone (IntValue)
    └── HutBuilt (BoolValue)

ServerStorage
└── Templates (Folder)
    └── HutTemplate (Model)

ServerScriptService
└── WorldServer (Script)

StarterGui
└── CommandGui (ScreenGui)
    ├── Panel (Frame)
    │   ├── SelectedNPCLabel (TextLabel)
    │   ├── WoodLabel (TextLabel)
    │   ├── StoneLabel (TextLabel)
    │   ├── HutCostLabel (TextLabel)
    │   ├── StatusLabel (TextLabel)
    │   ├── GatherWoodButton (TextButton)
    │   ├── GatherStoneButton (TextButton)
    │   ├── BuildHutButton (TextButton)
    │   └── ResetWorldButton (TextButton)
    └── CommandClient (LocalScript)
```

## Canonical gameplay constants and rules

- Starting state: exactly two settlers, 0 Wood, 0 Stone, no hut.
- Wood award: **+2** per successful Wood trip.
- Stone award: **+1** per successful Stone trip.
- Hut cost: **6 Wood + 3 Stone**.
- Only one live hut may exist at a time. It is `Workspace/World/Buildings/FirstHut`,
  cloned from `ServerStorage/Templates/HutTemplate`.
- Resource nodes are unlimited — no depletion.
- A resource is awarded only after an NPC successfully reaches the correct resource
  target, not on command alone.
- Each NPC runs one command at a time; different NPCs can work simultaneously.
- Selection is local to each player.
- Shared resources, construction state, busy state, and live world changes are
  server-owned. The client may request an action but never awards resources, creates
  the hut, or sets shared truth directly.
- A reset must restore resources, hut state, NPC positions, busy state, selection, and
  the HUD — and must prevent any job started before the reset from awarding resources
  after it (a generation token is the canonical way to guard this).

## Canonical code ownership

- **Server** (`ServerScriptService/WorldServer`) owns: command validation, pathfinding
  execution, busy-state decisions, resource awards, construction checks and spending,
  hut creation, shared reset behavior, protection against stale jobs.
- **Client** (`StarterGui/CommandGui/CommandClient`) owns: local NPC selection, the
  local selection Highlight, button input, sending requests to the server, showing
  server responses, reading replicated resource totals, updating the HUD, clearing
  local selection after reset.
- The rule in one line: **the client asks, the server checks and decides, the client
  displays the result.**
