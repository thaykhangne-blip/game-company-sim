import { createCompany, loadState, saveState, clearState, addLog } from "./state/company-state.js";
import { runMonth, startProject } from "./systems/economy.js";
import { renderDashboard, showDashboard, showSetup } from "./ui/render.js";
import { HIRABLE_ROLES, getRoleDepartment, getRoleSalary, hireEmployee, fireEmployee } from "./systems/people.js";
import { purchaseOfficeUpgrade } from "./systems/operations.js";

let state = loadState();

function persistAndRender() {
  saveState(state);
  renderDashboard(state);
}

function beginCompany(event) {
  event.preventDefault();
  const company = {
    companyName: document.getElementById("company-name").value.trim(),
    foundingYear: Number(document.getElementById("founding-year").value),
    ceoName: document.getElementById("ceo-name").value.trim()
  };
  const error = document.getElementById("error");
  if (!company.companyName || !company.ceoName || !company.foundingYear) {
    error.textContent = "Complete all three fields before establishing your company.";
    return;
  }
  if (company.foundingYear < 1998 || company.foundingYear > new Date().getFullYear()) {
    error.textContent = "Choose a valid founding year.";
    return;
  }
  state = createCompany(company);
  persistAndRender();
  showDashboard();
}

function handleStartProject() {
  const result = startProject(state, document.getElementById("project-name").value);
  if (!result.ok) {
    window.alert(result.reason);
    return;
  }
  document.getElementById("project-name").value = "";
  persistAndRender();
}

function handleAdvanceMonth() {
  if (!state || state.finance.cash < 0) return;
  const result = runMonth(state);
  addLog(state, `Cash balance: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(result.cash)}.`, "finance");
  if (result.bankrupt) addLog(state, "WARNING: The company has run out of cash. The simulation is paused.", "warning");
  persistAndRender();
}

function handleHire(event) {
  event.preventDefault();
  const error = document.getElementById("hire-error");
  const result = hireEmployee(state, {
    name: document.getElementById("hire-name").value,
    role: document.getElementById("hire-role").value,
    departmentId: document.getElementById("hire-department").value
  });
  if (!result.ok) {
    error.textContent = result.reason;
    return;
  }
  error.textContent = "";
  document.getElementById("hire-form").reset();
  syncDepartmentSelect();
  persistAndRender();
}

function handleEmployeeAction(event) {
  const button = event.target.closest("[data-fire-employee]");
  if (!button) return;
  const employee = state.employees.find(item => item.id === button.dataset.fireEmployee);
  if (!employee) return;
  if (!window.confirm(`Dismiss ${employee.name}? This will remove their monthly salary from payroll.`)) return;
  const result = fireEmployee(state, employee.id);
  if (!result.ok) {
    window.alert(result.reason);
    return;
  }
  persistAndRender();
}

function handleUpgrade(event) {
  const button = event.target.closest("[data-upgrade]");
  if (!button) return;
  const result = purchaseOfficeUpgrade(state, button.dataset.upgrade);
  if (!result.ok) {
    window.alert(result.reason);
    return;
  }
  persistAndRender();
}

function syncDepartmentSelect() {
  const role = document.getElementById("hire-role").value;
  const department = getRoleDepartment(role);
  if (department) document.getElementById("hire-department").value = department;
}

function handleReset() {
  if (!window.confirm("Start a new company? This will erase the current saved simulation.")) return;
  clearState();
  state = null;
  showSetup();
  document.getElementById("company-form").reset();
  document.getElementById("error").textContent = "";
}

document.getElementById("company-form").addEventListener("submit", beginCompany);
document.getElementById("advance-month").addEventListener("click", handleAdvanceMonth);
document.getElementById("start-project").addEventListener("click", handleStartProject);
document.getElementById("reset").addEventListener("click", handleReset);
document.getElementById("hire-form").addEventListener("submit", handleHire);
document.getElementById("employee-list").addEventListener("click", handleEmployeeAction);
document.getElementById("office-upgrades").addEventListener("click", handleUpgrade);
document.getElementById("hire-role").addEventListener("change", syncDepartmentSelect);

const yearSelect = document.getElementById("founding-year");
const currentYear = new Date().getFullYear();
for (let year = currentYear; year >= 1998; year -= 1) {
  const option = document.createElement("option");
  option.value = String(year);
  option.textContent = String(year);
  yearSelect.appendChild(option);
}

HIRABLE_ROLES.forEach(role => {
  const option = document.createElement("option");
  option.value = role;
  option.textContent = `${role} · $${getRoleSalary(role).toLocaleString("en-US")}/mo`;
  document.getElementById("hire-role").appendChild(option);
});
syncDepartmentSelect();

if (state) {
  renderDashboard(state);
  showDashboard();
} else {
  showSetup();
}