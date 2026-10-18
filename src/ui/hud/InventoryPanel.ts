import Phaser from 'phaser';
import type { I18nManager } from '../../managers/I18nManager';
import { UITheme } from '../theme/UITheme';
import { itemDefinition } from '../../data/ItemCatalog';

/** Full inventory view opened from the compact HUD bar or with the I key. */
export class InventoryPanel extends Phaser.GameObjects.Container {
  private readonly dimmer: Phaser.GameObjects.Rectangle;
  private readonly shadow: Phaser.GameObjects.Rectangle;
  private readonly background: Phaser.GameObjects.Rectangle;
  private readonly accent: Phaser.GameObjects.Rectangle;
  private readonly title: Phaser.GameObjects.Text;
  private readonly subtitle: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private readonly action: Phaser.GameObjects.Text;
  private readonly grid: Phaser.GameObjects.Container;
  private items: string[] = [];
  private quantities: Record<string, number> = {};
  private equipped: Record<string, string> = {};
  private selectedItem = '';
  private i18n?: I18nManager;
  private onAction?: (itemId: string) => void;
  private cardWidth = 520;
  private cardHeight = 300;

  public constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.setDepth(46).setVisible(false);

    this.dimmer = scene.add.rectangle(0, 0, 1, 1, UITheme.colors.ink, 0.72).setOrigin(0).setInteractive();
    this.dimmer.on('pointerdown', () => this.close());
    this.shadow = scene.add.rectangle(8, 9, this.cardWidth, this.cardHeight, UITheme.colors.panelShadow, 0.72).setOrigin(0);
    this.background = scene.add.rectangle(0, 0, this.cardWidth, this.cardHeight, UITheme.colors.panel, 0.98)
      .setOrigin(0)
      .setStrokeStyle(3, UITheme.colors.borderAccent);
    this.accent = scene.add.rectangle(0, 0, this.cardWidth, 4, UITheme.colors.goldSoft).setOrigin(0);
    this.title = scene.add.text(24, 22, '', { fontFamily: UITheme.fontFamily, fontSize: '22px', color: UITheme.colors.accent });
    this.subtitle = scene.add.text(24, 58, '', { fontFamily: UITheme.fontFamily, fontSize: '13px', color: UITheme.colors.textMuted });
    this.grid = scene.add.container(24, 96);
    this.hint = scene.add.text(24, this.cardHeight - 34, '', { fontFamily: UITheme.fontFamily, fontSize: '12px', color: UITheme.colors.textMuted });
    this.action = scene.add.text(0, 0, '', { fontFamily: UITheme.fontFamily, fontSize: '11px', color: '#18233e', backgroundColor: '#f7d56a', padding: { x: 8, y: 5 } }).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    this.action.on('pointerdown', () => { if (this.selectedItem) this.onAction?.(this.selectedItem); });
    this.add([this.dimmer, this.shadow, this.background, this.accent, this.title, this.subtitle, this.grid, this.action, this.hint]);
  }

  public setItems(items: string[], i18n: I18nManager, quantities: Record<string, number> = {}, equipped: Record<string, string> = {}, onAction?: (itemId: string) => void): this {
    this.items = [...items];
    this.quantities = { ...quantities };
    this.equipped = { ...equipped };
    this.i18n = i18n;
    this.onAction = onAction;
    this.title.setText(i18n.text('inventory'));
    if (!this.items.includes(this.selectedItem)) this.selectedItem = this.items[0] ?? '';
    this.refreshSubtitle();
    this.hint.setText(i18n.direction === 'rtl' ? 'I / Esc · إغلاق' : 'I / Esc · Fermer');
    this.refreshAction(equipped);
    this.renderGrid();
    return this;
  }

  private itemCountLabel(count: number, i18n: I18nManager): string {
    if (i18n.locale === 'en') return `Items: ${count}`;
    if (i18n.locale === 'ar') return `العناصر: ${count}`;
    return `Objets : ${count}`;
  }

  private emptyLabel(i18n: I18nManager): string {
    if (i18n.locale === 'en') return 'No items yet';
    if (i18n.locale === 'ar') return 'لا توجد عناصر بعد';
    return 'Aucun objet pour le moment';
  }

  private itemDescription(item: string, i18n: I18nManager): string {
    return i18n.localized(itemDefinition(item).description);
  }

  private refreshSubtitle(): void {
    if (!this.i18n) return;
    const count = this.itemCountLabel(this.items.length, this.i18n);
    this.subtitle.setText(this.selectedItem ? count + '\n' + this.itemDescription(this.selectedItem, this.i18n) : count);
  }

  private refreshAction(equipped: Record<string, string> = {}): void {
    if (!this.i18n || !this.selectedItem) {
      this.action.setVisible(false);
      return;
    }
    const definition = itemDefinition(this.selectedItem);
    if (definition.category === 'consumable') {
      this.action.setText(this.i18n.locale === 'en' ? 'Use' : this.i18n.locale === 'ar' ? 'استخدم' : 'Utiliser').setVisible(true);
    } else if (definition.category === 'equipment' && definition.equipSlot) {
      const active = equipped[definition.equipSlot] === this.selectedItem;
      this.action.setText(active ? (this.i18n.locale === 'en' ? 'Unequip' : this.i18n.locale === 'ar' ? 'إزالة' : 'Retirer') : (this.i18n.locale === 'en' ? 'Equip' : this.i18n.locale === 'ar' ? 'تجهيز' : 'Équiper')).setVisible(true);
    } else {
      this.action.setVisible(false);
    }
  }

  private renderGrid(): void {
    const i18n = this.i18n;
    if (!i18n) return;
    this.grid.removeAll(true);

    const compact = this.cardWidth < 430;
    const columns = compact ? 3 : 4;
    const slotWidth = compact ? 88 : 96;
    const slotHeight = 76;
    const gap = compact ? 8 : 12;
    const slotCount = Math.max(compact ? 6 : 8, this.items.length);
    for (let index = 0; index < slotCount; index += 1) {
      const item = this.items[index];
      const x = (index % columns) * (slotWidth + gap);
      const y = Math.floor(index / columns) * (slotHeight + gap);
      const slot = this.scene.add.rectangle(x, y, slotWidth, slotHeight, item ? UITheme.colors.panelRaised : UITheme.colors.ink, item ? 0.96 : 0.34)
        .setOrigin(0)
        .setStrokeStyle(item ? (item === this.selectedItem ? 2 : 1) : 1, item === this.selectedItem ? UITheme.colors.goldSoft : UITheme.colors.panelLine, item ? 1 : 0.55);
      this.grid.add(slot);
      if (item) {
        slot.setInteractive({ useHandCursor: true });
        slot.on('pointerdown', () => {
          this.selectedItem = item;
          this.refreshSubtitle();
          this.refreshAction(this.equipped);
          this.renderGrid();
        });
        const definition = itemDefinition(item);
        const icon = this.scene.add.image(x + slotWidth / 2, y + 31, definition.iconKey).setDisplaySize(34, 34);
        const label = this.scene.add.text(x + slotWidth / 2, y + 60, i18n.localized(definition.name), { fontFamily: UITheme.fontFamily, fontSize: '10px', color: UITheme.colors.text, align: 'center', wordWrap: { width: slotWidth - 8 } }).setOrigin(0.5);
        const quantity = this.quantities[item] ?? 1;
        const count = quantity > 1 ? this.scene.add.text(x + slotWidth - 8, y + 8, '×' + quantity, { fontFamily: UITheme.fontFamily, fontSize: '10px', color: UITheme.colors.accent }).setOrigin(1, 0) : undefined;
        this.grid.add([icon, label]);
        if (count) this.grid.add(count);
      }
    }
    if (!this.items.length) {
      this.grid.add(this.scene.add.text(compact ? 0 : 8, 88, this.emptyLabel(i18n), { fontFamily: UITheme.fontFamily, fontSize: compact ? '10px' : '11px', color: UITheme.colors.textMuted }));
    }
  }

  public layout(width: number, height: number, compact: boolean): this {
    this.dimmer.setSize(width, height);
    this.cardWidth = Math.min(compact ? width - 24 : 520, width - 24);
    this.cardHeight = Math.min(compact ? height - 36 : 300, height - 24);
    const x = (width - this.cardWidth) / 2;
    const y = (height - this.cardHeight) / 2;
    this.shadow.setPosition(x + 8, y + 9).setSize(this.cardWidth, this.cardHeight);
    this.background.setPosition(x, y).setSize(this.cardWidth, this.cardHeight);
    this.accent.setPosition(x, y).setSize(this.cardWidth, 4);
    this.title.setPosition(x + 24, y + 22).setFontSize(compact ? '18px' : '22px');
    this.subtitle.setPosition(x + 24, y + 54).setFontSize(compact ? '10px' : '12px').setWordWrapWidth(Math.max(160, this.cardWidth - 48));
    this.grid.setPosition(x + 24, y + (compact ? 86 : 96));
    this.renderGrid();
    this.action.setPosition(x + 24, y + this.cardHeight - 66).setFontSize(compact ? '10px' : '11px');
    this.hint.setPosition(x + 24, y + this.cardHeight - 30).setFontSize(compact ? '10px' : '12px');
    return this;
  }

  public toggle(): this { this.setVisible(!this.visible); return this; }
  public close(): this { this.setVisible(false); return this; }
}
