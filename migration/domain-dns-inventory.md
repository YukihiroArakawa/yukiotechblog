# Domain DNS Inventory

`yukiotechblog.com` のDNS/Whois控えです。

- Checked on: 2026-07-05
- Domain: `yukiotechblog.com`
- Registrar: GMO Internet Group, Inc. d/b/a Onamae.com
- Registrar WHOIS server: `whois.discount-domain.com`
- Registry expiry date: 2027-03-02
- Current authoritative nameservers:
  - `bill.ns.cloudflare.com`
  - `kristin.ns.cloudflare.com`

## Current Public DNS Records

| Name                                    | Type  | Value                                                                           |
| --------------------------------------- | ----- | ------------------------------------------------------------------------------- |
| `yukiotechblog.com`                     | SOA   | `bill.ns.cloudflare.com. dns.cloudflare.com. 2408025166 10000 2400 604800 1800` |
| `yukiotechblog.com`                     | NS    | `bill.ns.cloudflare.com.`                                                       |
| `yukiotechblog.com`                     | NS    | `kristin.ns.cloudflare.com.`                                                    |
| `yukiotechblog.com`                     | A     | `104.21.65.169`                                                                 |
| `yukiotechblog.com`                     | A     | `172.67.147.70`                                                                 |
| `yukiotechblog.com`                     | AAAA  | `2606:4700:3032::ac43:9346`                                                     |
| `yukiotechblog.com`                     | AAAA  | `2606:4700:3034::6815:41a9`                                                     |
| `www.yukiotechblog.com`                 | CNAME | `yukiotechblog.com.`                                                            |
| `www.yukiotechblog.com`                 | CNAME | `yukiotechblog.pages.dev.` observed through public resolution                   |
| `www.yukiotechblog.com`                 | A     | `172.66.44.163` observed via `yukiotechblog.pages.dev`                          |
| `www.yukiotechblog.com`                 | A     | `172.66.47.93` observed via `yukiotechblog.pages.dev`                           |
| `www.yukiotechblog.com`                 | AAAA  | `2606:4700:310c::ac42:2ca3` observed via `yukiotechblog.pages.dev`              |
| `www.yukiotechblog.com`                 | AAAA  | `2606:4700:310c::ac42:2f5d` observed via `yukiotechblog.pages.dev`              |
| `yukiotechblog.com`                     | MX    | `10 _dc-mx.48ea0888fd54.yukiotechblog.com.`                                     |
| `_dc-mx.48ea0888fd54.yukiotechblog.com` | CNAME | `yukiotechblog.pages.dev.`                                                      |
| `_dc-mx.48ea0888fd54.yukiotechblog.com` | A     | `172.66.44.163` observed via `yukiotechblog.pages.dev`                          |
| `_dc-mx.48ea0888fd54.yukiotechblog.com` | A     | `172.66.47.93` observed via `yukiotechblog.pages.dev`                           |
| `yukiotechblog.com`                     | TXT   | `"v=spf1 a:www1019.sakura.ne.jp mx ~all"`                                       |

## Empty Records Checked

The following record types were checked and returned no values:

- `CAA yukiotechblog.com`
- `TXT _dmarc.yukiotechblog.com`

## Notes

- Public Whois indicates the registrar is Onamae.com, not Sakura Internet.
- Current authoritative nameservers are already Cloudflare nameservers.
- `https://yukiotechblog.com/` returns HTTP 200 through Cloudflare.
- `https://yukiotechblog.pages.dev/` returns HTTP 200.
- `https://www.yukiotechblog.com/` returned HTTP 522 on 2026-07-05 and needs follow-up before considering `www` verified.
- Public apex A/AAAA records are Cloudflare edge addresses, not origin server addresses.
- The MX target currently resolves to `yukiotechblog.pages.dev`; confirm whether inbound mail for this domain is actually needed before changing registrar settings.
- DMARC is not configured.

## Cloudflare Assigned Nameservers

Cloudflare assigned the following nameservers during zone setup:

- `bill.ns.cloudflare.com`
- `kristin.ns.cloudflare.com`

These nameservers are already active publicly:

- `bill.ns.cloudflare.com`
- `kristin.ns.cloudflare.com`

## Previous Snapshot

The 2026-06-27 snapshot before Cloudflare nameserver activation was:

| Name                    | Type  | Value                                                                   |
| ----------------------- | ----- | ----------------------------------------------------------------------- |
| `yukiotechblog.com`     | SOA   | `master.dns.ne.jp. tech.sakura.ad.jp. 2025030216 3600 900 3600000 3600` |
| `yukiotechblog.com`     | NS    | `ns1.dns.ne.jp.`                                                        |
| `yukiotechblog.com`     | NS    | `ns2.dns.ne.jp.`                                                        |
| `yukiotechblog.com`     | A     | `219.94.129.29`                                                         |
| `www.yukiotechblog.com` | CNAME | `yukiotechblog.com.`                                                    |
| `www.yukiotechblog.com` | A     | `219.94.129.29`                                                         |
| `yukiotechblog.com`     | MX    | `10 yukiotechblog.com.`                                                 |
| `yukiotechblog.com`     | TXT   | `"v=spf1 a:www1019.sakura.ne.jp mx ~all"`                               |
