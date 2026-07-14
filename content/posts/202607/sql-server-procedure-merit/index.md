---
title: "ストアドプロシージャの意外なメリット"
date: 2026-07-14
categories: ["database", "sql-server"]
slug: "sql-server-procedure-merit"
type: "post"
---

## 悪名高きストアドプロシージャ

2026年現在、ストアドプロシージャはなるべく使わないほうがいいよねという意見を持つ人も多くなってきたかと思います。

ストアドプロシージャを過度に使ってしまうと、以下のような問題が発生するためです。

- ビジネスロジックがストアドプロシージャに固まってしまう
- ビジネスロジックをテストするためにDBを使ったテストが必須となり、テスト速度が遅くなる
- DBMSごとに独自の記法が存在しておりORMでカバーできず、DB移行時の障壁となる
- リリース時にDDL変更が発生する. CI/CD周りが非常にダルい. 
    - AP側の変更であれば、APイメージをプッシュしてコンテナを再起動すればよいし、無停止でのデプロイが容易にできるエコシステムが整っている. 

## 流行りのNewSQLでも未サポートな製品は多い(2026年現在)

最近流行りのNewSQL(TiDB, Aurora DSQLなど)でもプロシージャはサポートしていないです。

- https://docs.pingcap.com/ja/tidb/stable/mysql-compatibility/
- https://docs.aws.amazon.com/aurora-dsql/latest/userguide/working-with-postgresql-compatibility-migration-guide.html#:~:text=SQL%20functions%20for,like%20PL/pgSQL.

SQL互換性が売りであるNewSQLでもサポートされていないものがあるというのは、機能的な優先順位が低いことの証左ではないでしょうか。

ちなみに以下製品ではサポートされていました。すごい。

- https://www.cockroachlabs.com/docs/stable/stored-procedures
- https://docs.yugabyte.com/stable/explore/ysql-language-features/advanced-features/stored-procedures/
- https://docs.cloud.google.com/spanner/docs/reference/standard-sql/stored-procedures

## ストアドプロシージャのメリットは何？

それでは、どんな思いでストアドプロシージャを使っていたのかというと、以下のようなメリットが語られることがあります。

- 複数回クエリを実行する場合のClient <-> DB Server間のオーバーヘッドがなくなるため、パフォーマンス上有利
- APサーバが貧弱だった時代はDBにヘビーな処理をさせたいユースケースがあったため
    - 諸説あり
    - Xでミックさんが言っていた気がする. 

## 他にも意外なメリットが

ここがこの記事の本題になるのですが、よく語られる上記のメリット以外にもパフォーマンス上のメリットがありました。

みなさん、わかりますか？

## 答え: 実行計画生成時のキャッシュが効きやすい(らしい)

Microsoftの公式資料のquery processing architecture guideを読んでみると、以下の記載があります。

> The main performance advantage that stored procedures and triggers have in SQL Server compared with batches of dynamic Transact-SQL is that their Transact-SQL statements are always the same. Therefore, the relational engine easily matches them with any existing execution plans. Stored procedure and trigger plans are easily reused.

https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide?view=sql-server-ver17#stored-procedure-and-trigger-execution:~:text=The%20main%20performance,are%20easily%20reused.

つまり、ストアドプロシージャの中で実行されるSQLは毎回変わらないので、実行計画生成時にキャッシュが効きやすいよと言っているわけです。

## 本当に？？

本当にそうかという感はありますが、この記事を調べるにあたった背景として業務中で、ストアドプロシージャを廃止してORMのロジック郡に書き換えた際に、リリースの際にSQLCompilationsというメトリクスが10倍程度上昇したことがありました。

因果関係があるかまで特定はできませんでしたが、MS公式の説明に対して納得感がある事象でした。

## おわりに

ストアドプロシージャのメリットに対してキャッシュが効きやすいという話は聞いたことがなかったので、面白いと思い勢いで記事を書いてしまいました。

なので、プロシージャのメリデメ周りに対して出所を示せていません。

参考程度に読んでください。

