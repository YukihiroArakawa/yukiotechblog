---
title: "TiDBに組み込み関数を追加実装する"
date: 2025-04-13
categories: 
  - "database"
  - "golang"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "add-a-new-buildin-function-to-tidb"
type: "post"
---

本記事ではTiDBの開発者ガイドの「add a function」を参考に新しい関数を追加してみようと思います。

[https://github.com/pingcap/tidb-dev-guide/blob/master/src/extending-tidb/add-a-function.md](https://github.com/pingcap/tidb-dev-guide/blob/master/src/extending-tidb/add-a-function.md)

## 前提

以下の条件で実施しています。

- OS: Ubuntu24

- Golang: go1.23.8 linux/amd64

- TiDB: TiDB v9.0.0-beta.1

## 準備

まずは以下のドキュメントを参考に、TiDBのリポジトリをクローンして、ビルドします。

[https://github.com/pingcap/tidb-dev-guide/blob/master/src/get-started/build-tidb-from-source.md](https://github.com/pingcap/tidb-dev-guide/blob/master/src/get-started/build-tidb-from-source.md)

```
$ cd tidb
$ make

CGO_ENABLED=1  GO111MODULE=on go build -tags codes  -ldflags '-X "github.com/pingcap/tidb/pkg/parser/mysql.TiDBReleaseVersion=5a5186162e" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBBuildTS=2025-04-13 03:22:51" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBGitHash=5a5186162ea6078400c5ed5e6bef9b7a46710bb7" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBGitBranch=master" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBEdition=Community" ' -o bin/tidb-server ./cmd/tidb-server
go: downloading github.com/prometheus/client_golang v1.22.0
go: downloading github.com/tikv/pd/client v0.0.0-20250327162546-07c19b1f2f9f
go: downloading golang.org/x/sync v0.13.0
go: downloading golang.org/x/sys v0.32.0
go: downloading golang.org/x/net v0.39.0
go: downloading golang.org/x/text v0.24.0
go: downloading golang.org/x/tools v0.32.0
go: downloading golang.org/x/crypto v0.37.0
go: downloading golang.org/x/oauth2 v0.29.0
go: downloading golang.org/x/term v0.31.0
Build TiDB Server successfully!
```

次に以下のコマンドでTiDBを立ち上げます。

```
$ ./bin/tidb-server

[2025/04/13 12:25:08.606 +09:00] [INFO] [meminfo.go:196] ["use physical memory hook"] [cgroupMemorySize=9223372036854775807] [physicalMemorySize=32341188608]
[2025/04/13 12:25:08.606 +09:00] [INFO] [cpuprofile.go:113] ["parallel cpu profiler started"]
[2025/04/13 12:25:08.606 +09:00] [INFO] [cgmon.go:60] ["cgroup monitor started"]
[2025/04/13 12:25:08.606 +09:00] [INFO] [printer.go:52] ["Welcome to TiDB."] ["Release Version"=5a5186162e] [Edition=Community] ["Git Commit Hash"=5a5186162ea6078400c5ed5e6bef9b7a46710bb7] ["Git Branch"=master] ["UTC Build Time"="2025-04-13 03:22:51"] [GoVersion=go1.23.8] ["Race Enabled"=false] ["Check Table Before Drop"=false]
```

無事立ち上がったら、以下のコマンドでDBに接続します。

```
$ mysql -h 127.0.0.1 -P 4000 -u root -D test --prompt="tidb> " --comments

Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 2097154
Server version: 8.0.11-TiDB-5a5186162e TiDB Server (Apache License 2.0) Community Edition, MySQL 8.0 compatible

Copyright (c) 2000, 2025, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

tidb>
```

## 作成予定の関数「HELLO関数」

今回はHELLO()という関数を追加します。

この関数では引数に文字列を取り、\`hello argument !\`のようにhello + 引数 !という文字列を表示させようと思います。

現状ですと当たり前ですが、エラーが出ます。

```
tidb> select HELLO();
ERROR 1305 (42000): FUNCTION test.hello does not exist
```

## HELLO関数の実装

### 1\. parser/ast/functions.goに関数名を定義する

まずはparse/ast/functions.goに関数名を定義します。

```
// List scalar function names.
const (
...
        Hello = "hello"
)
```

これは `ast.Hello` を "hello" にリンクします。関数の検索は小文字の名前で行われるため、常に小文字の名前を使用してください。そうしないと、関数が見つかりません。

### 2\. expression/builtin.goの修正

次にexpression/builtin.goに以下の記述を追加します。

```
var funcs = map[string]functionClass{
...
        ast.Hello: &helloFunctionClass{baseFunctionClass{ast.Hello, 1, 1}},
}
```

ここではast.Helloが実行された場合、helloFunctionClassを呼び出すようにしています。

### 3\. `expression/builtin_string.go`に`helloFunctionClass`を定義する

次にast.Helloが実行された場合に呼び出される処理を定義します。

```
var (
...
        // helloFunctionClassがfunctionClassインターフェースを正しく実装していることをここでチェック
        _ functionClass = &helloFunctionClass{}
)

...

var (
       // builtinHelloSigがbuiltinFuncインターフェースを正しく実装していることをここでチェック
        _ builtinFunc = &builtinHelloSig{}
)

...

type helloFunctionClass struct {
        baseFunctionClass
}

func (c *helloFunctionClass) getFunction(ctx sessionctx.Context, args []Expression) (builtinFunc, error) {
        if err := c.verifyArgs(args); err != nil {
                return nil, err
        }
        bf, err := newBaseBuiltinFuncWithTp(ctx, c.funcName, args, types.ETString, types.ETString)
        if err != nil {
                return nil, err
        }
        sig := &builtinHelloSig{bf}
        return sig, nil
}

type builtinHelloSig struct {
        baseBuiltinFunc
}

func (b *builtinHelloSig) Clone() builtinFunc {
        newSig := &builtinHelloSig{}
        newSig.cloneFrom(&b.baseBuiltinFunc)
        return newSig
}

func (b *builtinHelloSig) evalString(row chunk.Row) (name string, isNull bool, err error) {
        name, isNull, err = b.args[0].EvalString(b.ctx, row)
        if isNull || err != nil {
                return name, isNull, err
        }
        return "hello " + name, false, nil
}
```

getFunction() メソッドは、引数の型と数に応じて異なる関数を返すことができます。

この例では、常に1つの文字列引数を持ち、文字列を返す同じ関数を返します。ここで evalString() は各行に対して呼び出されます。

もし関数が整数を返す場合は evalInt を使用する必要があり、Decimal、Real、Time、JSON用の関数もあります。

### 4\. 再度ビルドしてHELLO関数を実行する

再度 TiDBをビルド し、新しく追加した関数を試してみましょう。

```
$ cd tidb
$ make
$ ./bin/tidb-server

CGO_ENABLED=1  GO111MODULE=on go build -tags codes  -ldflags '-X "github.com/pingcap/tidb/pkg/parser/mysql.TiDBReleaseVersion=5a5186162e-dirty" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBBuildTS=2025-04-13 03:53:25" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBGitHash=5a5186162ea6078400c5ed5e6bef9b7a46710bb7" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBGitBranch=master" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBEdition=Community" ' -o bin/tidb-server ./cmd/tidb-server
# github.com/pingcap/tidb/pkg/expression
pkg/expression/builtin_string.go:157:18: cannot use &builtinHelloSig{} (value of type *builtinHelloSig) as builtinFunc value in variable declaration: *builtinHelloSig does not implement builtinFunc (wrong type for method evalString)
                have evalString(chunk.Row) (string, bool, error)
                want evalString(EvalContext, chunk.Row) (string, bool, error)
pkg/expression/builtin_string.go:4426:46: undefined: sessionctx
pkg/expression/builtin_string.go:4435:16: cannot use sig (variable of type *builtinHelloSig) as builtinFunc value in return statement: *builtinHelloSig does not implement builtinFunc (wrong type for method evalString)
                have evalString(chunk.Row) (string, bool, error)
                want evalString(EvalContext, chunk.Row) (string, bool, error)
pkg/expression/builtin_string.go:4445:16: cannot use newSig (variable of type *builtinHelloSig) as builtinFunc value in return statement: *builtinHelloSig does not implement builtinFunc (wrong type for method evalString)
                have evalString(chunk.Row) (string, bool, error)
                want evalString(EvalContext, chunk.Row) (string, bool, error)
pkg/expression/builtin_string.go:4449:52: b.ctx undefined (type *builtinHelloSig has no field or method ctx)
make: *** [Makefile:207: server] Error 1
```

エラーが出ましたね。

他の実装に習って、getFunctionとevalStringを修正しましょう。

具体的にはgetFunctionにはBuildContextインターフェースを使用するように修正して、evalStringはEvalContextを使用するようにシグネチャを修正しましょう。

```
// BuildContextインターフェースを使用するように修正
// sessionctx.Context -> BuildContext
func (c *helloFunctionClass) getFunction(ctx BuildContext, args []Expression) (builtinFunc, error) {
        if err := c.verifyArgs(args); err != nil {
                return nil, err
        }
        bf, err := newBaseBuiltinFuncWithTp(ctx, c.funcName, args, types.ETString, types.ETString)
        if err != nil {
                return nil, err
        }
        sig := &builtinHelloSig{bf}
        return sig, nil
}

type builtinHelloSig struct {
        baseBuiltinFunc
}

func (b *builtinHelloSig) Clone() builtinFunc {
        newSig := &builtinHelloSig{}
        newSig.cloneFrom(&b.baseBuiltinFunc)
        return newSig
}

// EvalContextを引数に追加
func (b *builtinHelloSig) evalString(ctx EvalContext, row chunk.Row) (string, bool, error) {
        name, isNull, err := b.args[0].EvalString(ctx, row)
        if isNull || err != nil {
                return "", isNull, err
        }
        return "hello " + name, false, nil
}
```

こちらを修正したら無事ビルドできました。

```
$ make
CGO_ENABLED=1  GO111MODULE=on go build -tags codes  -ldflags '-X "github.com/pingcap/tidb/pkg/parser/mysql.TiDBReleaseVersion=5a5186162e-dirty" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBBuildTS=2025-04-13 04:11:40" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBGitHash=5a5186162ea6078400c5ed5e6bef9b7a46710bb7" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBGitBranch=master" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBEdition=Community" ' -o bin/tidb-server ./cmd/tidb-server
Build TiDB Server successfully!
```

こちらについては以下のPRでドキュメント修正しています。

[https://github.com/pingcap/tidb-dev-guide/pull/264](https://github.com/pingcap/tidb-dev-guide/pull/264)

### 関数を実行

無事ビルドができたので、関数を実行してみます。

```
tidb> SELECT HELLO("world");
+----------------+
| HELLO("world") |
+----------------+
| hello world    |
+----------------+
1 row in set (0.00 sec)

tidb> SELECT HELLO("yukio");
+----------------+
| HELLO("yukio") |
+----------------+
| hello yukio    |
+----------------+
1 row in set (0.00 sec)
```

最終形は以下のコミットから確認できます。

ぜひ実装してみてください。

[https://github.com/YukihiroArakawa/tidb/commit/77ef28abcbbbf5db93be5b52191bddcbbff30bc2](https://github.com/YukihiroArakawa/tidb/commit/77ef28abcbbbf5db93be5b52191bddcbbff30bc2)
