# GitQuest — Niveau 3 : Grotte des Souvenirs

## Statut

Le niveau 3 est implémenté et validé sur son périmètre : carte Tiled, progression `git commit`, cours de Professeur Octo, quiz optionnel, traductions FR/EN/AR, responsive et sauvegarde.

La QA globale du jeu reste bloquée par l’anomalie connue de transition du niveau 6 vers `victory`. Cette anomalie n’a pas été modifiée dans cette intervention.

## Fonctionnalités livrées

- Carte Tiled `30 × 17`, tuiles `32 × 32`, avec couches `Ground`, `Decorations`, `Collisions` et `Objects` conservées.
- Composition de grotte basée sur l’asset local `level-03-cave.png` : cristaux, cascades, plateformes rocheuses, torches, autel de commit, coffre et porte.
- Six décorations de grotte supplémentaires branchées sur des assets locaux existants : stalagmite, flaque, rochers, poussière, rune et lanterne.
- Spawn joueur et Midou repositionnés sur une zone praticable de la carte : joueur `(220, 340)`, Midou `(180, 300)`.
- Professeur Octo ajouté dans la couche `Objects` sous l’identifiant stable `professor-octo`, en `(300, 260)`.
- Interaction Octo avec `E` et le bouton tactile, nom localisé, verrouillage du déplacement pendant le panneau, restauration à la fermeture.
- Cours pédagogique dédié au niveau 3 en six pages : préparation, rôle du commit, option `-m`, exemples, séquence pratique et retour vers le sanctuaire.
- Quiz optionnel de trois questions avec feedback correct/incorrect, score `3/3` ou `1/3`, revue et nouvelle tentative.
- Commande réelle validée par `GitSimulator` : `git commit -m "message"`, avec état Git initialisé et fichiers indexés requis.
- Récompenses et progression métier inchangées : cristal optionnel, coffre, clé de passage, porte et transition vers le niveau 4.
- Les boutons texte Octo recalculent leurs zones tactiles après localisation. Le double `pointerup` du bouton de pratique a été supprimé pour éviter une activation pendant le même geste que le dernier bouton « Suivant ».

## Fichiers modifiés

- `public/data/maps/level-03.json`
- `public/data/levels/level-03.json`
- `src/data/AssetManifest.ts`
- `src/scenes/WorldScene.ts`
- `src/scenes/UIScene.ts`
- `src/managers/I18nManager.ts`
- `src/ui/course/ProfessorOctoCourseContent.ts`
- `src/ui/course/ProfessorOctoCoursePanel.ts`
- `src/ui/course/ProfessorOctoQuizContent.ts`
- `scripts/browser-smoke.mjs`
- `tests/AssetManifest.test.ts`
- `tests/LevelManager.test.ts`
- `tests/ProfessorOctoCourse.test.ts`

Aucun nouvel asset tiers n’a été ajouté. Les images de grotte et les assets Octo déjà présents dans `public/assets` ont été réutilisés ; leur provenance reste documentée dans `public/assets/ASSETS.md`.

## Tests automatisés

- `npm test` : **82/82 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**. Vite signale uniquement l’avertissement déjà connu sur le chunk Phaser de 1,208 kB.
- Tests ajoutés : assets niveau 3, objets Tiled de grotte, cours six pages, quiz trois questions, localisation et absence de récompense pédagogique.

## QA navigateur ciblée

### Desktop 1280 × 720

PASS à 60 FPS pour le rendu du niveau, Midou, Octo, le cours, les six pages, le quiz et le retour au monde.

Le parcours métier réel a également été exécuté :

1. interaction Midou ;
2. ouverture du sanctuaire ;
3. saisie de `git commit -m "archive"` dans le terminal ;
4. validation de `run-commit` ;
5. collecte du coffre et de la clé ;
6. ouverture de la porte ;
7. sauvegarde en `level-04` avec le commit et le coffre collecté.

La clé est consommée par la porte au moment du changement de niveau ; la QA vérifie donc sa présence avant la porte et la collecte persistée après la transition.

### Mobile paysage 844 × 390

PASS à 60 FPS pour l’ouverture tactile du cours, les réponses du quiz, les feedbacks, le score parfait, la reprise avec erreurs et le retour au monde.

### Mobile portrait 390 × 844

PASS pour l’affichage responsive, le cours, les réponses tactiles, les feedbacks et les transitions du quiz jusqu’aux résultats `3/3` et `1/3`.

Le runner Chrome headless ne confirme pas de façon fiable le tap final « Aller pratiquer » en portrait : l’émulation conserve parfois l’état `course` après le tap. Le clavier ferme correctement le panneau. Ce point doit être vérifié sur un téléphone réel ou dans Chrome DevTools avec un vrai événement tactile avant de le considérer totalement certifié.

### Arabe RTL

PASS sur `844 × 390` : `lang="ar"`, `dir="rtl"`, textes Octo et pages du cours alignés à droite, commandes Git conservées lisibles de gauche à droite.

## Captures produites

Captures principales disponibles dans `docs/captures/` :

- `level-03-overview-1280x720.png`
- `level-03-midou-1280x720.png`
- `level-03-octo-near-1280x720.png`
- `level-03-course-page-1-1280x720.png` à `level-03-course-page-6-1280x720.png`
- `level-03-quiz-question1-1280x720.png`
- `level-03-quiz-correct-1280x720.png`
- `level-03-quiz-incorrect-1280x720.png`
- `level-03-quiz-result-3-1280x720.png`
- `level-03-quiz-result-1-1280x720.png`
- `level-03-quiz-review-1280x720.png`
- variantes `844x390`, `390x844` et `ar-844x390` pour les vérifications responsive et RTL.

## Limites et hors périmètre

- L’anomalie existante du niveau 6 vers `victory` reste ouverte : `npm run qa` échoue avec `État QA attendu « victory », obtenu « world »`.
- Aucun changement n’a été effectué dans les missions, le simulateur Git, les sauvegardes, le niveau 1, le niveau 2, ni les niveaux 4 à 6.
- Aucun commit ni push n’a été effectué.
- La confirmation finale du bouton tactile « Aller pratiquer » en portrait reste à effectuer sur appareil réel ou via une session Chrome DevTools tactile non headless.
