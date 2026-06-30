---
title: "[日本語訳] 02. 索引化されたデータ構造 “Go言語でゼロから独自のDBを構築しよう” – Build Your Own Database From Scrach In Go –"
date: 2025-03-27
categories: 
  - "database"
  - "golang"
coverImage: "Screenshot-from-2025-03-23-15-32-30.png"
slug: "02-indexing-data-structure-jp-build-your-own-db"
type: "post"
---

この記事は以下のサイトの翻訳です。

[https://build-your-own.org/database/02\_indexing](https://build-your-own.org/database/02_indexing)

* * *

## クエリの種類

ほとんどのSQLクエリは、次の3種類に分類できます：

- データ全体のスキャン（インデックスは使われない）

- ポイントクエリ：特定のキーでインデックスを検索

- 範囲クエリ：範囲でインデックスを検索（インデックスはソートされている）

スキャンを高速化する方法として、カラム指向ストレージなどがあります。しかし、どれだけ高速にしてもスキャンの計算量は O(N) です。我々の注目は、**データ構造を使って O(log N) で処理できるクエリ**です。

範囲クエリは2つのフェーズに分かれます：

1. Seek（探索）：開始キーを見つける

3. Iterate（反復）：ソート順に前または次のキーをたどる

ポイントクエリは、Iterate のない Seek だけの操作です。つまり、**ソートされたデータ構造さえあれば対応できます**。

> Most SQL queries can be broken down into 3 types:
> 
> 1. Scan the whole data set. (No index is used).
> 
> 3. Point query: Query the index by a specific key.
> 
> 5. Range query: Query the index by a range. (The index is sorted).
> 
> There are ways to make scanning fast, such as column-based storage. But a scan is _O_(_N_) no matter how fast it is; our focus is on queries that can be served in _O_(log _N_) using data structures.
> 
> A range query consists of 2 phases:
> 
> 1. Seek: find the starting key.
> 
> 3. Iterate: find the previous/next key in sort order.
> 
> A point query is just seek without iterate; a sorting data structure is all we need.

## ハッシュテーブル

以下が日本語訳です：

* * *

ハッシュテーブルは、`get`、`set`、`del` といった**ポイントクエリ**だけを考慮するなら有効です。しかし、**順序性がない**ため、ここではハッシュテーブルには深入りしません。

とはいえ、たとえインメモリのものであっても、**ハッシュテーブルを実装すること自体は良い練習になります**。後で実装する B-tree よりはるかに簡単ですが、いくつかの課題は残ります：

- **ハッシュテーブルをどう拡張するか？**  
    負荷率（load factor）が高くなると、より大きなハッシュテーブルへキーを移動する必要があります。しかし、すべてを一度に移動するのは O(N) で非常にコストが高い。  
    → 再ハッシュ（rehashing）は**段階的に**行う必要があります。これは Redis のようなインメモリアプリでも同様です。

- また、以前触れた他の問題点（インプレース更新、領域再利用など）もあります。

> Hashtables are viable if you only consider point queries (get, set, del), so we will not bother with them because of the lack of ordering.
> 
> However, coding a hashtable, even an in-memory one, is still a valuable exercise. It’s far easier than the B-tree we’ll code later, though some challenges remain:
> 
> - How to grow a hashtable? Keys must be moved to a larger hashtable when the load factor is too high. Moving everything at once is prohibitively _O_(_N_). Rehashing must be done progressively, even for in-memory apps like Redis.
> 
> - Other things mentioned before: in-place updates, space reuse, and etc.

## ソート済み配列

ハッシュテーブルを除外すると、最もシンプルなソート済みデータ構造として「ソート済み配列」があります。これには O(log N) で二分探索が可能です。文字列（KV）などの可変長データに対しては、ポインタ（オフセット）の配列を使って二分探索を行います。

ただし、ソート済み配列の更新は O(N) かかります。インプレースであれ非インプレースであれ、コストは高く、実用的とは言えません。ただし、この考え方は他の更新可能なデータ構造に応用できます。

更新コストを下げる一つの方法として、配列を複数の**重なりのない配列**に分割する手法があります（ネストされたソート済み配列）。この発展形が **B+木（B+tree）** です（多段階の n 分木構造）。ただし、この場合は小さな配列（＝木のノード）をうまく維持するという追加の課題が生まれます。

もう一つの「更新可能な配列」の形として、**ログ構造マージツリー（LSM-tree）** があります。これは、更新をまず小さな配列（または別のソートデータ構造）にバッファし、ある程度大きくなったらメイン配列にマージするという方式です。更新コストは、小さな配列を段階的に大きな配列へと伝播させることで**償却**されます。

> Ruling out hashtables, let’s start with the simplest sorting data structure: the sorted array. You can binary search on it in _O_(log _N_). For variable-length data such as strings (KV), use an array of pointers (offsets) to do binary searches.
> 
> Updating a sorted array is _O_(_N_), either in-place or not. So it’s not practical, but it can be extended to other updatable data structures.
> 
> One way to reduce the update cost is to divide the array into several non-overlapping arrays (nested sorted arrays). This leads to B+tree (multi-level n-ary tree), with the extra challenge of maintaining these small arrays (tree nodes).
> 
> Another form of “updatable array” is the log-structured merge tree (LSM-tree). Updates are first buffered in a smaller array (or other sorting data structures), then merged into the main array when it becomes too large. The update cost is amortized by propagating smaller arrays into larger arrays.

## Bツリー

B-tree はバランスの取れた n 分木で、バランス木（二分木）に似た構造です。各ノードは最大 n 個までのキー（と枝）を可変数で保持し、n は 2 より大きい値です。

> A B-tree is a balanced n-ary tree, comparable to balanced binary trees. Each node stores variable number of keys (and branches) up to _n_ and _n_ > 2.

### ディスクアクセスを減らすために、木の高さを低くする

ディスクは 1 秒あたりに実行できる I/O 操作（IOPS）に限界があり、これは木構造での検索性能のボトルネックになります。木構造の各レベルはディスクからの読み込みに相当し、n 分木は同じキー数でも二分木より高さが低くなります（log₂N に対して logₙN）。そのため、**検索あたりのディスク読み込み回数を減らすために n 分木が使われます**。

これを見ると、n を大きくすればするほど有利に思えますが、実際にはトレードオフがあります：

- ノードが大きくなると、**更新が遅くなる**

- ノードが大きいと、**読み取りのレイテンシが増加する**

実際には、**ノードサイズは数ページ（OSのページ単位）程度**に抑えられるのが一般的です。

> A disk can only perform a limited number of IOs per second (IOPS), which is the limiting factor for tree lookups. Each level of the tree is a disk read in a lookup, and n-ary trees are shorter than binary trees for the same number of keys (log_n__N_ vs. log2_N_), thus n-ary trees are used for fewer disk reads per lookup.
> 
> So it seems that a large _n_ is advantageous. But there are tradeoffs:
> 
> - Larger tree nodes are slower to update.
> 
> - Read latency increases for larger nodes.
> 
> In practice, the node size are chosen as only a few OS pages.

### ページ単位の I/O

ファイルはバイト単位でアクセス可能ですが、**ディスク I/O の基本単位はバイトではなく「セクタ」**です。セクタとは、古い HDD で使われていた 512 バイトの連続したブロックです。ただし、アプリケーションにとってこれはあまり重要ではありません。なぜなら、通常のファイル I/O はディスクと直接やり取りせず、**OS が「ページキャッシュ」上で読み書きをバッファリングしている**からです。ページキャッシュは、**4KB のメモリブロック（ページ）**で構成されています。

いずれにしても、I/O には**最小単位**があります。データベースは独自の I/O 単位（これも「ページ」と呼ばれる）を定義することができ、これは OS のページサイズより大きくすることも可能です。

この**最小 I/O 単位**があるということは、**ツリーノードもその単位の倍数で割り当てるべき**ということです。半分しか使っていないページは、**I/O を半分無駄にしている**のと同じです。これもまた、**n を小さくしすぎるべきでない理由**のひとつです！

> While files are byte-addressable, the basic unit of disk IO is not bytes, but sectors, which are 512-byte contiguous blocks on old HDDs. However, this is not a concern for applications because regular file IOs do not interact directly with the disk. The OS caches/buffers disk reads/writes in the _page cache_, which consists of 4K-byte memory blocks called _pages_.
> 
> In any way, there is a minimum unit of IO. DBs can also define their own unit of IO (also called a page), which can be larger than an OS page.
> 
> The minimum IO unit implies that tree nodes should be allocated in multiples of the unit; a half used unit is half wasted IO. Another reason against small _n_!

### B+treeの派生系

データベースの文脈において「B-tree」と言うと、実際には **B+tree** と呼ばれる派生系を指します。B+tree では、**内部ノードには値を保持せず、値はすべて葉ノードにのみ存在**します。これにより、**内部ノードの空間がすべて枝（ポインタ）に使えるため、木の高さを低く抑えることができます**。

B+tree はインメモリのデータ構造としても理にかなっています。というのも、**RAM と CPU キャッシュ間の最小 I/O 単位は 64 バイト（キャッシュライン）**だからです。ディスクの場合ほど大きな性能向上はありませんが、それでも 64 バイトという制約の中で効率よくアクセスできるのは意味があります。

> In the context of databases, B-tree means a variant of B-tree called B+tree. In a B+tree, internal nodes do not store values, values exist only in leaf nodes. This leads to shorter tree because internal nodes have more space for branches.
> 
> B+tree as an in-memory data structure also makes sense because the minimum IO unit between RAM and CPU caches is 64 bytes (cache line). The performance benefit is not as great as on disk because not much can fit in 64 bytes.

### データ構造における空間オーバーヘッド

**バイナリツリーが実用的でないもう一つの理由**は、ポインタの数です。バイナリツリーでは、**各キーに対して少なくとも1つ、親ノードからのポインタが必要**になります。一方、**B+tree では、1つの葉ノードに複数のキーが含まれ、それらが1つのポインタを共有する**ため、ポインタ数を大幅に削減できます。

また、**葉ノード内のキーは、よりコンパクトな形式で詰め込んだり、圧縮する**ことで、さらに空間効率を高めることが可能です。

> Another reason why binary trees are impractical is the number of pointers; each key has at least 1 incoming pointer from the parent node, whereas in a B+tree, multiple keys in a leaf node share 1 incoming pointer.
> 
> Keys in a leaf node can also be packed in a compact format or compressed to further reduce the space.

## ログ構造ストレージ

### マージによる更新：コストの償却

ログ構造化ストレージの最も一般的な例は、**ログ構造マージツリー（LSM-tree）**です。名前には「ログ」や「ツリー」が含まれていますが、**本質は「マージ（merge）」**にあります！

まずは2つのファイルから始めましょう：  
1つは**最近の更新を保持する小さなファイル**、  
もう1つは**それ以外のデータを保持する大きなファイル**です。  
更新はまず小さなファイルに書き込まれますが、このファイルは無限に大きくなるわけにはいきません。一定の閾値を超えると、**大きなファイルとマージ**されます。

```
書き込み => | 新しい更新 | => | 蓄積されたデータ | 
             ファイル1          ファイル2
```

2つのソート済みファイルをマージすると、**新しい大きなファイル**が作られ、旧ファイルを置き換えることで、小さなファイルのサイズが縮小されます。

マージの計算量は O(N) ですが、**リーダーやライターと並行して処理することが可能**です。

> The most common example of log-structured storage is log-structure merge tree (LSM-tree). Its main idea is neither log nor tree; it’s “merge” instead!
> 
> Let’s start with 2 files: a small file holding the recent updates, and a large file holding the rest of the data. Updates go to the small file first, but it cannot grow forever; it will be merged into the large file when it reaches a threshold.
> 
> ```
> writes => | new updates | => | accumulated data |
>                file 1               file 2
> ```
> 
> Merging 2 sorted files results in a newer, larger file that replaces the old large file and shrinks the small file.
> 
> Merging is _O_(_N_), but can be done concurrently with readers and writers.

### 複数のレベルで書き込みの増幅を抑える

毎回データ全体を書き換えるよりも、更新をバッファリングする方が効率的です。では、この仕組みを複数のレベルに拡張したらどうなるでしょうか？

```
                ｜レベル1｜
                     ↓
          ｜------レベル2------｜
                     ↓
｜-----------------レベル3-----------------｜
```

2レベル構成では、小さなファイル（レベル1）がしきい値に達するたびに、大きなファイル（レベル2）を再作成します。この**過剰なディスク書き込み**は「**書き込み増幅（write amplification）**」と呼ばれ、**レベル2のファイルが大きくなるほど悪化**します。  
しかし、**さらに多くのレベル**を用いることで、**レベル2が大きくなる前にレベル3へマージする**ことができ、レベル1を小さく保つのと同じように、レベル2も小さく保てます。

直感的には、各レベルのサイズは**指数関数的に増加**していき、**2の累乗的な成長（同じくらいのサイズ同士をマージ）**が、**最も書き込み増幅を抑える**結果につながります。  
ただし、**書き込み増幅とレベル数（＝クエリ性能）との間にはトレードオフ**があります。

> Buffering updates is better than rewriting the whole dataset every time. What if we extend this scheme to multiple levels?
> 
> ```
>                  |level 1|
>                     ||
>                     \/
>            |------level 2------|
>                     ||
>                     \/
> |-----------------level 3-----------------|
> ```
> 
> In the 2-level scheme, the large file is rewritten every time the small file reaches a threshold, the excess disk write is called _write amplification_, and it gets worse as the large file gets larger. If we use more levels, we can keep the 2nd level small by merging it into the 3rd level, similar to how we keep the 1st level small.
> 
> Intuitively, levels grow exponentially, and the power of two growth (merging similarly sized levels) results in the least write amplification. But there is a trade-off between write amplification and the number of levels (query performance).

### LSM-tree のインデックス

各レベルにはインデックス用のデータ構造が含まれており、単純に**ソート済み配列**でも構いません。なぜなら、**第1レベルを除いてレベルのデータは更新されない**からです。  
ただし、**二分探索はランダムアクセスの観点では二分木と大差ない**ため、より現実的な選択肢として、**各レベルの内部に B-tree を使う**ことが挙げられます。これが LSM-tree における「tree（ツリー）」の部分です。  
いずれにせよ、**更新が存在しないため、データ構造は非常にシンプル**になります。

「マージ」という考え方をよりよく理解するには、これを**ハッシュテーブル（＝ログ構造ハッシュテーブル）に応用してみる**のもよいでしょう。

> Each level contains indexing data structures, which could simply be a sorted array, since levels are never updated (except for the 1st level). But binary search is not much better than binary tree in terms of random access, so a sensible choice is to use B-tree inside a level, that’s the “tree” part of LSM-tree. Anyway, data structures are much simpler because of the lack of updates.
> 
> To better understand the idea of “merge”, you can try to apply it to hashtables, a.k.a. log-structured hashtables.

### LSM-tree におけるクエリ処理

キーはどのレベルにも存在し得るため、LSM-tree をクエリする際には、**各レベルからの結果を結合**する必要があります（範囲クエリでは **n-way マージ** を行います）。

ポイントクエリの場合は、**検索するレベル数を減らす最適化手法として Bloom フィルタ**を使うことができます。

レベルは更新されないため、**古いレベルに古いバージョンのキーが残る**ことがあります。削除されたキーについては、**新しいレベルで「墓石（tombstone）」と呼ばれる特別なフラグ**が付与されます。  
このため、クエリ処理では**新しいレベルが優先されます**。

このマージ処理は、**古いキーや削除されたキーから自動的に空き領域を回収する**仕組みでもあり、これを **コンパクション（compaction）** と呼びます。

> Keys can be in any levels, so to query an LSM-tree, the results from each level are combined (n-way merge for range queries).
> 
> For point queries, Bloom filters can be used as an optimization to reduce the number of searched levels.
> 
> Since levels are never updated, there can be old versions of keys in older levels, and deleted keys are marked with a special flag in newer levels (called tombstones). Thus, newer levels have priority in queries.
> 
> The merge process naturally reclaims space from old or deleted keys. Thus, it’s also called _compaction_.

### 実際の LSM-tree：SSTable、MemTable、ログ

これらは LSM-tree の実装に関する専門用語です。原理から自作する場合には必ずしも知っておく必要はありませんが、**実際の課題を解決するための工夫**が詰まっています。

各レベルは、大きなファイル1つではなく、**重なりのない複数のファイル（SSTable）**に分割されます。これにより、**マージ処理を段階的に行えるようになり**、大きなレベルをマージする際の**空き容量の要件を軽減**し、**処理も時間的に分散**されます。

第1レベルは直接更新されるため、**サイズが制限されているという前提のもとでログを使う選択が有効**になります。これが LSM-tree における「ログ」の部分であり、**ログと他のインデックス構造の組み合わせの一例**です。

ただし、**ログが小さいとはいえ、適切なインデックス構造は依然として必要です**。ログのデータは、**MemTable（メモリ内インデックス）に複製され**、これには B-tree や Skiplist などが使えます。MemTable は小さく、容量が制限されたメモリ上のデータ構造であり、**最近の更新に対する読み取りを高速化するという利点**も持っています。

> These are jargons about LSM-tree implementation details. You don’t need to know them to build one from principles, but they do solve some real problems.
> 
> Levels are split into multiple non-overlapping files called SSTables, rather than one large file, so that merging can be done gradually. This reduces the free space requirement when merging large levels, and the merging process is spread out over time.
> 
> The 1st level is updated directly, a log becomes a viable choice because the 1st level is bounded in size. This is the “log” part of the LSM-tree, an example of combining a log with other indexing data structures.
> 
> But even if the log is small, a proper indexing data structure is still needed. The log data is _duplicated_ in an in-memory index called MemTable, which can be a B-tree, skiplist, or whatever. It’s a small, bounded amount of in-memory data, and has the added benefit of accelerating the read-the-recent-updates scenario.

## インデックスデータ構造のまとめ

インデックス構造には主に **B+tree** と **LSM-tree** の2つの選択肢があります。

LSM-tree は、前章で扱った「ディスクベースのデータ構造をどう更新するか」「空き領域をどう再利用するか」といった課題に対する**多くの解決策を提供**します。  
これらの課題は B+tree では依然として残っており、その点については今後詳しく見ていきます。

> There are 2 options: B+tree and LSM-tree.
> 
> LSM-tree solves many of the challenges from the last chapter, such as how to update disk-based data structures and reuse space. While these challenges remain for B+tree, which will be explored later.
