(function () {
  'use strict';

  var ANDROID_STORE =
    'https://play.google.com/store/apps/details?id=com.zagmob.outlived';
  var IOS_STORE = 'https://apps.apple.com/app/out-lived/id6760954055';
  var IOS_APP_ID = '6760954055';

  var KNOWN_NAMES = {
    'greg-zagmob': 'Greg @ ZaGMob',
    'zak-zagmob': 'Zak @ ZaGMob',
  };

  function parseDeepLinkPath(pathname) {
    var match = pathname.match(/^\/p\/([^/]+)\/?$/);
    return match ? match[1] : null;
  }

  function parseGiftPath(pathname) {
    var match = pathname.match(/^\/g\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  function formatGiftCode(code) {
    return String(code || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '');
  }

  function base64UrlDecode(encoded) {
    var str = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    var binary = atob(str);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  function slugToTeaser(slug) {
    if (KNOWN_NAMES[slug]) {
      return KNOWN_NAMES[slug];
    }
    return slug
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      });
  }

  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  function setSmartAppBanner(deepLinkUrl) {
    if (!/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      return;
    }
    var meta = document.createElement('meta');
    meta.name = 'apple-itunes-app';
    meta.content =
      'app-id=' + IOS_APP_ID + ', app-argument=' + encodeURI(deepLinkUrl);
    document.head.appendChild(meta);
  }

  function injectStyles() {
    if (document.getElementById('deeplink-landing-styles')) {
      return;
    }
    var style = document.createElement('style');
    style.id = 'deeplink-landing-styles';
    style.textContent =
      "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');" +
      ':root { --primary: #2563eb; --navy: #0d1b2a; }' +
      'body.deeplink-body { margin: 0; font-family: Inter, system-ui, sans-serif; line-height: 1.6; color: #1f2937; background: linear-gradient(180deg, #0d1b2a 0%, #1b2f4a 28%, #f8fafc 28%, #e0f2fe 100%); min-height: 100vh; }' +
      '.deeplink-wrap { max-width: 720px; margin: 0 auto; padding: 24px 20px 48px; }' +
      '.deeplink-card { background: #fff; border-radius: 24px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12); padding: 36px 28px; text-align: center; }' +
      '.deeplink-logo { width: 88px; height: 88px; border-radius: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); margin-bottom: 20px; }' +
      '.deeplink-eyebrow { font-size: 0.85rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin: 0 0 12px; }' +
      '.deeplink-title { font-size: clamp(1.75rem, 5vw, 2.35rem); font-weight: 700; color: #0f172a; margin: 0 0 16px; }' +
      '.deeplink-copy { font-size: 1.08rem; color: #475569; margin: 0 auto 28px; max-width: 520px; }' +
      '.deeplink-figure { display: inline-block; background: linear-gradient(135deg, #dbeafe, #eff6ff); color: #1e3a8a; font-weight: 600; padding: 10px 18px; border-radius: 999px; margin-bottom: 28px; }' +
      '.deeplink-actions { display: flex; flex-direction: column; gap: 14px; align-items: center; margin-top: 8px; }' +
      '.deeplink-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-width: 260px; padding: 14px 24px; border-radius: 999px; font-size: 1rem; font-weight: 600; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; }' +
      '.deeplink-btn:hover { transform: translateY(-2px); }' +
      '.deeplink-btn-primary { background: var(--primary); color: #fff; box-shadow: 0 10px 24px rgba(37, 99, 235, 0.35); }' +
      '.deeplink-btn-secondary { background: #fff; color: #1f2937; border: 2px solid #e2e8f0; }' +
      '.deeplink-store-row { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin-top: 8px; }' +
      '.deeplink-store-row a { display: inline-block; }' +
      '.deeplink-store-row img { height: 48px; width: auto; display: block; }' +
      '.deeplink-foot { text-align: center; margin-top: 28px; color: #64748b; font-size: 0.92rem; }' +
      '.deeplink-foot a { color: #475569; }' +
      '.deeplink-404 { text-align: center; padding: 80px 20px; }' +
      '.deeplink-404 h1 { font-size: 2rem; color: #0f172a; }';
    document.head.appendChild(style);
  }

  function renderGiftLanding(root, rawCode) {
    injectStyles();
    document.body.className = 'deeplink-body';
    document.title = 'Claim your free week — Out Lived!';

    var giftCode = formatGiftCode(rawCode);
    var deepLinkUrl = window.location.origin + '/g/' + encodeURIComponent(giftCode);
    setSmartAppBanner(deepLinkUrl);

    root.innerHTML =
      '<div class="deeplink-wrap">' +
      '  <div class="deeplink-card">' +
      '    <img class="deeplink-logo" src="/images/app_icon.png" alt="Out Lived! app icon">' +
      '    <p class="deeplink-eyebrow">Gift from a friend</p>' +
      '    <h1 class="deeplink-title">You\'ve been gifted a free week</h1>' +
      '    <p class="deeplink-copy">Someone shared premium access to <strong>Out Lived!</strong> — daily matches with real people from history who lived exactly one day less than you.</p>' +
      (giftCode
        ? '    <div class="deeplink-figure">Gift code: ' + escapeHtml(giftCode) + '</div>'
        : '') +
      '    <div class="deeplink-actions">' +
      (isMobile()
        ? '      <a class="deeplink-btn deeplink-btn-primary" href="' +
          escapeAttr(deepLinkUrl) +
          '">Claim in Out Lived!</a>'
        : '') +
      '      <div class="deeplink-store-row">' +
      '        <a href="' +
      escapeAttr(ANDROID_STORE) +
      '" target="_blank" rel="noopener">' +
      '          <img src="/images/AndroidDownload.png" alt="Get it on Google Play">' +
      '        </a>' +
      '        <a href="' +
      escapeAttr(IOS_STORE) +
      '" target="_blank" rel="noopener">' +
      '          <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store">' +
      '        </a>' +
      '      </div>' +
      '      <p class="deeplink-copy" style="margin-top: 8px; font-size: 0.95rem;">After installing, <strong>tap this link again</strong> to claim your free week. Or open the app and go to Settings → Have a gift code?</p>' +
      '      <a class="deeplink-btn deeplink-btn-secondary" href="/outlived.html">Learn about Out Lived!</a>' +
      '    </div>' +
      '  </div>' +
      '  <p class="deeplink-foot">© 2026 <a href="/">ZaGMob</a> · <a href="/privacy_policy.html">Privacy</a></p>' +
      '</div>';
  }

  function renderDeepLinkLanding(root, encodedSlug) {
    injectStyles();
    document.body.className = 'deeplink-body';
    document.title = 'Open in Out Lived! — Shared from history';

    var slug = null;
    var teaser = 'a historical figure';
    try {
      slug = base64UrlDecode(encodedSlug);
      if (slug) {
        teaser = slugToTeaser(slug);
      }
    } catch (e) {
      slug = null;
    }

    var deepLinkUrl = window.location.origin + '/p/' + encodedSlug;
    setSmartAppBanner(deepLinkUrl);

    root.innerHTML =
      '<div class="deeplink-wrap">' +
      '  <div class="deeplink-card">' +
      '    <img class="deeplink-logo" src="/images/app_icon.png" alt="Out Lived! app icon">' +
      '    <p class="deeplink-eyebrow">Shared from Out Lived!</p>' +
      '    <h1 class="deeplink-title">Someone passed you a piece of history</h1>' +
      '    <p class="deeplink-copy">A friend shared a person from the Pantheon dataset — real lives, measured in days. Open <strong>Out Lived!</strong> to see who it is and discover who you\'ve already outlived.</p>' +
      (slug
        ? '    <div class="deeplink-figure">Shared link: ' + escapeHtml(teaser) + '</div>'
        : '') +
      '    <div class="deeplink-actions">' +
      (isMobile()
        ? '      <a class="deeplink-btn deeplink-btn-primary" href="' +
          escapeAttr(deepLinkUrl) +
          '">Open in Out Lived!</a>'
        : '') +
      '      <div class="deeplink-store-row">' +
      '        <a href="' +
      escapeAttr(ANDROID_STORE) +
      '" target="_blank" rel="noopener">' +
      '          <img src="/images/AndroidDownload.png" alt="Get it on Google Play">' +
      '        </a>' +
      '        <a href="' +
      escapeAttr(IOS_STORE) +
      '" target="_blank" rel="noopener">' +
      '          <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store">' +
      '        </a>' +
      '      </div>' +
      '      <a class="deeplink-btn deeplink-btn-secondary" href="/outlived.html">Learn about Out Lived!</a>' +
      '    </div>' +
      '  </div>' +
      '  <p class="deeplink-foot">© 2026 <a href="/">ZaGMob</a> · <a href="/privacy_policy.html">Privacy</a></p>' +
      '</div>';
  }

  function renderGeneric404(root) {
    injectStyles();
    document.body.className = 'deeplink-body';
    document.title = 'Page not found — Zagmob';
    root.innerHTML =
      '<div class="deeplink-404">' +
      '  <h1>Page not found</h1>' +
      '  <p>That URL doesn\'t exist on zagmob.com.</p>' +
      '  <p><a class="deeplink-btn deeplink-btn-primary" href="/">Back to Zagmob</a></p>' +
      '</div>';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, '&#39;');
  }

  window.DeeplinkLanding = {
    init: function (rootId) {
      var root = document.getElementById(rootId || 'deeplink-root');
      if (!root) {
        return false;
      }

      var giftCode = parseGiftPath(window.location.pathname);
      if (giftCode) {
        renderGiftLanding(root, giftCode);
        return true;
      }

      var encodedSlug = parseDeepLinkPath(window.location.pathname);
      if (encodedSlug) {
        renderDeepLinkLanding(root, encodedSlug);
        return true;
      }

      return false;
    },
    init404: function (rootId) {
      var root = document.getElementById(rootId || 'deeplink-root');
      if (!root) {
        return;
      }
      if (!window.DeeplinkLanding.init(rootId)) {
        renderGeneric404(root);
      }
    },
  };
})();