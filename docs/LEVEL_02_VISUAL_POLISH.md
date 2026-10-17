# GitQuest — Niveau 2 : correction visuelle et caméra

**Région :** Forêt des Fichiers  
**Identifiant :** `level-02`  
**Date :** 17 octobre 2026  
**Périmètre :** niveau 2 uniquement

## Résultat

La Forêt des Fichiers ne se présente plus comme un petit rectangle de tuiles
posé dans un fond vide. La composition forestière détaillée existante est
maintenant le plan visuel principal, tandis que la couche `Ground` Tiled reste
rendue comme une texture légère. Les chemins, la cascade, le sanctuaire, la
végétation et les ruines forment une scène continue sans damier dominant.

Les missions, les objets, les collisions, les identifiants Tiled, les
conditions de la porte et la transition vers le niveau 3 n'ont pas été modifiés.

## Causes identifiées

| Problème | Cause | Correction |
| --- | --- | --- |
| Zone vide autour de la carte | La carte mesure `30 × 17` tuiles de `32 × 32`, soit `960 × 544`, alors que le viewport était cadré sans zoom régional adapté. | Bounds Phaser conservés sur `960 × 544`, suivi du joueur conservé, zoom forestier différencié par format. |
| Effet damier | Les 510 GID du Ground utilisaient une variation trop régulière et très contrastée de l'atlas. | Le fond forestier détaillé est opaque et la couche Ground Tiled est une passe de texture à alpha `0.14`, sans supprimer le Tilemap ni les données de collision. |
| Joueur proche du bord gauche | Le suivi était correct, mais le spawn initial et le cadrage compact plaçaient Midou sous le HUD. | Décalage de suivi vertical de `78` en paysage compact ; le spawn et les bounds ne changent pas. |
| Porte peu lisible | L'ancre `exit-gate` est proche de la limite est et son illustration débordait visuellement. | Porte forestière réduite à `118 × 124`, label repositionné vers l'intérieur de la carte, texture fermée/ou ouverte et aura conservées. |
| HUD trop discret | Les tailles par défaut étaient celles des niveaux legacy. | Le niveau 2 utilise un titre, un objectif, des statistiques et une barre XP plus lisibles ; le portrait utilise une taille compacte pour éviter tout chevauchement. |

## Fichiers modifiés

- `src/scenes/WorldScene.ts`
  - composition visuelle forestière avec le fond local détaillé ;
  - couche Ground Tiled conservée, transparente visuellement mais toujours
    instanciée comme Tilemap ;
  - cadrage compact corrigé ;
  - porte et libellé repositionnés sans changer son ancre ni ses conditions.
- `src/scenes/UIScene.ts`
  - hiérarchie typographique spécifique au niveau 2 ;
  - XP et barre de progression plus lisibles ;
  - adaptation portrait sans modifier les autres niveaux.
- `scripts/browser-smoke.mjs`
  - captures optionnelles de Midou, du sanctuaire et de la porte verrouillée ;
  - capture de la porte ouverte pendant le vrai parcours du niveau 2.
- `docs/LEVEL_02_VISUAL_POLISH.md`
  - présent rapport.

Les cartes Tiled, les données de mission et les niveaux 1, 3, 4, 5 et 6 n'ont
pas été modifiés dans cette passe.

## Captures Chrome réelles

### Formats demandés

- [1280×720](C:/Users/ahmed/source/repos/GitQuest/docs/captures/level-02-polish-1280x720.png) — niveau rendu, FPS observé : 56–60.
- [844×390](C:/Users/ahmed/source/repos/GitQuest/docs/captures/level-02-polish-844x390.png) — paysage compact, FPS observé : 57.
- [390×844](C:/Users/ahmed/source/repos/GitQuest/docs/captures/level-02-polish-390x844.png) — portrait, FPS observé : 57.

### Points d'intérêt

- [Joueur près de Midou](C:/Users/ahmed/source/repos/GitQuest/docs/captures/level-02-midou-1280x720.png)
- [Sanctuaire Git add](C:/Users/ahmed/source/repos/GitQuest/docs/captures/level-02-shrine-1280x720.png)
- [Porte verrouillée](C:/Users/ahmed/source/repos/GitQuest/docs/captures/level-02-gate-locked-1280x720.png)
- [Porte ouverte après la mission](C:/Users/ahmed/source/repos/GitQuest/docs/captures/level-02-gate-open-1280x720.png)

Les captures de points d'intérêt sont produites depuis un navigateur Chrome
isolé. La porte ouverte est capturée après `git add`, la collecte du coffre et
l'obtention de `pass-key`, avant l'interaction qui charge le niveau 3.

## Validation fonctionnelle

- Arrivée niveau 1 → niveau 2 : PASS.
- Déplacement et suivi caméra niveau 2 : PASS.
- Collisions Tiled et accès aux objectifs : PASS dans le parcours QA.
- Interaction Midou, terminal et commande `git add .` : PASS.
- Récompense, XP et clé sans double attribution : PASS.
- Porte verrouillée avant la fin de mission : PASS.
- Porte ouverte après `open-exit` et `pass-key` : PASS.
- Passage niveau 2 → niveau 3 : PASS.
- Sauvegarde/reprise après actualisation : PASS.

## Résultats des commandes

- `npm test` : **44/44 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**. Vite signale uniquement l'avertissement déjà
  présent sur la taille du chunk Phaser.
- `npm run qa` : **PASS**. Le parcours navigateur complet couvre le menu, les
  paramètres, le RTL, les six niveaux, les commandes Git, les récompenses, les
  portes, la victoire et la sauvegarde/reprise.
- QA direct niveau 2 : **PASS**, mesures observées entre 56 et 60 FPS selon la
  résolution.

## Limites restantes

- Le fond forestier est un asset raster local détaillé ; la continuité exacte
  des transitions du tileset reste une limite artistique indépendante de la
  logique de jeu.
- Les contrôles ont été vérifiés en Chrome headless et en émulation tactile,
  pas sur un appareil physique réel.
- La licence commerciale finale des assets générés localement doit toujours
  être confirmée avant une publication commerciale ; la provenance est
  documentée dans `public/assets/ASSETS.md`.
- La porte est volontairement proche de la limite est de la carte, mais son
  label est maintenant maintenu dans la zone visible de la composition.

Cette passe s'arrête au niveau 2. Les niveaux 3 à 6 restent inchangés et le
projet est prêt pour une validation artistique avant toute nouvelle région.
