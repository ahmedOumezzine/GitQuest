import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioManager } from '../src/audio/AudioManager';

test('les effets audio restent sûrs lorsque Web Audio est indisponible', () => {
  const audio = new AudioManager();
  assert.doesNotThrow(() => {
    audio.play('touch');
    audio.play('interaction');
    audio.play('dialogue');
    audio.play('terminal-open');
    audio.play('terminal-close');
    audio.play('reward');
    audio.play('gate-open');
    audio.play('locked');
  });
});
