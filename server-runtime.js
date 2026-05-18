'use strict';

const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const path = require('path');
const util = require('util');
const { spawn } = require('child_process');

module.exports = function createRuntimeManager({ appName, rootDir, storageDir, host, port }) {
  const args = new Set(process.argv.slice(2));
  const startedAt = Date.now();
  const isBackground = args.has('--background') || process.env.HOMEPAGE_BACKGROUND === '1';
  const logDir = path.join(storageDir, 'logs');
  const runtimeDir = path.join(storageDir, 'runtime');
  const logFile = path.join(logDir, 'homepage-server.log');
  const archiveLogFile = path.join(logDir, 'homepage-server.log.1');
  const runtimeCmd = path.join(runtimeDir, 'homepage-background.cmd');
  const runtimeVbs = path.join(runtimeDir, 'homepage-background.vbs');
  const logLimitBytes = 5 * 1024 * 1024;
  let logStream = null;
  let consolePatched = false;
  let shuttingDown = false;

  function ensureDirsSync() {
    [storageDir, logDir, runtimeDir].forEach(dir => fs.mkdirSync(dir, { recursive: true }));
  }

  async function ensureDirs() {
    await Promise.all([storageDir, logDir, runtimeDir].map(dir => fsp.mkdir(dir, { recursive: true })));
  }

  function getWindowsStartupDir() {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(appData, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
  }

  function getStartupEntry() {
    return path.join(getWindowsStartupDir(), `${appName} Background Launcher.vbs`);
  }

  function escapeVbs(value) {
    return String(value).replace(/"/g, '""');
  }

  function quoteCmd(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
  }

  function formatLogArgs(argsToFormat) {
    return argsToFormat.map(value => (typeof value === 'string'
      ? value
      : util.inspect(value, { depth: 4, colors: false, breakLength: 120 }))).join(' ');
  }

  function rotateLogsSync() {
    try {
      const stat = fs.statSync(logFile);
      if (stat.size < logLimitBytes) return;
      try { fs.rmSync(archiveLogFile, { force: true }); } catch {}
      fs.renameSync(logFile, archiveLogFile);
    } catch {}
  }

  function setupLogging() {
    if (consolePatched) return;
    ensureDirsSync();
    rotateLogsSync();
    logStream = fs.createWriteStream(logFile, { flags: 'a' });

    const originals = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    };
    const passthrough = !isBackground || process.env.HOMEPAGE_FORCE_CONSOLE === '1';

    ['log', 'info', 'warn', 'error'].forEach(level => {
      console[level] = (...logArgs) => {
        if (logStream) {
          logStream.write(`[${new Date().toISOString()}] [${level.toUpperCase()}] ${formatLogArgs(logArgs)}${os.EOL}`);
        }
        if (passthrough) {
          originals[level](...logArgs);
        }
      };
    });

    consolePatched = true;
    process.on('unhandledRejection', reason => console.error('[unhandledRejection]', reason));
    process.on('uncaughtException', error => console.error('[uncaughtException]', error));
  }

  async function closeLogging() {
    if (!logStream) return;
    await new Promise(resolve => logStream.end(resolve));
    logStream = null;
  }

  async function writeBackgroundLaunchers() {
    if (process.platform !== 'win32') {
      throw new Error('当前平台暂不支持开机启动管理。');
    }

    await ensureDirs();
    const serverScript = path.join(rootDir, 'server.js');
    const cmdContent = [
      '@echo off',
      'setlocal',
      `cd /d ${quoteCmd(rootDir)}`,
      `set "HOST=${host}"`,
      `set "PORT=${port}"`,
      'set "HOMEPAGE_BACKGROUND=1"',
      `${quoteCmd(process.execPath)} ${quoteCmd(serverScript)} --background`,
      'endlocal',
      '',
    ].join('\r\n');
    const vbsContent = [
      'Set shell = CreateObject("WScript.Shell")',
      `shell.CurrentDirectory = "${escapeVbs(rootDir)}"`,
      `shell.Run Chr(34) & "${escapeVbs(runtimeCmd)}" & Chr(34), 0, False`,
      '',
    ].join('\r\n');

    await Promise.all([
      fsp.writeFile(runtimeCmd, cmdContent, 'utf8'),
      fsp.writeFile(runtimeVbs, vbsContent, 'utf8'),
    ]);
  }

  async function isStartupInstalled() {
    if (process.platform !== 'win32') return false;
    try {
      await fsp.access(getStartupEntry(), fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async function installStartup() {
    if (process.platform !== 'win32') {
      throw new Error('当前平台暂不支持开机启动管理。');
    }
    await writeBackgroundLaunchers();
    await fsp.mkdir(getWindowsStartupDir(), { recursive: true });
    const launcher = [
      'Set shell = CreateObject("WScript.Shell")',
      `shell.Run Chr(34) & "${escapeVbs(runtimeVbs)}" & Chr(34), 0, False`,
      '',
    ].join('\r\n');
    await fsp.writeFile(getStartupEntry(), launcher, 'utf8');
    return getStatus();
  }

  async function removeStartup() {
    if (process.platform !== 'win32') {
      throw new Error('当前平台暂不支持开机启动管理。');
    }
    await fsp.rm(getStartupEntry(), { force: true });
    return getStatus();
  }

  async function getStatus() {
    return {
      platform: process.platform,
      pid: process.pid,
      mode: isBackground ? 'background' : 'interactive',
      startedAt,
      uptimeMs: Date.now() - startedAt,
      host,
      port,
      launchUrl: `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`,
      logFile,
      logDir,
      runtimeDir,
      startupSupported: process.platform === 'win32',
      startupInstalled: await isStartupInstalled(),
      startupEntry: process.platform === 'win32' ? getStartupEntry() : '',
      commands: {
        foreground: 'npm start',
        background: 'npm run start:bg',
        installStartup: 'npm run startup:install',
        removeStartup: 'npm run startup:remove',
      },
    };
  }

  function isLoopbackAddress(ip = '') {
    const value = String(ip || '').trim();
    return !value || value === '::1' || value === '127.0.0.1' || value === '::ffff:127.0.0.1';
  }

  async function handleApi(req, res, pathname, sendJson, sendError) {
    if (pathname !== '/api/runtime' && pathname !== '/api/runtime/startup') return false;

    if (!isLoopbackAddress(req.socket?.remoteAddress)) {
      sendError(res, 403, 'Only localhost can manage runtime settings');
      return true;
    }

    if (pathname === '/api/runtime' && req.method === 'GET') {
      sendJson(res, 200, { ok: true, runtime: await getStatus() });
      return true;
    }

    if (pathname === '/api/runtime/startup' && req.method === 'POST') {
      sendJson(res, 200, { ok: true, runtime: await installStartup() });
      return true;
    }

    if (pathname === '/api/runtime/startup' && req.method === 'DELETE') {
      sendJson(res, 200, { ok: true, runtime: await removeStartup() });
      return true;
    }

    sendError(res, 405, 'Method not allowed');
    return true;
  }

  async function maybeHandleCli() {
    const serverScript = path.join(rootDir, 'server.js');

    if (args.has('--detach')) {
      const child = spawn(process.execPath, [serverScript, '--background'], {
        cwd: rootDir,
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
        env: {
          ...process.env,
          HOST: String(host),
          PORT: String(port),
          HOMEPAGE_BACKGROUND: '1',
        },
      });
      child.unref();
      console.log(`${appName} background server started. PID: ${child.pid}`);
      console.log(`Logs: ${logFile}`);
      return true;
    }

    if (args.has('--install-startup')) {
      const status = await installStartup();
      console.log(`${appName} startup enabled.`);
      console.log(`Launcher: ${status.startupEntry}`);
      return true;
    }

    if (args.has('--remove-startup')) {
      await removeStartup();
      console.log(`${appName} startup disabled.`);
      return true;
    }

    if (args.has('--runtime-status')) {
      console.log(JSON.stringify(await getStatus(), null, 2));
      return true;
    }

    return false;
  }

  function installSignalHandlers(server) {
    const shutdown = async (reason, exitCode = 0) => {
      if (shuttingDown) return;
      shuttingDown = true;
      console.log(`[shutdown] ${reason}`);
      server.close(async () => {
        await closeLogging();
        process.exit(exitCode);
      });
      setTimeout(async () => {
        await closeLogging();
        process.exit(exitCode);
      }, 5000).unref();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    server.on('error', async error => {
      console.error('[server.listen]', error);
      await closeLogging();
      process.exit(1);
    });
  }

  function logReady() {
    console.log(`${appName} server running at http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
    console.log(`Runtime mode: ${isBackground ? 'background' : 'interactive'}`);
    console.log(`Logs: ${logFile}`);
  }

  return {
    ensureRuntimeStorage: ensureDirs,
    setupLogging,
    maybeHandleCli,
    handleApi,
    installSignalHandlers,
    logReady,
    getStatus,
    paths: { logDir, logFile, runtimeDir },
  };
};
