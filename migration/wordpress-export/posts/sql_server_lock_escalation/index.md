---
title: "[SQL Server] 行ロックを取りすぎるとテーブルロックに変わる"
date: 2025-03-15
categories: 
  - "database"
  - "performance"
  - "sql-server"
tags: 
  - "db"
  - "lock"
  - "newsql"
  - "sql-server"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-11-06.png"
slug: "sql_server_lock_escalation"
type: "post"
---

## ロックエスカレーションとは

SQL Serverには注意すべき挙動として、ロックエスカレーションというものがあります。

ロックエスカレーションとは、あるテーブルに対して行ロックを取得しすぎた場合に、代わりにテーブルロックを取得する挙動です。

## ロックエスカレーションの発生条件

具体的には、以下のいずれかの条件を満たす場合にロックエスカレーションが発生します

1. ロックメモリの閾値が40%に達する

3. 行ロックの取得数が5000を超える

この条件を満たすとテーブルロックがかかかるようになり、そのテーブルに対する処理をブロッキングするようになり、知らぬ間に他のクエリに影響を及ぼすようになります。

## なぜロックエスカレーションさせるのか？

ユーザ目線で考えると、「わざわざ行ロックを取得しているのに、なんで他のクエリにも影響するような単位のロックを勝手に取得しに行くんだよ、、」と思います。

Microsoftの公式資料によると、ロックエスカレーションを発生させる目的は「パフォーマンスの向上」「ロックメモリの調整」だそうです。

>  通常、SQL Server の既定の動作では、パフォーマンスが向上する場合、または過剰なシステム ロック メモリをより適切なレベルに減らす必要がある場合にのみ、ロックエスカレーションが発生します。
> 
> 引用：Microsoft Learn, SQL Server でロックのエスカレーションが原因で発生するブロッキング問題を解決する, [https://learn.microsoft.com/ja-jp/troubleshoot/sql/database-engine/performance/resolve-blocking-problems-caused-lock-escalation](https://learn.microsoft.com/ja-jp/troubleshoot/sql/database-engine/performance/resolve-blocking-problems-caused-lock-escalation)

パフォーマンスについては、１テーブルに対して多くの行ロックを何度も取得するよりも、一発でテーブルロックを取得したほうがロック取得のオーバーヘッドが少なくなり性能が向上するということなのでしょうか。

またインデックスにロックをかける際にも、そのインデックスをまるごとロックしたほうがメモリ的に効率的ということもあるかもしれません。

ロックメモリの調整については、Microsoftの公式ドキュメントを参考に考えると、ロックプールがメモリの60%以上を消費しないように、N個の行ロックを1個のテーブルロックに変えることでメモリを節約しているということかもしれないですね

> 動的ロック プールは、データベース エンジンに割り当てられたメモリの 60% を超えるメモリを取得しません。
> 
> 参考: Microsoft Learn, サーバー構成: ロック, [https://learn.microsoft.com/ja-jp/sql/database-engine/configure-windows/configure-the-locks-server-configuration-option?view=sql-server-ver16](https://learn.microsoft.com/ja-jp/sql/database-engine/configure-windows/configure-the-locks-server-configuration-option?view=sql-server-ver16)

## ロックエスカレーションによる障害事例

このロックエスカレーションですが、**DBのスペックに余裕をもたせ**ておいたり、**トランザクションの単位を小さく保つ**ように注意していれば、そもそも発生しないと思われますし、悪影響が及ぶものでもないと思います。

しかしながら、このロックエスカレーションによって過去にちょっとした障害が発生したことがありました。

それは「ロングトランザクションによって発生したロックエスカレーションによって他の重要なトランザクションをブロックしてしまった」というものです。

具体的には、バッチ処理でトランザクションがネストしつつ、さらにロックを開放しないまま、ロックを追加で取得するという挙動を長時間続けたことにより、テーブルロックにエスカレーションすることがありました。

結果として、そのテーブルロックによって決済システムのメインの処理である決済に失敗するということが発生しました、、、

みなさんはトランザクションあたりのロックの取得単位を小さく保ってこのような障害が発生しないように気をつけてください、、、

## 他DBではロックエスカレーションはあるのか？

ちなみに他のRDBであるMySQL(InnoDB)ではロックエスカレーションという挙動はありません。

> ロックエスカレーション
> 
> 一部のデータベースシステムで使用される操作で、多数の**行ロック**を単一の**テーブルロック**に変換し、メモリー領域を節約しますが、テーブルへの同時アクセスを削減します。
> 
> `InnoDB` では、行ロックに領域効率の高い表現が使用されるため、****lock**** エスカレーションは必要ありません。
> 
> [https://dev.mysql.com/doc/refman/8.0/ja/glossary.html#glos\_read\_committed](https://dev.mysql.com/doc/refman/8.0/ja/glossary.html#glos_read_committed)

またMySQLベースのDBであるAuroraMySQLやMySQL互換のNewSQLであるTiDBでもロックエスカレーションは発生しないとのことです(AWSのソリューションアーキテクトの方、PingCapのサポートの方にお聞きしました。)。

SQL Serverユーザの方々は気をつけましょう、、

## 参考

- 絵で見てわかるSQL Serverの仕組み, [https://amzn.to/4knxpSR](https://amzn.to/4knxpSR)

- Microsoft Learn, SQL Server でロックのエスカレーションが原因で発生するブロッキング問題を解決する, [https://learn.microsoft.com/ja-jp/troubleshoot/sql/database-engine/performance/resolve-blocking-problems-caused-lock-escalation](https://learn.microsoft.com/ja-jp/troubleshoot/sql/database-engine/performance/resolve-blocking-problems-caused-lock-escalation)

- Microsoft Learn, サーバー構成: ロック, [https://learn.microsoft.com/ja-jp/sql/database-engine/configure-windows/configure-the-locks-server-configuration-option?view=sql-server-ver16](https://learn.microsoft.com/ja-jp/sql/database-engine/configure-windows/configure-the-locks-server-configuration-option?view=sql-server-ver16)
