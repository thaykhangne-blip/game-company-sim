# Gacha Studio Simulator

A browser-based management sim about building a game company inspired by the modern anime-style gacha and live-service game industry.

## Run locally
Use a local static server (ES modules are used, so opening `index.html` directly with `file://` may be blocked by the browser).

```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Current build: v0.3 — People & operations
- Company setup: company name, founding year, founder / CEO.
- Modular ES-module architecture and localStorage save/load.
- Calendar: manually advance one month at a time.
- Starting organization with 12 named employees across four departments.
- Employee roster with role, department, salary, skill, morale and experience.
- Hire specialists with role-based salary and department validation.
- Dismiss employees with confirmation; payroll and department headcount recalculate.
- Department average skill and payroll derived from the employee roster.
- Development team skill and morale influence project progress.
- Monthly payroll, overhead, development spending and cash-flow journal.
- Office upgrades: workspace, wellbeing and production equipment. Each has an upfront cost, recurring upkeep and morale effect.
- Project pipeline with allocated budget and monthly progress.
- Save migration from the earlier setup-only and v0.2 simulation formats.

## Architecture
- `js/app.js`: application entry point and event wiring.
- `js/data/config.js`: balance constants and starting departments.
- `js/state/company-state.js`: state creation, migration, persistence and journal.
- `js/systems/calendar.js`: date progression.
- `js/systems/economy.js`: payroll, operating costs and project progression.
- `js/systems/people.js`: employee roster, hiring, dismissal and workforce efficiency.
- `js/systems/operations.js`: office upgrades and monthly workforce effects.
- `js/ui/render.js`: dashboard rendering and screen transitions.
- `style.css`: visual system and responsive simulation components.
- `index.html`: application shell and screen structure.

## Concrete roadmap
| Milestone | Scope | Exit condition |
|---|---|---|
| M1 — Company foundation | Modular architecture, persistence, calendar, economy, departments, first project | A company can be founded, saved and advanced month by month |
| M2 — People & operations | Hiring/firing, salaries, staff skills, morale, department capacity, office upgrades | Hiring changes payroll and headcount; staffing and morale affect development output |
| M3 — Game production | IP concept, genre/platform, scope, team assignment, milestones, development progress, QA, launch readiness | A project can move from concept through production and QA to a shippable build |
| M4 — Gacha product systems | Characters, rarity, banners, pity, currencies, monetization, revenue modelling and player trust | A released game can run a banner and produce revenue, pulls and player sentiment |
| M5 — Live service | Version cadence, events, reruns, regions, maintenance, bugs, compensation and content drought | Monthly live-ops decisions affect retention, revenue and reputation |
| M6 — Market & competition | Rival publishers, market share, reviews, community sentiment, platform deals and global expansion | The company competes against simulated publishers |
| M7 — Long-term management | Annual reports, board/shareholders, crises, leadership decisions, achievements and sandbox balancing | Long-running saves support multiple viable strategies |

## Simulation principles
- Dashboard values derive from saved simulation state rather than hard-coded display placeholders.
- Time advances only through an explicit player action.
- Costs and revenue are transparent and logged.
- Systems are independent modules with clear inputs and outputs.
- Each milestone should have a complete, testable gameplay loop before the next is layered on.

## Tech
Vanilla HTML, CSS and JavaScript modules. No build step or third-party runtime dependency.
