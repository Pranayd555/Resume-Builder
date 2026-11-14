# Presmistique - AI Resume Builder

Full-stack AI resume builder, live at **https://presmistique.in** (API: https://api.presmistique.in).

- **Frontend**: React + Tailwind (`resume-builder/`)
- **Backend**: Node.js/Express + MongoDB (`backend/`)

## Demo

- YouTube: `https://youtu.be/QkUQtSjI6DE`

## Features

- Resume builder workflow (create/edit/preview/export)
- Template system (Handlebars templates + Puppeteer thumbnails)
- JWT authentication + Google/LinkedIn OAuth
- Razorpay payments + token purchases
- Refund calculation system (token-aware)
- Email service (welcome/reset/verification/subscription/refund emails)

## Tech stack

- **Frontend**: React 19, Tailwind CSS (CRACO), React Router, Axios
- **Backend**: Node.js 22, Express, MongoDB/Mongoose, Passport (Google/LinkedIn), Puppeteer + Chromium for PDFs
- **Integrations**: Google Gemini, Razorpay, SMTP email
- **Hosting**: Cloudflare Pages (frontend), Docker on a VPS behind nginx (API), MongoDB Atlas, images on GitHub Container Registry
- **CI/CD**: GitHub Actions (CI on every PR, automatic API deploys from `main`)

## Local development

Both options need `backend/.env`:

```bash
cp backend/env.template backend/.env   # then fill in the keys you need
```

### Option A: API in Docker (same image as production)

```bash
docker compose up --build             # API on http://localhost:5000 + a throwaway local MongoDB
```

`MONGODB_URI` and `CLIENT_URL` are overridden by the root `docker-compose.yml`, so it never touches your Atlas database.

### Option B: API with Node directly

Requires Node 22 and a MongoDB you can reach (local or a dev Atlas cluster in `MONGODB_URI`).

```bash
cd backend
npm install        # also downloads the Chrome that Puppeteer uses locally
npm run dev        # nodemon on http://localhost:5000
```

### Frontend (either option)

```bash
cd resume-builder
cp env.template .env      # REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start                 # http://localhost:3000
```

Health check: `GET http://localhost:5000/health`. Backend tests: `cd backend && npm test`.

## Deployment

- **Frontend**: Cloudflare Pages builds `resume-builder/` automatically. `main` → https://presmistique.in, other branches → preview URLs.
- **API**: merging to `main` builds a Docker image, pushes it to GHCR and rolls it out on the VPS with a health check and automatic rollback.
- **CI**: every pull request runs backend checks, a Docker image smoke test and the frontend build; `main` requires "CI passed".

Full details, rollback and server setup: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

Start from [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md) for the full doc index.

## Repo structure

```
.
├── backend/                 # Express API, templates, scripts, Dockerfile
├── resume-builder/          # React app (deployed by Cloudflare Pages)
├── deploy/                  # Production docker-compose.yml + deploy.sh (copied to the VPS)
├── docs/                    # Project documentation
├── .github/workflows/       # ci.yml, deploy-backend.yml
└── docker-compose.yml       # Local dev: API + local MongoDB
```

## Contact

presmistique@gmail.com
