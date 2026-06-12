---
title: "TiDB vs Aurora on TPC-H10 with Query Description: Foreign Keys Accelerate Massive Aggregation Queries"
date: 2025-03-22
categories: 
  - "amazon-aurora"
  - "database"
  - "mysql"
  - "tidb"
coverImage: "Screenshot-from-2025-03-23-15-04-14.png"
slug: "tidb-vs-aurora-on-tpch10-with-query-discription"
type: "post"
---

- benchmark result:
    - [https://gist.github.com/c4pt0r/4c29c9cd387dd89fd51a84be7c6e9586](https://gist.github.com/c4pt0r/4c29c9cd387dd89fd51a84be7c6e9586)
    
    - This result was recorded in 2019 by dongxu (CTO & co-founder of PingCAP).

- TPC-H specification: [https://www.tpc.org/TPC\_Documents\_Current\_Versions/pdf/TPC-H\_v3.0.1.pdf](https://www.tpc.org/TPC_Documents_Current_Versions/pdf/TPC-H_v3.0.1.pdf)
    - You can check concretely each query and table above doc.

| Query | Description | TiDB | Aurora With FK | Aurora Without FK |
| --- | --- | --- | --- | --- |
| Q1 | Pricing Summary Report: Lineitemの数量・価格・割引などを集計 | 15.28 | 144 | 144.13 |
| Q2 | Minimum Cost Supplier: 部品ごとに最低供給コストのサプライヤーを特定 | 4.09 | 4.18 | 4.21 |
| Q3 | Shipping Priority: 高優先度注文の出荷および収益を評価 | 4.93 | 20.59 | 34.18 |
| Q4 | Order Priority: 遅延注文のカウントを抽出 | 2.3 | 7.5 | 7.49 |
| Q5 | Revenue by Nation: 国別の売上高を集計 | 19.44 | 18.25 | 22.43 |
| Q6 | Discounted Revenue: 割引適用後の売上高を算出 | 5.96 | 21.74 | 21.94 |
| Q7 | Volume Shipping: 取引量・出荷量を評価 | 8.42 | 12.06 | 81.83 |
| Q8 | Market Share: 特定市場内のサプライヤーシェアを分析 | 3.49 | 41.7 | 53.99 |
| Q9 | Nation Market Share: 国別の市場シェアおよび収益を算出 | 34.71 | 33.7 | 442.26 |
| Q10 | Top Supplier: 注文収益に基づく上位サプライヤーを特定 | 4.9 | 27.54 | 27.37 |
| Q11 | Important Stock Identification: 在庫コストの高い部品を抽出 | 3.96 | 3.41 | 38.35 |
| Q12 | Shipping Mode Analysis: 発送方法と注文優先度の関係を分析 | 11.66 | 24.42 | 24.3 |
| Q13 | Customer Order Distribution: 顧客別注文数や平均値を集計 | 8.72 | 56.57 | NaN |
| Q14 | Promotion Effect: プロモーション施策の影響を評価 | 4.36 | 22.25 | 22.2 |
| Q15 | Top Customer Revenue: 上位顧客の売上高を抽出 | 11.94 | 49.52 | 49.21 |
| Q16 | Parts Promotion: 部品のプロモーション候補を評価 | 2.14 | 3.28 | 3.25 |
| Q17 | Price-Quantity Analysis: 価格と数量の関係を集計 | 29.29 | 6.36 | NaN |
| Q18 | Large-Volume Orders: 大口注文の傾向や特性を分析 | 31.44 | 28.02 | 27.99 |
| Q19 | Profit by Nation: 国別の利益や収益性を算出 | 8.78 | 1.47 | 36.67 |
| Q20 | Potential Part Promotion: 販売促進候補の部品を抽出 | 7.95 | 3.77 | NaN |
| Q21 | Supplier Volume: サプライヤーごとの総注文量を評価 | 10 | 197.7 | NaN |
| Q22 | Global Revenue: 全体のグローバル売上を集計 | 5.06 | 1.58 | NaN |
