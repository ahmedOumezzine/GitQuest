# GitQuest 2.0 — Rapport Phase 6

Date : 2026-10-17

## Réalisé

- Le sol du niveau 1 passe d’un GameObject image par tuile à un `TilemapLayer` Phaser.
- Les erreurs de chargement de carte sont affichées dans une surface responsive et localisée.
- Les écrans Boot, Preload et Victoire n’utilisent plus de coordonnées fixes 960×540 : leurs panneaux, textes et actions se recentrent selon le viewport.
- Les événements tactiles sont nettoyés lors de l’arrêt des scènes.
- Un test de progression générique couvre les six définitions de niveau, leurs commandes Git, la clé et l’ouverture de porte au niveau logique.
- Le point d’entrée charge désormais le runtime Phaser de façon asynchrone ; le chunk initial passe à environ 2,2 kB, avec un chunk applicatif de 73 kB et Phaser isolé dans un chunk vendor d’environ 1,21 MB.
- Le parcours navigateur réel a été prolongé jusqu’à l’écran Victoire : les six niveaux ont été parcourus dans Chrome desktop avec les commandes propres à chaque mission, les coffres, les clés, les portes et l’XP observés.
- Un compteur optionnel `?perf=1` publie une mesure DOM lisible sans modifier le gameplay. Sur le niveau 1 à `1280×720`, Chrome a mesuré `143,99 FPS`, `6,95 ms/frame`, soit `144 frames` sur `1000 ms`.
- Les tests `RuntimeMetrics.test.ts` vérifient le calcul déterministe du FPS et la résolution sûre de la route QA ; la suite globale compte 42 tests.
- La route QA `?qa=benchmark&qaLevel=level-XX&perf=1` permet de mesurer chaque carte sans modifier la sauvegarde ni sa progression :

| Niveau | FPS | Temps/image | Échantillon |
|---|---:|---:|---:|
| 1 | 137,99 | 7,25 ms | 138 / 1000 ms |
| 2 | 144,00 | 6,94 ms | 144 / 1000 ms |
| 3 | 144,01 | 6,94 ms | 145 / 1007 ms |
| 4 | 144,00 | 6,94 ms | 144 / 1000 ms |
| 5 | 144,00 | 6,94 ms | 144 / 1000 ms |
| 6 | 144,02 | 6,94 ms | 145 / 1007 ms |

Les six mesures ont été obtenues dans Chrome à `1280×720`; le niveau 6 a aussi été capturé visuellement et la console ne contenait aucune erreur ni avertissement.
- Les rapports de build conservent l’avertissement de bundle supérieur à 1,2 MB.

## Mesures et limites

L’instrumentation est activée uniquement avec `?perf=1` et publie ses valeurs dans `html[data-gitquest-fps]`, `data-gitquest-frame-time-ms`, `data-gitquest-sample-frames` et `data-gitquest-sample-duration-ms`. Ces FPS sont des mesures de rendu sur l’environnement Chrome courant, pas une garantie pour tous les appareils. Les niveaux 2 à 6 restent fonctionnels via leur rendu générique, mais ne disposent pas encore d’une finition artistique équivalente au niveau 1. Le parcours complet a été vérifié manuellement dans Chrome desktop, pas sous un runner navigateur automatisé.

Le build passe. L’avertissement Vite restant concerne uniquement le chunk vendor Phaser (environ 1,21 MB minifié, 332 kB gzip) ; le code GitQuest et son point d’entrée sont désormais découpés.

### Mise à jour de certification — 2026-10-17

Les paragraphes historiques de ce rapport décrivent l’état intermédiaire de la phase. L’état courant est le suivant :

- `npm test` : **42/42 PASS** ;
- `npm run typecheck` : **PASS** ;
- `npm run build` : **PASS** ;
- menu, paramètres, confirmation, introduction et HUD niveau 1 vérifiés avec viewport explicite `1280×720`, `844×390` et `390×844` ;
- benchmark FPS réel obtenu pour le niveau 1 à `1280×720` via `?perf=1` ;
- benchmark comparable des niveaux 2 à 6 et appareil tactile physique : les benchmarks sont réalisés, le tactile physique reste **non réalisé** ; un smoke test navigateur headless versionné est désormais disponible via `npm run qa:browser`.
- les ancres `Objects` des six cartes pilotent désormais les positions du joueur, de Midou et des portes ; un test vérifie leur concordance avec les définitions de niveau.
- les niveaux 2 à 6 utilisent maintenant un style de rendu distinct et data-driven (palette, chemin, obstacles et props) ; les niveaux 2 et 6 ont été observés dans Chrome sans erreur console.

Recheck Chrome du 17 octobre 2026 à `1280×720` via la route QA : niveaux 1 à 6 mesurés entre `133,97` et `142,99 FPS`, avec `0` erreur et `0` avertissement console pour chaque route. Les écarts avec la série précédente sont liés à la session et à l’environnement de rendu.

### Recheck headless ciblé des niveaux 2 à 6

Le smoke test versionné a ensuite été exécuté en mode direct, sans progression ni modification des données métier :

| Niveau | FPS | Erreurs console | Résultat |
|---|---:|---:|---|
| 2 | 57,05 | 0 | PASS, capture conservée |
| 3 | 58,00 | 0 | PASS |
| 4 | 55,00 | 0 | PASS |
| 5 | 57,05 | 0 | PASS |
| 6 | 58,03 | 0 | PASS |

La capture du niveau 2 confirme visuellement le fond forestier raster et l’absence des anciens rectangles translucides d’obstacles. Les cinq fonds sont des assets locaux générés le 17 octobre 2026 ; leur licence de distribution finale reste à confirmer avant publication commerciale.

Le même runner a été exécuté à viewport exact `1280×720` sur les six routes directes après le culling explicite de la couche Tiled : niveau 1 `57,00 FPS`, niveau 2 `57,05 FPS`, niveau 3 `56,07 FPS`, niveau 4 `57,05 FPS`, niveau 5 `57,05 FPS` et niveau 6 `57,05 FPS`, avec zéro erreur console. Le niveau 1 a progressé de `49,18` à environ `57 FPS` ; cette mesure reste dépendante de la session Chrome headless avec GPU désactivé et ne remplace pas une certification matérielle.
