# Architecture technique TypeScript

## Vue d’ensemble

GitQuest sépare le domaine du rendu Phaser. Les règles Git, les quêtes, l’inventaire, l’XP et les sauvegardes sont testables sans ouvrir un navigateur. Phaser devient une couche d’adaptation : il charge les données, affiche la carte et transmet les interactions aux managers.

L’analogie C# est volontaire :

- les interfaces de src/models sont les DTO et contrats de domaine ;
- LevelManager, QuestManager, InventoryManager, XPManager et SaveManager sont des services injectables ;
- GameSession ressemble à un aggregate root qui regroupe l’état d’une partie ;
- GitSimulator est un service métier, comparable à une classe de domaine C# avec ses invariants ;
- les scènes Phaser sont des contrôleurs/adapters, pas le lieu où vivent les règles.

## Flux de démarrage

1. BootScene crée LevelManager, charge le manifest JSON et les six niveaux.
2. GameSession recharge la sauvegarde versionnée.
3. PreloadScene charge le manifeste d’assets locaux partagé par le runtime et les tests.
4. WorldScene prend le levelId de la session, charge la carte Tiled associée et installe les entités.
5. UIScene observe EventBus pour afficher la quête, les dialogues, le terminal, l’XP et l’inventaire.

TitleScene fournit Nouvelle partie, Continuer et Paramètres. VictoryScene clôt la campagne et permet de recommencer. SceneManager ajoute un fondu lors des transitions entre régions.

## Niveaux data-driven

Chaque fichier public/data/levels/level-XX.json contient l’identité, les textes localisés, le chemin de carte Tiled, le thème, le spawn, Midou, les objets, dialogues, commandes, quête, coffre, clé et porte de sortie.

LevelManager valide et met en cache ces définitions. WorldScene ne connaît aucun identifiant de chapitre. Ajouter level-07.json, sa carte dans public/data/maps et son chemin dans public/data/levels/index.json suffit si le niveau utilise des mécaniques déjà existantes.

## Cartes Tiled

`TiledMapAdapter` lit les fichiers JSON exportés depuis Tiled et expose `Ground`, `Decorations`, `Collisions` et `Objects`. `LevelManager` vérifie les quatre couches, leurs types et la taille de `Ground` avant de mettre la carte en cache. `WorldScene` consomme les ancres `player-spawn`, `midou` et `exit-gate`, ainsi que les objets interactifs nommés lorsqu’ils sont présents ; les anciennes cartes conservent un repli sur les définitions de niveau.

Le niveau 1 utilise le `TilemapLayer` Phaser à partir de `Ground`. Les niveaux 2 à 6 utilisent leurs données Tiled pour les collisions, ancres et décorations, avec une passe de rendu legacy data-driven par région. Le contrat reste compatible avec l’ajout d’un niveau 7 utilisant les mêmes types.

## Quêtes configurables

QuestManager avance uniquement sur l’étape courante :

- dialogue valide un dialogue identifié ;
- git-command exige une commande réussie, l’opération attendue et un changement d’état ;
- collect exige l’objet configuré ;
- open-exit exige une quête terminée et la clé configurée.

Cela évite de valider une quête avec une simple comparaison de texte.

## GitSimulator

GitSimulator garde l’état du dépôt : initialisation, fichiers, index, commits, branches, branche courante, remote et conflits. Les commandes init, add, commit, push, pull, branch, switch et merge renvoient un résultat typé comprenant l’opération, la réussite et le changement d’état.

## Sauvegardes

SaveManager écrit une enveloppe version, levelId, locale, inventory, xp, quests, collectedObjects et git dans localStorage. Les objets collectés sont idempotents et ne redonnent pas d’XP après rechargement. Les migrations sont centralisées dans migrate, comme une stratégie de migration de DTO ou de save data en C#.

## Phaser et contrôles

SceneManager encapsule les transitions entre cartes. InputManager unifie clavier et boutons tactiles. I18nManager résout les textes FR/EN/AR et expose la direction RTL pour l’arabe.

## Tests et qualité

Les tests TypeScript couvrent le simulateur Git, l’ordre des quêtes, la sauvegarde versionnée, le chargement des niveaux, le manifeste d’assets, la validation des cartes et l’adaptation Tiled. `npm run qa:local` exécute les tests, le typecheck puis le build ; le typecheck est également exécuté avant le build dans `npm run build`.
