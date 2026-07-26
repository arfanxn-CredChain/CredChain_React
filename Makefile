# CredChain React — thin wrapper over npm for verb parity across repos.
# Developed on host (hybrid runs vite locally). Advanced scripts
# (test:e2e, check-locales, preview) stay as `npm run <script>`.

.PHONY: dev build test lint format

dev:
	@PORT=$$(grep -E '^VITE_PORT=' .env | cut -d= -f2); \
	if [ -n "$$PORT" ]; then echo "freeing port $$PORT"; kill $$(lsof -ti tcp:$$PORT) 2>/dev/null || true; fi
	npm run dev

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

format:
	npm run format
