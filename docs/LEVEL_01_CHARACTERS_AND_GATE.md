# GitQuest — Niveau 1 : personnages et porte de sortie

Date : 17 octobre 2026  
Périmètre : `level-01` / Plage des Origines uniquement

Cette passe améliore la lisibilité de Midou, du joueur et de l’objet Tiled `exit-gate`. Les niveaux 2 à 6, GitSimulator, QuestManager, SaveManager et les conditions métier de progression restent inchangés.

## Midou

- Midou utilise `level-01-midou-sheet-v1.png`, un atlas raster 3×4 avec repos/marche dans les quatre directions.
- L’animation d’attente utilise une cadence lente et conserve la direction `down` au repos initial.
- Une ombre au sol conserve son ancrage malgré l’animation.
- Le nom localisé `Midou` / `ميدو` apparaît seulement dans un rayon de proximité de 150 px.
- L’indicateur `✦ E` apparaît uniquement lorsqu’un élément interactif est à portée ; il ne recouvre pas le sprite.
- L’identifiant Tiled `midou` et le dialogue `midou-01` sont inchangés.

## Joueur

- Le joueur utilise `level-01-player-sheet-v1.png`, sans illustration statique pendant le déplacement.
- Les quatre animations `level-01-player-walk-down`, `left`, `up` et `right` sont créées par `PreloadScene`.
- Le dernier sens de déplacement est conservé lorsque le joueur s’arrête via la frame centrale de repos.
- Le corps Arcade est limité à la zone des pieds et reste compatible avec les collisions Tiled.
- Une ombre indépendante améliore la lecture de la position sur le sable.

## Porte de sortie

L’objet métier reste précisément l’objet Tiled :

- carte : `public/data/maps/level-01.json` ;
- nom : `exit-gate` ;
- type : `door` ;
- coordonnées : `(900, 270)` ;
- condition : étape `open-exit` et présence de `pass-key`.

L’asset `public/assets/sprites/level-01-gate-v1.png` remplace la petite grille générique pour le niveau 1. Il représente une porte de ruines distincte du sanctuaire : arche de pierre, végétation, porte fermée sombre et symbole Git lumineux.

États visuels :

- verrouillée : teinte assombrie, aura inactive, label `Porte des archives` visible lorsqu’elle est dans la vue ;
- accessible : teinte normale, aura cyan pulsée discrètement et objectif HUD `Ouvrir la porte` ;
- ouverte : effet `✦ Porte ouverte`, suppression de la clé et transition vers le niveau 2.

L’interaction avant la fin de la mission affiche une explication localisée :

- FR : « La porte restera fermée jusqu’à la mission validée et la clé de passage. »
- EN : équivalent traduit dans `I18nManager` ;
- AR : équivalent traduit avec la direction RTL existante.

## Assets et provenance

Les assets sont documentés dans [public/assets/ASSETS.md](../public/assets/ASSETS.md) :

- `sprites/level-01-player-sheet-v1.png` ;
- `sprites/level-01-midou-sheet-v1.png` ;
- `sprites/level-01-gate-v1.png`.

Les sprites raster ont été générés localement puis copiés dans `public/assets`. Aucun lien externe ni asset tiers non vérifié n’a été ajouté. La licence de distribution commerciale des images générées doit encore être confirmée.

## Captures Chrome réelles

- [Midou et le joueur](C:/Users/ahmed/.codex/visualizations/2026/10/17/01a14819-106c-7ea1-b7f5-67a70d0c1e2b/level1-midou-player.png)
- [Porte verrouillée](C:/Users/ahmed/.codex/visualizations/2026/10/17/01a14819-106c-7ea1-b7f5-67a70d0c1e2b/level1-gate-locked.png)
- [Porte accessible après la clé](C:/Users/ahmed/.codex/visualizations/2026/10/17/01a14819-106c-7ea1-b7f5-67a70d0c1e2b/level1-gate-open.png)

Les captures ont été produites pendant un parcours réel avec Chrome headless via CDP. La capture Midou montre les deux personnages séparés, le nom de Midou et l’indicateur d’interaction. Les captures de porte montrent respectivement le toast localisé de verrouillage et l’état ouvert avec l’objectif `Ouvrir la porte`.

## Tests effectués

- `npm test` : **43/43 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**, avec l’avertissement attendu sur la taille du chunk Phaser.
- `npm run qa` : **PASS**.
- Parcours QA : nouvelle partie, introduction, interaction Midou, cristal, `git init`, coffre, clé, porte verrouillée, porte accessible, niveau 2, sauvegarde et reprise.
- Animations directionnelles du joueur déjà couvertes par `GITQUEST_QA_ANIMATION=1` dans le smoke test niveau 1.
- Niveau 1 vérifié dans Chrome à `1280×720`, `844×390` et `390×844` : **PASS**.
- Contrôles tactiles vérifiés en émulation sur `844×390` : **PASS**.

## Limites restantes

- La spritesheet raster conserve une direction artistique cohérente avec Midou et les décors, mais elle reste un asset généré localement dont la licence finale doit être validée.
- Le label de la porte est volontairement court et reste placé dans le monde ; l’explication détaillée apparaît au moment de l’interaction verrouillée.
- La porte utilise un même asset de base avec teinte et aura Phaser pour ses états ; une future production artistique pourrait fournir des frames raster dédiées verrouillée/ouverture/ouvert.
- La vérification tactile a été faite en émulation Chrome, pas sur un appareil physique.

La passe s’arrête ici conformément au périmètre demandé : aucun niveau 2 à 6 n’a été modifié dans les données ou les assets de région.
