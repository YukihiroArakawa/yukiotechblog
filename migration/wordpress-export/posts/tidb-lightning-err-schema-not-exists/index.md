---
title: "[TiDB] Aurora MySQLのスナップショットをLightningでTiDBに復元しようとしたら「tidb lightning encountered error: [Lightning:Restore:ErrSchemaNotExists]table hoge.gz schema not found」が出た"
date: 2025-03-24
categories: 
  - "amazon-aurora"
  - "database"
  - "mysql"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-lightning-err-schema-not-exists"
type: "post"
---

## What I do: やろうとしていたこと

Aurora MySQLのスナップショットをTiDB Cloud Dedicatedに復元する

## Encountered Error: 発生したエラー

### toml for lightning: ライトニング実行時のtomlファイル

```
[tidb]
host = ${host}
port = ${port}
user = ${user}
password = ${password}
tls = "cluster"

[tikv-importer]
backend = "tidb"

[mydumper]
data-source-dir = ${s3-dir}

[security]
ca-path = "${ca-path}"
```

### Command: 実行したコマンド

以下のコマンドでライトニングを実行したところ以下のエラーが発生。

```
$ tiup tidb-lightning -config tidb-lightning-data.toml
```

### Error「Lightning:Restore:ErrSchemaNotExists」

```

➜  db_transplant git:(main) tiup tidb-lightning -config tidb-lightning-data.toml
Starting component tidb-lightning: 

...

Verbose debug logs will be written to /var/folders/cj/ng251xx12_v_n6ddxxg8d4nm0000gq/T/lightning.log.2025-03-19T16.14.19+0900

tidb lightning encountered error: [Lightning:Restore:ErrSchemaNotExists]table `hoge`.`gz` schema not found
```

## how to solve「excluding system schema of Aurora MySQL」: 解決方法「Aurora MySQLのシステムスキーマを除外する」

以下のようにmydumper.filterを追加して、システムスキーマを除外する

```
[tidb]
host = ${host}
port = ${port}
user = ${user}
password = ${password}
tls = "cluster"

[tikv-importer]
backend = "tidb"

[mydumper]
data-source-dir = ${s3-dir}

### 

# Configures the wildcard rule. By default, all tables in the mysql, sys, INFORMATION_SCHEMA, PERFORMANCE_SCHEMA, METRICS_SCHEMA, and INSPECTION_SCHEMA system databases are filtered.
# If this item is not configured, the "cannot find schema" error occurs when system tables are imported.
# ワイルドカードルールを設定します。デフォルトでは、mysql、sys、INFORMATION_SCHEMA、PERFORMANCE_SCHEMA、METRICS_SCHEMA、および INSPECTION_SCHEMA の各システムデータベース内のすべてのテーブルがフィルタされます。
# この項目が設定されていない場合、システムテーブルをインポートする際に「スキーマが見つかりません」というエラーが発生します。

filter = [
  "*.*",
  "!mysql.*",
  "!sys.*",
  "!INFORMATION_SCHEMA.*",
  "!PERFORMANCE_SCHEMA.*",
  "!METRICS_SCHEMA.*",
  "!INSPECTION_SCHEMA.*"
]

### 

[security]
ca-path = "${ca-path}"
```

## Reference

[https://dev.classmethod.jp/articles/aurora-mysql-migrate-to-tidb-serverless](https://dev.classmethod.jp/articles/aurora-mysql-migrate-to-tidb-serverless)

[https://docs.pingcap.com/ja/tidb/stable/migrate-large-mysql-to-tidb/#step-1-export-all-data-from-mysql](https://docs.pingcap.com/ja/tidb/stable/migrate-large-mysql-to-tidb/#step-1-export-all-data-from-mysql)

[https://docs.pingcap.com/ja/tidb/stable/get-started-with-tidb-lightning](https://docs.pingcap.com/ja/tidb/stable/get-started-with-tidb-lightning)
