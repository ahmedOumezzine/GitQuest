# GitQuest — Niveau 4 : Port des Connexions

## Statut

Le niveau 4 est implémenté et validé sur son périmètre : carte Tiled, port graphique, progression réelle `git push` puis `git pull`, Professeur Octo, cours en six pages, quiz facultatif, FR/EN/AR RTL, contrôles tactiles et transition vers le niveau 5.

La QA globale des six niveaux reste bloquée par l’anomalie préexistante de transition du niveau 6 vers `victory`. Cette anomalie n’a pas été modifiée dans cette intervention.

## Audit initial

- Carte Tiled : `30 × 17`, tuiles `32 × 32`.
- Couches conservées : `Ground`, `Decorations`, `Collisions`, `Objects`.
- Objets métier existants conservés : `player-spawn`, `midou`, `exit-gate`, `harbor-crystal`, `harbor-chest`, `harbor-scroll`, `harbor-secret-passage`.
- Collisions portuaires conservées : quatre murs/barrages qui empêchent le passage à travers les zones non praticables, tout en laissant les quais et corridors utilisables.
- La quête existante impose : dialogue Midou → `push` → `pull` → coffre/clé → porte.
- Le rendu utilisait déjà le background local `level-04-harbor.png` et les sprites locaux du port ; aucun asset tiers n’a été ajouté.

## Fonctionnalités livrées

### Carte et composition

- Professeur Octo ajouté dans `Objects` avec l’identifiant stable `professor-octo`, position `(560, 300)` et rôle pédagogique `push-pull`.
- Deux détails portuaires supplémentaires ajoutés à `Decorations` en réutilisant les assets locaux : cordage et écume.
- Le parcours reste navigable entre l’arrivée, Midou, le sanctuaire maritime, Octo, les objets optionnels, le coffre et la porte.
- Le zoom, les bounds et le suivi de caméra existants du profil harbor sont conservés.

### Professeur Octo

- Chargement lazy des assets Octo pour `level-04`.
- Interaction partagée avec les niveaux précédents : `E`, bouton tactile, indicateur de proximité, verrouillage du joueur pendant le panneau et restauration à la fermeture.
- Sélection du contenu par `levelId` dans le panneau commun ; aucune duplication de scène ou de moteur d’interaction.

### Cours pédagogique

Six pages localisées expliquent :

1. le rôle d’un dépôt distant ;
2. la relation dépôt local ↔ dépôt distant ;
3. `git push origin main` ;
4. `git pull origin main` ;
5. un aller-retour simulé ;
6. la pratique au Sanctuaire Git.

Le cours n’exécute aucune commande, ne donne ni XP ni objet et ne valide aucune étape de quête.

### Quiz facultatif

- Trois questions, une réponse par question.
- Feedback correct/incorrect, score, révision et nouvelle tentative.
- Le quiz ne modifie ni XP, ni inventaire, ni Git, ni la sauvegarde.

### Simulateur Git

Le modèle existant de dépôt distant est conservé et rendu plus strict pour ce scénario :

- `git push` échoue si la branche locale ne possède aucun commit ; sinon les commits de la branche sont copiés dans `remoteCommits`.
- `git pull` échoue si aucun historique distant simulé n’existe ; sinon les commits distants absents de la branche locale sont intégrés.
- Après `push`, `pull` peut confirmer que le dépôt est déjà à jour ; l’opération reste une synchronisation réussie.
- Aucun compte GitHub, réseau réel ou authentification n’est utilisé.

## Fichiers modifiés

- `public/data/maps/level-04.json`
- `src/data/AssetManifest.ts`
- `src/scenes/WorldScene.ts`
- `src/scenes/UIScene.ts`
- `src/managers/I18nManager.ts`
- `src/systems/GitSimulator.ts`
- `src/ui/course/ProfessorOctoCourseContent.ts`
- `src/ui/course/ProfessorOctoQuizContent.ts`
- `src/ui/course/ProfessorOctoCoursePanel.ts`
- `scripts/browser-smoke.mjs`
- `tests/AssetManifest.test.ts`
- `tests/LevelManager.test.ts`
- `tests/GitSimulator.test.ts`
- `tests/ProfessorOctoCourse.test.ts`

`public/assets/ASSETS.md` n’a pas été modifié : tous les sprites et le décor du port utilisés étaient déjà présents et documentés localement.

## Vérifications automatisées

- `npm test` : **85/85 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**. Avertissement non bloquant conservé sur le chunk Phaser minifié de 1,208 MB.
- `node --check scripts/browser-smoke.mjs` : **PASS**.

Tests ajoutés ou étendus :

- présence de l’ancre Tiled `professor-octo` et des détails portuaires ;
- chargement lazy des assets harbor et Octo ;
- cours et quiz niveau 4 dans les trois locales ;
- refus de `push` sans commit et de `pull` sans historique distant ;
- progression `push`/`pull` idempotente et data-driven.

## QA Chrome réelle

### Parcours métier complet — desktop 1280 × 720

**PASS** : arrivée simulée depuis le niveau 3, dialogue Midou, terminal du sanctuaire, `git push`, `git pull`, coffre, clé, porte et transition vers `level-05`.

La sauvegarde finale contrôlée contenait :

- `levelId = level-05` ;
- `remoteCommits` contenant `c1` ;
- `collectedObjects.level-04` contenant `harbor-chest`.

### Rendu et responsive

- Desktop `1280 × 720` : **PASS**, 60 FPS mesurés.
- Mobile paysage `844 × 390`, tactile : **PASS**, environ 52 FPS.
- Mobile portrait `390 × 844`, tactile : **PASS**, environ 51 FPS.
- Cours/quiz Octo desktop : **PASS**, six pages, quiz et retour au monde.
- Cours/quiz Octo tactile `844 × 390` : **PASS**, interaction et navigation testées.
- Arabe RTL tactile `844 × 390` : **PASS**, `lang="ar"`, `dir="rtl"`, cours, quiz et boutons correctement navigables.

Captures principales :

- `docs/captures/level-04-1280x720.png`
- `docs/captures/level-04-844x390.png`
- `docs/captures/level-04-390x844.png`
- `docs/captures/level-04-octo-near-1280x720.png`
- `docs/captures/level-04-course-page-1-1280x720.png` à `level-04-course-page-6-1280x720.png`
- `docs/captures/level-04-quiz-result-1280x720.png`
- `docs/captures/level-04-course-ar-844x390.png`

### QA globale

`npm run qa` exécuté sur des ports isolés. Résultat : **FAIL connu hors périmètre**, à la transition finale du niveau 6 :

```text
État QA attendu « victory », obtenu « world »
```

Le niveau 4 ne provoque pas cette erreur : son parcours ciblé et sa sauvegarde ont été validés indépendamment.

## Limites restantes

- La simulation distante ne modélise pas l’authentification, les permissions réseau ni les conflits de pull réels ; ces simplifications sont intentionnelles pour la V1 sans backend.
- Les assets du port sont locaux et détaillés, mais aucun nouveau tileset ou asset tiers n’a été produit pendant cette étape.
- La transition niveau 6 → `victory` reste à corriger dans une intervention dédiée.
- Aucun commit ni push n’a été effectué.
