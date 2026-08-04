---
title: "「八百万のOSS | memcachedはシンプルなまま」を聞いて"
date: 2026-08-03
categories: ["podcast", "cache"]
slug: "netflix-evcache-is-smart-client"
type: "post"
---

## 八百万のOSS | memcachedはシンプルなまま

最近気に入っているソフトウェア開発関連のPodcast「八百万のOSS」の#13 「memcachedはシンプルなまま」が面白かった。

https://open.spotify.com/episode/1ulneXwnKUP4IRjEDicE5k

## エピソード概要

エピソード概要を述べると、Netflixは大規模な動画配信サービスを支える技術としてmemcachedを使っているが、Netflix規模になるとただmemcachedを使うだけでは解決できない問題があり、そのアプローチとしてクライアントサイドライブラリ側で解決しているという話をしている。

memcachedなどのキャッシュサーバを利用する際のよくある問題として「キャッシュヒットしなかった際にオリジンのデータベースにアクセスが集中する」というものがあるが、これがNetflix規模になるとオリジンのDBにアクセスが集中することでその影響が多方面に波及しうるという話なので、これをどうするかという話が展開されている。

## 意外だったポイント「プロキシサーバーを追加したりしない。クライアントサイドで解決する。」

私のような平凡なエンジニアの発想だと、クライアント、キャッシュサーバ、DBのどこかの間に一つキャッシュヒットしなかった際のハンドリングをするレイヤーを追加して、そこでなんとかすればよいのでは？ 責務もきれいに分かれそうだしと思った。

ただ、NetflixではそのようなアプローチではなくクライアントサイドでEVCacheというライブラリを使って頑張って解決しているとのこと。

## 管理するマシンを減らせると可用性や管理コストの面で有利

最初は「そっちで頑張るのか!?」「大規模システムだしなんか上手いこと分散システム的なアプローチで頑張るんじゃないの？」と思った。

ただ、クライアントサイドで解決できると管理対象のサーバーコンポーネントを減らせるので可用性や管理コスト的に優れているというメリットを聞いてなるほどなーとなった。

よくマシンの故障率が低くても、扱うマシンの数が多いと、毎日どこかしらのマシンが故障しているという話が分散システムの文脈で語られるけど、まさにそこに向き合っている例を知れて面白かった。

このあたりの話は「Today I Learned」というポッドキャストの「Tail at Scale | 大規模分散システムの遅延との戦い」で語られていた気がする。

https://open.spotify.com/episode/2sgebKpE3gqaCxBKJDrkcm

## レプリケーションもクライアントサイドでやるってマジ？

特に驚いた点としてレプリケーションもクライアントサイド(EVCache)で行うというのがある。

RDBのread replicaやNew SQLのストレージレイヤーなどではプライマリ(リーダー)となるノードに書き込んで複製するという方法を取るので、クライアントサイドはレプリケーションに関して一切関与しないというのがよくあるレプリケーションの方法だと思う。

自分がDBしか知らないだけなのかもしれないけど、この「レプリケーションはストレージのレイヤーで担い、クライアントは書き込みリクエストをするだけでOK」という設計アプローチが考え方のベースにあったので、「クライアントサイドでレプリケーションやっちゃうの!?」と衝撃を受けた。

## 本当だった

マジかよと思ってNetflixのEVCacheのリポジトリを見に行き、READMEに添付されていた資料を確認してみたら、たしかにCEVCache側で複数のAZにレプリケーション(というか複数に書き込み)するようにやっていた。

<img src="./images/Screenshot From 2026-08-03 23-10-09.png" alt="evcache replication" width="640" />

https://www.slideshare.net/slideshow/evcache-at-netflix/59442515

コード上では複数の書き込みクライアントをループさせて書き込むみたいな感じで実装されていた。

```java
for (EVCacheClient client : clients) {

// 略

    final Future<Boolean> future = client.set(hashKey, cdHashed, timeToLive, latch);

```

https://github.com/Netflix/EVCache/blob/d3a6edb06d17b86762ca81dc39e5f5b30cf4d6bd/evcache-core/src/main/java/com/netflix/evcache/EVCacheImpl.java#L2551

## memcached自体にはレプリケーション機能はないらしい

ストレージレイヤーでレプリケーションを抽象化するというアプローチは取れないのか？memcachedではできないのか？というとできないらしい。

> How do you handle replication? 
> It doesn’t. Adding replication to the system halves your effective cache size. If you can’t handle even a few percent extra cache misses, you have serious problems. Even with replication, things can break. More moving parts. Software to crash.

https://docs.memcached.org/userguide/faq/

もし数％のキャッシュミスに耐えられないのであれば設計ミスってるよと言っているあたり、memcachedとしての割り切りを感じる。

## redisではレプリケーションできそう

じゃあ、他のキャッシュサーバではどうかというとRedisではレプリケーションをサポートしていそうだった。

https://redis.io/docs/latest/operate/oss_and_stack/management/replication/

ただmasterからreplicaへの非同期コピーが基本なので、やはりmaster/replica間のバージョン違いやキャッシュミスへの考慮はキャッシュサーバ以外でも考慮しないといけなさそうではあるのかな。

## キャッシュサーバのユースケース的に強整合性が必要なデータを置かない

結局の所、キャッシュサーバはDBへのI/Oを軽くするという目的がメインだと思うので、決済関連のデータとか強整合性が必要なデータはおいていないと思う。

RDBでもログを永続化した上でバッファというキャッシュレイヤーにデータを持つ構成になっているので、失ったら困るデータは永続化すべしというごく当たり前の話な気がした。

Netflixで言えば、まぁビデオ作品や作品の説明情報などのデータのバージョンがクライアントによって多少異なっていたとしても大きな問題にはならないだろう。

実際、NetflixはcockroachDBというNewSQLも使っており、強整合性が必要なトランザクションをしたい場合はNewSQLでやっているのだと思う。

そうなると、クライアントサイドでレプリケーションの責務を担わせるので良くね？多少レプリケーションミスってもまぁ最悪オリジンあるしとなる気もした。

## 泥臭いように見えるが実用的な設計アプローチは案外ビックテックでも多いのかもしれない

勝手なイメージでビッグテックのコードは責務がきれいに分かれていてエレガントな設計、コードで溢れていると思っていた。

ただ実際はそうじゃないんだろうなというのがEVCacheから垣間見えてとても良かった。

このようなトピックを扱ってくれるPodcastがあって本当に嬉しい。

私は新卒からエンジニア歴が3年程度のぺーぺーのエンジニアなので八百万のエンジニアのトピックを完全に理解できないことも多いが、このコンテンツを通して世界の素晴らしいサービスの中身を知ることができるのは最高に楽しい。

