# Niveau 1 — Polish des textures du terrain

## Périmètre

Cette micro-tâche concerne uniquement les textures raster du terrain de la
Plage des Origines. La silhouette de l’île, la carte 48×30, les positions des
objets, les décorations, les collisions, les quêtes et les niveaux 2 à 6 n’ont
pas été modifiés dans cette passe.

## Changements réalisés

- Création de `public/assets/tilesets/beach-tileset-v3.png`, un atlas raster
  local de 24 tuiles 32×32.
- Conservation de l’ordre des cases Tiled : les GID 1 à 16 gardent leur rôle,
  et les GID 17 à 24 restent les huit transitions directionnelles de rivage.
- Sable sec et variante claire : motifs pixel art manuels, discrets et non
  aléatoires, sans bande d’écume répétée.
- Sable humide : variante séparée avec quelques reflets bleu-vert proches du
  littoral.
- Eau : réutilisation de variantes turquoise profondes provenant de l’atlas
  raster local du port.
- Rivage : utilisation de cases d’écume et de sable/eau du même atlas local,
  avec rotations/flips raster pour produire les variantes directionnelles sans
  modifier les GID.
- `src/data/AssetManifest.ts` et
  `public/assets/tilesets/beach-tileset.tsx` chargent maintenant `v3.png`.
- `public/assets/ASSETS.md` documente l’asset et sa provenance locale.

Le tileset source réutilisé est `public/assets/tilesets/harbor-tileset-v1.png`,
déjà présent dans le projet et documenté comme asset raster local. Aucun URL
externe ni asset tiers non vérifié n’a été ajouté.

## Captures avant / après

Avant, issues de la micro-tâche précédente :

- [Terrain seul avant](captures/level-01-terrain-only-1280x720.png)
- [Vue décorée avant](captures/level-01-terrain-rebuild-1280x720.png)

Après cette micro-tâche :

- [Terrain seul 1280×720](captures/level-01-terrain-texture-only-1280x720.png)
- [Vue décorée 1280×720](captures/level-01-terrain-texture-1280x720.png)
- [Vue rapprochée du rivage](captures/level-01-terrain-texture-shoreline.png)
- [Vue mobile 390×844](captures/level-01-terrain-texture-390x844.png)

La vue rapprochée est un recadrage d’une capture Chrome réelle du terrain ; elle
sert à contrôler le raccord eau/sable à l’échelle des pixels.

## Vérifications réellement exécutées

- `npm test` : **67/67 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**. L’avertissement de chunk Phaser supérieur à
  1200 kB reste présent et n’est pas lié au tileset.
- QA navigateur ciblée niveau 1 : **PASS** en 1280×720 et en émulation tactile
  390×844 ; niveau rendu, textures chargées et FPS publiés.
- `npm run qa` : **PASS** sur ports isolés ; menu, paramètres, RTL, niveaux 1 à
  6, commandes Git, récompenses, portes, victoire, sauvegarde et reprise.

Les captures ont été produites avant la suppression du mode QA temporaire de
masquage des décorations. Ce mode n’est pas conservé dans le code livré.

## Limites restantes

- La référence conceptuelle reste plus riche qu’un atlas de 24 cases 32×32 ;
  cette micro-tâche améliore la matière du sol sans refaire la composition de
  l’île ni ajouter de nouvelles décorations.
- Les variantes raster proviennent d’un asset local généré précédemment ; la
  licence de distribution commerciale finale de ces images doit toujours être
  confirmée avant publication.
- L’autotiling avancé n’a pas été introduit : les transitions existantes et
  leurs GID sont conservés pour ne pas toucher aux données de mission.

## État

Micro-tâche 2 terminée localement. Aucun commit et aucun push n’ont été
effectués.
