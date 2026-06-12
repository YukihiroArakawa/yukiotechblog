---
title: "TiDBのissueを眺める「flaky test for IMPORT INTO」"
date: 2025-04-18
categories: 
  - "golang"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-issue-flaky-test-for-import-into"
type: "post"
---

[https://github.com/pingcap/tidb/issues/60109](https://github.com/pingcap/tidb/issues/60109)

## どんなissueか？

このissueはintegration test実行時に権限に関するテストがflakyであるというイシューです。

> run test \[privilege/privileges\] err: sql:IMPORT INTO t FROM '/file.csv';: failed to run query  
> "IMPORT INTO t FROM '/file.csv';"  
> around line 379,  
> we need(127):  
> IMPORT INTO t FROM '/file.csv';  
> Error 1142 (42000): DELETE command denied to user 'test\_import\_into'@'localhost' for table 't'
> 
> but got(127):  
> IMPORT INTO t FROM '/file.csv';  
> Error 1142 (42000): INSERT command denied to user 'test\_import\_into'@'localhost' for table 't'

## CIでのエラーログ

なお該当のCIでのエラーは以下で確認できる模様です。

[https://do.pingcap.net/jenkins/blue/organizations/jenkins/pingcap%2Ftidb%2Fghpr\_check2/detail/ghpr\_check2/28804/pipeline](https://do.pingcap.net/jenkins/blue/organizations/jenkins/pingcap%2Ftidb%2Fghpr_check2/detail/ghpr_check2/28804/pipeline)

```

+ /home/jenkins/agent/workspace/pingcap/tidb/ghpr_check2/scripts/pingcap/tidb/integrationtest_with_tikv.sh y

~/agent/workspace/pingcap/tidb/ghpr_check2/tidb/tests/integrationtest ~/agent/workspace/pingcap/tidb/ghpr_check2/tidb

extracting statistics: s

skip building tidb-server, using existing binary: /home/jenkins/agent/workspace/pingcap/tidb/ghpr_check2/tidb/bin/integration_test_tidb-server

...

start tidb-server, log file: ./integration-test.out
tidb-server(PID: 886) started
run all integration test cases (enabled new collation)
./t/show.test: ok! 3 test cases passed, take time 0.000419743 s

...

./t/planner/funcdep/only_full_group_by.test: ok! 148 test cases passed, take time 2.493733896 s

time="2025-03-17T14:59:24+08:00" level=error msg="failed to drop database: Error 1044 (42000): Access denied for user 'test_import_into'@'localhost' to database 'privilege__privileges'"

time="2025-03-17T14:59:24+08:00" level=error msg="run test [privilege/privileges] err: 

sql:IMPORT INTO t FROM '/file.csv';: failed to run query \n

\"IMPORT INTO t FROM '/file.csv';\" \n 
around line 379, \n
we need(127):\nIMPORT INTO t FROM '/file.csv';\n
Error 1142 (42000): DELETE command denied to user 'test_import_into'@'localhost' for table 't'\n\n

but got(127):\n

IMPORT INTO t FROM '/file.csv';\n
Error 1142 (42000): INSERT command denied to user 'test_import_into'@'localhost' for table 't'\n\n"

./t/select.test: ok! 206 test cases passed, take time 1.912050072 s

...
```

## 実行されているintegration test

CIのログから実行されているintegration testは「integrationtest\_with\_tikv.sh」というスクリプトを通して実行されていそうです。

ただTiDBのリポジトリには無かったので、Jenkinsfileを参照すると「pingcap/SRE.git」から参照していそうなことがわかりました。

```
#!groovy

node {
    def TIDB_TEST_BRANCH = "master"
    def TIKV_BRANCH = "master"
    def PD_BRANCH = "master"

    fileLoader.withGit('git@github.com:pingcap/SRE.git', 'master', 'github-iamxy-ssh', '') {
        fileLoader.load('jenkins/ci/pingcap_tidb_branch.groovy').call(TIDB_TEST_BRANCH, TIKV_BRANCH, PD_BRANCH)
    }
}
```

ただ、ググってみても該当するリポジトリはなさそうですね、、

非公開リポジトリなんでしょうか、、、

落ちているテストのディレクトリを見るとtidb/tests/integrationtest/run-tests.sh経由で実行されていそうですかね

そのためTiKV使う構成にした上で上記のスクリプトを叩けばCIのテストを再現できそうですかね

## CIの再現

以下コマンドでインテグレーションテストが実行されるようです。

```
$ make integrationtest
```

tidb/Makefileの中身を見ると先程のスクリプトが実行されてそうですね

```
.PHONY: integrationtest
integrationtest: server_check
	@mkdir -p $(TEST_COVERAGE_DIR)
	@cd tests/integrationtest && GOCOVERDIR=../../$(TEST_COVERAGE_DIR) ./run-tests.sh -s ../../bin/tidb-server
	@$(GO) tool covdata textfmt -i=$(TEST_COVERAGE_DIR) -o=coverage.dat
```

結果は以下の通りで全ケース通ってました

```
 make integrationtest
GO111MODULE=on go build -tags codes -cover  -ldflags '-X "github.com/pingcap/tidb/pkg/parser/mysql.TiDBReleaseVersion=5a5186162e" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBBuildTS=2025-04-14 05:17:30" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBGitHash=5a5186162ea6078400c5ed5e6bef9b7a46710bb7" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBGitBranch=master" -X "github.com/pingcap/tidb/pkg/util/versioninfo.TiDBEdition=Community" -X "github.com/pingcap/tidb/pkg/config.checkBeforeDropLDFlag=1"' --tags deadlock,enableassert -o bin/tidb-server ./cmd/tidb-server
extracting statistics: s
skip building tidb-server, using existing binary: ../../bin/tidb-server
building mysql-tester binary: ./mysql_tester
go: downloading github.com/pingcap/mysql-tester v0.0.0-20241224064458-0d83955ea569
go: downloading github.com/pingcap/errors v0.11.5-0.20221009092201-b66cddb77c32
go: downloading github.com/sirupsen/logrus v1.8.1
go: downloading github.com/defined2014/mysql v0.0.0-20231121061906-fcfacaa39f49
go: downloading golang.org/x/sys v0.5.0
start tidb-server, log file: ./integration-test.out
tidb-server(PID: 412338) started
run all integration test cases (disabled new collation)
./t/collation_agg_func.test: ok! 74 test cases passed, take time 0.084252646 s
./t/collation_check_use_collation.test: ok! 93 test cases passed, take time 0.395226098 s
./t/collation_misc.test: ok! 66 test cases passed, take time 0.350912796 s
./t/collation_pointget.test: ok! 106 test cases passed, take time 0.41248375 s

Great, All tests passed
start tidb-server, log file: ./integration-test.out
tidb-server(PID: 412413) started
run all integration test cases (enabled new collation)
./t/show.test: ok! 3 test cases passed, take time 0.00077169 s
./t/access_path_selection.test: ok! 9 test cases passed, take time 0.015471224 s
./t/agg_predicate_pushdown.test: ok! 7 test cases passed, take time 0.015971994 s
./t/bindinfo/bind.test: ok! 223 test cases passed, take time 1.082209434 s
./t/bindinfo/session_handle.test: ok! 21 test cases passed, take time 0.044520521 s
./t/bindinfo/temptable.test: ok! 38 test cases passed, take time 0.100346442 s
./t/black_list.test: ok! 55 test cases passed, take time 0.080185436 s
./t/clustered_index.test: ok! 34 test cases passed, take time 0.901839929 s
./t/collation_agg_func.test: ok! 74 test cases passed, take time 0.088055983 s
./t/collation_check_use_collation.test: ok! 93 test cases passed, take time 0.418648657 s
./t/collation_misc.test: ok! 66 test cases passed, take time 0.347309118 s
./t/collation_pointget.test: ok! 106 test cases passed, take time 0.401552057 s
./t/common_collation.test: ok! 26 test cases passed, take time 0.101450091 s
./t/cte.test: ok! 237 test cases passed, take time 1.360950187 s
./t/db_integration.test: ok! 11 test cases passed, take time 0.026793874 s
./t/ddl/attributes_sql.test: ok! 30 test cases passed, take time 0.244198237 s
./t/ddl/bdr_mode.test: ok! 371 test cases passed, take time 3.457469265 s
./t/ddl/column.test: ok! 42 test cases passed, take time 0.34262351 s
./t/ddl/column_change.test: ok! 9 test cases passed, take time 0.036500788 s
./t/ddl/column_modify.test: ok! 164 test cases passed, take time 1.028864665 s
./t/ddl/column_type_change.test: ok! 1285 test cases passed, take time 23.64150851 s
./t/ddl/constraint.test: ok! 440 test cases passed, take time 2.7621638920000002 s
./t/ddl/db.test: ok! 288 test cases passed, take time 3.738691506 s
./t/ddl/db_cache.test: ok! 50 test cases passed, take time 0.403663151 s
./t/ddl/db_change.test: ok! 33 test cases passed, take time 0.331712648 s
./t/ddl/db_foreign_key.test: ok! 20 test cases passed, take time 0.173377378 s
./t/ddl/db_integration.test: ok! 726 test cases passed, take time 6.4583548969999995 s
./t/ddl/db_partition.test: ok! 1110 test cases passed, take time 12.272305564 s
./t/ddl/db_rename.test: ok! 21 test cases passed, take time 0.258244369 s
./t/ddl/db_table.test: ok! 58 test cases passed, take time 0.510566726 s
./t/ddl/ddl_error.test: ok! 14 test cases passed, take time 0.052227896 s
./t/ddl/ddl_tiflash.test: ok! 14 test cases passed, take time 0.0452799 s
./t/ddl/default_as_expression.test: ok! 411 test cases passed, take time 3.093449469 s
./t/ddl/fail_db.test: ok! 12 test cases passed, take time 0.116761047 s
./t/ddl/foreign_key.test: ok! 181 test cases passed, take time 5.367425605 s
./t/ddl/index_modify.test: ok! 39 test cases passed, take time 0.369768752 s
./t/ddl/integration.test: ok! 91 test cases passed, take time 1.045156949 s
./t/ddl/modify_column.test: ok! 672 test cases passed, take time 9.367794057 s
./t/ddl/multi_schema_change.test: ok! 305 test cases passed, take time 4.807060279 s
./t/ddl/partition.test: ok! 138 test cases passed, take time 2.208404247 s
./t/ddl/primary_key_handle.test: ok! 191 test cases passed, take time 1.283342134 s
./t/ddl/reorg_partition.test: ok! 212 test cases passed, take time 3.093901369 s
./t/ddl/resource_group.test: ok! 16 test cases passed, take time 0.054940635 s
./t/ddl/sequence.test: ok! 268 test cases passed, take time 1.86534397 s
./t/ddl/serial.test: ok! 77 test cases passed, take time 0.719067413 s
./t/ddl/table_modify.test: ok! 47 test cases passed, take time 5.017721012 s
./t/executor/adapter.test: ok! 6 test cases passed, take time 0.014257702 s
./t/executor/admin.test: ok! 171 test cases passed, take time 16.451752859 s
./t/executor/aggregate.test: ok! 885 test cases passed, take time 4.322094153 s
./t/executor/analyze.test: ok! 180 test cases passed, take time 3.359072176 s
./t/executor/autoid.test: ok! 458 test cases passed, take time 1.9917302399999999 s
./t/executor/batch_point_get.test: ok! 85 test cases passed, take time 0.342264755 s
./t/executor/charset.test: ok! 214 test cases passed, take time 0.713967735 s
./t/executor/chunk_reuse.test: ok! 93 test cases passed, take time 0.123911679 s
./t/executor/cluster_table.test: ok! 36 test cases passed, take time 0.124943601 s
./t/executor/compact_table.test: ok! 19 test cases passed, take time 0.10297048 s
./t/executor/cte.test: ok! 133 test cases passed, take time 0.625224428 s
./t/executor/ddl.test: ok! 359 test cases passed, take time 4.30276672 s
./t/executor/delete.test: ok! 91 test cases passed, take time 0.371027033 s
./t/executor/distsql.test: ok! 61 test cases passed, take time 0.538288912 s
./t/executor/executor.test: ok! 1951 test cases passed, take time 9.964691472 s
./t/executor/executor_txn.test: ok! 121 test cases passed, take time 0.194307153 s
./t/executor/expand.test: ok! 71 test cases passed, take time 0.325893524 s
./t/executor/explain.test: ok! 120 test cases passed, take time 0.566954855 s
./t/executor/explainfor.test: ok! 376 test cases passed, take time 0.931140238 s
./t/executor/foreign_key.test: ok! 318 test cases passed, take time 6.377447594 s
./t/executor/grant.test: ok! 209 test cases passed, take time 1.142153926 s
./t/executor/import_into.test: ok! 99 test cases passed, take time 0.132570862 s
./t/executor/index_lookup_join.test: ok! 190 test cases passed, take time 1.3340897 s
./t/executor/index_lookup_merge_join.test: ok! 83 test cases passed, take time 0.736059124 s
./t/executor/index_merge_reader.test: ok! 244 test cases passed, take time 1.246344865 s
./t/executor/infoschema_reader.test: ok! 220 test cases passed, take time 3.213031338 s
./t/executor/insert.test: ok! 1281 test cases passed, take time 8.329547897 s
./t/executor/inspection_common.test: ok! 4 test cases passed, take time 0.002591851 s
./t/executor/issues.test: ok! 463 test cases passed, take time 3.326337854 s
./t/executor/jointest/hash_join.test: ok! 148 test cases passed, take time 0.836304962 s
./t/executor/jointest/join.test: ok! 858 test cases passed, take time 6.84803494 s
./t/executor/kv.test: ok! 16 test cases passed, take time 0.061106713 s
./t/executor/merge_join.test: ok! 259 test cases passed, take time 2.013082213 s
^Gc./t/executor/parallel_apply.test: ok! 96 test cases passed, take time 0.66495926 s
./t/executor/partition/issues.test: ok! 159 test cases passed, take time 2.003399307 s
./t/executor/partition/partition_boundaries.test: ok! 1035 test cases passed, take time 1.5606938129999999 s
./t/executor/partition/partition_with_expression.test: ok! 298 test cases passed, take time 1.43757571 s
./t/executor/partition/table.test: ok! 224 test cases passed, take time 2.476973939 s
^Gc./t/executor/partition/write.test: ok! 349 test cases passed, take time 1.20047894 s
./t/executor/password_management.test: ok! 381 test cases passed, take time 2.151442307 s
./t/executor/perfschema.test: ok! 5 test cases passed, take time 0.007025026 s
./t/executor/point_get.test: ok! 271 test cases passed, take time 1.033477327 s
./t/executor/prepared.test: ok! 214 test cases passed, take time 0.77955765 s
./t/executor/revoke.test: ok! 65 test cases passed, take time 0.462521833 s
./t/executor/rowid.test: ok! 63 test cases passed, take time 0.206145803 s
./t/executor/sample.test: ok! 109 test cases passed, take time 1.292958043 s
./t/executor/set.test: ok! 228 test cases passed, take time 0.279029612 s
./t/executor/show.test: ok! 300 test cases passed, take time 2.256910731 s
./t/executor/simple.test: ok! 357 test cases passed, take time 2.010691724 s
./t/executor/split_table.test: ok! 60 test cases passed, take time 0.32732722 s
./t/executor/stale_txn.test: ok! 28 test cases passed, take time 0.853766477 s
./t/executor/statement_context.test: ok! 63 test cases passed, take time 0.093963985 s
./t/executor/union_scan.test: ok! 231 test cases passed, take time 0.993301075 s
./t/executor/update.test: ok! 521 test cases passed, take time 2.199551346 s
./t/executor/window.test: ok! 93 test cases passed, take time 0.263205551 s
./t/executor/write.test: ok! 1061 test cases passed, take time 7.374375444 s
./t/explain-non-select-stmt.test: ok! 8 test cases passed, take time 0.013096773 s
./t/explain.test: ok! 26 test cases passed, take time 0.086657979 s
./t/explain_complex.test: ok! 41 test cases passed, take time 0.250765077 s
./t/explain_complex_stats.test: ok! 61 test cases passed, take time 2.137775794 s
./t/explain_cte.test: ok! 53 test cases passed, take time 0.241130808 s
./t/explain_easy.test: ok! 190 test cases passed, take time 0.962606892 s
./t/explain_easy_stats.test: ok! 50 test cases passed, take time 0.505102444 s
./t/explain_foreign_key.test: ok! 41 test cases passed, take time 0.385216746 s
./t/explain_generate_column_substitute.test: ok! 233 test cases passed, take time 1.905272576 s
./t/explain_indexmerge_stats.test: ok! 30 test cases passed, take time 0.596947746 s
./t/explain_join_stats.test: ok! 8 test cases passed, take time 0.149784447 s
./t/explain_shard_index.test: ok! 19 test cases passed, take time 0.082901922 s
./t/explain_stats.test: ok! 10 test cases passed, take time 0.063618163 s
./t/explain_union_scan.test: ok! 9 test cases passed, take time 0.110828745 s
./t/expression/builtin.test: ok! 1365 test cases passed, take time 5.403303632 s
./t/expression/cast.test: ok! 85 test cases passed, take time 0.266454522 s
./t/expression/charset_and_collation.test: ok! 733 test cases passed, take time 3.151313371 s
./t/expression/constant_fold.test: ok! 16 test cases passed, take time 0.065394042 s
./t/expression/enum_set.test: ok! 13 test cases passed, take time 0.049322823 s
./t/expression/explain.test: ok! 77 test cases passed, take time 0.135015992 s
./t/expression/format.test: ok! 9 test cases passed, take time 0.004008463 s
./t/expression/issues.test: ok! 1525 test cases passed, take time 8.151383189 s
./t/expression/json.test: ok! 321 test cases passed, take time 0.578494992 s
./t/expression/misc.test: ok! 416 test cases passed, take time 1.800821801 s
./t/expression/multi_valued_index.test: ok! 314 test cases passed, take time 1.280523308 s
./t/expression/noop_functions.test: ok! 61 test cases passed, take time 0.032249714 s
./t/expression/plan_cache.test: ok! 184 test cases passed, take time 0.342822594 s
./t/expression/time.test: ok! 353 test cases passed, take time 0.593951934 s
./t/expression/vitess_hash.test: ok! 17 test cases passed, take time 0.108809172 s
./t/generated_columns.test: ok! 70 test cases passed, take time 0.487995821 s
./t/globalindex/aggregate.test: ok! 16 test cases passed, take time 0.083109694 s
./t/globalindex/analyze.test: ok! 37 test cases passed, take time 0.589841218 s
./t/globalindex/ddl.test: ok! 55 test cases passed, take time 0.928792793 s
./t/globalindex/expression_index.test: ok! 14 test cases passed, take time 0.060783952 s
./t/globalindex/index_join.test: ok! 31 test cases passed, take time 0.402205084 s
./t/globalindex/information_schema.test: ok! 7 test cases passed, take time 0.177975604 s
./t/globalindex/insert.test: ok! 14 test cases passed, take time 0.172727089 s
./t/globalindex/mem_index_lookup.test: ok! 40 test cases passed, take time 0.087641346 s
./t/globalindex/mem_index_merge.test: ok! 53 test cases passed, take time 0.177964568 s
./t/globalindex/mem_index_reader.test: ok! 36 test cases passed, take time 0.077833591 s
./t/globalindex/misc.test: ok! 91 test cases passed, take time 0.88965787 s
./t/globalindex/multi_valued_index.test: ok! 13 test cases passed, take time 0.031366137 s
./t/globalindex/point_get.test: ok! 38 test cases passed, take time 0.570505627 s
./t/globalindex/update.test: ok! 31 test cases passed, take time 0.159422816 s
./t/imdbload.test: ok! 62 test cases passed, take time 5.180020615 s
./t/index_join.test: ok! 22 test cases passed, take time 0.19711918 s
./t/index_merge.test: ok! 145 test cases passed, take time 0.595033134 s
./t/infoschema/cluster_tables.test: ok! 17 test cases passed, take time 0.033720382 s
./t/infoschema/infoschema.test: ok! 192 test cases passed, take time 1.748714801 s
./t/infoschema/tables.test: ok! 120 test cases passed, take time 0.683002518 s
./t/infoschema/v2.test: ok! 34 test cases passed, take time 0.242157724 s
./t/naaj.test: ok! 135 test cases passed, take time 0.209393553 s
./t/new_character_set.test: ok! 73 test cases passed, take time 0.21819439 s
./t/new_character_set_builtin.test: ok! 222 test cases passed, take time 0.673286323 s
./t/new_character_set_invalid.test: ok! 28 test cases passed, take time 0.161731028 s
./t/parser/integration.test: ok! 8 test cases passed, take time 0.047771268 s
./t/partition.test: ok! 3 test cases passed, take time 0.066956686 s
./t/planner/cardinality/selectivity.test: ok! 686 test cases passed, take time 1.087187041 s
./t/planner/cardinality/trace.test: ok! 5 test cases passed, take time 0.074226787 s
./t/planner/cascades/integration.test: ok! 247 test cases passed, take time 0.54597612 s
./t/planner/core/binary_plan.test: ok! 6 test cases passed, take time 0.001765196 s
./t/planner/core/casetest/expression_rewriter.test: ok! 23 test cases passed, take time 0.102172393 s
./t/planner/core/casetest/hint/hint.test: ok! 182 test cases passed, take time 1.236515311 s
./t/planner/core/casetest/index/index.test: ok! 225 test cases passed, take time 1.295065344 s
./t/planner/core/casetest/integration.test: ok! 462 test cases passed, take time 1.885512522 s
./t/planner/core/casetest/partition/integration_partition.test: ok! 134 test cases passed, take time 0.6534598 s
./t/planner/core/casetest/partition/partition_pruner.test: ok! 284 test cases passed, take time 0.779236741 s
./t/planner/core/casetest/physicalplantest/physical_plan.test: ok! 913 test cases passed, take time 2.245857518 s
./t/planner/core/casetest/point_get_plan.test: ok! 52 test cases passed, take time 0.097840836 s
./t/planner/core/casetest/predicate_simplification.test: ok! 133 test cases passed, take time 0.425602302 s
./t/planner/core/casetest/pushdown/push_down.test: ok! 54 test cases passed, take time 0.136742262 s
./t/planner/core/casetest/rule/rule_derive_topn_from_window.test: ok! 73 test cases passed, take time 0.269839101 s
./t/planner/core/casetest/rule/rule_join_reorder.test: ok! 481 test cases passed, take time 2.9053570239999997 s
./t/planner/core/casetest/rule/rule_result_reorder.test: ok! 87 test cases passed, take time 0.435055528 s
./t/planner/core/cbo.test: ok! 34 test cases passed, take time 0.25838076 s
./t/planner/core/enforce_mpp.test: ok! 8 test cases passed, take time 0.002249622 s
./t/planner/core/expression_rewriter.test: ok! 206 test cases passed, take time 1.143739655 s
./t/planner/core/indexjoin.test: ok! 41 test cases passed, take time 0.08965929 s
./t/planner/core/indexmerge_intersection.test: ok! 6 test cases passed, take time 0.022173063 s
./t/planner/core/indexmerge_path.test: ok! 273 test cases passed, take time 1.416114719 s
./t/planner/core/integration.test: ok! 1621 test cases passed, take time 9.596111439 s
./t/planner/core/integration_partition.test: ok! 493 test cases passed, take time 3.103099602 s
./t/planner/core/issuetest/planner_issue.test: ok! 178 test cases passed, take time 1.5684160820000002 s
./t/planner/core/memtable_predicate_extractor.test: ok! 45 test cases passed, take time 0.058185246 s
./t/planner/core/partition_pruner.test: ok! 642 test cases passed, take time 1.7485012979999999 s
./t/planner/core/physical_plan.test: ok! 44 test cases passed, take time 0.230481931 s
./t/planner/core/plan.test: ok! 157 test cases passed, take time 0.635595516 s
./t/planner/core/plan_cache.test: ok! 1243 test cases passed, take time 3.640224692 s
./t/planner/core/plan_cost_ver2.test: ok! 70 test cases passed, take time 0.257023837 s
./t/planner/core/point_get_plan.test: ok! 265 test cases passed, take time 0.94744803 s
./t/planner/core/preprocess.test: ok! 6 test cases passed, take time 0.021921838 s
./t/planner/core/range_scan_for_like.test: ok! 226 test cases passed, take time 0.367674863 s
./t/planner/core/rule_constant_propagation.test: ok! 31 test cases passed, take time 0.29888315 s
./t/planner/core/rule_join_reorder.test: ok! 52 test cases passed, take time 0.389320893 s
./t/planner/core/rule_result_reorder.test: ok! 29 test cases passed, take time 0.103000706 s
./t/planner/core/tests/prepare/issue.test: ok! 321 test cases passed, take time 0.870491528 s
./t/planner/core/tests/prepare/prepare.test: ok! 458 test cases passed, take time 1.237829604 s
./t/planner/funcdep/only_full_group_by.test: ok! 148 test cases passed, take time 1.187830786 s
./t/privilege/privileges.test: ok! 483 test cases passed, take time 3.327052505 s
./t/select.test: ok! 206 test cases passed, take time 0.925892132 s
./t/session/bootstrap_upgrade.test: ok! 29 test cases passed, take time 0.101577036 s
./t/session/clustered_index.test: ok! 385 test cases passed, take time 3.369578753 s
./t/session/common.test: ok! 212 test cases passed, take time 1.9098411 s
./t/session/nontransactional.test: ok! 1532 test cases passed, take time 3.501555785 s
./t/session/privileges.test: ok! 66 test cases passed, take time 0.470848815 s
./t/session/session.test: ok! 104 test cases passed, take time 0.421780236 s
./t/session/temporary_table.test: ok! 277 test cases passed, take time 0.208588777 s
./t/session/txn.test: ok! 14 test cases passed, take time 0.021303522 s
./t/session/user_variables.test: ok! 16 test cases passed, take time 0.014351346 s
./t/session/variable.test: ok! 103 test cases passed, take time 0.163990528 s
./t/session/vars.test: ok! 127 test cases passed, take time 0.086291267 s
./t/sessionctx/setvar.test: ok! 685 test cases passed, take time 0.244366845 s
./t/sessiontxn/externals.test: ok! 56 test cases passed, take time 0.119588116 s
./t/statistics/handle.test: ok! 70 test cases passed, take time 0.893478466 s
./t/statistics/integration.test: ok! 19 test cases passed, take time 0.081979618 s
./t/statistics/lock_table_stats.test: ok! 47 test cases passed, take time 0.347494166 s
./t/statistics/overflow_calc.test: ok! 5 test cases passed, take time 0.037343585 s
./t/subquery.test: ok! 32 test cases passed, take time 0.207661128 s
./t/table/cache.test: ok! 108 test cases passed, take time 8.384497406 s
./t/table/index.test: ok! 38 test cases passed, take time 0.349018534 s
./t/table/partition.test: ok! 240 test cases passed, take time 1.494775605 s
./t/table/tables.test: ok! 24 test cases passed, take time 0.05302752 s
./t/table/temptable.test: ok! 11 test cases passed, take time 0.027713861 s
./t/topn_push_down.test: ok! 20 test cases passed, take time 0.091987255 s
./t/topn_pushdown.test: ok! 2 test cases passed, take time 0.000799345 s
./t/tpch.test: ok! 40 test cases passed, take time 1.10017998 s
./t/types/const.test: ok! 143 test cases passed, take time 0.624346471 s
./t/util/admin.test: ok! 143 test cases passed, take time 0.983703759 s
./t/util/ranger.test: ok! 188 test cases passed, take time 0.69466262 s
./t/window_function.test: ok! 28 test cases passed, take time 0.074500337 s

Great, All tests passed
integrationtest passed!
./run-tests.sh: line 1: kill: (412413) - No such process
```

うーん、、、Flakeyなテストの修正はむずいですね、、、
