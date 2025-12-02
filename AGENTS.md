# Repository Guidelines

## Project Structure & Module Organization
- Source: `servstate-app/src` (Next.js App Router).
- Routes/UI: `src/app` (e.g., `(auth)`, `(dashboard)`, `api/**/route.ts`).
- Reusable UI: `src/components`; hooks: `src/hooks`; types: `src/types`.
- Data/config: `src/lib` (auth, db, helpers), `src/config`, `src/context`, `src/data`.
- Database: `src/db` (SQL schema/seed). Assets: `public/`. Middleware: `middleware.ts`.
- Env files: `.env.example` → copy to `.env.local`.

## Build, Test, and Development Commands
- Dev server: `cd servstate-app && npm run dev` – starts Next.js at `http://localhost:3000`.
- Build: `npm run build` – production compile of the app.
- Start: `npm run start` – runs the built app.
- Lint: `npm run lint` – ESLint using Next.js core web vitals config.

## Coding Style & Naming Conventions
- Language: TypeScript, React 19, Next.js 16 (App Router).
- Indentation: 2 spaces; prefer named exports.
- Components: PascalCase (e.g., `LoanCard.tsx`). Hooks: `useX` (e.g., `useNotifications.ts`).
- Files: route handlers as `route.ts` under `src/app/api/...`.
- Styling: Tailwind CSS v4 (`globals.css`), utility-first; avoid inline styles.
- Linting: `eslint.config.mjs` (Next core-web-vitals + TypeScript).

## Testing Guidelines
- Current status: no test runner configured in `package.json`.
- Recommended: unit with Vitest + React Testing Library; e2e with Playwright.
- Naming: colocate as `*.test.ts(x)` next to code or under `__tests__/`.
- Run: once added, prefer `npm test` and document scripts in `package.json`.

## Commit & Pull Request Guidelines
- Commits: imperative, concise, scope-focused (e.g., "Add API routes", "Fix type errors").
- Link issues in the body when applicable. One logical change per commit.
- PRs: include summary, rationale, testing notes, and screenshots for UI.
- Checks: ensure `npm run lint` passes and app builds (`npm run build`).

## Security & Configuration Tips
- Copy envs: `cp servstate-app/.env.example servstate-app/.env.local` and fill values.
- Common vars: `DATABASE_URL` (Neon), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, optional Supabase/AWS keys.
- Do not commit secrets; `.env.local` is gitignored. Review `src/lib/auth*.ts` & `middleware.ts` when changing auth.
