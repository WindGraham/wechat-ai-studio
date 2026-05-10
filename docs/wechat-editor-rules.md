# 编辑器微信兼容性规则

## 核心原则

编辑器内部（设计模式）可以用任何浏览器能力——`position: absolute`、`display: flex`、CSS 变量都不受限制。**只在导出到 article.html 时转换**为微信安全格式。

## 一、输出约束（不可违反）

### 1.1 根容器

```html
<section style="width: 100%; max-width: 375px; 
  margin-left: auto; margin-right: auto; 
  text-align: center; box-sizing: border-box;">
  <!-- 所有内容 -->
</section>
```

- `max-width: 375px` — PC 端限制宽度
- `margin-left: auto` + `margin-right: auto` — 居中（不用 `margin: 0 auto`）
- 根容器**不设** `background-color`（微信强制覆盖为白色）
- `text-align: center` — 让 inline-block 子元素居中

### 1.2 标签白名单

| 用途 | 允许的标签 |
|:---|:---|
| 容器 | `<section>` |
| 文字 | `<p>`, `<span>`, `<strong>`, `<em>`, `<br>` |
| 图片 | `<img>` |
| 图形 | `<svg>`（有条件，见下方） |

**禁止**：`<script>`, `<style>`, `<iframe>`, `<table>`, `<form>`, `<input>`, `<h1-h6>`, `<ul>`, `<ol>`

### 1.3 样式约束

#### 完全禁止（导出时必须移除）

| 属性 | 原因 |
|:---|:---|
| `position: absolute / fixed` | 微信强制为 static |
| `animation`, `transition`, `@keyframes` | 微信过滤 |
| `display: grid` | PC 不支持 |
| `filter` | 不支持 |
| `direction: rtl` | 破坏中文换行 |
| `font-family` (自定义) | 微信覆盖为系统字体 |

#### 可用但需转换

| 设计模式中使用 | 导出时转换为 |
|:---|:---|
| `display: flex` | `display: inline-block` |
| `justify-content: center` | 父级 `text-align: center` |
| `align-self: flex-start` | `vertical-align: top` |
| `position: absolute` (自由拖) | `margin-top: -Npx` 负边距 |
| `transform: translate(X,Y)` | `margin-left / margin-top` |
| `rgba(r,g,b,a)` 非完全透明 | `rgb(r',g',b')` 混合白色后 |
| `flex-flow: row` | 用 `<!-- -->` 分隔 inline-block |

#### 完全可用（不需转换）

| 属性类别 | 具体属性 |
|:---|:---|
| 布局 | `display: inline-block/block`, `width`, `height`, `max-width`, `min-width`, `margin`, `padding`, `box-sizing`, `vertical-align` |
| 文字 | `font-size`, `color`, `line-height`, `text-align`, `text-indent`, `letter-spacing`, `font-weight`, `font-style`, `word-break` |
| 装饰 | `background-color`, `border`, `border-radius`, `opacity`, `box-shadow` |
| 背景 | `background-image` (HTTPS URL), `background-size`, `background-position` |

## 二、布局转换规则

### 2.1 流式模式 → 文档流

编辑器里流式模式按 `top` 顺序排列。导出时：

```
自由模式块 → margin-top:-Npx（层叠）
流式模式块 → 正常文档流顺序
```

### 2.2 自由模式 → 负 margin 层叠

编辑器里自由拖拽的绝对坐标，导出时：

1. 按 `top` 排序所有块
2. 前后两个块之间的坐标差 → 换算为 `margin-top: -Npx`
3. 水平偏移 → `text-align` + `padding`
4. 负 margin 上限 120px（微信编辑器中不会裁剪）

```html
<!-- 设计模式中的绝对定位 -->
<section style="position:absolute; left:20px; top:200px; width:335px;">
  <p>标题</p>
</section>

<!-- 导出后的文档流版本 -->
<section style="margin-top: -40px; text-align: center;">
  <section style="display: inline-block; width: 89%; box-sizing: border-box;">
    <p style="text-align: left;">标题</p>
  </section>
</section>
```

### 2.3 多栏布局

设计模式中可以自由摆放并列块。导出时遵循以下规则：

| 规则 | 说明 |
|:---|:---|
| 一行一个容器 | 不可多行挤在同一父级 |
| 总宽 ≤ 92% | 移动端安全（PC可到96%） |
| 间隙用 `padding-left` | 不用 `margin` |
| `<!-- -->` 分隔 | 消除 inline-block 间隙 |
| `vertical-align: top` | 对齐基线 |
| 对称 padding | 所有列 `padding-left + padding-right` 相等 |

## 三、颜色规则

### 3.1 背景色

- 根容器不设背景色 → 微信强制白色
- 深色/彩色背景必须用 wrapper `<section>` 承载
- 半透明 `rgba()` → 导出时混合白色计算为不透明 `rgb()`

### 3.2 渐变

- 可行，但必须用 `linear-gradient`
- 起止色必须是不透明 `rgb()`
- 不能用 `rgba()` 做渐变终点（会和白底混合变脏）

## 四、图片规则

- 全部 `width: 100%; max-width: 100%; display: block; margin: 0 auto;`
- 容器加 `line-height: 0` 消除底部缝隙
- URL 必须是公网 HTTPS（编辑器插入时已验证）
- 自动发布必须用微信 CDN（`mmbiz.qpic.cn`），手动粘贴可用第三方图床

## 五、编辑器导出流程

```
编辑器 DOM 树
  ↓
遍历所有 section 块
  ├── 自由模式块 → 计算负 margin（坐标差）
  ├── 流式模式块 → 保留文档顺序
  ├── 并排块 → 合并为 inline-block 行容器
  └── 嵌套组 → 保持 section 嵌套
  ↓
清洗样式
  ├── 移除 position:absolute、display:flex
  ├── 移除 animation、filter、font-family
  ├── rgba → rgb（混合白色）
  └── 移除 class、id、data-* 属性
  ↓
套根容器（375px，居中）
  ↓
验证
  ├── 标签平衡
  ├── 双栏总宽 ≤ 92%
  ├── 所有图片有 width:100%
  └── 无禁用标签/属性
  ↓
写入 article.html
```

## 六、编辑器与 Skill 的关系

编辑器是 Skill 的**辅助工具**，不是替代：

- AI 按 Skill 规则生成 HTML → 编辑器加载 → 用户调整 → 导出回 article.html
- 编辑器的导出规则必须和 Skill 的格式一致
- 编辑器内部可以用任意技术（flex/absolute），导出时严格遵守上述约束
- Skill 的 3 轮自查在导出的 HTML 上完成后交付
