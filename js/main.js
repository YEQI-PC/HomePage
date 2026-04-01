/**
 * HomePage · main.js
 * Minimalist anime-style personal navigation — vanilla JS
 */

'use strict';

/* ================================================================
   Constants & Defaults
   ================================================================ */

const LS = {
  THEME:      'hp_theme',
  SHORTCUTS:  'hp_shortcuts',
  TODO:       'hp_todo',
  NOTES:      'hp_notes',
  RECENT:     'hp_recent',
  BOOKMARKS:  'hp_bookmarks',
  BG:         'hp_bg',
  BG_OPTIONS: 'hp_bg_options',
  BG_THEME:   'hp_bg_theme',
  ENGINE:     'hp_engine',
  CUSTOM_COLORS: 'hp_custom_colors',
  CURSOR_EFFECTS: 'hp_cursor_effects',
  WIDGET_VISIBILITY: 'hp_widget_visibility',
};

const ENGINES = {
  google: { label: 'Google',     icon: 'G', url: 'https://www.google.com/search?q=' },
  baidu:  { label: 'Baidu',      icon: 'B', url: 'https://www.baidu.com/s?wd=' },
  bing:   { label: 'Bing',       icon: 'B', url: 'https://www.bing.com/search?q=' },
  ddg:    { label: 'DuckDuckGo', icon: 'D', url: 'https://duckduckgo.com/?q=' },
};

const DEFAULT_SHORTCUTS = [
  { id: 's1',  group: 'Daily',  name: 'Google',         url: 'https://www.google.com',        icon: 'GO', desc: 'Search engine' },
  { id: 's2',  group: 'Daily',  name: 'GitHub',         url: 'https://github.com',            icon: 'GH', desc: 'Code hosting' },
  { id: 's3',  group: 'Daily',  name: 'YouTube',        url: 'https://www.youtube.com',       icon: 'YT', desc: 'Video platform' },
  { id: 's4',  group: 'Daily',  name: 'Bilibili',       url: 'https://www.bilibili.com',      icon: 'BI', desc: 'Anime and video' },
  { id: 's5',  group: 'Daily',  name: 'Twitter/X',      url: 'https://x.com',                 icon: 'X',  desc: 'Social feed' },
  { id: 's6',  group: 'Tools',  name: 'ChatGPT',        url: 'https://chat.openai.com',       icon: 'AI', desc: 'AI assistant' },
  { id: 's7',  group: 'Tools',  name: 'Notion',         url: 'https://www.notion.so',         icon: 'NO', desc: 'Notes and docs' },
  { id: 's8',  group: 'Tools',  name: 'Figma',          url: 'https://www.figma.com',         icon: 'FG', desc: 'Design tool' },
  { id: 's9',  group: 'Tools',  name: 'VS Code',        url: 'https://vscode.dev',            icon: 'VS', desc: 'Online editor' },
  { id: 's10', group: 'Learn',  name: 'MDN',            url: 'https://developer.mozilla.org', icon: 'MD', desc: 'Web docs' },
  { id: 's11', group: 'Learn',  name: 'Stack Overflow', url: 'https://stackoverflow.com',     icon: 'SO', desc: 'Developer Q&A' },
  { id: 's12', group: 'Learn',  name: 'LeetCode',       url: 'https://leetcode.com',          icon: 'LC', desc: 'Algorithms' },
  { id: 's13', group: 'Learn',  name: 'Wikipedia',      url: 'https://www.wikipedia.org',     icon: 'WK', desc: 'Reference' },
  { id: 's14', group: 'Campus', name: 'Graduate',       url: 'https://gsmis.buaa.edu.cn',     icon: 'GR', desc: 'Graduate system' },
  { id: 's15', group: 'Campus', name: 'Mail',           url: 'https://mail.buaa.edu.cn',      icon: 'ML', desc: 'Campus mail' },
  { id: 's16', group: 'Campus', name: 'Academic',       url: 'https://jiaowu.buaa.edu.cn',    icon: 'AC', desc: 'Academic portal' },
  { id: 's17', group: 'Campus', name: 'Library',        url: 'https://lib.buaa.edu.cn',       icon: 'LB', desc: 'Library portal' },
  { id: 's18', group: 'Campus', name: 'VPN',            url: 'https://e.buaa.edu.cn',         icon: 'VP', desc: 'Campus VPN' },
];

const WEATHER_CODE_MAP = {
  '113': 'SUN',  '116': 'PART', '119': 'CLD',  '122': 'OVR',
  '143': 'FOG',  '176': 'DRZ',  '179': 'SLT',  '182': 'RAN',
  '185': 'RAN',  '200': 'STM',  '227': 'SNW',  '230': 'SNW',
  '248': 'FOG',  '260': 'FOG',  '263': 'DRZ',  '266': 'RAN',
  '281': 'RAN',  '284': 'RAN',  '293': 'DRZ',  '296': 'RAN',
  '299': 'RAN',  '302': 'RAN',  '305': 'STM',  '308': 'STM',
  '311': 'RAN',  '314': 'RAN',  '317': 'SNW',  '320': 'SNW',
  '323': 'SNW',  '326': 'SNW',  '329': 'SNW',  '332': 'SNW',
  '335': 'SNW',  '338': 'SNW',  '350': 'RAN',  '353': 'DRZ',
  '356': 'STM',  '359': 'STM',  '362': 'SNW',  '365': 'SNW',
  '368': 'SNW',  '371': 'SNW',  '374': 'RAN',  '377': 'RAN',
  '386': 'STM',  '389': 'STM',  '392': 'SNW',  '395': 'SNW',
};

/* ================================================================
   Utility helpers
   ================================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const el = (tag, cls = '', html = '') => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
};

function lsGet(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function sanitizeURL(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.href;
  } catch { return null; }
}

/* ================================================================
   Theme
   ================================================================ */

const Theme = (() => {
  const HTML = document.documentElement;

  function get() { return lsGet(LS.THEME, 'light'); }

  function apply(t) {
    HTML.setAttribute('data-theme', t);
    lsSet(LS.THEME, t);
    if (typeof ThemePalette !== 'undefined') {
      ThemePalette.applyCurrent();
    }
  }

  function toggle() {
    apply(get() === 'light' ? 'dark' : 'light');
  }

  function init() {
    apply(get());
    $('#theme-toggle').addEventListener('click', toggle);
  }

  return { init, apply, get };
})();

const ThemePalette = (() => {
  const DEFAULTS = {
    light: { primary: '#8b7fd4', accent: '#c9a0dc' },
    dark: { primary: '#9d92e0', accent: '#c9a0dc' },
  };

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function getMode() {
    return document.documentElement.getAttribute('data-theme') || lsGet(LS.THEME, 'light');
  }

  function hexToRgb(hex) {
    const clean = String(hex).trim().replace('#', '');
    const full = clean.length === 3 ? clean.split('').map(ch => ch + ch).join('') : clean;
    const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
    if (!match) return null;
    return {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16),
    };
  }

  function parseColor(color) {
    if (!color) return null;
    if (typeof color === 'object' && Number.isFinite(color.r) && Number.isFinite(color.g) && Number.isFinite(color.b)) {
      return {
        r: clamp(Math.round(color.r), 0, 255),
        g: clamp(Math.round(color.g), 0, 255),
        b: clamp(Math.round(color.b), 0, 255),
      };
    }
    if (Array.isArray(color) && color.length >= 3) {
      return {
        r: clamp(Math.round(color[0]), 0, 255),
        g: clamp(Math.round(color[1]), 0, 255),
        b: clamp(Math.round(color[2]), 0, 255),
      };
    }
    if (typeof color !== 'string') return null;

    const hex = hexToRgb(color);
    if (hex) return hex;

    const rgb = color.match(/\d+(\.\d+)?/g);
    if (rgb && rgb.length >= 3) {
      return {
        r: clamp(Math.round(parseFloat(rgb[0])), 0, 255),
        g: clamp(Math.round(parseFloat(rgb[1])), 0, 255),
        b: clamp(Math.round(parseFloat(rgb[2])), 0, 255),
      };
    }
    return null;
  }

  function rgbToHex(color) {
    const rgb = parseColor(color);
    if (!rgb) return null;
    return `#${[rgb.r, rgb.g, rgb.b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
  }

  function rgbToString(color) {
    const rgb = parseColor(color);
    return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '';
  }

  function rgba(color, alpha) {
    const rgb = parseColor(color);
    return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : '';
  }

  function mixRgb(from, to, weight = 0.5) {
    const a = parseColor(from);
    const b = parseColor(to);
    if (!a || !b) return a || b;
    const w = clamp(weight, 0, 1);
    return {
      r: Math.round(a.r + (b.r - a.r) * w),
      g: Math.round(a.g + (b.g - a.g) * w),
      b: Math.round(a.b + (b.b - a.b) * w),
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return [h, s, l];
  }

  function hslToRgb(h, s, l) {
    let r;
    let g;
    let b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  function deriveAccent(primary) {
    const rgb = parseColor(primary);
    if (!rgb) return DEFAULTS[getMode()].accent;
    const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return rgbToHex(hslToRgb((h + 0.065) % 1, clamp(Math.max(s, 0.3), 0.22, 0.7), clamp(l + 0.12, 0.38, 0.78)));
  }

  function deriveTokens(primaryInput, accentInput, mode = getMode()) {
    const base = DEFAULTS[mode] || DEFAULTS.light;
    const primary = parseColor(primaryInput) || parseColor(base.primary);
    const accent = parseColor(accentInput) || parseColor(deriveAccent(primary));

    const primaryLight = mixRgb(primary, { r: 255, g: 255, b: 255 }, mode === 'dark' ? 0.22 : 0.16);
    const primaryDark = mixRgb(primary, { r: 18, g: 20, b: 32 }, mode === 'dark' ? 0.34 : 0.24);
    const surface = mode === 'dark'
      ? mixRgb({ r: 18, g: 22, b: 34 }, primary, 0.14)
      : mixRgb({ r: 248, g: 250, b: 255 }, primary, 0.08);
    const surfaceAlt = mode === 'dark'
      ? mixRgb({ r: 24, g: 28, b: 42 }, accent, 0.18)
      : mixRgb({ r: 241, g: 245, b: 252 }, accent, 0.1);
    const cardTint = mode === 'dark'
      ? mixRgb({ r: 24, g: 28, b: 42 }, primary, 0.18)
      : mixRgb({ r: 255, g: 255, b: 255 }, accent, 0.09);
    const cardHover = mode === 'dark'
      ? mixRgb(cardTint, primaryLight, 0.08)
      : mixRgb(cardTint, primaryLight, 0.18);
    const toolbar = mode === 'dark'
      ? mixRgb({ r: 14, g: 16, b: 26 }, primary, 0.2)
      : mixRgb({ r: 250, g: 252, b: 255 }, primary, 0.06);
    const input = mode === 'dark'
      ? mixRgb({ r: 19, g: 22, b: 34 }, accent, 0.1)
      : mixRgb({ r: 255, g: 255, b: 255 }, primary, 0.04);
    const overlayStart = mode === 'dark'
      ? rgba(mixRgb({ r: 6, g: 8, b: 16 }, primary, 0.28), 0.8)
      : rgba(mixRgb({ r: 251, g: 252, b: 255 }, primary, 0.18), 0.72);
    const overlayEnd = mode === 'dark'
      ? rgba(mixRgb({ r: 8, g: 10, b: 20 }, accent, 0.26), 0.58)
      : rgba(mixRgb({ r: 245, g: 247, b: 255 }, accent, 0.12), 0.38);
    const textPrimary = mode === 'dark'
      ? mixRgb({ r: 235, g: 238, b: 248 }, primary, 0.08)
      : mixRgb({ r: 39, g: 42, b: 58 }, primary, 0.08);
    const textSecondary = mode === 'dark'
      ? mixRgb({ r: 159, g: 165, b: 188 }, primary, 0.08)
      : mixRgb({ r: 101, g: 109, b: 136 }, primary, 0.1);
    const textMuted = mode === 'dark'
      ? mixRgb({ r: 92, g: 97, b: 121 }, accent, 0.06)
      : mixRgb({ r: 137, g: 145, b: 172 }, accent, 0.08);
    const border = mode === 'dark' ? rgba(primary, 0.22) : rgba(primary, 0.18);
    const focus = rgba(primary, mode === 'dark' ? 0.52 : 0.42);
    const shadowColor = mode === 'dark' ? rgba(primaryDark, 0.36) : rgba(primaryDark, 0.14);

    return {
      '--primary': rgbToString(primary),
      '--primary-light': rgbToString(primaryLight),
      '--primary-dark': rgbToString(primaryDark),
      '--accent': rgbToString(accent),
      '--primary-alpha-06': rgba(primary, 0.06),
      '--primary-alpha-08': rgba(primary, 0.08),
      '--primary-alpha-10': rgba(primary, 0.1),
      '--primary-alpha-12': rgba(primary, 0.12),
      '--primary-alpha-15': rgba(primary, 0.15),
      '--primary-alpha-20': rgba(primary, 0.2),
      '--primary-alpha-25': rgba(primary, 0.25),
      '--primary-alpha-30': rgba(primary, 0.3),
      '--primary-alpha-40': rgba(primary, 0.4),
      '--primary-alpha-50': rgba(primary, 0.5),
      '--primary-alpha-60': rgba(primary, 0.6),
      '--accent-alpha-10': rgba(accent, 0.1),
      '--accent-alpha-18': rgba(accent, 0.18),
      '--bg-primary': rgbToString(surface),
      '--bg-secondary': rgbToString(surfaceAlt),
      '--bg-card': rgba(cardTint, mode === 'dark' ? 0.78 : 0.8),
      '--bg-card-hover': rgba(cardHover, mode === 'dark' ? 0.9 : 0.94),
      '--bg-toolbar': rgba(toolbar, mode === 'dark' ? 0.88 : 0.82),
      '--bg-input': rgba(input, mode === 'dark' ? 0.9 : 0.94),
      '--bg-overlay': `linear-gradient(180deg, ${overlayStart} 0%, ${overlayEnd} 100%)`,
      '--bg-sidebar': rgba(cardTint, mode === 'dark' ? 0.84 : 0.9),
      '--text-primary': rgbToString(textPrimary),
      '--text-secondary': rgbToString(textSecondary),
      '--text-muted': rgbToString(textMuted),
      '--text-link': rgbToString(primary),
      '--border-color': border,
      '--border-focus': focus,
      '--shadow-sm': `0 10px 30px ${rgba(primaryDark, mode === 'dark' ? 0.14 : 0.08)}`,
      '--shadow': `0 20px 48px ${shadowColor}`,
      '--shadow-lg': `0 28px 68px ${rgba(primaryDark, mode === 'dark' ? 0.44 : 0.18)}`,
      '--shadow-card': `0 16px 40px ${rgba(primaryDark, mode === 'dark' ? 0.24 : 0.12)}`,
    };
  }

  function getSources() {
    return {
      manual: lsGet(LS.CUSTOM_COLORS, null),
      background: lsGet(LS.BG_THEME, null),
    };
  }

  function getActiveState() {
    const mode = getMode();
    const { manual, background } = getSources();
    if (manual?.primary && manual?.accent) return { source: 'manual', colors: manual, mode };
    if (background?.primary && background?.accent) return { source: 'background', colors: background, mode };
    return { source: 'default', colors: DEFAULTS[mode] || DEFAULTS.light, mode };
  }

  function syncPresetButtons(primaryHex, accentHex) {
    $$('.theme-preset').forEach(btn => {
      const matches =
        btn.dataset.primary?.toLowerCase() === primaryHex.toLowerCase() &&
        btn.dataset.accent?.toLowerCase() === accentHex.toLowerCase();
      btn.classList.toggle('active', matches);
    });
  }

  function syncControls(activeState = getActiveState()) {
    const primaryPicker = $('#primary-color-picker');
    const accentPicker = $('#accent-color-picker');
    const primaryHex = rgbToHex(activeState.colors.primary) || DEFAULTS[activeState.mode].primary;
    const accentHex = rgbToHex(activeState.colors.accent) || DEFAULTS[activeState.mode].accent;

    if (primaryPicker) primaryPicker.value = primaryHex;
    if (accentPicker) accentPicker.value = accentHex;
    syncPresetButtons(primaryHex, accentHex);

    const sourceValue = $('#theme-source-value');
    if (sourceValue) {
      sourceValue.textContent = activeState.source === 'manual'
        ? 'Manual'
        : activeState.source === 'background'
          ? 'Wallpaper'
          : 'Default';
    }
  }

  function applyCurrent() {
    const activeState = getActiveState();
    const tokens = deriveTokens(activeState.colors.primary, activeState.colors.accent, activeState.mode);
    Object.entries(tokens).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    syncControls(activeState);
    return activeState;
  }

  function setManual(primary, accent) {
    const normalized = {
      primary: rgbToHex(primary) || DEFAULTS[getMode()].primary,
      accent: rgbToHex(accent) || deriveAccent(primary),
    };
    lsSet(LS.CUSTOM_COLORS, normalized);
    return applyCurrent();
  }

  function clearManual() {
    lsSet(LS.CUSTOM_COLORS, null);
    return applyCurrent();
  }

  function setBackground(primary, accent = null) {
    const normalized = {
      primary: rgbToHex(primary) || DEFAULTS[getMode()].primary,
      accent: rgbToHex(accent) || deriveAccent(primary),
    };
    lsSet(LS.BG_THEME, normalized);
    return applyCurrent();
  }

  function clearBackground() {
    lsSet(LS.BG_THEME, null);
    return applyCurrent();
  }

  function init() {
    applyCurrent();
  }

  return {
    init,
    applyCurrent,
    setManual,
    clearManual,
    setBackground,
    clearBackground,
    getActiveState,
    rgbToHsl,
    hslToRgb,
    parseColor,
    rgbToHex,
    mixRgb,
    clamp,
  };
})();

/* ================================================================
   Clock
   ================================================================ */

const Clock = (() => {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = new Date();
    const timeEl = $('#clock-time');
    const dateEl = $('#clock-date');
    const timeLargeEl = $('#clock-time-large');
    const dateLargeEl = $('#clock-date-large');
    if (!timeEl) return;

    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    timeEl.textContent = timeStr;
    if (timeLargeEl) timeLargeEl.textContent = timeStr;

    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const dateStr = `${DAYS[now.getDay()]} · ${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dateEl.textContent = dateStr;
    if (dateLargeEl) dateLargeEl.textContent = dateStr;
  }

  function init() {
    tick();
    setInterval(tick, 1000);
  }

  return { init };
})();

/* ================================================================
   Weather
   ================================================================ */

const Weather = (() => {
  async function fetchWeather() {
    const loadingEl = $('#weather-loading');
    const contentEl = $('#weather-content');

    try {
      const res = await fetch('https://wttr.in/?format=j1', { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json();
      const cur = data.current_condition?.[0];
      if (!cur) throw new Error('no data');

      const code = cur.weatherCode;
      const icon = WEATHER_CODE_MAP[String(code)] ?? 'WX';
      const temp = `${cur.temp_C}°C`;
      const feelsLike = `${cur.FeelsLikeC}°C`;
      const desc = cur.lang_zh?.[0]?.value ?? cur.weatherDesc?.[0]?.value ?? '';
      const humidity = `${cur.humidity}%`;
      const wind = `${cur.windspeedKmph}km/h`;

      // Update compact widget
      $('#weather-icon').textContent = icon;
      $('#weather-temp').textContent = temp;
      const feelsEl = $('#weather-feels');
      if (feelsEl) feelsEl.textContent = `Feels ${feelsLike}`;
      $('#weather-desc').textContent = desc;
      $('#weather-humidity').textContent = `H ${humidity}`;
      $('#weather-wind').textContent = `W ${wind}`;

      // Update modal
      const iconLargeEl = $('#weather-icon-large');
      if (iconLargeEl) iconLargeEl.textContent = icon === 'WX' ? '☁️' : icon;
      const tempLargeEl = $('#weather-temp-large');
      if (tempLargeEl) tempLargeEl.textContent = temp;
      const descLargeEl = $('#weather-desc-large');
      if (descLargeEl) descLargeEl.textContent = desc;
      const feelsLargeEl = $('#weather-feels-large');
      if (feelsLargeEl) feelsLargeEl.textContent = feelsLike;
      const humidityLargeEl = $('#weather-humidity-large');
      if (humidityLargeEl) humidityLargeEl.textContent = humidity;
      const windLargeEl = $('#weather-wind-large');
      if (windLargeEl) windLargeEl.textContent = wind;

      loadingEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      if (loadingEl) {
        loadingEl.innerHTML = '<span class="weather-error">Weather unavailable</span>';
      }
    }
  }

  function init() {
    fetchWeather();
  }

  return { init };
})();

/* ================================================================
   Search
   ================================================================ */

const Search = (() => {
  let currentEngine = 'google';
  let engineBtn = null;
  let dropdown  = null;

  function setEngine(key) {
    const eng = ENGINES[key];
    if (!eng) return;
    currentEngine = key;
    lsSet(LS.ENGINE, key);
    $('#engine-icon').textContent = eng.icon;
    $$('.engine-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.engine === key);
    });
  }

  function openDropdown() {
    dropdown.classList.add('open');
  }

  function closeDropdown() {
    dropdown.classList.remove('open');
  }

  function init() {
    const saved = lsGet(LS.ENGINE, 'google');
    setEngine(saved);

    // Cache elements to avoid repeated DOM queries in the global click handler
    engineBtn  = $('#engine-btn');
    dropdown   = $('#engine-dropdown');
    const searchInput = $('#search-input');

    engineBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    $$('.engine-option').forEach(btn => {
      btn.addEventListener('click', () => {
        setEngine(btn.dataset.engine);
        closeDropdown();
        searchInput.focus();
      });
    });

    $('#search-form').addEventListener('submit', e => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (!q) return;
      const url = ENGINES[currentEngine].url + encodeURIComponent(q);
      window.open(url, '_blank', 'noopener,noreferrer');
      searchInput.value = '';
    });

    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target) && !engineBtn.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  return { init };
})();

/* ================================================================
   Shortcuts
   ================================================================ */

const Shortcuts = (() => {
  function load() {
    return lsGet(LS.SHORTCUTS, DEFAULT_SHORTCUTS);
  }

  function save(list) {
    lsSet(LS.SHORTCUTS, list);
  }

  function groupByCategory(list) {
    const map = new Map();
    list.forEach(s => {
      if (!map.has(s.group)) map.set(s.group, []);
      map.get(s.group).push(s);
    });
    return map;
  }

  function render() {
    const section = $('#shortcuts-section');
    section.innerHTML = '';
    const list = load();
    const groups = groupByCategory(list);

    groups.forEach((items, groupName) => {
      const wrap = el('div', 'shortcut-group');

      const titleRow = el('div', 'shortcut-group-title',
        `<h2>${groupName}</h2><div class="group-divider"></div>`
      );
      wrap.appendChild(titleRow);

      const grid = el('div', 'shortcut-grid');
      grid.dataset.group = groupName;

      items.forEach((item, index) => {
        const card = el('a', 'shortcut-card');
        card.href   = item.url;
        card.target = '_blank';
        card.rel    = 'noopener noreferrer';
        card.title  = item.desc || item.name;
        card.dataset.id = item.id;
        card.draggable = true;
        card.innerHTML = `
          <span class="shortcut-icon">${item.icon || '🔗'}</span>
          <span class="shortcut-name">${item.name}</span>
          ${item.desc ? `<span class="shortcut-desc">${item.desc}</span>` : ''}
        `;

        // Add drag and drop event listeners
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);

        card.addEventListener('click', (e) => {
          // Don't navigate if we just finished dragging
          if (card.classList.contains('dragging')) {
            e.preventDefault();
            return;
          }
          Recent.record({ name: item.name, url: item.url, icon: item.icon });
        });
        grid.appendChild(card);
      });

      wrap.appendChild(grid);
      section.appendChild(wrap);
    });

    renderManager();
  }

  let draggedElement = null;

  function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';

    const target = e.currentTarget;
    if (target !== draggedElement && target.classList.contains('shortcut-card')) {
      target.classList.add('drag-over');
    }
    return false;
  }

  function handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    const target = e.currentTarget;
    target.classList.remove('drag-over');

    if (draggedElement !== target) {
      // Swap positions in the data
      const list = load();
      const draggedId = draggedElement.dataset.id;
      const targetId = target.dataset.id;

      const draggedIndex = list.findIndex(item => item.id === draggedId);
      const targetIndex = list.findIndex(item => item.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Swap items
        [list[draggedIndex], list[targetIndex]] = [list[targetIndex], list[draggedIndex]];
        save(list);
        render();
      }
    }

    return false;
  }

  function handleDragEnd(e) {
    this.classList.remove('dragging');
    // Remove drag-over class from all cards
    $$('.shortcut-card').forEach(card => {
      card.classList.remove('drag-over');
    });
    // Clear dragging state after a short delay
    setTimeout(() => {
      if (draggedElement) {
        draggedElement.classList.remove('dragging');
      }
      draggedElement = null;
    }, 100);
  }

  function renderManager() {
    const list = load();
    const container = $('#shortcut-manager-list');
    container.innerHTML = '';

    if (list.length === 0) {
      container.innerHTML = '<p class="empty-hint">暂无快捷方式</p>';
      return;
    }

    list.forEach(item => {
      const row = el('div', 'shortcut-manager-item');
      row.dataset.id = item.id;
      row.innerHTML = `
        <span class="sm-icon">${item.icon || '🔗'}</span>
        <div class="sm-info">
          <div class="sm-name">${item.name}</div>
          <div class="sm-group">${item.group}</div>
        </div>
        <div class="sm-actions">
          <button class="sm-btn edit" title="编辑">✏️</button>
          <button class="sm-btn del" title="删除">🗑️</button>
        </div>
      `;
      row.querySelector('.edit').addEventListener('click', () => ShortcutModal.openEdit(item));
      row.querySelector('.del').addEventListener('click', () => remove(item.id));
      container.appendChild(row);
    });
  }

  function add(item) {
    const list = load();
    list.push({ ...item, id: uid() });
    save(list);
    render();
  }

  function update(id, item) {
    const list = load();
    const idx  = list.findIndex(s => s.id === id);
    if (idx !== -1) list[idx] = { ...list[idx], ...item };
    save(list);
    render();
  }

  function remove(id) {
    const list = load().filter(s => s.id !== id);
    save(list);
    render();
  }

  return { render, add, update, remove, load };
})();

/* ================================================================
   Shortcut Modal
   ================================================================ */

const ShortcutModal = (() => {
  function open(editItem = null) {
    const overlay = $('#shortcut-modal-overlay');
    const form    = $('#shortcut-form');
    form.reset();
    $('#shortcut-edit-id').value = '';
    $('#shortcut-modal-title').textContent = editItem ? '编辑快捷方式' : '添加快捷方式';

    if (editItem) {
      $('#shortcut-edit-id').value = editItem.id;
      $('#shortcut-name').value    = editItem.name;
      $('#shortcut-url').value     = editItem.url;
      $('#shortcut-icon').value    = editItem.icon || '';
      $('#shortcut-group').value   = editItem.group;
      $('#shortcut-desc').value    = editItem.desc || '';
    }
    overlay.classList.add('open');
    setTimeout(() => $('#shortcut-name').focus(), 100);
  }

  function close() {
    $('#shortcut-modal-overlay').classList.remove('open');
  }

  function openEdit(item) {
    open(item);
  }

  function init() {
    $('#add-shortcut-btn').addEventListener('click', () => open());
    $('#shortcut-modal-close').addEventListener('click', close);
    $('#shortcut-cancel-btn').addEventListener('click', close);
    $('#shortcut-modal-overlay').addEventListener('click', e => {
      if (e.target === $('#shortcut-modal-overlay')) close();
    });

    $('#shortcut-form').addEventListener('submit', e => {
      e.preventDefault();
      const id    = $('#shortcut-edit-id').value;
      const url   = sanitizeURL($('#shortcut-url').value.trim());
      if (!url) { alert('请输入有效的 URL'); return; }

      const data = {
        name:  $('#shortcut-name').value.trim(),
        url,
        icon:  $('#shortcut-icon').value.trim() || '🔗',
        group: $('#shortcut-group').value.trim() || '其他',
        desc:  $('#shortcut-desc').value.trim(),
      };

      if (id) {
        Shortcuts.update(id, data);
      } else {
        Shortcuts.add(data);
      }
      close();
    });
  }

  return { init, open, openEdit, close };
})();

/* ================================================================
   Todo
   ================================================================ */

const Todo = (() => {
  function load() { return lsGet(LS.TODO, []); }
  function save(list) { lsSet(LS.TODO, list); }

  function updateCount(list) {
    const active = list.filter(t => !t.done).length;
    const total = list.length;

    // Update main todo count (if element exists for legacy layout)
    const todoCount = $('#todo-count');
    if (todoCount) todoCount.textContent = active;

    // Update compact widget count
    const compactCount = $('#todo-count-compact');
    if (compactCount) {
      compactCount.textContent = active > 0 ? `${active} 项待办` : '无待办';
    }
  }

  function render() {
    const list  = load();
    const ul    = $('#todo-list');
    if (!ul) return;

    ul.innerHTML = '';
    updateCount(list);

    if (list.length === 0) {
      ul.innerHTML = '<li class="todo-empty-hint">暂无待办，开始添加吧！</li>';
      return;
    }

    list.forEach(item => {
      const li = el('li', `todo-item${item.done ? ' done' : ''}`);
      li.dataset.id = item.id;
      li.innerHTML = `
        <input type="checkbox" ${item.done ? 'checked' : ''} aria-label="完成" />
        <span class="todo-text">${item.text}</span>
        <button class="todo-del" title="删除">×</button>
      `;
      li.querySelector('input').addEventListener('change', () => toggle(item.id));
      li.querySelector('.todo-del').addEventListener('click', () => remove(item.id));
      ul.appendChild(li);
    });
  }

  function add(text) {
    if (!text.trim()) return;
    const list = load();
    list.unshift({ id: uid(), text: text.trim(), done: false });
    save(list);
    render();
  }

  function toggle(id) {
    const list = load();
    const item = list.find(t => t.id === id);
    if (item) item.done = !item.done;
    save(list);
    render();
  }

  function remove(id) {
    save(load().filter(t => t.id !== id));
    render();
  }

  function init() {
    render();
    const input = $('#todo-input');
    const addBtn = $('#todo-add-btn');

    if (addBtn && input) {
      addBtn.addEventListener('click', () => {
        add(input.value);
        input.value = '';
        input.focus();
      });

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          add(input.value);
          input.value = '';
        }
      });
    }
  }

  return { init, render };
})();

/* ================================================================
   Notes
   ================================================================ */

const Notes = (() => {
  let saveTimer = null;

  function updatePreview(text) {
    const preview = $('#notes-preview-compact');
    if (preview) {
      if (text.trim()) {
        const firstLine = text.split('\n')[0].trim();
        preview.textContent = firstLine.substring(0, 30) + (firstLine.length > 30 ? '...' : '');
      } else {
        preview.textContent = '无内容';
      }
    }
  }

  function init() {
    const area = $('#notes-area');
    const indicator = $('#notes-saved');

    const savedNotes = lsGet(LS.NOTES, '');
    if (area) area.value = savedNotes;
    updatePreview(savedNotes);

    if (area) {
      area.addEventListener('input', () => {
        if (indicator) indicator.style.opacity = '0';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          lsSet(LS.NOTES, area.value);
          updatePreview(area.value);
          if (indicator) indicator.style.opacity = '1';
        }, 800);
      });
    }
  }

  return { init };
})();

/* ================================================================
   Recently Visited
   ================================================================ */

const Recent = (() => {
  const MAX = 12;

  function load() { return lsGet(LS.RECENT, []); }
  function save(list) { lsSet(LS.RECENT, list); }

  function record(item) {
    let list = load().filter(r => r.url !== item.url);
    list.unshift({ ...item, ts: Date.now() });
    if (list.length > MAX) list = list.slice(0, MAX);
    save(list);
    render();
  }

  function render() {
    const container = $('#recent-list');
    const list = load();

    if (list.length === 0) {
      container.innerHTML = '<p class="empty-hint">暂无访问记录</p>';
      return;
    }

    container.innerHTML = '';
    list.forEach(item => {
      const a = el('a', 'recent-card');
      a.href   = item.url;
      a.target = '_blank';
      a.rel    = 'noopener noreferrer';
      a.innerHTML = `
        <span class="recent-icon">${item.icon || '🔗'}</span>
        <span class="recent-name">${item.name}</span>
        <span class="recent-time">${timeAgo(item.ts)}</span>
      `;
      a.addEventListener('click', () => record(item));
      container.appendChild(a);
    });
  }

  function clear() {
    save([]);
    render();
  }

  function init() {
    render();
    $('#clear-recent-btn').addEventListener('click', () => {
      if (confirm('确认清除所有访问记录？')) clear();
    });
  }

  return { init, record, render };
})();

/* ================================================================
   Bookmarks
   ================================================================ */

const Bookmarks = (() => {
  function load() { return lsGet(LS.BOOKMARKS, []); }
  function save(list) { lsSet(LS.BOOKMARKS, list); }

  function render() {
    const grid = $('#bookmarks-grid');
    const list = load();

    if (list.length === 0) {
      grid.innerHTML = '<p class="empty-hint">暂无收藏，点击"+ 添加"</p>';
      return;
    }

    grid.innerHTML = '';
    list.forEach(item => {
      const card = el('div', 'bookmark-card');
      card.innerHTML = `
        <span class="bookmark-icon">${item.icon || '🔖'}</span>
        <a class="bookmark-name" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.name}</a>
        <button class="bookmark-del" title="删除">×</button>
      `;
      card.querySelector('.bookmark-del').addEventListener('click', e => {
        e.stopPropagation();
        remove(item.id);
      });
      grid.appendChild(card);
    });
  }

  function add(item) {
    const list = load();
    list.push({ ...item, id: uid() });
    save(list);
    render();
  }

  function remove(id) {
    save(load().filter(b => b.id !== id));
    render();
  }

  function init() {
    render();
  }

  return { init, add, render };
})();

/* ================================================================
   Bookmark Modal
   ================================================================ */

const BookmarkModal = (() => {
  function open() {
    $('#bookmark-modal-overlay').classList.add('open');
    $('#bookmark-form').reset();
    setTimeout(() => $('#bookmark-name').focus(), 100);
  }

  function close() {
    $('#bookmark-modal-overlay').classList.remove('open');
  }

  function init() {
    $('#add-bookmark-btn').addEventListener('click', open);
    $('#bookmark-modal-close').addEventListener('click', close);
    $('#bookmark-cancel-btn').addEventListener('click', close);
    $('#bookmark-modal-overlay').addEventListener('click', e => {
      if (e.target === $('#bookmark-modal-overlay')) close();
    });

    $('#bookmark-form').addEventListener('submit', e => {
      e.preventDefault();
      const url = sanitizeURL($('#bookmark-url').value.trim());
      if (!url) { alert('请输入有效的 URL'); return; }

      Bookmarks.add({
        name: $('#bookmark-name').value.trim(),
        url,
        icon: $('#bookmark-icon').value.trim() || '🔖',
      });
      close();
    });
  }

  return { init };
})();

/* ================================================================
   Background & Color Extraction
   ================================================================ */

const Background = (() => {
  const bgLayer = $('#bg-layer');
  const bgPreview = $('#bg-preview');
  const bgStatus = $('#bg-status');
  const REMOTE_WALLPAPER_ENDPOINTS = [
    'https://api.waifu.pics/sfw/waifu',
    'https://nekos.best/api/v2/neko',
  ];
  const CURATED_FALLBACKS = [
    'https://s3.nyeki.dev/nekos-api/images/original/343c1754-c917-45d5-bd92-aca02244c07f.webp',
    'https://s3.nyeki.dev/nekos-api/images/original/585213ef-2ea7-423f-93d0-e7fe7c8dc2b3.webp',
    'https://s3.nyeki.dev/nekos-api/images/original/f66bb6c5-b7dc-4cc4-a15a-6851c811cf40.webp',
    'https://s3.nyeki.dev/nekos-api/images/original/7a17a4af-508b-4ba7-9761-cbd76cc00cb3.webp',
    'https://s3.nyeki.dev/nekos-api/images/original/6c0c5c4c-e65c-4f81-9de7-b302fd3401d0.webp',
    'https://s3.nyeki.dev/nekos-api/images/original/e27f4deb-967a-448f-b41d-fe7ab067c166.webp',
  ];

  function setStatus(msg) {
    if (bgStatus) bgStatus.textContent = msg;
  }

  function applyBg(dataUrl, label = '', palette = null) {
    bgLayer.style.backgroundImage = `url("${dataUrl}")`;
    document.body.classList.add('has-bg');
    if (bgPreview) bgPreview.style.backgroundImage = `url("${dataUrl}")`;
    setStatus(label);
    lsSet(LS.BG, dataUrl);

    if (palette?.primary) {
      ThemePalette.setBackground(palette.primary, palette.accent);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => extractColors(img);
    img.src = dataUrl;
  }

  function clearBg() {
    bgLayer.style.backgroundImage = '';
    document.body.classList.remove('has-bg');
    if (bgPreview) bgPreview.style.backgroundImage = '';
    setStatus('');
    lsSet(LS.BG, null);
    ThemePalette.clearBackground();
  }

  function extractColors(imgEl) {
    try {
      const canvas = $('#color-canvas');
      const ctx = canvas.getContext('2d');
      const size = 80;

      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(imgEl, 0, 0, size, size);

      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 16) {
        const pr = data[i];
        const pg = data[i + 1];
        const pb = data[i + 2];
        const pa = data[i + 3];
        if (pa < 128) continue;

        const brightness = (pr + pg + pb) / 3;
        if (brightness > 230 || brightness < 25) continue;

        r += pr;
        g += pg;
        b += pb;
        count++;
      }

      if (count === 0) return;

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      const [h, s, l] = ThemePalette.rgbToHsl(r, g, b);
      const primary = ThemePalette.hslToRgb(h, Math.min(s, 0.55), ThemePalette.clamp(l, 0.42, 0.64));
      const accent = ThemePalette.hslToRgb(
        (h + 0.065) % 1,
        ThemePalette.clamp(Math.min(s + 0.08, 0.72), 0.24, 0.72),
        ThemePalette.clamp(l + 0.12, 0.48, 0.78)
      );

      ThemePalette.setBackground(primary, accent);
    } catch (err) {
      ThemePalette.applyCurrent();
    }
  }

  async function fetchAnimeBackground() {
    const btn = $('#fetch-anime-btn');
    const origText = btn.innerHTML;
    setStatus('Loading random wallpaper...');
    btn.innerHTML = '<span class="spinning">↻</span> Loading...';
    btn.disabled = true;

    let lastErr = null;

    try {
      // Try API endpoints that return JSON
      for (const endpoint of REMOTE_WALLPAPER_ENDPOINTS) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(endpoint, {
            signal: controller.signal,
            mode: 'cors',
            cache: 'no-store',
          });
          clearTimeout(timeoutId);

          if (!res.ok) throw new Error(`API HTTP ${res.status}`);

          let imageUrl;
          const contentType = res.headers.get('content-type');

          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            // Handle different API response formats
            if (data.url) {
              imageUrl = data.url;
            } else if (data.results && data.results[0] && data.results[0].url) {
              imageUrl = data.results[0].url;
            } else {
              throw new Error('Invalid JSON response format');
            }

            const dataUrl = await fetchImageAsDataUrl(imageUrl);
            applyBg(dataUrl, 'Random wallpaper updated');
            setStatus('Wallpaper loaded');
            return;
          }
        } catch (err) {
          lastErr = err;
          console.warn(`Failed to fetch wallpaper from ${endpoint}:`, err.message || err);
        }
      }

      // Try fallback images
      for (const fallbackUrl of CURATED_FALLBACKS) {
        try {
          const dataUrl = await fetchImageAsDataUrl(fallbackUrl);
          applyBg(dataUrl, 'Fallback wallpaper applied');
          setStatus('Using fallback wallpaper');
          return;
        } catch (err) {
          lastErr = err;
          console.warn(`Failed to fetch fallback from ${fallbackUrl}:`, err.message || err);
        }
      }

      setStatus('Wallpaper unavailable right now. Try again or upload a local image.');
      console.error('All background sources failed:', lastErr);
    } finally {
      btn.innerHTML = origText;
      btn.disabled = false;
    }
  }

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function fetchImageAsDataUrl(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Image HTTP ${res.status}`);
      const blob = await res.blob();
      return await blobToDataURL(blob);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function handleUpload(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => applyBg(e.target.result, file.name || 'Local image');
    reader.readAsDataURL(file);
  }

  function applyBgOptions(options) {
    const overlay = $('#bg-overlay');

    if (options.displayMode === 'custom') {
      bgLayer.style.backgroundSize = `${options.size}%`;
      bgLayer.style.backgroundPosition = `${options.positionX}% ${options.positionY}%`;
    } else {
      bgLayer.style.backgroundSize = options.displayMode;
      bgLayer.style.backgroundPosition = 'center';
    }

    overlay.style.backdropFilter = `blur(${options.blur}px) saturate(${1 + options.saturation * 0.2})`;
    bgLayer.style.opacity = options.opacity;
    bgLayer.style.filter = `saturate(${options.saturation})`;
  }

  function initBgControls(savedOptions) {
    const displayMode = $('#bg-display-mode');
    const customOptions = $('#bg-custom-options');
    const bgSize = $('#bg-size');
    const bgPosX = $('#bg-position-x');
    const bgPosY = $('#bg-position-y');
    const bgBlur = $('#bg-blur');
    const bgBlurValue = $('#bg-blur-value');
    const bgOpacity = $('#bg-opacity');
    const bgOpacityValue = $('#bg-opacity-value');
    const bgSaturation = $('#bg-saturation');
    const bgSaturationValue = $('#bg-saturation-value');

    displayMode.value = savedOptions.displayMode;
    bgSize.value = savedOptions.size;
    bgPosX.value = savedOptions.positionX;
    bgPosY.value = savedOptions.positionY;
    bgBlur.value = savedOptions.blur;
    bgBlurValue.textContent = `${savedOptions.blur}px`;
    bgOpacity.value = savedOptions.opacity;
    bgOpacityValue.textContent = `${Math.round(savedOptions.opacity * 100)}%`;
    bgSaturation.value = savedOptions.saturation;
    bgSaturationValue.textContent = `${Math.round(savedOptions.saturation * 100)}%`;
    customOptions.classList.toggle('hidden', savedOptions.displayMode !== 'custom');

    displayMode.addEventListener('change', e => {
      savedOptions.displayMode = e.target.value;
      customOptions.classList.toggle('hidden', e.target.value !== 'custom');
      applyBgOptions(savedOptions);
      lsSet(LS.BG_OPTIONS, savedOptions);
    });

    [bgSize, bgPosX, bgPosY].forEach(input => {
      input.addEventListener('input', e => {
        if (input === bgSize) savedOptions.size = parseFloat(e.target.value);
        if (input === bgPosX) savedOptions.positionX = parseFloat(e.target.value);
        if (input === bgPosY) savedOptions.positionY = parseFloat(e.target.value);
        applyBgOptions(savedOptions);
        lsSet(LS.BG_OPTIONS, savedOptions);
      });
    });

    bgBlur.addEventListener('input', e => {
      savedOptions.blur = parseFloat(e.target.value);
      bgBlurValue.textContent = `${savedOptions.blur}px`;
      applyBgOptions(savedOptions);
      lsSet(LS.BG_OPTIONS, savedOptions);
    });

    bgOpacity.addEventListener('input', e => {
      savedOptions.opacity = parseFloat(e.target.value);
      bgOpacityValue.textContent = `${Math.round(savedOptions.opacity * 100)}%`;
      applyBgOptions(savedOptions);
      lsSet(LS.BG_OPTIONS, savedOptions);
    });

    bgSaturation.addEventListener('input', e => {
      savedOptions.saturation = parseFloat(e.target.value);
      bgSaturationValue.textContent = `${Math.round(savedOptions.saturation * 100)}%`;
      applyBgOptions(savedOptions);
      lsSet(LS.BG_OPTIONS, savedOptions);
    });
  }

  function init() {
    const savedTheme = lsGet(LS.BG_THEME, null);
    const saved = lsGet(LS.BG, null);
    if (saved) applyBg(saved, 'Saved wallpaper restored', savedTheme);

    const savedOptions = lsGet(LS.BG_OPTIONS, {
      displayMode: 'cover',
      size: 100,
      positionX: 50,
      positionY: 50,
      blur: 1,
      opacity: 1,
      saturation: 1,
    });
    applyBgOptions(savedOptions);

    $('#fetch-anime-btn').addEventListener('click', fetchAnimeBackground);
    $('#bg-upload').addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      e.target.value = '';
    });
    $('#clear-bg-btn').addEventListener('click', clearBg);
    initBgControls(savedOptions);
  }

  return { init };
})();

/* ================================================================
   Settings Panel
   ================================================================ */

const SettingsPanel = (() => {
  function open() {
    $('#settings-panel').classList.add('open');
    $('#settings-overlay').classList.add('open');
  }

  function close() {
    $('#settings-panel').classList.remove('open');
    $('#settings-overlay').classList.remove('open');
  }

  function init() {
    $('#settings-btn').addEventListener('click', open);
    $('#settings-close').addEventListener('click', close);
    $('#settings-overlay').addEventListener('click', close);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });

    initPresetThemes();
    initColorPickers();
    initCursorEffectsToggle();
    initWidgetToggles();
  }

  function initPresetThemes() {
    const presetBtns = $('.theme-preset');
    const primaryPicker = $('#primary-color-picker');
    const accentPicker = $('#accent-color-picker');

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const primary = btn.dataset.primary;
        const accent = btn.dataset.accent;
        primaryPicker.value = primary;
        accentPicker.value = accent;
        applyCustomColors(primary, accent);
      });
    });
  }

  function initColorPickers() {
    const primaryPicker = $('#primary-color-picker');
    const accentPicker = $('#accent-color-picker');
    const resetBtn = $('#reset-colors-btn');

    primaryPicker.addEventListener('input', e => {
      applyCustomColors(e.target.value, accentPicker.value);
    });

    accentPicker.addEventListener('input', e => {
      applyCustomColors(primaryPicker.value, e.target.value);
    });

    resetBtn.addEventListener('click', () => {
      ThemePalette.clearManual();
    });
  }

  function applyCustomColors(primary, accent) {
    ThemePalette.setManual(primary, accent);
  }

  function initCursorEffectsToggle() {
    const toggle = $('#cursor-effects-toggle');
    const isEnabled = lsGet(LS.CURSOR_EFFECTS, true) && window.matchMedia('(pointer: fine)').matches;
    toggle.checked = isEnabled;

    toggle.addEventListener('change', e => {
      toggle.checked = CursorEffects.toggle(e.target.checked);
    });
  }

  function initWidgetToggles() {
    const widgetTypes = ['clock', 'weather', 'todo', 'notes'];
    const savedVisibility = lsGet(LS.WIDGET_VISIBILITY, {
      clock: true,
      weather: true,
      todo: true,
      notes: true,
    });

    widgetTypes.forEach(type => {
      const toggle = $(`#widget-${type}-toggle`);
      const widget = $(`#${type}-widget-compact`);
      if (!toggle || !widget) return;

      toggle.checked = savedVisibility[type];
      widget.classList.toggle('hidden', !savedVisibility[type]);

      toggle.addEventListener('change', e => {
        savedVisibility[type] = e.target.checked;
        lsSet(LS.WIDGET_VISIBILITY, savedVisibility);
        widget.classList.toggle('hidden', !e.target.checked);
      });
    });
  }

  return { init };
})();

/* ================================================================
   Boot
   ================================================================ */

// Clock Modal
const ClockModal = (() => {
  function open() {
    $('#clock-modal-overlay').classList.add('open');
  }

  function close() {
    $('#clock-modal-overlay').classList.remove('open');
  }

  function init() {
    const overlay = $('#clock-modal-overlay');
    const closeBtn = $('#clock-modal-close');

    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    if (overlay) {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
      });
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
        close();
      }
    });
  }

  return { init, open, close };
})();

// Weather Modal
const WeatherModal = (() => {
  function open() {
    $('#weather-modal-overlay').classList.add('open');
  }

  function close() {
    $('#weather-modal-overlay').classList.remove('open');
  }

  function init() {
    const overlay = $('#weather-modal-overlay');
    const closeBtn = $('#weather-modal-close');

    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    if (overlay) {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
      });
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
        close();
      }
    });
  }

  return { init, open, close };
})();

// Todo Modal
const TodoModal = (() => {
  function open() {
    $('#todo-modal-overlay').classList.add('open');
    const input = $('#todo-input');
    if (input) setTimeout(() => input.focus(), 100);
  }

  function close() {
    $('#todo-modal-overlay').classList.remove('open');
  }

  function init() {
    const compactWidget = $('#todo-widget-compact');
    const modalClose = $('#todo-modal-close');
    const overlay = $('#todo-modal-overlay');

    if (compactWidget) {
      compactWidget.addEventListener('click', open);
    }
    if (modalClose) {
      modalClose.addEventListener('click', close);
    }
    if (overlay) {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
      });
    }

    // ESC key to close
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
        close();
      }
    });
  }

  return { init, open, close };
})();

// Notes Modal
const NotesModal = (() => {
  function open() {
    $('#notes-modal-overlay').classList.add('open');
    const area = $('#notes-area');
    if (area) setTimeout(() => area.focus(), 100);
  }

  function close() {
    $('#notes-modal-overlay').classList.remove('open');
  }

  function init() {
    const compactWidget = $('#notes-widget-compact');
    const modalClose = $('#notes-modal-close');
    const overlay = $('#notes-modal-overlay');

    if (compactWidget) {
      compactWidget.addEventListener('click', open);
    }
    if (modalClose) {
      modalClose.addEventListener('click', close);
    }
    if (overlay) {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
      });
    }

    // ESC key to close (but not when typing in notes)
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
        const area = $('#notes-area');
        if (area && document.activeElement === area) {
          area.blur();
        } else {
          close();
        }
      }
    });
  }

  return { init, open, close };
})();

/* ================================================================
   Boot
   ================================================================ */

// Mouse Cursor Effects
const CursorEffects = (() => {
  let cursorDot = null;
  let isEnabled = true;
  let listenersBound = false;

  function supportsFinePointer() {
    return window.matchMedia('(pointer: fine)').matches;
  }

  function ensureCursorDot() {
    if (cursorDot) return;
    cursorDot = el('div', 'cursor-dot');
    document.body.appendChild(cursorDot);
  }

  function handleMouseMove(e) {
    if (!cursorDot || !isEnabled) return;
    cursorDot.style.left = e.clientX - 8 + 'px';
    cursorDot.style.top = e.clientY - 8 + 'px';
    cursorDot.classList.add('active');
  }

  function handleMouseLeave() {
    if (cursorDot) cursorDot.classList.remove('active');
  }

  function handleClick(e) {
    if (!isEnabled) return;
    createClickParticles(e.clientX, e.clientY);
  }

  function bindListeners() {
    if (listenersBound) return;
    listenersBound = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('click', handleClick);
  }

  function syncState() {
    document.body.classList.toggle('cursor-effects-enabled', isEnabled);

    if (!isEnabled) {
      if (cursorDot) {
        cursorDot.remove();
        cursorDot = null;
      }
      return;
    }

    ensureCursorDot();
  }

  function init() {
    bindListeners();
    isEnabled = lsGet(LS.CURSOR_EFFECTS, true) && supportsFinePointer();
    syncState();
  }

  function createClickParticles(x, y) {
    const particleCount = 12;
    const angleStep = (Math.PI * 2) / particleCount;

    for (let i = 0; i < particleCount; i++) {
      const particle = el('div', 'click-particle');
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';

      const angle = angleStep * i;
      const distance = 40 + Math.random() * 30;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }
  }

  function toggle(nextState) {
    isEnabled = typeof nextState === 'boolean' ? nextState && supportsFinePointer() : !isEnabled;
    lsSet(LS.CURSOR_EFFECTS, isEnabled);
    syncState();
    return isEnabled;
  }

  return { init, toggle };
})();

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  ThemePalette.init();
  Clock.init();
  Weather.init();
  Search.init();
  Shortcuts.render();
  ShortcutModal.init();
  Todo.init();
  Notes.init();
  ClockModal.init();
  WeatherModal.init();
  TodoModal.init();
  NotesModal.init();
  Recent.init();
  Bookmarks.init();
  BookmarkModal.init();
  Background.init();
  SettingsPanel.init();
  CursorEffects.init();

  // Add click listeners to open widget modals
  const clockWidget = $('#clock-widget-compact');
  if (clockWidget) {
    clockWidget.addEventListener('click', () => ClockModal.open());
  }

  const weatherWidget = $('#weather-widget-compact');
  if (weatherWidget) {
    weatherWidget.addEventListener('click', () => WeatherModal.open());
  }
});