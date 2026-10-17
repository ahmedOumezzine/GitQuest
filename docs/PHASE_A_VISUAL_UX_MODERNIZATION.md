# GitQuest 2.0 — Phase A : modernisation visuelle et UX

## Périmètre

Cette étape traite uniquement la lisibilité du monde et du HUD commun. Les règles métier, le simulateur Git, les quêtes, les sauvegardes, les cartes Tiled et la progression des six niveaux sont conservés.

## Diagnostic initial

Les cartes 2 à 6 possédaient déjà des illustrations régionales détaillées, mais la couche `Ground` Tiled était rendue avec une opacité trop élevée. Les tuiles de l’atlas faisaient apparaître un damier de cellules et des raccords carrés par-dessus le décor. Sur la capture du niveau 2, la carte paraissait également trop petite dans le viewport et le HUD était concentré dans une barre technique difficile à lire sur mobile.

Le problème n’était pas l’absence de données Tiled : `Ground`, `Decorations`, `Collisions` et `Objects` restent chargées. Le problème était la hiérarchie de rendu : la couche Tiled de terrain servait de texture visible au premier plan alors que l’illustration régionale devait porter la composition visuelle.

## Corrections réalisées

### Terrain et rendu

- Ajout d’un réglage `groundOverlayAlpha` dans `src/world/LegacyWorldStyle.ts`.
- Passage de la couche `Ground` des niveaux 2 à 6 à une surcouche très discrète (`0.025`).
- Conservation du Tilemap, des collisions, des objets et de la source de vérité Tiled.
- Suppression visuelle du damier sans supprimer ni contourner la carte jouable.
- Les arrière-plans détaillés régionaux restent responsables de la composition : forêt, grotte, port, montagne et château.

### HUD modulaire

Création de composants réutilisables dans `src/ui/hud/` :

- `ResponsivePanel` : panneau pixel compact redimensionnable.
- `QuestTracker` : objectif actuel et progression de la mission.
- `XPBar` : XP totale et progression de segment.
- `InventoryBar` : inventaire compact et compteur d’objets.
- `CommandHint` : aide contextuelle de la prochaine commande Git.

`UIScene` conserve les fenêtres existantes du journal, du terminal et des dialogues, mais délègue désormais les informations principales à ces composants. Le HUD est redimensionné par `ResponsiveLayoutManager` et s’adapte aux modes desktop, compact et portrait.

### Interactions et lisibilité pédagogique

- Les objets proches affichent une indication contextuelle : parler à Midou, examiner le cristal, ouvrir le coffre, lire le parchemin ou examiner la porte.
- Le nom de la porte affiche aussi son état localisé (`verrouillée` / `ouverte`) et conserve sa couleur d’état et son aura.
- Les identifiants des étapes `git add`, `git commit`, `git push`, `git pull`, `git branch`, `git switch` et `git merge` sont maintenant traduits dans le HUD.
- Le RTL arabe continue d’être appliqué au document, au canvas et aux composants textuels.
- Aucune validation de quête, récompense XP ou ouverture de porte n’a été ajoutée au rendu : les conditions métier restent celles du `QuestManager` et de `WorldScene`.

## Fichiers concernés par cette étape

- `src/scenes/UIScene.ts`
- `src/scenes/WorldScene.ts`
- `src/managers/I18nManager.ts`
- `src/world/LegacyWorldStyle.ts`
- `src/ui/hud/ResponsivePanel.ts`
- `src/ui/hud/QuestTracker.ts`
- `src/ui/hud/XPBar.ts`
- `src/ui/hud/InventoryBar.ts`
- `src/ui/hud/CommandHint.ts`
- `tests/I18n.test.ts`

## Vérifications réalisées

### Tests automatisés

- `npm test` : **49/49 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**. Vite signale uniquement que le bundle Phaser est volumineux, sans erreur de compilation.

### QA navigateur réelle

- `npm run qa` : **PASS** — menu, paramètres, RTL, parcours des niveaux 1 à 6, commandes Git, récompenses, portes, victoire, sauvegarde et reprise.
- `npm run qa:browser:matrix` : **PASS** sur `1920×1080`, `1366×768`, `1280×720`, `844×390`, `390×844`, `768×1024` et `1024×768`.
- `npm run qa:browser:touch` : **PASS** sur le niveau 2 avec émulation tactile.
- Capture desktop niveau 2 : `docs/captures/phase-a-level-02-final.png`.
- Capture portrait niveau 2 après correction du chevauchement : `docs/captures/phase-a-level-02-hud-390x844-after.png`.

Les captures confirment que le damier n’est plus perceptible, que le terrain forestier occupe le monde et que le HUD reste dans le viewport. Le FPS observé pendant les passages ciblés est resté dans une plage d’environ 50–56 FPS selon la résolution et le lancement.

## Points encore améliorables

1. Le bundle Phaser dépasse le seuil de taille Vite ; un découpage dynamique pourrait réduire le temps de démarrage.
2. Le HUD peut encore recevoir une variante ultra-compacte pour les téléphones très étroits afin de réduire l’espace couvert sur le monde.
3. Les libellés de porte sont lisibles mais peuvent devenir longs en arabe ou dans certains états ; une vraie pastille `GateStatusBadge` indépendante serait une amélioration possible.
4. La qualité artistique des illustrations régionales dépend toujours des assets raster locaux existants ; cette phase n’ajoute pas de nouveaux assets graphiques.
5. Une instrumentation de performance plus longue sur appareil mobile physique reste utile avant une publication.

## Critères de sortie de la phase A

- [x] Le damier et les raccords de la couche Ground ne dominent plus le rendu.
- [x] Les couches Tiled et les collisions restent actives.
- [x] Le HUD principal est composé de modules réutilisables.
- [x] Les objectifs et commandes des six niveaux sont localisés.
- [x] Les indicateurs d’interaction sont contextuels et discrets.
- [x] Desktop, paysage compact, portrait et tactile ont été vérifiés par QA navigateur.
- [x] Aucun changement du simulateur Git, des règles de quête ou des sauvegardes.

La phase A est techniquement validée. Les optimisations de production d’assets, la refonte artistique de grande ampleur et les changements de structure de niveaux restent hors périmètre.
