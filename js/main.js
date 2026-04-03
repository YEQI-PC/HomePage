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
  CLIPBOARD_HISTORY: 'hp_clipboard_history',
  CLIPBOARD_DRAFT: 'hp_clipboard_draft',
  WEATHER_SETTINGS: 'hp_weather_settings',
  RECENT:     'hp_recent',
  BOOKMARKS:  'hp_bookmarks',
  BG:         'hp_bg',
  BG_OPTIONS: 'hp_bg_options',
  BG_THEME:   'hp_bg_theme',
  ENGINE:     'hp_engine',
  CUSTOM_COLORS: 'hp_custom_colors',
  CURSOR_EFFECTS: 'hp_cursor_effects',
  WIDGET_VISIBILITY: 'hp_widget_visibility',
  WIDGETS_COLLAPSED: 'hp_widgets_collapsed',
};

const ENGINES = {
  google: { label: 'Google',     icon: 'G', url: 'https://www.google.com/search?q=' },
  baidu:  { label: 'Baidu',      icon: 'B', url: 'https://www.baidu.com/s?wd=' },
  bing:   { label: 'Bing',       icon: 'B', url: 'https://www.bing.com/search?q=' },
  ddg:    { label: 'DuckDuckGo', icon: 'D', url: 'https://duckduckgo.com/?q=' },
};

const DEFAULT_SHORTCUTS = [
  { id: 's1',  group: 'Daily',  name: 'Google',           url: 'https://www.google.com/',            icon: 'GO',  desc: 'Search engine' },
  { id: 's2',  group: 'Daily',  name: 'GitHub',           url: 'https://github.com/',                icon: 'GH',  desc: 'Code hosting' },
  { id: 's3',  group: 'Daily',  name: 'Bilibili',         url: 'https://www.bilibili.com/',          icon: 'BI',  desc: 'Anime and video' },
  { id: 's4',  group: 'Daily',  name: 'YouTube',          url: 'https://www.youtube.com/',           icon: 'YT',  desc: 'Video platform' },
  { id: 's5',  group: 'Daily',  name: 'Zhihu',            url: 'https://www.zhihu.com/',             icon: 'ZH',  desc: 'Chinese community' },
  { id: 's6',  group: 'Daily',  name: 'Twitter/X',        url: 'https://x.com/',                     icon: 'X',   desc: 'Social feed' },
  { id: 's7',  group: 'AI',     name: 'ChatGPT',          url: 'https://chatgpt.com/',               icon: 'GPT', desc: 'AI chat workspace' },
  { id: 's8',  group: 'AI',     name: 'Gemini',           url: 'https://gemini.google.com/',         icon: 'GM',  desc: 'Google AI assistant' },
  { id: 's9',  group: 'AI',     name: 'Claude',           url: 'https://claude.ai/',                 icon: 'CL',  desc: 'Anthropic assistant' },
  { id: 's10', group: 'AI',     name: 'Perplexity',       url: 'https://www.perplexity.ai/',         icon: 'PX',  desc: 'AI answer engine' },
  { id: 's11', group: 'AI',     name: 'DeepSeek',         url: 'https://chat.deepseek.com/',         icon: 'DS',  desc: 'Deep reasoning assistant' },
  { id: 's12', group: 'AI',     name: 'Grok',             url: 'https://grok.com/',                  icon: 'GK',  desc: 'X AI workspace' },
  { id: 's13', group: 'AI',     name: 'OpenAI',           url: 'https://openai.com/',                icon: 'OAI', desc: 'AI assistant' },
  { id: 's14', group: 'Tools',  name: 'Notion',           url: 'https://www.notion.so/',             icon: 'NO',  desc: 'Notes and docs' },
  { id: 's15', group: 'Tools',  name: 'Figma',            url: 'https://www.figma.com/',             icon: 'FG',  desc: 'Design tool' },
  { id: 's16', group: 'Tools',  name: 'VS Code',          url: 'https://vscode.dev/',                icon: 'VS',  desc: 'Online editor' },
  { id: 's17', group: 'Tools',  name: 'Excalidraw',       url: 'https://excalidraw.com/',            icon: 'EX',  desc: 'Diagram whiteboard' },
  { id: 's18', group: 'Tools',  name: 'Vercel',           url: 'https://vercel.com/',                icon: 'VC',  desc: 'Deploy platform' },
  { id: 's19', group: 'Tools',  name: 'Netlify',          url: 'https://app.netlify.com/',           icon: 'NF',  desc: 'Hosting dashboard' },
  { id: 's20', group: 'Learn',  name: 'MDN',              url: 'https://developer.mozilla.org/',     icon: 'MD',  desc: 'Web docs' },
  { id: 's21', group: 'Learn',  name: 'arXiv',            url: 'https://arxiv.org/',                 icon: 'AX',  desc: 'Research papers' },
  { id: 's22', group: 'Learn',  name: 'Papers with Code', url: 'https://paperswithcode.com/',        icon: 'PWC', desc: 'Paper benchmarks' },
  { id: 's23', group: 'Learn',  name: 'Stack Overflow',   url: 'https://stackoverflow.com/',         icon: 'SO',  desc: 'Developer Q&A' },
  { id: 's24', group: 'Learn',  name: 'LeetCode',         url: 'https://leetcode.com/',              icon: 'LC',  desc: 'Algorithms' },
  { id: 's25', group: 'Learn',  name: 'Wikipedia',        url: 'https://www.wikipedia.org/',         icon: 'WK',  desc: 'Reference' },
  { id: 's26', group: 'Campus', name: 'Graduate',         url: 'https://gsmis.buaa.edu.cn/',         icon: 'GR',  desc: 'Graduate system' },
  { id: 's27', group: 'Campus', name: 'Mail',             url: 'https://mail.buaa.edu.cn/',          icon: 'ML',  desc: 'Campus mail' },
  { id: 's28', group: 'Campus', name: 'Academic',         url: 'https://jiaowu.buaa.edu.cn/',        icon: 'AC',  desc: 'Academic portal' },
  { id: 's29', group: 'Campus', name: 'Library',          url: 'https://lib.buaa.edu.cn/',           icon: 'LB',  desc: 'Library portal' },
  { id: 's30', group: 'Campus', name: 'VPN',              url: 'https://e.buaa.edu.cn/',             icon: 'VPN', desc: 'Campus VPN' },
];

const WEATHER_CODE_MAP = {
  '113': '☀',
  '116': '⛅',
  '119': '☁',
  '122': '☁',
  '143': '🌫',
  '176': '🌦',
  '179': '🌨',
  '182': '🌧',
  '185': '🌧',
  '200': '⛈',
  '227': '🌨',
  '230': '🌨',
  '248': '🌫',
  '260': '🌫',
  '263': '🌦',
  '266': '🌧',
  '281': '🌧',
  '284': '🌧',
  '293': '🌦',
  '296': '🌧',
  '299': '🌧',
  '302': '🌧',
  '305': '⛈',
  '308': '⛈',
  '311': '🌧',
  '314': '🌧',
  '317': '🌨',
  '320': '🌨',
  '323': '🌨',
  '326': '🌨',
  '329': '🌨',
  '332': '🌨',
  '335': '🌨',
  '338': '🌨',
  '350': '🌧',
  '353': '🌦',
  '356': '⛈',
  '359': '⛈',
  '362': '🌨',
  '365': '🌨',
  '368': '🌨',
  '371': '🌨',
  '374': '🌨',
  '377': '🌧',
  '386': '⛈',
  '389': '⛈',
  '392': '🌨',
  '395': '🌨',
};

const SHORTCUT_GROUP_LABELS = {
  Daily: '常用',
  Tools: '工具',
  Learn: '学习',
  Campus: 'Beihang 北航',
};

const SHORTCUT_DESCRIPTION_LABELS = {
  'Search engine': '搜索引擎',
  'Code hosting': '代码托管',
  'Video platform': '视频平台',
  'Anime and video': '动漫与视频',
  'Social feed': '社交动态',
  'AI assistant': 'AI 助手',
  'Notes and docs': '笔记与文档',
  'Design tool': '设计工具',
  'Online editor': '在线编辑器',
  'Web docs': 'Web 文档',
  'Developer Q&A': '开发者问答',
  'Algorithms': '算法练习',
  'Reference': '百科参考',
  'Graduate system': '研究生系统',
  'Campus mail': '校园邮箱',
  'Academic portal': '教务入口',
  'Library portal': '图书馆入口',
  'Campus VPN': '校园 VPN',
};

SHORTCUT_GROUP_LABELS.AI = 'AI 组';
Object.assign(SHORTCUT_DESCRIPTION_LABELS, {
  'Chinese community': '中文社区',
  'AI chat workspace': 'AI 对话工作区',
  'Google AI assistant': 'Google AI 助手',
  'Anthropic assistant': 'Anthropic 助手',
  'AI answer engine': 'AI 答案引擎',
  'Deep reasoning assistant': '深度推理助手',
  'X AI workspace': 'X AI 工作区',
  'Diagram whiteboard': '图解白板',
  'Deploy platform': '部署平台',
  'Hosting dashboard': '托管面板',
  'Research papers': '研究论文',
  'Paper benchmarks': '论文与基准',
});

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
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
}

function sanitizeURL(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.href;
  } catch { return null; }
}

function clampNumber(value, min, max, fallback = min) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function setMeterWidth(id, value, max = 100) {
  const node = $(`#${id}`);
  if (!node) return;
  const safeMax = Math.max(max, 1);
  const percent = clampNumber((Number(value) / safeMax) * 100, 0, 100, 0);
  node.style.width = `${percent}%`;
}

function localizeShortcutGroup(name) {
  return SHORTCUT_GROUP_LABELS[name] || name;
}

function localizeShortcutDescription(desc) {
  return SHORTCUT_DESCRIPTION_LABELS[desc] || desc;
}

const ServerState = (() => {
  const DEFAULT_PREFERENCES = {
    theme: 'light',
    engine: 'google',
    cursorEffects: true,
    widgetVisibility: {
      clock: true,
      weather: true,
      clipboard: true,
    },
    customColors: null,
  };

  const DEFAULTS = {
    shortcuts: DEFAULT_SHORTCUTS,
    recent: [],
    bookmarks: [],
    weatherSettings: { location: '' },
    preferences: DEFAULT_PREFERENCES,
  };

  let cache = clone(DEFAULTS);
  let ready = false;
  let initialized = false;
  let pendingPatch = null;
  let pendingSilent = true;
  let persistTimer = null;
  let persistInFlight = false;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function supportsServerState() {
    return location.protocol !== 'file:' && typeof fetch === 'function';
  }

  async function requestJson(url, options = {}) {
    const { timeoutMs = 4500, ...rest } = options;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const init = {
      ...rest,
      headers: { Accept: 'application/json', ...(rest.headers || {}) },
    };
    let timeoutId = null;

    if (init.body && !init.headers['Content-Type']) {
      init.headers['Content-Type'] = 'application/json';
    }

    if (controller && timeoutMs > 0) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      init.signal = controller.signal;
    }

    try {
      const response = await fetch(url, init);
      const raw = await response.text();
      let data = {};

      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
      }

      if (!response.ok) {
        const err = new Error(data?.message || `Request failed with status ${response.status}`);
        err.status = response.status;
        err.payload = data;
        throw err;
      }

      return data;
    } catch (err) {
      if (err?.name === 'AbortError') {
        const timeoutErr = new Error('Request timed out');
        timeoutErr.status = 408;
        throw timeoutErr;
      }
      throw err;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  function normalizeShortcuts(list, fallback = DEFAULTS.shortcuts) {
    const source = Array.isArray(list) ? list : fallback;
    return source
      .map(item => ({
        id: typeof item?.id === 'string' ? item.id : uid(),
        group: String(item?.group || '其他').trim() || '其他',
        name: String(item?.name || '').trim(),
        url: sanitizeURL(String(item?.url || '').trim()),
        icon: String(item?.icon || 'GO').trim() || 'GO',
        desc: String(item?.desc || '').trim(),
      }))
      .filter(item => item.name && item.url);
  }

  function normalizeRecent(list) {
    const source = Array.isArray(list) ? list : [];
    const deduped = [];
    const seen = new Set();

    source
      .map(item => ({
        name: String(item?.name || '').trim(),
        url: sanitizeURL(String(item?.url || '').trim()),
        icon: String(item?.icon || '').trim(),
        ts: clampNumber(item?.ts, 0, Number.MAX_SAFE_INTEGER, Date.now()),
      }))
      .filter(item => item.name && item.url)
      .sort((a, b) => b.ts - a.ts)
      .forEach(item => {
        if (seen.has(item.url)) return;
        seen.add(item.url);
        deduped.push(item);
      });

    return deduped.slice(0, 12);
  }

  function normalizeBookmarks(list) {
    const source = Array.isArray(list) ? list : [];
    const deduped = [];
    const seen = new Set();

    source
      .map(item => ({
        id: typeof item?.id === 'string' ? item.id : uid(),
        name: String(item?.name || '').trim(),
        url: sanitizeURL(String(item?.url || '').trim()),
        icon: String(item?.icon || '').trim(),
      }))
      .filter(item => item.name && item.url)
      .forEach(item => {
        if (seen.has(item.url)) return;
        seen.add(item.url);
        deduped.push(item);
      });

    return deduped;
  }

  function normalizeWeatherSettings(settings) {
    return {
      location: typeof settings?.location === 'string' ? settings.location.trim() : '',
    };
  }

  function normalizeTheme(theme, fallback = DEFAULT_PREFERENCES.theme) {
    return theme === 'dark' || theme === 'light' ? theme : fallback;
  }

  function normalizeEngine(key, fallback = DEFAULT_PREFERENCES.engine) {
    return ENGINES[key] ? key : fallback;
  }

  function normalizeHexColor(value) {
    const raw = String(value || '').trim();
    const match = raw.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return '';
    const hex = match[1].toLowerCase();
    return `#${hex.length === 3 ? hex.split('').map(ch => ch + ch).join('') : hex}`;
  }

  function normalizeCustomColors(colors) {
    if (colors === null) return null;
    if (!colors || typeof colors !== 'object') return null;
    const primary = normalizeHexColor(colors.primary);
    const accent = normalizeHexColor(colors.accent);
    if (!primary || !accent) return null;
    return { primary, accent };
  }

  function normalizeWidgetVisibility(value, fallback = DEFAULT_PREFERENCES.widgetVisibility) {
    const base = clone(fallback);
    const source = value && typeof value === 'object' ? value : {};

    ['clock', 'weather', 'clipboard'].forEach(key => {
      if (typeof source[key] === 'boolean') {
        base[key] = source[key];
      }
    });

    if (typeof source.clipboard !== 'boolean' && typeof source.notes === 'boolean') {
      base.clipboard = source.notes;
    }

    return base;
  }

  function normalizePreferences(preferences, fallback = DEFAULT_PREFERENCES) {
    const base = clone(fallback);
    const source = preferences && typeof preferences === 'object' ? preferences : {};

    return {
      theme: normalizeTheme(source.theme, base.theme),
      engine: normalizeEngine(source.engine, base.engine),
      cursorEffects: typeof source.cursorEffects === 'boolean' ? source.cursorEffects : base.cursorEffects,
      widgetVisibility: normalizeWidgetVisibility(source.widgetVisibility, base.widgetVisibility),
      customColors: Object.prototype.hasOwnProperty.call(source, 'customColors')
        ? normalizeCustomColors(source.customColors)
        : clone(base.customColors),
    };
  }

  function applyLocalMirror() {
    lsSet(LS.SHORTCUTS, cache.shortcuts);
    lsSet(LS.RECENT, cache.recent);
    lsSet(LS.BOOKMARKS, cache.bookmarks);
    lsSet(LS.WEATHER_SETTINGS, cache.weatherSettings);
    lsSet(LS.THEME, cache.preferences.theme);
    lsSet(LS.ENGINE, cache.preferences.engine);
    lsSet(LS.CURSOR_EFFECTS, cache.preferences.cursorEffects);
    lsSet(LS.WIDGET_VISIBILITY, cache.preferences.widgetVisibility);
    lsSet(LS.CUSTOM_COLORS, cache.preferences.customColors);
  }

  function hydrate(remote = {}, allowMigration = true) {
    const localShortcuts = normalizeShortcuts(lsGet(LS.SHORTCUTS, DEFAULT_SHORTCUTS));
    const localRecent = normalizeRecent(lsGet(LS.RECENT, []));
    const localBookmarks = normalizeBookmarks(lsGet(LS.BOOKMARKS, []));
    const localWeather = normalizeWeatherSettings(lsGet(LS.WEATHER_SETTINGS, { location: '' }));
    const localPreferences = normalizePreferences({
      theme: lsGet(LS.THEME, DEFAULT_PREFERENCES.theme),
      engine: lsGet(LS.ENGINE, DEFAULT_PREFERENCES.engine),
      cursorEffects: lsGet(LS.CURSOR_EFFECTS, DEFAULT_PREFERENCES.cursorEffects),
      widgetVisibility: lsGet(LS.WIDGET_VISIBILITY, DEFAULT_PREFERENCES.widgetVisibility),
      customColors: lsGet(LS.CUSTOM_COLORS, DEFAULT_PREFERENCES.customColors),
    });

    const migration = {};

    cache.shortcuts = Array.isArray(remote.shortcuts)
      ? normalizeShortcuts(remote.shortcuts)
      : localShortcuts;
    cache.recent = Array.isArray(remote.recent)
      ? normalizeRecent(remote.recent)
      : localRecent;
    cache.bookmarks = Array.isArray(remote.bookmarks)
      ? normalizeBookmarks(remote.bookmarks)
      : localBookmarks;
    cache.weatherSettings = remote.weatherSettings
      ? normalizeWeatherSettings(remote.weatherSettings)
      : localWeather;
    cache.preferences = remote.preferences
      ? normalizePreferences(remote.preferences, DEFAULT_PREFERENCES)
      : localPreferences;

    if (allowMigration) {
      if (!Array.isArray(remote.shortcuts)) migration.shortcuts = cache.shortcuts;
      if (!Array.isArray(remote.recent)) migration.recent = cache.recent;
      if (!Array.isArray(remote.bookmarks)) migration.bookmarks = cache.bookmarks;
      if (!remote.weatherSettings) migration.weatherSettings = cache.weatherSettings;
      if (!remote.preferences) migration.preferences = cache.preferences;
    }

    applyLocalMirror();
    return migration;
  }

  async function persist(partial, { silent = false } = {}) {
    if (!supportsServerState()) return false;
    try {
      const response = await requestJson('/api/state', {
        method: 'PUT',
        body: JSON.stringify(partial),
        timeoutMs: 5000,
      });
      ready = true;
      hydrate(response.state || {}, false);
      return true;
    } catch (err) {
      if (!silent) console.warn('Server state persist failed:', err);
      return false;
    }
  }

  function mergePersistPatch(target, partial) {
    Object.entries(partial || {}).forEach(([key, value]) => {
      if (key === 'preferences' && value && typeof value === 'object' && !Array.isArray(value)) {
        target.preferences = {
          ...(target.preferences || {}),
          ...clone(value),
        };
        return;
      }

      target[key] = clone(value);
    });

    return target;
  }

  async function flushPendingPersist() {
    if (persistInFlight || !pendingPatch) return false;

    persistInFlight = true;
    const patch = pendingPatch;
    const silent = pendingSilent;
    pendingPatch = null;
    pendingSilent = true;

    try {
      return await persist(patch, { silent });
    } finally {
      persistInFlight = false;
      if (pendingPatch) {
        if (persistTimer) clearTimeout(persistTimer);
        persistTimer = setTimeout(() => {
          persistTimer = null;
          void flushPendingPersist();
        }, 120);
      }
    }
  }

  function schedulePersist(partial, { silent = false, immediate = false, delay = 320 } = {}) {
    if (!supportsServerState()) return;

    pendingPatch = mergePersistPatch(pendingPatch || {}, partial);
    pendingSilent = pendingSilent && silent;

    if (persistTimer) {
      clearTimeout(persistTimer);
      persistTimer = null;
    }

    if (immediate) {
      void flushPendingPersist();
      return;
    }

    persistTimer = setTimeout(() => {
      persistTimer = null;
      void flushPendingPersist();
    }, delay);
  }

  async function init() {
    if (initialized) return clone(cache);
    initialized = true;
    hydrate({}, false);

    if (!supportsServerState()) return clone(cache);

    try {
      const response = await requestJson('/api/state', { cache: 'no-store', timeoutMs: 3500 });
      ready = true;
      const migration = hydrate(response.state || {}, true);
      if (Object.keys(migration).length) {
        schedulePersist(migration, { silent: true, immediate: true });
      }
    } catch (err) {
      ready = false;
      console.warn('Server state init failed:', err);
    }

    return clone(cache);
  }

  function getShortcuts() {
    return clone(cache.shortcuts);
  }

  function setShortcuts(list) {
    cache.shortcuts = normalizeShortcuts(list);
    applyLocalMirror();
    schedulePersist({ shortcuts: cache.shortcuts }, { immediate: true });
    return getShortcuts();
  }

  function getRecent() {
    return clone(cache.recent);
  }

  function setRecent(list) {
    cache.recent = normalizeRecent(list);
    applyLocalMirror();
    schedulePersist({ recent: cache.recent }, { silent: true, delay: 450 });
    return getRecent();
  }

  function getBookmarks() {
    return clone(cache.bookmarks);
  }

  function setBookmarks(list) {
    cache.bookmarks = normalizeBookmarks(list);
    applyLocalMirror();
    schedulePersist({ bookmarks: cache.bookmarks }, { immediate: true });
    return getBookmarks();
  }

  function getWeatherSettings() {
    return clone(cache.weatherSettings);
  }

  function setWeatherSettings(settings) {
    cache.weatherSettings = normalizeWeatherSettings(settings);
    applyLocalMirror();
    schedulePersist({ weatherSettings: cache.weatherSettings }, { immediate: true });
    return getWeatherSettings();
  }

  function getTheme() {
    return cache.preferences.theme;
  }

  function setTheme(theme) {
    cache.preferences.theme = normalizeTheme(theme);
    applyLocalMirror();
    schedulePersist({ preferences: { theme: cache.preferences.theme } }, { silent: true, delay: 220 });
    return getTheme();
  }

  function getEngine() {
    return cache.preferences.engine;
  }

  function setEngine(engine) {
    cache.preferences.engine = normalizeEngine(engine);
    applyLocalMirror();
    schedulePersist({ preferences: { engine: cache.preferences.engine } }, { silent: true, delay: 220 });
    return getEngine();
  }

  function getCursorEffects() {
    return cache.preferences.cursorEffects;
  }

  function setCursorEffects(value) {
    cache.preferences.cursorEffects = typeof value === 'boolean' ? value : DEFAULT_PREFERENCES.cursorEffects;
    applyLocalMirror();
    schedulePersist({ preferences: { cursorEffects: cache.preferences.cursorEffects } }, { silent: true, delay: 220 });
    return getCursorEffects();
  }

  function getWidgetVisibility() {
    return clone(cache.preferences.widgetVisibility);
  }

  function setWidgetVisibility(value) {
    cache.preferences.widgetVisibility = normalizeWidgetVisibility(value, cache.preferences.widgetVisibility);
    applyLocalMirror();
    schedulePersist({ preferences: { widgetVisibility: cache.preferences.widgetVisibility } }, { silent: true, delay: 220 });
    return getWidgetVisibility();
  }

  function getCustomColors() {
    return clone(cache.preferences.customColors);
  }

  function setCustomColors(colors) {
    cache.preferences.customColors = colors === null ? null : normalizeCustomColors(colors);
    applyLocalMirror();
    schedulePersist({ preferences: { customColors: cache.preferences.customColors } }, { silent: true, delay: 220 });
    return getCustomColors();
  }

  return {
    init,
    isReady: () => ready,
    getShortcuts,
    setShortcuts,
    getRecent,
    setRecent,
    getBookmarks,
    setBookmarks,
    getWeatherSettings,
    setWeatherSettings,
    getTheme,
    setTheme,
    getEngine,
    setEngine,
    getCursorEffects,
    setCursorEffects,
    getWidgetVisibility,
    setWidgetVisibility,
    getCustomColors,
    setCustomColors,
  };
})();

/* ================================================================
   Theme
   ================================================================ */

const Theme = (() => {
  const HTML = document.documentElement;

  function get() {
    return ServerState.getTheme();
  }

  function apply(t, persist = true) {
    const next = t === 'dark' ? 'dark' : 'light';
    HTML.setAttribute('data-theme', next);
    if (persist) {
      ServerState.setTheme(next);
    } else {
      lsSet(LS.THEME, next);
    }
    if (typeof ThemePalette !== 'undefined') {
      ThemePalette.applyCurrent();
    }
  }

  function toggle() {
    apply(get() === 'light' ? 'dark' : 'light', true);
  }

  function init() {
    apply(get(), false);
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
    return document.documentElement.getAttribute('data-theme') || ServerState.getTheme();
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
      manual: ServerState.getCustomColors(),
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
        ? '手动'
        : activeState.source === 'background'
          ? '壁纸'
          : '默认';
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
    ServerState.setCustomColors(normalized);
    return applyCurrent();
  }

  function clearManual() {
    ServerState.setCustomColors(null);
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
  const DAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  function pad(n) { return String(n).padStart(2, '0'); }

  function getWeekNumber(date) {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  }

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
    const dateStr = `${y}年${m}月${d}日 ${DAYS[now.getDay()]}`;
    dateEl.textContent = dateStr;
    if (dateLargeEl) dateLargeEl.textContent = dateStr;
  }

  function init() {
    tick();
    setInterval(tick, 1000);
  }

  return { init, MONTHS, getWeekNumber };
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

  function setEngine(key, persist = true) {
    const eng = ENGINES[key];
    if (!eng) return;
    currentEngine = key;
    if (persist) {
      ServerState.setEngine(key);
    } else {
      lsSet(LS.ENGINE, key);
    }
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
    setEngine(ServerState.getEngine(), false);

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
    return ServerState.getShortcuts();
  }

  function save(list) {
    ServerState.setShortcuts(list);
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
    const sectionFragment = document.createDocumentFragment();

    groups.forEach((items, groupName) => {
      const wrap = el('div', 'shortcut-group');
      const shell = el('div', 'shortcut-group-shell');
      const titleRow = el('div', 'shortcut-group-title');
      const title = el('h2');
      const divider = el('div', 'group-divider');
      const grid = el('div', 'shortcut-grid');
      const gridFragment = document.createDocumentFragment();
      title.textContent = localizeShortcutGroup(groupName);
      titleRow.append(title, divider);
      grid.dataset.group = groupName;

      items.forEach(item => {
        const card = el('a', 'shortcut-card');
        const icon = el('span', 'shortcut-icon');
        const name = el('span', 'shortcut-name');
        card.href   = item.url;
        card.target = '_blank';
        card.rel    = 'noopener noreferrer';
        card.title  = localizeShortcutDescription(item.desc || item.name);
        card.dataset.id = item.id;
        card.draggable = true;
        icon.textContent = item.icon || 'GO';
        name.textContent = item.name;
        card.append(icon, name);
        if (item.desc) {
          const desc = el('span', 'shortcut-desc');
          desc.textContent = localizeShortcutDescription(item.desc);
          card.appendChild(desc);
        }
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
        gridFragment.appendChild(card);
      });

      grid.appendChild(gridFragment);
      shell.append(titleRow, grid);
      wrap.appendChild(shell);
      sectionFragment.appendChild(wrap);
    });

    section.appendChild(sectionFragment);

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
          <div class="sm-group">${localizeShortcutGroup(item.group)}</div>
        </div>
        <div class="sm-actions">
          <button class="sm-btn edit" title="编辑">✎</button>
          <button class="sm-btn del" title="删除">×</button>
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
      if (!url) { alert('请输入有效的链接地址'); return; }

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

  function load() { return ServerState.getRecent(); }
  function save(list) { ServerState.setRecent(list); }

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
    const fragment = document.createDocumentFragment();
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
      fragment.appendChild(a);
    });
    container.appendChild(fragment);
  }

  function clear() {
    save([]);
    render();
  }

  function init() {
    render();
    $('#clear-recent-btn').addEventListener('click', () => {
      if (confirm('确认清空全部最近访问记录吗？')) clear();
    });
  }

  return { init, record, render };
})();

/* ================================================================
   Bookmarks
   ================================================================ */

const Bookmarks = (() => {
  function load() { return ServerState.getBookmarks(); }
  function save(list) { ServerState.setBookmarks(list); }

  function render() {
    const grid = $('#bookmarks-grid');
    const list = load();

    if (list.length === 0) {
      grid.innerHTML = '<p class="empty-hint">暂无书签，点击右上角添加</p>';
      return;
    }

    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();
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
      fragment.appendChild(card);
    });
    grid.appendChild(fragment);
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
      if (!url) { alert('请输入有效的链接地址'); return; }

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
  const MAX_BACKGROUND_DIMENSION = 1920;
  const BACKGROUND_EXPORT_QUALITY = 0.82;
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

  function syncBootBackground(dataUrl) {
    const root = document.documentElement;
    if (dataUrl) {
      root.classList.add('has-saved-bg');
      root.style.setProperty('--boot-bg-image', `url("${dataUrl}")`);
      return;
    }

    root.classList.remove('has-saved-bg');
    root.style.removeProperty('--boot-bg-image');
  }

  function loadImageSource(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image decode failed'));
      img.src = source;
    });
  }

  function exportCanvas(canvas) {
    try {
      return canvas.toDataURL('image/webp', BACKGROUND_EXPORT_QUALITY);
    } catch {
      return canvas.toDataURL('image/jpeg', BACKGROUND_EXPORT_QUALITY);
    }
  }

  async function optimizeImageSource(source) {
    const img = await loadImageSource(source);
    const longestEdge = Math.max(img.naturalWidth || 0, img.naturalHeight || 0);
    if (!longestEdge) {
      throw new Error('Image has no intrinsic size');
    }

    const viewportEdge = Math.max(window.innerWidth || 0, window.innerHeight || 0, 1280);
    const targetEdge = Math.min(
      MAX_BACKGROUND_DIMENSION,
      Math.max(1280, Math.round(viewportEdge * Math.max(window.devicePixelRatio || 1, 1)))
    );

    if (longestEdge <= targetEdge && typeof source === 'string' && source.startsWith('data:image/')) {
      return source;
    }

    const scale = Math.min(1, targetEdge / longestEdge);
    const width = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    return exportCanvas(canvas);
  }

  function applyBg(dataUrl, label = '', palette = null) {
    syncBootBackground(dataUrl);
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
    img.decoding = 'async';
    img.onload = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => extractColors(img), { timeout: 600 });
      } else {
        setTimeout(() => extractColors(img), 16);
      }
    };
    img.src = dataUrl;
  }

  function clearBg() {
    syncBootBackground('');
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
    setStatus('正在加载随机壁纸...');
    btn.innerHTML = '<span class="spinning">↻</span> 加载中...';
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
            applyBg(dataUrl, '随机壁纸已更新');
            setStatus('壁纸已更新');
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
          applyBg(dataUrl, '已应用备用壁纸');
          setStatus('已切换到备用壁纸');
          return;
        } catch (err) {
          lastErr = err;
          console.warn(`Failed to fetch fallback from ${fallbackUrl}:`, err.message || err);
        }
      }

      setStatus('暂时无法获取壁纸，请稍后重试或上传本地图片。');
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
      const rawDataUrl = await blobToDataURL(blob);
      return await optimizeImageSource(rawDataUrl);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function handleUpload(file) {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      setStatus('Processing image...');
      const dataUrl = await blobToDataURL(file);
      const optimized = await optimizeImageSource(dataUrl);
      applyBg(optimized, file.name || '本地图片');
    } catch (err) {
      setStatus('Image processing failed, please try another file.');
      console.warn('Background upload failed:', err);
    }
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
    if (saved) applyBg(saved, '已恢复上次壁纸', savedTheme);

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
  function syncWidgetLayout() {
    const bar = $('#widgets-bar');
    const clock = $('#clock-widget-compact');
    const weather = $('#weather-widget-compact');
    const clipboard = $('#clipboard-widget-compact');
    if (!bar || !clock || !weather || !clipboard) return;

    const clockVisible = !clock.classList.contains('hidden');
    const weatherVisible = !weather.classList.contains('hidden');
    const clipboardVisible = !clipboard.classList.contains('hidden');

    bar.classList.toggle('layout-only-clock', clockVisible && !weatherVisible);
    bar.classList.toggle('layout-only-weather', weatherVisible && !clockVisible);
    bar.classList.toggle('layout-no-left', !clockVisible && !weatherVisible);
    bar.classList.toggle('layout-no-clipboard', !clipboardVisible);
    bar.classList.toggle('layout-empty', !clockVisible && !weatherVisible && !clipboardVisible);
  }

  function open() {
    const panel = $('#settings-panel');
    const overlay = $('#settings-overlay');
    if (!panel || !overlay || panel.classList.contains('open')) return;
    panel.classList.add('open');
    overlay.classList.add('open');
    OverlayLock.lock();
  }

  function close() {
    const panel = $('#settings-panel');
    const overlay = $('#settings-overlay');
    if (!panel || !overlay || !panel.classList.contains('open')) return;
    panel.classList.remove('open');
    overlay.classList.remove('open');
    OverlayLock.unlock();
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
    const presetBtns = $$('.theme-preset');
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
    const isEnabled = ServerState.getCursorEffects() && window.matchMedia('(pointer: fine)').matches;
    toggle.checked = isEnabled;

    toggle.addEventListener('change', e => {
      toggle.checked = CursorEffects.toggle(e.target.checked);
    });
  }

  function initWidgetToggles() {
    const widgetTypes = ['clock', 'weather', 'clipboard'];
    const savedVisibility = ServerState.getWidgetVisibility();

    widgetTypes.forEach(type => {
      const toggle = $(`#widget-${type}-toggle`);
      const widget = $(`#${type}-widget-compact`);
      if (!toggle || !widget) return;

      toggle.checked = savedVisibility[type];
      widget.classList.toggle('hidden', !savedVisibility[type]);

      toggle.addEventListener('change', e => {
        savedVisibility[type] = e.target.checked;
        ServerState.setWidgetVisibility(savedVisibility);
        widget.classList.toggle('hidden', !e.target.checked);
        syncWidgetLayout();
      });
    });

    syncWidgetLayout();
  }

  return { init };
})();

const TopWidgetsPanel = (() => {
  const PORTRAIT_MEDIA = '(orientation: portrait) and (max-width: 900px)';
  let hasManualPreference = false;

  function shouldDefaultCollapse() {
    return window.matchMedia(PORTRAIT_MEDIA).matches;
  }

  function apply(collapsed) {
    const panel = $('#widgets-panel');
    const toggle = $('#widgets-panel-toggle');
    const text = $('#widgets-panel-toggle-text');
    if (!panel || !toggle || !text) return;

    panel.classList.toggle('is-collapsed', collapsed);
    toggle.setAttribute('aria-expanded', String(!collapsed));
    text.textContent = collapsed ? '展开卡片' : '收起卡片';
  }

  function setCollapsed(collapsed, persist = true) {
    apply(collapsed);
    if (persist) {
      lsSet(LS.WIDGETS_COLLAPSED, collapsed);
      hasManualPreference = true;
    }
  }

  function init() {
    const toggle = $('#widgets-panel-toggle');
    if (!toggle) return;

    const saved = lsGet(LS.WIDGETS_COLLAPSED, null);
    hasManualPreference = typeof saved === 'boolean';
    apply(hasManualPreference ? saved : shouldDefaultCollapse());

    toggle.addEventListener('click', () => {
      const panel = $('#widgets-panel');
      const next = !panel?.classList.contains('is-collapsed');
      setCollapsed(next);
    });

    const media = window.matchMedia(PORTRAIT_MEDIA);
    const syncAutoState = () => {
      if (!hasManualPreference) apply(shouldDefaultCollapse());
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', syncAutoState);
    } else if (typeof media.addListener === 'function') {
      media.addListener(syncAutoState);
    }
  }

  return { init, setCollapsed };
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
  let frameId = 0;
  let pointerX = 0;
  let pointerY = 0;

  function supportsFinePointer() {
    return window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function ensureCursorDot() {
    if (cursorDot) return;
    cursorDot = el('div', 'cursor-dot');
    document.body.appendChild(cursorDot);
  }

  function flushPointerPosition() {
    frameId = 0;
    if (!cursorDot || !isEnabled) return;
    cursorDot.style.left = `${pointerX}px`;
    cursorDot.style.top = `${pointerY}px`;
    cursorDot.classList.add('active');
  }

  function handleMouseMove(e) {
    if (!cursorDot || !isEnabled) return;
    pointerX = e.clientX - 8;
    pointerY = e.clientY - 8;
    if (!frameId) {
      frameId = window.requestAnimationFrame(flushPointerPosition);
    }
  }

  function handleMouseLeave() {
    if (cursorDot) cursorDot.classList.remove('active');
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  function handleClick(e) {
    if (!isEnabled) return;
    createClickParticles(e.clientX, e.clientY);
  }

  function bindListeners() {
    if (listenersBound) return;
    listenersBound = true;
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('click', handleClick, { passive: true });
  }

  function syncState() {
    document.body.classList.toggle('cursor-effects-enabled', isEnabled);

    if (!isEnabled) {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
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
    isEnabled = ServerState.getCursorEffects() && supportsFinePointer();
    syncState();
  }

  function createClickParticles(x, y) {
    const particleCount = 8;
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
    ServerState.setCursorEffects(isEnabled);
    syncState();
    return isEnabled;
  }

  return { init, toggle };
})();

const OverlayLock = (() => {
  let count = 0;

  function sync() {
    document.body.classList.toggle('overlay-open', count > 0);
  }

  function lock() {
    count += 1;
    sync();
  }

  function unlock() {
    count = Math.max(0, count - 1);
    sync();
  }

  return { lock, unlock };
})();

const WeatherWidget = (() => {
  let latest = null;
  let inflight = null;
  let requestSeq = 0;
  let refreshedAt = 0;
  const AUTO_REFRESH_MS = 30 * 60 * 1000;
  const DAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  function loadSettings() {
    return ServerState.getWeatherSettings();
  }

  function saveSettings(settings) {
    return ServerState.setWeatherSettings(settings);
  }

  function setSettingsStatus(message, isError = false) {
    const node = $('#weather-settings-status');
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('is-error', isError);
  }

  function syncSettingsControls() {
    const input = $('#weather-location-input');
    if (!input) return;
    input.value = loadSettings().location;
  }

  function showLoadingCard() {
    const loadingEl = $('#weather-loading');
    if (!loadingEl) return;
    loadingEl.innerHTML = '<div class="shimmer-line"></div><div class="shimmer-line short"></div>';
    loadingEl.classList.remove('hidden');
  }

  function pickHourlySample(hourly = [], preferredHour = 1200) {
    if (!Array.isArray(hourly) || hourly.length === 0) return null;
    return hourly.reduce((closest, entry) => {
      const current = Math.abs(clampNumber(entry?.time, 0, 2400, preferredHour) - preferredHour);
      const previous = Math.abs(clampNumber(closest?.time, 0, 2400, preferredHour) - preferredHour);
      return current < previous ? entry : closest;
    }, hourly[0]);
  }

  function parseObservedHour(value) {
    const text = String(value || '').trim();
    if (!text) return null;

    const match = text.match(/(\d{1,2}):(\d{2})(?:\s*([AP]M))?/i);
    if (!match) return null;

    let hours = clampNumber(match[1], 0, 23, 0);
    const minutes = clampNumber(match[2], 0, 59, 0);
    const meridiem = match[3]?.toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return (hours * 100) + minutes;
  }

  function getPreferredHour(currentCondition = {}) {
    const observedHour =
      parseObservedHour(currentCondition.localObsDateTime) ??
      parseObservedHour(currentCondition.observation_time);

    if (observedHour !== null) return observedHour;

    const now = new Date();
    return (now.getHours() * 100) + now.getMinutes();
  }

  function getHourlyMetric(entry, key, fallback = null) {
    const value = entry?.[key];
    if (value === undefined || value === null || value === '') return fallback;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function getRepresentativeRainChance(hourly = [], preferredHour = 1200) {
    const sample = pickHourlySample(hourly, preferredHour);
    return clampNumber(getHourlyMetric(sample, 'chanceofrain', 0), 0, 100, 0);
  }

  function getCurrentRainChance(sample, fallback = 0, currentCondition = {}) {
    const hourlyChance = clampNumber(getHourlyMetric(sample, 'chanceofrain', null), 0, 100, null);
    if (hourlyChance !== null) return hourlyChance;

    const precipAmount = getHourlyMetric(currentCondition, 'precipMM', null);
    if (precipAmount !== null) return precipAmount > 0 ? 100 : fallback;

    return fallback;
  }

  function formatHourMinute(value) {
    const safe = clampNumber(value, 0, 2359, 0);
    const hours = Math.floor(safe / 100);
    const minutes = safe % 100;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  function getObservedLabel(currentCondition = {}) {
    const observedHour = getPreferredHour(currentCondition);
    return `观测时间 ${formatHourMinute(observedHour)}`;
  }

  function getForecastLabel(dateString, index) {
    if (index === 0) return '今天';
    if (index === 1) return '明天';
    const date = new Date(`${dateString}T12:00:00`);
    return Number.isNaN(date.getTime()) ? dateString : DAY_LABELS[date.getDay()];
  }

  function renderForecast(items) {
    const list = $('#weather-forecast-list');
    if (!list) return;
    list.innerHTML = '';

    if (!items.length) {
      list.innerHTML = '<p class="weather-empty-hint">暂无近期天气数据。</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach(item => {
      const row = el('div', 'weather-forecast-item');
      const day = el('div', 'weather-forecast-day');
      const icon = el('span', 'weather-forecast-icon');
      const desc = el('span', 'weather-forecast-desc');
      const temps = el('div', 'weather-forecast-temps');
      const meta = el('div', 'weather-forecast-meta');

      day.textContent = item.label;
      icon.textContent = item.icon;
      desc.textContent = item.desc;
      temps.textContent = `${item.max} / ${item.min}`;
      meta.textContent = `降雨 ${item.rainChance}% · 紫外线 ${item.uv}`;

      row.append(day, icon, desc, temps, meta);
      fragment.appendChild(row);
    });

    list.appendChild(fragment);
  }

  function render(model) {
    $('#weather-icon').textContent = model.icon;
    $('#weather-location').textContent = model.location;
    $('#weather-temp').textContent = model.temp;
    $('#weather-desc').textContent = model.desc;
    $('#weather-feels').textContent = `体感 ${model.feelsLike}`;
    $('#weather-rain-chance').textContent = `${model.rainChance}%`;
    $('#weather-humidity').textContent = `${model.humidity}%`;
    $('#weather-wind').textContent = `风速 ${model.wind}`;
    $('#weather-uv').textContent = `紫外线 ${model.uv}`;
    setMeterWidth('weather-rain-bar', model.rainChance);
    setMeterWidth('weather-humidity-bar', model.humidity);

    $('#weather-icon-large').textContent = model.icon;
    $('#weather-location-large').textContent = model.location;
    $('#weather-temp-large').textContent = model.temp;
    $('#weather-desc-large').textContent = model.desc;
    $('#weather-feels-large').textContent = model.feelsLike;
    $('#weather-humidity-large').textContent = `${model.humidity}%`;
    $('#weather-wind-large').textContent = model.wind;
    $('#weather-rain-large').textContent = `${model.rainChance}%`;
    $('#weather-uv-large').textContent = String(model.uv);
    $('#weather-sync-note').textContent = model.source;
    $('#weather-updated-at').textContent = model.updatedAt;
    renderForecast(model.forecast);

    const loadingEl = $('#weather-loading');
    const contentEl = $('#weather-content');
    if (loadingEl) loadingEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');
  }

  async function requestWeatherJson(url) {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
      headers: { Accept: 'application/json' },
    });
    const raw = await response.text();
    let data = {};

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }
    }

    if (!response.ok) {
      const err = new Error(data?.message || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.payload = data;
      throw err;
    }

    return data;
  }

  function describeWeatherFailure(settings, err) {
    const reason = err?.payload?.details?.reason || '';
    const diagnostic = err?.payload?.details?.diagnostic || '';

    if (!navigator.onLine) {
      return '当前网络似乎已断开，请检查网络连接后重试。';
    }

    if (reason === 'manual-location-not-found') {
      return `未找到 ${settings.location} 的天气数据，请检查地名后重试。`;
    }

    if (reason === 'weather-timeout' || err?.name === 'TimeoutError') {
      return '天气服务响应超时，请稍后刷新重试。';
    }

    if (settings.location && reason === 'upstream-http') {
      return `无法获取 ${settings.location} 的天气，请检查地名后重试。`;
    }

    if (reason === 'weather-fetch-failed' || reason === 'upstream-http') {
      return diagnostic || '天气服务暂时不可用，请稍后重试。';
    }

    return diagnostic || (settings.location ? `无法获取 ${settings.location} 的天气，请稍后重试。` : '自动定位天气获取失败，请稍后重试。');
  }

  async function performWeatherFetch({ silent = false } = {}) {
    const settings = loadSettings();
    const loadingEl = $('#weather-loading');
    const contentEl = $('#weather-content');
    const requestId = requestSeq;
    const endpoint = settings.location
      ? `/api/weather?location=${encodeURIComponent(settings.location)}`
      : '/api/weather';

    if (!latest) {
      showLoadingCard();
      if (contentEl) contentEl.classList.add('hidden');
    }

    if (!silent) {
      setSettingsStatus(
        settings.location ? `正在刷新 ${settings.location} 的天气...` : '正在刷新自动定位天气...'
      );
    }
    try {
      const response = await requestWeatherJson(endpoint);
      const data = response.data || {};
      const meta = response.meta || {};
      const cur = data.current_condition?.[0];
      if (!cur) throw new Error('No current condition');
      const todayHourly = Array.isArray(data.weather?.[0]?.hourly) ? data.weather[0].hourly : [];
      const currentPreferredHour = getPreferredHour(cur);
      const currentSample = pickHourlySample(todayHourly, currentPreferredHour) || null;

      const forecast = (data.weather || []).slice(0, 5).map((day, index) => {
        const hourly = Array.isArray(day.hourly) ? day.hourly : [];
        const sample = pickHourlySample(hourly, index === 0 ? currentPreferredHour : 1200) || {};
        const code = sample.weatherCode || cur.weatherCode;
        return {
          label: getForecastLabel(day.date, index),
          icon: WEATHER_CODE_MAP[String(code)] ?? '☁',
          desc: sample.lang_zh?.[0]?.value ?? sample.weatherDesc?.[0]?.value ?? '天气',
          max: `${day.maxtempC}°C`,
          min: `${day.mintempC}°C`,
          rainChance: getRepresentativeRainChance(hourly, index === 0 ? currentPreferredHour : 1200),
          uv: sample.uvIndex ?? cur.uvIndex ?? '--',
        };
      });

      if (requestId !== requestSeq) return latest;

      latest = {
        icon: WEATHER_CODE_MAP[String(cur.weatherCode)] ?? '☁',
        location: data.nearest_area?.[0]?.areaName?.[0]?.value || meta.displayLocation || settings.location || '当前位置',
        temp: `${cur.temp_C}°C`,
        feelsLike: `${cur.FeelsLikeC}°C`,
        desc: cur.lang_zh?.[0]?.value ?? cur.weatherDesc?.[0]?.value ?? '天气',
        humidity: clampNumber(getHourlyMetric(currentSample, 'humidity', cur.humidity), 0, 100, 0),
        wind: `${cur.windspeedKmph} km/h`,
        rainChance: getCurrentRainChance(currentSample, forecast[0]?.rainChance ?? 0, cur),
        uv: cur.uvIndex ?? forecast[0]?.uv ?? '--',
        source: meta.sourceLabel || (settings.location ? '手动位置 · wttr.in' : '自动定位 · wttr.in'),
        updatedAt: getObservedLabel(cur),
        forecast,
      };

      refreshedAt = Date.now();
      render(latest);
      if (!silent) {
        const locationNote = meta.diagnostic ? `（${meta.diagnostic}）` : '';
        setSettingsStatus(
          settings.location
            ? `天气已更新，当前位置：${latest.location}`
            : `天气已更新，当前为自动定位：${latest.location}${locationNote}`
        );
      }
    } catch (err) {
      if (requestId !== requestSeq) return latest;
      if (loadingEl) {
        loadingEl.innerHTML = '<span class="weather-error">天气获取失败</span>';
        if (!latest) loadingEl.classList.remove('hidden');
      }
      if (contentEl && !latest) {
        contentEl.classList.add('hidden');
      }
      if (!silent) {
        setSettingsStatus(describeWeatherFailure(settings, err), true);
      }
      console.warn('Weather fetch failed:', err);
    }
  }

  async function fetchWeather(options = {}) {
    const settings = loadSettings();
    const endpoint = settings.location
      ? `/api/weather?location=${encodeURIComponent(settings.location)}`
      : '/api/weather';
    const requestKey = endpoint;

    if (inflight?.key === requestKey) {
      return inflight.promise;
    }

    const requestId = ++requestSeq;
    const promise = performWeatherFetch(options).finally(() => {
      if (inflight?.key === requestKey && inflight.requestId === requestId) {
        inflight = null;
      }
    });

    inflight = { key: requestKey, requestId, promise };
    return promise;
  }

  function bindSettingsControls() {
    const input = $('#weather-location-input');
    const saveBtn = $('#weather-location-save-btn');
    const refreshBtn = $('#weather-refresh-btn');
    const modalRefreshBtn = $('#weather-modal-refresh-btn');
    if (!input || !saveBtn || !refreshBtn) return;

    syncSettingsControls();
    const currentSettings = loadSettings();
    setSettingsStatus(currentSettings.location ? `已保存天气位置：${currentSettings.location}` : '留空时使用自动定位天气。');

    const saveLocation = () => {
      const location = input.value.trim();
      saveSettings({ location });
      setSettingsStatus(location ? `已保存天气位置：${location}` : '已切换为自动定位天气。');
      fetchWeather();
    };

    saveBtn.addEventListener('click', saveLocation);
    refreshBtn.addEventListener('click', () => fetchWeather());
    modalRefreshBtn?.addEventListener('click', () => fetchWeather());
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveLocation();
      }
    });
  }

  function init() {
    bindSettingsControls();
    fetchWeather();
    setInterval(() => {
      if (!document.hidden && navigator.onLine !== false) {
        void fetchWeather({ silent: true });
      }
    }, AUTO_REFRESH_MS);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && Date.now() - refreshedAt > AUTO_REFRESH_MS) {
        void fetchWeather({ silent: true });
      }
    });

    window.addEventListener('online', () => {
      if (!document.hidden) {
        void fetchWeather({ silent: true });
      }
    });
  }

  return { init, fetchWeather, getLatest: () => latest };
})();

const TodoBoard = (() => {
  function load() {
    const list = lsGet(LS.TODO, []);
    return Array.isArray(list) ? list : [];
  }

  function save(list) {
    lsSet(LS.TODO, list);
  }

  function getCounts(list) {
    const active = list.filter(item => !item.done).length;
    const done = list.length - active;
    return { active, done, total: list.length };
  }

  function ordered(list) {
    return [...list].sort((a, b) => Number(a.done) - Number(b.done));
  }

  function createTodoItem(item, compact = false) {
    const row = el('li', `todo-item${item.done ? ' done' : ''}${compact ? ' todo-item-compact' : ''}`);
    const checkbox = document.createElement('input');
    const text = el('span', 'todo-text');
    const removeBtn = el('button', 'todo-del');

    row.dataset.id = item.id;
    checkbox.type = 'checkbox';
    checkbox.checked = Boolean(item.done);
    checkbox.setAttribute('aria-label', '完成代办');

    text.textContent = item.text;
    removeBtn.type = 'button';
    removeBtn.title = '删除代办';
    removeBtn.textContent = '×';

    checkbox.addEventListener('change', () => toggle(item.id));
    removeBtn.addEventListener('click', () => remove(item.id));

    row.append(checkbox, text, removeBtn);
    return row;
  }

  function renderList(targetId, list, compact = false, limit = null) {
    const container = $(`#${targetId}`);
    if (!container) return;

    container.innerHTML = '';
    const source = ordered(list);
    const visibleItems = typeof limit === 'number' ? source.slice(0, limit) : source;

    if (visibleItems.length === 0) {
      container.innerHTML = `<li class="todo-empty-hint">${compact ? '当前没有待办事项。' : '还没有添加待办。'}</li>`;
      return;
    }

    visibleItems.forEach(item => container.appendChild(createTodoItem(item, compact)));

    if (compact && list.length > visibleItems.length) {
      const more = el('li', 'todo-more-hint');
      more.textContent = `还有 ${list.length - visibleItems.length} 项未展示`;
      container.appendChild(more);
    }
  }

  function render() {
    const list = load();
    const counts = getCounts(list);

    const compactActive = $('#todo-count-compact');
    const compactDone = $('#todo-done-count-compact');
    const modalActive = $('#todo-active-count-modal');
    const modalDone = $('#todo-done-count-modal');
    const modalTotal = $('#todo-total-count-modal');

    if (compactActive) compactActive.textContent = counts.active;
    if (compactDone) compactDone.textContent = counts.done;
    if (modalActive) modalActive.textContent = counts.active;
    if (modalDone) modalDone.textContent = counts.done;
    if (modalTotal) modalTotal.textContent = counts.total;

    renderList('todo-card-list', list, true, 4);
    renderList('todo-list', list, false);
  }

  function add(text) {
    const value = String(text || '').trim();
    if (!value) return;
    const list = load();
    list.unshift({ id: uid(), text: value, done: false, ts: Date.now() });
    save(list);
    render();
  }

  function toggle(id) {
    const list = load();
    const item = list.find(entry => entry.id === id);
    if (!item) return;
    item.done = !item.done;
    save(list);
    render();
  }

  function remove(id) {
    save(load().filter(item => item.id !== id));
    render();
  }

  function bindQuickInput(inputId, buttonId) {
    const input = $(`#${inputId}`);
    const button = $(`#${buttonId}`);
    if (!input || !button) return;

    const submit = () => {
      add(input.value);
      input.value = '';
      input.focus();
    };

    button.addEventListener('click', submit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      }
    });
  }

  function init() {
    render();
    bindQuickInput('todo-card-input', 'todo-card-add-btn');
    bindQuickInput('todo-input', 'todo-add-btn');
  }

  return { init, render };
})();

const ClipboardHub = (() => {
  const MAX_ITEMS = 40;
  const MAX_PREVIEW = 120;
  const FILE_DB_NAME = 'homepage_clipboard_files';
  const FILE_DB_VERSION = 1;
  const FILE_STORE = 'batches';
  const FILE_INPUT_IDS = ['clipboard-card-file-input', 'clipboard-file-input'];
  const FILE_DROPZONE_CONFIG = [
    { zoneId: 'clipboard-card-dropzone', inputId: 'clipboard-card-file-input' },
    { zoneId: 'clipboard-file-dropzone', inputId: 'clipboard-file-input' },
  ];

  let dbPromise = null;
  let pendingFiles = [];
  let statusTimer = null;

  function supportsFileStorage() {
    return typeof indexedDB !== 'undefined';
  }

  function makeTextPreview(text) {
    const compact = String(text || '').replace(/\s+/g, ' ').trim();
    if (compact.length <= MAX_PREVIEW) return compact;
    return `${compact.slice(0, MAX_PREVIEW)}...`;
  }

  function formatBytes(bytes) {
    const value = clampNumber(bytes, 0, Number.MAX_SAFE_INTEGER, 0);
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(value < 10 * 1024 ? 1 : 0)} KB`;
    if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(value < 10 * 1024 * 1024 ? 1 : 0)} MB`;
    return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  function getUploadLimits() {
    return serviceLimits || DEFAULT_LIMITS;
  }

  function updateServiceLimits(next = {}) {
    serviceLimits = {
      maxHistoryItems: clampNumber(next.maxHistoryItems, 1, Number.MAX_SAFE_INTEGER, DEFAULT_LIMITS.maxHistoryItems),
      maxTextLength: clampNumber(next.maxTextLength, 1, Number.MAX_SAFE_INTEGER, DEFAULT_LIMITS.maxTextLength),
      maxUploadFiles: clampNumber(next.maxUploadFiles, 1, Number.MAX_SAFE_INTEGER, DEFAULT_LIMITS.maxUploadFiles),
      maxFileSize: clampNumber(next.maxFileSize, 1, Number.MAX_SAFE_INTEGER, DEFAULT_LIMITS.maxFileSize),
      maxBatchSize: clampNumber(next.maxBatchSize, 1, Number.MAX_SAFE_INTEGER, DEFAULT_LIMITS.maxBatchSize),
    };
  }

  function buildFileFingerprint(file) {
    return [
      file?.name || '',
      file?.size || 0,
      file?.lastModified || 0,
      file?.type || '',
    ].join('::');
  }

  function mergePendingFiles(files, append = false) {
    const source = append ? [...pendingFiles, ...files] : [...files];
    const seen = new Set();
    const merged = [];
    let skippedCount = 0;

    source.forEach(file => {
      const key = buildFileFingerprint(file);
      if (seen.has(key)) {
        skippedCount += 1;
        return;
      }
      seen.add(key);
      merged.push(file);
    });

    return {
      files: merged,
      addedCount: append ? Math.max(0, merged.length - pendingFiles.length) : merged.length,
      skippedCount,
    };
  }

  function validatePendingFiles(files) {
    const limits = getUploadLimits();
    if (!files.length) {
      return { ok: false, message: '没有可上传的文件。' };
    }

    const emptyFile = files.find(file => !file || !(file instanceof File) || file.size <= 0);
    if (emptyFile) {
      return { ok: false, message: `文件 ${emptyFile.name || '未命名文件'} 为空或无效，无法上传。` };
    }

    if (files.length > limits.maxUploadFiles) {
      return { ok: false, message: `单次最多可暂存 ${limits.maxUploadFiles} 个文件。` };
    }

    const oversized = files.find(file => file.size > limits.maxFileSize);
    if (oversized) {
      return {
        ok: false,
        message: `文件 ${oversized.name} 超过单个文件大小限制（${formatBytes(limits.maxFileSize)}）。`,
      };
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > limits.maxBatchSize) {
      return {
        ok: false,
        message: `本次文件总大小超过限制（${formatBytes(limits.maxBatchSize)}）。`,
      };
    }

    return { ok: true, totalBytes };
  }

  function describePendingFiles(result) {
    const parts = [`已加入 ${result.addedCount} 个待上传文件`];
    if (result.skippedCount) {
      parts.push(`已自动忽略 ${result.skippedCount} 个重复项`);
    }
    parts.push(`共 ${formatBytes(result.totalBytes || 0)}`);
    return `${parts.join(' · ')}。`;
  }

  function summarizeFileBatch(files) {
    if (!Array.isArray(files) || !files.length) return '空文件批次';
    if (files.length === 1) return files[0].name || '未命名文件';
    return `${files[0].name || '未命名文件'} 等 ${files.length} 个文件`;
  }

  function normalizeTextItem(item) {
    const text = typeof item === 'string' ? item : item?.text;
    if (typeof text !== 'string' || !text.trim()) return null;
    const ts = Number.isFinite(item?.ts) ? item.ts : Date.now();
    return {
      id: item?.id || uid(),
      type: 'text',
      text,
      preview: item?.preview || makeTextPreview(text),
      ts,
    };
  }

  function normalizeFileItem(item) {
    if (!item || item.type !== 'files' || !item.batchId) return null;
    const files = Array.isArray(item.files)
      ? item.files
          .filter(file => file && typeof file.name === 'string')
          .map(file => ({
            name: file.name,
            size: clampNumber(file.size, 0, Number.MAX_SAFE_INTEGER, 0),
            type: typeof file.type === 'string' ? file.type : '',
          }))
      : [];
    if (!files.length) return null;

    const fileCount = clampNumber(item.fileCount || files.length, 1, Number.MAX_SAFE_INTEGER, files.length);
    const totalBytes = clampNumber(
      item.totalBytes || files.reduce((sum, file) => sum + clampNumber(file.size, 0, Number.MAX_SAFE_INTEGER, 0), 0),
      0,
      Number.MAX_SAFE_INTEGER,
      0
    );

    return {
      id: item.id || uid(),
      type: 'files',
      batchId: item.batchId,
      label: item.label || summarizeFileBatch(files),
      fileCount,
      totalBytes,
      files,
      ts: Number.isFinite(item.ts) ? item.ts : Date.now(),
    };
  }

  function normalizeHistory(list) {
    return list
      .map(item => {
        if (item?.type === 'files') return normalizeFileItem(item);
        return normalizeTextItem(item);
      })
      .filter(Boolean)
      .sort((a, b) => b.ts - a.ts);
  }

  function trimHistory(list) {
    const next = list.slice(0, MAX_ITEMS);
    const removedBatchIds = list
      .slice(MAX_ITEMS)
      .filter(item => item?.type === 'files' && item.batchId)
      .map(item => item.batchId);
    return { next, removedBatchIds };
  }

  function loadHistory() {
    const stored = lsGet(LS.CLIPBOARD_HISTORY, null);
    if (Array.isArray(stored)) return normalizeHistory(stored);

    const legacy = lsGet(LS.NOTES, '');
    if (typeof legacy === 'string' && legacy.trim()) {
      const migrated = [normalizeTextItem({ id: uid(), text: legacy.trim(), ts: Date.now() })];
      lsSet(LS.CLIPBOARD_HISTORY, migrated);
      return migrated;
    }

    return [];
  }

  async function saveHistory(list) {
    const normalized = normalizeHistory(list);
    const { next, removedBatchIds } = trimHistory(normalized);
    lsSet(LS.CLIPBOARD_HISTORY, next);
    if (removedBatchIds.length) {
      await deleteFileBatches(removedBatchIds);
    }
    return next;
  }

  function loadDraft() {
    const stored = lsGet(LS.CLIPBOARD_DRAFT, null);
    if (typeof stored === 'string') return stored;
    const legacy = lsGet(LS.NOTES, '');
    return typeof legacy === 'string' ? legacy : '';
  }

  function syncEditors(text, sourceId = '') {
    ['clipboard-card-input', 'clipboard-area'].forEach(id => {
      const node = $(`#${id}`);
      if (!node || id === sourceId) return;
      if (node.value !== text) node.value = text;
    });
  }

  function setDraft(text, sourceId = '') {
    lsSet(LS.CLIPBOARD_DRAFT, text);
    syncEditors(text, sourceId);
  }

  function openFileDB() {
    if (!supportsFileStorage()) {
      return Promise.reject(new Error('当前浏览器不支持本地文件暂存。'));
    }

    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(FILE_DB_NAME, FILE_DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(FILE_STORE)) {
          db.createObjectStore(FILE_STORE, { keyPath: 'batchId' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('无法打开本地文件仓库。'));
    });

    return dbPromise;
  }

  async function putFileBatch(batchId, files) {
    const db = await openFileDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILE_STORE, 'readwrite');
      const store = tx.objectStore(FILE_STORE);
      const payload = {
        batchId,
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          blob: file,
        })),
      };

      store.put(payload);
      tx.oncomplete = () => resolve(payload);
      tx.onerror = () => reject(tx.error || new Error('文件暂存失败。'));
      tx.onabort = () => reject(tx.error || new Error('文件暂存被中断。'));
    });
  }

  async function getFileBatch(batchId) {
    const db = await openFileDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILE_STORE, 'readonly');
      const store = tx.objectStore(FILE_STORE);
      const request = store.get(batchId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('读取文件批次失败。'));
    });
  }

  async function deleteFileBatches(batchIds) {
    const ids = [...new Set((batchIds || []).filter(Boolean))];
    if (!ids.length || !supportsFileStorage()) return;

    const db = await openFileDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILE_STORE, 'readwrite');
      const store = tx.objectStore(FILE_STORE);
      ids.forEach(id => store.delete(id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('删除文件批次失败。'));
      tx.onabort = () => reject(tx.error || new Error('删除文件批次被中断。'));
    });
  }

  async function clearFileStore() {
    if (!supportsFileStorage()) return;
    const db = await openFileDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILE_STORE, 'readwrite');
      tx.objectStore(FILE_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('清空文件仓库失败。'));
      tx.onabort = () => reject(tx.error || new Error('清空文件仓库被中断。'));
    });
  }

  function setStatus(message) {
    ['clipboard-saved', 'clipboard-inline-status'].forEach(id => {
      const node = $(`#${id}`);
      if (!node) return;
      node.textContent = message;
      node.classList.add('visible');
    });
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      ['clipboard-saved', 'clipboard-inline-status'].forEach(id => {
        $(`#${id}`)?.classList.remove('visible');
      });
    }, 1600);
  }

  function fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }

  async function copyText(text) {
    const value = String(text || '').trim();
    if (!value) {
      setStatus('没有可复制的内容。');
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        fallbackCopy(value);
      }
      setStatus('已复制到系统剪切板。');
    } catch {
      fallbackCopy(value);
      setStatus('已复制到系统剪切板。');
    }
  }

  async function downloadFiles(batchId) {
    if (!batchId) {
      setStatus('没有可下载的文件批次。');
      return;
    }

    try {
      const batch = await getFileBatch(batchId);
      if (!batch?.files?.length) {
        setStatus('这批文件已不存在，请重新暂存。');
        return;
      }

      let successCount = 0;
      batch.files.forEach((entry, index) => {
        try {
          const blob = entry.blob instanceof Blob ? entry.blob : new Blob([entry.blob], { type: entry.type || 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = entry.name || `clipboard-file-${index + 1}`;
          link.rel = 'noopener';
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 30000);
          successCount += 1;
        } catch (err) {
          console.warn('Download failed:', err);
        }
      });

      if (successCount === 0) {
        setStatus('文件下载失败，请稍后重试。');
      } else if (successCount === batch.files.length) {
        setStatus(`已开始下载 ${successCount} 个文件。`);
      } else {
        setStatus(`已开始下载 ${successCount}/${batch.files.length} 个文件。`);
      }
    } catch (err) {
      console.warn('File batch read failed:', err);
      setStatus('读取文件失败，请稍后重试。');
    }
  }

  async function saveTextEntry(rawText = loadDraft()) {
    const text = String(rawText || '').trim();
    if (!text) {
      setStatus('没有可保存的内容。');
      return;
    }

    try {
      const history = loadHistory();
      const existingIndex = history.findIndex(item => item.type === 'text' && item.text === text);
      if (existingIndex !== -1) {
        const [existing] = history.splice(existingIndex, 1);
        existing.ts = Date.now();
        existing.preview = makeTextPreview(text);
        history.unshift(existing);
      } else {
        history.unshift({
          id: uid(),
          type: 'text',
          text,
          preview: makeTextPreview(text),
          ts: Date.now(),
        });
      }

      await saveHistory(history);
      setDraft('');
      render();
      setStatus('已保存到本地历史。');
    } catch (err) {
      console.warn('Text entry save failed:', err);
      setStatus('保存文本失败，请稍后重试。');
    }
  }

  function setPendingFiles(files, append = false) {
    const nextFiles = Array.isArray(files) ? files.filter(file => file instanceof File) : [];
    const merged = mergePendingFiles(nextFiles, append);
    const validation = validatePendingFiles(merged.files);
    if (!validation.ok) {
      return { ok: false, message: validation.message };
    }
    pendingFiles = merged.files;
    renderPendingFiles();
    return {
      ok: true,
      addedCount: merged.addedCount,
      skippedCount: merged.skippedCount,
      totalBytes: validation.totalBytes,
      totalCount: pendingFiles.length,
    };
  }

  function clearPendingFiles() {
    pendingFiles = [];
    FILE_INPUT_IDS.forEach(id => {
      const input = $(`#${id}`);
      if (input) input.value = '';
    });
    renderPendingFiles();
  }

  function renderPendingList(targetId, files, limit = null) {
    const container = $(`#${targetId}`);
    if (!container) return;

    container.innerHTML = '';
    if (!files.length) {
      container.innerHTML = '<p class="clipboard-empty-hint">暂无待暂存文件。</p>';
      return;
    }

    const visible = typeof limit === 'number' ? files.slice(0, limit) : files;

    visible.forEach(file => {
      const row = el('div', 'clipboard-pending-item');
      const name = el('div', 'clipboard-pending-name');
      const meta = el('div', 'clipboard-pending-meta');
      name.textContent = file.name;
      meta.textContent = `${formatBytes(file.size)}${file.type ? ` · ${file.type}` : ''}`;
      row.append(name, meta);
      container.appendChild(row);
    });

    if (typeof limit === 'number' && files.length > visible.length) {
      const more = el('div', 'clipboard-list-more');
      more.textContent = `另有 ${files.length - visible.length} 个文件待暂存`;
      container.appendChild(more);
    }
  }

  function renderPendingFiles() {
    if (!supportsFileStorage()) {
      ['clipboard-card-file-summary', 'clipboard-file-summary'].forEach(id => {
        const node = $(`#${id}`);
        if (node) node.textContent = '当前浏览器不支持文件暂存';
      });

      ['clipboard-card-pending-list', 'clipboard-pending-list'].forEach(id => {
        const container = $(`#${id}`);
        if (container) {
          container.innerHTML = '<p class="clipboard-empty-hint">当前浏览器不支持本地文件暂存。</p>';
        }
      });
      return;
    }

    const summary = pendingFiles.length
      ? `已选择 ${pendingFiles.length} 个文件，共 ${formatBytes(pendingFiles.reduce((sum, file) => sum + file.size, 0))}`
      : '当前未选择文件';

    ['clipboard-card-file-summary', 'clipboard-file-summary'].forEach(id => {
      const node = $(`#${id}`);
      if (node) node.textContent = summary;
    });

    renderPendingList('clipboard-card-pending-list', pendingFiles, 1);
    renderPendingList('clipboard-pending-list', pendingFiles, null);
  }

  async function savePendingFiles() {
    if (!pendingFiles.length) {
      setStatus('没有待暂存的文件。');
      return;
    }

    if (!supportsFileStorage()) {
      setStatus('当前浏览器不支持本地文件暂存。');
      return;
    }

    const batchId = uid();
    const fileMeta = pendingFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type || '',
    }));
    const entry = {
      id: uid(),
      type: 'files',
      batchId,
      label: summarizeFileBatch(fileMeta),
      fileCount: fileMeta.length,
      totalBytes: fileMeta.reduce((sum, file) => sum + file.size, 0),
      files: fileMeta,
      ts: Date.now(),
    };

    try {
      await putFileBatch(batchId, pendingFiles);
      const history = loadHistory();
      history.unshift(entry);
      await saveHistory(history);
      clearPendingFiles();
      render();
      setStatus(`已暂存 ${entry.fileCount} 个文件。`);
    } catch (err) {
      console.warn('File stash failed:', err);
      setStatus('文件暂存失败，可能超出浏览器存储限制。');
    }
  }

  async function remove(id) {
    try {
      const history = loadHistory();
      const target = history.find(item => item.id === id);
      const next = history.filter(item => item.id !== id);
      if (target?.type === 'files' && target.batchId) {
        await deleteFileBatches([target.batchId]);
      }
      lsSet(LS.CLIPBOARD_HISTORY, next);
      render();
      setStatus('记录已删除。');
    } catch (err) {
      console.warn('Clipboard entry removal failed:', err);
      setStatus('删除记录失败，请稍后重试。');
    }
  }

  async function clearAll() {
    try {
      lsSet(LS.CLIPBOARD_HISTORY, []);
      await clearFileStore();
      render();
      setStatus('历史已清空。');
    } catch (err) {
      console.warn('Clipboard clear failed:', err);
      setStatus('清空历史失败，请稍后重试。');
    }
  }

  function createHistoryMeta(item) {
    if (item.type === 'files') {
      return `${item.fileCount} 个文件 · ${formatBytes(item.totalBytes)} · ${timeAgo(item.ts)}`;
    }
    return timeAgo(item.ts);
  }

  function createHistoryRow(item, compact = false) {
    const row = el('div', `clipboard-history-entry${item.type === 'files' ? ' is-file' : ' is-text'}${compact ? ' is-compact' : ''}`);
    const badge = el('span', `clipboard-entry-badge ${item.type === 'files' ? 'is-file' : 'is-text'}`);
    const title = el('div', 'clipboard-entry-title');
    const text = el('div', 'clipboard-entry-text');
    const meta = el('div', 'clipboard-entry-meta');

    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.dataset.entryId = item.id;
    badge.textContent = item.type === 'files' ? '文件' : '文本';
    title.textContent = item.type === 'files' ? item.label : '文本记录';
    text.textContent = item.type === 'files'
      ? item.files.map(file => file.name).slice(0, 3).join(' · ')
      : item.preview || makeTextPreview(item.text);
    meta.textContent = createHistoryMeta(item);

    const content = el('div', 'clipboard-entry-content');
    content.append(badge, title, text, meta);
    row.appendChild(content);

    const activate = () => {
      if (item.type === 'files') {
        void downloadFiles(item.batchId);
      } else {
        void copyText(item.text);
      }
    };

    row.addEventListener('click', activate);
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });

    if (!compact) {
      const actions = el('div', 'clipboard-history-actions');

      if (item.type === 'text') {
        const loadBtn = el('button', 'btn-secondary btn-mini');
        loadBtn.type = 'button';
        loadBtn.textContent = '载入';
        loadBtn.addEventListener('click', e => {
          e.stopPropagation();
          setDraft(item.text);
          syncEditors(item.text);
          $('#clipboard-area')?.focus();
          setStatus('已载入文本内容。');
        });
        actions.appendChild(loadBtn);
      }

      const deleteBtn = el('button', 'btn-secondary btn-mini btn-danger');
      deleteBtn.type = 'button';
      deleteBtn.textContent = '删除';
      deleteBtn.addEventListener('click', e => {
        e.stopPropagation();
        void remove(item.id);
      });
      actions.appendChild(deleteBtn);
      row.appendChild(actions);
    }

    return row;
  }

  function renderCardHistory(history) {
    const container = $('#clipboard-card-history');
    if (!container) return;

    container.innerHTML = '';
    if (!history.length) {
      container.innerHTML = '<p class="clipboard-empty-hint">还没有保存任何内容。</p>';
      return;
    }

    history.slice(0, 2).forEach(item => container.appendChild(createHistoryRow(item, true)));

    if (history.length > 2) {
      const more = el('div', 'clipboard-list-more');
      more.textContent = `另有 ${history.length - 2} 条记录，请展开查看`;
      container.appendChild(more);
    }
  }

  function renderModalHistory(history) {
    const container = $('#clipboard-history-list');
    if (!container) return;

    container.innerHTML = '';
    if (!history.length) {
      container.innerHTML = '<p class="clipboard-empty-hint">还没有保存任何内容。</p>';
      return;
    }

    history.forEach(item => container.appendChild(createHistoryRow(item, false)));
  }

  function render() {
    const history = loadHistory();
    const draft = loadDraft();

    syncEditors(draft);

    const count = $('#clipboard-count-compact');
    if (count) count.textContent = `${history.length} 条记录`;

    renderCardHistory(history);
    renderModalHistory(history);
    renderPendingFiles();
  }

  function bindEditor(id) {
    const input = $(`#${id}`);
    if (!input) return;

    input.value = loadDraft();
    input.addEventListener('input', () => setDraft(input.value, id));
    input.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        void saveTextEntry(input.value);
      }
    });
  }

  function bindFilePicker(inputId, buttonId) {
    const input = $(`#${inputId}`);
    const button = $(`#${buttonId}`);
    if (!input || !button) return;

    button.addEventListener('click', () => input.click());
    input.addEventListener('change', e => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const result = setPendingFiles(files, true);
      if (result?.ok) {
        setStatus(describePendingFiles(result));
        input.value = '';
        return;
      }
      if (result?.message) {
        setStatus(result.message, { error: true, duration: 2800 });
        input.value = '';
        return;
      }
      setStatus(`已加入 ${files.length} 个待暂存文件。`);
      input.value = '';
    });
  }

  function bindDropzone(zoneId, inputId) {
    const zone = $(`#${zoneId}`);
    const input = $(`#${inputId}`);
    if (!zone || !input) return;

    const openPicker = () => {
      if (!supportsFileStorage() || zone.classList.contains('is-disabled')) return;
      input.click();
    };

    zone.addEventListener('click', openPicker);
    zone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    });

    zone.addEventListener('dragenter', e => {
      if (!supportsFileStorage() || zone.classList.contains('is-disabled')) return;
      e.preventDefault();
      zone.classList.add('is-dragover');
    });

    zone.addEventListener('dragover', e => {
      if (!supportsFileStorage() || zone.classList.contains('is-disabled')) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      zone.classList.add('is-dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('is-dragover');
    });

    zone.addEventListener('drop', e => {
      if (!supportsFileStorage() || zone.classList.contains('is-disabled')) return;
      e.preventDefault();
      zone.classList.remove('is-dragover');
      const files = Array.from(e.dataTransfer?.files || []);
      if (!files.length) {
        setStatus('请拖入文件，而不是文本或链接。');
        return;
      }
      const result = setPendingFiles(files, true);
      if (result?.ok) {
        setStatus(describePendingFiles(result));
        return;
      }
      if (result?.message) {
        setStatus(result.message, { error: true, duration: 2800 });
        return;
      }
      setStatus(`已加入 ${files.length} 个待暂存文件。`);
    });
  }

  function bindFileControls() {
    bindFilePicker('clipboard-card-file-input', 'clipboard-card-file-select-btn');
    bindFilePicker('clipboard-file-input', 'clipboard-file-select-btn');
    FILE_DROPZONE_CONFIG.forEach(({ zoneId, inputId }) => bindDropzone(zoneId, inputId));

    $('#clipboard-card-file-save-btn')?.addEventListener('click', () => void savePendingFiles());
    $('#clipboard-file-save-btn')?.addEventListener('click', () => void savePendingFiles());
    $('#clipboard-card-file-clear-btn')?.addEventListener('click', () => {
      clearPendingFiles();
      setStatus('已清空待选文件。');
    });
    $('#clipboard-file-clear-btn')?.addEventListener('click', () => {
      clearPendingFiles();
      setStatus('已清空待选文件。');
    });
  }

  function syncFileFeatureAvailability() {
    if (supportsFileStorage()) return;

    [
      'clipboard-card-file-select-btn',
      'clipboard-card-file-save-btn',
      'clipboard-card-file-clear-btn',
      'clipboard-file-select-btn',
      'clipboard-file-save-btn',
      'clipboard-file-clear-btn',
    ].forEach(id => {
      const node = $(`#${id}`);
      if (node) node.setAttribute('disabled', 'true');
    });

    ['clipboard-card-dropzone', 'clipboard-file-dropzone'].forEach(id => {
      const node = $(`#${id}`);
      if (node) {
        node.classList.add('is-disabled');
        node.setAttribute('aria-disabled', 'true');
      }
    });
  }

  function init() {
    render();
    bindEditor('clipboard-card-input');
    bindEditor('clipboard-area');
    bindFileControls();
    syncFileFeatureAvailability();

    $('#clipboard-save-btn')?.addEventListener('click', () => void saveTextEntry(loadDraft()));
    $('#clipboard-modal-save-btn')?.addEventListener('click', () => void saveTextEntry(loadDraft()));
    $('#clipboard-copy-current-btn')?.addEventListener('click', () => void copyText(loadDraft()));
    $('#clipboard-clear-btn')?.addEventListener('click', () => void clearAll());
  }

  return { init, render };
})();

const ClipboardHubServer = (() => {
  const MAX_PREVIEW = 120;
  const DEFAULT_LIMITS = {
    maxHistoryItems: 40,
    maxTextLength: 200000,
    maxUploadFiles: 24,
    maxFileSize: 256 * 1024 * 1024,
    maxBatchSize: 768 * 1024 * 1024,
  };
  const FILE_INPUT_IDS = ['clipboard-card-file-input', 'clipboard-file-input'];
  const FILE_DROPZONE_CONFIG = [
    { zoneId: 'clipboard-card-dropzone', inputId: 'clipboard-card-file-input' },
    { zoneId: 'clipboard-file-dropzone', inputId: 'clipboard-file-input' },
  ];
  const POLL_INTERVAL = 30000;

  let pendingFiles = [];
  let historyCache = [];
  let statusTimer = null;
  let baseStatusMessage = '正在连接服务器剪切板...';
  let baseStatusIsError = false;
  let serviceReady = false;
  let serviceLimits = { ...DEFAULT_LIMITS };
  let uploadState = {
    active: false,
    percent: 0,
    message: '等待上传到服务器',
    error: false,
  };
  let currentUploadSessionId = '';

  function supportsServerStorage() {
    return location.protocol !== 'file:' && typeof fetch === 'function' && typeof XMLHttpRequest !== 'undefined';
  }

  function makeTextPreview(text) {
    const compact = String(text || '').replace(/\s+/g, ' ').trim();
    if (compact.length <= MAX_PREVIEW) return compact;
    return `${compact.slice(0, MAX_PREVIEW)}...`;
  }

  function formatBytes(bytes) {
    const value = clampNumber(bytes, 0, Number.MAX_SAFE_INTEGER, 0);
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(value < 10 * 1024 ? 1 : 0)} KB`;
    if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(value < 10 * 1024 * 1024 ? 1 : 0)} MB`;
    return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  function getUploadLimits() {
    return serviceLimits || DEFAULT_LIMITS;
  }

  function updateServiceLimits(next = {}) {
    serviceLimits = {
      maxHistoryItems: clampNumber(next.maxHistoryItems, 1, Number.MAX_SAFE_INTEGER, DEFAULT_LIMITS.maxHistoryItems),
      maxTextLength: clampNumber(next.maxTextLength, 1, Number.MAX_SAFE_INTEGER, DEFAULT_LIMITS.maxTextLength),
      maxUploadFiles: clampNumber(next.maxUploadFiles, 1, Number.MAX_SAFE_INTEGER, DEFAULT_LIMITS.maxUploadFiles),
      maxFileSize: clampNumber(next.maxFileSize, 1, Number.MAX_SAFE_INTEGER, DEFAULT_LIMITS.maxFileSize),
      maxBatchSize: clampNumber(next.maxBatchSize, 1, Number.MAX_SAFE_INTEGER, DEFAULT_LIMITS.maxBatchSize),
    };
  }

  function buildFileFingerprint(file) {
    return [
      file?.name || '',
      file?.size || 0,
      file?.lastModified || 0,
      file?.type || '',
    ].join('::');
  }

  function mergePendingFiles(files, append = false) {
    const source = append ? [...pendingFiles, ...files] : [...files];
    const seen = new Set();
    const merged = [];
    let skippedCount = 0;

    source.forEach(file => {
      const key = buildFileFingerprint(file);
      if (seen.has(key)) {
        skippedCount += 1;
        return;
      }
      seen.add(key);
      merged.push(file);
    });

    return {
      files: merged,
      addedCount: append ? Math.max(0, merged.length - pendingFiles.length) : merged.length,
      skippedCount,
    };
  }

  function validatePendingFiles(files) {
    const limits = getUploadLimits();
    if (!files.length) {
      return { ok: false, message: '没有可上传的文件。' };
    }

    const emptyFile = files.find(file => !file || !(file instanceof File) || file.size <= 0);
    if (emptyFile) {
      return { ok: false, message: `文件 ${emptyFile.name || '未命名文件'} 为空或无效，无法上传。` };
    }

    if (files.length > limits.maxUploadFiles) {
      return { ok: false, message: `单次最多可暂存 ${limits.maxUploadFiles} 个文件。` };
    }

    const oversized = files.find(file => file.size > limits.maxFileSize);
    if (oversized) {
      return {
        ok: false,
        message: `文件 ${oversized.name} 超过单个文件大小限制（${formatBytes(limits.maxFileSize)}）。`,
      };
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > limits.maxBatchSize) {
      return {
        ok: false,
        message: `本次文件总大小超过限制（${formatBytes(limits.maxBatchSize)}）。`,
      };
    }

    return { ok: true, totalBytes };
  }

  function describePendingFiles(result) {
    const parts = [`已加入 ${result.addedCount} 个待上传文件`];
    if (result.skippedCount) {
      parts.push(`已自动忽略 ${result.skippedCount} 个重复项`);
    }
    parts.push(`共 ${formatBytes(result.totalBytes || 0)}`);
    return `${parts.join(' · ')}。`;
  }

  function summarizeFileBatch(files) {
    if (!Array.isArray(files) || !files.length) return '未命名文件批次';
    if (files.length === 1) return files[0].name || '未命名文件';
    return `${files[0].name || '未命名文件'} 等 ${files.length} 个文件`;
  }

  function normalizeTextItem(item) {
    const text = typeof item === 'string' ? item : item?.text;
    if (typeof text !== 'string' || !text.trim()) return null;
    const ts = Number.isFinite(item?.ts) ? item.ts : Date.now();
    return {
      id: item?.id || uid(),
      type: 'text',
      text,
      preview: item?.preview || makeTextPreview(text),
      ts,
    };
  }

  function normalizeFileItem(item) {
    if (!item || item.type !== 'files' || !item.batchId) return null;
    const files = Array.isArray(item.files)
      ? item.files
          .filter(file => file && typeof file.name === 'string')
          .map(file => ({
            id: typeof file.id === 'string' ? file.id : uid(),
            name: file.name,
            size: clampNumber(file.size, 0, Number.MAX_SAFE_INTEGER, 0),
            type: typeof file.type === 'string' ? file.type : '',
          }))
      : [];

    if (!files.length) return null;

    return {
      id: item.id || uid(),
      type: 'files',
      batchId: item.batchId,
      label: item.label || summarizeFileBatch(files),
      fileCount: clampNumber(item.fileCount || files.length, 1, Number.MAX_SAFE_INTEGER, files.length),
      totalBytes: clampNumber(item.totalBytes || files.reduce((sum, file) => sum + file.size, 0), 0, Number.MAX_SAFE_INTEGER, 0),
      files,
      ts: Number.isFinite(item.ts) ? item.ts : Date.now(),
    };
  }

  function normalizeHistory(list) {
    return (Array.isArray(list) ? list : [])
      .map(item => (item?.type === 'files' ? normalizeFileItem(item) : normalizeTextItem(item)))
      .filter(Boolean)
      .sort((a, b) => b.ts - a.ts);
  }

  function loadDraft() {
    const stored = lsGet(LS.CLIPBOARD_DRAFT, null);
    if (typeof stored === 'string') return stored;
    const legacy = lsGet(LS.NOTES, '');
    return typeof legacy === 'string' ? legacy : '';
  }

  function syncEditors(text, sourceId = '') {
    ['clipboard-card-input', 'clipboard-area'].forEach(id => {
      const node = $(`#${id}`);
      if (!node || id === sourceId) return;
      if (node.value !== text) node.value = text;
    });
  }

  function setDraft(text, sourceId = '') {
    lsSet(LS.CLIPBOARD_DRAFT, text);
    syncEditors(text, sourceId);
  }

  function applyStatus(message, isError = false, visible = true) {
    ['clipboard-saved', 'clipboard-inline-status'].forEach(id => {
      const node = $(`#${id}`);
      if (!node) return;
      node.textContent = message;
      node.classList.toggle('visible', visible);
      node.classList.toggle('is-error', isError);
    });
  }

  function setBaseStatus(message, isError = false) {
    baseStatusMessage = message;
    baseStatusIsError = isError;
    applyStatus(message, isError, true);
  }

  function restoreBaseStatus() {
    applyStatus(baseStatusMessage, baseStatusIsError, true);
  }

  function setStatus(message, { error = false, duration = 2200 } = {}) {
    clearTimeout(statusTimer);
    applyStatus(message, error, true);
    statusTimer = setTimeout(() => restoreBaseStatus(), duration);
  }

  function setUploadState(next = {}) {
    uploadState = {
      active: Boolean(next.active),
      percent: clampNumber(next.percent, 0, 100, 0),
      message: typeof next.message === 'string' && next.message.trim() ? next.message : '等待上传到服务器',
      error: Boolean(next.error),
    };

    const configs = [
      { progressId: 'clipboard-card-upload-progress', barId: 'clipboard-card-upload-progress-bar', textId: 'clipboard-card-upload-text' },
      { progressId: 'clipboard-upload-progress', barId: 'clipboard-upload-progress-bar', textId: 'clipboard-upload-text' },
    ];

    configs.forEach(({ progressId, barId, textId }) => {
      const progress = $(`#${progressId}`);
      const bar = $(`#${barId}`);
      const text = $(`#${textId}`);
      if (progress) progress.hidden = !uploadState.active;
      if (bar) bar.style.width = `${uploadState.percent}%`;
      if (text) {
        text.textContent = uploadState.message;
        text.classList.toggle('is-error', uploadState.error);
      }
    });

    syncActionAvailability();
  }

  async function requestJson(url, options = {}) {
    const init = { ...options, headers: { Accept: 'application/json', ...(options.headers || {}) } };
    if (init.body && !(init.body instanceof FormData) && !init.headers['Content-Type']) {
      init.headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, init);
    const raw = await res.text();
    let data = {};

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }
    }

    if (!res.ok) {
      const err = new Error(data?.message || `Request failed with status ${res.status}`);
      err.status = res.status;
      err.payload = data;
      throw err;
    }

    return data;
  }

  async function refreshHistory({ silent = false } = {}) {
    if (!supportsServerStorage()) {
      serviceReady = false;
      setBaseStatus('当前页面没有接入服务器存储，请使用 node server.js 启动站点。', true);
      render();
      return;
    }

    try {
      const [health, data] = await Promise.all([
        requestJson('/api/clipboard/health', { cache: 'no-store' }),
        requestJson('/api/clipboard/history', { cache: 'no-store' }),
      ]);
      serviceReady = true;
      updateServiceLimits(health?.limits || {});
      historyCache = normalizeHistory(data.items);
      setBaseStatus('已连接服务器存储，保存后的记录和文件可在多设备访问。');
      render();
      if (!silent) setStatus('服务器记录已同步。');
    } catch (err) {
      console.warn('Clipboard history fetch failed:', err);
      serviceReady = false;
      setBaseStatus('未连接到服务器剪切板服务，保存和上传当前不可用。', true);
      render();
      if (!silent) setStatus('无法连接服务器剪切板服务。', { error: true });
    }
  }

  function fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }

  async function copyText(text) {
    const value = String(text || '').trim();
    if (!value) {
      setStatus('没有可复制的内容。', { error: true });
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        fallbackCopy(value);
      }
      setStatus('已复制到系统剪切板。');
    } catch {
      fallbackCopy(value);
      setStatus('已复制到系统剪切板。');
    }
  }

  async function downloadFiles(batchId) {
    const batch = historyCache.find(item => item.type === 'files' && item.batchId === batchId);
    if (!batch?.files?.length) {
      setStatus('这批文件不存在或尚未同步。', { error: true });
      return;
    }

    let successCount = 0;
    batch.files.forEach(file => {
      try {
        const link = document.createElement('a');
        link.href = `/api/clipboard/files/${encodeURIComponent(batch.batchId)}/${encodeURIComponent(file.id)}`;
        link.download = file.name;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
        successCount += 1;
      } catch (err) {
        console.warn('Download failed:', err);
      }
    });

    if (successCount) {
      setStatus(`已开始下载 ${successCount} 个文件。`);
    } else {
      setStatus('文件下载失败，请稍后重试。', { error: true });
    }
  }

  async function saveTextEntry(rawText = loadDraft()) {
    const text = String(rawText || '').trim();
    if (!text) {
      setStatus('没有可保存的内容。', { error: true });
      return;
    }
    if (!serviceReady) {
      setStatus('服务器尚未连接，暂时不能保存。', { error: true });
      return;
    }
    if (uploadState.active) {
      setStatus('文件上传进行中，请稍后再保存文本。', { error: true });
      return;
    }

    try {
      const data = await requestJson('/api/clipboard/text', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      historyCache = normalizeHistory(data.items);
      setDraft('');
      render();
      setStatus('文本已保存到服务器。');
    } catch (err) {
      console.warn('Text entry save failed:', err);
      setStatus(err.message || '保存文本失败，请稍后重试。', { error: true });
    }
  }

  function setPendingFiles(files, append = false) {
    const nextFiles = Array.isArray(files) ? files.filter(file => file instanceof File) : [];
    pendingFiles = append ? [...pendingFiles, ...nextFiles] : nextFiles;
    renderPendingFiles();
  }

  function clearPendingFiles({ silent = false } = {}) {
    if (uploadState.active) {
      if (!silent) setStatus('文件上传进行中，暂时不能清空待上传列表。', { error: true });
      return;
    }

    pendingFiles = [];
    FILE_INPUT_IDS.forEach(id => {
      const input = $(`#${id}`);
      if (input) input.value = '';
    });
    renderPendingFiles();
    if (!silent) setStatus('已清空待上传文件。');
  }

  function renderPendingList(targetId, files, limit = null) {
    const container = $(`#${targetId}`);
    if (!container) return;

    container.innerHTML = '';
    if (!files.length) {
      container.innerHTML = '<p class="clipboard-empty-hint">暂无待上传文件。</p>';
      return;
    }

    const visible = typeof limit === 'number' ? files.slice(0, limit) : files;
    visible.forEach(file => {
      const row = el('div', 'clipboard-pending-item');
      const name = el('div', 'clipboard-pending-name');
      const meta = el('div', 'clipboard-pending-meta');
      name.textContent = file.name;
      meta.textContent = `${formatBytes(file.size)}${file.type ? ` · ${file.type}` : ''}`;
      row.append(name, meta);
      container.appendChild(row);
    });

    if (typeof limit === 'number' && files.length > visible.length) {
      const more = el('div', 'clipboard-list-more');
      more.textContent = `另有 ${files.length - visible.length} 个文件待上传`;
      container.appendChild(more);
    }
  }

  function renderPendingFiles() {
    const summary = pendingFiles.length
      ? `已选择 ${pendingFiles.length} 个文件，共 ${formatBytes(pendingFiles.reduce((sum, file) => sum + file.size, 0))}`
      : serviceReady
        ? '当前未选择文件'
        : '等待连接服务器后再上传文件';

    ['clipboard-card-file-summary', 'clipboard-file-summary'].forEach(id => {
      const node = $(`#${id}`);
      if (node) node.textContent = summary;
    });

    renderPendingList('clipboard-card-pending-list', pendingFiles, 1);
    renderPendingList('clipboard-pending-list', pendingFiles, null);
    syncActionAvailability();
  }

  function uploadSingleFile(uploadId, index, file, uploadedBefore, totalBytes) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `/api/clipboard/uploads/${encodeURIComponent(uploadId)}/${index}`);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
      xhr.setRequestHeader('X-File-Size', String(file.size));

      xhr.upload.onprogress = event => {
        const loaded = uploadedBefore + (event.lengthComputable ? event.loaded : 0);
        const percent = totalBytes > 0 ? Math.round((loaded / totalBytes) * 100) : 0;
        setUploadState({
          active: true,
          percent,
          message: `正在上传 ${file.name} · ${percent}%`,
          error: false,
        });
      };

      xhr.onerror = () => reject(new Error(`上传 ${file.name} 失败，请检查网络或服务器状态。`));

      xhr.onload = () => {
        let payload = {};
        try {
          payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch {}

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(payload);
          return;
        }

        reject(new Error(payload?.message || `上传 ${file.name} 失败（${xhr.status}）。`));
      };

      xhr.send(file);
    });
  }

  async function cancelUploadSession() {
    if (!currentUploadSessionId) return;
    try {
      await fetch(`/api/clipboard/uploads/${encodeURIComponent(currentUploadSessionId)}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Upload cancel failed:', err);
    } finally {
      currentUploadSessionId = '';
    }
  }

  async function savePendingFiles() {
    if (!pendingFiles.length) {
      setStatus('没有待上传的文件。', { error: true });
      return;
    }
    if (!serviceReady) {
      setStatus('服务器尚未连接，暂时不能上传文件。', { error: true });
      return;
    }
    if (uploadState.active) {
      setStatus('已有文件上传任务正在进行。', { error: true });
      return;
    }

    const totalBytes = pendingFiles.reduce((sum, file) => sum + file.size, 0);
    let uploadedBytes = 0;
    const validation = validatePendingFiles(pendingFiles);
    if (!validation.ok) {
      setStatus(validation.message, { error: true, duration: 2800 });
      return;
    }

    try {
      setUploadState({
        active: true,
        percent: 0,
        message: `准备上传 ${pendingFiles.length} 个文件...`,
        error: false,
      });

      const init = await requestJson('/api/clipboard/uploads/init', {
        method: 'POST',
        body: JSON.stringify({
          files: pendingFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type || '',
          })),
        }),
      });

      currentUploadSessionId = init.uploadId;

      for (let index = 0; index < pendingFiles.length; index += 1) {
        const file = pendingFiles[index];
        await uploadSingleFile(init.uploadId, index, file, uploadedBytes, totalBytes);
        uploadedBytes += file.size;
        const percent = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 100;
        setUploadState({
          active: true,
          percent,
          message: `已上传 ${index + 1}/${pendingFiles.length} 个文件`,
          error: false,
        });
      }

      const complete = await requestJson(`/api/clipboard/uploads/${encodeURIComponent(init.uploadId)}/complete`, {
        method: 'POST',
      });

      currentUploadSessionId = '';
      historyCache = normalizeHistory(complete.items);
      pendingFiles = [];
      render();
      setUploadState({
        active: false,
        percent: 100,
        message: `已上传 ${complete.entry?.fileCount || 0} 个文件到服务器`,
        error: false,
      });
      setStatus('文件已上传到服务器，其他设备现在也可以访问。');
    } catch (err) {
      console.warn('File upload failed:', err);
      await cancelUploadSession();
      setUploadState({
        active: false,
        percent: 0,
        message: err.message || '文件上传失败，请稍后重试。',
        error: true,
      });
      setStatus(err.message || '文件上传失败，请稍后重试。', { error: true, duration: 2600 });
      renderPendingFiles();
    }
  }

  async function remove(id) {
    if (!serviceReady) {
      setStatus('服务器尚未连接，暂时不能删除记录。', { error: true });
      return;
    }

    try {
      const data = await requestJson(`/api/clipboard/entries/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      historyCache = normalizeHistory(data.items);
      render();
      setStatus('记录已从服务器删除。');
    } catch (err) {
      console.warn('Clipboard entry removal failed:', err);
      setStatus(err.message || '删除记录失败，请稍后重试。', { error: true });
    }
  }

  async function clearAll() {
    if (!serviceReady) {
      setStatus('服务器尚未连接，暂时不能清空历史。', { error: true });
      return;
    }
    if (uploadState.active) {
      setStatus('文件上传进行中，请稍后再清空历史。', { error: true });
      return;
    }

    try {
      const data = await requestJson('/api/clipboard/entries', {
        method: 'DELETE',
      });
      historyCache = normalizeHistory(data.items);
      render();
      setStatus('服务器历史已清空。');
    } catch (err) {
      console.warn('Clipboard clear failed:', err);
      setStatus(err.message || '清空历史失败，请稍后重试。', { error: true });
    }
  }

  function createHistoryMeta(item) {
    if (item.type === 'files') {
      return `${item.fileCount} 个文件 · ${formatBytes(item.totalBytes)} · ${timeAgo(item.ts)}`;
    }
    return timeAgo(item.ts);
  }

  function createHistoryRow(item, compact = false) {
    const row = el('div', `clipboard-history-entry${item.type === 'files' ? ' is-file' : ' is-text'}${compact ? ' is-compact' : ''}`);
    const badge = el('span', `clipboard-entry-badge ${item.type === 'files' ? 'is-file' : 'is-text'}`);
    const title = el('div', 'clipboard-entry-title');
    const text = el('div', 'clipboard-entry-text');
    const meta = el('div', 'clipboard-entry-meta');

    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.dataset.entryId = item.id;
    badge.textContent = item.type === 'files' ? '文件' : '文本';
    title.textContent = item.type === 'files' ? item.label : '文本记录';
    text.textContent = item.type === 'files'
      ? item.files.map(file => file.name).slice(0, 3).join(' · ')
      : item.preview || makeTextPreview(item.text);
    meta.textContent = createHistoryMeta(item);

    const content = el('div', 'clipboard-entry-content');
    content.append(badge, title, text, meta);
    row.appendChild(content);

    const activate = () => {
      if (item.type === 'files') {
        void downloadFiles(item.batchId);
      } else {
        void copyText(item.text);
      }
    };

    row.addEventListener('click', activate);
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });

    if (!compact) {
      const actions = el('div', 'clipboard-history-actions');

      if (item.type === 'text') {
        const loadBtn = el('button', 'btn-secondary btn-mini');
        loadBtn.type = 'button';
        loadBtn.textContent = '载入';
        loadBtn.addEventListener('click', e => {
          e.stopPropagation();
          setDraft(item.text);
          syncEditors(item.text);
          $('#clipboard-area')?.focus();
          setStatus('已载入文本内容。');
        });
        actions.appendChild(loadBtn);
      }

      const deleteBtn = el('button', 'btn-secondary btn-mini btn-danger');
      deleteBtn.type = 'button';
      deleteBtn.textContent = '删除';
      deleteBtn.addEventListener('click', e => {
        e.stopPropagation();
        void remove(item.id);
      });
      actions.appendChild(deleteBtn);
      row.appendChild(actions);
    }

    return row;
  }

  function renderCardHistory(history) {
    const container = $('#clipboard-card-history');
    if (!container) return;

    container.innerHTML = '';
    if (!history.length) {
      container.innerHTML = '<p class="clipboard-empty-hint">服务器上还没有保存任何记录。</p>';
      return;
    }

    history.slice(0, 2).forEach(item => container.appendChild(createHistoryRow(item, true)));

    if (history.length > 2) {
      const more = el('div', 'clipboard-list-more');
      more.textContent = `另有 ${history.length - 2} 条记录，请展开查看`;
      container.appendChild(more);
    }
  }

  function renderModalHistory(history) {
    const container = $('#clipboard-history-list');
    if (!container) return;

    container.innerHTML = '';
    if (!history.length) {
      container.innerHTML = '<p class="clipboard-empty-hint">服务器上还没有保存任何记录。</p>';
      return;
    }

    history.forEach(item => container.appendChild(createHistoryRow(item, false)));
  }

  function syncActionAvailability() {
    const canWrite = serviceReady && !uploadState.active;
    const canPickFiles = serviceReady && !uploadState.active;
    const hasDraft = Boolean(loadDraft().trim());
    const hasPendingFiles = pendingFiles.length > 0;
    const hasHistory = historyCache.length > 0;

    ['clipboard-save-btn', 'clipboard-modal-save-btn'].forEach(id => {
      const node = $(`#${id}`);
      if (!node) return;
      node.disabled = !canWrite || !hasDraft;
    });

    ['clipboard-file-save-btn', 'clipboard-card-file-save-btn'].forEach(id => {
      const node = $(`#${id}`);
      if (!node) return;
      node.disabled = !canWrite || !hasPendingFiles;
    });

    ['clipboard-clear-btn'].forEach(id => {
      const node = $(`#${id}`);
      if (!node) return;
      node.disabled = !canWrite || !hasHistory;
    });

    ['clipboard-card-file-select-btn', 'clipboard-file-select-btn'].forEach(id => {
      const node = $(`#${id}`);
      if (!node) return;
      node.disabled = !canPickFiles;
    });

    ['clipboard-card-file-clear-btn', 'clipboard-file-clear-btn'].forEach(id => {
      const node = $(`#${id}`);
      if (!node) return;
      node.disabled = uploadState.active || !hasPendingFiles;
    });

    const copyCurrent = $('#clipboard-copy-current-btn');
    if (copyCurrent) copyCurrent.disabled = !hasDraft;

    ['clipboard-card-dropzone', 'clipboard-file-dropzone'].forEach(id => {
      const node = $(`#${id}`);
      if (!node) return;
      node.classList.toggle('is-disabled', !canPickFiles);
      node.setAttribute('aria-disabled', String(!canPickFiles));
    });
  }

  function render() {
    const draft = loadDraft();
    syncEditors(draft);

    const count = $('#clipboard-count-compact');
    if (count) count.textContent = `${historyCache.length} 条记录`;

    renderCardHistory(historyCache);
    renderModalHistory(historyCache);
    renderPendingFiles();
    syncActionAvailability();
  }

  function bindEditor(id) {
    const input = $(`#${id}`);
    if (!input) return;

    input.value = loadDraft();
    input.addEventListener('input', () => setDraft(input.value, id));
    input.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        void saveTextEntry(input.value);
      }
    });
  }

  function bindFilePicker(inputId, buttonId) {
    const input = $(`#${inputId}`);
    const button = $(`#${buttonId}`);
    if (!input || !button) return;

    button.addEventListener('click', () => {
      if (button.disabled) return;
      input.click();
    });

    input.addEventListener('change', e => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      setPendingFiles(files, true);
      setStatus(`已加入 ${files.length} 个待上传文件。`);
      input.value = '';
    });
  }

  function bindDropzone(zoneId, inputId) {
    const zone = $(`#${zoneId}`);
    const input = $(`#${inputId}`);
    if (!zone || !input) return;

    const openPicker = () => {
      if (zone.classList.contains('is-disabled')) return;
      input.click();
    };

    zone.addEventListener('click', openPicker);
    zone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    });

    zone.addEventListener('dragenter', e => {
      if (zone.classList.contains('is-disabled')) return;
      e.preventDefault();
      zone.classList.add('is-dragover');
    });

    zone.addEventListener('dragover', e => {
      if (zone.classList.contains('is-disabled')) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      zone.classList.add('is-dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('is-dragover');
    });

    zone.addEventListener('drop', e => {
      if (zone.classList.contains('is-disabled')) return;
      e.preventDefault();
      zone.classList.remove('is-dragover');
      const files = Array.from(e.dataTransfer?.files || []);
      if (!files.length) {
        setStatus('请拖入文件，而不是文本或链接。', { error: true });
        return;
      }
      setPendingFiles(files, true);
      setStatus(`已加入 ${files.length} 个待上传文件。`);
    });
  }

  function bindFileControls() {
    bindFilePicker('clipboard-card-file-input', 'clipboard-card-file-select-btn');
    bindFilePicker('clipboard-file-input', 'clipboard-file-select-btn');
    FILE_DROPZONE_CONFIG.forEach(({ zoneId, inputId }) => bindDropzone(zoneId, inputId));

    $('#clipboard-card-file-save-btn')?.addEventListener('click', () => void savePendingFiles());
    $('#clipboard-file-save-btn')?.addEventListener('click', () => void savePendingFiles());
    $('#clipboard-card-file-clear-btn')?.addEventListener('click', () => clearPendingFiles());
    $('#clipboard-file-clear-btn')?.addEventListener('click', () => clearPendingFiles());
  }

  async function saveTextEntry(rawText = loadDraft()) {
    const text = String(rawText || '').trim();
    if (!text) {
      setStatus('没有可保存的内容。', { error: true });
      return;
    }
    if (!serviceReady) {
      setStatus('服务器尚未连接，暂时不能保存。', { error: true });
      return;
    }
    if (uploadState.active) {
      setStatus('文件上传进行中，请稍后再保存文本。', { error: true });
      return;
    }
    if (text.length > getUploadLimits().maxTextLength) {
      setStatus(`文本内容过长，最多可保存 ${getUploadLimits().maxTextLength} 个字符。`, { error: true });
      return;
    }

    try {
      const data = await requestJson('/api/clipboard/text', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      historyCache = normalizeHistory(data.items);
      setDraft('');
      render();
      setStatus('文本已保存到服务器。');
    } catch (err) {
      console.warn('Text entry save failed:', err);
      setStatus(err.message || '保存文本失败，请稍后重试。', { error: true });
    }
  }

  function setPendingFiles(files, append = false) {
    const nextFiles = Array.isArray(files) ? files.filter(file => file instanceof File) : [];
    const merged = mergePendingFiles(nextFiles, append);
    const validation = validatePendingFiles(merged.files);
    if (!validation.ok) {
      return { ok: false, message: validation.message };
    }
    pendingFiles = merged.files;
    renderPendingFiles();
    return {
      ok: true,
      addedCount: merged.addedCount,
      skippedCount: merged.skippedCount,
      totalBytes: validation.totalBytes,
      totalCount: pendingFiles.length,
    };
  }

  function uploadSingleFile(uploadId, index, file, uploadedBefore, totalBytes) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `/api/clipboard/uploads/${encodeURIComponent(uploadId)}/${index}`);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
      xhr.setRequestHeader('X-File-Size', String(file.size));

      xhr.upload.onprogress = event => {
        const loaded = uploadedBefore + (event.lengthComputable ? event.loaded : 0);
        const percent = totalBytes > 0 ? Math.round((loaded / totalBytes) * 100) : 0;
        setUploadState({
          active: true,
          percent,
          message: `正在上传 ${file.name} · ${percent}% · ${formatBytes(loaded)} / ${formatBytes(totalBytes)}`,
          error: false,
        });
      };

      xhr.onerror = () => reject(new Error(`上传 ${file.name} 失败，请检查网络或服务器状态。`));

      xhr.onload = () => {
        let payload = {};
        try {
          payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch {}

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(payload);
          return;
        }

        reject(new Error(payload?.message || `上传 ${file.name} 失败（${xhr.status}）。`));
      };

      xhr.send(file);
    });
  }

  async function savePendingFiles() {
    if (!pendingFiles.length) {
      setStatus('没有待上传的文件。', { error: true });
      return;
    }
    if (!serviceReady) {
      setStatus('服务器尚未连接，暂时不能上传文件。', { error: true });
      return;
    }
    if (uploadState.active) {
      setStatus('已有文件上传任务正在进行。', { error: true });
      return;
    }

    const validation = validatePendingFiles(pendingFiles);
    if (!validation.ok) {
      setStatus(validation.message, { error: true, duration: 2800 });
      return;
    }

    const totalBytes = validation.totalBytes;
    let uploadedBytes = 0;

    try {
      setUploadState({
        active: true,
        percent: 0,
        message: `准备上传 ${pendingFiles.length} 个文件 · 共 ${formatBytes(totalBytes)}`,
        error: false,
      });

      const init = await requestJson('/api/clipboard/uploads/init', {
        method: 'POST',
        body: JSON.stringify({
          files: pendingFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type || '',
          })),
        }),
      });

      currentUploadSessionId = init.uploadId;

      for (let index = 0; index < pendingFiles.length; index += 1) {
        const file = pendingFiles[index];
        await uploadSingleFile(init.uploadId, index, file, uploadedBytes, totalBytes);
        uploadedBytes += file.size;
        const percent = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 100;
        setUploadState({
          active: true,
          percent,
          message: `已上传 ${index + 1}/${pendingFiles.length} 个文件 · ${formatBytes(uploadedBytes)} / ${formatBytes(totalBytes)}`,
          error: false,
        });
      }

      const complete = await requestJson(`/api/clipboard/uploads/${encodeURIComponent(init.uploadId)}/complete`, {
        method: 'POST',
      });

      currentUploadSessionId = '';
      historyCache = normalizeHistory(complete.items);
      pendingFiles = [];
      render();
      setUploadState({
        active: false,
        percent: 100,
        message: `已上传 ${complete.entry?.fileCount || 0} 个文件到服务器 · ${formatBytes(complete.entry?.totalBytes || totalBytes)}`,
        error: false,
      });
      setStatus('文件已上传到服务器，其他设备现在也可以访问。');
    } catch (err) {
      console.warn('File upload failed:', err);
      await cancelUploadSession();
      setUploadState({
        active: false,
        percent: 0,
        message: err.message || '文件上传失败，请稍后重试。',
        error: true,
      });
      setStatus(err.message || '文件上传失败，请稍后重试。', { error: true, duration: 2600 });
      renderPendingFiles();
    }
  }

  function bindFilePicker(inputId, buttonId) {
    const input = $(`#${inputId}`);
    const button = $(`#${buttonId}`);
    if (!input || !button) return;

    button.addEventListener('click', () => {
      if (button.disabled) return;
      input.click();
    });

    input.addEventListener('change', e => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const result = setPendingFiles(files, true);
      if (result?.ok) {
        setStatus(describePendingFiles(result));
      } else if (result?.message) {
        setStatus(result.message, { error: true, duration: 2800 });
      }
      input.value = '';
    });
  }

  function bindDropzone(zoneId, inputId) {
    const zone = $(`#${zoneId}`);
    const input = $(`#${inputId}`);
    if (!zone || !input) return;

    const openPicker = () => {
      if (zone.classList.contains('is-disabled')) return;
      input.click();
    };

    zone.addEventListener('click', openPicker);
    zone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    });

    zone.addEventListener('dragenter', e => {
      if (zone.classList.contains('is-disabled')) return;
      e.preventDefault();
      zone.classList.add('is-dragover');
    });

    zone.addEventListener('dragover', e => {
      if (zone.classList.contains('is-disabled')) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      zone.classList.add('is-dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('is-dragover');
    });

    zone.addEventListener('drop', e => {
      if (zone.classList.contains('is-disabled')) return;
      e.preventDefault();
      zone.classList.remove('is-dragover');
      const files = Array.from(e.dataTransfer?.files || []);
      if (!files.length) {
        setStatus('请拖入文件，而不是文本或链接。', { error: true });
        return;
      }
      const result = setPendingFiles(files, true);
      if (result?.ok) {
        setStatus(describePendingFiles(result));
      } else if (result?.message) {
        setStatus(result.message, { error: true, duration: 2800 });
      }
    });
  }

  function bindFileControls() {
    bindFilePicker('clipboard-card-file-input', 'clipboard-card-file-select-btn');
    bindFilePicker('clipboard-file-input', 'clipboard-file-select-btn');
    FILE_DROPZONE_CONFIG.forEach(({ zoneId, inputId }) => bindDropzone(zoneId, inputId));

    $('#clipboard-card-file-save-btn')?.addEventListener('click', () => void savePendingFiles());
    $('#clipboard-file-save-btn')?.addEventListener('click', () => void savePendingFiles());
    $('#clipboard-card-file-clear-btn')?.addEventListener('click', () => clearPendingFiles());
    $('#clipboard-file-clear-btn')?.addEventListener('click', () => clearPendingFiles());
  }

  function initAutoRefresh() {
    setInterval(() => {
      if (document.hidden) return;
      void refreshHistory({ silent: true });
    }, POLL_INTERVAL);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        void refreshHistory({ silent: true });
      }
    });

    window.addEventListener('pagehide', () => {
      if (uploadState.active) {
        void cancelUploadSession();
      }
    });
  }

  function init() {
    render();
    bindEditor('clipboard-card-input');
    bindEditor('clipboard-area');
    bindFileControls();

    $('#clipboard-save-btn')?.addEventListener('click', () => void saveTextEntry(loadDraft()));
    $('#clipboard-modal-save-btn')?.addEventListener('click', () => void saveTextEntry(loadDraft()));
    $('#clipboard-copy-current-btn')?.addEventListener('click', () => void copyText(loadDraft()));
    $('#clipboard-clear-btn')?.addEventListener('click', () => void clearAll());

    setUploadState(uploadState);
    setBaseStatus(baseStatusMessage, baseStatusIsError);
    initAutoRefresh();
    void refreshHistory();
  }

  return { init, render, refresh: refreshHistory };
})();

const ClockCalendarModal = (() => {
  let viewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  function renderCalendar() {
    const label = $('#calendar-month-label');
    const grid = $('#calendar-grid');
    if (!label || !grid) return;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const today = new Date();
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    label.textContent = `${year}年${Clock.MONTHS[month]}`;
    grid.innerHTML = '';

    for (let i = 0; i < 42; i++) {
      const cell = el('div', 'calendar-day');
      const number = el('span', 'calendar-day-number');
      let dayNumber = i - offset + 1;
      let currentMonth = month;
      let currentYear = year;

      if (dayNumber <= 0) {
        currentMonth = month - 1;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear -= 1;
        }
        dayNumber = daysInPrevMonth + dayNumber;
        cell.classList.add('is-muted');
      } else if (dayNumber > daysInMonth) {
        currentMonth = month + 1;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear += 1;
        }
        dayNumber -= daysInMonth;
        cell.classList.add('is-muted');
      }

      number.textContent = dayNumber;
      cell.appendChild(number);

      if (
        dayNumber === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear()
      ) {
        cell.classList.add('is-today');
      }

      grid.appendChild(cell);
    }
  }

  function open() {
    const overlay = $('#clock-modal-overlay');
    if (!overlay || overlay.classList.contains('open')) return;
    viewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    renderCalendar();
    overlay.classList.add('open');
    OverlayLock.lock();
  }

  function close() {
    const overlay = $('#clock-modal-overlay');
    if (!overlay || !overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    OverlayLock.unlock();
  }

  function init() {
    const card = $('#clock-widget-compact');
    const openBtn = $('#clock-widget-open');
    const closeBtn = $('#clock-modal-close');
    const overlay = $('#clock-modal-overlay');

    card?.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      open();
    });

    openBtn?.addEventListener('click', e => {
      e.stopPropagation();
      open();
    });

    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', e => {
      if (e.target === overlay) close();
    });

    $('#clock-prev-month')?.addEventListener('click', () => {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
      renderCalendar();
    });

    $('#clock-next-month')?.addEventListener('click', () => {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
      renderCalendar();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay?.classList.contains('open')) close();
    });
  }

  return { init, open, close };
})();

const WeatherDetailsModal = (() => {
  function open() {
    const overlay = $('#weather-modal-overlay');
    if (!overlay || overlay.classList.contains('open')) return;
    overlay.classList.add('open');
    OverlayLock.lock();
    void WeatherWidget.fetchWeather({ silent: true });
  }

  function close() {
    const overlay = $('#weather-modal-overlay');
    if (!overlay || !overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    OverlayLock.unlock();
  }

  function init() {
    const card = $('#weather-widget-compact');
    const openBtn = $('#weather-widget-open');
    const closeBtn = $('#weather-modal-close');
    const overlay = $('#weather-modal-overlay');

    card?.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      open();
    });

    openBtn?.addEventListener('click', e => {
      e.stopPropagation();
      open();
    });

    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', e => {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay?.classList.contains('open')) close();
    });
  }

  return { init, open, close };
})();

const TodoDetailsModal = (() => {
  function open() {
    const overlay = $('#todo-modal-overlay');
    if (!overlay || overlay.classList.contains('open')) return;
    overlay.classList.add('open');
    OverlayLock.lock();
    setTimeout(() => $('#todo-input')?.focus(), 80);
  }

  function close() {
    const overlay = $('#todo-modal-overlay');
    if (!overlay || !overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    OverlayLock.unlock();
  }

  function init() {
    const openBtn = $('#todo-widget-open');
    const closeBtn = $('#todo-modal-close');
    const overlay = $('#todo-modal-overlay');

    openBtn?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', e => {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay?.classList.contains('open')) close();
    });
  }

  return { init, open, close };
})();

const ClipboardHistoryModal = (() => {
  function open() {
    const overlay = $('#clipboard-modal-overlay');
    if (!overlay || overlay.classList.contains('open')) return;
    overlay.classList.add('open');
    OverlayLock.lock();
    setTimeout(() => $('#clipboard-area')?.focus(), 80);
  }

  function close() {
    const overlay = $('#clipboard-modal-overlay');
    if (!overlay || !overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    OverlayLock.unlock();
  }

  function init() {
    const card = $('#clipboard-widget-compact');
    const openBtn = $('#clipboard-widget-open');
    const closeBtn = $('#clipboard-modal-close');
    const overlay = $('#clipboard-modal-overlay');

    card?.addEventListener('click', e => {
      if (e.target.closest('button') || !e.target.closest('.widget-card-head')) return;
      open();
    });

    openBtn?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', e => {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay?.classList.contains('open')) close();
    });
  }

  return { init, open, close };
})();

document.addEventListener('DOMContentLoaded', () => {
  Clock.init();
  Background.init();
  const serverStateReady = ServerState.init();
  Theme.init();
  ThemePalette.init();
  Search.init();
  CursorEffects.init();

  WeatherWidget.init();
  Shortcuts.render();
  ShortcutModal.init();
  ClipboardHubServer.init();
  ClockCalendarModal.init();
  WeatherDetailsModal.init();
  ClipboardHistoryModal.init();
  Recent.init();
  Bookmarks.init();
  BookmarkModal.init();
  SettingsPanel.init();
  TopWidgetsPanel.init();

  void serverStateReady.then(() => {
    Theme.apply(ServerState.getTheme(), false);
    ThemePalette.applyCurrent();
    Shortcuts.render();
    Recent.render();
    Bookmarks.render();
  });
});
