set positional-arguments

alias d := dev
alias b := build
alias c := check

# Show available commands
default:
    @just --list

# Start the local development server
dev:
    pnpm exec node --import tsx src/scripts/sync-static-assets.ts
    pnpm exec vite dev --host 127.0.0.1

# Run ESLint
lint:
    pnpm exec eslint --cache .

# Run Stylelint
stylelint:
    pnpm exec stylelint "src/**/*.{css,svelte}"

# Fix Stylelint issues where possible
stylelint-fix:
    pnpm exec stylelint "src/**/*.{css,svelte}" --fix

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
    just stylelint
    just format-check
    just typecheck
    just typos

# Format files
format:
    pnpm exec prettier --write .
    just stylelint-fix
    just lint-fix
    just sort-package-json

# Build the static site
build:
    pnpm exec node --import tsx src/scripts/sync-static-assets.ts
    pnpm exec vite build

# Create a new post template
new-post slug:
    pnpm exec node --import tsx src/scripts/create-post-template.ts {{slug}}

# Preview the production build
preview:
    pnpm exec vite preview --host 127.0.0.1

# Patch npm's workerd binary so Wrangler can run it on NixOS
patch-workerd-nixos:
    #!/usr/bin/env bash
    set -euo pipefail

    # Wrangler resolves workerd from its npm dependency. Patch that binary with
    # Nix's dynamic linker so `wrangler pages dev` works on NixOS.
    workerd_bin="$(
      pnpm exec node -e "const wrangler=require.resolve('wrangler'); const {createRequire}=require('node:module'); const req=createRequire(wrangler); console.log(req('workerd').default)"
    )"

    if [ -z "${NIX_LD:-}" ] || [ -z "${NIX_LD_LIBRARY_PATH:-}" ]; then
      echo "NIX_LD and NIX_LD_LIBRARY_PATH are required. Run this inside nix develop or direnv." >&2
      exit 1
    fi

    patchelf --set-interpreter "$NIX_LD" --set-rpath "$NIX_LD_LIBRARY_PATH" "$workerd_bin"

# Emulate Cloudflare Pages locally with the built output
pages-dev:
    just build
    just patch-workerd-nixos
    pnpm exec wrangler pages dev build --ip 127.0.0.1

# Log in to Cloudflare with Wrangler
cloudflare-login:
    pnpm exec wrangler login

# Deploy the static build to Cloudflare Pages
deploy:
    just build
    pnpm exec wrangler pages deploy --branch main
