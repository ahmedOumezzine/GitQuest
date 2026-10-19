# GitQuest — Professeur Octo — Mini-tâche 2/4

## Périmètre livré

La mini-tâche couvre uniquement l’interaction avec Professeur Octo et son interface de cours RPG. Le contenu pédagogique reste provisoire et limité à trois pages ; aucun exercice, quiz, récompense ou validation de mission n’a été ajouté.

## Fonctionnement

- Octo est interactif à courte distance avec la touche `E` sur PC et le bouton d’interaction tactile existant sur mobile.
- L’indicateur `✦` apparaît discrètement au-dessus d’Octo lorsqu’il est sélectionné.
- La cible proche est choisie par distance minimale, sans modifier les interactions de Midou, du coffre, du cristal, du sanctuaire ou de la porte.
- L’ouverture du cours verrouille le déplacement du joueur et les interactions du monde. La fermeture ou le bouton `Terminer` restaure l’état normal.
- Le panneau utilise le portrait existant, un cadre bleu nuit à bordure dorée, les boutons `Précédent`, `Suivant`, `Terminer` et `Fermer`, ainsi que l’indicateur `1 / 3`.
- La navigation clavier accepte aussi les flèches et `Échap` pour faciliter la vérification ; la navigation tactile utilise les boutons du panneau.
- Le contenu et les libellés passent par `I18nManager` en français, anglais et arabe. La mise en page et l’alignement du texte suivent la direction RTL en arabe.
- Le contenu des pages est isolé dans `ProfessorOctoCourseContent`, tandis que `ProfessorOctoCoursePanel` reste réutilisable pour de futurs cours courts.

## Fichiers concernés

- `src/scenes/WorldScene.ts` — proximité, indicateur, sélection de la cible la plus proche, verrouillage du monde et événements d’ouverture/fermeture.
- `src/scenes/UIScene.ts` — branchement du panneau au HUD, blocage des taps derrière la fenêtre et état QA.
- `src/ui/course/ProfessorOctoCourseContent.ts` — définition localisée des trois pages.
- `src/ui/course/ProfessorOctoCoursePanel.ts` — fenêtre RPG responsive et navigation.
- `src/managers/I18nManager.ts` — textes FR/EN/AR et hint d’interaction Octo.
- `tests/ProfessorOctoCourse.test.ts` — vérification des trois pages, des traductions et de la direction arabe.

Les sprites et portraits existants de l’étape 1 ont été réutilisés sans modification.

## Captures réelles

- [Indicateur d’interaction — 1280×720](captures/professor-octo-interaction-1280x720.png)
- [Page 1 — 1280×720](captures/professor-octo-course-page-1-1280x720.png)
- [Page 2 — 1280×720](captures/professor-octo-course-page-2-1280x720.png)
- [Page 3 — 1280×720](captures/professor-octo-course-page-3-1280x720.png)
- [Cours mobile portrait — 390×844](captures/professor-octo-course-mobile-portrait-390x844.png)
- [Cours mobile paysage — 844×390](captures/professor-octo-course-mobile-landscape-844x390.png)

## Vérifications exécutées

- `npm test` — PASS, 70 tests.
- `npm run typecheck` — PASS.
- `npm run build` — PASS. Vite signale seulement l’avertissement habituel de taille du chunk Phaser.
- `npm run qa` — PASS à 1280×720 avec les ports libres `5194` et `9225` : `QA navigateur PASS: level-01, niveau rendu et FPS 45.25.`
- `npm run qa` — PASS à 1908×900 avec les ports `5198` et `9229` : FPS 46.23.
- `npm run qa` — PASS à 844×390 tactile avec les ports `5196` et `9227` : FPS 47.00.
- `npm run qa` — PASS à 390×844 tactile avec les ports `5199` et `9231` : FPS 49.18.
- `npm run qa` — PASS avec locale arabe RTL à 390×844 tactile avec les ports `5201` et `9233` : FPS 52.00.

Les deux premiers essais responsive lancés en parallèle ont rencontré une fermeture transitoire de cible Chrome ; les relances séquentielles sur ports libres ont passé la QA avec succès. Aucun commit ni push n’a été effectué.

## Limites connues

La fenêtre conserve le HUD du monde visible en arrière-plan, conformément à la demande d’éviter un panneau géant plein écran. Le cours complet `git init` et toute validation pédagogique restent volontairement réservés à la mini-tâche 3.
