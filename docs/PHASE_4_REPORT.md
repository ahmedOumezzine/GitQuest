# GitQuest 2.0 — Rapport Phase 4

Date : 2026-10-17

## Résultat

La Phase 4 est partiellement implémentée sans modification des règles de `GitSimulator`, `QuestManager`, de l’XP ou des récompenses.

## Réalisé

- Dialogue Midou affiché dans un panneau dédié, refermable par clic, `E` ou `Entrée`.
- Terminal avec historique des vingt dernières commandes.
- Navigation historique avec `ArrowUp` et `ArrowDown`.
- Fermeture avec `Escape`.
- Aide locale via `git help` ou `help`, sans modifier l’état Git.
- Saisie des espaces et caractères spéciaux conservée.
- Textes d’aide et erreurs ajoutés en FR, EN et AR.
- Messages visibles produits par le simulateur Git courant localisés à l’affichage en FR, EN et AR.
- La direction `dir` de la surface Phaser suit désormais la locale active, en complément des alignements RTL du HUD.
- `SaveManager` tolère les erreurs de lecture, d’écriture, de suppression et les JSON corrompus sans supprimer la donnée brute.
- Compatibilité de migration existante conservée.

## Tests

- 25 tests unitaires passent, dont un parcours data-driven des six niveaux et un test de localisation du terminal.
- TypeScript passe.
- Build Vite passe.

## Reste à faire

- Les messages internes de `GitSimulator` restent canoniquement en français ; seule leur présentation est localisée par `I18nManager`, afin de préserver la logique métier.
- Ajouter un vrai champ de saisie DOM accessible pour IME, sélection et collage.
- Le test navigateur manuel du terminal et de `git init` est passé ; automatiser ce parcours reste à faire.
- Ajouter des fixtures de sauvegardes historiques antérieures à la version 1.
