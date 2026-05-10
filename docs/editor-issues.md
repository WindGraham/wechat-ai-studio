# 编辑器问题清单与改进方向

> 交给接手 AI 的完整上下文

---

## 一、当前状态

基于 VvvebJs（Apache 2.0 协议）改造的微信公众号排版编辑器。

| 文件 | 路径 | 说明 |
|:---|:---|:---|
| 主文件 | `skills/wechat-article/tools/editor.html` | 3172行，当前在 git commit `9c8a709` |
| 参考原版 | `skills/wechat-article/tools/editor.html.reference` | VvvebJs 原版 2711行，只读 |
| 构建器 | `skills/wechat-article/tools/libs/builder/builder.js` | VvvebJs 核心，已做 6 处空指针修复 |
| 样式 | `skills/wechat-article/tools/css/editor.css` | VvvebJs 编译后的 SCSS，490KB |
| 后端 | `skills/wechat-article/tools/server.py` | WebSocket 终端转发 |

## 二、已实现功能

| 功能 | 状态 | 说明 |
|:---|:---|:---|
| Interact.js 拖拽 | ✅ 曾可用 | commit `9c8a709` 时工作正常 |
| 8向缩放 | ⚠️ 有问题 | 详见第四节 |
| 微信组件（10个） | ✅ | 左侧面板"📱微信排版组件"区域，点击插入 |
| 微信HTML导出 | ✅ | 375px根容器，inline-style |
| VvvebJs组件面板 | ⚠️ 部分 | Components(79)/Blocks(9)/Sections(176) 可点击插入 |
| undo/redo | ✅ | Ctrl+Z / Ctrl+Shift+Z |
| 终端面板 | ✅ | xterm.js + WebSocket，需先启动 server.py |
| 工具栏按钮 | ⚠️ 部分 | 20个按钮全部有onclick，部分功能未验证 |

## 三、未解决的问题

### 3.1 拖拽已被后续改动破坏
- commit `9c8a709` 时正常工作，后续修改（FrameDocument mock、restrictRect 移除、touch-action 添加）后失效
- `makeInteractable` 被调用，`interact` 全局可用
- 需对比 `9c8a709` 和当前版本来定位破坏性改动
- VvvebJs 的 `document.addEventListener("mousedown")` 可能拦截了 Interact.js 的指针事件

### 3.2 右侧属性面板完全空白
- Content/Style/Advanced 三个标签页显示"未选中任何元素！点选元素进行编辑"
- 根因：VvvebJs 的 `ContentManager`/`StyleManager` 通过 `Vvveb.Builder.selectedEl` 读取**iframe 内**选中元素
- 我们的 canvas 是 DOM div，`selectedEl` 未被正确指向 canvas block 内的 `<section>`
- `Vvveb.Builder.selectNode()` 尝试从 `self.frameDoc` 读取滚动位置（iframe 不存在故为 null）
- 已在 `builder.js` 第 1400 行等处加了 null 安全（`self.frameDoc?.scrollTop || 0`）

### 3.3 导航器按钮无反应
- `#tree-list` 内的方块和叉按钮使用 `data-vvveb-action="treeListRight"` 和 `data-vvveb-action="toggleTreeList"`
- 无 onclick 处理

### 3.4 自由拖拽模式按钮无反应
- `#designer-mode-btn`，`data-vvveb-action="setDesignerMode"`
- 需切换 streamMode 变量并改变 Interact.js 的拖拽限制

### 3.5 画布不能向下滚动
- `#iframe-wrapper` 无 `overflow-y: auto`
- `#block-canvas` 初始 `min-height: 800px`，超出部分不可见
- 需：wrapper 加 `overflow-y: auto; height: 100%;`，拖拽时自动延伸 canvas 并触发滚动

### 3.6 新组件出现在可视区域外
- `addBlock` 和 `insertHtmlIntoCanvas` 用 `maxBottom + 20` 定位新块
- 当画布已有很多块时，新块被放到底部，用户在顶部看不到
- 应放到当前滚动位置附近

### 3.7 Google Fonts 404
- `plugin-google-fonts.js` 请求 `/resources/google-fonts.json`
- 已创建空 JSON mock：`tools/resources/google-fonts.json`，但 mock 在 plugin 执行之后才加载
- 解决：在 editor.html 的 `<head>` 中提前加载 mock，或删除 plugin 引用

### 3.8 左侧"新建页"旁边的加号行为
- 点击只加了一个文本框——需确认是 VvvebJs 原有行为还是 bug

## 四、组件缩放详细问题

### 4.1 缩小可用，放大不生效
- Interact.js 的 `resizable` 配置正确（8个方向）
- 但 `resizeMoveListener` 中宽度根据 `event.deltaRect.width` 变化
- **放大时**：`event.deltaRect.width` 可能被 VvvebJs 或父容器约束为 0
- 缩小生效是因为 delta 为负，Interact.js 默认不限制缩小

### 4.2 纵向调节几乎无效
- 调节高度时，高度跟着宽度变化，不是独立的
- `resizeMoveListener` 同时调整 width 和 height，但没有保持宽高比
- 需改为：从角落拖拽时**按原始宽高比等比缩放**

### 4.3 需要的修复
```
从角部拖拽 → 等比缩放 (保持原始宽高比)
从边拖拽   → 单向调整 (宽或高独立变化)
放大上限   → 不超过 375px 宽度；高度无限制
缩小时     → 文字不溢出，内容不剪切
```

## 五、与"可画"类排版工具的功能差距

### 5.1 参考项目
- **Canva（可画）**：商业软件，自由画布排版，设计模板库
- **open-design**（`clawnify/open-design`）：开源 Canva 替代，Fabric.js + Preact
- **Monet**（`pj-casey/Monet`）：开源 Canva 替代
- **Fabric.js**：Canvas 渲染库，28k stars，自由拖拽 + 旋转 + 缩放 + 滤镜

### 5.2 我们缺少的能力

| 能力 | 可画 | 我们 |
|:---|:---|:---|
| **自由旋转** | ✅ | ❌ |
| **吸附对齐**（智能参考线） | ✅ | ❌ |
| **多选**（框选/Shift点选） | ✅ | ❌ |
| **图层管理**（z-index面板） | ✅ | ❌ (有tree-list但不工作) |
| **颜色调色板**（预设色板） | ✅ Coloris | ❌ 未接入 |
| **字体选择**（Google Fonts） | ✅ | ❌ 404 |
| **组件属性面板**（详细的样式编辑） | ✅ | ❌ 完全空白 |
| **等比缩放**（保持宽高比） | ✅ | ❌ |
| **模板市场** | ✅ | 🔄 ModeHub 待建 |
| **元素层级**（上移一层/下移一层/置顶/置底） | ✅ | ❌ |
| **复制/粘贴元素** | ✅ | ❌ |
| **网格/标尺** | ✅ | ❌ |
| **撤销历史面板**（可视化） | ✅ | ❌ |

### 5.3 为何 Fabric.js 不适合直接替换
Fabric.js 基于 Canvas 渲染，输出 SVG/Canvas 位图，无法直接产生微信需要的 inline-style HTML 文本。我们的编辑器必须用 DOM 渲染（`<section>` 标签），才能导出微信兼容 HTML。因此**不能用 Fabric.js 替换渲染层**，但可以：
- 借鉴它的交互模式（旋转、吸附对齐、等比缩放）
- 用 Interact.js 在 DOM 上实现同等交互

## 六、技术架构说明（供接手AI参考）

### 6.1 核心组件关系
```
editor.html (3172行)
  ├── <head>: Interact.js CDN + xterm.js CDN + 自定义CSS
  ├── VvvebJs UI (保留原样):
  │   ├── #top-panel (工具栏)
  │   ├── #add-section-box (左侧 Components/Blocks/Sections/微信组件)
  │   ├── #iframe-wrapper → #block-canvas (替换了 <iframe>)
  │   ├── #right-panel (Content/Style/Advanced)
  │   └── #tree-list (导航器)
  └── <script> (末尾):
      ├── WeChat TEMPLATES (10个组件HTML)
      ├── addBlock / insertHtmlIntoCanvas
      ├── makeInteractable / dragMoveListener / resizeMoveListener
      ├── selectBlock / undo / redo / exportWechatHTML
      ├── Vvveb.Builder.addElement 补丁 (重定向到canvas)
      └── VvvebJs点击插入补丁 (Component registry lookup)
```

### 6.2 关键变量
- `selectedBlock` — 当前选中的 canvas block（DOM 元素）
- `undoStack` / `redoStack` — 撤销历史（canvas.innerHTML 快照）
- `streamMode` — 流式/自由模式
- `blockIdCounter` / `blockCounter` — 两个计数器，需统一
- `Vvveb.Builder.selectedEl` — VvvebJs 的选中元素（需指向 block 内 section）
- `window.FrameDocument` — VvvebJs 的 iframe document mock

### 6.3 修复优先级建议
1. **恢复拖拽** — 最高优先，回到 `9c8a709` 状态
2. **修复缩放** — 等比缩放 + 纵向独立调节
3. **右侧属性面板** — 绑定 `selectedEl` 到 canvas block
4. **画布滚动** — wrapper overflow-y + 自动延伸
5. **导航器/模式按钮** — 添加 onclick
6. **Google Fonts** — 删除或 mock
7. **多选/框选/图层** — 对标可画

## 七、启动方式

```bash
cd /home/graham/Projects/wechat-ai-publisher/skills/wechat-article/tools
python3 -m http.server 8092
# 浏览器打开 http://127.0.0.1:8092/editor.html
```

启动终端后端：
```bash
pip install websockets --break-system-packages
python /home/graham/Projects/wechat-ai-publisher/skills/wechat-article/tools/server.py
```
