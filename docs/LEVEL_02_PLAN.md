# GitQuest — Niveau 2 : plan de rework visuel et technique

**Périmètre :** Forêt des Fichiers (`level-02`) uniquement  
**Étape exécutée dans cette passe :** mini-tâche 1/4 — rework visuel de la région  
**Date :** 18 octobre 2026

## 1. Audit de l’existant

### Données du niveau

`public/data/levels/level-02.json` est la source des règles de progression :

- mission `quest-02`, commande `add` et étape de dialogue `midou-02` ;
- objets `forest-crystal`, `forest-scroll`, `forest-chest` et le passage secret ;
- clé `pass-key` portée par `forest-chest` ;
- sortie `exit-gate` vers le niveau 3.

Ces données ne sont pas modifiées dans la mini-tâche 1.

### Carte Tiled

`public/data/maps/level-02.json` mesure `30 × 17` tuiles de `32 × 32`, soit
`960 × 544` pixels. Elle contient les quatre couches attendues :

- `Ground` : 510 GID, rendu par `forest-tileset.tsx` ;
- `Decorations` : arbres, racines, fougères, fleurs, champignons, ruines,
  caisse, sanctuaire et canopée ;
- `Collisions` : quatre rectangles (`wall-a` à `wall-d`) ;
- `Objects` : `player-spawn`, `midou` et `exit-gate`.

Les coordonnées et identifiants métier restent inchangés. Les collisions sont
créées exclusivement depuis la couche Tiled `Collisions` dans `WorldScene`.

### Rendu Phaser

`WorldScene.drawForestWorld()` conserve le Tilemap Tiled comme couche jouable,
mais utilise `backgrounds/level-02-forest.png` comme profondeur décorative. Les
assets de premier plan sont des PNG locaux détaillés chargés par
`AssetManifest.assetsForLevel('level-02')`. Le rendu ne crée pas un objet Phaser
par tuile : seule la Tilemap est instanciée, les sprites sont limités aux
éléments de la couche `Decorations`.

### Référence niveau 1

Le niveau 1 final sert de référence d’architecture : carte Tiled pour les
ancres et collisions, assets raster locaux pour les points d’intérêt, ombres
séparées, profondeur contrôlée et caméra suivie. Le niveau 2 reprend ce modèle
sans toucher aux scènes métier, au simulateur Git, aux quêtes ou aux sauvegardes.

## 2. Direction artistique retenue

- forêt tropicale humide, avec palette émeraude, mousse, terre chaude et lumière
  filtrée par la canopée ;
- chemin lisible entre l’entrée/Midou, la clairière du sanctuaire, les objets
  optionnels, le coffre et la porte ;
- arbres et ruines utilisés comme repères de composition, sans masquer les
  interactions ;
- profondeur en trois familles : canopée lointaine, décor ancré au sol et
  acteurs/objets interactifs ;
- animations très légères limitées à la canopée et à la végétation existante.

Les PNG forestiers déjà présents sont réutilisés. Aucun asset tiers ou URL
externe n’est ajouté. Leur provenance est documentée dans `public/assets/ASSETS.md`;
la licence finale de distribution commerciale reste à confirmer.

## 3. Découpage des mini-tâches

1. **Rework visuel de la forêt — cette passe** : composition, texture Tiled
   discrète, profondeur et intégration au sol.
2. **Professeur Octo** : NPC, portrait, interaction et dialogue pédagogique.
3. **Cours `git add`** : terminal, explication et séquence de mission.
4. **Quiz et validation** : quiz data-driven, récompenses idempotentes et
   certification complète du passage vers le niveau 3.

Les mini-tâches 2 à 4 ne sont pas implémentées ici.

## 4. Critères d’acceptation de la mini-tâche 1

- le niveau 2 charge depuis son JSON sans exception ;
- les quatre couches Tiled et les trois ancres de base sont présentes ;
- les collisions et les objets de progression conservent leurs coordonnées ;
- le décor forestier n’est pas un damier dominant et les props ont une ombre et
  une profondeur cohérentes ;
- le joueur, Midou, le sanctuaire, le coffre et la porte restent visibles et
  accessibles dans les formats desktop et mobile ;
- `npm test`, `npm run typecheck`, `npm run build` et `npm run qa` passent.

