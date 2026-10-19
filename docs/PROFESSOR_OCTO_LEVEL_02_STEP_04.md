# Professeur Octo — Niveau 2 — Mini-tâche 4/4

## Statut

Implémentation terminée et vérifiée localement. Cette étape ajoute uniquement le quiz pédagogique optionnel de la Forêt des Fichiers (`git add`). Aucun commit ni push n'a été effectué.

L'anomalie QA globale connue — blocage de la transition du niveau 6 vers `victory` — reste ouverte et n'a pas été modifiée dans cette étape.

## Périmètre

Le quiz réutilise le moteur et le panneau `ProfessorOctoCoursePanel` existants. Il est activé par l'identifiant de niveau :

- `level-01` conserve son quiz `git init` existant ;
- `level-02` expose le nouveau quiz `git add` ;
- les autres niveaux restent inchangés.

Le quiz ne touche ni `GitSimulator`, ni `QuestManager`, ni `SaveManager`, ni l'XP, ni l'inventaire, ni les conditions de progression. Il est donc rejouable et sans effet de bord sur le gameplay.

## Contenu du quiz niveau 2

| Question | Bonne réponse | Notion vérifiée |
| --- | --- | --- |
| À quoi sert `git add` ? | Préparer les changements pour le prochain commit | La zone de préparation, sans commit ni envoi vers GitHub |
| Que fait `git add README.md` ? | Préparer les changements de `README.md` | Le ciblage d'un fichier |
| Quelle affirmation est correcte après `git add .` ? | Les changements concernés sont préparés selon les règles Git, dont `.gitignore` | La portée de la commande, sans commit automatique |

Chaque question autorise une seule réponse. Après validation, le panneau affiche un retour positif ou correctif, puis permet de continuer. Une réponse déjà traitée ne peut pas être comptée deux fois.

## Résultats et navigation

Le résultat affiche le score `0/3` à `3/3` et un message adapté au niveau 2. Les actions disponibles sont :

- `Revoir` : revenir au cours ;
- `Réessayer` : recommencer le quiz ;
- `Aller pratiquer` : fermer le panneau et reprendre l'exploration ;
- `Fermer` : fermer le panneau.

Sur la page 6/6 du cours, le joueur peut choisir `Aller pratiquer` ou `Tester mes connaissances`. Le raccourci `Q` ouvre le quiz depuis cette page dans le panneau d'Octo ; `P` revient à la pratique depuis l'écran de résultat. Ces raccourcis sont limités au panneau et ne modifient pas les contrôles du monde.

Les boutons gardent une vraie interaction Phaser. Une zone de pression dédiée accompagne l'action `Aller pratiquer` dans le résultat afin d'améliorer la cible tactile sans rendre l'interface visuellement plus lourde.

## Internationalisation et responsive

Les questions, réponses, explications et messages de résultat sont disponibles en français, anglais et arabe. Le panneau réutilise son mode RTL existant pour l'arabe.

Vérifications réalisées :

- desktop : `1280×720` ;
- mobile paysage : `844×390` ;
- mobile portrait : `390×844` ;
- arabe RTL : `844×390`.

Le layout conserve les adaptations desktop, compact et portrait déjà utilisées par le cours d'Octo. Les textes restent dans le panneau et les actions restent accessibles.

## Fichiers modifiés

- `src/ui/course/ProfessorOctoQuizContent.ts` — questions `git add`, bonnes réponses et activation par niveau ;
- `src/ui/course/ProfessorOctoCoursePanel.ts` — sélection du quiz par niveau, résultats localisés, navigation, raccourcis contextuels et cible tactile ;
- `src/managers/I18nManager.ts` — textes FR/EN/AR du quiz niveau 2 ;
- `tests/ProfessorOctoCourse.test.ts` — questions, réponses, feedback, rejeu, localisation et absence d'effets de bord ;
- `scripts/browser-smoke.mjs` — parcours QA et captures du quiz.

Aucune carte Tiled, donnée de mission, asset, règle Git ou scène de gameplay n'a été modifiée pour cette mini-tâche.

## Captures Chrome

Captures représentatives :

- [Question 1 — desktop](captures/octo-step4-quiz-question1-1280x720.png)
- [Feedback correct — desktop](captures/octo-step4-quiz-correct-1280x720.png)
- [Feedback incorrect — desktop](captures/octo-step4-quiz-incorrect-1280x720.png)
- [Résultat 3/3 — desktop](captures/octo-step4-quiz-result-3-1280x720.png)
- [Résultat 1/3 — desktop](captures/octo-step4-quiz-result-1-1280x720.png)
- [Revoir le cours — desktop](captures/octo-step4-quiz-review-1280x720.png)
- [Question 1 — mobile paysage](captures/octo-step4-quiz-question1-844x390.png)
- [Résultat — mobile portrait](captures/octo-step4-quiz-result-3-390x844.png)
- [Question 1 — arabe RTL](captures/octo-step4-quiz-question1-ar-844x390.png)
- [Résultat — arabe RTL](captures/octo-step4-quiz-result-3-ar-844x390.png)

Les captures complémentaires de questions, feedbacks et tailles sont conservées dans `docs/captures/` avec le préfixe `octo-step4-`.

## Vérifications réelles

| Vérification | Résultat |
| --- | --- |
| `npm test` | PASS — 79/79 |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `node --check scripts/browser-smoke.mjs` | PASS |
| QA Chrome desktop 1280×720 | PASS — 60 FPS mesurés |
| QA Chrome mobile paysage 844×390 avec interaction tactile | PASS — 60 FPS mesurés |
| QA Chrome mobile portrait 390×844 | PASS avec parcours clavier — 60 FPS mesurés |
| QA Chrome arabe RTL 844×390 | PASS — 60 FPS mesurés |

Le build signale toujours un avertissement non bloquant sur la taille du chunk Phaser (`1,208 kB` minifiés). Il ne concerne pas cette mini-tâche.

La compatibilité du clic tactile de l'action de résultat `Aller pratiquer` n'a pas pu être isolée avec certitude en portrait dans l'émulation headless Chrome : cette configuration ne génère pas toujours l'événement de compatibilité attendu. Le bouton et sa zone tactile dédiée sont bien présents ; le parcours tactile complet a été confirmé en paysage, et le parcours portrait a été confirmé au clavier. Une vérification sur appareil mobile réel reste recommandée.

## Limites et suite

Cette mini-tâche ne crée pas encore de quiz pour les niveaux 3 à 6 et ne corrige pas le blocage QA du niveau 6. Elle clôt le travail demandé pour le niveau 2 ; le développement s'arrête ici dans l'attente de validation.
