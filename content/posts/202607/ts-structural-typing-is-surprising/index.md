---
title: "Javaばっかやってた人からするとTSのStructual Typingは衝撃"
date: 2026-07-07
categories: ["typescript"]
slug: "ts-structural-typing-is-surprising"
type: "post"
---

## 「TypeScript for Java/C# Programmers」とか言う神資料

ずーっとJava/Kotlinばかり触っていた私ですが、最近モダンフロントエンドに触り始めたのでTypescriptの資料を色々と読んでキャッチアップをしています。

ただチュートリアルを一からなぞるのもめんどうだなーと思っていたら良い資料がありました。

「[TypeScript for Java/C# Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-oop.html#erased-structural-types)」という資料でTypescript公式から出ています。

内容はJavaとかC#のようなオブジェクト指向言語を触っていた人に向けたTypescriptの解説記事です。

## 「Consequences of Structural Typing」

気が利く記事書いてくれて助かる〜と思いながら読み進めていましたが、衝撃の記載を見つけました。

## 「Identical Types」

driveというメソッドを持つCar、Golferというクラスがあり、Carの型の変数wにGolferを代入しようとしています。

```ts
class Car {
  drive() {
    // hit the gas
  }
}

class Golfer {
  drive() {
    // hit the ball far
  }
}
```

```ts
// No error?
let w: Car = new Golfer();
```

なんと、これエラーにならないそうです。

まじで？？？

別のクラスやろ！！！

## 構造が一緒だからエラーじゃないよん

> Again, this isn’t an error because the structures of these classes are the same

資料によると構造が一緒だからエラーじゃないとのことです。

ただ、どこかで問題にならないのだろうか、、、とぱっと見では感じました。

> While this may seem like a potential source of confusion, in practice, identical classes that shouldn’t be related are not common.

資料では、「ややこしいと思うけど、同一構造のクラスで互いに関係がないものというのはまぁそんなにないよ」と言っています。

つまり問題にならないという言っているわけですね。

本当に？？？

## 少し寝かせてみたらちょっと便利な気がしてきた

この概念に触れてから少し時間をおいて考えてみたら、案外便利そうかもと思いました。

具体的なケースとしてはテスト時のモックの差し替えの際にわざわざインターフェースを定義しなくても良くなるという点です。

JavaだとServiceクラスで呼び出しているRepositoryクラスをモックしようとすると、わざわざRepositoryクラスのインターフェースを作成して、モック用のクラスと実装用のクラスのそれぞれに実装させるという書き方をする必要があります。

```java
interface Repository { ... }
class RealRepository implements Repository { ... }
class MockRepository implements Repository { ... }
```

それがTypescriptだとインターフェースとかわざわざ作らなくてもいいということになります。

```ts
  class RealRepository {
    find(id: string) {
      return { id, name: "real" };
    }
  }

  class MockRepository {
    find(id: string) {
      return { id, name: "mock" };
    }
  }

  function run(repo: RealRepository) {
    return repo.find("1");
  }

  run(new MockRepository());
```

むっちゃ便利やん。

## 問題になるケースは何か？

わざわざお作法的なインターフェースを書かなくても良いのが便利だとは、わかりましたが反対にこれが問題になるのはどのようなケースなのでしょうか。


具体的には以下のように同一フィールドだけど、区別したいような多国籍な通貨を扱う場合に困ると、codex(gpt-5.5 medium)さんが教えてくれました。

```ts
class Yen {
constructor(public amount: number) {}
}

class Dollar {
constructor(public amount: number) {}
}

function pay(price: Yen) {}

pay(new Dollar(10)); // 通る

```

円とドルを区別したいのにこれだと型システムで区別することができません。

## 型にブランドをつける

対処法としては型にブランドを付けて区別できるようにするらしいです。

```ts
type UserId = string & { readonly __brand: "UserId" };
type PostId = string & { readonly __brand: "PostId" };
```

なんか、そうなってくるとJavaみたいな仕様の方がやらかしたらやばいケアレスミスは防げそうな気がしてきたな、、、

金融系だとTS使うの怖いな‐という気持ちになりました。

## discriminated unionで区別できるようにする

他にはフィールドに識別子を追加するというアプローチがあるそうです。

```ts
type Yen = {
    currency: "JPY";
    amount: number;
};

type Dollar = {
    currency: "USD";
    amount: number;
};
```

うーん、それクラス名で良くないですか、、、

## おわりに

TS知ってる人からすると何を今更という話かもしれませんが、衝撃を受けたので記事に起こしてしまいました。

他にも面白いポイント色々あるのかな、、、

