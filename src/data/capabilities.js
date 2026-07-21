// Design doc §5: Build HQ shows Nick's path using these ten fixed game
// capabilities, never a grid of mission numbers. This list doesn't change even
// when the lesson plan does — only which mission satisfies which capability does.
// `key` is stored on a mission row (missions.capability_key) once that mission is
// the one that actually delivers this capability. Missions that are pure setup
// (M1, M2) intentionally have no capability_key and don't get their own card.

export const CAPABILITIES = [
  { key: "two_settlers", order: 1, icon: "🧍", title: "Two settlers exist in the world" },
  { key: "select_settler", order: 2, icon: "👆", title: "Select a settler" },
  { key: "send_command", order: 3, icon: "📜", title: "Send it a Wood or Stone command" },
  { key: "walk_to_resource", order: 4, icon: "🚶", title: "It walks to the correct resource" },
  { key: "gather_return", order: 5, icon: "🪵", title: "Gather and return home" },
  { key: "totals_grow", order: 6, icon: "📈", title: "Shared resource totals grow" },
  { key: "construction_unlocks", order: 7, icon: "🔓", title: "Construction unlocks at the correct cost" },
  { key: "build_hut", order: 8, icon: "🏠", title: "Build the first hut" },
  { key: "restart_clean", order: 9, icon: "🔄", title: "Restart the world cleanly" },
  { key: "prove_publish", order: 10, icon: "🚀", title: "Prove it in Studio, then publish" }
];
