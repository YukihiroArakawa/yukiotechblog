# yukiotechblog

WordPressから移行中の技術ブログです。
SvelteKit + TypeScriptでローカル確認用のサンプルサイトを提供しています。

プロジェクトの背景、MVP範囲、移行方針は [REQUIREMENTS.md](REQUIREMENTS.md) を参照してください。

## Prerequisites

- Nix Flakesが使えるNix環境
- グローバルのNode.js/npm/pnpmは不要

このリポジトリの開発ツールは `flake.nix` で管理します。
flakeはNode.js、pnpm、Svelte/TypeScript関連の開発ツールを提供します。

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

## Run Locally

```bash
pnpm dev --host 127.0.0.1
```

起動後、以下で確認できます。

```text
http://127.0.0.1:5173/
```

トップページはMVP確認用の代表4記事、`/blog` は変換済みの公開済み64記事一覧を表示します。

## Check And Build

型チェック:

```bash
pnpm check
```

静的ビルド:

```bash
pnpm build
```

ビルド成果物は `build/` に出力されます。

ビルド成果物をローカルで確認する場合:

```bash
pnpm preview --host 127.0.0.1
```

## Development Shell

エディタや言語サーバー用にもdev shellを使います。

```bash
nix develop
```

dev shell内では `node`、`pnpm`、`svelte-language-server`、`typescript-language-server` が利用できます。

dev shellに入らずに個別コマンドを実行する場合:

```bash
nix develop -c pnpm check
```

ローカルサーバーも同じ形で起動できます。

```bash
nix develop -c pnpm dev --host 127.0.0.1
```

## Content

WordPressから変換済みの記事は以下にあります。

```text
migration/wordpress-export/posts/
```

各記事は `index.md` と `images/` を持つフォルダ形式です。
アプリはこのMarkdownを読み込み、`scripts/sync-static-assets.mjs` で画像を `static/posts/` に同期して表示します。

## Useful Scripts

- `pnpm dev --host 127.0.0.1`: ローカル開発サーバーを起動
- `pnpm check`: SvelteKit/TypeScriptをチェック
- `pnpm build`: 静的サイトをビルド
- `pnpm preview --host 127.0.0.1`: ビルド成果物をプレビュー
