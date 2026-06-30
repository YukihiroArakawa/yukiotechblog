---
title: "[SQL Server] パーティション化したテーブルのidのユニーク性を保障する方法に関する検討"
date: 2025-03-19
categories: 
  - "database"
  - "sql-server"
coverImage: "Screenshot-from-2025-03-23-15-11-06.png"
slug: "sql-server-partition-uniqueness"
type: "post"
---

## 課題「パーティションテーブルではテーブル内でidがユニークであることを保障できない」

パーティションを導入したテーブルはパーティションキーとidの複合キーが主キーになる

そのため、原理上、テーブル内でidがユニークであることを保障できないと言う懸念点が存在する

また、idにidentity列を指定したとしても、identity列の値から同じ値が採番されるケースが稀にあるそうなので、完全にユニーク性を保障するには、それ以上のセーフティーネットが必要

> 一つのトランザクションで複数のレコードをINSERTするようなケースの場合には同じID値（IDENTITYプロパティで付与される値）が設定されてしまう可能性があるということです。

[SQL ServerのIDENTITYプロパティについて - ITエンジニアの成長ブログ](https://mr-star.hatenablog.com/entry/sqlserver/013)

## 前提

パーティション導入対象のテーブルは取引履歴系のテーブルを前提とする.

テーブル名称は仮称でtransaction\_historyとする.

このうちパーティションキーはtransaction\_dateという日付のカラムとする.

### パーティション関数

```
CREATE PARTITION FUNCTION PartitionFunction_Date (DATE)
AS RANGE RIGHT FOR VALUES ('2024-01-01', '2024-04-01', '2024-07-01', '2024-10-01');
```

### パーティションスキーマ

```
CREATE PARTITION SCHEME PartitionScheme_Date
AS PARTITION PartitionFunction_Date
ALL TO ([PRIMARY]);
```

### パーティション付きtransaction\_historyのテーブル定義

```
CREATE TABLE transaction_history (
　　 -- idはidentity列に指定し、自動でインクリメントされる
    id BIGINT IDENTITY(1,1) NOT NULL,
    ... 
    transaction_date DATE ,

    -- idとtransaction_dateの複合キーがPKになる
    CONSTRAINT PK_transaction_history PRIMARY KEY CLUSTERED (id, transaction_date)
) ON PartitionScheme_StartDate(transaction_date);
```

### idの重複

上記のテーブル定義中では、**idとtransaction\_dateの組み合わせがテーブル内で重複していない場合に、PK制約に引っかからずにデータ挿入**が可能となる。

そのため以下のようにtransaction\_dateが2024-01-01と2024-01-02で異なる場合、テーブル内に同じid=1のレコードを挿入することが可能となる。

```
[row 1] id=1, transaction_date=2024-01-01
[row 2] id=1, transaction_date=2024-01-02
```

つまりこ**別の日付であればidの重複をデフォルト設定では防げない**と言える。

## IDENTITY列に指定したIDが重複するケース

### ケース1. idとパーティションキーの組み合わせがテーブル内で重複しないレコードをIDENTITY\_INSERTした場合

idはIDENTITY列の指定をしているため、idを指定してinsertすることは基本的にできない。

ただし、identity insertをすることで、明示的にidを指定してinsertすることが可能。

例えば、id=1・transaction\_date=2024-01-01のレコードが存在する状態で、以下のように**idとtransaction\_dateの組み合わせがテーブル内に存在しないレコードをidentity\_insertすると、テーブル内でidの重複が発生**する。

```
-- identity insertでは可能
set identity_insert transaction_history on;
insert into transaction_history (id, transaction_date)
values (1, '2024-01-02')
set identity_insert transaction_history off;

-- 基本的にidにはinsertできない
insert into transaction_history (id, transaction_date)
values (1, '2024-01-01')
```

ただし、identity列に指定したカラムはDBに自動採番してほしいカラムになるので、identity列に指定したカラムにidentity insertでデータ挿入することはSE作業以外では発生しないと思われる。

### ケース2. 同一トランザクション内で複数のレコードをINSERTする場合

以下のブログによると「一つの[トランザクション](https://d.hatena.ne.jp/keyword/%A5%C8%A5%E9%A5%F3%A5%B6%A5%AF%A5%B7%A5%E7%A5%F3)で複数のレコードをINSERTするようなケースの場合には同じID値（IDENTITYプロパティで付与される値）が設定されてしまう可能性がある」との記載がある。

[SQL ServerのIDENTITYプロパティについて - ITエンジニアの成長ブログ](https://mr-star.hatenablog.com/entry/sqlserver/013)

またマイクロソフトのSQL Serverの記事によると「IDENTITY列で値の一位性を保障するには、ユニーク制約かユニークインデックスを利用する必要がある」ことについて言及されている。

> 値の一意性: PRIMARY KEY または UNIQUE 制約、または UNIQUE インデックスを使用して、一意性を強制する必要があります。

[IDENTITY (プロパティ) (Transact-SQL) - SQL Server](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver15)

ただし、この事象を意図的に再現することは難しい。

なお、identity列の数値の値は再利用されないとの記載もあるため、**稀に重複する場合は挿入時刻がかなり近い値同士で重複する可能性が高い**と思われる。

> 値の再利用: 特定のシードと増分値が指定された特定の ID プロパティでは、ID 値がエンジンによって再利用されることはありません。

classmethod経由でawsにRDS For SQL Serverのidentity列の重複が発生する条件について問い合わせしたところ、「AWS内ではidentity列の重複についての報告はなかった」「検証したが発生しなかった」とのことだった。

## identity列の重複防止策「DMLトリガーの利用」

### 公式おすすめの方法. DMLトリガーの利用

マイクロソフト公式が公表しているパーティション作成対象のテーブルのidの重複を防止するための対策として、DMLトリガーを利用する方法がある。

[https://learn.microsoft.com/en-us/previous-versions/sql/sql-server-2008-r2/ms187526(v=sql.105)?redirectedfrom=MSDN#partitioning-unique-indexes](https://learn.microsoft.com/en-us/previous-versions/sql/sql-server-2008-r2/ms187526\(v=sql.105\)?redirectedfrom=MSDN#partitioning-unique-indexes)

以下のようにテーブルに対して、insert/updateの操作が行われる際にidの重複チェックを実施し、重複発生時はエラーを出し、トランザクションをロールバックさせることが可能。

ただし、挿入/更新のたびにトリガーが起動するため、**性能のオーバーヘッドについて要検証**

```
-- トリガーの作成
CREATE TRIGGER trg_CheckIdUniqueness
ON transaction_history
AFTER INSERT, UPDATE
AS
BEGIN
    -- 挿入または更新された行について、既存の行とIDが重複しているかチェック
    IF EXISTS (
        SELECT 1
        FROM transaction_history
        WHERE id IN (SELECT id FROM inserted)
        AND NOT EXISTS (
            -- 挿入/更新される行が既存の行と同一でないことを確認
            SELECT 1
            FROM deleted
            WHERE deleted.id = transaction_history.id
        )
    )
    BEGIN
        RAISERROR ('Duplicate ID detected in transaction_history.', 16, 1);
        ROLLBACK TRANSACTION; -- トランザクションをロールバックして操作をキャンセル
    END
END;
```

DMLトリガーで大元のトランザクションがロールバックされることは以下のコードで確認可能

```
CREATE TABLE TestTable (
    id INT PRIMARY KEY,
    value INT NOT NULL
);

CREATE TRIGGER trg_RollbackTest
ON TestTable
AFTER INSERT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted WHERE value > 10)
    BEGIN
        RAISERROR ('Value cannot be greater than 10. Rolling back transaction.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;

INSERT INTO TestTable (id, value) VALUES (1, 5);
SELECT * FROM TestTable; -- このクエリではid 1, value 5のレコードが表示される

INSERT INTO TestTable (id, value) VALUES (2, 15);
SELECT * FROM TestTable; -- このクエリでは引き続きid 1, value 5のみが表示され、id 2のレコードは表示されない
```

```
Msg 50000, Level 16, State 1, Procedure trg_RollbackTest, Line 8
Value cannot be greater than 10. Rolling back transaction.
Msg 3609, Level 16, State 1, Line 2
The transaction ended in the trigger. The batch has been aborted.
```

### 利用できない方法. idにのみユニーク制約をはる

以下のようにidにユニーク制約をかけることはエラーが発生するためできない。

```
ALTER TABLE transaction_history
ADD CONSTRAINT UC_id UNIQUE (id);
```

この方法は以下のエラーが出るため利用不可能(2025/01/22)

```
Msg 1908, Level 16, State 1, Line 2
Column 'transaction_date' is partitioning column of the index 'UQ_transaction_history'. Partition columns for a unique index must be a subset of the index key.

「transaction_date」列はインデックス「UQ_transaction_history」の分割列です。一意のインデックスのための分割列は、インデックスキーのサブセットでなければなりません。

Msg 1750, Level 16, State 1, Line 2
Could not create constraint or index. See previous errors.
```

[https://learn.microsoft.com/ja-jp/sql/relational-databases/errors-events/database-engine-events-and-errors-1000-to-1999?view=sql-server-ver16](https://learn.microsoft.com/ja-jp/sql/relational-databases/errors-events/database-engine-events-and-errors-1000-to-1999?view=sql-server-ver16)

### 他の方法. 定期ジョブでidのユニーク性をチェックする

定期ジョブを作成し、一括でidのユニーク性をチェックする方法。

ただし、この方法だと**即時でid重複を検出することができない**ため、あくまで重複被害が拡大しないことを確認するための方法

## まとめ

- パーティション化したテーブルではidのユニーク性をデフォルトでは保証できない

- identity列は稀に重複する可能性がある

- DMLトリガーによってid重複は防止可能だが、性能検証が必要

- 定期ジョブでidのユニーク性をチェックすることで、id重複時の被害拡大を防止することが可能

## 参考

[IDENTITY (プロパティ) (Transact-SQL) - SQL Server](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver15)

[SQL ServerのIDENTITYプロパティについて - ITエンジニアの成長ブログ](https://mr-star.hatenablog.com/entry/sqlserver/013)

[https://techcommunity.microsoft.com/blog/sqlserversupport/dealing-with-unique-columns-when-using-table-partitioning/333995](https://techcommunity.microsoft.com/blog/sqlserversupport/dealing-with-unique-columns-when-using-table-partitioning/333995)

[https://learn.microsoft.com/en-us/previous-versions/sql/sql-server-2008-r2/ms187526(v=sql.105)?redirectedfrom=MSDN#partitioning-unique-indexes](https://learn.microsoft.com/en-us/previous-versions/sql/sql-server-2008-r2/ms187526\(v=sql.105\)?redirectedfrom=MSDN#partitioning-unique-indexes)
