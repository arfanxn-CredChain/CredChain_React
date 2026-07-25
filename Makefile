# CredChain React — thin wrapper over npm for verb parity across repos.
# Developed on host (hybrid runs vite locally). Advanced scripts
# (test:e2e, check-locales, preview) stay as `npm run <script>`.

.PHONY: dev build test lint format

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

format:
	npm run format
