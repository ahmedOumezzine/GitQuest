# Assets locaux

Les sprites SVG présents dans ce dossier sont des assets pixel-art originaux créés localement pour GitQuest. Ils ne proviennent d'aucune URL externe et ne prétendent pas être des assets CC0 tiers.

`tilesets/beach-tileset.svg` et les sprites `palm.svg`, `rock.svg`, `grass.svg`, `ruin.svg`, `shrine.svg` et `wave.svg` constituent l'habillage local du niveau 1. Ils utilisent une grille de 32×32 pour les tuiles et peuvent être remplacés ultérieurement par un pack CC0 documenté.

Les cartes Tiled exposent les couches Ground, Decorations, Collisions et Objects. Le niveau 1 utilise actuellement une couche Ground remplie et des objets de décoration typés rendus par `WorldScene`.

Les musiques et bruitages ne sont pas encore fournis dans cette base. L’interface indique explicitement leur indisponibilité ; aucun `AudioManager` ni réglage audio actif n’est prétendu comme terminé.

Le manifeste de chargement Phaser est centralisé dans `src/data/AssetManifest.ts`. Le test `tests/AssetManifest.test.ts` vérifie que chaque fichier demandé par `PreloadScene` existe dans `public/assets` et que les spritesheets utilisent une grille de 32×32.

## Assets UI — Phase 3, étape B

Les fichiers `ui/menu-background.svg`, `ui/menu-logo.svg`, `ui/menu-subtitle.svg`, `ui/menu-button-gold.svg`, `ui/menu-button-navy.svg` et `ui/menu-panel.svg` ont été créés localement pour GitQuest pendant l’étape B.

Ils ne proviennent d’aucune URL externe, d’aucun pack tiers et d’aucune image de référence copiée. Leur licence de tierce partie ne s’applique donc pas ; ils sont des créations originales du projet. La licence de distribution finale des assets doit toutefois être confirmée séparément avant publication d’un pack artistique.

Ces assets sont uniquement utilisés comme décor et contrôles visuels du menu/paramètres. Aucun asset UI n’est utilisé comme carte jouable ou comme surface cliquable complète : les interactions restent portées par `PixelButton` et les composants Phaser.

## Assets UI — Phase 3, étape B.2

`ui/menu-background-v2.png` est un fond raster pixel-art original généré pour GitQuest avec l’outil de génération d’images intégré à l’environnement Codex, puis copié localement dans le dépôt. Il ne contient aucun texte, logo, bouton ou élément interactif. Il est utilisé uniquement comme décor du menu.

La scène Phaser conserve des couches séparées au-dessus de ce fond : vagues animées, ombres et sprites du joueur/Midou. Le fond est donc remplaçable sans modifier les contrôles ni la navigation.

Provenance : génération originale pour GitQuest, 17 octobre 2026. Aucun asset tiers, URL externe ou image de référence copiée n’a été intégré. La licence de distribution finale des images générées doit être confirmée selon la politique de distribution du projet avant publication commerciale.

## Fonds de régions legacy — Phase 3 D / passe artistique

Les fonds raster suivants ont été générés localement pour remplacer les grandes surfaces géométriques des niveaux 2 à 6 :

| Fichier | Région | Rôle | Provenance/licence |
|---|---|---|---|
| `backgrounds/level-02-forest.png` | Forêt des Fichiers | couche décorative non interactive | génération originale Codex, 17 octobre 2026 ; licence de distribution finale à confirmer |
| `backgrounds/level-03-cave.png` | Grotte des Souvenirs | couche décorative non interactive | génération originale Codex, 17 octobre 2026 ; licence de distribution finale à confirmer |
| `backgrounds/level-04-harbor.png` | Port des Connexions | couche décorative non interactive | génération originale Codex, 17 octobre 2026 ; licence de distribution finale à confirmer |
| `backgrounds/level-05-mountain.png` | Montagne des Branches | couche décorative non interactive | génération originale Codex, 17 octobre 2026 ; licence de distribution finale à confirmer |
| `backgrounds/level-06-castle.png` | Château des Conflits | couche décorative non interactive | génération originale Codex, 17 octobre 2026 ; licence de distribution finale à confirmer |

Ces images ne portent ni texte, ni bouton, ni collision, ni objet de quête. `WorldScene` les rend sous les chemins, obstacles et sprites existants ; elles ne remplacent pas les cartes JSON Tiled. Leur licence doit être validée avant une distribution commerciale.
