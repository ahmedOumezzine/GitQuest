# GitQuest — Audit UI contre les références

Date : 18 octobre 2026  
Périmètre : interfaces Phaser 3, desktop et mobile, avec validations runtime et
corrections ciblées du harnais QA

## Références examinées

- `docs/references/gitquest-menu-reference.png`
- `docs/references/gitquest-flow-reference.png`
- `docs/references/gitquest-ui-complete.png`
- Captures locales disponibles dans `docs/captures/`

Les références sont des planches de direction artistique. Elles décrivent une
composition cible, mais ne constituent pas des captures runtime exactes. Les
critères ci-dessous distinguent donc la conformité fonctionnelle, la proximité
de composition et la fidélité artistique.

## Verdict global

L’interface est stable et jouable, mais la conformité visuelle est hétérogène.
Le menu et le niveau 1 possèdent maintenant une identité pixel art cohérente.
Les écrans secondaires restent plus proches d’un prototype fonctionnel que de
la planche UI complète.

| Surface | Fonctionnement | Proximité visuelle | État |
|---|---|---|---|
| Menu principal | Correct | Bonne, mais composition différente | Partiel |
| Paramètres | Correct | Panneau lisible, moins riche que la référence | Partiel |
| Chargement | Progression réelle | Décor et hiérarchie simplifiés | Partiel |
| Introduction | Pages, Passer, Midou, transition | Dialogue RPG présent, composition encore différente | Partiel |
| Niveau 1 / HUD | Jouable et responsive | Structure proche, carte encore différente | Partiel |
| Terminal Git | Commandes, espaces, historique | Moins détaillé que la référence | Partiel |
| Inventaire | Barre compacte fonctionnelle | Écran d’inventaire complet absent | À améliorer |
| Journal | Panneau fonctionnel | Hiérarchie et navigation moins riches | Partiel |
| Contrôles mobiles | Fonctionnels | Forme et placement différents de la référence | Partiel |
| Victoire | Navigation correcte | Composition tropicale et carte de récompense ajoutées | Partiel |

## 1. Menu principal

### Correct

- Logo local, sous-titre localisé et vrais boutons interactifs.
- Décor tropical avec océan, coucher de soleil, phare, végétation et
  personnages.
- Sélecteur FR/EN/AR et navigation vers Nouvelle partie, Continuer et
  Paramètres.
- Mise en page responsive via `ResponsiveLayoutManager`.

### Écarts observés

- La composition actuelle est une illustration plein écran différente de la
  composition de la référence : proportions du logo, personnages, coffre et
  position du phare ne coïncident pas exactement.
- Le bouton Continuer dépend correctement de l’existence d’une sauvegarde, mais
  la planche de référence montre toujours les trois boutons.
- Les états hover/press sont fonctionnels, mais moins détaillés que les états
  pixel art de la référence.

### Fichiers concernés

- `src/scenes/TitleScene.ts`
- `src/ui/MainMenu.ts`
- `src/ui/PixelButton.ts`
- `src/ui/theme/UITheme.ts`

## 2. Paramètres

### Correct

- Le panneau est séparé du menu par un dimmer et reste centré.
- Les langues FR/EN/AR, le mode tactile et le bouton Retour sont interactifs.
- L’arabe applique la direction RTL.
- L’audio indisponible est indiqué honnêtement ; aucun faux volume n’est
  présenté comme fonctionnel.

### Écarts observés

- La référence présente un panneau plus riche avec icônes, catégories et
  interrupteurs visuels. Le panneau actuel est principalement textuel.
- L’audio ne possède pas encore de contrôle réel. C’est une limitation assumée,
  pas une fonctionnalité à simuler.
- La hiérarchie des séparateurs et des contrôles est correcte mais moins proche
  de la bordure pixel art de la référence.
- La validation RTL doit rester manuelle sur les trois tailles, en particulier
  les boutons de langue et le texte d’état audio.

### Fichiers concernés

- `src/ui/SettingsPanel.ts`
- `src/scenes/TitleScene.ts`
- `src/ui/layout/ResponsiveLayoutManager.ts`

## 3. Chargement et introduction

### Correct

- Le chargement utilise la progression réelle de Phaser.
- Les erreurs d’assets affichent un écran de reprise au lieu de laisser un écran
  bloqué.
- L’introduction possède plusieurs pages, Midou, Suivant, Passer et une
  transition vers le niveau 1.
- L’objectif `talk-midou` n’est pas validé pendant l’introduction.

### Écarts observés

- La référence de chargement possède une carte narrative plus riche avec astuce
  Git, pourcentage et composition plus intégrée au décor.
- L’introduction utilise déjà une boîte de dialogue et un portrait, mais le
  cadre, le nom du personnage et les contrôles restent moins proches de la
  planche UI complète.
- La version arabe doit être vérifiée sur chaque page, notamment l’alignement du
  portrait, du texte et des boutons empilés.

### Fichiers concernés

- `src/scenes/NewGameScene.ts`
- `src/ui/IntroDialogue.ts`
- `src/managers/I18nManager.ts`

## 4. Niveau 1 et HUD

### Correct

- Objectif, XP, inventaire et contrôles tactiles sont visibles sans masquer le
  jeu.
- Le HUD compact du niveau 1 est maintenant proche de la structure de la
  référence : objectif à gauche, XP/inventaire à droite.
- Le niveau 1 possède un vrai terrain Tiled, une plage, un littoral, des
  personnages animés, un sanctuaire, une porte et des éléments de premier plan.
- Les collisions et la progression ne dépendent pas des éléments purement
  décoratifs.

### Écarts observés

- La carte actuelle reste plus ouverte et plus quadrillée que la référence.
- Le sanctuaire est plus central et plus imposant.
- Le joueur et Midou apparaissent plus près du bord gauche dans certaines vues.
- Le littoral et les micro-détails ne forment pas encore une composition aussi
  dense que la planche de référence.
- Le journal et l’inventaire sont surtout des panneaux HUD, alors que la
  référence montre des interfaces plus complètes.

### Fichiers concernés

- `src/scenes/WorldScene.ts`
- `src/scenes/UIScene.ts`
- `src/ui/hud/QuestTracker.ts`
- `src/ui/hud/XPBar.ts`
- `src/ui/hud/InventoryBar.ts`
- `src/ui/hud/ResponsivePanel.ts`
- `public/data/maps/level-01.json`

## 5. Terminal Git

### Correct

- Ouverture par `T`, fermeture par Échap, saisie clavier et saisie tactile via
  champ DOM synchronisé.
- Les espaces, l’historique et les commandes Git sont conservés.
- Le terminal est localisé et utilise l’état réel de `GitSimulator`.

### Écarts observés

- La référence possède un terminal plus riche : barre de titre plus travaillée,
  boutons de fenêtre, cartouche de résultat, raccourcis visibles et contraste
  plus proche d’un terminal de jeu commercial.
- Le terminal actuel reste un panneau fonctionnel à bordure Phaser avec une
  ligne d’aide plus sobre.
- Sur mobile, la taille utile du champ et la lisibilité doivent être revérifiées
  avec le clavier virtuel réel d’un téléphone, pas uniquement en émulation.

### Fichiers concernés

- `src/scenes/UIScene.ts`
- `src/systems/TerminalInputModel.ts`
- `src/managers/I18nManager.ts`

## 6. Inventaire et journal

### Correct

- La barre d’inventaire affiche les objets collectés et l’XP ne se répète pas.
- Le journal conserve les étapes et les états de quête.
- Les textes sont localisés.

### Évolution réalisée après l’audit

- `src/ui/hud/InventoryPanel.ts` ajoute une vue RPG dédiée avec grille d’objets,
  fond assombri, bordure dorée et fermeture par clic extérieur.
- `src/scenes/UIScene.ts` ouvre cette vue par clic sur la barre ou avec `I`,
  puis la ferme avec `I` ou `Échap`.
- La barre compacte reste visible pendant l’exploration ; aucune logique
  d’inventaire ni récompense n’a été modifiée.

### Écarts restants

- La référence montre une sélection et une description détaillée par objet ;
  la première version du panneau affiche encore une grille compacte.
- La référence du journal possède une navigation par chapitre, une liste
  sélectionnée et une zone de détail. Le journal actuel est plus simple.
- La sélection détaillée d’un objet et les descriptions pédagogiques restent
  à ajouter si l’on souhaite reproduire toute la planche de référence.

### Fichiers concernés

- `src/scenes/UIScene.ts`
- `src/ui/hud/InventoryBar.ts`
- `src/ui/hud/InventoryPanel.ts`
- `src/ui/hud/QuestTracker.ts`

## 7. Contrôles mobiles

### Correct

- Les contrôles peuvent être automatiques ou toujours visibles.
- Le joystick, `E` et `T` disposent de zones tactiles utilisables.
- Les contrôles restent dans les zones sûres et ne bloquent pas le terminal.

### Écarts observés

- La référence utilise un D-pad carré avec quatre directions, plus deux boutons
  nommés Interagir et Terminal.
- La version actuelle utilise un joystick circulaire et des boutons ronds. Elle
  est fonctionnelle, mais son langage visuel est différent.
- Les labels d’action pourraient être affichés sous les boutons en paysage sans
  recouvrir la carte.

### Fichiers concernés

- `src/phaser/InputManager.ts`
- `src/ui/layout/ResponsiveLayoutManager.ts`
- `src/scenes/UIScene.ts`

## 8. Victoire

### Correct

- L’écran est localisé et responsive.
- Le total XP est affiché.
- Le bouton Rejouer réinitialise la session et revient au niveau 1.

### Évolution réalisée après l’audit

- `src/scenes/VictoryScene.ts` réutilise maintenant les couches tropicales
  locales du menu : décor, premier plan et duo joueur/Midou.
- La scène possède une carte de récompense centrée, une hiérarchie lisible,
  une animation d’ambiance légère et une composition responsive.
- Le bouton `Rejouer` reste un vrai contrôle interactif et conserve la remise à
  zéro existante de la session.

### Écarts restants

- Il manque encore un résumé détaillé des six niveaux et une animation dédiée
  aux archives restaurées.
- La victoire reste une composition de réutilisation d’assets du menu, pas une
  illustration finale exclusive.

## Priorités recommandées

### P0 — lisibilité et cohérence

1. Stabiliser un système de métriques UI par écran au lieu de positions
   spécifiques dispersées.
2. Produire des captures runtime à jour des paramètres, du chargement, de
   l’introduction, du terminal, du journal et de la victoire dans les trois
   formats.
3. Vérifier FR/EN/AR et RTL sur chaque écran avec textes longs.

### P1 — proximité de la référence

1. Recomposer le niveau 1 autour d’un chemin visuel plus dense et d’un
   sanctuaire moins central.
2. Remplacer la barre inventaire par un écran d’inventaire RPG ouvrable.
3. Enrichir le journal avec sélection de chapitre et panneau de détail.
4. Harmoniser le terminal avec les cadres, boutons et cartouches de la
   référence.
5. Ajouter une version victoire illustrée.

### P2 — finition

1. Créer les états pixel art normal/survol/appui/désactivé de tous les boutons.
2. Ajouter les indicateurs mobiles conformes à la référence.
3. Ajouter une vraie politique d’assets et de licences avant distribution.
4. Mesurer les performances après enrichissement des scènes.

## Critères d’acceptation proposés

- Chaque écran de la planche `gitquest-ui-complete.png` possède une capture
  runtime correspondante.
- Aucun écran ne présente de chevauchement en 1280×720, 844×390 ou 390×844.
- Les textes FR/EN/AR restent lisibles ; l’arabe est aligné RTL sans débordement.
- Le terminal accepte les espaces et conserve sa validation Git réelle.
- Le niveau 1 conserve son parcours complet après chaque changement UI.
- L’inventaire et le journal possèdent une interaction dédiée et une capture
  correspondant aux panneaux de référence.
- Les tests automatisés et le QA navigateur couvrent les écrans et les
  résolutions réellement annoncés.

## Limites de cet audit

Cet audit ne déclare pas les écrans secondaires artistiquement terminés. Les
conclusions visuelles s’appuient sur les références présentes, les captures
locales disponibles et la lecture des composants Phaser. Les écrans terminal,
journal et inventaire disposent maintenant de captures runtime dédiées ; une
validation sur appareil mobile physique reste recommandée.

## Continuation validée — écran de victoire

Fichiers modifiés :

- `src/scenes/VictoryScene.ts`
- `docs/UI_REFERENCE_AUDIT.md`

Captures runtime produites :

- `docs/captures/victory-audit-1280x720.png`
- `docs/captures/victory-audit-390x844.png`

Vérifications :

- `npm test` : 51/51 réussis.
- `npm run typecheck` : réussi.
- `npm run build` : réussi ; warning Phaser sur la taille du chunk conservé.
- QA navigateur victoire : PASS en 1280×720 et 390×844.

La QA responsive 844×390 et la comparaison visuelle détaillée des écrans
terminal, inventaire et journal restent à réaliser avant de considérer toute
la planche UI comme certifiée.

La vue d’inventaire possède désormais une capture runtime dédiée :
`docs/captures/inventory-audit-1280x720.png`.

## Continuation validée — inventaire RPG

Vérifications supplémentaires :

- Ouverture réelle par la touche `I` : PASS.
- Fermeture réelle par `I` : PASS.
- Capture niveau 1 en 1280×720 : PASS.
- Tests : 51/51, typecheck et build : PASS.
- QA niveau 1 avec FPS : PASS, 57 FPS lors de la capture.

## Continuation validée — journal de quête

Fichiers modifiés :

- `src/scenes/UIScene.ts`
- `scripts/browser-smoke.mjs`

Améliorations visibles :

- progression de mission `terminées/total` ;
- liste hiérarchisée avec états terminé, actif et en attente ;
- détail de l’objectif courant et aide de commande Git ;
- support RTL et fermeture par `J` ;
- capture runtime : `docs/captures/journal-audit-1280x720.png`.

Vérifications :

- ouverture et fermeture réelles dans Chrome : PASS ;
- niveau 1 rendu avec FPS : PASS, 46,23 FPS lors de la capture ;
- `npm test` : 51/51 réussis ;
- `npm run typecheck` : réussi ;
- `npm run build` : réussi, avec le warning Phaser connu sur la taille du chunk.

Limite restante : la sélection par chapitre et le panneau de description
individuelle de la planche de référence ne sont pas encore implémentés.

La sélection de chapitre est maintenant disponible dans le journal. Les onglets
reposent sur les niveaux présents dans le registre Phaser : les chapitres
atteints sont sélectionnables, les chapitres futurs restent visibles mais
verrouillés, et la sélection revient automatiquement au niveau courant lors
d’une transition.

Capture runtime mise à jour :

- `docs/captures/journal-audit-1280x720.png`

La capture montre les six onglets de chapitre, le chapitre 1 actif, les étapes
de la mission et le détail de l’objectif courant.

## Continuation validée — inventaire RPG responsive

L’inventaire affiche désormais une grille persistante de cases, y compris quand
elle est vide. L’état vide est explicite et localisé, les objets occupent une
case avec icône et libellé, et la grille passe de quatre colonnes sur desktop à
trois colonnes sur écran compact afin de ne pas sortir du panneau.

Capture runtime mise à jour :

- `docs/captures/inventory-audit-1280x720.png`

Vérifications :

- ouverture par `I` et fermeture par `I` : PASS ;
- capture Chrome niveau 1, panneau ouvert : PASS, 52 FPS ;
- `npm test` : 51/51 réussis ;
- `npm run typecheck` : réussi ;
- `npm run build` : réussi, avec le warning Phaser connu sur la taille du
  chunk.

La logique d’inventaire, les identifiants d’objets et la sauvegarde restent
inchangés.

## Continuation — passe UX interactive et HUD mobile

Fichiers modifiés :

- `src/ui/layout/ResponsiveLayoutManager.ts`
- `src/scenes/UIScene.ts`
- `src/ui/hud/QuestTracker.ts`
- `src/scenes/WorldScene.ts`
- `src/managers/I18nManager.ts`
- `tests/ResponsiveLayout.test.ts`
- `tests/I18n.test.ts`

Améliorations réalisées :

- Le HUD portrait empile l’objectif sur toute la largeur, puis XP et inventaire
  sur une ligne séparée ; les panneaux ne se recouvrent plus à `390×844`.
- Le prompt d’interaction devient un appel à l’action visuel : icône, contraste
  renforcé et pulsation légère uniquement lorsqu’un objet est à portée.
- Le badge `E` près de Midou, des objets et des portes possède un fond lisible
  et une animation discrète.
- Le libellé du bouton Terminal tactile est désormais localisé dans les trois
  langues, y compris en arabe.
- Le texte du suivi de quête s’aligne correctement en RTL.

Vérification ajoutée : le test responsive contrôle explicitement l’absence de
chevauchement du HUD portrait ; le test i18n contrôle le libellé Terminal dans
les trois langues.

Limites restantes : les compositions artistiques du HUD, du journal, de
l’inventaire et du terminal restent moins riches que la planche de référence ;
les appareils mobiles physiques et le clavier virtuel natif ne sont pas
certifiés par l’émulation Chrome seule.

## Continuation — sélection d’objet dans l’inventaire

L’inventaire complet permet maintenant de sélectionner une case occupée :

- la case sélectionnée reçoit un contour doré lisible ;
- le sous-titre affiche le nom et la fonction pédagogique de l’objet ;
- la clé de passage est expliquée en français, anglais et arabe ;
- l’état sélectionné est conservé tant que l’objet est présent et réinitialisé
  proprement lorsqu’il disparaît.

Cette évolution reste purement UI : `InventoryManager`, les récompenses, les
identifiants et les sauvegardes ne sont pas modifiés.

Vérifications :

- `npm test` : 51/51 réussis ;
- `npm run typecheck` : réussi ;
- `npm run build` : réussi, avec le warning Phaser connu sur la taille du
  chunk.

## Validation responsive complémentaire

La QA navigateur standard reste PASS après ces changements : menu,
paramètres, RTL, niveaux 1 à 6, commandes Git, récompenses, portes, victoire,
sauvegarde et reprise.

La matrice a d’abord révélé des faux négatifs du harnais — démarrage Chrome
avant Vite, trajet de coffre sensible aux collisions et collision de port avec
un service local. Ces points ont été corrigés dans le scénario QA puis validés
par une exécution complète ci-dessous.

## Validation responsive complète — matrice stabilisée

Corrections ciblées du harnais navigateur :

- attente de chargement bornée à 60 secondes pour absorber le premier décodage
  des assets lourds du niveau 1 ;
- lancement de Chrome seulement après la disponibilité HTTP réelle de Vite ;
- trajet de secours autour du pilier du sanctuaire pour éviter les faux échecs
  de navigation à grande résolution ;
- interactions Midou, coffre et portes répétables et bornées dans le scénario ;
- ports de matrice déplacés sur la plage dédiée 5400/9500 pour éviter les
  collisions avec les services locaux.

Résultat réel :

- `npm run qa:browser:matrix` : PASS, 7/7 viewports ;
- 1920×1080 : PASS, parcours complet des niveaux 1 à 6 ;
- 1366×768 : PASS, parcours complet des niveaux 1 à 6 ;
- 1280×720 : PASS, parcours complet des niveaux 1 à 6 ;
- 844×390 : PASS, parcours complet des niveaux 1 à 6 ;
- 390×844 : PASS, parcours complet des niveaux 1 à 6 ;
- 768×1024 : PASS, parcours complet des niveaux 1 à 6 ;
- 1024×768 : PASS, parcours complet des niveaux 1 à 6.

La matrice vérifie également le menu, les paramètres, le RTL, les commandes
Git, les récompenses, les portes, l’écran de victoire, la sauvegarde et la
reprise. Le temps de chargement à froid est plus élevé sur les grands écrans
à cause du poids des assets raster ; il reste couvert par une attente bornée.

## Continuation — sélection des objectifs du journal

Le journal permet maintenant de sélectionner chaque objectif affiché :

- les lignes de mission possèdent une zone de clic dédiée et responsive ;
- l’objectif sélectionné reçoit le marqueur `◆` ;
- le panneau de détail affiche l’objectif choisi, y compris l’aide de commande
  Git pour les étapes concernées ;
- la sélection reste compatible avec les chapitres atteints, les chapitres
  verrouillés et l’alignement RTL.

Vérifications :

- `npm test` : 51/51 réussis ;
- `npm run typecheck` : réussi ;
- `npm run build` : réussi, avec le warning Phaser connu ;
- QA Chrome standard : PASS, niveaux 1 à 6, terminal, récompenses, portes,
  victoire, sauvegarde et reprise.

## Continuation validée — terminal Git

Fichiers modifiés :

- `src/scenes/UIScene.ts`
- `scripts/browser-smoke.mjs`

Améliorations visibles :

- barre de titre avec indicateurs d’état ;
- séparation claire entre sortie, saisie et aide ;
- statut `READY` et indication `READY · GIT` pendant une étape de commande ;
- dimensionnement responsive conservé pour desktop et mobile ;
- champ DOM conservé pour le clavier virtuel et les espaces.

Capture runtime :

- `docs/captures/terminal-audit-1280x720.png`.

Vérifications :

- ouverture par `T` et fermeture par `Échap` : PASS ;
- niveau 1 rendu avec FPS : PASS, 29 FPS pendant la capture du terminal ;
- `npm test` : 51/51 réussis ;
- `npm run typecheck` : réussi ;
- `npm run build` : réussi, avec le warning Phaser connu sur la taille du chunk.

La validation de la saisie réelle des commandes et des espaces reste couverte
par les tests GitSimulator et TerminalInputModel existants, sans changement de
la logique métier.

## Continuation validée — contrôles tactiles

Fichiers modifiés :

- `src/phaser/InputManager.ts`
- `src/ui/layout/ResponsiveLayoutManager.ts`
- `src/scenes/UIScene.ts`

Améliorations visibles :

- remplacement du joystick circulaire par un D-pad directionnel plus lisible ;
- grandes zones tactiles séparées pour les quatre directions ;
- boutons `E` et `T` suffisamment grands, avec libellés localisés ;
- positionnement dans une zone sûre afin d’éviter le chevauchement avec le HUD
  et les bords des petits écrans ;
- mise à jour des libellés lors d’un changement de langue.

Captures runtime produites :

- `docs/captures/touch-audit-390x844.png`
- `docs/captures/touch-audit-844x390.png`

Vérifications :

- QA tactile niveau 1 en 390×844 : PASS, 54,10 FPS ;
- QA tactile niveau 1 en 844×390 : PASS, 57,05 FPS ;
- QA navigateur complète après modification : PASS pour menu, paramètres,
  RTL, niveaux 1 à 6, commandes Git, récompenses, portes, victoire,
  sauvegarde et reprise ;
- `npm test` : 51/51 réussis ;
- `npm run typecheck` : réussi ;
- `npm run build` : réussi, avec le warning Phaser connu sur la taille du
  chunk.

Limite restante : les captures tactiles ont été réalisées dans Chrome avec le
mode tactile automatisé. Une vérification complémentaire sur appareil mobile
physique est recommandée pour le clavier virtuel, les zones tactiles natives
et les variations de navigateur.

## Continuation validée — contrat responsive des contrôles

Les dimensions utilisées par le D-pad et les boutons d’action sont désormais
centralisées dans `TOUCH_LAYOUT_SIZES`. Le test responsive vérifie la totalité
des surfaces utiles, y compris le libellé situé sous le bouton d’interaction,
et non plus seulement le centre visuel des contrôles.

Vérifications après cette évolution :

- `npm test` : 51/51 réussis ;
- `npm run typecheck` : réussi ;
- `npm run build` : réussi ;
- avertissement connu conservé : chunk Phaser de 1 208,06 kB après minification.

## Continuation — terminal pédagogique

Le terminal propose désormais une action « Insérer » lorsqu’une étape Git est
active :

- la commande suggérée est remplie dans le champ, sans être exécutée ;
- le joueur conserve la possibilité de la modifier avant validation ;
- les commandes restent exécutées uniquement par `GitSimulator` après Entrée ;
- le libellé est localisé en français, anglais et arabe ;
- le bouton est repositionné avec le terminal responsive pour éviter le
  chevauchement avec l’aide et le champ mobile.

Vérifications :

- `npm test` : 51/51 réussis ;
- `npm run typecheck` : réussi ;
- `npm run build` : réussi, avec le warning Phaser connu ;
- QA Chrome standard : PASS, commandes Git, espaces, niveaux 1 à 6 et
  sauvegarde conservés.
