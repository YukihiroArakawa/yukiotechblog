---
title: "技術ブログをさくらインターネットのレンタルサーバーからCloudflareに移行した"
date: 2026-06-28
categories: 
    - "cloudflare"
    - "svelte"
slug: "migrate-techblog-from-sakura-to-cloudflare"
type: "post"
---

## さくらインターネットとWordpressで技術ブログをスタート

私は元々QiitaやZenn、はてなブログに技術記事を投稿していましたが、他人からつくコメントを気にしながらアウトプットする必要があり、もっと気軽に自分の意見が発信できる場があるといいなと常々思っていました。

そんな中で、とあるセキュリティ関連のイベントでさくらインターネットさんがレンタルサーバーのクーポンを配っていたことがありました。

ほぼ無料で自分の専用ブログを始める良い機会だということで、さくらインターネットのサービスを使い始めました。

まずは簡単にブログを始めようと思ったのでWordpressを入れようと思ったわけですが、そこでさくらインターネットの公式記事がたくさん出てきて大変有用だったのを覚えています。

ドメインを取得して、レンタルサーバー側に登録して、Wordpressをインストールして、、、、とやることは色々あるわけですが体系立てられた記事が沢山あり、とても助かりました。

個人ブログの立ち上げのハードルを大きく下げてくれている会社さんが日本にあるというのは非常に喜ばしいですね。


## 他のサービスにブログを移管したくなった

技術ブログをスタートするという意味では情報がたくさんあり非常に有益だったわけですが、使い続けるうちに徐々に別のサービスも使ってみたいな、、、となっていきました。

## 勉強しがいがない

簡単にブログを立ち上げられるということの裏返しになりますが、Wordpressをレンタルサーバー上に立ち上げるというだけでは、技術的な知識はあまり増えません。

モダンフロントエンドやクラウド周りの知識もブログサービス運用を通して少しでも学びたいなーとなったので、現在の構成では物足りなくなったわけです。

## もっと値段が安いサービスがある

さくらのレンタルサーバーも年間で7000円程度で運用できるため、そこまで高額なサービスではないのですが、世の中を見渡してみるともっと安いサービスがあります。

例えばCloudflare Pagesでは2026年6月時点では、無料枠として月当たり500回のビルド、20000ファイルまでデプロイ可能といった枠があります。

ちょっとしたブログサービスを作るうえでは十分すぎる枠があります。

https://developers.cloudflare.com/pages/platform/limits/

ちなみにCloudFlareのCEOが「Cloudflareでなぜ無料枠を大きく設けることができるのか」という点に述べているQ&Aが面白いので良かったら読んでみてください。

無料枠ユーザの利用によってQA的な側面を持っていたり様々な攻撃を観測するためなど色々理由があるそうです。

[How can CloudFlare offer a free CDN with unlimited bandwidth?](https://webmasters.stackexchange.com/questions/88659/how-can-cloudflare-offer-a-free-cdn-with-unlimited-bandwidth)

## もっと低レイテンシなサービスがあるかもしれない

またさくらのレンタルサーバーは国内のどこかに存在するとサーバーにデプロイされていると思われ、それによりレイテンシはさほど早くないです。

例えば、私のブログでは1.9秒ほど表示にかかることもあり、決して高速とは言えない速度に不満がありました。

一方でCloudflareなどのグローバルなクラウドサービス事業者は世界中にCDNを持っているということもあり、よりレイテンシを下げられるのではないかという仮説がありました。

## どのサービスに移管するか

移行先の選択肢は色々ありましたが、無料枠が大きいことや今後の学びが多そうだということでCloudflare Pagesにしました。

GitHub Pagesも手軽さという点ではCloudflare Pagesに引けを取らないと思いますが、今後Cloudflareのサービスを使ってサーバレスなアプリケーションを作ってみたかったのでCloudflare慣れしておきたかったので、見送りました。

またAWS S3に静的コンテンツを配置してCloudfront経由で配信するという方法もありますが、扱うコンポーネントが増えるという点がイマイチだったので見送りました。

## フロントエンドの技術スタックはどうするか

またWordpressを卒業してモダンフロントエンドに触れてみたいという気持ちがあったので利用するフロントエンドの技術選定もする必要がありました。

だいたい選択肢としてはReact、Vuejs、Svelte、Astroあたりがあったわけですが、記述量が少ないとされているSvelteを使うことにしました。

仕事ではReact、Vuejsに触れることが多いと思われますが、まぁPrivateなのでよりニッチよりな技術選定のほうが楽しそうという思いもありました。

あと、私が敬愛しているプログラマーであるryoppippiさんも個人サイトにSvelteを使っているので、どのような技術化興味があったというのも大きな理由(というかほぼこれ)としてありました。

https://github.com/ryoppippi/ryoppippi.com

## FrameworkにはSbelteKitを利用

FWにはSvelteKitを利用するようにしました。

SvelteKitのDocsによると、Svelteを使うより少ない記述でモダンなベストプラクティスに乗っかったアプリを構築できるとのことです。

> Svelte renders UI components. You can compose these components and render an entire page with just Svelte, but you need more than just Svelte to write an entire app.

> SvelteKit helps you build web apps while following modern best practices and providing solutions to common development challenges.

https://svelte.dev/docs/kit/introduction

なんだかよくわからんが、良さそうという気持ちで使ってます。

リンクを踏んだら別のページをレンダリングしたり、少ないコードになるようにビルドを最適化してくれたり、ユーザのページ遷移前に事前ロードしてくれたりとか、なんだか良さそうです。

>  It offers everything from basic functionalities — like a router that updates your UI when a link is clicked — to more advanced capabilities. Its extensive list of features includes build optimizations to load only the minimal required code; offline support; preloading pages before user navigation

Reactで言うところのNext、Vuejsで言うところのNuxtみたいな立ち位置らしいですね、どちらもがっつり使ったことがないのであまりピンとは来ないけど、そうらしい。

> if you're coming from React, SvelteKit is similar to Next. If you're coming from Vue, SvelteKit is similar to Nuxt.

### filesystem-based router

Sveltekitはファイルシステムベースのルーターとのことで、リポジトリの`src/routes`をルートとして、その配下にディレクトリを作成していくとそれに応じたURLにページがルーティングされるそうです。

便利。

> At the heart of SvelteKit is a filesystem-based router. The routes of your app — i.e. the URL paths that users can access — are defined by the directories in your codebase:

https://svelte.dev/docs/kit/routing

例えば、`src/routes/about`のディレクトリを作ると、`/about`のルートができるとのこと。

このブログプロジェクトだと、以下の通りになりました。

```bash
$ tree src/routes/

src/routes/
├── blog
│   ├── +page.server.ts
│   ├── +page.svelte
│   └── [slug]
│       ├── images
│       │   └── [file]
│       ├── +page.server.ts
│       └── +page.svelte
├── category
│   └── [category]
│       ├── +page.server.ts
│       └── +page.svelte
├── +layout.svelte
├── +layout.ts
├── +page.server.ts
├── +page.svelte
└── [slug]
    ├── +page.server.ts
    └── +page.svelte

8 directories, 12 files
```

[]という形で記述すると動的にURL生成できるそうで、ブログごとにURLを生成するときに用いています。

### +page

また基本的な使い方として`+page.svelte`というコンポーネントにhtmlを書いておいて、ページをレンダリングする前にごにょごにょデータを読み込みたい場合は`+page.js`に色々書いて、`+page.svelte`で参照するという形を取るみたいです。

トップページの`+page.svelte`は以下のとおりで、次に記載した`+page.server.ts`を読み込んでいそう。

```ts
<script lang="ts">
  import { resolve } from '$app/paths';

  let { data } = $props();
</script>

<main class="home">
  <section class="intro">
    <p class="eyebrow">Engineering notes</p>
    <h1>yukiotechblog</h1>
    <p>Notes on databases, distributed systems, developer tooling, and engineering experiments.</p>
  </section>

  <section class="post-list" aria-label="Representative articles">
    {#each data.posts as post (post.slug)}
      <article class="post-row">
        <a href={resolve(`/${post.slug}`)}>
          <time datetime={post.date}>{post.date}</time>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </a>
      </article>
    {/each}
  </section>
</main>
```

```ts
import { listRepresentativePosts } from '$lib/server/posts';

export async function load() {
  return {
    posts: await listRepresentativePosts()
  };
}
```

postsという変数に入ったデータを#eachで繰り返し処理して表示させている感じですかね。

なんかだいぶ前に触ったRuby on RailsのERBというテンプレートエンジン？と使い方が似ているなという気がしました。

フロント技術だから当たり前かもですが。

ERBの場合はバックエンドで取ったデータを直接読み込むという点が違いになるのかな。

### Markdownの表示はmarkdown-itを利用

なお記事の執筆はMarkdownで行いたいので、`markdown-it`というライブラリを用いてmdからhtmlに変換するようにしています。

https://github.com/markdown-it/markdown-it

まだやってないですが、`highlight.js`と組み合わせることでシンタックスハイライトも付けられるそうです。

```js
import markdownit from 'markdown-it'
import hljs from 'highlight.js' // https://highlightjs.org

// Actual default values
const md = markdownit({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }

    return ''; // use external default escaping
  }
});
```

## デプロイはWranglerを利用

Cloudflareには便利なCLIツールとしてWranglerというものがあるそうです。

> Wrangler, the Cloudflare Developer Platform command-line interface (CLI), allows you to manage Worker projects.
https://developers.cloudflare.com/workers/wrangler/

Cloudflare Workerプロジェクトを管理することができるとありますが、Pagesの管理にも使えます。

```bash
$ wrangler pages --help
wrangler pages

⚡️ Configure Cloudflare Pages

COMMANDS
  wrangler pages dev [directory] [command]  Develop your full-stack Pages application locally
  wrangler pages functions                  Helpers related to Pages Functions
  wrangler pages project                    Interact with your Pages projects
  wrangler pages deployment                 Interact with the deployments of a project
  wrangler pages deploy [directory]         Deploy a directory of static assets as a Pages deployment
  wrangler pages secret                     Generate a secret that can be referenced in a Pages project
  wrangler pages download                   Download settings from your project

GLOBAL FLAGS
      --cwd       Run as if Wrangler was started in the specified directory instead of the current working directory  [string]
      --env-file  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files  [array]
  -h, --help      Show help  [boolean]
  -v, --version   Show version number  [boolean]
```

`wrangler pages deploy --branch main`で簡単にPagesにデプロイすることができるので、ブログを書いたらビルドしてコマンド実行すれば投稿完了です。

## おわりに

書ききれなかったポイントは以下のとおり色々ありますが、今後運用してみてフロントやCloudflareスタックへの理解を深めていって、もっといい感じのアプリを作れるようになりたいですね。

- プロジェクトの依存管理はNixを利用
- task runnerにはjustを
- linter/formatterをpre commit hookとして設定



