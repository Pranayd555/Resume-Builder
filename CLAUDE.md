# Presmistique: notes for Claude Code

MERN AI resume builder. Frontend (CRA + craco) in `resume-builder/`, deployed on Cloudflare Pages; Express/MongoDB API in `backend/`, Docker on a VPS. All work goes to `dev` via PR; merging to `main` auto-deploys the API.

## Before you push
- Backend: `cd backend && npm test` (add `TOKEN_TEST_MONGODB_URI=mongodb://127.0.0.1:27017/token-test` with `docker compose up -d mongo` to include the database tests). CI also runs `node --check` on every backend file.
- Frontend: `cd resume-builder && npm test -- --watchAll=false` and `npm run build`. On Windows inside a `.claude/worktrees/...` checkout, jest finds no tests (the `\.` in the path becomes a glob escape); add `--testMatch "**/src/**/*.test.js"`.
- Local stack: `docker compose up --build` at the repo root (throwaway MongoDB; settings from `backend/.env`, copied from `backend/env.template`).

## SonarCloud quality gate
Every PR is analysed by SonarCloud. The gate requires **A** ratings on new code for security, reliability and maintainability. After opening or updating a PR, run `scripts/sonar-pr-issues.sh [PR]` and fix new findings, "failure" ones first. Write new code so these never appear:

- **NoSQL injection (security, blocker):** never put request values straight into a Mongo query. Cast ids (`toObjectId()` in `backend/utils/tokenCalculator.js`, or `String()` / `Number()`), validate shapes (`typeof x === 'string'`, an id regex), and never spread a request object into a filter.
- **Log injection:** wrap user-influenced values in log lines with `logSafe()` (`backend/utils/logSafe.js`), or `Number()` for numbers.
- **Floating promises (reliability):** every promise is awaited, ends in `.catch()`, or is explicitly `void`ed.
- **Cognitive complexity ≤ 15 per function:** split long route handlers into small helpers (see the refund helpers in `backend/routes/payment.js`).
- Use optional chaining (`a?.b`) instead of `a && a.b`; no unused variables or assignments.
- **Regex:** no patterns with overlapping quantifiers on user input (super-linear backtracking); prefer plain string checks.
- **JSX:** a `<label>` must belong to a control (`htmlFor` or a nested input); use a heading or `<span>` for read-only values. Don't put text and an element on separate lines without an explicit wrapper or `{' '}`.
- Diff hygiene: when inserting a block next to a similar one, make its first lines distinct so the diff (and Sonar's "new code") doesn't claim the existing lines.

## Product rules
- User-facing text never shows a developer's name or personal contact; the only brand contact is presmistique@gmail.com (`resume-builder/src/constants/brand.js`). Write copy in the "we/our team" voice.
- AI tokens: two pools, purchased (`tokens`, refundable) and bonus (`bonusTokens`, not refundable). Read and change them only through `backend/utils/tokenCalculator.js` (atomic updates, bonus spent first); the frontend reads `balance` / `canUseAI` from `AuthContext`. Refund rules: `docs/REFUND_SYSTEM_README.md`.
