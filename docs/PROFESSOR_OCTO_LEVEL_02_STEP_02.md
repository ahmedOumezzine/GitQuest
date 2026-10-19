# Professeur Octo — Niveau 2 — Mini-tâche 2/4

## Résumé

Le Professeur Octo est accessible dans la Forêt des Fichiers à partir de l’ancre Tiled `professor-octo`, en `(560, 300)`. L’interaction reprend le fonctionnement existant : proximité courte, indicateur contextuel, touche `E` sur PC et bouton tactile sur mobile.

Le panneau RPG partagé affiche maintenant une introduction provisoire de trois pages sur `git add`, en français, anglais et arabe RTL. Cette mini-tâche ne lance aucune commande Git et ne valide aucune étape de quête.

## Modifications

- `src/ui/course/ProfessorOctoCourseContent.ts`
  - Ajout du pack de trois pages spécifique au niveau 2.
  - Page finale avec action `close`, sans quiz ni action `practice`.
- `src/managers/I18nManager.ts`
  - Ajout des textes FR/EN/AR pour les trois pages et le titre du panneau.
  - Les termes techniques `git add`, `git commit` et `staging area` restent inchangés.
- `src/ui/course/ProfessorOctoCoursePanel.ts`
  - Réutilisation du panneau RPG existant.
  - Quiz désactivé pour `level-02`.
  - Bouton `Terminer`/`Finish`/`إنهاء` sur la dernière page, avec `Fermer` disponible séparément.
- `scripts/browser-smoke.mjs`
  - Scénario ciblé de capture des pages du cours niveau 2 et vérification du verrouillage/restauration des contrôles.
- `tests/ProfessorOctoCourse.test.ts`
  - Vérification des trois pages, de l’action finale, des traductions et de l’absence de commande pédagogique exécutable.

Les scènes, l’ancre Tiled, les positions du joueur et de Midou, les collisions, le HUD global, les quêtes, XP, récompenses, sauvegardes et conditions de porte n’ont pas été modifiés pour cette mini-tâche.

## Captures Chrome

- [Octo avec indicateur — 1280×720](captures/professor-octo-level2-near-1280x720.png)
- [Page 1 — 1280×720](captures/professor-octo-level2-page-1-1280x720.png)
- [Page 2 — 1280×720](captures/professor-octo-level2-page-2-1280x720.png)
- [Page 3 — 1280×720](captures/professor-octo-level2-page-3-1280x720.png)
- [Interface portrait — 390×844](captures/professor-octo-level2-mobile-portrait-390x844.png)
- [Interface paysage — 844×390](captures/professor-octo-level2-mobile-landscape-844x390.png)
- [Arabe RTL — 844×390](captures/professor-octo-level2-arabic-rtl-844x390.png)

Les captures montrent le panneau dans les limites du viewport, le portrait sans déformation, la navigation page par page et l’absence de débordement horizontal visible sur les formats mobiles vérifiés.

## Vérifications

- `npm test` — PASS, 76 tests.
- `npm run typecheck` — PASS.
- `npm run build` — PASS. Vite signale seulement le chunk Phaser supérieur à 1200 kB, avertissement non bloquant.
- `npm run qa` avec `GITQUEST_QA_LEVEL=level-02`, port HTTP `5260`, port CDP `9280` — PASS, niveau rendu, FPS observé 46.
- Captures ciblées Chrome avec ports `5257` (portrait), `5258` (arabe RTL), `5259` (paysage) et `5262` (pages desktop) — PASS.

Le runner vérifie aussi que le déplacement est bloqué pendant le panneau Octo puis restauré après fermeture. Une première tentative sur le port `5250` a expiré avant l’accès au serveur local ; la relance sur les ports documentés ci-dessus a abouti.

## Limites et périmètre

Le contenu est volontairement provisoire et limité à trois pages. Aucun exercice, quiz, gain d’XP, récompense, validation de quête ou exécution de `git add` n’a été ajouté. La mini-tâche 3/4 n’est pas commencée.

Aucun commit ni push n’a été effectué.
