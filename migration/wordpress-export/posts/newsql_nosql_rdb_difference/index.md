---
title: "NewSQL・NoSQL・RDBの特性・メリット・デメリット"
date: 2025-03-14
categories: 
  - "database"
tags: 
  - "db"
  - "newsql"
  - "nosql"
  - "spanner"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-32-30.png"
slug: "newsql_nosql_rdb_difference"
type: "post"
---

近年ACID特性を持ちながらread/writeの両方を水平スケールさせることが可能なDB「**NewSQL**」が注目されています。

本記事ではNewSQL・NoSQL・RDBの特性やメリットデメリットについて解説します。

## RDBの特性・メリット・デメリット

RDB(Relational Database)とは、データ間の関係があらかじめ定義されたデータの集合体であり、ACID特性を有したトランザクション処理が可能であることが多いです。

> リレーショナル・データベースとは、あらかじめ定義された関係性の中でデータを整理する情報の集合体であり、データは列と行からなる1つまたは複数のテーブル（または「リレーション」）に格納され、異なるデータ構造が互いにどのように関係しているかを簡単に見て理解することができる。
> 
> A relational database is a collection of information that organizes data in predefined relationships where data is stored in one or more tables (or "relations") of columns and rows, making it easy to see and understand how different data structures relate to each other. Relationships are a logical connection between different tables, established on the basis of interaction among these tables.
> 
> 引用元: [https://cloud.google.com/learn/what-is-a-relational-database](https://cloud.google.com/learn/what-is-a-relational-database)

ただMySQLでストレージエンジンにMyISAMを選択すると、MyISAMにトランザクションの機能がサポートされていないので、RDBにもかかわらずACID属性がない状況もあり得ます[https://dev.mysql.com/doc/refman/8.0/ja/myisam-storage-engine.html](https://dev.mysql.com/doc/refman/8.0/ja/myisam-storage-engine.html)

他のRDBでも似たような状況ってあるんですかね、、

### RDBのメリット「強いデータ整合性」

このACID特性を有したトランザクションという仕組みのおかげで、**強固な整合性のある形でデータを管理できることがRDBの大きなメリット**の1つです。

> 原子性（A）：トランザクションの各ステートメント（データの読み取り、書き込み、更新、削除）は、1 つの単位として扱われます。ステートメントは、実行されるか、あるいは全く実行されないかのいずれかです。この特性は、ストリーミングデータソースがストリーミングの途中で障害が発生した場合などに、データの損失や破損が発生するのを防ぎます。  
>   
> 一貫性（C）：トランザクションがテーブルに、事前定義された予測可能な方法でのみ変更を加えることを保証します。トランザクションの一貫性により、データの破損やエラーが起きた場合でもテーブルの整合性を保ち、意図しない実行結果を防ぎます。  
>   
> 独立性（I）：複数のユーザーが同じテーブルで読み書きを同時に実行しても、トランザクションが分離され、同時進行のトランザクションが相互に干渉したり、影響を受けたりしないようにします。実際は、同時に発生していも、各要求は単独で発生しているように扱われます。  
>   
> 永続性（D）：システム障害が発生した場合でも、正常に実行されたトランザクションによるデータの変更が保存されることを保証します。
> 
> 引用元: [https://www.databricks.com/jp/glossary/acid-transactions](https://www.databricks.com/jp/glossary/acid-transactions)

### RDBのデメリット「書き込みの水平スケーラビリティの低さ」

一方でRDBのデメリットとして挙げられるのは**「書き込みのスケーラビリティの低さ」**です。

RDBを水平スケールさせる場合は基本的に**「シェアードエブリシング方式」**と**「リードレプリカ方式」**の２つの方法があるとされています。

ただ、どちらの方式も**書き込み先の単一のストレージがボトルネック**となるため、書き込みは水平スケールしません。

以上を踏まえると、RDBにおいて書き込みをスケールさせるには、マシン自体のスペックアップを上げること(**スケールアップ**)やデータソース自体を物理的に分離する方法(**シャーディング**)など様々な制限やトレードオフがある手法を取らざるを得ません。

そのため、RDBでは**書き込みを水平スケールさせること**が難しいというのが大きなデメリットになります。

参考: ミック「センスの良いSQLを書く技術」p162, [https://amzn.to/426BPGn](https://amzn.to/426BPGn)

## NoSQLの特性・メリット・デメリット

RDBのスケーラビリティが問題になる中で、RDBのACID特性を一部犠牲にする代わりにスケーラビリティを得たDBとしてNoSQLと総称されるDB製品が2010年代から次々と登場します。

具体的には**結果整合性**という形でデータの整合性制約を緩和することで、ノードを増やしつつも大量のデータを高速に更新・参照できるようにしました。

また非構造化されたデータ形式をスキーマレスでサポートすることで柔軟にデータを扱えるようにもしています。

NoSQLにはデータを管理・保存する方法の違いから、以下のような様々な種類のデータベースが存在します。

- Key-valueストア

- ドキュメントデータベース

- グラフデータベース

- インメモリデータベース

参考

- AWS, NoSQLとは, [https://aws.amazon.com/jp/nosql](https://aws.amazon.com/jp/nosql)

- SPA OSS Tech Blog, 増永教授のDB特論⑪「結果整合性」[https://www.sraoss.co.jp/tech-blog/db-special-lecture/masunaga-db-special-lecture-11](https://www.sraoss.co.jp/tech-blog/db-special-lecture/masunaga-db-special-lecture-11)

### NoSQLのメリット「スケーラビリティの高さ」

NoSQLのメリットとして挙げられるのは、スケールアウトに基づくパーティショニングなどの手法によってほぼ無限に水平スケールするという「スケーラビリティの高さ」です。

> NoSQL データベースは通常、パーティション化可能です。分散型アーキテクチャを使用したアクセスパターンのスケールアウトに基づくパーティション化が可能で、これにより、ほぼ無限の規模でスループットを高め、一貫したパフォーマンスを維持することができます。
> 
> [https://aws.amazon.com/jp/nosql](https://aws.amazon.com/jp/nosql)

また他のメリットとしてスキーマレスであることも上がると思います。

### NoSQLのデメリット「弱い整合性」

一方でデメリットとしては**結果整合性という弱いデータ整合性**であることがあげられます。

> NoSQL データベースでは、多くの場合、リレーショナルデータベースの ACID 特性の一部を緩和することと引き換えに、水平方向に拡張できるもっと柔軟なデータモデルを実現しています。これによって、NoSQL データベースは、単一インスタンスの制限を超えて水平方向に拡張する必要のある、高スループット、低レイテンシーユースケースの優れた選択肢になっています。
> 
> [https://aws.amazon.com/jp/nosql](https://aws.amazon.com/jp/nosql)

この結果整合性という特性によって、変更結果は**いつかは収束するがいつ収束するかわからない**というような具合になります。

そのため、強い整合性が求められるデータの管理をすることはNoSQLには向かないかもしれないですね。

## NewSQLの特性・メリット・デメリット

**整合性と書き込みの水平スケーラビリティがトレードオフ**になっている状況で、これらを両立したNewSQLと総称されるDB製品が登場します。

> Cloud Spanner は、エンタープライズ クラスで唯一、グローバルに分散され、強整合性を備えたデータベース サービスです。リレーショナル データベースの構造と非リレーショナル データベースの水平スケーラビリティを兼ね備え、クラウドに特化した設計となっています。スケーラビリティは通常、非リレーショナル データベースや NoSQL データベースと関連して語られるものですが、Cloud Spanner はスケーラビリティをトランザクション、SQL クエリ、リレーショナル構造と組み合わせている点でユニークなデータベースといえます。
> 
> [https://cloud.google.com/blog/ja/topics/developers-practitioners/what-cloud-spanner?hl=ja](https://cloud.google.com/blog/ja/topics/developers-practitioners/what-cloud-spanner?hl=ja)

### NewSQLのメリット(1) 強い整合性を維持しつつ水平スケーラビリティが高い

NewSQLの大きなメリットとして上がるのが、「強い整合性を維持しつつ水平スケーラビリティが高いこと」が挙げられます。

NewSQLでは、読み取り・書き込み・トランザクションのリクエストの処理をするコンピュートノードとデータを保存するストレージノードに分けて、それぞれのノードを分散しています。

このストレージについてデータブロックをグループに分けつつ、ノードを物理的に分散させることで書き込みと読み込みが水平スケールするようになっています。

また、この際のノード間の同期をPaxos、Raftなどのアルゴリズムを用いることで、レイテンシを抑えつつACID特性を持ったトランザクション処理を実現しています。

### NewSQLのメリット(2) ダウンタイムの低さ

またストレージが分散されていることの恩恵として、NewSQL製品にはゼロダウンタイムを謳っているものもあります。

例えばTiDBではデータベースのアップグレード時に分散されたノードを少しずつ順次ローリングアップデートすることでダウンタイムが発生しないとのことです。

> 従来のデータベースでは多くの場合、時間のかかるアップグレードプロセスのためにすべての操作を凍結する「停止して待機する」手法が使用されます。対照的に、TiDBはオンラインのローリングアップグレード戦略を使用します。このアプローチではコンポーネントを特定の順序でアップグレードすることで、ダウンタイムのないアップグレードが保証されます。
> 
> 1. Placement Driver (PD) サーバー
> 
> 3. TiKVサーバー
> 
> 5. TiDBサーバー
> 
> 各サーバーは一度に1台ずつアップグレードされ、他のサーバーが受信負荷をシームレスに処理できるようになり、スムーズで中断のないアップグレード体験が実現します。
> 
> [https://pingcap.co.jp/blog/achieving-zero-downtime-upgrades-tidb](https://pingcap.co.jp/blog/achieving-zero-downtime-upgrades-tidb)

### NewSQLのデメリット「レイテンシー」

一方でNewSQL製品のデメリットとして上がるのが「レイテンシー」です。

これはシステムを地理的に分散しつつ強い整合性を保証していることの宿命とも言えるかもしれませんが、RDBなどと比較するとレイテンシーが多少増えるとのことです。

ただ決済サービスであるPayPayやメルカリなど国内では最大規模のサービスでもTiDBが問題なく運用されていることからも分かる通り、レイテンシーと言ってもユーザ体験を損なうレベルのものではないと思われます。

[https://pingcap.co.jp/case-study](https://pingcap.co.jp/case-study)

ちなみにメルカリの検証によるとMySQLでは大きくとも0.5ミリ秒程度だったレイテンシがTiDBだと20~80ミリ秒程度まで増えたとのことです。

> MySQLはグラフのマーカーが見えないくらい値が小さく、大きくても0.5ミリ秒程度。一方、TiDB Cloudは負荷が低い状態から中程度の負荷でも20ミリ秒から40ミリ秒ぐらい。高負荷時には上限の80ミリ秒に張り付いています。  
> これは想定したレイテンシの目標値の1.5倍、高負荷だと10倍以上の結果となりました。
> 
> [https://qiita.com/official-columns/event/202402-pingcap-02](https://qiita.com/official-columns/event/202402-pingcap-02)

## まとめ

本記事ではRDB、NoSQL、NewSQLのそれぞれのメリット・デメリットについて解説しました。

RDBとNoSQLのいいとこ取りをしているように見えるNewSQLがこれから拡大していくのか、これからも注目したいですね。

## 参考書籍

※ amazonアソシエイトのリンクを利用しています

- センスの良いSQLを書く技術, [https://amzn.to/426BPGn](https://amzn.to/426BPGn)

- マルチクラウドデータベースの教科書, [https://amzn.to/3DwyGq5](https://amzn.to/3DwyGq5)
