# GitQuest 2.0 — Rapport Phase 2

Date : 2026-10-17  
Périmètre : design system, responsive et adaptation UI uniquement.

## Résultat

La Phase 2 est implémentée sans modification des définitions de niveaux, des cartes Tiled, du simulateur Git, des quêtes, des sauvegardes, de l’XP ou de l’inventaire métier.

La surface Phaser utilise désormais le redimensionnement réel du viewport. Les écrans UI recalculent leurs positions et dimensions au changement de taille, avec des tailles minimales de contrôle de 44 pixels logiques.

## Changements réalisés

- `src/ui/layout/ResponsiveLayoutManager.ts` : calcul centralisé des modes desktop, compact et portrait, marges sûres, barre supérieure et points d’ancrage.
- `src/ui/theme/UITheme.ts` : couleurs, typographie monospace, espacements, bordures, états de contrôle et tailles minimales.
- `src/ui/PixelButton.ts` : états normal, survol, appui, sélection, focus et désactivation ; redimensionnement dynamique.
- `src/ui/MainMenu.ts` : boutons et sélecteur de langue positionnés selon le viewport.
- `src/ui/SettingsPanel.ts` et `src/ui/ConfirmPanel.ts` : panneaux centrés, largeur bornée, boutons empilés sur les petits écrans et fond modal couvrant le viewport.
- `src/scenes/TitleScene.ts` : décor du menu redessiné selon la taille disponible, avec conservation des éléments pixel art et des animations d’ambiance.
- `src/scenes/NewGameScene.ts` : chargement, introduction et boutons adaptés aux formats compacts et portrait.
- `src/scenes/UIScene.ts` : HUD, objectifs, XP, journal et terminal repositionnés ; le terminal reste une interface Phaser et conserve son traitement des espaces clavier.
- `src/phaser/InputManager.ts` : contrôles tactiles repositionnés avec zones de 44 pixels et gestion de `pointerupoutside`.
- `src/config/gameConfig.ts` : passage à `Phaser.Scale.RESIZE` pour permettre l’adaptation réelle du canvas.
- `tests/ResponsiveLayout.test.ts` : couverture des modes desktop, compact, portrait et des marges sûres.

## RTL et internationalisation

Le choix FR/EN/AR reste piloté par `I18nManager`. Les textes visibles du HUD respectent l’alignement RTL arabe, tandis que le canvas et les commandes Git restent en LTR afin de préserver la lecture des commandes et des directions de jeu. Les écrans Paramètres, Confirmation et Nouvelle partie ont été vérifiés en arabe dans Chrome.

## Vérifications automatisées

- `npm test` : **19/19 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**.

Le build conserve l’avertissement Vite existant sur la taille du bundle JavaScript, environ 1,27 MB minifié. Ce point relève de l’optimisation de performance et n’a pas été traité dans cette phase.

## Vérifications visuelles réellement effectuées

Dans Chrome via le serveur Vite local :

- menu principal sur le viewport disponible, environ **1280×720** : composition visible, boutons et sélecteur de langue accessibles ;
- Paramètres : panneau centré, aucun contrôle du menu principal interactif derrière le panneau, bouton Retour fonctionnel ;
- Paramètres en arabe : textes visibles et ordre RTL contrôlé ;
- confirmation Nouvelle partie : panneau et boutons lisibles ;
- écran de chargement : barre de progression alimentée par le chargement Phaser ;
- introduction : panneau, narration et boutons Commencer/Passer visibles ;
- niveau 1 : HUD, objectif principal, XP et inventaire compact ;
- terminal Git : panneau responsive visible dans la carte, raccourci `T` ouvrant le terminal sans ajouter `t` à la commande.

## Résolutions non vérifiées visuellement

Les résolutions exactes suivantes n’ont pas été ouvertes dans Chrome pendant cette intervention : 1920×1080, 1366×768, 960×540, 844×390, 390×844, 768×1024 et 1024×768. Les seuils correspondants sont couverts par le test unitaire de layout, mais une validation visuelle réelle sur ces dimensions reste à faire.

Les contrôles tactiles ont été vérifiés par inspection du code et par les tests existants ; un parcours tactile réel sur appareil n’a pas été réalisé.

## Risques et limites conservés

- Le joystick avancé reste hors périmètre et appartient à la Phase 5.
- Les niveaux 2 à 6 n’ont pas été refactorés graphiquement.
- L’audio reste signalé honnêtement comme indisponible ; aucun réglage audio fictif n’a été ajouté.
- Le bundle reste monolithique et devra être optimisé dans une phase dédiée.
- Les limites précédemment documentées de l’adaptateur Tiled et des tests navigateur restent inchangées.

## Critère de sortie Phase 2

La phase est techniquement prête pour validation utilisateur : architecture UI centralisée, adaptation desktop/compact/portrait codée, tests automatisés verts et parcours visuel principal vérifié. La Phase 3 ne doit commencer qu’après validation de ce rapport et après, si nécessaire, une passe de vérification sur les résolutions mobiles réelles.
