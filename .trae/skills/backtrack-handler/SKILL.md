# Backtrack Handler

## 目的
当发现上游信息缺失或冲突时，生成可追溯的回查请求，并驱动版本化补充，避免错误在下游放大。

## 输入
- case_id
- target_contract：c0 | c1 | c2
- missing_dimensions：缺失维度列表
- impact：影响描述（会导致什么偏差/风险）

## 输出
- cases/<case_id>/backtrack/backtrack-request-*.yaml
- 建议的变更级别：patch | minor | major

## 规则
- 下游必须停止推进，等待上游补充并生成新版本
- 下游吸收补充时必须更新 parent_version

