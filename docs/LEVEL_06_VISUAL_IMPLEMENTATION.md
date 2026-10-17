# Niveau 6 — Implémentation visuelle du Château des Conflits

## Périmètre

Cette étape termine la modernisation visuelle du niveau `level-06`. Les niveaux
1 à 5 et leurs mécaniques sont préservés. La mission `git merge`, le terminal,
les récompenses, les sauvegardes et les identifiants Tiled restent inchangés.

## Carte et composition

`public/data/maps/level-06.json` possède maintenant un terrain `Ground` de
30×17 tuiles 32×32, avec pavage sombre, chemins de cour et variations de pierre.
Les couches `Ground`, `Decorations`, `Collisions` et `Objects` sont conservées.

La composition suit le dernier chapitre : arrivée dans la cour, autel de fusion,
tablette d’observation du dépôt, coffre d’archives, puis porte du château. Les
ancres `player-spawn`, `midou` et `exit-gate` sont conservées aux coordonnées
existantes et les cinq rectangles de collision n’ont pas été déplacés.

## Assets créés et intégration

- `public/assets/tilesets/castle-tileset-v1.png` et `castle-tileset.tsx` : atlas
  raster local compatible avec Tiled.
- `public/assets/sprites/castle/` : cristal, coffre, autel, tablette, arches,
  braseros, bannières, gargouille, décor de cour et deux états de la porte.
- `LegacyWorldStyle` sélectionne maintenant le profil `castle`.
- `AssetManifest` charge les ressources locales ; `WorldScene` rend les
  décorations selon leurs types et applique un zoom dédié au niveau 6.
- Le fond existant `level-06-castle.png` est conservé comme couche de grande
  profondeur ; la carte Tiled reste la source du terrain et des collisions.

La provenance des nouveaux assets est documentée dans `public/assets/ASSETS.md`.
Ils sont générés localement et aucun lien externe ni asset tiers n’a été ajouté.
La licence de distribution commerciale finale doit être confirmée.

## Vérification

Vérifications réellement exécutées le 17 octobre 2026 :

- `npm test` : PASS, 48/48 tests.
- `npm run typecheck` : PASS.
- `npm run build` : PASS. Vite signale uniquement l’avertissement connu de
  taille du chunk Phaser (environ 1,2 Mo minifié).
- `GITQUEST_QA_LEVEL=level-06 npm run qa:browser` : PASS, niveau rendu et
  FPS mesuré à 55 FPS sur la session de contrôle.
- Captures Chrome produites et inspectées : 1280×720 (56,07 FPS), 844×390
  (57,05 FPS) et 390×844 (58 FPS).
- `npm run qa` : PASS. La suite a validé le menu, les paramètres, le RTL,
  les niveaux 1 à 6, les commandes Git, les récompenses, les portes, la
  victoire, la sauvegarde et la reprise.

Captures réelles :

- `docs/captures/level-06-1280x720.png` — desktop.
- `docs/captures/level-06-844x390.png` — mobile paysage.
- `docs/captures/level-06-390x844.png` — mobile portrait.

Le contrôle navigateur a validé le rendu du château, l’arrivée avec Midou,
le cristal, l’autel de fusion, le coffre et la porte de sortie. La progression
complète a ensuite été validée par la suite globale, y compris `git merge`, la
victoire finale et la reprise après sauvegarde.

## Limites connues

- Les collisions restent des rectangles Tiled hérités du niveau initial ; ils
  stabilisent le parcours sans représenter chaque contour de mur au pixel près.
- Le terrain raster est volontairement rendu avec une faible opacité au-dessus
  du fond détaillé pour éviter un damier de tuiles.
- La provenance historique du fond de château et la licence commerciale des
  images générées doivent être confirmées avant diffusion publique.
