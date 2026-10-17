# GitQuest V0.1 — Certification responsive et stabilité

Date de vérification : 17 octobre 2026

## Résultat

GitQuest peut être considéré comme **V0.1 stable techniquement** : les six
niveaux sont jouables, la progression complète est validée et aucune régression
n’a été détectée dans la matrice responsive automatisée.

## Vérifications exécutées

| Vérification | Résultat |
|---|---|
| `npm test` | PASS — 48/48 |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run qa:local` | PASS |
| `npm run qa` | PASS — parcours complet des niveaux 1 à 6 |
| `npm run qa:browser:matrix` | PASS — 7 viewports |
| `npm run qa:browser:touch` | PASS — émulation tactile portrait |

## Viewports certifiés

- 1920×1080
- 1366×768
- 1280×720
- 844×390
- 390×844
- 768×1024
- 1024×768

À chaque résolution, le smoke test rejoue le menu, les paramètres, le RTL,
Nouvelle partie, les six missions Git, les récompenses, les portes, la victoire
et la reprise après actualisation.

Un contrôle tactile ciblé supplémentaire a initialisé chacun des six niveaux en
390×844 avec `GITQUEST_QA_TOUCH=1` : niveaux 1 à 6 PASS, contrôles tactiles
visibles et aucune erreur console détectée.

## Stabilité fonctionnelle

- `git init`, `git add`, `git commit`, `git push`, `git pull`, `git branch`,
  `git switch` et `git merge` validés.
- Collisions, spawns Tiled, objets interactifs et portes vérifiés.
- XP et récompenses idempotents.
- Sauvegarde et reprise vérifiées.
- Aucun niveau 7 requis pour la certification ; l’architecture reste extensible
  par données.

## Réserves restantes

- L’émulation tactile est validée, mais aucun appareil tactile physique n’a été
  testé dans cette session.
- Les assets générés localement et la provenance historique de certains fonds
  doivent recevoir une confirmation de licence avant publication commerciale.
- Vite conserve un avertissement de taille sur le chunk Phaser, sans impact
  fonctionnel observé.
- Les collisions restent basées sur des rectangles Tiled, ce qui est stable
  pour la V0 mais moins précis qu’une collision polygonale détaillée.

Ces réserves ne bloquent pas une V0.1 jouable ; elles doivent être traitées
avant une publication commerciale ou une V1 artistique finale.
