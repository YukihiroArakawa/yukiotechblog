---
title: "[TiDB v8.1.2] datetime型のカラムとデフォルト値の精度が異なる場合の挙動がTiDBとMySQLで異なる。"
date: 2025-03-19
categories: 
  - "amazon-aurora"
  - "database"
  - "mysql"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-mysql-difference-of-datetime-default-value"
type: "post"
---

## 環境情報

- MySQLの環境: AuroraMySQL (MySQL 8系)

- TiDB Cloud: v8.1.2

## MySQLの挙動「datetime型のカラムとデフォルト値のNOW()メソッドの精度が合っていなくてもエラーにならない」

MySQLには日付型の中にTIMESTAMPと言う型があるようですが、このカラムとデフォルト値の精度が合わないとエラーが発生するようです。

```
-- これは通らない
mysql> CREATE TABLE t1 (ts TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP);
ERROR 1067 (42000): Invalid default value for 'ts'

-- これは通らない
mysql> CREATE TABLE t1 (ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP(6));
ERROR 1067 (42000): Invalid default value for 'ts'

-- これは通る
mysql> CREATE TABLE t1 (ts TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6));
Query OK, 0 rows affected (0.02 sec)
```

ただ別の日付型であるDATETIME型では上記とは異なり、カラムの精度とデフォルト値であるNOW()の精度が異なっていても、クエリに成功します。

```
-- これだけ通るので日付型の中で整合性が取れていない
CREATE TABLE t1 (ts DATETIME(2) DEFAULT (NOW()) );
```

またNOW()はNOW(0)として解釈され、DATETIME(2)には小数点第2位まで0埋めの値が入るようです。

この挙動は2013年にバグとしてイシューが立てられていますが2025年現在、修正の対応はされていないようです。

[https://bugs.mysql.com/bug.php?id=70739](https://bugs.mysql.com/bug.php?id=70739)

## TiDBの挙動「DATETIME型とデフォルト値の精度が異なる場合はエラーになる」

TiDBの挙動としては日付型とデフォルト値の精度が異なる場合はDATETIME型でもTIMESTAMP型でもエラーとなります。

```
-- MySQLと同様にエラーになる
CREATE TABLE t1 (ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP(6));
=> error: mysql: 1067: Invalid default value for 'ts'

-- MySQLとは異なりエラーになる
CREATE TABLE t1 (ts DATETIME(2) DEFAULT (NOW()) );
=> error: mysql: 1067: Invalid default value for 'ts'
```

このTiDBとMySQLの差異については2025/03/19にバグレポートが提出されています。

[https://github.com/pingcap/tidb/issues/60166](https://github.com/pingcap/tidb/issues/60166)

## 補足: TiDBのサポート&開発者陣のレスが速すぎて驚いた

2025/03/19にPingCapの方に確認をしたら、数時間もしないうちに差異の内容とバグレポートが上がりました。

グローバル企業なのにすごいスピード感だと思いました、、、

ここまでのスピード感だからこそグローバル企業としてやっていけているのかもしれないですが、、
