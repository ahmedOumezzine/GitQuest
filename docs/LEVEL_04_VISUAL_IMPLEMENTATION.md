# Niveau 4 — Port des Connexions

## Périmètre

Cette étape ajoute uniquement la première implémentation visuelle jouable du niveau 4.
La mission `git push` / `git pull`, les identifiants de progression, le terminal, les
récompenses et les règles de sauvegarde restent ceux des données existantes.

## Carte et rendu

- `public/data/maps/level-04.json` possède maintenant un `Ground` complet de 30×17,
  les couches Tiled `Ground`, `Decorations`, `Collisions` et `Objects`, et conserve les
  ancres `player-spawn`, `midou` et `exit-gate`.
- Le chemin central relie l'arrivée, le repère push-pull, le coffre régional et la
  sortie. Les quais, le phare, les lanternes, les cargaisons et les balises restent des
  objets de décoration séparés des collisions.
- `WorldScene` utilise le fond régional sous la couche Tiled, un atlas de terrain à
  faible opacité, une caméra dédiée au port et une porte distincte avec états fermé/ouvert.

## Assets locaux

Les assets du port sont documentés dans `public/assets/ASSETS.md`. L'atlas et la planche
de props ont été générés localement puis normalisés/découpés en PNG ; aucune URL externe
ou image complète interactive n'est utilisée. La licence de distribution commerciale
des images générées reste à confirmer avant publication.

## Intégration gameplay

- Le cristal métier est rendu comme une balise de connexion locale.
- Le parchemin métier est rendu comme une balise distante.
- Le coffre métier utilise une caisse de port et conserve son identifiant `harbor-chest`.
- La porte utilise `harbor-gate-closed` puis `harbor-gate-open`, sans changement de
  condition d'ouverture.

## Vérifications réalisées

- `npm test` : **46/46** ; le test de carte du port vérifie le terrain, l'atlas Tiled
  et les landmarks push-pull.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS** ; l'avertissement existant sur le gros chunk Phaser reste
  présent mais ne bloque pas le build.
- `npm run qa:browser` niveau 4 : **PASS**, avec FPS mesuré à 57.00 sur le scénario
  ciblé après correction de la collision.
- `npm run qa` : **PASS** pour le menu, les paramètres, RTL, les niveaux 1 à 6, les
  commandes Git, les récompenses, les portes, la victoire, la sauvegarde et la reprise.
- Captures Chrome réelles :
  - [`level-04-1280x720.png`](captures/level-04-1280x720.png) — desktop, 57.05 FPS ;
  - [`level-04-844x390.png`](captures/level-04-844x390.png) — paysage, 58.99 FPS ;
  - [`level-04-390x844.png`](captures/level-04-390x844.png) — portrait, 58.04 FPS.

La première QA complète a détecté que `wall-b` bloquait le trajet vers le coffre à
l'approche de son angle. Sa position a été descendue de `y=350` à `y=410` dans la
carte Tiled pour conserver le quai tout en ouvrant le passage supérieur. Le parcours
complet a ensuite été rejoué avec succès.

## Limites connues

Le niveau utilise encore la composition de fond raster existante pour les grands plans.
Les collisions restent des rectangles Tiled afin de ne pas modifier les règles de mission.
Les PNG générés restent soumis à une validation de licence avant distribution commerciale.
