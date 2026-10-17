# GitQuest 2.0 — Rapport Phase 6

Date : 2026-10-17

## Réalisé

- Le sol du niveau 1 passe d’un GameObject image par tuile à un `TilemapLayer` Phaser.
- Les erreurs de chargement de carte sont affichées dans une surface responsive et localisée.
- Les événements tactiles sont nettoyés lors de l’arrêt des scènes.
- Un test de progression générique couvre les six définitions de niveau, leurs commandes Git, la clé et l’ouverture de porte au niveau logique.
- Le point d’entrée charge désormais le runtime Phaser de façon asynchrone ; le chunk initial passe à environ 2,2 kB, avec un chunk applicatif de 73 kB et Phaser isolé dans un chunk vendor d’environ 1,21 MB.
- Le parcours navigateur réel a été prolongé jusqu’à l’écran Victoire : les six niveaux ont été parcourus dans Chrome desktop avec les commandes propres à chaque mission, les coffres, les clés, les portes et l’XP observés.
- Les rapports de build conservent l’avertissement de bundle supérieur à 1,2 MB.

## Mesures et limites

Aucune mesure FPS automatisée ni benchmark runtime des six niveaux n’a été exécuté. Les niveaux 2 à 6 restent fonctionnels via leur rendu générique, mais ne disposent pas encore d’une finition artistique équivalente au niveau 1. Le parcours complet a été vérifié manuellement dans Chrome desktop, pas sous un runner navigateur automatisé.

Le build passe. L’avertissement Vite restant concerne uniquement le chunk vendor Phaser (environ 1,21 MB minifié, 332 kB gzip) ; le code GitQuest et son point d’entrée sont désormais découpés.
