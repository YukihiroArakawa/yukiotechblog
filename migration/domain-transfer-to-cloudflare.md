# Domain Transfer To Cloudflare

`yukiotechblog.com` をお名前.comからCloudflare Registrarへ移管するためのタスクリストです。

- Created on: 2026-07-05
- Domain: `yukiotechblog.com`
- Current registrar: お名前.com / GMO Internet Group
- Current registry expiry date: 2027-03-02
- Target registrar: Cloudflare Registrar
- Related inventory: `migration/domain-dns-inventory.md`

## Goal

- ドメインのレジストラをお名前.comからCloudflare Registrarへ移管する
- DNSの管理元をCloudflareに統一する
- Cloudflare Pagesで公開中の `https://yukiotechblog.com/` を止めない

## Preconditions

- [x] Cloudflareアカウントのメールアドレスが検証済み
- [x] Cloudflareに有効な支払い方法が登録済み
- [x] `yukiotechblog.com` は登録から60日以上経過済み
- [x] `yukiotechblog.com` は直近60日以内に他社移管されていない
- [x] 登録者名、組織名、登録者メールアドレスを直近60日以内に変更していない
- [x] お名前.comの登録者メールアドレスでメールを受信できる
- [x] ドメイン有効期限が近すぎないことを確認済み
  - 2027-03-02なのでOK

## Phase 1: DNS Records Backup

- [x] お名前.com / さくら側の現在のDNSレコードを控える
  - 2026-07-05時点では、公開NSはすでにCloudflareへ切り替わっている
  - 2026-06-27時点の旧さくらDNS snapshotは `migration/domain-dns-inventory.md` に残した
- [x] Cloudflare DNSに必要なレコードが入っていることを確認する
  - apex `yukiotechblog.com` はCloudflare edgeのA/AAAAを返す
  - SPF TXTは存在する
  - MXは存在するが、メール利用有無は要確認
- [x] Cloudflare Pages向けのレコードを確認する
  - `https://yukiotechblog.com/` はHTTP 200
  - `https://yukiotechblog.pages.dev/` はHTTP 200
- [ ] `www` の扱いを確認する
  - `www.yukiotechblog.com` は名前解決されるが、`https://www.yukiotechblog.com/` はHTTP 522
  - 方針: `https://www.yukiotechblog.com/*` は `https://yukiotechblog.com/*` へ301リダイレクトする
  - 対応はドメイン移管後に保留する
  - Cloudflare Pagesの `_redirects` はdomain-level redirectsに対応していないため、Cloudflare Bulk Redirectsで設定する
  - Bulk Redirectsで preserve query string / subpath matching / preserve path suffix を有効にする
  - Cloudflare DNSで `www` を proxied record として用意する
  - 設定後に `curl --head -i https://www.yukiotechblog.com/` で `301` と `location: https://yukiotechblog.com/` を確認する
- [x] メールを使っている場合はMX/TXT/SPF/DKIM/DMARCを確認する
  - SPF TXTは存在する
  - MXは `_dc-mx.48ea0888fd54.yukiotechblog.com.` を指している
  - DMARCは未設定
  - DKIMは利用サービスが不明なため未確認
  - `@yukiotechblog.com` のメールは現在使っていない
  - 既存のMX/SPFはさくら時代の名残として、移管前は触らず保留する
- [x] 既存のDNS棚卸し `migration/domain-dns-inventory.md` を必要に応じて更新する

## Phase 2: Activate Domain On Cloudflare

Cloudflare Registrarへ移管する前に、Cloudflare上でドメインがActiveになっている必要があります。

- [x] Cloudflare Dashboardに `yukiotechblog.com` が追加済みか確認する
  - 公開NSがCloudflare assigned nameserversを返しており、apexもCloudflare経由でHTTP 200を返すためActive相当と判断
- [x] Cloudflare assigned nameserversを確認する
  - `bill.ns.cloudflare.com`
  - `kristin.ns.cloudflare.com`
- [x] お名前.com側でDNSSEC / DS recordが有効でないことを確認する
  - Public DNS上で `DS yukiotechblog.com` はなし
  - Public DNS上で `DNSKEY yukiotechblog.com` はなし
- [x] DNSSECが有効なら無効化し、反映を待つ
  - DNSSECは有効ではないため操作不要
- [x] お名前.comでネームサーバーをCloudflare指定の2つに変更する
  - 公開NSはすでに `bill.ns.cloudflare.com` / `kristin.ns.cloudflare.com`
- [x] Cloudflare Dashboardで zone status が `Active` になるまで待つ
  - Dashboard値は未確認だが、公開NSとCloudflare経由のHTTP 200を確認済み
- [x] `dig NS yukiotechblog.com` でCloudflare nameserverが返ることを確認する
  - `dig` がローカル環境になかったため `host -t NS yukiotechblog.com` で代替確認
- [x] `https://yukiotechblog.com/` が表示できることを確認する
  - `curl -I https://yukiotechblog.com/` はHTTP 200
- [ ] `https://www.yukiotechblog.com/` の挙動を確認する
  - HTTP 522のため、ドメイン移管後にBulk Redirectsでapexへ301リダイレクトする

## Phase 3: Prepare Transfer At Onamae.com

- [x] お名前.com Naviにログインする
- [x] 対象ドメイン `yukiotechblog.com` の詳細を開く
- [x] Whois情報を確認する
  - 登録者情報宛に承認依頼メールが送られるため、登録者メールを受信できることを確認済み
- [x] ドメイン移管ロック / Transfer Lock を解除する
  - AuthCode表示ができたため、移管準備を妨げる操作ロックはなしと判断
  - 2026-07-05: お名前.comのドメインプロテクション解除通知を受信
  - 通知上のドメインプロテクション状態は `無`
- [x] WHOIS上の `clientTransferProhibited` が消えることを確認する
  - 2026-07-05時点のVerisign RDAP / お名前.com RDAPでは status は `active` のみ
  - Public RDAP上では `clientTransferProhibited` は表示されていない
- [x] Whois情報公開代行や登録者情報が移管の妨げになっていないか確認する
  - Public RDAP上では Whois Privacy Protection Service by onamae.com が表示されている
  - Cloudflare Transfer Progressでは `Disable WHOIS privacy` がCompleted
  - 2026-07-05: お名前.com側でもWhois情報公開代行設定を解除
  - Cloudflare移管画面上では解除済みとして扱われているため、現時点ではブロッカーなしと判断
- [x] AuthCode / EPP code / 認証コードを取得する
- [x] AuthCodeを安全な一時メモに控える
  - AuthCode自体はリポジトリやチャットに残さない
- [ ] ドメインの登録・更新料金に未精算がないことを確認する
- [ ] 更新手続き、登録者名義変更などの各種手続き中でないことを確認する

## Phase 4: Start Transfer At Cloudflare

- [x] Cloudflare Dashboardの Registrar / Transfer domains を開く
- [x] `yukiotechblog.com` を選択する
- [x] お名前.comで取得したAuthCodeを入力する
- [x] 移管料金と1年延長の内容を確認する
- [x] 登録者情報を入力・確認する
- [x] Cloudflare Registrarの利用規約に同意する
- [x] transfer requestを送信する
- [x] Cloudflare側の transfer status を控える
  - 2026-07-05: Cloudflare Transfer Progress
    - Completed: Unlock domain
    - Completed: Disable WHOIS privacy
    - Completed: Enter authorization code
    - In progress: Wait for your domain to be released
    - Pending: Domain transfer completed

## Phase 5: Approve Transfer

- [ ] お名前.comから移管確認メールが来ていないか確認する
  - 公式ヘルプ上の件名: `【重要】トランスファー申請に関する確認のご連絡`
  - `.com` は承認メール送信日時から96時間、つまり4日後までに承認が必要
  - 承認メールはWhois情報の登録者情報宛に送信される
- [ ] Cloudflareから確認メールが来ていないか確認する
- [ ] 承認が必要なメールまたはお名前.com Navi上の操作があれば承認する
- [ ] Cloudflare Dashboardで status を定期的に確認する
- [ ] 5営業日程度待っても進まない場合は、お名前.com側のロックとAuthCodeを再確認する
  - お名前.com公式ヘルプ上は移管完了まで1、2週間前後かかる場合がある

## Phase 6: Post-Transfer Verification

- [ ] Cloudflare Registrarに `yukiotechblog.com` が表示される
- [ ] Cloudflare Registrarで自動更新設定を確認する
- [ ] 登録者情報が正しいことを確認する
- [ ] Cloudflare DNSのレコードが維持されていることを確認する
- [ ] `https://yukiotechblog.com/` が表示できる
- [ ] `https://www.yukiotechblog.com/` の挙動が期待通り
- [ ] Cloudflare Pagesの custom domain が正常
- [ ] メールを使っている場合は送受信を確認する
- [ ] 必要ならCloudflare側でDNSSECを有効化する
- [ ] お名前.com側で不要になった自動更新や関連設定を確認する

## Rollback / Safety Notes

- 移管中にDNSレコードを削除しない
- 移管完了前にお名前.comアカウントや関連メールを使えない状態にしない
- Cloudflare nameserverへ切り替えた後も、旧ホスティングやメール設定は確認が終わるまで残す
- AuthCodeは期限切れになることがあるため、失敗した場合は再取得する
- 移管失敗時はCloudflareの transfer status とお名前.com側のロック状態を先に確認する

## Useful Commands

```bash
dig NS yukiotechblog.com
dig A yukiotechblog.com
dig CNAME www.yukiotechblog.com
dig MX yukiotechblog.com
dig TXT yukiotechblog.com
```
