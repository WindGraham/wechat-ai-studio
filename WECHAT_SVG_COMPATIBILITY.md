# 微信公众号 SVG 兼容性清单（最终版）

> **测试时间**: 2026-05-08  
> **测试账号**: 订阅号 wx87892513e3561af8  
> **测试方式**: 通过微信公众号 API 创建草稿，在编辑器中查看效果  
> **测试轮次**: 历史 4 轮 + 今日 5 轮 = 共 9 轮实际发布验证  
> **验证状态**: ✅ 已通过实际发布验证

---

## 一、确认可用的功能（绿色区）

以下功能在历史测试和今日复测中均正常显示：

### 1. 基础形状

| 标签 | 状态 | 说明 |
|:---|:---:|:---|
| `<svg>` | ✅ | 根标签正常 |
| `<g>` | ✅ | 分组标签正常 |
| `<rect>` | ✅ | 矩形，支持 rx/ry 圆角 |
| `<circle>` | ✅ | 圆形 |
| `<ellipse>` | ✅ | 椭圆 |
| `<line>` | ✅ | 直线，支持 stroke-linecap |
| `<polyline>` | ✅ | 折线 |
| `<polygon>` | ✅ | 多边形 |
| `<path>` | ✅ | 路径，支持 d 属性动画 |
| `<text>` | ✅ | 文字 |
| `<tspan>` | ✅ | 文字片段，支持变色 |

### 2. 基础属性

| 属性 | 状态 | 说明 |
|:---|:---:|:---|
| `fill` | ✅ | 填充颜色 |
| `stroke` | ✅ | 描边颜色 |
| `stroke-width` | ✅ | 描边宽度，支持动画 |
| `opacity` | ✅ | 透明度，支持动画 |
| `rx` / `ry` | ✅ | 圆角 |
| `stroke-dasharray` | ✅ | 虚线 |
| `stroke-dashoffset` | ✅ | 偏移，可做绘制动画 |
| `stroke-linecap` / `stroke-linejoin` | ✅ | 线端/连接样式 |
| `fill-rule` | ✅ | 填充规则 |

### 3. 2D 变换（属性）

| 变换 | 状态 | 说明 |
|:---|:---:|:---|
| `translate()` | ✅ | 位移 |
| `scale()` | ✅ | 缩放 |
| `rotate()` | ✅ | 旋转 |
| `skewX` / `skewY` | ✅ | 倾斜变形 |

### 4. SMIL 动画

| 动画 | 状态 | 说明 |
|:---|:---:|:---|
| `<animate>` | ✅ | 属性动画（opacity/r/fill/stroke-width 等） |
| `<animateTransform>` | ✅ | 变换动画（translate/scale/rotate/skewX） |
| `<animateMotion>` | ✅ | 路径运动 |
| `<set>` | ✅ | 设置动画 |
| `repeatCount` | ✅ | 自动循环 |
| `begin` | ✅ | 延时播放 |

### 5. 布局

| 特性 | 状态 | 说明 |
|:---|:---:|:---|
| `viewBox` | ✅ | 视口缩放 |
| `preserveAspectRatio` | ✅ | 比例保持 |
| `width` / `height` | ✅ | 尺寸 |
| `x` / `y` / `cx` / `cy` / `r` | ✅ | 位置与半径 |

### 6. 图片

| 来源 | 状态 | 说明 |
|:---|:---:|:---|
| 微信 CDN (`mmbiz.qpic.cn`) | ✅ | 唯一可用来源 |
| `<image>` 标签 | ✅ | 可用，但必须使用 `href` 属性 |

---

## 二、确认不可用的功能（红色区）

以下功能在今日 5 轮实测中均失败：

### 1. 滤镜（全部被过滤）

| 滤镜 | 状态 |
|:---|:---:|
| `<feGaussianBlur>` | ❌ |
| `<feComponentTransfer>` | ❌ |
| `<feBlend>` | ❌ |
| `<feComposite>` | ❌ |
| `<feOffset>` | ❌ |
| `<feMerge>` | ❌ |
| `<feFlood>` | ❌ |
| `<feTile>` | ❌ |
| `<filter>` 标签整体 | ❌ |

### 2. 渐变（全部被过滤）

| 渐变 | 状态 |
|:---|:---:|
| `<linearGradient>` | ❌ |
| `<radialGradient>` | ❌ |
| `<stop>` | ❌ |
| `gradientUnits` | ❌ |
| `spreadMethod` | ❌ |

### 3. 其他

| 功能 | 状态 | 说明 |
|:---|:---:|:---|
| `clipPath` / `clip-path` | ❌ | 裁剪被过滤 |
| `textPath` | ❌ | 文字路径被过滤 |
| `visibility` | ❌ | 布局属性被过滤 |
| `matrix()` / `matrix` SMIL | ❌ | 矩阵变换被过滤 |
| Base64 / Data URI | ❌ | 编码图片被过滤 |
| `xlink:href` | ❌ | 已被微信编辑器过滤 |
| `href` (SVG2) | ✅ | 替代 xlink:href，可用 |
| `style` 属性 | ❌ | 被过滤 |
| `class` / `id` | ❌ | 被移除 |
| `rotateX()` / `rotateY()` / `rotateZ()` | ❌ | 3D 变换不支持 |
| CSS `@keyframes` / `animation` | ❌ | 完全过滤 |
| `<script>` / 事件 | ❌ | 完全禁止 |

---

## 三、图片处理效果可用方案

由于滤镜和裁剪不可用，**微信 SVG 中能对图片做的处理效果仅限于**：

| 效果 | 实现方式 | 可用性 |
|:---|:---|:---:|
| 旋转 | `transform="rotate(角度)"` 或 `<animateTransform type="rotate">` | ✅ 已验证对图片生效 |
| 缩放 | `transform="scale(倍数)"` 或 `<animateTransform type="scale">` | ✅ 已验证对图片生效 |
| 位移 | `transform="translate(x,y)"` 或 `<animateTransform type="translate">` | ✅ 已验证对图片生效 |
| 倾斜 | `transform="skewX(角度)"` 或 `<animateTransform type="skewX">` | ✅ 已验证对图片生效 |
| 透明度 | `opacity="值"` 或 `<animate attributeName="opacity">` | ✅ 已验证对图片生效 |
| 淡入淡出 | opacity 动画 | ✅ 已验证对图片生效 |
| 滑动进入 | translate 动画 | ✅ 已验证对图片生效 |
| 路径运动 | `<animateMotion>` | ✅ 已验证对图片生效 |
| 组合效果 | 多种动画同时作用于 `<image>` | ✅ 已验证对图片生效 |
| 模糊 | `feGaussianBlur` | ❌ |
| 裁剪 | `clipPath` | ❌ |
| 蒙版/遮罩 | `mask` | ❌ |
| 颜色调整 | `feComponentTransfer` / `feColorMatrix` | ❌ |
| 阴影 | `feOffset` + `feMerge` | ❌ |

---

## 四、HTML/CSS 补充：`box-shadow`

> 虽然 `box-shadow` 不是 SVG 特性，但在微信图文排版中常与 SVG 配合使用，因此纳入本清单统一验证。

| 特性 | 状态 | 说明 |
|:---|:---:|:---|
| 基础阴影（大小变化） | ✅ | `2px` / `6px` / `16px` blur 均正常 |
| 阴影颜色（固定色） | ✅ | 黑色、红色、蓝色均正常 |
| 半透明阴影（`rgba`） | ✅ | `rgba(0,0,0,0.5)` 等在手机端和 PC 端均正常 |
| 内阴影（`inset`） | ✅ | `inset` 阴影正常显示 |
| 多层阴影 | ✅ | 两层、三层、发光效果均正常 |
| 扩散半径（`spread`） | ✅ | `-4px` / `0` / `+4px` 均正常 |

**结论**：`box-shadow` 在微信编辑器中**完全可用**，包括 `rgba()` 透明阴影、`inset`、多层阴影和 `spread` 半径。之前的文档警告“PC 端会丢失”已**被证伪**。

---

## 五、关键结论

### 必须遵守的规则

1. **图片必须用微信 CDN** — 任何外部 URL、Base64、Data URI 都会被过滤
2. **动画必须用 SMIL** — CSS 动画完全不支持
3. **样式必须用内联属性** — `style` 标签/属性被过滤
4. **不要使用 class/id** — 会被移除
5. **不要使用 script** — 完全禁止
6. **滤镜、渐变、裁剪不可用** — 微信编辑器会整体过滤这些标签
7. **3D 变换不可用** — `rotateX/Y/Z`、`matrix()` 均不支持

### 推荐技术栈

```
SVG 标签: <svg>, <g>, <rect>, <circle>, <path>, <text>, <image>
动画: <animate>, <animateTransform> (translate/scale/rotate/skewX), <animateMotion>
样式: fill, stroke, stroke-width, opacity
变换: translate(), scale(), rotate(), skewX()
图片: 微信CDN (mmbiz.qpic.cn)
```

---

*文档版本: v2.1*  
*最后更新: 2026-05-08*  
*测试验证: ✅ 已通过 9 轮 SVG 实际发布验证 + `box-shadow` 专项验证*
