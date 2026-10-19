# Niveau 6 — Intégration de Professeur Octo

## Périmètre

Cette étape ajoute le parcours pédagogique optionnel du Château des Conflits.
La mission `quest-06`, la commande `git merge`, le simulateur Git, les
récompenses, la sauvegarde et l’écran de victoire restent inchangés.

## Changements

- Ajout de l’objet Tiled `professor-octo` dans
  `public/data/maps/level-06.json` à la position accessible `(400, 300)`.
- Chargement local du sprite et du portrait d’Octo pour `level-06`.
- Réutilisation de `ProfessorOctoCoursePanel` avec six pages consacrées à
  `git merge`, à l’état du dépôt et à la résolution d’un conflit.
- Ajout d’un quiz optionnel de trois questions, sans XP, objet ou progression
  de quête.
- Ajout des textes français, anglais et arabe avec le RTL partagé du panneau.
- Ajout de la notification de pratique du Sanctuaire Git du château.
- Ajout d’une cible QA navigateur dédiée au niveau 6.

## Validation automatisée

Les tests couvrent la présence de l’objet Tiled, le chargement des assets, les
six pages dans les trois langues, les questions du quiz et l’absence d’effet
sur la progression métier.

Résultats à produire après l’implémentation :

- `npm test` ;
- `npm run typecheck` ;
- `npm run build` ;
- QA Chrome desktop, mobile paysage, mobile portrait et arabe RTL.

La transition complète `git merge` → coffre → porte → `victory` doit être
validée séparément, car elle concerne la logique de fin du jeu et non le cours
optionnel.

## Limites

Les captures et la validation navigateur de cette intégration restent à
produire dans cette étape. Le problème historique éventuel de transition du
niveau 6 vers `victory` doit rester documenté séparément et ne doit pas être
masqué par la réussite du panneau Octo.
