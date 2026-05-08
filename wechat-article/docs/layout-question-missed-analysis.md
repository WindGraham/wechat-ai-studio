# 排版引导问题漏问：根因分析

## 现象

两个独立 AI 都在生成 HTML 前漏掉了这一问：

> 你希望如何安排排版结构？可以：
> 1. 打开可视化拖拽排版器
> 2. 上传参考截图让我匹配
> 3. 让我根据内容自行决定

## 根因：问题被放在了错误的章节层级

SKILL.md 有三个章节负责向 AI 下达"必须问"的指令：

| 章节 | 位置 | 功能 | 包含了排版引导？ |
|:---|:---|:---|:---:|
| Execution Rule（最高优先级清单） | SKILL.md 第 241 行 | 硬性步骤拆解，AI 逐条照做 | ❌ 没有 |
| Clarifying Style Requirements | SKILL.md 第 382 行 | MANDATORY 标记 + 反绕过条款 | ❌ 没有 |
| `interaction-workflow.md` | 被 Execution Rule 第 1 条强制引用 | 首轮必问问题模板 | ❌ 没有 |

排版引导问题**只出现了一次**：

| 章节 | 位置 | 性质 |
|:---|:---|:---|
| Workflow 第 4 步 | SKILL.md 第 314 行 | 叙述性流程描述，无 MANDATORY 标记 |

其他所有必问项（风格偏好、发布方式、图床测试、自查、截图、git）都至少在一个强制性章节里有条目，唯独排版引导没有。

## 具体链条

1. Execution Rule 第 1 条 → AI 读 `interaction-workflow.md` → 看到 5 个问题（色调/精致度/图片/开篇/缩进）→ **没有排版引导** → 问完 5 个认为任务完成
2. Execution Rule 第 8 条 → "不确认风格需求不得生成 HTML" → 风格需求（5 项）已确认 → 放行
3. Workflow 第 4 步 → 排版引导问题在这里 → 但 AI 已经走了 Execution Rule → Clarifying Style Requirements → 直接开始生成，不会再回溯 Workflow 描述

## 结论

排版引导问题被放在了**叙事级**（Workflow 流程描述），而其他必问项都在**规则级**（Execution Rule + Clarifying Style Requirements + 独立 reference 文件）。AI 执行的是规则清单，不是叙事描述。修复方案：至少加入 `interaction-workflow.md` 的首轮问题列表和 Execution Rule 清单。
