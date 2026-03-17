# Resume Builder (Frontend)

React frontend for the Resume Builder application. Uses **CRACO + Tailwind CSS** and connects to the Express backend.

## Prerequisites

- Node.js (see `resume-builder/package.json` → `engines`)
- Backend running on `http://localhost:5000` (or your deployed backend)

## Environment variables

Create `resume-builder/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

Optional (payments):

```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

## Run locally

```bash
cd resume-builder
npm install
npm start
```

App runs at `http://localhost:3000`.

## Build

```bash
cd resume-builder
npm run build
```

## Deployment

- Frontend: Vercel
- Backend: Render

See `CI_CD_SETUP.md` and `.github/workflows/README.md` at the repo root.
