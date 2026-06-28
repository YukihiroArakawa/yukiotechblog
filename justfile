set positional-arguments

alias d := dev
alias b := build
alias c := check

# Show available commands
default:
    @just --list

# Start the local development server
dev:
    node scripts/sync-static-assets.mjs
    pnpm exec vite dev --host 127.0.0.1

# Run ESLint
lint:
    pnpm exec eslint --cache .

# Fix ESLint issues where possible
lint-fix:
    pnpm exec eslint --cache . --fix

# Run type checks
typecheck:
    pnpm exec svelte-kit sync && pnpm exec svelte-check --tsconfig ./tsconfig.json

# Run Prettier in check mode
format-check:
    pnpm exec prettier --check .

# Run typo checks
typos:
    pnpm exec typos --force-exclude

# Keep package.json key order stable
sort-package-json:
    pnpm exec sort-package-json package.json

# Run all lightweight checks
check:
    just lint
    just format-check
    just typecheck
    just typos

# Format files
format:
    pnpm exec prettier --write .
    just lint-fix
    just sort-package-json

# Build the static site
build:
    node scripts/sync-static-assets.mjs
    pnpm exec vite build

# Create a new post template
new-post slug:
    node scripts/create-post-template.mjs {{slug}}

# Preview the production build
preview:
    pnpm exec vite preview --host 127.0.0.1

# Log in to Cloudflare with Wrangler
cloudflare-login:
    wrangler login

# Deploy the static build to Cloudflare Pages
deploy:
    just build
    wrangler pages deploy --branch main
