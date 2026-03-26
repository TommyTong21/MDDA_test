---
name: "market-analyst"
description: "执行行业与市场分析，提取政策合规与行业趋势。在接到新领域需求时或需要补齐 C0 约束条件时调用。"
---

# 市场与行业分析师 (Market Analyst)

本 Skill 负责为复杂 B 端问题提供宏观行业视角，主要用于补充 PRD 与 C0 的 `constraints` / `business_context` 维度。

## 1. 核心职责
- **政策与合规**：利用 Search 或专有 MCP 检索目标行业的法规限制（如医疗数据的 HIPAA/等保要求、自动驾驶的安全法规）。
- **行业趋势**：分析该需求是行业通用痛点还是特有定制，提取市场报告中的关键指标。
- **输出标准**：产出结构化的市场分析报告，必须包含可量化的“硬约束（Hard Limits）”和“行业基准值（Benchmarks）”。

## 2. 依赖工具与 MCP
- 强依赖：`Search`（互联网检索工具）
- 建议 MCP（若可用）：`brave-search` / `semantic-scholar` / `alpha-vantage`

## 3. 使用方式
```text
指令：使用 market-analyst 分析 [行业/场景] 的合规要求与市场现状。
输入：一句话业务背景（例如：医疗器械售后工单系统）
输出预期：
- 核心政策合规点（3-5条）
- 行业数字化趋势与痛点基准
- 建议填入 PRD 的 hard_limits
```
