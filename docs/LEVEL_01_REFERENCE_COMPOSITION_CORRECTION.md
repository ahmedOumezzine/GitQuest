# Niveau 1 — Correction de composition par rapport à la référence

## Objectif

Cette passe corrige l’écart de composition observé dans la capture du niveau 1. Elle ne modifie ni les règles Git, ni les quêtes, ni les six niveaux : seules les ancres spatiales du niveau 1 et les routes QA ont été ajustées.

## Changements appliqués

- Joueur déplacé de `(176,270)` à `(760,410)` : il apparaît maintenant au centre de la plage, comme dans la composition cible.
- Midou déplacé de `(240,210)` à `(460,300)` : il reste à gauche du joueur, mais sa silhouette n’est plus recouverte par le HUD supérieur gauche.
- Sanctuaire Git déplacé de `(520,300)` à `(640,470)`.
- Aura du sanctuaire déplacée de `(504,286)` à `(624,456)`.
- Coffre `origin-chest` déplacé de `(780,390)` à `(480,540)` : il forme désormais un point d’intérêt immédiatement à gauche du sanctuaire, proche de la composition de référence.
- Collision `shrine-pillar` synchronisée avec le nouveau sanctuaire : `(540,470,28,150)`.
- Deux éléments décoratifs ont été écartés du sanctuaire afin de préserver sa lisibilité.
- Douze groupes décoratifs nommés ont été ajoutés sur les zones sûres : palmiers et rochers autour du sanctuaire, végétation à l’est et détails de plage sur l’axe sud. Ils n’ajoutent aucune collision.
- Le zoom desktop est maintenant plus serré (`1.20` sur les écrans larges, environ `1.02–1.10` sur les desktops plus petits) afin de réduire le sable vide tout en conservant le littoral et le bateau dans la composition.
- Les routes QA contournent maintenant le pilier du sanctuaire et la ruine sud au lieu d’utiliser des temporisations fragiles.

Les identifiants conservés sont notamment `player-spawn`, `midou`, `exit-gate`, `git-shrine`, `git-shrine-aura`, `shrine-pillar` et `origin-chest`.

## Comparaison avec la référence

La composition est maintenant structurée comme suit :

```text
Midou + ruines       Porte / ruines       Bateau et littoral

Midou + ruines       Porte / ruines       Bateau et littoral

                         Joueur

                  Sanctuaire Git
             Coffre + végétation / plage
```

Les éléments qui correspondent désormais à la référence sont le joueur central, le sanctuaire centre-bas, le coffre regroupé à gauche du sanctuaire, Midou dégagé du HUD, la porte dans la zone haute droite et le bateau sur le littoral droit. L’océan, les palmiers, les ruines et les assets pixel art locaux restent ceux déjà validés dans la passe précédente.

## Captures vérifiées

- [1280×720](captures/level-01-reference-composition-1280x720.png)
- [1908×900 — comparaison avec la capture fournie](captures/level-01-reference-composition-1908x900.png)
- [844×390 tactile](captures/level-01-reference-composition-844x390.png)
- [390×844 tactile](captures/level-01-reference-composition-390x844.png)

## Validation

- `npm test` : **67/67 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS** ; avertissement connu sur la taille du chunk Phaser.
- QA navigateur niveau 1 1280×720 : **PASS**, FPS mesuré 50,17.
- QA navigateur niveau 1 1908×900 : **PASS**, FPS mesuré 40,00.
- QA navigateur niveau 1 844×390 tactile : **PASS**, FPS mesuré 51,15.
- QA navigateur niveau 1 390×844 tactile : **PASS**, FPS mesuré 52,00.
- Les trois validations ont confirmé le rendu du niveau, la présence des animations et l’absence d’erreurs console bloquantes.

## Limites restantes

Cette correction rapproche fortement la composition du concept fourni, mais ne constitue pas une reproduction pixel-identique : la carte Tiled existante conserve sa géométrie et ses tilesets actuels. Une correspondance encore plus fidèle nécessiterait une nouvelle carte artistique complète et des assets dédiés supplémentaires, ce qui dépasserait une correction de placement et risquerait de modifier le gameplay validé.

Les niveaux 2 à 6 n’ont pas été modifiés.
