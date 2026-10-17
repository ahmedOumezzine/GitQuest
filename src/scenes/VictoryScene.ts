import Phaser from 'phaser';
import type { GameSession } from '../core/GameSession';
import { I18nManager } from '../managers/I18nManager';

export class VictoryScene extends Phaser.Scene {
  public constructor() { super('VictoryScene'); }

  public create(): void {
    const session = this.registry.get('session') as GameSession;
    const i18n = new I18nManager(session.locale);
    i18n.applyDirection(this.game.canvas);
    this.cameras.main.setBackgroundColor('#241b3d');
    this.add.text(480, 120, i18n.text('victoryTitle'), { fontFamily: 'monospace', fontSize: '48px', color: '#f7d56a', stroke: '#10172b', strokeThickness: 7, align: 'center' }).setOrigin(0.5);
    this.add.image(480, 245, 'player').setScale(4);
    this.add.text(480, 350, i18n.text('victoryMessage'), { fontFamily: 'monospace', fontSize: '20px', color: '#fff6df', align: 'center' }).setOrigin(0.5);
    this.add.text(480, 385, i18n.text('totalXp') + ' : ' + session.xp.value, { fontFamily: 'monospace', fontSize: '16px', color: '#9ef0c1', align: 'center' }).setOrigin(0.5);
    const again = this.add.text(480, 455, i18n.text('replay'), { fontFamily: 'monospace', fontSize: '20px', color: '#18233e', backgroundColor: '#f7d56a', padding: { x: 24, y: 10 }, align: 'center' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    again.on('pointerdown', () => { session.reset(); session.save(); this.scene.start('WorldScene', { levelId: 'level-01' }); this.scene.launch('UIScene'); });
  }
}
