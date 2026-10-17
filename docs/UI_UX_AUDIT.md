# Audit technique et UX — GitQuest

Date : 2026-10-17  
Périmètre : Phase 1 uniquement. Aucun refactoring graphique ou gameplay n’est inclus dans cet audit.

## 1. Résumé exécutif

GitQuest possède une base jouable et cohérente pour une V1 : les règles Git, les quêtes, la progression, les six définitions de niveaux, les sauvegardes et l’internationalisation sont séparées du rendu Phaser et testables en TypeScript.

Les principaux risques ne concernent pas l’intégrité du domaine, mais la couche d’expérience et d’intégration :

- l’interface est conçue autour d’une surface logique fixe de 960×540 ;
- le HUD, le terminal et les contrôles tactiles utilisent des coordonnées absolues ;
- les cartes 2 à 6 utilisent encore le rendu générique de prototype ;
- l’adaptateur Tiled lit `Ground`, `Decorations` et `Collisions`, mais pas `Objects` ;
- il n’existe pas de test navigateur, de test de redimensionnement ou de test tactile automatisé ;
- le bundle de production dépasse le seuil d’avertissement Vite de 1 200 kB ;
- les sauvegardes localStorage ne traitent pas explicitement les données corrompues ni les erreurs de quota.

Conclusion : la Phase 1 est terminée comme audit. La base peut entrer en Phase 2 après validation du présent document, mais aucune correction de Phase 2 n’est incluse ici.

## 2. Périmètre inspecté

Fichiers et zones principales examinés :

- scènes : `src/scenes/BootScene.ts`, `PreloadScene.ts`, `TitleScene.ts`, `NewGameScene.ts`, `WorldScene.ts`, `UIScene.ts`, `VictoryScene.ts` ;
- composants d’interface : `src/ui/MainMenu.ts`, `SettingsPanel.ts`, `ConfirmPanel.ts`, `PixelButton.ts` ;
- systèmes : `src/managers/LevelManager.ts`, `QuestManager.ts`, `SaveManager.ts`, `I18nManager.ts`, `InventoryManager.ts`, `XPManager.ts`, `src/systems/GitSimulator.ts` ;
- adaptation Phaser : `src/config/gameConfig.ts`, `src/phaser/InputManager.ts`, `src/phaser/SceneManager.ts`, `src/core/EventBus.ts` ;
- modèles et données : `src/models/game.ts`, `public/data/levels/*.json`, `public/data/maps/*.json` ;
- assets locaux : `public/assets/sprites`, `public/assets/tilesets`, `public/assets/ASSETS.md` ;
- tests : `tests/*.test.ts` ;
- configuration : `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`.

## 3. Fonctionnalités déjà correctes

### Architecture et scènes

- `BootScene` charge le manifeste et les six définitions via `LevelManager`, puis restaure `GameSession`.
- `PreloadScene` charge les assets locaux et crée les animations de marche dans quatre directions.
- `TitleScene`, `NewGameScene`, `WorldScene`, `UIScene` et `VictoryScene` ont des responsabilités identifiables.
- `SceneManager` centralise les transitions entre niveaux et l’écran de victoire.
- Les règles métier ne dépendent pas directement du DOM ou d’un serveur.

### Architecture data-driven

- Les six niveaux sont définis dans `public/data/levels/level-01.json` à `level-06.json`.
- Chaque définition contient carte, thème, spawns, objets, dialogues, quête, commandes Git, clé et sortie.
- Ajouter une définition et une carte supplémentaires reste possible sans modifier les scènes si les mécaniques existantes suffisent.
- `LevelManager` valide les champs critiques et met les cartes en cache.
- La correction d’appel de `fetch` avec son contexte est présente dans `LevelManager.fetchJson`.

### Gameplay et domaine

- `QuestManager` valide uniquement l’étape courante et exige le bon type d’action.
- `GitSimulator` maintient un état de dépôt : initialisation, index, commits, branches, remote et conflits.
- Les commandes sont séparées de l’exécution Git réelle de la machine.
- L’inventaire et les objets collectés sont idempotents.
- Les récompenses ne sont pas répétées après rechargement lorsque l’objet a été persisté comme collecté.
- La porte de sortie vérifie la quête et l’objet requis avant de changer de niveau.

### Sauvegarde et localisation

- `SaveManager` versionne les données et centralise la migration.
- `GameSession` sauvegarde niveau, langue, contrôles tactiles, inventaire, XP, quêtes, objets collectés et état Git.
- FR, EN et AR sont présents dans `I18nManager`.
- La direction arabe est exposée par `I18nManager.direction` et certains éléments du HUD adaptent leur alignement.
- Les paramètres audio n’affichent pas de faux réglages : l’interface indique que les assets audio ne sont pas fournis.

### Tests et build

- Les tests couvrent GitSimulator, QuestManager, SaveManager, LevelManager, TiledMapAdapter, les traductions et une progression de niveau 1.
- Le build exécute d’abord le typecheck.
- Les assets utilisés sont locaux ; aucun lien externe d’image n’est requis.
- Un favicon local est présent dans `public/favicon.svg`.

## 4. Problèmes constatés

### 4.1 Lisibilité et responsive

Priorité : P1.

- `gameConfig.ts` fixe la surface logique à 960×540 avec `Phaser.Scale.FIT`. Cela conserve le ratio, mais ne réorganise pas l’interface pour les écrans étroits.
- `MainMenu`, `SettingsPanel`, `ConfirmPanel`, `UIScene` et `InputManager` utilisent des coordonnées absolues adaptées à 960×540.
- Le panneau de paramètres calcule sa largeur, mais sa hauteur, ses positions de texte et ses boutons ne sont pas recalculés sur un changement réel de taille.
- Le HUD peut concentrer titre, objectif, XP, inventaire, langues et journal dans une zone trop petite sur mobile.
- Le terminal est un panneau fixe de 720×330 ; il ne prévoit pas de clavier virtuel, de zone de saisie native, de redimensionnement ou de défilement adapté aux petits écrans.
- Les textes arabes sont alignés manuellement dans certaines zones, mais l’interface n’a pas de système de layout RTL transversal.

Fichiers concernés : `src/config/gameConfig.ts`, `src/scenes/UIScene.ts`, `src/ui/*.ts`, `src/phaser/InputManager.ts`, `src/styles/main.css`.

### 4.2 Contrôles clavier, souris et tactiles

Priorité : P1.

- `InputManager` gère WASD et les flèches, ainsi que E et T. Le README mentionne aussi Entrée pour interagir, mais l’implémentation ne lie pas explicitement Entrée.
- Les boutons tactiles sont créés à des positions fixes et n’ont pas de traitement `pointerupoutside`/annulation ; un geste interrompu peut donc nécessiter une vérification particulière.
- Le déplacement tactile est représenté par quatre boutons séparés ; il n’y a pas de joystick virtuel ni de stratégie de mise à l’échelle dédiée.
- Le mode automatique dépend de `matchMedia('(pointer: coarse)')` et `'(pointer: fine)'`. Les appareils hybrides peuvent être classés de manière inattendue.
- Les interactions souris sont fonctionnelles sur les composants `PixelButton`, mais plusieurs contrôles historiques du HUD utilisent encore directement `Text.setInteractive()`.

Fichiers concernés : `src/phaser/InputManager.ts`, `src/core/GameSession.ts`, `src/scenes/UIScene.ts`, `src/ui/PixelButton.ts`.

### 4.3 HUD, inventaire, dialogues et terminal

Priorité : P1.

- Le HUD est dense et mélange informations de niveau, objectif, XP, inventaire, langues et journal dans une bande de 64 px.
- L’inventaire affiche surtout des icônes ; la signification des objets dépend du texte de statistiques et n’est pas toujours immédiatement lisible.
- La barre XP utilise `xp % 100`, sans modèle explicite de niveau, seuil ou progression totale.
- Les dialogues sont affichés comme des toasts temporaires de cinq secondes dans `UIScene`. Ils ne forment pas encore une boîte de dialogue multi-page avec historique, progression clavier ou lecture contrôlée.
- Le terminal est rendu par des textes Phaser et intercepte les touches globalement. Il gère les espaces via `GitSimulator`, mais ne propose ni collage, ni sélection, ni IME, ni vraie zone de saisie accessible.
- Le terminal affiche des messages métier essentiellement francophones dans `GitSimulator`, même lorsque l’interface est passée en anglais ou arabe.

Fichiers concernés : `src/scenes/UIScene.ts`, `src/systems/GitSimulator.ts`, `src/managers/I18nManager.ts`.

### 4.4 Cartes Tiled et rendu

Priorité : P1 pour la cohérence, P2 pour la finition.

- Les six JSON contiennent les couches `Ground`, `Decorations`, `Collisions` et `Objects`.
- `TiledMapAdapter` ne transforme pas la couche `Objects`. Les objets jouables proviennent encore de la définition de niveau plutôt que d’un flux Tiled unifié.
- Seul le niveau 1 possède un rendu de plage détaillé dans `WorldScene.drawBeachWorld()`.
- Les niveaux 2 à 6 passent par `drawLegacyWorld()`, qui dessine principalement un fond et des motifs génériques ; leurs cartes ne produisent pas encore six identités visuelles équivalentes.
- Le niveau 1 crée une image Phaser pour chaque tuile de la couche `Ground` : 48×30, soit jusqu’à 1 440 GameObjects pour le sol, avant les décorations et entités.
- Les collisions d’eau sont générées par balayage des tuiles, ce qui est correct fonctionnellement mais mérite un contrôle de densité et de coût sur des cartes plus grandes.

Fichiers concernés : `src/managers/LevelManager.ts`, `src/scenes/WorldScene.ts`, `src/models/game.ts`, `public/data/maps/*.json`.

### 4.5 Internationalisation et RTL

Priorité : P1.

- Les clés de menu, paramètres, introduction et objectif sont présentes dans les trois langues.
- Les textes du simulateur Git, des erreurs de chargement, de `VictoryScene` et de certaines erreurs de carte restent écrits en dur en français.
- `dir="ltr"` est volontairement appliqué au canvas ; cela évite une inversion globale mais signifie que le RTL doit être géré élément par élément.
- Les composants ne partagent pas de contrat de layout RTL commun. Toute nouvelle UI devra reproduire manuellement le placement conditionnel.
- Aucun test visuel automatisé ne vérifie la longueur des chaînes, le clipping ou le chevauchement en arabe.

Fichiers concernés : `src/managers/I18nManager.ts`, `src/scenes/BootScene.ts`, `PreloadScene.ts`, `WorldScene.ts`, `VictoryScene.ts`, `UIScene.ts`, `src/ui/*.ts`.

### 4.6 Performance et maintenance

Priorité : P2.

- Le build Vite produit un bundle JavaScript minifié d’environ 1 263 kB, au-dessus du seuil d’avertissement de 1 200 kB.
- Phaser est importé de manière globale et aucun découpage de bundle n’est configuré.
- Les scènes créent directement beaucoup de GameObjects et de textes. Une stratégie de conteneurs, de réutilisation ou de rendu de tuiles devra être étudiée avant d’agrandir fortement les cartes.
- `WorldScene` porte encore une branche spéciale niveau 1 et une branche générique. Cela accélère la V1, mais augmente le risque de divergence entre chapitres.
- Plusieurs messages et boutons de récupération sont dupliqués dans les scènes et ne sont pas tous localisés.
- L’absence de lint, de formatage imposé et de test navigateur laisse passer des régressions d’interface qui ne seraient pas détectées par TypeScript.

### 4.7 Sauvegardes et reprise

Priorité : P1 pour robustesse, P2 pour fonctionnalités.

- `SaveManager.load()` appelle `JSON.parse` sans gestion d’une donnée corrompue.
- Les erreurs de quota ou d’accès à `localStorage` ne sont pas remontées à l’interface.
- La sauvegarde est un seul slot logique, sans indication de date, de taille ou de corruption.
- `SAVE_VERSION` existe, mais la stratégie de migration ne dispose pas encore de tests de compatibilité pour plusieurs versions historiques.
- La reprise est testée au niveau du manager, mais pas par un parcours navigateur après actualisation sur chaque transition de scène.

Fichiers concernés : `src/managers/SaveManager.ts`, `src/core/GameSession.ts`, `tests/SaveManager.test.ts`.

## 5. Priorités de correction proposées

### P0 — Préserver les invariants

- Ne pas modifier les règles de `GitSimulator`, `QuestManager` ou la condition clé/porte sans tests de non-régression.
- Ajouter une gestion contrôlée des sauvegardes invalides avant toute évolution du format.
- Ajouter un test de chargement avec ressource manquante et un test de reprise après changement de scène.

### P1 — Expérience et cohérence

- Introduire un layout UI calculé depuis la taille logique disponible, avec zones sûres et points d’ancrage.
- Unifier les contrôles interactifs via des composants réutilisables.
- Remplacer les toasts de dialogue par un composant de dialogue contrôlable et localisé.
- Définir un contrat de données Tiled pour les spawns, PNJ, objets interactifs et sorties, puis consommer réellement `Objects`.
- Localiser les messages visibles du domaine et des erreurs.
- Tester les flux principaux dans un navigateur : menu, paramètres, nouvelle partie, introduction, dialogue, terminal, sauvegarde et reprise.

### P2 — Performance et finition

- Mesurer le nombre de GameObjects, le temps de chargement et le FPS sur les six cartes.
- Réduire le nombre d’objets de tuiles ou adopter un rendu de tilemap approprié.
- Découper le bundle et vérifier le coût des assets SVG/spritesheets.
- Harmoniser les six identités visuelles et les animations sans dupliquer la logique de scène.

## 6. Risques de régression

- Modifier l’ordre des scènes peut casser le lancement, la restauration de `GameSession` ou le démarrage de `UIScene`.
- Changer le layout du HUD peut masquer l’événement `nearby`, le bouton terminal ou le journal.
- Transformer la source des objets Tiled peut créer des doublons entre la carte et `LevelDefinition.objects`.
- Modifier les coordonnées de spawn peut placer le joueur ou Midou dans l’eau ou derrière un collider.
- Changer les clés de traduction peut rendre le fallback FR silencieusement actif.
- Remplacer le terminal Phaser par un champ DOM peut introduire des problèmes de focus, de sécurité ou de synchronisation avec la scène.
- Modifier `SaveData` sans migration et fixtures de compatibilité peut rendre les parties existantes illisibles.
- Augmenter les dimensions des cartes sans stratégie de rendu peut aggraver la taille du bundle et le nombre de GameObjects.

## 7. Recommandations pour les phases 2 à 6

Les phases suivantes sont proposées comme séquencement, mais ne sont pas commencées dans cette intervention.

### Phase 2 — Système UI responsive et accessibilité

Créer un système de layout Phaser partagé pour menu, paramètres, HUD, terminal et dialogues. Centraliser les composants interactifs, les zones sûres, le focus clavier et le RTL.

### Phase 3 — Pipeline Tiled unifié et cartes

Définir et valider les propriétés Tiled des spawns, PNJ, objets et portes. Faire consommer la couche `Objects` et rendre les six cartes à partir des mêmes adapters data-driven.

### Phase 4 — Mobile, internationalisation et audio réel

Ajouter une stratégie tactile robuste, les tests mobile, le texte de domaine localisé, la validation RTL et seulement ensuite les contrôles audio si des assets audio documentés sont réellement intégrés.

### Phase 5 — Performance, observabilité et tests navigateur

Ajouter des tests de parcours, des mesures de FPS/chargement, une stratégie de rendu de tuiles, le découpage du bundle et des écrans d’erreur cohérents.

### Phase 6 — Stabilisation et certification de release

Figer les contrats de données, tester migration de sauvegarde et compatibilité des niveaux, exécuter la matrice desktop/mobile et produire un rapport de release reproductible.

## 8. Critères d’acceptation mesurables par phase

| Phase | Critères d’acceptation |
|---|---|
| 1 — Audit | Rapport présent ; architecture, UX, performance, sauvegarde, i18n et risques documentés ; `npm test`, `npm run typecheck` et `npm run build` exécutés avec résultats consignés ; aucune refonte effectuée. |
| 2 — UI responsive | Aucun chevauchement sur 1280×720, 960×540, 768×1024 et 390×844 ; navigation clavier complète ; tous les boutons ont une zone interactive ; RTL arabe vérifié sur menu, paramètres, HUD, dialogue et terminal. |
| 3 — Tiled | Les six cartes chargent `Ground`, `Decorations`, `Collisions` et `Objects` via le même adapter ; 100 % des spawns et objets interactifs proviennent des données ; aucun doublon ; joueur et Midou démarrent sur une zone accessible. |
| 4 — Mobile/i18n/audio | Tests tactiles sur au moins une résolution étroite et une tablette ; contrôles automatiques masqués sur pointeur fin ; toutes les chaînes visibles passent par i18n ; aucune chaîne tronquée en arabe ; audio activé uniquement avec assets présents et testés. |
| 5 — Performance/tests | Parcours navigateur automatisé menu → niveau 1 → Midou → terminal → sauvegarde ; absence d’erreur console ; temps de démarrage et FPS mesurés sur les six niveaux ; bundle sous le seuil défini ou exception documentée. |
| 6 — Release | Tests unitaires, typecheck, build production et tests navigateur verts ; migration de sauvegarde testée sur au moins deux versions ; matrice desktop/mobile consignée ; artefacts et version finale reproductibles. |

## 9. Vérifications exécutées pour cet audit

Commandes exécutées dans `C:\Users\ahmed\source\repos\GitQuest` :

```text
npm test
npm run typecheck
npm run build
```

Résultats observés :

- tests : 17 réussis, 0 échec ;
- typecheck : réussi ;
- build : réussi ;
- avertissement Vite : bundle JavaScript minifié d’environ 1 263 kB, supérieur au seuil de 1 200 kB.

Le rapport ne prétend pas avoir validé un parcours navigateur automatisé, un vrai appareil tactile ou une mesure de FPS : ces validations appartiennent aux phases suivantes.

## 10. Décision de sortie de Phase 1

La Phase 1 peut être soumise à validation utilisateur. La Phase 2 ne doit commencer qu’après accord explicite sur les priorités, en particulier le système de layout responsive et le contrat Tiled `Objects`.
