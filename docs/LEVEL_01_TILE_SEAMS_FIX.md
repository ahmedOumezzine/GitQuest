# Niveau 1 — Correction des raccords de tuiles

## Périmètre

Cette micro-tâche corrige uniquement les carrés visibles introduits par le
tileset `beach-tileset-v3.png`. La composition de l’île, la carte 48×30, les
positions des objets, la caméra, le HUD, les quêtes, les collisions et les
niveaux 2 à 6 restent inchangés.

## Diagnostic

Les 24 cases de l’atlas ont été inspectées individuellement. Les défauts
venaient de plusieurs fonds incompatibles :

- certaines variantes de sable provenaient de cases de plage humide avec une
  bande claire répétée ;
- les cases coquillages, corail et rochers conservaient leur ancien fond sable
  dans une teinte différente ;
- les transitions d’écume utilisaient des profils trop proches, ce qui rendait
  la répétition des cases lisible à l’écran.

## Correction appliquée

`public/assets/tilesets/beach-tileset-v3.png` a été recomposé en conservant
strictement l’ordre des 24 GID :

- les cases terrestres utilisent maintenant le même fond sable principal ;
- les variantes sèches partagent une texture pixel art sobre avec des motifs
  irréguliers authored, sans damier ni scatter aléatoire ;
- les cases de galets, rochers, fleurs, corail et coquillages sont redessinées
  directement sur ce fond commun, sans rectangle opaque autour du motif ;
- le sable humide utilise une bande localisée et raccordée, sans changer le
  rôle de la tuile ;
- les huit transitions du rivage ont des profils d’écume différents et des
  raccords eau/sable continus ;
- les cases d’eau restent pleines et texturées, sans bordure noire.

Aucun GID, objet Tiled, calque, collision ou donnée de mission n’a été changé.

## Captures Chrome

- [Terrain seul 1280×720](captures/level-01-tile-seams-terrain-only-1280x720.png)
- [Vue décorée 1280×720](captures/level-01-tile-seams-1280x720.png)
- [Sable rapproché](captures/level-01-tile-seams-sand-closeup.png)
- [Rivage rapproché](captures/level-01-tile-seams-shoreline-closeup.png)

Les recadrages sont issus d’une capture Chrome réelle du niveau 1. Le terrain
seul a été capturé avec un mode QA temporaire qui masque les sprites et les
décorations ; ce mode a été retiré du code après la capture.

## Vérifications réellement exécutées

- `npm test` : **67/67 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS** ; seul l’avertissement connu de taille du chunk
  Phaser reste affiché.
- QA Chrome finale du niveau 1 en 1280×720 : **PASS**, niveau rendu et FPS
  mesurés à 52.

## Résultat et limites

Les fonds carrés des motifs terrestres ne sont plus visibles dans les captures
de contrôle. La grille logique 32×32 reste naturellement présente dans la
carte Tiled, mais les raccords visuels sont maintenant continus à l’échelle du
jeu.

La référence conceptuelle reste plus détaillée qu’un atlas de 24 tuiles ; cette
micro-tâche ne devait pas ajouter de nouvelles décorations ni modifier la
composition.

## État

Correction terminée localement. Aucun commit et aucun push n’ont été effectués.
