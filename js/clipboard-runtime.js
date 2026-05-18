'use strict';

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
  const DROPZONES = [
    ['clipboard-card-dropzone', 'clipboard-card-file-input'],
    ['clipboard-file-dropzone', 'clipboard-file-input'],
  ];
  const POLL_INTERVAL = 45000;

  let pendingFiles = [];
  let historyCache = [];
  let refreshPromise = null;
  let renderQueued = false;
  let statusTimer = null;
  let baseStatus = '正在连接服务器剪贴板...';
  let baseStatusError = false;
  let serviceReady = false;
  let serviceLimits = { ...DEFAULT_LIMITS };
  let historyDigest = '';
  let currentUploadSessionId = '';
  let uploadState = { active: false, percent: 0, message: '等待上传到服务器', error: false };

  const byId = id => document.getElementById(id);

  function supportsServerStorage() {
    return location.protocol !== 'file:' && typeof fetch === 'function' && typeof XMLHttpRequest !== 'undefined';
  }

  function makePreview(text) {
    const compact = String(text || '').replace(/\s+/g, ' ').trim();
    return compact.length <= MAX_PREVIEW ? compact : `${compact.slice(0, MAX_PREVIEW)}...`;
  }

  function formatBytes(bytes) {
    const value = clampNumber(bytes, 0, Number.MAX_SAFE_INTEGER, 0);
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(value < 10 * 1024 ? 1 : 0)} KB`;
    if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(value < 10 * 1024 * 1024 ? 1 : 0)} MB`;
    return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  function requestJson(url, options = {}) {
    const { timeoutMs = 9000, ...rest } = options;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const init = { ...rest, headers: { Accept: 'application/json', ...(rest.headers || {}) } };
    let timeoutId = null;

    if (init.body && !(init.body instanceof FormData) && !init.headers['Content-Type']) {
      init.headers['Content-Type'] = 'application/json';
    }
    if (controller && timeoutMs > 0) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      init.signal = controller.signal;
    }

    return fetch(url, init)
      .then(async res => {
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
      })
      .catch(err => {
        if (err?.name === 'AbortError') throw new Error('请求超时，请稍后重试。');
        throw err;
      })
      .finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });
  }

  function applyStatus(message, isError = false, visible = true) {
    ['clipboard-saved', 'clipboard-inline-status'].forEach(id => {
      const node = byId(id);
      if (!node) return;
      node.textContent = message;
      node.classList.toggle('visible', visible);
      node.classList.toggle('is-error', isError);
    });
  }

  function setBaseStatus(message, isError = false) {
    baseStatus = message;
    baseStatusError = isError;
    applyStatus(message, isError, true);
  }

  function setStatus(message, { error = false, duration = 2200 } = {}) {
    clearTimeout(statusTimer);
    applyStatus(message, error, true);
    if (duration > 0) {
      statusTimer = setTimeout(() => applyStatus(baseStatus, baseStatusError, true), duration);
    }
  }

  function setUploadState(next = {}) {
    uploadState = {
      active: Boolean(next.active),
      percent: clampNumber(next.percent, 0, 100, 0),
      message: typeof next.message === 'string' && next.message.trim() ? next.message : '等待上传到服务器',
      error: Boolean(next.error),
    };

    [
      ['clipboard-card-upload-progress', 'clipboard-card-upload-progress-bar', 'clipboard-card-upload-text'],
      ['clipboard-upload-progress', 'clipboard-upload-progress-bar', 'clipboard-upload-text'],
    ].forEach(([progressId, barId, textId]) => {
      const progress = byId(progressId);
      const bar = byId(barId);
      const text = byId(textId);
      if (progress) progress.hidden = !uploadState.active;
      if (bar) bar.style.width = `${uploadState.percent}%`;
      if (text) {
        text.textContent = uploadState.message;
        text.classList.toggle('is-error', uploadState.error);
      }
    });

    syncActionAvailability();
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

  function normalizeHistory(items) {
    return (Array.isArray(items) ? items : [])
      .map(item => {
        if (item?.type === 'files' && item.batchId) {
          const files = Array.isArray(item.files)
            ? item.files.filter(file => file && typeof file.name === 'string').map(file => ({
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
            label: item.label || `${files[0].name || '未命名文件'} 等 ${files.length} 个文件`,
            fileCount: clampNumber(item.fileCount || files.length, 1, Number.MAX_SAFE_INTEGER, files.length),
            totalBytes: clampNumber(item.totalBytes || files.reduce((sum, file) => sum + file.size, 0), 0, Number.MAX_SAFE_INTEGER, 0),
            files,
            ts: Number.isFinite(item.ts) ? item.ts : Date.now(),
          };
        }
        const text = typeof item === 'string' ? item : item?.text;
        if (typeof text !== 'string' || !text.trim()) return null;
        return {
          id: item?.id || uid(),
          type: 'text',
          text,
          preview: item?.preview || makePreview(text),
          ts: Number.isFinite(item?.ts) ? item.ts : Date.now(),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.ts - a.ts);
  }

  function getHistoryDigest(items) {
    return items.map(item => `${item.id}:${item.ts}:${item.type}:${item.type === 'files' ? item.batchId : item.preview}`).join('|');
  }

  function loadDraft() {
    const stored = lsGet(LS.CLIPBOARD_DRAFT, null);
    if (typeof stored === 'string') return stored;
    const legacy = lsGet(LS.NOTES, '');
    return typeof legacy === 'string' ? legacy : '';
  }

  function syncEditors(text, sourceId = '') {
    ['clipboard-card-input', 'clipboard-area'].forEach(id => {
      const node = byId(id);
      if (!node || id === sourceId) return;
      if (node.value !== text) node.value = text;
    });
  }

  function setDraft(text, sourceId = '') {
    lsSet(LS.CLIPBOARD_DRAFT, text);
    syncEditors(text, sourceId);
    syncActionAvailability();
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      render();
    });
  }

  function validatePendingFiles(files) {
    if (!files.length) return { ok: false, message: '没有可上传的文件。' };
    const invalid = files.find(file => !file || !(file instanceof File) || file.size <= 0);
    if (invalid) return { ok: false, message: `文件 ${invalid.name || '未命名文件'} 为空或无效。` };
    if (files.length > serviceLimits.maxUploadFiles) return { ok: false, message: `单次最多可暂存 ${serviceLimits.maxUploadFiles} 个文件。` };
    const oversized = files.find(file => file.size > serviceLimits.maxFileSize);
    if (oversized) return { ok: false, message: `文件 ${oversized.name} 超过单文件大小限制。` };
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > serviceLimits.maxBatchSize) return { ok: false, message: `本次文件总大小超过 ${formatBytes(serviceLimits.maxBatchSize)}。` };
    return { ok: true, totalBytes };
  }

  function mergePendingFiles(files, append = false) {
    const source = append ? [...pendingFiles, ...files] : [...files];
    const seen = new Set();
    const merged = [];
    let skippedCount = 0;
    source.forEach(file => {
      const key = [file?.name || '', file?.size || 0, file?.lastModified || 0, file?.type || ''].join('::');
      if (seen.has(key)) {
        skippedCount += 1;
        return;
      }
      seen.add(key);
      merged.push(file);
    });
    return { files: merged, addedCount: append ? Math.max(0, merged.length - pendingFiles.length) : merged.length, skippedCount };
  }

  function setPendingFiles(files, append = false) {
    const nextFiles = Array.isArray(files) ? files.filter(file => file instanceof File) : [];
    const merged = mergePendingFiles(nextFiles, append);
    const validation = validatePendingFiles(merged.files);
    if (!validation.ok) return { ok: false, message: validation.message };
    pendingFiles = merged.files;
    renderPendingFiles();
    return { ok: true, addedCount: merged.addedCount, skippedCount: merged.skippedCount, totalBytes: validation.totalBytes };
  }

  function renderPendingList(targetId, files, limit = null) {
    const container = byId(targetId);
    if (!container) return;
    container.innerHTML = '';
    if (!files.length) {
      container.innerHTML = '<p class="clipboard-empty-hint">暂无待上传文件。</p>';
      return;
    }
    const fragment = document.createDocumentFragment();
    const visible = typeof limit === 'number' ? files.slice(0, limit) : files;
    visible.forEach(file => {
      const row = el('div', 'clipboard-pending-item');
      const name = el('div', 'clipboard-pending-name');
      const meta = el('div', 'clipboard-pending-meta');
      name.textContent = file.name;
      meta.textContent = `${formatBytes(file.size)}${file.type ? ` · ${file.type}` : ''}`;
      row.append(name, meta);
      fragment.appendChild(row);
    });
    if (typeof limit === 'number' && files.length > visible.length) {
      const more = el('div', 'clipboard-list-more');
      more.textContent = `另有 ${files.length - visible.length} 个文件待上传`;
      fragment.appendChild(more);
    }
    container.appendChild(fragment);
  }

  function renderPendingFiles() {
    const totalBytes = pendingFiles.reduce((sum, file) => sum + file.size, 0);
    const summary = pendingFiles.length
      ? `已选择 ${pendingFiles.length} 个文件，共 ${formatBytes(totalBytes)}`
      : serviceReady ? '当前未选择文件' : '等待连接服务器后再上传文件';
    ['clipboard-card-file-summary', 'clipboard-file-summary'].forEach(id => {
      const node = byId(id);
      if (node) node.textContent = summary;
    });
    renderPendingList('clipboard-card-pending-list', pendingFiles, 1);
    renderPendingList('clipboard-pending-list', pendingFiles, null);
    syncActionAvailability();
  }

  function createMeta(item) {
    return item.type === 'files'
      ? `${item.fileCount} 个文件 · ${formatBytes(item.totalBytes)} · ${timeAgo(item.ts)}`
      : `${item.text.length} 字 · ${timeAgo(item.ts)}`;
  }

  function createHistoryRow(item, compact = false) {
    const row = el('div', `clipboard-history-entry${item.type === 'files' ? ' is-file' : ' is-text'}${compact ? ' is-compact' : ''}`);
    const badge = el('span', `clipboard-entry-badge ${item.type === 'files' ? 'is-file' : 'is-text'}`);
    const title = el('div', 'clipboard-entry-title');
    const text = el('div', 'clipboard-entry-text');
    const meta = el('div', 'clipboard-entry-meta');
    const content = el('div', 'clipboard-entry-content');

    badge.textContent = item.type === 'files' ? '文件' : '文本';
    title.textContent = item.type === 'files' ? item.label : '文本记录';
    text.textContent = item.type === 'files' ? item.files.map(file => file.name).slice(0, 3).join(' · ') : item.preview || makePreview(item.text);
    meta.textContent = createMeta(item);
    content.append(badge, title, text, meta);
    row.appendChild(content);
    row.tabIndex = 0;
    row.setAttribute('role', 'button');

    const activate = () => {
      if (item.type === 'files') {
        item.files.forEach(file => {
          const link = document.createElement('a');
          link.href = `/api/clipboard/files/${encodeURIComponent(item.batchId)}/${encodeURIComponent(file.id)}`;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          link.remove();
        });
        setStatus(`已开始下载 ${item.fileCount} 个文件。`);
      } else {
        copyCurrentText(item.text);
      }
    };

    row.addEventListener('click', activate);
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });

    if (!compact) {
      const actions = el('div', 'clipboard-history-actions');
      if (item.type === 'text') {
        const loadBtn = el('button', 'btn-secondary btn-mini');
        loadBtn.type = 'button';
        loadBtn.textContent = '载入';
        loadBtn.addEventListener('click', event => {
          event.stopPropagation();
          setDraft(item.text);
          syncEditors(item.text);
          byId('clipboard-area')?.focus();
          setStatus('已载入文本内容。');
        });
        actions.appendChild(loadBtn);
      }
      const deleteBtn = el('button', 'btn-secondary btn-mini btn-danger');
      deleteBtn.type = 'button';
      deleteBtn.textContent = '删除';
      deleteBtn.addEventListener('click', event => {
        event.stopPropagation();
        void removeItem(item.id);
      });
      actions.appendChild(deleteBtn);
      row.appendChild(actions);
    }

    return row;
  }

  function renderHistory(targetId, items, compact = false, limit = null) {
    const container = byId(targetId);
    if (!container) return;
    container.innerHTML = '';
    if (!items.length) {
      container.innerHTML = '<p class="clipboard-empty-hint">服务器上还没有保存任何记录。</p>';
      return;
    }
    const fragment = document.createDocumentFragment();
    const visible = typeof limit === 'number' ? items.slice(0, limit) : items;
    visible.forEach(item => fragment.appendChild(createHistoryRow(item, compact)));
    if (typeof limit === 'number' && items.length > visible.length) {
      const more = el('div', 'clipboard-list-more');
      more.textContent = `另有 ${items.length - visible.length} 条记录，请展开查看`;
      fragment.appendChild(more);
    }
    container.appendChild(fragment);
  }

  function syncActionAvailability() {
    const canWrite = serviceReady && !uploadState.active;
    const hasDraft = Boolean(loadDraft().trim());
    const hasPendingFiles = pendingFiles.length > 0;
    const hasHistory = historyCache.length > 0;

    ['clipboard-save-btn', 'clipboard-modal-save-btn'].forEach(id => {
      const node = byId(id);
      if (node) node.disabled = !canWrite || !hasDraft;
    });
    ['clipboard-file-save-btn', 'clipboard-card-file-save-btn'].forEach(id => {
      const node = byId(id);
      if (node) node.disabled = !canWrite || !hasPendingFiles;
    });
    ['clipboard-card-file-select-btn', 'clipboard-file-select-btn'].forEach(id => {
      const node = byId(id);
      if (node) node.disabled = !canWrite;
    });
    ['clipboard-card-file-clear-btn', 'clipboard-file-clear-btn'].forEach(id => {
      const node = byId(id);
      if (node) node.disabled = uploadState.active || !hasPendingFiles;
    });
    const clearBtn = byId('clipboard-clear-btn');
    if (clearBtn) clearBtn.disabled = !canWrite || !hasHistory;
    const copyBtn = byId('clipboard-copy-current-btn');
    if (copyBtn) copyBtn.disabled = !hasDraft;
    ['clipboard-card-dropzone', 'clipboard-file-dropzone'].forEach(id => {
      const node = byId(id);
      if (!node) return;
      node.classList.toggle('is-disabled', !canWrite);
      node.setAttribute('aria-disabled', String(!canWrite));
    });
  }

  function render() {
    syncEditors(loadDraft());
    const count = byId('clipboard-count-compact');
    if (count) count.textContent = `${historyCache.length} 条记录`;
    renderHistory('clipboard-card-history', historyCache, true, 3);
    renderHistory('clipboard-history-list', historyCache, false, null);
    renderPendingFiles();
    syncActionAvailability();
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

  function copyCurrentText(text) {
    const value = String(text || '').trim();
    if (!value) {
      setStatus('没有可复制的内容。', { error: true });
      return Promise.resolve();
    }
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(value).then(() => setStatus('已复制到系统剪贴板。')).catch(() => {
        fallbackCopy(value);
        setStatus('已复制到系统剪贴板。');
      });
    }
    fallbackCopy(value);
    setStatus('已复制到系统剪贴板。');
    return Promise.resolve();
  }

  function refreshHistory(options = {}) {
    if (!supportsServerStorage()) {
      serviceReady = false;
      setBaseStatus('当前页面没有接入服务器存储，请使用 node server.js 启动站点。', true);
      queueRender();
      return Promise.resolve();
    }
    if (refreshPromise && !options.force) return refreshPromise;

    refreshPromise = Promise.all([requestJson('/api/clipboard/health'), requestJson('/api/clipboard/history')])
      .then(([health, data]) => {
        const nextHistory = normalizeHistory(data.items);
        const nextDigest = getHistoryDigest(nextHistory);
        const changed = nextDigest !== historyDigest || !serviceReady || options.force;
        serviceReady = true;
        updateServiceLimits(health?.limits || {});
        historyCache = nextHistory;
        historyDigest = nextDigest;
        setBaseStatus('已连接服务器存储，保存后的文本和文件可在多设备访问。');
        if (changed) queueRender(); else syncActionAvailability();
        if (!options.silent) setStatus('服务器记录已同步。');
      })
      .catch(err => {
        console.warn('Clipboard history fetch failed:', err);
        const changed = serviceReady || historyCache.length;
        serviceReady = false;
        setBaseStatus('未连接到服务器剪贴板服务，保存和上传当前不可用。', true);
        if (changed) queueRender(); else syncActionAvailability();
        if (!options.silent) setStatus(err.message || '无法连接服务器剪贴板服务。', { error: true });
      })
      .finally(() => {
        refreshPromise = null;
      });

    return refreshPromise;
  }

  function saveTextEntry(rawText = loadDraft()) {
    const text = String(rawText || '').trim();
    if (!text) return setStatus('没有可保存的内容。', { error: true });
    if (!serviceReady) return setStatus('服务器尚未连接，暂时不能保存。', { error: true });
    if (uploadState.active) return setStatus('文件上传进行中，请稍后再保存文本。', { error: true });
    if (text.length > serviceLimits.maxTextLength) return setStatus(`文本内容过长，最多可保存 ${serviceLimits.maxTextLength} 个字符。`, { error: true });

    requestJson('/api/clipboard/text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
      .then(data => {
        historyCache = normalizeHistory(data.items);
        historyDigest = getHistoryDigest(historyCache);
        setDraft('');
        queueRender();
        setStatus('文本已保存到服务器。');
      })
      .catch(err => {
        console.warn('Text entry save failed:', err);
        setStatus(err.message || '保存文本失败，请稍后重试。', { error: true });
      });
  }

  function removeItem(id) {
    if (!serviceReady) return setStatus('服务器尚未连接，暂时不能删除记录。', { error: true });
    requestJson(`/api/clipboard/entries/${encodeURIComponent(id)}`, { method: 'DELETE' })
      .then(data => {
        historyCache = normalizeHistory(data.items);
        historyDigest = getHistoryDigest(historyCache);
        queueRender();
        setStatus('记录已删除。');
      })
      .catch(err => {
        console.warn('Clipboard entry removal failed:', err);
        setStatus(err.message || '删除记录失败。', { error: true });
      });
  }

  function clearAll() {
    if (!serviceReady) return setStatus('服务器尚未连接，暂时不能清空记录。', { error: true });
    requestJson('/api/clipboard/entries', { method: 'DELETE' })
      .then(data => {
        historyCache = normalizeHistory(data.items);
        historyDigest = getHistoryDigest(historyCache);
        queueRender();
        setStatus('已清空服务器剪贴板历史。');
      })
      .catch(err => {
        console.warn('Clipboard clear failed:', err);
        setStatus(err.message || '清空记录失败。', { error: true });
      });
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
        setUploadState({ active: true, percent, message: `正在上传 ${file.name} · ${percent}% · ${formatBytes(loaded)} / ${formatBytes(totalBytes)}`, error: false });
      };
      xhr.onerror = () => reject(new Error(`上传 ${file.name} 失败，请检查网络或服务器状态。`));
      xhr.onload = () => {
        let payload = {};
        try { payload = xhr.responseText ? JSON.parse(xhr.responseText) : {}; } catch {}
        if (xhr.status >= 200 && xhr.status < 300) return resolve(payload);
        reject(new Error(payload?.message || `上传 ${file.name} 失败（${xhr.status}）。`));
      };
      xhr.send(file);
    });
  }

  function cancelUploadSession() {
    if (!currentUploadSessionId) return Promise.resolve();
    return fetch(`/api/clipboard/uploads/${encodeURIComponent(currentUploadSessionId)}`, { method: 'DELETE' })
      .catch(err => console.warn('Upload cancel failed:', err))
      .finally(() => { currentUploadSessionId = ''; });
  }

  function savePendingFiles() {
    if (!pendingFiles.length) return setStatus('没有待上传的文件。', { error: true });
    if (!serviceReady) return setStatus('服务器尚未连接，暂时不能上传文件。', { error: true });
    if (uploadState.active) return setStatus('已有文件上传任务正在进行。', { error: true });

    const validation = validatePendingFiles(pendingFiles);
    if (!validation.ok) return setStatus(validation.message, { error: true, duration: 2800 });

    const totalBytes = validation.totalBytes;
    let uploadedBytes = 0;

    setUploadState({ active: true, percent: 0, message: `准备上传 ${pendingFiles.length} 个文件 · 共 ${formatBytes(totalBytes)}`, error: false });
    requestJson('/api/clipboard/uploads/init', {
      method: 'POST',
      body: JSON.stringify({
        files: pendingFiles.map(file => ({ name: file.name, size: file.size, type: file.type || '' })),
      }),
    })
      .then(async init => {
        currentUploadSessionId = init.uploadId;
        for (let index = 0; index < pendingFiles.length; index += 1) {
          const file = pendingFiles[index];
          await uploadSingleFile(init.uploadId, index, file, uploadedBytes, totalBytes);
          uploadedBytes += file.size;
          const percent = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 100;
          setUploadState({ active: true, percent, message: `已上传 ${index + 1}/${pendingFiles.length} 个文件 · ${formatBytes(uploadedBytes)} / ${formatBytes(totalBytes)}`, error: false });
        }
        return requestJson(`/api/clipboard/uploads/${encodeURIComponent(init.uploadId)}/complete`, { method: 'POST' });
      })
      .then(data => {
        currentUploadSessionId = '';
        historyCache = normalizeHistory(data.items);
        historyDigest = getHistoryDigest(historyCache);
        pendingFiles = [];
        queueRender();
        setUploadState({ active: false, percent: 100, message: `已上传 ${data.entry?.fileCount || 0} 个文件到服务器`, error: false });
        setStatus('文件已上传到服务器，其他设备现在也可以访问。');
      })
      .catch(async err => {
        console.warn('File upload failed:', err);
        await cancelUploadSession();
        setUploadState({ active: false, percent: 0, message: err.message || '文件上传失败，请稍后重试。', error: true });
        setStatus(err.message || '文件上传失败，请稍后重试。', { error: true, duration: 2600 });
        renderPendingFiles();
      });
  }

  function bindFilePicker(inputId, buttonId) {
    const input = byId(inputId);
    const button = byId(buttonId);
    if (!input || !button) return;
    button.addEventListener('click', () => { if (!button.disabled) input.click(); });
    input.addEventListener('change', event => {
      const files = Array.from(event.target.files || []);
      if (!files.length) return;
      const result = setPendingFiles(files, true);
      if (result?.ok) setStatus(`已加入 ${result.addedCount} 个待上传文件。`);
      else if (result?.message) setStatus(result.message, { error: true, duration: 2800 });
      input.value = '';
    });
  }

  function bindDropzone(zoneId, inputId) {
    const zone = byId(zoneId);
    const input = byId(inputId);
    if (!zone || !input) return;
    const openPicker = () => { if (!zone.classList.contains('is-disabled')) input.click(); };
    zone.addEventListener('click', openPicker);
    zone.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPicker();
      }
    });
    ['dragenter', 'dragover'].forEach(type => {
      zone.addEventListener(type, event => {
        if (zone.classList.contains('is-disabled')) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
        zone.classList.add('is-dragover');
      });
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-dragover'));
    zone.addEventListener('drop', event => {
      if (zone.classList.contains('is-disabled')) return;
      event.preventDefault();
      zone.classList.remove('is-dragover');
      const files = Array.from(event.dataTransfer?.files || []);
      if (!files.length) return setStatus('请拖入文件，而不是文本或链接。', { error: true });
      const result = setPendingFiles(files, true);
      if (result?.ok) setStatus(`已加入 ${result.addedCount} 个待上传文件。`);
      else if (result?.message) setStatus(result.message, { error: true, duration: 2800 });
    });
  }

  function init() {
    render();
    ['clipboard-card-input', 'clipboard-area'].forEach(id => {
      const input = byId(id);
      if (!input) return;
      input.value = loadDraft();
      input.addEventListener('input', () => setDraft(input.value, id));
      input.addEventListener('keydown', event => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault();
          saveTextEntry(input.value);
        }
      });
    });
    bindFilePicker('clipboard-card-file-input', 'clipboard-card-file-select-btn');
    bindFilePicker('clipboard-file-input', 'clipboard-file-select-btn');
    DROPZONES.forEach(([zoneId, inputId]) => bindDropzone(zoneId, inputId));
    byId('clipboard-save-btn')?.addEventListener('click', () => saveTextEntry(loadDraft()));
    byId('clipboard-modal-save-btn')?.addEventListener('click', () => saveTextEntry(loadDraft()));
    byId('clipboard-copy-current-btn')?.addEventListener('click', () => void copyCurrentText(loadDraft()));
    byId('clipboard-clear-btn')?.addEventListener('click', () => clearAll());
    byId('clipboard-card-file-save-btn')?.addEventListener('click', () => savePendingFiles());
    byId('clipboard-file-save-btn')?.addEventListener('click', () => savePendingFiles());
    byId('clipboard-card-file-clear-btn')?.addEventListener('click', () => { pendingFiles = []; renderPendingFiles(); });
    byId('clipboard-file-clear-btn')?.addEventListener('click', () => { pendingFiles = []; renderPendingFiles(); });
    setUploadState(uploadState);
    setBaseStatus(baseStatus, baseStatusError);
    setInterval(() => {
      if (!document.hidden && !uploadState.active) void refreshHistory({ silent: true });
    }, POLL_INTERVAL);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) void refreshHistory({ silent: true });
    });
    window.addEventListener('online', () => {
      if (!document.hidden) void refreshHistory({ silent: true, force: true });
    });
    window.addEventListener('pagehide', () => {
      if (uploadState.active) void cancelUploadSession();
    });
    void refreshHistory();
  }

  return { init, render, refresh: refreshHistory };
})();

const RuntimeControls = (() => {
  let info = null;
  const byId = id => document.getElementById(id);

  function setText(id, text, isError = false) {
    const node = byId(id);
    if (!node) return;
    node.textContent = text;
    node.classList.toggle('is-error', isError);
  }

  function syncButtons() {
    const startupSupported = Boolean(info?.startupSupported);
    const startupInstalled = Boolean(info?.startupInstalled);
    if (byId('startup-install-btn')) byId('startup-install-btn').disabled = !startupSupported || startupInstalled;
    if (byId('startup-remove-btn')) byId('startup-remove-btn').disabled = !startupSupported || !startupInstalled;
    if (byId('copy-bg-command-btn')) byId('copy-bg-command-btn').disabled = !info?.commands?.background;
    if (byId('copy-log-path-btn')) byId('copy-log-path-btn').disabled = !info?.logFile;
  }

  function copyText(text, success) {
    if (!text) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => setText('runtime-startup-status', success)).catch(() => {});
      return;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    setText('runtime-startup-status', success);
  }

  function render() {
    if (!info) {
      setText('runtime-mode-status', '当前无法读取后台服务状态。');
      setText('runtime-startup-status', '后台管理接口不可用。', true);
      setText('runtime-log-path', '日志文件：不可用');
      setText('runtime-bg-command-text', '后台启动命令：不可用');
      syncButtons();
      return;
    }
    setText('runtime-mode-status', `当前运行模式：${info.mode === 'background' ? '后台常驻' : '前台控制台'} · PID ${info.pid} · 端口 ${info.port}`);
    setText('runtime-startup-status', info.startupSupported ? `开机启动：${info.startupInstalled ? '已启用' : '未启用'}` : '当前平台暂不支持开机启动管理。', !info.startupSupported);
    setText('runtime-log-path', `日志文件：${info.logFile || '不可用'}`);
    setText('runtime-bg-command-text', `后台启动命令：${info.commands?.background || '不可用'}`);
    syncButtons();
  }

  function requestJson(url, options = {}) {
    return fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' }, ...options })
      .then(async res => {
        const raw = await res.text();
        let data = {};
        if (raw) {
          try { data = JSON.parse(raw); } catch { data = { message: raw }; }
        }
        if (!res.ok) throw new Error(data?.message || `Request failed with status ${res.status}`);
        return data;
      });
  }

  function refresh() {
    requestJson('/api/runtime')
      .then(data => {
        info = data.runtime || null;
        render();
      })
      .catch(err => {
        info = null;
        setText('runtime-mode-status', '当前仅本机 localhost 可以管理后台服务。');
        setText('runtime-startup-status', err.message || '无法读取后台服务状态。', true);
        setText('runtime-log-path', '日志文件：不可用');
        setText('runtime-bg-command-text', '后台启动命令：不可用');
        syncButtons();
      });
  }

  function init() {
    byId('startup-install-btn')?.addEventListener('click', () => {
      requestJson('/api/runtime/startup', { method: 'POST' })
        .then(data => {
          info = data.runtime || info;
          render();
          setText('runtime-startup-status', '已启用开机启动。');
        })
        .catch(err => setText('runtime-startup-status', err.message || '启用开机启动失败。', true));
    });
    byId('startup-remove-btn')?.addEventListener('click', () => {
      requestJson('/api/runtime/startup', { method: 'DELETE' })
        .then(data => {
          info = data.runtime || info;
          render();
          setText('runtime-startup-status', '已关闭开机启动。');
        })
        .catch(err => setText('runtime-startup-status', err.message || '关闭开机启动失败。', true));
    });
    byId('copy-bg-command-btn')?.addEventListener('click', () => copyText(info?.commands?.background, '后台启动命令已复制。'));
    byId('copy-log-path-btn')?.addEventListener('click', () => copyText(info?.logFile, '日志路径已复制。'));
    refresh();
  }

  return { init, refresh };
})();

document.addEventListener('DOMContentLoaded', () => {
  RuntimeControls.init();
});
