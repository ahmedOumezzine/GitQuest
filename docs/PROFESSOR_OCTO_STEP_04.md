# GitQuest — Professeur Octo — Mini-tâche 4/4

## Portée

Un quiz facultatif de trois questions vérifie les notions de `git init` après la sixième page du cours. Le quiz ne lance aucune commande Git, ne modifie pas la sauvegarde et ne participe pas à la progression du niveau.

La mini-tâche s’arrête ici. Aucun commit ni push n’a été effectué.

## Fonctionnement livré

- La page 6 propose `Aller pratiquer` et `Tester mes connaissances`.
- Le quiz affiche une question à la fois avec trois boutons de réponse.
- Une réponse est corrigée immédiatement avec un retour pédagogique non punitif.
- Les marqueurs textuels `✓` et `✗` complètent les couleurs pour rendre l’état compréhensible.
- Le score final affiche `3 / 3`, `1 ou 2 / 3` ou `0 / 3` avec le message demandé.
- Le résultat propose `Revoir la leçon`, `Réessayer le quiz`, `Aller pratiquer` et `Fermer`.
- Les contrôles clavier permettent la sélection par flèches, la validation par Entrée et les raccourcis A/B/C. Les boutons tactiles restent disponibles.
- La fermeture restaure le monde comme avant ; le quiz ne persiste aucun état.

## Architecture

- `src/ui/course/ProfessorOctoQuizContent.ts` contient les questions, réponses et corrections localisées.
- `src/ui/course/ProfessorOctoQuizLogic.ts` contient la session éphémère du quiz et le calcul du score.
- `src/ui/course/ProfessorOctoCoursePanel.ts` réutilise le panneau RPG, le portrait, les boutons et le layout responsive pour le cours, le quiz et le résultat.
- `src/managers/I18nManager.ts` contient les textes français, anglais et arabes. Les fragments techniques `git init` et `.git` sont conservés exactement.
- `tests/ProfessorOctoCourse.test.ts` couvre les bonnes réponses, les erreurs, le score, le redémarrage, l’optionnalité, les traductions et l’absence d’effet sur XP/Git/quête.

Aucune modification de `WorldScene`, `GitSimulator`, `QuestManager`, `SaveManager`, du HUD global, des cartes ou des niveaux 2 à 6 n’a été nécessaire pour cette mini-tâche.

## Captures Chrome

- [Page 6 avec les deux actions](captures/professor-octo-course-page-6-quiz-actions.png)
- [Question 1](captures/professor-octo-quiz-question-1.png)
- [Réponse correcte](captures/professor-octo-quiz-correct-answer.png)
- [Réponse incorrecte](captures/professor-octo-quiz-incorrect-answer.png)
- [Résultat 3/3](captures/professor-octo-quiz-result-3-of-3.png)
- [Résultat 1/3](captures/professor-octo-quiz-result-1-of-3.png)
- [Quiz mobile portrait](captures/professor-octo-quiz-mobile-portrait.png)
- [Quiz mobile paysage](captures/professor-octo-quiz-mobile-landscape.png)
- [Quiz arabe RTL](captures/professor-octo-quiz-arabic-rtl.png)

Les captures montrent le portrait conservé, les boutons lisibles, le score et la navigation sans débordement visible. L’écran arabe affiche les réponses et le bouton de fermeture dans la direction RTL.

## Vérifications

- `npm test` — **75 tests réussis**.
- `npm run typecheck` — **réussi**.
- `npm run build` — **réussi**.
- `npm run qa` — **réussi**, 1280×720, port Vite `5217`, CDP `9247`, FPS `49.18`.
- `npm run qa` — **réussi**, 1908×900, port Vite `5220`, CDP `9250`, FPS `42.30`.
- `npm run qa` — **réussi**, 844×390 tactile, port Vite `5221`, CDP `9251`, FPS `48.20`.
- `npm run qa` — **réussi**, 390×844 tactile, port Vite `5218`, CDP `9248`, FPS `47.22`.
- `npm run qa` — **réussi**, arabe RTL 390×844 tactile, port Vite `5219`, CDP `9249`, FPS `52.13`.

Les ports étaient libres pour chaque exécution. Le build conserve l’avertissement non bloquant de taille du chunk Phaser après minification ; aucun échec de compilation ou de QA n’a été observé.

## Contraintes respectées

- Aucun XP, objet, récompense, validation de quête, téléportation ou état persistant ajouté.
- Le quiz reste facultatif et rejouable.
- La vraie commande `git init` reste exclusivement exécutée dans le terminal du Sanctuaire Git.
- Aucun changement de terrain, décor, collision, position, caméra, sprite, portrait ou progression des niveaux suivants.
