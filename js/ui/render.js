import { calculatePayroll, getCurrentPeriodLabel } from "../systems/economy.js";
import { OFFICE_UPGRADES } from "../systems/operations.js";
import { LOCATIONS, getNextLocation } from "../systems/locations.js";
import { SCOPES } from "../systems/production.js";

const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export function renderDashboard(state) {
  const payroll = calculatePayroll(state.departments);
  const projectList = Array.isArray(state.projects) ? state.projects : [];
  document.getElementById("dash-name").textContent = state.company.companyName;
  document.getElementById("dash-subtitle").textContent = `Founded in ${state.company.foundingYear} · ${state.company.ceoName}, Founder & CEO`;
  document.getElementById("profile-ceo").textContent = state.company.ceoName;
  document.getElementById("profile-year").textContent = state.company.foundingYear;
  document.getElementById("seal-year").textContent = state.company.foundingYear;
  document.getElementById("year-chip").textContent = getCurrentPeriodLabel(state.calendar);
  document.getElementById("footer-company").textContent = state.company.companyName.toUpperCase();
  document.getElementById("stat-value").textContent = money(state.finance.companyValue);
  document.getElementById("stat-cash").textContent = money(state.finance.cash);
  document.getElementById("stat-employees").textContent = String(state.employees.length);
  document.getElementById("stat-reputation").innerHTML = `${state.reputation}<span>/100</span>`;
  document.getElementById("stat-revenue").textContent = money(state.finance.revenueThisMonth);
  document.getElementById("stat-expenses").textContent = money(state.finance.expensesThisMonth);
  document.getElementById("stat-payroll").textContent = money(payroll);
  document.getElementById("stat-overhead").textContent = money(state.finance.monthlyOverhead);

  document.getElementById("department-list").innerHTML = state.departments.map(department => `
    <div class="department-row"><span>${escapeHTML(department.name)}</span><b>${department.headcount} staff</b><small>${money(department.monthlyPayroll)}/mo · skill ${department.averageSkill || 0}</small></div>`).join("");

  document.getElementById("employee-list").innerHTML = state.employees
    .slice().sort((a,b)=>a.departmentId.localeCompare(b.departmentId)||a.name.localeCompare(b.name))
    .map(employee => `
      <div class="employee-row">
        <div class="employee-main"><span class="avatar">${escapeHTML(employee.name.slice(0,1).toUpperCase())}</span><div><strong>${escapeHTML(employee.name)}</strong><small>${escapeHTML(employee.role)} · ${escapeHTML(departmentName(state,employee.departmentId))}</small></div></div>
        <div class="employee-stats"><span>SKILL <b>${employee.skill}</b></span><span>MORALE <b>${employee.morale}</b></span><span>EXP <b>${employee.experience}y</b></span></div>
        <div class="employee-pay">${money(employee.salary)}<small>/month</small></div>
        ${employee.role === "Founder & CEO" ? '<span class="ceo-lock" title="Founder role">★</span>' : `<button class="fire-button" type="button" data-fire-employee="${escapeHTML(employee.id)}" aria-label="Dismiss ${escapeHTML(employee.name)}">×</button>`}
      </div>`).join("");

  document.getElementById("project-panel").innerHTML = projectList.length ? projectList.map(project => {
    const available = state.employees.filter(employee => ["development","art","audio"].includes(employee.departmentId) && !projectList.some(other => other.id !== project.id && other.stage !== "Released" && other.assignedEmployeeIds.includes(employee.id)) && !project.assignedEmployeeIds.includes(employee.id));
    const assigned = state.employees.filter(employee => project.assignedEmployeeIds.includes(employee.id));
    return `<section class="production-card">
      <div class="project-title"><span class="project-symbol">✦</span><div><strong>${escapeHTML(project.name)}</strong><small>${escapeHTML(project.genre)} · ${escapeHTML(project.platform)} · ${escapeHTML(SCOPES[project.scope]?.label || project.scope)} scope</small></div><span class="stage-pill">${escapeHTML(project.stage)}</span></div>
      <div class="progress-track"><span style="width:${project.overallProgress}%"></span></div>
      <div class="project-meta"><span>${project.overallProgress}% overall</span><span>${money(project.spent)} / ${money(project.budget)}</span></div>
      <div class="project-meta"><span>Stage progress</span><b>${project.stageProgress}%</b></div>
      <div class="assigned-list"><span>TEAM: ${assigned.length ? assigned.map(e=>`<button type="button" class="assigned-chip" data-unassign-project="${project.id}" data-employee-id="${e.id}">${escapeHTML(e.name)} ×</button>`).join("") : "No specialists assigned"}</span></div>
      ${project.stage === "Ready to Release" ? `<button class="secondary release-button" data-release-project="${project.id}">RELEASE GAME</button>` : project.stage === "Released" ? '<span class="released-label">LIVE IN THE MARKET</span>' : `<div class="assign-row"><select data-assign-select="${project.id}" aria-label="Choose project team member"><option value="">Assign a specialist...</option>${available.map(e=>`<option value="${e.id}">${escapeHTML(e.name)} · ${escapeHTML(e.role)}</option>`).join("")}</select><button class="secondary" data-assign-project="${project.id}">ASSIGN</button></div>`}
      ${project.qaScore !== null ? `<div class="project-meta"><span>QA score</span><b>${project.qaScore}/100</b></div>` : ""}
    </section>`;
  }).join("") : '<p class="empty-project">No game in development. Create your first IP concept below.</p>';
  document.getElementById("start-project").disabled = state.finance.cash < 0;
  document.getElementById("advance-month").disabled = state.finance.cash < 0 || !projectList.some(p=>p.stage!=="Released") && state.employees.length === 0;
  document.getElementById("activity-log").innerHTML = state.log.map(item=>`<li class="log-${escapeHTML(item.type)}">${escapeHTML(item.message)}</li>`).join("");

  document.getElementById("office-upgrades").innerHTML = OFFICE_UPGRADES.map(upgrade => {
    const owned = state.office.upgrades.includes(upgrade.id);
    return `<div class="upgrade-row"><div><strong>${escapeHTML(upgrade.name)}</strong><small>${escapeHTML(upgrade.description)}</small><small>+${upgrade.morale} morale · +${money(upgrade.monthlyCost)}/mo upkeep</small></div><button type="button" class="secondary upgrade-button" data-upgrade="${upgrade.id}" ${owned?"disabled":""}>${owned?"INSTALLED":money(upgrade.cost)}</button></div>`;
  }).join("");

  const nextLocation = getNextLocation(state);
  document.getElementById("location-panel").innerHTML = `<div class="location-current"><strong>${escapeHTML(state.location.name)}</strong><span>Capacity: ${state.location.capacity} staff</span><small>${money(state.location.monthlyCost)}/month premises cost</small></div>${nextLocation ? `<div class="location-next"><div><b>Next: ${escapeHTML(nextLocation.name)}</b><small>${escapeHTML(nextLocation.description)}</small><small>${money(nextLocation.cost)} upfront · ${money(nextLocation.monthlyCost)}/mo</small></div><button class="secondary" data-location-upgrade="${nextLocation.id}" ${state.finance.cash<nextLocation.cost?"disabled":""}>UPGRADE</button></div>` : '<p class="empty-project">You have reached the largest available headquarters.</p>'}`;
  document.getElementById("bankruptcy-warning").classList.toggle("hidden",state.finance.cash>=0);
  document.getElementById("hire-submit").disabled = state.finance.cash < 0;
}

function departmentName(state,id){return state.departments.find(d=>d.id===id)?.name||"Unassigned";}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

export function showDashboard(){document.getElementById("setup").classList.add("hidden");document.getElementById("loading-screen").classList.add("hidden");document.getElementById("dashboard").classList.remove("hidden");}
export function showSetup(){document.getElementById("dashboard").classList.add("hidden");document.getElementById("loading-screen").classList.add("hidden");document.getElementById("setup").classList.remove("hidden");}
export function showLoading(message="Preparing your company headquarters..."){document.getElementById("setup").classList.add("hidden");document.getElementById("dashboard").classList.add("hidden");document.getElementById("loading-message").textContent=message;document.getElementById("loading-screen").classList.remove("hidden");}
