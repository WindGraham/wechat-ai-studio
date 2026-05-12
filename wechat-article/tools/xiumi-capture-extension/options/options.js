const serverUrlInput = document.getElementById('serverUrl');
const savePathInput = document.getElementById('savePath');
const saveBtn = document.getElementById('saveBtn');
const testBtn = document.getElementById('testBtn');
const statusEl = document.getElementById('status');
const DEFAULT_SAVE_PATH = '/home/graham/Projects/wechat-ai-publisher/ xiumi_test';

init();

async function init() {
  const resp = await chrome.runtime.sendMessage({ action: 'getSettings' });
  if (resp.success) {
    serverUrlInput.value = resp.settings.serverUrl || 'http://localhost:8081/save-template';
    savePathInput.value = resp.settings.savePath || DEFAULT_SAVE_PATH;
    setStatus('设置已读取。', 'ok');
  } else {
    setStatus(resp.error || '读取设置失败', 'error');
  }
}

saveBtn.addEventListener('click', async () => {
  const resp = await chrome.runtime.sendMessage({
    action: 'setSettings',
    serverUrl: serverUrlInput.value.trim(),
    savePath: savePathInput.value.trim()
  });

  if (resp.success) setStatus('设置已保存。', 'ok');
  else setStatus(resp.error || '保存设置失败', 'error');
});

testBtn.addEventListener('click', async () => {
  try {
    const resp = await fetch(serverUrlInput.value.trim() || 'http://localhost:8081/save-template', {
      method: 'OPTIONS'
    });
    setStatus(`服务器可访问：HTTP ${resp.status}`, 'ok');
  } catch (error) {
    setStatus(`服务器不可访问：${error.message}`, 'error');
  }
});

function setStatus(text, type) {
  statusEl.textContent = text;
  statusEl.className = `status ${type || ''}`;
}
