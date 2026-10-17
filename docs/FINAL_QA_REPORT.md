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

- `npm test` : **22/22 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**.
- Chrome desktop : menu, paramètres, changement de langue, niveau 1 et absence d’erreur console vérifiés.
- Niveau 1 : carte Tiled, objectif initial, collisions et rendu TilemapLayer observés.
- Parcours frais dans Chrome sur `http://192.168.115.51:5174/?qa=fresh` : Nouvelle partie → écran de chargement à 100 % → introduction → Passer → niveau 1 vérifié.
- Interaction réelle avec Midou vérifiée : l’objectif passe de « Parler à Midou » à « Exécuter git init ».
- Terminal réel vérifié : `git init` est accepté et l’objectif passe à « Trouver la clé » ; la saisie clavier caractère par caractère conserve l’espace dans `git init`.
- Sauvegarde vérifiée : après actualisation, le menu affiche Continuer et ce bouton recharge le niveau 1 avec l’objectif déjà avancé.
- Console Chrome sur le parcours isolé : **0 erreur / 0 avertissement**.

## Non certifié

- Parcours navigateur complet automatisé jusqu’à l’ouverture de la porte et au niveau 2 ; le parcours vérifié s’arrête après `git init`.
- Viewports mobiles exacts et appareils tactiles physiques.
- FPS et temps de chargement mesurés sur les six niveaux.
- Comparaison artistique complète des six régions avec les références.
- Audio réel : aucun asset audio n’est présent, donc aucun faux réglage n’a été activé.

## Fichiers principaux modifiés

- `src/scenes/NewGameScene.ts`
- `src/scenes/WorldScene.ts`
- `src/scenes/TitleScene.ts`
- `src/scenes/UIScene.ts`
- `src/phaser/InputManager.ts`
- `src/managers/LevelManager.ts`
- `src/managers/SaveManager.ts`
- `src/core/GameSession.ts`
- `src/managers/I18nManager.ts`
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
