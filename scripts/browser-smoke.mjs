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
const requestedLocale = process.env.GITQUEST_QA_LOCALE;
let nextTouchId = 10;
const appUrl = requestedLevel
  ? `http://127.0.0.1:${appPort}/?qa=benchmark&qaLevel=${encodeURIComponent(requestedLevel)}&perf=1`
  : requestedScene === 'victory'
    ? `http://127.0.0.1:${appPort}/?qa=victory`
  : `http://127.0.0.1:${appPort}/?qa=browser`;

const legacyLevels = [
  { id: 'level-02', next: 'level-03', minimumXp: 120, mentor: { x: 240, y: 180 }, crystal: { x: 125, y: 410 }, terminalWaypoints: [{ x: 220, y: 310 }, { x: 478, y: 310 }, { x: 478, y: 136 }], chest: { x: 760, y: 240 }, gate: { x: 900, y: 270 }, commands: [{ operation: 'add', text: 'git add .' }], chestWaypoints: [{ x: 125, y: 430 }, { x: 700, y: 430 }, { x: 700, y: 240 }, { x: 760, y: 240 }], toGate: [{ key: 'ArrowDown', ms: 220 }, { key: 'ArrowRight', ms: 1000 }] },
  { id: 'level-03', next: 'level-04', minimumXp: 180, mentor: { x: 180, y: 300 }, crystal: { x: 130, y: 380 }, terminalWaypoints: [{ x: 130, y: 300 }, { x: 468, y: 300 }, { x: 468, y: 138 }], chest: { x: 760, y: 170 }, gate: { x: 900, y: 270 }, commands: [{ operation: 'commit', text: 'git commit -m "archive"' }], chestWaypoints: [{ x: 500, y: 380 }, { x: 500, y: 350 }, { x: 560, y: 360 }, { x: 680, y: 360 }, { x: 680, y: 170 }, { x: 760, y: 170 }], toGate: [{ key: 'ArrowDown', ms: 700 }, { key: 'ArrowRight', ms: 1000 }] },
  { id: 'level-04', next: 'level-05', minimumXp: 240, mentor: { x: 110, y: 190 }, crystal: { x: 130, y: 390 }, terminalWaypoints: [{ x: 130, y: 330 }, { x: 300, y: 330 }, { x: 464, y: 330 }, { x: 464, y: 213 }], chest: { x: 740, y: 330 }, gate: { x: 900, y: 270 }, commands: [{ operation: 'push', text: 'git push' }, { operation: 'pull', text: 'git pull' }], chestWaypoints: [{ x: 350, y: 390 }, { x: 350, y: 310 }, { x: 740, y: 310 }, { x: 740, y: 330 }], toGate: [{ key: 'ArrowUp', ms: 450 }, { key: 'ArrowRight', ms: 1100 }] },
  { id: 'level-05', next: 'level-06', minimumXp: 300, mentor: { x: 110, y: 180 }, crystal: { x: 130, y: 405 }, terminalWaypoints: [{ x: 440, y: 418 }], chest: { x: 720, y: 190 }, gate: { x: 900, y: 270 }, commands: [{ operation: 'branch', text: 'git branch feature' }, { operation: 'switch', text: 'git switch feature' }], chestWaypoints: [{ x: 130, y: 430 }, { x: 580, y: 430 }, { x: 580, y: 190 }, { x: 720, y: 190 }], gateWaypoints: [{ x: 760, y: 190 }, { x: 900, y: 190 }, { x: 900, y: 270 }] },
  { id: 'level-06', minimumXp: 360, mentor: { x: 110, y: 180 }, crystal: { x: 115, y: 390 }, terminalWaypoints: [{ x: 115, y: 330 }, { x: 358, y: 330 }], chest: { x: 790, y: 255 }, gate: { x: 900, y: 270 }, commands: [{ operation: 'merge', text: 'git merge main' }], chestWaypoints: [{ x: 115, y: 450 }, { x: 430, y: 450 }, { x: 650, y: 450 }, { x: 650, y: 255 }, { x: 790, y: 255 }], toGate: [{ key: 'ArrowRight', ms: 760 }, { key: 'ArrowDown', ms: 100 }] },
];

const terminalWaypointsByLevel = {
  'level-01': [{ x: 320, y: 540 }, { x: 320, y: 700 }, { x: 620, y: 700 }, { x: 720, y: 600 }, { x: 700, y: 560 }],
  ...Object.fromEntries(legacyLevels.map((level) => [level.id, level.terminalWaypoints])),
};

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

// A cold Vite/Chrome start can compile and load the regional asset bundle
// after the page is already visible. Keep the browser check bounded, but do
// not turn that legitimate startup cost into a false negative.
async function waitForState(cdp, expected, timeoutMs = 90000) {
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

async function waitForIntroPage(cdp, expected, timeoutMs = 3000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const page = await cdp.evaluate('document.documentElement.dataset.gitquestIntroPage ?? ""');
    if (page === String(expected)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const page = await cdp.evaluate('document.documentElement.dataset.gitquestIntroPage ?? ""');
  throw new Error(`Page d’introduction attendue « ${expected} », obtenue « ${page} »`);
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

async function debugPlayer(cdp, label) {
  if (process.env.GITQUEST_QA_DEBUG !== '1') return;
  const state = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0), quest: document.documentElement.dataset.gitquestQuestStep ?? "" })');
  console.log(`QA debug ${label}: x=${state.x.toFixed(1)} y=${state.y.toFixed(1)} quest=${state.quest}`);
}

async function assertLevel1Animations(cdp) {
  if (process.env.GITQUEST_QA_ANIMATION !== '1') return;
  for (const [direction, key] of [['ArrowRight', 'right'], ['ArrowDown', 'down'], ['ArrowLeft', 'left'], ['ArrowUp', 'up']]) {
    await holdKey(cdp, direction, 220);
    const animation = await cdp.evaluate('document.documentElement.dataset.gitquestPlayerAnimation ?? ""');
    if (animation !== `level-01-player-walk-${key}`) throw new Error(`Animation niveau 1 attendue ${key}, obtenue ${animation || 'aucune'}`);
  }
  console.log('QA animation PASS: joueur niveau 1, quatre directions.');
}

async function waitForGateState(cdp, expected, timeoutMs = 3000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const state = await cdp.evaluate('document.documentElement.dataset.gitquestGateState ?? ""');
    if (state === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const state = await cdp.evaluate('document.documentElement.dataset.gitquestGateState ?? ""');
  throw new Error(`État de porte attendu « ${expected} », obtenu « ${state} »`);
}

async function captureScreenshot(cdp, path) {
  if (!path) return;
  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  await writeFile(path, Buffer.from(screenshot.data, 'base64'));
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
    await key(cdp, 'Enter');
    await new Promise((resolve) => setTimeout(resolve, 180));
  }
  const level = await cdp.evaluate('document.documentElement.dataset.gitquestLevel ?? ""');
  const position = await cdp.evaluate('document.documentElement.dataset.gitquestPlayerX + "," + document.documentElement.dataset.gitquestPlayerY');
  await waitForQuestStep(cdp, expected, 2500).catch((error) => {
    throw new Error(`${error.message} [${level} @ ${position}, cible ${target.x},${target.y}]`);
  });
}

async function runTerminalCommands(cdp, commands) {
  await key(cdp, 't');
  await waitForState(cdp, 'terminal');
  await new Promise((resolve) => setTimeout(resolve, 150));
  if (process.env.GITQUEST_QA_TERMINAL_SCREENSHOT) {
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.GITQUEST_QA_TERMINAL_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
  }
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
  await moveToPoints(cdp, config.terminalWaypoints);
  await runTerminalCommands(cdp, config.commands);
  await moveToPoints(cdp, config.chestWaypoints);
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log(`${config.id} before chest: ${await cdp.evaluate('document.documentElement.dataset.gitquestPlayerX + "," + document.documentElement.dataset.gitquestPlayerY')}`);
  await interactUntilQuestStep(cdp, 'open-exit', config.chest);
  const save = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!save?.inventory?.items?.includes('pass-key') || save.xp?.total < config.minimumXp) throw new Error(`Récompense absente pour ${config.id}.`);
  if (config.gateWaypoints) await moveToPoints(cdp, config.gateWaypoints);
  else await moveAlong(cdp, config.toGate);
  await moveToward(cdp, config.gate);
  if (config.id === 'level-02') await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL2_GATE_OPEN_SCREENSHOT);
  await key(cdp, 'e');
  if (config.next) {
    // A key press can arrive on the same frame as the final movement tick.
    // Retry the already-authorized interaction a few times before failing the
    // browser check; the game-side gate remains idempotent.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (await cdp.evaluate(`document.documentElement.dataset.gitquestLevel === ${JSON.stringify(config.next)}`)) break;
      await key(cdp, 'e');
      await key(cdp, 'Enter');
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
    await waitForLevel(cdp, config.next);
  }
  else await waitForState(cdp, 'victory');
}

async function runLevel2PolishCaptures(cdp) {
  const capture = async (name) => captureScreenshot(cdp, process.env[`GITQUEST_QA_${name}_SCREENSHOT`]);
  // First capture the locked route before any quest step is accepted.
  await moveToPoints(cdp, [{ x: 130, y: 310 }, { x: 700, y: 310 }, { x: 900, y: 310 }, { x: 900, y: 270 }]);
  await capture('GATE_LOCKED');

  // Reload to restore the untouched level-2 start, then document the
  // authored route through Midou and the Git shrine.
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForState(cdp, 'world');
  await waitForQuestStep(cdp, 'talk-midou');
  await new Promise((resolve) => setTimeout(resolve, 650));
  await moveToPoints(cdp, [{ x: 240, y: 300 }, { x: 240, y: 180 }]);
  await capture('MIDOU');
  await key(cdp, 'e');
  await waitForQuestStep(cdp, 'run-add');
  for (let attempt = 0; attempt < 3 && await cdp.evaluate('document.documentElement.dataset.gitquestDialogue === "visible"'); attempt += 1) {
    await key(cdp, 'e');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await moveToPoints(cdp, [{ x: 220, y: 310 }, { x: 430, y: 310 }, { x: 430, y: 150 }]);
  await capture('SHRINE');
}

async function runLevel2OctoCaptures(cdp) {
  const pagePath = (page) => process.env.GITQUEST_QA_OCTO_PAGE_PREFIX?.replace('{page}', String(page));
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForState(cdp, 'world');
  await waitForQuestStep(cdp, 'talk-midou');
  await moveToPoints(cdp, [{ x: 220, y: 310 }, { x: 540, y: 310 }, { x: 560, y: 300 }]);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_OCTO_NEAR_SCREENSHOT);
  if (emulateTouch) {
    const { width, height } = await getGameSize(cdp);
    const metrics = layoutFor(width, height);
    const actionX = width - metrics.margin - 52;
    const actionY = height - metrics.margin - (metrics.portrait ? 108 : 90);
    await tapGame(cdp, actionX, actionY);
  } else {
    await key(cdp, 'e');
  }
  await waitForState(cdp, 'course');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_OCTO_COURSE_SCREENSHOT);
  if (pagePath(1)) await captureScreenshot(cdp, pagePath(1));
  const lockedPosition = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  if (emulateTouch) await holdTouchDirection(cdp, 'left', 220);
  else await holdKey(cdp, 'ArrowLeft', 220);
  const lockedAfterInput = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  if (Math.hypot(lockedAfterInput.x - lockedPosition.x, lockedAfterInput.y - lockedPosition.y) > 1) {
    throw new Error('Le déplacement n’est pas verrouillé pendant le panneau Octo.');
  }
  if (process.env.GITQUEST_QA_OCTO_QUIZ_SCREENSHOTS === '1' || pagePath(2) || pagePath(3) || pagePath(4) || pagePath(5) || pagePath(6)) {
    for (let page = 2; page <= 6; page += 1) {
      await key(cdp, 'ArrowRight');
      await new Promise((resolve) => setTimeout(resolve, 220));
      if (pagePath(page)) await captureScreenshot(cdp, pagePath(page));
    }
  }
  if (process.env.GITQUEST_QA_OCTO_QUIZ_SCREENSHOTS === '1') {
    await runLevel2QuizCaptures(cdp);
  } else if (pagePath(6) && process.env.GITQUEST_QA_OCTO_SKIP_PRACTICE !== '1') await key(cdp, 'Enter');
  else await key(cdp, 'Escape');
  await waitForState(cdp, 'world');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_OCTO_AFTER_PRACTICE_SCREENSHOT);
  const resumedPosition = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  if (emulateTouch) await holdTouchDirection(cdp, 'left', 220);
  else await holdKey(cdp, 'ArrowLeft', 220);
  const resumedAfterInput = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  if (Math.hypot(resumedAfterInput.x - resumedPosition.x, resumedAfterInput.y - resumedPosition.y) <= 1) {
    throw new Error('Le déplacement n’est pas restauré après la fermeture du panneau Octo.');
  }
}

async function runLevel2QuizCaptures(cdp) {
  await clickLevel2CourseQuiz(cdp);
  await waitForCourseQuiz(cdp);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_OCTO_QUIZ_SCREENSHOT);

  await selectQuizAnswer(cdp, 1);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_OCTO_QUIZ_CORRECT_SCREENSHOT);
  await continueQuiz(cdp);
  await selectQuizAnswer(cdp, 0);
  await continueQuiz(cdp);
  await selectQuizAnswer(cdp, 1);
  await continueQuiz(cdp);
  await waitForCourseQuiz(cdp);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_OCTO_QUIZ_RESULT_3_SCREENSHOT);

  await key(cdp, 'ArrowLeft');
  await waitForCourseQuiz(cdp);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_OCTO_QUIZ_REVIEW_SCREENSHOT);
  for (let page = 1; page < 6; page += 1) {
    await key(cdp, 'ArrowRight');
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  await clickLevel2CourseQuiz(cdp);
  await waitForCourseQuiz(cdp);
  await selectQuizAnswer(cdp, 1);
  await continueQuiz(cdp);
  await selectQuizAnswer(cdp, 1);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_OCTO_QUIZ_INCORRECT_SCREENSHOT);
  await continueQuiz(cdp);
  await selectQuizAnswer(cdp, 0);
  await continueQuiz(cdp);
  await waitForCourseQuiz(cdp);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_OCTO_QUIZ_RESULT_1_SCREENSHOT);
  await clickLevel2ResultPractice(cdp);
  await waitForState(cdp, 'world');
}

async function runLevel3OctoCaptures(cdp) {
  const pagePath = (page) => process.env.GITQUEST_QA_LEVEL3_COURSE_PAGE_PREFIX?.replace('{page}', String(page));
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForState(cdp, 'world');
  await waitForQuestStep(cdp, 'talk-midou');
  await moveToPoints(cdp, [{ x: 180, y: 300 }]);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL3_MIDOU_SCREENSHOT);
  await key(cdp, 'e');
  await waitForQuestStep(cdp, 'run-commit');
  for (let attempt = 0; attempt < 3 && await cdp.evaluate('document.documentElement.dataset.gitquestDialogue === "visible"'); attempt += 1) {
    await key(cdp, 'e');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await moveToPoints(cdp, [{ x: 300, y: 260 }]);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL3_OCTO_SCREENSHOT);
  if (emulateTouch) {
    const { width, height } = await getGameSize(cdp);
    const metrics = layoutFor(width, height);
    await tapGame(cdp, width - metrics.margin - 52, height - metrics.margin - (metrics.portrait ? 108 : 90));
  } else {
    await key(cdp, 'e');
  }
  await waitForState(cdp, 'course');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL3_COURSE_SCREENSHOT);
  if (pagePath(1)) await captureScreenshot(cdp, pagePath(1));
  for (let page = 2; page <= 6; page += 1) {
    await key(cdp, 'ArrowRight');
    await new Promise((resolve) => setTimeout(resolve, 220));
    if (pagePath(page)) await captureScreenshot(cdp, pagePath(page));
  }
  if (process.env.GITQUEST_QA_LEVEL3_QUIZ_SCREENSHOTS === '1') {
    await runLevel3QuizCaptures(cdp);
  } else {
    await key(cdp, 'Escape');
  }
  await waitForState(cdp, 'world');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL3_AFTER_PRACTICE_SCREENSHOT);
}

async function runLevel4OctoCaptures(cdp) {
  const pagePath = (page) => process.env.GITQUEST_QA_LEVEL4_COURSE_PAGE_PREFIX?.replace('{page}', String(page));
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForState(cdp, 'world');
  await waitForQuestStep(cdp, 'talk-midou');
  await moveToPoints(cdp, [{ x: 110, y: 190 }]);
  await key(cdp, 'e');
  await waitForQuestStep(cdp, 'run-push');
  for (let attempt = 0; attempt < 3 && await cdp.evaluate('document.documentElement.dataset.gitquestDialogue === "visible"'); attempt += 1) {
    await key(cdp, 'e');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  // wall-a separates the spawn lane from the central port. Approach through
  // the lower opening instead of asking the QA driver to walk through it.
  await moveToPoints(cdp, [{ x: 180, y: 330 }, { x: 560, y: 330 }, { x: 560, y: 300 }]);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL4_OCTO_SCREENSHOT);
  if (emulateTouch) {
    const { width, height } = await getGameSize(cdp);
    const metrics = layoutFor(width, height);
    await tapGame(cdp, width - metrics.margin - 52, height - metrics.margin - (metrics.portrait ? 108 : 90));
  } else {
    await key(cdp, 'e');
  }
  await waitForState(cdp, 'course');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL4_COURSE_SCREENSHOT);
  if (pagePath(1)) await captureScreenshot(cdp, pagePath(1));
  for (let page = 2; page <= 6; page += 1) {
    await key(cdp, 'ArrowRight');
    await new Promise((resolve) => setTimeout(resolve, 220));
    if (pagePath(page)) await captureScreenshot(cdp, pagePath(page));
  }
  await clickLevel2CourseQuiz(cdp);
  await waitForCourseView(cdp, 'quiz');
  await selectLevel3QuizAnswer(cdp, 1);
  await continueLevel3Quiz(cdp);
  await selectLevel3QuizAnswer(cdp, 0);
  await continueLevel3Quiz(cdp);
  await selectLevel3QuizAnswer(cdp, 1);
  await continueLevel3Quiz(cdp);
  await waitForCourseView(cdp, 'result');
  await waitForCourseQuiz(cdp);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL4_QUIZ_RESULT_SCREENSHOT);
  await clickLevel2ResultPractice(cdp);
  await waitForState(cdp, 'world');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL4_AFTER_COURSE_SCREENSHOT);
}

async function runLevel5OctoCaptures(cdp) {
  const pagePath = (page) => process.env.GITQUEST_QA_LEVEL5_COURSE_PAGE_PREFIX?.replace('{page}', String(page));
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForState(cdp, 'world');
  await waitForQuestStep(cdp, 'talk-midou');
  await moveToPoints(cdp, [{ x: 540, y: 270 }]);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL5_OCTO_SCREENSHOT);
  await key(cdp, 'e');
  await waitForState(cdp, 'course');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL5_COURSE_SCREENSHOT);
  if (pagePath(1)) await captureScreenshot(cdp, pagePath(1));
  const lockedPosition = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  await holdKey(cdp, 'ArrowLeft', 220);
  const lockedAfterInput = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  if (Math.hypot(lockedAfterInput.x - lockedPosition.x, lockedAfterInput.y - lockedPosition.y) > 1) {
    throw new Error('Le déplacement n’est pas verrouillé pendant le cours Octo du niveau 5.');
  }
  for (let page = 2; page <= 6; page += 1) {
    await key(cdp, 'ArrowRight');
    await new Promise((resolve) => setTimeout(resolve, 220));
    if (pagePath(page)) await captureScreenshot(cdp, pagePath(page));
  }
  if (process.env.GITQUEST_QA_LEVEL5_QUIZ_SCREENSHOTS === '1') {
    await clickLevel2CourseQuiz(cdp);
    await waitForCourseView(cdp, 'quiz');
    await selectLevel3QuizAnswer(cdp, 1);
    await continueLevel3Quiz(cdp);
    await selectLevel3QuizAnswer(cdp, 0);
    await continueLevel3Quiz(cdp);
    await selectLevel3QuizAnswer(cdp, 1);
    await continueLevel3Quiz(cdp);
    await waitForCourseView(cdp, 'result');
    await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL5_QUIZ_RESULT_SCREENSHOT);
    await clickLevel2ResultPractice(cdp);
  } else {
    await key(cdp, 'Escape');
  }
  await waitForState(cdp, 'world');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL5_AFTER_COURSE_SCREENSHOT);
}

async function runLevel6OctoCaptures(cdp) {
  const pagePath = (page) => process.env.GITQUEST_QA_LEVEL6_COURSE_PAGE_PREFIX?.replace('{page}', String(page));
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForState(cdp, 'world');
  await waitForQuestStep(cdp, 'talk-midou');
  await moveToPoints(cdp, [{ x: 130, y: 300 }]);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL6_OCTO_SCREENSHOT);
  await key(cdp, 'e');
  await waitForState(cdp, 'course');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL6_COURSE_SCREENSHOT);
  if (pagePath(1)) await captureScreenshot(cdp, pagePath(1));
  const lockedPosition = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  await holdKey(cdp, 'ArrowLeft', 220);
  const lockedAfterInput = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  if (Math.hypot(lockedAfterInput.x - lockedPosition.x, lockedAfterInput.y - lockedPosition.y) > 1) {
    throw new Error('Le déplacement n’est pas verrouillé pendant le cours Octo du niveau 6.');
  }
  for (let page = 2; page <= 6; page += 1) {
    await key(cdp, 'ArrowRight');
    await new Promise((resolve) => setTimeout(resolve, 220));
    if (pagePath(page)) await captureScreenshot(cdp, pagePath(page));
  }
  await key(cdp, 'Escape');
  await waitForState(cdp, 'world');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL6_AFTER_COURSE_SCREENSHOT);
}

async function runLevel3QuizCaptures(cdp) {
  await clickLevel2CourseQuiz(cdp);
  await waitForCourseView(cdp, 'quiz');
  await waitForCourseQuiz(cdp);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL3_QUIZ_SCREENSHOT);
  await selectLevel3QuizAnswer(cdp, 1);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL3_QUIZ_CORRECT_SCREENSHOT);
  await continueLevel3Quiz(cdp);
  await waitForCourseView(cdp, 'quiz');
  await selectLevel3QuizAnswer(cdp, 1);
  await continueLevel3Quiz(cdp);
  await waitForCourseView(cdp, 'quiz');
  await selectLevel3QuizAnswer(cdp, 0);
  await continueLevel3Quiz(cdp);
  await waitForCourseView(cdp, 'result');
  await waitForCourseQuiz(cdp);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL3_QUIZ_RESULT_3_SCREENSHOT);
  await key(cdp, 'ArrowLeft');
  await waitForCourseView(cdp, 'course');
  await waitForCourseQuiz(cdp);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL3_QUIZ_REVIEW_SCREENSHOT);
  for (let page = 1; page < 6; page += 1) {
    await key(cdp, 'ArrowRight');
    await new Promise((resolve) => setTimeout(resolve, 260));
  }
  await clickLevel2CourseQuiz(cdp);
  await waitForCourseView(cdp, 'quiz');
  await waitForCourseQuiz(cdp);
  await selectLevel3QuizAnswer(cdp, 0);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL3_QUIZ_INCORRECT_SCREENSHOT);
  await continueLevel3Quiz(cdp);
  await selectLevel3QuizAnswer(cdp, 0);
  await continueLevel3Quiz(cdp);
  await selectLevel3QuizAnswer(cdp, 2);
  await continueLevel3Quiz(cdp);
  await waitForCourseView(cdp, 'result');
  await waitForCourseQuiz(cdp);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_LEVEL3_QUIZ_RESULT_1_SCREENSHOT);
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log('QA level3: score 1/3 captured, opening practice.');
  await clickLevel2ResultPractice(cdp);
  await waitForState(cdp, 'world');
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log('QA level3: practice action dispatched, state=' + await cdp.evaluate('document.documentElement.dataset.gitquestQa ?? ""'));
}

async function selectLevel3QuizAnswer(cdp, index) {
  if (!emulateTouch) {
    await selectQuizAnswer(cdp, index);
    return;
  }
  const geometry = await level2PanelGeometry(cdp, 'quiz');
  const answerY = geometry.portrait
    ? 350 + index * 46 + 17
    : (geometry.compact ? 158 + index * 40 + 17 : 204 + index * 46 + 19);
  const answerX = geometry.left + geometry.panelWidth / 2;
  await tapGame(cdp, answerX, geometry.top + answerY);
  await new Promise((resolve) => setTimeout(resolve, 140));
  // The compatibility mouse event is a safe fallback: once the answer is
  // accepted the Phaser button is disabled, so this cannot select twice.
  await click(cdp, answerX, geometry.top + answerY);
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log(`QA quiz answer tap at ${answerX},${geometry.top + answerY}, progress=${await cdp.evaluate('document.documentElement.dataset.gitquestCourseProgress ?? ""')}`);
}

async function continueLevel3Quiz(cdp) {
  if (!emulateTouch) {
    await continueQuiz(cdp);
    return;
  }
  const geometry = await level2PanelGeometry(cdp, 'quiz');
  const rtl = await cdp.evaluate('document.documentElement.dir === "rtl"');
  const x = rtl
    ? geometry.left + (geometry.portrait ? 80 : 192)
    : geometry.portrait
      ? geometry.left + geometry.panelWidth - 80
      : geometry.left + geometry.panelWidth - 192;
  // In compact landscape the button sits on the lower action row, close to
  // the panel bottom. Keep the tap inside its visual hitbox instead of
  // relying on the old desktop-centered estimate.
  const y = geometry.top + (geometry.portrait ? geometry.height - 52 : geometry.height - 28);
  await tapGame(cdp, x, y);
  await new Promise((resolve) => setTimeout(resolve, 140));
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log(`QA quiz continue tap at ${x},${y}, view=${await cdp.evaluate('document.documentElement.dataset.gitquestCourseView ?? ""')}, progress=${await cdp.evaluate('document.documentElement.dataset.gitquestCourseProgress ?? ""')}`);
}

async function selectQuizAnswer(cdp, index) {
  for (let step = 0; step < index; step += 1) {
    await key(cdp, 'ArrowDown');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await key(cdp, 'Enter');
  await new Promise((resolve) => setTimeout(resolve, 140));
}

async function continueQuiz(cdp) {
  await key(cdp, 'Enter');
  await new Promise((resolve) => setTimeout(resolve, 140));
}

async function waitForCourseQuiz(cdp) {
  const started = Date.now();
  while (Date.now() - started < 1500) {
    const visible = await cdp.evaluate('document.documentElement.dataset.gitquestQa === "course"');
    if (visible) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Le panneau de quiz Octo n’est pas visible.');
}

async function waitForCourseView(cdp, expected, timeoutMs = 2500) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await cdp.evaluate('document.documentElement.dataset.gitquestCourseView ?? ""') === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  const view = await cdp.evaluate('document.documentElement.dataset.gitquestCourseView ?? ""');
  throw new Error(`Vue Octo attendue « ${expected} », obtenue « ${view} ».`);
}

async function clickLevel2CourseQuiz(cdp) {
  if (!emulateTouch) {
    await key(cdp, 'q');
    await new Promise((resolve) => setTimeout(resolve, 180));
    return;
  }
  const geometry = await level2PanelGeometry(cdp, 'course');
  const y = geometry.top + geometry.height - (geometry.portrait ? 105 : geometry.compact ? 62 : 76);
  const x = geometry.left + geometry.panelWidth / 2;
  await inputGame(cdp, x, y);
  await new Promise((resolve) => setTimeout(resolve, 160));
  if (await cdp.evaluate('document.documentElement.dataset.gitquestQa === "course"')) {
    // Chrome touch emulation can miss Phaser's text hit area when the canvas
    // is resized between the course page and the quiz action row.
    await click(cdp, x, y);
    await new Promise((resolve) => setTimeout(resolve, 120));
    if (await cdp.evaluate('document.documentElement.dataset.gitquestQa === "course"')) await key(cdp, 'q');
  }
}

async function clickLevel2ResultPractice(cdp) {
  if (!emulateTouch) {
    await key(cdp, 'p');
    await new Promise((resolve) => setTimeout(resolve, 180));
    return;
  }
  const geometry = await level2PanelGeometry(cdp, 'result');
  const rtl = await cdp.evaluate('document.documentElement.dir === "rtl"');
  const x = geometry.portrait
    ? geometry.left + geometry.panelWidth / 2
    : rtl ? geometry.left + 90 : geometry.left + geometry.panelWidth - 110;
  const y = geometry.top + geometry.height - (geometry.portrait ? 60 : geometry.compact ? 58 : 64);
  await inputGame(cdp, x, y);
  await new Promise((resolve) => setTimeout(resolve, 180));
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log(`QA result practice tap at ${x},${y}, state=${await cdp.evaluate('document.documentElement.dataset.gitquestQa ?? ""')}`);
  if (await cdp.evaluate('document.documentElement.dataset.gitquestQa === "course"')) {
    // Headless touch emulation does not always synthesize the compatibility
    // mouse event generated by a real mobile browser after touchend.
    await click(cdp, x, y);
    await new Promise((resolve) => setTimeout(resolve, 120));
    if (process.env.GITQUEST_QA_DEBUG === '1') console.log('QA result practice mouse fallback state=' + await cdp.evaluate('document.documentElement.dataset.gitquestQa ?? ""'));
    if (await cdp.evaluate('document.documentElement.dataset.gitquestQa === "course"')) await key(cdp, 'p');
    if (process.env.GITQUEST_QA_DEBUG === '1') console.log('QA result practice keyboard fallback state=' + await cdp.evaluate('document.documentElement.dataset.gitquestQa ?? ""') + ', reason=' + await cdp.evaluate('document.documentElement.dataset.gitquestCourseCloseReason ?? ""'));
  }
}

async function level2PanelGeometry(cdp, view) {
  const { width, height } = await getGameSize(cdp);
  const metrics = layoutFor(width, height);
  const panelWidth = metrics.portrait ? Math.min(366, width - metrics.margin * 2) : metrics.compact ? Math.min(760, width - metrics.margin * 2) : Math.min(820, width - metrics.margin * 2);
  const panelHeight = metrics.portrait ? Math.min(600, height - 24) : metrics.compact ? view === 'course' ? 300 : 340 : view === 'course' ? 370 : 410;
  return { width, height, portrait: metrics.portrait, compact: metrics.compact, left: (width - panelWidth) / 2, top: Math.max(metrics.margin, (height - panelHeight) / 2), panelWidth, height: panelHeight };
}

async function inputGame(cdp, x, y) {
  if (emulateTouch) await tapGame(cdp, x, y);
  else await click(cdp, x, y);
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

async function tapGame(cdp, x, y) {
  const rect = await cdp.evaluate('(() => { const canvas = document.querySelector("canvas"); const rect = canvas?.getBoundingClientRect(); return rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, gameWidth: canvas.width, gameHeight: canvas.height } : null; })()');
  if (!rect) throw new Error('Canvas introuvable pour le tap QA.');
  const pageX = rect.left + x * rect.width / rect.gameWidth;
  const pageY = rect.top + y * rect.height / rect.gameHeight;
  const touchId = nextTouchId++;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pageX, y: pageY, id: touchId }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function holdTouchDirection(cdp, direction, durationMs) {
  const { width, height } = await getGameSize(cdp);
  const metrics = layoutFor(width, height);
  const joystick = {
    x: metrics.margin + 64,
    y: height - metrics.margin - 64,
  };
  const offsets = { left: { x: -34, y: 0 }, right: { x: 34, y: 0 }, up: { x: 0, y: -34 }, down: { x: 0, y: 34 } };
  const offset = offsets[direction];
  if (!offset) throw new Error(`Direction tactile inconnue: ${direction}`);
  const rect = await cdp.evaluate('(() => { const canvas = document.querySelector("canvas"); const rect = canvas?.getBoundingClientRect(); return rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, gameWidth: canvas.width, gameHeight: canvas.height } : null; })()');
  if (!rect) throw new Error('Canvas introuvable pour le déplacement tactile QA.');
  const gameX = joystick.x + offset.x;
  const gameY = joystick.y + offset.y;
  const pageX = rect.left + gameX * rect.width / rect.gameWidth;
  const pageY = rect.top + gameY * rect.height / rect.gameHeight;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pageX, y: pageY, id: 2 }] });
  const started = Date.now();
  while (Date.now() - started < durationMs) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pageX, y: pageY, id: 2 }] });
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function holdTouchVector(cdp, vector, durationMs, screenshotPath) {
  const { width, height } = await getGameSize(cdp);
  const metrics = layoutFor(width, height);
  const joystick = { x: metrics.margin + 64, y: height - metrics.margin - 64 };
  const rect = await cdp.evaluate('(() => { const canvas = document.querySelector("canvas"); const rect = canvas?.getBoundingClientRect(); return rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, gameWidth: canvas.width, gameHeight: canvas.height } : null; })()');
  if (!rect) throw new Error('Canvas introuvable pour le vecteur tactile QA.');
  const pageX = rect.left + (joystick.x + vector.x) * rect.width / rect.gameWidth;
  const pageY = rect.top + (joystick.y + vector.y) * rect.height / rect.gameHeight;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pageX, y: pageY, id: 3 }] });
  const started = Date.now();
  let captured = false;
  while (Date.now() - started < durationMs) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pageX, y: pageY, id: 3 }] });
    if (!captured && screenshotPath && Date.now() - started > Math.min(180, durationMs / 2)) {
      await captureScreenshot(cdp, screenshotPath);
      captured = true;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function touchActionButton(cdp, kind) {
  const { width, height } = await getGameSize(cdp);
  const metrics = layoutFor(width, height);
  const action = { x: width - metrics.margin - 38, y: height - metrics.margin - 52 };
  const terminal = { x: action.x, y: action.y - 84 };
  const point = kind === 'terminal' ? terminal : action;
  await tapGame(cdp, point.x, point.y);
}

async function runTouchControlsSmoke(cdp) {
  const initial = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  await holdTouchDirection(cdp, 'left', 1650);
  await holdTouchVector(cdp, { x: -30, y: -30 }, 500, process.env.GITQUEST_QA_JOYSTICK_SCREENSHOT);
  const moved = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  if (process.env.GITQUEST_QA_DEBUG === '1') console.log(`QA touch movement: initial=${JSON.stringify(initial)} moved=${JSON.stringify(moved)}`);
  if (Math.hypot(moved.x - initial.x, moved.y - initial.y) < 40) throw new Error('Le joystick tactile n’a pas déplacé le joueur.');
  await holdTouchDirection(cdp, 'right', 150);
  const released = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  await new Promise((resolve) => setTimeout(resolve, 180));
  const stopped = await cdp.evaluate('({ x: Number(document.documentElement.dataset.gitquestPlayerX ?? 0), y: Number(document.documentElement.dataset.gitquestPlayerY ?? 0) })');
  if (Math.hypot(stopped.x - released.x, stopped.y - released.y) > 14) throw new Error('Le joystick tactile continue à déplacer le joueur après relâchement.');

  // Rejoin Midou with keyboard only to isolate the action-button contract.
  await moveToPoints(cdp, [{ x: 460, y: 340 }]);
  await touchActionButton(cdp, 'interact');
  await new Promise((resolve) => setTimeout(resolve, 180));
  if (await cdp.evaluate('document.documentElement.dataset.gitquestDialogue !== "visible"')) throw new Error('Le bouton tactile Interaction n’a pas ouvert le dialogue de Midou.');
  if (await cdp.evaluate('document.documentElement.dataset.gitquestTouchControls !== "hidden"')) throw new Error('Les contrôles tactiles restent visibles au-dessus du dialogue.');
  await key(cdp, 'Enter');
  await new Promise((resolve) => setTimeout(resolve, 120));
  if (await cdp.evaluate('document.documentElement.dataset.gitquestTouchControls !== "visible"')) throw new Error('Les contrôles tactiles ne sont pas restaurés après le dialogue.');

  await moveToPoints(cdp, terminalWaypointsByLevel['level-01']);
  await touchActionButton(cdp, 'terminal');
  await waitForState(cdp, 'terminal');
  if (await cdp.evaluate('document.documentElement.dataset.gitquestTouchControls !== "hidden"')) throw new Error('Les contrôles tactiles restent visibles au-dessus du terminal.');
  if (process.env.GITQUEST_QA_TOUCH_SCREENSHOT) await captureScreenshot(cdp, process.env.GITQUEST_QA_TOUCH_SCREENSHOT);
  await key(cdp, 'Escape');
  await waitForState(cdp, 'world');
  if (await cdp.evaluate('document.documentElement.dataset.gitquestTouchControls !== "visible"')) throw new Error('Les contrôles tactiles ne sont pas restaurés après le terminal.');
  console.log(`QA tactile PASS: joystick, diagonale, relâchement, interaction, terminal et verrouillage modal (${moved.x.toFixed(1)},${moved.y.toFixed(1)}).`);
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
  const panelWidth = Math.min(metrics.portrait ? 560 : 960, width - metrics.margin * 2);
  const panelHeight = metrics.portrait ? Math.min(400, height * 0.48) : metrics.compact ? Math.min(220, height - metrics.margin * 2) : 252;
  const panelTop = height - metrics.margin - panelHeight;
  const stacked = metrics.portrait || panelWidth < 500;
  const buttonY = panelTop + panelHeight - (stacked ? 66 : 32);
  const nextWidth = stacked ? panelWidth - 34 : 230;
  const skipWidth = stacked ? panelWidth - 34 : 132;
  const groupGap = 12;
  const groupLeft = width / 2 - (nextWidth + groupGap + skipWidth) / 2;
  const skipX = stacked ? width / 2 : groupLeft + nextWidth + groupGap + skipWidth / 2;
  await click(cdp, skipX, stacked ? buttonY + 25 : buttonY);
}

async function clickIntroductionNext(cdp) {
  const { width, height } = await getGameSize(cdp);
  const metrics = layoutFor(width, height);
  const panelWidth = Math.min(metrics.portrait ? 560 : 960, width - metrics.margin * 2);
  const panelHeight = metrics.portrait ? Math.min(400, height * 0.48) : metrics.compact ? Math.min(220, height - metrics.margin * 2) : 252;
  const panelTop = height - metrics.margin - panelHeight;
  const stacked = metrics.portrait || panelWidth < 500;
  const buttonY = panelTop + panelHeight - (stacked ? 66 : 32);
  const nextWidth = stacked ? panelWidth - 34 : 230;
  const skipWidth = stacked ? panelWidth - 34 : 132;
  const groupGap = 12;
  const groupLeft = width / 2 - (nextWidth + groupGap + skipWidth) / 2;
  const nextX = stacked ? width / 2 : groupLeft + nextWidth / 2;
  await click(cdp, nextX, stacked ? buttonY - 25 : buttonY);
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
    throw new Error('Le canvas ou la direction initiale n’est pas correctement exposé: ' + JSON.stringify(basics));
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
let chrome;

let cdp;
try {
  await waitFor(`http://127.0.0.1:${appPort}/`);
  // Do not navigate Chrome before Vite is serving. On a cold Windows start,
  // Chrome can otherwise keep its initial connection-error document and
  // never reach the QA page even though the server becomes ready moments
  // later.
  chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${profile}`, `--window-size=${viewportWidth},${viewportHeight}`, appUrl,
  ], { stdio: 'ignore', windowsHide: true });
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
  if (requestedLevel && (requestedLocale === 'fr' || requestedLocale === 'en' || requestedLocale === 'ar')) {
    // Reload the same data-driven level with a valid saved locale so the
    // rendered HUD can be inspected in RTL without changing game logic.
    const locale = JSON.stringify(requestedLocale);
    const levelId = JSON.stringify(requestedLevel);
    const localeWritten = await cdp.evaluate(`(() => {
      const raw = localStorage.getItem('gitquest-save');
      const save = raw ? JSON.parse(raw) : {
        version: 1,
        levelId: ${levelId},
        locale: 'fr',
        touchControlsMode: 'auto',
        inventory: { items: [] },
        xp: { total: 0 },
        quests: {},
        collectedObjects: {},
        discoveredSecrets: {},
        git: { version: 1, initialized: false, files: { 'notes.txt': 'Une idée naît sur l’île.' }, staged: [], commits: [], currentBranch: 'main', branches: { main: [] }, remoteCommits: [], conflicts: [] }
      };
      save.locale = ${locale};
      localStorage.setItem('gitquest-save', JSON.stringify(save));
      return true;
    })()`);
    if (!localeWritten) throw new Error('La sauvegarde QA n’a pas pu recevoir la langue demandée.');
    await cdp.send('Page.reload', { ignoreCache: true });
    await waitForState(cdp, 'world');
    const expectedDirection = requestedLocale === 'ar' ? 'rtl' : '';
    const directionStarted = Date.now();
    let direction = await cdp.evaluate('({ lang: document.documentElement.lang, dir: document.documentElement.dir })');
    while ((direction.lang !== requestedLocale || direction.dir !== expectedDirection) && Date.now() - directionStarted < 3000) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      direction = await cdp.evaluate('({ lang: document.documentElement.lang, dir: document.documentElement.dir })');
    }
    if (direction.lang !== requestedLocale || direction.dir !== expectedDirection) throw new Error(`La direction du HUD n’est pas active: ${JSON.stringify(direction)}.`);
  }
  if (requestedLevel === 'level-03' && process.env.GITQUEST_QA_LEVEL3_COMPLETE === '1') {
    // A direct level-3 smoke test represents arrival from level 2. Seed only
    // the prerequisite Git state; the commit itself is still entered through
    // the real terminal and validated by QuestManager.
    const prerequisiteWritten = await cdp.evaluate(`(() => {
      const raw = localStorage.getItem('gitquest-save');
      const save = raw ? JSON.parse(raw) : {};
      save.levelId = 'level-03';
      save.xp = { total: Math.max(120, Number(save.xp?.total ?? 0)) };
      save.git = {
        version: 1,
        initialized: true,
        files: save.git?.files ?? { 'notes.txt': 'Une idée naît sur l’île.' },
        staged: ['notes.txt'],
        commits: save.git?.commits ?? [],
        currentBranch: save.git?.currentBranch ?? 'main',
        branches: save.git?.branches ?? { main: [] },
        remoteCommits: save.git?.remoteCommits ?? [],
        conflicts: save.git?.conflicts ?? []
      };
      localStorage.setItem('gitquest-save', JSON.stringify(save));
      return true;
    })()`);
    if (!prerequisiteWritten) throw new Error('La précondition Git du smoke test niveau 3 n’a pas pu être préparée.');
    await cdp.send('Page.reload', { ignoreCache: true });
    await waitForState(cdp, 'world');
  }
  if (requestedLevel === 'level-04' && process.env.GITQUEST_QA_LEVEL4_COMPLETE === '1') {
    // A direct level-four smoke test represents arrival from level three.
    // Seed only the already-earned commit; push and pull still run through
    // the real terminal and QuestManager.
    const prerequisiteWritten = await cdp.evaluate(`(() => {
      const raw = localStorage.getItem('gitquest-save');
      const save = raw ? JSON.parse(raw) : {};
      save.levelId = 'level-04';
      save.xp = { total: Math.max(180, Number(save.xp?.total ?? 0)) };
      save.git = {
        version: 1,
        initialized: true,
        files: save.git?.files ?? { 'notes.txt': 'Une idée naît sur l’île.' },
        staged: [],
        commits: [{ id: 'c1', message: 'archive', files: ['notes.txt'], branch: 'main' }],
        currentBranch: 'main',
        branches: { main: ['c1'] },
        remoteCommits: [],
        conflicts: []
      };
      localStorage.setItem('gitquest-save', JSON.stringify(save));
      return true;
    })()`);
    if (!prerequisiteWritten) throw new Error('La précondition Git du smoke test niveau 4 n’a pas pu être préparée.');
    await cdp.send('Page.reload', { ignoreCache: true });
    await waitForState(cdp, 'world');
  }
  if (process.env.GITQUEST_QA_SCREENSHOT) {
    // WorldScene fades in after the QA marker is published. Wait for the
    // actual rendered scene so level captures are not taken through black.
    if (requestedLevel) await new Promise((resolve) => setTimeout(resolve, 650));
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.GITQUEST_QA_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
  }
  if (requestedLevel && process.env.GITQUEST_QA_INVENTORY_SCREENSHOT) {
    await key(cdp, 'i');
    const inventoryStarted = Date.now();
    while (Date.now() - inventoryStarted < 1500) {
      if (await cdp.evaluate('document.documentElement.dataset.gitquestInventory === "visible"')) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (!await cdp.evaluate('document.documentElement.dataset.gitquestInventory === "visible"')) throw new Error('Le panneau d’inventaire ne s’est pas ouvert.');
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.GITQUEST_QA_INVENTORY_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
    await key(cdp, 'i');
    if (await cdp.evaluate('document.documentElement.dataset.gitquestInventory === "visible"')) throw new Error('Le panneau d’inventaire ne s’est pas refermé.');
  }
  if (requestedLevel && process.env.GITQUEST_QA_TERMINAL_SCREENSHOT) {
    await moveToPoints(cdp, terminalWaypointsByLevel[requestedLevel] ?? []);
    await key(cdp, 't');
    await waitForState(cdp, 'terminal');
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.GITQUEST_QA_TERMINAL_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
    await key(cdp, 'Escape');
    await waitForState(cdp, 'world');
  }
  if (requestedLevel && process.env.GITQUEST_QA_JOURNAL_SCREENSHOT) {
    await key(cdp, 'j');
    const journalStarted = Date.now();
    while (Date.now() - journalStarted < 1500) {
      if (await cdp.evaluate('document.documentElement.dataset.gitquestJournal === "visible"')) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (!await cdp.evaluate('document.documentElement.dataset.gitquestJournal === "visible"')) throw new Error('Le journal ne s’est pas ouvert.');
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.GITQUEST_QA_JOURNAL_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
    await key(cdp, 'j');
    if (await cdp.evaluate('document.documentElement.dataset.gitquestJournal === "visible"')) throw new Error('Le journal ne s’est pas refermé.');
  }

  if (requestedLevel === 'level-01' && process.env.GITQUEST_QA_INTERACTIVE_OBJECTS_SCREENSHOTS === '1') {
    await moveToPoints(cdp, [{ x: 700, y: 540 }, { x: 480, y: 540 }]);
    await captureScreenshot(cdp, process.env.GITQUEST_QA_CHEST_CLOSED_SCREENSHOT);
    await cdp.send('Page.reload', { ignoreCache: true });
    await waitForState(cdp, 'world');
    await waitForQuestStep(cdp, 'talk-midou');
    await moveToPoints(cdp, [{ x: 240, y: 270 }, { x: 240, y: 405 }, { x: 210, y: 405 }]);
    await captureScreenshot(cdp, process.env.GITQUEST_QA_CRYSTAL_SCREENSHOT);
    await cdp.send('Page.reload', { ignoreCache: true });
    await waitForState(cdp, 'world');
    await waitForQuestStep(cdp, 'talk-midou');
    await moveToPoints(cdp, [{ x: 300, y: 260 }, { x: 700, y: 260 }, { x: 900, y: 270 }]);
    await waitForGateState(cdp, 'locked');
    await captureScreenshot(cdp, process.env.GITQUEST_QA_GATE_LOCKED_SCREENSHOT);
  }

  if (requestedLevel === 'level-02' && process.env.GITQUEST_QA_POLISH_SCREENSHOTS === '1') {
    await runLevel2PolishCaptures(cdp);
  }

  if (requestedLevel === 'level-02' && process.env.GITQUEST_QA_OCTO_SCREENSHOTS === '1') {
    await runLevel2OctoCaptures(cdp);
  }

  if (requestedLevel === 'level-03' && process.env.GITQUEST_QA_LEVEL3_OCTO_SCREENSHOTS === '1') {
    await runLevel3OctoCaptures(cdp);
  }

  if (requestedLevel === 'level-04' && process.env.GITQUEST_QA_LEVEL4_OCTO_SCREENSHOTS === '1') {
    await runLevel4OctoCaptures(cdp);
  }

  if (requestedLevel === 'level-05' && process.env.GITQUEST_QA_LEVEL5_OCTO_SCREENSHOTS === '1') {
    await runLevel5OctoCaptures(cdp);
  }

  if (requestedLevel === 'level-06' && process.env.GITQUEST_QA_LEVEL6_OCTO_SCREENSHOTS === '1') {
    await runLevel6OctoCaptures(cdp);
  }

  if (requestedLevel === 'level-03' && process.env.GITQUEST_QA_LEVEL3_COMPLETE === '1') {
    await runLegacyLevel(cdp, legacyLevels.find((level) => level.id === 'level-03'));
    if (consoleErrors.length) throw new Error('Erreurs navigateur : ' + consoleErrors.join(' | '));
    const finalLevel3Save = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
    if (!finalLevel3Save || finalLevel3Save.levelId !== 'level-04' || !finalLevel3Save.git?.commits?.length || !finalLevel3Save.collectedObjects?.['level-03']?.includes('cave-chest')) {
      throw new Error('Le parcours complet du niveau 3 n’est pas confirmé dans la sauvegarde: ' + JSON.stringify({ levelId: finalLevel3Save?.levelId, quest: finalLevel3Save?.quests?.['level-03'], commits: finalLevel3Save?.git?.commits, collected: finalLevel3Save?.collectedObjects?.['level-03'], inventory: finalLevel3Save?.inventory, xp: finalLevel3Save?.xp }));
    }
    console.log('QA navigateur PASS: niveau 3 complet, commit, récompense, porte et transition vers ' + finalLevel3Save.levelId + '.');
  } else if (requestedLevel === 'level-04' && process.env.GITQUEST_QA_LEVEL4_COMPLETE === '1') {
    await runLegacyLevel(cdp, legacyLevels.find((level) => level.id === 'level-04'));
    if (consoleErrors.length) throw new Error('Erreurs navigateur : ' + consoleErrors.join(' | '));
    const finalLevel4Save = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
    if (!finalLevel4Save || finalLevel4Save.levelId !== 'level-05' || !finalLevel4Save.git?.remoteCommits?.includes('c1') || !finalLevel4Save.collectedObjects?.['level-04']?.includes('harbor-chest')) {
      throw new Error('Le parcours complet du niveau 4 n’est pas confirmé dans la sauvegarde: ' + JSON.stringify({ levelId: finalLevel4Save?.levelId, quest: finalLevel4Save?.quests?.['level-04'], remoteCommits: finalLevel4Save?.git?.remoteCommits, collected: finalLevel4Save?.collectedObjects?.['level-04'], xp: finalLevel4Save?.xp }));
    }
    console.log('QA navigateur PASS: niveau 4 complet, push, pull, récompense, porte et transition vers ' + finalLevel4Save.levelId + '.');
  } else if (requestedLevel) {
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
    if (requestedLevel === 'level-01' && emulateTouch && process.env.GITQUEST_QA_TOUCH_CONTROLS === '1') {
      await runTouchControlsSmoke(cdp);
    }
    await assertLevel1Animations(cdp);
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
  await waitForIntroPage(cdp, 1);
  if (process.env.GITQUEST_QA_INTRO_SCREENSHOT) {
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.GITQUEST_QA_INTRO_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
  }
  await clickIntroductionNext(cdp);
  await waitForIntroPage(cdp, 2);
  await key(cdp, 'ArrowRight');
  await waitForIntroPage(cdp, 3);
  await key(cdp, 'Enter');
  await waitForIntroPage(cdp, 4);
  await clickIntroductionSkip(cdp);
  await waitForState(cdp, 'world');

  await waitForQuestStep(cdp, 'talk-midou');
  if (process.env.GITQUEST_QA_GATE_LOCKED_SCREENSHOT) {
    await moveToPoints(cdp, [{ x: 300, y: 260 }, { x: 700, y: 260 }, { x: 900, y: 270 }]);
    await waitForGateState(cdp, 'locked');
    await key(cdp, 'e');
    await captureScreenshot(cdp, process.env.GITQUEST_QA_GATE_LOCKED_SCREENSHOT);
    await moveToPoints(cdp, [{ x: 700, y: 340 }, { x: 520, y: 340 }, { x: 460, y: 340 }]);
    await holdKey(cdp, 'ArrowRight', 350);
    await captureScreenshot(cdp, process.env.GITQUEST_QA_MIDOU_SCREENSHOT);
    await holdKey(cdp, 'ArrowLeft', 350);
  } else {
    await moveToward(cdp, { x: 460, y: 340 }, 30);
  }
  await debugPlayer(cdp, 'after-midou-route');
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (await cdp.evaluate('document.documentElement.dataset.gitquestQuestStep === "run-init"')) break;
    await key(cdp, 'e');
    await key(cdp, 'Enter');
    await new Promise((resolve) => setTimeout(resolve, 180));
  }
  await waitForQuestStep(cdp, 'run-init');

  if (process.env.GITQUEST_QA_GATE_LOCKED_SCREENSHOT) {
    await moveToPoints(cdp, [{ x: 240, y: 270 }, { x: 240, y: 405 }, { x: 210, y: 405 }]);
  } else {
    // Follow the authored land route instead of hugging the water lip. The
    // latter is intentionally collidable, so a straight legacy movement can
    // stop the enlarged level-1 character before reaching the crystal.
    await moveToPoints(cdp, [{ x: 176, y: 270 }, { x: 240, y: 270 }, { x: 240, y: 405 }, { x: 210, y: 405 }]);
  }
  await debugPlayer(cdp, 'before-crystal');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_CRYSTAL_SCREENSHOT);
  await key(cdp, 'e');
  const crystalSave = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!crystalSave?.collectedObjects?.['level-01']?.includes('memory-crystal') || crystalSave.xp?.total < 10) throw new Error('Le cristal ou son XP n’est pas persisté après une interaction réelle.');

  // The terminal is contextual: a shortcut outside a Git shrine must not
  // bypass the authored world interaction. First prove it stays closed, then
  // walk around the shrine pillar to the terminal zone.
  await key(cdp, 't');
  await new Promise((resolve) => setTimeout(resolve, 180));
  if (await cdp.evaluate('document.documentElement.dataset.gitquestQaState ?? ""') === 'terminal') {
    throw new Error('Le terminal s’est ouvert hors de sa zone de sanctuaire.');
  }
  await moveToPoints(cdp, terminalWaypointsByLevel['level-01']);
  await key(cdp, 't');
  await waitForState(cdp, 'terminal');
  await new Promise((resolve) => setTimeout(resolve, 150));
  if (process.env.GITQUEST_QA_TERMINAL_SCREENSHOT) {
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.GITQUEST_QA_TERMINAL_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
  }
  await cdp.send('Input.insertText', { text: 'git init' });
  await key(cdp, 'Enter');
  await waitForQuestStep(cdp, 'collect-key');
  const save = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!save || save.version !== 1 || save.levelId !== 'level-01' || !save.git?.initialized) throw new Error('La sauvegarde ou git init n’est pas confirmé par le navigateur.');
  await key(cdp, 'Escape');
  await waitForState(cdp, 'world');
  // Use the authored lower corridor around the shrine and the southern ruin.
  // This keeps the browser check aligned with the reference composition and
  // avoids relying on long wall-clock movement timings.
  await moveToPoints(cdp, [{ x: 700, y: 700 }, { x: 620, y: 700 }, { x: 620, y: 430 }, { x: 480, y: 430 }, { x: 480, y: 540 }]);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_CHEST_CLOSED_SCREENSHOT);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (await cdp.evaluate('document.documentElement.dataset.gitquestQuestStep === "open-exit"')) break;
    await key(cdp, 'e');
    await key(cdp, 'Enter');
    await new Promise((resolve) => setTimeout(resolve, 180));
  }
  await waitForQuestStep(cdp, 'open-exit');
  const keySave = await cdp.evaluate('JSON.parse(localStorage.getItem("gitquest-save") ?? "null")');
  if (!keySave?.inventory?.items?.includes('pass-key') || keySave.xp?.total < 60) throw new Error('Le coffre, la clé ou l’XP du niveau 1 n’est pas confirmé.');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_CHEST_OPEN_SCREENSHOT);
  // From the lower-left chest, use the clear southern corridor and then
  // approach the archive gate from below. The shrine/ruin collision remains
  // part of the authored map; this route simply respects it.
  await moveToPoints(cdp, [{ x: 320, y: 540 }, { x: 300, y: 740 }, { x: 650, y: 740 }, { x: 650, y: 360 }, { x: 900, y: 360 }, { x: 900, y: 270 }]);
  await waitForGateState(cdp, 'open');
  await captureScreenshot(cdp, process.env.GITQUEST_QA_GATE_ACCESSIBLE_SCREENSHOT);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_GATE_OPEN_SCREENSHOT);
  await captureScreenshot(cdp, process.env.GITQUEST_QA_COMPLETE_SCREENSHOT);
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
