---
title: "JOOQのbulk update, batch update, for文でのupdateはどれくらいの速度差があるのか？"
date: 2025-03-16
categories: 
  - "database"
  - "performance"
coverImage: "Screenshot-from-2025-03-23-15-32-30.png"
slug: "jooq-bulk-update-experiment"
type: "post"
---

## 目次

1. はじめに

3. jOOQとは

5. 1万件のレコードをjOOQでアップデートする際の性能

7. おわりに

## 1\. はじめに

みなさんDBのデータ更新をする際になんとなくupdateしてませんか？

実は数万件単位のupdateをする際に、愚直にupdateするのとbulk updateするのとでは場合によっては100倍もの速度差がでることがあります。

本記事は, なんとなく機能要件を満たす開発スキルが身に付いてきた駆け出しのソフトウェアエンジニアに向けて効率的なupdateの方法とその仕組みについてご紹介したいと思います。

## 2\. JOOQとは

読者のみなさんがWeb開発者なのであれば、データベースへアクセスするためにSQLやORM(Object Rerational Mapper)などを使ったことがあると思います。

例えば、RubyのフレームワークのRuby on Railsを使用している場合であればActive Record、LaravelではEloquentなどのORMを使ったことがあるかもしれません。

本記事ではJavaのORMであるjOOQに焦点を当てて効率的なupdateとその仕組みについて見ていきたいと思います。

jOOQとはJavaのORMであり、javaコンパイラからSQLのシンタックスを生成することで型安全にしています\[1\]。

JOOQによるDBのupdate文には主に次の3種類があります。

1. update

3. batch update

5. bulk update

1つ目は純粋なupdate文で1文が1クエリに相当します。  
1文が1クエリに相当するので100回だけSQL文を実行すれば100回DBサーバへSQL文が送信され、DBサーバ内で100回接続・切断が行われることになります。  
更新したい行ごとにクエリを書き分けられるため複数行の更新を柔軟に行えることが利点ですが、DBサーバへの通信のオーバヘッドとDBサーバ内のDB接続・切断のオーバーヘッドが大きいのが欠点です。

2つ目はbatch updateであり、複数のSQL文をまとめてDBサーバへ送信して、DBサーバでは1つのSQL文ずつ実行される方法です\[2\]。  
例えば以下の例はInsertですが、updateに関しても以下のように柔軟な書き方で複数のクエリをまとめて書くことができます。

```
create.batch(
    create.insertInto(AUTHOR, ID, FIRST_NAME, LAST_NAME).values(1, "Erich"  , "Gamma"    ),
    create.insertInto(AUTHOR, ID, FIRST_NAME, LAST_NAME).values(2, "Richard", "Helm"     ),
    create.insertInto(AUTHOR, ID, FIRST_NAME, LAST_NAME).values(3, "Ralph"  , "Johnson"  ),
    create.insertInto(AUTHOR, ID, FIRST_NAME, LAST_NAME).values(4, "John"   , "Vlissides"))
.execute();
```

batch updateの利点は複数のクエリを1回の通信でDBサーバへ送れるため、DBサーバへの通信のオーバーヘッドが小さいことが挙げられます。  
また柔軟にクエリの中身を構築できる点も利点として挙げられるでしょう。  
一方で欠点としては、DB接続・切断がクエリごとに発生してしまうことによるオーバーヘッドが1つ目のupdate文と同様にあります。

3つ目はbulk updateであり、IN区やBETWEEN区で複数行がヒットした際に1つのクエリで一括でテーブルを更新する方法です。  
例えば100行の更新をbulk updateで行う場合は、DBサーバへ1回SQL文を送信して、DBサーバ内で1回接続して、複数行更新して、DBを切断するという流れで処理がされます。  
この方法の利点は1つのクエリで複数行の更新を行うためDBサーバへの通信のオーバヘッドが小さいという点があります。  
また複数行の更新が走るものの、クエリとしては1つなので、DB接続・切断のオーバーヘッドを小さくできるという利点があります。  
一方で欠点としては、クエリを書く際の柔軟性が低く、行ごとに更新したい内容が大きく異なる場合はクエリが複雑化する可能性があります。

## 3\. 1万件のレコードをjOOQでアップデートする際の性能

先ほど説明した3種類のupdateの方法ですが、それぞれどれほどの性能差があるのでしょうか？

jOOQの公式ブログに1万件のupdate文を実行した実験が上がっていたので、参照してみましょう\[3\]。

### 3.1. 実験の条件

実験の条件は以下の通りになります。

- 対象のテーブル

```
CREATE TABLE post (
  id INT NOT NULL PRIMARY KEY,
  text VARCHAR2(1000) NOT NULL,
  archived NUMBER(1) NOT NULL CHECK (archived IN (0, 1)),
  creation_date DATE NOT NULL
);

CREATE INDEX post_creation_date_i ON post (creation_date);
```

- 初期データとして10000行のレコードをテーブルに挿入

```
INSERT INTO post
SELECT
  level,
  lpad('a', 1000, 'a'),
  0 AS archived,
  DATE '2017-01-01' + (level / 100)
FROM dual
CONNECT BY level <= 10000;

EXEC dbms_stats.gather_table_stats('TEST', 'POST');
```

- WebサーバとDBサーバはネットワークが別れているため、通信コストがかかる

### 3.2. 実験結果

実験結果は以下の表の通りです。

なんと、bulk updateと純粋なupdateでは100倍もの差がついています。

「bulk updateが早いのは知っているよ」という人でも、batch updateとbulk updateでも約5倍ほど速度差がでる場合があるというのには驚きではないでしょうか？

|  | query type | execution time(second) |
| --- | --- | --- |
| 1 | forループによるupdate, キャッシュなし | PT4.546S |
| 2 | forループによるupdate, prepared statementのキャッシュあり | PT3.52S |
| 3 | batch update | PT0.144S |
| 4 | bulk update | PT0.028S |

## 4\. おわりに

本記事ではupdate, batch update, bulk updateについて各方法のオーバーヘッド、性能差について解説しました。

それぞれ一長一短であるものの、複数件のupdateを行う場合はできるだけbulk updateを用いて、bulk updateではSQL文が過度に複雑化してしまうという場合のみbatch updateにするという形で実装を行うと良いのではないでしょうか。

以上

## 参考

\[1\] https://www.jooq.org/  
  
\[2\] jOOQ, Batch execution, https://www.jooq.org/doc/latest/manual/sql-execution/crud-with-updatablerecords/batch-execution-for-crud/  
https://qiita.com/keita\_ide78/items/48fd62e9505d2ddad51f  
  
\[3\] jOOQ, The Performance Difference Between SQL Row-by-row Updating, Batch Updating, and Bulk Updating, https://blog.jooq.org/the-performance-difference-between-sql-row-by-row-updating-batch-updating-and-bulk-updating/
