# Assets locaux

Les sprites SVG présents dans ce dossier sont des assets pixel-art originaux créés localement pour GitQuest. Ils ne proviennent d'aucune URL externe et ne prétendent pas être des assets CC0 tiers.

`tilesets/beach-tileset.svg` et les sprites `palm.svg`, `rock.svg`, `grass.svg`, `ruin.svg`, `shrine.svg` et `wave.svg` constituent l'habillage local du niveau 1. Ils utilisent une grille de 32×32 pour les tuiles et peuvent être remplacés ultérieurement par un pack CC0 documenté.

Les cartes Tiled exposent les couches Ground, Decorations, Collisions et Objects. Le niveau 1 utilise actuellement une couche Ground remplie et des objets de décoration typés rendus par `WorldScene`.

La musique de fond n’est pas encore fournie. Les effets courts d’interface et de gameplay sont générés localement par `src/audio/AudioManager.ts` via Web Audio : aucun fichier distant, asset tiers ou URL inventée n’est utilisé. L’interface indique séparément que la musique est indisponible et que les effets générés sont actifs.

Le manifeste de chargement Phaser est centralisé dans `src/data/AssetManifest.ts`. Le test `tests/AssetManifest.test.ts` vérifie que chaque fichier demandé par `PreloadScene` existe dans `public/assets` et que les atlas utilisent leur grille déclarée : 32×32 pour les assets historiques et le tileset, 96×96 pour les nouveaux personnages du niveau 1.

## Assets UI — Phase 3, étape B

Les fichiers `ui/menu-background.svg`, `ui/menu-logo.svg`, `ui/menu-subtitle.svg`, `ui/menu-button-gold.svg`, `ui/menu-button-navy.svg` et `ui/menu-panel.svg` ont été créés localement pour GitQuest pendant l’étape B.

Ils ne proviennent d’aucune URL externe, d’aucun pack tiers et d’aucune image de référence copiée. Leur licence de tierce partie ne s’applique donc pas ; ils sont des créations originales du projet. La licence de distribution finale des assets doit toutefois être confirmée séparément avant publication d’un pack artistique.

Ces assets sont uniquement utilisés comme décor et contrôles visuels du menu/paramètres. Aucun asset UI n’est utilisé comme carte jouable ou comme surface cliquable complète : les interactions restent portées par `PixelButton` et les composants Phaser.

## Assets UI — Phase 3, étape B.2

`ui/menu-background-v2.png` est un fond raster pixel-art original généré pour GitQuest avec l’outil de génération d’images intégré à l’environnement Codex, puis copié localement dans le dépôt. Il ne contient aucun texte, logo, bouton ou élément interactif. Il est utilisé uniquement comme décor du menu.

La scène Phaser conserve des couches séparées au-dessus de ce fond : vagues animées, ombres et sprites du joueur/Midou. Le fond est donc remplaçable sans modifier les contrôles ni la navigation.

Provenance : génération originale pour GitQuest, 17 octobre 2026. Aucun asset tiers, URL externe ou image de référence copiée n’a été intégré. La licence de distribution finale des images générées doit être confirmée selon la politique de distribution du projet avant publication commerciale.

## Personnages de présentation — passe raster

`sprites/player-menu-v2.png` et `sprites/midou-menu-v2.png` sont deux illustrations raster transparentes générées localement le 17 octobre 2026 avec l’outil de génération d’images intégré à l’environnement Codex. Elles sont utilisées uniquement pour le menu, le chargement, l’introduction, les dialogues et la victoire ; les spritesheets 32×32 du monde restent inchangées afin de préserver les collisions et les animations de gameplay.

Provenance : génération originale pour GitQuest, sans URL externe, asset tiers ou image de référence copiée. La licence de distribution finale des images générées doit être confirmée avant publication commerciale.

## Menu — composition tropicale finale

La passe artistique finale du menu ajoute trois couches raster locales, séparées des contrôles Phaser :

| Fichier | Rôle | Provenance/licence |
|---|---|---|
| `ui/menu-foreground-v3.png` | plage de premier plan, rochers, coquillages, végétation et fleurs | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `ui/menu-chest-v3.png` | coffre au trésor et feuillage décoratif | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/menu-duo-v3.png` | composition de présentation du joueur et de Midou sur le sable | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/midou-portrait-v3.png` | portrait expressif de Midou pour la boîte de dialogue d’introduction | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |

Ces images possèdent un canal alpha et ne contiennent ni texte, ni bouton, ni zone interactive. Elles sont utilisées uniquement par `TitleScene` pour la composition du menu ; les spritesheets de gameplay et les scènes de niveaux restent inchangés. Elles ne doivent pas être considérées comme sous licence CC0 tant que la validation juridique de distribution n’a pas été effectuée.

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

## Niveau 1 — passe artistique monde `level-01`

Les PNG suivants sont des props et des personnages locaux dédiés à la carte Tiled de la Plage des Origines :

| Fichier | Rôle | Provenance/licence |
|---|---|---|
| `sprites/level-01-palm-v1.png` | groupe de palmiers et végétation | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/level-01-rock-garden-v1.png` | amas de rochers, mousses, fleurs et coquillages | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/level-01-ruin-garden-v1.png` | ruine tropicale détaillée non interactive | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/level-01-shrine-v1.png` | sanctuaire Git principal avec symbole lumineux | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/level-01-player-v1.png` | rendu lisible du personnage joueur dans le monde | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/level-01-midou-v1.png` | rendu lisible de Midou dans le monde | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |

Ces images restent disponibles pour les écrans de présentation, mais le niveau 1 n’utilise plus ces illustrations statiques pour le déplacement. Les collisions, les points d’ancrage et les objets de quête restent séparés.

## Niveau 1 — terrain et spritesheets directionnelles `level-01` — passe finale

| Fichier | Rôle | Provenance/licence |
|---|---|---|
| `tilesets/beach-tileset-v2.svg` | atlas local de 16 tuiles 32×32 : sable sec, sable humide, eau, écume, galets, pierres et détails végétaux | création SVG originale du projet, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `tilesets/beach-tileset.tsx` | définition Tiled de l’atlas v2, 16 colonnes | fichier de configuration du projet, MIT pour le code/outillage |
| `sprites/level-01-player-sheet-v1.png` | atlas raster transparent 3×4 : repos/marche dans les quatre directions | génération originale Codex, 17 octobre 2026, puis normalisation locale en frames 96×96 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/level-01-midou-sheet-v1.png` | atlas raster transparent 3×4 de Midou, mêmes directions et cadence | génération originale Codex, 17 octobre 2026, puis normalisation locale en frames 96×96 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |

Les deux nouveaux atlas sont chargés par `PreloadScene` comme de vraies spritesheets Phaser. `WorldScene` les utilise pour le niveau 1, avec un corps Arcade réduit aux pieds et des ombres séparées. La carte Tiled reste la surface jouable : aucun PNG ne remplace le sol, les collisions ou les objets.

## Niveau 1 — porte de sortie

| Fichier | Rôle | Provenance/licence |
|---|---|---|
| `sprites/level-01-gate-v1.png` | porte magique de sortie en ruines, symbole Git, végétation, seuil et ombre intégrée | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |

La porte est rendue uniquement pour l’objet Tiled `exit-gate`. Son état fermé est assombri par Phaser et son état accessible reçoit une aura cyan animée séparée. Le sanctuaire Git utilise toujours son propre asset `level-01-shrine-v1.png`.

## Niveau 2 — terrain et props de la Forêt des Fichiers

| Fichier | Rôle | Provenance/licence |
|---|---|---|
| `tilesets/forest-tileset-v1.png` | atlas raster 16×16 de tuiles 32×32 : herbe, terre, chemins, racines, végétation et transitions de ruisseau | génération originale Codex, 17 octobre 2026, puis normalisation locale en atlas 512×512 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `tilesets/forest-tileset.tsx` | définition Tiled de l’atlas forestier, 256 tuiles et grille 32×32 | fichier de configuration du projet, MIT pour le code/outillage |
| `sprites/forest/ancient-tree.png` | grand arbre de canopée avec racines et ombre | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/forest/root-cluster.png` | racines tropicales et feuillage bas | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/forest/fern-cluster.png` | fougère de premier plan | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/forest/flower-bush.png` | buisson fleuri | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/forest/mushroom-patch.png` | groupe de champignons | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/forest/mossy-rock.png` | rocher moussu | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/forest/ruin-fragment.png` | fragment de ruine envahi | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/forest/archive-crate.png` | caisse d’archives décorative | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/forest/staging-shrine.png` | balise visuelle de staging liée à `git add` | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/forest/gate-closed.png` / `gate-open.png` | porte forestière fermée et ouverte pour l’objet Tiled `exit-gate` | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/forest/canopy-shadow.png` | ombre de canopée séparée pour la profondeur et l’ambiance | génération originale Codex, 17 octobre 2026 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |

Ces assets sont locaux, séparés de la logique de jeu et ne contiennent aucun
texte ni contrôle interactif. La carte jouable du niveau 2 reste la carte Tiled
avec sa couche `Ground`, ses collisions et ses objets ; aucun PNG complet ne la
remplace. La licence de distribution commerciale des images générées doit être
confirmée avant publication.

## Niveau 3 — terrain et props de la Grotte des Souvenirs

| Fichier | Rôle | Provenance/licence |
|---|---|---|
| `tilesets/cave-tileset-v1.png` | atlas raster 16×16 de tuiles 32×32 : roche basaltique, sols indigo, flaques, cristaux, torches et parois | génération originale Codex, 17 octobre 2026, puis normalisation locale en atlas 512×512 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `tilesets/cave-tileset.tsx` | définition Tiled locale de l’atlas de la grotte | fichier de configuration du projet, MIT pour le code/outillage |
| `sprites/cave/cave-stalactite.png` / `cave-stalagmite.png` | volumes rocheux suspendus et au sol | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/cave/cave-crystal-pink.png` / `cave-crystal-cyan.png` | cristaux décoratifs et repères de profondeur | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/cave/cave-torch.png` / `cave-lantern.png` | éclairage ambre et balise de galerie | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/cave/cave-memory-tablet.png` / `cave-commit-altar.png` | tablette pédagogique et autel visuel de commit | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/cave/cave-archive-chest.png` | coffre régional du niveau 3 | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/cave/cave-gate-closed.png` / `cave-gate-open.png` | porte basaltique fermée et ouverte pour `exit-gate` | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/cave/cave-puddle.png`, `cave-rocks.png`, `cave-vines.png`, `cave-dust.png`, `cave-rune.png` | détails d’ambiance et profondeur de la grotte | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |

Ces assets ne contiennent ni texte ni contrôle interactif. Le fond `level-03-cave.png`
reste une couche décorative ; le terrain jouable est la carte Tiled `level-03.json`,
avec son `Ground`, ses collisions et ses ancres de progression.

## Niveau 4 — terrain et props du Port des Connexions

| Fichier | Rôle | Provenance/licence |
|---|---|---|
| `tilesets/harbor-tileset-v1.png` | atlas raster 16×16 de tuiles 32×32 : eau turquoise, écume, sable humide, quais en bois, murs de pierre et détails côtiers | génération originale Codex, 17 octobre 2026, puis normalisation locale en atlas 512×512 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `tilesets/harbor-tileset.tsx` | définition Tiled locale de l’atlas du port | fichier de configuration du projet, MIT pour le code/outillage |
| `sprites/harbor/harbor-dock-post.png`, `harbor-lantern.png`, `harbor-boat.png` | poteaux, lanternes et embarcation du quai | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/harbor/harbor-crate.png`, `harbor-barrel.png`, `harbor-rope.png` | cargaison et accessoires de navigation | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/harbor/harbor-local-pylon.png`, `harbor-remote-pylon.png`, `harbor-connection-altar.png` | repères visuels des connexions locales/distantes et autel pédagogique push-pull | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/harbor/harbor-gate-closed.png` / `harbor-gate-open.png` | porte du port fermée et ouverte pour `exit-gate` | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/harbor/harbor-wave-foam.png`, `harbor-rocks.png`, `harbor-shells.png`, `harbor-buoy.png`, `harbor-lighthouse.png` | écume, rivage, végétation côtière, balise et phare de profondeur | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |

Ces assets ne contiennent ni texte ni contrôle interactif. Le fond `level-04-harbor.png`
reste une couche décorative ; le terrain jouable est la carte Tiled `level-04.json`,
avec son `Ground`, ses collisions et ses ancres de progression. La licence de
distribution commerciale des images générées doit être confirmée avant publication.

## Niveau 6 — terrain et props du Château des Conflits

| Fichier | Rôle | Provenance/licence |
|---|---|---|
| `backgrounds/level-06-castle.png` | Composition raster de fond : cour fortifiée, mer au coucher du soleil, remparts, bannières et lumière des braseros | asset local déjà présent dans le projet ; provenance historique à confirmer avant publication commerciale |
| `tilesets/castle-tileset-v1.png` | Atlas raster 16×16 de tuiles 32×32 : pavage, murs, arches, escaliers, grilles, bannières et runes de conflit | génération originale Codex, 17 octobre 2026, puis normalisation locale en atlas 512×512 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `tilesets/castle-tileset.tsx` | Définition Tiled locale de l’atlas du château | fichier de configuration du projet, MIT pour le code/outillage |
| `sprites/castle/castle-crystal.png`, `castle-archive-chest.png`, `castle-merge-altar.png` | cristal, coffre d’archives et autel pédagogique de fusion | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/castle/castle-gate-closed.png` / `castle-gate-open.png` | porte du château fermée et ouverte pour `exit-gate` | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/castle/castle-banner.png`, `castle-brazier.png`, `castle-rune-tablet.png`, `castle-arch.png` | habillage des remparts, éclairage, repère pédagogique et arches | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/castle/castle-gargoyle.png`, `castle-thorn-vine.png`, `castle-cart.png`, `castle-signpost.png`, `castle-rail.png`, `castle-rubble.png`, `castle-merge-sigil.png` | décor secondaire et effets d’ambiance de la cour | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |

Ces assets ne contiennent ni texte ni contrôle interactif. Le fond `level-06-castle.png`
reste une couche décorative ; le terrain jouable est la carte Tiled `level-06.json`,
avec son `Ground`, ses collisions et ses ancres de progression. La licence de
distribution commerciale des images générées et la provenance historique du fond
doivent être confirmées avant publication.

## Niveau 5 — terrain et props de la Montagne des Branches

| Fichier | Rôle | Provenance/licence |
|---|---|---|
| `tilesets/mountain-tileset-v1.png` | Atlas raster 16×16 de tuiles 32×32 : roche ardoise, herbe froide, terre ocre, neige, falaises et ponts | génération originale Codex, 17 octobre 2026, puis normalisation locale en atlas 512×512 ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `tilesets/mountain-tileset.tsx` | Définition Tiled locale de l’atlas montagne | fichier de configuration du projet, MIT pour le code/outillage |
| `sprites/mountain/mountain-pine.png`, `mountain-snow-pine.png` | Pins et variantes enneigées de profondeur | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/mountain/mountain-cairn.png`, `mountain-cliff-rock.png`, `mountain-snow-patch.png` | Rochers, cairns et nappes de neige | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/mountain/mountain-bridge.png`, `mountain-rope-rail.png`, `mountain-fork-sign.png`, `mountain-branch-marker.png` | Chemin, bifurcation et balises de branches | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/mountain/mountain-branch-altar.png`, `mountain-crystal.png`, `mountain-archive-chest.png` | Autel pédagogique branch/switch, cristal et coffre régional | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/mountain/mountain-gate-closed.png` / `mountain-gate-open.png` | Porte du col fermée et ouverte pour `exit-gate` | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |
| `sprites/mountain/mountain-wildflowers.png`, `mountain-wind-flag.png` | Végétation alpine et animation discrète du vent | génération originale Codex, 17 octobre 2026, découpée localement depuis une planche transparente ; aucun tiers ni URL externe ; licence de distribution finale à confirmer |

Ces assets ne contiennent ni texte ni contrôle interactif. Le fond `level-05-mountain.png`
reste une couche décorative ; le terrain jouable est la carte Tiled `level-05.json`,
avec son `Ground`, ses collisions et ses ancres de progression. La licence de
distribution commerciale des images générées doit être confirmée avant publication.
