# The Ramp

A SceneryStack reimplementation of PhET's classic **The Ramp** simulation —
forces on an inclined plane. Built with [SceneryStack](https://scenerystack.org/),
Vite 8, TypeScript 7, and Biome 2.

The sim has two screens, mirroring the original Java modules:

- **Introduction** — the simple ramp
- **More Features** — the advanced ramp

## Features

- Two screens mirroring the original Java sim: **Introduction** (simple ramp) and **More Features** (advanced ramp)
- Full ramp physics: friction, applied force, collisions, heat, and energy/work modeling
- Force vectors, optional free-body diagram, measuring tape, and zero-point PE line (More Features)
- Collapsible energy/work bar charts and time-series plots; record/playback on More Features
- Per-screen model/view separation with shared `RampScreenView` layout and feature flags
- English, French, and Spanish localization via `StringManager`
- Default and projector color profiles
- Progressive Web App (installable, offline-capable)
- Automated verification via `npm run verify` (physics-check scenarios, lint, build)
- Git hooks for Biome pre-commit checks; shared GitHub Actions CI via `OpenPhysics/Baton`

## Quick Start

```bash
npm install
npm run icons    # generate PNG icons from public/icons/icon.svg
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run preview` | Preview the production build locally |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run clean` | Remove `dist/` |

The sim starts at `version: "0.0.0"` in `package.json`. Bump only when cutting a release (for example `npm version patch` and a matching git tag). The kebab-case `name` (`the-ramp`) matches the SceneryStack sim identifier in `src/init.ts`.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^1 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see OpenPhysics org license.

## Contributing

See [OpenPhysics contributing guidelines](https://github.com/OpenPhysics/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
