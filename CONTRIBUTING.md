# Contributing

Thanks for your interest in contributing! This repo is a demo project and we
aim to keep changes focused and well documented.

## How to Contribute

- Open an issue to discuss any substantial change before starting work.
- Keep pull requests small and focused on a single topic.
- Update or add tests when behavior changes.
- Run local checks before opening a PR:
  - `pnpm format:check`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`

## Development Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Reporting Bugs

Open a GitHub issue with:

- What you expected vs what happened
- Steps to reproduce
- Relevant logs or screenshots

## Code of Conduct

By participating, you agree to follow the Code of Conduct in
`CODE_OF_CONDUCT.md`.
