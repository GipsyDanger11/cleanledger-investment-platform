/** API / legacy: founders are stored as `startup`. `founder` is allowed on User for parity. */
export function isFounderRole(role) {
  return role === 'startup' || role === 'founder';
}
