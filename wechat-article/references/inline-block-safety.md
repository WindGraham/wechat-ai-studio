# Inline-Block Layout Safety Guide

inline-block 双栏/多栏布局安全指南

## 核心规则

### 规则 1：总宽度必须 ≤ 92%（移动端安全线）

```
❌ 错误：总宽度 98%（超标！）
width: 48% + margin-right: 2% + width: 48% = 98%

✅ 正确：总宽度 ≤ 92%
width: 44% + padding-left: 4% + width: 44% = 88%（内部间隙）
或
width: 45% + width: 45% + padding-left: 4% = 90%
```

**关键理解**：
- `margin` 是外部尺寸，会增加总宽度
- `padding` 是内部尺寸，配合 `box-sizing: border-box` 不增加总宽度
- 移动端安全线：≤ 92%，推荐 ≤ 90%

### 规则 2：间隙必须用 padding-left（不用 margin）

```html
<!-- ❌ 错误：margin 做间隙（增加总宽度） -->
<section style="display: inline-block; width: 48%; margin-right: 2%;">
  左列
</section><!--
--><section style="display: inline-block; width: 48%;">
  右列
</section>
<!-- 总宽度：48% + 2% + 48% = 98% ❌ -->

<!-- ✅ 正确：padding-left 做间隙（内部消化） -->
<section style="display: inline-block; width: 44%; vertical-align: top;">
  左列
</section><!--
--><section style="display: inline-block; width: 44%; padding-left: 4%; vertical-align: top; box-sizing: border-box;">
  右列
</section>
<!-- 总宽度：44% + 44% = 88% ✅（4% padding 在内部） -->
```

### 规则 3：一行内必须用独立行容器包裹

```html
<!-- ❌ 错误：四块连排赌换行（高危！） -->
<section style="text-align: center;">
  <section style="display: inline-block; width: 48%;">卡片1</section><!--
  --><section style="display: inline-block; width: 48%;">卡片2</section><!--
  --><section style="display: inline-block; width: 48%;">卡片3</section><!--
  --><section style="display: inline-block; width: 48%;">卡片4</section>
</section>
<!-- 危险：依赖自然换行，WeChat 编辑器可能移除注释导致崩坏 -->

<!-- ✅ 正确：每行独立容器，结构完全可控 -->
<section style="text-align: center;">
  <!-- 第一行 -->
  <section style="display: inline-block; width: 44%; vertical-align: top;">
    卡片1
  </section><!--
  --><section style="display: inline-block; width: 44%; padding-left: 4%; vertical-align: top; box-sizing: border-box;">
    卡片2
  </section>
</section>

<section style="text-align: center;">
  <!-- 第二行 -->
  <section style="display: inline-block; width: 44%; vertical-align: top;">
    卡片3
  </section><!--
  --><section style="display: inline-block; width: 44%; padding-left: 4%; vertical-align: top; box-sizing: border-box;">
    卡片4
  </section>
</section>
```

**为什么必须分行？**

| 风险 | 说明 |
|:---|:---|
| 注释被移除 | WeChat 编辑器可能删除 `<!-- -->`，导致 inline-block 间出现空白间隙 |
| 高度不齐 | 第一行高度不同时，第二行起始位置受影响，可能对不齐 |
| PC 端差异 | PC 端 WeChat 对 inline-block 处理与移动端不一致，连续排列更易崩 |
| 结构失控 | 依赖"自然换行"属于赌运气，无法精确控制 |

**但：层叠/重叠布局不需要行容器！**

行容器是为了"控制并排结构"，不是为了"限制重叠"。

```html
<!-- ✅ 不需要行容器：层叠重叠（用负 margin） -->
<section style="text-align: center;">
  <!-- 底层：大图 -->
  <section style="line-height: 0;">
    <img src="大图.jpg" style="width: 100%;">
  </section>
  
  <!-- 上层：文字卡片，负 margin 压在大图上 -->
  <section style="margin-top: -60px; padding: 0 20px;">
    <section style="background: white; padding: 20px; border-radius: 12px;">
      <p>重叠的文字内容</p>
    </section>
  </section>
</section>
```

---

## 安全宽度参考表

### 双栏布局

| 左列 | 右列 | 间隙方式 | 总宽度 | 安全？ |
|:---:|:---:|:---|:---:|:---:|
| 48% | 48% | margin-right: 4% | 100% | ❌ 超标 |
| 48% | 48% | padding-left: 4% | 96% | ⚠️ 临界 |
| 44% | 44% | padding-left: 4% | 88% | ✅ 安全 |
| 45% | 45% | padding-left: 4% | 90% | ✅ 推荐 |
| 46% | 46% | padding-left: 4% | 92% | ✅ 上限 |

### 三栏布局

| 左列 | 中列 | 右列 | 间隙方式 | 总宽度 | 安全？ |
|:---:|:---:|:---:|:---|:---:|:---:|
| 30% | 30% | 30% | margin: 0 2% | 96% | ⚠️ 临界 |
| 30% | 30% | 30% | padding-left: 2% | 90% | ✅ 安全 |
| 28% | 28% | 28% | padding-left: 4% | 84% | ✅ 推荐 |

---

## 常见错误模式

### 错误模式 1：总宽度超标

```html
<!-- ❌ 超标：48% + 2% margin + 48% = 98% -->
<section style="display: inline-block; width: 48%; margin-right: 2%;">
  左列
</section><!--
--><section style="display: inline-block; width: 48%;">
  右列
</section>
```

**修复**：
```html
<!-- ✅ 安全：44% + padding-left: 4% + 44% = 88% -->
<section style="display: inline-block; width: 44%; vertical-align: top;">
  左列
</section><!--
--><section style="display: inline-block; width: 44%; padding-left: 4%; vertical-align: top; box-sizing: border-box;">
  右列
</section>
```

### 错误模式 2：margin 做间隙

```html
<!-- ❌ margin 增加总宽度 -->
<section style="display: inline-block; width: 46%; margin-right: 4%;">
  左列
</section><!--
--><section style="display: inline-block; width: 46%;">
  右列
</section>
<!-- 46% + 4% + 46% = 96% ❌ -->
```

**修复**：
```html
<!-- ✅ padding 内部消化 -->
<section style="display: inline-block; width: 44%; vertical-align: top;">
  左列
</section><!--
--><section style="display: inline-block; width: 44%; padding-left: 4%; vertical-align: top; box-sizing: border-box;">
  右列
</section>
<!-- 44% + 44% = 88% ✅ -->
```

### 错误模式 3：四块连排赌换行

```html
<!-- ❌ 高危：依赖自然换行 -->
<section style="text-align: center;">
  <section style="display: inline-block; width: 48%;">卡片1</section><!--
  --><section style="display: inline-block; width: 48%;">卡片2</section><!--
  --><section style="display: inline-block; width: 48%;">卡片3</section><!--
  --><section style="display: inline-block; width: 48%;">卡片4</section>
</section>
```

**修复**：
```html
<!-- ✅ 安全：每行独立容器 -->
<!-- 第一行 -->
<section style="text-align: center;">
  <section style="display: inline-block; width: 44%; vertical-align: top;">
    卡片1
  </section><!--
  --><section style="display: inline-block; width: 44%; padding-left: 4%; vertical-align: top; box-sizing: border-box;">
    卡片2
  </section>
</section>

<!-- 第二行 -->
<section style="text-align: center;">
  <section style="display: inline-block; width: 44%; vertical-align: top;">
    卡片3
  </section><!--
  --><section style="display: inline-block; width: 44%; padding-left: 4%; vertical-align: top; box-sizing: border-box;">
    卡片4
  </section>
</section>
```

---

## 自查检查项

### 代码层面

| # | 检查项 | 正确 | 错误 |
|:---|:---|:---|:---|
| 1 | 双栏总宽度 | ≤ 92%（推荐 ≤ 90%） | > 92% |
| 2 | 间隙方式 | `padding-left` + `box-sizing: border-box` | `margin-right` |
| 3 | 行容器结构 | 需要并排时：每行独立父容器 | 多行塞进同一容器赌换行 |
| 4 | 注释分隔 | `<!-- -->` 消除 inline-block 间隙 | 无注释或空格 |
| 5 | 垂直对齐 | `vertical-align: top` | 默认 baseline |
| 6 | 层叠布局 | 负 margin 实现重叠（不需要行容器） | 误用行容器限制重叠 |

### 视觉层面

| # | 检查项 | 正确 | 错误 |
|:---|:---|:---|:---|
| 7 | 两列高度 | 基本一致或可控 | 差异大导致第二行错位 |
| 8 | PC 端显示 | 两列正常并排 | 第二列被挤下 |
| 9 | 移动端显示 | 两列正常并排 | 出现水平滚动 |

---

## 快速修复模板

### 标准双栏（安全模板）

```html
<!-- 标准双栏：90% 总宽度，安全 -->
<section style="text-align: center; padding: 0 15px;">
  
  <!-- 左列：45% -->
  <section style="display: inline-block; width: 45%; vertical-align: top; box-sizing: border-box;">
    <section style="background: rgb(255,255,255); padding: 20px; border-radius: 12px;">
      <p>左列内容</p>
    </section>
  </section><!--
  
  --><!-- 右列：45% + 4% padding-left = 内部间隙 -->
  <section style="display: inline-block; width: 45%; padding-left: 4%; vertical-align: top; box-sizing: border-box;">
    <section style="background: rgb(255,255,255); padding: 20px; border-radius: 12px;">
      <p>右列内容</p>
    </section>
  </section>
  
</section>
```

### 两行四卡片（安全模板）

```html
<!-- 第一行 -->
<section style="text-align: center; padding: 0 15px; margin-bottom: 15px;">
  <section style="display: inline-block; width: 45%; vertical-align: top;">
    <section style="background: rgb(250,248,245); padding: 20px; border-radius: 12px;">
      <p>卡片1</p>
    </section>
  </section><!--
  --><section style="display: inline-block; width: 45%; padding-left: 4%; vertical-align: top; box-sizing: border-box;">
    <section style="background: rgb(250,248,245); padding: 20px; border-radius: 12px;">
      <p>卡片2</p>
    </section>
  </section>
</section>

<!-- 第二行 -->
<section style="text-align: center; padding: 0 15px;">
  <section style="display: inline-block; width: 45%; vertical-align: top;">
    <section style="background: rgb(250,248,245); padding: 20px; border-radius: 12px;">
      <p>卡片3</p>
    </section>
  </section><!--
  --><section style="display: inline-block; width: 45%; padding-left: 4%; vertical-align: top; box-sizing: border-box;">
    <section style="background: rgb(250,248,245); padding: 20px; border-radius: 12px;">
      <p>卡片4</p>
    </section>
  </section>
</section>
```

---

## 一句话总结

> **总宽度 ≤ 92%，间隙用 padding-left，每行独立容器，绝不赌换行。**
