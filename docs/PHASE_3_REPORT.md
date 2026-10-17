# GitQuest 2.0 — Phase 3, étape A

Date : 2026-10-17  
Statut : étapes A et B terminées ; étape C en attente de validation.

## 1. Périmètre vérifié

Les documents suivants ont été lus :

- `docs/UI_UX_AUDIT.md`
- `docs/PHASE_2_REPORT.md`
- `public/assets/ASSETS.md`

Les références `docs/references/gitquest-menu-reference.png` et `docs/references/gitquest-flow-reference.png` sont désormais présentes et ont été examinées pour l’étape B.

## 2. État visuel actuel

### Menu principal

Le menu actuel possède déjà une composition fonctionnelle : logo central, sous-titre localisé, boutons Nouvelle partie/Continuer/Paramètres, sélecteur FR/EN/AR, palmiers, phare, ruines, océan animé et personnages.

Ses limites artistiques sont cependant nettes :

- le décor est principalement composé de bandes colorées et de formes Phaser dessinées par `Graphics` ;
- il n’y a pas de fond peint ou de tileset de scène dédié donnant une vraie profondeur ;
- le logo est du texte monospace stylisé, pas un asset de logo pixel art avec contour et variantes ;
- les boutons reposent encore sur des rectangles et du texte, sans états visuels issus d’un véritable cadre pixel art ;
- l’éclairage coucher de soleil, les plans de profondeur et les détails de premier plan sont encore symboliques.

Fichiers concernés : `src/scenes/TitleScene.ts`, `src/ui/MainMenu.ts`, `src/ui/PixelButton.ts`, `src/ui/theme/UITheme.ts`.

### Écran de chargement et introduction

Les deux écrans sont responsive depuis la phase 2 et utilisent une progression de chargement réelle. Leur présentation reste néanmoins basée sur des aplats, des bandes et des images isolées. Il manque :

- un cadre de dialogue pixel art avec coins, bordures et panneau intérieur cohérents ;
- un portrait de Midou avec cadrage et expression dédiés ;
- des astuces Git localisées et réellement sélectionnées depuis les données ;
- une hiérarchie visuelle plus proche d’un RPG narratif.

Fichier principal : `src/scenes/NewGameScene.ts`.

### Niveau 1

La plage est plus avancée que les autres niveaux :

- carte 48×30 tuiles, soit 1536×960 pixels ;
- caméra avec suivi du joueur ;
- eau bloquante ;
- sable, eau, végétation, palmiers, rochers, ruines, sanctuaire et vagues ;
- animations discrètes sur l’eau, les plantes et le halo du sanctuaire ;
- sprites joueur/Midou en quatre directions ;
- coffre, cristal, parchemin, clé et porte conservés par les données de niveau.

Les limites actuelles sont :

- seulement huit tuiles dans le tileset de plage ;
- variations de sable et d’eau très limitées ;
- absence de vraie couche de profondeur/ombres/occlusion ;
- composition encore régulière, avec de grands aplats et peu de micro-points d’intérêt ;
- rendu du sol par un GameObject image par tuile, coûteux si l’on agrandit fortement les cartes ;
- indicateur interactif réduit à un symbole `✦` textuel ;
- les niveaux 2 à 6 utilisent toujours le rendu générique et restent hors périmètre de cette phase.

Fichier principal : `src/scenes/WorldScene.ts`. Données observées : `public/data/maps/level-01.json` et `public/data/levels/level-01.json`.

## 3. Inventaire des assets présents

### Tilesets

| Asset | Dimensions | Utilisation | État artistique/licence |
|---|---:|---|---|
| `public/assets/tilesets/beach-tileset.svg` | 256×32, 8 tuiles de 32×32 | sable, eau, herbe, bandes, rochers/ruines | local, déclaré original dans `ASSETS.md`, licence publique à préciser |
| `public/assets/tilesets/beach-tileset.tsx` | Tiled 1.10.2 | référence du tileset plage | local, cohérent avec le SVG |
| `public/assets/tilesets/island-tileset.svg` | 128×32, 4 tuiles de 32×32 | asset de base chargé par Phaser | local, peu exploité dans le rendu actuel |

### Personnages et identité

| Asset | Dimensions | Utilisation |
|---|---:|---|
| `player-4dir.svg` | 96×128, 12 frames 32×32 | marche quatre directions |
| `midou-4dir.svg` | 96×128, 12 frames 32×32 | animation de Midou quatre directions |
| `player-sheet.svg` | 96×32 | animation historique du joueur |
| `midou-sheet.svg` | 96×32 | animation historique de Midou |
| `player.svg`, `player-scarf.svg` | 32×32 | portrait/sprite simple et accent visuel |
| `midou.svg`, `midou-staff.svg` | 32×32 | portrait/sprite simple et bâton |

### Décors et objets

Présents localement : `palm.svg`, `rock.svg`, `grass.svg`, `ruin.svg`, `shrine.svg`, `shrine-glow.svg`, `lighthouse.svg`, `wave.svg`, `flower.svg`, `shell.svg`, `chest.svg`, `crystal.svg`, `scroll.svg`, `key.svg` et `gate.svg`.

Ils couvrent les besoins fonctionnels du niveau 1, mais pas encore une direction artistique professionnelle complète : il manque notamment des variantes de végétation, des ombres cohérentes, des rochers en plusieurs tailles, des éléments de rivage, des détails de ruines, des particules et des états visuels d’interaction.

## 4. Provenance et licences

`public/assets/ASSETS.md` décrit les SVG comme des assets pixel art originaux créés localement, sans URL externe, et indique qu’ils ne prétendent pas être des assets CC0 tiers.

À ce stade, le dépôt ne contient pas :

- de nom d’auteur ou de contributeur pour chaque asset ;
- de fichier de licence dédié aux assets ;
- de preuve de licence CC0 pour un pack tiers ;
- de fichier audio sous licence.

Conclusion : les assets peuvent être réutilisés dans le prototype local, mais leur statut de distribution doit être clarifié avant de présenter un pack comme « correctement licencié ». Aucun asset externe ne sera ajouté sans provenance et licence documentées.

## 5. Direction artistique proposée

La direction recommandée pour GitQuest est un pixel art tropical chaleureux et mystérieux, organisé en trois plans :

1. premier plan sombre et détaillé : feuillages, rochers, silhouettes et éléments de bord d’écran ;
2. plan de jeu lisible : chemins sableux, sanctuaire, objets et personnages avec contraste contrôlé ;
3. arrière-plan atmosphérique : océan, îlots, phare, ciel de coucher du soleil et brume légère.

Palette cible : bleu nuit pour les contours et panneaux, turquoise profond pour l’eau, sable chaud, vert tropical, violet crépusculaire et or réservé aux objectifs, clés, sanctuaire et actions importantes.

Règles de cohérence :

- grille de base 32×32 conservée ;
- contours et ombres avec une épaisseur stable ;
- aucune interface composée d’une image complète cliquable ;
- les personnages restent plus contrastés que le décor ;
- les indices interactifs utilisent un halo ou une icône dédiée, jamais un texte omniprésent ;
- les animations restent courtes et à faible amplitude pour préserver la lisibilité et les performances.

## 6. Inventaire des assets à créer ou acquérir

### Priorité pour l’étape B — menu

- fond tropical composé en plans ou ensemble de tiles de menu ;
- logo GitQuest pixel art avec contour sombre, variante claire et variante compacte ;
- plaque de sous-titre localisée ;
- bouton pixel art normal/survol/appui/désactivé ;
- cadre de paramètres et éléments de coins ;
- éléments d’océan et vagues animées compatibles avec le pixel art ;
- silhouettes ou sprites de premier plan pour le joueur et Midou ;
- phare et îlot avec davantage de détails.

### Priorité pour l’étape C — chargement et introduction

- cadre de dialogue neuf tranches ou assemblage Phaser équivalent ;
- portrait de Midou en trois expressions minimum ;
- icône de chapitre et indicateur de progression ;
- bibliothèque d’astuces Git FR/EN/AR ;
- transitions pixel art légères.

### Priorité pour l’étape D — niveau 1 et HUD

- tileset plage enrichi : bords de sable, transitions eau/plage, motifs, chemins, ombres et variantes ;
- végétation et rochers en plusieurs silhouettes ;
- ruines et sanctuaire avec états visuels ;
- indicateurs interactifs dédiés ;
- cadres HUD compacts et icônes d’inventaire cohérentes ;
- effets d’eau, poussière, feuillage, XP et porte.

## 7. Plan d’exécution par étapes

### Étape B — nouveau menu

Modifier uniquement le rendu du menu et des paramètres. Réutiliser `ResponsiveLayoutManager` et `UITheme`, conserver les callbacks existants et ajouter les assets documentés. Critères : aucun comportement de sauvegarde ou de navigation changé, menu lisible en desktop et mobile, paramètres séparés visuellement.

### Étape C — chargement et introduction

Remplacer les aplats par les nouveaux cadres, portraits et éléments d’ambiance sans modifier la progression. La barre doit rester branchée sur les événements réels du loader. L’introduction ne doit toujours valider aucune quête.

### Étape D — niveau 1 et HUD

Enrichir uniquement `level-01` et son interface. Conserver les coordonnées de gameplay, les collisions, les objets, la clé, la porte, les identifiants et le flux de quête. Mesurer le coût du rendu avant d’augmenter le nombre de GameObjects.

## 8. Vérifications exécutées

- `npm test` : **19/19 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**.
- Avertissement de build conservé : bundle JavaScript d’environ 1,27 MB minifié, au-dessus du seuil Vite de 1,2 MB.

Aucune modification de code, de carte, de données de niveau ou d’asset n’a été effectuée dans cette étape A. Le seul livrable ajouté est ce rapport d’analyse.

## 9. Décision demandée

Pour passer à l’étape B, il faut valider :

1. la direction tropicale coucher de soleil en trois plans ;
2. la priorité donnée au menu et aux paramètres ;
3. l’utilisation des SVG locaux comme base temporaire ;
4. la création ou l’acquisition d’assets complémentaires uniquement avec licence documentée ;
5. le maintien strict du périmètre : aucune modification du gameplay, des données de niveaux, des sauvegardes ou des niveaux 2 à 6.

Cette conclusion correspondait à l’étape A initiale ; l’étape B est documentée dans la mise à jour ci-dessous.

## 10. Mise à jour — étape B réalisée

L’étape B a été validée et implémentée après disponibilité des deux références visuelles. Les changements restent limités au menu principal, aux paramètres, au composant de bouton partagé et au chargement des assets UI.

### Fichiers modifiés

- `src/scenes/PreloadScene.ts` : chargement des nouvelles textures UI locales.
- `src/scenes/TitleScene.ts` : remplacement du décor en aplats par une composition illustrée en profondeur, logo asset, parchemin, décor et animations d’eau conservés.
- `src/ui/PixelButton.ts` : prise en charge optionnelle de textures locales tout en conservant les interactions Phaser, les états et les zones tactiles.
- `src/ui/MainMenu.ts` : bouton Nouvelle partie doré et boutons secondaires pixel art bleu nuit.
- `src/ui/SettingsPanel.ts` : cadre pixel art local dédié et bouton Retour texturé.
- `public/assets/ASSETS.md` : provenance et statut de licence des nouveaux assets.
- `docs/PHASE_3_REPORT.md` : présent compte rendu.

### Assets créés

- `public/assets/ui/menu-background.svg` : décor tropical multi-plans avec ciel, nuages, montagnes, océan, îlot, phare et premier plan.
- `public/assets/ui/menu-logo.svg` : logo GITQUEST doré avec contour sombre et pousse centrale.
- `public/assets/ui/menu-subtitle.svg` : plaque parchemin pixel art sans texte, compatible avec les trois langues.
- `public/assets/ui/menu-button-gold.svg` : plaque de bouton principale.
- `public/assets/ui/menu-button-navy.svg` : plaque de bouton secondaire.
- `public/assets/ui/menu-panel.svg` : cadre pixel art du panneau Paramètres.

Ces SVG ont été créés localement pour le projet. Aucun asset tiers, URL externe, capture de référence ou image copiée n’a été utilisé.

### Comparaison avec les références

La référence présente un décor riche en plans, un logo central fortement contrasté, une plaque de sous-titre, un bouton principal doré, des boutons bleu nuit, des personnages au premier plan et un panneau de paramètres distinct. L’étape B reprend désormais ces relations visuelles :

- le fond n’est plus une simple composition de rectangles Phaser ; il provient d’un asset illustré local ;
- le logo et le sous-titre sont de vrais assets visuels ;
- les boutons possèdent des cadres pixel art avec états interactifs conservés ;
- le panneau Paramètres utilise un cadre dédié avec coins et lignes intérieures ;
- la scène conserve les éléments locaux existants : palmiers, phare, vagues, joueur et Midou ;
- les textes et interactions restent séparés des images, et les traductions FR/EN/AR restent actives.

La qualité ne prétend pas égaler exactement la peinture pixel art de la référence : les nouveaux assets sont des SVG pixel-art locaux construits pour le dépôt et restent plus stylisés et géométriques qu’un pack illustré professionnel complet.

### Vérifications Chrome réellement effectuées

Sur le viewport Chrome disponible :

- menu principal : rendu du nouveau décor, logo, parchemin, boutons doré/bleu nuit et personnages ;
- paramètres en français : panneau distinct, cadre pixel art, lisibilité et Retour ;
- paramètres en arabe : RTL et textes localisés ;
- menu en anglais et en arabe : changement de langue visible ;
- Nouvelle partie : ouverture de la confirmation puis annulation ;
- Continuer : navigation vers le niveau existant ;
- écran de chargement, introduction, niveau 1 et HUD non modifiés intentionnellement dans cette étape.

Le premier viewport capturé était d’environ 1280×720. Le navigateur de validation a ensuite redimensionné sa zone visible pendant la session ; aucun contrôle fiable de viewport 844×390 ou 390×844 n’était exposé par l’outil utilisé.

### Résolutions restantes à vérifier manuellement

- 844×390 ;
- 390×844 ;
- une validation exacte supplémentaire en 1280×720 après redimensionnement explicite.

Les seuils responsive restent couverts par `ResponsiveLayoutManager` et ses tests unitaires, mais cela ne remplace pas une capture visuelle sur appareil ou viewport forcé.

### Tests finaux

- `npm test` : **19/19 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**.
- Avertissement Vite inchangé : bundle JavaScript minifié d’environ 1,27 MB.

### Limitations restantes

- Les assets restent des SVG locaux stylisés ; une finition équivalente à un pack commercial nécessiterait davantage de variantes dessinées et une validation artistique dédiée.
- Les métadonnées d’auteur et la licence de distribution finale des assets locaux restent à confirmer.
- L’écran de chargement et l’introduction appartiennent à l’étape C et n’ont pas été modifiés.
- La plage et le HUD appartiennent à l’étape D et n’ont pas été modifiés.
- Les niveaux 2 à 6, le gameplay, les sauvegardes et les systèmes métier n’ont pas été modifiés.

L’étape B est terminée. Le développement est arrêté en attente de validation avant l’étape C.

## 11. Mise à jour — étape B.2 : correction artistique du menu

### Diagnostic

Les captures Chrome de l’étape B montraient que `menu-background.svg` restait trop géométrique : montagnes triangulaires, océan en bandes, végétation symbolique et personnages trop petits. Les contrôles UI, le logo, les boutons et le panneau de paramètres étaient fonctionnels et ont été conservés.

### Fichiers modifiés

- `src/scenes/PreloadScene.ts` : chargement du fond raster `menu-background-v2.png`.
- `src/scenes/TitleScene.ts` : utilisation du nouveau fond, suppression des doublons de palmier/phare, placement plus lisible des personnages, ombres dédiées et vagues séparées animées.
- `public/assets/ASSETS.md` : provenance, composition et statut de licence du nouvel asset.
- `docs/PHASE_3_REPORT.md` : présent compte rendu.
- `public/assets/ui/menu-background-v2.png` : nouvel asset local.

### Améliorations visuelles

Le nouveau décor apporte un ciel de coucher de soleil à nuages volumétriques, des îles lointaines, un océan texturé avec reflets, une plage avec écume, un îlot rocheux détaillé, un phare identifiable et une végétation de premier plan. Le logo et les contrôles restent des composants Phaser séparés. Les vagues, les ombres et les personnages sont conservés comme couches distinctes afin de préserver les animations et la profondeur.

### Limites connues

- Le fond raster constitue une scène complète non interactive ; les personnages restent basés sur les sprites locaux existants, agrandis avec filtrage pixel-art.
- La licence de distribution finale des assets générés doit encore être confirmée avant publication commerciale.
- Les écrans de chargement et d’introduction, le niveau 1, le HUD et les niveaux 2 à 6 n’ont pas été modifiés.

### Validation technique et Chrome

- `npm test` : **19/19 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS** ; avertissement Vite conservé sur le bundle JavaScript d’environ 1,27 MB minifié.
- Chrome : fond raster visible, logo et boutons conservés, paramètres ouverts et refermés, changement FR/AR vérifié, panneau arabe lisible et Retour fonctionnel.
- Console Chrome : aucune erreur ni avertissement observé pendant cette vérification.

La capture Chrome disponible pour cette session était en environnement desktop. Les vérifications exactes des viewports 844×390 et 390×844 restent à effectuer manuellement ou avec un outil de redimensionnement de viewport explicite.

### Comparaison avec les références

La distance visuelle principale est réduite : le menu possède désormais des nuages volumétriques, un coucher de soleil nuancé, un océan texturé avec reflets et écume, une plage détaillée, des reliefs, une végétation abondante et une profondeur lumineuse. Le logo, la hiérarchie des boutons et le panneau Paramètres restent séparés du décor et interactifs.

Il subsiste une différence avec la référence : le joueur et Midou utilisent encore les sprites locaux 32×32 agrandis, et non deux illustrations de menu spécialement dessinées avec des poses et expressions équivalentes à la référence. Une passe artistique dédiée aux personnages serait nécessaire pour une correspondance encore plus proche.

### Étapes C et D réalisées partiellement

- L’écran de chargement utilise maintenant le décor tropical raster local, une composition assombrie et une barre alimentée par la progression réelle du loader.
- L’introduction utilise le même décor, un cadre pixel art local, Midou, les textes FR/EN/AR, les boutons Commencer et Passer, et ne valide aucune quête.
- Le niveau 1 conserve ses cartes, collisions, spawns, objets, sanctuaire, clé, porte et progression Git.
- Le sol de la plage est rendu par un `TilemapLayer` Phaser pour éviter un GameObject par tuile.
- Les erreurs de chargement de carte sont responsive et localisées via l’i18n.

Ces améliorations ne constituent pas encore une certification graphique complète des six niveaux ni une validation mobile exacte.
