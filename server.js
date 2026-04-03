'use strict';

const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = __dirname;
const STORAGE_DIR = path.join(ROOT_DIR, 'storage');
const CLIPBOARD_DIR = path.join(STORAGE_DIR, 'clipboard');
const HISTORY_FILE = path.join(CLIPBOARD_DIR, 'history.json');
const FILES_DIR = path.join(CLIPBOARD_DIR, 'files');
const UPLOADS_DIR = path.join(CLIPBOARD_DIR, 'uploads');
const APP_STATE_FILE = path.join(STORAGE_DIR, 'app-state.json');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 3000);

const MAX_HISTORY_ITEMS = 40;
const MAX_TEXT_LENGTH = 200000;
const MAX_UPLOAD_FILES = 24;
const MAX_FILE_SIZE = 256 * 1024 * 1024;
const MAX_BATCH_SIZE = 768 * 1024 * 1024;
const JSON_LIMIT = 1024 * 1024;
const UPLOAD_SESSION_TTL = 2 * 60 * 60 * 1000;
const WEATHER_TIMEOUT = 10000;
const IP_LOOKUP_TIMEOUT = 6000;
const WEATHER_CACHE_TTL = 5 * 60 * 1000;
const VALID_ENGINES = new Set(['google', 'baidu', 'bing', 'ddg']);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const uploadSessions = new Map();
const weatherCache = new Map();
const weatherRequests = new Map();
const staticAssetCache = new Map();
let storageQueue = Promise.resolve();
let appStateCache = null;
let historyCache = null;
let storageReadyPromise = null;

function getClipboardHealthPayload() {
  return {
    ok: true,
    status: 'ok',
    storage: 'server',
    now: Date.now(),
    limits: {
      maxHistoryItems: MAX_HISTORY_ITEMS,
      maxTextLength: MAX_TEXT_LENGTH,
      maxUploadFiles: MAX_UPLOAD_FILES,
      maxFileSize: MAX_FILE_SIZE,
      maxBatchSize: MAX_BATCH_SIZE,
    },
  };
}

function createId() {
  return crypto.randomUUID();
}

function ensureWithinRoot(targetPath, rootPath) {
  const resolvedTarget = path.resolve(targetPath);
  const resolvedRoot = path.resolve(rootPath);
  return resolvedTarget === resolvedRoot || resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`);
}

function queueStorage(task) {
  const next = storageQueue.then(task, task);
  storageQueue = next.catch(() => {});
  return next;
}

function ensureStorage() {
  if (!storageReadyPromise) {
    storageReadyPromise = (async () => {
      await fsp.mkdir(FILES_DIR, { recursive: true });
      await fsp.mkdir(UPLOADS_DIR, { recursive: true });
      try {
        await fsp.access(HISTORY_FILE, fs.constants.F_OK);
      } catch {
        await fsp.writeFile(HISTORY_FILE, '[]', 'utf8');
      }
      try {
        await fsp.access(APP_STATE_FILE, fs.constants.F_OK);
      } catch {
        await fsp.writeFile(APP_STATE_FILE, '{}', 'utf8');
      }
    })();

    storageReadyPromise.catch(() => {
      storageReadyPromise = null;
    });
  }

  return storageReadyPromise;
}

function clampNumber(value, min, max, fallback = min) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function makeTextPreview(text) {
  const compact = String(text || '').replace(/\s+/g, ' ').trim();
  return compact.length <= 120 ? compact : `${compact.slice(0, 120)}...`;
}

function cloneJson(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function sanitizeHttpUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';

  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.href;
  } catch {
    return '';
  }
}

function normalizeWeatherSettings(settings) {
  if (!settings || typeof settings !== 'object') return null;
  return {
    location: String(settings.location || '').trim().slice(0, 120),
  };
}

function normalizeTheme(theme) {
  return theme === 'dark' || theme === 'light' ? theme : null;
}

function normalizeEngine(engine) {
  return VALID_ENGINES.has(engine) ? engine : null;
}

function normalizeHexColor(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return '';
  const hex = match[1].toLowerCase();
  return `#${hex.length === 3 ? hex.split('').map(ch => ch + ch).join('') : hex}`;
}

function normalizeCustomColors(value) {
  if (value === null) return null;
  if (!value || typeof value !== 'object') return null;

  const primary = normalizeHexColor(value.primary);
  const accent = normalizeHexColor(value.accent);
  if (!primary || !accent) return null;

  return { primary, accent };
}

function normalizeWidgetVisibility(value) {
  if (!value || typeof value !== 'object') return null;

  const normalized = {
    clock: true,
    weather: true,
    clipboard: true,
  };

  let hasAny = false;
  ['clock', 'weather', 'clipboard'].forEach(key => {
    if (typeof value[key] === 'boolean') {
      normalized[key] = value[key];
      hasAny = true;
    }
  });

  if (!hasAny && typeof value.notes === 'boolean') {
    normalized.clipboard = value.notes;
    hasAny = true;
  }

  return hasAny ? normalized : null;
}

function normalizePreferences(preferences) {
  if (!preferences || typeof preferences !== 'object') return null;

  return {
    theme: normalizeTheme(preferences.theme),
    engine: normalizeEngine(preferences.engine),
    cursorEffects: typeof preferences.cursorEffects === 'boolean' ? preferences.cursorEffects : null,
    widgetVisibility: normalizeWidgetVisibility(preferences.widgetVisibility),
    customColors: Object.prototype.hasOwnProperty.call(preferences, 'customColors')
      ? normalizeCustomColors(preferences.customColors)
      : null,
  };
}

function normalizeShortcutItem(item) {
  if (!item || typeof item !== 'object') return null;
  const url = sanitizeHttpUrl(item.url);
  const name = String(item.name || '').trim().slice(0, 80);
  if (!url || !name) return null;

  return {
    id: typeof item.id === 'string' ? item.id : createId(),
    group: String(item.group || '其他').trim().slice(0, 40) || '其他',
    name,
    url,
    icon: String(item.icon || 'GO').trim().slice(0, 12) || 'GO',
    desc: String(item.desc || '').trim().slice(0, 160),
  };
}

function normalizeBookmarkItem(item) {
  if (!item || typeof item !== 'object') return null;
  const url = sanitizeHttpUrl(item.url);
  const name = String(item.name || '').trim().slice(0, 80);
  if (!url || !name) return null;

  return {
    id: typeof item.id === 'string' ? item.id : createId(),
    name,
    url,
    icon: String(item.icon || '').trim().slice(0, 12),
  };
}

function normalizeRecentItem(item) {
  if (!item || typeof item !== 'object') return null;
  const url = sanitizeHttpUrl(item.url);
  const name = String(item.name || '').trim().slice(0, 80);
  if (!url || !name) return null;

  return {
    name,
    url,
    icon: String(item.icon || '').trim().slice(0, 12),
    ts: clampNumber(item.ts, 0, Number.MAX_SAFE_INTEGER, Date.now()),
  };
}

function dedupeBy(items, getKey) {
  const seen = new Set();
  const list = [];
  items.forEach(item => {
    const key = getKey(item);
    if (!key || seen.has(key)) return;
    seen.add(key);
    list.push(item);
  });
  return list;
}

function normalizeAppState(state) {
  const normalized = {};

  if (Array.isArray(state?.shortcuts)) {
    normalized.shortcuts = dedupeBy(
      state.shortcuts.map(normalizeShortcutItem).filter(Boolean),
      item => item.id || `${item.group}:${item.name}:${item.url}`
    );
  } else {
    normalized.shortcuts = null;
  }

  if (Array.isArray(state?.bookmarks)) {
    normalized.bookmarks = dedupeBy(
      state.bookmarks.map(normalizeBookmarkItem).filter(Boolean),
      item => item.url
    );
  } else {
    normalized.bookmarks = null;
  }

  if (Array.isArray(state?.recent)) {
    normalized.recent = dedupeBy(
      state.recent
        .map(normalizeRecentItem)
        .filter(Boolean)
        .sort((a, b) => b.ts - a.ts),
      item => item.url
    ).slice(0, 12);
  } else {
    normalized.recent = null;
  }

  normalized.weatherSettings = normalizeWeatherSettings(state?.weatherSettings);
  normalized.preferences = normalizePreferences(state?.preferences);
  return normalized;
}

function formatHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;

  if (entry.type === 'files') {
    const files = Array.isArray(entry.files)
      ? entry.files
          .filter(file => file && typeof file.name === 'string' && typeof file.id === 'string')
          .map(file => ({
            id: file.id,
            name: file.name,
            size: clampNumber(file.size, 0, Number.MAX_SAFE_INTEGER, 0),
            type: typeof file.type === 'string' ? file.type : '',
          }))
      : [];

    if (!files.length || typeof entry.batchId !== 'string') return null;

    return {
      id: typeof entry.id === 'string' ? entry.id : createId(),
      type: 'files',
      batchId: entry.batchId,
      label: typeof entry.label === 'string' && entry.label.trim() ? entry.label : summarizeFileBatch(files),
      fileCount: clampNumber(entry.fileCount || files.length, 1, Number.MAX_SAFE_INTEGER, files.length),
      totalBytes: clampNumber(
        entry.totalBytes || files.reduce((sum, file) => sum + file.size, 0),
        0,
        Number.MAX_SAFE_INTEGER,
        0
      ),
      files,
      ts: clampNumber(entry.ts, 0, Number.MAX_SAFE_INTEGER, Date.now()),
    };
  }

  const text = typeof entry.text === 'string' ? entry.text : '';
  if (!text.trim()) return null;
  return {
    id: typeof entry.id === 'string' ? entry.id : createId(),
    type: 'text',
    text,
    preview: typeof entry.preview === 'string' && entry.preview.trim() ? entry.preview : makeTextPreview(text),
    ts: clampNumber(entry.ts, 0, Number.MAX_SAFE_INTEGER, Date.now()),
  };
}

async function readHistory() {
  if (historyCache !== null) return cloneJson(historyCache);
  await ensureStorage();
  try {
    const raw = await fsp.readFile(HISTORY_FILE, 'utf8');
    const list = JSON.parse(raw);
    historyCache = Array.isArray(list)
      ? list.map(formatHistoryEntry).filter(Boolean).sort((a, b) => b.ts - a.ts)
      : [];
  } catch {
    historyCache = [];
  }

  return cloneJson(historyCache);
}

async function writeHistory(items) {
  const normalized = items.map(formatHistoryEntry).filter(Boolean).sort((a, b) => b.ts - a.ts);
  historyCache = normalized;
  await fsp.writeFile(HISTORY_FILE, JSON.stringify(normalized, null, 2), 'utf8');
  return cloneJson(historyCache);
}

async function readAppState() {
  if (appStateCache) return cloneJson(appStateCache);
  await ensureStorage();

  try {
    const raw = await fsp.readFile(APP_STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    appStateCache = normalizeAppState(parsed);
  } catch {
    appStateCache = normalizeAppState({});
    await fsp.writeFile(APP_STATE_FILE, JSON.stringify(appStateCache, null, 2), 'utf8');
  }

  return cloneJson(appStateCache);
}

async function writeAppState(state) {
  const normalized = normalizeAppState(state || {});
  appStateCache = normalized;
  await fsp.writeFile(APP_STATE_FILE, JSON.stringify(normalized, null, 2), 'utf8');
  return cloneJson(appStateCache);
}

function sanitizeFileName(name) {
  const base = path.basename(String(name || '').trim() || 'file');
  return base.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, ' ').slice(0, 180) || 'file';
}

function buildStoredFileName(fileId, originalName) {
  return `${fileId}--${sanitizeFileName(originalName)}`;
}

function summarizeFileBatch(files) {
  if (!Array.isArray(files) || !files.length) return '未命名文件批次';
  if (files.length === 1) return files[0].name || '未命名文件';
  return `${files[0].name || '未命名文件'} 等 ${files.length} 个文件`;
}

async function deleteBatch(batchId) {
  if (!batchId) return;
  await fsp.rm(path.join(FILES_DIR, batchId), { recursive: true, force: true });
}

async function trimHistory(items) {
  const next = items.slice(0, MAX_HISTORY_ITEMS);
  const removed = items.slice(MAX_HISTORY_ITEMS).filter(item => item.type === 'files' && item.batchId);
  await Promise.all(removed.map(item => deleteBatch(item.batchId)));
  return next;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message, details = null) {
  sendJson(res, statusCode, {
    ok: false,
    message,
    details,
  });
}

function sendNoContent(res) {
  res.writeHead(204, { 'Cache-Control': 'no-store' });
  res.end();
}

function readJsonBody(req, limit = JSON_LIMIT) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      size += Buffer.byteLength(chunk);
      if (size > limit) {
        reject(Object.assign(new Error('Request body too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error('Invalid JSON payload'), { statusCode: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function normalizeIp(ip) {
  const raw = String(ip || '').trim();
  if (!raw) return '';
  if (raw === '::1') return '127.0.0.1';
  if (raw.startsWith('::ffff:')) return raw.slice(7);
  return raw;
}

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '')
    .split(',')
    .map(part => normalizeIp(part))
    .find(Boolean);

  return forwarded || normalizeIp(req.socket?.remoteAddress || '');
}

function isPrivateIpv4(ip) {
  return (
    /^10\./.test(ip) ||
    /^127\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    /^169\.254\./.test(ip)
  );
}

function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip.includes(':')) {
    return ip === '::1' || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:');
  }
  return isPrivateIpv4(ip);
}

function buildWeatherError(message, reason, extra = {}) {
  const error = new Error(message);
  error.statusCode = 502;
  error.details = { reason, ...extra };
  return error;
}

async function fetchJson(url, timeoutMs, headers = {}) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Accept: 'application/json',
      'User-Agent': 'HomePage/1.0',
      ...headers,
    },
  });

  if (!response.ok) {
    throw buildWeatherError(`Upstream HTTP ${response.status}`, 'upstream-http', {
      status: response.status,
      url,
    });
  }

  return response.json();
}

function getWeatherCache(cacheKey) {
  const cached = weatherCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.ts > WEATHER_CACHE_TTL) {
    weatherCache.delete(cacheKey);
    return null;
  }
  return cloneJson(cached.payload);
}

function setWeatherCache(cacheKey, payload) {
  weatherCache.set(cacheKey, {
    ts: Date.now(),
    payload: cloneJson(payload),
  });
}

async function loadWeatherPayload(cacheKey, loader) {
  const pending = weatherRequests.get(cacheKey);
  if (pending) {
    return cloneJson(await pending);
  }

  const request = (async () => {
    const payload = await loader();
    setWeatherCache(cacheKey, payload);
    return payload;
  })();

  weatherRequests.set(cacheKey, request);

  try {
    return cloneJson(await request);
  } finally {
    weatherRequests.delete(cacheKey);
  }
}

function buildWeakEtag(stat) {
  return `W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
}

function isAssetFresh(req, asset) {
  const ifNoneMatch = req.headers['if-none-match'];
  if (typeof ifNoneMatch === 'string' && ifNoneMatch.trim()) {
    return ifNoneMatch
      .split(',')
      .map(value => value.trim())
      .some(value => value === asset.etag || value === '*');
  }

  const ifModifiedSince = req.headers['if-modified-since'];
  if (typeof ifModifiedSince !== 'string' || !ifModifiedSince.trim()) return false;

  const since = Date.parse(ifModifiedSince);
  if (!Number.isFinite(since)) return false;
  return since >= Math.floor(asset.mtimeMs / 1000) * 1000;
}

async function getStaticAsset(filePath) {
  const stat = await fsp.stat(filePath);
  if (!stat.isFile()) return null;

  const cached = staticAssetCache.get(filePath);
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
    return cached;
  }

  const ext = path.extname(filePath).toLowerCase();
  const buffer = await fsp.readFile(filePath);
  const asset = {
    buffer,
    contentType: MIME_TYPES[ext] || 'application/octet-stream',
    etag: buildWeakEtag(stat),
    lastModified: new Date(stat.mtimeMs).toUTCString(),
    mtimeMs: stat.mtimeMs,
    size: buffer.length,
    cacheControl: ext === '.html'
      ? 'no-cache'
      : 'public, max-age=3600, stale-while-revalidate=86400',
  };

  staticAssetCache.set(filePath, asset);
  return asset;
}

async function lookupIpLocation(ip = '') {
  const target = ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : 'https://ipwho.is/';
  const data = await fetchJson(target, IP_LOOKUP_TIMEOUT);

  if (!data?.success) {
    throw buildWeatherError('IP location lookup failed', 'ip-lookup-failed', {
      ip: ip || '',
      url: target,
    });
  }

  return {
    ip: ip || String(data.ip || ''),
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    city: String(data.city || '').trim(),
    region: String(data.region || '').trim(),
    country: String(data.country || '').trim(),
  };
}

function buildLocationLabel(location) {
  return [location.city, location.region || location.country].filter(Boolean).join(', ') || location.country || '当前位置';
}

async function resolveAutoWeatherTarget(req) {
  const clientIp = getClientIp(req);
  const details = {
    clientIp,
    locationSource: '',
    diagnostic: '',
    displayLocation: '当前位置',
  };

  if (clientIp && !isPrivateIp(clientIp)) {
    try {
      const location = await lookupIpLocation(clientIp);
      return {
        target: `${location.latitude},${location.longitude}`,
        meta: {
          ...details,
          locationSource: 'client-ip',
          displayLocation: buildLocationLabel(location),
          sourceLabel: '客户端 IP 定位 · wttr.in',
        },
      };
    } catch (error) {
      details.diagnostic = '客户端 IP 定位不可用，已回退到服务器公网定位。';
    }
  } else if (clientIp) {
    details.diagnostic = '当前访问来自局域网或本机，已回退到服务器公网定位。';
  }

  try {
    const location = await lookupIpLocation();
    return {
      target: `${location.latitude},${location.longitude}`,
      meta: {
        ...details,
        locationSource: 'server-public-ip',
        displayLocation: buildLocationLabel(location),
        sourceLabel: '服务器公网定位 · wttr.in',
      },
    };
  } catch (error) {
    return {
      target: '',
      meta: {
        ...details,
        locationSource: 'wttr-auto',
        sourceLabel: '自动定位回退 · wttr.in',
        diagnostic: details.diagnostic
          ? `${String(details.diagnostic).replace(/。$/, '')}；服务器公网定位不可用，已直接请求 wttr.in 自动定位。`
          : 'IP 定位服务不可用，已直接请求 wttr.in 自动定位。',
      },
    };
  }
}

async function handleWeatherGet(req, res, url) {
  const manualLocation = String(url.searchParams.get('location') || '').trim();
  let target = '';
  let meta = {
    mode: manualLocation ? 'manual' : 'auto',
    displayLocation: manualLocation || '当前位置',
    locationSource: manualLocation ? 'manual-input' : 'unknown',
    sourceLabel: manualLocation ? '手动位置 · wttr.in' : '自动定位 · wttr.in',
    diagnostic: '',
  };

  if (manualLocation) {
    target = manualLocation;
  } else {
    const resolved = await resolveAutoWeatherTarget(req);
    target = resolved.target;
    meta = {
      ...meta,
      ...resolved.meta,
    };
  }

  const cacheKey = manualLocation
    ? `manual:${manualLocation.toLowerCase()}`
    : `auto:${meta.locationSource}:${target || 'default'}`;
  const cached = getWeatherCache(cacheKey);
  if (cached) {
    sendJson(res, 200, { ok: true, ...cached });
    return;
  }

  const wttrUrl = target
    ? `https://wttr.in/${encodeURIComponent(target)}?format=j1`
    : 'https://wttr.in/?format=j1';

  try {
    const payload = await loadWeatherPayload(cacheKey, async () => {
      const data = await fetchJson(wttrUrl, WEATHER_TIMEOUT);
      const current = data?.current_condition?.[0];
      if (!current) {
        throw buildWeatherError(
          manualLocation ? 'No weather data for this location' : 'No weather data returned',
          manualLocation ? 'manual-location-not-found' : 'weather-data-missing',
          { manualLocation }
        );
      }

      return {
        ok: true,
        data,
        meta: {
          ...meta,
          requestedLocation: manualLocation,
          endpoint: wttrUrl,
        },
      };
    });

    sendJson(res, 200, payload);
  } catch (error) {
    const isManualLocationNotFound =
      Boolean(manualLocation) &&
      (
        error?.details?.reason === 'manual-location-not-found' ||
        (error?.details?.reason === 'upstream-http' && error?.details?.status === 404)
      );

    const message =
      isManualLocationNotFound
        ? `未找到 ${manualLocation} 的天气数据。`
        : error?.name === 'TimeoutError'
          ? '天气服务响应超时。'
          : '天气服务暂时不可用。';

    sendError(res, 502, message, {
      reason: isManualLocationNotFound
        ? 'manual-location-not-found'
        : (error?.details?.reason || (error?.name === 'TimeoutError' ? 'weather-timeout' : 'weather-fetch-failed')),
      status: error?.details?.status || null,
      mode: meta.mode,
      locationSource: meta.locationSource,
      diagnostic: meta.diagnostic,
      requestedLocation: manualLocation,
    });
  }
}

function streamRequestToFile(req, filePath, maxBytes) {
  return new Promise((resolve, reject) => {
    let bytesWritten = 0;
    let finished = false;
    const writer = fs.createWriteStream(filePath);

    const fail = async error => {
      if (finished) return;
      finished = true;
      writer.destroy();
      try {
        await fsp.rm(filePath, { force: true });
      } catch {}
      reject(error);
    };

    req.on('data', chunk => {
      bytesWritten += chunk.length;
      if (bytesWritten > maxBytes) {
        fail(Object.assign(new Error('File exceeds the allowed size'), { statusCode: 413 }));
        req.destroy();
      }
    });

    req.on('error', fail);
    writer.on('error', fail);

    writer.on('finish', () => {
      if (finished) return;
      finished = true;
      resolve(bytesWritten);
    });

    req.pipe(writer);
  });
}

async function removeUploadSession(uploadId) {
  const session = uploadSessions.get(uploadId);
  if (!session) return;
  uploadSessions.delete(uploadId);
  await fsp.rm(session.dir, { recursive: true, force: true });
}

async function cleanupExpiredUploadSessions() {
  const now = Date.now();
  const expired = [];
  for (const [uploadId, session] of uploadSessions.entries()) {
    if (now - session.createdAt > UPLOAD_SESSION_TTL) {
      expired.push(uploadId);
    }
  }
  await Promise.all(expired.map(uploadId => removeUploadSession(uploadId)));
}

async function handleTextCreate(req, res) {
  const body = await readJsonBody(req);
  const text = String(body.text || '').trim();
  if (!text) {
    sendError(res, 400, '文本内容不能为空。');
    return;
  }
  if (text.length > MAX_TEXT_LENGTH) {
    sendError(res, 413, `文本内容不能超过 ${MAX_TEXT_LENGTH} 个字符。`);
    return;
  }

  const result = await queueStorage(async () => {
    const history = await readHistory();
    const existingIndex = history.findIndex(item => item.type === 'text' && item.text === text);
    let entry;

    if (existingIndex !== -1) {
      [entry] = history.splice(existingIndex, 1);
      entry.ts = Date.now();
      entry.preview = makeTextPreview(text);
    } else {
      entry = {
        id: createId(),
        type: 'text',
        text,
        preview: makeTextPreview(text),
        ts: Date.now(),
      };
    }

    history.unshift(entry);
    const trimmed = await trimHistory(history);
    const items = await writeHistory(trimmed);
    return { entry, items };
  });

  sendJson(res, 200, { ok: true, ...result });
}

async function handleHistoryGet(res) {
  const items = await readHistory();
  sendJson(res, 200, { ok: true, items });
}

async function handleHealthGet(res) {
  await ensureStorage();
  sendJson(res, 200, getClipboardHealthPayload());
}

async function handleAppStateGet(res) {
  const state = await readAppState();
  sendJson(res, 200, { ok: true, state });
}

async function handleAppStatePut(req, res) {
  const body = await readJsonBody(req, JSON_LIMIT * 2);
  const result = await queueStorage(async () => {
    const current = await readAppState();
    const next = {
      ...current,
      ...(Object.prototype.hasOwnProperty.call(body, 'shortcuts') ? { shortcuts: body.shortcuts } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, 'bookmarks') ? { bookmarks: body.bookmarks } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, 'recent') ? { recent: body.recent } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, 'weatherSettings') ? { weatherSettings: body.weatherSettings } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, 'preferences')
        ? {
            preferences: {
              ...(current.preferences || {}),
              ...(body.preferences && typeof body.preferences === 'object' ? body.preferences : {}),
            },
          }
        : {}),
    };
    return writeAppState(next);
  });

  sendJson(res, 200, { ok: true, state: result });
}

async function handleUploadInit(req, res) {
  await cleanupExpiredUploadSessions();
  const body = await readJsonBody(req);
  const files = Array.isArray(body.files) ? body.files : [];

  if (!files.length) {
    sendError(res, 400, '至少需要一个文件。');
    return;
  }
  if (files.length > MAX_UPLOAD_FILES) {
    sendError(res, 400, `单次最多上传 ${MAX_UPLOAD_FILES} 个文件。`);
    return;
  }

  const normalizedFiles = files.map(file => ({
    name: sanitizeFileName(file?.name || ''),
    size: clampNumber(file?.size, 0, Number.MAX_SAFE_INTEGER, 0),
    type: typeof file?.type === 'string' ? file.type : '',
  }));

  if (normalizedFiles.some(file => !file.name || file.size <= 0)) {
    sendError(res, 400, '文件名或大小无效。');
    return;
  }

  const totalBytes = normalizedFiles.reduce((sum, file) => sum + file.size, 0);
  if (normalizedFiles.some(file => file.size > MAX_FILE_SIZE)) {
    sendError(res, 413, `单个文件不能超过 ${Math.floor(MAX_FILE_SIZE / (1024 * 1024))} MB。`);
    return;
  }
  if (totalBytes > MAX_BATCH_SIZE) {
    sendError(res, 413, `单次上传总大小不能超过 ${Math.floor(MAX_BATCH_SIZE / (1024 * 1024))} MB。`);
    return;
  }

  const uploadId = createId();
  const batchId = createId();
  const dir = path.join(UPLOADS_DIR, uploadId);
  await fsp.mkdir(dir, { recursive: true });

  uploadSessions.set(uploadId, {
    uploadId,
    batchId,
    dir,
    files: normalizedFiles,
    uploaded: new Map(),
    createdAt: Date.now(),
  });

  sendJson(res, 200, {
    ok: true,
    uploadId,
    batchId,
    totalBytes,
  });
}

async function handleUploadFile(req, res, uploadId, fileIndex) {
  const session = uploadSessions.get(uploadId);
  if (!session) {
    sendError(res, 404, '上传会话不存在或已过期。');
    return;
  }

  const index = Number(fileIndex);
  if (!Number.isInteger(index) || index < 0 || index >= session.files.length) {
    sendError(res, 400, '文件索引无效。');
    return;
  }

  const fileMeta = session.files[index];
  const tempName = `${String(index).padStart(3, '0')}--${fileMeta.name}`;
  const tempPath = path.join(session.dir, tempName);

  const existing = session.uploaded.get(index);
  if (existing?.tempPath) {
    await fsp.rm(existing.tempPath, { force: true });
  }

  const bytesWritten = await streamRequestToFile(req, tempPath, Math.max(fileMeta.size, 1));
  if (bytesWritten !== fileMeta.size) {
    await fsp.rm(tempPath, { force: true });
    sendError(res, 400, `文件大小不匹配：期望 ${fileMeta.size} 字节，实际收到 ${bytesWritten} 字节。`);
    return;
  }

  session.uploaded.set(index, {
    id: createId(),
    name: fileMeta.name,
    size: bytesWritten,
    type: fileMeta.type || String(req.headers['content-type'] || 'application/octet-stream'),
    tempPath,
  });

  sendJson(res, 200, {
    ok: true,
    index,
    size: bytesWritten,
  });
}

async function handleUploadComplete(res, uploadId) {
  const session = uploadSessions.get(uploadId);
  if (!session) {
    sendError(res, 404, '上传会话不存在或已过期。');
    return;
  }

  if (session.uploaded.size !== session.files.length) {
    sendError(res, 400, '文件尚未全部上传完成。');
    return;
  }

  const result = await queueStorage(async () => {
    const finalDir = path.join(FILES_DIR, session.batchId);
    await fsp.mkdir(finalDir, { recursive: true });

    const fileRecords = [];
    let totalBytes = 0;

    for (let index = 0; index < session.files.length; index += 1) {
      const uploaded = session.uploaded.get(index);
      const storedName = buildStoredFileName(uploaded.id, uploaded.name);
      const finalPath = path.join(finalDir, storedName);
      await fsp.rename(uploaded.tempPath, finalPath);

      totalBytes += uploaded.size;
      fileRecords.push({
        id: uploaded.id,
        name: uploaded.name,
        size: uploaded.size,
        type: uploaded.type,
      });
    }

    const entry = {
      id: createId(),
      type: 'files',
      batchId: session.batchId,
      label: summarizeFileBatch(fileRecords),
      fileCount: fileRecords.length,
      totalBytes,
      files: fileRecords,
      ts: Date.now(),
    };

    const history = await readHistory();
    history.unshift(entry);
    const trimmed = await trimHistory(history);
    const items = await writeHistory(trimmed);
    return { entry, items };
  });

  await removeUploadSession(uploadId);
  sendJson(res, 200, { ok: true, ...result });
}

async function handleUploadCancel(res, uploadId) {
  await removeUploadSession(uploadId);
  sendNoContent(res);
}

async function handleEntryDelete(res, entryId) {
  const result = await queueStorage(async () => {
    const history = await readHistory();
    const target = history.find(item => item.id === entryId);
    const next = history.filter(item => item.id !== entryId);

    if (target?.type === 'files' && target.batchId) {
      await deleteBatch(target.batchId);
    }

    const items = await writeHistory(next);
    return { items };
  });

  sendJson(res, 200, { ok: true, ...result });
}

async function handleHistoryClear(res) {
  await queueStorage(async () => {
    await fsp.rm(FILES_DIR, { recursive: true, force: true });
    await fsp.mkdir(FILES_DIR, { recursive: true });
    await writeHistory([]);
  });

  sendJson(res, 200, { ok: true, items: [] });
}

async function handleFileDownload(res, batchId, fileId) {
  const history = await readHistory();
  const batch = history.find(item => item.type === 'files' && item.batchId === batchId);
  if (!batch) {
    sendError(res, 404, '文件批次不存在。');
    return;
  }

  const file = batch.files.find(item => item.id === fileId);
  if (!file) {
    sendError(res, 404, '文件不存在。');
    return;
  }

  const filePath = path.join(FILES_DIR, batchId, buildStoredFileName(file.id, file.name));
  if (!ensureWithinRoot(filePath, FILES_DIR)) {
    sendError(res, 400, '非法文件路径。');
    return;
  }

  try {
    const stat = await fsp.stat(filePath);
    res.writeHead(200, {
      'Content-Type': file.type || 'application/octet-stream',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      'Cache-Control': 'private, max-age=60',
    });
    fs.createReadStream(filePath).pipe(res);
  } catch {
    sendError(res, 404, '文件已不存在。');
  }
}

async function handleClipboardApi(req, res, pathname) {
  const segments = pathname.split('/').filter(Boolean);

  if (req.method === 'GET' && pathname === '/api/clipboard/health') {
    await handleHealthGet(res);
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/clipboard/history') {
    await handleHistoryGet(res);
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/clipboard/text') {
    await handleTextCreate(req, res);
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/clipboard/uploads/init') {
    await handleUploadInit(req, res);
    return true;
  }

  if (segments[0] === 'api' && segments[1] === 'clipboard' && segments[2] === 'uploads' && segments.length === 5 && req.method === 'PUT') {
    await handleUploadFile(req, res, segments[3], segments[4]);
    return true;
  }

  if (segments[0] === 'api' && segments[1] === 'clipboard' && segments[2] === 'uploads' && segments[4] === 'complete' && req.method === 'POST') {
    await handleUploadComplete(res, segments[3]);
    return true;
  }

  if (segments[0] === 'api' && segments[1] === 'clipboard' && segments[2] === 'uploads' && segments.length === 4 && req.method === 'DELETE') {
    await handleUploadCancel(res, segments[3]);
    return true;
  }

  if (segments[0] === 'api' && segments[1] === 'clipboard' && segments[2] === 'entries' && segments.length === 4 && req.method === 'DELETE') {
    await handleEntryDelete(res, segments[3]);
    return true;
  }

  if (pathname === '/api/clipboard/entries' && req.method === 'DELETE') {
    await handleHistoryClear(res);
    return true;
  }

  if (segments[0] === 'api' && segments[1] === 'clipboard' && segments[2] === 'files' && segments.length === 5 && req.method === 'GET') {
    await handleFileDownload(res, segments[3], segments[4]);
    return true;
  }

  return false;
}

async function serveStatic(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  const normalizedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(ROOT_DIR, decodeURIComponent(normalizedPath));

  if (!ensureWithinRoot(filePath, ROOT_DIR)) {
    sendError(res, 403, 'Forbidden');
    return;
  }

  if (ensureWithinRoot(filePath, STORAGE_DIR)) {
    sendError(res, 403, 'Forbidden');
    return;
  }

  try {
    const asset = await getStaticAsset(filePath);
    if (!asset) {
      sendError(res, 404, 'Not found');
      return;
    }

    if (isAssetFresh(req, asset)) {
      res.writeHead(304, {
        ETag: asset.etag,
        'Last-Modified': asset.lastModified,
        'Cache-Control': asset.cacheControl,
      });
      res.end();
      return;
    }

    res.writeHead(200, {
      'Content-Type': asset.contentType,
      'Content-Length': asset.size,
      'Cache-Control': asset.cacheControl,
      ETag: asset.etag,
      'Last-Modified': asset.lastModified,
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    res.end(asset.buffer);
  } catch {
    sendError(res, 404, 'Not found');
  }
}

async function handleRequest(req, res) {
  try {
    await ensureStorage();
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (req.method === 'GET' && pathname === '/api/weather') {
      await handleWeatherGet(req, res, url);
      return;
    }

    if (pathname === '/api/state') {
      if (req.method === 'GET') {
        await handleAppStateGet(res);
        return;
      }
      if (req.method === 'PUT') {
        await handleAppStatePut(req, res);
        return;
      }
      sendError(res, 405, 'Method not allowed');
      return;
    }

    if (pathname.startsWith('/api/')) {
      const handled = await handleClipboardApi(req, res, pathname);
      if (!handled) {
        sendError(res, 404, 'API route not found');
      }
      return;
    }

    await serveStatic(req, res, pathname);
  } catch (error) {
    const statusCode = error?.statusCode && Number.isInteger(error.statusCode) ? error.statusCode : 500;
    const message = statusCode >= 500 ? 'Internal server error' : error.message;
    console.error('[server]', error);
    if (!res.headersSent) {
      sendError(res, statusCode, message);
    } else {
      res.destroy();
    }
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, HOST, async () => {
  await ensureStorage();
  console.log(`HomePage server running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`Clipboard data directory: ${CLIPBOARD_DIR}`);
});

setInterval(() => {
  cleanupExpiredUploadSessions().catch(error => {
    console.error('[upload-cleanup]', error);
  });
}, 15 * 60 * 1000).unref();
