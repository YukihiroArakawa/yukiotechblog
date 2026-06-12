---
title: "TiDBクラスター操作時にロングトランザクションがkillされる流れについて図解解説"
date: 2026-04-20
categories: 
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-kill-long-tx-when-cluster-modified"
type: "post"
---

## はじめに

今回は無停止でのクラスター操作が可能と言われているTiDBにおいて、SpringBatchの使い方の誤りにより、クラスター操作中にtxがkillされてしまう事例についてご紹介します。

## 前提となるTiDBクラスター構成

前提となるクラスター構成は以下の通りです。

ポイントはTiProxyを挟んでいることでノード変更中のTiDBへは新規処理がルーティングされないような構成となっていることです。

- version: TiDB Cloud Dedicated v8.5.x

- TiProxy: small x 2 nodes

- TiDB Server: 8vCPUs, 32GB Memory x 2 nodes

- TiKV Server: 8vCPUs, 32GB Memory x 3 nodes

## TiDBクラスター操作時はローリングアップデートされる

まずはTiDBクラスターを操作してTiDB Serverをupdateする際の動きについて説明します。

TiDBでは複数ノードが冗長化されて運用されており、TiDBクラスター操作時は1ノードずつ操作することで、全体としては止まらずに動き続けるといった挙動を取ります。

いわゆる「ローリングアップデート」と呼ばれる方法ですね。

## 既にtx処理がある場合はどうなる？

ここで既にtx処理が操作対象ノードに対して走っている場合を考えてみましょう。

以下ではC1 から P1 を経由して D1 でトランザクションが処理されている状況を示しています。

```
flowchart LR
    subgraph Clients
        C1[C1]
        C2[C2]
    end

    subgraph PC[TiProxy Nodes]
        P1[P1]
        P2[P2]
    end

    subgraph TiDB[TiDB Nodes]
        D1[D1]
        D2[D2]
    end

    C1 ==tx 処理中==> P1
    C2 -.待機.- P2
    P1 ==tx 処理中==> D1
    P2 -.待機.- D2
```

## tx処理中のノードの処理を待つ

ノード変更する際に、既にtx処理がある場合、graceful wait before shutdownというパラメータで設定された秒数だけ処理を待つ挙動を取ります。

TiDB Cloudではk8s上で動くため、デフォルトでは30秒待ちます。

[https://docs.pingcap.com/ja/tidb/stable/tidb-configuration-file/#code-graceful-wait-before-shutdown-code-span-class-version-mark-new-in-v5-0-](https://docs.pingcap.com/ja/tidb/stable/tidb-configuration-file/#code-graceful-wait-before-shutdown-code-span-class-version-mark-new-in-v5-0-)

また待っている間は、TiProxyから新規txが対象TiDBノードへルーティングされなくなります。

```
flowchart LR
    subgraph Clients
        C1[C1]
        C2[C2]
    end

    subgraph PC[TiProxy Nodes]
        P1[P1]
        P2[P2]
    end

    subgraph TiDB[TiDB Nodes]
        D1["D1<br/>shutdown 待機中"]
        D2[D2]
    end

    C1 ==>|tx 処理中| P1
    C2 ==>|新規tx| P2
    P1 ==>|継続tx| D1
    P2 ==>|新規tx| D2
    P1 -.->|新規txはルーティング不可| D1

```

なおTiProxyを挟んでいない場合はクラスター操作時にクライアント接続が切断されてしまいます。  
https://docs.pingcap.com/ja/tidb/stable/tiproxy-overview/

## txが待ち時間中に終わった場合、正常にノードが増える

ここでgraceful wait before shutdownの時間内にtx処理が終わった場合、ノードはシャットダウンされ、新規ノードが立ち上がります。

```
flowchart LR
    subgraph Clients
        C1[C1]
        C2[C2]
    end

    subgraph PC[TiProxy Nodes]
        P1[P1]
        P2[P2]
    end

    subgraph TiDB[TiDB Nodes]
        D1[D1<br/>shutdown 済]:::removed
        D2[D2]
        D3[D3<br/>新規ノード]:::added
    end

    C1 ==tx 完了後 再接続==> P1
    C2 ==> P2
    P1 ==> D3
    P2 ==> D2

    classDef removed stroke-dasharray: 5 5,color:#999
    classDef added stroke:#2a2,stroke-width:2px
```

## tx処理が終わらなかった場合でもノードは強制シャットダウン

graceful wait before shutdownの時間内にtx処理が終わらなかった場合はどうでしょうか。

TiDBでは待つだけ待ったらノードはシャットダウンされるので、txはkillされることになります。

```
flowchart LR
    subgraph Clients
        C1[C1<br/>tx kill されエラー]:::killed
        C2[C2]
    end

    subgraph PC[TiProxy Nodes]
        P1[P1]
        P2[P2]
    end

    subgraph TiDB[TiDB Nodes]
        D1[D1<br/>強制 shutdown]:::removed
        D2[D2]
    end

    C1 --x|切断| P1
    C2 ==> P2
    P1 --x|tx 中断| D1
    P2 ==> D2

    classDef removed stroke-dasharray: 5 5,color:#999
    classDef killed stroke:#a22,stroke-width:2px
```

## TiDB利用時はtxは短くするよう意識する

このTiDBの仕様を考えると、txはなるべく短くするのが望ましいです。

一般的にもロック競合を減らす、メモリ量を減らすという意味でtxは短くするのが望ましいと思いますが、TiDBの場合だとkillされてしまうので要注意です。

TiDBを使えばいかなる時もゼロダウンタイムでクラスター操作ができるというわけではないのです。

## そんなロングトランザクションとか素人みたいなことやってませんよ

「いやいや、30秒以上のtxとか実装するわけないじゃないですか。DB素人ですか？」

と思った方もいらっしゃるかと思います。

サービス間を跨ぐ分散txの場合は分かりませんが、DB単体のtxで30秒以上となるとかなり長いtxになると思います。

「そんなtxあるんかい」という感じですよね。

## Spring Batchの暗黙的tx

と思っていましたが、実際にありました。

JavaのSpringBootにはバッチ用のフレームワークとして。SpringBatchという非常にポピュラーなものがあります。

SpringBatchにはChunk ModelとTasklet Modelという2パターンの書き方ができます。

前者は参照/データ処理/書込みといった単位でStep処理を記述しフロー制御するモデルです。

後者はStep処理を自由に記述してフロー制御するモデルです。

私の現場では後者のTasklet Modelを使っていました。

## Tasklet単位でFW側がtxを貼る

ここでFW側がTasklet単位でtxを自動で貼ってくれるようになっています。

> Each call to a Tasklet is wrapped in a transaction. Tasklet implementors might call a stored procedure, a script, or a SQL update statement.

[https://docs.spring.io/spring-batch/docs/5.0.6/reference/html/step.html](https://docs.spring.io/spring-batch/docs/5.0.6/reference/html/step.html)

tx管理もfw側がよしなにやってくれるということですね。

## Taskletに処理を詰め込みすぎており知らず知らずにロングtxに

ここで私の現場では、先述の自動で付与されるtxの存在を知らずに、Taskletに処理を詰め込みまくってました。。。。

Taskletの中でビジネスロジックを記述して、その中でrequires newした新規txを貼っていたという感じですね。

具体的にはポイント付与をするバッチにおいて付与処理部分が全て1Taskletになっており、バッチ処理の大半の時間は付与Taskletにおいて行われていました。

そのため30秒とかいうレベルのtxではなく、1時間といったレベルのtxになっていました。

それによって本番前のSTG環境にてTiDBクラスターを操作した際にバッチ処理が中断されることとなってしましました。

## FWを使う時はレールに乗った使い方をしよう

このようなミスを犯さないために皆さんはFWを使う時はレールに乗った使い方をするようにしましょう。

またレールを外れる場合はFWの仕様をしっかりと理解した上で、レールを外れる覚悟を持った上で外れましょう、、

そこまで来たらFW使わなくて良いのではという感じがしますが

## ゼロダウンタイムと謳っていても動作検証は入念に

またTiDBの触れ込みとしてゼロタウンタイムでのスケーリングと言われることがありますが、実際に処理を流しながらクラスター操作をして検証してみることをおすすめしたいです。

今回のような仕様に気づくこともあるでしょうし、他にもTiDBにはクエリレベルのメモリ使用量のクォータなどもあったりするので色々な気づきが得られると思います。

## おわりに

オレオレFWは考えているときは楽しいですが、FWにFWを重ねるようなことをする際は気をつけた方がいいですねー
