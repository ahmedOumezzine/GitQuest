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

Le code et le typecheck sont validés. Une vérification Chrome desktop du niveau 1 ne montre aucune erreur console. Le menu et les paramètres ont désormais été capturés avec un contrôle explicite du viewport aux dimensions `1280×720`, `844×390` et `390×844`. La règle de placement du menu paysage compact et le calcul des zones sûres des contrôles tactiles sont couverts par des tests unitaires ; la suite compte désormais 38 tests.

Le parcours tactile réel et l’affichage des contrôles sur appareils physiques restent à vérifier. Les viewports exacts suivants n’ont pas encore été exécutés pour le niveau en jeu avec un navigateur automatisé :

- 1920×1080
- 1366×768
- 1280×720
- 844×390
- 390×844
- 768×1024
- 1024×768

Le HUD du niveau 1 a toutefois été observé en français à `844×390` : titre, objectif, XP, langues, journal et aide de contrôle restent visibles sans chevauchement, avec console Chrome sans erreur.

Ils restent à certifier manuellement ou avec une matrice navigateur disposant d’un contrôle explicite du viewport.
