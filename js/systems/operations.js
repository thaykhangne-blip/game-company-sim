
export const OFFICE_UPGRADES = [
  { id: "workspace", name: "Improved Workspace", description: "Better desks, meeting rooms and collaboration spaces.", cost: 45_000, monthlyCost: 2_000, morale: 5 },
  { id: "wellbeing", name: "Employee Wellbeing", description: "Health allowance and regular team activities.", cost: 35_000, monthlyCost: 3_500, morale: 9 },
  { id: "equipment", name: "Production Equipment", description: "Workstations and tools for the creative teams.", cost: 65_000, monthlyCost: 1_500, morale: 2 }
];

export function purchaseOfficeUpgrade(state, upgradeId) {
  const upgrade = OFFICE_UPGRADES.find(item => item.id === upgradeId);
  if (!upgrade) return { ok: false, reason: "Upgrade not found." };
  if (state.office.upgrades.includes(upgradeId)) return { ok: false, reason: "This upgrade is already installed." };
  if (state.finance.cash < upgrade.cost) return { ok: false, reason: "Insufficient cash for this upgrade." };

  state.finance.cash -= upgrade.cost;
  state.finance.monthlyOverhead += upgrade.monthlyCost;
  state.office.upgrades.push(upgradeId);
  state.employees.forEach(employee => {
    employee.morale = Math.min(100, employee.morale + upgrade.morale);
  });
  log(state, `${upgrade.name} installed. Cash spent: $${upgrade.cost.toLocaleString("en-US")}.`, "operations");
  return { ok: true, upgrade };
}

export function applyMonthlyWorkforceEffects(state) {
  // Small morale recovery keeps the workforce responsive without turning morale into a free resource.
  state.employees.forEach(employee => {
    if (employee.morale < 100) employee.morale = Math.min(100, employee.morale + 1);
    employee.experience += 1;
  });
}
function log(state, message, type = "system") {
  state.log.unshift({ type, message });
  state.log = state.log.slice(0, 12);
}
