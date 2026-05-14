#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { URL } = require('url');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');
const toolsDir = path.join(root, 'wechat-article/tools');
const defaultArtifact = path.join(__dirname, 'artifacts/editor-headless-smoke.png');
const artifactPath = process.env.EDITOR_SMOKE_ARTIFACT || defaultArtifact;
const viewport = { width: 1365, height: 900, deviceScaleFactor: 1, mobile: false };

function fail(message, details) {
  const suffix = details ? `\n${details}` : '';
  throw new Error(`${message}${suffix}`);
}

function isKnownStartupNoise(line) {
  return [
    /components-elements\.js:\d+:\d+.*Unexpected identifier 'clickElement'/s,
    /plugin-ai-assistant\.js.*rootElement/s,
    /toggleRightColumn.*parameter 1 is not of type 'Element'/s,
  ].some((pattern) => pattern.test(line));
}

function findChromium() {
  const candidates = [
    process.env.CHROMIUM_BIN,
    process.env.CHROME_BIN,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    'chromium',
    'chromium-browser',
    'google-chrome-stable',
    'google-chrome',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes('/')) {
      try {
        fs.accessSync(candidate, fs.constants.X_OK);
        return candidate;
      } catch (_) {
        continue;
      }
    }
    return candidate;
  }
  fail('No Chromium executable found. Set CHROMIUM_BIN to the browser binary.');
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  }[ext] || 'application/octet-stream';
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, 'http://127.0.0.1');
    if (reqUrl.pathname === '/local-images.json') {
      const body = JSON.stringify({ directory: '', items: [] });
      res.writeHead(200, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'content-length': Buffer.byteLength(body),
      });
      res.end(body);
      return;
    }

    let pathname = decodeURIComponent(reqUrl.pathname);
    if (pathname === '/') pathname = '/editor.html';
    const candidate = path.resolve(toolsDir, `.${pathname}`);
    if (!candidate.startsWith(toolsDir + path.sep) && candidate !== toolsDir) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(candidate, (err, body) => {
      if (err) {
        res.writeHead(err.code === 'ENOENT' ? 404 : 500);
        res.end(err.code || 'Read error');
        return;
      }
      res.writeHead(200, {
        'content-type': mimeType(candidate),
        'cache-control': 'no-store',
      });
      res.end(body);
    });
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}/editor.html` });
    });
  });
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function httpJson(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`${method} ${url} returned ${res.statusCode}: ${body}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function waitForDevtools(port, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  const url = `http://127.0.0.1:${port}/json/version`;
  let lastError;
  while (Date.now() < deadline) {
    try {
      return await httpJson(url);
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw lastError || new Error('Timed out waiting for Chromium DevTools.');
}

function encodeFrame(text) {
  const payload = Buffer.from(text);
  let header;
  if (payload.length < 126) {
    header = Buffer.alloc(2);
    header[1] = 0x80 | payload.length;
  } else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }
  header[0] = 0x81;
  const mask = crypto.randomBytes(4);
  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i += 1) masked[i] = payload[i] ^ mask[i % 4];
  return Buffer.concat([header, mask, masked]);
}

class CdpClient {
  constructor(wsUrl) {
    this.url = new URL(wsUrl);
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.handshakeDone = false;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      const key = crypto.randomBytes(16).toString('base64');
      const socket = net.createConnection(Number(this.url.port), this.url.hostname);
      this.socket = socket;
      socket.once('error', reject);
      socket.on('data', (chunk) => this.handleData(chunk));
      socket.on('close', () => {
        for (const { reject: rejectPending } of this.pending.values()) {
          rejectPending(new Error('CDP socket closed.'));
        }
        this.pending.clear();
      });
      socket.on('connect', () => {
        socket.write([
          `GET ${this.url.pathname}${this.url.search} HTTP/1.1`,
          `Host: ${this.url.host}`,
          'Upgrade: websocket',
          'Connection: Upgrade',
          `Sec-WebSocket-Key: ${key}`,
          'Sec-WebSocket-Version: 13',
          '',
          '',
        ].join('\r\n'));
      });
      this.once('__open', resolve);
    });
  }

  on(method, callback) {
    const callbacks = this.listeners.get(method) || [];
    callbacks.push(callback);
    this.listeners.set(method, callbacks);
  }

  once(method, callback) {
    const wrapper = (params) => {
      this.off(method, wrapper);
      callback(params);
    };
    this.on(method, wrapper);
  }

  off(method, callback) {
    const callbacks = this.listeners.get(method) || [];
    this.listeners.set(method, callbacks.filter((item) => item !== callback));
  }

  emit(method, params) {
    for (const callback of this.listeners.get(method) || []) callback(params);
  }

  send(method, params = {}, timeoutMs = 15000) {
    const id = this.nextId++;
    const payload = JSON.stringify({ id, method, params });
    this.socket.write(encodeFrame(payload));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method}: timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, method, timer });
    });
  }

  close() {
    if (this.socket) this.socket.end();
  }

  handleData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    if (!this.handshakeDone) {
      const marker = this.buffer.indexOf('\r\n\r\n');
      if (marker === -1) return;
      const header = this.buffer.subarray(0, marker).toString('utf8');
      if (!header.includes(' 101 ')) fail(`WebSocket handshake failed: ${header}`);
      this.handshakeDone = true;
      this.buffer = this.buffer.subarray(marker + 4);
      this.emit('__open');
    }
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      let length = second & 0x7f;
      let offset = 2;
      if (length === 126) {
        if (this.buffer.length < 4) return;
        length = this.buffer.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (this.buffer.length < 10) return;
        length = Number(this.buffer.readBigUInt64BE(2));
        offset = 10;
      }
      const masked = Boolean(second & 0x80);
      const maskOffset = masked ? 4 : 0;
      if (this.buffer.length < offset + maskOffset + length) return;
      let payload = this.buffer.subarray(offset + maskOffset, offset + maskOffset + length);
      if (masked) {
        const mask = this.buffer.subarray(offset, offset + 4);
        payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
      }
      this.buffer = this.buffer.subarray(offset + maskOffset + length);
      const opcode = first & 0x0f;
      if (opcode === 0x8) return;
      if (opcode !== 0x1) continue;
      const message = JSON.parse(payload.toString('utf8'));
      if (message.id && this.pending.has(message.id)) {
        const pending = this.pending.get(message.id);
        this.pending.delete(message.id);
        clearTimeout(pending.timer);
        if (message.error) pending.reject(new Error(`${pending.method}: ${JSON.stringify(message.error)}`));
        else pending.resolve(message.result);
      } else if (message.method) {
        this.emit(message.method, message.params);
      }
    }
  }
}

async function stopChrome(chrome) {
  if (chrome.exitCode !== null || chrome.signalCode !== null) return;
  chrome.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => chrome.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  if (chrome.exitCode !== null || chrome.signalCode !== null) return;
  chrome.kill('SIGKILL');
  await Promise.race([
    new Promise((resolve) => chrome.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
}

function waitForEvent(client, method, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      client.off(method, done);
      reject(new Error(`Timed out waiting for ${method}`));
    }, timeoutMs);
    function done(params) {
      clearTimeout(timer);
      resolve(params);
    }
    client.once(method, done);
  });
}

async function evaluate(client, expression, timeoutMs = 15000) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    timeout: timeoutMs,
  });
  if (result.exceptionDetails) {
    fail('Runtime.evaluate threw.', JSON.stringify(result.exceptionDetails, null, 2));
  }
  return result.result.value;
}

function analyzePng(buffer) {
  const signature = Buffer.from('89504e470d0a1a0a', 'hex');
  if (!buffer.subarray(0, 8).equals(signature)) fail('Screenshot is not a PNG.');
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!width || !height || !channels) {
    fail(`Unsupported screenshot PNG format: ${width}x${height} colorType=${colorType}`);
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);
  let rawOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[rawOffset++];
    const row = raw.subarray(rawOffset, rawOffset + stride);
    const out = pixels.subarray(y * stride, (y + 1) * stride);
    rawOffset += stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? out[x - channels] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0;
      if (filter === 0) out[x] = row[x];
      else if (filter === 1) out[x] = (row[x] + left) & 255;
      else if (filter === 2) out[x] = (row[x] + up) & 255;
      else if (filter === 3) out[x] = (row[x] + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        out[x] = (row[x] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)) & 255;
      } else {
        fail(`Unsupported PNG filter ${filter}`);
      }
    }
  }
  const colors = new Set();
  let samples = 0;
  const stepY = Math.max(1, Math.floor(height / 40));
  const stepX = Math.max(1, Math.floor(width / 60));
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const pos = y * stride + x * channels;
      colors.add(`${pixels[pos]},${pixels[pos + 1]},${pixels[pos + 2]}`);
      samples += 1;
    }
  }
  return { width, height, uniqueSampledColors: colors.size, samples };
}

const pageSmokeExpression = `new Promise((resolve) => {
  const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
  const rect = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      selector,
      top: r.top,
      left: r.left,
      right: r.right,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
      display: style.display,
      visibility: style.visibility,
      opacity: Number(style.opacity || 1),
      overflow: style.overflow,
      textLength: (el.innerText || el.textContent || '').trim().length
    };
  };
  const visible = (r, minWidth, minHeight) => Boolean(
    r && r.display !== 'none' && r.visibility !== 'hidden' && r.opacity > 0 &&
    r.width >= minWidth && r.height >= minHeight
  );
  const overlap = (a, b) => Boolean(
    a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );

  (async () => {
    await sleep(1000);
    const functional = {
      ran: false,
      errors: [],
      rowType: '',
      rowCells: 0,
      flexColChildren: 0,
      importedBlocks: 0,
      workbenchHasRoot: false,
      wechatIssues: [],
      acceptanceOk: false,
      acceptanceErrors: 0,
      leakedEditorMarkers: false
    };

    try {
      const blockCanvasEl = document.querySelector('#block-canvas');
      if (blockCanvasEl && typeof addBlock === 'function') {
        blockCanvasEl.innerHTML = '';
        selectedBlock = null;
        selectedBlocks = [];
        currentWorkbenchMode = 'canvas';
        blockCanvasEl.classList.remove('flow-mode');
        addBlock('text');
        addBlock('text');
        const created = Array.from(blockCanvasEl.querySelectorAll(':scope > .canvas-block'));
        created.forEach((block, index) => {
          block.style.left = (index * 188) + 'px';
          block.style.top = '20px';
          block.style.width = '170px';
        });
        groupSideBySideRowsForFlow();
        const row = blockCanvasEl.querySelector(':scope > .canvas-block[data-type="flex-row"]');
        functional.rowType = row ? row.getAttribute('data-type') : '';
        functional.rowCells = row ? row.querySelectorAll(':scope > .canvas-block').length : 0;
        if (row) {
          addColumnToFlexRow(row);
          equalizeFlexRowColumns(row);
          functional.rowCells = row.querySelectorAll(':scope > .canvas-block').length;
        }
        addBlock('text');
        const trailing = blockCanvasEl.querySelector(':scope > .canvas-block[data-type="text"]');
        if (trailing) addRowAfterBlock(trailing);
        const col = blockCanvasEl.querySelector(':scope > .canvas-block[data-type="flex-col"]');
        functional.flexColChildren = col ? col.querySelectorAll(':scope > .canvas-block').length : 0;
        const workbench = buildWorkbenchHTML();
        functional.workbenchHasRoot = /data-wb-root="1"/.test(workbench) && /data-wb-block="1"/.test(workbench);
        importXiumiToCanvas(workbench);
        await sleep(450);
        functional.importedBlocks = document.querySelectorAll('#block-canvas > .canvas-block').length;
        const wechat = buildWechatHTML();
        functional.wechatIssues = validateWechatHtml(wechat).filter((issue) => issue.severity === 'error').map((issue) => issue.message);
        const acceptance = buildWechatAcceptanceReport('manual-paste');
        functional.acceptanceOk = acceptance.ok;
        functional.acceptanceErrors = acceptance.errorCount;
        functional.leakedEditorMarkers = /canvas-block|data-wb-|data-canvas-|draggable=|wechat-column-resizer/.test(wechat);
        functional.ran = true;
      }
    } catch (err) {
      functional.errors.push(err && err.stack ? err.stack : String(err));
    }

    const top = rect('#top-panel');
    const left = rect('#left-panel');
    const right = rect('#right-panel');
    const canvas = rect('#canvas');
    const wrapper = rect('#iframe-wrapper');
    const blockCanvas = rect('#block-canvas');
    const builder = rect('#vvveb-builder');
    const blocks = Array.from(document.querySelectorAll('#block-canvas > .canvas-block'));
    const toolbarTargets = { left, right, canvas };
    const toolbarOverlaps = Object.keys(toolbarTargets).filter((name) => {
      const target = toolbarTargets[name];
      return overlap(top, target) && top.bottom > target.top + 4;
    });
    const canvasProbe = canvas
      ? document.elementFromPoint(
          Math.floor(canvas.left + canvas.width / 2),
          Math.floor(Math.max(canvas.top, top ? top.bottom + 10 : canvas.top + 20))
        )
      : null;

    resolve({
      href: location.href,
      title: document.title,
      readyState: document.readyState,
      hasAddBlock: typeof window.addBlock === 'function',
      rects: { top, left, right, canvas, wrapper, blockCanvas, builder },
      visible: {
        top: visible(top, 800, 30),
        left: visible(left, 180, 400),
        right: visible(right, 180, 400),
        canvas: visible(canvas, 350, 500),
        blockCanvas: visible(blockCanvas, 300, 500)
      },
      toolbarOverlaps,
      canvasProbeSelector: canvasProbe ? (
        canvasProbe.id ? '#' + canvasProbe.id :
        canvasProbe.className ? '.' + String(canvasProbe.className).trim().split(/\\s+/).join('.') :
        canvasProbe.tagName
      ) : null,
      canvasProbeInToolbar: Boolean(canvasProbe && canvasProbe.closest && canvasProbe.closest('#top-panel')),
      bodyTextLength: (document.body.innerText || '').trim().length,
      componentButtons: document.querySelectorAll('#wechat-component-buttons button').length,
      sourceCards: document.querySelectorAll('#wechat-source-list .wechat-catalog-card').length,
      canvasBlocks: blocks.length,
      blockTypes: blocks.map((block) => block.getAttribute('data-type')),
      functional,
      consoleMarker: 'editor-headless-smoke'
    });
  })();
})`;

async function main() {
  let staticServer = null;
  let pageUrl = process.env.EDITOR_TEST_URL;
  if (!pageUrl) {
    const started = await startStaticServer();
    staticServer = started.server;
    pageUrl = started.url;
  }

  const debugPort = await getFreePort();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wechat-editor-smoke-'));
  const chromium = findChromium();
  const chrome = spawn(chromium, [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--no-sandbox',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  let stderr = '';
  chrome.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  let client = null;
  try {
    await waitForDevtools(debugPort);
    const target = await httpJson(`http://127.0.0.1:${debugPort}/json/new?about:blank`, 'PUT');
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.connect();

    const runtimeErrors = [];
    const consoleErrors = [];
    client.on('Runtime.exceptionThrown', (params) => {
      const details = params.exceptionDetails || {};
      const exception = details.exception || {};
      const where = details.url ? `${details.url}:${details.lineNumber || 0}:${details.columnNumber || 0}` : '';
      runtimeErrors.push([
        details.text || 'Runtime exception',
        exception.description || exception.value || '',
        where,
      ].filter(Boolean).join(' | '));
    });
    client.on('Runtime.consoleAPICalled', (params) => {
      if (!['error', 'assert'].includes(params.type)) return;
      const text = (params.args || []).map((arg) => arg.value || arg.description || '').join(' ');
      consoleErrors.push(text);
    });

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', viewport);
    const loaded = waitForEvent(client, 'Page.loadEventFired', 20000);
    await client.send('Page.navigate', { url: pageUrl });
    await loaded;
    const metrics = await evaluate(client, pageSmokeExpression, 20000);

    const relevantRuntimeErrors = runtimeErrors.filter((line) => !isKnownStartupNoise(line));
    if (relevantRuntimeErrors.length) fail('Editor raised runtime exceptions.', relevantRuntimeErrors.join('\n'));
    const relevantConsoleErrors = consoleErrors.filter((line) => !/Failed to load resource/.test(line));
    if (relevantConsoleErrors.length) fail('Editor logged console errors.', relevantConsoleErrors.join('\n'));
    if (metrics.readyState !== 'complete') fail(`Editor did not finish loading: ${metrics.readyState}`);
    if (!metrics.visible.top) fail('Top toolbar is not visible.', JSON.stringify(metrics.rects.top, null, 2));
    if (!metrics.visible.right) fail('Right panel is not visible.', JSON.stringify(metrics.rects.right, null, 2));
    if (!metrics.visible.canvas || !metrics.visible.blockCanvas) {
      fail('Canvas area is not visible.', JSON.stringify(metrics.rects, null, 2));
    }
    if (metrics.toolbarOverlaps.length) {
      fail(`Top toolbar overlaps layout regions: ${metrics.toolbarOverlaps.join(', ')}`, JSON.stringify(metrics.rects, null, 2));
    }
    if (metrics.canvasProbeInToolbar) {
      fail(`Canvas probe point is covered by toolbar (${metrics.canvasProbeSelector}).`);
    }
    if (!metrics.hasAddBlock) fail('addBlock is not available on editor page.');
    if (metrics.componentButtons < 8) fail(`Expected basic component buttons, found ${metrics.componentButtons}.`);
    if (metrics.bodyTextLength < 100) fail(`Page key regions look empty; body text length is ${metrics.bodyTextLength}.`);
    if (!metrics.functional.ran) fail('Functional editor workflow did not run.', JSON.stringify(metrics.functional, null, 2));
    if (metrics.functional.errors.length) fail('Functional editor workflow raised errors.', metrics.functional.errors.join('\n'));
    if (metrics.functional.rowType !== 'flex-row' || metrics.functional.rowCells < 3) {
      fail('Flex-row workflow did not create and expand a row.', JSON.stringify(metrics.functional, null, 2));
    }
    if (metrics.functional.flexColChildren < 2) {
      fail('Flex-col row insertion workflow did not create two rows.', JSON.stringify(metrics.functional, null, 2));
    }
    if (!metrics.functional.workbenchHasRoot || metrics.functional.importedBlocks < 1) {
      fail('Workbench round-trip workflow failed.', JSON.stringify(metrics.functional, null, 2));
    }
    if (metrics.functional.wechatIssues.length) {
      fail('WeChat export has blocking compatibility issues.', metrics.functional.wechatIssues.join('\n'));
    }
    if (!metrics.functional.acceptanceOk || metrics.functional.acceptanceErrors) {
      fail('Structured WeChat acceptance report has blocking errors.', JSON.stringify(metrics.functional, null, 2));
    }
    if (metrics.functional.leakedEditorMarkers) fail('WeChat export leaked editor/workbench markers.');

    const screenshot = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const screenshotBuffer = Buffer.from(screenshot.data, 'base64');
    fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
    fs.writeFileSync(artifactPath, screenshotBuffer);
    const png = analyzePng(screenshotBuffer);
    if (png.width < 1000 || png.height < 700) {
      fail(`Screenshot dimensions too small: ${png.width}x${png.height}`);
    }
    if (png.uniqueSampledColors < 20) {
      fail(`Screenshot appears blank or nearly blank: ${png.uniqueSampledColors} sampled colors.`);
    }

    console.log('editor headless smoke ok');
    console.log(`url: ${pageUrl}`);
    console.log(`screenshot: ${path.relative(root, artifactPath)}`);
    console.log(`basic component buttons: ${metrics.componentButtons}`);
  } finally {
    if (client) client.close();
    if (!process.env.KEEP_CHROME) await stopChrome(chrome);
    if (staticServer) await new Promise((resolve) => staticServer.close(resolve));
    if (!process.env.KEEP_CHROME) {
      try {
        fs.rmSync(userDataDir, { recursive: true, force: true });
      } catch (_) {
        // Best-effort cleanup only.
      }
    }
    if (stderr && process.env.DEBUG_EDITOR_SMOKE) {
      console.error(stderr);
    }
  }
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
