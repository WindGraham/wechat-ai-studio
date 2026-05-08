# Visual Layout Composer Workflow (Draft)

> 本工作流为 `wechat-article` skill 的可选交互增强。用户通过在浏览器画布中拖拽基础矩形组件来表达排版意图，AI 读取空间数据后拟合为微信安全的 HTML。
> **状态**：实验性 / 未合并入主 SKILL.md

---

## 1. 工作流定位

### 解决的问题
- AI 自行堆叠多组件排版时效果不稳定
- 用户用自然语言描述空间布局存在歧义
- "左上图 + 右下图文穿插 + 底部标签压边界" 这类意图难以精确表达

### 核心原则
> **拖拽器只输出「空间意图参考」，不是像素级还原方案。**
> AI 的任务是：识别空间关系 → 选择微信安全的布局模式 → 用内联样式近似实现。

---

## 2. 用户交互流程

```
[用户打开 layout-composer.html]
    ↓
[从左侧面板拖拽 5 种基础矩形到 375px 画布]
    ↓
[拖动组件中心 = 移动位置]
[拖动组件边框/角部 = 8 方向缩放]
    ↓
[点击「💾 保存到项目」]
    ↓
[AI 自动读取 layout-draft.json]
    ↓
[AI 拟合为微信 HTML]
```

### 2.1 组件类型（5 种基础矩形）

| 类型 | 默认尺寸 | 空间语义 | 典型拟合 |
|:---|:---|:---|:---|
| `hero` | 345×160 | 顶部标题/头图区 | Header Block（深色背景 + 居中标题） |
| `card` | 345×240 | 大背景卡片/内容容器 | 米色/浅色 wrapper section |
| `image` | 345×200 | 图片占位 | 带白色边框的图片块 |
| `small` | 160×100 | 小标签/装饰/头像 | 圆角色块标签、品牌标识 |
| `line` | 200×6 | 分割线/间距 | 虚线/实线/装饰分隔 |

### 2.2 画布特性

- **宽度**：固定 375px（模拟 iPhone 标准宽度）
- **高度**：任意长，自动扩展（组件拖到底部附近时画布增高）
- **保存时**：只保存有内容的区域高度（`maxY + 50px`），不输出空白尾部

---

## 3. AI 拟合策略

### 3.1 空间关系识别（从 JSON 推导）

AI 读取 `layout-draft.json` 后，提取三类空间关系：

#### A. 上下相邻（Adjacent）
```
水平重叠 > 0 且垂直间距 gap ∈ [-20, 30] px
```
→ 推断为**正常文档流中的连续区块**。

#### B. 左右并排（Side-by-Side）
```
|centerY(a) - centerY(b)| < 40px 且 width(a) + width(b) ≤ 365px
```
→ 推断为**inline-block 双栏布局**（总宽 ≤ 92%）。

#### C. 层叠重叠（Overlap）
```
水平重叠 > 0 且 verticalGap < -10px
```
→ 推断为**负 margin 叠加效果**。

### 3.2 "压住一半" 效果实现（Critical）

这是用户最常表达的层叠意图，但在微信编辑器中极易做错。

#### ❌ 错误做法（必然导致文字与图片重叠）
```html
<!-- 背景容器内塞满文字，再用负 margin 插图片 -->
<section style="background: rgb(250,248,245); padding: 30px;">
  <p>正文...</p>          <!-- 文字在这里 -->
</section>
<section style="margin-top: -100px;">
  <img ...>               <!-- 图片上来覆盖文字 -->
</section>
```

#### ✅ 正确做法（文档流顺序 + 负 margin 覆盖）
```html
<!-- 1. 前景元素先出现在文档流中 -->
<section style="padding: 0 28px;">
  <img src="..." style="width: 36%; ...">
</section>

<!-- 2. 背景容器后用负 margin 向上移动，覆盖前景底部 -->
<section style="background: rgb(250,248,245); margin-top: -70px; padding: 90px 20px 45px;">
  <p>正文...</p>          <!-- 文字在背景容器内部，不会和前景重叠 -->
</section>
```

**关键规则**：
1. **前景元素（图片/标签）先出现**在文档流中
2. **背景容器后出现**，用 `margin-top: -Npx` 向上覆盖前景的底部
3. **背景容器的 `padding-top` 必须给前景的露出部分留出足够空间**
4. **所有文字内容放在背景容器内部**，从安全区域开始

#### 边界层叠 vs 内部层叠

| 层叠位置 | 可行性 | 实现方式 |
|:---|:---|:---|
| **顶部边界**（图片压在背景顶部） | ✅ 推荐 | 图片先出现 → 背景容器 `margin-top: -N` 覆盖底部 |
| **底部边界**（标签压在背景底部） | ✅ 推荐 | 背景容器先结束 → 标签 `margin-top: -N` 骑在边界上 |
| **区域中间**（图片压在背景中段） | ⚠️ 困难 | 需要背景容器分段，或文字绕排，微信中容易打架 |

**结论**：鼓励用户在拖拽器中把层叠关系表达在**背景容器的边界处**（顶部或底部），避免在中间区域做复杂层叠。

### 3.3 拟合决策树

```
用户布局 JSON
    ↓
[识别最大面积组件] → 通常为背景容器（card/hero）
    ↓
[识别边界层叠]
    ├─ 顶部有组件压在背景上？ → 前景先出现，背景负 margin 覆盖
    ├─ 底部有组件压在背景上？ → 标签在背景后，负 margin 骑边界
    └─ 无边界层叠？ → 正常文档流堆叠
    ↓
[识别内部元素]
    ├─ 左右并排？ → inline-block 双栏（总宽 ≤ 92%）
    ├─ 对角线分布？ → 左上图 + 右下图 + 中间文字穿插
    └─ 单一元素？ → 根据位置选择对齐方式
    ↓
[生成 HTML] → 使用内联样式、375px 根容器、微信安全标签
```

---

## 4. 交互与数据结构

### 4.1 生成的 JSON 结构

```json
{
  "canvas": { "width": 375, "height": 820 },
  "componentCount": 5,
  "components": [
    {
      "id": "c1",
      "type": "hero",
      "bounds": { "x": 15, "y": 30, "width": 345, "height": 120 },
      "center": { "x": 187.5, "y": 90 },
      "area": 41400,
      "zIndex": 1
    }
  ],
  "spatialHints": [
    {
      "type": "overlap",
      "top": "c2",
      "bottom": "c1",
      "overlapPixels": 60,
      "note": "重叠 60px，推断为负边距叠加效果"
    }
  ]
}
```

### 4.2 保存机制

- 前端点击「保存到项目」→ `fetch POST` 到 `localhost:8081/save-layout`
- 后端接收并写入 `layout-draft.json`
- AI 直接读取该文件进行拟合

---

## 5. 与主 Skill 的集成点（未来）

### 可选触发时机
在 `references/interaction-workflow.md` 的第一轮风格确认之后，增加一个可选分支：

```
用户确认风格偏好
    ↓
[询问] "是否需要进入可视化拖拽排版？"
    ├─ 是 → 打开 layout-composer.html
    │         用户拖拽保存 → AI 拟合 HTML
    └─ 否 → 继续现有文字描述工作流
```

### 不替代现有工作流
- 拖拽器是**增强选项**，不是强制步骤
- 对于简单文章（纯文字、单图），仍可直接文字描述
- 对于复杂图文穿插、层叠、杂志风排版，推荐先拖拽

---

## 6. 已知限制

1. **组件粒度粗**：只有 5 种基础矩形，无法表达圆角、阴影、渐变等细节。这些由 AI 根据类型和上下文推断。
2. **无文字内容输入**：拖拽器只表达空间，文字内容由 AI 根据用户提供的文章素材填充。
3. **层叠仅限边界**：中间区域的复杂层叠在微信编辑器中难以优雅实现，可能退化为普通相邻布局。
4. **PC 端预览偏差**：375px 画布模拟手机宽度，但在 PC 微信客户端中实际渲染可能存在细微差异，最终需以 WeChat 编辑器为准。

---

## 7. 文件清单

| 文件 | 用途 |
|:---|:---|
| `wechat-article/tools/layout-composer.html` | 浏览器端拖拽编辑器 |
| `save-layout-server.py` | 本地接收服务器（port 8081） |
| `layout-draft.json` | 导出的布局数据（由服务器写入） |
| `references/visual-layout-workflow.md` | 本工作流文档（此文件） |

---

## 附录 A：前端源码（`layout-composer.html`）

合并到 skill 时，以下代码直接作为 `wechat-article/tools/layout-composer.html` 写入。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WeChat Layout Composer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #1a1a2e;
    color: #eee;
    height: 100vh;
    display: flex;
    overflow: hidden;
  }

  /* 左侧面板 */
  .sidebar {
    width: 220px;
    background: #16213e;
    border-right: 1px solid #0f3460;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 12px;
    flex-shrink: 0;
  }
  .sidebar h2 {
    font-size: 14px;
    color: #e94560;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .component-source {
    background: #0f3460;
    border: 2px dashed #533483;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    cursor: grab;
    transition: all 0.2s;
    font-size: 12px;
    color: #ccc;
  }
  .component-source:hover {
    background: #1a1a40;
    border-color: #e94560;
    color: #fff;
  }
  .component-source:active { cursor: grabbing; }

  .shape-hero   { width: 100%; height: 50px; background: #e94560; border-radius: 6px; margin: 0 auto 8px; }
  .shape-card   { width: 80%; height: 40px; background: #0f3460; border-radius: 6px; margin: 0 auto 8px; border: 2px solid #533483; }
  .shape-image  { width: 60%; height: 40px; background: #533483; border-radius: 4px; margin: 0 auto 8px; }
  .shape-small  { width: 40%; height: 30px; background: #16213e; border-radius: 4px; margin: 0 auto 8px; border: 1px solid #e94560; }
  .shape-line   { width: 70%; height: 6px; background: #533483; border-radius: 3px; margin: 12px auto; }

  .btn {
    background: #e94560;
    color: #fff;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
  }
  .btn:hover { background: #ff6b81; }
  .btn-secondary {
    background: #0f3460;
  }
  .btn-secondary:hover { background: #16213e; }

  .hint {
    font-size: 11px;
    color: #888;
    line-height: 1.6;
    margin-top: 10px;
  }

  /* 中间画布区 */
  .canvas-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    overflow: auto;
  }

  .phone-frame {
    width: 415px;
    background: #000;
    border-radius: 40px;
    padding: 15px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    flex-shrink: 0;
  }
  .phone-screen {
    width: 375px;
    min-height: 500px;
    background: #fff;
    border-radius: 30px;
    position: relative;
    overflow: visible;
    background-image: radial-gradient(#e8e8e8 1px, transparent 1px);
    background-size: 20px 20px;
  }

  /* 画布内的组件 */
  .layout-component {
    position: absolute;
    cursor: move;
    border: 2px solid transparent;
    transition: box-shadow 0.15s;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: rgba(255,255,255,0.8);
    overflow: hidden;
  }
  .layout-component:hover {
    box-shadow: inset 0 0 0 2px rgba(233,69,96,0.4);
  }
  .layout-component.selected {
    box-shadow: inset 0 0 0 3px rgba(233,69,96,0.7);
    z-index: 1000 !important;
  }

  /* 删除按钮 */
  .delete-btn {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background: #ff4444;
    color: #fff;
    border-radius: 50%;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    z-index: 1001;
  }
  .layout-component.selected .delete-btn { display: flex; }

  /* 方向指示（仅在选中时显示） */
  .resize-indicator {
    position: absolute;
    background: rgba(233,69,96,0.0);
    pointer-events: none;
    transition: background 0.1s;
  }
  .layout-component:hover .resize-indicator,
  .layout-component.selected .resize-indicator {
    background: rgba(233,69,96,0.15);
  }
  .ri-n  { top: 0; left: 30px; right: 30px; height: 30px; cursor: ns-resize; }
  .ri-s  { bottom: 0; left: 30px; right: 30px; height: 30px; cursor: ns-resize; }
  .ri-w  { left: 0; top: 30px; bottom: 30px; width: 30px; cursor: ew-resize; }
  .ri-e  { right: 0; top: 30px; bottom: 30px; width: 30px; cursor: ew-resize; }
  .ri-nw { top: 0; left: 0; width: 30px; height: 30px; cursor: nwse-resize; }
  .ri-ne { top: 0; right: 0; width: 30px; height: 30px; cursor: nesw-resize; }
  .ri-sw { bottom: 0; left: 0; width: 30px; height: 30px; cursor: nesw-resize; }
  .ri-se { bottom: 0; right: 0; width: 30px; height: 30px; cursor: nwse-resize; }

  .bg-hero   { background: rgba(233, 69, 96, 0.85); }
  .bg-card   { background: rgba(83, 52, 131, 0.85); }
  .bg-image  { background: rgba(15, 52, 96, 0.85); }
  .bg-small  { background: rgba(22, 33, 62, 0.85); }
  .bg-line   { background: rgba(100, 100, 100, 0.6); }

  .label-overlay {
    pointer-events: none;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  }

  .status-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 28px;
    background: rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #999;
    z-index: 5;
    pointer-events: none;
  }

  .export-panel {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #16213e;
    border: 1px solid #0f3460;
    border-radius: 12px;
    padding: 16px;
    max-width: 420px;
    max-height: 300px;
    overflow: auto;
    font-family: "SF Mono", Monaco, monospace;
    font-size: 11px;
    display: none;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    z-index: 9999;
  }
  .export-panel.active { display: block; }
  .export-panel pre { color: #a6e22e; white-space: pre-wrap; word-break: break-all; }
  .export-panel .close-btn {
    position: absolute;
    top: 8px;
    right: 12px;
    cursor: pointer;
    color: #e94560;
    font-size: 14px;
  }
</style>
</head>
<body>

<div class="sidebar">
  <h2>拖拽组件</h2>

  <div class="component-source" draggable="true" data-type="hero" data-w="345" data-h="160">
    <div class="shape-hero"></div>
    大图/标题区
  </div>

  <div class="component-source" draggable="true" data-type="card" data-w="345" data-h="240">
    <div class="shape-card"></div>
    内容卡片
  </div>

  <div class="component-source" draggable="true" data-type="image" data-w="345" data-h="200">
    <div class="shape-image"></div>
    图片块
  </div>

  <div class="component-source" draggable="true" data-type="small" data-w="160" data-h="100">
    <div class="shape-small"></div>
    小组件
  </div>

  <div class="component-source" draggable="true" data-type="line" data-w="200" data-h="6">
    <div class="shape-line"></div>
    分割线
  </div>

  <div class="hint">
    拖组件到画布<br>
    点击中心 = 移动<br>
    点击边框/角 = 缩放<br>
    角部识别 30px<br>
    Delete 删除<br>
    组件表示空间占位
  </div>

  <button class="btn" onclick="exportLayout()">导出 JSON</button>
  <button class="btn" onclick="saveToProject()">保存到项目</button>
  <button class="btn btn-secondary" onclick="clearCanvas()">清空画布</button>
</div>

<div class="canvas-area">
  <div class="phone-frame">
    <div class="phone-screen" id="canvas">
      <div class="status-bar">375px · WeChat Article Canvas</div>
    </div>
  </div>
</div>

<div class="export-panel" id="exportPanel">
  <span class="close-btn" onclick="document.getElementById('exportPanel').classList.remove('active')">✕</span>
  <pre id="exportContent"></pre>
</div>

<script>
const canvas = document.getElementById('canvas');
let selectedEl = null;
let dragTarget = null;
let resizeTarget = null;
let resizeDir = '';
let dragOffsetX = 0, dragOffsetY = 0;
let resizeStartX = 0, resizeStartY = 0, resizeStartW = 0, resizeStartH = 0, resizeStartL = 0, resizeStartT = 0;
let componentCounter = 0;
const CORNER_SIZE = 30;
const EDGE_SIZE = 15;
const CANVAS_WIDTH = 375;

function ensureCanvasHeight() {
  const maxY = getMaxY();
  const needed = Math.max(500, maxY + 100);
  if (needed > canvas.clientHeight) {
    canvas.style.minHeight = needed + 'px';
  }
}

document.querySelectorAll('.component-source').forEach(src => {
  src.addEventListener('dragstart', e => {
    e.dataTransfer.setData('type', src.dataset.type);
    e.dataTransfer.setData('w', src.dataset.w);
    e.dataTransfer.setData('h', src.dataset.h);
  });
});

canvas.addEventListener('dragover', e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

canvas.addEventListener('drop', e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('type');
  const w = parseInt(e.dataTransfer.getData('w'));
  const h = parseInt(e.dataTransfer.getData('h'));
  if (!type) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - w/2;
  const y = e.clientY - rect.top - h/2;
  createComponent(type, x, y, w, h);
});

function createComponent(type, x, y, w, h) {
  const el = document.createElement('div');
  el.className = `layout-component bg-${type}`;
  el.dataset.type = type;
  el.dataset.id = `c${++componentCounter}`;
  el.style.left = `${Math.max(0, Math.min(CANVAS_WIDTH - w, x))}px`;
  el.style.top = `${Math.max(28, y)}px`;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.zIndex = componentCounter;

  const label = document.createElement('span');
  label.className = 'label-overlay';
  label.textContent = typeLabel(type);
  el.appendChild(label);

  const dirs = ['n','s','w','e','nw','ne','sw','se'];
  dirs.forEach(d => {
    const ind = document.createElement('div');
    ind.className = `resize-indicator ri-${d}`;
    el.appendChild(ind);
  });

  const del = document.createElement('div');
  del.className = 'delete-btn';
  del.innerHTML = '×';
  del.onclick = e => { e.stopPropagation(); el.remove(); selectedEl = null; ensureCanvasHeight(); };
  el.appendChild(del);

  canvas.appendChild(el);
  selectComponent(el);
  ensureCanvasHeight();
}

function typeLabel(t) {
  return { hero: '标题/大图', card: '卡片', image: '图片', small: '小组件', line: '分割线' }[t] || t;
}

function selectComponent(el) {
  if (selectedEl) selectedEl.classList.remove('selected');
  selectedEl = el;
  if (el) el.classList.add('selected');
}

function getMouseAction(el, mx, my) {
  const rect = el.getBoundingClientRect();
  const dx = mx - rect.left;
  const dy = my - rect.top;
  const w = rect.width;
  const h = rect.height;

  if (dx < CORNER_SIZE && dy < CORNER_SIZE) return { action: 'resize', dir: 'nw' };
  if (dx > w - CORNER_SIZE && dy < CORNER_SIZE) return { action: 'resize', dir: 'ne' };
  if (dx < CORNER_SIZE && dy > h - CORNER_SIZE) return { action: 'resize', dir: 'sw' };
  if (dx > w - CORNER_SIZE && dy > h - CORNER_SIZE) return { action: 'resize', dir: 'se' };

  if (dy < EDGE_SIZE) return { action: 'resize', dir: 'n' };
  if (dy > h - EDGE_SIZE) return { action: 'resize', dir: 's' };
  if (dx < EDGE_SIZE) return { action: 'resize', dir: 'w' };
  if (dx > w - EDGE_SIZE) return { action: 'resize', dir: 'e' };

  return { action: 'move' };
}

canvas.addEventListener('mousedown', e => {
  const comp = e.target.closest('.layout-component');
  if (!comp) { selectComponent(null); return; }
  e.stopPropagation();
  selectComponent(comp);
  const actionInfo = getMouseAction(comp, e.clientX, e.clientY);

  if (actionInfo.action === 'resize') {
    resizeTarget = comp;
    resizeDir = actionInfo.dir;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartW = parseInt(comp.style.width);
    resizeStartH = parseInt(comp.style.height);
    resizeStartL = parseInt(comp.style.left);
    resizeStartT = parseInt(comp.style.top);
  } else {
    dragTarget = comp;
    dragOffsetX = e.clientX - comp.offsetLeft;
    dragOffsetY = e.clientY - comp.offsetTop;
  }
});

document.addEventListener('mousemove', e => {
  if (dragTarget) {
    const rect = canvas.getBoundingClientRect();
    let nx = e.clientX - dragOffsetX;
    let ny = e.clientY - dragOffsetY;
    const w = parseInt(dragTarget.style.width);
    const h = parseInt(dragTarget.style.height);
    nx = Math.max(0, Math.min(CANVAS_WIDTH - w, nx));
    ny = Math.max(28, ny);
    dragTarget.style.left = `${nx}px`;
    dragTarget.style.top = `${ny}px`;
    ensureCanvasHeight();
  }

  if (resizeTarget) {
    const dx = e.clientX - resizeStartX;
    const dy = e.clientY - resizeStartY;
    let newW = resizeStartW;
    let newH = resizeStartH;
    let newL = resizeStartL;
    let newT = resizeStartT;

    const dir = resizeDir;
    if (dir.includes('e')) {
      newW = Math.max(30, Math.min(CANVAS_WIDTH - resizeStartL, resizeStartW + dx));
    }
    if (dir.includes('w')) {
      const candidateW = resizeStartW - dx;
      if (candidateW >= 30 && resizeStartL + dx >= 0) {
        newW = candidateW;
        newL = resizeStartL + dx;
      }
    }
    if (dir.includes('s')) {
      newH = Math.max(20, resizeStartH + dy);
    }
    if (dir.includes('n')) {
      const candidateH = resizeStartH - dy;
      if (candidateH >= 20 && resizeStartT + dy >= 28) {
        newH = candidateH;
        newT = resizeStartT + dy;
      }
    }

    resizeTarget.style.width = `${newW}px`;
    resizeTarget.style.height = `${newH}px`;
    resizeTarget.style.left = `${newL}px`;
    resizeTarget.style.top = `${newT}px`;
    ensureCanvasHeight();
  }
});

document.addEventListener('mouseup', () => {
  dragTarget = null;
  resizeTarget = null;
  resizeDir = '';
});

document.addEventListener('keydown', e => {
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEl) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    selectedEl.remove();
    selectedEl = null;
    ensureCanvasHeight();
  }
});

function collectLayout() {
  const components = [];
  canvas.querySelectorAll('.layout-component').forEach(el => {
    components.push({
      id: el.dataset.id,
      type: el.dataset.type,
      bounds: {
        x: parseInt(el.style.left),
        y: parseInt(el.style.top),
        width: parseInt(el.style.width),
        height: parseInt(el.style.height)
      },
      center: {
        x: parseInt(el.style.left) + parseInt(el.style.width)/2,
        y: parseInt(el.style.top) + parseInt(el.style.height)/2
      },
      area: parseInt(el.style.width) * parseInt(el.style.height),
      zIndex: parseInt(el.style.zIndex || 0)
    });
  });
  components.sort((a, b) => a.bounds.y - b.bounds.y);

  const contentBottom = getMaxY();
  const canvasHeight = Math.max(500, contentBottom + 50);

  return {
    canvas: { width: CANVAS_WIDTH, height: canvasHeight },
    componentCount: components.length,
    components: components,
    spatialHints: generateSpatialHints(components)
  };
}

function getMaxY() {
  let max = 0;
  canvas.querySelectorAll('.layout-component').forEach(el => {
    max = Math.max(max, parseInt(el.style.top) + parseInt(el.style.height));
  });
  return max;
}

function exportLayout() {
  const layout = collectLayout();
  const panel = document.getElementById('exportPanel');
  document.getElementById('exportContent').textContent = JSON.stringify(layout, null, 2);
  panel.classList.add('active');
}

function saveToProject() {
  const layout = collectLayout();
  fetch('http://localhost:8081/save-layout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(layout)
  })
  .then(r => r.json())
  .then(data => {
    alert('布局已保存！AI 现在可以直接读取 layout-draft.json');
  })
  .catch(err => {
    alert('保存失败，请确认接收服务器已启动\n' + err);
  });
}

function generateSpatialHints(components) {
  const hints = [];
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const a = components[i], b = components[j];
      const horizontalOverlap = !(a.bounds.x + a.bounds.width < b.bounds.x || b.bounds.x + b.bounds.width < a.bounds.x);
      const verticalGap = b.bounds.y - (a.bounds.y + a.bounds.height);

      if (horizontalOverlap && verticalGap >= -20 && verticalGap < 30) {
        hints.push({
          type: 'adjacent',
          from: a.id,
          to: b.id,
          gap: verticalGap,
          note: `${a.id} 与 ${b.id} 上下紧密相邻（gap=${verticalGap}px），视为文档流中的连续区块`
        });
      }
      if (Math.abs(a.center.y - b.center.y) < 40 && (a.bounds.width + b.bounds.width) <= 365) {
        hints.push({
          type: 'side-by-side',
          left: a.bounds.x < b.bounds.x ? a.id : b.id,
          right: a.bounds.x < b.bounds.x ? b.id : a.id,
          note: `左右并排布局，推断为双栏`
        });
      }
      if (horizontalOverlap && verticalGap < -10) {
        hints.push({
          type: 'overlap',
          top: a.bounds.y < b.bounds.y ? a.id : b.id,
          bottom: a.bounds.y < b.bounds.y ? b.id : a.id,
          overlapPixels: Math.abs(verticalGap),
          note: `重叠 ${Math.abs(verticalGap)}px，推断为负边距叠加效果`
        });
      }
    }
  }
  return hints;
}

function clearCanvas() {
  if (!confirm('确定清空画布？')) return;
  canvas.querySelectorAll('.layout-component').forEach(el => el.remove());
  selectedEl = null;
  componentCounter = 0;
  canvas.style.minHeight = '500px';
}
</script>

</body>
</html>
```

---

## 附录 B：后端源码（`save-layout-server.py`）

合并到 skill 时，以下代码直接作为 `save-layout-server.py` 写入项目根目录。

```python
#!/usr/bin/env python3
"""Mini CORS-enabled HTTP server to receive layout JSON from the composer."""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

SAVE_PATH = "layout-draft.json"

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len).decode("utf-8")
        data = json.loads(body)
        with open(SAVE_PATH, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"saved": True, "path": SAVE_PATH}).encode())
        print(f"Layout saved to {SAVE_PATH} ({len(data.get('components', []))} components)")

    def log_message(self, fmt, *args):
        pass

if __name__ == "__main__":
    server = HTTPServer(("localhost", 8081), Handler)
    print(f"Layout receiver running at http://localhost:8081")
    print(f"Will save to: {SAVE_PATH}")
    server.serve_forever()
```
