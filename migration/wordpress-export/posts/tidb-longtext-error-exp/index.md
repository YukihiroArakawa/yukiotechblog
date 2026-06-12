---
title: "TiDBのLONGTEXT型にはデフォルト設定では6MiBまでしか保存できないことを検証してみた"
date: 2026-02-02
categories: 
  - "database"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-longtext-error-exp"
type: "post"
---

## はじめに

TiDBのLONGTEXT型の最大列長は 4,294,967,295 ですが、実はデフォルト設定では6MiB以上のデータはエラーで保存できなくなっています。

  
今回はその回避方法について1つずつ検証しながら解説します。

## 結論

先に結論を書いておくと、以下の通り設定をいじって保存できるデータサイズを上げると6MiB以上保存できるようになります。

1. txn-entry-size-limit = 125829120

3. raft-entry-max-size = 125829120

## エラーになるケース: デフォルト設定で6MiB以上のデータを保存する場合

まずは検証用のテーブルを作成します。

```
CREATE TABLE longtext_test (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payload LONGTEXT
);
```

そこに対して、8MiB程度のデータをインサートするクエリを実行します。

すると予想したとおりエラーが出ます。

```
mysql> INSERT INTO longtext_test (payload)
    -> SELECT REPEAT('a', 8388608);
ERROR 8025 (HY000): entry too large, the max entry size is 6291456, the size of data is 8388641
```

内容はエントリーが大きすぎます、最大サイズは６MiBですといったところでしょうか。

ここでこのエラーログでTiDBのリポジトリをripgrepしてみましょう。

```
 ls
Permissions Size User Date Modified Name
drwxrwxr-x     - york  2 Aug  2025   tidb
drwxrwxr-x     - york 22 Jul  2025   tiflash
drwxrwxr-x     - york 22 Jul  2025   tikv
drwxrwxr-x     - york 22 Jul  2025   tiproxy
```

実行するとTiDBのリポジトリで多くの件数がヒットします。  
TiDBノード側でインサート分の構文解釈時にエラーとするようにしているのでしょうか。

```
 rg 'entry too large'
tidb/errors.toml
2221:entry too large, the max entry size is %d, the size of data is %d

tidb/tests/realtikvtest/txntest/txn_test.go
313:    tk1.MustContainErrMsg("insert into t values (1, repeat('a', 7340032))", "[kv:8025]entry too large, the max entry size is 6291456")
318:    tk1.MustContainErrMsg("insert into t values (1, repeat('a', 9427968))", "[kv:8025]entry too large, the max entry size is 8388608")
321:    tk2.MustContainErrMsg("insert into t values (1, repeat('a', 7340032))", "[kv:8025]entry too large, the max entry size is 6291456")
324:    tk3.MustContainErrMsg("insert into t values (1, repeat('a', 7340032))", "[kv:8025]entry too large, the max entry size is 6291456")
327:    tk1.MustContainErrMsg("alter table t modify column a varchar(255)", "[kv:8025]entry too large, the max entry size is 6291456")
335:    tk2.MustContainErrMsg("insert into t values (1, repeat('a', 7340032))", "[kv:8025]entry too large, the max entry size is 6291456")
336:    tk3.MustContainErrMsg("insert into t values (1, repeat('a', 7340032))", "[kv:8025]entry too large, the max entry size is 6291456")
345:    tk1.MustContainErrMsg("alter table t modify column a varchar(255)", "[kv:8025]entry too large, the max entry size is 6291456")
346:    tk2.MustContainErrMsg("alter table t modify column a varchar(255)", "[kv:8025]entry too large, the max entry size is 6291456")
347:    tk3.MustContainErrMsg("alter table t modify column a varchar(255)", "[kv:8025]entry too large, the max entry size is 6291456")
348:    tk4.MustContainErrMsg("alter table t modify column a varchar(255)", "[kv:8025]entry too large, the max entry size is 6291456")
353:    tk1.MustContainErrMsg("insert into t values (1, repeat('a', 7340032))", "[kv:8025]entry too large, the max entry size is 6291456")

tidb/pkg/executor/brie_utils.go
163:            log.Info("entry too large, split batch create table", zap.Int("num table", len(infos)))

tidb/tests/integrationtest/t/executor/insert.test
541:# For mediumtext or bigger size, for tikv limit, we will get:ERROR 8025 (HY000): entry too large, the max entry size is 6291456, the size of data is 16777247, no need to test.

tidb/pkg/errno/errname.go
982:    ErrEntryTooLarge:                    mysql.Message("entry too large, the max entry size is %d, the size of data is %d", nil),

tidb/pkg/store/driver/error/error_test.go
60:             &tikverr.ErrEntryTooLarge{Limit: 10, Size: 20}:       "entry too large, the max entry size is 10, the size of data is 20",

tidb/pkg/disttask/framework/storage/table_test.go
1267:   require.ErrorContains(t, insertSubtask(meta6m), "entry too large")
```

## txn-entry-size-limitを上げてみる

そこでエラーに従ってトランザクションのエントリーサイズをあげてみましょう。

以下のようにtomlファイルを作成します。

```
[performance]
txn-entry-size-limit = 125829120  # 120MiB
```

tomlで設定変更したクラスターを再度起動してみます。

```
tiup playground \
  --db.config tidb.toml \
```

エラーが変わりました。

```
mysql> INSERT INTO longtext_test (payload)
    -> SELECT REPEAT('a', 8388608);
ERROR 1105 (HY000): message:"raft entry is too large, region 16, entry size 8388767" raft_entry_too_large:<region_id:16 entry_size:8388767 >
```

raftのエントリーサイズが大きすぎるという内容ですね。

これも同様にtidbのリポジトリでgrepしてみると、tikvリポジトリで色々ヒットします。

```
 rg raft_entry_too_large
tikv/src/storage/errors.rs
204:            ErrorHeaderKind::RaftEntryTooLarge => "raft_entry_too_large",
244:    } else if header.has_raft_entry_too_large() {

tikv/components/raftstore-v2/tests/integrations/test_basic_write.rs
76:        resp.get_header().get_error().has_raft_entry_too_large(),

tikv/components/error_code/src/raftstore.rs
61:        } else if self.has_raft_entry_too_large() {

tikv/tests/integrations/raftstore/test_single.rs
158:    assert!(res.as_ref().err().unwrap().has_raft_entry_too_large());

tikv/src/server/metrics.rs
543:        err_raft_entry_too_large,
589:            ErrorHeaderKind::RaftEntryTooLarge => RequestStatusKind::err_raft_entry_too_large,

tikv/src/import/mod.rs
72:    } else if e.has_raft_entry_too_large() {
73:        "raft_entry_too_large"

tikv/components/raftstore/src/errors.rs
182:                errorpb.mut_raft_entry_too_large().set_region_id(region_id);
184:                    .mut_raft_entry_too_large()

tiflash/dbms/src/Storages/KVStore/Read/LearnerReadWorker.cpp
282:                region_error.has_raft_entry_too_large() || region_error.has_region_not_initialized()
```

こちらはTiKV側のエラーで1回のTiKVへのデータ作成時の上限に引っかかったようです。

## raft-entry-max-size

それではTiKV側の上限も上げてみましょう。

```
[raftstore]
raft-entry-max-size = 125829120  # 120MiB
```

上記の設定でクラスターを再起動します。

```
tiup playground \
  --db.config tidb.toml \
  --kv.config tikv.toml
```

そうするとインサート文が成功します。やったね。

```
mysql> INSERT INTO longtext_test (payload)
    -> SELECT REPEAT('a', 8388608);
Query OK, 1 row affected (0.16 sec)
```

## 注意点

なんでデフォルトの設定でロングテキストを最大限利用できないんだよと思ったのですが、TiDBのコードのコメントに以下の記載がありました。

> The limitation of the size in byte for each entry in one transaction.  
> NOTE: Increasing this limit may cause performance problems.

上げすぎると性能問題の原因となる可能性があるそうです。

なぜ上げすぎると性能問題の原因となるかほってみたいですね。

予想はログレプリケーションする際のネットワークオーバーヘッドが大きくなるためと思っていますが、実際どうなんでしょうか。

こちらも色々検証してみたいですね。

おしまい。

## 参考

- https://docs.pingcap.com/ja/tidb/stable/data-type-string/#code-longtext-code-type

- https://docs.pingcap.com/ja/tidb/stable/tidb-configuration-file/#txn-entry-size-limit-new-in-v4010-and-v500

- https://docs.pingcap.com/ja/tidb/stable/tikv-configuration-file/#raft-entry-max-size
