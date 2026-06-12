---
title: "tidb lightning encountered error: [Lightning:Storage:ErrStorageUnknown]unknown storage error: ExpiredToken: The provided token has expired."
date: 2025-03-24
categories: 
  - "amazon-aurora"
  - "database"
  - "mysql"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-lightning-encountered-error-token-has-expired"
type: "post"
---

## What I did

I executed Llightning for importing Aurora MySQL SnapShot into TiDB Cloud Dedicated(v8.1.2).

## Encountered Error

```
tidb lightning encountered error: [Lightning:Storage:ErrStorageUnknown]
unknown storage error: ExpiredToken: The provided token has expired.
status code: 400, request id: huga, host id: hoge
```

## lightening.go

```
	// return expectedErr means at least meet one file
	expectedErr := errors.New("Stop Iter")
	walkErr := s.WalkDir(ctx, &storage.WalkOption{ListCount: 1}, func(string, int64) error {
		// return an error when meet the first regular file to break the walk loop
		return expectedErr
	})
	if !errors.ErrorEqual(walkErr, expectedErr) {
		if walkErr == nil {
			return common.ErrEmptySourceDir.GenWithStackByArgs(taskCfg.Mydumper.SourceDir)
		}
		return common.NormalizeOrWrapErr(common.ErrStorageUnknown, walkErr)
	}

```

## Workaround: Fix the default settings in .aws/credentials to the current token.

I have fixed the default settings in .aws/credentials by current token.

```
## .aws/credentials
[default]
aws_access_key_id=${aws_access_key_id]
aws_secret_access_key=${aws_secret_access_key}
aws_session_token=${aws_session_token}
```

Then it worked.

```
➜  db_transplant git:(main) tail -f  /var/folders/cj/ng251xx12_v_n6ddxxg8d4nm0000gq/T/lightning.log.2025-03-24T10.09.52+0900

[2025/03/24 10:09:52.076 +09:00] [INFO] [info.go:53] ["Welcome to TiDB-Lightning"] [release-version=v8.5.1] 

...

[2025/03/24 10:09:52.648 +09:00] [INFO] [s3.go:419] ["succeed to get bucket region from s3"] ["bucket region"=ap-northeast-1]
```
