# Self-Check Workflow & Mandatory Checklist

微信公众号文章生成后的强制自查流程和清单。

## 为什么需要自查？

- 防止低级错误（标签未闭合、样式冲突）
- 确保微信兼容性（避免被编辑器过滤）
- 保证视觉一致性（间距、颜色、对齐）
- 验证图片可用性（防止发布后图片失效）

---

## 自查流程（3 轮检查）

### 第一轮：代码合规检查（Code Compliance Check）

**时机**：HTML 生成完成后立即执行
**执行者**：AI 自动检查
**通过标准**：全部勾选才能进入下一轮

| # | 检查项 | 检查方法 | 不通过的后果 |
|:---|:---|:---|:---|
| 1 | 根容器是 `<section>` 且 `max-width: 375px` | 搜索 `<section` 和 `375px` | 移动端显示异常 |
| 2 | 所有样式都是内联（`style="..."`） | 搜索 `<style` 或 `class=` | 微信编辑器过滤样式 |
| 3 | 无 `<script>`、`<iframe>`、`<table>`、`<form>` | 搜索禁用标签 | 内容被过滤或显示异常 |
| 4 | 无 `position: absolute/fixed` | 搜索 `position:` | 布局错乱 |
| 5 | 无 `display: grid` | 搜索 `grid` | PC 端微信不支持 |
| 6 | 无 `<foreignObject>`；若使用 SVG 需符合 `svg-compatibility.md` | 搜索 `<foreignObject` | 高风险标签导致布局崩溃 |
| 7 | 无 CSS 动画/过渡（`animation`、`transition`） | 搜索动画属性 | 被过滤，无效果 |
| 8 | 图片有 `width: 100%; display: block; margin: 0 auto;` | 搜索 `<img` 检查样式 | 图片错位或溢出 |
| 9 | 双栏总宽度 ≤ 92%（移动端安全） | 计算 width + padding | 右栏被挤到下一行 |
| 10 | 三栏使用 `padding-left` 而非 `margin` | 检查间隙实现方式 | 宽度溢出 |
| 11 | 渐变结束色不透明（`rgb()` 非 `rgba()`） | 检查渐变定义 | 背景变灰/ muddy |
| 12 | 标签闭合正确（`<section>` 有 `</section>`） | 计数对比 | 布局错乱 |

**自查命令**（AI 内部执行）：
```python
def code_compliance_check(html):
    errors = []
    
    # 1. 根容器检查
    if 'max-width: 375px' not in html:
        errors.append("❌ 缺少 375px 根容器")
    
    # 2. 内联样式检查
    if '<style' in html or 'class=' in html:
        errors.append("❌ 发现 <style> 或 class 属性")
    
    # 3. 禁用标签检查
    forbidden_tags = ['<script', '<iframe', '<table', '<form', '<foreignObject']
    for tag in forbidden_tags:
        if tag in html:
            errors.append(f"❌ 发现禁用标签: {tag}")
    
    # 4. 禁用 CSS 检查
    forbidden_css = ['position: absolute', 'position: fixed', 'display: grid', 'animation:', 'transition:']
    for css in forbidden_css:
        if css in html:
            errors.append(f"❌ 发现禁用 CSS: {css}")
    
    # 5. 图片样式检查
    img_tags = re.findall(r'<img[^>]*>', html)
    for img in img_tags:
        if 'width: 100%' not in img or 'display: block' not in img:
            errors.append(f"❌ 图片缺少必要样式: {img[:50]}")
    
    # 6. 宽度检查（双栏）
    two_col_pattern = r'width:\s*(\d+)%.*?width:\s*(\d+)%'
    matches = re.findall(two_col_pattern, html, re.DOTALL)
    for w1, w2 in matches:
        if int(w1) + int(w2) > 92:
            errors.append(f"❌ 双栏宽度超标: {w1}% + {w2}% = {int(w1)+int(w2)}% > 92%")
    
    return errors
```

---

### 第二轮：视觉一致性检查（Visual Consistency Check）

**时机**：代码合规通过后执行
**执行者**：AI 自动检查 + 截图验证
**通过标准**：全部勾选才能进入下一轮

| # | 检查项 | 检查方法 | 不通过的后果 |
|:---|:---|:---|:---|
| 1 | 主题色一致（所有色值统一） | 提取所有 `rgb()`/`#` 色值对比 | 视觉混乱 |
| 2 | 圆角一致（12px-20px 范围内统一） | 提取所有 `border-radius` | 风格不统一 |
| 3 | 间距一致（段落间距、卡片间距统一） | 提取所有 `margin`/`padding` | 排版松散或拥挤 |
| 4 | 字号层级清晰（标题 > 正文 > 注释） | 提取所有 `font-size` | 阅读困难 |
| 5 | 文字对齐正确（正文左对齐，标题居中） | 检查 `text-align` | 阅读体验差 |
| 6 | 无文字被图片遮挡 | 截图检查重叠区域 | 内容不可读 |
| 7 | 图片无拉伸变形 | 检查 `object-fit` 或比例 | 图片失真 |
| 8 | 阴影层次合理（不重叠冲突） | 截图检查阴影效果 | 视觉脏乱 |
| 9 | 移动端预览正常（375px 宽度） | 浏览器设备模拟 | 手机显示异常 |
| 10 | PC 端预览居中（灰色边距） | 浏览器宽屏查看 | 内容偏左 |

**自查命令**（AI 内部执行）：
```python
def visual_consistency_check(html):
    errors = []
    
    # 1. 主题色一致性
    colors = re.findall(r'rgb\([^)]+\)|#[a-fA-F0-9]{3,6}', html)
    unique_colors = set(colors)
    if len(unique_colors) > 8:  # 主题色 + 辅色 + 文字色 + 背景色
        errors.append(f"⚠️ 颜色过多({len(unique_colors)})，建议控制在 6-8 种")
    
    # 2. 圆角一致性
    radii = re.findall(r'border-radius:\s*(\d+)px', html)
    unique_radii = set(radii)
    if len(unique_radii) > 3:
        errors.append(f"⚠️ 圆角不统一({unique_radii})，建议 2-3 种")
    
    # 3. 字号层级
    sizes = re.findall(r'font-size:\s*(\d+)px', html)
    size_set = set(int(s) for s in sizes)
    if len(size_set) < 3:
        errors.append("⚠️ 字号层级不足，建议至少 3 级（标题/正文/注释）")
    
    # 4. 间距一致性
    margins = re.findall(r'margin[^:]*:\s*(\d+)px', html)
    margin_set = set(int(m) for m in margins)
    if len(margin_set) > 5:
        errors.append(f"⚠️ 间距种类过多({len(margin_set)})，建议统一")
    
    return errors
```

---

### 第三轮：内容完整性检查（Content Integrity Check）

**时机**：视觉一致性通过后执行
**执行者**：AI 自动检查 + 用户确认
**通过标准**：全部勾选才能交付

| # | 检查项 | 检查方法 | 不通过的后果 |
|:---|:---|:---|:---|
| 1 | 用户提供的文字内容完整保留 | 对比原文和 HTML | 内容丢失 |
| 2 | 图片 URL 全部可访问（HTTP 200） | `curl -I` 测试每个 URL | 图片显示失败 |
| 3 | 无占位符残留（如"placeholder"、"示例"） | 搜索占位关键词 | 内容未完成 |
| 4 | 作者/来源信息正确（未编造） | 检查落款区域 | 虚假信息 |
| 5 | 链接可点击且正确（如有） | 验证 `href` | 链接失效 |
| 6 | 无敏感信息泄露 | 检查隐私内容 | 隐私风险 |
| 7 | 文章标题和摘要正确 | 检查 `<title>` 和摘要 | SEO/分享异常 |
| 8 | 发布时间/日期准确（如有） | 验证日期格式 | 信息错误 |

**自查命令**（AI 内部执行）：
```python
def content_integrity_check(html, original_text):
    errors = []
    
    # 1. 内容完整性
    if len(original_text) > 0:
        # 检查关键段落是否保留
        key_sentences = original_text.split('。')[:3]  # 前3句
        for sentence in key_sentences:
            if sentence[:10] not in html:  # 前10个字作为标识
                errors.append(f"⚠️ 可能丢失内容: {sentence[:20]}...")
    
    # 2. 图片可访问性
    img_urls = re.findall(r'src="(https?://[^"]+)"', html)
    for url in img_urls:
        try:
            response = requests.head(url, timeout=5)
            if response.status_code != 200:
                errors.append(f"❌ 图片不可访问: {url} (Status: {response.status_code})")
        except:
            errors.append(f"❌ 图片访问失败: {url}")
    
    # 3. 占位符检查
    placeholders = ['placeholder', '示例', '占位', 'placeholder', 'xxx', '待填']
    for ph in placeholders:
        if ph in html:
            errors.append(f"⚠️ 发现占位符: '{ph}'")
    
    # 4. 敏感信息检查（简单规则）
    sensitive_patterns = [
        r'1[3-9]\d{9}',  # 手机号
        r'\d{18}',       # 身份证号
        r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',  # 邮箱
    ]
    for pattern in sensitive_patterns:
        matches = re.findall(pattern, html)
        if matches:
            errors.append(f"⚠️ 发现可能的敏感信息: {matches[0][:10]}...")
    
    return errors
```

---

## 自查报告模板

检查完成后，向用户输出报告：

```text
📋 自查报告

✅ 第一轮：代码合规（12/12 通过）
✅ 第二轮：视觉一致（10/10 通过）
✅ 第三轮：内容完整（8/8 通过）

🎉 所有检查通过！文章可以交付。

---
或 ---

📋 自查报告

✅ 第一轮：代码合规（11/12 通过）
⚠️ 第7项：发现 1 处 CSS 过渡（已移除）

✅ 第二轮：视觉一致（9/10 通过）
⚠️ 第2项：圆角有 4 种（建议统一为 2 种）

❌ 第三轮：内容完整（7/8 通过）
❌ 第2项：1 张图片不可访问（URL: xxx）

🔧 需要修复：
1. 统一圆角为 12px 和 16px
2. 替换失效图片 URL

修复后重新检查？[Y/n]
```

---

## 用户可见 vs AI 内部

| 检查轮次 | 用户可见 | AI 内部自动 | 说明 |
|:---|:---|:---|:---|
| 代码合规 | ⚠️ 仅报告问题 | ✅ 全自动执行 | 技术细节，用户不关心 |
| 视觉一致 | ✅ 报告 + 截图 | ✅ 全自动执行 | 用户可查看截图 |
| 内容完整 | ✅ 报告 + 确认 | ⚠️ 半自动 | 需用户确认内容正确 |

---

## 与现有 checklist 的关系

本自查流程是对 `generation-checklist.md` 的**执行层补充**：

- `generation-checklist.md`：告诉 AI "要检查什么"（What）
- `self-check-workflow.md`：告诉 AI "怎么检查、何时检查、怎么报告"（How & When）

两者配合使用，确保从"知道要查"到"实际执行"的闭环。
## 背景色处理检查（新增）

### 为什么背景色需要特殊检查？

微信编辑器会**强制将文章背景设为白色**！这意味着：

| 错误做法 | 后果 |
|:---|:---|
| 根容器设置 `background-color` | 被微信覆盖，显示为白色 |
| 使用 `rgba(..., 0.x)` 半透明色 | 与白色背景混合，颜色变灰/脏 |
| 依赖透明背景实现效果 | 在微信中显示异常 |

### 正确的背景色处理方式

```html
<!-- ❌ 错误：根容器设置背景色（会被微信覆盖） -->
<section style="max-width: 375px; background-color: rgb(250,248,245);">
  <!-- 内容 -->
</section>

<!-- ✅ 正确：用 wrapper section 包裹内容区块 -->
<section style="max-width: 375px; margin: 0 auto;">
  <!-- 深色主题区块 -->
  <section style="background-color: rgb(45,45,55); padding: 30px 20px;">
    <p style="color: rgb(255,255,255);">白色文字</p>
  </section>
  
  <!-- 浅色主题区块 -->
  <section style="background-color: rgb(250,248,245); padding: 30px 20px;">
    <p style="color: rgb(62,62,62);">深色文字</p>
  </section>
</section>
```

### 自查要点

| # | 检查项 | 正确做法 | 错误做法 |
|:---|:---|:---|:---|
| 1 | 根容器背景 | 不设置 `background-color` | 设置 `background-color` |
| 2 | 区块背景 | 用 wrapper `section` 包裹 | 直接给内容元素加背景 |
| 3 | 渐变背景 | 开始和结束色都用不透明 `rgb()` | 使用 `rgba()` 半透明 |
| 4 | 深色主题 | 每个区块单独设深色背景 | 期望根容器深色 |
| 5 | 纹理/图片背景 | 用 `background-image` 在 wrapper 上 | 依赖透明层叠 |

### 检查代码示例

```python
def background_check(html):
    errors = []
    
    # 1. 检查根容器是否设置了 background-color
    root_pattern = r'<section[^>]*style="[^"]*max-width:\s*375px[^"]*"[^>]*>'
    root_match = re.search(root_pattern, html)
    if root_match and 'background-color' in root_match.group(0):
        errors.append("❌ 根容器设置了 background-color，会被微信覆盖")
    
    # 2. 检查是否使用了 rgba 半透明
    rgba_pattern = r'rgba\([^)]*\d+\.?\d*\)'
    rgba_matches = re.findall(rgba_pattern, html)
    for match in rgba_matches:
        # 提取 alpha 值
        alpha = float(match.split(',')[-1].strip().rstrip(')'))
        if alpha < 1.0:
            errors.append(f"⚠️ 发现半透明颜色: {match}，可能与白色背景混合变灰")
    
    # 3. 检查渐变是否使用不透明色
    gradient_pattern = r'linear-gradient\([^)]+\)'
    gradients = re.findall(gradient_pattern, html)
    for grad in gradients:
        if 'rgba' in grad:
            errors.append(f"⚠️ 渐变使用 rgba: {grad[:50]}...")
    
    # 4. 检查深色主题实现方式
    dark_colors = ['rgb(30', 'rgb(40', 'rgb(45', 'rgb(50', '#2d2d', '#1a1a']
    for color in dark_colors:
        if color in html:
            # 检查是否包裹在 section 中
            idx = html.find(color)
            surrounding = html[max(0, idx-200):idx+200]
            if '<section' not in surrounding:
                errors.append(f"⚠️ 深色颜色 {color} 未包裹在 section 中")
    
    return errors
```

### 常见场景处理

#### 场景 1：全篇深色主题
```html
<!-- ✅ 正确：每个区块单独设置 -->
<section style="max-width: 375px; margin: 0 auto;">
  <section style="background: rgb(45,45,55); padding: 40px 20px;">
    <p style="color: rgb(255,255,255); font-size: 24px;"><strong>标题</strong></p>
  </section>
  <section style="background: rgb(55,55,65); padding: 30px 20px;">
    <p style="color: rgb(220,220,230);">正文内容...</p>
  </section>
</section>
```

#### 场景 2：区块交替色
```html
<!-- ✅ 正确：每个区块独立背景 -->
<section style="max-width: 375px; margin: 0 auto;">
  <!-- 白色区块 -->
  <section style="background: rgb(255,255,255); padding: 30px 20px;">
    <p>内容...</p>
  </section>
  
  <!-- 米色区块 -->
  <section style="background: rgb(250,248,245); padding: 30px 20px;">
    <p>内容...</p>
  </section>
  
  <!-- 深色区块 -->
  <section style="background: rgb(78,128,88); padding: 30px 20px;">
    <p style="color: rgb(255,255,255);">内容...</p>
  </section>
</section>
```

#### 场景 3：渐变背景区块
```html
<!-- ✅ 正确：不透明渐变 -->
<section style="background: linear-gradient(135deg, rgb(78,128,88), rgb(95,145,105)); 
                padding: 40px 20px;">
  <p style="color: rgb(255,255,255);">渐变背景内容</p>
</section>

<!-- ❌ 错误：半透明渐变 -->
<section style="background: linear-gradient(135deg, rgba(78,128,88,0.9), rgba(95,145,105,0.9));
                padding: 40px 20px;">
  <p>内容</p>
</section>
```
