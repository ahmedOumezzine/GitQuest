import Phaser from 'phaser';
import type { GameSession } from '../core/GameSession';

export class VictoryScene extends Phaser.Scene {
  public constructor() { super('VictoryScene'); }

  public create(): void {
    const session = this.registry.get('session') as GameSession;
    this.cameras.main.setBackgroundColor('#241b3d');
    this.add.text(480, 120, 'VICTOIRE !', { fontFamily: 'monospace', fontSize: '48px', color: '#f7d56a', stroke: '#10172b', strokeThickness: 7 }).setOrigin(0.5);
    this.add.image(480, 245, 'player').setScale(4);
    this.add.text(480, 350, 'L’île des commits est restaurée.', { fontFamily: 'monospace', fontSize: '20px', color: '#fff6df' }).setOrigin(0.5);
    this.add.text(480, 385, 'XP totale : ' + session.xp.value, { fontFamily: 'monospace', fontSize: '16px', color: '#9ef0c1' }).setOrigin(0.5);
    const again = this.add.text(480, 455, 'Rejouer', { fontFamily: 'monospace', fontSize: '20px', color: '#18233e', backgroundColor: '#f7d56a', padding: { x: 24, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    again.on('pointerdown', () => { session.reset(); session.save(); this.scene.start('WorldScene', { levelId: 'level-01' }); this.scene.launch('UIScene'); });
  }
}
