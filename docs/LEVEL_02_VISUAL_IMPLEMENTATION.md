# GitQuest — Niveau 2 : implémentation visuelle

**Région :** Forêt des Fichiers  
**Identifiant :** `level-02`  
**Statut :** implémentation jouable réalisée ; validation finale utilisateur en attente  
**Date :** 17 octobre 2026

Cette passe concerne uniquement le niveau 2. Les niveaux 3 à 6, les définitions
de mission et les règles métier du simulateur Git restent inchangés.

## Résultat

La Forêt des Fichiers dispose maintenant d'un vrai terrain Tiled rempli par un
atlas forestier 32×32, d'un chemin naturel vers les objectifs et de props raster
transparents dédiés. Le niveau reste data-driven : la carte pilote le terrain et
les décorations, tandis que `LevelDefinition`, `QuestManager`, `GitSimulator`,
`InventoryManager`, `XPManager` et `SaveManager` conservent leur rôle existant.

## Assets créés et intégrés

### Terrain

- `public/assets/tilesets/forest-tileset-v1.png` : atlas raster 512×512, grille
  16×16 de tuiles 32×32 ; herbe, terre, chemins, racines, feuillage et
  transitions de ruisseau.
- `public/assets/tilesets/forest-tileset.tsx` : définition Tiled locale avec
  `tilewidth="32"`, `tileheight="32"`, `tilecount="256"` et `columns="16"`.

### Props et porte

- `public/assets/sprites/forest/ancient-tree.png`
- `public/assets/sprites/forest/root-cluster.png`
- `public/assets/sprites/forest/fern-cluster.png`
- `public/assets/sprites/forest/flower-bush.png`
- `public/assets/sprites/forest/mushroom-patch.png`
- `public/assets/sprites/forest/mossy-rock.png`
- `public/assets/sprites/forest/ruin-fragment.png`
- `public/assets/sprites/forest/archive-crate.png`
- `public/assets/sprites/forest/staging-shrine.png`
- `public/assets/sprites/forest/canopy-shadow.png`
- `public/assets/sprites/forest/gate-closed.png`
- `public/assets/sprites/forest/gate-open.png`

Les images sont des créations locales générées pour GitQuest, sans URL externe ni
asset tiers ajouté. Leur licence de distribution commerciale doit être confirmée
avant publication, conformément à `public/assets/ASSETS.md`.

## Modifications de la carte Tiled

Fichier modifié : `public/data/maps/level-02.json`.

- `Ground` contient maintenant `30 × 17 = 510` GIDs valides.
- Le tileset `../../assets/tilesets/forest-tileset.tsx` est référencé avec
  `firstgid: 1`.
- Les couches `Ground`, `Decorations`, `Collisions` et `Objects` sont conservées.
- Les ancres `player-spawn`, `midou` et `exit-gate` gardent leurs coordonnées et
  leurs identifiants.
- Les quatre rectangles de collision d'origine sont conservés.
- La couche `Decorations` reçoit les arbres, racines, fougères, fleurs,
  champignons, ruines, caisse d'archives, canopée et balise de staging.
- Le cristal, le parchemin et le coffre restent définis dans
  `public/data/levels/level-02.json` ; aucune logique métier n'a été déplacée
  dans la carte.

## Rendu Phaser

Fichiers concernés :

- `src/data/AssetManifest.ts` charge l'atlas et les props forestiers locaux.
- `src/world/LegacyWorldStyle.ts` décrit le profil forestier, son tileset et ses
  textures de porte.
- `src/scenes/WorldScene.ts` rend la couche Ground sous forme de Tilemap, place
  les props par type Tiled et utilise la porte forestière fermée/ou ouverte.
- Les animations raster du joueur et de Midou du niveau 1 sont réutilisées pour
  le niveau 2 ; les corps Arcade restent ancrés aux pieds et les ombres sont
  séparées.
- La caméra suit le joueur avec un zoom adapté : environ `1.35` desktop,
  `1.18` paysage compact et `1.6` portrait.
- Le titre redondant du monde a été supprimé pour éviter son chevauchement avec
  le HUD sur mobile ; le titre HUD reste piloté par l'interface existante.
- Les interactions, le terminal, l'indicateur de proximité, la quête et la
  sauvegarde continuent de passer par les systèmes existants.

## Collisions et progression

Les rectangles de collision Tiled n'ont pas été modifiés. Le chemin de terrain a
été composé autour de ces zones afin de conserver l'accès à :

1. Midou et le dialogue du niveau 2 ;
2. la zone de staging et le parchemin pédagogique ;
3. `forest-crystal` ;
4. la commande `git add` dans le terminal ;
5. `forest-chest` et la clé `pass-key` ;
6. la porte `exit-gate` et le passage vers le niveau 3.

La porte forestière utilise une illustration de ruine couverte de lianes. Elle
est assombrie à l'état verrouillé et passe à l'asset lumineux ouvert lorsque la
quête est à l'étape `open-exit` et que la clé est présente. Les conditions de
passage n'ont pas été modifiées.

## Tests automatisés

- `npm test` : **44/44 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS** ; avertissement existant sur la taille du chunk
  Phaser, sans erreur de compilation.
- `npm run qa` : **PASS** ; parcours complet menu, niveaux 1 à 6, commandes Git,
  récompenses, portes, victoire, sauvegarde et reprise.
- `npm run qa:browser:touch` : **PASS** pour `level-02`, FPS mesuré à 49.
- Le test unitaire ajouté vérifie les 510 tuiles Ground, la référence du
  tileset forestier et la présence des landmarks forestiers.

## Vérification Chrome réelle

Le smoke test navigateur a chargé directement le niveau 2 avec Chrome headless
via CDP, a vérifié le marqueur de scène, l'absence d'erreurs navigateur et la
mesure FPS, puis a produit les captures suivantes :

- [Niveau 2 — 1280×720](C:/Users/ahmed/source/repos/GitQuest/docs/captures/level-02-1280x720.png) — FPS observé : environ 52.
- [Niveau 2 — 844×390](C:/Users/ahmed/source/repos/GitQuest/docs/captures/level-02-844x390.png) — FPS observé : environ 51 après l'ajustement du cadrage Midou.
- [Niveau 2 — 390×844](C:/Users/ahmed/source/repos/GitQuest/docs/captures/level-02-390x844.png) — FPS observé : environ 54.

Le QA complet a également exercé le flux réel du niveau 2 : arrivée depuis le
niveau 1, déplacement, interaction avec Midou, progression `git add`, collecte,
clé, porte et transition vers le niveau 3. La reprise et la sauvegarde ont été
validées dans le parcours six niveaux.

## Limitations restantes

- L'atlas est une création locale détaillée, mais sa licence commerciale finale
  doit encore être confirmée ; il n'est pas déclaré CC0.
- La caméra et les contrôles tactiles ont été vérifiés en Chrome headless et en
  émulation tactile, pas sur un appareil physique.
- Les effets d'ambiance sont volontairement légers : mouvement de canopée et de
  fougères, sans système de particules coûteux afin de préserver les performances.
- Les rectangles de collision historiques restent la géométrie bloquante ; une
  future passe pourra les redessiner dans Tiled si une composition plus organique
  l'exige, mais cela nécessitera une nouvelle validation des routes.
- La qualité est maintenant nettement supérieure au rendu legacy générique, mais
  une validation artistique commerciale finale nécessiterait encore une passe
  de direction sur la continuité des raccords entre toutes les tuiles.

## Périmètre respecté

Les niveaux 3 à 6 n'ont pas été modifiés. Aucun changement n'a été apporté à
`GitSimulator`, `QuestManager`, `SaveManager`, l'inventaire, l'XP ou aux données
de mission du niveau 2.

La prochaine étape doit attendre la validation utilisateur de cette implémentation
du niveau 2.
