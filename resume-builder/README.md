# Presmistique - AI Resume Builder (Frontend)

React frontend for Presmistique, live at https://presmistique.in. Uses **CRACO + Tailwind CSS** and connects to the Express backend.

## Prerequisites

- Node.js (version in `resume-builder/.nvmrc`)
- Backend running on `http://localhost:5000` (see the root [README](../README.md))

## Environment variables

Copy `env.template` to `resume-builder/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Optional:

```env
REACT_APP_SUPPORT_EMAIL=presmistique@gmail.com   # defaults to this value
REACT_APP_CKEDITOR_LICENSE_KEY=...               # CKEditor license
```

`REACT_APP_*` values are baked into the build, so never put secrets in them.

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

Cloudflare Pages builds this directory automatically through its Git integration:

- `main` → production at https://presmistique.in (with `REACT_APP_API_URL=https://api.presmistique.in/api`)
- other branches (e.g. `dev`) → preview URLs on `*.resume-builder-6rc.pages.dev`

Pull requests also run `npm run build` in CI. See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).
