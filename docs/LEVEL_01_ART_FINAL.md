# GitQuest — Niveau 1 : finition artistique et harmonisation

Date : 17 octobre 2026  
Périmètre : `level-01` / Plage des Origines uniquement

Cette passe corrige les anomalies visuelles les plus visibles du rework précédent sans modifier les règles métier, les identifiants Tiled ou les niveaux 2 à 6.

## Assets créés ou intégrés

Les assets sont locaux et documentés dans [public/assets/ASSETS.md](../public/assets/ASSETS.md).

- `public/assets/tilesets/beach-tileset-v2.svg` : atlas local de 16 tuiles 32×32 avec sable sec, sable humide, eau, écume, galets, pierres et détails de sol.
- `public/assets/tilesets/beach-tileset.tsx` : définition Tiled mise à jour vers l’atlas 16 colonnes.
- `public/assets/sprites/level-01-player-sheet-v1.png` : spritesheet raster transparente 3×4, quatre directions et trois frames par direction.
- `public/assets/sprites/level-01-midou-sheet-v1.png` : spritesheet raster transparente 3×4 de Midou, même grille et mêmes directions.

Les deux spritesheets ont été générées localement puis normalisées en frames 96×96. Elles ne proviennent d’aucune URL ou librairie d’assets tierce. Leur licence de distribution commerciale doit encore être confirmée ; elles ne sont pas déclarées CC0.

## Changements réalisés

### Terrain et littoral

- La couche `Ground` de `level-01` reste une carte Tiled 48×30 en tuiles 32×32.
- Le contour de l’eau est maintenant irrégulier, avec une variation de largeur sur les rives gauche et droite.
- Les tuiles d’eau restent les GID `3` utilisés par les collisions ; le sable humide utilise le GID `5` et reste traversable.
- Les anciennes nappes de carrés turquoise intérieurs ont été supprimées de la donnée de carte.
- Le rendu Phaser convertit explicitement les GID Tiled 1-based en index atlas 0-based uniquement pour la couche visuelle ; les données gameplay restent 1-based.
- La collision de l’eau utilise une marge de 8 px afin de ne pas bloquer le premier tile de sable humide tout en empêchant l’entrée dans l’océan.

### Décors et profondeur

Les palmiers, ruines, rochers et sanctuaire existants ont été conservés. Le sanctuaire reste le point focal avec son aura, son label localisé et ses collisions de piliers. Les ombres du joueur et de Midou sont séparées des sprites pour conserver un ancrage lisible au sol.

### Personnages

- Le niveau 1 utilise désormais de vraies spritesheets raster Phaser, et non les illustrations statiques `level-01-player-v1` / `level-01-midou-v1` pendant le déplacement.
- Les animations sont créées dans `PreloadScene` pour `down`, `left`, `up` et `right`.
- Le corps Arcade du joueur est réduit à la zone des pieds afin de conserver les collisions Tiled avec les nouveaux sprites plus grands.
- Une validation navigateur vérifie les quatre animations directionnelles.

### HUD et responsive

Le HUD et le zoom existants sont conservés. Les captures vérifient le niveau 1 sur desktop, paysage compact et portrait compact. En portrait, la caméra suit le joueur et recadre naturellement la carte ; le sanctuaire est accessible après exploration mais n’est pas simultanément visible dans la première vue.

## Captures Chrome réelles

Captures produites après le fondu de la scène et après chargement des nouveaux assets :

- [1280×720](C:/Users/ahmed/.codex/visualizations/2026/10/17/01a14819-106c-7ea1-b7f5-67a70d0c1e2b/level1-art-final-1280x720.png)
- [844×390](C:/Users/ahmed/.codex/visualizations/2026/10/17/01a14819-106c-7ea1-b7f5-67a70d0c1e2b/level1-art-final-844x390.png)
- [390×844](C:/Users/ahmed/.codex/visualizations/2026/10/17/01a14819-106c-7ea1-b7f5-67a70d0c1e2b/level1-art-final-390x844.png)

### Comparaison de référence — passe actuelle

Les captures les plus récentes utilisées pour la comparaison avec
`docs/references/gitquest-flow-reference.png` sont :

- [Niveau 1 — desktop 1280×720](captures/level-01-reference-pass-1280x720-final3.png)
- [Niveau 1 — mobile portrait 390×844](captures/level-01-reference-pass-390x844-final3.png)
- [Niveau 1 — desktop après composition plage](captures/level-01-reference-pass-1280x720-final5.png)
- [Niveau 1 — mobile paysage après cadrage](captures/level-01-reference-pass-844x390-final3.png)
- [Niveau 1 — mobile après composition plage](captures/level-01-reference-pass-390x844-final4.png)

La composition reprend maintenant les éléments structurants visibles dans la
référence : littoral turquoise à gauche, plage jouable au premier plan,
palmiers et ruines dans le plan intermédiaire, joueur et Midou ancrés par une
ombre, sanctuaire Git central et porte de sortie distincte à droite. Le HUD
compact suit cette composition : objectif en haut à gauche, XP et inventaire en
haut à droite, contrôles tactiles en bas sur mobile.

La capture desktop montre le nouveau joueur animé, Midou, le littoral, les ruines, les palmiers, les rochers et le sanctuaire sans carrés d’eau intérieurs. Les captures compactes confirment que le HUD reste visible et que le personnage reste lisible.

## Validation effectuée

- `npm test` : **51/51 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**, avec l’avertissement existant sur la taille du chunk Phaser.
- `npm run qa` : **PASS** après ajout de l’alias vers le smoke test navigateur.
- `npm run qa:browser` : **PASS** pour le parcours complet : menu, paramètres, RTL, niveau 1, commandes Git, récompenses, portes, niveaux 2 à 6, victoire, sauvegarde et reprise.
- `GITQUEST_QA_LEVEL=level-01` : **PASS** en 1280×720 et 390×844 tactile, avec captures finales produites.
- `GITQUEST_QA_ANIMATION=1 npm run qa:browser` sur `level-01` : **PASS**, quatre directions de marche vérifiées par marqueur runtime.
- `GITQUEST_QA_TOUCH=1 npm run qa:browser` sur `level-01` en 844×390 : **PASS**, contrôles tactiles visibles en émulation tactile.
- Le parcours réel vérifie que Midou, le cristal, `git init`, le coffre, la clé, la porte et la sauvegarde restent fonctionnels.

## Comparaison avec les références et limites restantes

La cohérence est nettement améliorée : le joueur et Midou partagent maintenant une source raster animée, l’océan est réellement différencié du sable, le littoral n’est plus une bande parfaitement rectangulaire et les props s’intègrent mieux grâce aux ombres et au sanctuaire détaillé.

Le résultat n’est toutefois pas une reproduction commerciale complète des références :

- le tileset est un atlas SVG original et compact, pas un pack pixel-art professionnel tiers complet ;
- certaines variantes de sable restent perceptibles comme des cellules de grille à fort zoom ;
- les décors riches sont des illustrations locales posées sur une base Tiled 32×32 et non un tileset unifié entièrement peint ;
- la vue portrait montre une portion de la carte à la fois, conformément au suivi de caméra ;
- la licence de distribution finale des images générées reste à confirmer.

La comparaison objective montre encore trois écarts assumés : la référence est
une illustration composite plus dense, certains détails de plage sont encore
portés par des sprites de décor plutôt que par un tileset entièrement peint,
et la vue portrait recadre fortement la carte pour conserver la lisibilité du
joueur. Le niveau est donc adapté à la composition de référence et validé en
jouabilité, sans être déclaré identique au visuel cible.

### Dernière correction de composition

- Le bandeau supérieur opaque du niveau 1 a été réduit à un accent discret ;
  l’objectif, l’XP et l’inventaire flottent maintenant au-dessus du décor.
- Les sélecteurs de langue et le journal ne sont plus affichés pendant le
  gameplay du niveau 1 afin de conserver la hiérarchie de la référence.
- Le zoom desktop et compact montre davantage de plage et de profondeur.
- Quatre éléments de premier plan ont été ajoutés dans la couche `Decorations`
  de la carte Tiled (`palm-foreground-west/east`,
  `rock-foreground-west/east`). Ils sont décoratifs et ne changent pas les
  collisions ni les ancres de progression.
- Le message de commandes permanent est masqué dans le niveau 1 ; les
  indicateurs `E` et `T` restent disponibles, ainsi que le prompt de proximité.

Le niveau est techniquement validé et visuellement harmonisé pour cette passe, mais ces limites doivent être résolues avant de qualifier l’art comme définitif/commercial.

## Fichiers modifiés dans cette passe

- `src/data/AssetManifest.ts`
- `src/scenes/PreloadScene.ts`
- `src/scenes/WorldScene.ts`
- `public/data/maps/level-01.json`
- `public/assets/tilesets/beach-tileset-v2.svg`
- `public/assets/tilesets/beach-tileset.tsx`
- `public/assets/sprites/level-01-player-sheet-v1.png`
- `public/assets/sprites/level-01-midou-sheet-v1.png`
- `public/assets/ASSETS.md`
- `scripts/browser-smoke.mjs`
- `tests/AssetManifest.test.ts`
- `tests/LevelManager.test.ts`
- `package.json`

### Passe d’harmonisation UI/caméra

- `src/scenes/UIScene.ts` : HUD niveau 1 compact, placement portrait et
  correction de la référence de layout supprimée.
- `src/scenes/WorldScene.ts` : zoom responsive niveau 1, route visuelle Tiled
  légère et indicateur de porte plus discret.
- `src/ui/hud/QuestTracker.ts` : séparation correcte du titre, de l’objectif et
  de la progression sur mobile.
- `src/ui/theme/UITheme.ts`, `src/ui/PixelButton.ts`, `src/ui/MainMenu.ts`,
  `src/ui/SettingsPanel.ts`, `src/ui/hud/ResponsivePanel.ts`,
  `src/ui/hud/XPBar.ts`, `src/ui/hud/InventoryBar.ts`,
  `src/phaser/InputManager.ts` : cohérence visuelle et responsive des
  composants partagés.
- `scripts/browser-smoke.mjs` : trajet QA du cristal aligné sur le parcours
  réel de la plage, sans modification du gameplay.
