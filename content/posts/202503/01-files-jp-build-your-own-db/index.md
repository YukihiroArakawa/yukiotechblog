---
title: "[日本語訳] 01. ファイルからデータベースへ \"Go言語でゼロから独自のDBを構築しよう\" - Build Your Own Database From Scrach In Go -"
date: 2025-03-26
categories: 
  - "database"
  - "golang"
coverImage: "Screenshot-from-2025-03-23-15-32-30.png"
slug: "01-files-jp-build-your-own-db"
type: "post"
---

この記事は以下のサイトの翻訳です。

[https://build-your-own.org/database/01\_files](https://build-your-own.org/database/01_files)

* * *

まずは一見単純な問題から始めましょう。データをファイルに保存し、それをアトミックかつ永続的、すなわちクラッシュに耐性のあるものにしようとしてみましょう。

Let’s start with a seemingly simple problem: save data in a file and try to make it atomic and durable, i.e., resistant to crashes.

## 1.1 ファイルをその場で更新する 1.1 Updating files in-place

ファイルを保存したり上書きする典型的な方法はこのとおりです。

The typical way to save and _overwrite_ a file is like this:

```
func SaveData1(path string, data []byte) error {
    fp, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0664)
    if err != nil {
        return err
    }
    defer fp.Close()

    _, err = fp.Write(data)
    if err != nil {
        return err
    }
    return fp.Sync() // fsync
}
```

ファイル名を「キー」、ファイルデータを「値」として、ファイルシステムをKVとして使用する方法です。`O_CREATE`フラグはファイルが存在しない場合に作成し、`O_TRUNC`フラグはファイルが存在する場合に以前のデータを破棄します。

This is how to use a filesystem as a KV, with the file name as the “key” and the file data as the “value”. The `O_CREATE` flag creates the file if it doesn’t exist, and the `O_TRUNC` flag discards the previous data if the file exists.

`fsync`は、ファイルデータが実際に書き込まれたことを_要求_し_確認_するシステムコールです。これは、OSのページキャッシュやデバイス上のRAMなど、多くのレベルのバッファリングが存在しうるため、必要となります。`fsync`が正常に実行されると、データは最終的なメディア上で恒久的なものと見なされます。Golangの`Sync()`は単に`fsync`を呼び出すだけです。

`fsync` is the syscall that _requests_ and _confirms_ that the file data is really written. This is required because there may be many levels of buffering: the OS page cache; the on-device RAM. After a successful `fsync`, the data is considered permanent on the final medium. The Golang `Sync()` just calls `fsync`.

この方法では、アトミック性と耐久性の要件を満たすことができません。

This method will fail the atomicity and durability requirements.

- ファイルを切り詰めるということは、最終的に空のファイルになる可能性があるということです。 Truncating a file means it’s possible to end up with an empty file.

- 切り捨てを行わないということは、中途半端に書き込まれたファイルが残る可能性があるということです。Not truncating means it’s possible to end up with a half written file.

これは、**その場でデータを更新する**ことの問題です。

This is the problem of **updating data in-place**.

## 1.2 原子的な名前変更 1.2 Atomic renaming

### ファイル名を変更することでデータを原子的に置き換える  
Replacing data atomically by renaming files

データをその場で更新しないようにするには、新しいデータの塊を書き込み、それをアトミックに切り替える必要があります。「切り替え」操作は、ファイルシステムにおける`rename()`に相当し、アトミックファイルを可能にするために特別に設計されています。

To avoid updating data in-place, we need to write a new chunk of data and switch to it atomically. The “switch” operation is just `rename()` in the filesystem, it’s specifically designed to make atomic files possible.

```
┌───🬼  create   ┌───🬼   ┌───🬼  rename   ┌───🬼
 1 │ ────────→  1 │ +  2 │ ────────→  2 │
└───┘           └───┘   └───┘           └───┘
 old             old     temp            new
```

```
func SaveData2(path string, data []byte) error {
    tmp := fmt.Sprintf("%s.tmp.%d", path, randomInt())
    fp, err := os.OpenFile(tmp, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0664)
    if err != nil {
        return err
    }
    defer func() { // 4. discard the temporary file if it still exists
        fp.Close() // not expected to fail
        if err != nil {
            os.Remove(tmp)
        }
    }()

    if _, err = fp.Write(data); err != nil { // 1. save to the temporary file
        return err
    }
    if err = fp.Sync(); err != nil { // 2. fsync
        return err
    }
    err = os.Rename(tmp, path) // 3. replace the target
    return err
}
```

### 原子性の種類 Types of atomicity

「原子性」は文脈によって意味が異なる。少なくとも2種類の原子性がある：

- 電力損失時の原子性： クラッシュの後、リーダはバッドステートを観察するか？

- リーダライタ原子性： 並行ライターを持つリーダがバッドステートを観測するか？

“Atomicity” means different things in different contexts. There are at least 2 kinds atomicity:

- Power-loss atomic: Will a reader observe a bad state after a crash?

- Readers-writer atomic: Will a reader observe a bad state with a concurrent writer?

補足: もう少し噛み砕いて説明すると、書き込みを行っている際に並行して読み込みを行った場合に中途半端な状態を観測するかを「リーダライター原子性」と呼んでいます

SaveData1は両方の原子性に失敗する。クラッシュの有無にかかわらず、リーダは空のファイルを観察することができる。

SaveData2はreaders-writer atomicであるが、power-loss atomicではない。これは驚くべきことだが、後で説明する。

`SaveData1` fails both atomicities; a reader can observe an empty file with or without a crash.

`SaveData2` is readers-writer atomic, but NOT power-loss atomic. This is surprising, explained later.

### リネームはなぜ機能するのか？ Why does renaming work?

ファイルシステムはファイル名からファイルデータへのマッピングを保持しているので、リネームによるファイルの置き換えは、古いデータに触れることなく、ファイル名を新しいデータに向けるだけである。このマッピングは単なる「ディレクトリ」である。マッピングは多対一であり、複数のファイル名が同じファイルを参照することができる。参照数が0のファイルは自動的に削除される。

Filesystems keep a mapping from file names to file data, so replacing a file by renaming simply points the file name to the new data without touching the old data. This mapping is just a “directory”. The mapping is many-to-one, multiple names can reference the same file, even from different directories, this is the concept of “hard link”. A file with 0 references is automatically deleted.

rename()のアトミック性と耐久性は、ディレクトリの更新に依存する。しかし残念なことに、ディレクトリの更新はリーダとライタがアトミックであるだけで、パワーロスがアトミックでも耐久性があるわけでもない。そのため、SaveData2はまだ正しくない。

The atomicity and durability of `rename()` depends on directory updates. But unfortunately, updating a directory is only readers-writer atomic, it’s not power-loss atomic or durable. So `SaveData2` is still incorrect.

### fsync の落とし穴 \`fsync\` gochas

ファイルの作成とファイルの名前変更は、どちらもそれが含まれるディレクトリを更新します。したがって、ディレクトリを耐久性のあるものにする方法が必要になり、fsyncはディレクトリに対しても呼び出すことが可能です。これを行うには、ディレクトリのハンドル（ファイルディスクリプタ）を取得する必要があります。SaveData2の修正は、読者への演習問題です。

Both creating a file and renaming a file update the containing directory. So there must be a way to make directories durable, thus `fsync` can also be called on directories. To do so, you need to obtain a handle (file descriptor) of the directory. Fixing `SaveData2` is an exercise for the reader.

fsyncのもう一つの問題はエラーハンドリングです。もしfsyncが失敗すると、データベースの更新は失敗しますが、その後でファイルを読み取るとどうなるでしょうか？OSのページキャッシュのために、fsyncが失敗していても新しいデータが得られる可能性があります。この挙動は、ファイルシステムに依存します。

Another issue with `fsync` is error handling. If `fsync` fails, the DB update fails, but what if you read the file afterwards? You may get the new data even if `fsync` failed (because of the OS page cache)! This behavior is [filesystem dependent](https://www.usenix.org/conference/atc20/presentation/rebello).

## 1.3 追記専用ログ 1.3 Append-only logs

ファイルの上書きに関する問題は、インプレース更新の課題や `fsync` の落とし穴を示しています。しかし、これはまだデータベースの問題とは程遠い話です。というのも、私たちはデータを**増分的に**どう更新すればよいのか分かっていないからです。

The file overwriting problem shows the problem of in-place updates and `fsync` gotchas. However, it’s nowhere close to databases. Because we don’t know how to update data _incrementally_.

### ログによる増分更新 Incremental updates with logs

ログは増分更新に利用できます。ログには各更新の**記述**が順序付きで保存されており、すべてのログエントリを解釈することで、最終的な状態を再構築することができます。例えば、キー・バリュー（KV）更新のログは次のようになります：

A log can be used for incremental updates; it stores an ordered list of _descriptions_ of each update. The entire state can be reconstructed by interpreting each log entry. For example, a log for KV updates:

```
     0         1         2        3
| set a=1 | set b=2 | set a=3 | del b |
```

最終的な状態は `a=3` です。

The final state is `a=3`.

### チェックサムによるログのアトミックな更新 Atomic log updates with checksums

古いログエントリを破棄する問題はひとまず無視し、ログは成長する一方であると仮定しましょう。これは「追記専用（append-only）」ログと呼ばれ、インプレース更新は避けられます。次の課題は、「追記」をアトミックにすることです。

Let’s ignore the problem of discarding old log entries and assume that the log can only grow. This is called an “append-only” log, in-place updates are avoided, the next problem is to make the “append” atomic.

各ログの追記は `fsync` によって永続化されます。しかし、`fsync` の前にデータベースがクラッシュすると、最後のエントリが中途半端に書き込まれている可能性があります。破損したログエントリは避けられないため、クラッシュからの復旧時に**最後の破損エントリを検出して無視する**のが解決策です。

Each log append is made durable with `fsync`. But if the DB crashed between append and `fsync`, the last entry may be half written. Corrupted log entries are inevitable, the solution is to **detect the corrupted last entry and ignore it when recovering from a crash**.

検出には、各ログエントリにチェックサムを追加します。ログエントリは、エントリサイズとチェックサムを含む固定サイズのヘッダーから始めることができます。データベースは起動時に最後のログエントリをチェックし、サイズやチェックサムが不正であれば、それを単に無視します。

The detection is done by adding a checksum to each log entry. A log entry can start with a fixed-size header containing the entry size and the checksum. The DB checks the last log entry on startup, if the size or checksum is wrong, it simply ignores it.

チェックサムには他にも用途があり、たとえばサイレントなデータ破損の検出などがありますが、サイレントなデータ破損は**データベースの関心事ではありません**。ログにおけるチェックサムの目的は、**不完全な書き込み（データベース用語で「トーンライト」）の検出**だけです。

Checksums may have other use cases, such as detecting silent data corruption, but silent data corruption is NOT a database concern, the checksums in logs are only intended to detect incomplete writes (_torn writes_ in DB jargon).

### データベース構成要素としてのログ Log as a database component

ログはそれだけではまだデータベースではありません。**インデックス付きデータ構造と組み合わせる必要**があります。ログが大きくなりすぎた場合、ログエントリはデータ構造にマージされます。これによって、ログが永遠に成長し続ける問題は解決されます。残された問題は、**メインのデータ構造をアトミックに更新する方法**です。

A log is still not a database; it must be combined with the indexing data structure. Log entries are merged with the data structure when the log gets too large. This solves the forever growth problem. The remaining problem is how to atomically update the main data structure.

しかし、もしメインのデータ構造をアトミックに更新できるのであれば、そもそもログを使う意味はあるのでしょうか？　ログには他にもデータベース内での用途があり、それについては今回は触れませんが、**ほとんどのデータベースはログを使用しています**。MySQL でさえ、**2つのログ**を使っています。ただし、**ログなしでもデータベースは実現可能**であることも、これから学ぶことになります。

But if we can atomically update the main data structure, why bother with logs? Because logs have other uses in databases that we won’t discuss now. Most databases use a log, MySQL even uses 2 logs. However, databases are possible without logs, as we’ll learn.

## 1.4 データベースにおける課題のまとめ Summary of database challenges

これまでに学んだこと：

1. インプレース更新の問題点
    - ファイルのリネームによってインプレース更新を回避
    
    - ログによってインプレース更新を回避

3. 追記専用ログ（append-only logs）
    - 増分更新（incremental updates）
    
    - ただし、これは完全な解決策ではない（インデックスや領域再利用が未解決）

5. `fsync` の使い方
    - ファイル本体だけでなく、**ディレクトリにも `fsync` が必要**

What we have learned:

1. Problems with in-place updates.
    - Avoid in-place updates by renaming files.
    
    - Avoid in-place updates with logs.

3. Append-only logs.
    - Incremental updates.
    
    - Not a full solution; no indexing and space reuse.

5. `fsync` usage.
    - Both file data and directory need `fsync`.

まだ残っている疑問：

1. インデックス付きデータ構造の扱い方

3. ログとインデックス付きデータ構造の組み合わせ方

5. 並行性（Concurrency）

What remains a question:

1. Indexing data structures.

3. Combining a log with an indexing data structure.

5. Concurrency.
