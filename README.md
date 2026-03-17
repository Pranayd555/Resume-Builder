# Resume Builder (Full Stack)

Full-stack Resume Builder application:
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

## Quick start (Docker)

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000` (health: `GET /health`)
- MongoDB: `localhost:27017`

## Quick start (manual)

### Backend

```bash
cd backend
cp env.template .env
npm install
npm run dev
```

### Frontend

```bash
cd resume-builder
npm install
npm start
```

## Environment variables

Backend variables are documented in `backend/env.template`.

Frontend variables:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

## Documentation

Start from `PROJECT_DOCUMENTATION.md` for the full doc index.

## Repo structure

```
.
├── backend/         # Express API + templates + scripts
├── resume-builder/  # React app
└── docker-compose.yml
```

