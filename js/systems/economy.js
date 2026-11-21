import {
  PROJECT_BUDGET, PROJECT_MONTHLY_SPEND, PROJECT_MONTHLY_PROGRESS
} from "../data/config.js";
import { addLog } from "../state/company-state.js";
import { advanceCalendar, getCurrentPeriod } from "./calendar.js";

export function calculatePayroll(departments) {
  return departments.reduce((total, department) => total + department.monthlyPayroll, 0);
}

export function startProject(state, projectName) {
  if (state.project) return { ok: false, reason: "Your studio already has a project in development." };
  if (state.finance.cash < 100_000) return { ok: false, reason: "Your cash reserves are too low to start a project." };

  state.project = {
    name: projectName.trim() || "Project Genesis",
    status: "In Development",
    progress: 0,
    allocatedBudget: PROJECT_BUDGET,
    spent: 0
  };
  addLog(state, `Development began on ${state.project.name}.`, "project");
  return { ok: true };
}

export function runMonth(state) {
  const period = getCurrentPeriod(state.calendar);
  const payroll = calculatePayroll(state.departments);
  const overhead = state.finance.monthlyOverhead;
  const developmentSpend = state.project && state.project.progress < 100 ? PROJECT_MONTHLY_SPEND : 0;
  const expenses = payroll + overhead + developmentSpend;
  // No released game exists yet. Revenue begins with a shipped product.
  const revenue = 0;

  state.finance.revenueThisMonth = revenue;
  state.finance.expensesThisMonth = expenses;
  state.finance.totalRevenue += revenue;
  state.finance.totalExpenses += expenses;
  state.finance.cash -= expenses;

  if (state.project && state.project.progress < 100) {
    state.project.spent += developmentSpend;
    state.project.progress = Math.min(100, state.project.progress + PROJECT_MONTHLY_PROGRESS);
    if (state.project.progress === 100) {
      state.project.status = "Development Complete";
      addLog(state, `${state.project.name} has completed its initial development phase.`, "project");
    } else {
      addLog(state, `${state.project.name} advanced to ${state.project.progress}% development.`, "project");
    }
  }

  state.finance.companyValue = Math.max(0, Math.round(
    2_400_000 + state.finance.cash * 0.35 + state.reputation * 18_000
  ));
  addLog(state, `${period.monthName} ${period.year} closed. Payroll and operating costs: ${expenses.toLocaleString("en-US")}.`, "finance");
  advanceCalendar(state.calendar);

  return { period, payroll, overhead, developmentSpend, expenses, revenue,
    cash: state.finance.cash, bankrupt: state.finance.cash < 0 };
}

export function getCurrentPeriodLabel(calendar) {
  const period = getCurrentPeriod(calendar);
  return `${period.monthName} ${period.year}`;
}