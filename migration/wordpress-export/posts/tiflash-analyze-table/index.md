---
title: "TiFlashをテーブルに設定したがTiFlashが使われない問題の解決 ~ANALYZE TABLEの実施~"
date: 2025-08-30
categories: 
  - "mysql"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tiflash-analyze-table"
type: "post"
---

## TiFlashの利用方法

TiDB Cloud DedicatedではTiFlashを簡単に利用することができます。

利用方法は以下のとおりです。

1. TiDB Cloud DedicatedのConsole画面からクラスターを変更し、TiFlashを追加する

3. ALTER TABLE table\_name SET TIFLASH REPLICA count;を実行して任意のテーブルをTiFlashにもレプリケーションするように設定する

5. クエリを実行する
    - クエリオプティマイザがTiKVよりもTiFlashを使ったほうが低コストだと判断した場合、自動でTiFlashからデータが取得される（Smart Selection）

[https://docs.pingcap.com/tidb/stable/create-tiflash-replicas](https://docs.pingcap.com/tidb/stable/create-tiflash-replicas)

## 重めの集計クエリを実行してもTiFlashが利用されない

しかし複雑な集計クエリを投げてもTiFlashは利用されませんでした、、

データ量は100万件超なのでTiFlashを使ったほうが高速なはずです。

## 解決方法１）ヒント句でTiFlashの利用を指定する

ワークアラウンド的な解決策としては、ヒント句でTiFlashを利用するように指定することです。

```
select /*+ read_from_storage(tiflash[table_name]) */ column_name1, ...column_name_n
from table_name;
```

[https://docs.pingcap.com/tidb/stable/use-tidb-to-read-tiflash](https://docs.pingcap.com/tidb/stable/use-tidb-to-read-tiflash)

上記のように指定することでTiFlashにデータが存在する場合TiFlashを利用するようになりました。

## 解決方法2) ANALYZE TABLEでテーブルの統計情報を更新する

先述の方法でも解決可能ですが、根本的な原因としてはanalyze tableが自動で実行されない設定に変更していたことで、古い統計情報を元にクエリプランが生成され、結果としてTiKVが利用されていたことでした。

そもそもなぜ統計情報が更新されないようにしていたのかというと、AWS DMSというデータ移行ツールを利用してSQL ServerからTiDBにデータ移行をしている際に「region is unavailable」というエラーがでてTiKVでデータ挿入がコケるという事象が発生していました。

このエラーは特定のTiKVのリージョン(raft group)に処理が集中した際に発生するエラーであるため、ping cap社のSAさんから「analyze tableを一時的に実行されないようにすることで、発生頻度を下げられるかもしれないです」というアドバイスをいただきました。

そこで以下の設定をオフにすることで自動でanalyze tableが実行されないようにして、、リージョンに必要以上に負荷がかからないようにしました。

```
SET GLOBAL tidb_enable_auto_analyze=OFF
```

[https://docs.pingcap.com/tidb/dev/statistics](https://docs.pingcap.com/tidb/dev/statistics)

この変更によって確かにリージョンエラーは出なくったのでDMSとしては良かったのですが、他のクエリには意図しない影響が及ぶようになりました、、、

上記を踏まえて、デフォルト値であるtidb\_enable\_auto\_analyze=ONにして、さらにANALYZE TABLE table\_name;を実行することで統計情報を更新することで、TiFlashを利用させるようにできました。

DB移行の際に設定を変えた場合はすぐに戻すように気をつけたいですね、、
