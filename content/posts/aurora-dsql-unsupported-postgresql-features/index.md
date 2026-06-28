---
title: "[Aurora DSQL] Aurora DSQLでサポートしていないPostgreSQLの機能"
date: 2025-03-16
categories: 
  - "amazon-aurora"
  - "database"
  - "postgresql"
coverImage: "aws.jpg"
slug: "aurora-dsql-unsupported-postgresql-features"
type: "post"
---

Amazon Aurora DSQLというポスグレ互換のNewSQLが2024年末に発表されたが、サポートされていないポスグレの機能もあるとのこと。

[https://docs.aws.amazon.com/aurora-dsql/latest/userguide/working-with-postgresql-compatibility-unsupported-features.html](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/working-with-postgresql-compatibility-unsupported-features.html)

## サポートしていないオブジェクト

まずサポートしていないオブジェクトは以下の通り。

> - Databases - Aurora DSQL supports only one database per cluster at this time.
> 
> - Views
> 
> - Temporary Tables
> 
> - Triggers
> 
> - Types
> 
> - Tablespaces
> 
> - UDFs / Functions other than functions using language = SQL
> 
> - Sequences

TiDBでもトリガーはサポートしていないものの、ビューやシーケンスなどもサポートしていない模様、、

そのためビューを使っているPostgreSQLからDSQLに移行する場合は修正が求められそう、、

## サポートしていない制約

サポートしていない制約としては「外部キー制約」と「排他制約」がある。

> - Foreign keys
> 
> - Exclusion constraints

DBレベルでデータ不整合を防ぐ基本的な仕組みである外部キー制約が使えないのは中々厳しそう、、、

TiDBでは外部キー制約が利用できるものの、外部キー制約が貼ってある小テーブルに対して挿入を行うとパフォーマンスが劣化するとの報告がされているので、分散DBと外部キー制約は相性が悪いということかもしれない

https://tech-blog.tokyo-gas.co.jp/entry/2025/02/26/123110

「排他制約 (Exclusion Constraint) 」とは特定の条件を満たすデータの重複を禁止するための制約として、PosgreSQLで利用可能だが、DSQLではそれが利用できない。

例えば「1つのリソースを同じ時間に2人以上が予約できないようにする」みたいなことがPosgreSQLでは可能だが、DSQLではアプリレベルで頑張る必要がありそう

```
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    resource_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    EXCLUDE USING GIST (
        resource_id WITH =,
        tstzrange(start_time, end_time) WITH &&
    )
);
```

## サポートしていないオペレーション

サポートされていないオペレーションは以下の通り。

> - ALTER SYSTEM
> 
> - TRUNCATE
> 
> - VACUUM
> 
> - SAVEPOINT

１つ気になったのがTruncateが使えない点

delete文をテーブル全体に実行するよりtruncateしたほうが早かったりするのだが、DSQL ではTruncateをサポートしていない

まぁNewSQLだし、わざわざtruncateしなくても高速にdeleteできるのかもしれない、、

## サポートしていない拡張機能

サポートされていない拡張機能は以下の通り

> - PL/pgSQL
> 
> - PostGIS
> 
> - PGVector
> 
> - PGAudit
> 
> - Postgres\_FDW
> 
> - PGCron
> 
> - pg\_stat\_statements

AIでの検索で有用なベクターや地理情報に関する拡張機能も利用できない

## サポートしていないSQL構文

サポートしていない構文は以下の通り

> - CREATE VIEW
> 
> - CREATE INDEX \[ASYNC\]（ASC / DESC の使用不可）
> 
> - CREATE INDEX（テーブルにデータがある場合は使用不可）
>     - 既存のデータがあるテーブルにインデックスを作成するには、[Creating async indexes in Aurora DSQL](https://docs.aws.amazon.com/) を参照
> 
> - CREATE TABLE（COLLATE、AS SELECT、INHERITS、PARTITION は使用不可）
> 
> - CREATE FUNCTION（LANGUAGE plpgsql や sql 以外の言語は使用不可）
> 
> - CREATE TEMPORARY TABLES
> 
> - CREATE EXTENSION
> 
> - CREATE SEQUENCE
> 
> - CREATE MATERIALIZED VIEW
> 
> - CREATE TABLESPACE
> 
> - CREATE TRIGGER
> 
> - TRUNCATE（使用不可）
> 
> - ALTER SYSTEM（全ての ALTER SYSTEM はブロックされている）
> 
> - CREATE TYPE
> 
> - CREATE DATABASE

うーん、パーティションも利用できなさそうでTiDBに比べると機能差が目立つ、、

## その他の制限事項

他の制限事項は以下の通り。

> - CREATE DATABASE
>     - Aurora DSQLでは 1つのデータベース（postgres）のみ をサポート
>     
>     - データベースのエンコーディングは UTF-8
>     
>     - 照合順序（collation）はCのみ 設定可能
>     
>     - システムのタイムゾーンはUTCに固定（変更不可）
> 
> - SET TRANSACTION \[ISOLATION LEVEL\]
>     - Aurora DSQLの トランザクション分離レベルはPostgreSQLのRepeatable Readと同等
>     
>     - この分離レベルを変更することはできない
> 
> - DDL（データ定義言語）とDML（データ操作言語）の混在不可
>     - 1つのトランザクション内で DDL（CREATE, ALTER, DROP など）とDML（INSERT, UPDATE, DELETE など）を同時に実行できない
> 
> - 1つのトランザクションに含められるDDL文は最大1つ
>     - 複数のDDL文を含むトランザクションは実行できない
> 
> - 1トランザクションで更新できる行数の上限は10,000行
>     - ただし、この上限はセカンダリインデックスのエントリによって変動
>     
>     - 例：
>         - 5カラムのテーブルで、主キーが1列目、5列目にセカンダリインデックスがある場合
>         
>         - すべてのカラムを更新する場合 → 1行の更新で「主キーの行＋セカンダリインデックスの行」の2行がカウント
>         
>         - セカンダリインデックスのないカラムのみを更新する場合 → 1行の更新は1カウント
>     
>     - この制限はすべてのDML文（INSERT, UPDATE, DELETE）に適用
> 
> - 1つの接続の最大持続時間は1時間
>     - Aurora DSQLでは、1つのデータベース接続が最大1時間までとなり、それを超えると接続は切断される
> 
> - AutoVacuum により統計情報を自動更新
>     - Aurora DSQLではVacuumを手動で実行する必要はなく、統計情報の更新はAutoVacuumによって管理される

「１つのトランザクションに含められるDDLが１つだけ」というのが気になる、、

まぁアプリレベルでトランザクション貼って、その中で各クエリのトランザクションを貼ることになるのかな、、（それもできないとなるとかなり厳しい、、）

あとは、「１トランザクションで更新できる行数は１万行まで」というのも気になった、、

基本的には更新行数は少なく絞ったほうがロックの観点では良いと思うが、大量データを作成するバッチ処理などではコミットする単位が大きくできる方がクエリ実行に係るオーバーヘッドが少なくなるので処理速度が向上する。

状況に応じてユーザ側でコミット行数をコントロールできないのが少々気になった、、

## まとめ

PostgreSQLを使っていた製品からDSQLへ移行するハードルはかなり高そうに感じた

TiDBではプロシージャやトリガーは使えないものの、それ以外の機能はMySQLと高い互換性を持っているので移行がしやすいが、DSQLはPostgreSQLとの乖離が結構大きい、、

なので使うとしたら新規開発になりそうだが、PostgreSQL互換を謳うNewSQLは他にもあるので、そちらでも良さそうな気がした

## 参考記事

- [https://docs.aws.amazon.com/aurora-dsql/latest/userguide/working-with-postgresql-compatibility-unsupported-features.html](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/working-with-postgresql-compatibility-unsupported-features.html)

- [https://qiita.com/ninja-yuki/items/e1a30676e597783c602f](https://qiita.com/ninja-yuki/items/e1a30676e597783c602f)
