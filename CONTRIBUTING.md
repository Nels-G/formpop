# Contribuer à FormPop

Merci de t'intéresser à FormPop ! Toute contribution est la bienvenue : correction de bug, nouvelle catégorie de champ détectée, traduction, amélioration du moteur de détection, etc.

## Avant de commencer

- Regarde les [issues ouvertes](../../issues) pour voir si quelqu'un travaille déjà sur le sujet.
- Pour une nouvelle fonctionnalité importante, ouvre d'abord une issue pour en discuter avant de coder — ça évite le travail perdu.

## Mettre en place l'environnement

1. Fork le repo puis clone-le :
   ```bash
   git clone https://github.com/TON-PSEUDO/formpop.git
   cd formpop
   ```
2. Va sur `chrome://extensions`, active le **Mode développeur**, clique **Charger l'extension non empaquetée**, et sélectionne le dossier.
3. Après chaque modif de `content.js` ou `manifest.json`, clique sur le bouton **⟳ Recharger** de l'extension dans `chrome://extensions`.

## Pull Requests

1. Crée une branche depuis `main` : `git checkout -b fix/nom-du-fix` ou `feat/ma-fonctionnalite`.
2. Fais des commits clairs et atomiques.
3. Vérifie que l'extension fonctionne toujours sur quelques formulaires de test (Google Forms, un site React, un site Vue par exemple).
4. Ouvre la PR en décrivant : le problème résolu / la fonctionnalité ajoutée, comment tu l'as testée.

## Style de code

- Pas de dépendances externes (le projet reste 100% local, sans build step pour l'instant).
- Garde les commentaires et messages de commit clairs — en français ou en anglais, les deux sont acceptés.

## Idées de contributions bienvenues

- Support des `contenteditable` (Quill/TipTap).
- Nouveaux synonymes multilingues pour le moteur de détection.
- Gestion des iframes same-origin.
- Tests automatisés sur des formulaires réels.

Merci encore pour ton aide 🙌
