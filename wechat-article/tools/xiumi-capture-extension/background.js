const DEFAULT_SERVER_URL = 'http://localhost:8081/save-template';
const DEFAULT_SAVE_PATH = '/home/graham/Projects/wechat-ai-publisher/ xiumi_test';
const BADGE_CLEAR_DELAY = 2500;

chrome.action.onClicked.addListener(async tab => {
  let result;
  try {
    result = await captureAndSaveFromTab(tab, { reason: 'action' });
  } catch (error) {
    result = { success: false, error: error.message };
  }
  await showActionResult(tab && tab.id, result);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true;
});

async function handleMessage(message) {
  try {
    switch (message && message.action) {
      case 'captureActiveSelectionAndSave': {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return captureAndSaveFromTab(tab, { reason: 'message.active', savePath: message.savePath });
      }
      case 'captureXiumiSelectionAndSave': {
        const tab = await findXiumiEditorTab(message.tabId);
        return captureAndSaveFromTab(tab, { reason: 'message.xiumi', savePath: message.savePath });
      }
      case 'getSettings':
        return { success: true, settings: await getSettings() };
      case 'setSettings':
        await chrome.storage.local.set({
          serverUrl: message.serverUrl || DEFAULT_SERVER_URL,
          savePath: message.savePath || ''
        });
        return { success: true, settings: await getSettings() };
      default:
        return { success: false, error: 'Unknown action' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function findXiumiEditorTab(tabId) {
  if (tabId) return chrome.tabs.get(tabId);

  const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true, url: ['https://xiumi.us/studio/v5*'] });
  if (activeTabs[0]) return activeTabs[0];

  const tabs = await chrome.tabs.query({ url: ['https://xiumi.us/studio/v5*'] });
  if (tabs[0]) return tabs[0];

  throw new Error('未找到秀米编辑器标签页');
}

async function captureAndSaveFromTab(tab, options) {
  if (!tab || !tab.id) return { success: false, error: '未找到可捕获的标签页' };
  if (!/^https?:\/\//.test(tab.url || '')) {
    return { success: false, error: `不支持捕获此页面: ${tab.url || '(unknown)'}` };
  }

  const capture = await captureSelectionFromTab(tab.id);
  if (!capture.success) return capture;

  const settings = await getSettings();
  const payload = {
    html: capture.html,
    title: capture.title || tab.title || '',
    sourceUrl: tab.url || capture.url || '',
    capturedAt: new Date().toISOString(),
    savePath: options.savePath != null ? options.savePath : settings.savePath,
    desc: capture.source || '',
    wxAuthor: ''
  };

  const saveResult = await postTemplate(settings.serverUrl, payload);
  const result = {
    success: true,
    capture: {
      source: capture.source,
      title: payload.title,
      sourceUrl: payload.sourceUrl,
      sizeBytes: new Blob([capture.html]).size,
      selectedTextLength: capture.selectedTextLength
    },
    save: saveResult
  };

  await chrome.storage.local.set({ lastResult: result, lastError: null });
  return result;
}

async function captureSelectionFromTab(tabId) {
  const [execution] = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: captureSelectionInPage
  });

  const result = execution && execution.result;
  if (!result || !result.html) {
    return { success: false, error: result && result.error ? result.error : '当前页面没有可保存的选区' };
  }
  return { success: true, ...result };
}

async function getSettings() {
  const stored = await chrome.storage.local.get(['serverUrl', 'savePath']);
  return {
    serverUrl: stored.serverUrl || DEFAULT_SERVER_URL,
    savePath: stored.savePath || DEFAULT_SAVE_PATH
  };
}

async function postTemplate(serverUrl, payload) {
  const resp = await fetch(serverUrl || DEFAULT_SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) throw new Error(`保存服务器返回 HTTP ${resp.status}`);
  return resp.json();
}

async function showActionResult(tabId, result) {
  if (!tabId) return;
  const ok = !!(result && result.success);
  await chrome.action.setBadgeBackgroundColor({ tabId, color: ok ? '#07c160' : '#d93025' });
  await chrome.action.setBadgeText({ tabId, text: ok ? 'OK' : 'ERR' });

  if (!ok) await chrome.storage.local.set({ lastError: result && result.error ? result.error : '保存失败' });

  setTimeout(() => {
    chrome.action.setBadgeText({ tabId, text: '' }).catch(() => {});
  }, BADGE_CLEAR_DELAY);
}

function captureSelectionInPage() {
  function textOf(node) {
    return (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function absoluteUrl(value) {
    if (!value) return '';
    try {
      return new URL(value, location.href).href;
    } catch (_) {
      return value;
    }
  }

  function normalizeFragment(container) {
    container.querySelectorAll('script,noscript').forEach(el => el.remove());

    container.querySelectorAll('img').forEach(img => {
      const fallback = img.getAttribute('data-src') ||
        img.getAttribute('data-original') ||
        img.getAttribute('data-url') ||
        img.getAttribute('data-actualsrc') ||
        img.getAttribute('src');

      if (fallback) img.setAttribute('src', absoluteUrl(fallback));

      ['data-src', 'data-original', 'data-url', 'data-actualsrc'].forEach(name => {
        if (img.hasAttribute(name)) img.setAttribute(name, absoluteUrl(img.getAttribute(name)));
      });
    });

    container.querySelectorAll('[data-bg]').forEach(el => {
      const bg = el.getAttribute('data-bg');
      if (bg) el.style.backgroundImage = `url(${absoluteUrl(bg)})`;
    });

    container.querySelectorAll('[style]').forEach(el => {
      const style = el.getAttribute('style') || '';
      const fixed = style.replace(/url\((['"]?)(\/\/[^)'"]+)\1\)/g, (_, quote, url) => `url(${quote}${location.protocol}${url}${quote})`);
      if (fixed !== style) el.setAttribute('style', fixed);
    });
  }

  function selectionToHtml(win, source) {
    const sel = win.getSelection && win.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;

    const container = win.document.createElement('div');
    for (let i = 0; i < sel.rangeCount; i++) {
      const range = sel.getRangeAt(i);
      if (!range.collapsed) container.appendChild(range.cloneContents());
    }

    normalizeFragment(container);
    const html = container.innerHTML;
    if (!html || html.length < 20) return null;

    return {
      html,
      source,
      title: document.title || '',
      url: location.href,
      selectedTextLength: textOf(container).length
    };
  }

  const mainSelection = selectionToHtml(window, 'selection:main');
  if (mainSelection) return mainSelection;

  const frames = Array.from(document.querySelectorAll('iframe'));
  for (let i = 0; i < frames.length; i++) {
    try {
      const frameWin = frames[i].contentWindow;
      const frameSelection = frameWin && selectionToHtml(frameWin, `selection:iframe:${i}`);
      if (frameSelection) return frameSelection;
    } catch (_) {}
  }

  return { error: '当前页面没有选中的内容，请先选中需要保存的图文区域' };
}
