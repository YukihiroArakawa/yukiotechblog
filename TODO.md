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

### 6.1 Account And Repository

- [x] GitHubリモートリポジトリを作成する
- [x] ローカルリポジトリに `origin` を設定する
- [x] `main` ブランチをGitHubへpushする
- [x] Cloudflareアカウントを作成する
- [x] Cloudflareにログインできることを確認する
- [x] Cloudflareの基本的なアカウント設定とメール認証を完了する
- [x] Cloudflare PagesでGitHubリポジトリを接続する

### 6.2 Wrangler Direct Deploy

- [x] WranglerでCloudflare Pages project `yukiotechblog` を作成する
- [x] Wranglerで `build/` をCloudflare Pagesへ初回デプロイする
- [x] `https://yukiotechblog.pages.dev/` がHTTP 200で返ることを確認する
- [x] `https://yukiotechblog.pages.dev/blog/` がHTTP 200で返ることを確認する
- [x] 代表記事 `https://yukiotechblog.pages.dev/00-introduction-jp-build-your-own-db/` がHTTP 200で返ることを確認する
- [x] 代表記事画像がHTTP 200で返ることを確認する
- [ ] preview URLで代表4記事を目視確認する

### 6.3 GitHub Auto Deploy

- [ ] Cloudflare Pagesのbuild commandを `pnpm build` に設定する
- [ ] Cloudflare Pagesのoutput directoryを `build` に設定する
- [ ] GitHub pushでCloudflare Pagesのdeployが自動実行されることを確認する
- [ ] 自動デプロイ後のpreview URLでトップ、記事一覧、既存URL互換の `/<slug>/` を確認する

## 7. Domain Migration

### 7.1 Domain And Registrar Check

- [x] `yukiotechblog.com` の現在の登録事業者が、さくらインターネットかお名前.comか確認する
- [x] 現在の権威DNS、nameserver、DNSレコードを控える
- [x] 現在のWordPress/さくらレンタルサーバー向けDNSレコードを控える
- [x] ドメインのWhois情報、登録者メール、管理画面ログイン可否を確認する

### 7.2 Cloudflare Zone Setup

- [x] Cloudflareに `yukiotechblog.com` のzoneを追加する
- [x] Cloudflareが提示したnameserverを控える
- [x] Cloudflare DNSに移行前と同等の必要レコードを設定する
- [x] Cloudflare Pagesに `yukiotechblog.com` のcustom domainを追加する
- [x] DNS切り替え前にCloudflare zoneが有効化されたことを確認する
- [x] Cloudflare Pages側のcustom domain状態を確認する

### 7.3 Registrar Nameserver Cutover

- [x] 登録事業者側でnameserver変更手順を確認する
- [x] 登録事業者側でCloudflare指定のnameserverへ変更する
- [x] `dig NS` でCloudflareのnameserverへ切り替わったことを確認する
- [x] DNS伝播中も旧WordPressが参照される可能性を考慮し、さくらレンタルサーバーを一定期間残す

### 7.4 Post-Cutover Verification

- [x] DNS切り替え後に `https://yukiotechblog.com/` がCloudflare Pagesへ向いていることを確認する
- [x] `https://yukiotechblog.com/blog/` がHTTP 200で返ることを確認する
- [x] 代表記事の既存URL互換 `https://yukiotechblog.com/<slug>/` がHTTP 200で返ることを確認する
- [x] 代表記事画像がHTTP 200で返ることを確認する
- [x] 既存公開URL63件が移行後もHTTP 200で返ることを確認する

## 8. Cutover And Rollback

- [ ] 移行直前にWordPress XMLを再エクスポートするか判断する
- [ ] さくらレンタルサーバー側の現行WordPressを一定期間残す
- [ ] `@yukiotechblog.com` のメールをさくらレンタルサーバーで使っていないことを確認する
- [ ] Cloudflare DNSのMX/TXT/SPFレコードにさくら依存が残っていて問題ないか確認する
- [ ] `mail.yukiotechblog.com` と `ftp.yukiotechblog.com` の扱いを決める
- [ ] DNS切り替え前の状態へ戻す手順をメモする
- [ ] 移行後に主要ページ、代表4記事、画像、既存URLを確認する
- [ ] Cloudflare Pages移行後、1〜2週間程度はさくらレンタルサーバーを解約せず様子を見る
- [ ] 監視期間中にアクセス、画像、既存URL、メール影響の問題がないことを確認する
- [ ] さくらレンタルサーバーの解約手順と解約日、請求締め日を確認する
- [ ] さくらレンタルサーバー解約後に `https://yukiotechblog.com/` と代表記事がHTTP 200で返ることを確認する
- [ ] 問題がなければさくらレンタルサーバー解約判断を後続タスクに回す

## 9. Out Of MVP

- [ ] git leaksの設定
- [x] Articlesをジャンルタグごとにまとめて表示できるようにする
- [ ] サイト内検索
- [ ] DNS移行後に、お名前.comからCloudflare Registrarへ `yukiotechblog.com` を移管するか検討する
- [ ] ドメイン移管する場合、お名前.com側の移管ロック解除とAuthCode/EPP code取得手順を確認する
- [ ] ドメイン移管する場合、登録者メールで移管承認できることを確認する
- [ ] 公開記事63件すべての本文品質保証
- [ ] WordPress下書き記事の移行
- [ ] WordPress固定ページの移行
- [ ] コメント移行
- [ ] 検索機能
- [ ] タグ/カテゴリページ
- [ ] RSS
- [ ] アクセス解析
