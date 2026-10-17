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

Le parcours tactile réel et l’affichage des contrôles sur appareils physiques restent à vérifier. Le runner Chrome versionné a depuis exécuté le parcours complet menu → nouvelle partie → introduction → niveau 1 → terminal → sauvegarde → reprise sur les sept viewports demandés :

- 1920×1080
- 1366×768
- 1280×720
- 844×390
- 390×844
- 768×1024
- 1024×768

Chaque exécution a terminé sans erreur console. Une exécution supplémentaire à `390×844` avec `GITQUEST_QA_TOUCH=1` a également réussi sous émulation tactile Chrome. Cette émulation ne constitue pas un test d’écran tactile physique.

Le HUD du niveau 1 a été exercé dans ces mêmes parcours ; le titre, l’objectif, l’XP, les langues, le journal, le terminal et l’aide de contrôle sont restés accessibles sans erreur.

La validation d’un vrai appareil tactile, des claviers virtuels natifs et des safe areas propres à chaque système reste manuelle.
