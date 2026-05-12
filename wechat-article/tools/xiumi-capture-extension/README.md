# 秀米选区本地保存扩展

这个扩展只做一件事：捕获当前活动页面选中的 HTML，并发送到本地 `save-layout-server.py` 的 `/save-template` 接口保存。

## 使用方式

1. 启动保存服务器：

   `python3 /home/graham/Projects/wechat-ai-publisher/skills/wechat-article/tools/save-layout-server.py`

2. Chrome/Chromium 加载此扩展目录：

   `/home/graham/Projects/wechat-ai-publisher/skills/wechat-article/tools/xiumi-capture-extension`

3. 在秀米导出模式中选中需要保存的图文内容。

4. 点击扩展图标，或按 `Ctrl+Shift+U`。

5. 扩展会自动 POST 到 `http://localhost:8081/save-template`。

## 设置

右键扩展图标打开“选项”，可配置：

- 保存服务器地址
- 模板保存目录

默认保存目录：

`/home/graham/Projects/wechat-ai-publisher/ xiumi_test`

留空保存目录时，扩展也会使用这个默认目录。

## Playwright 触发接口

扩展 background 支持以下消息：

```js
await chrome.runtime.sendMessage({ action: 'captureActiveSelectionAndSave' });
await chrome.runtime.sendMessage({ action: 'captureXiumiSelectionAndSave' });
await chrome.runtime.sendMessage({ action: 'captureXiumiSelectionAndSave', savePath: '/path/to/save' });
```

其中 `captureXiumiSelectionAndSave` 会自动查找 `https://xiumi.us/studio/v5*` 标签页。
