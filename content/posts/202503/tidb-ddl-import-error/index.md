---
title: "TiDB CloudのコンソールからDDLをインポートした際に「The table 'Hoge' has some problems with the schema file: [ddl:1067]Invalid default value for 'created_at'\" }. Please check the content of the schema file.」というエラーが出た"
date: 2025-03-19
categories: 
  - "amazon-aurora"
  - "database"
  - "mysql"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-ddl-import-error"
type: "post"
---

## 環境

- 実施日: 2025/03/18

- TiDB: TiDB Cloud Dedicated v8.1.2

- Mac OS: Sequoia 15.3.2 (24D81)

- tiup: 1.16.1 v1.16.1-nightly-20

- go: go1.21.13

- dumpling: v8.5.1

## やろうとしていたこと

AuroraMySQLのスナップショットからTiDBにデータを復元するために、まずはDDLをimportする必要があった。

[https://dev.classmethod.jp/articles/aurora-mysql-migrate-to-tidb-serverless](https://dev.classmethod.jp/articles/aurora-mysql-migrate-to-tidb-serverless)

そこで、TiDBのツールdumplingを利用してAuroraMySQLのDDLをS3にエクスポートし、その上で、DDLをTiDB Consoleからimportしようとしたらバリデーションエラーが発生した。

## 発生した問題「Invalid default value for 'created\_at'" }.」

### エラー内容

```
The table 'Hoge' has some problems with the schema file: [ddl:1067]Invalid default value for 'created_at'" }. Please check the content of the schema file.
```

### 対象のテーブルのDDL

```
/*!40014 SET FOREIGN_KEY_CHECKS=0*/;
/*!40101 SET NAMES binary*/;
CREATE TABLE `Hoge` (
  `id` int NOT NULL AUTO_INCREMENT,
  ...
  `created_at` datetime(2) NOT NULL DEFAULT (now()),
  `updated_at` datetime(2) NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### TiDBではテーブルのデフォルト値にNOWは利用可能

TiDB Docsによると、以下の通りNOWメソッドは利用可能であると思われる。

> 時間型の場合、 `TIMESTAMP`と`DATETIME`列のデフォルト値として`NOW` 、 `CURRENT_TIMESTAMP` 、 `LOCALTIME` 、および`LOCALTIMESTAMP`関数を使用できます。

[https://docs.pingcap.com/ja/tidb/stable/data-type-default-values](https://docs.pingcap.com/ja/tidb/stable/data-type-default-values)

## 必要な対応: datetimeカラムとnowメソッドでprecisionを合わせる

PingCapの方に問い合わせしたところ、datetimeカラムでdatetime(2)のようにprecisionを指定した場合は、デフォルトバリューのnow()のprecisionもnow(2)のように合わせる必要があるそうだった。

```
/*!40014 SET FOREIGN_KEY_CHECKS=0*/;
/*!40101 SET NAMES binary*/;
CREATE TABLE `Hoge` (
  `id` int NOT NULL AUTO_INCREMENT,
  ...
  -- `created_at` datetime(2) NOT NULL DEFAULT (now()),
  -- `updated_at` datetime(2) NOT NULL DEFAULT (now()),
  ++ `created_at` datetime(2) NOT NULL DEFAULT (now(2)),
  ++ `updated_at` datetime(2) NOT NULL DEFAULT (now(2)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

なお、MySQLの場合はdatetimeカラムとnowメソッドのprecisionを合わせる必要がないので、こちらの非互換性が意図したものかどうかは調査中とのこと。

\=> 非互換性がある部分でした。

こちらの非互換性に関する詳しい説明については以下のブログにて解説していますので、ぜひご覧ください

https://yukiotechblog.com/top/tidb-mysql-difference-of-datetime-default-value
