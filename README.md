# GitQuest

GitQuest est un RPG éducatif en pixel art, développé avec Phaser 3, TypeScript et Vite. Le joueur explore une île, écoute son mentor Midou et apprend les commandes en manipulant un dépôt Git simulé.

## Démarrage

    npm install
    npm run dev

Puis ouvrir l'URL indiquée par Vite. Pour produire une version déployable :

    npm run build
    npm run preview

## Commandes utiles

- ZQSD ou les flèches : se déplacer
- E ou Entrée : interagir
- T : ouvrir le terminal Git
- boutons tactiles : déplacements et interaction sur mobile

La sauvegarde est automatique dans localStorage. Le terminal n'exécute jamais le Git de la machine : il manipule un dépôt pédagogique en mémoire.

## État de la première version

La base jouable inclut les six cartes, les déplacements, collisions, Midou, objets interactifs, interface, terminal simulé, état Git, progression de mission, XP, inventaire, porte de sortie, sauvegarde et les langues français/anglais/arabe. Les cartes sont actuellement des prototypes jouables ; les chapitres détaillés, les énigmes et les assets audio finaux restent à implémenter selon le plan de GAME_DESIGN.md.

Les sprites locaux de démonstration sont des SVG pixel-art sous public/assets/sprites/. Les niveaux sont des JSON sous public/data/levels et les cartes sont des JSON exportables depuis Tiled sous public/data/maps/.

Pour ajouter un niveau 7 :

1. créer public/data/levels/level-07.json ;
2. créer sa carte public/data/maps/level-07.json ;
3. ajouter son chemin dans public/data/levels/index.json.

Les scènes Phaser n’ont pas besoin d’être modifiées si le niveau réutilise les types d’objets et d’étapes existants.

## Tests

    npm test

Les tests couvrent GitSimulator, QuestManager, SaveManager, LevelManager et TiledMapAdapter.

## Licence

Le code est distribué sous licence MIT. Les futurs assets tiers devront conserver leur licence et leur attribution dans public/assets/ASSETS.md.
