---
title: "TiDBのLONGTEXTはデフォルトだと4GB格納できない"
date: 2026-01-29
categories: 
  - "database"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-longtext-cannt-store"
type: "post"
---

v8.5のTiDBで利用できるLONGTEXTは型は最大長では4GB格納できますが、`txn-entry-size-limit`という設定により6MiB以下のデータしか保存できないようになっています。

[https://docs.pingcap.com/ja/tidb/stable/data-type-string](https://docs.pingcap.com/ja/tidb/stable/data-type-string)

> ### `LONGTEXT`型[](https://docs.pingcap.com/ja/tidb/stable/data-type-string/#code-longtext-code-type)
> 
> `LONGTEXT`型は[`TEXT`タイプ](https://docs.pingcap.com/ja/tidb/stable/data-type-string/#text-type)型と似ています。違いは、 `LONGTEXT`の最大列長が 4,294,967,295 である点です。ただし、 [`txn-entry-size-limit`](https://docs.pingcap.com/ja/tidb/stable/tidb-configuration-file/#txn-entry-size-limit-new-in-v4010-and-v500)の制限により、TiDB の単一行の最大storageサイズはデフォルトで 6 MiB となり、設定を変更することで 120 MiB まで増やすことができます。
> 
> ```
> LONGTEXT [CHARACTERSET charset_name] [COLLATE collation_name]
> ```

変更すればいいのですが、割と地雷ですね、、、

ちなみに`MEDIUMTEXT`, MEDIUMBLOB, `LONGBLOB`型についても同様にこの制約に引っかかります。

要注意ですね、、

(追記) txn-entry-size-limitを変更する場合、TiKV側のraft-entry-max-sizeも同様に変える必要があるようです。TiDBとしてOKだとしてもTiKVとしてNGでデータ更新に失敗するというわけですね。

[https://docs.pingcap.com/tidb/stable/tidb-configuration-file/#txn-entry-size-limit-new-in-v4010-and-v500:~:text=item%2E-,Note,time](https://docs.pingcap.com/tidb/stable/tidb-configuration-file/#txn-entry-size-limit-new-in-v4010-and-v500:~:text=item%2E-,Note,time)

> Note that TiKV has a similar limit. If the data size of a single write request exceeds [`raft-entry-max-size`](https://docs.pingcap.com/tidb/stable/tikv-configuration-file/#raft-entry-max-size), which is 8 MB by default, TiKV refuses to process this request. When a table has a row of large size, you need to modify both configurations at the same time.
