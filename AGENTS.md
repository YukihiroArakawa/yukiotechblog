# AGENTS.md

このファイルは、このリポジトリで作業する際の技術方針、構成、判断基準をまとめたものです。

## Project Overview

- `yukiotechblog` は WordPress から移行した技術ブログ
- SvelteKit + TypeScript + `@sveltejs/adapter-static` を使った静的サイト
- 公開先は Cloudflare Pages
- 既存の `https://yukiotechblog.com/<slug>/` URL との後方互換性を重視する

## Technical Stack

- Framework: SvelteKit
- Language: TypeScript
- Build tool: Vite
- Package manager: pnpm
- Infra / deploy CLI: Wrangler
- Runtime / tooling management: Nix Flakes
- Hosting: Cloudflare Pages
- Content source: Markdown files converted from WordPress export

## Engineering Principles

### Reproducibility First

- 開発環境の再現性を優先する
- グローバルに Node.js、pnpm、Wrangler を入れる前提にしない
- 依存ツールは可能な限り `flake.nix` で提供する
- 日常的なコマンド実行は `nix develop` または `pnpm` scripts を入口にする

### Minimal Infrastructure As Code

- Cloudflare Pages への deploy に必要な最低限の構成は `wrangler.toml` で管理する
- 現在の `wrangler.toml` は以下を持つ

```toml
name = "yukiotechblog"
pages_build_output_dir = "build"
compatibility_date = "2026-06-27"
```

- `package.json` では、Cloudflare project 名や build directory を可能な限り直書きしない
- ただし以下は現時点では `wrangler.toml` だけでは完結しない
  - custom domain
  - GitHub 連携の自動 deploy
  - Pages project 自体の作成

### Keep The Repo Self-Contained

- 記事データ、画像、変換後Markdown、deploy設定はできる限りリポジトリ内で追える形にする
- README は利用者向け手順、`REQUIREMENTS.md` は要件・背景、`AGENTS.md` は実装方針を担当する

## Design Direction

- デザインはミニマルで静かな技術ブログを目指す
- 過剰な装飾、ヒーロー演出、カード過多な構成は避ける
- 参考としている方向性:
  - `ryoppippi.com` のようなミニマルな構成
  - Anthony Fu 系のモノトーン寄りで軽い見た目
- 画面は「記事を読むこと」を主目的にし、ナビゲーションや装飾より本文の可読性を優先する

## CSS Policy

- CSS は保守性、可読性、デバッグ容易性を優先する
- `src/styles.css` のような global CSS に集約しすぎず、レイアウト、記事本文、syntax highlight など意味のある単位で分割する
- 新しいスタイル追加時は「一時的に global に足す」のではなく、責務に応じた CSS ファイルを作成または既存の適切な分割先に置く

## URL And Content Policy

- 既存の公開記事 URL は原則維持する
- 記事詳細ページは `/<slug>/` を基本とする
- 記事一覧は `/blog/`
- カテゴリ別ページは `/category/<category>/`
- `/category/` のカテゴリ一覧ページは持たない

## Content Architecture

- 記事データは `migration/wordpress-export/posts/` に置く
- 各記事は記事ディレクトリ単位で管理し、`index.md` と `images/` を持つ
- frontmatter を読み取り、Markdown を HTML に変換して配信する
- 画像は `scripts/sync-static-assets.mjs` で `static/posts/` に同期する

## Local Workflow

主要コマンド:

```bash
pnpm dev
pnpm check:all
pnpm build
pnpm preview
pnpm deploy
pnpm cloudflare-login
```

補足:

- `pnpm deploy` は build 後に Cloudflare Pages へ direct deploy する
- `pnpm check:all` は軽量な品質確認の入口として扱う

## Quality Policy

- Formatter, linter, type check を先に整える
- 変更は既存構成に寄せ、小さく保つ
- UI変更では migration 用の一時文言を残さず、公開向けの文言へ寄せる
- 非公開コンテンツを repo や公開サイトに残さない

## Important Files

- `flake.nix`
- `package.json`
- `wrangler.toml`
- `README.md`
- `src/lib/server/posts.ts`
