# GitQuest — certification courante des phases 3 B.2 à 6

Date : 2026-10-17

Ce document décrit l’état courant vérifié dans le dépôt. Les rapports `PHASE_*_REPORT.md` conservent leur historique ; lorsqu’un ancien compteur diffère, ce document et `FINAL_QA_REPORT.md` font foi pour l’état le plus récent.

## Vérification locale courante

Commandes exécutées depuis `C:\Users\ahmed\source\repos\GitQuest` :

```text
npm test       -> 38/38 PASS
npm run typecheck -> PASS
npm run build  -> PASS
```

La commande groupée équivalente est `npm run qa:local`.

Le build conserve un avertissement connu sur le chunk Phaser vendor (`1 208 kB` minifié, environ `332 kB` gzip). Il ne s’agit pas d’une erreur de compilation.

## Matrice des phases

| Phase | État | Preuve actuelle | Limite restante |
|---|---|---|---|
| 3 B.2 — menu artistique | Implémentée, vérifiée visuellement | Fond raster local, logo, boutons, paramètres, FR/EN/AR ; viewports `1280×720`, `844×390`, `390×844` observés dans Chrome | Les personnages et certains assets restent moins détaillés que la référence ; licence de distribution finale à confirmer |
| 3 C — chargement/introduction | Implémentée | Progression réelle du loader, introduction localisée, Passer, transition vers niveau 1, aucune validation de quête pendant l’introduction | Parcours navigateur reproductible non livré sous Playwright/WebDriver |
| 3 D — niveau 1/HUD | Fonctionnelle | TiledLayer, collisions eau, spawns sûrs, HUD, Midou, terminal, coffre, clé, porte et sauvegarde vérifiés | Les niveaux 2–6 ont maintenant une passe de style distincte, mais pas encore une finition artistique équivalente au niveau 1 |
| 4 — interaction/i18n/sauvegarde | Partiellement certifiée | Terminal DOM avec espaces/historique, messages localisés, RTL, sauvegarde versionnée et migration testées | Pas de test navigateur automatisé conservé dans le dépôt ; audio absent |
| 5 — tactile/responsive | Partiellement certifiée | Joystick, actions tactiles, nettoyage des gestes, zones sûres et viewports UI vérifiés | Aucun appareil tactile physique testé |
| 6 — performance/stabilisation | Partiellement certifiée | Mesure FPS des six niveaux via route QA dédiée, découpage applicatif, erreur de chargement contrôlée | Bundle Phaser au-dessus du seuil, matrice release complète non exécutée |

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

- Menu, paramètres, confirmation, introduction et HUD niveau 1 : `1280×720`, `844×390`, `390×844`.
- RTL arabe : `html[lang]=ar`, `html[dir]=rtl`, canvas et champ terminal synchronisés.
- Parcours manuel complet des six niveaux : commandes Git, coffres, clés, portes, XP et victoire.
- Benchmark QA des six niveaux à `1280×720` : environ `137,99` à `144,02 FPS`, sans erreur ni avertissement applicatif.
- Vérification visuelle ciblée des niveaux 2 et 6 après la passe legacy : palettes, chemins, obstacles décorés, props et titres distincts ; console Chrome à 0 erreur / 0 avertissement.
- Le protocole reproductible est consigné dans `docs/CHROME_QA_RUNBOOK.md`.

Ces vérifications ont été réalisées dans Chrome desktop via l’outil d’interface ; elles ne constituent pas un test sur appareil tactile réel ni un runner navigateur versionné.

## Conditions de clôture restantes

Pour déclarer les phases entièrement certifiées, il faut encore fournir ou réaliser :

1. un test navigateur reproductible et versionné dans le dépôt ;
2. une validation sur au moins un appareil tactile physique ;
3. une décision de licence pour les assets locaux générés et les assets de distribution ;
4. une stratégie audio réelle ou le maintien documenté de l’absence d’audio ;
5. une finition artistique dédiée aux niveaux 2 à 6 ; la passe actuelle est une amélioration stylisée, pas un pack pixel-art professionnel complet ;
6. une décision sur le seuil de bundle Phaser et une matrice release finale.

## Git

Le dépôt est propre sur la branche locale `main`. Aucun push distant n’a été effectué.
