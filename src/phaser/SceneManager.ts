import type Phaser from 'phaser';

export class SceneManager {
  public constructor(private readonly scene: Phaser.Scene) {}
  public goToLevel(levelId: string): void {
    this.scene.cameras.main.fadeOut(250, 0, 0, 0);
    this.scene.time.delayedCall(250, () => this.scene.scene.start('WorldScene', { levelId }));
  }

  public showVictory(): void {
    this.scene.cameras.main.fadeOut(350, 0, 0, 0);
    this.scene.time.delayedCall(350, () => { this.scene.scene.stop('UIScene'); this.scene.scene.start('VictoryScene'); });
  }
}
