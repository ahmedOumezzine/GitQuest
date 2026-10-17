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
- `PreloadScene`, `NewGameScene` et `LevelManager` utilisent cette résolution pour les assets, les définitions et les cartes.
- `.gitignore` : exclusions des dépendances, build, variables d’environnement, caches et rapports temporaires.
- `README.md` : procédure et URL de publication.

Les chemins relatifs des tilesets Tiled restent compatibles avec les cartes JSON sous `public/data/maps/` et ne sont pas dupliqués avec `/GitQuest/GitQuest/`.

## Vérifications locales

- `npm ci` : **PASS** après résolution d’un verrou Windows sur les binaires natifs `esbuild`/`rollup`.
- `npm test` : **49/49 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` avec `GITQUEST_PAGES=true` : **PASS**.
- `dist/index.html` référence bien `/GitQuest/assets/...` et `/GitQuest/favicon.svg`.
- `npm run qa` : **PASS** — menu, paramètres, RTL, six niveaux, commandes Git, sauvegarde et reprise.

## Dépôt et publication

- Le remote `origin` pointe vers le dépôt attendu.
- La vérification réseau confirme qu’aucune branche distante n’est encore présente avant le premier push.
- Commit : à renseigner après création.
- Push `main` : à renseigner après exécution.
- GitHub Actions : à vérifier après le push.
- Site public : à vérifier après le succès du workflow.

## Limites honnêtes

Le workflow et le build Pages sont préparés et validés localement. La publication ne sera considérée comme réussie qu’après confirmation du workflow GitHub Actions et ouverture réelle de l’URL publique. Aucun token, secret ou fichier `.env` n’est inclus dans le commit.
