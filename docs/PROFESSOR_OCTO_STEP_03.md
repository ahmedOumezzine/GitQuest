# GitQuest — Professeur Octo — Mini-tâche 3/4

## Portée

La leçon interactive du niveau 1 porte maintenant sur `git init`. Elle utilise la fenêtre RPG existante de Professeur Octo et reste limitée à six pages de présentation. Aucun exercice, quiz, gain d’XP, validation de quête ou téléportation n’a été ajouté.

La mini-tâche 4 n’a pas été commencée. Aucun commit ni push n’a été effectué.

## Fonctionnement

- Une interaction avec `professor-octo` ouvre le cours lorsque le joueur est à courte distance.
- La sélection conserve l’objet interactif le plus proche et ne modifie pas les interactions existantes.
- La touche `E` et le bouton tactile existant ouvrent la fenêtre.
- Le déplacement et les interactions du monde sont suspendus pendant l’affichage du cours.
- La fermeture, `Échap` et la réouverture sont propres et idempotentes.
- La dernière page affiche `Aller pratiquer`, ferme la fenêtre et restaure le contrôle du joueur sans téléporter le personnage.

## Pages

1. Ta première aventure avec Git
2. Qu’est-ce qu’un dépôt Git ?
3. À quoi sert `git init` ? avec commande mise en évidence
4. Que se passe-t-il après ? avec `.git`
5. Exemple concret avec étapes numérotées et résultat simulé clairement présenté comme exemple
6. À toi de jouer ! avec l’appel au Sanctuaire Git

Le contenu est séparé de la présentation pour permettre d’ajouter d’autres cours sans grossir `WorldScene`.

## Fichiers concernés

- `src/ui/course/ProfessorOctoCourseContent.ts` — données localisées des six pages.
- `src/ui/course/ProfessorOctoCoursePanel.ts` — fenêtre RPG, navigation, commande, exemple, CTA final, RTL et responsive.
- `src/scenes/WorldScene.ts` — ouverture/fermeture déjà reliée à l’interaction d’Octo et au gel du joueur.
- `src/scenes/UIScene.ts` — création différée du panneau après le chargement du portrait, layout, fermeture et restauration du monde.
- `src/managers/I18nManager.ts` — textes français, anglais et arabe, avec fragments techniques conservés (`git init`, `.git`).
- `tests/ProfessorOctoCourse.test.ts` — ordre des pages, contenu technique, trois langues, bouton final et absence de récompense pédagogique.
- `scripts/browser-smoke.mjs` — attente explicite de `lang/dir` pour éviter une course dans la vérification arabe RTL.

## Captures réelles

- [Indicateur d’interaction](captures/professor-octo-interaction-step-03.png)
- [Page 3 — commande git init](captures/professor-octo-course-page-3-1280x720.png)
- [Page 4 — dossier .git](captures/professor-octo-course-page-4-1280x720.png)
- [Page 5 — exemple concret](captures/professor-octo-course-page-5-1280x720.png)
- [Page 6 — appel à la pratique](captures/professor-octo-course-page-6-1280x720.png)
- [Page 6 — mobile portrait 390×844](captures/professor-octo-course-page-6-mobile-portrait.png)
- [Page 6 — mobile paysage 844×390](captures/professor-octo-course-page-6-mobile-landscape.png)
- [Terminal après fermeture du cours](captures/professor-octo-course-terminal-after-close.png)

La vérification visuelle a notamment confirmé que la page 5 dense ne chevauche pas ses boutons et que les trois boutons restent séparés en portrait mobile.

## Vérifications

- `npm test` — **71 tests réussis**.
- `npm run typecheck` — **réussi**.
- `npm run build` — **réussi**.
- `npm run qa` — **réussi** en 1280×720, port Vite `5211`, CDP `9241`, FPS `52.00`.
- `npm run qa` — **réussi** en 1908×900, port Vite `5212`, CDP `9242`, FPS `45.24`.
- `npm run qa` — **réussi** en 844×390 tactile, port Vite `5213`, CDP `9243`, FPS `48.20`.
- `npm run qa` — **réussi** en 390×844 tactile, port Vite `5214`, CDP `9244`, FPS `48.00`.
- `npm run qa` — **réussi** en arabe RTL, 390×844 tactile, port Vite `5215`, CDP `9245`, FPS `56.07`.

Les ports utilisés étaient libres au moment de chaque exécution. Le build conserve uniquement l’avertissement existant concernant la taille du chunk Phaser après minification ; il n’a pas empêché le build ni le QA.

## Limites respectées

- Terrain, décorations, positions, caméra, HUD global, `GitSimulator`, `QuestManager`, `SaveManager`, progression et récompenses non modifiés pour cette leçon.
- Aucun nouveau terminal et aucune règle Git ajoutée.
- La tâche s’arrête ici, sans commencer la mini-tâche 4.
