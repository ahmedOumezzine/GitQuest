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
- Le terminal utilise désormais un champ HTML réel, positionné au-dessus de la surface Phaser, avec libellé accessible, collage, sélection native et saisie IME ; le rendu Phaser reste un fallback hors navigateur.
- L’historique du terminal est isolé dans `TerminalInputModel`, limité à vingt commandes et corrigé pour que la première navigation avec `ArrowUp` rappelle bien la dernière commande.
- Les écrans de démarrage, d’erreur de chargement des assets et de victoire utilisent désormais la locale active en FR, EN et AR ; la direction RTL est appliquée à la surface Phaser.
- La locale active synchronise aussi `html[lang]`, `html[dir]` et le champ HTML natif du terminal ; les lecteurs et les contrôles DOM reçoivent donc la même direction RTL que Phaser.

## Tests

- 31 tests unitaires passent, dont un parcours data-driven des six niveaux, un test de localisation du terminal, un test de l’historique avec espaces, une fixture de migration de sauvegarde historique, la couverture des écrans de démarrage/victoire dans les trois langues, les règles de layout tactile et la mesure runtime.
- TypeScript passe.
- Build Vite passe.

## Reste à faire

- Les messages internes de `GitSimulator` restent canoniquement en français ; seule leur présentation est localisée par `I18nManager`, afin de préserver la logique métier.
- Le test navigateur manuel du terminal et de `git init` est passé ; automatiser ce parcours reste à faire.
