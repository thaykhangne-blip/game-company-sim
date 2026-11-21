import { createCompany, loadState, saveState, clearState, addLog } from "./state/company-state.js";
import { runMonth, startProject } from "./systems/economy.js";
import { renderDashboard, showDashboard, showSetup } from "./ui/render.js";

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
  const result = runMonth(state);
  addLog(state, `Cash balance: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(result.cash)}.`, "finance");
  if (result.bankrupt) addLog(state, "WARNING: The company has run out of cash. The simulation is paused.", "warning");
  persistAndRender();
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

const yearSelect = document.getElementById("founding-year");
const currentYear = new Date().getFullYear();
for (let year = currentYear; year >= 1998; year -= 1) {
  const option = document.createElement("option");
  option.value = String(year);
  option.textContent = String(year);
  yearSelect.appendChild(option);
}

if (state) {
  renderDashboard(state);
  showDashboard();
} else {
  showSetup();
}