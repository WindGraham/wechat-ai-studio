#!/usr/bin/env node

const path = require('node:path');
const fs = require('node:fs');

const CONFIG = {
  xiumiHomeUrl: 'https://xiumi.us/#/',
  xiumiShopUrl: 'https://xiumi.us/#/studio/shop/paper?page=0&freefilter=all&by_nearest=1',
  xiumiPapersUrl: 'https://xiumi.us/#/studio/papers',
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  userDataDir: process.env.XIUMI_USER_DATA_DIR || '/home/graham/.cache/xiumi-playwright-profile-capture',
  extensionPath: process.env.XIUMI_CAPTURE_EXTENSION || '/home/graham/Projects/wechat-ai-publisher/skills/wechat-article/tools/xiumi-capture-extension',
  saveServerUrl: process.env.XIUMI_SAVE_SERVER_URL || 'http://localhost:8081/save-template',
  savePath: process.env.XIUMI_SAVE_PATH || '/home/graham/Projects/wechat-ai-publisher/ xiumi_test',
  limit: Number(process.env.XIUMI_LIMIT || '1'),
  searchText: process.env.XIUMI_SEARCH_TEXT || '',
  freeRankingPath: process.env.XIUMI_FREE_RANKING || '/home/graham/Projects/get-xiumi/templates/_free_ranking.json',
  progressPath: process.env.XIUMI_PROGRESS || '/home/graham/Projects/wechat-ai-publisher/skills/wechat-article/tools/xiumi_processed.json',
};

const { chromium } = loadPlaywright();

main().catch(error => {
  console.error(`[fatal] ${error.stack || error.message}`);
  process.exit(1);
});

async function main() {
  await assertSaveServerReady();

  const searchTexts = resolveSearchTexts();
  const progress = loadProgress();
  const pending = searchTexts
    .map((text, i) => ({ text, index: i }))
    .filter(item => !progress.done.has(item.text));

  const effectiveLimit = Math.min(CONFIG.limit, pending.length);
  log(`已跳过 ${progress.done.size} 个，剩余 ${pending.length} 个，本次采集 ${effectiveLimit} 个`);

  const context = await chromium.launchPersistentContext(CONFIG.userDataDir, {
    executablePath: CONFIG.executablePath,
    headless: false,
    viewport: { width: 1440, height: 960 },
    args: [
      `--disable-extensions-except=${CONFIG.extensionPath}`,
      `--load-extension=${CONFIG.extensionPath}`,
    ],
  });

  try {
    const page = context.pages()[0] || await context.newPage();
    await page.bringToFront();
    await page.goto(CONFIG.xiumiHomeUrl, { waitUntil: 'domcontentloaded' });
    await waitForXiumiLoggedIn(page);

    for (let i = 0; i < effectiveLimit; i++) {
      const { text: searchText, index } = pending[i];
      logStep(i + 1, effectiveLimit, `开始采集: ${searchText}`);
      try {
        await captureOneTemplate(context, i, searchText);
        markDone(progress, searchText);
      } catch (err) {
        if (err.message === 'SKIP_TEMPLATE') {
          log(`跳过: ${searchText}`);
          markDone(progress, searchText);
          continue;
        }
        throw err;
      }
    }

    log('流程完成。');
  } finally {
    if (process.env.XIUMI_KEEP_BROWSER !== '1') await context.close();
  }
}

async function captureOneTemplate(context, index, searchText) {
  const shopPage = await openShopPage(context);
  await clickFreeFilter(shopPage);
  await fillSearchIfConfigured(shopPage, searchText);

  await openFirstTemplatePreview(shopPage);
  const templateMeta = await readPreviewMeta(shopPage);
  log(`预览模板: ${templateMeta.title || '(无标题)'} ${templateMeta.id ? '#' + templateMeta.id : ''}`);

  await savePreviewToMyPapers(shopPage);

  const papersPage = await openPapersPage(context);
  await waitForSingleArticleInPapers(papersPage);

  const editorPage = await openFirstArticleEditor(context, papersPage);
  try {
    await waitForXiumiEditorReady(editorPage);
    await enterExportMode(editorPage);
    await ensureExportSelection(editorPage);

    const saveResult = await directCaptureAndSave(editorPage, index);
    log(`已保存模板: ${JSON.stringify(saveResult)}`);

    await exitExportMode(editorPage);
  } finally {
    await editorPage.close().catch(() => {});
  }

  const deletePage = await openPapersPage(context);
  await waitForSingleArticleInPapers(deletePage);
  await deleteOnlyArticle(deletePage);

  await openShopPage(context);
}

async function openShopPage(context) {
  const page = await reuseOrCreatePage(context, p => p.url().includes('/#/studio/shop/paper'));
  await page.bringToFront();
  if (!page.url().includes('/#/studio/shop/paper')) {
    await page.goto(CONFIG.xiumiShopUrl, { waitUntil: 'domcontentloaded' });
  } else if (!page.url().includes('freefilter=')) {
    await page.goto(CONFIG.xiumiShopUrl, { waitUntil: 'domcontentloaded' });
  }
  await waitForShopReady(page);
  return page;
}

async function openPapersPage(context) {
  const papersPages = context.pages().filter(p => p.url().includes('/#/studio/papers'));
  const keep = papersPages[0] || await context.newPage();
  for (const page of papersPages) {
    if (page !== keep) await page.close().catch(() => {});
  }
  await keep.bringToFront();
  if (!keep.url().includes('/#/studio/papers')) {
    await keep.goto(CONFIG.xiumiPapersUrl, { waitUntil: 'domcontentloaded' });
  } else {
    await keep.reload({ waitUntil: 'domcontentloaded' });
  }
  await waitForPapersReady(keep);
  return keep;
}

async function clickFreeFilter(page) {
  log('点击免费筛选');
  const pricePanel = page.locator('.tn-list-nav-panel').filter({ hasText: '价格' }).first();
  await pricePanel.waitFor({ state: 'visible', timeout: 60000 });
  await pricePanel.getByText('免费', { exact: true }).click();
  await waitForUrlIncludes(page, 'freefilter=free');
  await waitForShopResultsSettled(page);
}

async function fillSearchIfConfigured(page, searchText) {
  if (!searchText) {
    log('搜索内容为空，跳过输入。');
    return;
  }

  const input = await findSearchInput(page);
  const searchBtn = page.locator('.input-group .btn').first();
  let currentText = searchText;

  while (currentText.length > 0) {
    log(`搜索: "${currentText}"`);
    await input.click();
    await input.fill('');
    await input.fill(currentText);
    await searchBtn.click();
    await page.waitForTimeout(800);

    const hasToast = await page.locator('.toast:visible').first()
      .isVisible().catch(() => false);
    if (hasToast) {
      log(`收到 toast 通知，缩短重试`);
      await page.locator('.toast:visible').first()
        .waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      currentText = currentText.slice(0, -1);
      continue;
    }

    await page.waitForTimeout(500);
    const noResult = await page.getByText('没有找到符合条件的模板', { exact: false })
      .isVisible().catch(() => false);
    if (noResult) {
      log(`没有找到，缩短重试`);
      currentText = currentText.slice(0, -1);
      continue;
    }

    await waitForShopResultsSettled(page);
    const count = await page.locator('.show-item').count();
    if (count > 0) {
      log(`搜索 "${currentText}" -> ${count} 个结果，取第一个`);
      return;
    }

    currentText = currentText.slice(0, -1);
  }
}

async function findSearchInput(page) {
  const candidates = [
    'input[placeholder*="搜索"]',
    'input[type="search"]',
    '.tn-tpl-entry.search input',
    'input.form-control',
  ];
  for (const selector of candidates) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible().catch(() => false)) return locator;
  }
  throw new Error('未找到秀米风格排版搜索框');
}

async function openFirstTemplatePreview(page) {
  log('打开第一个模板预览');
  await waitForShopResultsSettled(page);
  const card = page.locator('.show-item').first();
  await card.waitFor({ state: 'visible', timeout: 60000 });
  await hoverCard(page, card);
  await card.locator('.my-show-mask .show-action').filter({ hasText: '预览' }).first().click({ force: true });
  await page.locator('.modal-content .side-bar.show-goods').waitFor({ state: 'visible', timeout: 60000 });
  await page.getByText('另存给自己', { exact: true }).first().waitFor({ state: 'visible', timeout: 60000 });
}

async function readPreviewMeta(page) {
  const text = await page.locator('.modal-content .side-bar.show-goods .title').first().innerText().catch(() => '');
  const id = (text.match(/#(\d+)/) || [])[1] || '';
  return { title: text.replace(/#\d+/, '').trim(), id };
}

async function savePreviewToMyPapers(page) {
  log('另存给自己');
  await page.getByText('另存给自己', { exact: true }).first().click();
  const modal = page.locator('.modal-content').filter({ hasText: '另存成功' }).first();
  await modal.waitFor({ state: 'visible', timeout: 60000 });
  await modal.getByText('确定', { exact: true }).click();
  await page.getByText('另存成功', { exact: true }).waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});
}

async function waitForSingleArticleInPapers(page) {
  log('等待我的图文中出现唯一图文');
  await waitForPapersReady(page);
  for (let i = 0; i < 6; i++) {
    try {
      await page.waitForFunction(() => {
        return document.querySelectorAll('.show-list-panel.studio .show-item').length === 1;
      }, null, { timeout: 10000 });
      return;
    } catch (_) {
      log(`图文未出现，刷新重试 (${i + 1}/6)`);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitForPapersReady(page);
    }
  }
  throw new Error('图文未出现，已刷新6次');
}

async function openFirstArticleEditor(context, page) {
  log('打开唯一图文编辑器');
  const card = page.locator('.show-list-panel.studio .show-item').first();
  await card.waitFor({ state: 'visible', timeout: 60000 });
  await hoverCard(page, card);
  const edit = card.locator('.my-show-mask a[href*="/studio/v5#/paper/for/"]').filter({ hasText: '编辑' }).first();
  const newPagePromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);
  await edit.click({ force: true });
  const editorPage = await newPagePromise || context.pages().find(p => p.url().includes('/studio/v5#/paper/for/'));
  if (!editorPage) throw new Error('未打开秀米编辑器页面');
  await editorPage.bringToFront();
  return editorPage;
}

async function waitForXiumiEditorReady(page) {
  log('等待编辑器加载完成');
  await page.waitForURL(/\/studio\/v5#\/paper\/for\/\d+/, { timeout: 60000 });
  await page.waitForLoadState('domcontentloaded');
  await page.locator('.tn-editing-panel').waitFor({ state: 'visible', timeout: 90000 });
  await Promise.race([
    page.locator('article.tn-paper-document-root').waitFor({ state: 'visible', timeout: 90000 }),
    page.locator('.tn-projection-print').waitFor({ state: 'visible', timeout: 90000 }).catch(() => null),
  ]);
  await page.waitForFunction(() => {
    const text = document.body.innerText || '';
    return text.includes('导出') && !/加载中|正在加载/.test(text);
  }, null, { timeout: 90000 });
}

async function enterExportMode(page) {
  log('进入导出模式');
  const alreadyExporting = await page.getByText('先Ctrl+C', { exact: false }).isVisible().catch(() => false);
  if (!alreadyExporting) {
    const exportButton = page.locator('button.op-btn.done').filter({ hasText: '导出' }).first();
    await exportButton.waitFor({ state: 'visible', timeout: 60000 });
    await exportButton.click();
  }
  await page.getByText('先Ctrl+C', { exact: false }).waitFor({ state: 'visible', timeout: 60000 });
  await page.locator('.tn-projection-print, .tn-editing-panel').first().waitFor({ state: 'visible', timeout: 60000 });
}

async function ensureExportSelection(page) {
  log('确认导出正文已被选中');
  await page.waitForTimeout(1000);

  let selectedLength = await getSelectionLength(page);
  if (selectedLength > 100) {
    log(`检测到已有选区，文本长度 ${selectedLength}`);
    return;
  }

  for (let retry = 0; retry < 5; retry++) {
    log(`选区为空，退出导出后重新进入 (${retry + 1}/5)`);

    const exitBtn = page.locator('button.op-btn.done').filter({ hasText: '退出' }).first();
    if (await exitBtn.isVisible().catch(() => false)) {
      await exitBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.locator('button.op-btn.done').filter({ hasText: '导出' }).first()
      .waitFor({ state: 'visible', timeout: 15000 });

    await page.locator('button.op-btn.done').filter({ hasText: '导出' }).first().click();
    await page.getByText('先Ctrl+C', { exact: false }).waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);

    selectedLength = await page.evaluate(() => {
      const targets = [
        '.tn-projection-print', 'article.tn-paper-document-root', '.tn-editing-panel',
        '[class*="projection"]', '[class*="export"]', 'section[style*="box-sizing"]',
      ];
      for (const sel of targets) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const range = document.createRange();
        range.selectNodeContents(el);
        const s = window.getSelection();
        s.removeAllRanges();
        s.addRange(range);
        const len = s.toString().trim().length;
        if (len > 100) return len;
      }
      return 0;
    });

    if (selectedLength > 100) {
      log(`重新导出后选区 ${selectedLength} 字符`);
      return;
    }
  }

  log(`跳过：重试 5 次仍无法获取导出正文`);
  throw new Error('SKIP_TEMPLATE');
}

async function directCaptureAndSave(page, index) {
  log('通过 Playwright 直接捕获选区并保存');

  const captured = await page.evaluate(() => {
    function textOf(node) {
      return (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim();
    }
    function absoluteUrl(value) {
      if (!value) return '';
      try { return new URL(value, location.href).href; } catch (_) { return value; }
    }
    function normalizeFragment(container) {
      container.querySelectorAll('script,noscript').forEach(el => el.remove());
      container.querySelectorAll('img').forEach(img => {
        const fallback = img.getAttribute('data-src') || img.getAttribute('data-original') ||
          img.getAttribute('data-url') || img.getAttribute('data-actualsrc') || img.getAttribute('src');
        if (fallback) img.setAttribute('src', absoluteUrl(fallback));
      });
      container.querySelectorAll('[data-bg]').forEach(el => {
        const bg = el.getAttribute('data-bg');
        if (bg) el.style.backgroundImage = 'url(' + absoluteUrl(bg) + ')';
      });
    }
    const sel = window.getSelection && window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return { error: 'no selection' };
    const container = document.createElement('div');
    for (let i = 0; i < sel.rangeCount; i++) {
      const range = sel.getRangeAt(i);
      if (!range.collapsed) container.appendChild(range.cloneContents());
    }
    normalizeFragment(container);
    return {
      html: container.innerHTML,
      title: document.title || '',
      sourceUrl: location.href,
      selectedTextLength: textOf(container).length
    };
  });

  if (captured.error) {
    throw new Error(`选区捕获失败: ${captured.error}`);
  }
  log(`捕获到选区: ${captured.selectedTextLength} 字符, ${captured.html.length} 字节`);

  const resp = await fetch(CONFIG.saveServerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html: captured.html,
      title: captured.title,
      sourceUrl: captured.sourceUrl,
      capturedAt: new Date().toISOString(),
      savePath: CONFIG.savePath,
      desc: '',
      wxAuthor: ''
    })
  });

  if (!resp.ok) throw new Error(`保存服务器返回 HTTP ${resp.status}`);
  return resp.json();
}

async function exitExportMode(page) {
  log('退出导出模式');
  if (!(await page.getByText('先Ctrl+C', { exact: false }).isVisible().catch(() => false))) return;
  const exitButton = page.locator('button.op-btn.done').filter({ hasText: '退出' }).first();
  if (await exitButton.isVisible().catch(() => false)) {
    await exitButton.click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.getByText('先Ctrl+C', { exact: false }).waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});
}

async function deleteOnlyArticle(page) {
  log('删除我的图文中的唯一图文');
  const card = page.locator('.show-list-panel.studio .show-item').first();
  await card.waitFor({ state: 'visible', timeout: 60000 });
  await hoverCard(page, card);
  await card.locator('.action-btn-small.delete[title="删除"]').click({ force: true });
  await page.getByText('已删除至回收站', { exact: false }).waitFor({ state: 'visible', timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('.show-list-panel.studio .show-item').length === 0, null, { timeout: 60000 });
}

async function hoverCard(page, card) {
  await card.scrollIntoViewIfNeeded();
  const preview = card.locator('.show-preview').first();
  await preview.waitFor({ state: 'visible', timeout: 60000 });
  const box = await preview.boundingBox();
  if (!box) throw new Error('卡片封面区域不存在');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(500);
}

async function waitForXiumiLoggedIn(page) {
  log('检查秀米登录状态');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  if (page.url().includes('/auth')) {
    throw new Error(`当前未登录秀米，请先使用此 profile 登录: ${CONFIG.userDataDir}`);
  }
  await page.getByText('我的秀米', { exact: true }).first().waitFor({ state: 'visible', timeout: 60000 });
}

async function waitForShopReady(page) {
  await page.waitForURL(/#\/studio\/shop\/paper/, { timeout: 60000 });
  await page.locator('.tn-list-nav-panel').filter({ hasText: '价格' }).first().waitFor({ state: 'visible', timeout: 60000 });
  await page.waitForFunction(() => (document.body.innerText || '').includes('价格'), null, { timeout: 60000 });
}

async function waitForShopResultsSettled(page) {
  await page.waitForFunction(() => {
    const text = document.body.innerText || '';
    const hasCards = document.querySelectorAll('.show-item').length > 0;
    const loading = /加载中|正在加载/.test(text);
    return hasCards && !loading;
  }, null, { timeout: 90000 });
  await page.waitForTimeout(800);
}

async function waitForPapersReady(page) {
  await page.waitForURL(/#\/studio\/papers/, { timeout: 60000 });
  await page.getByText('我的图文', { exact: true }).first().waitFor({ state: 'visible', timeout: 60000 });
  await page.locator('.show-list-panel.studio').waitFor({ state: 'visible', timeout: 60000 });
}

async function waitForUrlIncludes(page, fragment) {
  await page.waitForFunction(value => location.href.includes(value), fragment, { timeout: 60000 });
}

async function getSelectionLength(page) {
  return page.evaluate(() => {
    const selection = window.getSelection && window.getSelection();
    return selection ? selection.toString().trim().length : 0;
  });
}

async function reuseOrCreatePage(context, predicate) {
  const page = context.pages().find(predicate) || context.pages().find(p => !p.url().startsWith('chrome-extension://')) || await context.newPage();
  return page;
}

async function assertSaveServerReady() {
  log(`检查保存服务器: ${CONFIG.saveServerUrl}`);
  for (let i = 0; i < 3; i++) {
    try {
      const resp = await fetch(CONFIG.saveServerUrl, { method: 'OPTIONS' });
      if (resp.ok) return;
    } catch (_) {}
    if (i < 2) { await new Promise(r => setTimeout(r, 2000)); }
  }
  throw new Error(`保存服务器不可用: ${CONFIG.saveServerUrl}`);
}

function loadPlaywright() {
  const candidates = [
    '/home/graham/.local/share/opencode/node_modules/playwright',
    '/tmp/opencode/node_modules/playwright',
    'playwright',
  ];
  for (const candidate of candidates) {
    try { return require(candidate); } catch (_) {}
  }
  throw new Error('未找到 playwright');
}

function loadProgress() {
  if (fs.existsSync(CONFIG.progressPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG.progressPath, 'utf-8'));
      return { done: new Set(data.done || []) };
    } catch (_) {}
  }
  return { done: new Set() };
}

function markDone(progress, text) {
  progress.done.add(text);
  fs.writeFileSync(CONFIG.progressPath, JSON.stringify({
    done: [...progress.done],
    updated: new Date().toISOString(),
  }, null, 2));
}

function resolveSearchTexts() {
  if (CONFIG.searchText) {
    const titles = CONFIG.searchText.split(',').map(s => s.trim()).filter(Boolean);
    log(`使用搜索文本: ${titles.length} 个`);
    return titles;
  }
  if (fs.existsSync(CONFIG.freeRankingPath)) {
    const ranking = JSON.parse(fs.readFileSync(CONFIG.freeRankingPath, 'utf-8'));
    const titles = ranking.map(item => item.title).filter(Boolean);
    log(`从自由排行加载了 ${titles.length} 个模板`);
    return titles;
  }
  log('没有搜索文本也没有排行文件，将采集免费列表前 N 个');
  return Array(CONFIG.limit).fill('');
}

function logStep(current, total, message) {
  log(`[${current}/${total}] ${message}`);
}

function log(message) {
  const time = new Date().toISOString().slice(11, 19);
  console.log(`[${time}] ${message}`);
}
