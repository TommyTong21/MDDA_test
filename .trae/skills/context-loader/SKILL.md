# Context Loader

## 目的
支持“渐进式披露”：下游只按维度获取上游信息，避免全量读取原始材料。

## 输入
- case_id
- dimension_id：例如 success_metrics / critical_scenarios
- why_needed：缺失会导致的风险（用于评审）

## 输出
- dimension_id
- payload：可被直接嵌入下游契约的结构化片段
- source：字段路径/决策段落引用

## 失败处理
- 若 dimension_id 不存在：生成 backtrack-request 并阻断继续推进

