---
title: "システム設計の基本を無料で学べるGithubリポジトリ[System Design Primer]の良い点・物足りない点"
date: 2025-03-23
categories: 
  - "software-design"
coverImage: "Screenshot-from-2025-03-23-15-38-10.png"
slug: "system-design-primer"
type: "post"
---

[https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md)

## どんなサイトか？

このサイトはシステム設計の基礎に関して包括的に解説をしています。

扱っているトピックはパフォーマンス・スケーラビリティ・一貫性・データベース・キャッシュ・ネットワークなど幅広いです。

初心者のエンジニアは自分が好きな領域に関してざっと目を通して置くとかなり実務でも役に立つと思います。

## データベースに関するトピック

私は特にデータベースに関するトピックが好きなので、どのような内容を扱っているかご紹介します。

以下の通り、データベースに関しては、RDB・NoSQLについてざっくりと扱っています。

> - [データベース](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9)
>     - [リレーショナルデータベースマネジメントシステム (RDBMS)](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#%E3%83%AA%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%8A%E3%83%AB%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9%E3%83%9E%E3%83%8D%E3%82%B8%E3%83%A1%E3%83%B3%E3%83%88%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0-rdbms)
>         - [マスター/スレーブ レプリケーション](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%B9%E3%83%AC%E3%83%BC%E3%83%96-%E3%83%AC%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3)
>         
>         - [マスター/マスター レプリケーション](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC-%E3%83%AC%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3)
>         
>         - [フェデレーション](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#federation)
>         
>         - [シャーディング](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#%E3%82%B7%E3%83%A3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0)
>         
>         - [デノーマライゼーション](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#%E9%9D%9E%E6%AD%A3%E8%A6%8F%E5%8C%96)
>         
>         - [SQL チューニング](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#sql%E3%83%81%E3%83%A5%E3%83%BC%E3%83%8B%E3%83%B3%E3%82%B0)
>     
>     - [NoSQL](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#nosql)
>         - [キー/バリューストア](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#%E3%82%AD%E3%83%BC%E3%83%90%E3%83%AA%E3%83%A5%E3%83%BC%E3%82%B9%E3%83%88%E3%82%A2)
>         
>         - [ドキュメントストア](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88%E3%82%B9%E3%83%88%E3%82%A2)
>         
>         - [ワイドカラムストア](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#%E3%83%AF%E3%82%A4%E3%83%89%E3%82%AB%E3%83%A9%E3%83%A0%E3%82%B9%E3%83%88%E3%82%A2)
>         
>         - [グラフ データベース](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#%E3%82%B0%E3%83%A9%E3%83%95%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9)
>     
>     - [SQL or NoSQL](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#sql%E3%81%8Bnosql%E3%81%8B)

### RDBMS

レプリケーションに関する知識やシャーディングについては特にジュニアレベルのアプリケーションのエンジニアだとあまり役に立たないかもしれないですが、アーキテクチャを考える上でとても重要なので呼んでおくと良いと思います。

またSQLチューニングのトピックでもざっくりどのようなことをするとパフォーマンス劣化するからやめようみたいなことがかかれています。

例えば、NULL値はパフォーマンス劣化の原因となることがある、みたいな話です。

### NoSQL

NoSQLについては、NoSQLにはどのようなジャンルのDBがあり、それぞれのメリット・デメリットが解説されています。

これも技術選定の際に参考になるので、一通り目を通しておきたいですね。

## 物足りない点

### NewSQLに関する記載は無い

ただいくつか物足りない点があります。

例えば、NewSQLに関するトピックは2025年3月時点で取り上げられていません。

NewSQLは読み書きが水平スケールしなおかつACID特性があるクラウドネイティブなDBとして、近年注目されており、PayPayやMercariなどの国内のビックテックも採用していたりします。

もしNewSQLについてご存じない方は、以下の記事を一読することをおすすめします。

https://yukiotechblog.com/newsql\_nosql\_rdb\_difference/

### SQLチューニング

また他の点で言うとSQLチューニングに関して、もっといろいろな方法が紹介されていると良いなと思いました。

例えば過剰なジョインに対する解決策として非[https://amzn.to/3DYiYEh](https://amzn.to/3DYiYEh)正規化が記事内で紹介されていますが、他にもサブクエリとして先に絞り込むことでジョインコストを低くする方法などもあります。

そのようなトピックについては以下の書籍も参考にしてみると良いです。

- 失敗から学ぶRDBの正しい歩き方, [https://amzn.to/4cl6wva](https://amzn.to/4cl6wva)

- SQL実践入門──高速でわかりやすいクエリの書き方, [https://amzn.to/3DYiYEh](https://amzn.to/3DYiYEh)

どちらの書籍もDBの構造を踏まえた上でどのようにパフォーマンスに優れたクエリを書くのか？という点について解説しています。おすすめ。
