import type { LocalizedText } from '../models/game';

export interface ItemDefinition {
  id: string;
  iconKey: string;
  name: LocalizedText;
  description: LocalizedText;
}

export const ITEM_CATALOG: Record<string, ItemDefinition> = {
  'pass-key': {
    id: 'pass-key',
    iconKey: 'key',
    name: { fr: 'Clé de passage', en: 'Passage key', ar: 'مفتاح العبور' },
    description: {
      fr: 'Ouvre la porte vers la prochaine région.',
      en: 'Opens the gate to the next region.',
      ar: 'يفتح البوابة المؤدية إلى المنطقة التالية.',
    },
  },
  'memory-shard': {
    id: 'memory-shard',
    iconKey: 'crystal',
    name: { fr: 'Éclat de mémoire', en: 'Memory shard', ar: 'شظية ذاكرة' },
    description: {
      fr: 'Un fragment secret trouvé pendant l’exploration.',
      en: 'A secret fragment found while exploring.',
      ar: 'قطعة سرية عُثر عليها أثناء الاستكشاف.',
    },
  },
  'archive-scroll': {
    id: 'archive-scroll',
    iconKey: 'scroll',
    name: { fr: 'Parchemin d’archive', en: 'Archive scroll', ar: 'رقعة أرشيفية' },
    description: {
      fr: 'Une note pédagogique conservée par l’île.',
      en: 'A teaching note preserved by the island.',
      ar: 'مذكرة تعليمية حفظتها الجزيرة.',
    },
  },
};

export function itemDefinition(itemId: string): ItemDefinition {
  return ITEM_CATALOG[itemId] ?? {
    id: itemId,
    iconKey: 'chest',
    name: { fr: itemId, en: itemId, ar: itemId },
    description: { fr: 'Objet découvert sur l’île.', en: 'Item discovered on the island.', ar: 'عنصر تم اكتشافه في الجزيرة.' },
  };
}
