let capturedHtml = '';
let capturedTitle = '';
let selectedTabId = null;

document.addEventListener('DOMContentLoaded', () => {
  const manifest = chrome.runtime.getManifest();
  document.getElementById('version').textContent = 'v' + manifest.version;

  const captureBtn = document.getElementById('captureBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const injectBtn = document.getElementById('injectBtn');
  const pageCard = document.getElementById('pageCard');
  const targetSection = document.getElementById('targetSection');
  const targetList = document.getElementById('targetList');
  const statusArea = document.getElementById('statusArea');

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
        captureBtn.textContent = '📋 捕获页面内容';
        return;
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          let content = '';
          // prefer the root <section> wrapper used by wechat articles
          const rootSection = document.body.querySelector('section');
          if (rootSection && rootSection.parentElement === document.body) {
            content = rootSection.outerHTML;
          } else {
            // fallback: all children of body
            const children = Array.from(document.body.children);
            content = children.map(c => c.outerHTML).join('\n');
          }
          const title = document.title || '';
          return { content, title };
        },
        world: 'MAIN'
      });

      const { content, title } = results[0]?.result || {};
      if (!content) {
        showStatus('页面内容为空', 'error');
        pageCard.innerHTML = '<div class="no-content">页面内容为空</div>';
        captureBtn.disabled = false;
        captureBtn.textContent = '📋 捕获页面内容';
        return;
      }

      capturedHtml = content;
      capturedTitle = title;
      const sizeKB = (new Blob([content]).size / 1024).toFixed(1);
      pageCard.innerHTML = `
        <div class="page-title">${esc(title || '无标题')}</div>
        <div class="page-url">${esc(tab.url)}</div>
        <div class="page-size">${sizeKB} KB · ${content.length} 字符</div>
      `;

      showStatus('捕获成功', 'success');
      targetSection.classList.remove('hidden');
      injectBtn.classList.remove('hidden');
      updateInjectBtn();
    } catch (e) {
      showStatus('捕获失败: ' + e.message + ' — 需在 chrome://extensions 中开启"允许访问文件网址"', 'error');
    } finally {
      captureBtn.disabled = false;
      captureBtn.textContent = '📋 捕获页面内容';
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
