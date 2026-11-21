import {
  SAVE_KEY, STARTING_CASH, STARTING_REPUTATION,
  STARTING_DEPARTMENTS, MONTHLY_OVERHEAD
} from "../data/config.js";
import { syncDepartments } from "../systems/people.js";

export function createCompany(setup) {
  const state = {
    version: 3,
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
    employees: [{ id: "ceo-founder", name: setup.ceoName, role: "Founder & CEO", departmentId: "management", salary: 0, skill: 65, morale: 85, experience: 0 }],
    office: { upgrades: [] },
    location: { id: "home", name: "Home Office", monthlyCost: 0, capacity: 3 },
    projects: [],
    project: null,
    log: [{ type: "system", message: "Company established. The founder is the only employee. Operations begin from a home office." }]
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
        if (!Array.isArray(state.employees)) state.employees = [{ id: "ceo-founder", name: state.company.ceoName, role: "Founder & CEO", departmentId: "management", salary: 0, skill: 65, morale: 85, experience: 0 }];
        if (!state.office) state.office = { upgrades: [] };
        if (!state.location) state.location = { id: "home", name: "Home Office", monthlyCost: 0, capacity: 3 };
        if (!Array.isArray(state.projects)) state.projects = state.project ? [{ id: "legacy-project", name: state.project.name || "Legacy Project", genre: "Action RPG", platform: "PC", scope: "medium", stage: state.project.progress >= 100 ? "Ready to Release" : "Production", stageProgress: state.project.progress || 0, overallProgress: state.project.progress || 0, budget: state.project.allocatedBudget || 220000, spent: state.project.spent || 0, quality: 50, assignedEmployeeIds: state.employees.filter(e => e.departmentId === "development").map(e => e.id), monthsInDevelopment: 0, qaScore: null }] : [];
        state.version = 3;
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