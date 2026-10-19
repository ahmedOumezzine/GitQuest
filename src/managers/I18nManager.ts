import type { GitOperation, Locale, LocalizedText, QuestStepDefinition } from '../models/game';

export const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  fr: { interact: 'Interagir', terminalAction: 'Terminal', interactMidou: 'Parler à Midou', interactCrystal: 'Examiner le cristal', interactChest: 'Ouvrir le coffre', interactScroll: 'Lire le parchemin', interactGate: 'Examiner la porte', objective: 'Objectif', inventory: 'Inventaire', xp: 'XP', key: 'Clé', controls: 'ZQSD / flèches · E : interagir · T : terminal', missionDone: 'Mission validée', locked: 'La porte est verrouillée.', gateLocked: 'verrouillée', gateOpen: 'ouverte', title: 'L’île des commits', newGame: 'Nouvelle partie', continueGame: 'Continuer', settings: 'Paramètres', settingsTitle: 'PARAMÈTRES', language: 'Langue', touchControls: 'Commandes tactiles', touchAuto: 'Automatique', touchAlways: 'Toujours afficher', audio: 'Audio', audioUnavailable: 'Musique indisponible (aucun asset fourni) · effets audio générés activés.', back: 'Retour', musicUnavailable: 'Musique indisponible (aucun asset fourni) · effets audio générés activés.', journal: 'JOURNAL DE MISSION', terminalTitle: 'GITQUEST TERMINAL', terminalWelcome: 'Terminal GitQuest', terminalHelp: 'Aide : git init · git add . · git commit -m "message" · git status', terminalHistoryEmpty: 'Aucun historique de commande.', saveError: 'La sauvegarde n’a pas pu être lue ; une nouvelle partie reste possible.', mapLoadError: 'Impossible de charger cette carte.', shrine: 'Sanctuaire Git', gateOpened: '✦ Porte ouverte', keyReward: 'Tu obtiens une clé de passage !', crystalReward: 'Cristal de mémoire', xpReward: 'XP', stepTalk: 'Parler à Midou', stepInit: 'Exécuter git init', stepAdd: 'Exécuter git add', stepCommit: 'Exécuter git commit', stepPush: 'Exécuter git push', stepPull: 'Exécuter git pull', stepBranch: 'Créer une branche', stepSwitch: 'Changer de branche', stepMerge: 'Fusionner une branche', stepKey: 'Trouver la clé', stepExit: 'Ouvrir la porte', guideTalk: 'Approche-toi de Midou puis appuie sur E pour lui parler.', guideGit: 'Ouvre le terminal avec T puis exécute la commande indiquée.', guideCollect: 'Explore la région et interagis avec le coffre pour récupérer la clé.', guideExit: 'Va jusqu’à la porte, puis appuie sur E pour accéder à la prochaine région.', guideComplete: 'Mission terminée ! Rejoins la porte de sortie.', nextObjective: 'Nouvel objectif', newGameConfirmTitle: 'Nouvelle partie', newGameConfirmMessage: 'La sauvegarde actuelle sera réinitialisée. Continuer ?', confirm: 'Confirmer', cancel: 'Annuler', loadingTitle: 'Préparation de l’expédition', loadingMap: 'Chargement des archives de la plage…', introTitle: 'Le secret des archives', introLine1: 'Midou : Cette île conserve la mémoire de chaque aventure.', introLine2: 'Les archives Git ont été dispersées dans ses six régions.', introLine3: 'Retrouve-les, apprends les commandes et rallume les portes.', startAdventure: 'Commencer l’aventure', skip: 'Passer', retry: 'Réessayer', bootLoading: 'Chargement de l’île…', bootLoadError: 'Impossible de charger l’île', assetMissing: 'Asset manquant', victoryTitle: 'VICTOIRE !', victoryMessage: 'L’île des commits est restaurée.', totalXp: 'XP totale', replay: 'Rejouer' },
  en: { interact: 'Interact', terminalAction: 'Terminal', interactMidou: 'Talk to Midou', interactCrystal: 'Inspect the crystal', interactChest: 'Open the chest', interactScroll: 'Read the scroll', interactGate: 'Inspect the gate', objective: 'Objective', inventory: 'Inventory', xp: 'XP', key: 'Key', controls: 'WASD / arrows · E: interact · T: terminal', missionDone: 'Quest complete', locked: 'The gate is locked.', gateLocked: 'locked', gateOpen: 'open', title: 'The Isle of Commits', newGame: 'New game', continueGame: 'Continue', settings: 'Settings', settingsTitle: 'SETTINGS', language: 'Language', touchControls: 'Touch controls', touchAuto: 'Automatic', touchAlways: 'Always show', audio: 'Audio', audioUnavailable: 'Music unavailable (no asset supplied) · generated effects enabled.', back: 'Back', musicUnavailable: 'Music unavailable (no asset supplied) · generated effects enabled.', journal: 'QUEST JOURNAL', terminalTitle: 'GITQUEST TERMINAL', terminalWelcome: 'GitQuest Terminal', terminalHelp: 'Help: git init · git add . · git commit -m "message" · git status', terminalHistoryEmpty: 'No command history.', saveError: 'The save could not be read; you can still start a new game.', mapLoadError: 'This map could not be loaded.', shrine: 'Git Shrine', gateOpened: '✦ Gate opened', keyReward: 'You obtained a passage key!', crystalReward: 'Memory crystal', xpReward: 'XP', stepTalk: 'Talk to Midou', stepInit: 'Run git init', stepAdd: 'Run git add', stepCommit: 'Run git commit', stepPush: 'Run git push', stepPull: 'Run git pull', stepBranch: 'Create a branch', stepSwitch: 'Switch branch', stepMerge: 'Merge a branch', stepKey: 'Find the key', stepExit: 'Open the gate', guideTalk: 'Move close to Midou and press E to talk.', guideGit: 'Open the terminal with T, then run the command shown.', guideCollect: 'Explore the region and interact with the chest to retrieve the key.', guideExit: 'Walk to the gate, then press E to enter the next region.', guideComplete: 'Quest complete! Head to the exit gate.', nextObjective: 'New objective', newGameConfirmTitle: 'New game', newGameConfirmMessage: 'The current save will be reset. Continue?', confirm: 'Confirm', cancel: 'Cancel', loadingTitle: 'Preparing the expedition', loadingMap: 'Loading the beach archives…', introTitle: 'The secret of the archives', introLine1: 'Midou: This island keeps the memory of every adventure.', introLine2: 'The Git archives were scattered across its six regions.', introLine3: 'Find them, learn the commands, and relight the gates.', startAdventure: 'Start the adventure', skip: 'Skip', retry: 'Retry', bootLoading: 'Loading the island…', bootLoadError: 'The island could not be loaded', assetMissing: 'Missing asset', victoryTitle: 'VICTORY!', victoryMessage: 'The Isle of Commits has been restored.', totalXp: 'Total XP', replay: 'Play again' },
  ar: { interact: 'تفاعل', terminalAction: 'الطرفية', interactMidou: 'تحدث مع ميدو', interactCrystal: 'افحص البلورة', interactChest: 'افتح الصندوق', interactScroll: 'اقرأ الرقعة', interactGate: 'افحص البوابة', objective: 'الهدف', inventory: 'الحقيبة', xp: 'نقاط الخبرة', key: 'المفتاح', controls: 'WASD / الأسهم · E: تفاعل · T: الطرفية', missionDone: 'اكتملت المهمة', locked: 'الباب مغلق.', gateLocked: 'مغلقة', gateOpen: 'مفتوحة', title: 'جزيرة الالتزامات', newGame: 'لعبة جديدة', continueGame: 'متابعة', settings: 'الإعدادات', settingsTitle: 'الإعدادات', language: 'اللغة', touchControls: 'عناصر التحكم باللمس', touchAuto: 'تلقائي', touchAlways: 'إظهار دائمًا', audio: 'الصوت', audioUnavailable: 'الموسيقى غير متاحة (لا توجد ملفات) · المؤثرات المولدة مفعلة.', back: 'رجوع', musicUnavailable: 'الموسيقى غير متاحة (لا توجد ملفات) · المؤثرات المولدة مفعلة.', journal: 'سجل المهمة', terminalTitle: 'طرفية GITQUEST', terminalWelcome: 'طرفية GitQuest', terminalHelp: 'مساعدة: git init · git add . · git commit -m "رسالة" · git status', terminalHistoryEmpty: 'لا يوجد سجل للأوامر.', saveError: 'تعذرت قراءة الحفظ؛ يمكنك بدء لعبة جديدة.', mapLoadError: 'تعذر تحميل هذه الخريطة.', shrine: 'مزار Git', gateOpened: '✦ فُتحت البوابة', keyReward: 'حصلت على مفتاح العبور!', crystalReward: 'بلورة الذاكرة', xpReward: 'نقاط خبرة', stepTalk: 'تحدث مع ميدو', stepInit: 'نفّذ git init', stepAdd: 'نفّذ git add', stepCommit: 'نفّذ git commit', stepPush: 'نفّذ git push', stepPull: 'نفّذ git pull', stepBranch: 'أنشئ فرعًا', stepSwitch: 'بدّل الفرع', stepMerge: 'ادمج فرعًا', stepKey: 'اعثر على المفتاح', stepExit: 'افتح البوابة', guideTalk: 'اقترب من ميدو واضغط E للتحدث معه.', guideGit: 'افتح الطرفية بالضغط على T ثم نفّذ الأمر الظاهر.', guideCollect: 'استكشف المنطقة وتفاعل مع الصندوق للحصول على المفتاح.', guideExit: 'توجه إلى البوابة واضغط E للانتقال إلى المنطقة التالية.', guideComplete: 'اكتملت المهمة! توجه إلى بوابة الخروج.', nextObjective: 'هدف جديد', newGameConfirmTitle: 'لعبة جديدة', newGameConfirmMessage: 'ستتم إعادة تعيين الحفظ الحالي. هل تريد المتابعة؟', confirm: 'تأكيد', cancel: 'إلغاء', loadingTitle: 'الاستعداد للمغامرة', loadingMap: 'تحميل أرشيفات الشاطئ…', introTitle: 'سر الأرشيفات', introLine1: 'ميدو: تحتفظ هذه الجزيرة بذاكرة كل مغامرة.', introLine2: 'تفرقت أرشيفات Git في مناطق الجزيرة الست.', introLine3: 'اعثر عليها وتعلم الأوامر وأعد إشعال البوابات.', startAdventure: 'ابدأ المغامرة', skip: 'تخطٍ', retry: 'إعادة المحاولة', bootLoading: 'جارٍ تحميل الجزيرة…', bootLoadError: 'تعذر تحميل الجزيرة', assetMissing: 'أصل مفقود', victoryTitle: 'النصر!', victoryMessage: 'تمت استعادة جزيرة الالتزامات.', totalXp: 'إجمالي نقاط الخبرة', replay: 'العب مجددًا' },
};

const EXTRA_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  fr: {
    secretReward: 'Secret découvert', secretShortcut: 'Passage secret découvert.', tapInteract: 'Touchez pour agir', studied: 'Git étudié', level: 'Niv.', guideGit: 'Approche-toi du sanctuaire Git, ouvre le terminal avec T puis exécute la commande indiquée.', terminalHint: 'Sanctuaire Git · appuyez sur T pour ouvrir', terminalNeedShrine: 'Approche-toi d’un sanctuaire Git pour ouvrir le terminal.', compass: 'Boussole', compassTerminal: 'Terminal · T', compassObject: 'Point d’intérêt', discoveries: 'Découvertes', minimap: 'Carte', minimapLegend: '● toi  ● Midou  ● sortie',
  },
  en: {
    secretReward: 'Secret discovered', secretShortcut: 'Secret passage discovered.', tapInteract: 'Tap to interact', studied: 'Git studied', level: 'Lv.', guideGit: 'Move to the Git shrine, open the terminal with T, then run the command shown.', terminalHint: 'Git Shrine · press T to open', terminalNeedShrine: 'Move to a Git shrine to open the terminal.', compass: 'Compass', compassTerminal: 'Terminal · T', compassObject: 'Point of interest', discoveries: 'Discoveries', minimap: 'Map', minimapLegend: '● you  ● Midou  ● exit',
  },
  ar: {
    secretReward: 'تم اكتشاف سر', secretShortcut: 'تم اكتشاف ممر سري.', tapInteract: 'اضغط للتفاعل', studied: 'أوامر Git المدروسة', level: 'المستوى', guideGit: 'اقترب من مزار Git، وافتح الطرفية بالضغط على T ثم نفّذ الأمر الظاهر.', terminalHint: 'مزار Git · اضغط T للفتح', terminalNeedShrine: 'اقترب من مزار Git لفتح الطرفية.', compass: 'البوصلة', compassTerminal: 'الطرفية · T', compassObject: 'نقطة اهتمام', discoveries: 'الاكتشافات', minimap: 'الخريطة', minimapLegend: '● أنت  ● ميدو  ● الخروج',
  },
};

const INTRO_DIALOGUE: Record<Locale, Record<string, string>> = {
  fr: {
    introLine4: 'Commence sur la Plage des Origines : je serai à tes côtés.',
    introNext: 'Suivant',
    introPage: 'Page',
  },
  en: {
    introLine4: 'Begin at the Beach of Origins. I will be at your side.',
    introNext: 'Next',
    introPage: 'Page',
  },
  ar: {
    introLine4: 'ابدأ من شاطئ الأصول، وسأكون إلى جانبك.',
    introNext: 'التالي',
    introPage: 'الصفحة',
  },
};

const WORLD_UI_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  fr: {
    midouName: 'Midou',
    professorOctoName: 'Professeur Octo',
    professorOctoInteract: 'Suivre le cours avec Octo',
    courseLessonTitle: 'Leçon 1 — git init',
    coursePrevious: 'Précédent',
    courseNext: 'Suivant',
    courseFinish: 'Terminer',
    courseClose: 'Fermer',
    courseCommandLabel: 'Commande',
    courseExampleLabel: 'Exemple de résultat',
    coursePractice: 'Aller pratiquer',
    coursePracticeHint: 'Quand tu es prêt, rejoins le Sanctuaire Git pour pratiquer git init.',
    coursePage1Title: 'Ta première aventure avec Git',
    coursePage1Text: 'Git aide à suivre l’évolution d’un projet et à conserver son historique. Chaque étape importante de ton aventure peut ainsi rester dans les archives.',
    coursePage2Title: 'Qu’est-ce qu’un dépôt Git ?',
    coursePage2Text: 'Un dépôt Git est un dossier de projet dans lequel Git peut suivre les changements. Imagine un journal de bord de ton aventure : Git t’aidera à conserver les étapes importantes.',
    coursePage3Title: 'À quoi sert git init ?',
    coursePage3Text: 'git init initialise un dépôt Git dans le dossier courant. La commande prépare Git à suivre le projet, mais elle ne crée pas encore de commit.',
    coursePage4Title: 'Que se passe-t-il après ?',
    coursePage4Text: 'Git crée un dossier caché .git pour stocker les données et la configuration du dépôt. Les fichiers du projet ne sont pas automatiquement enregistrés dans un commit.',
    coursePage5Title: 'Exemple concret',
    coursePage5Text: 'Voici un petit exemple de parcours, présenté comme une démonstration :',
    coursePage5Steps: '1. Je crée un dossier pour mon jeu.\n2. J’ouvre un terminal dans ce dossier.\n3. Je tape git init.\n4. Git initialise le dépôt.',
    coursePage5Result: '$ git init\nExemple : dépôt Git initialisé dans ce dossier.',
    coursePage6Title: 'À toi de jouer !',
    coursePage6Text: 'Tu connais maintenant git init. Va au Sanctuaire Git et saisis cette commande dans le terminal pour initialiser ton dépôt !',
    quizOpen: 'Tester mes connaissances',
    quizTitle: 'Test de connaissances',
    quizQuestionLabel: 'Question',
    quizQuestion1: 'À quoi sert git init ?',
    quizQuestion1A: 'A. Envoyer les fichiers sur GitHub.',
    quizQuestion1B: 'B. Initialiser un dépôt Git dans le dossier courant.',
    quizQuestion1C: 'C. Supprimer l’historique du projet.',
    quizQuestion1Correct: 'Bonne réponse ! git init initialise un dépôt Git dans le dossier courant.',
    quizQuestion1Incorrect: 'Pas encore. git init prépare un dépôt Git dans le dossier courant ; il n’envoie rien sur GitHub et ne supprime pas l’historique.',
    quizQuestion2: 'Que crée généralement git init ?',
    quizQuestion2A: 'A. Un dossier .git.',
    quizQuestion2B: 'B. Un commit automatique.',
    quizQuestion2C: 'C. Une branche distante sur GitHub.',
    quizQuestion2Correct: 'Bonne réponse ! Git crée généralement un dossier .git pour les données du dépôt.',
    quizQuestion2Incorrect: 'Pas encore. git init crée généralement un dossier .git ; il ne crée pas de commit ni de branche distante.',
    quizQuestion3: 'Après git init, les fichiers sont-ils déjà enregistrés dans un commit ?',
    quizQuestion3A: 'A. Oui, automatiquement.',
    quizQuestion3B: 'B. Non, il faut encore préparer et enregistrer les changements.',
    quizQuestion3C: 'C. Oui, mais seulement sur GitHub.',
    quizQuestion3Correct: 'Bonne réponse ! Les fichiers doivent encore être préparés puis enregistrés dans un commit.',
    quizQuestion3Incorrect: 'Pas encore. git init ne crée pas de commit ; il faut ensuite préparer et enregistrer les changements.',
    quizCorrect: 'Réponse correcte',
    quizIncorrect: 'Réponse incorrecte',
    quizContinue: 'Suivant',
    quizSeeResult: 'Voir le résultat',
    quizScore: 'Score',
    quizExcellent: 'Excellent ! Tu es prêt à initialiser ton premier dépôt.',
    quizGood: 'Bien joué ! Relis les explications si tu veux consolider tes connaissances.',
    quizZero: 'Chaque expert a commencé quelque part. Octo peut reprendre la leçon avec toi.',
    quizReview: 'Revoir la leçon',
    quizRetry: 'Réessayer le quiz',
    quizPractice: 'Aller pratiquer',
    gateName: 'Porte des archives',
    gateLockedHint: 'La porte restera fermée jusqu’à la mission validée et la clé de passage.',
  },
  en: {
    midouName: 'Midou',
    professorOctoName: 'Professor Octo',
    professorOctoInteract: 'Study with Octo',
    courseLessonTitle: 'Lesson 1 — git init',
    coursePrevious: 'Previous',
    courseNext: 'Next',
    courseFinish: 'Finish',
    courseClose: 'Close',
    courseCommandLabel: 'Command',
    courseExampleLabel: 'Example output',
    coursePractice: 'Go practice',
    coursePracticeHint: 'When you are ready, head to the Git Shrine to practice git init.',
    coursePage1Title: 'Your first adventure with Git',
    coursePage1Text: 'Git helps you track a project’s evolution and keep its history. That way, every important step of your adventure can stay in the archives.',
    coursePage2Title: 'What is a Git repository?',
    coursePage2Text: 'A Git repository is a project folder where Git can track changes. Imagine a logbook for your adventure: Git will help you keep its important milestones.',
    coursePage3Title: 'What does git init do?',
    coursePage3Text: 'git init initializes a Git repository in the current folder. It prepares Git to track the project, but it does not create a commit yet.',
    coursePage4Title: 'What happens next?',
    coursePage4Text: 'Git creates a hidden .git folder to store the repository data and configuration. Project files are not automatically recorded in a commit.',
    coursePage5Title: 'A concrete example',
    coursePage5Text: 'Here is a small example flow, shown as a demonstration:',
    coursePage5Steps: '1. I create a folder for my game.\n2. I open a terminal in that folder.\n3. I type git init.\n4. Git initializes the repository.',
    coursePage5Result: '$ git init\nExample: Git repository initialized in this folder.',
    coursePage6Title: 'Your turn to play!',
    coursePage6Text: 'You now know git init. Go to the Git Shrine and enter this command in the terminal to initialize your repository!',
    quizOpen: 'Test my knowledge',
    quizTitle: 'Knowledge check',
    quizQuestionLabel: 'Question',
    quizQuestion1: 'What is git init used for?',
    quizQuestion1A: 'A. Send files to GitHub.',
    quizQuestion1B: 'B. Initialize a Git repository in the current folder.',
    quizQuestion1C: 'C. Delete the project history.',
    quizQuestion1Correct: 'Correct! git init initializes a Git repository in the current folder.',
    quizQuestion1Incorrect: 'Not quite. git init prepares a Git repository in the current folder; it does not send files to GitHub or delete history.',
    quizQuestion2: 'What does git init usually create?',
    quizQuestion2A: 'A. A .git folder.',
    quizQuestion2B: 'B. An automatic commit.',
    quizQuestion2C: 'C. A remote branch on GitHub.',
    quizQuestion2Correct: 'Correct! Git usually creates a .git folder for repository data.',
    quizQuestion2Incorrect: 'Not quite. git init usually creates a .git folder; it does not create a commit or a remote branch.',
    quizQuestion3: 'After git init, are the files already recorded in a commit?',
    quizQuestion3A: 'A. Yes, automatically.',
    quizQuestion3B: 'B. No, changes still need to be prepared and recorded.',
    quizQuestion3C: 'C. Yes, but only on GitHub.',
    quizQuestion3Correct: 'Correct! Files still need to be prepared and recorded in a commit.',
    quizQuestion3Incorrect: 'Not quite. git init does not create a commit; changes must still be prepared and recorded.',
    quizCorrect: 'Correct answer',
    quizIncorrect: 'Incorrect answer',
    quizContinue: 'Next',
    quizSeeResult: 'See results',
    quizScore: 'Score',
    quizExcellent: 'Excellent! You are ready to initialize your first repository.',
    quizGood: 'Well done! Review the explanations if you want to strengthen your knowledge.',
    quizZero: 'Every expert started somewhere. Octo can review the lesson with you.',
    quizReview: 'Review the lesson',
    quizRetry: 'Retry the quiz',
    quizPractice: 'Go practice',
    gateName: 'Archive Gate',
    gateLockedHint: 'The gate stays closed until the quest is complete and you have the passage key.',
  },
  ar: {
    midouName: 'ميدو',
    professorOctoName: 'الأستاذ أوكتو',
    professorOctoInteract: 'تعلّم مع أوكتو',
    courseLessonTitle: 'الدرس 1 — git init',
    coursePrevious: 'السابق',
    courseNext: 'التالي',
    courseFinish: 'إنهاء',
    courseClose: 'إغلاق',
    courseCommandLabel: 'الأمر',
    courseExampleLabel: 'نتيجة مثال',
    coursePractice: 'اذهب للتدريب',
    coursePracticeHint: 'عندما تكون مستعدًا، توجّه إلى مزار Git لتجربة git init.',
    coursePage1Title: 'مغامرتك الأولى مع Git',
    coursePage1Text: 'يساعدك Git على تتبع تطور المشروع والاحتفاظ بسجله. وهكذا تبقى كل خطوة مهمة من مغامرتك محفوظة في الأرشيف.',
    coursePage2Title: 'ما هو مستودع Git؟',
    coursePage2Text: 'مستودع Git هو مجلد مشروع يستطيع Git تتبع تغييراته. تخيله كسجل رحلة لمغامرتك: سيساعدك Git على حفظ مراحلها المهمة.',
    coursePage3Title: 'ما فائدة git init؟',
    coursePage3Text: 'يهيّئ git init مستودع Git داخل المجلد الحالي. يجهّز الأمر Git لتتبع المشروع، لكنه لا ينشئ commit بعد.',
    coursePage4Title: 'ماذا يحدث بعد ذلك؟',
    coursePage4Text: 'ينشئ Git مجلدًا مخفيًا اسمه .git لتخزين بيانات المستودع وإعداداته. لا تُسجّل ملفات المشروع تلقائيًا في commit.',
    coursePage5Title: 'مثال عملي',
    coursePage5Text: 'إليك مسارًا صغيرًا كمثال توضيحي:',
    coursePage5Steps: '1. أنشئ مجلدًا للعبتي.\n2. افتح طرفية داخل هذا المجلد.\n3. اكتب git init.\n4. يهيّئ Git المستودع.',
    coursePage5Result: '$ git init\nمثال: تم تهيئة مستودع Git داخل هذا المجلد.',
    coursePage6Title: 'حان دورك!',
    coursePage6Text: 'أصبحت تعرف الآن git init. توجّه إلى مزار Git واكتب هذا الأمر في الطرفية لتهيئة مستودعك!',
    quizOpen: 'اختبر معلوماتي',
    quizTitle: 'اختبر معلوماتك',
    quizQuestionLabel: 'السؤال',
    quizQuestion1: 'ما فائدة git init؟',
    quizQuestion1A: 'أ. إرسال الملفات إلى GitHub.',
    quizQuestion1B: 'ب. تهيئة مستودع Git في المجلد الحالي.',
    quizQuestion1C: 'ج. حذف سجل المشروع.',
    quizQuestion1Correct: 'إجابة صحيحة! يهيّئ git init مستودع Git في المجلد الحالي.',
    quizQuestion1Incorrect: 'ليس بعد. يجهّز git init مستودع Git في المجلد الحالي؛ ولا يرسل الملفات إلى GitHub ولا يحذف السجل.',
    quizQuestion2: 'ماذا ينشئ git init عادةً؟',
    quizQuestion2A: 'أ. مجلدًا اسمه .git.',
    quizQuestion2B: 'ب. commit تلقائيًا.',
    quizQuestion2C: 'ج. فرعًا بعيدًا على GitHub.',
    quizQuestion2Correct: 'إجابة صحيحة! ينشئ Git عادةً مجلدًا اسمه .git لبيانات المستودع.',
    quizQuestion2Incorrect: 'ليس بعد. ينشئ git init عادةً مجلدًا اسمه .git؛ ولا ينشئ commit أو فرعًا بعيدًا.',
    quizQuestion3: 'بعد git init، هل سُجّلت الملفات بالفعل داخل commit؟',
    quizQuestion3A: 'أ. نعم، تلقائيًا.',
    quizQuestion3B: 'ب. لا، يجب تجهيز التغييرات وتسجيلها بعد ذلك.',
    quizQuestion3C: 'ج. نعم، ولكن على GitHub فقط.',
    quizQuestion3Correct: 'إجابة صحيحة! يجب تجهيز الملفات ثم تسجيلها داخل commit.',
    quizQuestion3Incorrect: 'ليس بعد. لا ينشئ git init commit؛ يجب تجهيز التغييرات وتسجيلها بعد ذلك.',
    quizCorrect: 'إجابة صحيحة',
    quizIncorrect: 'إجابة غير صحيحة',
    quizContinue: 'التالي',
    quizSeeResult: 'عرض النتيجة',
    quizScore: 'النتيجة',
    quizExcellent: 'ممتاز! أنت مستعد لتهيئة أول مستودع لك.',
    quizGood: 'أحسنت! راجع الشروحات إذا أردت تثبيت معلوماتك.',
    quizZero: 'بدأ كل خبير من مكان ما. يستطيع أوكتو مراجعة الدرس معك.',
    quizReview: 'مراجعة الدرس',
    quizRetry: 'إعادة الاختبار',
    quizPractice: 'اذهب للتدريب',
    gateName: 'بوابة الأرشيف',
    gateLockedHint: 'ستبقى البوابة مغلقة حتى تكتمل المهمة وتحصل على مفتاح العبور.',
  },
};

export class I18nManager {
  public constructor(public locale: Locale = 'fr') {}
  public text(key: string): string { return EXTRA_TRANSLATIONS[this.locale][key] ?? TRANSLATIONS[this.locale][key] ?? INTRO_DIALOGUE[this.locale][key] ?? WORLD_UI_TRANSLATIONS[this.locale][key] ?? EXTRA_TRANSLATIONS.fr[key] ?? TRANSLATIONS.fr[key] ?? INTRO_DIALOGUE.fr[key] ?? WORLD_UI_TRANSLATIONS.fr[key] ?? key; }
  public localized(value: LocalizedText): string { return value[this.locale] ?? value.fr; }
  public get direction(): 'ltr' | 'rtl' { return this.locale === 'ar' ? 'rtl' : 'ltr'; }
  public applyDirection(surface?: HTMLElement): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = this.locale;
      document.documentElement.dir = this.direction;
    }
    surface?.setAttribute('dir', this.direction);
  }
  public stepLabel(id: string): string {
    return this.text({
      'talk-midou': 'stepTalk', 'run-init': 'stepInit', 'run-add': 'stepAdd', 'run-commit': 'stepCommit',
      'run-push': 'stepPush', 'run-pull': 'stepPull', 'run-branch': 'stepBranch', 'run-switch': 'stepSwitch',
      'run-merge': 'stepMerge', 'collect-key': 'stepKey', 'open-exit': 'stepExit',
    }[id] ?? id);
  }

  public interactionHint(kind?: string, touch = false): string {
    const key = kind === 'mentor' ? 'interactMidou' : kind === 'professor-octo' ? 'professorOctoInteract' : kind === 'crystal' ? 'interactCrystal' : kind === 'chest' ? 'interactChest' : kind === 'scroll' ? 'interactScroll' : kind === 'shortcut' ? 'secretShortcut' : kind === 'gate' ? 'interactGate' : 'interact';
    return this.text(key) + ' · ' + (touch ? this.text('tapInteract') : 'E');
  }

  public commandHint(operation?: GitOperation): string {
    if (!operation) return this.text('terminalHelp');
    const command: Record<GitOperation, string> = {
      init: 'git init',
      add: 'git add .',
      commit: 'git commit -m "message"',
      push: 'git push',
      pull: 'git pull',
      branch: 'git branch feature',
      switch: 'git switch feature',
      merge: 'git merge main',
    };
    const next = command[operation];
    if (this.locale === 'en') return 'Next step: run ' + next + '.';
    if (this.locale === 'ar') return 'الخطوة التالية: نفّذ ' + next + '.';
    return 'Étape suivante : exécute ' + next + '.';
  }

  public gitCommand(operation: GitOperation): string {
    return {
      init: 'git init', add: 'git add .', commit: 'git commit -m "message"', push: 'git push', pull: 'git pull',
      branch: 'git branch feature', switch: 'git switch feature', merge: 'git merge main',
    }[operation];
  }

  /**
   * Returns the concrete action the player can take now. The quest definition
   * remains the source of truth; this only turns its current step into a
   * localized, player-facing instruction.
   */
  public objectiveGuidance(step?: QuestStepDefinition): string {
    if (!step) return this.text('guideComplete');
    if (step.kind === 'dialogue') return this.text('guideTalk');
    if (step.kind === 'git-command') return this.text('guideGit');
    if (step.kind === 'collect') return this.text('guideCollect');
    return this.text('guideExit');
  }

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
