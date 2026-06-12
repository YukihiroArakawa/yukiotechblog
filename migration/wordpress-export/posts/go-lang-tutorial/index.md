---
title: "[翻訳]チュートリアル: GoとGinによるRESTfulなAPI開発(原文: Tutorial: Developing a RESTFul API with Go and Gin)"
date: 2025-03-16
categories: 
  - "golang"
coverImage: "Screenshot-from-2025-03-23-15-55-23.png"
slug: "go-lang-tutorial"
type: "post"
---

## この記事について

この記事はTutorial: Developing a RESTful API with Go and Ginを翻訳したものになります(2022/07/29最終更新)。ソースコード以外は意訳が含まれている可能性があるので、気になる箇所は[原文](https://go.dev/doc/tutorial/web-service-gin)をご参照ください。

## 目次

- 準備

- APIのエンドポイントの設計

- コードのフォルダを作成

- データの作成

- すべてのアイテムを返すハンドラーを書く

- 新しいアイテムを追加するハンドラを書く

- 特定のアイテムを返すハンドラを書く

- 総括

- 完成したコード

このチュートリアルでは、Go言語と[WebフレームワークGin](https://gin-gonic.com/docs/)(以降Gin)によるRESTFulなwebサービスのAPIを書くための基本を紹介します。

もしGo言語とそのツールに慣れているなら、このチュートリアルから多くのことを得られるでしょう。  
もしあなたがGOを触るのが初めてということでしたら、簡単な導入として[Tutorial: Get started with Go](https://go.dev/doc/tutorial/getting-started)を見てください。

GinはWebサービスを含めたWebアプリケーションを構築するのに関わる多くのコーディングのタスクをシンプルにします。

このチュートリアルでは、Ginを使用して、リクエストをルーティングし、リクエストの詳細を取得し、レスポンスのJSONをマーシャル(\*1)します。

> (\*1)マーシャル: 異なる技術基盤で実装されたコンピュータプログラム間で、データの交換や機能の呼び出しができるようデータ形式の変換などを行うことを指します([IT用語辞典 e-Words](https://e-words.jp/w/%E3%83%9E%E3%83%BC%E3%82%B7%E3%83%A3%E3%83%AA%E3%83%B3%E3%82%B0.html#:~:text=%E3%83%9E%E3%83%BC%E3%82%B7%E3%83%A3%E3%83%AA%E3%83%B3%E3%82%B0%20%E3%80%90marshalling%E3%80%91%20marshaling,%E5%A4%89%E6%8F%9B%E3%81%AA%E3%81%A9%E3%82%92%E8%A1%8C%E3%81%86%E3%81%93%E3%81%A8%E3%80%82))。

このチュートリアルでは、2つのエンドポイントを持ったRESTfulなAPIサーバを構築します。  
例となるプロジェクトはビンテージのジャズのレコードについてのデータのリポジトリです。

このチュートリアルは以下のセクションを含みます。

1.APIエンドポイントの設計  
2.コードのフォルダの作成  
3.データの作成  
4.すべてのアイテムを返すハンドラーを書く  
5.新しいアイテムを追加するハンドラを書く  
6.特定のアイテムを返すハンドラを書く

メモ: 他のチュートリアルは、[Tutorials](https://go.dev/doc/tutorial/index.html)を参照

Google Cloud Shellで完結するインタラクティブなチュートリアルとして試すには、以下のボタンをクリックしてください。

[Google Coud Shellを開く](https://ide.cloud.google.com/?cloudshell_workspace=~&walkthrough_tutorial_url=https://raw.githubusercontent.com/golang/tour/master/tutorial/web-service-gin.md)

## 準備

- Go 1.16以上のインストール。インストールの手順は、[Goのインストール](https://go.dev/doc/install)を御覧ください。

- コードを編集するためのツール。使い慣れたもので大丈夫です。

- コマンドターミナル。GoはLinux/Macのターミナル・WindowsのPowershellやcmdの内いずれを使っても上手く動作します。

- curlツール。LinuxとMaxではこれは既にインストールされています。Windowsの場合、Windows 10 Insiderビルド17063以降に搭載されています。それ以前のWindowsバージョンでは、インストールが必要な場合があります。詳しくは、[Tar and Curl Come to Windows](https://docs.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows)をご覧ください。

## APIエンドポイントの設計

あなたは、レコードのビンテージ盤を販売する店へのアクセスを提供するAPIを構築することになります。

そこで、クライアントがユーザのためにアルバムを取得したり追加したりできるエンドポイントを提供する必要があります。

APIを開発するとき、通常はエンドポイントを設計することから始めます。  
エンドポイントが分かりやすいと、APIの利用者はより成功するようになります。

このチュートリアルで作成するエンドポイントは、以下のとおりです。

/albums

- `GET` – すべてのアルバムのリストを取得してJSONを返します.

- `POST` – JSON形式で送信されたリクエストデータから新しいアルバムを追加します。

/albums/:id

- `GET` – そのID(`:id`)でアルバムを取得して、JSON形式のアルバムのデータを返します。

次に、あなたのコードのためのフォルダを作成します。

## コードのフォルダを作成

はじめに、これから書くコードのためのプロジェクトを作成します。

コマンドプロンプトを開いて、ホームディレクトリへ移動してください。

Linux もしくは Mac:

```
$ cd
```

Windows:

```
C:\> cd %HOMEPATH%
```

`web-service-gin`というディレクトリをコマンドプロンプトを使って作成しましょう.

```
$ mkdir web-service-gin
$ cd web-service-gin
```

依存を管理するためにモジュールを作成しましょう

あなたのコードが含まれるモジュールのパスを与えて、以下のように`go mod init`コマンドを実行してください。

```
$ go mod init example/web-service-gin
go: creating new go.mod: module example/web-service-gin
```

このコマンドは go.mod ファイルを作成し、そこにあなたが追加した依存関係をトラッキングするためにリストアップします。

モジュールパスによるモジュールの命名についての詳細は、[依存関係の管理](https://go.dev/doc/modules/managing-dependencies#naming_module)を参照してください。

次にデータを操作するためにデータ構造を設計します。

## データの作成

このチュートリアルでは単純化するために、データはメモリに保存するようにします。  
もっと典型的なAPIはデータベースとやり取りします。

メモリにデータが保存されるという事は、サーバを停止するたびにアルバムのセットが失われ、開始する時に再度作成されることを意味していることに注意してください。

**コードを書く**  
1.テキストエディタを使って、`web-service-directory`に`main.go`というファイルを作成してください。このファイルにGoのコードを書くことになります。  
2.`main.go`のファイルの一番上に以下のパッケージの宣言をペーストしてください。

```
package main
```

(ライブラリとは異なる)スタンドアロンのプログラムは常に`package main`に含まれます。

3.パッケージの宣言の下に、以下の構造体`album`の宣言をペーストしてください。アルバムをメモリに保存するためにこれを使うことになります。

`json:"artist"`のような構造体のタグは、構造体の中身が`JSON`にシリアライズされたときに、どういったフィールドの名前であるべきかを特定します。

それらが無いと、JSONではあまり一般的ではない構造体の大文字のフィールド名が使用されます。

```
// albumはレコードのアルバムに関するデータを表します
type album struct {
    ID     string  `json:"id"`
    Title  string  `json:"title"`
    Artist string  `json:"artist"`
    Price  float64 `json:"price"`
}
```

4.先程追加した構造体の宣言の下に、はじめから使うことになるデータを含んだ構造体`album`のスライスをペーストしましょう。

```
// レコードのアルバムのデータの素となるスライス`albums`
var albums = []album{
    {ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
    {ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
    {ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}
```

次に、最初のエンドポイントを実装するコードを書きます。

## すべてのアイテムを返すハンドラーを書く

クライアントが`GET /albums`とリクエストしたとき、JSON形式の全てのアルバムを返したくなります。

そうするために、以下の事を書く必要があります:

- レスポンスを準備するロジック

- リクエストのパスを上記のロジックに割り当てるコード

これは、実行時に実行される方法とは逆で、最初に依存関係を追加し、次にそれに依存するコードを追加することになることに注意してください。

**コードを書く**  
1.前のセクションで追加した構造体のコードの下に、アルバムリストを取得するための次のコードを貼り付けます。

この関数`getAlbums`は、構造体アルバムのスライスから `JSON`を作成し、その`JSON`をレスポンスに書き込んでいます。

```
// getAlbumsはJSON形式の全てのアルバムのリストを返えします。
func getAlbums(c *gin.Context) {
    c.IndentedJSON(http.StatusOK, albums)
}
```

このコードでは、あなたは:

- `gin.COntext`のパラメタを受け取る`getAlbums`関数を書いています。GinもGoも特定のフォーマットの関数名を要求していませんので、この関数には任意の名前を付けることができます。

`gin.Context`は`Gin`の最も重要な部分です。これはリクエストの詳細を運び、検証し、`JSON`形式にシリアライズなどします。(似た名前ですが、Goにビルトインパッケージ`context`とは異なります。)

- `Context.IndentedJSON`を呼び出して、構造体を`JSON`にシリアライズして、レスポンスに追加します。

この関数の最初の引数は、あなたがクライアントへ送信したい`HTTP`ステータスコードです。ここでは、あなたはパッケージ`net/http`から`200 OK`を示す定数`StatusOK`を渡しています。

ここでよりコンパクトなJSONを返す`Context.JSON`の呼び出しに`Context.IndentedJSON`を置き換えられることを伝えておきます。  
実際のところは、デバッグしたりサイズの違いが通常よりも小さい場合に、インデントされた形式は上手く働きます。

2.`main.go`の最初付近で丁度スライス`albums`の宣言の下あたりに、エンドポイントのパスをハンドラの関数に割り当てる以下のコードをペーストしてください。

これは、`getAlbums`がエンドポイントのパス`/albums`へのリクエストを処理する関連付けを設定します。

```
func main() {
    router := gin.Default()
    router.GET("/albums", getAlbums)

    router.Run("localhost:8080")
}
```

このコードでは:

- Ginのルーターをデフォルトで使うために初期化しています。

- `GET`関数を使って、HTTPメソッド`GET`と`/albums`をハンドラ関数に関連付けています。

- `getAlbums`関数の名前を渡していることに注意してください。これは、`getAlbums()`を使って関数の結果を渡すのとは違います(カッコに注目してください)。

- `Run`関数を使用して、ルータに`http.Server`を割り当てて、サーバを開始しています。

3.`main.go`の最初のあたりで丁度パッケージの宣言の下に、あなたが書いたコードをサポートするのに必要になるパッケージをインポートしてください。

コードの最初の行はこのようになります:

```
package main

import (
    "net/http"

    "github.com/gin-gonic/gin"
)
```

4.`main.go`を保存する

**コードを書く**  
1.モジュール`Gin`を依存として追跡することをはじめる。

コマンドラインで、`go get`を使って、モジュール`github.com/gin-gonic/gin`をあなたのモジュールの依存として追加してください。  
引数`.`の使用は、「現在のディレクトリにコードの依存を取得する」ということを意味しています。

```
$ go get .
go get: added github.com/gin-gonic/gin v1.7.2
```

Goはあなたが前のステップで追加したインポートの宣言を満たすように依存を解決してダウンロードしました。

2.`main.go`を含むディレクトリのコマンドラインから、コードを実行してください。引数ドットを使用していることは、「現在のディレクトリでコードを実行する」ということを意味しています。

```
$ go run .
```

一度コードが実行されたら、リクエストを送信できるHTTPサーバが起動します。

3.新しいウィンドウのコマンドラインから、`curl`を使ってリクエストを実行中のwebサービスへリクエストを送ってください。

```
$ curl http://localhost:8080/albums
```

このコマンドはサービスの素となっているデータを表示します。

```
[
        {
                "id": "1",
                "title": "Blue Train",
                "artist": "John Coltrane",
                "price": 56.99
        },
        {
                "id": "2",
                "title": "Jeru",
                "artist": "Gerry Mulligan",
                "price": 17.99
        },
        {
                "id": "3",
                "title": "Sarah Vaughan and Clifford Brown",
                "artist": "Sarah Vaughan",
                "price": 39.99
        }
]
```

APIを開始しました！次のセクションでは、アイテムを追加する`POST`リクエストを操作するコードを別のエンドポイントと共に作ることになります。

## 新しいアイテムを追加するハンドラを書く

クライアントが`/albums`で`POST`リクエストを行った場合、リクエストボディに記述されているアルバムを既存のアルバムのデータに追加したいですね。

そうするため、以下のことを書くことになります

- 既存のリストに新しいアルバムを追加するロジック

- 上記のロジックへ`POST`リクエストをルーティングするちょっとしたコード

**コードを書く**  
1.アルバムのリストへアルバムのデータを追加するコードを加える

重要なステートメントの後のどこかに、次のコードをペーストしてください(ファイルの最後がこのコードにとってはいい場所になりますが、Goは関数が宣言された場所の順序を矯正しません)。

```
// postAlbumsはリクエストボディのJSONからアルバムを追加します
func postAlbums(c *gin.Context) {
    var newAlbum album

    // 受け取ったJSONを`newAlbum`にバインドするために`BindJSON`を呼び出す
    if err := c.BindJSON(&newAlbum); err != nil {
        return
    }

    // スライスへ新しいアルバムを追加する
    albums = append(albums, newAlbum)
    c.IndentedJSON(http.StatusCreated, newAlbum)
}
```

このコードでは:

- `Context.BindJSON`を使って、`newAlbum`へリクエストボディをバインドしています。

- `JSON`から初期化された構造体`album`をスライス`album`に追加します。

- レスポンスに`201`のステータスコードと、追加したアルバムを表す`JSON`を追加します。

2.次のように`router.POST`関数を含むように、`main`関数を変更する。

```
func main() {
    router := gin.Default()
    router.GET("/albums", getAlbums)
    router.POST("/albums", postAlbums)

    router.Run("localhost:8080")
}
```

このコードでは:

- パス`/albums`の`POST`メソッドと`postAlbums`関数に関連付けています

- Gin では、HTTP メソッドとパスの組み合わせにハンドラを関連付けることができます。  
    このように、クライアントが使用しているメソッドに基づいて、単一のパスに送信されたリクエストを個別にルーティングすることができます。

**コード実行する**  
1.もしサーバをまだ止めていないのであれば、止めてください

2.`main.go`が含まれているディレクトリのコマンドラインから、コードを実行してください。

```
$ go run .
```

3.別のコマンドラインのウィンドウから、`curl`を使って実行しているウェブサービスへリクエストを行ってください.

```
$ curl http://localhost:8080/albums \
    --include \
    --header "Content-Type: application/json" \
    --request "POST" \
    --data '{"id": "4","title": "The Modern Sound of Betty Carter","artist": "Betty Carter","price": 49.99}'
```

このコマンドは以下のようにヘッダと追加されたアルバムのJSONを表示するはずです。

```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Date: Wed, 02 Jun 2021 00:34:12 GMT
Content-Length: 116

{
    "id": "4",
    "title": "The Modern Sound of Betty Carter",
    "artist": "Betty Carter",
    "price": 49.99
}
```

4.前のセクションのように、`curl`を使ってアルバムの全てのリストを取得して、新しいアルバムが加えられていることを確認してください。

```
$ curl http://localhost:8080/albums \
    --header "Content-Type: application/json" \
    --request "GET"
```

このコマンドはこのようなアルバムのリストを表示するはずです。

```
[
        {
                "id": "1",
                "title": "Blue Train",
                "artist": "John Coltrane",
                "price": 56.99
        },
        {
                "id": "2",
                "title": "Jeru",
                "artist": "Gerry Mulligan",
                "price": 17.99
        },
        {
                "id": "3",
                "title": "Sarah Vaughan and Clifford Brown",
                "artist": "Sarah Vaughan",
                "price": 39.99
        },
        {
                "id": "4",
                "title": "The Modern Sound of Betty Carter",
                "artist": "Betty Carter",
                "price": 49.99
        }
]
```

次のセクションでは、特定のアイテムに対する`GET`を処理するコードを追加しましょう。

## 特定のアイテムを返すハンドラを書く

クライアントが`GET /albums/[id]`というリクエストを行ったら、パスのパラメータ`id`にマッチするIDを持つアルバムを返したくなります。

そうするためには:

- リクエストされたアルバムを返すロジックを追加します

- そのロジックにpathをマッピングします。

**コードを書く**

1.前回のセクションで追加した`postAlbums`関数の下に、特定のアルバムを受け取るコードである以下のコードをペーストしてください。

この`getAlbumById`関数はリクエストのパスからIDを抽出して、そこでマッチするアルバムのありかを探します。

```
// `getAlbumByID`は`id`にマッチするIDを持つアルバムの場所を取得します。
// クライアントからパラメタが送られたら、レスポンスとしてアルバムを返します。
func getAlbumByID(c *gin.Context) {
    id := c.Param("id")

    // IDの値とマッチするパラメタをもつアルバムを探すために
    // リストのアルバムをループします.
    for _, a := range albums {
        if a.ID == id {
            c.IndentedJSON(http.StatusOK, a)
            return
        }
    }
    c.IndentedJSON(http.StatusNotFound, gin.H{"message": "album not found"})
}
```

このコードでは:

- `Context.Param`を使って、URLからパスのパラメタ`id`を取得しています。  
    このハンドラをパスへマッピングしているとき、このパスの中のパラメタのためのプレースホルダを含むことになります。

- パラメタの値`id`にマッチするIDというフィールドの値を持つアルバムを探すために、スライスに入った構造体`album`をループします。  
    見つかった場合は、構造体`album`をJSONへシリアライズして、`200 OK`というHTTPステータスコードと共にレスポンスを返します。

上述の通り、実世界のサービスはこの探索を行うためにデータベースのクエリを使います。

- もしアルバムが見つからなかったら、`http.StatusNotFound`と共に`HTTP 404 error`を返します。

2.最後に、以下の例のように`main`関数を変更して、パスが`/albums/:id`である`router.GET`への呼び出しを含めるようにしてください。

```
func main() {
    router := gin.Default()
    router.GET("/albums", getAlbums)
    router.GET("/albums/:id", getAlbumByID)
    router.POST("/albums", postAlbums)

    router.Run("localhost:8080")
}
```

このコードでは:

- パス`/albums/:id`を関数`getAlbumById`に関連付けています。  
    Ginではパスのアイテムの前にあるコロンは、そのアイテムがパスのパラメータであることを意味します。

**コードを実行する**

1.前回のセクションからサーバが実行中であるなら、サーバを停止してください。

2.`main.go`を含むディレクトリのコマンドラインから、コードを実行してサーバを起動してください。

```
$ go run .
```

3.異なるウィンドウの別のコマンドラインから、`curl`を使って実行中のwebサービスへリクエストを行ってください。

```
$ curl http://localhost:8080/albums/2
```

このコマンドはあなたが使っているIDを持つアルバムをJSONで表示します。  
もしアルバムが見つからない場合は、エラーメッセージを持ったJSONを受け取ります。

```
{
        "id": "2",
        "title": "Jeru",
        "artist": "Gerry Mulligan",
        "price": 17.99
}
```

## 総括

おめでとうございます！GoとGinを使って、シンプルなREFTfulなウェブサービスを書きました。

次のオススメのトピック:

- もしGo言語初心者であれば、[Effective Go](https://go.dev/doc/effective_go)と[How to write Go code](https://go.dev/doc/code)で有用なベストプラクティスが見つかるでしょう。

- [Go Tour](https://go.dev/tour/)はGoの基礎を段階的に学べる最高なチュートリアルです。

- もっとGinについて学びたい場合は、[Gin Web Framework package documentation](https://pkg.go.dev/github.com/gin-gonic/gin)か[Gin Web Framework docs](https://gin-gonic.com/docs/)を参照してください。

## 完成したコード

このセクションではこのチュートリアルで構築したアプリのコードが含まれています。

```
package main

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

// album represents data about a record album.
type album struct {
    ID     string  `json:"id"`
    Title  string  `json:"title"`
    Artist string  `json:"artist"`
    Price  float64 `json:"price"`
}

// albums slice to seed record album data.
var albums = []album{
    {ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
    {ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
    {ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}

func main() {
    router := gin.Default()
    router.GET("/albums", getAlbums)
    router.GET("/albums/:id", getAlbumByID)
    router.POST("/albums", postAlbums)

    router.Run("localhost:8080")
}

// getAlbums responds with the list of all albums as JSON.
func getAlbums(c *gin.Context) {
    c.IndentedJSON(http.StatusOK, albums)
}

// postAlbums adds an album from JSON received in the request body.
func postAlbums(c *gin.Context) {
    var newAlbum album

    // Call BindJSON to bind the received JSON to
    // newAlbum.
    if err := c.BindJSON(&newAlbum); err != nil {
        return
    }

    // Add the new album to the slice.
    albums = append(albums, newAlbum)
    c.IndentedJSON(http.StatusCreated, newAlbum)
}

// getAlbumByID locates the album whose ID value matches the id
// parameter sent by the client, then returns that album as a response.
func getAlbumByID(c *gin.Context) {
    id := c.Param("id")

    // Loop through the list of albums, looking for
    // an album whose ID value matches the parameter.
    for _, a := range albums {
        if a.ID == id {
            c.IndentedJSON(http.StatusOK, a)
            return
        }
    }
    c.IndentedJSON(http.StatusNotFound, gin.H{"message": "album not found"})
}
```
