import { addLog } from "../state/company-state.js";
import { advanceCalendar, getCurrentPeriod } from "./calendar.js";
import { syncDepartments } from "./people.js";
import { applyMonthlyWorkforceEffects } from "./operations.js";
import { advanceProductionMonth } from "./production.js";

export function calculatePayroll(departments) {
  return departments.reduce((total, department) => total + department.monthlyPayroll, 0);
}

export function runMonth(state) {
  const period = getCurrentPeriod(state.calendar);
  syncDepartments(state);
  const payroll = calculatePayroll(state.departments);
  const overhead = state.finance.monthlyOverhead;
  const production = advanceProductionMonth(state);
  const developmentSpend = production.reduce((sum, item) => sum + item.spend, 0);
  const expenses = payroll + overhead + developmentSpend;
  const revenue = 0;

  state.finance.revenueThisMonth = revenue;
  state.finance.expensesThisMonth = expenses;
  state.finance.totalRevenue += revenue;
  state.finance.totalExpenses += expenses;
  state.finance.cash -= expenses;
  applyMonthlyWorkforceEffects(state);
  state.finance.companyValue = Math.max(0, Math.round(
    2_400_000 + state.finance.cash * 0.35 + state.reputation * 18_000
  ));
  addLog(state, `${period.monthName} ${period.year} closed. Payroll, premises and production costs: $${expenses.toLocaleString("en-US")}.`, "finance");
  advanceCalendar(state.calendar);
  return { period, payroll, overhead, developmentSpend, expenses, revenue,
    cash: state.finance.cash, bankrupt: state.finance.cash < 0 };
}

export function getCurrentPeriodLabel(calendar) {
  const period = getCurrentPeriod(calendar);
  return `${period.monthName} ${period.year}`;
}
