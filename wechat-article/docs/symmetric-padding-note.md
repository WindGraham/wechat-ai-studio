### 规则 X：对称 Padding 保证内容区等宽

`padding-left` 做列间距时，如果只加在右边列上，`box-sizing: border-box` 会让右边列的内容区比左边窄。

**问题**：

```html
<!-- ❌ 左列内容区 = 44%，右列内容区 = 44% − 4% = 不相等 -->
<section style="display: inline-block; width: 44%; vertical-align: top; box-sizing: border-box;">
  左列
</section><!--
--><section style="display: inline-block; width: 44%; padding-left: 4%; vertical-align: top; box-sizing: border-box;">
  右列
</section>
```

左边图片/文字的实际渲染宽度比右边大，视觉上很明显。

**修复**：所有列平分间隙，每列同时加 `padding-left` 和 `padding-right`。

```html
<!-- ✅ 每列内容区 = 44% − 4%，全部相等；gap = 2% + 2% = 4% -->
<section style="display: inline-block; width: 44%; padding-left: 2%; padding-right: 2%; vertical-align: top; box-sizing: border-box;">
  左列
</section><!--
--><section style="display: inline-block; width: 44%; padding-left: 2%; padding-right: 2%; vertical-align: top; box-sizing: border-box;">
  右列
</section>
```

三栏同理——每列 `width: 30%; padding-left: 4px; padding-right: 4px;`，所有列内容区 = `30% − 8px`，间隙均匀 8px，总宽 90%。

**规则**：`gap = 左列 padding-right + 右列 padding-left`，且每列左右 padding 之和须相等，否则内容区不等宽。
