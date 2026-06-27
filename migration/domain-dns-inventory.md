# Domain DNS Inventory

`yukiotechblog.com` をCloudflareへ移行する前のDNS/Whois控えです。

- Checked on: 2026-06-27
- Domain: `yukiotechblog.com`
- Registrar: GMO Internet Group, Inc. d/b/a Onamae.com
- Registrar WHOIS server: `whois.discount-domain.com`
- Registry expiry date: 2027-03-02
- Current authoritative nameservers:
  - `ns1.dns.ne.jp`
  - `ns2.dns.ne.jp`

## Current DNS Records

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

## Empty Records Checked

The following record types were checked and returned no values:

- `AAAA yukiotechblog.com`
- `CAA yukiotechblog.com`

## Notes

- Public Whois indicates the registrar is Onamae.com, not Sakura Internet.
- Current nameservers are Sakura's `dns.ne.jp` nameservers.
- The apex A record points to `219.94.129.29`, which appears to be the current Sakura rental server destination.
- Keep Sakura rental server running during DNS propagation and initial Cloudflare verification.

## Cloudflare Assigned Nameservers

Cloudflare assigned the following nameservers during zone setup:

- `bill.ns.cloudflare.com`
- `kristin.ns.cloudflare.com`

Replace the previous nameservers with these values at the registrar:

- Remove `ns1.dns.ne.jp`
- Remove `ns2.dns.ne.jp`
- Add `bill.ns.cloudflare.com`
- Add `kristin.ns.cloudflare.com`
