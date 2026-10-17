# GitQuest — runbook de validation Chrome

Ce runbook décrit une vérification reproductible sans modifier la sauvegarde de jeu.

## Démarrer le serveur

```text
npm run dev -- --host 0.0.0.0 --port 5180
```

Selon le shell Windows et les ports déjà occupés, utiliser directement :

```text
npx vite --host 0.0.0.0 --port 5180
```

## Vérification technique des six cartes

Ouvrir successivement les routes suivantes dans Chrome :

```text
http://<adresse-locale>:5180/?qa=benchmark&qaLevel=level-01&perf=1
http://<adresse-locale>:5180/?qa=benchmark&qaLevel=level-02&perf=1
http://<adresse-locale>:5180/?qa=benchmark&qaLevel=level-03&perf=1
http://<adresse-locale>:5180/?qa=benchmark&qaLevel=level-04&perf=1
http://<adresse-locale>:5180/?qa=benchmark&qaLevel=level-05&perf=1
http://<adresse-locale>:5180/?qa=benchmark&qaLevel=level-06&perf=1
```

Pour chaque route, vérifier :

1. le titre du niveau et le HUD sont visibles ;
2. le décor correspondant à la région est affiché ;
3. `html[data-gitquest-fps]` apparaît après environ une seconde ;
4. la console Chrome ne contient aucune erreur ni avertissement applicatif.

La route `qa=benchmark` est explicitement obligatoire. Sans ce paramètre, `qaLevel` est ignoré et le démarrage normal passe par le menu.

## Vérification des écrans

Avec le démarrage normal, vérifier au minimum :

- Nouvelle partie → confirmation → chargement → introduction → Passer → niveau 1 ;
- interaction Midou → terminal → `git init` → coffre → clé → porte ;
- Paramètres → FR/EN/AR → Retour ;
- arabe : `html[lang]="ar"`, `html[dir]="rtl"` et champ terminal RTL ;
- reprise après actualisation avec Continuer.

Les viewports déjà observés avec contrôle explicite sont `1280×720`, `844×390` et `390×844` pour le menu, les paramètres, la confirmation et l’introduction. La vérification tactile physique reste hors de ce runbook automatisé.

## Commande locale complète

```text
npm run qa:local
```

Cette commande exécute `npm test`, `npm run typecheck` puis `npm run build`. Elle ne démarre pas de serveur et ne modifie pas la sauvegarde.
