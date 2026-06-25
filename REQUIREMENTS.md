# yukiotechblog requirements

## Background

https://yukiotechblog.com/ にて技術ブログを運営している。
さくらインターネットのレンタルサーバーでWordPressをホスティングしている。
料金が年間で1万円ほどかかっているので、Cloudflare Pagesに移行したい。
また、WordPressでは簡単にブログ構築できてしまってフロントエンドの勉強にならないので、モダンフロントエンドの勉強につながるようにTypeScript、Svelte/Vue.js/Reactあたりを使うようにしたい。
デザインは https://github.com/ryoppippi/ryoppippi.com を参考にモノトーンな感じにしたい。
元々のブログはWordPressから画像とセットでMarkdownファイルとしてダウンロードしておきたい。

## MVP

まずはCloudflare Pagesで公開できる最小構成の技術ブログを作る。
WordPressの全記事を完全に品質保証して移行することはMVPには含めない。

### Scope

- SvelteKit + TypeScriptで実装する
- 構成は https://github.com/ryoppippi/ryoppippi.com を参考にする
- 見た目はAnthony Fu風のミニマル/モノトーン寄せにする
- Markdown記事を表示できるようにする
- Cloudflare Pagesへデプロイできるようにする
- WordPressからエクスポートした記事データはリポジトリ内で管理する

### Development Environment Policy

- 基本環境を汚さないため、Node.jsやnpmはNix Flakeのdev shell経由で使う
- グローバルnpm installはしない
- 作業時は `nix develop` または `nix develop -c <command>` を使う
- リポジトリ固有の依存関係は `package.json` とlock fileで管理する

### WordPress Migration Policy

- WordPress標準のXMLエクスポートを入力にする
- 変換には `wordpress-export-to-markdown` を使う
- 対象は公開済みの `post` のみ
- XML内の `post` は85件あるが、そのうち公開済み64件をMarkdown化して管理対象にする
- 下書き21件はMVP対象外として除外する
- 画像は `--save-images=all` で記事内画像を取得する
- `wp-content/uploads` 全体のバックアップ取得は必須にしない
- 変換後の記事は記事ごとのフォルダ形式で保存する
- MVPで表示確認とデザイン調整を行う代表記事は4本に絞る

### Representative Articles For MVP Verification

- 画像あり長文の記事: `make-destroy-restore-new-sql-ch8-hands-on`
- コードブロックありの記事: `go-lang-tutorial`
- 短文の記事: `learn-tidb-from-their-architecture`
- 日本語タイトルが長い記事: `tidb-ddl-import-error`

## Task Inventory

### 1. Repository Setup

- Git管理の状態を確認する
- Node.jsとpackage managerはNix Flakeのdev shellで提供する
- READMEに環境構築と起動手順を残す
- 要求定義はREADMEから分離する

### 2. Convert WordPress XML

- `yukio039stechblog.WordPress.2026-06-12.xml` を入力にする
- `wordpress-export-to-markdown` でMarkdownへ変換する
- 対象は公開済み `post` のみとする
- 公開済み64件を記事ごとのフォルダ形式で出力する
- 変換時に出力される固定ページ、Contact Form、下書きは除外する
- 記事内画像を保存する
- 出力先は一旦 `migration/wordpress-export/` などにする
- 変換コマンドはNix Flake経由で実行する

```bash
nix develop -c npx --yes wordpress-export-to-markdown \
  --wizard=false \
  --input=yukio039stechblog.WordPress.2026-06-12.xml \
  --output=migration/wordpress-export \
  --post-folders=true \
  --prefix-date=false \
  --date-folders=none \
  --save-images=all \
  --frontmatter-fields=title,date,categories,tags,coverImage,draft,slug,type \
  --timezone=Asia/Tokyo
```

### 3. Select Representative Articles

- 画像あり長文
- コードブロックあり
- 短文
- 長い日本語タイトル

### 4. Add SvelteKit Project

- `ryoppippi.com` のようにSvelteKit + Vite + pnpm構成にする
- TypeScript構成を維持する
- Markdown記事を読み込む導線を確認する
- ローカルで起動できる状態にする

### 5. Import Articles

- 変換済みMarkdownをSvelteKitで表示できる形にする
- 画像パスをSvelteKitで表示できる形に調整する
- frontmatterをアプリ側の読み込み処理に合わせる
- 代表4記事で表示確認する

### 6. Adjust Design

- Anthony Fu風にミニマル/モノトーン寄せする
- 記事一覧、記事詳細、ナビ、フッターを調整する
- 長い日本語タイトル、コードブロック、画像の見た目を確認する

### 7. Prepare Cloudflare Pages Deployment

- build commandを決める
- output directoryを確認する
- 必要ならCloudflare向けの設定を追加する
- デプロイ手順をREADMEに残す

### 8. MVP Completion Criteria

- ローカルビルドが成功する
- 代表4記事が崩れず表示される
- 記事内画像が表示される
- Cloudflare Pages上で公開できる
- 公開済み64記事は保存済みである
- 公開済み64記事の細かい表示品質保証は後続タスクに回す
