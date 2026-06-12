---
title: "TiDB Cloudで外部キー制約のチェックをGLOBALスコープでオフにしても、引き続きチェックが走る [TiDB Cloud Dedicated]"
date: 2025-03-27
categories: 
  - "database"
  - "performance"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-cloud-cannot-stop-fk-check"
type: "post"
---

## やりたかったこと「外部キー制約のチェックをオフにしたい」

TiDB Cloudでの性能試験時にインサートのクエリが遅くなっており、実行計画を見ると外部キー制約のチェックで4秒ほど時間を使っていることがわかりました。

TiDBにおいて外部キー制約によってインサートが遅くなる理由については以下の記事で紹介しています。  
[https://yukiotechblog.com/new-sql-fk-is-demerit/](https://yukiotechblog.com/new-sql-fk-is-demerit/)

上記の性能劣化を防ぐために、一時的にグローバルスコープで外部キー制約のチェックをオフにしようと以下のクエリを叩きました。

```
SET GLOBAL FOREIGN_KEY_CHECKS = 0;
```

環境変数の状態は以下のクエリで確認できます

```
SHOW VARIABLES
```

## 性能試験を再開しても、クエリは遅いまま、、

しかし、制約をオフにしたあともクエリは遅いままでした

また実行計画を見ても、「Foreign\_Key\_Check\_X」が実行されていることが確認できました。

## 解決策「TiDB Cloudを停止・再開したら制約のチェックが走らなくなった」

解決策としてはTiDB Cloudを停止・再開したら制約のチェックが走らなくなり、スロークエリに先程のクエリが上がってこなくなりました。

これについてPingCapのサポートに問い合わせたところ、「GLOBALは動いているセッションには影響を与えないため、INSERTしているセッションが環境変数の変更前から接続したままの場合は挙動が変わらないかもしれない」とのことでした。

なのでDBの接続をつなぎなおすことでもこの問題は解消できるかも知れません。
