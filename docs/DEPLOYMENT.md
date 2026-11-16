# Deployment

How Presmistique is built, tested and shipped. Every command below comes from the files in this repo:
[`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`.github/workflows/deploy-backend.yml`](../.github/workflows/deploy-backend.yml),
[`deploy/docker-compose.yml`](../deploy/docker-compose.yml), [`deploy/deploy.sh`](../deploy/deploy.sh) and [`backend/Dockerfile`](../backend/Dockerfile).

## Architecture

```
 Browser
   ├── https://presmistique.in ──────► Cloudflare Pages (static build of resume-builder/)
   │
   └── https://api.presmistique.in ──► VPS (Ubuntu + Docker)
                                         nginx :443 (Let's Encrypt TLS)
                                           └─► 127.0.0.1:5000  presmistique-api container
                                                 (Express + Debian Chromium for PDFs)
                                                 ├── MongoDB Atlas (MONGODB_URI in api.env)
                                                 └── /opt/presmistique/data/{uploads,logs}

 Pull request ──► CI (ci.yml) ──► merge to main ─┬─► Deploy API (deploy-backend.yml): build ─► GHCR ─► SSH ─► deploy.sh
                                                 └─► Cloudflare Pages builds and publishes the frontend
```

| Part | Where it runs | How it is deployed |
|------|---------------|--------------------|
| Frontend (`resume-builder/`) | Cloudflare Pages | Cloudflare's Git integration, on every push |
| API (`backend/`) | Docker container on a VPS, behind host nginx | GitHub Actions → GHCR → `deploy.sh` over SSH |
| Database | MongoDB Atlas | Managed; not part of this repo |

## CI (`.github/workflows/ci.yml`)

Runs on every pull request to `main` or `dev`, on pushes to `dev`, and on manual runs. Nothing in CI deploys.

1. **Detect changes** – `dorny/paths-filter` decides which areas changed:
   backend = `backend/**`, `deploy/**`, `.github/workflows/**`; frontend = `resume-builder/**`, `.github/workflows/**`.
2. **Backend checks** (Node 22) – `npm ci`, `node --check` on every tracked `.js` file, `npm test`
   (unit tests plus token and payment tests against a MongoDB service) and `bash -n deploy/deploy.sh`.
3. **Backend image** – builds `backend/Dockerfile` and smoke-tests it: launches Chromium through
   `getLaunchOptions()` from `backend/utils/browserManager.js` and renders a PDF.
4. **Frontend build** – `npm ci` + `npm run build` in `resume-builder/`, using the Node version in `resume-builder/.nvmrc`.
5. **CI passed** – fails if any job failed or was cancelled (skipped jobs count as passed).
   Branch protection on `main` requires this check.

## Backend deploy (`.github/workflows/deploy-backend.yml`)

Triggered by a push to `main` that touches `backend/**`, `deploy/**` or the workflow file itself, or by a manual run.

1. **Build & push** – builds `backend/Dockerfile` and pushes two tags to GitHub Container Registry
   (authenticated with the built-in `GITHUB_TOKEN`):
   - `ghcr.io/<owner>/presmistique-api:sha-<first 7 chars of the commit>`
   - `ghcr.io/<owner>/presmistique-api:latest`
2. **Deploy to VPS** (GitHub environment `production`) – connects over SSH with the dedicated deploy key and a pinned host key, then:
   - copies `deploy/docker-compose.yml` and `deploy/deploy.sh` to `/opt/presmistique`;
   - logs the server in to `ghcr.io` for the duration of the deploy;
   - runs `/opt/presmistique/deploy.sh sha-xxxxxxx`.
3. **`deploy.sh`** – writes `API_IMAGE` (passed by the workflow) and `IMAGE_TAG=<tag>` to `/opt/presmistique/.env`, runs `docker compose pull api` and
   `docker compose up -d api`, then polls `http://127.0.0.1:5000/health` for up to ~90 seconds.
   - Healthy: removes old images, keeping the current and previous tag for instant rollback.
   - Unhealthy: prints the last 60 log lines, **switches back to the previous tag automatically** and fails the workflow.
4. **Public health check** – `curl https://api.presmistique.in/health` from the runner.

Deploys never run in parallel (`concurrency: deploy-production`).

### The production image (`backend/Dockerfile`)

- `node:22-bookworm-slim` with Debian's `chromium` package and fonts (Liberation, DejaVu, Noto Color Emoji).
- `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`; Puppeteer's own Chrome download is skipped.
  Every Puppeteer launch goes through `getLaunchOptions()` in `backend/utils/browserManager.js`.
  Locally, without `PUPPETEER_EXECUTABLE_PATH`, Puppeteer uses the Chrome it downloads during `npm install`.
- Production dependencies only (`npm ci --omit=dev`), runs as the non-root `node` user, starts with `node server.js`.
- Built-in Docker `HEALTHCHECK` against `/health`.

## Frontend deploy (Cloudflare Pages)

The Cloudflare Pages Git integration builds `resume-builder/` on every push; GitHub Actions is not involved.

- `main` → production at https://presmistique.in
- any other branch (e.g. `dev`) → a preview URL on `*.resume-builder-6rc.pages.dev`

Build settings and environment variables live in the Cloudflare Pages project settings
(root directory `resume-builder`, build command `npm run build`, output directory `build`).
`REACT_APP_*` variables are baked in at build time, so they are public; production uses
`REACT_APP_API_URL=https://api.presmistique.in/api` (the Razorpay checkout key comes from the API; see `docs/PAYMENTS.md`).

## Rollback

**API – from GitHub (preferred):** Actions → **Deploy API** → **Run workflow** → set `image_tag` to an existing tag
(e.g. `sha-1a2b3c4`). The build job is skipped and that tag is rolled out with the same health check.
Leaving `image_tag` empty rebuilds and deploys the current `main`.

**API – on the server:**

```bash
cd /opt/presmistique
./deploy.sh sha-1a2b3c4   # deploy that tag (auto-rollback if unhealthy)
./deploy.sh               # re-deploy the tag currently in .env
```

`deploy.sh` always runs `docker compose pull`, so the server must be able to read the image from GHCR.
If the package is private, log in first and log out afterwards:
`docker login ghcr.io -u <github-user>` with a personal access token that has `read:packages`.

Available tags are listed on the repository's **Packages → presmistique-api** page; the current one is in `/opt/presmistique/.env`.

**Frontend:** Cloudflare dashboard → Pages project → **Deployments** → pick an earlier production deployment → **Rollback**.

## First-time VPS setup / disaster recovery

Assumes a fresh Ubuntu server with DNS for `api.presmistique.in` pointing at it.

1. **Install Docker** Engine and the Compose plugin (see https://docs.docker.com/engine/install/ubuntu/),
   plus nginx and certbot:
   ```bash
   apt install -y nginx certbot python3-certbot-nginx
   ```
2. **Create the deploy folder** with the app secrets and any restored data:
   ```bash
   mkdir -p /opt/presmistique/data/uploads /opt/presmistique/data/logs
   cd /opt/presmistique
   nano api.env          # production values for the variables in backend/env.template
   chmod 600 api.env
   # restore data/uploads from backup if recovering; deploy.sh chowns data/ to uid 1000
   ```
   `api.env` needs at least `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SESSION_SECRET`, `ENCRYPTION_KEY`
   (must match the value used with the existing database), the Razorpay, Gemini, email and OAuth keys,
   `CLIENT_URL=https://presmistique.in`, and
   `GOOGLE_CALLBACK_URL` / `LINKEDIN_CALLBACK_URL` (see [OAUTH_SETUP.md](OAUTH_SETUP.md)).
   `NODE_ENV` and `PORT` are set by the compose file. `docker-compose.yml`, `deploy.sh` and `.env` are written by the workflow.
3. **nginx site** – e.g. `/etc/nginx/sites-available/api.presmistique.in`, then enable it and add TLS:
   ```nginx
   server {
       listen 80;
       server_name api.presmistique.in;
       client_max_body_size 12m;   # uploads are limited to 10 MB by the API

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_read_timeout 120s;
       }
   }
   ```
   ```bash
   ln -s /etc/nginx/sites-available/api.presmistique.in /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx
   certbot --nginx -d api.presmistique.in
   ```
4. **Deploy key** – generate a key pair used only for deploys and authorize it on the server:
   ```bash
   ssh-keygen -t ed25519 -f presmistique_deploy -N "" -C "github-actions-deploy"
   # append presmistique_deploy.pub to ~/.ssh/authorized_keys of the deploy user on the VPS
   ssh-keyscan <vps-host>   # output goes into VPS_KNOWN_HOSTS
   ```
5. **GitHub secrets** (Settings → Secrets and variables → Actions):

   | Secret | Value |
   |--------|-------|
   | `VPS_HOST` | server IP or hostname |
   | `VPS_USER` | SSH user (root) |
   | `VPS_SSH_KEY` | contents of the private key `presmistique_deploy` |
   | `VPS_KNOWN_HOSTS` | output of `ssh-keyscan <vps-host>` |

6. **Run the workflow** – Actions → **Deploy API** → **Run workflow** (empty `image_tag` builds `main`,
   or give a known-good tag), then check `https://api.presmistique.in/health`.

## Useful server commands

Run from `/opt/presmistique`:

```bash
docker compose ps                              # container status and health
docker compose logs -f --tail 200 api          # follow container logs
ls data/logs/                                  # application log files
curl -fsS http://127.0.0.1:5000/health         # local health check
cat .env                                       # image and tag currently deployed
docker compose restart api                     # restart the API
docker compose up -d --force-recreate api      # apply changes made to api.env

# Admin scripts (backend npm scripts) inside the running container
docker compose exec api npm run unlock-account -- user@example.com
docker compose exec api npm run add-tokens -- user@example.com 50 --force   # without --force it only previews
docker compose exec api npm run seed:all-templates
```

Template thumbnails live in `backend/thumbnails/` and are baked into the image; regenerate them locally
(`npm run generate-thumbnails` / `npm run update-thumbnails`), commit, and deploy, rather than inside the container.

## Where secrets live

| Secret | Location |
|--------|----------|
| API runtime secrets (DB, JWT, Razorpay, Gemini, email, OAuth, encryption key) | `/opt/presmistique/api.env` on the VPS (chmod 600, never committed) |
| SSH deploy access | GitHub Actions secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS` |
| GHCR push/pull during deploys | the workflow's built-in `GITHUB_TOKEN` (no setup needed) |
| Frontend build variables (public) | Cloudflare Pages project → environment variables |
| Local development | `backend/.env` and `resume-builder/.env` (copied from the `env.template` files, gitignored) |

Back up `api.env` and `data/uploads/` somewhere off the server; nothing in this repo does that automatically.
