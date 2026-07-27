# Known Roblox Engine Behaviors — Worldmaker QA Log

Check this file before searching. Add a new entry every time this skill's Step 4
surfaces a previously-unknown quirk. Keep entries short: what the code looks like,
what actually happens, what the fix is, which lesson it came from.

---

## Highlight.Adornee left nil highlights everything, not nothing

**Where it showed up:** `mission-lessons-m04.js` (V1-M04, "Select a Settler")

**The code:**
```lua
local selectionHighlight = Instance.new("Highlight")
selectionHighlight.Adornee = nil -- nothing outlined yet
selectionHighlight.Parent = workspace
```

**What the comment implies:** Nothing is highlighted until `Adornee` is set to an
NPC.

**What Roblox actually does:** A `Highlight` with `Adornee = nil` does not render
nothing — it highlights every applicable object it can currently see, effectively
tinting/outlining the whole visible scene. This is a documented, reported Roblox
engine behavior (confirmed via the Roblox Developer Forum), not a bug in Nick's
project code.

**Symptom this produces:** Whole screen renders solid-colored (red, in this case)
with heavy outline artifacts the moment the script runs — before any player
click — and it corrects itself the instant `Adornee` is reassigned to a specific
Instance (e.g., on first NPC click).

**The fix:** Don't leave `Adornee` at `nil` while the Highlight is parented
somewhere it can affect the whole scene (e.g., `workspace`). Either:
- Set `Adornee` to a real, harmless placeholder Instance immediately (before any
  player action), or
- Set `Highlight.Enabled = false` until the first real selection is made, then
  set both `Adornee` and `Enabled = true` together in `selectNPC`.

**Verified:** via Roblox Developer Forum thread on Highlight/Adornee nil behavior,
during a July 2026 QA review of V1-M04.

---

## New GuiObjects all default to the same Position and Size — siblings overlap

**Where it showed up:** V1-M05 ("Send a Command"), while writing the lesson — caught
by this skill's own Step 1 before the lesson was ever served to Nick, not after.

**The code / lesson text:** Original instructions had Nick insert two TextButtons
(`GatherWoodButton`, `GatherStoneButton`) into the same Frame with no Position or
Size given, on the reasoning that "position, color, and layout can be improved
later."

**What Roblox actually does:** Every freshly-inserted `GuiObject` (Frame,
TextButton, etc.) gets the same class-default `Position` (`{0,0},{0,0}`, the
top-left corner of its parent) and the same default `Size` regardless of creation
order. Two sibling buttons left at their defaults land exactly on top of each
other — same spot, same size — and only the topmost actually receives clicks.

**Symptom this would have produced:** One of the two gather buttons silently does
nothing when clicked, with no error in Output, because it's rendered but not
receiving input — the other button is on top of it.

**The fix:** Never leave two sibling interactive GuiObjects both at default
Position. Give each an explicit, different Position (and Size) as part of the
lesson's own instructions — plain typed values in Properties are enough at this
lesson's beginner level; a UIListLayout is unnecessary complexity for two buttons.

**Verified:** via Roblox Creator Hub docs on GuiObject Position/Size (UDim2
defaults), during a July 2026 QA review of V1-M05, run retroactively after the
mission had already been published without going through this skill first — the
skill's Step 1 (trace every property the visible result depends on) is what
surfaced it. Lesson was corrected before Nick reached this step.