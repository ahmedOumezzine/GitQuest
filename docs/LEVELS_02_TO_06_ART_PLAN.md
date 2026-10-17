# GitQuest 2.0 — Plan artistique et technique des niveaux 2 à 6

**Statut : plan préparatoire uniquement**  
**Date : 17 octobre 2026**

Ce document prépare la transformation visuelle des niveaux 2 à 6. Il ne modifie
aucune carte, donnée de mission, scène Phaser ou mécanique de jeu. L'implémentation
ne commencera qu'après validation de ce plan.

## 1. Objectifs et principes

Les cinq régions doivent former une aventure continue tout en ayant chacune une
silhouette, une palette et des points d'intérêt immédiatement reconnaissables.
La référence de qualité est le niveau 1 final : terrain lisible, personnages
animés, ombres au sol, objets interactifs identifiables et porte de sortie ayant
un état fermé/ouvert clair.

Principes retenus :

- les cartes Tiled restent la source de vérité pour le terrain jouable, les
  collisions et les ancres d'objets ;
- le rendu utilise de vrais assets locaux 32×32 ou des sprites raster détaillés,
  jamais une capture complète de décor comme carte jouable ;
- les identifiants existants (`player-spawn`, `midou`, `exit-gate` et les objets
  de quête) sont conservés ;
- `WorldScene`, la caméra, le HUD, les contrôles, les indicateurs d'interaction,
  les animations de personnages et le système de porte du niveau 1 sont réutilisés
  via des profils de région data-driven ;
- `LevelManager`, `QuestManager`, `GitSimulator`, `InventoryManager`,
  `XPManager` et `SaveManager` ne sont pas modifiés pour des raisons purement
  artistiques ;
- chaque étape d'implémentation doit laisser les six niveaux lançables et la
  progression Git testable ;
- chaque asset ajouté est local et documenté dans `public/assets/ASSETS.md` avec
  sa provenance et sa licence connue. Les licences finales des assets générés
  existants doivent être clarifiées avant une distribution commerciale.

## 2. État technique observé

### 2.1 Données des niveaux

Les définitions de niveau sont déjà séparées des scènes et contiennent les
missions, les dialogues, les objets, les commandes Git, la clé et la sortie.

| Niveau | Mission et commandes | Objets de progression | Porte / ancres |
|---|---|---|---|
| 2 — Forêt des Fichiers | `git add` | `forest-crystal`, `forest-chest`, `forest-scroll` | `player-spawn`, `midou`, `exit-gate` |
| 3 — Grotte des Souvenirs | `git commit` | `cave-crystal`, `cave-chest`, `cave-scroll` | `player-spawn`, `midou`, `exit-gate` |
| 4 — Port des Connexions | `git push`, `git pull` | `harbor-crystal`, `harbor-chest`, `harbor-scroll` | `player-spawn`, `midou`, `exit-gate` |
| 5 — Montagne des Branches | `git branch`, `git switch` | `mountain-crystal`, `mountain-chest`, `mountain-scroll` | `player-spawn`, `midou`, `exit-gate` |
| 6 — Château des Conflits | `git merge` | `castle-crystal`, `castle-chest`, `castle-scroll` | `player-spawn`, `midou`, `exit-gate` |

Les définitions utilisent déjà des coordonnées cohérentes avec une carte de
`30 × 17` tuiles de `32 × 32` pixels, soit `960 × 544` pixels.

### 2.2 Cartes Tiled existantes

Les cinq cartes exposent bien les couches `Ground`, `Decorations`, `Collisions`
et `Objects`. En revanche, l'audit montre que :

- `Ground` existe mais son tableau `data` est vide sur les cinq cartes ;
- aucun tileset Tiled n'est référencé par ces cartes ;
- `Decorations` ne contient actuellement qu'un objet régional générique ;
- `Collisions` contient quatre rectangles pour les niveaux 2 à 5 et cinq pour le
  château ;
- `Objects` contient seulement les trois ancres communes de spawn, Midou et
  porte, les objets de quête venant des définitions JSON ;
- le rendu actuel emploie `LegacyWorldStyle`, un arrière-plan PNG et des props
  génériques. Ces PNG sont décoratifs : ils ne portent ni collision, ni objet,
  ni logique de quête.

Cette situation est acceptable pour préparer le plan, mais elle ne constitue pas
encore une base artistique comparable au niveau 1. Chaque région devra recevoir
un vrai terrain Tiled avant sa validation visuelle.

## 3. Direction artistique par région

### Niveau 2 — Forêt des Fichiers

**Intention :** une forêt tropicale dense où les fichiers sont représentés par
des feuilles, des fragments de parchemin et des balises de classement.

- Palette : verts émeraude et mousse, terre chaude, lumière dorée filtrée par la
  canopée, touches turquoise pour les ruisseaux.
- Composition : entrée dégagée près de Midou, chemin naturel en S, clairière du
  cristal, zone de classement avec caisses et parchemins, puis coffre et porte
  au fond de la forêt.
- Points d'intérêt : arbres anciens, racines, fougères, champignons, cairns,
  panneaux de fichiers et sanctuaire de staging près du parchemin.
- Lecture pédagogique : des marqueurs de feuilles empilées et une petite zone
  « index » évoquent l'index Git sans ajouter de nouvelle mécanique.
- Porte : portail de racines et de pierre, fermé par des lianes avant la clé,
  puis éclairé d'un vert doré après validation.

**Assets à prévoir :**

- tileset forêt : herbe, mousse, terre, chemin, bord d'eau, racines et ombres ;
- variantes d'arbres avec tronc, feuillage et ombre séparés ;
- fougères, fleurs, champignons, caisses d'archives, panneaux et cairns ;
- balise/sanctuaire `git add` ;
- porte régionale et effets de lianes verrouillées ;
- spritesheets locales du joueur et de Midou réutilisables avec la palette de la
  forêt, sans changer leur identité.

### Niveau 3 — Grotte des Souvenirs

**Intention :** une grotte calme et mystérieuse où chaque commit devient une
mémoire conservée dans la roche.

- Palette : indigo, violet minéral, bleu nuit, cristaux rose pâle et ambre des
  torches.
- Composition : galerie d'entrée, couloir avec stalactites, chambre centrale
  des souvenirs, passerelles rocheuses et alcôve du coffre.
- Points d'intérêt : cristaux lumineux, tablettes gravées, archivoltes, torches,
  flaques réfléchissantes et autel de commit près du parchemin.
- Lecture pédagogique : les tablettes affichent des symboles de versions ; les
  détails restent décoratifs et ne modifient pas le simulateur Git.
- Porte : arche basaltique avec noyau de cristal ; faible lumière à l'état
  verrouillé, pulsation violette après obtention de la clé.

**Assets à prévoir :**

- tileset roche : sol, parois, fissures, bords, plateformes, flaques et ombres ;
- stalactites/stalagmites de plusieurs tailles ;
- cristaux, torches, tablettes, poussière et reflets ;
- autel de commit et coffre intégrés dans la géométrie de la grotte ;
- porte basaltique avec versions fermée et ouverte ;
- spritesheets joueur/Midou avec éclairage compatible avec la scène sombre.

### Niveau 4 — Port des Connexions

**Intention :** un port vivant au crépuscule, construit autour du déplacement
des commits entre les rives locale et distante.

- Palette : turquoise profond, bleu marin, bois brun, corail et or de lanternes.
- Composition : quai d'arrivée, route entre entrepôts, ponton central, deux rives
  reliées et zone du coffre près d'une capitainerie.
- Points d'intérêt : barques, cordages, caisses, bouées, grues, lanternes,
  panneaux de quai et phare secondaire ; les éléments suggèrent push/pull sans
  créer une connexion réseau réelle.
- Lecture pédagogique : deux bornes ou quais opposés représentent local et
  distant ; l'objectif reste validé uniquement par `GitSimulator`.
- Porte : écluse/portail de quai en bois et métal, chaînes visibles lorsqu'elle
  est fermée, fanaux allumés lorsqu'elle est accessible.

**Assets à prévoir :**

- tileset eau, sable humide, bois de quai, pierre de digue et passerelles ;
- vagues, écume, reflets, cordages, caisses, tonneaux et lanternes ;
- barques et éléments de port avec ombres ;
- borne « local », borne « remote » et autel push/pull ;
- porte-écluse avec états fermés/ouvert ;
- variantes de sprites avec contraste suffisant sur le fond bleu.

### Niveau 5 — Montagne des Branches

**Intention :** une ascension lisible en lacets, où les embranchements du chemin
représentent les branches Git.

- Palette : ardoise, gris bleuté, herbe froide, terre ocre et neige claire aux
  hauteurs.
- Composition : camp de départ, sentier en lacets, bifurcation clairement
  signalée, pont ou corniche, belvédère du coffre et sommet avec la porte.
- Points d'intérêt : cairns, balises de sentier, pins rabougris, rochers, ponts,
  fanions et racines en forme de branches.
- Lecture pédagogique : les bifurcations sont visuelles ; aucun passage ne doit
  imposer une règle différente de la quête `branch` puis `switch`.
- Porte : col de montagne composé de deux monolithes et de rubans de branche,
  avec vent lumineux lorsque la sortie est déverrouillée.

**Assets à prévoir :**

- tileset de falaises, sols, pentes, herbe, neige, ponts et ombres ;
- rochers par niveaux de profondeur, pins, cairns, balises et fanions ;
- éléments de sentier et passerelles ;
- borne de bifurcation et autel de branches ;
- porte de col avec états fermé/ouvert ;
- spritesheets lisibles sur des surfaces claires et froides.

### Niveau 6 — Château des Conflits

**Intention :** une forteresse finale où deux chemins de versions se rejoignent
dans une cour de fusion.

- Palette : bleu nuit, pierre froide, rouge cramoisi, or ancien et accents
  cyan pour les marqueurs de conflit résolu.
- Composition : pont d'entrée, cour divisée en deux accès, salle des archives,
  salle de décision autour du parchemin, coffre dans une aile latérale et porte
  finale vers la chambre des archives.
- Points d'intérêt : murs en pierre, bannières, armures décoratives, vitraux,
  bibliothèques, tables de scribes et sceaux de version.
- Lecture pédagogique : les deux chemins se croisent dans une cour centrale ; les
  marqueurs de conflit restent visuels et la résolution continue de dépendre de
  `git merge` et du véritable état simulé.
- Porte : grande porte d'archives avec deux vantaux désalignés avant la fusion,
  puis sceau doré et lumière cyan après validation.

**Assets à prévoir :**

- tileset de château : pierre, dallage, murs, arches, escaliers, tapis et ombres ;
- bannières, torches, bibliothèques, vitraux, armures, sceaux et débris ;
- cour de fusion et marqueurs décoratifs des deux versions ;
- porte finale à deux vantaux avec états verrouillé/ouvert ;
- spritesheets contrastées sur pierre sombre et éclairage de torches.

## 4. Fichiers concernés lors de l'implémentation

### Données et assets

- `public/data/maps/level-02.json` à `public/data/maps/level-06.json` : ajouter
  les données Ground, les références de tilesets et les décorations Tiled
  nécessaires, en conservant les couches et les identifiants existants ;
- `public/assets/tilesets/` : ajouter un atlas local par région et son fichier
  `.tsx` ouvrable dans Tiled ;
- `public/assets/sprites/` : ajouter les props, portes et éventuellement les
  variantes de spritesheets nécessaires ;
- `public/assets/backgrounds/` : conserver les PNG actuels comme profondeur
  lointaine si leur usage reste pertinent, sans les faire passer pour des cartes ;
- `public/assets/ASSETS.md` : documenter chaque asset et son statut de licence.

### Code Phaser et données de présentation

- `src/data/AssetManifest.ts` : enregistrer les nouveaux assets locaux ;
- `src/scenes/PreloadScene.ts` : charger les assets et animations par profil,
  avec une erreur explicite si un fichier manque ;
- `src/scenes/WorldScene.ts` : généraliser le chemin de rendu Tiled et les
  profils visuels, sans dupliquer les règles de quête ou de collision ;
- `src/world/LegacyWorldStyle.ts` : remplacer progressivement les styles
  génériques par des profils de région décrivant palette, couches, props,
  profondeur et porte ;
- `src/models/game.ts` : étendre uniquement les types de présentation si cela
  est nécessaire, sans rendre les données métier dépendantes d'un asset ;
- `tests/` : tests de manifeste, validation Tiled, accessibilité des ancres,
  états de porte et régression de progression ;
- `scripts/browser-smoke.mjs`, `scripts/browser-matrix.mjs` et
  `scripts/browser-touch.mjs` : étendre les vérifications visuelles et de
  parcours, sans remplacer les tests métier.

Les fichiers suivants sont hors périmètre attendu :
`GitSimulator`, `QuestManager`, `SaveManager`, les gestionnaires d'inventaire et
d'XP, ainsi que les définitions de missions, sauf si un défaut indépendant de
l'art est découvert pendant les tests.

## 5. Ordre d'implémentation proposé

Chaque étape se termine par un build jouable et un contrôle de progression avant
de passer à la suivante.

1. **Contrat artistique et technique commun**
   - valider les palettes, dimensions, formats, pivots, ombres et conventions de
     profondeur ;
   - créer un profil visuel data-driven et un gabarit de tileset Tiled ;
   - vérifier le chargement sans modifier les missions.
2. **Niveau 2 — Forêt des Fichiers**
   - première région pilote ; produire le terrain, les chemins et les portes ;
   - valider que le procédé peut être répété sans code spécifique au niveau.
3. **Niveau 3 — Grotte des Souvenirs**
   - introduire les couches sombres, les lumières et les reflets ;
   - vérifier les contrastes et les collisions dans les galeries.
4. **Niveau 4 — Port des Connexions**
   - intégrer eau, quais et profondeur ;
   - tester les limites entre zones non marchables et chemins.
5. **Niveau 5 — Montagne des Branches**
   - produire les lacets et bifurcations ;
   - vérifier que l'itinéraire vers cristal, parchemin, coffre et porte reste
     accessible sur mobile.
6. **Niveau 6 — Château des Conflits**
   - produire la forteresse et la cour de fusion ;
   - faire une passe finale sur l'éclairage et la lisibilité de la porte.
7. **Passe commune**
   - responsive desktop, paysage et portrait ; RTL arabe ; performances ;
     animations ; cohérence des ombres, ancrages et indicateurs ;
   - exécuter les tests unitaires, typecheck, build et QA navigateur du parcours
     complet.

## 6. Risques de régression et mesures préventives

| Risque | Conséquence | Prévention |
|---|---|---|
| GID Tiled ou tileset mal aligné | terrain affiché avec de mauvaises tuiles | valider les `.tsx`, `firstgid`, dimensions 32×32 et rendu sur une carte de test |
| Ground ajouté sans synchroniser les collisions | joueur bloqué ou capable de traverser un obstacle | conserver les rectangles existants comme contrat initial puis tester chaque route |
| Décor placé sur une ancre | objet/NPC/porte masqué ou inaccessible | réserver des zones de sécurité autour des coordonnées de progression |
| Origines et pivots incohérents | personnages qui flottent ou glissent | réutiliser les ancrages du niveau 1, corps aux pieds et ombres séparées |
| Porte régionale trop proche du décor | sortie illisible | contraste d'état, label localisé et indicateur contextuel comme au niveau 1 |
| Images trop grandes ou trop nombreuses | baisse de performances sur mobile | atlas régionaux, tailles contrôlées, culling caméra et mesure FPS |
| Texte incorporé dans une image | localisation impossible, RTL incorrect | aucun texte dans les assets ; textes rendus par les composants Phaser/i18n |
| Licence non démontrée | distribution bloquée | provenance et licence vérifiées avant ajout à `ASSETS.md` |
| Visualisation de push/pull ou merge interprétée comme réseau réel | confusion pédagogique | conserver la validation dans `GitSimulator` et documenter les éléments comme métaphores visuelles |
| Modification d'un identifiant Tiled | quête ou sauvegarde cassée | tests de présence des IDs avant/après chaque carte |

## 7. Critères de validation

### Critères communs à chaque niveau

- la carte s'ouvre dans Tiled et possède `Ground`, `Decorations`, `Collisions`
  et `Objects` ;
- le terrain Ground est réellement rempli par un tileset régional 32×32 ;
- aucun asset demandé par le manifeste ne produit d'erreur de chargement ;
- `player-spawn`, `midou` et `exit-gate` existent avec des coordonnées sûres ;
- les objets de cristal, parchemin et coffre restent présents, visibles et
  accessibles ;
- le joueur et Midou utilisent les animations quatre directions, ont un ancrage
  aux pieds et une ombre cohérente ;
- la porte est clairement verrouillée avant la mission puis animée après la clé ;
- les collisions empêchent les passages prévus tout en laissant un itinéraire
  complet vers chaque objectif ;
- les commandes Git, les objectifs, l'XP, l'inventaire, la sauvegarde et la
  reprise restent inchangés fonctionnellement ;
- les textes visibles existent en FR/EN/AR, avec alignement RTL correct en arabe ;
- les résolutions `1280×720`, `844×390` et `390×844` sont vérifiées, ainsi que
  les contrôles tactiles ;
- `npm test`, `npm run typecheck`, `npm run build` et `npm run qa` passent ;
- le parcours propre du niveau est joué dans le navigateur : Midou, cristal,
  parchemin, terminal, commande(s), coffre, clé, porte et niveau suivant.

### Critères artistiques mesurables

- aucun carré de fallback ou prop générique ne remplace un asset régional dans
  une capture de validation ;
- au moins trois plans lisibles sont présents : arrière-plan, terrain/décor,
  premier plan avec ombres ou éléments d'occlusion ;
- chaque région possède au moins trois landmarks uniques, dont un lié à sa
  métaphore Git ;
- les points d'intérêt restent identifiables sans lire le code ni les logs ;
- le rendu ne régresse pas sous 45 FPS lors de la passe navigateur de référence
  sur la machine de QA, et aucun asset ne provoque une croissance injustifiée
  du bundle ou de la mémoire ;
- les captures avant/après sont conservées par niveau et comparées à la direction
  artistique validée.

## 8. Limites et décisions à valider avant production

- Les PNG régionaux déjà présents sont des couches décoratives locales, mais leur
  licence de distribution finale est encore à confirmer ; ils ne suffisent pas à
  eux seuls pour obtenir des cartes jouables de qualité comparable au niveau 1.
- Aucun pack tiers ne doit être ajouté sans licence vérifiée. Si des assets
  professionnels externes sont nécessaires, ils devront être fournis ou acquis
  explicitement avant l'implémentation.
- La transformation des cartes devra être réalisée niveau par niveau afin de
  préserver les routes testées et de rendre chaque régression localisable.
- Ce document ne certifie aucune amélioration visuelle des niveaux 2 à 6 : il
  décrit le travail à réaliser.

## Conclusion

Le socle métier des cinq niveaux est déjà exploitable et extensible, mais leur
présentation actuelle doit passer d'un rendu legacy générique à de véritables
terrains Tiled régionaux. Le niveau 2 est le meilleur pilote, car il permet de
valider le modèle de profil visuel, les chemins, les objets et la porte avant de
décliner la méthode dans les quatre régions suivantes.

**Attente : validation de ce plan avant toute modification des niveaux 2 à 6.**
