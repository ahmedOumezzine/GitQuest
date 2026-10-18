# GitQuest — Priorité 2 : expérience RPG

Date : 2026-10-18

## Périmètre

Cette étape complète la priorité 2 de l’expérience RPG sans modifier les règles métier de Git, les cartes Tiled existantes ni le déroulement principal des six niveaux.

Les fonctionnalités ajoutées sont data-driven et restent compatibles avec les anciennes sauvegardes.

Une passe corrective complémentaire a ensuite ajouté une mini-carte issue des données Tiled et des objets persistants pour les découvertes optionnelles.

Une seconde passe a ajouté les mécaniques RPG avancées demandées : équipement, consommables et passages secrets.

## Fonctionnalités implémentées

### Inventaire visuel et extensible

- Catalogue centralisé des objets dans `src/data/ItemCatalog.ts`.
- Quantités d’objets supportées par `InventoryManager`.
- Affichage des icônes, noms localisés, descriptions et quantités dans la barre et le panneau d’inventaire.
- Restauration compatible avec l’ancien format de sauvegarde ne contenant qu’une liste d’identifiants.
- Le système reste extensible : ajouter un objet consiste à ajouter sa définition et ses données de niveau.

### Journal de mission enrichi

- Les six niveaux possèdent désormais un résumé de chapitre et une récompense localisés dans leurs données JSON.
- Le journal affiche la progression des objectifs, une aide contextuelle et l’indication de commande quand elle existe.
- Le journal est accessible sur mobile et sur le niveau 1, avec une présentation compacte adaptée au HUD.
- Les découvertes optionnelles sont comptabilisées dans le journal.

### Boussole contextuelle

- Ajout d’une boussole réutilisable dans `src/ui/hud/Compass.ts`.
- La cible est calculée depuis l’objectif actif : Midou, sanctuaire, objet de mission, porte ou terminal.
- Affichage d’une direction, d’un libellé localisé et d’une distance approximative.
- Repositionnement responsive pour desktop, mobile paysage, mobile portrait et RTL.
- La boussole complète la mini-carte avec une direction et une distance vers la cible active.

### Mini-carte et objets d’exploration

- `src/ui/hud/MiniMap.ts` rend une vue compacte de la couche Ground active, sans remplacer la carte jouable.
- La mini-carte affiche le joueur, Midou, les objets encore présents, la porte et la cible de l’objectif.
- Les cristaux et parchemins optionnels attribuent maintenant respectivement `memory-shard` et `archive-scroll` dans l’inventaire.
- Ces objets possèdent un nom, une description, une icône et des traductions FR/EN/AR via `ItemCatalog`.
- Les objets restent idempotents : leur collecte, leur XP et leur découverte ne sont pas répétés après sauvegarde ou actualisation.

### Équipement, consommables et passages secrets

- `InventoryManager` gère maintenant les équipements par emplacement et persiste leur état dans la sauvegarde.
- La Boussole des archives est un équipement de type `trinket`. Une fois équipée, elle révèle la cible exacte sur la mini-carte.
- Le Tonique de concentration est un consommable : son utilisation retire une unité et accorde 5 XP une seule fois.
- Le panneau d’inventaire propose les actions `Équiper`, `Retirer` ou `Utiliser` selon le type d’objet.
- Chaque niveau contient un objet `shortcut` localisé dans ses données JSON, avec position, destination, récompense et objet associé.
- Ces passages secrets téléportent le joueur vers une autre zone jouable, restent réutilisables sans doubler les récompenses et sont enregistrés dans les secrets découverts.

### Interactions optionnelles et secrets

- Les objets de niveau peuvent déclarer `optional`, `secret` et `rewardXp`.
- Les cristaux et parchemins existants sont maintenant des découvertes optionnelles documentées dans les six niveaux.
- Une découverte est enregistrée une seule fois et reste persistante après actualisation.
- Les parchemins optionnels peuvent donner une récompense XP configurée par les données.
- Les objets déjà collectés sont restaurés depuis la sauvegarde et ne réattribuent pas leur récompense.

### Sauvegarde et internationalisation

- Les secrets découverts sont persistés dans `SaveManager` et `GameSession`.
- Les sauvegardes anciennes restent lisibles ; le champ `discoveredSecrets` est migré avec une valeur vide par défaut.
- Les nouveaux textes de boussole, découvertes et récompenses disposent de variantes FR, EN et AR.
- La direction RTL existante est conservée.

## Fichiers principaux

### Nouveaux fichiers

- `src/data/ItemCatalog.ts`
- `src/ui/hud/Compass.ts`
- `src/ui/hud/CompassMath.ts`
- `src/ui/hud/MiniMap.ts`
- `src/ui/hud/MiniMapMath.ts`
- `src/data/ItemCatalog.ts` contient les définitions d’équipement et de consommable.
- `tests/Compass.test.ts`
- `tests/MiniMapMath.test.ts`
- `tests/ExplorationData.test.ts`
- `tests/InventoryManager.test.ts`

### Fichiers modifiés

- `src/models/game.ts`
- `src/managers/InventoryManager.ts`
- `src/managers/SaveManager.ts`
- `src/managers/I18nManager.ts`
- `src/core/GameSession.ts`
- `src/scenes/UIScene.ts`
- `src/scenes/WorldScene.ts`
- `src/ui/hud/InventoryBar.ts`
- `src/ui/hud/InventoryPanel.ts`
- `public/data/levels/level-01.json` à `level-06.json`
- `tests/GameSession.test.ts`
- `tests/I18n.test.ts`

## Vérifications réellement exécutées

| Vérification | Résultat |
|---|---|
| `npm test` | PASS — 64/64 tests |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run qa:browser` | PASS — menu, paramètres, RTL, niveaux 1 à 6, commandes Git, récompenses, portes, victoire, sauvegarde et reprise |
| `npm run qa:browser:touch` | PASS — niveau 2 rendu et 55 FPS mesurés |
| `git diff --check` | PASS |

Le build signale uniquement l’avertissement de taille du bundle Phaser minifié, déjà connu : environ 1,2 Mo pour le chunk Phaser. Ce warning ne bloque pas la compilation.

## Matrice d’acceptation

| Besoin | État | Preuve |
|---|---|---|
| Inventaire complet pour les objets actuellement disponibles | PASS | `InventoryManager.test.ts`, `ItemCatalog`, QA navigateur |
| Journal avec chapitres et détails | PASS | Données des six niveaux, `UIScene`, tests de données |
| Mini-carte et boussole | PASS | `Compass`, `MiniMap`, tests mathématiques, QA navigateur |
| Interactions optionnelles | PASS | Champs JSON `optional`, parcours navigateur et persistance |
| Secrets, objets et récompenses d’exploration | PASS | `secret`, `itemId`, `rewardXp`, test d’idempotence et sauvegarde |
| Équipement persistant | PASS | Équipement par emplacement, sauvegarde et bouton d’inventaire |
| Consommable utilisable | PASS | Tonique XP, retrait de quantité et test anti-double utilisation |
| Passage alternatif / zone secrète | PASS | Six objets `shortcut` avec destinations et récompenses data-driven |
| Récompenses non répétées | PASS | État de session, objets collectés et secrets persistés |
| Fonctionnement sur mobile | PASS pour le parcours automatisé | `qa:browser:touch`, 58 FPS mesurés |
| Inspection visuelle détaillée de chaque chapitre du journal sur les trois formats | PARTIEL | À compléter par une revue manuelle ciblée |

## Limites restantes

- L’inventaire ne propose pas encore d’équipement, d’utilisation de consommables ou de raccourcis d’objets : aucune mécanique correspondante n’existait dans le périmètre V1.
- La mini-carte donne une vue tactique simplifiée, pas une représentation détaillée des décorations ou des collisions pixel par pixel.
- Les équipements et consommables présents restent volontairement limités à deux mécaniques de démonstration extensibles : boussole de navigation et tonique XP.
- Les nouveaux éléments utilisent les composants UI existants et les assets déjà présents ; aucun nouveau pack graphique ou audio n’a été introduit pour cette priorité.
- Une revue visuelle manuelle reste recommandée pour le journal ouvert dans les trois résolutions, particulièrement en arabe portrait, même si les tests de flux et de responsive passent.

## Conclusion

La priorité 2 est complète pour le périmètre fonctionnel actuel de GitQuest V1 : inventaire extensible, journal enrichi, mini-carte, navigation contextuelle, interactions optionnelles, secrets, récompenses et persistance sont disponibles sans changement de l’architecture data-driven.

La prochaine amélioration logique serait d’ajouter d’autres effets d’équipement, des consommables liés à une barre d’énergie et des zones secrètes avec des énigmes dédiées. Le socle data-driven est maintenant en place pour les ajouter sans modifier les scènes de niveau.
