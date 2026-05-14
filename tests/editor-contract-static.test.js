const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const editor = fs.readFileSync(path.join(root, 'wechat-article/tools/editor.html'), 'utf8');

const requiredSnippets = [
  "data-wb-root=\"1\"",
  "data-wb-version",
  "data-wb-mode",
  "function setWorkbenchMode",
  "function deepUngroupSelection",
  "function applyGlobalFlowStyles",
  "function addColumnToFlexRow",
  "function removeSelectedColumnFromFlexRow",
  "function moveFlexRowColumn",
  "function ensureColumnResizeHandles",
  "function startColumnResize",
  "function groupSideBySideRowsForFlow",
  "function equalizeFlexRowColumns",
  "function addRowAfterBlock",
  "function validateWechatHtml",
  "function serializeWorkbenchBlockRecursive",
  "function hydrateWorkbenchSection",
  "SVG filter/fe*",
  "text-align:center;font-size:0;box-sizing:border-box;width:100%;",
  "data-flow-page-margin-x",
  "data-global-flow-key=\"lineHeight\"",
  "data-inspector-key=\"fontSize\"",
  "data-inspector-action=\"addColumn\"",
  "data-inspector-action=\"moveColumnLeft\"",
  "data-column-selected",
  "wechat-column-resizer",
];

for (const snippet of requiredSnippets) {
  if (!editor.includes(snippet)) {
    throw new Error(`Missing editor contract snippet: ${snippet}`);
  }
}

if (/row\.style\.cssText\s*=\s*['"]display:flex/.test(editor)) {
  throw new Error('WeChat export still emits display:flex for flex-row groups');
}

console.log('editor static contract ok');
