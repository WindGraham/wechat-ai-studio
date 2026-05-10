# 开源库复用分析

## 拖拽引擎

### Interact.js（选择使用）
| 指标 | 值 |
|:---|:---|
| 仓库 | taye/interact.js |
| Stars | 12k+ |
| 协议 | MIT |
| 技术栈 | 纯 JS |
| 依赖 | 0 |

**复用方式**：完整引入（CDN），作为编辑器核心拖拽引擎。

**原因**：
- 直接操作 DOM 元素，拖的就是 `<section>` 标签
- 自由拖动（绝对定位）、8 向缩放、旋转、吸附对齐、手势
- 零依赖，加载即用
- 导出的 DOM 直接序列化为 HTML

## 属性面板

### VvvebJs inputs.js（部分移植）

| 指标 | 值 |
|:---|:---|
| 仓库 | givanz/VvvebJs |
| Stars | 8.5k |
| 协议 | Apache 2.0 |
| 文件 | `libs/builder/inputs.js` (925行) |

**复用方式**：移植以下控件到编辑器：

| 控件 | 用途 | 微信安全 |
|:---|:---|:---|
| colorPicker | 颜色选择器 | ✅ |
| fontSize | 字号下拉 | ✅ |
| lineHeight | 行高滑块 | ✅ |
| textAlign | 对齐选择 | ✅ |
| spacing (margin/padding) | 四向间距 | ✅ |
| borderRadius | 圆角输入 | ✅ |
| borderStyle | 边框选择（线型、颜色、宽度） | ✅ |
| boxShadow | 阴影控件 | ✅ |
| backgroundImage | 背景图选择 | ✅ |
| opacity | 透明度滑条 | ✅ |

**不移植的控件**（微信不支持）：
| 控件 | 原因 |
|:---|:---|
| animation/transition | 微信过滤 |
| filter | 不支持 |
| fontFamily | 微信覆盖 |
| display | 导出时硬转 inline-block |
| position | 导出时硬转文档流 |

## 终端面板

### xterm.js（选择使用）

| 指标 | 值 |
|:---|:---|
| 仓库 | xtermjs/xterm.js |
| Stars | 18k+ |
| 协议 | MIT |
| 技术栈 | TS |

**复用方式**：完整引入（CDN），作为内置终端渲染引擎。

**后端**：Python `websockets` 库，启动 opencode 进程，pipe stdin/stdout 到 WebSocket。

## 排版参考（不直接复用）

### GrapesJS

**不引入**但参考其：
- 左侧组件面板的折叠分类 UI
- 组件拖入画布的交互流程

### react-email-editor (Unlayer)

**不引入**（依赖云服务），参考其：
- 流式模式的上下调序交互
- 预览/编辑两栏布局

## 最终集成清单

```
编辑器 (一个 HTML 文件)
  ├── interact.min.js          ← CDN 引入，拖拽引擎
  ├── xterm.js + xterm.css     ← CDN 引入，终端渲染
  ├── inputs.js + inputs.css   ← 从 VvvebJs 移植，属性面板控件
  └── editor.js                ← 你自己写的：
        ├── 画布管理（加载/渲染/保存 HTML）
        ├── 模式切换（流式/自由）
        ├── 组件面板（从 ModeHub catalog.json 加载）
        ├── 导出转换（DOM → 微信 HTML）
        ├── 分组/解组
        ├── undo/redo
        └── WebSocket 连接（转发终端）

后端 (一个 Python 文件)
  └── server.py                ← WebSocket 服务：
        ├── 管理 opencode 进程
        ├── stdin/stdout 透传
        └── 检测 article.html 变化通知前端
```

总计引入 2 个 CDN 脚本 + 移植 1 组控件，其余均为自有代码。
