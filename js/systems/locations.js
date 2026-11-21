export const LOCATIONS = [
  { id: "home", name: "Home Office", cost: 0, monthlyCost: 0, capacity: 3, description: "A spare room, a laptop and an unreasonable amount of ambition." },
  { id: "shared", name: "Shared Workspace", cost: 45_000, monthlyCost: 2_500, capacity: 8, description: "A proper desk, meeting rooms and room for a small team." },
  { id: "studio", name: "Small Studio", cost: 125_000, monthlyCost: 7_500, capacity: 20, description: "Your first dedicated studio with space to collaborate." },
  { id: "office", name: "Company Office", cost: 350_000, monthlyCost: 18_000, capacity: 45, description: "A permanent headquarters built for a growing company." }
];

export function upgradeLocation(state, locationId) {
  const currentIndex = LOCATIONS.findIndex(item => item.id === state.location.id);
  const next = LOCATIONS.find(item => item.id === locationId);
  if (!next || LOCATIONS.indexOf(next) !== currentIndex + 1) {
    return { ok: false, reason: "You can only upgrade to the next location tier." };
  }
  if (state.finance.cash < next.cost) return { ok: false, reason: "Insufficient cash for this location upgrade." };
  state.finance.cash -= next.cost;
  state.finance.monthlyOverhead += next.monthlyCost - state.location.monthlyCost;
  state.location = { id: next.id, name: next.name, monthlyCost: next.monthlyCost, capacity: next.capacity };
  state.log.unshift({ type: "operations", message: `Moved into ${next.name}. Monthly premises cost is now $${next.monthlyCost.toLocaleString("en-US")}.` });
  state.log = state.log.slice(0, 12);
  return { ok: true, location: next };
}

export function getNextLocation(state) {
  const index = LOCATIONS.findIndex(item => item.id === state.location.id);
  return LOCATIONS[index + 1] || null;
}
