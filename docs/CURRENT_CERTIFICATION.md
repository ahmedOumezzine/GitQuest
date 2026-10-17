# GitQuest — certification courante des phases 3 B.2 à 6

Date : 2026-10-17

Ce document décrit l’état courant vérifié dans le dépôt. Les rapports `PHASE_*_REPORT.md` conservent leur historique ; lorsqu’un ancien compteur diffère, ce document et `FINAL_QA_REPORT.md` font foi pour l’état le plus récent.

## Vérification locale courante

Commandes exécutées depuis `C:\Users\ahmed\source\repos\GitQuest` :

```text
npm test       -> 42/42 PASS
npm run typecheck -> PASS
npm run build  -> PASS
npm run qa:browser -> PASS (Chrome headless local)
```

La commande groupée équivalente est `npm run qa:local`.

Le build conserve un avertissement connu sur le chunk Phaser vendor (`1 208 kB` minifié, environ `332 kB` gzip). Il ne s’agit pas d’une erreur de compilation.

## Matrice des phases

| Phase | État | Preuve actuelle | Limite restante |
|---|---|---|---|
| 3 B.2 — menu artistique | Implémentée, vérifiée visuellement | Fond raster local, sprites de présentation détaillés, logo, boutons, paramètres, FR/EN/AR ; viewports `1280×720`, `844×390`, `390×844` observés dans Chrome | Les assets générés restent soumis à une confirmation de licence de distribution finale |
| 3 C — chargement/introduction | Implémentée | Progression réelle du loader, introduction localisée, Passer, transition vers niveau 1, aucune validation de quête pendant l’introduction ; smoke test Chrome versionné | Parcours tactile physique non couvert |
| 3 D — niveau 1/HUD | Fonctionnelle | TiledLayer, collisions eau, spawns sûrs, HUD, Midou, terminal, coffre, clé, porte et sauvegarde vérifiés ; fonds raster dédiés ajoutés aux niveaux 2–6 | Les cartes 2–6 n’ont pas encore des tilesets 32×32 et une finition d’objets aussi complète que le niveau 1 |
| 4 — interaction/i18n/sauvegarde | Partiellement certifiée | Terminal DOM avec espaces/historique, messages localisés, RTL, sauvegarde versionnée et migration testées ; saisie `git init` exercée par smoke test Chrome | Audio absent |
| 5 — tactile/responsive | Partiellement certifiée | Joystick, actions tactiles, nettoyage des gestes, caméra/limites physiques des cartes et parcours complet vérifiés à `1280×720`, `844×390` et `390×844` ; visibilité tactile confirmée en émulation | Aucun appareil tactile physique testé |
| 6 — performance/stabilisation | Partiellement certifiée | Mesure FPS des six niveaux via route QA dédiée, smoke test Chrome des six missions jusqu’à Victoire, découpage applicatif, erreurs de chargement contrôlées | Bundle Phaser au-dessus du seuil, matrice release complète non exécutée |

## Intégration Tiled ajoutée dans la dernière passe

`WorldScene` résout maintenant depuis la couche `Objects` :

- `player-spawn` de type `spawn` ;
- `midou` de type `npc` ;
- `exit-gate` de type `door` ;
- tout objet interactif dont le nom et le type correspondent à la définition de niveau.

Une définition de niveau reste le repli explicite si une ancienne carte n’a pas encore l’ancre concernée. Le test `LevelManager.test.ts` vérifie les six cartes et garantit que les coordonnées Tiled correspondent aux coordonnées métier actuelles.

Le même chargeur vérifie désormais les quatre couches obligatoires et la taille de `Ground`. Une carte incomplète est refusée avec une erreur exploitable par l’écran de chargement ; cette régression est couverte par un test dédié.

Le type de chaque couche est également contrôlé (`tilelayer` pour `Ground`, `objectgroup` pour `Decorations`, `Collisions` et `Objects`).

Le manifeste `src/data/AssetManifest.ts` est partagé par le préchargement et les tests ; tous les fichiers référencés sont présents localement et les spritesheets respectent la grille 32×32.

Cette intégration ne modifie ni les règles Git, ni l’ordre des quêtes, ni les récompenses.

## Vérifications Chrome disponibles

- Menu, paramètres, confirmation, introduction, HUD niveau 1 et reprise après actualisation : `1920×1080`, `1366×768`, `1280×720`, `844×390`, `390×844`, `768×1024`, `1024×768` via le runner Chrome versionné.
- Parcours complet des six niveaux et Victoire rejoué sans diagnostic à `1280×720`, `844×390` et `390×844` après correction des limites physiques et du suivi caméra.
- Écran Victoire : `1280×720` et `390×844` via `?qa=victory`, capture visuelle et bouton Rejouer lisible.
- RTL arabe : `html[lang]=ar`, `html[dir]=rtl`, canvas et champ terminal synchronisés.
- Parcours manuel complet des six niveaux : commandes Git, coffres, clés, portes, XP et victoire.
- Benchmark QA des six niveaux à `1280×720` : environ `137,99` à `144,02 FPS`, sans erreur ni avertissement applicatif.
- Vérification visuelle ciblée du menu avec les nouveaux sprites de présentation et des niveaux 2 et 6 après la passe legacy : palettes, chemins, obstacles décorés, props et titres distincts ; console Chrome à 0 erreur / 0 avertissement.
- Le protocole reproductible est consigné dans `docs/CHROME_QA_RUNBOOK.md`.
- Le contrat de touches du monde couvre `E` et `Entrée` pour interagir, ainsi que `T` pour le terminal ; il est testé dans `tests/InputBindings.test.ts`.
- `tests/Extensibility.test.ts` charge un niveau 7 et une carte Tiled synthétiques uniquement par données, puis valide sa quête sans modifier les scènes Phaser.
- `tests/ManifestConsistency.test.ts` vérifie que les six définitions actuelles sont exactement celles du manifest et que chaque carte référencée existe.
- `npm run qa:browser` exécute un smoke test Chrome/Edge headless versionné via `scripts/browser-smoke.mjs` ; il couvre le menu, les paramètres, le RTL, Nouvelle partie, l’introduction, les six missions, les commandes Git, les coffres, les clés, les portes, l’écran Victoire et la reprise après actualisation. `GITQUEST_QA_WIDTH`, `GITQUEST_QA_HEIGHT` et `GITQUEST_QA_TOUCH=1` permettent la matrice responsive et l’émulation tactile.

Recheck headless direct des cartes legacy le 17 octobre 2026, avec `npm run qa:browser` et `GITQUEST_QA_LEVEL=level-XX` :

| Niveau | FPS | Erreurs console | Capture |
|---|---:|---:|---|
| 2 | 57,05 | 0 | `level-02-after.png` |
| 3 | 58,00 | 0 | non conservée |
| 4 | 55,00 | 0 | non conservée |
| 5 | 57,05 | 0 | non conservée |
| 6 | 58,03 | 0 | non conservée |

Cette série vérifie le rendu de chaque région après l’ajout des fonds raster locaux et le remplacement des anciens obstacles graphiques par des textures Phaser répétées. Elle ne certifie pas encore une finition complète en tilesets 32×32 ni un appareil tactile physique.

Un recheck à viewport exact `1280×720` après culling explicite de la couche Tiled a mesuré les six niveaux à `56,07–57,05 FPS` dans Chrome headless avec GPU désactivé, sans erreur console. Le niveau 1 est passé de `49,18` à `57,00 FPS` dans la même campagne.

Recheck Chrome du 17 octobre 2026 via `?qa=benchmark&qaLevel=level-XX&perf=1` à `1280×720` :

| Niveau | FPS | Frames | Erreurs console |
|---|---:|---:|---:|
| 1 | 133,97 | 134 | 0 |
| 2 | 138,00 | 138 | 0 |
| 3 | 142,99 | 143 | 0 |
| 4 | 136,99 | 137 | 0 |
| 5 | 141,00 | 141 | 0 |
| 6 | 139,99 | 140 | 0 |

Ces vérifications ont été réalisées dans Chrome desktop via l’outil d’interface. Le smoke test headless est désormais versionné et a réussi localement ; cela ne constitue toujours pas un test sur appareil tactile réel.

## Conditions de clôture restantes

Pour déclarer les phases entièrement certifiées, il faut encore fournir ou réaliser :

1. une validation sur au moins un appareil tactile physique ;
2. une décision de licence pour les assets locaux générés et les assets de distribution ;
3. une stratégie audio réelle ou le maintien documenté de l’absence d’audio ;
4. une finition artistique dédiée aux niveaux 2 à 6 ; la passe actuelle est une amélioration stylisée, pas un pack pixel-art professionnel complet ;
5. une décision sur le seuil de bundle Phaser et une matrice release finale.

## Git

Le dépôt est propre sur la branche locale `main`. Aucun push distant n’a été effectué.
