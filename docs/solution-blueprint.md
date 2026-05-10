# 微信排版 Skill 四大改进方案

---

## 一、组件与模板 — ModeHub 云端模板库

### 问题
AI 生成模板质量不稳定，用户难以获取丰富的排版素材。

### 方案
建立 ModeHub 中心化模板仓库，存放微信兼容的 HTML 模板和组件。

### 数据来源
1. **秀米全量抓取**：API 公开，无需登录，模板 ID 范围 1 ~ 151797
   - 模板元数据：`GET /api/show_goods/goodses/{id}` → 标题、价格、作者、show_id
   - 阅读页：`a.xiumius.cn/board/v5/{code}/{show_id}` → 解出 `show_data_url`
   - 模板数据：`sd.xiumius.cn/xmi/pd/{path}.json` → 完整 cube/page/layer/cell 结构
2. **数量**：约 10.9 万个模板（62% 命中率）
3. **数据格式**：多数为秀米内部格式（cube/cell），少数含预渲染 HTML（rendererAccelerate）

### 处理流程（两阶段）

**脚本层（不需要 AI）**
```
JSON 下载 ✓      →  xiumi_fetch.py（边扫边下，40 并发，断点续传）
元数据提取       →  title / desc / price / seller / 浏览量 / 分类标签
结构检测         →  cubes 数量、图片数量、含 SVG/动图标记
作者限制过滤     →  读 seller + desc 关键字，标记跳过
占位图替换       →  所有图片 → 空白占位图（避免版权问题）
```

**Agent Team 层（需要 AI）**
```
理解排版意图     →  读 cube/page/layer/cell → 识别标题区/双栏/引用卡片
语义翻译         →  秀米 flex/rgba → 微信 inline-block/rgb
风格萃取         →  色彩方案、字号层级、圆角风格 → 可复用 theme
3 轮自检         →  代码合规 → 视觉一致 → 内容完整
入库 ModeHub     →  HTML + theme + 元数据 + 分类标签
```

### 成本估算
- DeepSeek V4 Pro（75% 折扣价）：每个模板 $0.04 ≈ ¥0.29
- 10 万个模板：$4,000（折扣期） / $16,000（原价）
- 按浏览量排序，优先复现头部的几千个，成本可控

### 存储架构
```
GitHub: WindGraham/wechat-ai-publisher
  modehub/
    catalog.json          ← 模板索引（几KB，跟着 skill git pull）
    templates/            ← 整页模板（100-500MB）
    components/           ← 零件库（标题/分割线/卡片/图片布局/装饰）
      catalog.json
    index.html            ← 画廊页面（GitHub Pages 托管）
```

### 展示页面
纯静态 `index.html`，读 `catalog.json` 渲染模板画廊：
- 网格展示：缩略图 + 编号 + 名称
- 搜索/筛选：分类、色彩、布局、关键词
- 用户浏览后告诉 AI "用 #0421 模板"
- GitHub Pages 免费托管，零服务器

### 版权规避
- 不搬运秀米专有格式（cube/cell/tn-comp）
- 不搬运作者图片素材（全用占位图替代）
- Agent 复现 = 全新代码实现，排版骨架不受版权保护
- 作者声明限制的模板跳过

### 用户同步更新
AI 启动时对比本地 `catalog.json` 版本号 vs GitHub → 自动拉新索引 → 告知"新增 N 个模板"。模板本体按需从 GitHub raw URL 取，不下载到本地。

---

## 二、用户指导 — 排版控制台

### 问题
用户用自然语言描述排版意图存在歧义，AI 难以精准理解。"左上图 + 右下图文穿插 + 底部标签压边界" 很难一次说清。

### 方案
升级 `layout-composer.html` 为两阶段排版控制台。

### 阶段一：空间草稿
- 拖拽**抽象块**到 375px 画布（大图区、双栏区、文字区、分割线）
- 只表达空间占位意图，不涉及具体样式
- 导出布局 JSON：`[{type:"hero", y:0, h:200}, {type:"image-grid", images:3, y:250}]`
- AI 读草稿 → 生成初版 HTML

### 阶段二：组件替换
- 控制台左侧从 ModeHub `catalog.json` 拉取组件列表
- 标题 #H01~、分割线 #D01~、卡片 #C01~、图片布局 #I01~
- 用户说"标题换 #H03"、"分割线换 #D07"
- 控制台从 ModeHub 拉取对应组件 HTML，画布上实时渲染
- 最终确认后 AI 生成微信 HTML

### 与现有工具的关系
- 现有的 `layout-composer.html`（6 种抽象矩形 + 拖拽）作为阶段一的基础
- 复杂度对用户隐藏：先定骨架、再换零件，不需要同时面对所有选项

---

## 三、流程优化 — 状态机与容错

### 问题
当前流程步骤多（Phase 0-3 共 16 步），缺少错误恢复机制。

### 方案（待细化）

核心方向：
- 引入状态机，每步失败可回退重试，而不是从零开始
- 为简单文章提供快速通道，跳过不必要的询问
- `xiumi_fetch.py` 的断点续传模式（checkpoint）作为参考——其他步骤也应有类似机制

具体方案待进一步讨论。

---

## 四、同步更新 — 版本化与模块化

### 问题
远端更新 Skill 后，用户需要手动复制文件。模板库和 Skill 可能版本不同步。

### 方案

**更新机制**
- Skill 目录只存流程逻辑 + `catalog.json`（几 KB）
- 模板/组件本体在 GitHub，按需远程取
- AI 启动时比对版本号，自动拉新

**用户侧零负担**
```
git pull → catalog.json 自动更新 → AI 告知新增模板 → 按需 webfetch 取 HTML
```

**模块化**
- Skill 核心流程（SKILL.md + references）和模板库（ModeHub）独立维护
- 模板库更新不影响 Skill 版本，反之亦然
- GitHub Pages 作为模板展示层，不依赖 Skill

---

## 当前进度

| 任务 | 状态 |
|:---|:---|
| 秀米 10.9 万模板 JSON 下载 | ✅ 完成 |
| 文件夹按 ID 前缀分散 | 🔄 待运行 split.sh |
| 拉取模板浏览量 | 🔄 待运行 fetch_views.py |
| 扫描遗漏 ID 区间 (1-8505, 152K+) | ⏳ 待做 |
| 按浏览量排序确定复现优先级 | ⏳ 待做 |
| Agent Team 复现代码 | ⏳ 待做 |
| ModeHub 建库 | ⏳ 待做 |
| 画廊页面 index.html | ⏳ 待做 |
| 排版控制台升级 | ⏳ 待做 |
| Skill 流程优化 | ⏳ 待讨论 |
