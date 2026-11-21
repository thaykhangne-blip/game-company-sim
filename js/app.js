import { createCompany, loadState, saveState, clearState, addLog } from "./state/company-state.js";
import { runMonth } from "./systems/economy.js";
import { renderDashboard, showDashboard, showSetup, showLoading } from "./ui/render.js";
import { HIRABLE_ROLES, getRoleDepartment, getRoleSalary, hireEmployee, fireEmployee } from "./systems/people.js";
import { purchaseOfficeUpgrade } from "./systems/operations.js";
import { createProject, assignEmployee, unassignEmployee, releaseProject } from "./systems/production.js";
import { upgradeLocation } from "./systems/locations.js";

let state = loadState();

function persistAndRender() { saveState(state); renderDashboard(state); }

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
  const submit = document.querySelector("#company-form button[type='submit']");
  submit.disabled = true;
  showLoading("Registering your company and preparing the home office...");
  state = createCompany(company);
  window.setTimeout(() => {
    persistAndRender();
    showDashboard();
    submit.disabled = false;
  }, 1150);
}

function handleCreateProject(event) {
  event.preventDefault();
  const result = createProject(state, {
    name: document.getElementById("project-name").value,
    genre: document.getElementById("project-genre").value,
    platform: document.getElementById("project-platform").value,
    scope: document.getElementById("project-scope").value
  });
  if (!result.ok) { window.alert(result.reason); return; }
  document.getElementById("project-create-form").reset();
  persistAndRender();
}

function handleAdvanceMonth() {
  if (!state || state.finance.cash < 0) return;
  const result = runMonth(state);
  addLog(state, `Cash balance: ${new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(result.cash)}.`, "finance");
  if (result.bankrupt) addLog(state,"WARNING: The company has run out of cash. The simulation is paused.","warning");
  persistAndRender();
}

function handleHire(event) {
  event.preventDefault();
  const error = document.getElementById("hire-error");
  const result = hireEmployee(state,{
    name:document.getElementById("hire-name").value,
    role:document.getElementById("hire-role").value,
    departmentId:document.getElementById("hire-department").value
  });
  if (!result.ok) { error.textContent=result.reason; return; }
  error.textContent="";
  document.getElementById("hire-form").reset();
  syncDepartmentSelect();
  persistAndRender();
}

function handleEmployeeAction(event) {
  const button=event.target.closest("[data-fire-employee]");
  if(!button)return;
  const employee=state.employees.find(item=>item.id===button.dataset.fireEmployee);
  if(!employee||!window.confirm(`Dismiss ${employee.name}? This removes their monthly salary from payroll.`))return;
  const result=fireEmployee(state,employee.id);
  if(!result.ok){window.alert(result.reason);return;}
  persistAndRender();
}

function handleUpgrade(event) {
  const button=event.target.closest("[data-upgrade]");
  if(!button)return;
  const result=purchaseOfficeUpgrade(state,button.dataset.upgrade);
  if(!result.ok){window.alert(result.reason);return;}
  persistAndRender();
}

function handleProductionAction(event) {
  const unassignButton = event.target.closest("[data-unassign-project]");
  if (unassignButton) {
    unassignEmployee(state, unassignButton.dataset.unassignProject, unassignButton.dataset.employeeId);
    persistAndRender();
    return;
  }
  const assignButton=event.target.closest("[data-assign-project]");
  if(assignButton){
    const projectId=assignButton.dataset.assignProject;
    const select=document.querySelector(`[data-assign-select="${projectId}"]`);
    if(!select?.value){window.alert("Choose a specialist to assign.");return;}
    const result=assignEmployee(state,projectId,select.value);
    if(!result.ok){window.alert(result.reason);return;}
    persistAndRender();
    return;
  }
  const releaseButton=event.target.closest("[data-release-project]");
  if(releaseButton){
    const result=releaseProject(state,releaseButton.dataset.releaseProject);
    if(!result.ok){window.alert(result.reason);return;}
    persistAndRender();
  }
}

function handleLocationUpgrade(event) {
  const button=event.target.closest("[data-location-upgrade]");
  if(!button)return;
  const result=upgradeLocation(state,button.dataset.locationUpgrade);
  if(!result.ok){window.alert(result.reason);return;}
  persistAndRender();
}

function syncDepartmentSelect() {
  const department=getRoleDepartment(document.getElementById("hire-role").value);
  if(department)document.getElementById("hire-department").value=department;
}

function handleReset() {
  if(!window.confirm("Start a new company? This will erase the current saved simulation."))return;
  clearState();state=null;showSetup();
  document.getElementById("company-form").reset();
  document.getElementById("error").textContent="";
}

document.getElementById("company-form").addEventListener("submit",beginCompany);
document.getElementById("advance-month").addEventListener("click",handleAdvanceMonth);
document.getElementById("project-create-form").addEventListener("submit",handleCreateProject);
document.getElementById("reset").addEventListener("click",handleReset);
document.getElementById("hire-form").addEventListener("submit",handleHire);
document.getElementById("employee-list").addEventListener("click",handleEmployeeAction);
document.getElementById("office-upgrades").addEventListener("click",handleUpgrade);
document.getElementById("project-panel").addEventListener("click",handleProductionAction);
document.getElementById("location-panel").addEventListener("click",handleLocationUpgrade);
document.getElementById("hire-role").addEventListener("change",syncDepartmentSelect);

const yearSelect=document.getElementById("founding-year");
const currentYear=new Date().getFullYear();
for(let year=currentYear;year>=1998;year-=1){const option=document.createElement("option");option.value=String(year);option.textContent=String(year);yearSelect.appendChild(option);}
HIRABLE_ROLES.forEach(role=>{const option=document.createElement("option");option.value=role;option.textContent=`${role} · $${getRoleSalary(role).toLocaleString("en-US")}/mo`;document.getElementById("hire-role").appendChild(option);});
syncDepartmentSelect();
if(state){renderDashboard(state);showDashboard();}else{showSetup();}
