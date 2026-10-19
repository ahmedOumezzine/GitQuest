# Niveau 1 — Composition des décors

## Périmètre

Cette micro-tâche a porté uniquement sur la couche `Decorations` du niveau 1. Le
terrain, l’atlas `beach-tileset-v3.png`, la caméra, le HUD, les quêtes, les
collisions et les niveaux 2 à 6 n’ont pas été modifiés dans cette passe.

La carte reste une carte Tiled de **48×30** avec les couches `Ground`,
`Decorations`, `Collisions` et `Objects`.

## Diagnostic avant/après

Avant la passe, la composition présentait :

- des ruines riches qui se chevauchaient dans les zones ouest et nord ;
- des groupes de palmiers répétés à intervalles réguliers ;
- des marqueurs `grass` triangulaires visibles comme des placeholders ;
- un chemin visuel peu lisible entre Midou, le sanctuaire et la porte ;
- une zone de porte trop proche des ruines voisines.

Après la passe :

- la zone de Midou forme un petit camp d’entrée, avec une ruine principale et
  un bosquet décalé ;
- les ruines nord encadrent la porte au lieu de se superposer directement à
  elle ;
- le sanctuaire garde un espace cérémoniel dégagé et ses identifiants restent
  inchangés ;
- les palmiers sont répartis en groupes latéraux et en bosquets côtiers ;
- les anciens triangles `grass` utilisent désormais un sprite raster
  transparent de végétation tropicale ;
- les éléments du bateau et du ponton restent regroupés sur le côté est, sans
  changement de terrain ni de collision.

## Fichiers modifiés

- `public/data/maps/level-01.json` : repositionnement d’objets de décoration
  uniquement (`palm-*`, `ruin-*`, `rock-*`, `grass-*`, `flower-*`). Les
  identifiants métier, la couche `Ground`, la couche `Collisions` et les objets
  de progression n’ont pas été déplacés.
- `src/scenes/WorldScene.ts` : remplacement du rendu `grass` par
  `level-01-grass-cluster-v1` et taille d’affichage dédiée, sans collision.
- `src/data/AssetManifest.ts` : déclaration et chargement local du nouveau
  sprite pour le niveau 1.
- `public/assets/sprites/level-01-grass-cluster-v1.png` : nouveau sprite
  raster transparent de groupe d’herbes tropicales.
- `public/assets/ASSETS.md` : provenance et statut de licence documentés.
- `docs/captures/` : captures navigateur et crops de zones pour comparaison.

## Parcours visuel contrôlé

Le parcours suggéré par la composition est :

`spawn joueur → camp de Midou → cristal → sanctuaire Git → coffre → porte des archives`.

Les décors servent de repères visuels sans ajouter de collision et sans
masquer les objets de mission. La porte et le sanctuaire utilisent toujours
leurs rendus et conditions existants ; aucune règle métier n’a été dupliquée.

## Captures réelles

- Vue 1280×720 : [`level-01-decor-composition-1280x720.png`](captures/level-01-decor-composition-1280x720.png)
- Vue large 1908×900 : [`level-01-decor-composition-1908x900.png`](captures/level-01-decor-composition-1908x900.png)
- Zone Midou : [`level-01-decor-midou.png`](captures/level-01-decor-midou.png)
- Zone sanctuaire : [`level-01-decor-shrine.png`](captures/level-01-decor-shrine.png)
- Zone porte : [`level-01-decor-gate.png`](captures/level-01-decor-gate.png)
- Zone bateau/ponton : [`level-01-decor-boat.png`](captures/level-01-decor-boat.png)

Les vues sont des captures PNG produites par Chrome headless via le runner QA,
puis des recadrages locaux des zones demandées. Le concept de référence reste
plus riche en végétation continue, en littoral détaillé et en micro-décors ;
cette tâche n’autorisait pas de reconstruire ces éléments ni de modifier le
terrain.

## Vérifications

- `npm test` : **67/67 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**.
- `npm run qa` : **PASS** — menu, paramètres, RTL, niveaux 1 à 6,
  commandes Git, récompenses, portes, victoire, sauvegarde et reprise.
- QA ciblé niveau 1 en Chrome 1280×720 : **PASS**, FPS mesuré 52.00.
- QA ciblé niveau 1 en Chrome 1908×900 : **PASS**, FPS mesuré 55.09.
- JSON de la carte relu : **48×30**, couches attendues présentes.

## Limites restantes

- La densité et le niveau de détail du concept de référence ne sont pas
  reproduits intégralement : les assets locaux disponibles restent moins
  nombreux et moins fins que le concept.
- La végétation basse nouvellement ajoutée est un asset raster original local,
  mais sa licence de distribution commerciale finale doit encore être validée
  avant une publication commerciale.
- Le bateau et le ponton utilisent les props côtiers existants ; leur
  intégration visuelle est améliorée par le regroupement, mais la forme du
  littoral n’a pas été retouchée conformément au périmètre.

Aucun commit ni push n’a été effectué.
