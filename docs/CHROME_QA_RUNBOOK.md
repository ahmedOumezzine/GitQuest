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

## Smoke test navigateur versionné

Sur Windows, si Chrome est installé dans son chemin standard :

```text
npm run qa:browser
```

Le script `scripts/browser-smoke.mjs` démarre un serveur Vite isolé sur le port 5181 et une session Chrome/Edge headless avec un profil temporaire. Il vérifie réellement :

- le menu et l’écran Paramètres ;
- le changement FR → AR et `html[dir]="rtl"` ;
- Nouvelle partie, le chargement et l’introduction ;
- Passer vers le niveau 1 ;
- l’ouverture du terminal, la saisie de `git init` et la sauvegarde `localStorage` version 1 ;
- une actualisation réelle, puis le bouton Continuer et la reprise du niveau 1 sauvegardé ;
- l’absence d’exception JavaScript ou d’erreur console applicative.

Le test ne touche pas le profil Chrome principal. Pour un chemin non standard, définir `GITQUEST_CHROME`. Le viewport peut être contrôlé avec `GITQUEST_QA_WIDTH` et `GITQUEST_QA_HEIGHT`, par exemple :

```powershell
$env:GITQUEST_QA_WIDTH = '390'
$env:GITQUEST_QA_HEIGHT = '844'
npm run qa:browser
```

`GITQUEST_QA_TOUCH=1` active en plus l’émulation tactile Chrome. Le test ne remplace pas la validation sur appareil tactile physique ni le parcours manuel complet des six niveaux.
