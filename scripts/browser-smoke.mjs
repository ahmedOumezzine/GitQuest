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
const requestedScene = process.env.GITQUEST_QA_SCENE;
const appUrl = requestedLevel
  ? `http://127.0.0.1:${appPort}/?qa=benchmark&qaLevel=${encodeURIComponent(requestedLevel)}&perf=1`
  : requestedScene === 'victory'
    ? `http://127.0.0.1:${appPort}/?qa=victory`
  : `http://127.0.0.1:${appPort}/?qa=browser`;

const legacyLevels = [
  { id: 'level-02', next: 'level-03', minimumXp: 120, mentor: { x: 105, y: 180 }, crystal: { x: 125, y: 410 }, chest: { x: 760, y: 240 }, gate: { x: 900, y: 270 }, commands: [{ operation: 'add', text: 'git add .' }], chestWaypoints: [{ x: 125, y: 430 }, { x: 700, y: 430 }, { x: 700, y: 240 }, { x: 760, y: 240 }], toGate: [{ key: 'ArrowDown', ms: 220 }, { key: 'ArrowRight', ms: 1000 }] },
  { id: 'level-03', next: 'level-04', minimumXp: 180, mentor: { x: 115, y: 180 }, crystal: { x: 130, y: 380 }, chest: { x: 760, y: 170 }, gate: { x: 900, y: 270 }, commands: [{ operation: 'commit', text: 'git commit -m "archive"' }], chestWaypoints: [{ x: 500, y: 380 }, { x: 500, y: 350 }, { x: 680, y: 350 }, { x: 680, y: 170 }, { x: 760, y: 170 }], toGate: [{ key: 'ArrowDown', ms: 700 }, { key: 'ArrowRight', ms: 1000 }] },
  { id: 'level-04', next: 'level-05', minimumXp: 240, mentor: { x: 110, y: 190 }, crystal: { x: 130, y: 390 }, chest: { x: 740, y: 330 }, gate: { x: 900, y: 270 }, commands: [{ operation: 'push', text: 'git push' }, { operation: 'pull', text: 'git pull' }], chestWaypoints: [{ x: 350, y: 390 }, { x: 350, y: 310 }, { x: 740, y: 310 }, { x: 740, y: 330 }], toGate: [{ key: 'ArrowUp', ms: 450 }, { key: 'ArrowRight', ms: 1100 }] },
  { id: 'level-05', next: 'level-06', minimumXp: 300, mentor: { x: 110, y: 180 }, crystal: { x: 130, y: 405 }, chest: { x: 720, y: 190 }, gate: { x: 900, y: 270 }, commands: [{ operation: 'branch', text: 'git branch feature' }, { operation: 'switch', text: 'git switch feature' }], chestWaypoints: [{ x: 130, y: 430 }, { x: 580, y: 430 }, { x: 580, y: 190 }, { x: 720, y: 190 }], gateWaypoints: [{ x: 760, y: 190 }, { x: 900, y: 190 }, { x: 900, y: 270 }] },
  { id: 'level-06', minimumXp: 360, mentor: { x: 110, y: 180 }, crystal: { x: 115, y: 390 }, chest: { x: 790, y: 255 }, gate: { x: 900, y: 270 }, commands: [{ operation: 'merge', text: 'git merge main' }], chestWaypoints: [{ x: 115, y: 450 }, { x: 430, y: 450 }, { x: 650, y: 450 }, { x: 650, y: 255 }, { x: 790, y: 255 }], toGate: [{ key: 'ArrowRight', ms: 760 }, { key: 'ArrowDown', ms: 100 }] },
];

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
    const state = await cdp.evaluate('document.documentElement?.dataset.gitquestQa ?? ""');
    if (state === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const state = await cdp.evaluate('document.documentElement?.dataset.gitquestQa ?? ""');
  throw new Error(`État QA attendu « ${expected} », obtenu « ${state} »`);
}

const keyCodes = { Escape: ['Escape', 27], Enter: ['Enter', 13], ArrowLeft: ['ArrowLeft', 37], ArrowRight: ['ArrowRight', 39], ArrowUp: ['ArrowUp', 38], ArrowDown: ['ArrowDown', 40], s: ['KeyS', 83], n: ['KeyN', 78], t: ['KeyT', 84], e: ['KeyE', 69] };
async function key(cdp, keyValue) {
  const [code, windowsVirtualKeyCode] = keyCodes[keyValue] ?? [`Key${keyValue.toUpperCase()}`, keyValue.toUpperCase().charCodeAt(0)];
  const keyName = keyValue.length === 1 ? keyValue.toUpperCase() : keyValue;
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode });
}

async function holdKey(cdp, keyValue, durationMs) {
  const [code, windowsVirtualKeyCode] = keyCodes[keyValue] ?? [`Key${keyValue.toUpperCase()}`, keyValue.toUpperCase().charCodeAt(0)];
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: keyValue, code, windowsVirtualKeyCode });
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: keyValue, code, windowsVirtualKeyCode });
}

async function waitForQuestStep(cdp, expected, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const step = await cdp.evaluate('document.documentElement.dataset.gitquestQuestStep ?? ""');
    if (step === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const step = await cdp.evaluate('document.documentElement.dataset.gitquestQuestStep ?? ""');
  throw new Error(`Étape de quête attendue « ${expected} », obtenue « ${step} »`);
}

async function waitForLevel(cdp, expected, timeoutMs = 6000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const level = await cdp.evaluate('document.documentElement.dataset.gitquestLevel ?? ""');
    if (level === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const level = await cdp.evaluate('document.documentElement.dataset.gitquestLevel ?? ""');
  throw new Error(`Niveau attendu « ${expected} », obtenu « ${level} »`);
}

async function moveAlong(cdp, segments) {
  for (const segment of segments) await holdKey(cdp, segment.key, segment.ms);
}

async function moveToward(cdp, target, tolerance = 48) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const position = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    if (Math.hypot(dx, dy) <= tolerance) return true;
    const direction = Math.abs(dx) >= Math.abs(dy)
      ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft')
      : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
    await holdKey(cdp, direction, 140);
  }
  return false;
}

async function moveToPoints(cdp, points) {
  for (const point of points) {
    const reached = await moveToward(cdp, point, 12);
    if (process.env.GITQUEST_QA_DEBUG === '1') console.log(`QA waypoint ${point.x},${point.y} reached=${reached} at ${await cdp.evaluate('document.documentElement.dataset.gitquestPlayerX + "," + document.documentElement.dataset.gitquestPlayerY')}`);
  }
}

async function interactUntilQuestStep(cdp, expected, target) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (await cdp.evaluate(`document.documentElement.dataset.gitquestQuestStep === ${JSON.stringify(expected)}`)) return;
    await moveToward(cdp, target, 32);
    await key(cdp, 'e');
    await new Promise((resolve) => setTimeout(resolve, 180));
  }
  await waitForQuestStep(cdp, expected, 2500);
}

async function runTerminalCommands(cdp, commands) {
  await key(cdp, 't');
  await waitForState(cdp, 'terminal');
  await new Promise((resolve) => setTimeout(resolve, 150));
  for (const [index, command] of commands.entries()) {
    await cdp.send('Input.insertText', { text: command.text });
    await key(cdp, 'Enter');
    const nextStep = commands[index + 1] ? 'run-' + commands[index + 1].operation : 'collect-key';
    await waitForQuestStep(cdp, nextStep);
  }
  await key(cdp, 'Escape');
  await waitForState(cdp, 'world');
}

async function runLegacyLevel(cdp, config) {
  await waitForLevel(cdp, config.id);
  await waitForQuestStep(cdp, 'talk-midou');
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log(`${config.id} start: ${await cdp.evaluate('document.documentElement.dataset.gitquestPlayerX + "," + document.documentElement.dataset.gitquestPlayerY')}`);
  await moveToward(cdp, config.mentor, 30);
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log(`${config.id} mentor: ${await cdp.evaluate('document.documentElement.dataset.gitquestPlayerX + "," + document.documentElement.dataset.gitquestPlayerY')}`);
  await key(cdp, 'e');
  await waitForQuestStep(cdp, 'run-' + config.commands[0].operation);
  for (let attempt = 0; attempt < 3 && await cdp.evaluate('document.documentElement.dataset.gitquestDialogue === "visible"'); attempt += 1) {
    await key(cdp, 'e');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await moveToward(cdp, config.crystal, 42);
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log(`${config.id} crystal: ${await cdp.evaluate('document.documentElement.dataset.gitquestPlayerX + "," + document.documentElement.dataset.gitquestPlayerY')}`);
  await key(cdp, 'e');
  await runTerminalCommands(cdp, config.commands);
  await moveToPoints(cdp, config.chestWaypoints);
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log(`${config.id} before chest: ${await cdp.evaluate('document.documentElement.dataset.gitquestPlayerX + "," + document.documentElement.dataset.gitquestPlayerY')}`);
  await interactUntilQuestStep(cdp, 'open-exit', config.chest);
  const save = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!save?.inventory?.items?.includes('pass-key') || save.xp?.total < config.minimumXp) throw new Error(`Récompense absente pour ${config.id}.`);
  if (config.gateWaypoints) await moveToPoints(cdp, config.gateWaypoints);
  else await moveAlong(cdp, config.toGate);
  await moveToward(cdp, config.gate);
  await key(cdp, 'e');
  if (config.next) await waitForLevel(cdp, config.next);
  else await waitForState(cdp, 'victory');
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
  if (emulateTouch) {
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await cdp.send('Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' });
  }
  await cdp.send('Storage.clearDataForOrigin', { origin: `http://127.0.0.1:${appPort}`, storageTypes: 'all' });
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForState(cdp, requestedLevel ? 'world' : requestedScene === 'victory' ? 'victory' : 'title');
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
    if (emulateTouch) {
      const touchStarted = Date.now();
      let touchControls = await cdp.evaluate('document.documentElement.dataset.gitquestTouchControls ?? ""');
      while (touchControls !== 'visible' && Date.now() - touchStarted < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        touchControls = await cdp.evaluate('document.documentElement.dataset.gitquestTouchControls ?? ""');
      }
      if (touchControls !== 'visible') throw new Error('Les contrôles tactiles ne sont pas visibles en émulation tactile.');
    }
    if (consoleErrors.length) throw new Error(`Erreurs navigateur : ${consoleErrors.join(' | ')}`);
    console.log(`QA navigateur PASS: ${requestedLevel}, niveau rendu et FPS ${runtime.fps}.`);
  } else if (requestedScene === 'victory') {
    if (consoleErrors.length) throw new Error(`Erreurs navigateur : ${consoleErrors.join(' | ')}`);
    console.log(`QA navigateur PASS: écran ${requestedScene}, viewport ${viewportWidth}x${viewportHeight}.`);
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

  await waitForQuestStep(cdp, 'talk-midou');
  await holdKey(cdp, 'ArrowRight', 460);
  await holdKey(cdp, 'ArrowUp', 430);
  await key(cdp, 'e');
  await waitForQuestStep(cdp, 'run-init');

  await holdKey(cdp, 'ArrowLeft', 620);
  await holdKey(cdp, 'ArrowDown', 1350);
  await key(cdp, 'e');
  const crystalSave = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!crystalSave?.collectedObjects?.['level-01']?.includes('memory-crystal') || crystalSave.xp?.total < 10) throw new Error('Le cristal ou son XP n’est pas persisté après une interaction réelle.');

  await key(cdp, 't');
  await waitForState(cdp, 'terminal');
  await new Promise((resolve) => setTimeout(resolve, 150));
  await cdp.send('Input.insertText', { text: 'git init' });
  await key(cdp, 'Enter');
  await waitForQuestStep(cdp, 'collect-key');
  const save = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!save || save.version !== 1 || save.levelId !== 'level-01' || !save.git?.initialized) throw new Error('La sauvegarde ou git init n’est pas confirmé par le navigateur.');
  await key(cdp, 'Escape');
  await waitForState(cdp, 'world');
  await holdKey(cdp, 'ArrowUp', 1000);
  await holdKey(cdp, 'ArrowRight', 4300);
  await holdKey(cdp, 'ArrowDown', 1000);
  await key(cdp, 'e');
  await waitForQuestStep(cdp, 'open-exit');
  const keySave = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!keySave?.inventory?.items?.includes('pass-key') || keySave.xp?.total < 60) throw new Error('Le coffre, la clé ou l’XP du niveau 1 n’est pas confirmé.');
  await holdKey(cdp, 'ArrowUp', 850);
  await holdKey(cdp, 'ArrowRight', 850);
  await key(cdp, 'e');
  const levelStarted = Date.now();
  let nextLevel = await cdp.evaluate('document.documentElement.dataset.gitquestLevel ?? ""');
  while (nextLevel !== 'level-02' && Date.now() - levelStarted < 5000) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    nextLevel = await cdp.evaluate('document.documentElement.dataset.gitquestLevel ?? ""');
  }
  if (nextLevel !== 'level-02') throw new Error(`Le niveau 2 n’a pas été chargé après l’ouverture de la porte : ${nextLevel}`);
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForState(cdp, 'title');
  // With an existing save the compact landscape layout has three buttons;
  // Continue is the middle action at this viewport.
  await clickMenuButton(cdp, 1, 3);
  await waitForState(cdp, 'world');
  const resumed = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!resumed || resumed.version !== 1 || resumed.levelId !== 'level-02' || !resumed.git?.initialized || resumed.xp?.total < 60) {
    throw new Error('La reprise après actualisation n’a pas restauré la partie sauvegardée.');
  }
  for (const level of legacyLevels) await runLegacyLevel(cdp, level);
  if (consoleErrors.length) throw new Error(`Erreurs navigateur : ${consoleErrors.join(' | ')}`);
  const finalSave = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!finalSave || finalSave.levelId !== 'level-06' || finalSave.xp?.total < 360) throw new Error('La progression complète des six niveaux n’est pas persistée.');
  console.log('QA navigateur PASS: menu, paramètres, RTL, niveaux 1 à 6, commandes Git, récompenses, portes, victoire, sauvegarde et reprise.');
  }
} finally {
  cdp?.socket.close();
  await stopProcess(chrome);
  await stopProcess(server);
  await removeProfile(profile);
}
