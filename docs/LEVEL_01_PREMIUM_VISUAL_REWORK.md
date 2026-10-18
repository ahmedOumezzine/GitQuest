# GitQuest — Refonte artistique premium du niveau 1

Date : 18 octobre 2026

Périmètre : `level-01` / Plage des Origines uniquement. Les niveaux 2 à 6,
GitSimulator, QuestManager, les sauvegardes et les conditions métier restent
inchangés.

## Référence et diagnostic

La référence fournie présente une île tropicale presque entièrement cadrée,
avec une côte turquoise irrégulière, Midou et les ruines à gauche, la porte des
archives en haut à droite, le sanctuaire au centre, le coffre en avant-plan,
un bateau et un ponton à droite, ainsi qu’un HUD RPG structuré.

Avant cette passe, le niveau local était déjà détaillé mais la caméra desktop
était trop rapprochée : elle révélait surtout la côte ouest et masquait le
bateau, le bord est et une partie de la composition. Le HUD affichait les
éléments fonctionnels mais sans badge de région ni carte de statut avec portrait.

## Changements réalisés

### Composition de l’île

- Le zoom desktop de `WorldScene` est maintenant calculé à partir de la largeur
  réelle de la carte Tiled, avec une plage bornée pour les grands écrans.
- La plage, l’océan, le sanctuaire, les ruines, la porte et les chemins restent
  rendus par la carte et les objets Tiled ; aucune image complète n’est utilisée
  comme texture du monde.
- Les décorations côtières locales existantes ont été intégrées à la couche
  `Decorations` de `level-01.json` : bateau, poteaux de ponton, écume, rochers et
  coquillages.
- Les couches `Ground`, `Decorations`, `Collisions` et `Objects` restent
  présentes. Les ancres `player-spawn`, `midou` et `exit-gate` n’ont pas changé.
- Les nouvelles décorations sont visuelles uniquement : aucune collision ou
  condition de quête n’a été modifiée.

### HUD premium niveau 1

- Ajout d’un badge de région desktop : `Plage des Origines`.
- Ajout de `BeachStatusCard`, composant réutilisable basé sur `ResponsivePanel`,
  avec portrait raster local, niveau, XP et quantité d’inventaire.
- Le `QuestTracker` existant conserve les données réelles de `QuestManager`, la
  progression et la commande Git étudiée.
- Le minimap compact/repliable, le journal et les contrôles tactiles existants
  restent fonctionnels.
- En mobile, le badge et la carte de statut sont masqués pour conserver la zone
  jouable et éviter tout chevauchement ; le HUD compact historique est conservé.
- RTL arabe : la carte de statut aligne ses textes selon la direction active.

### Chargement des assets

- `level-01-player-v1` est maintenant chargé avec les assets régionaux afin que
  le portrait du HUD ne dépende pas d’une texture absente.
- Les assets locaux réutilisés sont documentés dans
  [public/assets/ASSETS.md](../public/assets/ASSETS.md).
- Aucun lien externe, asset tiers non vérifié ou image de référence n’a été
  intégré dans la carte jouable.

## Fichiers modifiés

- `src/scenes/WorldScene.ts` — zoom desktop et rendu des props côtiers.
- `src/scenes/UIScene.ts` — badge de région et statut premium desktop.
- `src/ui/hud/BeachStatusCard.ts` — nouveau composant HUD niveau 1.
- `src/managers/I18nManager.ts` — libellé localisé du niveau dans la carte.
- `src/data/AssetManifest.ts` — assets côtiers et portrait chargés pour le niveau 1.
- `public/data/maps/level-01.json` — décorations visuelles côtières uniquement.
- `public/assets/ASSETS.md` — provenance et réutilisation documentées.
- `docs/LEVEL_01_PREMIUM_VISUAL_REWORK.md` — présent rapport.

## Captures Chrome réelles

Captures prises avec Vite local et Chromium CDP après le rendu du niveau 1 :

- Avant : [1280 × 720](captures/level-01-online-polish-1280x720.png).
- Après : [1280 × 720](captures/level-01-premium-1280x720.png).
- Après : [1760 × 900](captures/level-01-premium-1760x900.png).
- Après : [844 × 390](captures/level-01-premium-844x390.png).
- Après : [390 × 844](captures/level-01-premium-390x844.png).

FPS observés pendant les captures :

- 1280 × 720 : 53,12 FPS.
- 1760 × 900 : 42,29 FPS.
- 844 × 390 : 46,00 FPS.
- 390 × 844 : 49,18 FPS.

## Comparaison avec le concept

Améliorations visibles :

- l’île est cadrée plus largement sur desktop ;
- le bateau, le ponton, l’écume et les rochers de la côte est sont visibles ;
- le sanctuaire et la porte sont séparés visuellement ;
- le HUD desktop possède maintenant une hiérarchie région → mission → statut ;
- le portrait du joueur, l’XP et l’inventaire sont réunis dans une carte ;
- les contrôles mobiles restent dégagés et le niveau reste jouable.

Différences restantes :

- le concept est une illustration de présentation très dense, tandis que le jeu
  doit conserver une carte Tiled navigable avec des collisions réelles ;
- les tuiles de sable restent moins riches que celles de la référence ;
- le centre de l’île garde des zones de circulation volontairement ouvertes pour
  les missions et la lisibilité ;
- aucun asset de phare dédié n’a été ajouté à cette passe, car aucun asset local
  validé n’était nécessaire à la composition fournie ;
- les effets audio restent ceux déjà disponibles dans le projet : aucune musique
  n’est inventée ou annoncée comme intégrée.

La refonte est donc une amélioration réelle et mesurable de la composition, mais
elle ne prétend pas reproduire pixel par pixel l’illustration de référence.

## Tests

- `npm test` : **67/67 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS** avec l’avertissement connu sur la taille du chunk
  Phaser.
- `npm run qa` : **PASS** — menu, paramètres, RTL, niveaux 1 à 6, commandes
  Git, récompenses, portes, victoire, sauvegarde et reprise.
- `npm run qa:browser:touch` : **PASS** — rendu tactile et responsive.
- Nouvelle partie → Midou → cristal → terminal → `git init` → coffre → clé →
  porte verrouillée puis ouverte → niveau 2 : conservé et validé par le smoke
  test navigateur.
- Les collisions et les objets de progression Tiled du niveau 1 restent
  inchangés et sont couverts par les tests existants.

## Limitations et suite recommandée

La prochaine amélioration artistique utile serait un véritable tileset raster
32×32 de sable humide, écume et transitions de littoral, avec licence de
distribution confirmée. Cette étape doit être réalisée dans une passe dédiée
avant d’annoncer une fidélité commerciale complète à la référence.
