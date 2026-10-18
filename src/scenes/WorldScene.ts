import Phaser from 'phaser';
import type { LevelDefinition, MiniMapData, ObjectiveTarget, Point, TiledMapData } from '../models/game';
import { EventBus } from '../core/EventBus';
import type { GameSession } from '../core/GameSession';
import { I18nManager } from '../managers/I18nManager';
import { LevelManager, resolveTiledObjectPoint } from '../managers/LevelManager';
import { SceneManager } from '../phaser/SceneManager';
import { InputManager } from '../phaser/InputManager';
import { RuntimeMetrics } from '../diagnostics/RuntimeMetrics';
import { getLegacyWorldStyle } from '../world/LegacyWorldStyle';
import { markQaLevel, markQaPlayerPosition, markQaState } from '../diagnostics/QaMarker';
import { assetsForLevel } from '../data/AssetManifest';
import { enqueueAssets } from '../phaser/AssetLoader';

export class WorldScene extends Phaser.Scene {
  private session!: GameSession;
  private level!: LevelDefinition;
  private map!: TiledMapData;
  private quest!: ReturnType<GameSession['createQuest']>;
  private player!: Phaser.Physics.Arcade.Sprite;
  private mentor!: Phaser.GameObjects.Sprite;
  private gate!: Phaser.Physics.Arcade.Image;
  private objects: Array<Phaser.Physics.Arcade.Image & { objectId?: string; objectKind?: string }> = [];
  private interactionHint!: Phaser.GameObjects.Text;
  private decorations: Phaser.GameObjects.Image[] = [];
  private facing = 'down';
  private inputManager!: InputManager;
  private sceneManager!: SceneManager;
  private terminalOpen = false;
  private touchVector: Point = { x: 0, y: 0 };
  private nearby: Phaser.GameObjects.GameObject | null = null;
  private playerShadow?: Phaser.GameObjects.Ellipse;
  private mentorShadow?: Phaser.GameObjects.Ellipse;
  private mentorLabel?: Phaser.GameObjects.Text;
  private gateLabel?: Phaser.GameObjects.Text;
  private gateGlow?: Phaser.GameObjects.Image;
  private gateGlowTween?: Phaser.Tweens.Tween;
  private interactionHintPulse?: Phaser.Tweens.Tween;
  private gateUnlocked = true;
  private shrineLabels: Phaser.GameObjects.Text[] = [];
  private worldTitle?: Phaser.GameObjects.Text;
  private runtimeMetrics?: RuntimeMetrics;
  private publishedRuntimeSample = 0;
  private loadError: string | null = null;

  public constructor() { super('WorldScene'); }

  public init(data: { levelId?: string }): void {
    const session = this.registry.get('session') as GameSession;
    this.session = session;
    this.level = (this.registry.get('levels') as LevelDefinition[]).find((item) => item.id === (data.levelId ?? session.levelId))!;
  }

  public preload(): void {
    this.loadError = null;
    const assets = assetsForLevel(this.level.id);
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      this.loadError = new I18nManager(this.session.locale).text('assetMissing') + ' : ' + file.key + ' (' + file.url + ')';
    });
    enqueueAssets(this, assets.images, assets.spriteSheets);
  }

  public create(): void {
    if (this.loadError) {
      this.showLoadError(new Error(this.loadError));
      return;
    }
    this.createWorldAnimations();
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('perf')) {
      this.runtimeMetrics = new RuntimeMetrics();
      window.__gitquestRuntimeMetrics = this.runtimeMetrics;
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        if (window.__gitquestRuntimeMetrics === this.runtimeMetrics) delete window.__gitquestRuntimeMetrics;
        delete document.documentElement.dataset.gitquestFps;
        delete document.documentElement.dataset.gitquestFrameTimeMs;
        delete document.documentElement.dataset.gitquestSampleFrames;
        delete document.documentElement.dataset.gitquestSampleDurationMs;
      });
    }
    void this.buildWorld().catch((error: unknown) => this.showLoadError(error));
  }

  private createWorldAnimations(): void {
    const create = (key: string, texture: string, start: number, end: number, frameRate: number, repeat: number): void => {
      if (!this.anims.exists(key)) this.anims.create({ key, frames: this.anims.generateFrameNumbers(texture, { start, end }), frameRate, repeat });
    };
    create('player-walk', 'player-sheet', 0, 2, 7, -1);
    create('midou-idle', 'midou-sheet', 0, 2, 3, -1);
    const directions = { down: 0, left: 3, up: 6, right: 9 };
    Object.entries(directions).forEach(([direction, start]) => {
      create('level-01-player-walk-' + direction, 'level-01-player-sheet-v1', start, start + 2, 8, -1);
      create('level-01-midou-idle-' + direction, 'level-01-midou-sheet-v1', start, start + 2, 3, -1);
    });
  }

  private async buildWorld(): Promise<void> {
    const levelManager = this.registry.get('levelManager') as LevelManager;
    this.map = await levelManager.loadMap(this.level);
    this.quest = this.session.createQuest(this.level);
    this.drawWorld();
    this.createEntities();
    this.cameras.main.fadeIn(350, 0, 0, 0);
    this.sceneManager = new SceneManager(this);
    markQaState('world');
    markQaLevel(this.level.id);
    this.inputManager = new InputManager(this, () => { if (!this.terminalOpen) this.interact(); }, () => { if (!this.terminalOpen) EventBus.emit('terminal-open'); });
    this.input.on('pointerdown', () => undefined);
    this.events.on('touch-move', (vector: Point) => { this.touchVector = vector; });
    this.events.on('touch-interact', () => { if (!this.terminalOpen) this.interact(); });
    EventBus.on('terminal-open', this.openTerminal, this);
    EventBus.on('terminal-close', this.closeTerminal, this);
    EventBus.on('locale-changed', this.refreshLocalizedScene, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off('terminal-open', this.openTerminal, this);
      EventBus.off('terminal-close', this.closeTerminal, this);
      EventBus.off('locale-changed', this.refreshLocalizedScene, this);
    });
    EventBus.emit('level-ready', { level: this.level, quest: this.quest });
  }

  private showLoadError(error: unknown): void {
    const i18n = new I18nManager(this.session.locale);
    const width = this.scale.width;
    const height = this.scale.height;
    const margin = 24;
    this.add.rectangle(width / 2, height / 2, Math.min(720, width - margin * 2), 240, 0x10172b, 0.98).setDepth(80).setStrokeStyle(3, 0xd96565);
    this.add.text(width / 2, height / 2 - 65, i18n.text('mapLoadError'), { fontFamily: 'monospace', fontSize: '24px', color: '#ff9b9b' }).setOrigin(0.5).setDepth(81);
    this.add.text(width / 2, height / 2 + 5, error instanceof Error ? error.message : String(error), { fontFamily: 'monospace', fontSize: '15px', color: '#fff6df', align: 'center', wordWrap: { width: Math.min(620, width - margin * 2) } }).setOrigin(0.5).setDepth(81);
    const retry = this.add.text(width / 2, height / 2 + 70, i18n.text('retry'), { fontFamily: 'monospace', fontSize: '20px', color: '#18233e', backgroundColor: '#f7d56a', padding: { x: 20, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(81);
    retry.on('pointerdown', () => this.scene.restart({ levelId: this.level.id }));
  }

  public get activeQuest() { return this.quest; }
  public setTouchVector(vector: Point): void { this.touchVector = vector; }

  /** Navigation data for the HUD compass. Quest state remains authoritative. */
  public getObjectiveNavigation(): { player: Point; target?: ObjectiveTarget } | undefined {
    if (!this.player || !this.quest || !this.map) return undefined;
    const step = this.quest.currentStep;
    if (!step) return { player: { x: this.player.x, y: this.player.y } };
    if (step.kind === 'dialogue') {
      return { player: { x: this.player.x, y: this.player.y }, target: { point: { x: this.mentor.x, y: this.mentor.y }, kind: 'mentor' } };
    }
    if (step.kind === 'git-command') {
      const shrine = this.map.decorations.find((item) => /shrine|altar|sanctuary/i.test(item.type + ' ' + item.name));
      return {
        player: { x: this.player.x, y: this.player.y },
        target: shrine ? { point: { x: shrine.x, y: shrine.y }, kind: 'shrine' } : undefined,
      };
    }
    if (step.kind === 'collect') {
      const object = this.objects.find((item) => item.active && item.objectId === step.objectId);
      return {
        player: { x: this.player.x, y: this.player.y },
        target: object ? { point: { x: object.x, y: object.y }, kind: 'object' } : undefined,
      };
    }
    return { player: { x: this.player.x, y: this.player.y }, target: { point: { x: this.gate.x, y: this.gate.y }, kind: 'gate' } };
  }

  public getMiniMapData(): MiniMapData | undefined {
    if (!this.player || !this.map || !this.mentor || !this.gate) return undefined;
    return {
      width: this.map.width,
      height: this.map.height,
      tileWidth: this.map.tileWidth,
      tileHeight: this.map.tileHeight,
      ground: this.map.ground,
      player: { x: this.player.x, y: this.player.y },
      mentor: { x: this.mentor.x, y: this.mentor.y },
      gate: { x: this.gate.x, y: this.gate.y },
      objects: this.objects.filter((object) => object.active).map((object) => ({ point: { x: object.x, y: object.y }, kind: (object.objectKind ?? 'chest') as 'crystal' | 'chest' | 'scroll' })),
    };
  }

  private drawWorld(): void {
    if (this.level.id === 'level-01' && this.map.ground.length === this.map.width * this.map.height) {
      this.drawBeachWorld();
      return;
    }
    const style = getLegacyWorldStyle(this.level.id);
    if (style.tilemapKey && this.map.ground.length === this.map.width * this.map.height) {
      this.drawForestWorld(style);
      return;
    }
    this.drawLegacyWorld();
  }

  private drawForestWorld(style: ReturnType<typeof getLegacyWorldStyle>): void {
    const worldWidth = this.map.width * this.map.tileWidth;
    const worldHeight = this.map.height * this.map.tileHeight;
    const isCave = style.decorationProfile === 'cave';
    const isHarbor = style.decorationProfile === 'harbor';
    const isMountain = style.decorationProfile === 'mountain';
    const isCastle = style.decorationProfile === 'castle';
    this.cameras.main.setBackgroundColor(this.level.theme.sky).setBounds(0, 0, worldWidth, worldHeight).setRoundPixels(true);
    // The authored regional illustration supplies the large-scale composition
    // (paths, clearings and canopy). The Tiled Ground layer remains the
    // playable source of truth, but is intentionally used as a restrained
    // texture pass so individual atlas cells do not read as a checkerboard.
    this.add.image(worldWidth / 2, worldHeight / 2, style.backgroundKey)
      .setDisplaySize(worldWidth, worldHeight)
      .setAlpha(1)
      .setDepth(-2);
    const rows: number[][] = [];
    for (let row = 0; row < this.map.height; row += 1) {
      rows.push(this.map.ground.slice(row * this.map.width, (row + 1) * this.map.width).map((gid) => gid > 0 ? gid - 1 : -1));
    }
    const tilemap = this.make.tilemap({ data: rows, tileWidth: this.map.tileWidth, tileHeight: this.map.tileHeight });
    const tilesetName = isCave ? 'cave-tileset-v1' : isHarbor ? 'harbor-tileset-v1' : isMountain ? 'mountain-tileset-v1' : isCastle ? 'castle-tileset-v1' : 'forest-tileset-v1';
    const tileset = tilemap.addTilesetImage(tilesetName, style.tilemapKey, this.map.tileWidth, this.map.tileHeight, 0, 0);
    if (tileset) tilemap.createLayer(0, tileset, 0, 0)?.setAlpha(style.groundOverlayAlpha ?? (isCastle ? 0.08 : isCave || isHarbor || isMountain ? 0.18 : 0.14)).setDepth(0).setCullPadding(2, 2);
    this.map.decorations.forEach((definition) => isCave
      ? this.addCaveDecoration(definition.type, definition.x, definition.y)
      : isHarbor ? this.addHarborDecoration(definition.type, definition.x, definition.y)
      : isMountain ? this.addMountainDecoration(definition.type, definition.x, definition.y)
      : isCastle ? this.addCastleDecoration(definition.type, definition.x, definition.y)
      : this.addForestDecoration(definition.type, definition.x, definition.y));
    const resizeCamera = isCave ? this.applyCaveCameraZoom : isHarbor ? this.applyHarborCameraZoom : isMountain ? this.applyMountainCameraZoom : isCastle ? this.applyCastleCameraZoom : this.applyForestCameraZoom;
    resizeCamera.call(this);
    this.scale.on('resize', resizeCamera, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', resizeCamera, this));
  }

  private addCaveDecoration(type: string, x: number, y: number): void {
    const config: Record<string, { key: string; width: number; height: number; depth: number; alpha?: number }> = {
      decoration: { key: 'cave-vines', width: 180, height: 120, depth: 1, alpha: 0.3 },
      'cave-stalactites': { key: 'cave-stalactite', width: 150, height: 126, depth: 2 },
      'cave-crystal': { key: 'cave-crystal-pink', width: 82, height: 82, depth: 3 },
      'cave-torch': { key: 'cave-torch', width: 78, height: 100, depth: 3 },
      'cave-tablet': { key: 'cave-memory-tablet', width: 118, height: 132, depth: 3 },
      'cave-altar': { key: 'cave-commit-altar', width: 152, height: 138, depth: 3 },
      'cave-vines': { key: 'cave-vines', width: 150, height: 126, depth: 1, alpha: 0.8 },
    };
    const selected = config[type];
    if (!selected) return;
    const sprite = this.add.image(x, y, selected.key).setOrigin(0, 0).setDisplaySize(selected.width, selected.height).setDepth(selected.depth).setAlpha(selected.alpha ?? 1);
    this.decorations.push(sprite);
    if (type === 'cave-crystal' || type === 'cave-torch' || type === 'cave-altar') {
      this.tweens.add({ targets: sprite, alpha: { from: selected.alpha ?? 1, to: (selected.alpha ?? 1) * 0.78 }, duration: type === 'cave-torch' ? 900 : 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    if (type === 'cave-altar') {
      const label = this.add.text(x + selected.width / 2, y - 5, new I18nManager(this.session.locale).text('shrine'), { fontFamily: 'monospace', fontSize: '13px', color: '#e9b8ff', stroke: '#17132d', strokeThickness: 4 }).setOrigin(0.5, 1).setDepth(5);
      this.shrineLabels.push(label);
    }
  }

  private addHarborDecoration(type: string, x: number, y: number): void {
    const config: Record<string, { key: string; width: number; height: number; depth: number; alpha?: number }> = {
      decoration: { key: 'harbor-wave-foam', width: 220, height: 90, depth: 1, alpha: 0.32 },
      'harbor-docks': { key: 'harbor-dock-post', width: 170, height: 142, depth: 2 },
      'harbor-lantern': { key: 'harbor-lantern', width: 74, height: 104, depth: 3 },
      'harbor-boat': { key: 'harbor-boat', width: 180, height: 126, depth: 2 },
      'harbor-crates': { key: 'harbor-crate', width: 126, height: 112, depth: 3 },
      'harbor-barrel': { key: 'harbor-barrel', width: 92, height: 104, depth: 3 },
      'harbor-pylons': { key: 'harbor-local-pylon', width: 118, height: 134, depth: 3 },
      'harbor-altar': { key: 'harbor-connection-altar', width: 162, height: 148, depth: 3 },
      'harbor-buoy': { key: 'harbor-buoy', width: 78, height: 78, depth: 2 },
      'harbor-rocks': { key: 'harbor-rocks', width: 148, height: 98, depth: 2 },
      'harbor-shells': { key: 'harbor-shells', width: 108, height: 74, depth: 2 },
      'harbor-lighthouse': { key: 'harbor-lighthouse', width: 164, height: 176, depth: 2 },
    };
    const selected = config[type];
    if (!selected) return;
    const sprite = this.add.image(x, y, selected.key).setOrigin(0, 0).setDisplaySize(selected.width, selected.height).setDepth(selected.depth).setAlpha(selected.alpha ?? 1);
    this.decorations.push(sprite);
    if (type === 'decoration' || type === 'harbor-buoy' || type === 'harbor-lantern') {
      this.tweens.add({ targets: sprite, y: y + 2, alpha: { from: selected.alpha ?? 1, to: (selected.alpha ?? 1) * 0.78 }, duration: type === 'harbor-lantern' ? 1000 : 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    if (type === 'harbor-altar') {
      const label = this.add.text(x + selected.width / 2, y - 5, new I18nManager(this.session.locale).text('shrine'), { fontFamily: 'monospace', fontSize: '13px', color: '#ffe6a5', stroke: '#102b43', strokeThickness: 4 }).setOrigin(0.5, 1).setDepth(5);
      this.shrineLabels.push(label);
    }
  }

  private addMountainDecoration(type: string, x: number, y: number): void {
    const config: Record<string, { key: string; width: number; height: number; depth: number; alpha?: number }> = {
      decoration: { key: 'mountain-wind-flag', width: 176, height: 118, depth: 1, alpha: 0.32 },
      'mountain-rocks': { key: 'mountain-cliff-rock', width: 176, height: 132, depth: 2 },
      'mountain-pines': { key: 'mountain-pine', width: 154, height: 174, depth: 2 },
      'mountain-pine': { key: 'mountain-pine', width: 148, height: 166, depth: 2 },
      'mountain-snow-pine': { key: 'mountain-snow-pine', width: 154, height: 174, depth: 2 },
      'mountain-cairn': { key: 'mountain-cairn', width: 88, height: 102, depth: 3 },
      'mountain-bridge': { key: 'mountain-bridge', width: 196, height: 122, depth: 3 },
      'mountain-fork': { key: 'mountain-fork-sign', width: 126, height: 132, depth: 3 },
      'mountain-altar': { key: 'mountain-branch-altar', width: 156, height: 146, depth: 3 },
      'mountain-marker': { key: 'mountain-branch-marker', width: 92, height: 116, depth: 3 },
      'mountain-rail': { key: 'mountain-rope-rail', width: 180, height: 110, depth: 2 },
      'mountain-snow': { key: 'mountain-snow-patch', width: 150, height: 82, depth: 2 },
      'mountain-flowers': { key: 'mountain-wildflowers', width: 112, height: 82, depth: 2 },
      'mountain-flag': { key: 'mountain-wind-flag', width: 108, height: 132, depth: 3 },
      'mountain-wind': { key: 'mountain-wind-flag', width: 108, height: 132, depth: 3 },
    };
    const selected = config[type];
    if (!selected) return;
    const sprite = this.add.image(x, y, selected.key).setOrigin(0, 0).setDisplaySize(selected.width, selected.height).setDepth(selected.depth).setAlpha(selected.alpha ?? 1);
    this.decorations.push(sprite);
    if (type === 'decoration' || type === 'mountain-flag' || type === 'mountain-wind') {
      this.tweens.add({ targets: sprite, x: x + 2, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    if (type === 'mountain-altar') {
      const label = this.add.text(x + selected.width / 2, y - 5, new I18nManager(this.session.locale).text('shrine'), { fontFamily: 'monospace', fontSize: '13px', color: '#dff5ff', stroke: '#202a42', strokeThickness: 4 }).setOrigin(0.5, 1).setDepth(5);
      this.shrineLabels.push(label);
    }
  }

  private addCastleDecoration(type: string, x: number, y: number): void {
    const config: Record<string, { key: string; width: number; height: number; depth: number; alpha?: number }> = {
      decoration: { key: 'castle-thorn-vine', width: 190, height: 130, depth: 1, alpha: 0.34 },
      'castle-banners': { key: 'castle-banner', width: 108, height: 142, depth: 2 },
      'castle-arch': { key: 'castle-arch', width: 164, height: 156, depth: 2 },
      'castle-brazier': { key: 'castle-brazier', width: 92, height: 112, depth: 3 },
      'castle-rune': { key: 'castle-rune-tablet', width: 116, height: 130, depth: 3 },
      'castle-altar': { key: 'castle-merge-altar', width: 166, height: 154, depth: 3 },
      'castle-sigil': { key: 'castle-merge-sigil', width: 154, height: 118, depth: 2, alpha: 0.72 },
      'castle-gargoyle': { key: 'castle-gargoyle', width: 112, height: 130, depth: 3 },
      'castle-vines': { key: 'castle-thorn-vine', width: 156, height: 112, depth: 1 },
      'castle-cart': { key: 'castle-cart', width: 138, height: 112, depth: 3 },
      'castle-sign': { key: 'castle-signpost', width: 112, height: 122, depth: 3 },
      'castle-rail': { key: 'castle-rail', width: 184, height: 104, depth: 2 },
      'castle-rubble': { key: 'castle-rubble', width: 116, height: 92, depth: 2 },
    };
    const selected = config[type];
    if (!selected) return;
    const sprite = this.add.image(x, y, selected.key).setOrigin(0, 0).setDisplaySize(selected.width, selected.height).setDepth(selected.depth).setAlpha(selected.alpha ?? 1);
    this.decorations.push(sprite);
    if (type === 'castle-brazier' || type === 'castle-sigil' || type === 'castle-altar') {
      this.tweens.add({ targets: sprite, alpha: { from: selected.alpha ?? 1, to: (selected.alpha ?? 1) * 0.76 }, duration: type === 'castle-brazier' ? 850 : 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    if (type === 'castle-altar') {
      const label = this.add.text(x + selected.width / 2, y - 5, new I18nManager(this.session.locale).text('shrine'), { fontFamily: 'monospace', fontSize: '13px', color: '#ffb5e8', stroke: '#251b37', strokeThickness: 4 }).setOrigin(0.5, 1).setDepth(5);
      this.shrineLabels.push(label);
    }
  }

  private addForestDecoration(type: string, x: number, y: number): void {
    const config: Record<string, { key: string; width: number; height: number; depth: number; alpha?: number }> = {
      decoration: { key: 'forest-canopy-shadow', width: 180, height: 120, depth: 1, alpha: 0.18 },
      'forest-trees': { key: 'forest-ancient-tree', width: 166, height: 174, depth: 2 },
      'forest-tree': { key: 'forest-ancient-tree', width: 176, height: 184, depth: 2 },
      'forest-root': { key: 'forest-root-cluster', width: 148, height: 126, depth: 2 },
      'forest-fern': { key: 'forest-fern-cluster', width: 126, height: 118, depth: 2 },
      'forest-flower': { key: 'forest-flower-bush', width: 126, height: 116, depth: 2 },
      'forest-mushroom': { key: 'forest-mushroom-patch', width: 132, height: 124, depth: 2 },
      'forest-rock': { key: 'forest-mossy-rock', width: 126, height: 116, depth: 2 },
      'forest-ruin': { key: 'forest-ruin-fragment', width: 138, height: 130, depth: 3 },
      'forest-crate': { key: 'forest-archive-crate', width: 110, height: 110, depth: 3 },
      'forest-shrine': { key: 'forest-staging-shrine', width: 132, height: 132, depth: 3 },
      'forest-canopy': { key: 'forest-canopy-shadow', width: 360, height: 220, depth: 1, alpha: 0.22 },
    };
    const selected = config[type];
    if (!selected) return;
    const sprite = this.add.image(x, y, selected.key).setOrigin(0, 0).setDisplaySize(selected.width, selected.height).setDepth(selected.depth).setAlpha(selected.alpha ?? 1);
    this.decorations.push(sprite);
    if (type === 'forest-canopy' || type === 'forest-fern' || type === 'forest-flower') {
      this.tweens.add({ targets: sprite, y: y + 2, duration: type === 'forest-canopy' ? 2600 : 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    if (type === 'forest-shrine') {
      const label = this.add.text(x + selected.width / 2, y - 5, new I18nManager(this.session.locale).text('shrine'), { fontFamily: 'monospace', fontSize: '13px', color: '#f4e29a', stroke: '#18233e', strokeThickness: 4 }).setOrigin(0.5, 1).setDepth(5);
      this.shrineLabels.push(label);
    }
  }

  private drawLegacyWorld(): void {
    const style = getLegacyWorldStyle(this.level.id);
    const worldWidth = this.map.width * this.map.tileWidth;
    const worldHeight = this.map.height * this.map.tileHeight;
    this.cameras.main.setBackgroundColor(this.level.theme.sky).setBounds(0, 0, worldWidth, worldHeight).setRoundPixels(true);
    this.add.image(worldWidth / 2, worldHeight / 2, style.backgroundKey)
      .setDisplaySize(worldWidth, worldHeight)
      .setDepth(-2);
    const graphics = this.add.graphics();
    // The raster layer supplies the detailed environment. These low-opacity
    // navigation bands keep the data-driven play route readable without
    // painting over the art or changing the collision model.
    graphics.fillStyle(Phaser.Display.Color.HexStringToColor(style.groundDark).color, 0.04).fillRect(0, 0, worldWidth, worldHeight);
    graphics.fillStyle(Phaser.Display.Color.HexStringToColor(style.path).color, 0.24);
    if (this.level.id === 'level-03' || this.level.id === 'level-06') graphics.fillRoundedRect(72, 245, worldWidth - 144, 62, 18);
    else graphics.fillRoundedRect(70, 240, 160, worldHeight - 300, 18).fillRoundedRect(worldWidth - 230, 240, 160, worldHeight - 300, 18);
    this.map.colliders.forEach((rect) => this.drawLegacyObstacle(rect, style.obstacle));
    this.addLegacyProps(style.propKeys, worldWidth, worldHeight);
    this.map.decorations.forEach((definition) => this.addLegacyDecoration(definition.type, definition.x, definition.y));
    this.worldTitle = this.add.text(28, 26, new I18nManager(this.session.locale).localized(this.level.title), { fontFamily: 'monospace', fontSize: '22px', color: '#fff6df', stroke: '#18233e', strokeThickness: 5 }).setDepth(10);
  }

  private drawLegacyObstacle(rect: { x: number; y: number; width: number; height: number }, kind: ReturnType<typeof getLegacyWorldStyle>['obstacle']): void {
    const texture: Record<ReturnType<typeof getLegacyWorldStyle>['obstacle'], string> = {
      hedge: 'grass', stone: 'rock', dock: 'ruin', cliff: 'rock', wall: 'ruin',
    };
    this.add.tileSprite(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width, rect.height, texture[kind])
      .setDepth(2)
      .setAlpha(0.95);
  }

  private addLegacyProps(propKeys: string[], worldWidth: number, worldHeight: number): void {
    const positions = [[72, 104], [140, 470], [246, 104], [365, 468], [515, 105], [650, 468], [770, 106], [880, 470], [70, 350], [880, 350]];
    positions.forEach(([x, y], index) => {
      const key = propKeys[index % propKeys.length];
      const sprite = this.add.image(Math.min(worldWidth - 32, x), Math.min(worldHeight - 32, y), key).setDisplaySize(32, 32).setDepth(2).setAlpha(0.9);
      if (key === 'grass' || key === 'flower' || key === 'palm') this.tweens.add({ targets: sprite, y: sprite.y + 2, duration: 1200 + index * 40, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  }

  private addLegacyDecoration(type: string, x: number, y: number): void {
    const mapping: Record<string, string> = { 'forest-trees': 'palm', 'cave-stalactites': 'rock', 'harbor-docks': 'ruin', 'mountain-rocks': 'rock', 'castle-banners': 'shrine' };
    const key = mapping[type];
    if (!key) return;
    this.add.image(x, y, key).setOrigin(0, 0).setDisplaySize(64, 64).setDepth(3);
  }

  private drawBeachWorld(): void {
    const worldWidth = this.map.width * this.map.tileWidth;
    const worldHeight = this.map.height * this.map.tileHeight;
    this.cameras.main.setBackgroundColor('#206b82').setBounds(0, 0, worldWidth, worldHeight).setRoundPixels(true);
    const rows: number[][] = [];
    // Tiled stores global ids with firstgid=1, while Phaser's raw `data`
    // constructor expects zero-based atlas indexes. Keep the adapter's
    // 1-based ids for gameplay/collisions and convert only this render copy.
    for (let row = 0; row < this.map.height; row += 1) {
      rows.push(this.map.ground.slice(row * this.map.width, (row + 1) * this.map.width).map((gid) => gid > 0 ? gid - 1 : -1));
    }
    const tilemap = this.make.tilemap({ data: rows, tileWidth: this.map.tileWidth, tileHeight: this.map.tileHeight });
    const tileset = tilemap.addTilesetImage('beach-tileset', 'beach-tileset', this.map.tileWidth, this.map.tileHeight, 0, 0);
    if (tileset) tilemap.createLayer(0, tileset, 0, 0)?.setDepth(0).setCullPadding(2, 2);
    this.addBeachRouteArtPass();
    // A very light sun wash keeps the authored 32×32 terrain readable on
    // displays with strong contrast without hiding the Tiled ground layer.
    this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0xffe9b0, 0.08).setDepth(0.5);
    this.applyBeachCameraZoom();
    this.scale.on('resize', this.applyBeachCameraZoom, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', this.applyBeachCameraZoom, this));
    this.map.decorations.forEach((definition) => {
      const key = this.beachDecorationTexture(definition.type);
      if (!key) return;
      const isShrine = definition.type === 'shrine' || definition.type === 'shrine-rich';
      const sprite = this.add.image(definition.x, definition.y, key).setOrigin(0, 0).setDepth(definition.type === 'wave' || definition.type === 'shrine-glow' ? 1 : isShrine ? 4 : 2);
      const displaySize = this.beachDecorationSize(definition.type, definition.width, definition.height);
      if (displaySize) sprite.setDisplaySize(displaySize.width, displaySize.height);
      this.decorations.push(sprite);
      if (definition.type === 'wave' || definition.type === 'grass' || definition.type === 'palm' || definition.type === 'palm-rich' || definition.type === 'flower') {
        this.tweens.add({ targets: sprite, y: definition.y + 2, duration: definition.type === 'wave' ? 900 : 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }
      if (definition.type === 'shrine-glow') this.tweens.add({ targets: sprite, alpha: 0.45, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      if (isShrine) {
        const label = this.add.text(definition.x + (definition.width || 96) / 2, definition.y - 8, new I18nManager(this.session.locale).text('shrine'), { fontFamily: 'Courier New, monospace', fontSize: '12px', color: '#ffe08a', stroke: '#18233e', strokeThickness: 3 }).setOrigin(0.5, 1).setDepth(5);
        this.shrineLabels.push(label);
      }
    });
  }

  private applyBeachCameraZoom(): void {
    if (this.level?.id !== 'level-01') return;
    const portrait = this.scale.height > this.scale.width * 1.2;
    const compact = this.scale.width < 760 || this.scale.height < 500;
    // The reference keeps the player readable while showing enough shoreline
    // to establish a real beach. The previous 1.42 zoom hid route landmarks.
    // Show the full beach composition (shoreline, foreground props and exit)
    // instead of cropping it to a narrow playable rectangle. The characters
    // remain readable because their level-one sprites are intentionally large.
    this.cameras.main.setZoom(portrait ? 1.04 : compact ? 0.88 : 1.12);
  }

  /**
   * Adds a restrained texture pass over the Tiled Ground layer. It is purely
   * visual: water detection, collisions and progression still use the
   * original Tiled data. The route is derived from Tiled spawn and quest
   * objects so it remains valid when the map is rearranged in Tiled.
   */
  private addBeachRouteArtPass(): void {
    const rows = Array.from({ length: this.map.height }, () => Array<number>(this.map.width).fill(-1));
    const waterGid = 3;
    const pathTile = 8; // GID 9: authored path tile in the beach atlas.
    const foamTile = 5; // GID 6: sand/foam transition tile.
    const isLand = (x: number, y: number): boolean => {
      if (x < 0 || y < 0 || x >= this.map.width || y >= this.map.height) return false;
      return this.map.ground[y * this.map.width + x] !== waterGid;
    };
    const paintPath = (from: Point, to: Point): void => {
      const startX = from.x / this.map.tileWidth;
      const startY = from.y / this.map.tileHeight;
      const endX = to.x / this.map.tileWidth;
      const endY = to.y / this.map.tileHeight;
      const length = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
      for (let step = 0; step <= Math.ceil(length * 2); step += 1) {
        const t = length === 0 ? 0 : step / Math.ceil(length * 2);
        const centerX = Math.round(Phaser.Math.Linear(startX, endX, t));
        const centerY = Math.round(Phaser.Math.Linear(startY, endY, t));
        for (let offset = -1; offset <= 1; offset += 1) {
          const horizontal = Math.abs(endX - startX) >= Math.abs(endY - startY);
          const x = centerX + (horizontal ? 0 : offset);
          const y = centerY + (horizontal ? offset : 0);
          if (isLand(x, y)) rows[y][x] = pathTile;
        }
      }
    };

    const player = resolveTiledObjectPoint(this.map.objects, 'spawn', 'player-spawn', this.level.playerSpawn);
    const mentor = resolveTiledObjectPoint(this.map.objects, 'npc', 'midou', this.level.mentor);
    const crystal = this.level.objects.find((object) => object.kind === 'crystal');
    const chest = this.level.objects.find((object) => object.kind === 'chest');
    const gate = resolveTiledObjectPoint(this.map.objects, 'door', 'exit-gate', this.level.exit.position);
    const route = [
      player,
      mentor,
      ...(crystal ? [resolveTiledObjectPoint(this.map.objects, crystal.kind, crystal.id, crystal.position)] : []),
      ...(chest ? [resolveTiledObjectPoint(this.map.objects, chest.kind, chest.id, chest.position)] : []),
      gate,
    ];
    for (let index = 1; index < route.length; index += 1) paintPath(route[index - 1], route[index]);

    // Add foam only where land actually touches water. This creates an
    // irregular shoreline without changing the water collision geometry.
    for (let y = 0; y < this.map.height; y += 1) {
      for (let x = 0; x < this.map.width; x += 1) {
        if (!isLand(x, y) || rows[y][x] === pathTile) continue;
        const touchesWater = [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          return nx >= 0 && ny >= 0 && nx < this.map.width && ny < this.map.height && this.map.ground[ny * this.map.width + nx] === waterGid;
        });
        if (touchesWater) rows[y][x] = foamTile;
      }
    }

    const overlayMap = this.make.tilemap({ data: rows, tileWidth: this.map.tileWidth, tileHeight: this.map.tileHeight });
    const overlayTileset = overlayMap.addTilesetImage('beach-tileset', 'beach-tileset', this.map.tileWidth, this.map.tileHeight, 0, 0);
    // Keep the authored route readable without turning the beach into a set
    // of conspicuous horizontal bands.
    overlayTileset && overlayMap.createLayer(0, overlayTileset, 0, 0)?.setDepth(0.55).setAlpha(0.26).setCullPadding(2, 2);
  }

  private applyForestCameraZoom(): void {
    if (this.level?.id !== 'level-02') return;
    const portrait = this.scale.height > this.scale.width * 1.35;
    const compact = this.scale.width < 760 || this.scale.height < 500;
    this.cameras.main.setZoom(portrait ? 1.6 : compact ? 1.05 : 1.35);
  }

  private applyCaveCameraZoom(): void {
    if (this.level?.id !== 'level-03') return;
    const portrait = this.scale.height > this.scale.width * 1.35;
    const compact = this.scale.width < 760 || this.scale.height < 500;
    this.cameras.main.setZoom(portrait ? 1.6 : compact ? 1.08 : 1.34);
  }

  private applyHarborCameraZoom(): void {
    if (this.level?.id !== 'level-04') return;
    const portrait = this.scale.height > this.scale.width * 1.35;
    const compact = this.scale.width < 760 || this.scale.height < 500;
    this.cameras.main.setZoom(portrait ? 1.55 : compact ? 1.06 : 1.3);
  }

  private applyMountainCameraZoom(): void {
    if (this.level?.id !== 'level-05') return;
    const portrait = this.scale.height > this.scale.width * 1.35;
    const compact = this.scale.width < 760 || this.scale.height < 500;
    this.cameras.main.setZoom(portrait ? 1.55 : compact ? 1.06 : 1.3);
  }

  private applyCastleCameraZoom(): void {
    if (this.level?.id !== 'level-06') return;
    const portrait = this.scale.height > this.scale.width * 1.35;
    const compact = this.scale.width < 760 || this.scale.height < 500;
    this.cameras.main.setZoom(portrait ? 1.55 : compact ? 1.06 : 1.3);
  }

  private beachDecorationTexture(type: string): string | undefined {
    const textures: Record<string, string> = {
      palm: 'level-01-palm-v1',
      'palm-rich': 'level-01-palm-v1',
      rock: 'level-01-rock-garden-v1',
      'rock-rich': 'level-01-rock-garden-v1',
      ruin: 'level-01-ruin-garden-v1',
      'ruin-rich': 'level-01-ruin-garden-v1',
      shrine: 'level-01-shrine-v1',
      'shrine-rich': 'level-01-shrine-v1',
      grass: 'grass', flower: 'flower', shell: 'shell', wave: 'wave', 'shrine-glow': 'shrine-glow',
    };
    return textures[type];
  }

  private beachDecorationSize(type: string, width?: number, height?: number): { width: number; height: number } | undefined {
    const authored: Record<string, { width: number; height: number }> = {
      palm: { width: 132, height: 128 }, 'palm-rich': { width: 142, height: 136 },
      rock: { width: 104, height: 72 }, 'rock-rich': { width: 112, height: 78 },
      ruin: { width: 168, height: 132 }, 'ruin-rich': { width: 184, height: 142 },
      shrine: { width: 190, height: 174 }, 'shrine-rich': { width: 198, height: 182 },
    };
    return authored[type] ?? (width && height ? { width, height } : undefined);
  }

  private createEntities(): void {
    const isBeach = this.level.id === 'level-01';
    const style = getLegacyWorldStyle(this.level.id);
    const isEnhancedRegion = isBeach || style.decorationProfile === 'forest' || style.decorationProfile === 'cave' || style.decorationProfile === 'harbor' || style.decorationProfile === 'mountain' || style.decorationProfile === 'castle';
    const isCave = style.decorationProfile === 'cave';
    const isHarbor = style.decorationProfile === 'harbor';
    const isMountain = style.decorationProfile === 'mountain';
    const isCastle = style.decorationProfile === 'castle';
    const playerTexture = isEnhancedRegion ? 'level-01-player-sheet-v1' : 'player-sheet';
    const playerSize = isEnhancedRegion ? 82 : 32;
    const playerSpawn = this.resolveSafeSpawn(resolveTiledObjectPoint(this.map.objects, 'spawn', 'player-spawn', this.level.playerSpawn));
    const mentorSpawn = this.resolveSafeSpawn(resolveTiledObjectPoint(this.map.objects, 'npc', 'midou', this.level.mentor));
    this.player = this.physics.add.sprite(playerSpawn.x, playerSpawn.y, playerTexture, 0).setDisplaySize(playerSize, playerSize).setDepth(5);
    this.player.setCollideWorldBounds(true);
    if (isEnhancedRegion && this.player.body) {
      // The 96px art frame includes a generous transparent margin and a
      // shadow. Keep the Arcade body on the feet so collisions stay faithful
      // to the 32px Tiled grid instead of the illustration bounds.
      this.player.body.setSize(22, 18).setOffset(37, 70);
    }
    const worldWidth = this.map.width * this.map.tileWidth;
    const worldHeight = this.map.height * this.map.tileHeight;
    // The physics world must follow the Tiled map, not the responsive canvas.
    // Without this, compact viewports clipped legacy maps at y=390 and made
    // lower crystals/chests unreachable on mobile.
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    if (this.level.id === 'level-01' && this.scale.width >= this.scale.height && this.scale.width < 900) {
      // In compact landscape the spawn is close to the western shoreline.
      // A small eastward follow offset keeps the exit landmark in the same
      // composition as the reference without hiding the player or the water.
      this.cameras.main.setFollowOffset(110, 0);
    }
    if (this.level.id === 'level-02' && this.scale.width < 900 && this.scale.height < 500) {
      this.cameras.main.setFollowOffset(0, 78);
    }
    const obstacles = this.physics.add.staticGroup();
    this.map.colliders.forEach((rect) => {
      const block = this.add.zone(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width, rect.height);
      this.physics.add.existing(block, true);
      obstacles.add(block);
    });
    if (isBeach) this.addWaterCollisions(obstacles);
    this.physics.add.collider(this.player, obstacles);
    this.objects = this.level.objects.filter((object) => !this.session.hasCollected(this.level.id, object.id)).map((object) => {
      const position = resolveTiledObjectPoint(this.map.objects, object.kind, object.id, object.position);
      const texture = isCave
        ? object.kind === 'crystal' ? 'cave-crystal-cyan' : object.kind === 'chest' ? 'cave-archive-chest' : object.kind === 'scroll' ? 'cave-memory-tablet' : object.kind
        : isHarbor
          ? object.kind === 'crystal' ? 'harbor-local-pylon' : object.kind === 'chest' ? 'harbor-crate' : object.kind === 'scroll' ? 'harbor-remote-pylon' : object.kind
          : isMountain
            ? object.kind === 'crystal' ? 'mountain-crystal' : object.kind === 'chest' ? 'mountain-archive-chest' : object.kind === 'scroll' ? 'mountain-fork-sign' : object.kind
            : isCastle
              ? object.kind === 'crystal' ? 'castle-crystal' : object.kind === 'chest' ? 'castle-archive-chest' : object.kind === 'scroll' ? 'castle-rune-tablet' : object.kind
            : object.kind;
      const displaySize = isBeach ? 42 : isCave ? object.kind === 'chest' ? 68 : 54 : isHarbor ? object.kind === 'chest' ? 70 : 58 : isMountain ? object.kind === 'chest' ? 68 : 56 : isCastle ? object.kind === 'chest' ? 72 : 58 : 32;
      const sprite = this.physics.add.staticImage(position.x, position.y, texture).setDisplaySize(displaySize, displaySize).setDepth(3) as Phaser.Physics.Arcade.Image & { objectId?: string; objectKind?: string; interactionKind?: string };
      sprite.objectId = object.id;
      sprite.objectKind = object.kind;
      sprite.interactionKind = object.kind;
      return sprite;
    });
    const gatePosition = resolveTiledObjectPoint(this.map.objects, 'door', 'exit-gate', this.level.exit.position);
    const gateTexture = isBeach ? 'level-01-gate-v1' : style.gateTextures?.closed ?? 'gate';
    this.gate = this.physics.add.staticImage(gatePosition.x, gatePosition.y, gateTexture)
      .setDisplaySize(isBeach ? 120 : style.decorationProfile === 'forest' ? 118 : style.decorationProfile === 'cave' ? 132 : style.decorationProfile === 'harbor' ? 128 : style.decorationProfile === 'mountain' ? 124 : style.decorationProfile === 'castle' ? 132 : 40, isBeach ? 110 : style.decorationProfile === 'forest' ? 124 : style.decorationProfile === 'cave' ? 136 : style.decorationProfile === 'harbor' ? 130 : style.decorationProfile === 'mountain' ? 132 : style.decorationProfile === 'castle' ? 138 : 44)
      .setOrigin(0.5, isEnhancedRegion ? 0.92 : 0.5)
      .setDepth(isEnhancedRegion ? 4 : 3);
    (this.gate as Phaser.Physics.Arcade.Image & { interactionKind?: string }).interactionKind = 'gate';
    this.mentor = this.add.sprite(mentorSpawn.x, mentorSpawn.y, isEnhancedRegion ? 'level-01-midou-sheet-v1' : 'midou-sheet', 1).setDisplaySize(isEnhancedRegion ? 78 : 32, isEnhancedRegion ? 78 : 32).setOrigin(0.5, 0.82).setDepth(4);
    (this.mentor as Phaser.GameObjects.Sprite & { interactionKind?: string }).interactionKind = 'mentor';
    this.mentor.play(isEnhancedRegion ? 'level-01-midou-idle-down' : 'midou-idle');
    if (isEnhancedRegion) {
      this.player.setOrigin(0.5, 0.82).setFrame(1);
      this.playerShadow = this.add.ellipse(playerSpawn.x, playerSpawn.y + 23, 34, 12, 0x102033, 0.42).setDepth(4.5);
      this.mentorShadow = this.add.ellipse(mentorSpawn.x, mentorSpawn.y + 22, 32, 11, 0x102033, 0.42).setDepth(3.5);
      const i18n = new I18nManager(this.session.locale);
      this.mentorLabel = this.add.text(mentorSpawn.x, mentorSpawn.y - 48, i18n.text('midouName'), { fontFamily: 'monospace', fontSize: '13px', color: '#fff4c7', stroke: '#18233e', strokeThickness: 4 }).setOrigin(0.5, 1).setDepth(6).setVisible(false);
      this.gateGlow = this.add.image(gatePosition.x, gatePosition.y, isBeach ? 'level-01-gate-v1' : style.gateTextures?.open ?? gateTexture).setOrigin(0.5, 0.92).setDisplaySize(isBeach ? 120 : style.decorationProfile === 'cave' ? 132 : style.decorationProfile === 'harbor' ? 128 : style.decorationProfile === 'mountain' ? 124 : style.decorationProfile === 'castle' ? 132 : 118, isBeach ? 110 : style.decorationProfile === 'cave' ? 136 : style.decorationProfile === 'harbor' ? 130 : style.decorationProfile === 'mountain' ? 132 : style.decorationProfile === 'castle' ? 138 : 124).setTint(isBeach ? 0x70edff : style.decorationProfile === 'cave' ? 0xd48cff : style.decorationProfile === 'harbor' ? 0x6fe6ff : style.decorationProfile === 'mountain' ? 0xcdefff : style.decorationProfile === 'castle' ? 0xff4fd8 : 0xb4e26c).setAlpha(0).setDepth(3.2);
      // Keep the label inside the playable camera bounds: the gate anchor is
      // intentionally close to the eastern edge of the Tiled map.
      this.gateLabel = this.add.text(gatePosition.x - 88, gatePosition.y - 92, i18n.text('gateName'), { fontFamily: 'Courier New, monospace', fontSize: '11px', color: '#c6d1e7', stroke: '#18233e', strokeThickness: 3 }).setOrigin(1, 1).setDepth(6).setVisible(false);
      this.gateUnlocked = true;
      this.refreshGatePresentation();
    }
    this.interactionHint = this.add.text(0, 0, 'E', { fontFamily: 'monospace', fontSize: '13px', color: '#18233e', backgroundColor: '#f7d56a', padding: { x: 7, y: 4 }, stroke: '#10172b', strokeThickness: 2 }).setOrigin(0.5).setDepth(20).setVisible(false);
  }

  private refreshGatePresentation(): void {
    const style = getLegacyWorldStyle(this.level.id);
    if ((this.level.id !== 'level-01' && !style.gateTextures) || !this.gate) return;
    const unlocked = this.quest.currentStep?.kind === 'open-exit' && this.session.inventory.has(this.level.exit.requiredItemId);
    if (typeof document !== 'undefined') document.documentElement.dataset.gitquestGateState = unlocked ? 'open' : 'locked';
    if (unlocked === this.gateUnlocked) return;
    this.gateUnlocked = unlocked;
    if (unlocked) {
      this.gate.setTexture(this.level.id === 'level-01' ? 'level-01-gate-v1' : style.gateTextures?.open ?? 'gate').clearTint().setAlpha(1);
      this.gateGlow?.setVisible(true).setAlpha(0.18);
      this.gateGlowTween?.stop();
      if (this.gateGlow) this.gateGlowTween = this.tweens.add({ targets: this.gateGlow, alpha: { from: 0.12, to: 0.32 }, duration: 1250, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.gateLabel?.setColor(this.level.id === 'level-01' ? '#ffe08a' : '#d6f58b');
    } else {
      this.gate.setTexture(this.level.id === 'level-01' ? 'level-01-gate-v1' : style.gateTextures?.closed ?? 'gate').setTint(0x64718a).setAlpha(0.84);
      this.gateGlowTween?.stop();
      this.gateGlow?.setVisible(false).setAlpha(0);
      this.gateLabel?.setColor('#aeb9cb');
    }
    this.refreshGateLabel();
  }

  private refreshGateLabel(): void {
    if (!this.gateLabel) return;
    const i18n = new I18nManager(this.session.locale);
    this.gateLabel.setText(i18n.text('gateName') + ' · ' + i18n.text(this.gateUnlocked ? 'gateOpen' : 'gateLocked'));
  }

  private resolveSafeSpawn(point: Point): Point {
    if (this.level.id !== 'level-01' || !this.isWaterAt(point)) return point;
    for (let radius = 1; radius < 8; radius += 1) {
      for (const candidate of [{ x: point.x + radius * 32, y: point.y }, { x: point.x - radius * 32, y: point.y }, { x: point.x, y: point.y + radius * 32 }, { x: point.x, y: point.y - radius * 32 }]) {
        if (!this.isWaterAt(candidate)) return candidate;
      }
    }
    return { x: 128, y: 256 };
  }

  private isWaterAt(point: Point): boolean {
    const tileX = Math.floor(point.x / this.map.tileWidth);
    const tileY = Math.floor(point.y / this.map.tileHeight);
    if (tileX < 0 || tileY < 0 || tileX >= this.map.width || tileY >= this.map.height) return true;
    return this.map.ground[tileY * this.map.width + tileX] === 3;
  }

  private addWaterCollisions(obstacles: Phaser.Physics.Arcade.StaticGroup): void {
    for (let row = 0; row < this.map.height; row += 1) {
      let start = -1;
      for (let column = 0; column <= this.map.width; column += 1) {
        const water = column < this.map.width && this.map.ground[row * this.map.width + column] === 3;
        if (water && start < 0) start = column;
        if ((!water || column === this.map.width) && start >= 0) {
          const width = (column - start) * this.map.tileWidth;
          // Keep the collision lip inside the water edge. A 24px expansion
          // swallowed the first wet-sand tile and made the crystal route
          // unreachable with the larger level-1 character body.
          const padding = 8;
          const block = this.add.zone(start * this.map.tileWidth - padding + (width + padding * 2) / 2, row * this.map.tileHeight + this.map.tileHeight / 2, width + padding * 2, this.map.tileHeight + padding * 2);
          this.physics.add.existing(block, true);
          obstacles.add(block);
          start = -1;
        }
      }
    }
  }

  public update(time: number): void {
    this.runtimeMetrics?.frame(time);
    this.publishRuntimeMetrics();
    if (!this.player?.body || this.terminalOpen) {
      if (this.player?.body) this.player.setVelocity(0);
      return;
    }
    const keyboard = this.inputManager.movement();
    const vector = this.touchVector.x || this.touchVector.y ? this.touchVector : keyboard;
    this.player.setVelocity(vector.x * 145, vector.y * 145);
    if (vector.x || vector.y) {
      if (this.level.id === 'level-01' || this.level.id === 'level-02') {
        if (Math.abs(vector.x) > Math.abs(vector.y)) this.facing = vector.x < 0 ? 'left' : 'right';
        else this.facing = vector.y < 0 ? 'up' : 'down';
        this.player.play('level-01-player-walk-' + this.facing, true);
      } else this.player.play('player-walk', true);
    }
    else this.player.setFrame(this.level.id === 'level-01' || this.level.id === 'level-02' ? 1 : 0);
    if (this.level.id === 'level-01' && typeof document !== 'undefined') {
      document.documentElement.dataset.gitquestPlayerAnimation = this.player.anims.currentAnim?.key ?? '';
    }
    this.nearby = this.findNearby();
    this.refreshGatePresentation();
    markQaPlayerPosition(this.player.x, this.player.y);
    this.playerShadow?.setPosition(this.player.x, this.player.y + 23);
    this.mentorShadow?.setPosition(this.mentor.x, this.mentor.y + 22);
    if (this.mentorLabel) {
      const mentorDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.mentor.x, this.mentor.y);
      this.mentorLabel.setPosition(this.mentor.x, this.mentor.y - 48).setVisible(mentorDistance < 150);
    }
    if (this.gateLabel && this.gate) {
      const gateDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.gate.x, this.gate.y);
      this.gateLabel.setVisible(gateDistance < 260);
    }
    if (this.interactionHint) {
      const visible = Boolean(this.nearby);
      if (visible && !this.interactionHint.visible) {
        this.interactionHint.setVisible(true).setScale(1);
        this.interactionHintPulse?.stop();
        this.interactionHintPulse = this.tweens.add({ targets: this.interactionHint, y: '-=3', alpha: { from: 0.82, to: 1 }, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      } else if (!visible && this.interactionHint.visible) {
        this.interactionHintPulse?.stop();
        this.interactionHintPulse = undefined;
        this.interactionHint.setVisible(false).setAlpha(1);
      }
      if (this.nearby) {
        const target = this.nearby as Phaser.GameObjects.GameObject & { x: number; y: number };
        this.interactionHint.setPosition(target.x, target.y - 30);
      }
    }
    EventBus.emit('nearby', this.nearby);
  }

  private findNearby(): Phaser.GameObjects.GameObject | null {
    return [this.mentor, this.gate, ...this.objects].find((item) => item.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y) < 58) ?? null;
  }

  private interact(): void {
    // Recalculer la cible au moment exact de l’action évite de dépendre d’un
    // tick précédent lorsque le joueur vient juste d’entrer dans la portée.
    this.nearby = this.findNearby();
    if (!this.nearby) return;
    EventBus.emit('interaction');
    if (this.nearby === this.mentor) {
      const step = this.quest.currentStep;
      if (step?.kind === 'dialogue' && step.dialogueId) this.quest.acceptDialogue(step.dialogueId);
      const dialogueId = step?.dialogueId ?? this.level.dialogues.find((dialogue) => dialogue.id.startsWith('midou'))?.id;
      const dialogue = this.level.dialogues.find((item) => item.id === dialogueId);
      if (dialogue) EventBus.emit('dialogue', { text: dialogue.speaker + ' : ' + new I18nManager(this.session.locale).localized(dialogue.text) });
      this.persist();
      return;
    }
    if (this.nearby === this.gate) {
      if (this.quest.currentStep?.kind !== 'open-exit' || !this.session.inventory.has(this.level.exit.requiredItemId)) {
        const i18n = new I18nManager(this.session.locale);
        EventBus.emit('toast', i18n.text(this.level.id === 'level-01' ? 'gateLockedHint' : 'locked'));
        EventBus.emit('interaction-locked');
        return;
      }
      if (!this.quest.acceptExit()) return;
      this.refreshGatePresentation();
      this.showRewardEffect(this.gate.x, this.gate.y - 35, new I18nManager(this.session.locale).text('gateOpened'), '#ffe08a');
      EventBus.emit('gate-open');
      this.session.inventory.remove(this.level.exit.requiredItemId);
      this.session.save();
      const levels = this.registry.get('levels') as LevelDefinition[];
      const currentIndex = levels.findIndex((level) => level.id === this.level.id);
      const next = levels[currentIndex + 1];
      if (next) { this.session.levelId = next.id; this.session.save(); this.sceneManager.goToLevel(next.id); }
      else this.sceneManager.showVictory();
      return;
    }
    const object = this.nearby as typeof this.objects[number];
    const definition = this.level.objects.find((item) => item.id === object.objectId);
    if (!definition) return;
    if (definition.kind === 'chest') {
      if (this.quest.acceptCollection(definition.id)) {
        this.session.inventory.add(definition.itemId ?? this.level.key.itemId);
        this.session.collectObject(this.level.id, definition.id);
        this.session.xp.add(50);
        object.destroy();
        this.persist();
        this.showRewardEffect(object.x, object.y, '+50 XP · ' + new I18nManager(this.session.locale).text('key'), '#ffe08a');
        EventBus.emit('reward');
        EventBus.emit('toast', new I18nManager(this.session.locale).text('keyReward'));
      }
    } else if (definition.kind === 'crystal') {
      this.session.xp.add(definition.xp ?? 10);
      if (definition.itemId) this.session.inventory.add(definition.itemId);
      this.session.collectObject(this.level.id, definition.id);
      if (definition.secret) this.session.discoverSecret(this.level.id, definition.id);
      object.destroy();
      this.session.save();
      this.showRewardEffect(object.x, object.y, '+' + (definition.xp ?? 10) + ' XP', '#b9f6ff');
      EventBus.emit('reward');
      EventBus.emit('mission-update', this.quest);
      EventBus.emit('toast', new I18nManager(this.session.locale).text('crystalReward') + ' : +' + (definition.xp ?? 10) + ' ' + new I18nManager(this.session.locale).text('xpReward'));
    } else if (definition.dialogueId) {
      const objectX = object.x;
      const objectY = object.y;
      const rewardXp = definition.rewardXp ?? 0;
      if (definition.optional || definition.secret) {
        this.session.collectObject(this.level.id, definition.id);
        if (definition.itemId) this.session.inventory.add(definition.itemId);
        if (definition.secret) this.session.discoverSecret(this.level.id, definition.id);
        if (rewardXp > 0) this.session.xp.add(rewardXp);
        object.destroy();
      }
      const dialogue = this.level.dialogues.find((item) => item.id === definition.dialogueId);
      if (dialogue) EventBus.emit('dialogue', { text: dialogue.speaker + ' : ' + new I18nManager(this.session.locale).localized(dialogue.text) });
      if (rewardXp > 0) {
        this.showRewardEffect(objectX, objectY, '+' + rewardXp + ' XP', '#b9f6ff');
        EventBus.emit('reward');
        EventBus.emit('toast', new I18nManager(this.session.locale).text('secretReward') + ' : +' + rewardXp + ' ' + new I18nManager(this.session.locale).text('xpReward'));
      }
      if (definition.optional || definition.secret) this.persist();
    }
  }

  private persist(): void {
    this.session.save();
    EventBus.emit('mission-update', this.quest);
  }

  private openTerminal(): void { this.terminalOpen = true; }
  private closeTerminal(): void { this.terminalOpen = false; }
  private refreshLocalizedScene(): void {
    const i18n = new I18nManager(this.session.locale);
    i18n.applyDirection(this.game.canvas);
    this.worldTitle?.setText(i18n.localized(this.level.title));
    this.shrineLabels.forEach((label) => label.setText(i18n.text('shrine')));
    this.mentorLabel?.setText(i18n.text('midouName'));
    this.gateLabel?.setText(i18n.text('gateName'));
    this.refreshGateLabel();
  }

  private publishRuntimeMetrics(): void {
    if (!this.runtimeMetrics || typeof document === 'undefined') return;
    const snapshot = this.runtimeMetrics.snapshot();
    if (!snapshot.sampleDurationMs || snapshot.sampleDurationMs === this.publishedRuntimeSample) return;
    this.publishedRuntimeSample = snapshot.sampleDurationMs;
    document.documentElement.dataset.gitquestFps = snapshot.fps.toFixed(2);
    document.documentElement.dataset.gitquestFrameTimeMs = snapshot.frameTimeMs.toFixed(2);
    document.documentElement.dataset.gitquestSampleFrames = String(snapshot.sampleFrames);
    document.documentElement.dataset.gitquestSampleDurationMs = String(Math.round(snapshot.sampleDurationMs));
  }

  private showRewardEffect(x: number, y: number, text: string, color: string): void {
    const reward = this.add.text(x, y, text, { fontFamily: 'monospace', fontSize: '15px', color, stroke: '#18233e', strokeThickness: 4 }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: reward, y: y - 34, alpha: 0, duration: 1100, ease: 'Cubic.out', onComplete: () => reward.destroy() });
  }
}
