const MAX_HTML_SIZE = 2 * 1024 * 1024;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'queryTargets':
      queryTargets().then(sendResponse);
      return true;
    case 'injectContent':
      injectContent(message.payload).then(sendResponse);
      return true;
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

async function queryTargets() {
  const tabs = await chrome.tabs.query({
    url: ['https://mp.weixin.qq.com/cgi-bin/appmsg?*']
  });

  const results = [];
  for (const tab of tabs) {
    if (tab.discarded) continue;
    if (!isEditPage(tab.url)) continue;

    try {
      const probe = await chrome.tabs.sendMessage(tab.id, { action: 'sink.probe' });
      if (probe && probe.ready) {
        results.push({
          tabId: tab.id,
          title: tab.title,
          accountName: probe.accountName || null,
          accountThumb: probe.accountThumb || null,
          articleTitle: probe.articleTitle || null
        });
      }
    } catch (_) {
      // sink script not loaded in this tab — not an editor page
    }
  }
  return { success: true, targets: results };
}

function isEditPage(url) {
  if (!url) return false;
  try {
    var u = new URL(url);
    var t = u.searchParams.get('t') || '';
    if (t === 'media/appmsg_edit') return true;
    if (t === 'media/appmsg_edit_v2') {
      var isNew = u.searchParams.get('isNew') || '';
      var createType = u.searchParams.get('createType') || '0';
      return isNew === '1' && createType === '0';
    }
    return false;
  } catch (_) {
    return false;
  }
}

async function injectContent(payload) {
  if (!payload || !payload.tabId) return { success: false, error: 'Missing tabId' };
  if (!payload.html) return { success: false, error: 'Missing html' };

  if (payload.html.length > MAX_HTML_SIZE) {
    return { success: false, error: `HTML size ${(payload.html.length/1024).toFixed(0)}KB exceeds 2MB limit` };
  }
  if (/<script[\s>]/i.test(payload.html) || /javascript:/i.test(payload.html)) {
    return { success: false, error: 'HTML contains forbidden script or javascript:' };
  }

  // verify target still ready
  try {
    const tab = await chrome.tabs.get(payload.tabId);
    if (!tab || tab.discarded) return { success: false, error: 'Target tab no longer available' };
    const probe = await chrome.tabs.sendMessage(payload.tabId, { action: 'sink.probe' });
    if (!probe || !probe.ready) return { success: false, error: 'Editor not ready. Refresh WeChat page first.' };
  } catch (_) {
    return { success: false, error: 'Cannot reach WeChat tab. Refresh the editor page.' };
  }

  // inject into MAIN world
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: payload.tabId },
      func: injectIntoEditor,
      args: [payload],
      world: 'MAIN'
    });
    return results[0]?.result || { success: false, error: 'Injection returned no result' };
  } catch (e) {
    return { success: false, error: `Injection error: ${e.message}` };
  }
}

// ---- MAIN world injection function (self-contained) ----

async function injectIntoEditor(payload) {
  function log(msg) { console.log('[WeChatInject]', msg); }

  function writeValue(el, text) {
    var nativeSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el), 'value'
    );
    if (nativeSetter && nativeSetter.set) {
      nativeSetter.set.call(el, text);
    } else {
      el.value = text;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function readEditorHTML() {
    var pmHost = document.querySelector('.edui-editor-iframeholder .editor-v-root') ||
                 document.querySelector('[class*="editor"][class*="root"]');
    if (pmHost && pmHost.shadowRoot) {
      var pmContent = pmHost.shadowRoot.querySelector(
        '.mock-iframe-document .mock-iframe-body .rich_media_content > .ProseMirror'
      ) || pmHost.shadowRoot.querySelector('[contenteditable="true"]');
      if (pmContent) return pmContent.innerHTML || '';
    }
    var allEls = document.querySelectorAll('*');
    for (var i = 0; i < allEls.length; i++) {
      if (!allEls[i].shadowRoot) continue;
      var inner = allEls[i].shadowRoot.querySelector('.ProseMirror') ||
                  allEls[i].shadowRoot.querySelector('[contenteditable="true"]');
      if (inner) return inner.innerHTML || '';
    }
    var iframe = document.querySelector('.edui-editor-iframeholder > iframe') ||
                 document.querySelector('#ueditor_0') ||
                 document.querySelector('iframe[name="ueditor_0"]');
    if (iframe) {
      try {
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        return doc.body ? doc.body.innerHTML || '' : '';
      } catch (_) {}
    }
    return '';
  }

  function normalizedText(html) {
    var div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function verifyInjectedHTML() {
    var currentHtml = readEditorHTML();
    var expectedText = normalizedText(payload.html);
    var currentText = normalizedText(currentHtml);
    var expectedProbe = expectedText.slice(0, Math.min(40, expectedText.length));
    return {
      verified: !!currentHtml && (!expectedProbe || currentText.indexOf(expectedProbe) !== -1),
      readLength: currentHtml.length,
      expectedTextLength: expectedText.length
    };
  }

  // --- metadata fields ---
  if (payload.title) {
    var titleEl = document.querySelector('.js_title_main .js_article_title') ||
                  document.querySelector('#title') ||
                  document.querySelector('[placeholder*="标题"]');
    if (titleEl) { writeValue(titleEl, payload.title); log('标题 written'); }
    else { log('标题 NOT FOUND'); }
  }

  if (payload.desc) {
    var descEl = document.querySelector('.js_desc_area .js_desc') ||
                 document.querySelector('#desc') ||
                 document.querySelector('[placeholder*="摘要"]');
    if (descEl) { writeValue(descEl, payload.desc); log('摘要 written'); }
    else { log('摘要 NOT FOUND'); }
  }

  if (payload.author) {
    var authorEl = document.querySelector('.js_author_container .js_author') ||
                   document.querySelector('#author') ||
                   document.querySelector('[placeholder*="作者"]');
    if (authorEl) { writeValue(authorEl, payload.author); log('作者 written'); }
    else { log('作者 NOT FOUND'); }
  }

  // --- source link ---
  if (payload.sourceLink) {
    var linkTrigger = document.querySelector('.js_url_area .frm_checkbox_label') ||
                      document.querySelector('[class*="url_area"] label');
    if (linkTrigger) {
      linkTrigger.click();
      setTimeout(function() {
        var linkInput = document.querySelector('.popover-article-setting__content .js_url') ||
                        document.querySelector('[class*="popover"] [class*="url"] input') ||
                        document.querySelector('[class*="popover"] input[placeholder*="链接"]');
        if (linkInput) {
          writeValue(linkInput, payload.sourceLink);
          log('原文链接 written');
          var confirmBtn = document.querySelector('.popover_article_setting_large .popover_bar .btn_primary') ||
                           document.querySelector('[class*="popover"] .btn_primary');
          if (confirmBtn) { confirmBtn.classList.remove('btn_disabled'); confirmBtn.click(); log('链接确认 clicked'); }
        } else { log('链接输入框 NOT FOUND'); }
      }, 600);
    } else { log('链接触发器 NOT FOUND'); }
  }

  // --- body HTML: three-strategy fallback ---
  var done = false;
  var strategy = '';

  // Strategy A: WeChat JSAPI
  if (!done && typeof window.__MP_Editor_JSAPI__ !== 'undefined') {
    try {
      await new Promise(function(resolve, reject) {
        var settled = false;
        var timer = setTimeout(function() {
          if (settled) return;
          settled = true;
          reject(new Error('JSAPI timeout'));
        }, 5000);
        window.__MP_Editor_JSAPI__.invoke({
          apiName: 'mp_editor_set_content',
          apiParam: { content: payload.html },
          sucCb: function() {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            log('JSAPI success');
            resolve();
          },
          errCb: function(e) {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            reject(new Error('JSAPI error: ' + JSON.stringify(e)));
          }
        });
      });
      log('JSAPI invoked');
      done = true;
      strategy = 'jsapi';
    } catch(e) { log('JSAPI exception: ' + e.message); }
  }

  // Strategy B: ProseMirror via shadow DOM
  if (!done) {
    var pmHost = document.querySelector('.edui-editor-iframeholder .editor-v-root') ||
                 document.querySelector('[class*="editor"][class*="root"]');
    if (pmHost && pmHost.shadowRoot) {
      try {
        var pmContent = pmHost.shadowRoot.querySelector(
          '.mock-iframe-document .mock-iframe-body .rich_media_content > .ProseMirror'
        ) || pmHost.shadowRoot.querySelector('[contenteditable="true"]');
        if (pmContent) {
          pmContent.innerHTML = payload.html;
          pmContent.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertHTML', data: null }));
          pmContent.dispatchEvent(new Event('change', { bubbles: true }));
          log('ProseMirror written');
          done = true;
          strategy = 'prosemirror';
        }
      } catch(e) { log('ProseMirror error: ' + e.message); }
    }
    // walk all shadow roots if specific selector missed
    if (!done) {
      var allEls = document.querySelectorAll('*');
      for (var i = 0; i < allEls.length; i++) {
        if (allEls[i].shadowRoot) {
          try {
            var inner = allEls[i].shadowRoot.querySelector('.ProseMirror') ||
                        allEls[i].shadowRoot.querySelector('[contenteditable="true"]');
            if (inner) {
              inner.innerHTML = payload.html;
              inner.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertHTML', data: null }));
              inner.dispatchEvent(new Event('change', { bubbles: true }));
              log('ProseMirror (fallback) written');
              done = true;
              strategy = 'prosemirror-shadow-fallback';
              break;
            }
          } catch(_) {}
        }
      }
    }
  }

  // Strategy C: UEditor iframe
  if (!done) {
    var iframe = document.querySelector('.edui-editor-iframeholder > iframe') ||
                 document.querySelector('#ueditor_0') ||
                 document.querySelector('iframe[name="ueditor_0"]');
    if (!iframe) {
      var frames = document.querySelectorAll('iframe');
      for (var j = 0; j < frames.length; j++) {
        if ((frames[j].id || '').indexOf('ueditor') >= 0 ||
            (frames[j].name || '').indexOf('ueditor') >= 0) {
          iframe = frames[j]; break;
        }
      }
    }
    if (iframe) {
      try {
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.body.innerHTML = payload.html;
        doc.body.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertHTML', data: null }));
        doc.body.dispatchEvent(new Event('change', { bubbles: true }));
        log('UEditor iframe written');
        done = true;
        strategy = 'ueditor-iframe';
      } catch(e) { log('UEditor error: ' + e.message); }
    }
  }

  if (done) {
    await new Promise(function(resolve) { setTimeout(resolve, 250); });
    var verification = verifyInjectedHTML();
    log('DONE');
    return {
      success: true,
      strategy: strategy,
      verified: verification.verified,
      readLength: verification.readLength,
      expectedTextLength: verification.expectedTextLength
    };
  }
  return { success: false, error: 'All injection strategies failed. Refresh WeChat page and retry.' };
}
