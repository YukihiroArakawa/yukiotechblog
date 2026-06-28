---
title: "TiDBのコードリーディング「サーバの起動」"
date: 2025-04-13
categories: 
  - "golang"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-code-reading-from-start-server-to-conn-client"
type: "post"
---

本記事ではTiDBのOSSのコードを読みつつ、メモをしていきます。

## サーバー起動

まずTiDBではサーバ起動時にtidb-server/main.goが実行されます。

[https://github.com/pingcap/tidb/blob/master/cmd/tidb-server/main.go](https://github.com/pingcap/tidb/blob/master/cmd/tidb-server/main.go)

ここでは、種々の初期化やサーバの実行、クリーンアップ処理などの処理が行われています。

1. 初期設定

3. コアコンポーネントの初期化

5. ストレージとドメインの作成

7. サーバの作成と実行

9. クリーンアップ処理

### 1\. **初期設定**

```
// フラグの初期化と解析
fset := initFlagSet()

// 設定ファイルの読み込みと検証
config.InitializeConfig(*configPath, *configCheck, *configStrict, overrideConfig, fset)

// ログ設定の初期化
setupLog()

// メモリ管理の初期化
memory.InitMemoryHook()

// 拡張機能のセットアップ
setupExtensions()
```

### 2\. **コアコンポーネントの初期化**

```
// CPUプロファイラーの起動
err = cpuprofile.StartCPUProfiler()
terror.MustNil(err)

// グローバル変数の設定
setGlobalVars()

// CPUアフィニティの設定
setCPUAffinity()

// メトリクスの設定
setupMetrics()

// トレーシングのセットアップ
setupTracing()
```

### 3\. ストレージとドメインの作成

ここではストレージの作成とドメインの初期化をしている模様です

```
// KVストレージとドメインの初期化
keyspaceName := keyspace.GetKeyspaceNameBySettings()
storage, dom := createStoreDDLOwnerMgrAndDomain(keyspaceName)

// リポジトリのセットアップ
repository.SetupRepository(dom)
```

ただドメインの初期化と言われてもピンと来ないと思うので、さらにcreateStoreDDLOwnerMgrAndDomainを見てましょう。

```
func createStoreDDLOwnerMgrAndDomain(keyspaceName string) (kv.Storage, *domain.Domain) {
    // 1. ストレージパスの構築
    cfg := config.GetGlobalConfig()
    var fullPath string
    if keyspaceName == "" {
        fullPath = fmt.Sprintf("%s://%s", cfg.Store, cfg.Path)
    } else {
        fullPath = fmt.Sprintf("%s://%s?keyspaceName=%s", cfg.Store, cfg.Path, keyspaceName)
    }

    // 2. KVストレージの初期化
    storage, err := kvstore.New(fullPath)
    terror.MustNil(err)

    // 3. MPP関連のコンポーネント起動
    copr.GlobalMPPFailedStoreProber.Run()
    mppcoordmanager.InstanceMPPCoordinatorManager.Run()

    // 4. DDLオーナーマネージャーの起動
    err = ddl.StartOwnerManager(context.Background(), storage)
    terror.MustNil(err)

    // 5. セッションのブートストラップ
    dom, err := session.BootstrapSession(storage)
    terror.MustNil(err)
    return storage, dom
}
```

どうやらストレージに対して起動したセッションを管理していそう

さらにsession.goのBootstrapSessionまで見てみましょう

[https://github.com/pingcap/tidb/blob/5a5186162ea6078400c5ed5e6bef9b7a46710bb7/pkg/session/session.go#L3421](https://github.com/pingcap/tidb/blob/5a5186162ea6078400c5ed5e6bef9b7a46710bb7/pkg/session/session.go#L3421)

```
// BootstrapSession bootstrap session and domain.
func BootstrapSession(store kv.Storage) (*domain.Domain, error) {
	return bootstrapSessionImpl(context.Background(), store, createSessions)
}

...

func bootstrapSessionImpl(ctx context.Context, store kv.Storage, createSessionsImpl func(store kv.Storage, cnt int) ([]*session, error)) (*domain.Domain, error) {
	...
        // DDLジョブテーブル、TiDBS Scema CacheSizeの初期化など
	err := InitDDLJobTables(store, meta.BaseDDLTableVersion)
	...
	ver := getStoreBootstrapVersionWithCache(store)
        ...

        // セッションの実装クラスの作成
	ses, err := createSessionsImpl(store, 10)
	if err != nil {
		return nil, err
	}
	ses[0].GetSessionVars().InRestrictedSQL = true
        ...

	// グローバル変数を初期化した後にドメインを開始
	dom := domain.GetDomain(ses[0])
	err = dom.Start(ddl.Normal)
	if err != nil {
		return nil, err
	}
        ... 
}

// GetDomain gets the associated domain for store.
func GetDomain(store kv.Storage) (*domain.Domain, error) 
	return domap.Get(store)
}
```

ここから色々見ていくとセッションから取得したtikvのストレージインスタンスに対応するDomainをGetDomainではに対応するDomainを返していることがわかりました。

さらにdomain.goの構造体を見てみましょう

```
// Domain represents a storage space. Different domains can use the same database name.
// Multiple domains can be used in parallel without synchronization.
type Domain struct {
	store           kv.Storage
	infoCache       *infoschema.InfoCache
	privHandle      *privileges.Handle
	bindHandle      atomic.Value
	statsHandle     atomic.Pointer[handle.Handle]
	statsLease      time.Duration
	ddl             ddl.DDL
	ddlExecutor     ddl.Executor
	ddlNotifier     *notifier.DDLNotifier
	...
	instancePlanCache sessionctx.InstancePlanCache // the instance level plan cache

	statsOwner owner.Manager
	// deferFn is used to release infoschema object lazily during v1 and v2 switch
	deferFn
}
```

この構造体が定義されているファイルを見ると「ストレージ空間の管理」「スキーマ管理とリロード」「DDL操作の実行と管理権限管理」「統計情報の収集と管理」「システムセッションプールの管理」「スロークエリの監視」「etcdとの連携によるメタデータ同期」「PDクライアントを通じたクラスタ管理」など色々なことを担っていそうですね。

ドメイン＝中核という文字通りのクラスなんですかねー

他の処理も見ていくと、様々な処理でこのドメインという構造体を参照しているみたいでした。

例えば、plan\_cache.goでは統計情報をキャッシュから取得するメソッドGetPlanFromPlanCache()からlookupPlanCache()が呼ばれており、そこでドメインが参照されています。

```
func lookupPlanCache(ctx context.Context, sctx sessionctx.Context, cacheKey string,
	paramTypes []*types.FieldType) (plan base.Plan, outputCols types.NameSlice, stmtHints *hint.StmtHints, hit bool) {
	...
	if useInstanceCache {
		v, hit = domain.GetDomain(sctx).GetInstancePlanCache().Get(cacheKey, paramTypes)
	} else {
		v, hit = sctx.GetSessionPlanCache().Get(cacheKey, paramTypes)
	}
        ...
}
```

### 4\. サーバの作成と実行

```
// サーバーの作成
svr := createServer(storage, dom)

// シグナルハンドラーの設定
exited := make(chan struct{})
signal.SetupSignalHandler(func() {
    svr.Close()
    resourcemanager.InstanceResourceManager.Stop()
    cleanup(svr, storage, dom)
    cpuprofile.StopCPUProfiler()
    executor.Stop()
    close(exited)
})

// TopSQLの設定
topsql.SetupTopSQL(svr)

// サーバーの実行
terror.MustNil(svr.Run(dom))
<-exited
```

### 5\. クリーンアップ処理

```
func cleanup(svr *server.Server, storage kv.Storage, dom *domain.Domain) {
    // 自動分析の停止
    dom.StopAutoAnalyze()

    // クライアント接続のドレイン
    drainClientWait := gracefulCloseConnectionsTimeout
    cancelClientWait := time.Second * 1
    svr.DrainClients(drainClientWait, cancelClientWait)

    // システムプロセスの終了
    svr.KillSysProcesses()
    
    // 各コンポーネントの停止とクリーンアップ
    plugin.Shutdown(context.Background())
    repository.StopRepository()
    closeDDLOwnerMgrDomainAndStorage(storage, dom)
    disk.CleanUp()
    closeStmtSummary()
    topsql.Close()
    cgmon.StopCgroupMonitor()
}

// 最後のログ同期
syncLog()
```
