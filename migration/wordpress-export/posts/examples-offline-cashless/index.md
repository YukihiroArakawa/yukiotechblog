---
title: "オフライン電子決済の事例"
date: 2025-03-16
categories: 
  - "fintech"
coverImage: "Screenshot-from-2025-03-23-16-11-39.png"
slug: "examples-offline-cashless"
type: "post"
---

## はじめに

みなさん、「キャッシュレス決済したこと」はありますか？  
おそらく、多くの人が「1回はある」と答えると思います。

一方で、「オフラインでキャッシュレス決済したこと」がある人はどれほどいるでしょうか？  
おそらく、Yesと答える人はさほどいないのではないでしょうか？

本記事では、オフライン電子決済の事例の紹介を通して、オフライン電子決済の技術的な背景を知るきっかけ作りをしたいと思います。

## ユーザのみオフラインでよいPayPay

まず最近注目のオフライン決済といえば、PayPayのオフライン決済機能は外せないでしょう\[1\]。

PayPayのオフライン決済機能は、支払いを行うクライアントのアプリがオフラインであっても店舗がオンラインであれば、支払いが可能というものです。

また、セキュリティの確保のため1日あたりのオフライン決済可能額が設けられているようです。

ユースケースとしては、以下の2点が想定されているようです。

1. 屋内や地下などで店舗の端末にはWi-Fi経由でネットワークに接続されているが、利用者のモバイルネットワーク通信は繋がらない場合

3. 大人数が集まるイベント会場でネットワークが混線するような場合

この機能は完全オフラインの決済ではないものの、日常生活で時々発生する不便を解消している点がとてもユニークで面白いですね。

また、この機能のリリースを受けて、「完全オフラインの決済が必要になるシーンは災害時、ネットワーク断絶時などが想定されるが、そもそも稀でそんな時は決済しないのでは？」ということが頭に浮かびました。

## ユーザも店舗もオフラインで決済が可能なMondex

実は世界初のオフラインでの電子決済を実現したのは先述のPayPayでもなければ、決済大手のMastercardでもありません。

オフライン決済を世界初で実現したのは「Mondex」という商品で、誕生年はなんと1997年です\[2, 3\]。

Mondexの仕組みを簡単に説明すると、ユーザはMondexカードと個人間送金のためのデバイスを持ち歩くことで、別のユーザとオフラインでも送金が可能というものです。

ここでは深く掘り下げませんが、「トークン型の電子現金方式」に分類される決済手段であり、お金のトークンをユーザ間で送信するたびにトークンに電子署名を付加していくことで、不正利用発生時の追跡可能性を担保するものです。

Mondexは専用デバイスを持ち歩かなければいけないなど利便性の問題で普及しなかったそうですが、2023年現在、中央銀行デジタル通貨を検討する中で改めてオフライン決済可能なMondexの方式が注目されているようです\[4\]。

## ガラケーでのオフライン決済「DigiTally」

また、他のオフライン決済の方式としては2017年にパイロット実験が行われた「DigiTally」と呼ばれるものがあります\[3, 5\]。

「DigiTally」はフィーチャーフォンでも利用できることを想定しており、送受信するユーザのフィーチャーフォンの電話番号と送金額をもとに生成した番号を相手に伝えることで送金を実現します。

ネットワークが繋がらず、銀行口座の保有割合が低い途上国でのユースケースが主に想定されているようです。

## 実はオフライン決済にも対応しているらしいデジタル中華人民元

最後に現在最もユーザ数が多いオフライン決済としてデジタル人民元を紹介したいと思います\[6\]。

デジタル人民元自体は2021年にオンライン決済が可能な通貨としてローンチしており、世界の主要国の中で速攻でリリースされたとして話題になっていました。

2023年現在でアメリカも日本もCBDCをリリースすることすらしていない中で、ユーザ数が世界一多いデジタル通貨が今やオフラインでも利用できるとのことで衝撃です。

## おわりに

本記事ではオフライン決済が導入されている事例を中心にまとめてご紹介しました。

これからオフライン決済がどこまで広がっていくのかはわかりませんが、いつか本当にお札や硬貨を持ち歩かなくてもよい時代が来たら最高ですね。

## 参考

\[1\] paypay株式会社. (2023, July).「PayPay」に国内主要コード決済初、インターネットにつながっていなくても決済ができる機能（特許出願中）を搭載！. https://about.paypay.ne.jp/pr/20230720/01/

\[2\] 日立評論. (1997, May). 電子マネーシステム「モンデックス」の新展開. https://www.hitachihyoron.com/jp/pdf/1997/05/1997\_05\_06.pdf

\[3\] CBC. (2022 Feb). The Mondex electronic money card hoped to make cash obsolete. https://www.cbc.ca/archives/the-mondex-electronic-money-card-hoped-to-make-cash-obsolete-1.5454888

\[4\] 日本銀行 決済機構局. (2020, July). 中銀デジタル通貨が現金同等の機能を持つための技術的課題. https://www.boj.or.jp/research/brp/psr/data/psrb200702.pdf

\[5\] Baqer, K., & Anderson, R. (2017). DigiTally: Piloting Offline Payments for Phones. https://www.usenix.org/system/files/conference/soups2017/soups2017-baqer.pdf

\[6\] Central Banking. (2023). PBoC launches offline CBDC payments. https://www.centralbanking.com/fintech/cbdc/7954211/pboc-launches-offline-cbdc-payments

\[7\] The Wall Street Jornal. China Creates Its Own Digital Currency, a First for Major Economy. https://www.wsj.com/articles/china-creates-its-own-digital-currency-a-first-for-major-economy-11617634118

\[8\] Bank of international(2023). Project Polaris: Handbook for offline payments with CBDC .https://www.bis.org/publ/othp64.pdf
