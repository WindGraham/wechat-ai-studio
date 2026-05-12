# Workbench HTML 规范 v2.0

本文档定义 Workbench 统一 HTML 格式，满足：
1. AI 稳定生成 → 编辑器解析 → 自由画布编辑 → 文档流编辑 → 微信 HTML 导出
2. 秀米模板 HTML 可无损导入，所有 `<section>` 均可识别为组件
3. 约束足够强使 AI 不跑偏，表达力足够覆盖 500 份秀米模板

---

## 1. 核心原则

1. **`<section>` 是唯一块级容器** — 不用 `<div>`、不用 `<h1>`-`<h6>`
2. **`<cell>` 是内容单元** — `display:inline-block` + `vertical-align:top` 的 section
3. **组合即布局** — `flex-row`/`flex-col`/`grid-overlay` 包 `cell` 形成版式
4. **语义组件 = 预配置 cell** — `title`/`text`/`image`/`card` 是带默认样式的 cell
5. **`data-wb-type` 标记身份** — 每个 section 必须有类型标记
6. **`style` 存精确值** — inline style 是唯一渲染源
7. **style 完整保留** — 导出微信 HTML 只去掉 `data-wb-*`，不改 style
8. **文档流默认** — 自上而下排版；自由画布用 `position:absolute`

---

## 2. 标签白名单

| 标签 | 用途 |
|------|------|
| `<section>` | 所有结构容器和内容块 |
| `<p>` | 文本段落 |
| `<img>` | 图片 |
| `<span>` | 内联文本片段 |
| `<strong>` / `<b>` | 加粗 |
| `<em>` / `<i>` | 斜体 |
| `<br>` | 换行 |

禁用：`<div>`, `<h1>-<h6>`, `<header>`, `<footer>`, `<article>`, `<a>`, `<svg>`, `<foreignObject>`, `<animate>`, `<animateTransform>`

---

## 3. 全局结构

```html
<body style="margin:0; padding:0; background:#fff;">
<section data-wb-root="1" data-wb-version="2.0"
  style="width:100%; max-width:375px; margin:0 auto;
         box-sizing:border-box; font-family:-apple-system,sans-serif;
         color:#333; font-size:15px; line-height:1.75;">

  <!-- 组件 -->

</section>
</body>
```

- 根 section 固定 375px 宽度
- 文档流: 子组件按声明顺序垂直排列
- 自由画布: 根加 `data-wb-mode="canvas"`，子组件用 `position:absolute`

---

## 4. 组件体系

### 4.0 概念框架

所有组件都是 `<section>`。分为三层：

```
容器层 (layout containers)
  ├── flex-row    水平弹性行
  ├── flex-col    垂直弹性列
  └── grid-overlay 网格叠加层

单元层 (cells) ── 布局的基本粒子
  └── cell         inline-block 块

语义层 (semantic) ── 预配置的 cell + 内容
  ├── title / text / image / images
  ├── card / divider / badge
  └── spacer / background

穿透层 (passthrough)
  └── group        纯结构包装，无视觉样式
```

**cell 是核心**。任何一个 `display:inline-block; vertical-align:top` 的 section 都是 cell。它的角色由内容和样式决定：

| cell 内容 + 样式 | 等价语义类型 |
|-----------------|------------|
| 含 `<p>` + `font-size≥18px` | `title` |
| 含 `<p>` + `font-size<18px` | `text` |
| 含 `<img>` | `image` |
| 含 `bg-color` + `border-radius` + `padding` + 子组件 | `card` |
| `height≤10px` + `bg-color` | `divider` |
| `border-radius:999px` | `badge` |

---

### 4.1 组件类型总览

| type | 分类 | 文档流 | 自由画布 | 可嵌套 |
|------|------|--------|---------|--------|
| `flex-row` | 容器 | ✅ | ✅ | cell |
| `flex-col` | 容器 | ✅ | ✅ | 任意 |
| `grid-overlay` | 容器 | — | ✅ | cell |
| `cell` | 单元 | ✅ | ✅ | 任意内联 |
| `title` | 语义 | ✅ | ✅ | — |
| `text` | 语义 | ✅ | ✅ | — |
| `image` | 语义 | ✅ | ✅ | — |
| `images` | 语义 | ✅ | ✅ | cell (每图一个) |
| `card` | 语义 | ✅ | ✅ | 任意 |
| `divider` | 语义 | ✅ | ✅ | — |
| `badge` | 语义 | ✅ | ✅ | — |
| `spacer` | 语义 | ✅ | ✅ | — |
| `background` | 语义 | — | ✅ | — |
| `group` | 穿透 | ✅ | ✅ | 任意 |

---

## 5. 组件定义

### 5.1 flex-row — 水平弹性行

```html
<section data-wb-type="flex-row"
  style="display:flex; flex-flow:row;
         justify-content:flex-start; align-items:flex-start;
         padding:0; gap:0; box-sizing:border-box;">
</section>
```

**秀米对应**: `<section style="display:flex; flex-flow:row; ...">`

子元素约束：直接子元素必须是 `cell` 或另一个有 `data-wb-type` 的 section（不能直接放 `<p>` 或 `<img>`）。

| props | 类型 | 默认 |
|-------|------|------|
| justify | flex-start/center/flex-end/space-between | flex-start |
| align | flex-start/center/flex-end/stretch | flex-start |
| gap | px | 0 |
| padding | css | 0 |

---

### 5.2 flex-col — 垂直弹性列

```html
<section data-wb-type="flex-col"
  style="display:flex; flex-flow:column;
         box-sizing:border-box;">
</section>
```

**秀米对应**: `<section style="display:flex; flex-flow:column; ...">`

| props | 类型 | 默认 |
|-------|------|------|
| padding | css | 0 |

---

### 5.3 grid-overlay — 叠加层

仅在自由画布模式使用。所有子元素共享同一个网格单元，通过 margin 控制位置。

```html
<section data-wb-type="grid-overlay"
  style="display:grid; width:100%; overflow:hidden;
         grid-template-columns:100%; grid-template-rows:100%;
         position:relative; box-sizing:border-box;">
</section>
```

**秀米对应**: `<section style="display:grid; grid-template-columns:100%; grid-template-rows:100%; ...">`

| props | 类型 | 默认 |
|-------|------|------|
| aspectRatio | css | auto |

---

### 5.4 cell — 布局单元

cell 是内容承载的基本粒子。所有语义组件内部都是 cell。cell 本身也可是独立组件。

```html
<!-- 作为独立组件 -->
<section data-wb-type="cell"
  style="display:inline-block; width:100%; vertical-align:top;
         box-sizing:border-box;">
  <!-- 任意内容 -->
</section>

<!-- 在 flex-row 中 -->
<section data-wb-type="cell"
  style="display:inline-block; width:48%; vertical-align:top;
         flex:0 0 auto; align-self:flex-start;
         box-sizing:border-box;">
</section>
```

**秀米对应**: `<section style="display:inline-block; width:XX%; vertical-align:top; ...">`

| props | 类型 | 默认 |
|-------|------|------|
| width | css | 100% |
| vAlign | top/middle/bottom | top |
| flex | css | 0 0 auto |
| alignSelf | css | flex-start |

cell 的内容决定了它在编辑器中的视觉角色：
- 包含 `<img>` → 显示为图片块
- 包含 `<p>` → 显示为文本块  
- 包含子 section → 显示为容器块
- 空的但有 bg-color → 显示为色块

---

### 5.5 title — 标题

```html
<section data-wb-type="title"
  style="font-size:22px; font-weight:700; color:#1a1a1a;
         text-align:center; padding:16px 12px 8px;
         line-height:1.4; letter-spacing:1px;
         box-sizing:border-box;">
  <p style="margin:0;"><strong>标题文字</strong></p>
</section>
```

识别特征：含 `<p>` 且 `font-size ≥ 18px` 的 section。

---

### 5.6 text — 正文

```html
<section data-wb-type="text"
  style="font-size:15px; color:#333; line-height:1.75;
         text-align:justify; padding:8px 12px;
         letter-spacing:0.5px; box-sizing:border-box;">
  <p style="margin:0;">正文内容</p>
</section>
```

识别特征：含 `<p>` 且 `font-size < 18px` 的 section。

---

### 5.7 image — 单图

```html
<section data-wb-type="image"
  style="text-align:center; padding:12px 0; box-sizing:border-box;
         line-height:0;">
  <img src="https://..." alt=""
    style="width:100%; height:auto; display:block;
           box-sizing:border-box;"
    data-ratio="0.75" data-w="1080">
</section>
```

**秀米图片必须保留的属性**（宽度还原需要）：
- `data-ratio` — 图片宽高比
- `data-w` — 原始像素宽度
- `style="width:100%; height:auto; display:block"` — 响应式填充

---

### 5.8 images — 多图组合

```html
<section data-wb-type="images"
  style="text-align:center; padding:12px 0; font-size:0;
         box-sizing:border-box;">
  <!-- 由 cell + img 组成，编辑器按count自动生成 -->
</section>
```

| props | 类型 | 默认 | 说明 |
|-------|------|------|------|
| count | 2/3/4 | 2 | 图片数量 |
| gap | px | 4 | 图片间距 |
| sources | string[] | [] | URL 列表 |

生成规则（导出时）：
- 2 图: 两个 `cell(width:48%)` 并排
- 3 图: 三个 `cell(width:30%)` 并排
- 4 图: 两行各两个 `cell(width:48%)`

---

### 5.9 card — 卡片

```html
<section data-wb-type="card"
  style="background:#f6fbf8; border:1px solid #d8f0e3;
         border-radius:10px; padding:16px; margin:12px 16px;
         box-shadow:0 4px 16px rgba(0,0,0,0.06);
         box-sizing:border-box;">
  <!-- 子组件 -->
</section>
```

识别特征：同时有 `background-color` + `border-radius` + `padding` 且含子元素的 section。

---

### 5.10 divider — 分割线

```html
<section data-wb-type="divider"
  style="text-align:center; padding:16px 0; box-sizing:border-box;">
</section>
```

可包含装饰元素（色块、文本符号）。无内容的纯间距用 `spacer`。

---

### 5.11 badge — 标签/徽章

```html
<section data-wb-type="badge"
  style="display:inline-block; padding:4px 12px;
         font-size:12px; font-weight:700; color:#fff;
         background:#07c160; border-radius:999px;
         letter-spacing:1px; box-sizing:border-box;">
  <span>标签文字</span>
</section>
```

---

### 5.12 spacer — 垂直间距

```html
<section data-wb-type="spacer"
  style="height:24px; box-sizing:border-box;"></section>
```

---

### 5.13 background — 背景层

仅自由画布。铺满根部、位于最底层。

```html
<section data-wb-type="background"
  style="position:absolute; inset:0;
         background-color:#e8f4fd; opacity:0.6;
         box-sizing:border-box; pointer-events:none;
         z-index:0;">
</section>
```

---

### 5.14 group — 透明打包

无视觉样式，仅用于逻辑分组。在文档流中透传所有子组件。

```html
<section data-wb-type="group"
  style="box-sizing:border-box;">
  <!-- 子组件 -->
</section>
```

允许附加 `margin`/`padding` 控制整体间距。

**秀米对应**: Xiumi 中大量 `position:static` 或仅有 `margin` 的包装 section。

---

## 6. 秀米 HTML → Workbench HTML 导入

导入时逐 section 分类，不丢失任何结构：

```
对每个 <section>：
  检查 style 中的 display 和 content：
  
  display:flex + flex-flow:row → flex-row
  display:flex + flex-flow:column → flex-col
  display:grid + cols:100% + rows:100% → grid-overlay
  display:inline-block → cell
    含 <img> → 加 data-wb-type="image"（或保留 cell）
    含 <p> + font-size≥18 → title
    含 <p> + font-size<18 → text  
    含 bg-color + border-radius + padding + 子元素 → card
    height≤10px + bg-color → divider
    border-radius:999px → badge
    仅 height → spacer
  仅有 margin 或 position:static → group
  position:absolute 且无内容 → background
```

**导入不改动任何 style**。仅添加 `data-wb-type` 和 `data-wb-props`。

---

## 7. 文档流模式

默认模式。组件按其声明顺序垂直堆叠。

规则：
1. `flex-row`/`flex-col`/`card`/`group` 的子组件在内部按序排列
2. `title`/`text`/`image`/`images`/`divider`/`badge`/`spacer` 占满 375px 宽度
3. 组件间距由各自的 `margin`/`padding` 控制
4. 不出现 `position:absolute`
5. 同一层级不可重叠

编辑器行为：
- 新组件插入到光标位置
- 上下键调整顺序
- 组件高度自动撑开

---

## 8. 自由画布模式

根加 `data-wb-mode="canvas"`。所有直接子组件用 `position:absolute`。

```html
<section data-wb-root="1" data-wb-version="2.0" data-wb-mode="canvas"
  style="position:relative; width:375px; min-height:800px;
         background:#fff; margin:0 auto; box-sizing:border-box;">

  <section data-wb-type="background"
    style="position:absolute; inset:0; z-index:0;
           background:#f8faf9; box-sizing:border-box;">
  </section>

  <section data-wb-type="title"
    style="position:absolute; left:12px; top:40px; width:351px;
           ...">
    <p>标题</p>
  </section>

</section>
```

规则：
1. 每组件 `position:absolute` + 精确 `left`/`top`
2. `width`/`height` 精确 px 值
3. `z-index` 控制层级
4. `grid-overlay` 和 `background` 仅此模式可用
5. `group` 仍可嵌套（内部子组件相对 group 定位）

---

## 9. data-wb-props

每个组件可选。存储可调参数，供 Inspector 面板读写。

```html
<section data-wb-type="title"
  data-wb-props='{"fontSize":22,"color":"#1a1a1a","textAlign":"center"}'
  style="font-size:22px; color:#1a1a1a; text-align:center;">
```

- `style` 是渲染源
- `data-wb-props` 是编辑接口
- 修改 props 时同步更新 style

---

## 10. CSS 属性策略

**不设 CSS 白名单**。Workbench HTML 中的 CSS 完整保留。

规则：
1. 任何有效 CSS inline style 均可使用
2. 导出微信 HTML 时：去掉 `data-wb-*`，去掉 `position:absolute` 和 `z-index`（文档流转换后），其余 style 原样保留
3. AI 生成时建议使用的属性（微信兼容）：
   - 排版: `font-size`, `font-weight`, `color`, `text-align`, `line-height`, `letter-spacing`, `word-break`, `white-space`
   - 盒模型: `display`, `width`, `height`, `margin`, `padding`, `box-sizing`
   - 视觉: `background`, `background-color`, `background-image`, `background-size`, `background-position`, `border`, `border-radius`, `box-shadow`, `opacity`
   - 布局: `flex`, `flex-flow`, `justify-content`, `align-items`, `align-self`, `grid-template-*`, `grid-column`, `grid-row`
   - 定位: `position`, `top`, `left`, `right`, `bottom`, `z-index`, `inset`
   - 变换: `transform`, `transform-style`, `perspective`
   - 其他: `vertical-align`, `overflow`, `text-shadow`, `filter`, `pointer-events`, `user-select`

---

## 11. 微信 HTML 导出

1. 去掉所有 `data-wb-*` 属性
2. 自由画布 → 文档流：按 `top` 升序排列组件，去掉 `position:absolute`
3. `grid-overlay` 层 → 展平为 `inline-block` 叠加 section
4. `background` → 合并入根 section 的 style
5. `group` → 展开，去除包装层
6. 图片 URL 替换为微信 CDN 地址
7. 移除 `transform-style`, `perspective`, `pointer-events`

```html
<!-- 导出结果 -->
<section style="width:100%;max-width:375px;margin-left:auto;margin-right:auto;">
  <section style="font-size:22px;..."><p>标题</p></section>
  <section style="font-size:15px;..."><p>正文</p></section>
  <section><img src="https://mmbiz.qpic.cn/..." style="width:100%;height:auto;display:block;"></section>
</section>
```

---

## 12. AI 生成约束

1. 必须使用已定义的 `data-wb-type`
2. 每个 `<section>` 必须有类型标记
3. 文档流模式不写 `position:absolute`
4. 不写禁用标签 (`div`, `h1`-`h6`, `a`, `svg`)
5. 图片 URL 留 `src=""` 或以 `https://` 开头
6. 颜色用 `#hex` 或 `rgb()`

---

## 13. 编辑器校验

加载时执行：
1. 每个 section 必须有 `data-wb-type` — 否则导入为 `cell` 或 `group`
2. 根宽度 ≤ 375px
3. 无禁用标签
4. 文档流模式无 `position:absolute`

---

## 14. 组件目录

| type | 文档流 | 自由画布 | 秀米映射 |
|------|--------|---------|---------|
| flex-row | ✅ | ✅ | `display:flex; flex-flow:row` |
| flex-col | ✅ | ✅ | `display:flex; flex-flow:column` |
| grid-overlay | — | ✅ | `display:grid; cols/rows:100%` |
| cell | ✅ | ✅ | `display:inline-block; vertical-align` |
| title | ✅ | ✅ | cell + p + font≥18px |
| text | ✅ | ✅ | cell + p + font<18px |
| image | ✅ | ✅ | cell + img |
| images | ✅ | ✅ | flex-row + cell×N + img |
| card | ✅ | ✅ | cell + bg + radius + padding + child |
| divider | ✅ | ✅ | cell + 色块/符号 |
| badge | ✅ | ✅ | cell + radius:999px |
| spacer | ✅ | ✅ | cell + height only |
| background | — | ✅ | absolute+inset+0 content |
| group | ✅ | ✅ | position:static / margin only |

---

*规范版本: 2.0 | 基于 398 份秀米模板全量分析 + cell 模型*
