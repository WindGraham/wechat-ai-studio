# Background Color Handling Guide

微信公众号文章背景色处理完整指南

## 核心问题

微信编辑器会**强制将文章根背景设为白色**。这意味着：

| 错误做法 | 后果 |
|:---|:---|
| 根容器设置 `background-color` | 被微信覆盖，显示为白色 |
| 使用 `rgba(..., 0.x)` 半透明色 | 与白色背景混合，颜色变灰/脏 |
| 依赖透明背景实现层叠效果 | 在微信中显示异常 |

## 解决方案

### 方案 1：区块包裹法（推荐）

**核心思想**：不用根容器设背景，而是用 **wrapper section** 包裹每个内容区块

```html
<!-- ✅ 正确：每个区块单独设背景 -->
<section style="max-width: 375px; margin: 0 auto;">
  
  <!-- 深色区块 -->
  <section style="background: rgb(45,45,55); padding: 40px 20px;">
    <p style="color: rgb(255,255,255); font-size: 24px;">
      <strong>标题</strong>
    </p>
  </section>
  
  <!-- 浅色区块 -->
  <section style="background: rgb(250,248,245); padding: 30px 20px;">
    <p style="color: rgb(62,62,62);">正文内容...</p>
  </section>
  
  <!-- 彩色区块 -->
  <section style="background: rgb(78,128,88); padding: 30px 20px;">
    <p style="color: rgb(255,255,255);">引用内容...</p>
  </section>
  
</section>
```

**效果**：微信强制白色背景，但每个内容区块有自己的背景色

---

### 方案 2：全篇统一背景色

```html
<section style="max-width: 375px; margin: 0 auto;">
  
  <!-- 全篇统一米色背景 -->
  <section style="background: rgb(250,248,245); padding: 40px 20px;">
    <p style="color: rgb(62,62,62); font-size: 24px;">
      <strong>标题</strong>
    </p>
  </section>
  
  <section style="background: rgb(250,248,245); padding: 30px 20px;">
    <p style="color: rgb(62,62,62);">正文内容...</p>
  </section>
  
  <section style="background: rgb(250,248,245); padding: 30px 20px;">
    <p style="color: rgb(62,62,62);">更多内容...</p>
  </section>
  
</section>
```

**效果**：全篇统一米色背景，视觉连贯

---

### 方案 3：渐变背景区块

```html
<!-- ✅ 正确：不透明渐变 -->
<section style="background: linear-gradient(135deg, rgb(78,128,88), rgb(95,145,105)); 
                padding: 40px 20px;">
  <p style="color: rgb(255,255,255);">渐变背景内容</p>
</section>

<!-- ❌ 错误：半透明渐变（会与白色背景混合变灰） -->
<section style="background: linear-gradient(135deg, rgba(78,128,88,0.9), rgba(95,145,105,0.9));">
  <p>内容</p>
</section>
```

**关键点**：
- 开始色：`rgb(78,128,88)` ✅
- 结束色：`rgb(95,145,105)` ✅
- 不要用：`rgba(78,128,88,0.9)` ❌

---

### 方案 4：密铺背景色（全篇覆盖）

通过多个 wrapper section 紧密拼接，实现全篇背景色覆盖：

```html
<section style="max-width: 375px; margin: 0 auto;">
  
  <!-- 区块1：深色 -->
  <section style="background: rgb(45,45,55); padding: 40px 20px;">
    <p style="color: rgb(255,255,255); font-size: 24px;">
      <strong>标题区域</strong>
    </p>
  </section>
  
  <!-- 区块2：浅色（无边距，紧密拼接） -->
  <section style="background: rgb(250,248,245); padding: 30px 20px;">
    <p style="color: rgb(62,62,62);">正文内容...</p>
  </section>
  
  <!-- 区块3：深色 -->
  <section style="background: rgb(55,55,65); padding: 30px 20px;">
    <p style="color: rgb(220,220,230);">引用内容...</p>
  </section>
  
  <!-- 区块4：浅色 -->
  <section style="background: rgb(250,248,245); padding: 30px 20px;">
    <p style="color: rgb(62,62,62);">更多内容...</p>
  </section>
  
  <!-- 区块5：彩色强调 -->
  <section style="background: rgb(78,128,88); padding: 40px 20px;">
    <p style="color: rgb(255,255,255); font-size: 20px;">
      <strong>结语区域</strong>
    </p>
  </section>
  
</section>
```

**效果**：深色/浅色/彩色区块紧密拼接，形成密铺效果

---

## 自查要点

| # | 检查项 | 正确做法 | 错误做法 |
|:---|:---|:---|:---|
| 1 | 根容器背景 | 不设置 `background-color` | 设置 `background-color` |
| 2 | 区块背景 | 用 wrapper `section` 包裹 | 直接给内容元素加背景 |
| 3 | 渐变背景 | 开始和结束色都用不透明 `rgb()` | 使用 `rgba()` 半透明 |
| 4 | 深色主题 | 每个区块单独设深色背景 | 期望根容器深色 |
| 5 | 纹理/图片背景 | 用 `background-image` 在 wrapper 上 | 依赖透明层叠 |
| 6 | 密铺背景 | 多个 wrapper section 紧密拼接 | 留 gap 或 margin |
| 7 | 文字对比 | 深色背景用白字，浅色背景用深字 | 颜色对比不足 |

---

## 检查代码示例

```python
def background_color_check(html):
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
    
    # 5. 检查密铺背景（wrapper section 间无 gap）
    sections = re.findall(r'<section[^>]*>.*?</section>', html, re.DOTALL)
    for i, section in enumerate(sections[:-1]):
        if 'margin' in section:
            errors.append(f"⚠️ 密铺区块 {i} 有 margin，可能导致间隙")
    
    return errors
```

---

## 常见场景示例

### 场景 1：全篇深色主题

```html
<section style="max-width: 375px; margin: 0 auto;">
  <section style="background: rgb(45,45,55); padding: 40px 20px;">
    <p style="color: rgb(255,255,255); font-size: 24px;">
      <strong>深色标题</strong>
    </p>
  </section>
  <section style="background: rgb(55,55,65); padding: 30px 20px;">
    <p style="color: rgb(220,220,230);">深色正文...</p>
  </section>
</section>
```

### 场景 2：区块交替色

```html
<section style="max-width: 375px; margin: 0 auto;">
  <section style="background: rgb(255,255,255); padding: 30px 20px;">
    <p>白色区块内容</p>
  </section>
  <section style="background: rgb(250,248,245); padding: 30px 20px;">
    <p>米色区块内容</p>
  </section>
  <section style="background: rgb(78,128,88); padding: 30px 20px;">
    <p style="color: rgb(255,255,255);">绿色区块内容</p>
  </section>
</section>
```

### 场景 3：卡片式背景

```html
<section style="max-width: 375px; margin: 0 auto;">
  <section style="background: rgb(255,255,255); 
                  margin: 15px; 
                  padding: 25px; 
                  border-radius: 12px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <p>白色卡片内容</p>
  </section>
</section>
```

### 场景 4：杂志风格密铺

```html
<section style="max-width: 375px; margin: 0 auto;">
  
  <!-- 头图区：深色 -->
  <section style="background: rgb(30,30,40); padding: 60px 20px 40px;">
    <p style="color: rgb(200,200,210); font-size: 12px; letter-spacing: 2px;">FEATURED</p>
    <p style="color: rgb(255,255,255); font-size: 28px; margin-top: 15px;">
      <strong>城市探索指南</strong>
    </p>
    <section style="width: 40px; height: 3px; background: rgb(255,183,77); margin-top: 20px;"></section>
  </section>
  
  <!-- 编者按：米色 -->
  <section style="background: rgb(250,248,245); padding: 30px 20px;">
    <p style="color: rgb(100,100,100); font-size: 14px; line-height: 1.8;">
      本文带你走进城市中那些不为人知的角落...
    </p>
  </section>
  
  <!-- 章节1：白色卡片 -->
  <section style="background: rgb(255,255,255); padding: 30px 20px;">
    <p style="color: rgb(78,128,88); font-size: 18px; margin-bottom: 15px;">
      <strong>一、老城区的时光印记</strong>
    </p>
    <p style="color: rgb(62,62,62); line-height: 1.8;">内容...</p>
  </section>
  
  <!-- 引用块：深色 -->
  <section style="background: rgb(45,45,55); padding: 30px 20px;">
    <p style="color: rgb(255,183,77); font-size: 16px; font-style: italic;">
      "城市的魅力不在于高楼大厦..."
    </p>
    <p style="color: rgb(150,150,160); font-size: 12px; margin-top: 10px;">— 城市探索者</p>
  </section>
  
  <!-- 章节2：米色 -->
  <section style="background: rgb(250,248,245); padding: 30px 20px;">
    <p style="color: rgb(62,62,62); line-height: 1.8;">更多内容...</p>
  </section>
  
  <!-- 结语：绿色 -->
  <section style="background: rgb(78,128,88); padding: 40px 20px;">
    <p style="color: rgb(255,255,255); font-size: 18px; text-align: center;">
      <strong>愿你的城市探索之旅充满惊喜</strong>
    </p>
  </section>
  
</section>
```

**效果**：
- 深色头图 → 米色编者按 → 白色章节 → 深色引用 → 米色章节 → 绿色结语
- 色彩交替，层次分明，杂志感十足

---

## 核心原则

> **微信强制白色背景 → 但我们可以在白色背景上放各种颜色的区块**

```
微信编辑器背景（白色，不可改）
   ↓
我们的根容器（透明/无背景）
   ↓
wrapper section（各种颜色：深/浅/渐变/纹理）
   ↓
内容文字（根据背景调整颜色）
```

---

## 与现有文档的关系

- `wechat-rules.md`：背景色约束规则（What not to do）
- `self-check-workflow.md`：背景色检查项（What to check）
- `background-color-guide.md`：背景色实现方案（How to do it right）
