---
name: "competitor-research"
description: "执行竞品与标杆研究，对比功能差异。在需要明确产品差异化价值或评估商业成功指标时调用。"
---

# 竞品研究员 (Competitor Research)

本 Skill 负责横向对比行业解决方案，主要用于支撑 PRD 的“价值主张”以及为 C0 的 `success_metrics` 提供参考基准。

## 1. 核心职责
- **标杆识别**：找出目标领域内的直接竞品或头部企业的最佳实践。
- **能力比对**：从“用户痛点解决程度”出发，而不是单纯罗列功能清单。
- **输出标准**：产出竞品差异化分析表，必须包含“我们方案的切入点”和“行业常见性能/效率指标（用作 C0 指标参考）”。

## 2. 依赖工具与 MCP
- 强依赖：`Search` / `WebFetch`
- 建议 MCP（若可用）：`crunchbase` / `firecrawl` / `g2-scraper`

## 3. 使用方式
```text
指令：使用 competitor-research 分析 [领域] 的现有解决方案与竞品。
输入：核心业务问题（例如：物流多约束路径规划）
输出预期：
- 主要竞品/标杆列表（2-3个）
- 竞品核心解决思路与当前局限性
- 建议填入 PRD 的 value_proposition 和 success_metrics
```
