# GitQuest — Niveau 3 : Grotte des Souvenirs

**Région :** Grotte des Souvenirs  
**Identifiant :** `level-03`  
**Date :** 17 octobre 2026  
**Périmètre :** niveau 3 uniquement

## Résultat

Le niveau 3 dispose maintenant d’un terrain Tiled rocheux rempli sur une grille
de `30 × 17` tuiles de `32 × 32`, soit `960 × 544` pixels. Sa palette indigo,
violette et cyan s’appuie sur le fond de grotte local existant, avec des
cristaux, des torches, une tablette mémoire, un autel de commit et une porte
basaltique distincte.

La définition de mission `git commit`, le terminal, les récompenses, les
sauvegardes et les conditions de sortie restent inchangés.

## Carte Tiled

Fichier modifié : `public/data/maps/level-03.json`.

- La couche `Ground` contient maintenant 510 GID valides.
- Le tileset local `../../assets/tilesets/cave-tileset.tsx` est référencé avec
  `firstgid: 1`.
- Les couches `Ground`, `Decorations`, `Collisions` et `Objects` sont conservées.
- Les ancres `player-spawn`, `midou` et `exit-gate` gardent leurs identifiants
  et coordonnées métier.
- Les décorations régionales ajoutées sont les stalactites, cristaux, torches,
  tablette, autel et lianes.
- Le mur inférieur a été abaissé et le mur est décalé pour laisser un itinéraire
  praticable entre le cristal, le terminal et le coffre sans supprimer les
  barrières de la grotte.

## Assets créés

- `public/assets/tilesets/cave-tileset-v1.png`
- `public/assets/tilesets/cave-tileset.tsx`
- `public/assets/sprites/cave/` : cristaux, stalactites, torches, tablette,
  autel, coffre, porte fermée/ouvert, flaques, rochers et détails d’ambiance.

La provenance et le statut de licence sont documentés dans
`public/assets/ASSETS.md`. Les images sont locales et aucune URL tierce n’a été
ajoutée. La validation finale d’une licence de distribution commerciale reste
à effectuer avant publication.

## Intégration Phaser

- `AssetManifest` charge l’atlas et les props de la grotte.
- `LegacyWorldStyle` expose un profil `cave` data-driven avec ses textures de
  porte et son atlas Tiled.
- `WorldScene` réutilise le rendu régional, le suivi caméra, les ombres, les
  animations du joueur/Midou et les états de porte existants.
- Les objets de quête utilisent des visuels régionaux : cristal cyan, tablette
  mémoire et coffre d’archives.
- L’autel de commit reçoit un label de sanctuaire localisé sans modifier la
  mission.
- Le zoom est adapté au desktop, au paysage compact et au portrait.

## Validation Chrome

- [Niveau 3 — 1280×720](C:/Users/ahmed/source/repos/GitQuest/docs/captures/level-03-1280x720.png) — FPS observé : 57.
- QA direct 844×390 — PASS, FPS observé : 57.
- QA direct 390×844 — PASS, FPS observé : 57.
- Capture desktop vérifiée visuellement : Midou, cristal, autel de commit,
  coffre et porte basaltique sont lisibles dans la composition.

## Parcours et non-régression

- Niveau 2 → niveau 3 : PASS.
- Interaction Midou et objectif `talk-midou` : PASS.
- Commande `git commit` : PASS dans le parcours navigateur complet.
- Coffre, XP, clé et porte : PASS.
- Porte verrouillée avant la fin de la mission : PASS.
- Passage niveau 3 → niveau 4 : PASS.
- Sauvegarde, reprise et victoire des niveaux suivants : PASS via le QA complet.

## Tests

- `npm test` : **45/45 PASS** après ajout du test de carte du niveau 3.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**, avec uniquement l’avertissement existant sur la
  taille du chunk Phaser.
- `npm run qa` : **PASS** après correction du chemin de collision du niveau 3.

## Limites restantes

- Les assets raster générés localement doivent encore recevoir une validation
  juridique de licence commerciale.
- Les contrôles et performances ont été vérifiés dans Chrome headless et en
  émulation mobile, pas sur un appareil physique.
- Le tileset est détaillé et cohérent, mais une passe Tiled dédiée pourrait
  encore améliorer les autotiles de paroi si une édition manuelle est requise.

Le niveau 3 est jouable et validé techniquement. Les niveaux 4 à 6 restent
inchangés dans cette étape.
