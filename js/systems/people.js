
const ROLE_PAY = {
  "Software Engineer": 6500,
  "Game Designer": 5600,
  "Producer": 6200,
  "2D Artist": 5200,
  "3D Artist": 5700,
  "Animator": 5400,
  "Sound Designer": 5200,
  "Marketing Specialist": 5000,
  "Community Manager": 4500,
  "QA Tester": 4200
};

const ROLE_DEPARTMENT = {
  "Software Engineer": "development",
  "Game Designer": "development",
  "Producer": "development",
  "2D Artist": "art",
  "3D Artist": "art",
  "Animator": "art",
  "Sound Designer": "audio",
  "Marketing Specialist": "publishing",
  "Community Manager": "publishing",
  "QA Tester": "development"
};

export const HIRABLE_ROLES = Object.keys(ROLE_PAY);
export const DEPARTMENT_NAMES = {
  development: "Development",
  art: "Art & Design",
  audio: "Audio",
  publishing: "Publishing",
  management: "Management"
};

const STARTING_ROSTER = [
  ["Mina Park","Producer","development",6800,82,78,5],
  ["Ethan Cole","Software Engineer","development",6500,76,84,4],
  ["Yuki Tanaka","Software Engineer","development",6400,81,80,4],
  ["Daniel Tran","Software Engineer","development",6200,70,75,3],
  ["Aisha Rahman","Game Designer","development",5600,88,86,5],
  ["Leo Martin","QA Tester","development",4200,72,79,2],
  ["Sofia Nguyen","Art Director","art",7200,91,83,6],
  ["Hana Kim","2D Artist","art",5400,84,89,4],
  ["Noah Williams","3D Artist","art",5700,77,81,3],
  ["Isabel Costa","Sound Designer","audio",5200,86,88,4],
  ["Oliver Chen","Marketing Specialist","publishing",5000,75,76,3],
  ["Priya Shah","Community Manager","publishing",4500,82,85,3]
];

export function createStartingRoster() {
  return STARTING_ROSTER.map((row, index) => ({
    id: `staff-${index + 1}`,
    name: row[0], role: row[1], departmentId: row[2],
    salary: row[3], skill: row[4], morale: row[5], experience: row[6]
  }));
}

export function normalizePeopleState(state) {
  if (!Array.isArray(state.employees)) state.employees = createStartingRoster();
  syncDepartments(state);
  return state;
}

export function syncDepartments(state) {
  state.departments.forEach(department => {
    const team = state.employees.filter(employee => employee.departmentId === department.id);
    department.headcount = team.length;
    department.monthlyPayroll = team.reduce((sum, employee) => sum + employee.salary, 0);
    department.averageSkill = team.length
      ? Math.round(team.reduce((sum, employee) => sum + employee.skill, 0) / team.length)
      : 0;
    department.averageMorale = team.length
      ? Math.round(team.reduce((sum, employee) => sum + employee.morale, 0) / team.length)
      : 0;
  });
}

export function hireEmployee(state, { name, role, departmentId }) {
  const cleanName = String(name || "").trim();
  if (cleanName.length < 2) return { ok: false, reason: "Enter an employee name with at least two characters." };
  if (!ROLE_PAY[role]) return { ok: false, reason: "Choose a valid role." };
  const department = state.departments.find(item => item.id === departmentId);
  if (!department || ROLE_DEPARTMENT[role] !== departmentId) {
    return { ok: false, reason: "That role does not belong to the selected department." };
  }
  if (state.location && state.employees.length >= state.location.capacity) return { ok: false, reason: "Your current premises are at capacity. Upgrade your location before hiring." };
  if (state.employees.some(employee => employee.name.toLowerCase() === cleanName.toLowerCase())) {
    return { ok: false, reason: "An employee with that name already exists." };
  }

  const employee = {
    id: `staff-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: cleanName, role, departmentId,
    salary: ROLE_PAY[role], skill: 55, morale: 75, experience: 0
  };
  state.employees.push(employee);
  syncDepartments(state);
  log(state, `${cleanName} joined as ${role} in ${department.name}. Monthly salary: $${employee.salary.toLocaleString("en-US")}.`, "people");
  return { ok: true, employee };
}

export function fireEmployee(state, employeeId) {
  const index = state.employees.findIndex(employee => employee.id === employeeId);
  if (index < 0) return { ok: false, reason: "Employee not found." };
  if (state.employees[index].role === "Founder & CEO") return { ok: false, reason: "The founder and CEO cannot be dismissed." };
  if (state.employees.length <= 1) return { ok: false, reason: "A company must retain at least one employee." };
  const [employee] = state.employees.splice(index, 1);
  syncDepartments(state);
  log(state, `${employee.name} (${employee.role}) left the company. Payroll reduced by ${employee.salary.toLocaleString("en-US")}/month.`, "people");
  return { ok: true, employee };
}

export function getDevelopmentEfficiency(state) {
  const team = state.employees.filter(employee => employee.departmentId === "development");
  if (!team.length) return 0.5;
  const skill = team.reduce((sum, employee) => sum + employee.skill, 0) / team.length;
  const morale = team.reduce((sum, employee) => sum + employee.morale, 0) / team.length;
  return Math.max(0.5, Math.min(1.35, (skill / 75) * (morale / 80)));
}

export function getRoleDepartment(role) {
  return ROLE_DEPARTMENT[role] || null;
}

export function getRoleSalary(role) {
  return ROLE_PAY[role] || 0;
}
function log(state, message, type = "system") {
  state.log.unshift({ type, message });
  state.log = state.log.slice(0, 12);
}
