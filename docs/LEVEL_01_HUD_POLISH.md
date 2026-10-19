# GitQuest — Niveau 1 : polish HUD

## Périmètre

Cette micro-tâche ne modifie que la présentation du HUD et les outils de
validation. Les cartes Tiled, le terrain, les sprites, les objets métier, les
quêtes Git et les niveaux 2 à 6 restent inchangés.

## Changements réalisés

- `src/ui/hud/QuestTracker.ts`
  - hiérarchie mission / étape active / conseil / progression ;
  - mode compact repliable au toucher ou au clic ;
  - titre replié conservant le compteur `0/4`, `1/4`, etc. ;
  - alignement RTL et hauteurs adaptées au portrait et au paysage.
- `src/ui/hud/XPBar.ts`
  - valeur affichée sous la forme `XP actuel / 100` ;
  - barre de progression conservée et redimensionnée.
- `src/ui/hud/InventoryBar.ts`
  - indicateur de sac `▣` et compteur réel conservés.
- `src/ui/hud/BeachStatusCard.ts`
  - carte joueur compacte avec portrait, niveau, XP, barre XP et inventaire.
- `src/scenes/UIScene.ts`
  - badge de région plus fin ;
  - bouton journal identifiable (`▤ J`, icône seule en portrait) ;
  - positionnement du journal hors de la rangée mission/XP ;
  - boussole visible en desktop et en paysage mobile, masquée en portrait pour
    préserver la zone de jeu ;
  - mission du niveau 1 séparée du statut joueur et de la mini-carte.
- `src/ui/layout/ResponsiveLayoutManager.ts`
  - paysage mobile : mission à gauche, colonne XP/inventaire à droite ;
  - portrait : mission compacte puis XP/inventaire sur une seconde rangée.
- `tests/ResponsiveLayout.test.ts`
  - couverture explicite de l’absence de chevauchement en paysage mobile.
- `scripts/browser-smoke.mjs`
  - capture optionnelle d’un HUD RTL sur un niveau ;
  - capture optionnelle de l’état de mission terminée ;
  - ces ajouts concernent uniquement le runner QA, pas le runtime du jeu.

## Captures vérifiées

- [1280×720 — mission active](captures/level-01-hud-active-1280x720.png)
- [1908×900 — mission active](captures/level-01-hud-active-1908x900.png)
- [844×390 — mission active et contrôles tactiles](captures/level-01-hud-active-844x390.png)
- [390×844 — mission active et contrôles tactiles](captures/level-01-hud-active-390x844.png)
- [390×844 — arabe RTL](captures/level-01-hud-ar-rtl-390x844.png)
- [1280×720 — mission avancée, clé/XP et porte ouverte](captures/level-01-hud-complete-1280x720.png)
- [1280×720 — porte verrouillée et message contextuel](captures/level-01-hud-locked-1280x720.png)

Les captures montrent notamment que Midou reste visible, que le panneau de
mission ne recouvre pas le joueur, que l’XP et l’inventaire restent lisibles et
que les cibles interactives conservent leurs indications contextuelles.

## Résultats des tests

- `npm test` : PASS, 68 tests.
- `npm run typecheck` : PASS.
- `npm run build` : PASS.
- `npm run qa` : PASS, parcours navigateur complet : menu, paramètres, RTL,
  niveaux 1 à 6, commandes Git, récompenses, portes, victoire, sauvegarde et
  reprise.

Mesures FPS rapportées par le runner navigateur pendant les captures :

- 1280×720 : 55.09 FPS.
- 1908×900 : 39.00 FPS.
- 844×390 : 30.49 FPS en émulation tactile.
- 390×844 : 53.00 FPS en émulation tactile.
- 390×844 RTL : 58.00 FPS en émulation tactile.

Ces mesures sont des indicateurs du runner headless et non une certification
de performance sur tous les téléphones réels.

## Limites restantes

- La boussole est volontairement masquée en portrait pour respecter la zone
  sûre et ne pas transformer le HUD permanent en troisième rangée ; la cible
  reste disponible via l’objectif et la mini-carte repliée.
- La police reste la pile monospace locale existante ; aucun asset de police
  tiers n’a été ajouté.
- La validation sur un téléphone physique et la vérification visuelle après
  rotation réelle restent recommandées avant une publication finale.

## Conclusion

Le HUD du niveau 1 est modernisé sans modification du gameplay ni des données.
La mission active, la progression, l’XP, l’inventaire, le journal, la
mini-carte et les contrôles tactiles sont conservés dans une composition plus
compacte et vérifiée sur les quatre résolutions demandées.
