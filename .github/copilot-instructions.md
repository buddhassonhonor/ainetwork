# Copilot Instructions — ainetwork

Purpose: Provide Copilot sessions immediate, repo-specific guidance so suggestions match build, architecture and conventions.

## Build / run / preview (exact commands)
- Start dev server: npm run dev  # runs vite
- Build (type-check + production build): npm run build  # runs tsc && vite build
- Preview production build: npm run preview  # vite preview
- Type-check only: npx tsc --noEmit
- Run Vite build only: npx vite build

> Note: There are no test or lint scripts configured in package.json.

## High-level architecture (big picture)
- Frontend-only single-page app built with Vite + React (SWC) + TypeScript.
- Source code lives under `src/`. Entry points present as `src/main.jsx` and `src/main.ts` (the project mixes JS/TS; tsconfig includes `src`).
- Build pipeline: `npm run build` first runs `tsc` to perform static type checks (tsconfig uses bundler-mode settings, `noEmit: true`) then `vite build` to produce the dist output.
- Tooling observed in devDependencies: Vite, TypeScript, @vitejs/plugin-react-swc, Tailwind-related packages.
- Styles: Tailwind is present (tailwindcss, postcss, autoprefixer). CSS entry files include `src/index.css` and `src/style.css`.

## Key conventions and repo-specific details (do not assume typical defaults)
- package.json sets `type: "module"` — prefer ESM imports. Avoid mixing CommonJS modules without updating tooling.
- TypeScript is configured for bundler mode:
  - `moduleResolution: "bundler"`, `allowImportingTsExtensions: true`, `verbatimModuleSyntax: true`.
  - `noEmit: true` — builds rely on Vite to emit artifacts; `tsc` is used for checking only.
- Keep source under `src/`; tsconfig `include` is `src`.
- React is built with the SWC plugin (`@vitejs/plugin-react-swc`). When suggesting JSX/TSX changes, prefer patterns compatible with SWC transformation.
- Scripts:
  - Use `npm run dev` for local development (hot reload via Vite).
  - Use `npm run build` to validate types then produce optimized output.
- If adding tests or linters, update `package.json` scripts and document how to run a single test (e.g., `npm run test -- path/to/file`) in this file.

## Files and places Copilot should read first
- `package.json` (scripts and deps)
- `tsconfig.json` (TypeScript rules & bundler mode)
- `vite.config.js` (build plugins; SWC React plugin)
- `src/` (entry points: main.jsx / main.ts, App.jsx, components/)

## When suggesting changes
- Preserve `type: "module"` and bundler TS settings unless proposing coordinated toolchain changes.
- If recommending new devDependencies (linters, test runners), include corresponding npm script(s) and a one-line example to run a single test or lint pass.
- Keep changes minimal and explain any change that affects build or TypeScript behavior (e.g., switching moduleResolution).

## Other AI assistant configs discovered
- No repository-specific assistant config files found (e.g., CLAUDE.md, .cursorrules, AGENTS.md, .windsurfrules).

---

If more detail is needed (examples for adding Vitest or ESLint), ask and the instructions can be extended to include exact install and script lines.
