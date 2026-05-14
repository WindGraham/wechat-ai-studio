const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const matrixPath = path.join(root, 'wechat-article/references/svg-compatibility.md');
const matrix = fs.readFileSync(matrixPath, 'utf8');

function assertIncludes(snippet) {
  assert(
    matrix.includes(snippet),
    `Missing SVG compatibility matrix contract snippet: ${snippet}`
  );
}

[
  'SVG-SMIL-ANIMATE',
  'SVG-SMIL-ANIMATE-TRANSFORM',
  'SVG-FOREIGNOBJECT',
  'SVG-FILTER',
  'SVG-GRADIENT',
  'SVG-CLIP-MASK-TEXTPATH',
  'SVG-XLINK-HREF',
  'SVG-DATA-URI',
  'SVG-MATRIX-3D',
  'SVG-CSS-ANIMATION',
  'SVG-IMAGE-CDN',
].forEach(assertIncludes);

[
  '<animate>',
  '<animateTransform>',
  '<foreignObject>',
  '<filter>',
  '<linearGradient>',
  '<radialGradient>',
  '<clipPath>',
  '<mask>',
  '<textPath>',
  'xlink:href',
  'data:',
  'matrix()',
  'rotateX/Y/Z',
  '@keyframes',
  'transition',
  'mmbiz.qpic.cn',
].forEach(assertIncludes);

const usageGuide = matrix.split('## Usage Guide')[1] || '';
assert(!/<clipPath\b/i.test(usageGuide), 'Usage examples must not use blocked clipPath');
assert(!/\bclip-path\s*=/i.test(usageGuide), 'Usage examples must not use blocked clip-path');
assert(!/<mask\b/i.test(usageGuide), 'Usage examples must not use blocked mask');
assert(!/<textPath\b/i.test(usageGuide), 'Usage examples must not use blocked textPath');
assert(!/\bxlink:href\s*=/i.test(usageGuide), 'Usage examples must not use blocked xlink:href');
assert(!/\bdata:/i.test(usageGuide), 'Usage examples must not use blocked data URIs');

const blockedPatterns = [
  ['foreignObject', /<\s*foreignObject\b/i],
  ['filter', /<\s*filter\b|<\s*fe[A-Z][\w-]*\b/i],
  ['gradient', /<\s*(?:linearGradient|radialGradient|stop)\b/i],
  ['clipPath', /<\s*clipPath\b|\bclip-path\s*=/i],
  ['mask', /<\s*mask\b|\bmask\s*=/i],
  ['textPath', /<\s*textPath\b/i],
  ['xlink:href', /\bxlink:href\s*=/i],
  ['data URI', /\b(?:src|href)\s*=\s*["']\s*data:|url\(\s*["']?\s*data:/i],
  ['matrix transform', /\bmatrix(?:3d)?\s*\(/i],
  ['3D transform', /\b(?:rotate[XYZ]|translateZ|perspective)\s*\(/i],
  ['CSS keyframes', /@keyframes/i],
  ['CSS animation', /\banimation(?:-[\w-]+)?\s*:/i],
  ['CSS transition', /\btransition(?:-[\w-]+)?\s*:/i],
  ['script or event handler', /<\s*script\b|\son[a-z]+\s*=/i],
];

function findSvgCompatibilityViolations(source, options = {}) {
  const violations = blockedPatterns
    .filter(([, pattern]) => pattern.test(source))
    .map(([name]) => name);

  if (options.workflow === 'api_publish') {
    const imageHrefPattern = /<\s*image\b[^>]*\bhref\s*=\s*["'](https?:\/\/[^"']+)["']/gi;
    let match;
    while ((match = imageHrefPattern.exec(source))) {
      if (!/^https:\/\/mmbiz\.qpic\.cn\//i.test(match[1])) {
        violations.push('external SVG image URL for API publish');
      }
    }
  }

  return violations;
}

const safeSvg = `
<svg width="100%" height="80" viewBox="0 0 375 80">
  <image x="0" y="0" width="120" height="80" href="https://mmbiz.qpic.cn/example.jpg">
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
    <animateTransform attributeName="transform" type="translate" values="0,0;20,0;0,0" dur="2s" repeatCount="indefinite"/>
  </image>
</svg>
`;

assert.deepStrictEqual(findSvgCompatibilityViolations(safeSvg, { workflow: 'api_publish' }), []);

const blockedFixtures = [
  ['foreignObject', '<svg><foreignObject><div>HTML</div></foreignObject></svg>'],
  ['filter', '<svg><filter id="f"><feGaussianBlur stdDeviation="4"/></filter></svg>'],
  ['gradient', '<svg><linearGradient id="g"><stop offset="0%"/></linearGradient></svg>'],
  ['clipPath', '<svg><clipPath id="c"><rect width="1" height="1"/></clipPath></svg>'],
  ['mask', '<svg><mask id="m"><rect width="1" height="1"/></mask></svg>'],
  ['textPath', '<svg><text><textPath href="#p">Title</textPath></text></svg>'],
  ['xlink:href', '<svg><image xlink:href="https://mmbiz.qpic.cn/a.jpg"/></svg>'],
  ['data URI', '<svg><image href="data:image/png;base64,AAA"/></svg>'],
  ['matrix transform', '<svg><g transform="matrix(1 0 0 1 0 0)"/></svg>'],
  ['3D transform', '<svg><g style="transform: rotateX(45deg)"/></svg>'],
  ['CSS animation', '<svg><style>@keyframes spin{}</style><g style="animation: spin 1s"/></svg>'],
  ['CSS transition', '<svg><g style="transition: opacity 1s"/></svg>'],
  ['external SVG image URL for API publish', '<svg><image href="https://example.com/a.jpg"/></svg>'],
];

for (const [expected, fixture] of blockedFixtures) {
  const violations = findSvgCompatibilityViolations(fixture, { workflow: 'api_publish' });
  assert(
    violations.includes(expected),
    `Expected fixture to violate ${expected}; got ${violations.join(', ') || 'none'}`
  );
}

console.log('wechat SVG compatibility contract ok');
