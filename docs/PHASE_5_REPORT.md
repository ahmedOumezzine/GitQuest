# GitQuest 2.0 — Rapport Phase 5

Date : 2026-10-17

## Réalisé

- Remplacement des quatre boutons directionnels par un joystick tactile analogique.
- Gestion `pointerup`, `pointerupoutside` et interruption du geste.
- Bouton tactile Interagir.
- Bouton tactile Terminal.
- Repositionnement des contrôles selon `ResponsiveLayoutManager`.
- Les contrôles restent masqués automatiquement sur un appareil à pointeur fin et peuvent être forcés depuis les paramètres.
- Zones tactiles minimales conservées à 44 pixels logiques.

## Validation réelle

Le code et le typecheck sont validés. Une vérification Chrome desktop du niveau 1 ne montre aucune erreur console. Le menu et les paramètres ont désormais été capturés avec un contrôle explicite du viewport aux dimensions `1280×720`, `844×390` et `390×844`. La règle de placement du menu paysage compact et le calcul des zones sûres des contrôles tactiles sont couverts par des tests unitaires ; la suite compte désormais 42 tests.

Le parcours tactile réel et l’affichage des contrôles sur appareils physiques restent à vérifier. Le runner Chrome versionné peut exécuter le parcours complet menu → nouvelle partie → introduction → niveau 1 → terminal → sauvegarde → reprise sur les sept viewports demandés :

- 1920×1080
- 1366×768
- 1280×720
- 844×390
- 390×844
- 768×1024
- 1024×768

Les sept vues ont été vérifiées individuellement dans Chrome headless ; le smoke complet est également stable sur `1280×720`, `844×390` et `390×844`. Une exécution isolée à `390×844` avec `GITQUEST_QA_TOUCH=1` a réussi sous émulation tactile Chrome et a confirmé la visibilité des contrôles. Une course de timing intermittente autour d’une interaction de coffre en `768×1024` a conduit à renforcer le helper QA ; elle doit encore être surveillée dans une matrice complète. Le geste joystick lui-même n’est pas déclaré automatisé : le protocole tactile CDP n’a pas produit un déplacement Phaser suffisamment déterministe dans cet environnement. Cette émulation ne constitue pas un test d’écran tactile physique.

Une régression de mobilité des cartes legacy en paysage compact a ensuite été corrigée : `WorldScene` applique désormais les limites physiques et les limites caméra aux dimensions de la carte Tiled, puis suit le joueur sur les six cartes. Avant ce correctif, les positions sous `y=390` étaient inaccessibles lorsque le viewport était plus petit que la carte. Le parcours complet a été rejoué sans diagnostic à `1280×720`, `844×390` et `390×844` avec succès.

Le HUD du niveau 1 a été exercé dans ces mêmes parcours ; le titre, l’objectif, l’XP, les langues, le journal, le terminal et l’aide de contrôle sont restés accessibles sans erreur.

La validation d’un vrai appareil tactile, des claviers virtuels natifs et des safe areas propres à chaque système reste manuelle.
