---
title: "[TiDB] TiDBのdumplingでAuroraMySQLのDDLをダンプして、TiDB Cloud Consoleからインポートするとgeometory型でバリデーションエラーが出る"
date: 2025-03-19
categories: 
  - "amazon-aurora"
  - "database"
  - "mysql"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-ddl-import-error-geometry"
type: "post"
---

## やっていたこと

以下の記事を参考にAuroraMySQLのデータをTiDBに積み直していました。

前段としてAuroraMySQLのDDLをTiDBにインポートする必要があったので、dumplingというTiDBのツールでAuroraMySQLのDDLをダンプして、そのデータをTiDB CloudのConsoleからインポートしようとしていました。

[https://dev.classmethod.jp/articles/aurora-mysql-migrate-to-tidb-serverless](https://dev.classmethod.jp/articles/aurora-mysql-migrate-to-tidb-serverless)

## 発生したエラー「geometry型でバリデーションエラー」

しかし、DDLのインポート中に以下のバリデーションエラーが出ました。

```
The table 'Hoge' has some problems with the schema file:

line 25 column 20 near \\"geometry  

… 

Please check the content of the schema file.
```

バリデーションエラーだけ見るとどこが悪いのかは教えてくれますが、何が悪いのかはわからないですね、、

## TiDBではSPATIAL型全般をサポートしていない

そこでTiDB Docsを見てみたところ以下の通りTiDBではgeometry型を含むSPATIAL型の機能をサポートしていないとのことでした。

> サポートされていない機能  
> ストアドプロシージャと関数  
> トリガー  
> イベント  
> ユーザー定義関数  
> FULLTEXT構文とインデックス＃1793  
> SPATIAL ( GIS GEOMETRYも呼ばれる)関数、データ型、インデックス＃6347

[https://docs.pingcap.com/ja/tidb/stable/mysql-compatibility](https://docs.pingcap.com/ja/tidb/stable/mysql-compatibility)

dumplingはTiDBのツールになるので、そこはDDLをダンプした段階でバリデーションエラー出してほしいなぁ、、と思いました（OSSコミットのチャンスかもしれないですね

それか、コンソールのバリデーションエラーの内容をもっと詳細にしてほしいなと思いました、、、、（これもOSSだったけ、、、

## 対応

そこで一次対応としては対象テーブルのgeometory型のカラムをDDLから削除して、そのファイルをS3に上げ直して再度インポートを実行したところ、無事通りました。

またAuroraMySQLからも対象のカラムを一旦ドロップしてスナップショットを取得したので、そこからTiDBに復元しようかと思います。

恒久的にはgeometory型ではなく、緯度経度をそれぞれカラムに持たせるようにする必要がありそうですね、、

おしまい
