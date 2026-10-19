# GitQuest — Niveau 2 — Finition visuelle ciblée

## Périmètre

Cette passe corrige l’intégration visuelle de la Forêt des Fichiers avant la
suite Professeur Octo. Le décor illustré existant est conservé : cascade,
ruines, ponts, sanctuaire, arbres, végétation et lumière.

Les niveaux 1 et 3 à 6, les règles de progression, les récompenses, les
collisions métier et les systèmes de jeu ne sont pas modifiés par cette passe.

## Corrections

- Le diagnostic a confirmé que `player-spawn` `(70,270)` tombait sur la zone
  d’eau/cascade de l’illustration, alors que la couche Tiled le déclarait
  comme terrain générique. Le spawn est maintenant à `(350,300)`, au début du
  chemin central, hors de `wall-a` et sur une zone visuellement praticable.
- L’ancre Tiled de Midou était également placée sur la berge de la cascade.
  Elle est maintenant à `(240,180)`, dans la clairière d’entrée, sans changer
  l’identifiant `midou` ni l’étape de quête.
- La définition de niveau et la carte Tiled restent synchronisées pour ces
  deux ancres.
- Le zoom du niveau 2 s’adapte aux grands écrans : il reste inchangé sur les
  formats compacts, et remplit les écrans desktop larges au lieu de laisser
  une grande zone vide à droite.
- La bande supérieure du HUD du niveau 2 reste lisible, mais son opacité est
  réduite de `0.90` à `0.72` pour laisser respirer le décor.
- Les ombres de contact et le tri de profondeur des décorations forestières
  existants sont conservés afin que le joueur et Midou restent ancrés au sol.
- Les waypoints du smoke test niveau 2 contournent maintenant `wall-a` après
  le déplacement visuel des ancres.

## Captures Chrome réelles

- [Spawn — 1280×720](captures/level-02-final-1280x720.png)
- [Desktop large — 1908×900](captures/level-02-final-1908x900.png)
- [Paysage tactile — 844×390](captures/level-02-final-844x390.png)
- [Portrait tactile — 390×844](captures/level-02-final-390x844.png)
- [Près de Midou](captures/level-02-midou-1280x720.png)
- [Près du sanctuaire](captures/level-02-shrine-1280x720.png)
- [Près de la porte](captures/level-02-gate-1280x720.png)
- [État avant correction](captures/level-02-visual-before-1280x720.png)

Les captures finales montrent le joueur sur la berge/chemin, Midou dans la
clairière, le sanctuaire et la porte accessibles visuellement, sans élément
décoratif ajouté pour masquer le fond. Le format 1908×900 remplit maintenant
la largeur disponible. Les deux formats tactiles conservent le joystick, le
bouton d’interaction et le bouton terminal dans les zones sûres.

## Vérifications

- `npm test` — **76 tests réussis**.
- `npm run typecheck` — **réussi**.
- `npm run build` — **réussi**.
- `npm run qa` avec `GITQUEST_QA_LEVEL=level-02`, 1280×720, Vite `5243`, CDP
  `9264` — **PASS**, FPS `51.15`.
- QA Chrome ciblée 1908×900, Vite `5240`, CDP `9261` — **PASS**, FPS `56.00`.
- QA Chrome ciblée 844×390 tactile, Vite `5241`, CDP `9262` — **PASS**, FPS
  `52.13`.
- QA Chrome ciblée 390×844 tactile, Vite `5242`, CDP `9263` — **PASS**, FPS
  `51.00`.

Le build affiche encore l’avertissement non bloquant de taille du chunk Phaser
après minification. Aucun échec de test, typecheck ou QA n’a été observé.

## Limites et arrêt

- La forêt reste une carte Tiled de 960×544 unités ; le zoom desktop large
  recadre davantage la hauteur pour remplir 1908×900, ce qui est attendu du
  suivi caméra.
- Aucune nouvelle collision décorative n’a été ajoutée : les rectangles de la
  couche `Collisions` restent la source de vérité.
- Aucun commit ni push n’a été effectué.

La mini-tâche s’arrête ici pour validation.
