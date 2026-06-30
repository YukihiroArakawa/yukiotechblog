---
title: "[日本語訳] 00. イントロダクション \"Go言語でゼロから独自のDBを構築しよう\" - Build Your Own Database From Scrach In Go -"
date: 2025-03-26
categories: 
  - "database"
  - "golang"
coverImage: "Screenshot-from-2025-03-23-15-32-30.png"
slug: "00-introduction-jp-build-your-own-db"
type: "post"
---

以下のサイト「Build Your Own Database From Scrach In Go」の翻訳です。

[https://build-your-own.org/database/#table-of-contents](https://build-your-own.org/database/#table-of-contents)

## 独自のDBを作ることで基礎をマスターする Master fundamentals by building your own DB

### 何を学ぶべきか？ What to learn?

データベースのような複雑なシステムは少ない単純な原則から構築されている。

Complex systems like databases are built on a few simple principles.

1. **原子性 & 耐久性 DBは単なるファイルではない!** **Atomicity & durability**. A DB is more than just files!
    - データをfsyncで永続化 Persist data with `fsync`.
    
    - 破損の回復 Crash recovery.

3. **Bツリー**を元にした**キーバリューストア KV store** based on **B-tree**.
    - ディスクベースのデータ構造 Disk-based data structures.
    
    - フリーリストによるスペース管理 Space management with a free list.

5. KV上の**関係データベース Relational DB** on top of KV.
    - テーブルとインデックスの低レベルのBツリーへマッピング方法 How tables and indexes are mapped to low-level B-trees.
    
    - SQLライクなクエリ言語; パーサとインタープリタ SQL-like **query language**; parser & interpreter.

7. トランザクションの**同時実行制御 Concurrency control** for transactions.

### 3000行のデータベースを徐々にコーディングする Code a database in 3000 LoC, incrementally

3000LoCという、実際のDBよりも桁違いに小さいサイズで、本質を押さえつつ、興味深いトピックを捉えることができるのは驚きだ。だから、誰でも暇なときに試すことができる。

It’s amazing that an interesting topic can be captured in 3000 LoC, which is orders of magnitude smaller than any real DB, while retaining the essentials. So anyone can try this in their spare time.

| コードの行数 LoC | ステップ Step |
| --- | --- |
| 366 | B+ツリー データ構造 B+tree data structure. |
| 601 | 追加のみのキーバリュー Append-only KV. |
| 731 | フリーリストでの実用的なキーバーリュー Practical KV with a free list. |
| 1107 | キーバリューのテーブル Tables on KV. |
| 1294 | 範囲クエリー Range queries. |
| 1438 | セカンダリインデックス Secondary indexes. |
| 1461 | トランザクションインターフェース Transactional interfaces. |
| 1702 | 同時実行制御 Concurrency control. |
| 2795 | SQLライクなクエリ言語 SQL-like query language. |

### 実践して学ぶ：専門用語の代わりに原則を Learn by doing: principles instead of jargon

かつてフェイマンは「構築できないものは理解できない」と言った。

Feymann once said, “what I can’t build, I don’t understand”.

では、データベースの本を読めばデータベースを構築できるのだろうか？

So can you build a database by reading about databases?

残念ながら、データベースの文献は、一貫した意味を持たない、混乱させるような過負荷の専門用語で溢れている。だから、実際にやってみることで学ぶことが重要なのだ。

Unfortunately, the database literature is full of confusing, overloaded jargon with no consistent meaning. So it’s important to _learn by doing_.

学ぶべきことはたくさんあるが、**DBの核となる部分はほんのいくつかの原則**から成り立っている。While there is a lot to learn, **the core of a DB concists of just a few principles**.

## トピック1：耐久性と原子性 Topic 1: durability and atomicity

### データベースとは何か？ What is a database?

マーケティングでは、スプレッドシートやキャッシュサーバーなど、どんなものでも「データベース」と呼ぶことができる。

In marketing, anything can be called a “database”, including spreadsheets, cache servers, etc.

私たちは、伝統的にデータベースと呼ばれているもの、つまりMySQL、Postgres、SQLiteなどにしか興味がない。これらの共通点は？

We’re only interested in what is traditionally called a database, namely MySQL, Postgres, SQLite, etc. What do they have in common?

- データをディスクに保存できる They can persist data to disk.

- ディスクベースで、メモリを超えるサイズのデータにも対応できる They are disk-based, can work with larger-than-memory data.

- 他のデータベースのラッパーではなく、ゼロから構築されている They are implemented from scratch, not as wrappers over other databases.

これらの条件を満たす成熟したコードベースは数えるほどしかなく、しかもどれも非常に大規模です。

There are only a few mature code bases that meet these criteria, and they are all quite large.

例えば、SQLite3のソースは圧縮後でもメガバイト単位です。実際のDBは原則を学ぶのに最適な場所ではありません。その代わり、3000行のコードをゼロから作成します。

For example, the SQLite3 source is measured in megabytes, compressed. A real DB is not the best place to learn the principles. Instead, we’ll code a DB from scratch in 3000 lines.

### データベースは、単なるデータ形式ではない。A DB is more than just a data format

ディスクへのデータの永続化（耐久性）は、従来のDBの第一の基準です。

Persisting data to disk (durability) is the #1 criterion of a traditional DB.

これが、携帯電話がファイルベースのDBであるSQLiteを使用する理由です。

This is why mobile phones use SQLite, a file-based DB.

しかし、データベースが単なるファイルであるなら、なぜファイルを使用しないのでしょうか？

But why not just use files if the database is just a file anyway?

「永続化」にはいくつかの具体的な要件があるからです。_ある時点_で、DBに追加されたデータは、マシンがクラッシュ（電源喪失など）した場合でも、確実に永続化されます。

Because “persisting” has some concrete requirements: At _some point_, the data added to the DB is guaranteed to persist even if the machine crashes (by power loss or whatever).

2つの要件があります。クラッシュから生き残ること、耐久性の状態を確認することです。

There are 2 requirements: to survive crashes; to confirm the state of durability.

ほとんどのデータベースがファイルシステム上で稼働していることを考えると、ファイルシステムもこれらの要件を満たさなければなりません。つまり、ファイルシステムはデータベースとある程度似ているということです。

Considering that most databases run on filesystems, a filesystem must also meet these requirements. So filesystems are somewhat similar to databases.

しかし、大きな違いは、_一般的な_ファイルシステムの使用（ファイルへの書き込み）には耐久性の保証がなく、停電後にデータ損失や破損が発生する可能性があるのに対し、一般的なデータベースの使用では耐久性が保証されていることです。

However, the big difference is that _typical_ filesystem use (writing to files) has no durability guarantee, resulting in data loss or corruption after a power loss, while typical database use guarantees durability.

ファイルを耐久性のあるものにするということは、半分のデータベースを実装することを意味します。これについては、これから学習します。

Making files durable means implementing half a database, which we’ll learn.

### fsync システムコール The \`fsync\` syscall

`fsync` は、それまでに書き込まれたすべてのデータを永続化するファイルシステム操作です。データの永続化を_要求_し_確認_するために使用されます。

`fsync` is the filesystem operation that makes all previously written data durable. It’s used to _request_ and _confirm_ durability;

DBは`fsync`の後にのみ成功をクライアントに返します。 しかし、`fsync`の前または最中にDBがクラッシュした場合、どうなるでしょうか？

a DB will only return success to the client after `fsync`. But what if the DB crashes before or during `fsync`?

最も新しいデータは失われるかもしれませんが、半々で失われたり、半々で永続化されたりしてはなりません。 すべてか無かのこの状態を_原子性_と呼びます。

The most recent data may be lost, but it should not be half lost, half persisted. This all or nothing is called _atomicity_.

データベースはクラッシュから妥当な状態に復旧しなければならないが、これはfsyncを使用するよりも難しい

A database must recover from a crash to a reasonable state, which is harder than using `fsync`.

## トピック2：インデックス付きデータ構造 Topic 2: indexing data structures

### データ構造でレイテンシとコストを制御 Control latency and cost with data structures

DBは、ユーザーがその仕組みを知らなくても、クエリを結果に変換します。

A DB turns a query into a result without the user knowing how.

しかし、結果だけが問題なのではなく、_レイテンシ_や_コスト_（メモリ、IO、演算）も関連してきます。そのため、分析（OLAP）とトランザクション（OLTP）は区別されます。

But the result is not the only concern, _latency_ and _cost_ (memory, IO, computation) are also relevant, hence the distinction between analytical (OLAP) and transactional (OLTP).

- OLAPは、集約や結合操作を伴う大量のデータを取り扱うことができます。インデックスは限定的であったり、存在しないこともあります。OLAPは主にカラム型のデータストアです。 OLAP can involve large amounts of data, with aggregation or join operations. Indexing can be limited or non-existent. They are mostly column-based data stores.

- OLTPはインデックスを使用して少量のデータを処理します。待ち時間が短く、コストも低いです。B+木またはLSM-木のデータ構造に基づいています。OLTP touches small amounts of data using indexes. Low latency & cost. They are based on either B+tree or LSM-tree data structures.

「トランザクション」という言葉は、DBトランザクションに関するものではなく、単に面白い専門用語に過ぎません。

The word “transactional” is not about DB transactions, it’s just a funny jargon.

OLAPとOLTPはデータベースの異なる方向性であり、私たちはOLTPを選択し、OLAPは無視します。そのため、インデックス付きデータ構造は重要です。

OLAP and OLTP are different directions of database, we’ll pick OLTP and ignore OLAP, so indexing data structures are critical.

### インメモリデータ構造 vs オンディスクデータ構造 In-memory data structures vs. on-disk data structures

インデックスデータ構造をディスクに保存する際には、さらに難しい課題があります。1つ目は、どのデータ構造を使用するかということです。

There are extra challenges when putting an indexing data structure on disk. The 1st is which data structure to use.

RAMとディスクはそれぞれ異なる特性を持っており、特にレイテンシが異なります。

RAM and disk have different characteristics, especially latency.

最高のSSDでも、レイテンシはRAMの3桁分も大きくなります。

Even with the best SSDs, latency is 3 orders of magnitude greater than RAM.

これらの特性を考慮すると、データ構造は**B+ツリー**と**LSM-ツリー**の2つに絞られます。つまり、データベースで使用できるデータ構造はかなり限られてくるのです。

Studying these characteristics leads to just 2 data structures: **B+tree** and **LSM-tree**. So databases are much limited in data structures.

| メディア Medium | レイテンシ Latency |
| --- | --- |
| RAM | `50~100 ns` |
| SSD | `50000~100000 ns` |
| HDD | `5000000~10000000 ns` |

2つ目の課題は、データをディスクに永続化することです。データベースは、ディスク上のデータ構造にすぎません。そのため、データ構造は必須条件となります。（データ構造の実践については、私の著書「[Build Your Own Redis](https://build-your-own.org/redis/)」をご覧ください。）データ構造については教科書で学ぶことができますが、欠けているのは、それらをディスクに、インクリメンタルかつ永続的に保存することです。

The 2nd challenge is persisting data to disk. A database is just a data structure on disk. So data structure is a prerequisite. (See my book “[Build Your Own Redis](https://build-your-own.org/redis/)” to practice data structures). You can learn data structures from textbooks, but the missing part is putting them on a disk, incrementally and durable.

3つ目の課題は、同時実行性です。メモリ上のデータの場合、通常は単一のミューテックスでデータ構造へのアクセスをシリアライズすれば問題ありません。しかし、ディスク上のデータの場合は、IOレイテンシによりこの方法は実用的ではなく、より高度な同時実行制御が必要となります。

The 3rd challenge is concurrency. For in-memory data, it’s usually OK to serialize the data structure access with a single mutex. For disk-based data, the IO latency makes this impractical and requires more advanced concurrency control.

## トピック3: KV上の関係データベース Topic 3: Relational DB on KV

### DBインターフェースの2つの階層 Two layers of DB interfaces

SQLはデータベースの代名詞のようなものです。しかし、SQLは単なるユーザーインターフェースであり、DBの根幹ではありません。重要なのはその下の**機能性**です。

SQL is almost a synonym for database. But SQL is just a user interface, it’s not fundamental to a DB. What’s important is the **functionalities** underneath.

もうひとつ、よりシンプルなインターフェースとして、キー・バリュー（KV）があります。 単一のキーの取得、設定、削除ができ、最も重要なのは、キーの範囲をソート順でリスト化できることです。 KVはSQLよりも単純です。なぜなら、1層下にあるからです。 リレーショナルデータベースは、_ストレージエンジン_と呼ばれるKVのようなインターフェースの上に構築されています。

Another much simpler interface is key-value (KV). You can get, set, and delete a single key, and most importantly, list a range of keys in sorted order. KV is simpler than SQL because it’s one layer lower. Relational DBs are built on top of KV-like interfaces called _storage engines_.

```
type KV interface {
   // get, set, del
   Get(key []byte) (val []byte, ok bool)
   Set(key []byte, val []byte)
   Del(key []byte)
   // range query
   FindGreaterThan(key []byte) Iterator
   // ...
}
type Iterator interface {
   HasNext() bool
   Next() (key []byte, val []byte)
}
```

この本の前半は、後半の基盤となるKVです。

The first half of the book is a KV on which the second half is based.

### クエリ言語: パーサとインタープリタ Query languages: parsers and interpreters

最後のステップは、より長いLoCにもかかわらず、簡単です。パーサーもインタープリターも、_再帰_のみでコーディングされています！この教訓は、ほとんどのコンピュータ言語、あるいは独自のプログラミング言語やDSLの作成にも適用できます（さらなる課題については、私の著書『[From Source Code To Machine Code](https://build-your-own.org/compiler/)』をご覧ください）。

The last step is easy, despite the larger LoC. Both the parser and the interpreter are coded with nothing but _recursion_! The lesson can be applied to almost any computer language, or to creating your own programming language or DSL (See my book “[From Source Code To Machine Code](https://build-your-own.org/compiler/)” for more challenges).
