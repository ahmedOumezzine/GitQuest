# Niveau 1 — Finition des objets interactifs

## Périmètre

Cette micro-tâche concerne uniquement les objets interactifs et leurs
indications visuelles dans `level-01`. Le terrain, le littoral, la composition
des décorations, la caméra, le HUD global, les quêtes Git et les niveaux 2 à 6
n’ont pas été modifiés.

Les identifiants et coordonnées métier restent inchangés :

- `memory-crystal` : `210,405` ;
- `origin-chest` : `480,540` ;
- `exit-gate` : `900,270`.

## Objets et états

### Coffre `origin-chest`

- Remplacement du SVG générique par deux sprites raster pixel art locaux :
  `level-01-chest-closed-v1.png` et `level-01-chest-open-v1.png`.
- Le coffre fermé possède une serrure et un symbole Git lisibles.
- Après validation de la quête, le coffre passe visuellement à l’état ouvert,
  avec clé et lumière de récompense.
- Une ombre au sol est rendue séparément.
- L’état ouvert est conservé après rechargement grâce à `collectedObjects`.
- L’objet ouvert désactive son interaction ; la récompense ne peut donc pas
  être attribuée deux fois.

### Cristal `memory-crystal`

- Nouveau sprite raster `level-01-memory-crystal-v1.png` avec transparence,
  base minérale et facettes cyan/lavande.
- Ombre séparée au sol.
- Scintillement léger local par animation d’alpha et de position.
- Position, XP et collecte métier inchangés.

### Sanctuaire Git

- Sprite du sanctuaire conservé.
- Ajout d’un indicateur Git discret `⌘` visible lorsque le joueur est dans la
  zone de terminal.
- L’ouverture du terminal, la commande étudiée et `GitSimulator` restent
  inchangés.

### Porte `exit-gate`

- Sprite et position conservés.
- État verrouillé : porte assombrie, libellé localisé avec cadenas.
- État accessible : porte contrastée, aura cyan animée et indicateur `↗`.
- Le nom n’est visible qu’à proximité.
- L’interaction et les conditions de passage restent celles de `QuestManager`
  et de `origin-chest`.

## Indications contextuelles

L’indicateur de proximité n’affiche plus toujours la même lettre :

- `…` : Midou ;
- `✦` : cristal ;
- `▣` : coffre ;
- `⌘` : sanctuaire Git ;
- `🔒` : porte verrouillée ;
- `↗` : porte accessible ;
- `◇` : passage secret.

Les contrôles tactiles existants restent la surface d’interaction mobile ; ces
badges sont uniquement des repères dans le monde et ne remplacent pas le
bouton tactile.

## Captures Chrome réelles

- Vue générale : [`level-01-interactive-overview-1280x720.png`](captures/level-01-interactive-overview-1280x720.png)
- Coffre fermé : [`level-01-chest-closed-1280x720.png`](captures/level-01-chest-closed-1280x720.png)
- Coffre ouvert : [`level-01-chest-open-1280x720.png`](captures/level-01-chest-open-1280x720.png)
- Cristal interactif : [`level-01-crystal-interactive-1280x720.png`](captures/level-01-crystal-interactive-1280x720.png)
- Porte verrouillée : [`level-01-gate-locked-1280x720.png`](captures/level-01-gate-locked-1280x720.png)
- Porte accessible : [`level-01-gate-accessible-1280x720.png`](captures/level-01-gate-accessible-1280x720.png)
- Porte ouverte avant transition : [`level-01-gate-open-1280x720.png`](captures/level-01-gate-open-1280x720.png)

La porte déclenche immédiatement la transition vers le niveau suivant après
l’appui d’interaction. Les captures “accessible” et “ouverte” documentent donc
le même état visuel autorisé juste avant cette transition ; il n’existe pas de
temps d’arrêt artificiel ajouté au gameplay pour fabriquer une capture.

## Fichiers modifiés

- `src/scenes/WorldScene.ts` : états visuels du coffre, cristal raster,
  ombres, scintillement et badges contextuels.
- `src/data/AssetManifest.ts` : trois assets raster locaux du niveau 1.
- `scripts/browser-smoke.mjs` : points de capture ciblés pour les états
  interactifs.
- `public/assets/ASSETS.md` : provenance et statut de licence documentés.
- `public/assets/sprites/level-01-chest-closed-v1.png`.
- `public/assets/sprites/level-01-chest-open-v1.png`.
- `public/assets/sprites/level-01-memory-crystal-v1.png`.
- `docs/captures/` : captures listées ci-dessus.

## Vérifications

- `npm test` : **67/67 PASS**.
- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS**.
- `npm run qa` : **PASS** — progression des niveaux 1 à 6, récompenses,
  portes, sauvegarde/reprise et absence de doublon de récompense.
- QA Chrome ciblé niveau 1 : **PASS**.
- Le coffre ouvert est bien persisté et n’est plus sélectionnable.
- Aucun identifiant Tiled, objet métier, collision ou condition de porte n’a
  été modifié.

## Limites restantes

- Les nouveaux PNG sont des créations locales générées avec l’outil imagegen
  intégré le 18 octobre 2026. Aucun tiers ni URL externe n’est utilisé, mais
  la licence finale de distribution commerciale doit encore être confirmée.
- L’état “porte ouverte” est nécessairement très bref dans le jeu, car il est
  suivi immédiatement par le changement de scène.

Aucun commit ni push n’a été effectué.
