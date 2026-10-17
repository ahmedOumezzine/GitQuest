import Phaser from 'phaser';
import type { LevelDefinition, Point, TiledMapData } from '../models/game';
import { EventBus } from '../core/EventBus';
import type { GameSession } from '../core/GameSession';
import { I18nManager } from '../managers/I18nManager';
import { LevelManager, resolveTiledObjectPoint } from '../managers/LevelManager';
import { SceneManager } from '../phaser/SceneManager';
import { InputManager } from '../phaser/InputManager';
import { RuntimeMetrics } from '../diagnostics/RuntimeMetrics';
import { getLegacyWorldStyle } from '../world/LegacyWorldStyle';
import { markQaLevel, markQaState } from '../diagnostics/QaMarker';

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
  private playerAccent?: Phaser.GameObjects.Image;
  private mentorAccent?: Phaser.GameObjects.Image;
  private shrineLabels: Phaser.GameObjects.Text[] = [];
  private worldTitle?: Phaser.GameObjects.Text;
  private runtimeMetrics?: RuntimeMetrics;
  private publishedRuntimeSample = 0;

  public constructor() { super('WorldScene'); }

  public init(data: { levelId?: string }): void {
    const session = this.registry.get('session') as GameSession;
    this.session = session;
    this.level = (this.registry.get('levels') as LevelDefinition[]).find((item) => item.id === (data.levelId ?? session.levelId))!;
  }

  public create(): void {
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

  private drawWorld(): void {
    if (this.level.id === 'level-01' && this.map.ground.length === this.map.width * this.map.height) {
      this.drawBeachWorld();
      return;
    }
    this.drawLegacyWorld();
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
    this.cameras.main.setBackgroundColor('#27718a').setBounds(0, 0, worldWidth, worldHeight).setZoom(1.15).setRoundPixels(true);
    const rows: number[][] = [];
    for (let row = 0; row < this.map.height; row += 1) rows.push(this.map.ground.slice(row * this.map.width, (row + 1) * this.map.width));
    const tilemap = this.make.tilemap({ data: rows, tileWidth: this.map.tileWidth, tileHeight: this.map.tileHeight });
    const tileset = tilemap.addTilesetImage('beach-tileset', 'beach-tileset', this.map.tileWidth, this.map.tileHeight, 0, 0);
    if (tileset) tilemap.createLayer(0, tileset, 0, 0)?.setDepth(0).setCullPadding(0, 0);
    this.map.decorations.forEach((definition) => {
      const key = ['palm', 'rock', 'grass', 'ruin', 'shrine', 'shrine-glow', 'wave', 'flower', 'shell'].includes(definition.type) ? definition.type : undefined;
      if (!key) return;
      const sprite = this.add.image(definition.x, definition.y, key).setOrigin(0, 0).setDepth(definition.type === 'wave' || definition.type === 'shrine-glow' ? 1 : definition.type === 'shrine' ? 4 : 2);
      if (definition.width && definition.height) sprite.setDisplaySize(definition.width, definition.height);
      this.decorations.push(sprite);
      if (definition.type === 'wave' || definition.type === 'grass' || definition.type === 'palm' || definition.type === 'flower') {
        this.tweens.add({ targets: sprite, y: definition.y + 2, duration: definition.type === 'wave' ? 900 : 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }
      if (definition.type === 'shrine-glow') this.tweens.add({ targets: sprite, alpha: 0.45, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      if (definition.type === 'shrine') {
        const label = this.add.text(definition.x + (definition.width || 96) / 2, definition.y - 8, new I18nManager(this.session.locale).text('shrine'), { fontFamily: 'monospace', fontSize: '13px', color: '#ffe08a', stroke: '#18233e', strokeThickness: 4 }).setOrigin(0.5, 1).setDepth(5);
        this.shrineLabels.push(label);
      }
    });
  }

  private createEntities(): void {
    const isBeach = this.level.id === 'level-01';
    const playerTexture = isBeach ? 'player-4dir' : 'player-sheet';
    const playerSize = isBeach ? 42 : 32;
    const playerSpawn = this.resolveSafeSpawn(resolveTiledObjectPoint(this.map.objects, 'spawn', 'player-spawn', this.level.playerSpawn));
    const mentorSpawn = this.resolveSafeSpawn(resolveTiledObjectPoint(this.map.objects, 'npc', 'midou', this.level.mentor));
    this.player = this.physics.add.sprite(playerSpawn.x, playerSpawn.y, playerTexture, 0).setDisplaySize(playerSize, playerSize).setDepth(5);
    this.player.setCollideWorldBounds(true);
    if (isBeach) {
      this.physics.world.setBounds(0, 0, this.map.width * this.map.tileWidth, this.map.height * this.map.tileHeight);
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
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
      const sprite = this.physics.add.staticImage(position.x, position.y, object.kind).setDisplaySize(isBeach ? 42 : 32, isBeach ? 42 : 32).setDepth(3) as Phaser.Physics.Arcade.Image & { objectId?: string; objectKind?: string };
      sprite.objectId = object.id;
      sprite.objectKind = object.kind;
      return sprite;
    });
    const gatePosition = resolveTiledObjectPoint(this.map.objects, 'door', 'exit-gate', this.level.exit.position);
    this.gate = this.physics.add.staticImage(gatePosition.x, gatePosition.y, 'gate').setDisplaySize(isBeach ? 52 : 40, isBeach ? 58 : 44).setDepth(3);
    this.mentor = this.add.sprite(mentorSpawn.x, mentorSpawn.y, isBeach ? 'midou-4dir' : 'midou-sheet', 0).setDisplaySize(isBeach ? 42 : 32, isBeach ? 42 : 32).setDepth(4);
    this.mentor.play(isBeach ? 'midou-idle-down' : 'midou-idle');
    if (isBeach) {
      this.playerAccent = this.add.image(playerSpawn.x, playerSpawn.y, 'player-scarf').setDisplaySize(42, 42).setDepth(6);
      this.mentorAccent = this.add.image(mentorSpawn.x, mentorSpawn.y, 'midou-staff').setDisplaySize(42, 42).setDepth(6);
    }
    this.interactionHint = this.add.text(0, 0, '✦', { fontFamily: 'monospace', fontSize: '16px', color: '#ffe08a', stroke: '#45334a', strokeThickness: 3 }).setOrigin(0.5).setDepth(20).setVisible(false);
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
          const padding = 24;
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
      if (this.level.id === 'level-01') {
        if (Math.abs(vector.x) > Math.abs(vector.y)) this.facing = vector.x < 0 ? 'left' : 'right';
        else this.facing = vector.y < 0 ? 'up' : 'down';
        this.player.play('player-walk-' + this.facing, true);
      } else this.player.play('player-walk', true);
    }
    else this.player.setFrame(0);
    this.nearby = this.findNearby();
    this.playerAccent?.setPosition(this.player.x, this.player.y);
    this.mentorAccent?.setPosition(this.mentor.x, this.mentor.y);
    if (this.interactionHint) {
      this.interactionHint.setVisible(Boolean(this.nearby));
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
      if (this.quest.currentStep?.kind !== 'open-exit' || !this.session.inventory.has(this.level.exit.requiredItemId)) { EventBus.emit('toast', new I18nManager(this.session.locale).text('locked')); return; }
      if (!this.quest.acceptExit()) return;
      this.showRewardEffect(this.gate.x, this.gate.y - 35, new I18nManager(this.session.locale).text('gateOpened'), '#ffe08a');
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
        EventBus.emit('toast', new I18nManager(this.session.locale).text('keyReward'));
      }
    } else if (definition.kind === 'crystal') {
      this.session.xp.add(definition.xp ?? 10);
      this.session.collectObject(this.level.id, definition.id);
      object.destroy();
      this.session.save();
      this.showRewardEffect(object.x, object.y, '+' + (definition.xp ?? 10) + ' XP', '#b9f6ff');
      EventBus.emit('mission-update', this.quest);
      EventBus.emit('toast', new I18nManager(this.session.locale).text('crystalReward') + ' : +' + (definition.xp ?? 10) + ' ' + new I18nManager(this.session.locale).text('xpReward'));
    } else if (definition.dialogueId) {
      const dialogue = this.level.dialogues.find((item) => item.id === definition.dialogueId);
      if (dialogue) EventBus.emit('dialogue', { text: dialogue.speaker + ' : ' + new I18nManager(this.session.locale).localized(dialogue.text) });
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
