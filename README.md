# Gacha Studio Simulator

A browser-based management sim about building a game company inspired by the modern anime-style gacha and live-service game industry.

## Run locally
Use a local static server (ES modules are used, so opening `index.html` directly with `file://` may be blocked by the browser).

For example:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Current build: v0.2 — Company foundation
- Company setup: company name, founding year, founder / CEO.
- Modular ES-module architecture.
- Full simulation save/load in localStorage.
- Calendar: advance one month at a time; time does not move automatically.
- Starter organization with Development, Art & Design, Audio, and Publishing departments.
- Monthly payroll and overhead expenses.
- Company cash, valuation, headcount, reputation, and monthly financial snapshot.
- Start a first game project with an allocated budget and monthly development progress.
- Company journal records key actions and monthly close.
- Bankruptcy warning and simulation pause when cash falls below zero.

## Architecture
- `js/app.js`: application entry point and event wiring.
- `js/data/config.js`: balance constants and starting departments.
- `js/state/company-state.js`: state creation, persistence, and journal.
- `js/systems/calendar.js`: date progression.
- `js/systems/economy.js`: payroll, operating costs, and project progression.
- `js/ui/render.js`: dashboard rendering and screen transitions.
- `style.css`: visual system and simulation components.
- `index.html`: application shell and screen structure.

## Concrete roadmap
| Milestone | Scope | Exit condition |
|---|---|---|
| M1 — Company foundation | Modular architecture, persistence, calendar, economy, departments, first project | A new company can be founded, saved, and advanced month by month with costs and project progress updating correctly |
| M2 — People & operations | Hiring/firing, salaries, staff skills, morale, department capacity, office upgrades | Hiring changes payroll and headcount; staffing levels affect development output |
| M3 — Game production | IP concept, genre/platform, scope, team assignment, milestones, development progress, QA, launch readiness | A project can move from concept through production and QA to a shippable build |
| M4 — Gacha product systems | Characters, rarity, banners, pity, currencies, monetization, revenue modelling, player trust | A released game can run a banner and produce revenue, pulls, and player sentiment |
| M5 — Live service | Version cadence, events, reruns, regions, maintenance, bugs, compensation, content drought | Monthly live-ops decisions affect retention, revenue, and reputation |
| M6 — Market & competition | Rival publishers, market share, reviews, community sentiment, platform deals, global expansion | The company competes against simulated publishers and responds to market conditions |
| M7 — Long-term management | Annual reports, board/shareholders, crises, leadership decisions, achievements, sandbox balancing | Long-running saves support strategic choices and multiple viable company strategies |

## Simulation principles
- All dashboard values must derive from saved simulation state, not hard-coded display placeholders.
- Time advances only through an explicit player action.
- Costs and revenue should be transparent and logged.
- New systems should be added as independent modules with clear inputs and outputs.
- Each milestone should have a complete, testable gameplay loop before the next is layered on.

## Tech
Vanilla HTML, CSS, and JavaScript modules. No build step or third-party runtime dependency.