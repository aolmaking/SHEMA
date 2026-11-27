'use strict';
/**
 * Shared runtime for every widget page: applies the theme, plays the open and
 * close animations, and provides the few DOM helpers the widgets share.
 *
 * Everything lives inside this IIFE and is published only on `window.UI`.
 * Widget scripts are classic scripts that share one global scope with this
 * file, so a top-level `const $` here would collide with their own
 * `const { $ } = window.UI` and kill the whole script with a SyntaxError.
 */

(function () {
  /* ---------- tiny DOM helpers ---------- */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k === 'style') {
        if (typeof v === 'object' && v !== null) Object.assign(node.style, v);
        else node.setAttribute('style', String(v));
      }
      else node.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of children.flat()) {
      if (c === null || c === undefined || c === false) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  /** Inline SVG icons, stroked so they inherit the current colour. */
  const ICONS = {
    check:    '<path d="M20 6 9 17l-5-5"/>',
    plus:     '<path d="M12 5v14M5 12h14"/>',
    close:    '<path d="M18 6 6 18M6 6l12 12"/>',
    gear:     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.5.55.88 1.06 1H21a2 2 0 1 1 0 4h-.09c-.51.12-.92.5-1.06 1z"/>',
    trash:    '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    list:     '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    note:     '<path d="M14 3v5h5M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M9 13h6M9 17h4"/>',
    book:     '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    refresh:  '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
    copy:     '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    link:     '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    shield:   '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    clock:    '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    chevron:  '<path d="m9 18 6-6-6-6"/>',
    pin:      '<path d="M12 17v5M9 10.8V4h6v6.8l3 3.2H6z"/>',
    search:   '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    info:     '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    play:     '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke-linejoin="round"/>',
    pause:    '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
    skip:     '<path d="M5 5l9 7-9 7z"/><path d="M19 5v14"/>',
    reset:    '<path d="M3 12a9 9 0 1 0 2.64-6.36"/><path d="M3 3v6h6"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    timer:    '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    minus:    '<path d="M5 12h14"/>',
    more:     '<circle cx="5" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.7" fill="currentColor" stroke="none"/>',
    bell:     '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    flag:     '<path d="M4 22V4a1 1 0 0 1 1-1h12l-2 4 2 4H5"/>',
    mail:     '<rect width="18" height="14" x="3" y="5" rx="2"/><path d="m3 7 9 6 9-6"/>',
    image:    '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    eye:      '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    noteSmall: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    globe:    '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    reply:    '<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
    sort:     '<path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"/>',
    sliders:  '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  };

  function icon(name, size) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    if (size) { svg.style.width = `${size}px`; svg.style.height = `${size}px`; }
    svg.innerHTML = ICONS[name] || '';
    return svg;
  }

  /* ---------- theming ---------- */

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex).trim());
    if (!m) return null;
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  }

  let current = {};

  /* ---------- language ----------
     Every page registers its own Arabic and English strings. The Quran text
     and the tafsir never pass through here: they are always shown exactly as
     the source published them, in Arabic, whatever the interface language. */

  const STRINGS = {
    ar: {
      'common.close': 'إغلاق',
      'common.cancel': 'إلغاء',
      'common.hide': 'إخفاء',
      'common.minimize': 'تصغير / استعادة',
      'common.restore': 'استعادة الحجم الطبيعي',
      'common.settings': 'الإعدادات',
      'common.now': 'الآن',
      'ago.min': 'منذ {n} دقيقة',
      'ago.hour': 'منذ {n} ساعة',
      'ago.day': 'منذ {n} يوم',
      'until.hm': '{h} س {m} د',
      'until.m': '{m} د',
      'until.lt': 'أقل من دقيقة',
    },
    en: {
      'common.close': 'Close',
      'common.cancel': 'Cancel',
      'common.hide': 'Hide',
      'common.minimize': 'Minimize / Restore',
      'common.restore': 'Restore Normal Size',
      'common.settings': 'Settings',
      'common.now': 'now',
      'ago.min': '{n} min ago',
      'ago.hour': '{n} h ago',
      'ago.day': '{n} d ago',
      'until.hm': '{h} h {m} min',
      'until.m': '{m} min',
      'until.lt': 'under a minute',
    },
  };

  function strings(dict) {
    for (const lang of Object.keys(dict)) Object.assign(STRINGS[lang] || (STRINGS[lang] = {}), dict[lang]);
  }

  function lang() {
    const l = current.language;
    if (l === 'en' || l === 'ar') return l;
    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return nav.startsWith('ar') ? 'ar' : 'en';
  }

  /** Translate a key, filling in {placeholders}. Falls back to Arabic, and handles s. prefix fallbacks. */
  function t(key, vars) {
    if (!key) return '';
    const table = STRINGS[lang()] || STRINGS.ar;
    const stripped = key.startsWith('s.') ? key.slice(2) : `s.${key}`;
    let str = table[key] ?? STRINGS.ar[key] ?? table[stripped] ?? STRINGS.ar[stripped] ?? key;
    if (vars) str = str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m));
    return str;
  }

  /** Fill every [data-i18n*] attribute under root. */
  function translate(root = document) {
    for (const n of root.querySelectorAll('[data-i18n]')) n.textContent = t(n.dataset.i18n);
    for (const n of root.querySelectorAll('[data-i18n-title]')) n.title = t(n.dataset.i18nTitle);
    for (const n of root.querySelectorAll('[data-i18n-ph]')) {
      const phVal = t(n.dataset.i18nPh);
      n.placeholder = phVal;
      if (n.hasAttribute('data-placeholder') || n.getAttribute('contenteditable')) {
        n.setAttribute('data-placeholder', phVal);
      }
    }
    const titleKey = document.documentElement.dataset.titleKey;
    if (titleKey) document.title = t(titleKey);
  }

  /** Locale for dates and numbers in the interface language. */
  function locale() {
    if (lang() === 'en') return 'en-GB';
    return `ar-EG-u-nu-${current.numerals === 'arab' ? 'arab' : 'latn'}`;
  }

  /** Western digits in a string turned into Arabic-Indic ones when asked for. */
  function digits(value) {
    const str = String(value);
    if (lang() === 'en' || current.numerals !== 'arab') return str;
    return str.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  }

  /* ---------- look: fonts, weights, glass, motion ---------- */

  const FONTS = {
    ui: {
      plex: "'IBM Plex Sans Arabic'", cairo: "'Cairo'", tajawal: "'Tajawal'", almarai: "'Almarai'",
      readex: "'Readex Pro'", kufi: "'Noto Kufi Arabic'", messiri: "'El Messiri'", naskh: "'Noto Naskh Arabic'",
      system: "'Segoe UI Variable Text', 'Segoe UI'",
    },
    read: {
      naskh: "'Noto Naskh Arabic'", amiri: "'Amiri'", scheherazade: "'Scheherazade New'",
      plex: "'IBM Plex Sans Arabic'", cairo: "'Cairo'", tajawal: "'Tajawal'", readex: "'Readex Pro'", kufi: "'Noto Kufi Arabic'",
    },
    quran: {
      'amiri-quran': "'Amiri Quran'", scheherazade: "'Scheherazade New'", amiri: "'Amiri'", naskh: "'Noto Naskh Arabic'",
    },
    num: {
      plex: "'IBM Plex Sans Arabic'", outfit: "'Outfit'", readex: "'Readex Pro'", cairo: "'Cairo'",
      kufi: "'Noto Kufi Arabic'", tajawal: "'Tajawal'", system: "'Segoe UI Variable Display', 'Segoe UI'",
    },
  };

  const LOOK = {
    fontUi: 'plex', fontRead: 'naskh', fontQuran: 'amiri-quran', fontNum: 'plex',
    uiWeight: 400, numWeight: 300, numSpacing: -0.02, lineHeight: 1,
    density: 'normal', edge: 1, borderWidth: 1, grain: true, hover: 1, motion: 1,
    tint: '', tintStrength: 0.25, contrast: 'normal',
    fontColor: 'inherit',
  };

  function applyLook(root, raw) {
    const look = { ...LOOK, ...(raw || {}) };
    const set = (k, v) => root.style.setProperty(k, String(v));
    set('--ff-ui', FONTS.ui[look.fontUi] || FONTS.ui.plex);
    set('--ff-read', FONTS.read[look.fontRead] || FONTS.read.naskh);
    set('--ff-quran', FONTS.quran[look.fontQuran] || FONTS.quran['amiri-quran']);
    set('--ff-num', FONTS.num[look.fontNum] || FONTS.num.plex);
    set('--ui-weight', look.uiWeight);
    set('--num-weight', look.numWeight);
    set('--num-ls', `${look.numSpacing}em`);
    set('--lh-k', look.lineHeight);
    if (look.fontColor && look.fontColor !== 'inherit') {
      set('--ink', look.fontColor);
      set('--ink-2', `color-mix(in srgb, ${look.fontColor} 88%, transparent)`);
      set('--ink-3', `color-mix(in srgb, ${look.fontColor} 72%, transparent)`);
      set('--custom-font-color', look.fontColor);
    } else {
      root.style.removeProperty('--ink');
      root.style.removeProperty('--ink-2');
      root.style.removeProperty('--ink-3');
      root.style.removeProperty('--custom-font-color');
    }
    const density = { compact: [13, 7], normal: [18, 10], roomy: [23, 13] }[look.density] || [18, 10];
    set('--pad', `${density[0]}px`);
    set('--gap', `${density[1]}px`);
    set('--edge-k', look.edge);
    set('--edge-w', `${look.borderWidth}px`);
    set('--grain-k', look.grain ? 1 : 0);
    set('--hover-k', look.hover);
    const sheenRadius = look.sheenRadius !== undefined ? Number(look.sheenRadius) : 240;
    set('--sheen-radius', `${sheenRadius}px`);
    // Motion: a speed factor, or none at all.
    const speed = Number(look.motion);
    const ms = (base) => (speed > 0 ? `${Math.round(base / speed)}ms` : '1ms');
    set('--t-fast', ms(140));
    set('--t', ms(240));
    set('--t-slow', ms(420));
    root.dataset.motion = speed > 0 ? 'on' : 'off';
    const tint = /^#[0-9a-f]{6}$/i.test(look.tint || '') ? look.tint : '';
    set('--tint-layer', tint
      ? `color-mix(in srgb, ${tint} ${Math.round(Math.max(0, Math.min(0.8, look.tintStrength)) * 100)}%, transparent)`
      : 'transparent');
    root.dataset.contrast = look.contrast === 'high' ? 'high' : 'normal';
  }

  /** Which page this is: 'clock', 'tafsir', ... from the file name. */
  const PAGE = (location.pathname.split(/[/\\]/).pop() || '').replace(/\.html$/, '');
  const FULL_WINDOWS = ['tafsir', 'settings', 'task', 'hadith', 'email-view', 'habits-dashboard', 'event'];
  document.documentElement.dataset.kind = FULL_WINDOWS.includes(PAGE) ? 'window' : 'widget';
  document.documentElement.dataset.page = PAGE;

  function applySettings(s) {
    if (!s) return;
    current = s;
    const root = document.documentElement;
    root.dataset.theme = s.theme || 'glass';
    root.style.setProperty('--accent', s.accent || '#3E7CBE');

    const rgb = hexToRgb(s.accent || '#3E7CBE');
    if (rgb) {
      root.style.setProperty('--accent-soft', `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.32)`);
      // Text sitting on top of the accent has to stay readable whichever
      // colour the user picked, so pick black or white by luminance.
      const lum = (c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      const L = 0.2126 * lum(rgb[0]) + 0.7152 * lum(rgb[1]) + 0.0722 * lum(rgb[2]);
      root.style.setProperty('--ink-on-accent', L > 0.45 ? '#141C28' : '#FFFFFF');
    }

    root.style.setProperty('--radius-window', `${s.radius ?? 22}px`);
    // Each widget and window has its own text size.
    const scales = s.fontScales || {};
    root.style.setProperty('--fs', String(scales[PAGE] ?? 1));
    // How solid the glass is: widgets and full windows are set separately.
    const glass = s.glass || {};
    const solid = FULL_WINDOWS.includes(PAGE) ? glass.windows : glass.widgets;
    root.style.setProperty('--solidity', String(Math.max(0, Math.min(1, Number(solid) || 0))));
    root.dataset.kind = FULL_WINDOWS.includes(PAGE) ? 'window' : 'widget';
    applyLook(root, s.look);

    // Per-widget styling overrides (custom theme, accent, font, weight, scale, glass per widget)
    const PARENT_WIDGET = {
      'habits-dashboard': 'habits',
      'task': 'todo',
      'event': 'calendar',
      'email-view': 'email',
      'tafsir': 'quran',
      'hadith': 'quran',
    };
    const widgetKey = PARENT_WIDGET[PAGE] || PAGE;
    // Scoped widget style resolution: s.widgetStyles?.[PAGE] || s.widgetStyles?.[widgetKey]
    const wStyle = Object.assign({}, s.widgetStyles?.[widgetKey] || {}, s.widgetStyles?.[PAGE] || {});
    if (wStyle && typeof wStyle === 'object' && Object.keys(wStyle).length > 0) {
      if (wStyle.theme && wStyle.theme !== 'inherit') {
        root.dataset.theme = wStyle.theme;
      }
      if (wStyle.accent && wStyle.accent !== 'inherit') {
        root.style.setProperty('--accent', wStyle.accent);
        root.style.setProperty('--accent-soft', `color-mix(in srgb, ${wStyle.accent} 26%, transparent)`);
        const aRgb = hexToRgb(wStyle.accent);
        if (aRgb) {
          const lum = (c) => {
            const v = c / 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          };
          const L = 0.2126 * lum(aRgb[0]) + 0.7152 * lum(aRgb[1]) + 0.0722 * lum(aRgb[2]);
          root.style.setProperty('--ink-on-accent', L > 0.45 ? '#141C28' : '#FFFFFF');
        }
      }
      if (wStyle.fontScale && wStyle.fontScale !== 'inherit') {
        root.style.setProperty('--fs', String(wStyle.fontScale));
      }
      if (wStyle.radius && wStyle.radius !== 'inherit') {
        root.style.setProperty('--radius-window', `${wStyle.radius}px`);
      }
      if (wStyle.fontUi && wStyle.fontUi !== 'inherit') {
        root.style.setProperty('--ff-ui', FONTS.ui[wStyle.fontUi] || FONTS.ui.plex);
      }
      if (wStyle.fontNum && wStyle.fontNum !== 'inherit') {
        root.style.setProperty('--ff-num', FONTS.num[wStyle.fontNum] || FONTS.num.plex);
      }
      if (wStyle.fontRead && wStyle.fontRead !== 'inherit') {
        root.style.setProperty('--ff-read', FONTS.read[wStyle.fontRead] || FONTS.read.naskh);
      }
      if (wStyle.fontQuran && wStyle.fontQuran !== 'inherit') {
        root.style.setProperty('--ff-quran', FONTS.quran[wStyle.fontQuran] || FONTS.quran['amiri-quran']);
      }
      if (wStyle.uiWeight && wStyle.uiWeight !== 'inherit') {
        root.style.setProperty('--ui-weight', String(wStyle.uiWeight));
      }
      if (wStyle.numWeight && wStyle.numWeight !== 'inherit') {
        root.style.setProperty('--num-weight', String(wStyle.numWeight));
      }
      if (wStyle.numSpacing !== undefined && wStyle.numSpacing !== 'inherit') {
        root.style.setProperty('--num-ls', `${wStyle.numSpacing}em`);
      }
      if (wStyle.lineHeight !== undefined && wStyle.lineHeight !== 'inherit') {
        root.style.setProperty('--lh-k', String(wStyle.lineHeight));
      }
      if (wStyle.fontColor !== undefined) {
        if (wStyle.fontColor && wStyle.fontColor !== 'inherit') {
          root.style.setProperty('--ink', wStyle.fontColor);
          root.style.setProperty('--ink-2', `color-mix(in srgb, ${wStyle.fontColor} 88%, transparent)`);
          root.style.setProperty('--ink-3', `color-mix(in srgb, ${wStyle.fontColor} 72%, transparent)`);
          root.style.setProperty('--custom-font-color', wStyle.fontColor);
        } else if (wStyle.fontColor === 'inherit') {
          if (s.look?.fontColor && s.look.fontColor !== 'inherit') {
            root.style.setProperty('--ink', s.look.fontColor);
            root.style.setProperty('--ink-2', `color-mix(in srgb, ${s.look.fontColor} 88%, transparent)`);
            root.style.setProperty('--ink-3', `color-mix(in srgb, ${s.look.fontColor} 72%, transparent)`);
            root.style.setProperty('--custom-font-color', s.look.fontColor);
          } else {
            root.style.removeProperty('--ink');
            root.style.removeProperty('--ink-2');
            root.style.removeProperty('--ink-3');
            root.style.removeProperty('--custom-font-color');
          }
        }
      }
      if (wStyle.glass !== undefined && wStyle.glass !== 'inherit') {
        root.style.setProperty('--solidity', String(Math.max(0, Math.min(1, Number(wStyle.glass) || 0))));
      }
      if (wStyle.cardSurface && wStyle.cardSurface !== 'inherit') {
        if (wStyle.cardSurface === 'glass') {
          root.style.setProperty('--tile', 'rgba(255, 255, 255, 0.18)');
          root.style.setProperty('--field', 'rgba(255, 255, 255, 0.22)');
        } else if (wStyle.cardSurface === 'solid') {
          root.style.setProperty('--tile', 'rgba(255, 255, 255, 0.90)');
          root.style.setProperty('--field', 'rgba(255, 255, 255, 0.96)');
        } else if (wStyle.cardSurface === 'deep') {
          root.style.setProperty('--tile', 'rgba(15, 22, 34, 0.72)');
          root.style.setProperty('--field', 'rgba(15, 22, 34, 0.88)');
        }
      } else {
        root.style.removeProperty('--tile');
        root.style.removeProperty('--field');
      }
      if (wStyle.borderGlow && wStyle.borderGlow !== 'inherit') {
        if (wStyle.borderGlow === 'none') {
          root.style.setProperty('--sheen-strength', '0');
        } else if (wStyle.borderGlow === 'crystal') {
          root.style.setProperty('--sheen-strength', '1.2');
          root.style.setProperty('--sheen-rim', 'rgba(255, 255, 255, 0.95)');
        } else if (wStyle.borderGlow === 'subtle') {
          root.style.setProperty('--sheen-strength', '0.45');
        }
      } else {
        root.style.removeProperty('--sheen-strength');
        root.style.removeProperty('--sheen-rim');
      }
      if (wStyle.sheenRadius !== undefined && wStyle.sheenRadius !== 'inherit') {
        root.style.setProperty('--sheen-radius', `${Number(wStyle.sheenRadius)}px`);
      }
      if (wStyle.density && wStyle.density !== 'inherit') {
        const d = { compact: [13, 7], normal: [18, 10], roomy: [23, 13] }[wStyle.density] || [18, 10];
        root.style.setProperty('--pad', `${d[0]}px`);
        root.style.setProperty('--gap', `${d[1]}px`);
      }
      if (wStyle.edge !== undefined && wStyle.edge !== 'inherit') {
        root.style.setProperty('--edge-k', String(wStyle.edge));
      }
      if (wStyle.borderWidth !== undefined && wStyle.borderWidth !== 'inherit') {
        root.style.setProperty('--edge-w', `${wStyle.borderWidth}px`);
      }
      if (wStyle.hover !== undefined && wStyle.hover !== 'inherit') {
        root.style.setProperty('--hover-k', String(wStyle.hover));
      }
      if (wStyle.motion !== undefined && wStyle.motion !== 'inherit') {
        const spd = Number(wStyle.motion);
        const msFn = (b) => (spd > 0 ? `${Math.round(b / spd)}ms` : '1ms');
        root.style.setProperty('--t-fast', msFn(140));
        root.style.setProperty('--t', msFn(240));
        root.style.setProperty('--t-slow', msFn(420));
        root.dataset.motion = spd > 0 ? 'on' : 'off';
      }
      if (wStyle.contrast && wStyle.contrast !== 'inherit') {
        root.dataset.contrast = wStyle.contrast === 'high' ? 'high' : 'normal';
      }
      if (wStyle.tint && wStyle.tint !== 'inherit') {
        const tColor = /^#[0-9a-f]{6}$/i.test(wStyle.tint) ? wStyle.tint : '';
        const tStr = Number(wStyle.tintStrength ?? 0.25);
        root.style.setProperty('--tint-layer', tColor ? `color-mix(in srgb, ${tColor} ${Math.round(tStr * 100)}%, transparent)` : 'transparent');
      }
      if (wStyle.grain !== undefined && wStyle.grain !== 'inherit') {
        root.style.setProperty('--grain-k', wStyle.grain ? '1' : '0');
      }
    } else {
      root.style.removeProperty('--tile');
      root.style.removeProperty('--field');
      root.style.removeProperty('--sheen-strength');
      root.style.removeProperty('--sheen-rim');
    }

    // Sync theme class on body for theme styling
    if (document.body) {
      const allThemes = ['glass', 'waterglass', 'smoke', 'midnight', 'daylight', 'sand', 'aurora', 'cyber', 'oled', 'notebook'];
      for (const th of allThemes) {
        document.body.classList.toggle(`theme-${th}`, root.dataset.theme === th);
      }
    }

    // A locked widget hides its handles; the main process also refuses to move it.
    root.dataset.locked = s.widgets && s.widgets[PAGE] && s.widgets[PAGE].locked ? '1' : '';

    const l = lang();
    if (bootedLang && bootedLang !== l) {
      // Rebuild the page in the new language, once: further changes while
      // it reloads must not restart the navigation.
      if (!reloading) { reloading = true; setTimeout(() => location.reload(), 30); }
      return;
    }
    if (PAGE === 'quran') {
      root.lang = 'ar';
      root.dir = 'rtl';
    } else {
      root.lang = l;
      root.dir = l === 'en' ? 'ltr' : 'rtl';
    }

    if (typeof applyPowerStatus === 'function') {
      applyPowerStatus(lastPowerStatus);
    }
  }

  let bootedLang = null;
  let reloading = false;

  /* ---------- open / close choreography ---------- */

  function playEnter() {
    document.body.classList.remove('leaving');
    document.body.classList.remove('enter');
    // Skip forced synchronous reflow on large secondary windows to prevent frame drops & trembling
    if (document.documentElement.dataset.kind !== 'window') {
      void document.body.offsetWidth; // Force reflow to re-trigger animation cleanly for widgets
    }
    document.body.classList.add('enter');
    // Remove the class once the animation is done so re-renders do not replay it.
    setTimeout(() => document.body.classList.remove('enter'), 500);
  }

  /** Fade the plate out, then let the main process take the window away. */
  function closeWindow({ hideOnly = false } = {}) {
    if (document.body.classList.contains('leaving')) return;
    document.body.classList.remove('enter');
    document.body.classList.add('leaving');
    const done = () => {
      if (hideOnly) {
        window.widgets.win.hide();
        setTimeout(() => {
          document.body.classList.remove('leaving');
        }, 120);
      } else {
        window.widgets.win.close();
      }
    };
    const plate = $('.plate');
    if (!plate) { done(); return; }
    let fired = false;
    const fire = () => { if (!fired) { fired = true; done(); } };
    plate.addEventListener('transitionend', fire, { once: true });
    setTimeout(fire, 240); // aligned with 0.22s transition
  }

  // Restore enter animation whenever window is unhidden or recovers from a leaving state
  let wasHidden = false;
  window.addEventListener('focus', () => {
    if (document.body.classList.contains('leaving')) {
      document.body.classList.remove('leaving');
      playEnter();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      wasHidden = true;
    } else if (document.visibilityState === 'visible') {
      if (wasHidden || document.body.classList.contains('leaving')) {
        wasHidden = false;
        document.body.classList.remove('leaving');
        playEnter();
      }
    }
  });

  /* ---------- misc ---------- */

  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  /** Relative time in Arabic, for "added 3 minutes ago". */
  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.round(diff / 60000);
    if (mins < 1) return t('common.now');
    if (mins < 60) return t('ago.min', { n: digits(mins) });
    const hours = Math.round(mins / 60);
    if (hours < 24) return t('ago.hour', { n: digits(hours) });
    const days = Math.round(hours / 24);
    if (days < 30) return t('ago.day', { n: digits(days) });
    return new Date(ts).toLocaleDateString(locale());
  }

  /** Countdown like "بعد ٣ س ١٢ د". */
  function until(ts) {
    const diff = ts - Date.now();
    if (diff <= 0) return t('common.now');
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 0) return t('until.hm', { h: digits(h), m: digits(m) });
    if (m > 0) return t('until.m', { m: digits(m) });
    return t('until.lt');
  }

  /** Escape text before putting it in innerHTML. */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /** Debounce for autosave. */
  function debounce(fn, ms) {
    let timer = null;
    let last = [];
    const wrapped = (...a) => {
      last = a;
      clearTimeout(timer);
      timer = setTimeout(() => { timer = null; fn(...last); }, ms);
    };
    // Run a pending call now; does nothing when nothing is waiting.
    wrapped.flush = () => {
      if (!timer) return;
      clearTimeout(timer);
      timer = null;
      fn(...last);
    };
    return wrapped;
  }

  /* ---------- moving, resizing, right-click ----------
     The page only reports the pointer; the main process moves the window and
     keeps it inside the screen. Native drag regions are avoided on purpose:
     they let Windows drop a widget off screen, and they swallow the pointer
     events that the hover effects rely on. */

  const NO_DRAG = 'button, input, textarea, select, option, a, label, [data-nodrag], .grip, .rz, [contenteditable="true"]';

  function installGestures() {
    let pending = null;
    let active = null;
    let raf = 0;
    let last = null;
    let lastSent = null;

    const flush = () => {
      raf = 0;
      if (!last || !active) return;
      if (lastSent && lastSent.x === last.x && lastSent.y === last.y) return;
      lastSent = { x: last.x, y: last.y };
      if (active === 'drag') window.widgets.win.dragMove(last.x, last.y);
      else window.widgets.win.resizeMove(last.x, last.y);
    };
    const queue = (x, y) => {
      last = { x, y };
      if (!raf) raf = requestAnimationFrame(flush);
    };

    document.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      if ((e.shiftKey || e.ctrlKey) && document.documentElement.dataset.appIcon === '1') {
        if (window.widgets?.win?.startMarquee) {
          window.widgets.win.startMarquee({ sx: e.screenX, sy: e.screenY });
          return;
        }
      }
      const grip = e.target.closest('.grip, .rz');
      if (grip) {
        e.preventDefault();
        try { grip.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        active = 'resize';
        document.body.classList.add('resizing');
        const edge = grip.dataset.edge || (document.documentElement.dir === 'ltr' ? 'br' : 'bl');
        document.body.dataset.resizeEdge = edge;
        window.widgets.win.resizeStart(e.screenX, e.screenY, edge);
        return;
      }
      if (e.target.closest(NO_DRAG)) return;
      if (!e.target.closest('.head, [data-drag]')) return;
      pending = { x: e.screenX, y: e.screenY, id: e.pointerId, el: e.target };
    });

    document.addEventListener('pointermove', (e) => {
      if (pending && !active) {
        // A few pixels of slack so a click is still a click.
        const threshold = document.documentElement.dataset.appIcon === '1' ? 8 : 4;
        if (Math.hypot(e.screenX - pending.x, e.screenY - pending.y) < threshold) return;
        active = 'drag';
        document.body.classList.add('dragging');
        try { pending.el.setPointerCapture(pending.id); } catch { /* ignore */ }
        window.widgets.win.dragStart(pending.x, pending.y);
      }
      if (active) queue(e.screenX, e.screenY);
    });

    const end = () => {
      const was = active;
      if (active) {
        if (raf) { cancelAnimationFrame(raf); flush(); }
        window.widgets.win.gestureEnd();
      }
      active = null;
      pending = null;
      last = null;
      lastSent = null;
      document.body.classList.remove('dragging', 'resizing');
      delete document.body.dataset.resizeEdge;
      if (was === 'drag') {
        // The release after a drag must not also count as a click.
        const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
        window.addEventListener('click', swallow, { capture: true, once: true });
        setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
      }
    };
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);

    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('input, textarea, [contenteditable="true"]')) return;
      e.preventDefault();
      window.widgets.win.contextMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && window.widgets?.win?.clearSelection) {
        window.widgets.win.clearSelection();
      }
    });
  }

  /** Invisible strips on every edge and corner for resizing. */
  function installResizeEdges() {
    const plate = $('.plate, .folder-plate');
    if (!plate || $('.rz', plate)) return;
    for (const edge of ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']) {
      plate.append(el('div', { class: `rz rz-${edge}`, dataset: { edge }, 'aria-hidden': 'true' }));
    }
  }

  /** A soft light that follows the pointer across the glass. (Disabled: mouse halo completely removed) */
  function installSheen() {
    return;
  }

  /* ---------- boot ---------- */

  async function boot(render) {
    const s = await window.widgets.settings.get();
    applySettings(s);
    bootedLang = lang();
    translate();
    window.widgets.settings.onChange(applySettings);

    // Esc closes any widget window.
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeWindow({ hideOnly: true }); }
    });

    // Intercept clicks on external links globally across all widgets/windows so they open in the user's default browser (e.g. Chrome)
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a) {
        const href = a.getAttribute('href') || a.href;
        if (typeof href === 'string' && (/^https?:\/\//i.test(href) || /^mailto:/i.test(href))) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          if (e.__externalHandled) return;
          e.__externalHandled = true;
          if (window.widgets?.openExternal) {
            window.widgets.openExternal(href);
          }
        }
      }
    }, true);

    const curW = s?.widgets?.[PAGE];
    const isMiniPreset = Boolean(curW && (curW.size === 'icon' || curW.isMini || (curW.bounds && curW.bounds.width <= 90)));
    const isMiniWindow = (window.innerWidth > 0 && window.innerWidth <= 85);
    if (isMiniPreset || isMiniWindow) {
      document.documentElement.dataset.appIcon = '1';
      if (document.body) document.body.dataset.appIcon = '1';
      const p = $('.plate');
      if (p) p.dataset.appIcon = '1';
    }

    installGestures();
    installSheen();
    installResizeEdges();
    installPowerAndDormancy();
    installResponsiveObserver();
    installMinimizeButton();
    installAppIconMode();

    if (window.widgets?.win?.onFolderHoverTarget) {
      window.widgets.win.onFolderHoverTarget(({ isTarget }) => {
        document.body.classList.toggle('folder-gather-target', Boolean(isTarget));
      });
    }

    if (window.widgets?.win?.onPrepareExpand) {
      window.widgets.win.onPrepareExpand(() => {
        prepareDOMForExpand();
      });
    }
    if (window.widgets?.win?.onPrepareMini) {
      window.widgets.win.onPrepareMini(() => {
        prepareDOMForMini();
      });
    }

    await render(s);

    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (_) {}
    }
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    playEnter();
    if (window.widgets?.win?.readyToReveal) {
      window.widgets.win.readyToReveal();
    }
    return s;
  }

  /* ---------- dormancy & low-power manager ---------- */
  const dormancyListeners = [];
  let isCurrentlyDormant = false;
  let lastPowerStatus = null;

  function getEffectiveWidgetEco(widgetId = PAGE) {
    const eco = current?.eco || {};
    const globalMode = eco.mode || 'auto';
    const globalSleepMini = eco.sleepMini !== false;
    const globalPauseOnLock = eco.pauseOnLock !== false;
    const globalLightShaders = eco.lightShaders !== false;

    if (!widgetId || widgetId === 'global') {
      return {
        mode: globalMode,
        sleepMini: globalSleepMini,
        pauseOnLock: globalPauseOnLock,
        lightShaders: globalLightShaders,
        isCustom: false,
      };
    }

    const custom = eco.widgets?.[widgetId] || {};
    const hasCustom = Boolean(eco.widgets?.[widgetId] && Object.keys(eco.widgets[widgetId]).length > 0);
    const mode = (custom.mode && custom.mode !== 'inherit') ? custom.mode : globalMode;
    const sleepMini = (custom.sleepMini !== undefined && custom.sleepMini !== 'inherit')
      ? custom.sleepMini !== false
      : globalSleepMini;
    const pauseOnLock = (custom.pauseOnLock !== undefined && custom.pauseOnLock !== 'inherit')
      ? custom.pauseOnLock !== false
      : globalPauseOnLock;
    const lightShaders = (custom.lightShaders !== undefined && custom.lightShaders !== 'inherit')
      ? custom.lightShaders !== false
      : globalLightShaders;

    return {
      mode,
      sleepMini,
      pauseOnLock,
      lightShaders,
      isCustom: hasCustom,
    };
  }

  function evaluateDormancy() {
    const root = document.documentElement;
    const isAppIcon = root.dataset.appIcon === '1';
    const isHidden = document.hidden || document.visibilityState === 'hidden';
    const isScreenLocked = root.dataset.screenLocked === '1';
    const effEco = getEffectiveWidgetEco(PAGE);
    const sleepMini = effEco.sleepMini !== false;
    const sleepOnLock = effEco.pauseOnLock !== false;

    const nextDormant = (isAppIcon && sleepMini) || isHidden || (isScreenLocked && sleepOnLock);
    if (nextDormant !== isCurrentlyDormant) {
      isCurrentlyDormant = nextDormant;
      if (nextDormant) {
        root.dataset.dormant = '1';
      } else {
        delete root.dataset.dormant;
      }
      for (const fn of dormancyListeners) {
        try { fn(nextDormant); } catch (e) { console.error('dormancy listener error:', e); }
      }
    }
    return isCurrentlyDormant;
  }

  function applyPowerStatus(status) {
    if (status) lastPowerStatus = status;
    const effStatus = lastPowerStatus;
    if (!effStatus) return;

    const root = document.documentElement;
    const effEco = getEffectiveWidgetEco(PAGE);

    let isEcoActive = false;
    if (effEco.mode === 'always') isEcoActive = true;
    else if (effEco.mode === 'off') isEcoActive = false;
    else isEcoActive = Boolean(effStatus.onBattery);

    if (isEcoActive && effEco.lightShaders !== false) root.dataset.eco = '1';
    else delete root.dataset.eco;

    if (effStatus.locked) root.dataset.screenLocked = '1';
    else delete root.dataset.screenLocked;

    if (effStatus.onBattery) root.dataset.battery = '1';
    else delete root.dataset.battery;

    evaluateDormancy();
  }

  function installPowerAndDormancy() {
    document.addEventListener('visibilitychange', evaluateDormancy);

    if (window.widgets?.power?.onStatus) {
      window.widgets.power.onStatus((status) => applyPowerStatus(status));
    }
    if (window.widgets?.power?.getStatus) {
      window.widgets.power.getStatus().then((status) => applyPowerStatus(status)).catch(() => {});
    }
  }

  /* ---------- responsive downscaling & layout observer ---------- */

  function installResponsiveObserver() {
    const root = document.documentElement;
    const plate = $('.plate');
    const target = plate || document.body;
    if (!target) return;

    let raf = 0;
    let lastW = -1;
    let lastH = -1;
    const update = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const w = Math.round(window.innerWidth || target.clientWidth || 0);
        const h = Math.round(window.innerHeight || target.clientHeight || 0);
        if (w === lastW && h === lastH) return;
        lastW = w;
        lastH = h;

        // Width Tier: nano (<190), xs (190-270), sm (271-350), md (351-480), lg (>=481)
        const sizeW = w < 190 ? 'nano' : w <= 270 ? 'xs' : w <= 350 ? 'sm' : w <= 480 ? 'md' : 'lg';
        // Height Tier: nano (<160), xs (160-230), sm (231-310), md (311-440), lg (>=441)
        const sizeH = h < 160 ? 'nano' : h <= 230 ? 'xs' : h <= 310 ? 'sm' : h <= 440 ? 'md' : 'lg';
        // Compact: ultra (<=130w and <=130h nano icons), compact (<=310w or <=260h), normal
        const compact = (w <= 130 && h <= 130) ? 'ultra' : (w <= 310 || h <= 260) ? 'compact' : 'normal';
        // Aspect: square, wide, tall, balanced
        const aspect = Math.abs(w - h) < 30 ? 'square' : w > h * 1.3 ? 'wide' : h > w * 1.3 ? 'tall' : 'balanced';

        if (root.dataset.sizeW !== sizeW) root.dataset.sizeW = sizeW;
        if (root.dataset.sizeH !== sizeH) root.dataset.sizeH = sizeH;
        if (root.dataset.compact !== compact) root.dataset.compact = compact;
        if (root.dataset.aspect !== aspect) root.dataset.aspect = aspect;

        const isAppIcon = (w > 0 && h > 0 && w <= 85 && h <= 85);
        const iconEl = document.getElementById('appIconWidget');
        if (isAppIcon) {
          root.dataset.appIcon = '1';
          if (document.body) {
            document.body.dataset.appIcon = '1';
            document.body.style.setProperty('background', 'transparent', 'important');
            document.body.style.setProperty('background-color', 'transparent', 'important');
            document.body.style.setProperty('background-image', 'none', 'important');
          }
          if (plate) {
            plate.dataset.appIcon = '1';
            plate.style.setProperty('background', 'transparent', 'important');
            plate.style.setProperty('background-color', 'transparent', 'important');
            plate.style.setProperty('background-image', 'none', 'important');
            plate.style.setProperty('border', 'none', 'important');
            plate.style.setProperty('border-width', '0', 'important');
            plate.style.setProperty('border-radius', '0', 'important');
            plate.style.setProperty('box-shadow', 'none', 'important');
            plate.style.setProperty('backdrop-filter', 'none', 'important');
            plate.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            plate.style.setProperty('outline', 'none', 'important');
          }
          if (!iconEl) {
            installAppIconMode();
          } else {
            iconEl.style.display = 'flex';
          }
        } else {
          delete root.dataset.appIcon;
          if (document.body) {
            delete document.body.dataset.appIcon;
            document.body.style.removeProperty('background');
            document.body.style.removeProperty('background-color');
            document.body.style.removeProperty('background-image');
          }
          if (plate) {
            delete plate.dataset.appIcon;
            plate.style.removeProperty('background');
            plate.style.removeProperty('background-color');
            plate.style.removeProperty('background-image');
            plate.style.removeProperty('border');
            plate.style.removeProperty('border-width');
            plate.style.removeProperty('border-radius');
            plate.style.removeProperty('box-shadow');
            plate.style.removeProperty('backdrop-filter');
            plate.style.removeProperty('-webkit-backdrop-filter');
            plate.style.removeProperty('outline');
          }
          if (iconEl) {
            iconEl.remove();
          }
        }

        evaluateDormancy();

        const minBtn = $('#minimizeBtn');
        if (minBtn) {
          const isMini = isAppIcon || compact === 'ultra';
          minBtn.title = isMini ? t('common.restore') : t('common.minimize');
          minBtn.classList.toggle('active', isMini);
        }
      });
    };

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(update);
      ro.observe(target);
    }
    window.addEventListener('resize', update);
    update();
  }

  function prepareDOMForMini() {
    const root = document.documentElement;
    root.dataset.appIcon = '1';
    if (document.body) {
      document.body.dataset.appIcon = '1';
      document.body.style.setProperty('background', 'transparent', 'important');
      document.body.style.setProperty('background-color', 'transparent', 'important');
      document.body.style.setProperty('background-image', 'none', 'important');
    }
    const plate = $('.plate');
    if (plate) {
      plate.dataset.appIcon = '1';
      plate.style.setProperty('background', 'transparent', 'important');
      plate.style.setProperty('background-color', 'transparent', 'important');
      plate.style.setProperty('background-image', 'none', 'important');
      plate.style.setProperty('border', 'none', 'important');
      plate.style.setProperty('border-width', '0', 'important');
      plate.style.setProperty('border-radius', '0', 'important');
      plate.style.setProperty('box-shadow', 'none', 'important');
      plate.style.setProperty('backdrop-filter', 'none', 'important');
      plate.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
      plate.style.setProperty('outline', 'none', 'important');
    }
    installAppIconMode();
  }

  function prepareDOMForExpand() {
    const root = document.documentElement;
    delete root.dataset.appIcon;
    if (document.body) {
      delete document.body.dataset.appIcon;
      document.body.style.removeProperty('background');
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('background-image');
    }
    const plate = $('.plate');
    if (plate) {
      delete plate.dataset.appIcon;
      plate.style.removeProperty('background');
      plate.style.removeProperty('background-color');
      plate.style.removeProperty('background-image');
      plate.style.removeProperty('border');
      plate.style.removeProperty('border-width');
      plate.style.removeProperty('border-radius');
      plate.style.removeProperty('box-shadow');
      plate.style.removeProperty('backdrop-filter');
      plate.style.removeProperty('-webkit-backdrop-filter');
      plate.style.removeProperty('outline');
    }
    const iconEl = document.getElementById('appIconWidget');
    if (iconEl) iconEl.remove();
    playEnter();
  }

  function installMinimizeButton() {
    if (document.documentElement.dataset.kind !== 'widget') return;
    const actions = $('.head-actions') || $('.tile-actions');
    if (!actions || $('#minimizeBtn')) return;

    const closeBtn = $('#closeBtn');
    const minBtn = el('button', {
      class: 'icon-btn min-btn',
      id: 'minimizeBtn',
      type: 'button',
      'data-i18n-title': 'common.minimize',
      title: t('common.minimize'),
      onClick: async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const isMini = document.documentElement.dataset.appIcon === '1' || document.documentElement.dataset.compact === 'ultra';
        if (isMini) {
          prepareDOMForExpand();
        } else {
          prepareDOMForMini();
        }
        if (window.widgets?.win?.toggleMini) {
          await window.widgets.win.toggleMini();
        } else if (window.widgets?.widgetSize) {
          const nextSize = isMini ? 'm' : 'icon';
          await window.widgets.widgetSize(PAGE, nextSize);
        }
      },
    }, icon('minus'));

    if (closeBtn) {
      actions.insertBefore(minBtn, closeBtn);
    } else {
      actions.append(minBtn);
    }

    const plate = $('.plate');
    if (plate) {
      plate.addEventListener('dblclick', (e) => {
        const isHabits = PAGE === 'habits' || document.documentElement.dataset.page === 'habits';
        const isMini = document.documentElement.dataset.appIcon === '1' || document.documentElement.dataset.compact === 'ultra';
        // The habits widget is the ONLY widget that does NOT close on double-click/double-tap
        if (isHabits && !isMini) return;
        if (e.target.closest('button, input, textarea, a, .grip, .rz, [contenteditable]')) return;
        if (isMini) {
          prepareDOMForExpand();
        } else {
          prepareDOMForMini();
        }
        if (window.widgets?.win?.toggleMini) {
          window.widgets.win.toggleMini();
        }
      });
    }
  }

  /* ---------- app icon mode (72x72) with tailored distinctive artwork ---------- */

  function installAppIconMode() {
    if (document.documentElement.dataset.kind !== 'widget') return;
    const plate = $('.plate');
    if (!plate || $('#appIconWidget')) return;

    const rect = plate.getBoundingClientRect();
    const w = Math.round(rect.width || window.innerWidth);
    const h = Math.round(rect.height || window.innerHeight);
    const isAppIcon = (w > 0 && h > 0 && w <= 85 && h <= 85) || document.documentElement.dataset.appIcon === '1';

    if (!isAppIcon) {
      const existing = $('#appIconWidget');
      if (existing) existing.remove();
      return;
    }

    const root = document.documentElement;
    root.dataset.appIcon = '1';
    if (document.body) document.body.dataset.appIcon = '1';
    plate.dataset.appIcon = '1';

    if (typeof window.renderUnifiedWidgetIcon !== 'function' && typeof document !== 'undefined') {
      try {
        const existingScript = document.querySelector('script[src*="shared-icon-art.js"]');
        if (!existingScript) {
          const s = document.createElement('script');
          s.src = 'js/shared-icon-art.js';
          s.async = false;
          s.onload = () => {
            const artBox = document.getElementById('appIconWidget');
            if (artBox && typeof window.renderUnifiedWidgetIcon === 'function') {
              const newArt = window.renderUnifiedWidgetIcon(PAGE, { context: 'desktop' });
              artBox.innerHTML = '';
              artBox.append(newArt);
            }
          };
          document.head.appendChild(s);
        }
      } catch (_) {}
    }

    plate.style.setProperty('background', 'transparent', 'important');
    plate.style.setProperty('background-color', 'transparent', 'important');
    plate.style.setProperty('background-image', 'none', 'important');
    plate.style.setProperty('border', 'none', 'important');
    plate.style.setProperty('box-shadow', 'none', 'important');
    plate.style.setProperty('backdrop-filter', 'none', 'important');
    plate.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
    plate.style.setProperty('outline', 'none', 'important');

    if (!plate._appIconClickInstalled) {
      plate._appIconClickInstalled = true;
      plate.addEventListener('click', async (e) => {
        if (document.documentElement.dataset.appIcon === '1') {
          if (e.shiftKey || e.ctrlKey) return;
          if (window.widgets?.win?.hidePeek) window.widgets.win.hidePeek();
          prepareDOMForExpand();
          if (window.widgets?.win?.toggleMini) {
            await window.widgets.win.toggleMini();
          }
        }
      });
    }

    const iconBox = el('div', {
      class: `app-icon-widget app-icon-${PAGE}`,
      id: 'appIconWidget',
      style: {
        display: 'flex',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
      },
      dataset: { drag: 'true' },
      onClick: async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.shiftKey || e.ctrlKey) {
          if (window.widgets?.win?.toggleSelect) {
            window.widgets.win.toggleSelect(PAGE);
          }
          return;
        }
        if (window.widgets?.win?.hidePeek) {
          window.widgets.win.hidePeek();
        }
        prepareDOMForExpand();
        if (window.widgets?.win?.toggleMini) {
          await window.widgets.win.toggleMini();
        }
      },
    });

    // Multi-Selection State Listener
    if (window.widgets?.win?.onSelectionChanged) {
      window.widgets.win.onSelectionChanged((selectedIds) => {
        const isSel = Array.isArray(selectedIds) && selectedIds.includes(PAGE);
        document.body.classList.toggle('widget-selected', isSel);
        const iconEl = document.getElementById('appIconWidget');
        if (iconEl) iconEl.classList.toggle('selected', isSel);
      });
    }

    // Smart Hover Peek Preview Card - disabled by default so hovering does not cause sudden popups/disappearances
    let peekTimer = null;
    let isHovered = false;

    iconBox.addEventListener('mouseenter', () => {
      // Automatic hover peek disabled so elements do not appear/disappear on mouse hover
      return;
    });

    iconBox.addEventListener('mouseleave', () => {
      isHovered = false;
      clearTimeout(peekTimer);
      if (window.widgets?.win?.hidePeek) {
        window.widgets.win.hidePeek();
      }
    });

    iconBox.addEventListener('pointerdown', () => {
      isHovered = false;
      clearTimeout(peekTimer);
      if (window.widgets?.win?.hidePeek) {
        window.widgets.win.hidePeek();
      }
    });

    const art = buildAppIconArt(PAGE);
    if (art) iconBox.append(art);
    plate.append(iconBox);

    setupAppIconLiveUpdates(PAGE, iconBox);
  }

  function buildAppIconArt(page) {
    if (typeof window.renderUnifiedWidgetIcon === 'function') {
      return window.renderUnifiedWidgetIcon(page, { context: 'desktop' });
    }
    if (typeof window.createFolderIconArt === 'function') {
      return window.createFolderIconArt(page, { context: 'desktop' });
    }
    const art = el('div', { class: `app-icon-art app-icon-art-${page}` });
    switch (page) {
      case 'clock': {
        const face = el('div', { class: 'clock-face' },
          el('div', { class: 'clock-hand hand-h', id: 'miniClockHandH' }),
          el('div', { class: 'clock-hand hand-m', id: 'miniClockHandM' }),
          el('div', { class: 'clock-pin' })
        );
        art.append(face);
        break;
      }
      case 'pomodoro': {
        const inner = el('div', { class: 'pomo-inner', text: '🍅' });
        art.append(inner);
        break;
      }
      case 'calendar': {
        const now = new Date();
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        const hdr = el('div', { class: 'cal-top', id: 'miniCalMonth' }, monthNames[now.getMonth()]);
        const body = el('div', { class: 'cal-body', id: 'miniCalDay' }, String(now.getDate()));
        art.append(hdr, body);
        break;
      }
      case 'todo': {
        art.append(el('span', { class: 'icon-glyph', text: '📋' }));
        break;
      }
      case 'notes': {
        const fold = el('div', { class: 'app-icon-note-fold' });
        const lines = el('div', { class: 'app-icon-note-lines' },
          el('span'), el('span'), el('span')
        );
        const pencil = el('div', { class: 'app-icon-note-pencil' },
          el('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
            el('path', { d: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' })
          )
        );
        art.append(fold, lines, pencil);
        break;
      }
      case 'quran': {
        art.append(el('span', { class: 'icon-glyph', text: '📖' }));
        break;
      }
      case 'email': {
        art.append(el('span', { class: 'icon-glyph', text: '✉️' }));
        break;
      }
      case 'habits': {
        art.append(el('span', { class: 'icon-glyph', text: '🔥' }));
        break;
      }
      case 'photo': {
        art.append(el('span', { class: 'icon-glyph', text: '🖼️' }));
        break;
      }
      default:
        art.append(icon(page, 28) || icon('gear', 28));
        break;
    }
    return art;
  }

  function setupAppIconLiveUpdates(page, iconBox) {
    if (page === 'clock') {
      let clockTimer = null;
      const updateClock = () => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const digitsEl = $('#miniClockDigits', iconBox);
        if (digitsEl) digitsEl.textContent = `${hh}:${mm}`;
        const handH = $('#miniClockHandH', iconBox);
        const handM = $('#miniClockHandM', iconBox);
        if (handH && handM) {
          const mDeg = (now.getMinutes() / 60) * 360;
          const hDeg = ((now.getHours() % 12) / 12) * 360 + (now.getMinutes() / 60) * 30;
          handH.style.transform = `rotate(${hDeg}deg)`;
          handM.style.transform = `rotate(${mDeg}deg)`;
        }
        // Align wakeups exactly to the turn of each minute + 50ms buffer
        const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;
        clearTimeout(clockTimer);
        clockTimer = setTimeout(updateClock, Math.max(500, delay));
      };
      updateClock();
    } else if (page === 'calendar') {
      let calTimer = null;
      const updateCal = () => {
        const now = new Date();
        const dayEl = $('#miniCalDay', iconBox);
        const monthEl = $('#miniCalMonth', iconBox);
        if (dayEl) dayEl.textContent = String(now.getDate());
        if (monthEl) {
          const ar = lang() === 'ar';
          monthEl.textContent = now.toLocaleDateString(ar ? 'ar-SA' : 'en-US', { month: 'short' });
        }
        const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;
        clearTimeout(calTimer);
        calTimer = setTimeout(updateCal, Math.max(1000, delay));
      };
      updateCal();
    } else if (page === 'todo') {
      const updateTodo = async () => {
        if (!window.widgets?.todos?.get) return;
        try {
          const items = await window.widgets.todos.get();
          const pending = (items || []).filter(t => !t.done).length;
          const badge = $('#miniTodoBadge', iconBox);
          if (badge) badge.textContent = pending > 0 ? String(pending) : '✓';
        } catch { /* ignore */ }
      };
      updateTodo();
      if (window.widgets?.todos?.onChange) window.widgets.todos.onChange(updateTodo);
    }
  }

  /**
   * Universal modern delete confirmation popup.
   * Options:
   *   title: String (defaults to "هل أنت متأكد من الحذف؟" or "Are you sure you want to delete?")
   *   desc: String (optional detail text, e.g. item name)
   *   confirmText: String (defaults to "حذف" or "Delete")
   *   cancelText: String (defaults to "إلغاء" or "Cancel")
   *   onConfirm: Function
   *   onCancel: Function
   * Returns a Promise<boolean> that resolves to true if confirmed, false if cancelled.
   */
  function confirmDelete(opts = {}) {
    return new Promise((resolve) => {
      const isAr = (lang() || document.documentElement.lang || 'ar') !== 'en';
      const title = opts.title || (isAr ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?');
      const desc = opts.desc || '';
      const confirmText = opts.confirmText || (isAr ? 'حذف' : 'Delete');
      const cancelText = opts.cancelText || (isAr ? 'إلغاء' : 'Cancel');

      // Remove any lingering confirm overlay
      $('.confirm-overlay')?.remove();

      const overlay = el('div', { class: 'confirm-overlay' });
      const dialog = el('div', { class: 'confirm-dialog' });

      const iconBox = el('div', { class: 'confirm-icon-box' }, icon('trash'));
      const titleEl = el('div', { class: 'confirm-title', text: title });

      const actions = el('div', { class: 'confirm-actions' });
      const delBtn = el('button', {
        type: 'button',
        class: 'confirm-btn-delete',
        text: confirmText,
      });
      const cancelBtn = el('button', {
        type: 'button',
        class: 'confirm-btn-cancel',
        text: cancelText,
      });

      actions.append(delBtn, cancelBtn);
      dialog.append(iconBox, titleEl);
      if (desc) {
        dialog.append(el('div', { class: 'confirm-desc', text: desc }));
      }
      dialog.append(actions);
      overlay.append(dialog);

      let closed = false;
      const close = (confirmed) => {
        if (closed) return;
        closed = true;
        overlay.classList.add('closing');
        setTimeout(() => overlay.remove(), 120);
        document.removeEventListener('keydown', onKey);
        if (confirmed) {
          if (typeof opts.onConfirm === 'function') opts.onConfirm();
          resolve(true);
        } else {
          if (typeof opts.onCancel === 'function') opts.onCancel();
          resolve(false);
        }
      };

      const onKey = (e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          close(false);
        } else if (e.key === 'Enter') {
          e.stopPropagation();
          close(true);
        }
      };

      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        close(true);
      });
      cancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        close(false);
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          e.stopPropagation();
          close(false);
        }
      });

      document.addEventListener('keydown', onKey);

      const container = $('.plate') || document.body;
      container.append(overlay);
      cancelBtn.focus();
    });
  }

  window.UI = {
    $, $$, el, icon, boot, applySettings, closeWindow, uid, timeAgo, until, esc, debounce,
    digits, settings: () => current, strings, t, translate, lang, locale, page: PAGE,
    isDormant: () => isCurrentlyDormant,
    confirmDelete,
    onDormancy: (fn) => {
      if (typeof fn === 'function') {
        dormancyListeners.push(fn);
        fn(isCurrentlyDormant);
      }
    },
    evaluateDormancy,
    getEffectiveWidgetEco,
  };
}());
