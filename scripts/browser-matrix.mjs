import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const smoke = join(process.cwd(), 'scripts', 'browser-smoke.mjs');
const viewports = [
  [1920, 1080],
  [1366, 768],
  [1280, 720],
  [844, 390],
  [390, 844],
  [768, 1024],
  [1024, 768],
];
const basePort = Number(process.env.GITQUEST_QA_MATRIX_PORT ?? 5300);
const baseCdpPort = Number(process.env.GITQUEST_CDP_MATRIX_PORT ?? 9400);

function runSmoke(width, height, index, extra = {}) {
  const environment = { ...process.env, ...extra };
  delete environment.GITQUEST_QA_LEVEL;
  delete environment.GITQUEST_QA_SCENE;
  delete environment.GITQUEST_QA_SCREENSHOT;
  delete environment.GITQUEST_QA_DEBUG;
  if (extra.GITQUEST_QA_TOUCH !== '1') delete environment.GITQUEST_QA_TOUCH;
  environment.GITQUEST_QA_WIDTH = String(width);
  environment.GITQUEST_QA_HEIGHT = String(height);
  environment.GITQUEST_QA_PORT = String(basePort + index);
  environment.GITQUEST_CDP_PORT = String(baseCdpPort + index);
  const result = spawnSync(process.execPath, [smoke], { cwd: process.cwd(), env: environment, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Smoke test ${width}x${height} terminé avec ${result.status ?? result.signal}.`);
}

for (const [index, [width, height]] of viewports.entries()) {
  console.log(`QA matrice ${width}x${height}`);
  await runSmoke(width, height, index);
}

console.log('QA tactile portrait');
await runSmoke(390, 844, viewports.length, { GITQUEST_QA_LEVEL: 'level-02', GITQUEST_QA_TOUCH: '1' });
console.log('QA matrice PASS: sept viewports et émulation tactile portrait.');
