import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const appPort = Number(process.env.GITQUEST_QA_PORT ?? 5181);
const cdpPort = Number(process.env.GITQUEST_CDP_PORT ?? 9223);
const viewportWidth = Number(process.env.GITQUEST_QA_WIDTH ?? 960);
const viewportHeight = Number(process.env.GITQUEST_QA_HEIGHT ?? 540);
const emulateTouch = process.env.GITQUEST_QA_TOUCH === '1';
const requestedLevel = process.env.GITQUEST_QA_LEVEL;
const appUrl = requestedLevel
  ? `http://127.0.0.1:${appPort}/?qa=benchmark&qaLevel=${encodeURIComponent(requestedLevel)}&perf=1`
  : `http://127.0.0.1:${appPort}/?qa=browser`;

function findChrome() {
  const candidates = [
    process.env.GITQUEST_CHROME,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA ?? ''}\\Google\\Chrome\\Application\\chrome.exe`,
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  return candidates.find((path) => path && !path.includes('undefined'));
}

const chromePath = findChrome();
if (!chromePath) throw new Error('Chrome/Edge introuvable. Définir GITQUEST_CHROME pour le runner QA.');

async function waitFor(url, timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The local server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Délai dépassé en attendant ${url}`);
}

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pending = new Map();
    this.events = new Map();
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      for (const handler of this.events.get(message.method) ?? []) handler(message.params);
    };
  }

  on(method, handler) {
    const handlers = this.events.get(method) ?? [];
    handlers.push(handler);
    this.events.set(method, handlers);
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? 'Évaluation navigateur impossible');
    return result.result?.value;
  }
}

async function connectCdp() {
  const response = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
  const pages = await response.json();
  const page = pages.find((item) => item.type === 'page' && item.webSocketDebuggerUrl);
  if (!page) throw new Error('Aucune page Chrome DevTools disponible.');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  return new Cdp(socket);
}

async function waitForState(cdp, expected, timeoutMs = 12000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const state = await cdp.evaluate('document.documentElement.dataset.gitquestQa ?? ""');
    if (state === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const state = await cdp.evaluate('document.documentElement.dataset.gitquestQa ?? ""');
  throw new Error(`État QA attendu « ${expected} », obtenu « ${state} »`);
}

const keyCodes = { Escape: ['Escape', 27], Enter: ['Enter', 13], s: ['KeyS', 83], n: ['KeyN', 78], t: ['KeyT', 84] };
async function key(cdp, keyValue) {
  const [code, windowsVirtualKeyCode] = keyCodes[keyValue] ?? [`Key${keyValue.toUpperCase()}`, keyValue.toUpperCase().charCodeAt(0)];
  const keyName = keyValue.length === 1 ? keyValue.toUpperCase() : keyValue;
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode });
}

async function click(cdp, x, y) {
  const rect = await cdp.evaluate('(() => { const canvas = document.querySelector("canvas"); const rect = canvas?.getBoundingClientRect(); return rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, gameWidth: canvas.width, gameHeight: canvas.height } : null; })()');
  if (!rect) throw new Error('Canvas introuvable pour le clic QA.');
  const pageX = rect.left + x * rect.width / rect.gameWidth;
  const pageY = rect.top + y * rect.height / rect.gameHeight;
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log(`QA click game(${x},${y}) page(${pageX},${pageY}) rect=${JSON.stringify(rect)}`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pageX, y: pageY, button: 'none', buttons: 0, pointerType: 'mouse' });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pageX, y: pageY, button: 'left', buttons: 1, clickCount: 1, pointerType: 'mouse' });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pageX, y: pageY, button: 'left', buttons: 0, clickCount: 1, pointerType: 'mouse' });
}

async function getGameSize(cdp) {
  return cdp.evaluate('(() => { const canvas = document.querySelector("canvas"); return { width: canvas?.width ?? 0, height: canvas?.height ?? 0 }; })()');
}

function layoutFor(width, height) {
  const portrait = height > width;
  const compact = width < 760 || height < 500;
  return { width, height, portrait, compact, margin: compact ? 12 : 20 };
}

async function clickMenuButton(cdp, index, count) {
  const { width, height } = await getGameSize(cdp);
  const metrics = layoutFor(width, height);
  const buttonHeight = metrics.compact ? 48 : 54;
  const gap = metrics.compact ? 10 : 12;
  const totalHeight = count * buttonHeight + (count - 1) * gap;
  const preferredCenter = metrics.compact && !metrics.portrait
    ? height - metrics.margin - totalHeight / 2
    : height * (metrics.portrait ? 0.68 : 0.62);
  const centerY = Math.min(height - metrics.margin - totalHeight / 2, preferredCenter);
  const y = centerY - totalHeight / 2 + buttonHeight / 2 + index * (buttonHeight + gap);
  await click(cdp, width / 2, y);
}

async function clickLanguage(cdp, index) {
  const { width, height } = await getGameSize(cdp);
  const metrics = layoutFor(width, height);
  const languageWidth = metrics.compact ? 48 : 54;
  const languageGap = metrics.compact ? 6 : 8;
  const total = languageWidth * 3 + languageGap * 2;
  const startX = width - metrics.margin - total + languageWidth / 2;
  await click(cdp, startX + index * (languageWidth + languageGap), metrics.margin + 22);
}

async function clickIntroductionSkip(cdp) {
  const { width, height } = await getGameSize(cdp);
  const metrics = layoutFor(width, height);
  const panelWidth = Math.min(670, width - metrics.margin * 2);
  const panelHeight = Math.min(430, height - metrics.margin * 2);
  const panelY = height / 2 + (metrics.compact ? 8 : 16);
  const stacked = metrics.portrait || panelWidth < 500;
  const buttonsY = panelY + panelHeight / 2 - (stacked ? 64 : (metrics.compact ? 42 : 36));
  await click(cdp, stacked ? width / 2 : width / 2 + 130, stacked ? buttonsY + 27 : buttonsY);
}

async function assertBrowserBasics(cdp) {
  const basics = await cdp.evaluate(`(() => ({
    canvas: Boolean(document.querySelector('canvas')),
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    canvasWidth: document.querySelector('canvas')?.width ?? 0,
    canvasHeight: document.querySelector('canvas')?.height ?? 0,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  }))()`);
  if (!basics.canvas || !basics.canvasWidth || !basics.canvasHeight || basics.lang !== 'fr' || basics.dir !== 'ltr' || Math.abs(basics.viewportWidth - viewportWidth) > 2 || Math.abs(basics.viewportHeight - viewportHeight) > 2) {
    throw new Error('Le canvas ou la direction initiale n’est pas correctement exposé.');
  }
}

async function stopProcess(processHandle) {
  if (!processHandle || processHandle.exitCode !== null) return;
  await new Promise((resolve) => {
    const done = () => resolve();
    processHandle.once('exit', done);
    processHandle.kill();
    setTimeout(done, 2000);
  });
}

async function removeProfile(path) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await rm(path, { recursive: true, force: true });
      return;
    } catch (error) {
      if (!['EBUSY', 'EPERM', 'ENOTEMPTY'].includes(error?.code)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  // A locked OS temp file is harmless and will be reclaimed by the OS.
}

const viteEntry = join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
const server = spawn(process.execPath, [viteEntry, '--host', '127.0.0.1', '--port', String(appPort)], { stdio: 'inherit', windowsHide: true });
const profile = await mkdtemp(join(tmpdir(), 'gitquest-browser-'));
const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${cdpPort}`,
  `--user-data-dir=${profile}`, `--window-size=${viewportWidth},${viewportHeight}`, appUrl,
], { stdio: 'ignore', windowsHide: true });

let cdp;
try {
  await waitFor(`http://127.0.0.1:${appPort}/`);
  await waitFor(`http://127.0.0.1:${cdpPort}/json/list`);
  cdp = await connectCdp();
  const consoleErrors = [];
  cdp.on('Runtime.exceptionThrown', (event) => consoleErrors.push(event.exceptionDetails?.text ?? 'exception'));
  cdp.on('Log.entryAdded', (event) => { if (event.entry?.level === 'error') consoleErrors.push(event.entry.text); });
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: viewportWidth, height: viewportHeight, deviceScaleFactor: 1, mobile: false });
  if (emulateTouch) await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cdp.send('Storage.clearDataForOrigin', { origin: `http://127.0.0.1:${appPort}`, storageTypes: 'all' });
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForState(cdp, requestedLevel ? 'world' : 'title');
  await assertBrowserBasics(cdp);
  if (process.env.GITQUEST_QA_SCREENSHOT) {
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.GITQUEST_QA_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
  }

  if (requestedLevel) {
    const started = Date.now();
    let runtime = await cdp.evaluate('({ level: document.documentElement.dataset.gitquestLevel ?? "", fps: document.documentElement.dataset.gitquestFps ?? "" })');
    while (!runtime.fps && Date.now() - started < 4000) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      runtime = await cdp.evaluate('({ level: document.documentElement.dataset.gitquestLevel ?? "", fps: document.documentElement.dataset.gitquestFps ?? "" })');
    }
    if (runtime.level !== requestedLevel) throw new Error(`Niveau QA attendu « ${requestedLevel} », obtenu « ${runtime.level} »`);
    if (!runtime.fps) throw new Error(`Aucune mesure FPS pour ${requestedLevel}.`);
    if (consoleErrors.length) throw new Error(`Erreurs navigateur : ${consoleErrors.join(' | ')}`);
    console.log(`QA navigateur PASS: ${requestedLevel}, niveau rendu et FPS ${runtime.fps}.`);
  } else {

  await clickMenuButton(cdp, 1, 2);
  await waitForState(cdp, 'settings');
  await key(cdp, 'Escape');
  await waitForState(cdp, 'title');

  await clickLanguage(cdp, 2);
  const rtl = await cdp.evaluate('({ lang: document.documentElement.lang, dir: document.documentElement.dir })');
  if (rtl.lang !== 'ar' || rtl.dir !== 'rtl') throw new Error('Le changement arabe/RTL n’est pas effectif.');
  await clickLanguage(cdp, 0);
  await waitForState(cdp, 'title');

  await clickMenuButton(cdp, 0, 2);
  await waitForState(cdp, 'loading');
  await waitForState(cdp, 'introduction');
  await clickIntroductionSkip(cdp);
  await waitForState(cdp, 'world');

  await key(cdp, 't');
  await waitForState(cdp, 'terminal');
  await new Promise((resolve) => setTimeout(resolve, 150));
  await cdp.send('Input.insertText', { text: 'git init' });
  await key(cdp, 'Enter');
  const save = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!save || save.version !== 1 || save.levelId !== 'level-01' || !save.git?.initialized) throw new Error('La sauvegarde ou git init n’est pas confirmé par le navigateur.');
  await key(cdp, 'Escape');
  await waitForState(cdp, 'world');
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForState(cdp, 'title');
  // With an existing save the compact landscape layout has three buttons;
  // Continue is the middle action at this viewport.
  await clickMenuButton(cdp, 1, 3);
  await waitForState(cdp, 'world');
  const resumed = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!resumed || resumed.version !== 1 || resumed.levelId !== 'level-01' || !resumed.git?.initialized) {
    throw new Error('La reprise après actualisation n’a pas restauré la partie sauvegardée.');
  }
  if (consoleErrors.length) throw new Error(`Erreurs navigateur : ${consoleErrors.join(' | ')}`);
  console.log('QA navigateur PASS: menu, paramètres, RTL, nouvelle partie, chargement, introduction, niveau 1, terminal, sauvegarde et reprise après actualisation.');
  }
} finally {
  cdp?.socket.close();
  await stopProcess(chrome);
  await stopProcess(server);
  await removeProfile(profile);
}
