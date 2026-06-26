# Migration TODO

さくらインターネットのレンタルサーバー上のWordPressから、Cloudflare Pages上のSvelteKitブログへ移行するためのMVPタスク。

## 1. Repository And Local Environment

- [x] Nix FlakeでNode.js/pnpm/Svelte/TypeScriptの開発環境を提供する
- [x] direnv用の `.envrc` を用意する
- [x] READMEに環境構築、起動、検証コマンドをまとめる
- [x] 要求仕様を `REQUIREMENTS.md` に分離する
- [x] lint/format/typecheck/build/typosを整備する
- [x] lefthookでpre-commitとpre-pushの品質ゲートを設定する

## 2. WordPress Export And Content Inventory

- [x] WordPress XMLエクスポートから公開記事Markdownを生成する
- [x] 公開記事を `migration/wordpress-export/posts/` に記事ごとのフォルダ形式で保存する
- [x] 記事内画像を各記事フォルダの `images/` に保存する
- [x] 既存公開URLの台帳 `migration/blog-url-inventory.md` を作成する
- [x] 既存公開URLを `curl -L` で確認する
- [x] 非公開記事を公開URL互換対象から除外する

## 3. SvelteKit Blog MVP

- [x] SvelteKit + TypeScript + pnpm構成を追加する
- [x] Markdown frontmatterを読み込む記事ローダーを実装する
- [x] 記事一覧ページを実装する
- [x] 記事詳細ページを実装する
- [x] トップページに代表記事を表示する
- [x] 記事画像を静的配信用に同期する
- [x] 既存URL互換の `/<slug>/` で記事を表示する
- [x] 非公開記事を生成対象から除外する
- [ ] 公開記事63件がローカルビルド成果物にすべて含まれることを自動確認する

## 4. URL Compatibility And SEO

- [x] 既存URL形式 `https://yukiotechblog.com/<slug>/` をMVP要件に追加する
- [x] SvelteKitの `trailingSlash = 'always'` を設定する
- [x] `build/<slug>/index.html` が生成されることを確認する
- [ ] `migration/blog-url-inventory.md` の63件と `build/<slug>/index.html` の対応を自動チェックする
- [ ] `/blog/<slug>/` を残すか、`/<slug>/` へredirectするか決める
- [ ] canonical URLを `https://yukiotechblog.com/<slug>/` に設定する
- [ ] title/description/OGPの最低限のメタデータを設定する
- [ ] sitemap.xmlを生成する
- [ ] robots.txtを追加する

## 5. Design And Display QA

- [x] ミニマルな記事一覧/記事詳細の基本デザインを実装する
- [ ] 代表4記事で表示崩れを確認する
- [ ] 長い日本語タイトルがモバイルで崩れないことを確認する
- [ ] コードブロックが横スクロールできることを確認する
- [ ] 記事画像が本文幅に収まり、alt未設定でもレイアウトが崩れないことを確認する
- [ ] ダークモードの最低限の表示を確認する

## 6. Cloudflare Pages Deployment

- [x] GitHubリモートリポジトリを作成する
- [x] ローカルリポジトリに `origin` を設定する
- [x] `main` ブランチをGitHubへpushする
- [x] Cloudflareアカウントを作成する
- [x] Cloudflareにログインできることを確認する
- [x] Cloudflareの基本的なアカウント設定とメール認証を完了する
- [x] Cloudflare PagesでGitHubリポジトリを接続する
- [ ] Cloudflare Pagesのbuild commandを `pnpm build` に設定する
- [ ] Cloudflare Pagesのoutput directoryを `build` に設定する
- [ ] Cloudflare Pages上のpreview URLで表示を確認する
- [ ] preview URLで代表4記事と記事画像を確認する
- [ ] preview URLで既存URL互換の `/<slug>/` を確認する

## 7. Domain Migration

- [ ] Cloudflareに `yukiotechblog.com` のzoneを追加する
- [ ] お名前.com側でCloudflare指定のnameserverへ変更する手順を確認する
- [ ] 現在のDNSレコードを控える
- [ ] Cloudflare DNSに必要なレコードを設定する
- [ ] Cloudflare Pagesに `yukiotechblog.com` のcustom domainを設定する
- [ ] DNS切り替え前にCloudflare Pages側のcustom domain状態を確認する
- [ ] DNS切り替え後に `https://yukiotechblog.com/` がCloudflare Pagesへ向いていることを確認する
- [ ] 既存公開URL63件が移行後もHTTP 200で返ることを確認する

## 8. Cutover And Rollback

- [ ] 移行直前にWordPress XMLを再エクスポートするか判断する
- [ ] さくらレンタルサーバー側の現行WordPressを一定期間残す
- [ ] DNS切り替え前の状態へ戻す手順をメモする
- [ ] 移行後に主要ページ、代表4記事、画像、既存URLを確認する
- [ ] 問題がなければさくらレンタルサーバー解約判断を後続タスクに回す

## 9. Out Of MVP

- [ ] 公開記事63件すべての本文品質保証
- [ ] WordPress下書き記事の移行
- [ ] WordPress固定ページの移行
- [ ] コメント移行
- [ ] 検索機能
- [ ] タグ/カテゴリページ
- [ ] RSS
- [ ] アクセス解析
