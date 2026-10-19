# Professeur Octo — Niveau 2 — Mini-tâche 3/4

## Périmètre

La mini-tâche 3 remplace le contenu provisoire de Professeur Octo dans la Forêt des Fichiers par une leçon complète de six pages sur `git add`.

Cette étape ne modifie pas les règles de progression. Elle ne lance aucune commande Git, ne valide aucune quête, ne donne ni XP ni récompense et ne téléporte pas le joueur.

## Contenu pédagogique

Les six pages sont data-driven et restent servies par le panneau RPG partagé :

1. Accueil : « Préparons nos fichiers ! ».
2. Zone de préparation/staging area, avec l’analogie du panier et le chemin « fichiers modifiés → zone de préparation → futur commit ».
3. Commande exacte `git add fichier.txt`.
4. Exemples `git add README.md` et `git add .`, avec rappel de `.gitignore`.
5. Scénario simulé avec `git status`, `git add README.md`, état préparé et rappel qu’aucun commit ni envoi GitHub n’a lieu.
6. Conclusion « Direction le Sanctuaire Git ! » avec l’action « Aller pratiquer ».

La dernière action ferme le cours et affiche une indication localisée. Le joueur doit ensuite rejoindre réellement le Sanctuaire Git ; aucune progression n’est déclenchée par le cours.

## Fichiers concernés

- `src/ui/course/ProfessorOctoCourseContent.ts` — six pages niveau 2, distinctes du cours `git init` du niveau 1.
- `src/managers/I18nManager.ts` — textes FR/EN/AR, commandes Git conservées telles quelles et textes de pratique.
- `src/ui/course/ProfessorOctoCoursePanel.ts` — affichage des commandes multilignes, espace réservé aux résultats, correction de l’ancrage RTL et adaptation de la page dense 5.
- `src/scenes/UIScene.ts` — message de retour localisé après « Aller pratiquer ».
- `scripts/browser-smoke.mjs` — captures des six pages, vérification du verrouillage/restauration des déplacements et maintien tactile du pad directionnel.
- `tests/ProfessorOctoCourse.test.ts` — ordre des pages, commandes, notions pédagogiques, traductions, action finale et absence de récompense.

Aucun nouvel asset graphique n’a été ajouté. Le portrait et le sprite d’Octo existants sont réutilisés.

## Captures Chrome finales

### Desktop 1280×720

- [Octo à proximité](captures/octo-step3-final-near-1280x720.png)
- [Cours ouvert](captures/octo-step3-final-course-1280x720.png)
- [Page 1](captures/octo-step3-final-page-1-1280x720.png)
- [Page 2](captures/octo-step3-final-page-2-1280x720.png)
- [Page 3 — commande](captures/octo-step3-final-page-3-1280x720.png)
- [Page 4 — exemples](captures/octo-step3-final-page-4-1280x720.png)
- [Page 5 — scénario](captures/octo-step3-final-page-5-1280x720.png)
- [Page 6 — pratique](captures/octo-step3-final-page-6-1280x720.png)

### Mobile tactile

- [Page 5 en paysage 844×390](captures/octo-step3-final-page-5-844x390.png)
- [Page 5 en portrait 390×844](captures/octo-step3-final-page-5-390x844.png)
- [Page 5 en arabe RTL 844×390](captures/octo-step3-final-page-5-ar-844x390.png)
- [Page 3 en arabe RTL — commande](captures/octo-step3-final-page-3-ar-844x390.png)

Les captures finales vérifient que la page 5 ne recouvre plus les boutons, que les cadres de commande/résultat restent cohérents en RTL et que la navigation reste dans le viewport.

## Vérifications réalisées

- `npm test` — PASS, **76/76**.
- `npm run typecheck` — PASS.
- `npm run build` — PASS.
- `node --check scripts/browser-smoke.mjs` — PASS.
- Chrome QA niveau 2 desktop 1280×720 — PASS, FPS observé **60.00**.
- Chrome QA tactile paysage 844×390 — PASS, FPS observé **60.00**.
- Chrome QA tactile portrait 390×844 — PASS, FPS observé **60.00**.
- Chrome QA arabe RTL paysage 844×390 — PASS, direction `rtl` vérifiée, FPS observé **60.00**.
- Déplacement verrouillé pendant le panneau — vérifié.
- Déplacement restauré après fermeture/« Aller pratiquer » — vérifié au clavier et avec le pad tactile selon le scénario.

## Limites et anomalie connue

- Le quiz et ses récompenses restent volontairement hors périmètre ; ils appartiennent à la mini-tâche 4.
- Le cours n’ajoute aucune condition de quête et ne modifie pas `GitSimulator`, `QuestManager` ou `SaveManager`.
- L’anomalie QA globale déjà signalée — blocage au niveau 6 lors de la transition vers `victory` — reste ouverte et n’a pas été modifiée ici.
- L’avertissement de build sur le chunk Phaser supérieur à 1200 kB reste présent mais ne bloque pas la compilation.

## Statut

Mini-tâche 3/4 terminée localement. Aucun commit ni push effectué. Les mini-tâches suivantes, notamment le quiz, ne sont pas commencées.
