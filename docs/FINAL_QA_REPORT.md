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

- `npm test` : **41/41 PASS**.
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
- Les positions Tiled des six spawns, de Midou et des portes sont maintenant consommées par `WorldScene`, avec repli explicite sur les définitions de niveau ; leur concordance est couverte par un test.
- Le chargeur refuse une carte Tiled incomplète ou une couche `Ground` incohérente avec une erreur explicite ; ce cas est couvert par test.
- Le chargeur vérifie également le type attendu de chaque couche Tiled ; le cas incompatible est couvert par test.
- Le manifeste d’assets est partagé entre le préchargement et les tests ; tous les fichiers locaux demandés sont vérifiés présents.
- Les touches d’interaction documentées (`E` et `Entrée`) sont désormais toutes liées au monde ; `T` reste réservé au terminal.
- Un test d’extensibilité charge un niveau 7 synthétique avec sa carte Tiled et sa quête sans modification des scènes Phaser.
- Le manifest des six niveaux et l’existence de chaque carte référencée sont vérifiés par test.
- Les niveaux 2 et 6 ont été vérifiés visuellement après l’ajout de styles legacy distincts ; la console Chrome est restée sans erreur ni avertissement.
- La surface Phaser expose la direction RTL lorsque l’arabe est sélectionné ; les alignements du HUD suivent déjà cette direction.
- Vérification Chrome arabe : menu traduit, paramètres centrés, branding du menu masqué derrière le panneau, Retour fonctionnel, console à 0 erreur/0 avertissement.
- Chargement asynchrone vérifié dans Chrome après découpage Vite : le menu démarre correctement et la console reste sans erreur.
- Parcours navigateur niveau 2 vérifié : Midou → `git add .` → coffre/clé → XP cumulée `100` → porte → chargement de « Grotte des Souvenirs » (niveau 3), sans erreur console.
- Parcours navigateur complet vérifié dans Chrome desktop sur `http://172.29.192.1:5174/?qa=level3` : niveaux 3 à 6 enchaînés avec `git commit -m 'archive'`, `git push`, `git pull`, `git branch feature`, `git switch feature` et `git merge main` ; chaque coffre, clé, porte et gain d’XP a été observé jusqu’à l’écran Victoire (`XP totale : 300`).
- Console Chrome sur ce parcours complet : aucune erreur ni avertissement applicatif ; seuls les messages normaux de connexion Vite et de démarrage Phaser sont présents.
- Terminal accessible vérifié dans Chrome après la dernière correction : champ HTML exposé comme text field, `git init` saisi avec espace, commande collée, et `ArrowUp` rappelant effectivement la commande précédente ; console sans erreur applicative.
- Console Chrome sur le parcours isolé : **0 erreur / 0 avertissement**.
- Les textes des écrans Boot, erreur de preload et Victoire sont couverts par test en FR, EN et AR ; le chemin navigateur de ces états d’erreur n’a pas été provoqué artificiellement.
- La synchronisation `html[lang]` / `html[dir]` et la direction du champ terminal sont implémentées ; le rendu arabe du menu, des paramètres et de l’introduction a été observé dans Chrome desktop.
- Une capture avec viewport contrôlé confirme le menu et les paramètres à `1280×720`, `844×390` et `390×844`; le chevauchement du menu paysage compact a été corrigé et couvert par un test de layout.
- L’écran de confirmation, l’introduction et la transition vers le niveau 1 ont été observés à `844×390`, avec console sans erreur. Dans le runtime arabe, `html[lang]=ar`, `html[dir]=rtl`, le canvas `dir=rtl` et une surface `844×390` ont été constatés.
- Le HUD français du niveau 1 a été observé à `844×390` sans chevauchement visible ; aucune erreur console n’a été relevée.
- Avec `?perf=1`, le niveau 1 a fourni une mesure Chrome réelle à `1280×720` : **143,99 FPS**, **6,95 ms/frame**, **144 frames/1000 ms**.
- La route QA `?qa=benchmark&qaLevel=level-XX&perf=1` a mesuré les six cartes à `1280×720` : niveaux 1 à 6 entre **137,99 et 144,02 FPS**, sans erreur ni avertissement console.
- Recheck Chrome ultérieur des six routes QA : niveaux 1 à 6 entre **133,97 et 142,99 FPS**, avec 0 erreur et 0 avertissement pour chaque route ; la variation confirme le caractère dépendant de l’environnement de cette mesure.

## Non certifié

- Parcours navigateur complet automatisé sous Playwright/WebDriver : non réalisé ; un smoke test Chrome/Edge headless versionné couvre désormais le menu, les paramètres, le RTL, Nouvelle partie, l’introduction, le niveau 1, le terminal et la sauvegarde. Le parcours complet des six niveaux reste exécuté manuellement dans Chrome desktop.
- Automatisation navigateur de la saisie DOM et de l’historique : non ajoutée au dépôt ; la vérification a été exécutée directement dans Chrome via l’outil d’interface.
- Appareils tactiles physiques et parcours tactile réel ; les trois viewports exacts du menu/paramètres sont désormais vérifiés.
- Temps de chargement comparables et validation sur appareils tactiles physiques ; les FPS des six cartes sont désormais mesurés dans l’environnement Chrome courant.
- Comparaison artistique complète des six régions avec les références ; les niveaux 2 à 6 disposent d’une passe stylisée mais pas encore d’une finition pixel-art commerciale complète.
- Audio réel : aucun asset audio n’est présent, donc aucun faux réglage n’a été activé.

### Mise à jour — smoke test navigateur versionné

`npm run qa:browser` a réussi le 17 octobre 2026 sur Windows avec Chrome headless. Le script lance Vite et Chrome dans des processus et un profil temporaires, puis confirme le parcours menu → paramètres → RTL → Nouvelle partie → chargement → introduction → niveau 1 → terminal `git init` → sauvegarde versionnée, sans exception ni erreur console applicative.

## Fichiers principaux modifiés

- `src/scenes/NewGameScene.ts`
- `src/scenes/WorldScene.ts`
- `src/scenes/TitleScene.ts`
- `src/scenes/UIScene.ts`
- `src/systems/TerminalInputModel.ts`
- `src/diagnostics/RuntimeMetrics.ts`
- `src/diagnostics/QaRoute.ts`
- `src/styles/main.css`
- `src/phaser/InputManager.ts`
- `src/managers/LevelManager.ts`
- `src/managers/SaveManager.ts`
- `src/core/GameSession.ts`
- `src/managers/I18nManager.ts`
- `src/scenes/BootScene.ts`
- `src/scenes/PreloadScene.ts`
- `src/scenes/VictoryScene.ts`
- `src/diagnostics/QaMarker.ts`
- `scripts/browser-smoke.mjs`
- `package.json` (`qa:browser`)
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
