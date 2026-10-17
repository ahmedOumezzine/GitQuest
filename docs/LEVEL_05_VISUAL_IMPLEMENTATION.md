# Niveau 5 — Implémentation visuelle de la Montagne des Branches

## Périmètre

Cette étape concerne uniquement le niveau `level-05`. Les niveaux 1 à 4 sont
préservés et le niveau 6 n’est pas modifié. Les objectifs métier, le terminal,
les sauvegardes, les récompenses et les identifiants Tiled existants restent
inchangés.

## Carte et composition

`public/data/maps/level-05.json` possède maintenant un terrain `Ground` de
30×17 tuiles 32×32, avec une dominante roche/herbe froide et des bandes de
sentier reliées entre elles. Les couches `Ground`, `Decorations`, `Collisions`
et `Objects` sont conservées.

La composition suit le parcours pédagogique : camp d’arrivée et Midou,
bifurcation branch/switch, autel de la montagne, coffre d’archives, puis porte
du col. Les objets `player-spawn`, `midou`, `exit-gate` et les collisions
existantes ont été conservés à leurs coordonnées d’origine.

## Assets créés

- `public/assets/tilesets/mountain-tileset-v1.png` : atlas raster 512×512,
  référencé par `mountain-tileset.tsx` et exploitable dans Tiled.
- `public/assets/sprites/mountain/` : pins, rochers, cairns, neige, pont,
  balises, autel, cristal, coffre et états fermé/ouvert de la porte.
- Les assets sont générés localement et leur provenance est documentée dans
  `public/assets/ASSETS.md`. Aucun lien externe ni asset tiers n’a été introduit.
  La licence de distribution commerciale finale des images générées doit encore
  être confirmée avant une publication commerciale.

## Intégration runtime

`LegacyWorldStyle` sélectionne le profil `mountain`, `AssetManifest` charge les
ressources locales, et `WorldScene` rend les décorations selon leur type Tiled.
Le cristal, le coffre, le repère pédagogique et la porte utilisent des textures
montagne dédiées. La porte conserve les deux états métier `closed` et `open`.

Le zoom de caméra est adapté aux trois familles d’écran : desktop, mobile
paysage et mobile portrait. Les décorations restent séparées des couches de
terrain et de collision afin de préserver les performances du tilemap.

## Vérification

Vérifications réellement exécutées le 17 octobre 2026 :

- `npm test` : PASS, 47/47 tests.
- `npm run typecheck` : PASS.
- `npm run build` : PASS. Vite signale uniquement l’avertissement connu de
  taille du chunk Phaser (environ 1,2 Mo minifié).
- `GITQUEST_QA_LEVEL=level-05 npm run qa:browser` : PASS, niveau rendu et
  FPS mesuré à 50 FPS sur la session de contrôle.
- Captures Chrome produites et inspectées : 1280×720 (54,99 FPS), 844×390
  (57 FPS) et 390×844 (50 FPS).
- `npm run qa` : PASS. La suite a validé le menu, les paramètres, le RTL,
  les niveaux 1 à 6, les commandes Git, les récompenses, les portes, la
  victoire, la sauvegarde et la reprise.

Captures réelles :

- `docs/captures/level-05-1280x720.png` — desktop.
- `docs/captures/level-05-844x390.png` — mobile paysage.
- `docs/captures/level-05-390x844.png` — mobile portrait.

Le contrôle navigateur a vérifié l’arrivée sur la Montagne des Branches, le
rendu du parcours, la présence de Midou, de l’autel, du cristal, du coffre et
de la porte, ainsi que la progression métier jusqu’au niveau suivant. La suite
globale a ensuite confirmé l’absence de régression sur les niveaux 1 à 4 et 6.

## Limites connues

- Les collisions restent des rectangles Tiled hérités du niveau initial ; ils
  garantissent la stabilité des interactions mais ne décrivent pas chaque
  contour de rocher au pixel près.
- L’atlas raster apporte une identité montagneuse locale, mais une passe de
  retouche pixel art dédiée pourra encore améliorer les transitions d’autotiles.
- La licence de distribution commerciale des images générées doit être validée
  avant diffusion hors du dépôt.
