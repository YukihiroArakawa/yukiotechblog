---
title: "TiDB Cloud DedicatedでAuroraのSnapShotをインポートする際に、Access Deniedと出る"
date: 2025-03-25
categories: 
  - "amazon-aurora"
  - "database"
  - "mysql"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-cloud-dedicatedでauroraのsnapshotをインポートする際に、access-deniedと出る"
type: "post"
---

## やりたかったこと「AuroraのSnapShotをTiDB Cloudのインポート画面から読み込んでTiDBにデータ作成する」

AuroraMySQLのデータをTiDBに移行するために、まず、以下の記事を参考にDumplingでAuroraのDDLをエクスポートし、それをTiDBにインポートしました。

[https://dev.classmethod.jp/articles/aurora-mysql-migrate-to-tidb-serverless](https://dev.classmethod.jp/articles/aurora-mysql-migrate-to-tidb-serverless)

その後に、TiDB Cloud Dedicatedのダッシュボードのインポート機能でS3に配置したスナップショットからTiDB Cloudにデータを復元しようとしました。

なおTiDB Docの資料でTiDB Cloudにparquet fileをインポートする方法が記載されていたので、それを参考にインポートを実施しました。

[https://docs.pingcap.com/ja/tidbcloud/import-parquet-files](https://docs.pingcap.com/ja/tidbcloud/import-parquet-files)

この際に、S3に読み取りアクセス可能なポリシー(`AmazonS3ReadOnlyAccess`)をもったIAMユーザを同時に作成しており、そのIAMユーザのアクセスIDとシークレットアクセスキーをインポート画面に入力していました。

> 次のポリシーを持つIAMユーザーを作成します。
> 
> - `AmazonS3ReadOnlyAccess`
> 
> - [`CreateOwnAccessKeys` (必須) および`ManageOwnAccessKeys` (オプション)](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#access-keys_required-permissions)
> 
> これらのポリシーは、ソース データを保存するバケットに対してのみ機能することをお勧めします。
> 
> [https://docs.pingcap.com/ja/tidbcloud/config-s3-and-gcs-access/#configure-amazon-s3-access-using-an-aws-access-key](https://docs.pingcap.com/ja/tidbcloud/config-s3-and-gcs-access/#configure-amazon-s3-access-using-an-aws-access-key)

## 発生した課題 Access Denied

しかし、インポートを実行するとAccess Deniedが出て失敗しました。

ただTiDB Cloudのエラー画面には具体的なエラー理由が出なかったので、PingCapのサポートの方に問い合わせを行いました。

## 解決「S3の対象バケットに対するKMSキーを持ったインラインポリシーをIAMユーザにアタッチする」

そこでPingCapのサポートの方から「ログの方にKMSキーでのS3の復号ができない旨のエラーが出ています」ということと「IAMユーザのポリシーに、kms:Decryptを指定してください。Resourceには対応するS3オブジェクトのKMSキーを指定してください」ということを教えてもらいました。

```
{
        "Sid": "AllowKMSkey",
        "Effect": "Allow",
        "Action": [
            "kms:Decrypt"
        ],
        "Resource": "arn:aws:kms:ap-northeast-1:105880447796:key/c3046e91-fdfc-4f3a-acff-00597dd3801f"
}
```

そこで先程のIAMユーザのポリシーを編集して、先程のJSONを追加して、Resourceに対象のS3バケットの中にある適当なファイルから対応するKMSキーのarnをコピペしました。

地味に詰まったのですが、バケットのディレクトリを見てもKMSキーは表示されないのでご注意を、、

その後、インポートをリトライしたところ、先程のエラーは出なくなりました。

## 参考

また、これらのAccess Deniedに関するエラー対応については以下のトラブルシューティングに記載されていとも教えていただきました。

[https://docs.pingcap.com/ja/tidbcloud/troubleshoot-import-access-denied-error/#access-denied](https://docs.pingcap.com/ja/tidbcloud/troubleshoot-import-access-denied-error/#access-denied)

ご参考までに
