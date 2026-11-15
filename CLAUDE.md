# Presmistique: notes for Claude Code

MERN AI resume builder. Frontend (CRA + craco) in `resume-builder/`, deployed on Cloudflare Pages; Express/MongoDB API in `backend/`, Docker on a VPS. All work goes to `dev` via PR; merging to `main` auto-deploys the API.

## Before you push
- Backend: `cd backend && npm test` (add `TOKEN_TEST_MONGODB_URI=mongodb://127.0.0.1:27017/token-test` with `docker compose up -d mongo` to include the database tests). CI also runs `node --check` on every backend file.
- Frontend: `cd resume-builder && npm test -- --watchAll=false` and `npm run build`. On Windows inside a `.claude/worktrees/...` checkout, jest finds no tests (the `\.` in the path becomes a glob escape); add `--testMatch "**/src/**/*.test.js"`.
- Local stack: `docker compose up --build` at the repo root (throwaway MongoDB; settings from `backend/.env`, copied from `backend/env.template`).

## SonarCloud quality gate
Every PR is analysed by SonarCloud (automatic analysis, configured by `.sonarcloud.properties`; `sonar-project.properties` is ignored by it). The gate requires **A** ratings on new code for security, reliability and maintainability, so even one minor vulnerability fails it. After opening or updating a PR, check findings with the SonarQube MCP tools when they're available (`search_sonar_issues_in_projects` with `pullRequest`, `get_project_quality_gate_status`, `show_rule` for the official fix), or with `scripts/sonar-pr-issues.sh [PR]`. Fix "failure"/blocker ones first. Write new code so these never appear:

- **What counts as user input:** `req.body`, `req.query`, `req.params`, and also `req.user` (it comes from the request's JWT) and any document found using request data.
- **NoSQL injection (security, blocker):** never put request values straight into a Mongo query *or update document*. Convert to plain values first (`String(x)`, `Number(x)`, `toObjectId()` in `backend/utils/tokenCalculator.js`), use `{ field: { $eq: String(x) } }` for lookups, validate shapes (`typeof x === 'string'`, an id regex), and never spread a request object into a filter.
- **Log injection:** every interpolated value in a log message that could come from a user goes through `logSafe()` (`backend/utils/logSafe.js`, which strips CR/LF with a regex literal; Sonar's recognised fix), or `Number()` for numbers. Pass errors as `{ message: err.message }` objects.
- **Floating promises (reliability):** every promise is awaited, ends in `.catch()`, or is explicitly `void`ed.
- **Cognitive complexity ≤ 15 per function:** split long route handlers into small helpers (see the refund helpers in `backend/routes/payment.js`).
- Use optional chaining (`a?.b`) instead of `a && a.b`; no unused variables or assignments.
- **Regex:** no patterns with overlapping quantifiers on user input (super-linear backtracking); prefer plain string checks.
- **JSX:** a `<label>` must belong to a control (`htmlFor` or a nested input); use a heading or `<span>` for read-only values. Don't put text and an element on separate lines without an explicit wrapper or `{' '}`.
- Diff hygiene: when inserting a block next to a similar one, make its first lines distinct so the diff (and Sonar's "new code") doesn't claim the existing lines.

## Product rules
- User-facing text never shows a developer's name or personal contact; the only brand contact is presmistique@gmail.com (`resume-builder/src/constants/brand.js`). Write copy in the "we/our team" voice.
- AI tokens: two pools, purchased (`tokens`, refundable) and bonus (`bonusTokens`, not refundable). Read and change them only through `backend/utils/tokenCalculator.js` (atomic updates, bonus spent first); the frontend reads `balance` / `canUseAI` from `AuthContext`. Refund rules: `docs/REFUND_SYSTEM_README.md`.
