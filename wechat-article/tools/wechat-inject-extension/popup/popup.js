let capturedHtml = '';
let capturedTitle = '';
let selectedTabId = null;

document.addEventListener('DOMContentLoaded', () => {
  const manifest = chrome.runtime.getManifest();
  document.getElementById('version').textContent = 'v' + manifest.version;

  const captureBtn = document.getElementById('captureBtn');
  const saveBtn = document.getElementById('saveBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const injectBtn = document.getElementById('injectBtn');
  const pageCard = document.getElementById('pageCard');
  const targetSection = document.getElementById('targetSection');
  const targetList = document.getElementById('targetList');
  const statusArea = document.getElementById('statusArea');

  // --- Settings gear ---
  const gearBtn = document.getElementById('gearBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const pathInput = document.getElementById('pathInput');
  const savePathBtn = document.getElementById('savePathBtn');
  const cancelPathBtn = document.getElementById('cancelPathBtn');
  const currentPathRow = document.getElementById('currentPathRow');
  const currentPathValue = document.getElementById('currentPathValue');
  const editPathLink = document.getElementById('editPathLink');

  loadPath();

  gearBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
    if (!settingsPanel.classList.contains('hidden')) {
      pathInput.value = currentPathValue.textContent || '';
      pathInput.focus();
    }
  });

  savePathBtn.addEventListener('click', () => {
    const path = pathInput.value.trim();
    chrome.storage.local.set({ projectPath: path }, () => {
      settingsPanel.classList.add('hidden');
  loadPath();
    });
  });

  cancelPathBtn.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
  });

  editPathLink.addEventListener('click', () => {
    settingsPanel.classList.remove('hidden');
    pathInput.value = currentPathValue.textContent || '';
    pathInput.focus();
  });

  function loadPath() {
    chrome.storage.local.get(['projectPath'], (result) => {
      if (result.projectPath) {
        currentPathValue.textContent = result.projectPath;
        currentPathRow.classList.remove('hidden');
      } else {
        currentPathRow.classList.add('hidden');
      }
    });
  }

  function showStatus(text, type) {
    statusArea.innerHTML = `<div class="status status-${type}">${text}</div>`;
  }

  // --- Capture page content ---
  captureBtn.addEventListener('click', async () => {
    captureBtn.disabled = true;
    captureBtn.textContent = '⏳ 正在捕获...';
    showStatus('', 'info');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        showStatus('无法获取当前标签页', 'error');
        captureBtn.disabled = false;
        captureBtn.textContent = '📋 捕获选区';
        return;
      }

      // Capture current page selection
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Priority 1: current selection (user Ctrl+A'd)
          const sel = window.getSelection();
          if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (!range.collapsed) {
              const container = document.createElement('div');
              container.appendChild(range.cloneContents());

              // fix lazy images
              container.querySelectorAll('img[data-src]').forEach(function(img) {
                if (!img.src || img.src === '' || img.src === window.location.href) {
                  img.src = img.getAttribute('data-src');
                }
              });
              container.querySelectorAll('img[data-original]').forEach(function(img) {
                if (!img.src || img.src === '' || img.src === window.location.href) {
                  img.src = img.getAttribute('data-original');
                }
              });
              container.querySelectorAll('[data-bg]').forEach(function(el) {
                var bg = el.getAttribute('data-bg');
                if (bg) el.style.backgroundImage = 'url(' + bg + ')';
              });
              // strip SVG style tags (WeChat incompatible)
              container.querySelectorAll('svg style').forEach(function(s) { s.remove(); });

              var html = container.innerHTML;
              if (html && html.length > 100) {
                return { content: html, title: document.title || '', source: 'selection' };
              }
            }
          }

          // Priority 2: try iframes
          const iframes = document.querySelectorAll('iframe');
          for (const iframe of iframes) {
            try {
              const inner = iframe.contentDocument || iframe.contentWindow.document;
              if (inner && inner.body && inner.body.children.length > 2) {
                const ser = new XMLSerializer();
                return { content: ser.serializeToString(inner.body), title: document.title || '', source: 'iframe' };
              }
            } catch (_) {}
          }

          // Priority 3: body
          const ser = new XMLSerializer();
          return { content: ser.serializeToString(document.body), title: document.title || '', source: 'body' };
        },
        world: 'MAIN'
      });

      const result = results[0]?.result || {};
      content = result.content;
      title = result.title;
      source = result.source;

      if (!content) {
        showStatus('页面内容为空 — 请先选中内容', 'error');
        pageCard.innerHTML = '<div class="no-content">未检测到选区，请选中内容后重试</div>';
        captureBtn.disabled = false;
        captureBtn.textContent = '📋 捕获选区';
        return;
      }

      capturedHtml = content;
      capturedTitle = title;
      const sizeKB = (new Blob([content]).size / 1024).toFixed(1);
      const sourceLabel = source === 'selection' ? ' [选区]' : source === 'iframe' ? ' [iframe]' : '';
      pageCard.innerHTML = `
        <div class="page-title">${esc(title || '无标题')}${sourceLabel}</div>
        <div class="page-url">${esc(tab.url)}</div>
        <div class="page-size">${sizeKB} KB · ${content.length} 字符</div>
      `;

      showStatus('捕获成功', 'success');
      saveBtn.classList.remove('hidden');
      targetSection.classList.remove('hidden');
      injectBtn.classList.remove('hidden');
      updateInjectBtn();
    } catch (e) {
      showStatus('捕获失败: ' + e.message, 'error');
    } finally {
      captureBtn.disabled = false;
      captureBtn.textContent = '📋 捕获 Ctrl+A 选区';
    }
  });

  // --- Save template to local project ---
  saveBtn.addEventListener('click', async () => {
    if (!capturedHtml) {
      showStatus('请先捕获页面内容', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ 正在保存...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const stored = await chrome.storage.local.get(['projectPath']);
      const savePath = stored.projectPath || '';

      const payload = {
        html: capturedHtml,
        title: capturedTitle || '',
        sourceUrl: tab?.url || '',
        capturedAt: new Date().toISOString(),
        savePath: savePath
      };

      const resp = await fetch('http://localhost:8081/save-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const data = await resp.json();
        showStatus(`模板已保存 (${(data.sizeBytes / 1024).toFixed(1)}KB) → ${data.path}`, 'success');
      } else {
        showStatus('保存失败: HTTP ' + resp.status, 'error');
      }
    } catch (e) {
      showStatus('保存失败: ' + e.message + ' — 请确认服务器已启动 (python3 save-layout-server.py)', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 保存为模板';
    }
  });

  // --- Find WeChat editors ---
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '⏳ 正在查找...';
    targetList.innerHTML = '<div class="status status-info">查找中...</div>';
    selectedTabId = null;
    updateInjectBtn();

    try {
      const resp = await chrome.runtime.sendMessage({ action: 'queryTargets' });
      const targets = resp.targets || [];

      if (targets.length === 0) {
        targetList.innerHTML = '<div class="status status-info">未找到微信编辑页。<br>请确认：<br>1. 已打开 mp.weixin.qq.com 图文编辑页<br>2. 页面完全加载（不是空白页）<br>3. 编辑页 URL 包含 /cgi-bin/appmsg</div>';
      } else {
        targetList.innerHTML = targets.map((t, i) => `
          <li class="target-item" data-tabid="${t.tabId}" data-index="${i}">
            <img class="target-thumb" src="${t.accountThumb || ''}" onerror="this.style.display='none'">
            <div class="target-info">
              <div class="target-name">${esc(t.accountName || '微信公众号')}</div>
              <div class="target-title">${esc(t.articleTitle || '新建文章')}</div>
            </div>
          </li>
        `).join('');

        targetList.querySelectorAll('.target-item').forEach(item => {
          item.addEventListener('click', () => {
            targetList.querySelectorAll('.target-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            selectedTabId = parseInt(item.dataset.tabid);
            updateInjectBtn();
          });
        });

        // auto-select first
        const first = targetList.querySelector('.target-item');
        if (first) {
          first.classList.add('selected');
          selectedTabId = parseInt(first.dataset.tabid);
          updateInjectBtn();
        }
      }
    } catch (e) {
      targetList.innerHTML = `<div class="status status-error">查找失败: ${esc(e.message)}</div>`;
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = '🔄 查找微信编辑器';
    }
  });

  // --- Inject ---
  injectBtn.addEventListener('click', async () => {
    if (!capturedHtml) {
      showStatus('请先捕获页面内容', 'error');
      return;
    }
    if (!selectedTabId) {
      showStatus('请先选择目标编辑器', 'error');
      return;
    }

    injectBtn.disabled = true;
    injectBtn.textContent = '⏳ 正在注入...';

    try {
      const resp = await chrome.runtime.sendMessage({
        action: 'injectContent',
        payload: {
          tabId: selectedTabId,
          html: capturedHtml,
          title: capturedTitle || undefined
        }
      });

      if (resp.success) {
        showStatus('注入成功！请切换到微信后台标签页查看。建议直接保存，不要继续编辑正文。', 'success');
      } else {
        showStatus('注入失败: ' + (resp.error || '未知错误'), 'error');
      }
    } catch (e) {
      showStatus('通信异常: ' + e.message, 'error');
    } finally {
      injectBtn.disabled = false;
      injectBtn.textContent = '📩 注入';
    }
  });

  function updateInjectBtn() {
    injectBtn.disabled = !capturedHtml || !selectedTabId;
  }
});

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
