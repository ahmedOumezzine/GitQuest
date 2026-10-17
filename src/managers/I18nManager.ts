import type { Locale, LocalizedText } from '../models/game';

export const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  fr: { interact: 'Interagir', objective: 'Objectif', inventory: 'Inventaire', xp: 'XP', key: 'Clé', controls: 'ZQSD / flèches · E : interagir · T : terminal', missionDone: 'Mission validée', locked: 'La porte est verrouillée.', title: 'L’île des commits', newGame: 'Nouvelle partie', continueGame: 'Continuer', settings: 'Paramètres', settingsTitle: 'PARAMÈTRES', language: 'Langue', touchControls: 'Commandes tactiles', touchAuto: 'Automatique', touchAlways: 'Toujours afficher', audio: 'Audio', audioUnavailable: 'Musique : emplacement prévu, assets audio non fournis.', back: 'Retour', musicUnavailable: 'Musique : emplacement prévu, assets audio non fournis.', journal: 'JOURNAL DE MISSION', terminalTitle: 'GITQUEST TERMINAL', terminalWelcome: 'Terminal GitQuest', terminalHelp: 'Aide : git init · git add . · git commit -m "message" · git status', terminalHistoryEmpty: 'Aucun historique de commande.', saveError: 'La sauvegarde n’a pas pu être lue ; une nouvelle partie reste possible.', mapLoadError: 'Impossible de charger cette carte.', shrine: 'Sanctuaire Git', gateOpened: '✦ Porte ouverte', keyReward: 'Tu obtiens une clé de passage !', crystalReward: 'Cristal de mémoire', xpReward: 'XP', stepTalk: 'Parler à Midou', stepInit: 'Exécuter git init', stepKey: 'Trouver la clé', stepExit: 'Ouvrir la porte', newGameConfirmTitle: 'Nouvelle partie', newGameConfirmMessage: 'La sauvegarde actuelle sera réinitialisée. Continuer ?', confirm: 'Confirmer', cancel: 'Annuler', loadingTitle: 'Préparation de l’expédition', loadingMap: 'Chargement des archives de la plage…', introTitle: 'Le secret des archives', introLine1: 'Midou : Cette île conserve la mémoire de chaque aventure.', introLine2: 'Les archives Git ont été dispersées dans ses six régions.', introLine3: 'Retrouve-les, apprends les commandes et rallume les portes.', startAdventure: 'Commencer l’aventure', skip: 'Passer', retry: 'Réessayer', bootLoading: 'Chargement de l’île…', bootLoadError: 'Impossible de charger l’île', assetMissing: 'Asset manquant', victoryTitle: 'VICTOIRE !', victoryMessage: 'L’île des commits est restaurée.', totalXp: 'XP totale', replay: 'Rejouer' },
  en: { interact: 'Interact', objective: 'Objective', inventory: 'Inventory', xp: 'XP', key: 'Key', controls: 'WASD / arrows · E: interact · T: terminal', missionDone: 'Quest complete', locked: 'The gate is locked.', title: 'The Isle of Commits', newGame: 'New game', continueGame: 'Continue', settings: 'Settings', settingsTitle: 'SETTINGS', language: 'Language', touchControls: 'Touch controls', touchAuto: 'Automatic', touchAlways: 'Always show', audio: 'Audio', audioUnavailable: 'Music: reserved slot, no audio assets supplied.', back: 'Back', musicUnavailable: 'Music: reserved slot, no audio assets supplied.', journal: 'QUEST JOURNAL', terminalTitle: 'GITQUEST TERMINAL', terminalWelcome: 'GitQuest Terminal', terminalHelp: 'Help: git init · git add . · git commit -m "message" · git status', terminalHistoryEmpty: 'No command history.', saveError: 'The save could not be read; you can still start a new game.', mapLoadError: 'This map could not be loaded.', shrine: 'Git Shrine', gateOpened: '✦ Gate opened', keyReward: 'You obtained a passage key!', crystalReward: 'Memory crystal', xpReward: 'XP', stepTalk: 'Talk to Midou', stepInit: 'Run git init', stepKey: 'Find the key', stepExit: 'Open the gate', newGameConfirmTitle: 'New game', newGameConfirmMessage: 'The current save will be reset. Continue?', confirm: 'Confirm', cancel: 'Cancel', loadingTitle: 'Preparing the expedition', loadingMap: 'Loading the beach archives…', introTitle: 'The secret of the archives', introLine1: 'Midou: This island keeps the memory of every adventure.', introLine2: 'The Git archives were scattered across its six regions.', introLine3: 'Find them, learn the commands, and relight the gates.', startAdventure: 'Start the adventure', skip: 'Skip', retry: 'Retry', bootLoading: 'Loading the island…', bootLoadError: 'The island could not be loaded', assetMissing: 'Missing asset', victoryTitle: 'VICTORY!', victoryMessage: 'The Isle of Commits has been restored.', totalXp: 'Total XP', replay: 'Play again' },
  ar: { interact: 'تفاعل', objective: 'الهدف', inventory: 'الحقيبة', xp: 'نقاط الخبرة', key: 'المفتاح', controls: 'WASD / الأسهم · E: تفاعل · T: الطرفية', missionDone: 'اكتملت المهمة', locked: 'الباب مغلق.', title: 'جزيرة الالتزامات', newGame: 'لعبة جديدة', continueGame: 'متابعة', settings: 'الإعدادات', settingsTitle: 'الإعدادات', language: 'اللغة', touchControls: 'عناصر التحكم باللمس', touchAuto: 'تلقائي', touchAlways: 'إظهار دائمًا', audio: 'الصوت', audioUnavailable: 'الموسيقى: المكان محجوز، لا توجد ملفات صوتية.', back: 'رجوع', musicUnavailable: 'الموسيقى: المكان محجوز، لا توجد ملفات صوتية.', journal: 'سجل المهمة', terminalTitle: 'طرفية GITQUEST', terminalWelcome: 'طرفية GitQuest', terminalHelp: 'مساعدة: git init · git add . · git commit -m "رسالة" · git status', terminalHistoryEmpty: 'لا يوجد سجل للأوامر.', saveError: 'تعذرت قراءة الحفظ؛ يمكنك بدء لعبة جديدة.', mapLoadError: 'تعذر تحميل هذه الخريطة.', shrine: 'مزار Git', gateOpened: '✦ فُتحت البوابة', keyReward: 'حصلت على مفتاح العبور!', crystalReward: 'بلورة الذاكرة', xpReward: 'نقاط خبرة', stepTalk: 'تحدث مع ميدو', stepInit: 'نفّذ git init', stepKey: 'اعثر على المفتاح', stepExit: 'افتح البوابة', newGameConfirmTitle: 'لعبة جديدة', newGameConfirmMessage: 'ستتم إعادة تعيين الحفظ الحالي. هل تريد المتابعة؟', confirm: 'تأكيد', cancel: 'إلغاء', loadingTitle: 'الاستعداد للمغامرة', loadingMap: 'تحميل أرشيفات الشاطئ…', introTitle: 'سر الأرشيفات', introLine1: 'ميدو: تحتفظ هذه الجزيرة بذاكرة كل مغامرة.', introLine2: 'تفرقت أرشيفات Git في مناطق الجزيرة الست.', introLine3: 'اعثر عليها وتعلم الأوامر وأعد إشعال البوابات.', startAdventure: 'ابدأ المغامرة', skip: 'تخطٍ', retry: 'إعادة المحاولة', bootLoading: 'جارٍ تحميل الجزيرة…', bootLoadError: 'تعذر تحميل الجزيرة', assetMissing: 'أصل مفقود', victoryTitle: 'النصر!', victoryMessage: 'تمت استعادة جزيرة الالتزامات.', totalXp: 'إجمالي نقاط الخبرة', replay: 'العب مجددًا' },
};

export class I18nManager {
  public constructor(public locale: Locale = 'fr') {}
  public text(key: string): string { return TRANSLATIONS[this.locale][key] ?? TRANSLATIONS.fr[key] ?? key; }
  public localized(value: LocalizedText): string { return value[this.locale] ?? value.fr; }
  public get direction(): 'ltr' | 'rtl' { return this.locale === 'ar' ? 'rtl' : 'ltr'; }
  public stepLabel(id: string): string { return this.text({ 'talk-midou': 'stepTalk', 'run-init': 'stepInit', 'collect-key': 'stepKey', 'open-exit': 'stepExit' }[id] ?? id); }

  public gitMessage(message: string): string {
    const exact: Record<Locale, Record<string, string>> = {
      fr: {},
      en: {
        'Dépôt Git initialisé.': 'Git repository initialized.',
        'Le terminal attend une commande git.': 'The terminal expects a git command.',
        'fatal: pas un dépôt Git (utilise git init).': 'fatal: not a Git repository (use git init).',
        'Utilise git commit -m "ton message".': 'Use git commit -m "your message".',
        'Rien à valider : index vide.': 'Nothing to commit: staging area is empty.',
        'Aucun fichier correspondant.': 'No matching files.',
        'Impossible de fusionner une branche avec elle-même.': 'Cannot merge a branch into itself.',
      },
      ar: {
        'Dépôt Git initialisé.': 'تم تهيئة مستودع Git.',
        'Le terminal attend une commande git.': 'الطرفية تنتظر أمر Git.',
        'fatal: pas un dépôt Git (utilise git init).': 'خطأ: ليس مستودع Git (استخدم git init).',
        'Utilise git commit -m "ton message".': 'استخدم git commit -m "رسالتك".',
        'Rien à valider : index vide.': 'لا شيء لتثبيته: منطقة التجهيز فارغة.',
        'Aucun fichier correspondant.': 'لا توجد ملفات مطابقة.',
        'Impossible de fusionner une branche avec elle-même.': 'لا يمكن دمج الفرع مع نفسه.',
      },
    };
    const translated = exact[this.locale][message];
    if (translated) return translated;
    if (this.locale === 'fr') return message;
    const staged = message.match(/^Fichiers indexés : (.+)\.$/);
    if (staged) return this.locale === 'en' ? 'Staged files: ' + staged[1] + '.' : 'الملفات المجهزة: ' + staged[1] + '.';
    const branchCreated = message.match(/^Branche (.+) créée\.$/);
    if (branchCreated) return this.locale === 'en' ? 'Branch ' + branchCreated[1] + ' created.' : 'تم إنشاء الفرع ' + branchCreated[1] + '.';
    const switched = message.match(/^Bascule sur la branche « (.+) »\.$/);
    if (switched) return this.locale === 'en' ? 'Switched to branch "' + switched[1] + '".' : 'تم الانتقال إلى الفرع « ' + switched[1] + ' ».';
    const pushed = message.match(/^Branche (.+) envoyée vers origin\.$/);
    if (pushed) return this.locale === 'en' ? 'Branch ' + pushed[1] + ' pushed to origin.' : 'تم دفع الفرع ' + pushed[1] + ' إلى origin.';
    if (message === 'Déjà à jour avec origin.') return this.locale === 'en' ? 'Already up to date with origin.' : 'المستودع محدث بالفعل مع origin.';
    const status = message.match(/^Sur la branche (.+)\.$/);
    if (status) return this.locale === 'en' ? 'On branch ' + status[1] + '.' : 'أنت على الفرع ' + status[1] + '.';
    const unknownBranch = message.match(/^fatal: la branche (.+) existe déjà\.$/);
    if (unknownBranch) return this.locale === 'en' ? 'fatal: branch ' + unknownBranch[1] + ' already exists.' : 'خطأ: الفرع ' + unknownBranch[1] + ' موجود بالفعل.';
    const missingBranch = message.match(/^fatal: branche à fusionner inconnue\.$/);
    if (missingBranch) return this.locale === 'en' ? 'fatal: unknown branch to merge.' : 'خطأ: فرع الدمج غير معروف.';
    const merge = message.match(/^Fusion de (.+) dans (.+) terminée\.$/);
    if (merge) return this.locale === 'en' ? 'Merged ' + merge[1] + ' into ' + merge[2] + '.' : 'تم دمج ' + merge[1] + ' في ' + merge[2] + '.';
    return message;
  }
}
