# Gacha Studio Simulator

A browser-based management sim about building a game company inspired by the modern anime-style gacha and live-service game industry.

## Run locally
Use a local static server (ES modules are used, so opening `index.html` directly with `file://` may be blocked by the browser).

```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Current build: v0.4 — Production pipeline
- Company setup with a short animated loading screen after establishment.
- New companies begin with exactly one employee: the founder / CEO. The founder has no salary and cannot be dismissed.
- Starting headquarters is a home office with a three-person capacity.
- Upgrade premises from Home Office to Shared Workspace, Small Studio and Company Office. Each tier has an upfront cost, recurring premises cost and larger staff capacity.
- Modular ES-module architecture and localStorage save/load, including migration of earlier saves.
- Calendar advances manually, one month at a time.
- Hire and dismiss specialists; salaries, headcount, department metrics and development capacity derive from the employee roster.
- Office upgrades improve morale and add monthly upkeep.
- Create multiple game IP projects with a name, genre, platform and scope.
- Projects move through Concept, Pre-production, Production, Quality Assurance and Ready to Release.
- Assign each development, art or audio employee to one active project at a time. Team skill affects production pace and QA results.
- Project budgets are tracked, and finished projects can be released to improve company reputation.
- Monthly payroll, premises, office upkeep and project spending are recorded in the company journal.
- GitHub Actions checks JavaScript syntax for every module on pushes and pull requests to `main`.

## Architecture
- `js/app.js`: application entry point and event wiring.
- `js/data/config.js`: balance constants and starting departments.
- `js/state/company-state.js`: state creation, migration, persistence and journal.
- `js/systems/calendar.js`: date progression.
- `js/systems/economy.js`: payroll, operating costs and monthly simulation.
- `js/systems/people.js`: employee roster, hiring, dismissal and workforce efficiency.
- `js/systems/operations.js`: office upgrades and monthly workforce effects.
- `js/systems/locations.js`: headquarters tiers, capacity and premises costs.
- `js/systems/production.js`: IP creation, team assignment, production stages, QA and release.
- `js/ui/render.js`: dashboard rendering and screen transitions.
- `style.css`: visual system and responsive simulation components.
- `index.html`: application shell and screen structure.
- `.github/workflows/js-syntax.yml`: JavaScript syntax validation.

## Roadmap
| Milestone | Scope | Exit condition |
|---|---|---|
| M1 — Company foundation | Modular architecture, persistence, calendar, economy, departments | A company can be founded, saved and advanced month by month |
| M2 — People & operations | Hiring/firing, salaries, staff skills, morale, department capacity, office upgrades | Staffing and morale affect payroll and development output |
| M3 — Game production | IP concept, genre/platform, scope, team assignment, production stages, QA and release | Multiple projects can progress independently from concept to release |
| M4 — Gacha product systems | Characters, rarity, banners, pity, currencies, monetization, revenue modelling and player trust | A released game can run a banner and produce revenue, pulls and player sentiment |
| M5 — Live service | Version cadence, events, reruns, regions, maintenance, bugs, compensation and content drought | Monthly live-ops decisions affect retention, revenue and reputation |
| M6 — Market & competition | Rival publishers, market share, reviews, community sentiment, platform deals and global expansion | The company competes against simulated publishers |
| M7 — Long-term management | Annual reports, board/shareholders, crises, leadership decisions, achievements and sandbox balancing | Long-running saves support multiple viable strategies |

## Simulation principles
- Dashboard values derive from saved simulation state rather than hard-coded display placeholders.
- Time advances only through an explicit player action.
- Costs and revenue are transparent and logged.
- Systems are independent modules with clear inputs and outputs.
- Each milestone should have a complete gameplay loop before the next is layered on.

## Tech
Vanilla HTML, CSS and JavaScript modules. No build step or third-party runtime dependency.
