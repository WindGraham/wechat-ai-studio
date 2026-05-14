const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const backgroundPath = path.join(root, 'wechat-article/tools/wechat-inject-extension/background.js');
const source = fs.readFileSync(backgroundPath, 'utf8');

new vm.Script(source, { filename: 'wechat-inject-extension/background.js' });

const required = [
  'async function injectIntoEditor',
  'JSAPI timeout',
  'verifyInjectedHTML',
  'readEditorHTML',
  'verified:',
  'strategy:',
  "dispatchEvent(new InputEvent('input'",
];

for (const snippet of required) {
  if (!source.includes(snippet)) {
    throw new Error(`Missing WeChat inject contract snippet: ${snippet}`);
  }
}

if (/text-indent\\s\*:\s*\\s\*\[\^/.test(source) || source.includes("payload.html = payload.html.replace(/text-indent")) {
  throw new Error('WeChat injection must not strip text-indent from user HTML');
}

console.log('wechat inject extension contract ok');
