import Phaser from 'phaser';
import type { I18nManager } from '../../managers/I18nManager';
import type { MiniMapData, ObjectiveTarget } from '../../models/game';
import { ResponsivePanel } from './ResponsivePanel';
import { UITheme } from '../theme/UITheme';
import { minimapGroundColor, minimapPoint } from './MiniMapMath';

/** Lightweight map overview rendered from the active Tiled ground data. */
export class MiniMap extends ResponsivePanel {
  private readonly title: Phaser.GameObjects.Text;
  private readonly mapGraphics: Phaser.GameObjects.Graphics;
  private readonly legend: Phaser.GameObjects.Text;
  private readonly mapWidth = 160;
  private readonly mapHeight = 78;

  public constructor(scene: Phaser.Scene) {
    super(scene, 182, 122, { fillColor: UITheme.colors.panel, fillAlpha: 0.93, borderWidth: 1 });
    this.title = scene.add.text(10, 7, '', { fontFamily: UITheme.fontFamily, fontSize: '9px', color: UITheme.colors.textMuted });
    this.mapGraphics = scene.add.graphics();
    this.legend = scene.add.text(10, 103, '', { fontFamily: UITheme.fontFamily, fontSize: '8px', color: UITheme.colors.textMuted });
    this.add([this.title, this.mapGraphics, this.legend]);
  }

  public updateMap(data: MiniMapData | undefined, target: ObjectiveTarget | undefined, i18n: I18nManager): this {
    this.title.setText(i18n.text('minimap'));
    this.legend.setText(i18n.text('minimapLegend'));
    this.mapGraphics.clear();
    if (!data || data.width <= 0 || data.height <= 0) return this;

    const cellWidth = this.mapWidth / data.width;
    const cellHeight = this.mapHeight / data.height;
    for (let row = 0; row < data.height; row += 1) {
      for (let column = 0; column < data.width; column += 1) {
        const gid = data.ground[row * data.width + column] ?? 0;
        this.mapGraphics.fillStyle(minimapGroundColor(gid), 1);
        this.mapGraphics.fillRect(10 + column * cellWidth, 22 + row * cellHeight, Math.ceil(cellWidth), Math.ceil(cellHeight));
      }
    }
    this.mapGraphics.lineStyle(1, UITheme.colors.borderAccent, 0.8);
    this.mapGraphics.strokeRect(10, 22, this.mapWidth, this.mapHeight);

    const marker = (point: { x: number; y: number }, color: number, radius = 3): void => {
      const position = minimapPoint(point, data.width, data.height, data.tileWidth, data.tileHeight, this.mapWidth, this.mapHeight);
      this.mapGraphics.fillStyle(color, 1);
      this.mapGraphics.fillCircle(10 + position.x, 22 + position.y, radius);
    };
    marker(data.mentor, 0xf7d56a, 3);
    marker(data.gate, 0xd96565, 3);
    data.objects.forEach((object) => marker(object.point, object.kind === 'crystal' ? 0x9ef0c1 : object.kind === 'scroll' ? 0xb9f6ff : 0xffc857, 2));
    marker(data.player, 0xffffff, 3);
    if (target) {
      const position = minimapPoint(target.point, data.width, data.height, data.tileWidth, data.tileHeight, this.mapWidth, this.mapHeight);
      this.mapGraphics.lineStyle(1, UITheme.colors.goldSoft, 1);
      this.mapGraphics.strokeCircle(10 + position.x, 22 + position.y, 5);
    }
    return this;
  }
}
