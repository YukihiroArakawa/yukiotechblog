---
title: "正規表現のコンパイルをメモ化すると若干速くなるらしいのでローカル環境で検証してみた"
date: 2025-03-16
categories: 
  - "java"
  - "performance"
coverImage: "Screenshot-from-2025-03-23-15-32-06.png"
slug: "memorize-regular-expression-complile"
type: "post"
---

## はじめに

「Effective Java 第3版」の第2章の項目6に「不必要なオブジェクトの生成を避ける」という内容のものがあり、そこで正規表現のコンパイルはクラス変数にキャッシングした方がパフォーマンスを大幅に改善できるとのことが書いてあったので、実際に試して確認してみました。

## 検証環境

条件は以下の通りになりますが、環境によって結果は変わると思いますので参考までにどうぞ。

- OS: Mac OS X

- CPU: Apple M1

- メモリ: 16GB

- jdk: AdoptOpenJDK 1.8.0\_292

## 効率の悪い書き方

ちなみに改善前の"効率が悪い"書き方は以下の通りです。

```
String regex = "[a-zA-Z]+";
String input = "HelloWorld";
long startTime = System.nanoTime();
for(int i=0; i<1000000; i++) {
    // パターンの比較をするたびに、パターンのコンパイルが実行されるため非効率
    Pattern pattern = Pattern.compile(regex);
    boolean isMatch = pattern.matcher(input).matches();
}
long endTime = System.nanoTime();
System.out.println("Execution time without precompilation: " + (endTime - startTime)/1e6 + "ms");
```

## 効率の良い書き方

次に一度パターンをコンパイルして、変数patternにキャシングして使い回す"効率が良い"書き方は以下の通りです。

```
import java.util.regex.Pattern;

// パターンのコンパイルは1回だけ実行されるため、
// パターンの比較が増えてもパターンのコンパイル時間は一定であり効率的
Pattern pattern = Pattern.compile("[a-zA-Z]+");

String input = "HelloWorld";
long startTime = System.nanoTime();
for(int i=0; i<1000000; i++) {
    boolean isMatch = pattern.matcher(input).matches();
}
long endTime = System.nanoTime();
System.out.println("Execution time with precompilation: " + (endTime - startTime)/1e6 + "ms");
```

## 検証結果

検証結果は以下の通りであり、コンパイルを事前に行ってキャッシングをすると、キャッシングしない場合に比べて3倍ほど速くなるという結果が出ました。

```
効率の悪い書き方: 470.19 ms
効率の良い書き方: 155.09 ms
```

オーダーが変わるほど計算量が低くなるわけではないですが、地味に効いてくるポイントだと思いますので、頭の片隅においておくとよいかもしれません。

## おわりに

今回はEffective Javaに掲載されていた正規表現のコンパイルをキャッシングすることによる性能改善を試してみました。

また正規表現の比較のコストが高いことから、正規表現の比較前にガード節としてif文を書いておいて、そもそも比較する必要がない場合は処理を抜けるという方法も性能改善の観点から有用だと思います。(「リファクタリング」に書いてあったような、、、)

こういった地味だけどちょっと速くなるみたいなポイントも積極的に抑えていきたいと思いました~

おしまい
