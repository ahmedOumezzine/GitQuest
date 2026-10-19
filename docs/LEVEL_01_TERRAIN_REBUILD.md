# Niveau 1 — Reconstruction du terrain

## Périmètre

Cette intervention concerne uniquement la Plage des Origines (`level-01`). Les
niveaux 2 à 6, `GitSimulator`, `QuestManager`, `SaveManager`, l’inventaire et
les règles de progression n’ont pas été modifiés.

## Audit initial

- Carte Tiled : `public/data/maps/level-01.json`.
- Dimensions : 48 × 30 tuiles, 32 × 32 pixels, soit 1536 × 960 pixels.
- Couches conservées : `Ground`, `Decorations`, `Collisions`, `Objects`.
- Tileset local : `public/assets/tilesets/beach-tileset-v2.svg`, déclaré par
  `public/assets/tilesets/beach-tileset.tsx`.
- Atlas disponible : 24 tuiles locales de 32 × 32 : sable, eau, sable humide,
  transitions d’écume, galets, pierres, chemin, fleurs, coquillages et huit
  transitions directionnelles de côte.
- Avant la reconstruction, le `Ground` formait principalement un rectangle de
  sable entre deux bandes d’eau horizontales. Les vagues décoratives autonomes
  pouvaient apparaître loin du contact eau/plage ou au-dessus d’un décor.
- Le rendu est toujours piloté par Tiled pour le terrain et par les objets
  Tiled pour les ancres de gameplay. `WorldScene` ne remplace pas la carte par
  une image statique.

## Reconstruction appliquée

Le `Ground` est maintenant une île irrégulière à silhouette continue, composée
de plusieurs avancées et retraits de côte :

- bords nord et sud asymétriques ;
- retraits de côte irréguliers sur les quatre côtés ;
- aucune poche d’eau rectangulaire à l’intérieur du sable ;
- transitions de rive avec les GID 17 à 24, sélectionnées selon la direction
  (droite, gauche, haut, bas et coins) ;
- variations sobres avec sable clair, galets, corail et coquillages ;
- eau profonde conservée en GID 3, qui reste la source de vérité des collisions.

Les objets de progression restent identifiables et accessibles :

| Élément | Identifiant / position finale |
| --- | --- |
| Joueur | `player-spawn`, (760, 410) |
| Midou | `midou`, (460, 340) |
| Porte | `exit-gate`, (900, 270) |
| Sanctuaire | `git-shrine`, avec son aura conservée |
| Cristal | `memory-crystal`, (210, 405) |
| Coffre | `origin-chest`, (480, 540) |

Le cristal a été décalé de 155 à 210 pixels parce que l’ancienne position se
trouvait sur la lèvre physique d’une crique : le joueur pouvait voir l’objet,
mais son corps s’arrêtait avant la zone d’interaction. Son identifiant, son XP
et ses conditions de quête sont inchangés.

Les anciennes vagues et nappes d’écume libres ont été retirées de la couche
`Decorations`. L’overlay de rive de `WorldScene` ne peint désormais l’écume que
sur les cases terrestres réellement adjacentes à l’eau. Les éléments de rivage
(`beach-rocks`, `beach-shells`, bateau et ponton) ont une profondeur dédiée,
inférieure aux palmiers et aux ruines, afin d’éviter les vagues au-dessus des
canopées.

## Collisions et caméra

- Les collisions d’eau continuent d’être générées uniquement à partir des
  cases GID 3.
- Les transitions de sable humide restent traversables ; l’eau profonde ne
  l’est pas.
- Le joueur et Midou restent sur des cases terrestres.
- La caméra suit le joueur et respecte les dimensions de la carte.
- Midou a été abaissé à `y = 340` pour ne plus être recouvert par le panneau de
  mission en paysage compact.

## Captures Chrome

Captures finales produites après la reconstruction :

- [Terrain seul, Decorations masquées, 1280×720](captures/level-01-terrain-only-1280x720.png)
- [Vue générale 1280×720](captures/level-01-terrain-rebuild-1280x720.png)
- [Vue large 1908×900 — bateau et ponton](captures/level-01-terrain-rebuild-1908x900.png)
- [Paysage tactile 844×390](captures/level-01-terrain-rebuild-844x390.png)
- [Portrait tactile 390×844](captures/level-01-terrain-rebuild-390x844.png)
- [Midou et son interaction](captures/level-01-terrain-rebuild-midou-1280x720.png)
- [Porte verrouillée](captures/level-01-terrain-rebuild-gate-locked-1280x720.png)
- [Porte ouverte après la mission](captures/level-01-terrain-rebuild-gate-open-1280x720.png)

Les vues larges montrent le nouveau contour d’île, les criques, le bateau et le
ponton. Les vues mobiles vérifient que la carte reste rendue et que les
contrôles tactiles restent actifs.

## Vérifications réellement exécutées

- `npm test` : **67/67 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**. Vite conserve seulement l’avertissement connu de
  taille du chunk Phaser (~1,2 Mo minifié).
- QA navigateur ciblée niveau 1 : **PASS** en 1280×720, 1908×900,
  844×390 tactile et 390×844 tactile.
- FPS mesurés par le runner : **47,00**, **33,87**, **52,00** et **44,27** selon
  les quatre vues.
- `npm run qa` complet : **PASS** après relance sur un port explicite : menu,
  paramètres, RTL, niveaux 1 à 6, commandes Git, récompenses, portes, victoire,
  sauvegarde et reprise.

Une première tentative de `npm run qa` sur les ports par défaut n’a pas démarré
car 5181/5182 étaient déjà occupés ; elle a été relancée sur 5233 avec succès.

## Comparaison avec la référence et limites

La forme de l’île n’est plus une grande dalle rectangulaire : le rivage est
irrégulier, l’eau entoure la plage, les criques sont reliées à l’océan et le
bateau/ponton sont placés dans une zone côtière cohérente. La zone de Midou et
les passages de mission sont également plus fiables.

La référence reste artistiquement plus riche que l’atlas local actuel. Le
tileset fourni est un atlas SVG original de 16 tuiles, pas un pack raster
professionnel complet avec autotiling avancé ; les textures du sol restent
donc plus simples que les ruines et les sprites. Cette étape ne prétend pas
atteindre une fidélité pixel-par-pixel à la référence et n’a pas inventé de
nouveaux assets externes.

## État de livraison

Validation locale terminée. Aucun commit et aucun push n’ont été effectués,
conformément à la demande d’arrêter avant publication.
