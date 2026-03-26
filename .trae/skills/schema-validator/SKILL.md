# Schema Validator

## 目的
对 Case 内的阶段契约（C0–C3）进行强校验：Schema 校验 + 关键规则校验，并在失败时阻断流程。

## 输入
- case_id
- contract_kind：c0 | c1 | c2 | c3
- contract_path：待校验 YAML 路径

## 输出
- pass：true/false
- errors：失败原因列表（可定位到字段）
- exit_code：失败为非 0（用于阻断）

## 规则（最小集合）
- YAML 可解析为对象
- 满足对应 JSON Schema
- parent_version（除 C0）必须存在且指向“已批准版本”
- 冻结资源校验（如 C1 记录 openapi_sha256，则后续阶段不得变化）

