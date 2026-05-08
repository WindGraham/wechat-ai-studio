(function() {
  'use strict';

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message && message.action === 'sink.probe') {
      sendResponse(probe());
      return true;
    }
  });

  function probe() {
    try {
      var nickEl = document.querySelector(
        '.weui-desktop-account #js_div_account_opr .weui-desktop-account__nickname'
      ) || document.querySelector('.account_nickname') ||
        document.querySelector('[class*="nickname"]');
      var accountName = nickEl ? nickEl.textContent.trim() : null;

      var thumbEl = document.querySelector(
        '.weui-desktop-account #js_btn_account_opr .weui-desktop-account__thumb'
      ) || document.querySelector('.account_thumb img') ||
        document.querySelector('img[src*="mmbiz"]');
      var accountThumb = thumbEl ? thumbEl.src : null;

      var editorHolder = document.querySelector('.edui-editor-iframeholder');
      var titleInput = document.querySelector('.js_title_main .js_article_title') ||
                       document.querySelector('#title');
      var descTextarea = document.querySelector('.js_desc_area .js_desc') ||
                         document.querySelector('#desc');

      var editorVisible = false;
      if (editorHolder) {
        var style = getComputedStyle(editorHolder);
        editorVisible = style.display !== 'none' && style.visibility !== 'hidden';
      }

      var ready = editorVisible && !!titleInput && !!descTextarea;
      var articleTitle = titleInput ? titleInput.value : null;

      return {
        ready: ready,
        accountName: accountName,
        accountThumb: accountThumb,
        articleTitle: articleTitle
      };
    } catch (_) {
      return { ready: false };
    }
  }
})();
