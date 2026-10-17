import Phaser from 'phaser';
import type { GameSession } from '../core/GameSession';
import type { Locale } from '../models/game';
import { I18nManager } from '../managers/I18nManager';
import { MainMenu } from '../ui/MainMenu';
import { SettingsPanel } from '../ui/SettingsPanel';
import { ConfirmPanel } from '../ui/ConfirmPanel';
import { ResponsiveLayoutManager } from '../ui/layout/ResponsiveLayoutManager';
import { UITheme } from '../ui/theme/UITheme';
import { markQaState } from '../diagnostics/QaMarker';

export class TitleScene extends Phaser.Scene {
  private session!: GameSession;
  private mainMenu!: MainMenu;
  private settingsPanel!: SettingsPanel;
  private confirmPanel!: ConfirmPanel;
  private backdrop!: Phaser.GameObjects.Container;
  private menuBranding!: Phaser.GameObjects.Container;
  private backdropSubtitle!: Phaser.GameObjects.Text;
  private i18n!: I18nManager;
  private layout!: ResponsiveLayoutManager;

  public constructor() { super('TitleScene'); }

  public create(): void {
    markQaState('title');
    this.session = this.registry.get('session') as GameSession;
    this.i18n = new I18nManager(this.session.locale);
    this.layout = new ResponsiveLayoutManager(this);
    this.i18n.applyDirection(this.game.canvas);
    this.cameras.main.setBackgroundColor('#142944');
    this.drawBackdrop();
    this.layout.onResize(() => { if (this.backdrop) this.drawBackdrop(); });
    this.mainMenu = new MainMenu(this, this.session.hadExistingSave, this.i18n, {
      onNewGame: () => this.requestNewGame(),
      onContinue: () => this.continueGame(),
      onSettings: () => this.showSettings(),
      onLocaleChange: (locale) => this.changeLocale(locale),
    });
    this.settingsPanel = new SettingsPanel(this, this.i18n, {
      onBack: () => this.hideSettings(),
      onLocaleChange: (locale) => this.changeLocale(locale),
      onTouchModeChange: () => { this.session.touchControlsMode = this.session.touchControlsMode === 'auto' ? 'always' : 'auto'; this.refreshLocale(); this.session.save(); },
    }).setVisible(false);
    this.confirmPanel = new ConfirmPanel(this, this.i18n, {
      onConfirm: () => this.startNewGame(),
      onCancel: () => this.hideNewGameConfirmation(),
    }).setVisible(false);
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.confirmPanel.visible) this.hideNewGameConfirmation();
      else if (this.settingsPanel.visible) this.hideSettings();
    });
    this.input.keyboard?.on('keydown-N', () => { if (!this.settingsPanel.visible && !this.confirmPanel.visible) this.requestNewGame(); });
    this.input.keyboard?.on('keydown-C', () => { if (!this.settingsPanel.visible && this.session.hadExistingSave) this.continueGame(); });
    this.input.keyboard?.on('keydown-S', () => { if (!this.settingsPanel.visible) this.showSettings(); });
  }

  private drawBackdrop(): void {
    const { width, height, compact, margin } = this.layout.current;
    if (this.backdrop) {
      this.tweens.killTweensOf(this.backdrop.list);
      this.backdrop.destroy(true);
      this.menuBranding?.destroy(true);
    }
    this.backdrop = this.add.container(0, 0).setDepth(0);
    this.menuBranding = this.add.container(0, 0).setDepth(3).setVisible(!this.settingsPanel?.visible);
    // The raster scene is 1672×941. Scaling against the old 960×540 design
    // cropped away the beach and the edge landmarks on desktop viewports.
    const backgroundScale = Math.max(width / 1672, height / 941);
    const backgroundX = this.layout.current.portrait ? width * 0.53 : width / 2;
    this.backdrop.add(this.add.image(backgroundX, height / 2, 'menu-background-v2').setScale(backgroundScale).setDepth(0));

    // Keep the sand, vegetation and props as independent layers so the scene
    // can animate them without baking UI or interaction into one image.
    const foregroundHeight = width * 941 / 1672;
    const foreground = this.add.image(width / 2, height - foregroundHeight / 2, 'menu-foreground-v3')
      .setDisplaySize(width, foregroundHeight)
      .setDepth(1);
    this.backdrop.add(foreground);
    const chestSize = compact ? (this.layout.current.portrait ? 82 : 118) : 148;
    const groundY = height - 4;
    const chest = this.add.image(width * (this.layout.current.portrait ? 0.15 : 0.12), groundY - chestSize / 2, 'menu-chest-v3')
      .setDisplaySize(chestSize * 1.5, chestSize)
      .setDepth(2);
    this.backdrop.add(chest);

    const propScale = compact ? 0.82 : 1;
    [0.16, 0.34, 0.56, 0.78].forEach((x, index) => this.addAmbientWave(width * x, height * (0.70 + (index % 2) * 0.045)));
    const duoX = this.layout.current.portrait ? width * 0.56 : width * 0.31;
    const duoHeight = this.layout.current.portrait ? 142 : (compact ? 176 : 224) * propScale;
    this.addMenuDuo(duoX, groundY - duoHeight / 2, duoHeight);
    const logoWidth = Math.min(760, width - margin * 2);
    const logoHeight = logoWidth * 150 / 760;
    this.menuBranding.add(this.add.image(width / 2, Math.max(margin + logoHeight / 2, height * 0.18), 'menu-logo').setDisplaySize(logoWidth, logoHeight).setDepth(4));
    const subtitleWidth = Math.min(compact && !this.layout.current.portrait ? 460 : 520, width - margin * 2);
    const subtitleHeight = compact && !this.layout.current.portrait ? 52 : subtitleWidth * 76 / 520;
    const subtitleY = Math.max(margin + logoHeight + subtitleHeight / 2 + 4, height * 0.31);
    this.menuBranding.add(this.add.image(width / 2, subtitleY, 'menu-subtitle').setDisplaySize(subtitleWidth, subtitleHeight).setDepth(4));
    this.backdropSubtitle = this.add.text(width / 2, subtitleY, this.i18n.text('title'), { fontFamily: UITheme.fontFamily, fontSize: compact ? '14px' : '20px', color: '#18233e', align: 'center', wordWrap: { width: subtitleWidth - 80 } }).setOrigin(0.5).setDepth(5);
    this.menuBranding.add(this.backdropSubtitle);
    if (this.session.saveError) {
      this.menuBranding.add(this.add.text(width / 2, height - margin - 10, this.i18n.text('saveError'), { fontFamily: UITheme.fontFamily, fontSize: compact ? '10px' : '12px', color: '#ffd0a8', align: 'center', wordWrap: { width: width - margin * 2 } }).setOrigin(0.5).setDepth(5));
    }
  }

  private addMenuDuo(x: number, y: number, height: number): void {
    const width = height * 1.5;
    const shadow = this.add.ellipse(x, y + height * 0.38, width * 0.33, height * 0.09, 0x10172b, 0.48).setDepth(2);
    const character = this.add.image(x, y, 'menu-duo-v3').setDisplaySize(width, height).setDepth(3);
    this.menuBranding.add([shadow, character]);
  }

  private addAmbientWave(x: number, y: number): void {
    const wave = this.add.image(x, y, 'wave').setDisplaySize(112, 28).setAlpha(0.38).setDepth(2);
    this.backdrop.add(wave);
    this.tweens.add({ targets: wave, x: x + 8, alpha: 0.4, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  private changeLocale(locale: Locale): void { this.session.locale = locale; this.refreshLocale(); this.session.save(); }
  private refreshLocale(): void { this.i18n.locale = this.session.locale; this.i18n.applyDirection(this.game.canvas); this.backdropSubtitle.setText(this.i18n.text('title')); this.mainMenu.refresh(this.session.locale); this.settingsPanel.refresh(this.session.locale, this.session.touchControlsMode); this.confirmPanel?.refresh(this.session.locale); }
  private showSettings(): void { markQaState('settings'); this.mainMenu.setMenuVisible(false); this.menuBranding?.setVisible(false); this.settingsPanel.setVisible(true); }
  private hideSettings(): void { markQaState('title'); this.settingsPanel.setVisible(false); this.menuBranding?.setVisible(true); this.mainMenu.setMenuVisible(true); }
  private requestNewGame(): void {
    if (this.session.hadExistingSave) {
      markQaState('new-game-confirm');
      this.mainMenu.setMenuVisible(false);
      this.confirmPanel.setVisible(true);
      return;
    }
    this.startNewGame();
  }
  private hideNewGameConfirmation(): void { this.confirmPanel.setVisible(false); this.mainMenu.setMenuVisible(true); }
  private startNewGame(): void { markQaState('new-game'); this.confirmPanel.setVisible(false); this.session.reset(); this.session.hadExistingSave = false; this.session.save(); this.scene.start('NewGameScene'); }
  private continueGame(): void { this.startWorld(); }
  private startWorld(): void { this.scene.start('WorldScene', { levelId: this.session.levelId }); this.scene.launch('UIScene'); }
}
