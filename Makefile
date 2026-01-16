.PHONY: help install ensure-deps dev build start lint format format-check fmt fmt-check test test-watch check \
	docker-build docker-up docker-down docker-logs stack-up stack-down stack-logs stack-reset reset

help:
	@echo "Targets:"
	@echo "  .env          Create .env from .env.example (if missing)"
	@echo "  install       Install dependencies (pnpm)"
	@echo "  dev           Start Next.js in dev mode"
	@echo "  build         Build production assets"
	@echo "  start         Run production server"
	@echo "  lint          Run ESLint"
	@echo "  format        Run Prettier (write)"
	@echo "  format-check  Run Prettier (check)"
	@echo "  fmt           Alias for format"
	@echo "  fmt-check     Alias for format-check"
	@echo "  test          Run Vitest"
	@echo "  test-watch    Run Vitest (watch)"
	@echo "  check         Run all local checks"
	@echo "  docker-build  Build the Docker image"
	@echo "  docker-up     Start the Docker stack"
	@echo "  docker-down   Stop the Docker stack"
	@echo "  docker-logs   Tail Docker logs"
	@echo "  stack-up      Alias for docker-up"
	@echo "  stack-down    Alias for docker-down"
	@echo "  stack-logs    Alias for docker-logs"
	@echo "  stack-reset   Stop stack + remove volumes"
	@echo "  reset         Alias for stack-reset"

install:
	corepack enable
	pnpm install
.env:
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env from .env.example"; fi

ensure-deps:
	@if [ ! -x node_modules/.bin/next ]; then $(MAKE) install; fi

dev: ensure-deps .env
	pnpm dev

build: ensure-deps
	pnpm build

start: ensure-deps
	pnpm start

lint: ensure-deps
	pnpm lint

format: ensure-deps
	pnpm format

format-check: ensure-deps
	pnpm format:check

fmt: format

fmt-check: format-check

test: ensure-deps
	pnpm test

test-watch: ensure-deps
	pnpm test:watch

check:
	pnpm format:check
	pnpm lint
	pnpm test
	pnpm build

docker-build:
	docker compose build

docker-up: .env
	docker compose up -d --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

stack-up: docker-up

stack-down: docker-down

stack-logs: docker-logs

stack-reset:
	docker compose down -v --remove-orphans --timeout 0

reset: stack-reset
