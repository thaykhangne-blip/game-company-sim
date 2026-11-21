import {
  SAVE_KEY, STARTING_CASH, STARTING_REPUTATION,
  STARTING_DEPARTMENTS, MONTHLY_OVERHEAD
} from "../data/config.js";
import { createStartingRoster, syncDepartments } from "../systems/people.js";

export function createCompany(setup) {
  const state = {
    version: 2,
    company: { ...setup },
    calendar: { year: setup.foundingYear, month: 1, monthCount: 0 },
    finance: {
      cash: STARTING_CASH, companyValue: 2_400_000,
      revenueThisMonth: 0, expensesThisMonth: 0,
      totalRevenue: 0, totalExpenses: 0,
      monthlyOverhead: MONTHLY_OVERHEAD
    },
    reputation: STARTING_REPUTATION,
    departments: STARTING_DEPARTMENTS.map(department => ({ ...department })),
    employees: createStartingRoster(),
    office: { upgrades: [] },
    project: null,
    log: [{ type: "system", message: "Company established. Your first month begins now." }]
  };
  syncDepartments(state);
  return state;
}

export function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn("Could not save simulation state:", error);
    return false;
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const state = JSON.parse(raw);
      if (state?.company && state?.finance && state?.calendar) {
        if (!Array.isArray(state.employees)) state.employees = createStartingRoster();
        if (!state.office) state.office = { upgrades: [] };
        state.version = 2;
        syncDepartments(state);
        return state;
      }
    }

    // Migrate saves created by the original setup-only prototype.
    const legacyRaw = localStorage.getItem("gachaStudioCompany");
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy?.companyName && legacy?.ceoName && legacy?.foundingYear) {
        const migrated = createCompany(legacy);
        saveState(migrated);
        localStorage.removeItem("gachaStudioCompany");
        return migrated;
      }
    }
  } catch (error) {
    console.warn("Could not load saved simulation:", error);
  }
  return null;
}

export function clearState() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem("gachaStudioCompany");
  } catch (error) {
    console.warn("Could not clear saved simulation:", error);
  }
}

export function addLog(state, message, type = "system") {
  state.log.unshift({ type, message });
  state.log = state.log.slice(0, 12);
}