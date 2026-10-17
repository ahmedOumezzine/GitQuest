# GitQuest — Rework visuel du niveau 1

Date : 17 octobre 2026  
Périmètre : `level-01` / Plage des Origines uniquement

## Résultat

La carte conserve son rendu jouable par couches Tiled et son parcours de mission. La passe remplace les props géométriques les plus faibles par des illustrations pixel art locales, agrandit la lisibilité de la caméra et densifie les points d’intérêt sans ajouter de GameObject par tuile.

Le niveau 1 utilise toujours :

- `Ground` pour les tuiles 32×32 ;
- `Decorations` pour les éléments visuels ;
- `Collisions` pour les murs et l’océan ;
- `Objects` pour les spawns, les objets de quête et la porte.

Les identifiants des objets de progression (`player-spawn`, `midou`, `memory-crystal`, `origin-chest`, `origin-scroll`, `exit-gate`) n’ont pas été modifiés. GitSimulator, QuestManager, SaveManager, l’inventaire et les niveaux 2 à 6 n’ont pas été modifiés.

## Assets créés

Les nouveaux PNG transparents sont documentés dans [public/assets/ASSETS.md](../public/assets/ASSETS.md) :

- `level-01-palm-v1.png` ;
- `level-01-rock-garden-v1.png` ;
- `level-01-ruin-garden-v1.png` ;
- `level-01-shrine-v1.png` ;
- `level-01-player-v1.png` ;
- `level-01-midou-v1.png`.

Ils ont été générés localement avec l’outil d’image intégré, sans URL ni asset tiers. Leur licence de distribution commerciale reste à confirmer ; ils ne sont donc pas déclarés CC0.

## Changements réalisés

### Carte et composition

- Les décorations principales de la carte utilisent maintenant des variantes riches : palmiers, ruines, rochers et sanctuaire.
- Le sanctuaire Git est un point focal identifiable avec un symbole lumineux, une végétation dense et un label localisé.
- Des fleurs, herbes, coquillages et vagues supplémentaires ont été ajoutés à la couche `Decorations` de la carte Tiled.
- Les anciennes bandes de chemin artificielles ont été retirées de la couche `Ground` en les remplaçant par des tuiles de sable clair ; les collisions et les points de progression restent inchangés.
- Les couches restent ouvrables dans Tiled et le JSON reste validé par `LevelManager`.

### Caméra et personnages

- La caméra suit toujours le joueur, avec un zoom de `1.42` sur desktop et `1.20` en mode compact/portrait.
- Le niveau ne présente plus la carte entière sur desktop.
- Le joueur et Midou utilisent des rendus raster lisibles avec ombres au sol et mouvement d’ambiance léger.
- Les spritesheets 4 directions restent chargées comme source d’animation et de physique ; les nouveaux rendus raster servent à la lisibilité visuelle. Une future passe pourra fournir une spritesheet raster 4 directions cohérente pour supprimer cette séparation.
- Les collisions de l’océan restent calculées à partir des tuiles `Ground` dont le gid vaut `3`.

### HUD

- Sur le niveau 1, le titre, l’objectif et l’XP sont légèrement agrandis sans augmenter la surface occupée.
- Le HUD conserve le journal, l’inventaire, le terminal et les contrôles clavier/tactiles existants.

## Vérifications réalisées

### Tests automatisés

- `npm test` : **42/42 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**.
- `npm run qa:browser` : **PASS**, parcours complet menu → niveau 1 → niveaux 2 à 6, commandes Git, récompenses, portes, victoire, sauvegarde et reprise.

### Captures Chrome réelles

Les captures ont été produites après la fin du fondu de scène :

- [1280×720](C:/Users/ahmed/.codex/visualizations/2026/10/17/01a14819-106c-7ea1-b7f5-67a70c0d1e2b/level1-final-1280x720.png)
- [844×390](C:/Users/ahmed/.codex/visualizations/2026/10/17/01a14819-106c-7ea1-b7f5-67a70c0d1e2b/level1-final-844x390.png)
- [390×844](C:/Users/ahmed/.codex/visualizations/2026/10/17/01a14819-106c-7ea1-b7f5-67a70c0d1e2b/level1-final-390x844.png)

Les trois rendus affichent la carte, le HUD, les personnages, les collisions de rive et le sanctuaire. Le smoke test desktop vérifie également le parcours réel de mission et la non-régression des niveaux 2 à 6.

## Limites restantes

- Le sol reste fondé sur le tileset SVG local existant ; il est plus lisible mais n’est pas encore un pack de transitions de côte complet de qualité commerciale.
- Les captures mobiles non tactiles masquent correctement les contrôles tactiles conformément au mode automatique. L’émulation tactile et les gestes doivent encore être vérifiés manuellement sur un appareil réel.
- Les personnages disposent d’un rendu raster plus lisible, mais les quatre directions animées restent portées par les spritesheets 32×32 historiques. Une spritesheet raster dédiée est nécessaire pour obtenir une cohérence artistique parfaite pendant la marche.
- Une partie de l’espace sable reste volontairement ouverte pour préserver la circulation et l’accessibilité des objets de mission.

## Critère de sortie de cette passe

La passe est techniquement intégrée et jouable, avec une amélioration visuelle immédiatement visible. Elle ne doit pas être considérée comme une validation artistique commerciale finale tant que le tileset de terrain et la spritesheet raster directionnelle n’ont pas été produits et validés.
