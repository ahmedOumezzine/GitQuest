# Game Design — GitQuest

## Promesse

GitQuest raconte l’apprentissage de Git comme une expédition. Midou, un mentor archiviste, accompagne le joueur sur l’île des Commits. Chaque région fait découvrir une idée Git, puis la transforme en action dans un dépôt simulé. Une mission n’est validée que si l’état du dépôt est correct ; recopier une chaîne sans effet ne suffit pas.

## Boucle de jeu

Explorer → trouver un parchemin ou un cristal → écouter Midou → utiliser le terminal → vérifier le résultat → ouvrir le coffre → obtenir la clé → ouvrir la porte.

## Chapitres

### 1. Plage des Origines — git init

Une plage balayée par les marées cache les premières traces de l’île. Midou explique qu’un projet doit d’abord devenir un dépôt. Le joueur rencontre un cristal de mémoire, lance git init, puis ouvre le coffre de la crique. La clé ouvre la porte vers la forêt.

### 2. Forêt des Fichiers — git add

Les arbres portent des étiquettes de fichiers et les lucioles représentent les changements non indexés. Le joueur apprend que git add prépare un fichier pour le prochain instantané. La mission finale demandera de mettre les fichiers de la forêt dans l’index.

### 3. Grotte des Souvenirs — git commit

Des peintures murales racontent les anciens commits. Le joueur doit passer de changements indexés à un souvenir nommé avec git commit -m. Les cristaux deviennent plus lumineux à chaque commit réussi.

### 4. Port des Connexions — git push et git pull

Deux quais relient l’île à un phare distant. push envoie les commits vers l’horizon ; pull ramène les changements disponibles. Le scénario insiste sur la différence entre travailler localement et synchroniser un dépôt distant.

### 5. Montagne des Branches — git branch et git switch

Les sentiers se séparent autour d’un sommet. Le joueur crée une branche pour expérimenter avec git branch, puis s’y rend avec git switch. La carte conserve un chemin principal et un chemin d’exploration.

### 6. Château des Conflits — git merge et résolution

Deux versions du château ont divergé. Le joueur fusionne les branches et apprend à reconnaître une situation de conflit. Dans la version initiale, la structure de données prévoit conflicts ; la résolution interactive détaillée et les énigmes de fichiers sont une étape de production suivante.

## Progression et récompenses

Les cristaux donnent de petits bonus d’XP, les missions donnent une clé et un bonus majeur. Les clés sont temporaires : elles servent à franchir la porte du chapitre courant. L’état est sauvegardé après les commandes validées, les objets et les changements de langue.

## Direction artistique

Pixel art 32×32, silhouettes lisibles, palette contrastée et identité chromatique par région. Les SVG inclus sont des sprites de démonstration locaux ; la production remplacera ces fichiers par des sprites CC0 documentés dans public/assets/ASSETS.md. La musique joyeuse est prévue pour les trois premiers chapitres, puis une orchestration plus épique pour le port, la montagne et le château.

## Accessibilité et mobile

Les commandes clavier sont doublées par des boutons tactiles. Les textes peuvent être affichés en français, anglais ou arabe ; l’interface adapte sa direction via dir="rtl" pour l’arabe. Les textes narratifs doivent rester courts et sous-titrés avant l’ajout de doublage.
