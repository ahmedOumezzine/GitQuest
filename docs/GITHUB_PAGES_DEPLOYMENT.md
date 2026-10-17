# GitQuest — première publication GitHub Pages

## Cible

- Dépôt : `https://github.com/ahmedOumezzine/GitQuest`
- Branche : `main`
- URL attendue : `https://ahmedoumezzine.github.io/GitQuest/`
- Source Pages : GitHub Actions

## Configuration ajoutée

- `.github/workflows/deploy.yml` : workflow Vite avec Node.js 22, `npm ci`, tests, typecheck, build, artifact Pages et déploiement.
- `vite.config.ts` : base `/` en développement local et `/GitQuest/` dans GitHub Actions.
- `src/core/publicUrl.ts` : résolution centralisée via `import.meta.env.BASE_URL`.
- `PreloadScene` ne charge que les assets du menu ; `NewGameScene` et `WorldScene` chargent les assets régionaux à la demande par niveau.
- `AssetLoader` évite les doublons dans les caches Phaser et `LevelManager` utilise cette résolution pour les définitions et les cartes.
- `.gitignore` : exclusions des dépendances, build, variables d’environnement, caches et rapports temporaires.
- `README.md` : procédure et URL de publication.

Les chemins relatifs des tilesets Tiled restent compatibles avec les cartes JSON sous `public/data/maps/` et ne sont pas dupliqués avec `/GitQuest/GitQuest/`.

## Vérifications locales

- `npm ci` : **PASS** après résolution d’un verrou Windows sur les binaires natifs `esbuild`/`rollup`.
- `npm test` : **51/51 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` avec `GITQUEST_PAGES=true` : **PASS**.
- `dist/index.html` référence bien `/GitQuest/assets/...` et `/GitQuest/favicon.svg`.
- `npm run qa:browser` ciblé niveau 1 : **PASS** — niveau rendu et FPS mesuré.
- `npm run qa:browser` ciblé niveau 3 : **PASS** — assets régionaux chargés à la demande.
- Le parcours QA complet est actuellement instable sur certaines transitions automatisées de niveaux legacy ; ce point doit être rejoué manuellement avant de le qualifier PASS global.

## Dépôt et publication

- Le remote `origin` pointe vers le dépôt attendu.
- La vérification réseau confirme qu’aucune branche distante n’est encore présente avant le premier push.
- Commit initial : `c4c6aa58541152cdbf46630d0a5f4c288d085aea`.
- Push `main` : **PASS**, sans force push.
- Workflow GitHub Actions : **PASS**, run `39074311070`, conclusion `success`.
- Site public : **accessible**, titre `GitQuest — L'île des commits` affiché sur l’URL Pages.
- Correctif de démarrage : le menu est maintenant découplé du chargement des assets lourds des niveaux 2 à 6, afin d’éviter un écran `GITQUEST` prolongé sur Pages.

## Limites honnêtes

Le smoke test public confirme le chargement initial de la page et du canvas. Le parcours complet reste couvert par le QA Chrome local ; une vérification manuelle complémentaire des interactions directement sur le domaine public reste recommandée après mise en cache du navigateur. Aucun token, secret ou fichier `.env` n’est inclus dans le commit.
