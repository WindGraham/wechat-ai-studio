/*
Copyright 2017 Ziadin Givan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "原样" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Derived from: https://github.com/givanz/VvvebJs

Standalone vanilla-JS input controls for property panels.
No dependencies. No build system. Dark-theme compatible.
*/

var InputControls = (function () {
  'use strict';

  // ============================================================
  // HELPERS
  // ============================================================

  function emitChange(element, value) {
    element.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      detail: { value: value }
    }));
  }

  /** Parse a CSS dimension value like "16px" into { number, unit } */
  function parseCssValue(value) {
    if (!value || value === '' || value === 'auto') {
      return { number: '', unit: value === 'auto' ? 'auto' : '' };
    }
    value = String(value).trim();
    if (value === 'auto') return { number: '', unit: 'auto' };
    var match = value.match(/^(-?[\d.]+)\s*(px|em|rem|%|vw|vh|pt|cm|mm|in|ex|ch)?$/i);
    if (match) {
      return { number: parseFloat(match[1]), unit: (match[2] || 'px').toLowerCase() };
    }
    return { number: parseFloat(value) || 0, unit: 'px' };
  }

  /** Convert rgb/rgba string to hex (for color input compatibility) */
  function rgb2hex(value) {
    if (!value) return value;
    value = value.trim();
    var match = value.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    if (match && match.length >= 4) {
      return '#' +
        ('0' + parseInt(match[1], 10).toString(16)).slice(-2) +
        ('0' + parseInt(match[2], 10).toString(16)).slice(-2) +
        ('0' + parseInt(match[3], 10).toString(16)).slice(-2);
    }
    return value;
  }

  /** Parse CSS shorthand with 1-4 values into array of 4 */
  function parseFourShorthand(value) {
    if (!value || value === '') return ['', '', '', ''];
    var parts = String(value).trim().split(/\s+/);
    if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
    if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
    if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
    return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || ''];
  }

  /** Build CSS shorthand from 4 values, collapsing duplicates */
  function buildFourShorthand(a, b, c, d) {
    a = a || '0px'; b = b || '0px'; c = c || '0px'; d = d || '0px';
    if (a === b && b === c && c === d) return a;
    if (a === c && b === d) return a + ' ' + b;
    if (b === d) return a + ' ' + b + ' ' + c;
    return a + ' ' + b + ' ' + c + ' ' + d;
  }

  /** Attach getValue/setValue to a wrapper element */
  function attachMethods(el, getter, setter) {
    el.getValue = getter;
    el.setValue = setter;
    return el;
  }

  // ============================================================
  // TEXT INPUT
  // ============================================================
  function textInput(config) {
    config = config || {};
    var wrap = document.createElement('div');
    wrap.className = 'vvi-control';

    if (config.label) {
      var label = document.createElement('label');
      label.className = 'vvi-label';
      label.textContent = config.label;
      wrap.appendChild(label);
    }

    var input = document.createElement('input');
    input.type = config.type || 'text';
    input.className = 'vvi-input';
    if (config.placeholder) input.placeholder = config.placeholder;
    if (config.value !== undefined && config.value !== null) input.value = config.value;
    if (config.min !== undefined) input.min = config.min;
    if (config.max !== undefined) input.max = config.max;
    if (config.step !== undefined) input.step = config.step;
    wrap.appendChild(input);

    input.addEventListener('change', function () {
      emitChange(wrap, input.value);
    });
    input.addEventListener('focusout', function () {
      emitChange(wrap, input.value);
    });

    return attachMethods(wrap,
      function () { return input.value; },
      function (v) { input.value = v !== null && v !== undefined ? v : ''; }
    );
  }

  // ============================================================
  // SELECT INPUT
  // ============================================================
  function selectInput(config) {
    config = config || {};
    var wrap = document.createElement('div');
    wrap.className = 'vvi-control';

    if (config.label) {
      var label = document.createElement('label');
      label.className = 'vvi-label';
      label.textContent = config.label;
      wrap.appendChild(label);
    }

    var select = document.createElement('select');
    select.className = 'vvi-select';

    var optgroupEl = null;
    (config.options || []).forEach(function (opt) {
      if (opt.optgroup) {
        if (optgroupEl) select.appendChild(optgroupEl);
        optgroupEl = document.createElement('optgroup');
        optgroupEl.label = opt.optgroup;
      } else {
        var option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text || opt.value;
        if (config.value !== undefined && config.value === opt.value) {
          option.selected = true;
        }
        // Copy extra attributes
        for (var attr in opt) {
          if (attr !== 'value' && attr !== 'text' && attr !== 'optgroup' && opt.hasOwnProperty(attr)) {
            option.setAttribute(attr, opt[attr]);
          }
        }
        if (optgroupEl) {
          optgroupEl.appendChild(option);
        } else {
          select.appendChild(option);
        }
      }
    });
    if (optgroupEl) select.appendChild(optgroupEl);

    wrap.appendChild(select);

    select.addEventListener('change', function () {
      emitChange(wrap, select.value);
    });

    return attachMethods(wrap,
      function () { return select.value; },
      function (v) { select.value = v !== null && v !== undefined ? v : ''; }
    );
  }

  // ============================================================
  // COLOR INPUT (native browser color picker)
  // ============================================================
  function colorInput(config) {
    config = config || {};
    var wrap = document.createElement('div');
    wrap.className = 'vvi-control';

    if (config.label) {
      var label = document.createElement('label');
      label.className = 'vvi-label';
      label.textContent = config.label;
      wrap.appendChild(label);
    }

    var input = document.createElement('input');
    input.type = 'color';
    input.className = 'vvi-color';
    if (config.value) input.value = rgb2hex(config.value);
    wrap.appendChild(input);

    // Palette datalist (optional)
    if (config.palette && config.palette.length) {
      var datalist = document.createElement('datalist');
      datalist.id = (config.key || 'color') + '-palette';
      input.setAttribute('list', datalist.id);
      config.palette.forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = c;
        datalist.appendChild(opt);
      });
      wrap.appendChild(datalist);
    }

    input.addEventListener('change', function () {
      emitChange(wrap, input.value);
    });

    return attachMethods(wrap,
      function () { return input.value; },
      function (v) { input.value = v ? (rgb2hex(v) || '#000000') : '#000000'; }
    );
  }

  // ============================================================
  // RANGE INPUT (slider + number pair)
  // ============================================================
  function rangeInput(config) {
    config = config || {};
    var wrap = document.createElement('div');
    wrap.className = 'vvi-control';

    if (config.label) {
      var label = document.createElement('label');
      label.className = 'vvi-label';
      label.textContent = config.label;
      wrap.appendChild(label);
    }

    var row = document.createElement('div');
    row.className = 'vvi-range-wrap';

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'vvi-range-slider';
    if (config.min !== undefined) slider.min = config.min;
    if (config.max !== undefined) slider.max = config.max;
    if (config.step !== undefined) slider.step = config.step;
    if (config.value !== undefined && config.value !== null) slider.value = config.value;

    var number = document.createElement('input');
    number.type = 'number';
    number.className = 'vvi-range-number';
    if (config.min !== undefined) number.min = config.min;
    if (config.max !== undefined) number.max = config.max;
    if (config.step !== undefined) number.step = config.step;
    if (config.value !== undefined && config.value !== null) number.value = config.value;

    row.appendChild(slider);
    row.appendChild(number);
    wrap.appendChild(row);

    function sync(value) {
      var val = parseFloat(value);
      if (isNaN(val)) val = config.min || 0;
      slider.value = val;
      number.value = val;
    }

    slider.addEventListener('input', function () {
      number.value = slider.value;
    });
    slider.addEventListener('change', function () {
      sync(slider.value);
      emitChange(wrap, slider.value);
    });

    number.addEventListener('input', function () {
      slider.value = number.value;
    });
    number.addEventListener('change', function () {
      sync(number.value);
      emitChange(wrap, number.value);
    });

    return attachMethods(wrap,
      function () { return number.value; },
      function (v) { sync(v); }
    );
  }

  // ============================================================
  // UNIT INPUT (number + CSS unit select)
  // ============================================================
  function unitInput(config) {
    config = config || {};
    var wrap = document.createElement('div');
    wrap.className = 'vvi-control';

    if (config.label) {
      var label = document.createElement('label');
      label.className = 'vvi-label';
      label.textContent = config.label;
      wrap.appendChild(label);
    }

    var row = document.createElement('div');
    row.className = 'vvi-unit-wrap';

    var number = document.createElement('input');
    number.type = 'number';
    number.className = 'vvi-unit-number';
    if (config.min !== undefined) number.min = config.min;
    if (config.max !== undefined) number.max = config.max;
    if (config.step !== undefined) number.step = config.step;

    var unitSelect = document.createElement('select');
    unitSelect.className = 'vvi-unit-select';
    var units = config.units || ['em', 'rem', 'px', '%', 'vw', 'vh', 'ex', 'ch', 'cm', 'mm', 'in', 'pt', 'auto', ''];
    units.forEach(function (u) {
      var opt = document.createElement('option');
      opt.value = u;
      opt.textContent = u === '' ? '-' : u;
      unitSelect.appendChild(opt);
    });

    row.appendChild(number);
    row.appendChild(unitSelect);
    wrap.appendChild(row);

    function getCompoundValue() {
      if (row.classList.contains('auto') || unitSelect.value === 'auto') return 'auto';
      if (unitSelect.value === '') return number.value;
      return (number.value || 0) + (unitSelect.value || 'px');
    }

    function fire() {
      emitChange(wrap, getCompoundValue());
    }

    number.addEventListener('change', fire);
    number.addEventListener('keyup', fire);
    unitSelect.addEventListener('change', function () {
      if (unitSelect.value === 'auto') {
        row.classList.add('auto');
        number.value = '';
        number.disabled = true;
      } else {
        row.classList.remove('auto');
        number.disabled = false;
      }
      fire();
    });

    // Set initial value
    if (config.value !== undefined && config.value !== null && config.value !== '') {
      var parsed = parseCssValue(config.value);
      if (parsed.unit === 'auto') {
        row.classList.add('auto');
        number.disabled = true;
        number.value = '';
        unitSelect.value = 'auto';
      } else {
        number.value = parsed.number;
        unitSelect.value = parsed.unit || 'px';
      }
    }

    return attachMethods(wrap,
      function () { return getCompoundValue(); },
      function (v) {
        var parsed = parseCssValue(v);
        if (parsed.unit === 'auto') {
          row.classList.add('auto');
          number.disabled = true;
          number.value = '';
          unitSelect.value = 'auto';
        } else {
          row.classList.remove('auto');
          number.disabled = false;
          number.value = parsed.number;
          unitSelect.value = parsed.unit || 'px';
        }
      }
    );
  }

  // ============================================================
  // SPACING INPUT (4-way margin/padding with lock)
  // ============================================================
  function spacingInput(config) {
    config = config || {};
    var wrap = document.createElement('div');
    wrap.className = 'vvi-control vvi-spacing-wrap';

    if (config.label) {
      var label = document.createElement('label');
      label.className = 'vvi-label';
      label.textContent = config.label;
      wrap.appendChild(label);
    }

    var grid = document.createElement('div');
    grid.className = 'vvi-spacing-grid';

    var topInput = document.createElement('input');
    topInput.type = 'number';
    topInput.className = 'vvi-spacing-input vvi-spacing-top';
    topInput.placeholder = '0';
    var rightInput = document.createElement('input');
    rightInput.type = 'number';
    rightInput.className = 'vvi-spacing-input vvi-spacing-right';
    rightInput.placeholder = '0';
    var bottomInput = document.createElement('input');
    bottomInput.type = 'number';
    bottomInput.className = 'vvi-spacing-input vvi-spacing-bottom';
    bottomInput.placeholder = '0';
    var leftInput = document.createElement('input');
    leftInput.type = 'number';
    leftInput.className = 'vvi-spacing-input vvi-spacing-left';
    leftInput.placeholder = '0';

    var lockBtn = document.createElement('button');
    lockBtn.type = 'button';
    lockBtn.className = 'vvi-lock-btn';
    lockBtn.textContent = '\u{1F517}'; // link emoji
    lockBtn.title = 'Link all sides';
    var locked = true;
    lockBtn.classList.add('locked');

    // Empty cells for the 3x3 grid (corners)
    var empty1 = document.createElement('div');
    var empty2 = document.createElement('div');
    var empty3 = document.createElement('div');
    var empty4 = document.createElement('div');

    grid.appendChild(empty1);
    grid.appendChild(topInput);
    grid.appendChild(empty2);
    grid.appendChild(leftInput);
    grid.appendChild(lockBtn);
    grid.appendChild(rightInput);
    grid.appendChild(empty3);
    grid.appendChild(bottomInput);
    grid.appendChild(empty4);

    wrap.appendChild(grid);

    lockBtn.addEventListener('click', function (e) {
      e.preventDefault();
      locked = !locked;
      if (locked) {
        lockBtn.classList.add('locked');
        // Sync all to the first changed value
        var vals = [topInput.value, rightInput.value, bottomInput.value, leftInput.value];
        var nonEmpty = vals.find(function (v) { return v !== ''; });
        var syncVal = nonEmpty || '';
        topInput.value = syncVal;
        rightInput.value = syncVal;
        bottomInput.value = syncVal;
        leftInput.value = syncVal;
      } else {
        lockBtn.classList.remove('locked');
      }
    });

    function getCompound() {
      var t = (topInput.value || '0') + 'px';
      var r = (rightInput.value || '0') + 'px';
      var b = (bottomInput.value || '0') + 'px';
      var l = (leftInput.value || '0') + 'px';
      return buildFourShorthand(t, r, b, l);
    }

    function fire() {
      if (locked) {
        var val = this.value;
        topInput.value = val;
        rightInput.value = val;
        bottomInput.value = val;
        leftInput.value = val;
      }
      emitChange(wrap, getCompound());
    }

    topInput.addEventListener('input', fire);
    rightInput.addEventListener('input', fire);
    bottomInput.addEventListener('input', fire);
    leftInput.addEventListener('input', fire);
    topInput.addEventListener('change', fire);
    rightInput.addEventListener('change', fire);
    bottomInput.addEventListener('change', fire);
    leftInput.addEventListener('change', fire);

    // Set initial value
    var parsed = parseFourShorthand(config.value || '');
    topInput.value = parseCssValue(parsed[0]).number || '';
    rightInput.value = parseCssValue(parsed[1]).number || '';
    bottomInput.value = parseCssValue(parsed[2]).number || '';
    leftInput.value = parseCssValue(parsed[3]).number || '';

    // If all equal, start locked
    if (parsed[0] === parsed[1] && parsed[1] === parsed[2] && parsed[2] === parsed[3]) {
      locked = true;
      lockBtn.classList.add('locked');
    } else {
      locked = false;
      lockBtn.classList.remove('locked');
    }

    return attachMethods(wrap,
      function () { return getCompound(); },
      function (v) {
        var p = parseFourShorthand(v);
        topInput.value = parseCssValue(p[0]).number || '';
        rightInput.value = parseCssValue(p[1]).number || '';
        bottomInput.value = parseCssValue(p[2]).number || '';
        leftInput.value = parseCssValue(p[3]).number || '';
        if (p[0] === p[1] && p[1] === p[2] && p[2] === p[3]) {
          locked = true;
          lockBtn.classList.add('locked');
        }
      }
    );
  }

  // ============================================================
  // BORDER-RADIUS INPUT
  // ============================================================
  function borderRadiusInput(config) {
    config = config || {};
    var wrap = document.createElement('div');
    wrap.className = 'vvi-control vvi-radius-wrap';

    if (config.label) {
      var label = document.createElement('label');
      label.className = 'vvi-label';
      label.textContent = config.label;
      wrap.appendChild(label);
    }

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;';

    var grid = document.createElement('div');
    grid.className = 'vvi-radius-grid';

    var tl = document.createElement('input');
    tl.type = 'number';
    tl.className = 'vvi-radius-input vvi-radius-tl';
    tl.placeholder = '0';
    var tr = document.createElement('input');
    tr.type = 'number';
    tr.className = 'vvi-radius-input vvi-radius-tr';
    tr.placeholder = '0';
    var br = document.createElement('input');
    br.type = 'number';
    br.className = 'vvi-radius-input vvi-radius-br';
    br.placeholder = '0';
    var bl = document.createElement('input');
    bl.type = 'number';
    bl.className = 'vvi-radius-input vvi-radius-bl';
    bl.placeholder = '0';

    grid.appendChild(tl);
    grid.appendChild(tr);
    grid.appendChild(bl);
    grid.appendChild(br);

    var lockBtn = document.createElement('button');
    lockBtn.type = 'button';
    lockBtn.className = 'vvi-lock-btn';
    lockBtn.textContent = '\u{1F517}';
    lockBtn.title = 'Link all corners';
    lockBtn.style.cssText = 'flex-shrink:0;';
    var locked = true;
    lockBtn.classList.add('locked');

    row.appendChild(grid);
    row.appendChild(lockBtn);
    wrap.appendChild(row);

    lockBtn.addEventListener('click', function (e) {
      e.preventDefault();
      locked = !locked;
      if (locked) {
        lockBtn.classList.add('locked');
        var vals = [tl.value, tr.value, br.value, bl.value];
        var nonEmpty = vals.find(function (v) { return v !== ''; });
        var syncVal = nonEmpty || '';
        tl.value = syncVal;
        tr.value = syncVal;
        br.value = syncVal;
        bl.value = syncVal;
      } else {
        lockBtn.classList.remove('locked');
      }
    });

    function getCompound() {
      var a = (tl.value || '0') + 'px';
      var b = (tr.value || '0') + 'px';
      var c = (br.value || '0') + 'px';
      var d = (bl.value || '0') + 'px';
      return buildFourShorthand(a, b, c, d);
    }

    function fire() {
      if (locked) {
        var val = this.value;
        tl.value = val;
        tr.value = val;
        br.value = val;
        bl.value = val;
      }
      emitChange(wrap, getCompound());
    }

    tl.addEventListener('input', fire);
    tr.addEventListener('input', fire);
    br.addEventListener('input', fire);
    bl.addEventListener('input', fire);
    tl.addEventListener('change', fire);
    tr.addEventListener('change', fire);
    br.addEventListener('change', fire);
    bl.addEventListener('change', fire);

    // Set initial value
    var parsed = parseFourShorthand(config.value || '');
    tl.value = parseCssValue(parsed[0]).number || '';
    tr.value = parseCssValue(parsed[1]).number || '';
    br.value = parseCssValue(parsed[2]).number || '';
    bl.value = parseCssValue(parsed[3]).number || '';

    if (parsed[0] === parsed[1] && parsed[1] === parsed[2] && parsed[2] === parsed[3]) {
      locked = true;
      lockBtn.classList.add('locked');
    } else {
      locked = false;
      lockBtn.classList.remove('locked');
    }

    return attachMethods(wrap,
      function () { return getCompound(); },
      function (v) {
        var p = parseFourShorthand(v);
        tl.value = parseCssValue(p[0]).number || '';
        tr.value = parseCssValue(p[1]).number || '';
        br.value = parseCssValue(p[2]).number || '';
        bl.value = parseCssValue(p[3]).number || '';
        if (p[0] === p[1] && p[1] === p[2] && p[2] === p[3]) {
          locked = true;
          lockBtn.classList.add('locked');
        }
      }
    );
  }

  // ============================================================
  // BOX-SHADOW INPUT
  // ============================================================
  function boxShadowInput(config) {
    config = config || {};
    var wrap = document.createElement('div');
    wrap.className = 'vvi-control vvi-shadow-wrap';

    if (config.label) {
      var label = document.createElement('label');
      label.className = 'vvi-label';
      label.textContent = config.label;
      wrap.appendChild(label);
    }

    // Helper to make a labeled row
    function makeRow(labelText, rowClass) {
      var r = document.createElement('div');
      r.className = rowClass || 'vvi-shadow-row';
      var lbl = document.createElement('label');
      lbl.textContent = labelText;
      var inp = document.createElement('input');
      inp.type = 'number';
      inp.className = 'vvi-shadow-input';
      r.appendChild(lbl);
      r.appendChild(inp);
      return { row: r, input: inp };
    }

    var offsetX = makeRow('X');
    var offsetY = makeRow('Y');
    var blur = makeRow('B');
    var spread = makeRow('S');

    // Color row
    var colorRow = document.createElement('div');
    colorRow.className = 'vvi-shadow-color-row';
    var colorLabel = document.createElement('label');
    colorLabel.textContent = 'C';
    var colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'vvi-shadow-color';
    colorRow.appendChild(colorLabel);
    colorRow.appendChild(colorInput);

    // Inset checkbox
    var checkWrap = document.createElement('div');
    checkWrap.className = 'vvi-check-wrap';
    var insetCheck = document.createElement('input');
    insetCheck.type = 'checkbox';
    insetCheck.className = 'vvi-check';
    insetCheck.id = 'vvi-shadow-inset-' + (config.key || Math.random().toString(36).slice(2, 8));
    var insetLabel = document.createElement('label');
    insetLabel.className = 'vvi-check-label';
    insetLabel.textContent = 'Inset';
    insetLabel.setAttribute('for', insetCheck.id);
    checkWrap.appendChild(insetCheck);
    checkWrap.appendChild(insetLabel);

    wrap.appendChild(offsetX.row);
    wrap.appendChild(offsetY.row);
    wrap.appendChild(blur.row);
    wrap.appendChild(spread.row);
    wrap.appendChild(colorRow);
    wrap.appendChild(checkWrap);

    function getCompound() {
      var x = offsetX.input.value || '0';
      var y = offsetY.input.value || '0';
      var b = blur.input.value || '0';
      var s = spread.input.value || '0';
      var c = colorInput.value || '#000000';
      var parts = x + 'px ' + y + 'px ' + b + 'px ' + s + 'px ' + c;
      if (insetCheck.checked) parts += ' inset';
      if (x === '0' && y === '0' && b === '0' && s === '0') return 'none';
      return parts;
    }

    function fire() {
      emitChange(wrap, getCompound());
    }

    offsetX.input.addEventListener('change', fire);
    offsetY.input.addEventListener('change', fire);
    blur.input.addEventListener('change', fire);
    spread.input.addEventListener('change', fire);
    offsetX.input.addEventListener('focusout', fire);
    offsetY.input.addEventListener('focusout', fire);
    blur.input.addEventListener('focusout', fire);
    spread.input.addEventListener('focusout', fire);
    colorInput.addEventListener('change', fire);
    insetCheck.addEventListener('change', fire);

    // Set initial value
    if (config.value && config.value !== 'none') {
      var val = config.value.replace(/\s*inset\s*/i, ' inset ').trim();
      insetCheck.checked = /inset/i.test(val);
      val = val.replace(/\s*inset\s*/i, '').trim();
      // Match color: hex, rgb, rgba, hsl
      var colorMatch = val.match(/(#(?:[0-9a-fA-F]{3,8})|rgba?\([^)]+\)|hsla?\([^)]+\))/);
      if (colorMatch) {
        colorInput.value = rgb2hex(colorMatch[0]);
        val = val.replace(colorMatch[0], '').trim();
      }
      var parts = val.split(/\s+/).filter(function (p) { return p !== ''; });
      if (parts.length >= 1) offsetX.input.value = parseFloat(parts[0]) || 0;
      if (parts.length >= 2) offsetY.input.value = parseFloat(parts[1]) || 0;
      if (parts.length >= 3) blur.input.value = parseFloat(parts[2]) || 0;
      if (parts.length >= 4) spread.input.value = parseFloat(parts[3]) || 0;
    }

    return attachMethods(wrap,
      function () { return getCompound(); },
      function (v) {
        if (!v || v === 'none') {
          offsetX.input.value = 0;
          offsetY.input.value = 0;
          blur.input.value = 0;
          spread.input.value = 0;
          colorInput.value = '#000000';
          insetCheck.checked = false;
          return;
        }
        var val = v.replace(/\s*inset\s*/i, ' inset ').trim();
        insetCheck.checked = /inset/i.test(val);
        val = val.replace(/\s*inset\s*/i, '').trim();
        var colorMatch = val.match(/(#(?:[0-9a-fA-F]{3,8})|rgba?\([^)]+\)|hsla?\([^)]+\))/);
        if (colorMatch) {
          colorInput.value = rgb2hex(colorMatch[0]);
          val = val.replace(colorMatch[0], '').trim();
        }
        var parts = val.split(/\s+/).filter(function (p) { return p !== ''; });
        if (parts.length >= 1) offsetX.input.value = parseFloat(parts[0]) || 0;
        if (parts.length >= 2) offsetY.input.value = parseFloat(parts[1]) || 0;
        if (parts.length >= 3) blur.input.value = parseFloat(parts[2]) || 0;
        if (parts.length >= 4) spread.input.value = parseFloat(parts[3]) || 0;
      }
    );
  }

  // ============================================================
  // CHECKBOX INPUT
  // ============================================================
  function checkboxInput(config) {
    config = config || {};
    var wrap = document.createElement('div');
    wrap.className = 'vvi-control vvi-check-wrap';

    var check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'vvi-check';
    var id = 'vvi-check-' + (config.key || Math.random().toString(36).slice(2, 8));
    check.id = id;
    if (config.value) check.checked = true;

    var checkLabel = document.createElement('label');
    checkLabel.className = 'vvi-check-label';
    checkLabel.textContent = config.text || config.label || '';
    checkLabel.setAttribute('for', id);

    wrap.appendChild(check);
    wrap.appendChild(checkLabel);

    check.addEventListener('change', function () {
      emitChange(wrap, check.checked);
    });

    return attachMethods(wrap,
      function () { return check.checked; },
      function (v) { check.checked = !!v; }
    );
  }

  // ============================================================
  // NUMBER INPUT (standalone number field)
  // ============================================================
  function numberInput(config) {
    config = config || {};
    var wrap = document.createElement('div');
    wrap.className = 'vvi-control';

    if (config.label) {
      var label = document.createElement('label');
      label.className = 'vvi-label';
      label.textContent = config.label;
      wrap.appendChild(label);
    }

    var input = document.createElement('input');
    input.type = 'number';
    input.className = 'vvi-number';
    if (config.placeholder) input.placeholder = config.placeholder;
    if (config.value !== undefined && config.value !== null) input.value = config.value;
    if (config.min !== undefined) input.min = config.min;
    if (config.max !== undefined) input.max = config.max;
    if (config.step !== undefined) input.step = config.step;
    wrap.appendChild(input);

    input.addEventListener('change', function () {
      emitChange(wrap, input.value);
    });

    return attachMethods(wrap,
      function () { return input.value; },
      function (v) { input.value = v !== null && v !== undefined ? v : ''; }
    );
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  return {
    textInput: textInput,
    text: textInput,
    selectInput: selectInput,
    select: selectInput,
    colorInput: colorInput,
    color: colorInput,
    rangeInput: rangeInput,
    range: rangeInput,
    unitInput: unitInput,
    unit: unitInput,
    spacingInput: spacingInput,
    spacing: spacingInput,
    borderRadiusInput: borderRadiusInput,
    borderRadius: borderRadiusInput,
    boxShadowInput: boxShadowInput,
    boxShadow: boxShadowInput,
    checkboxInput: checkboxInput,
    checkbox: checkboxInput,
    numberInput: numberInput,
    number: numberInput,
    // Utility helpers (exposed for advanced use)
    rgb2hex: rgb2hex,
    parseCssValue: parseCssValue,
    parseFourShorthand: parseFourShorthand,
    buildFourShorthand: buildFourShorthand
  };

})();
