import { getDevelopmentEfficiency } from "./people.js";

export const GENRES = ["Action RPG", "Turn-Based RPG", "Strategy", "Simulation", "Platformer", "Visual Novel"];
export const PLATFORMS = ["PC", "Mobile", "Console"];
export const SCOPES = {
  small: { label: "Small", budget: 90_000, baseMonths: 3, quality: 0 },
  medium: { label: "Medium", budget: 220_000, baseMonths: 6, quality: 8 },
  large: { label: "Large", budget: 480_000, baseMonths: 10, quality: 16 }
};
export const STAGES = ["Concept", "Pre-production", "Production", "Quality Assurance", "Ready to Release", "Released"];

export function createProject(state, input) {
  const name = String(input.name || "").trim();
  if (name.length < 2) return { ok: false, reason: "Give the game a name (at least two characters)." };
  if (!GENRES.includes(input.genre) || !PLATFORMS.includes(input.platform) || !SCOPES[input.scope]) {
    return { ok: false, reason: "Choose a valid genre, platform and scope." };
  }
  if (state.projects.some(project => project.name.toLowerCase() === name.toLowerCase())) {
    return { ok: false, reason: "A project with that name already exists." };
  }
  const scope = SCOPES[input.scope];
  if (state.finance.cash < scope.budget * 0.2) return { ok: false, reason: "You need at least 20% of the project budget in available cash to begin." };
  const project = {
    id: `project-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name, genre: input.genre, platform: input.platform, scope: input.scope,
    stage: "Concept", stageProgress: 0, overallProgress: 0,
    budget: scope.budget, spent: 0, quality: 50 + scope.quality,
    assignedEmployeeIds: [], monthsInDevelopment: 0, qaScore: null
  };
  state.projects.push(project);
  log(state, `${name} entered concept development (${scope.label} ${input.genre}).`, "project");
  return { ok: true, project };
}

export function assignEmployee(state, projectId, employeeId) {
  const project = state.projects.find(item => item.id === projectId);
  const employee = state.employees.find(item => item.id === employeeId);
  if (!project || !employee) return { ok: false, reason: "Project or employee not found." };
  if (["Ready to Release", "Released"].includes(project.stage)) return { ok: false, reason: "Projects in QA-complete or released status cannot be reassigned." };
  const assignedElsewhere = state.projects.some(item => item.id !== projectId && item.stage !== "Released" && item.assignedEmployeeIds.includes(employeeId));
  if (assignedElsewhere) return { ok: false, reason: "That employee is already assigned to another active project." };
  if (project.assignedEmployeeIds.includes(employeeId)) return { ok: false, reason: "That employee is already on this project." };
  project.assignedEmployeeIds.push(employeeId);
  log(state, `${employee.name} assigned to ${project.name}.`, "project");
  return { ok: true };
}

export function unassignEmployee(state, projectId, employeeId) {
  const project = state.projects.find(item => item.id === projectId);
  if (!project) return { ok: false, reason: "Project not found." };
  project.assignedEmployeeIds = project.assignedEmployeeIds.filter(id => id !== employeeId);
  return { ok: true };
}

export function advanceProductionMonth(state) {
  const active = state.projects.filter(project => !["Ready to Release", "Released"].includes(project.stage));
  const results = [];
  for (const project of active) {
    const team = state.employees.filter(employee => project.assignedEmployeeIds.includes(employee.id));
    const devTeam = team.filter(employee => ["development", "art", "audio"].includes(employee.departmentId));
    const capacity = Math.max(0.35, Math.min(1.5, (devTeam.length / 4) * (devTeam.length ? devTeam.reduce((s,e)=>s+e.skill,0) / devTeam.length / 75 : 0.5) * getDevelopmentEfficiency(state)));
    const monthlySpend = Math.min(project.budget - project.spent, Math.round(project.budget / (SCOPES[project.scope].baseMonths * 5)));
    project.monthsInDevelopment += 1;
    project.spent += monthlySpend;
    const increment = Math.max(4, Math.round((100 / SCOPES[project.scope].baseMonths) * capacity));
    project.stageProgress = Math.min(100, project.stageProgress + increment);
    project.overallProgress = Math.min(100, Math.round((STAGES.indexOf(project.stage) + project.stageProgress / 100) / 5 * 100));
    if (project.stageProgress >= 100) {
      const previous = project.stage;
      const index = STAGES.indexOf(project.stage);
      project.stage = STAGES[Math.min(index + 1, STAGES.length - 1)];
      project.stageProgress = 0;
      if (previous === "Quality Assurance") {
        project.qaScore = Math.max(20, Math.min(100, Math.round(project.quality + (team.length ? team.reduce((s,e)=>s+e.skill,0)/team.length : 35) / 5 - 10)));
        project.quality = project.qaScore;
        project.stage = "Ready to Release";
        project.overallProgress = 95;
      }
      if (project.stage === "Released") project.overallProgress = 100;
      log(state, `${project.name} moved into ${project.stage}.`, "project");
    } else {
      log(state, `${project.name}: ${project.stage} ${project.stageProgress}%.`, "project");
    }
    results.push({ id: project.id, spend: monthlySpend });
  }
  return results;
}

export function releaseProject(state, projectId) {
  const project = state.projects.find(item => item.id === projectId);
  if (!project || project.stage !== "Ready to Release") return { ok: false, reason: "The project must pass QA before release." };
  project.stage = "Released";
  project.overallProgress = 100;
  project.releaseYear = state.calendar.year;
  project.releaseMonth = state.calendar.month;
  state.reputation = Math.min(100, state.reputation + Math.max(2, Math.round((project.quality - 40) / 10)));
  log(state, `${project.name} launched on ${project.platform}! QA score: ${project.qaScore ?? project.quality}/100.`, "project");
  return { ok: true, project };
}

function log(state, message, type) {
  state.log.unshift({ type, message });
  state.log = state.log.slice(0, 12);
}
