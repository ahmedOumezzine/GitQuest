# GitQuest — Refonte des contrôles mobiles

## Périmètre

Cette intervention remplace uniquement la présentation et l’adaptation des contrôles tactiles. Les cartes Tiled, les quêtes, les récompenses, les sauvegardes, le simulateur Git et les cours d’Octo restent inchangés.

## Analyse de l’ancien système

L’ancienne interface affichait un pavé directionnel carré de 164 px avec quatre boutons séparés, puis deux boutons d’action dominants marqués `E` et `T`. Les positions étaient calculées à partir de coordonnées fixes et le contrôle tactile n’était pas réinitialisé par un changement d’orientation ou l’ouverture de tous les panneaux modaux.

Cela réduisait la zone de jeu en portrait, masquait parfois le décor et rendait les diagonales moins naturelles.

## Nouvelle architecture

`InputManager` reste l’adaptateur partagé entre Phaser et le monde. Il expose toujours les mêmes contrats métier :

- vecteur de déplacement vers `WorldScene.setTouchVector()` ;
- événement sémantique `touch-interact` ;
- ouverture du terminal via `WorldScene.requestTerminal()`.

Le monde ne dépend donc pas de la forme visuelle du contrôle et les six niveaux continuent d’utiliser la même logique.

Le calcul pur du joystick se trouve dans `src/phaser/MobileControlsMath.ts` :

- zone morte configurable ;
- vecteur analogique borné ;
- diagonales normalisées, sans vitesse supérieure à une direction cardinale ;
- déplacement visuel du bouton central dans le cercle.

## Contrôles livrés

- Joystick circulaire semi-transparent, diamètre visuel de 104 px.
- Bouton `✦` compact pour l’interaction.
- Bouton `>_` compact pour le terminal.
- Zones de pression de 76 px autour des actions.
- Feedback de pression et halo discret.
- Relâchement `pointerup` / `pointerupoutside` et remise à zéro à chaque resize.
- Gestion de deux pointeurs : un doigt peut déplacer le joystick pendant qu’un second appuie sur une action.
- Gestion centralisée du `pointerdown` pour éviter les différences de hit-test des conteneurs Phaser en navigateur mobile.

## Responsive et safe areas

`calculateTouchLayout()` est recalculé par `ResponsiveLayoutManager` sur chaque redimensionnement :

- portrait 390×844 : joystick en bas à gauche, actions empilées en bas à droite ;
- paysage 844×390 : même composition compacte sans couper les contrôles ;
- marge de sécurité de 12 px en mode compact ;
- positions indépendantes de la taille CSS réelle du canvas.

Les contrôles sont masqués par défaut sur un ordinateur clavier/souris. Le mode `Toujours afficher` des paramètres continue de permettre leur activation manuelle. La détection prend en compte `pointer: coarse` et `navigator.maxTouchPoints`, au lieu de déduire le tactile de la largeur de l’écran.

## Verrouillage modal

`UIScene.syncTouchControls()` masque et réinitialise le joystick pendant :

- terminal Git ;
- dialogue de Midou ;
- journal ;
- inventaire ;
- cours et quiz du Professeur Octo.

Les contrôles reviennent à la fermeture. L’accès au terminal reste soumis à la proximité d’un sanctuaire : le bouton ne contourne aucune règle métier.

## Fichiers modifiés

- `src/phaser/InputManager.ts`
- `src/phaser/MobileControlsMath.ts`
- `src/ui/layout/ResponsiveLayoutManager.ts`
- `src/scenes/UIScene.ts`
- `src/core/GameSession.ts`
- `tests/MobileControlsMath.test.ts`
- `tests/ResponsiveLayout.test.ts`
- `scripts/browser-smoke.mjs`

Aucune carte, aucun tileset et aucun système de progression n’a été modifié.

## Captures Chrome produites

- `docs/captures/mobile-controls-level1-portrait-390x844.png`
- `docs/captures/mobile-controls-level1-landscape-844x390.png`
- `docs/captures/mobile-controls-level2-portrait-390x844.png`
- `docs/captures/mobile-controls-level3-portrait-390x844.png`
- `docs/captures/mobile-controls-level4-landscape-844x390.png`
- `docs/captures/mobile-controls-level5-portrait-390x844.png`
- `docs/captures/mobile-controls-level6-landscape-844x390.png`
- `docs/captures/mobile-controls-joystick-level1-390x844.png`
- `docs/captures/mobile-controls-terminal-level1-390x844.png`
- `docs/captures/mobile-controls-level1-ar-portrait-390x844.png`
- `docs/captures/mobile-controls-desktop-1280x720.png`

## Vérifications réellement effectuées

### Tests locaux

- `npm test` : **89/89 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**. Vite conserve l’avertissement connu concernant le chunk Phaser d’environ 1,2 MB minifié.
- `node --check scripts/browser-smoke.mjs` : **PASS**.

### Chrome / émulation tactile

- Niveau 1 portrait 390×844 : PASS, FPS observé 47.
- Niveau 1 paysage 844×390 : PASS, FPS observé 49.
- Niveau 1 parcours tactile ciblé : PASS, joystick, diagonale, relâchement, interaction Midou, bouton terminal et masquage/restauration des contrôles modaux ; FPS observé 51,15.
- Niveau 2 portrait : PASS, FPS observé 53,12.
- Niveau 3 portrait : PASS, FPS observé 54,11.
- Niveau 4 paysage : PASS, FPS observé 49.
- Niveau 5 portrait : PASS, FPS observé 53,12.
- Niveau 6 paysage : PASS, FPS observé 53.
- Niveau 1 arabe RTL portrait 390×844 : PASS, FPS observé 56,07 ; libellés d’action visibles et non tronqués.
- Desktop 1280×720 : PASS, contrôles tactiles non affichés par défaut, FPS observé 53.

Le parcours tactile a réellement utilisé le joystick et les deux boutons d’action. Dans l’émulation headless utilisée, la seconde séquence `touchStart` destinée à fermer le dialogue n’est pas toujours redistribuée par Chrome après le premier `touchEnd`; la restauration des contrôles après le dialogue a donc été confirmée avec la fermeture clavier `Enter`. Le bouton Interaction et le bouton Terminal ont, eux, été confirmés par de vrais événements tactiles. Cette limite est documentée et ne doit pas être présentée comme une validation tactile complète de la fermeture du dialogue.

## Limites restantes

- Le chunk Phaser reste volumineux ; une séparation de bundle pourrait améliorer le démarrage, mais elle sort du périmètre des contrôles.
- La QA globale historique conserve le blocage connu de transition du niveau 6 vers `victory`. Ce chantier ne modifie pas cette logique.
- Une validation sur appareil physique reste recommandée pour les zones sûres dépendant des barres de navigateur et les gestes multitouch natifs.

## Statut

La refonte des contrôles mobiles est implémentée et validée sur les six niveaux en rendu Chrome. Aucun commit ni push n’a été effectué.
