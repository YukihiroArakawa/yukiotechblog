# yukiotechblog

WordPressから移行中の技術ブログです。
SvelteKit + TypeScriptでローカル確認用のサンプルサイトを提供しています。

プロジェクトの背景、MVP範囲、移行方針は [REQUIREMENTS.md](REQUIREMENTS.md) を参照してください。

## Prerequisites

- Nix Flakesが使えるNix環境
- グローバルのNode.js/npm/pnpmは不要

このリポジトリの開発ツールは `flake.nix` で管理します。
flakeはNode.js、pnpm、just、Wrangler、Svelte/TypeScript関連の開発ツールを提供します。

## Setup

dev shellを有効化します。
`nix develop` は、必要に応じて `pnpm-lock.yaml` に基づく依存関係のインストールも実行します。

```bash
nix develop
```

`node_modules` が無い場合、または `pnpm-lock.yaml` が `node_modules/.pnpm/lock.yaml` より新しい場合だけ、dev shellの起動時に `pnpm install --frozen-lockfile` が実行されます。

direnvを使う場合は、初回だけ許可します。

```bash
direnv allow
```

以後はこのディレクトリに入ると自動でdev shellが有効化されます。

利用できるタスクは `justfile` にまとめています。

```bash
just
```

## Run Locally

```bash
just dev
```

起動後、以下で確認できます。

```text
http://127.0.0.1:5173/
```

トップページはMVP確認用の代表4記事、`/blog` は変換済みの公開済み63記事一覧を表示します。

## Check And Build

```bash
just check
```

静的ビルド:

```bash
just build
```

ビルド成果物は `build/` に出力されます。

ビルド成果物をローカルで確認する場合:

```bash
just preview
```

## Development Shell

エディタや言語サーバー用にもdev shellを使います。

```bash
nix develop
```

dev shell内では `node`、`pnpm`、`just`、`wrangler`、`svelte-language-server`、`typescript-language-server` が利用できます。

dev shellに入らずに個別コマンドを実行する場合:

```bash
nix develop -c just check
```

ローカルサーバーも同じ形で起動できます。

```bash
nix develop -c just dev
```

## Cloudflare CLI

Cloudflareの公式CLIであるWranglerもNix dev shellに含めています。
グローバルに `npm install -g wrangler` する必要はありません。

このリポジトリでは、Cloudflare Pages向けの最低限の構成を
[`wrangler.toml`](wrangler.toml) で管理しています。

- `name = "yukiotechblog"`
- `pages_build_output_dir = "build"`
- `compatibility_date = "2026-06-27"`

```bash
nix develop
just cloudflare-login
```

dev shellに入らずに実行する場合:

```bash
nix develop -c wrangler --help
```

Cloudflare Pagesへローカルからデプロイする場合:

```bash
nix develop -c just deploy
```

`just deploy` は `pnpm run deploy` を呼び出します。`pnpm run deploy` は `pnpm build` を実行してから、`build/` を `yukiotechblog` Pages project の `main` ブランチとしてデプロイします。

`wrangler.toml` により、Pages project名と build directory はCLI引数に直書きしていません。

ただし、以下はまだ `wrangler.toml` だけでは完結しません。

- Custom domain
- GitHub連携の自動デプロイ設定
- Pages project の作成自体

## Content

WordPressから変換済みの記事は以下にあります。

```text
migration/wordpress-export/posts/
```

各記事は `index.md` と `images/` を持つフォルダ形式です。
アプリはこのMarkdownを読み込み、`scripts/sync-static-assets.mjs` で画像を `static/posts/` に同期して表示します。

## Useful Tasks

タスクの一覧は以下で確認できます。

```bash
just --list
```

`pnpm install` 時にlefthookがpre-commit hookを登録します。
pre-commitでは `pnpm lint`、`pnpm format:check`、`pnpm check`、`pnpm typos` を実行します。
pre-pushでは `pnpm build` を実行します。
