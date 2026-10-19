# Niveau 5 — Intégration de Professeur Octo

## Périmètre

Cette étape ajoute le parcours pédagogique optionnel de Professeur Octo à la
Montagne des Branches. La mission `quest-05`, les commandes `git branch` et
`git switch`, les récompenses, les sauvegardes, les collisions et le niveau 6
restent inchangés.

## Changements

- Ajout de l’objet Tiled `professor-octo` dans `public/data/maps/level-05.json`
  à la position accessible `(540, 270)`.
- Chargement local du sprite et du portrait d’Octo pour `level-05` dans
  `src/data/AssetManifest.ts`.
- Réutilisation du composant partagé `ProfessorOctoCoursePanel` avec un pack
  de six pages consacré aux branches et au changement de branche.
- Ajout d’un quiz optionnel de trois questions, sans XP, objet, GitSimulator ou
  progression de quête.
- Ajout des textes français, anglais et arabe dans `I18nManager`, avec le RTL
  déjà appliqué par le panneau partagé.
- Indication de pratique localisée après la fermeture du cours.

## Validation automatisée

Les tests dédiés vérifient :

- présence de l’objet Tiled et de ses propriétés `teacher` / `branch-switch` ;
- chargement différé des deux assets Octo ;
- six pages de cours dans les trois langues ;
- commandes et explications `git branch` / `git switch` ;
- quiz 3/3 et absence d’effet sur XP, inventaire ou progression.

Résultats réellement obtenus :

- `npm test` : PASS, 91/91 tests ;
- `npm run typecheck` : PASS ;
- `npm run build` : PASS, avec uniquement l’avertissement connu sur le chunk
  Phaser d’environ 1,2 Mo minifié ;
- `GITQUEST_QA_LEVEL=level-05 npm run qa:browser` : PASS, niveau rendu à
  54 FPS ;
- QA Chrome ciblée Octo en 1280×720 : PASS, cours ouvert, déplacements
  verrouillés pendant le panneau et contrôles restaurés à la fermeture ;
  mesure de la session : 59 FPS.

Captures produites :

- `docs/captures/level-05-octo-near-1280x720.png` ;
- `docs/captures/level-05-octo-course-1280x720.png` ;
- `docs/captures/level-05-octo-after-course-1280x720.png` ;
- `docs/captures/level-05-octo-near-ar-844x390.png` et
  `level-05-octo-course-ar-844x390.png` ;
- `docs/captures/level-05-octo-near-390x844.png` et
  `level-05-octo-course-390x844.png`.

Les deux passes mobiles ont également terminé avec `QA navigateur PASS` à
60 FPS. La passe paysage utilisait l’arabe RTL ; la passe portrait utilisait
la composition compacte.

## Limites

Le parcours métier complet `branch` → `switch` → coffre → porte n’a pas été
rejoué dans cette étape : la QA ciblée porte sur le rendu du niveau et le
parcours pédagogique optionnel. Le problème QA historique de transition du
niveau 6 vers `victory`, s’il réapparaît dans la suite globale, reste hors
périmètre.
