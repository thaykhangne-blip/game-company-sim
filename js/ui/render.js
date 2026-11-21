import { calculatePayroll, getCurrentPeriodLabel } from "../systems/economy.js";
import { OFFICE_UPGRADES } from "../systems/operations.js";

const money = value => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", maximumFractionDigits: 0
}).format(value);

export function renderDashboard(state) {
  const payroll = calculatePayroll(state.departments);
  const headcount = state.employees.length;
  const project = state.project;

  document.getElementById("dash-name").textContent = state.company.companyName;
  document.getElementById("dash-subtitle").textContent =
    `Founded in ${state.company.foundingYear} · ${state.company.ceoName}, Founder & CEO`;
  document.getElementById("profile-ceo").textContent = state.company.ceoName;
  document.getElementById("profile-year").textContent = state.company.foundingYear;
  document.getElementById("seal-year").textContent = state.company.foundingYear;
  document.getElementById("year-chip").textContent = getCurrentPeriodLabel(state.calendar);
  document.getElementById("footer-company").textContent = state.company.companyName.toUpperCase();

  document.getElementById("stat-value").textContent = money(state.finance.companyValue);
  document.getElementById("stat-cash").textContent = money(state.finance.cash);
  document.getElementById("stat-employees").textContent = String(headcount);
  document.getElementById("stat-reputation").innerHTML = `${state.reputation}<span>/100</span>`;
  document.getElementById("stat-revenue").textContent = money(state.finance.revenueThisMonth);
  document.getElementById("stat-expenses").textContent = money(state.finance.expensesThisMonth);
  document.getElementById("stat-payroll").textContent = money(payroll);
  document.getElementById("stat-overhead").textContent = money(state.finance.monthlyOverhead);

  document.getElementById("department-list").innerHTML = state.departments.map(department => `
    <div class="department-row">
      <span>${escapeHTML(department.name)}</span>
      <b>${department.headcount} staff</b>
      <small>${money(department.monthlyPayroll)}/mo · skill ${department.averageSkill || 0}</small>
    </div>`).join("");

  document.getElementById("employee-list").innerHTML = state.employees
    .slice().sort((a, b) => a.departmentId.localeCompare(b.departmentId) || a.name.localeCompare(b.name))
    .map(employee => `
      <div class="employee-row">
        <div class="employee-main">
          <span class="avatar">${escapeHTML(employee.name.slice(0, 1).toUpperCase())}</span>
          <div><strong>${escapeHTML(employee.name)}</strong><small>${escapeHTML(employee.role)} · ${escapeHTML(departmentName(state, employee.departmentId))}</small></div>
        </div>
        <div class="employee-stats">
          <span>SKILL <b>${employee.skill}</b></span>
          <span>MORALE <b>${employee.morale}</b></span>
          <span>EXP <b>${employee.experience}y</b></span>
        </div>
        <div class="employee-pay">${money(employee.salary)}<small>/month</small></div>
        <button class="fire-button" type="button" data-fire-employee="${escapeHTML(employee.id)}" aria-label="Dismiss ${escapeHTML(employee.name)}">×</button>
      </div>`).join("");

  document.getElementById("project-panel").innerHTML = project ? `
    <div class="project-title"><span class="project-symbol">✦</span><div><strong>${escapeHTML(project.name)}</strong><small>${escapeHTML(project.status)}</small></div></div>
    <div class="progress-track"><span style="width:${project.progress}%"></span></div>
    <div class="project-meta"><span>${project.progress}% complete</span><span>${money(project.spent)} spent</span></div>
    <div class="project-meta"><span>Allocated budget</span><b>${money(project.allocatedBudget)}</b></div>`
    : `<p class="empty-project">No active project. Your development team is waiting for a direction.</p>`;

  document.getElementById("start-project").disabled = Boolean(project);
  document.getElementById("start-project").textContent = project ? "PROJECT ALREADY ACTIVE" : "START PROJECT";
  document.getElementById("advance-month").disabled = state.finance.cash < 0;
  document.getElementById("activity-log").innerHTML = state.log.map(item =>
    `<li class="log-${escapeHTML(item.type)}">${escapeHTML(item.message)}</li>`
  ).join("");

  document.getElementById("office-upgrades").innerHTML = OFFICE_UPGRADES.map(upgrade => {
    const owned = state.office.upgrades.includes(upgrade.id);
    return `<div class="upgrade-row">
      <div><strong>${escapeHTML(upgrade.name)}</strong><small>${escapeHTML(upgrade.description)}</small>
      <small>+${upgrade.morale} morale · +${money(upgrade.monthlyCost)}/mo upkeep</small></div>
      <button type="button" class="secondary upgrade-button" data-upgrade="${upgrade.id}" ${owned ? "disabled" : ""}>${owned ? "INSTALLED" : money(upgrade.cost)}</button>
    </div>`;
  }).join("");

  document.getElementById("bankruptcy-warning").classList.toggle("hidden", state.finance.cash >= 0);
  document.getElementById("hire-submit").disabled = state.finance.cash < 0;
}

function departmentName(state, id) {
  return state.departments.find(department => department.id === id)?.name || "Unassigned";
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

export function showDashboard() {
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
}

export function showSetup() {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("setup").classList.remove("hidden");
}