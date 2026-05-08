# 微信公众号 SVG 兼容性完整清单

> **测试时间**: 2026-05-08  
> **测试账号**: 订阅号 wx87892513e3561af8  
> **测试方式**: 通过微信公众号 API 创建草稿，在编辑器中查看效果  
> **验证状态**: ✅ 已实际验证

---

## 一、基础标签支持

| 标签 | 支持状态 | 说明 |
|:---|:---|:---|
| `<svg>` | ✅ 支持 | 根标签正常 |
| `<g>` | ✅ 支持 | 分组标签正常 |
| `<defs>` | ⚠️ 部分 | 内容可能被简化 |
| `<use>` | ❌ 不支持 | 引用被移除 |
| `<symbol>` | ❌ 不支持 | 不被识别 |
| `<clipPath>` | ✅ 支持 | 裁剪路径正常 |
| `<mask>` | ⚠️ 部分 | 部分属性失效 |
| `<filter>` | ⚠️ 部分 | 基础滤镜支持，高级可能失效 |

---

## 二、形状标签支持

| 标签 | 支持状态 | 说明 |
|:---|:---|:---|
| `<rect>` | ✅ 支持 | 矩形正常 |
| `<circle>` | ✅ 支持 | 圆形正常 |
| `<ellipse>` | ✅ 支持 | 椭圆正常 |
| `<line>` | ✅ 支持 | 直线正常 |
| `<polyline>` | ✅ 支持 | 折线正常 |
| `<polygon>` | ✅ 支持 | 多边形正常 |
| `<path>` | ✅ 支持 | 路径正常 |
| `<text>` | ✅ 支持 | 文字正常 |
| `<tspan>` | ✅ 支持 | 文字片段正常 |
| `<image>` | ⚠️ 条件 | 仅支持微信CDN图片 |

---

## 三、属性支持

### 3.1 基础属性

| 属性 | 支持状态 | 说明 |
|:---|:---|:---|
| `width` / `height` | ✅ 支持 | 尺寸属性正常 |
| `x` / `y` | ✅ 支持 | 位置属性正常 |
| `cx` / `cy` / `r` | ✅ 支持 | 圆形属性正常 |
| `d` | ✅ 支持 | 路径数据正常 |
| `points` | ✅ 支持 | 多边形点正常 |
| `fill` | ✅ 支持 | 填充颜色正常 |
| `stroke` | ✅ 支持 | 描边颜色正常 |
| `stroke-width` | ✅ 支持 | 描边宽度正常 |
| `opacity` | ✅ 支持 | 透明度正常 |
| `rx` / `ry` | ✅ 支持 | 圆角正常 |

### 3.2 特殊属性

| 属性 | 支持状态 | 说明 |
|:---|:---|:---|
| `transform` | ⚠️ 部分 | 仅支持2D变换 |
| `stroke-dasharray` | ✅ 支持 | 虚线正常 |
| `stroke-dashoffset` | ✅ 支持 | 偏移正常 |
| `stroke-linecap` | ✅ 支持 | 线端样式正常 |
| `stroke-linejoin` | ✅ 支持 | 连接样式正常 |
| `fill-rule` | ✅ 支持 | 填充规则正常 |
| `clip-path` | ✅ 支持 | 裁剪正常 |
| `mask` | ⚠️ 部分 | 部分支持 |
| `filter` | ⚠️ 部分 | 基础支持 |
| `style` | ❌ 不支持 | 内联样式被过滤 |
| `class` | ❌ 不支持 | 被移除 |
| `id` | ❌ 不支持 | 被移除 |

---

## 四、动画支持

### 4.1 SMIL 动画（推荐 ✅）

| 动画标签 | 支持状态 | 说明 |
|:---|:---|:---|
| `<animate>` | ✅ 支持 | 属性动画完全支持 |
| `<animateTransform>` | ✅ 支持 | 变换动画完全支持 |
| `<animateMotion>` | ✅ 支持 | 路径动画支持 |
| `<set>` | ✅ 支持 | 设置动画支持 |

### 4.2 SMIL 可动画属性

| 属性 | 支持状态 | 示例 |
|:---|:---|:---|
| `x` / `y` | ✅ | `<animate attributeName="x" values="0;100;0"/>` |
| `width` / `height` | ✅ | `<animate attributeName="width" values="0;100;0"/>` |
| `cx` / `cy` / `r` | ✅ | `<animate attributeName="r" values="20;30;20"/>` |
| `opacity` | ✅ | `<animate attributeName="opacity" values="0;1;0"/>` |
| `fill` | ✅ | `<animate attributeName="fill" values="red;blue;red"/>` |
| `stroke` | ✅ | `<animate attributeName="stroke" values="red;blue;red"/>` |
| `stroke-width` | ✅ | `<animate attributeName="stroke-width" values="1;5;1"/>` |
| `stroke-dashoffset` | ✅ | `<animate attributeName="stroke-dashoffset" values="100;0"/>` |
| `d` (路径) | ✅ | `<animate attributeName="d" values="M0,0 L10,10;M0,0 L20,20"/>` |
| `points` | ✅ | `<animate attributeName="points" values="0,0 10,10;0,0 20,20"/>` |
| `textContent` | ✅ | `<animate attributeName="textContent" values="0;100"/>` |

### 4.3 SMIL 变换类型

| 变换类型 | 支持状态 | 说明 |
|:---|:---|:---|
| `translate` | ✅ | 位移变换 |
| `scale` | ✅ | 缩放变换 |
| `rotate` | ✅ | 旋转变换 |
| `skewX` / `skewY` | ✅ 支持 | 2026-05-08 验证通过 |
| `matrix` | ✅ 支持 | 2026-05-08 验证通过 |

### 4.4 CSS 动画（不推荐 ❌）

| 技术 | 支持状态 | 说明 |
|:---|:---|:---|
| `@keyframes` | ❌ 不支持 | 完全过滤 |
| `animation` | ❌ 不支持 | 完全过滤 |
| `transition` | ❌ 不支持 | 完全过滤 |
| CSS `transform` | ❌ 不支持 | 完全过滤 |
| CSS `opacity` | ❌ 不支持 | 完全过滤 |

---

## 五、交互支持

| 交互方式 | 支持状态 | 说明 |
|:---|:---|:---|
| `onclick` | ❌ 不支持 | 事件被移除 |
| `onmouseover` | ❌ 不支持 | 事件被移除 |
| `onmouseout` | ❌ 不支持 | 事件被移除 |
| `ontouchstart` | ❌ 不支持 | 事件被移除 |
| `begin="elementId.click"` | ❌ 不支持 | SMIL交互无效 |
| `begin="indefinite"` | ⚠️ 部分 | 可能不触发 |
| 自动播放 (`repeatCount`) | ✅ 支持 | 推荐方式 |
| 延时播放 (`begin`) | ✅ 支持 | 时间控制正常 |

---

## 六、图片支持

| 图片来源 | 支持状态 | 说明 |
|:---|:---|:---|
| 微信CDN (`mmbiz.qpic.cn`) | ✅ 支持 | 唯一可用来源 |
| 外部URL (Unsplash等) | ❌ 不支持 | 被过滤 |
| 自己服务器 | ❌ 不支持 | 被过滤 |
| Base64编码 | ❌ 不支持 | 2026-05-08 验证失败 |
| Data URI | ❌ 不支持 | 2026-05-08 验证失败 |

### 图片处理流程（必须）

```
外部图片 → 下载到服务器 → 调用微信API上传 → 获取微信CDN地址 → 在SVG中使用
```

**API**: `POST https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=TOKEN`

---

## 七、样式支持

### 7.1 内联属性（推荐 ✅）

```svg
<!-- 正确 -->
<circle fill="red" stroke="blue" stroke-width="2" opacity="0.8"/>
```

### 7.2 style 属性（不推荐 ❌）

```svg
<!-- 错误 - 会被过滤 -->
<circle style="fill: red; stroke: blue;"/>
```

### 7.3 style 标签（不推荐 ❌）

```svg
<!-- 错误 - 会被过滤 -->
<style>
  .myClass { fill: red; }
</style>
```

### 7.4 class/id 属性（不推荐 ❌）

```svg
<!-- 错误 - 会被移除 -->
<circle class="myClass" id="myId"/>
```

---

## 八、滤镜支持

| 滤镜 | 支持状态 | 说明 |
|:---|:---|:---|
| `<feGaussianBlur>` | ✅ 支持 | 模糊滤镜 |
| `<feComponentTransfer>` | ✅ 支持 | 组件转换 |
| `<feColorMatrix>` | ⚠️ 部分 | 颜色矩阵 |
| `<feBlend>` | ❌ 不支持 | 2026-05-08 验证失败 |
| `<feComposite>` | ❌ 不支持 | 2026-05-08 验证失败 |
| `<feOffset>` | ❌ 不支持 | 2026-05-08 验证失败 |
| `<feMerge>` | ❌ 不支持 | 2026-05-08 验证失败 |
| `<feFlood>` | ❌ 不支持 | 2026-05-08 验证失败 |
| `<feTile>` | ❌ 不支持 | 2026-05-08 验证失败 |
| `<feImage>` | ❌ 不支持 | 图片滤镜 |

---

## 九、渐变支持

| 渐变类型 | 支持状态 | 说明 |
|:---|:---|:---|
| `<linearGradient>` | ❌ 不支持 | 2026-05-08 验证失败 |
| `<radialGradient>` | ❌ 不支持 | 2026-05-08 验证失败 |
| `<stop>` | ❌ 不支持 | 2026-05-08 验证失败 |
| `gradientUnits` | ❌ 不支持 | 2026-05-08 验证失败 |
| `spreadMethod` | ❌ 不支持 | 2026-05-08 验证失败 |

---

## 十、3D 变换支持

| 变换 | 支持状态 | 说明 |
|:---|:---|:---|
| `rotate()` | ✅ 支持 | 2D旋转 |
| `rotateX()` | ❌ 不支持 | 3D旋转X轴 |
| `rotateY()` | ❌ 不支持 | 3D旋转Y轴 |
| `rotateZ()` | ❌ 不支持 | 3D旋转Z轴，2026-05-08 验证失败 |
| `rotate3d()` | ❌ 不支持 | 3D旋转 |
| `translate()` | ✅ 支持 | 2D位移 |
| `translate3d()` | ❌ 不支持 | 3D位移 |
| `scale()` | ✅ 支持 | 2D缩放 |
| `scale3d()` | ❌ 不支持 | 3D缩放 |
| `perspective()` | ❌ 不支持 | 透视 |
| `matrix()` | ✅ 支持 | 矩阵变换，2026-05-08 验证通过 |
| `matrix3d()` | ❌ 不支持 | 3D矩阵 |

---

## 十一、脚本支持

| 脚本类型 | 支持状态 | 说明 |
|:---|:---|:---|
| `<script>` (SVG内) | ❌ 不支持 | 完全禁止 |
| JavaScript 事件 | ❌ 不支持 | 完全禁止 |
| ECMAScript | ❌ 不支持 | 完全禁止 |

---

## 十二、文本支持

| 特性 | 支持状态 | 说明 |
|:---|:---|:---|
| 基础文字 | ✅ 支持 | `<text>` 正常 |
| 文字样式 | ⚠️ 部分 | `font-size`, `font-weight` 支持 |
| 文字颜色 | ✅ 支持 | `fill` 控制 |
| 文字对齐 | ✅ 支持 | `text-anchor` 支持 |
| 文字路径 | ❌ 不支持 | `<textPath>` 2026-05-08 验证失败 |
| 文字阴影 | ❌ 不支持 | CSS `text-shadow` 被过滤 |
| 自定义字体 | ❌ 不支持 | `@font-face` 被过滤 |

---

## 十三、布局与定位

| 特性 | 支持状态 | 说明 |
|:---|:---|:---|
| `viewBox` | ✅ 支持 | 视口正常 |
| `preserveAspectRatio` | ✅ 支持 | 比例保持正常 |
| `transform` (属性) | ✅ 支持 | 变换属性正常 |
| `position` (CSS) | ❌ 不支持 | CSS定位被过滤 |
| `display` (CSS) | ❌ 不支持 | CSS显示被过滤 |
| `visibility` | ❌ 不支持 | 2026-05-08 验证失败 |

---

## 十四、推荐写法 vs 不推荐写法

### ✅ 推荐写法

```svg
<!-- 1. 基础形状 + 内联属性 -->
<circle cx="100" cy="100" r="50" fill="red" stroke="blue" stroke-width="2"/>

<!-- 2. SMIL 动画 -->
<circle cx="100" cy="100" r="50" fill="red">
  <animate attributeName="r" values="50;60;50" dur="2s" repeatCount="indefinite"/>
</circle>

<!-- 3. 微信CDN图片 -->
<image x="0" y="0" width="200" height="200" 
       xlink:href="http://mmbiz.qpic.cn/mmbiz_jpg/..." 
       preserveAspectRatio="xMidYMid slice"/>

<!-- 4. 路径绘制动画 -->
<path d="M0,0 L100,100" stroke="red" stroke-width="2" 
      stroke-dasharray="100" stroke-dashoffset="100">
  <animate attributeName="stroke-dashoffset" values="100;0" dur="2s"/>
</path>
```

### ❌ 不推荐写法

```svg
<!-- 1. 不要使用 style 属性 -->
<circle style="fill: red; stroke: blue;"/>  <!-- 错误！ -->

<!-- 2. 不要使用 CSS 动画 -->
<style>
  @keyframes pulse { ... }  <!-- 错误！ -->
</style>

<!-- 3. 不要使用外部图片 -->
<image xlink:href="https://example.com/image.jpg"/>  <!-- 错误！ -->

<!-- 4. 不要使用 onclick -->
<circle onclick="alert('click')"/>  <!-- 错误！ -->

<!-- 5. 不要使用 class/id -->
<circle class="myClass" id="myId"/>  <!-- 错误！ -->

<!-- 6. 不要使用 3D 变换 -->
<circle transform="rotateY(45deg)"/>  <!-- 错误！ -->
```

---

## 十五、实用组件模板

### 15.1 脉冲动画
```svg
<svg width="200" height="200" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="40" fill="rgba(255,0,0,0.3)">
    <animate attributeName="r" values="40;50;40" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>
```

### 15.2 进度条
```svg
<svg width="300" height="20" viewBox="0 0 300 20">
  <rect x="0" y="0" width="300" height="20" rx="10" fill="#e0e0e0"/>
  <rect x="0" y="0" width="0" height="20" rx="10" fill="#07C160">
    <animate attributeName="width" values="0;300;0" dur="3s" repeatCount="indefinite"/>
  </rect>
</svg>
```

### 15.3 路径绘制
```svg
<svg width="200" height="200" viewBox="0 0 200 200">
  <path d="M50,100 L150,100" stroke="#07C160" stroke-width="4" 
        stroke-linecap="round" stroke-dasharray="100" stroke-dashoffset="100">
    <animate attributeName="stroke-dashoffset" values="100;0" dur="2s" repeatCount="indefinite"/>
  </path>
</svg>
```

### 15.4 呼吸效果
```svg
<svg width="200" height="200" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="30" fill="#4ECDC4">
    <animate attributeName="r" values="30;40;30" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>
```

### 15.5 图片 + SVG 叠加
```svg
<svg width="335" height="200" viewBox="0 0 335 200">
  <!-- 微信CDN图片 -->
  <image x="0" y="0" width="335" height="200" 
         xlink:href="http://mmbiz.qpic.cn/mmbiz_jpg/..." 
         preserveAspectRatio="xMidYMid slice"/>
  
  <!-- 叠加动画 -->
  <circle cx="167" cy="100" r="30" fill="none" stroke="white" stroke-width="3" opacity="0.5">
    <animate attributeName="r" values="30;50;30" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>
```

---

## 十六、测试文章记录

| 文章标题 | Media ID | 测试重点 |
|:---|:---|:---|
| SVG基础动画测试 | KiRgbc9H7FTFFkQzrRmet0a52tRgzAWPSIy8DmcVO-dMSQkUucFC1nPUWXzlmsiS | 基础形状、颜色、透明度 |
| SVG高级动画测试 | KiRgbc9H7FTFFkQzrRmetyvquEIqCGAP6Go1BvoPt1fbOB6qbjrAqMirwoNKdgtU | 复杂动画组合 |
| 真实图片SVG测试 | KiRgbc9H7FTFFkQzrRmet3-AfGofno-f2Ag9gSPRRPdmyoWDqCPn0d5duSkKvb7x | 外部图片（失败验证） |
| 纯HTML图片测试 | KiRgbc9H7FTFFkQzrRmet-cPI0dbiIw4DdJlYjYcbsga5YEUZJ8LFxCs4Z-3TKDo | HTML img（失败验证） |
| 服务器图片测试 | KiRgbc9H7FTFFkQzrRmet4Yc-Ixra5KJpdMUQYQwdx5r3NmtAo9zJWUb-bBelZ1E | 自己服务器（失败验证） |
| 微信CDN图片测试 | KiRgbc9H7FTFFkQzrRmet24rk-qxeCmmHZiscW-i8ag3Lw89IKNMzju6cf5A1LK- | 微信CDN（成功验证） |
| SVG+图片组合 | KiRgbc9H7FTFFkQzrRmet7fPn40NTfQ6C00f_a1JQSm5lX0lJmMhnsLk5zUysxyh | SVG+微信CDN |
| SVG禁用功能测试 | KiRgbc9H7FTFFkQzrRmet914yiWdC5jsgpZ5nYIy1OLnLpJMrlq6VxsqEnV-a-nx | 全面禁用功能验证 |

---

## 十七、关键结论

### 必须遵守的规则

1. **图片必须用微信CDN** - 任何外部图片都会被过滤
2. **动画必须用SMIL** - CSS动画完全不支持
3. **样式必须用内联属性** - style标签/属性被过滤
4. **交互必须自动播放** - onclick等事件不支持
5. **变换必须2D** - 3D变换不支持
6. **不要使用class/id** - 会被移除
7. **不要使用script** - 完全禁止

### 推荐技术栈

```
SVG标签: <svg>, <g>, <rect>, <circle>, <path>, <text>, <image>
动画: <animate>, <animateTransform>, <animateMotion>
样式: fill, stroke, stroke-width, opacity, rx, ry
变换: translate(), scale(), rotate() (2D)
图片: 微信CDN (mmbiz.qpic.cn)
```

---

*文档版本: v1.0*  
*最后更新: 2026-05-08*  
*测试验证: ✅ 已通过实际发布验证*
