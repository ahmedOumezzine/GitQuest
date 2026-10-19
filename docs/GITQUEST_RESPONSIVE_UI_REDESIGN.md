# GitQuest — Refonte responsive complète de l’interface

## Causes identifiées

Le canvas Phaser était dimensionné en mode `RESIZE`, mais la surface HTML conservait une présentation centrée avec des limites CSS `max-width`/`max-height`. À cela s’ajoutaient un zoom fixe ou plafonné sur les cartes legacy et une bande HUD supérieure opaque. Sur les écrans très larges, la caméra ne couvrait donc pas toujours toute la surface utile et le HUD semblait dispersé.

## Corrections de cadrage et caméra

Le canvas et `#game-root` occupent maintenant toute la surface disponible, sans marge de grille implicite. La stratégie pixel-art est conservée avec `image-rendering: pixelated`, sans étirement manuel des sprites.

`calculateCoverZoom()` calcule le zoom minimal qui couvre la largeur et la hauteur du viewport à partir des dimensions réelles de la carte. Les six niveaux legacy recalculent ce zoom lors de chaque redimensionnement, tout en conservant les limites de caméra, les positions Tiled, les collisions et le suivi du joueur.

La plage conserve un minimum de zoom pour la lisibilité des personnages. Les autres cartes utilisent le ratio couvrant, ce qui élimine les bandes vides observées à 1908×900 et améliore le cadrage à 1920×1080, 1366×768 et 1280×720.

## Nouvelle organisation du HUD

- En haut à gauche : carte d’objectif compacte, progression et instruction utile.
- En haut à droite : XP, inventaire et accès aux informations secondaires.
- Mini-carte et boussole restent secondaires et sont placées sous les cartes principales.
- La bande supérieure n’est plus un grand rectangle opaque ; elle devient un simple accent translucide.
- Les prompts d’interaction restent visibles sur desktop et sont masqués sur tactile lorsque les boutons ronds fournissent déjà l’action contextuelle.
- Le prompt bas est masqué pendant un cours, un quiz ou un autre panneau modal ; les contrôles du monde sont également désactivés.

Les panneaux conservent la palette GitQuest : bleu nuit, bordure dorée, accents pixel-art et typographie monospace lisible. Le RTL arabe continue d’être piloté par `I18nManager`.

## Interface mobile

La refonte mobile partagée est décrite en détail dans [MOBILE_CONTROLS_REDESIGN.md](MOBILE_CONTROLS_REDESIGN.md). Elle apporte le joystick analogique circulaire, les boutons `…` et `>_`, la gestion multitouch, le recalcul au redimensionnement et le masquage modal.

## Fichiers modifiés

- `src/ui/layout/ResponsiveLayoutManager.ts` — zoom couvrant, cartes HUD desktop et zones sûres.
- `src/scenes/WorldScene.ts` — zoom par viewport, labels flottants adaptés aux cadrages serrés.
- `src/scenes/UIScene.ts` — bande supérieure translucide, HUD compact, prompts et modalité.
- `src/phaser/InputManager.ts` — interactions tactiles et `pointercancel`.
- `src/styles/main.css` — surface de jeu plein écran responsive.
- `tests/ResponsiveLayout.test.ts` — contrats de layout et de zoom.

Les cartes, décors, collisions, quêtes, progression, XP, sauvegardes, GitSimulator, cours et quiz n’ont pas été modifiés.

## Captures comparatives

- [Avant — niveau 3 1280×720](captures/level-03-1280x720.png)
- [Après — niveau 3 1280×720](captures/responsive-redesign-level3-1280x720.png)
- [Après — niveau 3 1908×900](captures/responsive-redesign-level3-1908x900.png)
- [Après — niveau 1 390×844](captures/mobile-controls-redesign-level1-portrait-390x844.png)
- [Après — niveau 1 844×390](captures/mobile-controls-redesign-level1-landscape-844x390.png)
- [Après — niveau 2 390×844](captures/mobile-controls-redesign-level2-portrait-390x844.png)
- [Après — niveau 3 390×844](captures/mobile-controls-redesign-level3-portrait-390x844-final2.png)
- [Après — niveau 4 844×390](captures/mobile-controls-redesign-level4-landscape-844x390.png)
- [Après — niveau 1 360×640](captures/mobile-controls-redesign-level1-360x640.png)
- [Après — niveau 1 430×932](captures/mobile-controls-redesign-level1-430x932.png)
- [Cours Octo ouvert](captures/mobile-controls-redesign-octo-course-1280x720-final.png)

## Vérifications

- `npm test` — PASS, 93/93.
- `npm run typecheck` — PASS.
- `npm run build` — PASS, avec l’avertissement connu de taille du chunk Phaser.
- `npm run qa` ciblé — PASS sur 1920×1080, 1366×768, 1280×720, 1908×900, 844×390, 390×844, 360×640 et 430×932.
- QA tactile niveau 1 — PASS pour déplacement cardinal, diagonal, arrêt au relâchement, interaction Midou, terminal, fermeture de panneau et restauration des contrôles.

La matrice automatisée complète n’a pas rendu de résumé final dans cette session ; aucune certification globale des six niveaux n’est donc revendiquée. Les vérifications ciblées listées ci-dessus sont les résultats réellement observés.

## Limites

- La taille du bundle Phaser reste à optimiser ultérieurement.
- La safe area exacte d’un téléphone physique peut varier selon son navigateur.
- L’anomalie historique indépendante de transition du niveau 6 vers `victory` reste hors périmètre.

Aucun commit ni push n’a été effectué.
