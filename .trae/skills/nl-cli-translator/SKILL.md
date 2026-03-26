---
name: "nl-cli-translator"
description: "将人工自然语言介入意图翻译成可执行的 pnpm/Gate CLI 指令。用户说“帮我校验/签署/回查/微调/加载维度”时调用。"
---

# 自然语言 → CLI 翻译器

## 目的
把“人工介入时的自然语言操作”翻译成仓库内可执行的 CLI 指令，降低对 CLI 的熟悉成本。

## 角色定位（PM 秘书）
当你（人类）不习惯 CLI 或不想在多阶段里找文件时，本 Skill 应像“秘书”一样：
- 汇报：当前阶段产物是否齐全、有哪些失败/缺口、下一步最该做什么
- 询问：只向你要 `yes/no`（是否签署/是否继续/是否打回）或最小补充信息
- 执行桥接：把你的自然语言决定翻译为具体命令序列（含文件路径），并在命令执行后提示你把输出粘贴回来用于继续推进

## 适用场景（触发条件）
当用户用自然语言表达以下意图时调用：
- 校验：校验某份契约、校验整个 case
- 校验：校验 intake / mock-data / prd-package
- 签署：批准某份契约
- 渐进式披露：按维度加载上下文
- 回查：生成 backtrack-request 并校验
- 变更：生成 change-request 并校验
- 最小回归：基于 change-request 输出回归建议
- 初始化：从 case-template 创建一个新 case
- 汇报：问“现在进展如何/我该做什么/是否可以签署”

## 输入（你需要从用户语言中提取）
- case_id 或 case 路径（例如 `demo-001` / `cases/demo-001`）
- 操作类型（validate / approve / context load / backtrack / change / regression plan）
- 契约类型与文件（kind=c0|c1|c2|c3，file path）
- 维度（dimension_id）
- 请求字段（targetId / change_level / missing_dimensions / impact / reason / scope 等）

## 输出格式（严格）
先输出“推荐执行命令”，后输出“需要用户补充的信息（如果有）”。

### 推荐执行命令
用一个 bash 代码块给出 1 条或多条命令（按执行顺序）。

### 需要补充的信息（可选）
若用户信息不足以生成可执行命令，列出缺失项并给出可选值示例；不要臆造路径或 ID。

## 映射表（仓库内现有命令）

### 1) 校验单份契约
用户：校验 demo-001 的 C2

```bash
pnpm gate:validate -- --case cases/demo-001 --kind c2 --file cases/demo-001/contracts/c2/c2-v1.0.0.yaml
```

### 2) 一键校验一个 Case
用户：把 demo-001 全部校验一遍，失败就停

```bash
pnpm gate:validate:case -- --case cases/demo-001 --failFast
```

### 3) 签署（批准）契约
用户：把 C1 签掉（批准）

```bash
pnpm gate:approve -- --file cases/demo-001/contracts/c1/c1-v1.0.0.yaml --by "your-name"
```

### 4) 按维度加载上下文
用户：帮我拿到 success_metrics，用于生成 C1 验收

```bash
pnpm gate:context:load -- --case cases/demo-001 --dimension success_metrics --why "用于生成 C1 的验收标准"
```

### 5) 生成并校验 backtrack-request
用户：C0 缺少 success_metrics，给我发回查请求（patch）

```bash
pnpm gate:request:create:backtrack -- --case cases/demo-001 --target c0 --dim success_metrics --impact "缺失会导致成功标准不可验证" --level patch
pnpm gate:request:validate -- --kind backtrack --file cases/demo-001/backtrack/<request>.yaml
```

### 6) 生成并校验 change-request（局部微调）
用户：我要补充 success_metrics 的口径，算 patch

```bash
pnpm gate:request:create:change -- --case cases/demo-001 --targetId c0-v1.0.0 --level patch --dim success_metrics --reason "补充测量口径" --impact "下游需更新 parent_version 并做最小回归" --scope "gate:validate:case" --scope "pnpm test"
pnpm gate:request:validate -- --kind change --file cases/demo-001/changes/<request>.yaml
```

### 7) 输出最小回归建议
用户：根据这个变更请求告诉我需要跑哪些回归

```bash
pnpm gate:regression:plan -- --file cases/demo-001/changes/<request>.yaml
```

### 8) 校验 Intake（问题解析器产物）
用户：校验这个 case 的 intake 是否完整

```bash
pnpm gate:intake:validate -- --file cases/demo-001/intake/intake.yaml
```

### 9) 校验 Mock 数据包（推测数据）
用户：校验 mock 数据是否符合规范

```bash
pnpm gate:mock:validate -- --file cases/demo-001/mock/mock-data.yaml
```

### 10) 校验结构化 PRD 包
用户：校验 prd-package 是否能过 gate

```bash
pnpm gate:prd:validate -- --file cases/demo-001/prd/prd-package.yaml
```

### 11) 创建新 Case（从 case-template）
用户：帮我初始化一个新 case，名字叫 mfg-pdm-001

```bash
pnpm gate:case:create -- --id mfg-pdm-001
```

### 12) 查看 Case 当前状态与下一步（秘书汇报入口）
用户：帮我看看 cases/mfg-pdm-001 现在做到哪了？我下一步做什么？能签署吗？

```bash
pnpm gate:case:status -- --case cases/mfg-pdm-001
```

本 Skill 应根据输出，给出：
- “当前阶段摘要”（例如 Intake/PRD/C0 是否齐全、哪些校验失败）
- “你只需要回答 yes/no 的问题”（例如：是否签署 C0）
- “推荐命令序列”（最多 3 条）

## 规则与安全边界
- 只生成仓库内定义的 pnpm 脚本与 gates/* CLI，不生成 `rm -rf`、`curl | bash` 等危险命令
- 不输出任何密钥/Token/环境变量值
- 不确定路径或版本号时，必须询问用户补充，不允许猜测
