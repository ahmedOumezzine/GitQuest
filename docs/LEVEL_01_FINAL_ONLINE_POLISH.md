# GitQuest — Niveau 1 : polish final en ligne

Date : 18 octobre 2026

Périmètre : `level-01` / Plage des Origines uniquement

Cette passe améliore la lisibilité du HUD, de la porte des archives et des interactions sans modifier les règles de progression, les données Tiled, le simulateur Git, ni les niveaux 2 à 6.

## Corrections réalisées

### HUD et mini-carte

- Le panneau de quête reste compact et affiche toujours la mission, l’étape active, le compteur et la commande Git étudiée.
- Le minimap du niveau 1 est replié par défaut sur desktop et reste sous le panneau de quête avec une marge de sécurité.
- Un clic sur le minimap ou la touche `M` permet de le déplier/replier.
- Sur les écrans compacts, le minimap reste sous forme de bande repliée pour ne pas masquer Midou, le joueur ou les contrôles tactiles.
- Les positions sont recalculées par `ResponsiveLayoutManager` pour desktop, paysage compact et portrait.

### Objectif et guidage

- La progression réelle de `QuestManager` est conservée.
- Après la clé, l’objectif affiché devient bien `Ouvrir la porte` avec la progression et `git init` comme commande étudiée.
- Aucun objectif n’est validé par l’interface seule et aucune récompense supplémentaire n’est attribuée.

### Porte des archives

- L’objet Tiled `exit-gate` et sa condition `open-exit` + `pass-key` sont inchangés.
- Le label de porte n’apparaît qu’à proximité, avec fond contrasté, icône d’état et texte localisé.
- Le label est centré au-dessus de la porte pour éviter de se coller au sprite ou aux bords de la caméra.
- L’état verrouillé reste sombre et l’état accessible conserve l’aura animée existante.

### Décor et assets

- Aucun nouvel asset externe n’a été introduit.
- Les palmiers, ruines, rochers, sanctuaire, fleurs, coquillages et porte raster déjà présents sont réutilisés.
- Les niveaux 2 à 6 et leurs assets n’ont pas été modifiés dans cette passe.

## Fichiers modifiés

- `src/ui/hud/MiniMap.ts` — repli/dépliage par clic ou `M`.
- `src/ui/hud/QuestTracker.ts` — affichage de la commande Git étudiée.
- `src/managers/I18nManager.ts` — libellé localisé de la commande étudiée.
- `src/scenes/UIScene.ts` — placement responsive du minimap et activation du raccourci.
- `src/scenes/WorldScene.ts` — label de porte localisé, contrasté et positionné au-dessus de la porte.
- `docs/LEVEL_01_FINAL_ONLINE_POLISH.md` — présent rapport.

## Captures Chrome réelles

Les captures ont été produites avec le smoke test CDP, Vite local et Chromium, après le rendu réel du niveau 1 :

- [1280 × 720](captures/level-01-online-polish-1280x720.png) — FPS observés : 48,20.
- [844 × 390](captures/level-01-online-polish-844x390.png) — FPS observés : 50,17.
- [390 × 844](captures/level-01-online-polish-390x844.png) — FPS observés : 49,18.
- [Porte verrouillée](captures/level-01-gate-locked.png).
- [Midou et le joueur](captures/level-01-midou.png).
- [Porte ouverte](captures/level-01-gate-open.png).

Constats visuels :

- le joueur et Midou sont visibles simultanément sur les trois résolutions ;
- le minimap ne recouvre plus le panneau de quête sur desktop ;
- le minimap compact n’empêche pas l’usage du joystick et du bouton d’interaction en mobile ;
- le sanctuaire, le coffre, le cristal et la porte restent dans la zone jouable ;
- le HUD affiche `Parler à Midou` au démarrage et `Ouvrir la porte` après la récompense ;
- la porte verrouillée et la porte ouverte ont chacune été observées pendant un parcours réel.

## Vérifications exécutées

- `npm test` : **67/67 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**. Avertissement connu : le chunk Phaser dépasse 1 200 kB minifiés.
- `npm run qa:browser` : **PASS** — menu, paramètres, FR/EN/AR, RTL, introduction, niveau 1, niveaux 2 à 6, commandes Git, récompenses, portes, victoire, sauvegarde et reprise.
- `npm run qa:browser:touch` : **PASS** — rendu tactile du niveau 2, FPS observés : 54,00.
- Captures isolées du niveau 1 : **PASS** à 1280×720, 844×390 et 390×844.
- Parcours niveau 1 vérifié : Nouvelle partie → Midou → cristal → terminal contextualisé → `git init` → coffre → clé/XP → porte verrouillée puis ouverte → niveau 2 → actualisation/reprise.

## Comparaison avant / après

Avant cette passe, le minimap desktop était directement sous le HUD avec un chevauchement de quelques pixels, le panneau de quête n’indiquait pas explicitement la commande étudiée et le label de porte était peu contrasté et décalé vers la gauche.

Après cette passe, le minimap est repliable et séparé du panneau de quête, la commande étudiée est visible dans la progression réelle et le label de porte est court, contrasté, localisé et centré au-dessus de l’objet.

## Limites restantes

- La validation tactile est faite en émulation Chromium ; un appareil physique avec clavier virtuel et safe areas n’a pas été certifié.
- Le build conserve l’avertissement de taille du chunk Phaser ; il n’empêche pas l’exécution.
- La comparaison artistique est limitée au niveau 1 conformément au périmètre demandé ; aucune refonte des niveaux 2 à 6 n’est incluse.
- Le déploiement GitHub Pages et son URL publique seront confirmés après le push et l’exécution du workflow GitHub Actions.
