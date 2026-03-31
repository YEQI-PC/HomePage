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
  ENGINE:     'hp_engine',
  CUSTOM_COLORS: 'hp_custom_colors',
  CURSOR_EFFECTS: 'hp_cursor_effects',
};

const ENGINES = {
  google: { label: 'Google',     icon: 'G',  url: 'https://www.google.com/search?q=' },
  baidu:  { label: 'Baidu 百度', icon: '百', url: 'https://www.baidu.com/s?wd=' },
  bing:   { label: 'Bing',       icon: 'B',  url: 'https://www.bing.com/search?q=' },
  ddg:    { label: 'DuckDuckGo', icon: 'D',  url: 'https://duckduckgo.com/?q=' },
};

const DEFAULT_SHORTCUTS = [
  // 常用
  { id: 's1',  group: '常用',  name: 'Google',     url: 'https://www.google.com',    icon: '🔍', desc: '搜索引擎' },
  { id: 's2',  group: '常用',  name: 'GitHub',     url: 'https://github.com',        icon: '🐙', desc: '代码托管' },
  { id: 's3',  group: '常用',  name: 'YouTube',    url: 'https://www.youtube.com',   icon: '▶️', desc: '视频平台' },
  { id: 's4',  group: '常用',  name: 'Bilibili',   url: 'https://www.bilibili.com',  icon: '📺', desc: 'B站' },
  { id: 's5',  group: '常用',  name: 'Twitter/X',  url: 'https://x.com',             icon: '𝕏',  desc: '社交媒体' },
  // 工具
  { id: 's6',  group: '工具',  name: 'ChatGPT',    url: 'https://chat.openai.com',   icon: '🤖', desc: 'AI助手' },
  { id: 's7',  group: '工具',  name: 'Notion',     url: 'https://www.notion.so',     icon: '📝', desc: '笔记协作' },
  { id: 's8',  group: '工具',  name: 'Figma',      url: 'https://www.figma.com',     icon: '🎨', desc: '设计工具' },
  { id: 's9',  group: '工具',  name: 'VS Code',    url: 'https://vscode.dev',        icon: '💻', desc: '在线编辑器' },
  // 学习
  { id: 's10', group: '学习',  name: 'MDN',        url: 'https://developer.mozilla.org', icon: '📖', desc: 'Web文档' },
  { id: 's11', group: '学习',  name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '🧩', desc: '技术问答' },
  { id: 's12', group: '学习',  name: 'LeetCode',   url: 'https://leetcode.com',      icon: '⚡', desc: '算法练习' },
  { id: 's13', group: '学习',  name: 'Wikipedia',  url: 'https://www.wikipedia.org', icon: '📚', desc: '百科全书' },
  // Beihang 北航
  { id: 's14', group: 'Beihang 北航',  name: '研究生院',  url: 'https://gsmis.buaa.edu.cn', icon: '🎓', desc: '研究生管理系统' },
  { id: 's15', group: 'Beihang 北航',  name: '北航邮箱',  url: 'https://mail.buaa.edu.cn',  icon: '📧', desc: '北航邮箱系统' },
  { id: 's16', group: 'Beihang 北航',  name: '教务处',    url: 'https://jiaowu.buaa.edu.cn', icon: '📋', desc: '本科教务系统' },
  { id: 's17', group: 'Beihang 北航',  name: '图书馆',    url: 'https://lib.buaa.edu.cn',    icon: '📚', desc: '北航图书馆' },
  { id: 's18', group: 'Beihang 北航',  name: 'VPN',       url: 'https://e.buaa.edu.cn',      icon: '🔐', desc: '校园VPN' },
];

const WEATHER_CODE_MAP = {
  '113': '☀️', '116': '⛅', '119': '🌥️', '122': '☁️',
  '143': '🌫️', '176': '🌦️', '179': '🌨️', '182': '🌧️',
  '185': '🌧️', '200': '⛈️', '227': '🌨️', '230': '❄️',
  '248': '🌫️', '260': '🌫️', '263': '🌦️', '266': '🌧️',
  '281': '🌧️', '284': '🌧️', '293': '🌦️', '296': '🌧️',
  '299': '🌧️', '302': '🌧️', '305': '⛈️', '308': '⛈️',
  '311': '🌧️', '314': '🌧️', '317': '🌨️', '320': '🌨️',
  '323': '🌨️', '326': '❄️', '329': '❄️', '332': '❄️',
  '335': '❄️', '338': '❄️', '350': '🌧️', '353': '🌦️',
  '356': '⛈️', '359': '⛈️', '362': '🌨️', '365': '🌨️',
  '368': '🌨️', '371': '❄️', '374': '🌧️', '377': '🌧️',
  '386': '⛈️', '389': '⛈️', '392': '🌨️', '395': '❄️',
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
  if (diff < 60)    return '刚刚';
  if (diff < 3600)  return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
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

/* ================================================================
   Clock
   ================================================================ */

const Clock = (() => {
  const DAYS = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = new Date();
    const timeEl = $('#clock-time');
    const dateEl = $('#clock-date');
    if (!timeEl) return;

    timeEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    dateEl.textContent = `${DAYS[now.getDay()]} · ${y}年${m}月${d}日`;
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
    const loadingEl  = $('#weather-loading');
    const contentEl  = $('#weather-content');

    try {
      const res = await fetch('https://wttr.in/?format=j1', { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json();
      const cur  = data.current_condition?.[0];
      if (!cur) throw new Error('no data');

      const code = cur.weatherCode;
      const icon = WEATHER_CODE_MAP[String(code)] ?? '🌡️';

      $('#weather-icon').textContent    = icon;
      $('#weather-temp').textContent    = `${cur.temp_C}°C`;
      $('#weather-feels').textContent   = `体感 ${cur.FeelsLikeC}°C`;
      $('#weather-desc').textContent    = cur.lang_zh?.[0]?.value ?? cur.weatherDesc?.[0]?.value ?? '';
      $('#weather-humidity').textContent = `💧 ${cur.humidity}%`;
      $('#weather-wind').textContent    = `🌬 ${cur.windspeedKmph}km/h`;

      loadingEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      if (loadingEl) {
        loadingEl.innerHTML = `<span class="weather-error">天气获取失败</span>`;
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
    $('#todo-count').textContent = active;
  }

  function render() {
    const list  = load();
    const ul    = $('#todo-list');
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

    $('#todo-add-btn').addEventListener('click', () => {
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

  return { init };
})();

/* ================================================================
   Notes
   ================================================================ */

const Notes = (() => {
  let saveTimer = null;

  function init() {
    const area = $('#notes-area');
    const indicator = $('#notes-saved');

    area.value = lsGet(LS.NOTES, '');

    area.addEventListener('input', () => {
      indicator.style.opacity = '0';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        lsSet(LS.NOTES, area.value);
        indicator.style.opacity = '1';
      }, 800);
    });
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
  const bgLayer   = $('#bg-layer');
  const bgPreview = $('#bg-preview');
  const bgStatus  = $('#bg-status');

  function setStatus(msg) {
    if (bgStatus) bgStatus.textContent = msg;
  }

  function applyBg(dataUrl, label = '') {
    bgLayer.style.backgroundImage = `url("${dataUrl}")`;
    document.body.classList.add('has-bg');
    if (bgPreview) bgPreview.style.backgroundImage = `url("${dataUrl}")`;
    setStatus(label);
    lsSet(LS.BG, dataUrl);

    // Load image into canvas for color extraction
    // crossOrigin must be set before src to avoid tainted-canvas errors on external URLs
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
    resetExtractedColors();
  }

  /**
   * Samples pixels from the image using Canvas and derives a dominant
   * accent colour, then updates CSS custom properties.
   */
  function extractColors(imgEl) {
    try {
      const canvas = $('#color-canvas');
      const ctx    = canvas.getContext('2d');
      const SIZE   = 80; // sample at reduced size for performance

      canvas.width  = SIZE;
      canvas.height = SIZE;
      ctx.drawImage(imgEl, 0, 0, SIZE, SIZE);

      const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
      let r = 0, g = 0, b = 0, count = 0;

      // Step of 16 = 4 channels (RGBA) × 4, meaning we sample 1 pixel out of
      // every 4 consecutive pixels. Sufficient for colour averaging and faster
      // than a full scan.
      for (let i = 0; i < data.length; i += 16) {
        const pr = data[i], pg = data[i+1], pb = data[i+2], pa = data[i+3];
        if (pa < 128) continue;
        // Skip near-white (>230) and near-black (<25) pixels so the extracted
        // accent reflects the image's actual chromatic content, not its
        // highlights or shadows.
        const brightness = (pr + pg + pb) / 3;
        if (brightness > 230 || brightness < 25) continue;
        r += pr; g += pg; b += pb; count++;
      }

      if (count === 0) return;
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      // Desaturate slightly and normalise lightness for a refined, low-saturation
      // palette that fits the minimalist aesthetic:
      //   - saturation capped at 0.55  → avoids overly vivid accent colours
      //   - lightness clamped [0.42, 0.65] → ensures readable contrast on both themes
      const [h, s, l] = rgbToHsl(r, g, b);
      const sPrime = Math.min(s, 0.55);
      const lPrime = Math.max(0.42, Math.min(0.65, l));
      const [pr2, pg2, pb2] = hslToRgb(h, sPrime, lPrime);

      const primary      = `rgb(${pr2},${pg2},${pb2})`;
      const primaryLight = `rgb(${Math.min(255,pr2+30)},${Math.min(255,pg2+30)},${Math.min(255,pb2+30)})`;
      const primaryDark  = `rgb(${Math.max(0,pr2-30)},${Math.max(0,pg2-30)},${Math.max(0,pb2-30)})`;

      const root = document.documentElement;
      root.style.setProperty('--primary',       primary);
      root.style.setProperty('--primary-light', primaryLight);
      root.style.setProperty('--primary-dark',  primaryDark);
    } catch (e) {
      // Canvas tainted (cross-origin image), ignore silently
    }
  }

  function resetExtractedColors() {
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-light');
    root.style.removeProperty('--primary-dark');
  }

  async function fetchAnimeBackground() {
    setStatus('加载中…');
    const btn = $('#fetch-anime-btn');
    const origText = btn.innerHTML;
    btn.innerHTML = '<span class="spinning">↻</span> 加载中…';
    btn.disabled = true;

    // Attempt up to 3 times to handle transient rate-limits or network errors
    const MAX_RETRIES = 3;
    let lastErr;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Use CORS proxy to avoid tainted canvas issues
        const res = await fetch('https://api.waifu.pics/sfw/waifu', {
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const { url } = await res.json();

        // Fetch image as blob → data URL so Canvas sampling works (avoids taint)
        const imgRes = await fetch(url, {
          signal: AbortSignal.timeout(15000),
          mode: 'cors'
        });
        if (!imgRes.ok) throw new Error('img fetch failed');
        const blob    = await imgRes.blob();
        const dataUrl = await blobToDataURL(blob);
        applyBg(dataUrl, '动漫壁纸');
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        if (attempt < MAX_RETRIES) {
          setStatus(`重试中 (${attempt}/${MAX_RETRIES})…`);
          await new Promise(r => setTimeout(r, 800 * attempt));
        }
      }
    }

    if (lastErr) {
      setStatus('加载失败，请稍后重试');
      console.error('Background fetch error:', lastErr);
    }
    btn.innerHTML = origText;
    btn.disabled = false;
  }

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function handleUpload(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => applyBg(e.target.result, file.name);
    reader.readAsDataURL(file);
  }

  function init() {
    // Restore saved background
    const saved = lsGet(LS.BG, null);
    if (saved) applyBg(saved, '已保存');

    $('#fetch-anime-btn').addEventListener('click', fetchAnimeBackground);

    $('#bg-upload').addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      e.target.value = '';
    });

    $('#clear-bg-btn').addEventListener('click', clearBg);
  }

  // ── Color math helpers ──

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
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
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
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

    // Initialize color pickers
    initColorPickers();

    // Initialize cursor effects toggle
    initCursorEffectsToggle();
  }

  function initColorPickers() {
    const primaryPicker = $('#primary-color-picker');
    const accentPicker = $('#accent-color-picker');
    const resetBtn = $('#reset-colors-btn');

    // Load saved colors
    const savedColors = lsGet(LS.CUSTOM_COLORS, null);
    if (savedColors) {
      primaryPicker.value = savedColors.primary;
      accentPicker.value = savedColors.accent;
      applyCustomColors(savedColors.primary, savedColors.accent);
    }

    // Primary color change
    primaryPicker.addEventListener('input', (e) => {
      const primary = e.target.value;
      const accent = accentPicker.value;
      applyCustomColors(primary, accent);
      lsSet(LS.CUSTOM_COLORS, { primary, accent });
    });

    // Accent color change
    accentPicker.addEventListener('input', (e) => {
      const primary = primaryPicker.value;
      const accent = e.target.value;
      applyCustomColors(primary, accent);
      lsSet(LS.CUSTOM_COLORS, { primary, accent });
    });

    // Reset colors
    resetBtn.addEventListener('click', () => {
      primaryPicker.value = '#8b7fd4';
      accentPicker.value = '#c9a0dc';
      applyCustomColors('#8b7fd4', '#c9a0dc');
      lsSet(LS.CUSTOM_COLORS, null);
    });
  }

  function applyCustomColors(primary, accent) {
    const root = document.documentElement;

    // Convert hex to RGB for manipulation
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb = hexToRgb(primary);
    if (rgb) {
      root.style.setProperty('--primary', primary);
      root.style.setProperty('--primary-light',
        `rgb(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)})`);
      root.style.setProperty('--primary-dark',
        `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)})`);
    }

    root.style.setProperty('--accent', accent);
  }

  function initCursorEffectsToggle() {
    const toggle = $('#cursor-effects-toggle');
    const isEnabled = lsGet(LS.CURSOR_EFFECTS, true);
    toggle.checked = isEnabled;

    toggle.addEventListener('change', (e) => {
      CursorEffects.toggle();
    });
  }

  return { init };
})();

/* ================================================================
   Boot
   ================================================================ */

// Mouse Cursor Effects
const CursorEffects = (() => {
  let cursorDot = null;
  let isEnabled = true;

  function init() {
    // Check if user has enabled cursor effects
    isEnabled = lsGet('hp_cursor_effects', true);
    if (!isEnabled) return;

    // Create cursor dot
    cursorDot = el('div', 'cursor-dot');
    document.body.appendChild(cursorDot);

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      if (!cursorDot) return;
      cursorDot.style.left = e.clientX - 4 + 'px';
      cursorDot.style.top = e.clientY - 4 + 'px';
      if (!cursorDot.classList.contains('active')) {
        cursorDot.classList.add('active');
      }
    });

    // Add click particle effect
    document.addEventListener('click', (e) => {
      if (!isEnabled) return;
      createClickParticles(e.clientX, e.clientY);
    });
  }

  function createClickParticles(x, y) {
    const particleCount = 8;
    const angleStep = (Math.PI * 2) / particleCount;

    for (let i = 0; i < particleCount; i++) {
      const particle = el('div', 'click-particle');
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';

      const angle = angleStep * i;
      const distance = 30 + Math.random() * 20;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');

      document.body.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => particle.remove(), 600);
    }
  }

  function toggle() {
    isEnabled = !isEnabled;
    lsSet('hp_cursor_effects', isEnabled);
    if (isEnabled) {
      init();
    } else {
      if (cursorDot) {
        cursorDot.remove();
        cursorDot = null;
      }
    }
    return isEnabled;
  }

  return { init, toggle };
})();

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Clock.init();
  Weather.init();
  Search.init();
  Shortcuts.render();
  ShortcutModal.init();
  Todo.init();
  Notes.init();
  Recent.init();
  Bookmarks.init();
  BookmarkModal.init();
  Background.init();
  SettingsPanel.init();
  CursorEffects.init();
});
