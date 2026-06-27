set positional-arguments

alias d := dev
alias b := build
alias c := check

# Show available commands
default:
    @just --list

# Start the local development server
dev:
    pnpm dev --host 127.0.0.1

# Run ESLint
lint:
    pnpm lint

# Run all lightweight checks
check:
    pnpm lint
    pnpm format:check
    pnpm check
    pnpm typos

# Format files
format:
    pnpm format

# Build the static site
build:
    pnpm build

# Preview the production build
preview:
    pnpm preview --host 127.0.0.1

# Log in to Cloudflare with Wrangler
cloudflare-login:
    wrangler login

# Deploy the static build to Cloudflare Pages
deploy:
    pnpm deploy
