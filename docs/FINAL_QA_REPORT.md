# GitQuest 2.0 — Rapport QA final de l’intervention autonome

Date : 2026-10-17

## Phases traitées

- Phase 3 B.2 : décor de menu raster détaillé intégré ; limites de licence et sprites documentées.
- Phase 3 C : chargement et introduction améliorés avec progression réelle, cadre, Midou, Passer et i18n.
- Phase 3 D : niveau 1 préservé, rendu du sol optimisé, HUD et dialogues enrichis.
- Phase 4 : terminal enrichi, aide, historique, dialogue dédié, robustesse des sauvegardes.
- Phase 5 : joystick tactile, actions Interagir/Terminal, nettoyage des gestes.
- Phase 6 : optimisation du rendu du sol et écrans d’erreur améliorés.

## Résultats vérifiables

- `npm test` : **28/28 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**.
- Chrome desktop : menu, paramètres, changement de langue, niveau 1 et absence d’erreur console vérifiés.
- Niveau 1 : carte Tiled, objectif initial, collisions et rendu TilemapLayer observés.
- Parcours frais dans Chrome sur `http://192.168.115.51:5174/?qa=fresh` : Nouvelle partie → écran de chargement à 100 % → introduction → Passer → niveau 1 vérifié.
- Interaction réelle avec Midou vérifiée : l’objectif passe de « Parler à Midou » à « Exécuter git init ».
- Terminal réel vérifié : `git init` est accepté et l’objectif passe à « Trouver la clé » ; la saisie clavier caractère par caractère conserve l’espace dans `git init`.
- Sauvegarde vérifiée : après actualisation, le menu affiche Continuer et ce bouton recharge le niveau 1 avec l’objectif déjà avancé.
- Parcours niveau 1 complété dans Chrome : coffre ouvert, clé obtenue, XP `50` visible, porte ouverte et transition vers « Forêt des Fichiers » vérifiée.
- Correctif appliqué dans `WorldScene.interact()` : la cible interactive est recalculée au moment de l’action pour éviter une interaction de porte dépendante d’un tick précédent.
- Messages du terminal localisés pour les sorties Git courantes en FR, EN et AR, sans modifier `GitSimulator`.
- Les six cartes JSON Tiled ont été vérifiées par test sur les couches `Ground`, `Decorations`, `Collisions`, `Objects`, le spawn, Midou et la porte.
- La surface Phaser expose la direction RTL lorsque l’arabe est sélectionné ; les alignements du HUD suivent déjà cette direction.
- Vérification Chrome arabe : menu traduit, paramètres centrés, branding du menu masqué derrière le panneau, Retour fonctionnel, console à 0 erreur/0 avertissement.
- Chargement asynchrone vérifié dans Chrome après découpage Vite : le menu démarre correctement et la console reste sans erreur.
- Parcours navigateur niveau 2 vérifié : Midou → `git add .` → coffre/clé → XP cumulée `100` → porte → chargement de « Grotte des Souvenirs » (niveau 3), sans erreur console.
- Parcours navigateur complet vérifié dans Chrome desktop sur `http://172.29.192.1:5174/?qa=level3` : niveaux 3 à 6 enchaînés avec `git commit -m 'archive'`, `git push`, `git pull`, `git branch feature`, `git switch feature` et `git merge main` ; chaque coffre, clé, porte et gain d’XP a été observé jusqu’à l’écran Victoire (`XP totale : 300`).
- Console Chrome sur ce parcours complet : aucune erreur ni avertissement applicatif ; seuls les messages normaux de connexion Vite et de démarrage Phaser sont présents.
- Terminal accessible vérifié dans Chrome après la dernière correction : champ HTML exposé comme text field, `git init` saisi avec espace, commande collée, et `ArrowUp` rappelant effectivement la commande précédente ; console sans erreur applicative.
- Console Chrome sur le parcours isolé : **0 erreur / 0 avertissement**.
- Les textes des écrans Boot, erreur de preload et Victoire sont couverts par test en FR, EN et AR ; le chemin navigateur de ces états d’erreur n’a pas été provoqué artificiellement.

## Non certifié

- Parcours navigateur complet automatisé : non réalisé sous Playwright/WebDriver ; le parcours complet a toutefois été exécuté manuellement par clavier dans Chrome desktop.
- Automatisation navigateur de la saisie DOM et de l’historique : non ajoutée au dépôt ; la vérification a été exécutée directement dans Chrome via l’outil d’interface.
- Viewports mobiles exacts et appareils tactiles physiques.
- FPS et temps de chargement mesurés sur les six niveaux.
- Comparaison artistique complète des six régions avec les références.
- Audio réel : aucun asset audio n’est présent, donc aucun faux réglage n’a été activé.

## Fichiers principaux modifiés

- `src/scenes/NewGameScene.ts`
- `src/scenes/WorldScene.ts`
- `src/scenes/TitleScene.ts`
- `src/scenes/UIScene.ts`
- `src/systems/TerminalInputModel.ts`
- `src/styles/main.css`
- `src/phaser/InputManager.ts`
- `src/managers/LevelManager.ts`
- `src/managers/SaveManager.ts`
- `src/core/GameSession.ts`
- `src/managers/I18nManager.ts`
- `src/scenes/BootScene.ts`
- `src/scenes/PreloadScene.ts`
- `src/scenes/VictoryScene.ts`
- `src/models/game.ts`
- tests de sauvegarde, Tiled et régression
- rapports Phase 3 à 6

## Instructions

```text
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

## Conclusion

Le projet reste jouable et les invariants Git/quête/sauvegarde sont protégés par les tests. La livraison ne doit pas être présentée comme une certification finale mobile, performance ou artistique des six niveaux tant que les validations listées comme non certifiées n’ont pas été réalisées.
