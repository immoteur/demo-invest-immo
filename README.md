# Immoteur Invest Immo Demo

Open-source Next.js demo app for the Immoteur API (https://immoteur.com) that lists DPE G apartment classifieds. The UI is a single page with a department filter and HeroUI cards. API calls stay server-side to protect the Immoteur API token.

This repo is a companion demo for:

- Immoteur: https://immoteur.com
- Full tutorial (step-by-step): https://immoteur.com/tutorials/invest-immo-demo

## Demo disclaimer

This project is a demo for immoteur.com and is not production-ready. No API keys are shipped with this repository. Use your own Immoteur personal access token and keep it server-side.

## Stack

- Next.js App Router + TypeScript
- HeroUI + Tailwind CSS v4
- `@immoteur/openapi-zod` schemas for API parsing

## Requirements

- Node.js 20+
- pnpm (see `packageManager` in `package.json`)

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Edit `.env` and set `IMMOTEUR_API_KEY` before starting the app.

Open `http://localhost:3000`.

## Docker (Optional)

```bash
cp .env.example .env
docker compose up --build
```

The container listens on `http://localhost:3002` by default. Keep the logs
visible to catch startup errors and override the port with `APP_HOST_PORT` if
needed.

## Makefile

Run `make help` to see available targets. Common commands:

- `make dev`
- `make lint`
- `make test`
- `make docker-up`

## Environment Variables

- `IMMOTEUR_API_KEY` (required): Immoteur personal access token. No keys are included in this repo; set your own in `.env`.
- `IMMOTEUR_API_BASE_URL` (optional): defaults to `https://api.immoteur.com/public/v1`.
- `IMMOTEUR_TRANSACTION_TYPE` (optional): defaults to `sale`.
- `IMMOTEUR_PROPERTY_TYPES` (optional): comma-separated, defaults to `apartment`.
- `IMMOTEUR_DPE_LABELS` (optional): comma-separated, defaults to `F,G`.
- `IMMOTEUR_MAX_RESULTS` (optional): max classifieds to display, defaults to `15`.
- `IMMOTEUR_CACHE_TTL_MS` (optional): in-memory cache TTL in milliseconds, defaults to `300000`.
- `ALLOW_NO_DEPARTMENT` (optional): when `true`, adds an "All departments" option and makes it the default.

## Behavior

- Filters: property type list, transaction type, and DPE labels are configured by env; defaults are `apartment`, `sale`, and `F,G`.
- Sorting: `firstSeenAt` descending.
- Limit: first `IMMOTEUR_MAX_RESULTS` classifieds from the first page.
- Caching: in-memory server cache keyed by filters and department, with a TTL set via `IMMOTEUR_CACHE_TTL_MS`.
- The department filter is a client-side single select backed by a hard-coded list.

## Scripts

- `pnpm dev` - run the dev server
- `pnpm build` - build the app
- `pnpm start` - run the production server
- `pnpm lint` - lint the codebase
- `pnpm format` - format with Prettier
- `pnpm format:check` - check formatting
- `pnpm test` - run unit tests
- `pnpm test:watch` - watch tests

## Security

Do not expose `IMMOTEUR_API_KEY` in client code or public env variables. Server-side data fetching is enforced with `server-only` imports. Please report vulnerabilities privately; see `SECURITY.md`.

## Contributing

See `CONTRIBUTING.md`.

## Code of Conduct

See `CODE_OF_CONDUCT.md`.

## License

MIT. See `LICENSE`.
