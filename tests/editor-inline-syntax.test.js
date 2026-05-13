const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const editorPath = path.join(root, 'wechat-article/tools/editor.html');
const html = fs.readFileSync(editorPath, 'utf8');

const scripts = [];
const re = /<script>([\s\S]*?)<\/script>/gi;
let match;
while ((match = re.exec(html))) {
  scripts.push(match[1]);
}

if (!scripts.length) {
  throw new Error('No executable inline scripts found in editor.html');
}

scripts.forEach((script, index) => {
  new vm.Script(script, { filename: `editor.inline.${index}.js` });
});

console.log(`inline editor scripts ok (${scripts.length})`);
