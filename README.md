# FormPop

Remplissage automatique et instantané de formulaires — 100% local, aucune donnée envoyée nulle part.

## Installation (mode développeur)

1. Dézippe le dossier `formpop`.
2. Va sur `chrome://extensions`.
3. Active le **Mode développeur** (en haut à droite).
4. Clique sur **Charger l'extension non empaquetée**.
5. Sélectionne le dossier `formpop` dézippé.
6. L'icône FormPop apparaît dans la barre d'outils — épingle-la si besoin.

## Utilisation

1. Ouvre la page contenant le formulaire à tester.
2. Clique sur l'icône FormPop.
3. Clique sur **⚡ Remplir le formulaire**.
4. Reclique : les données changent (tout est régénéré aléatoirement).

### Options (dans le popup)

- **Inclure des fichiers factices** : génère et injecte une image PNG ou un PDF de test dans les champs `<input type="file">`.
- **Textes longs** : remplit les champs texte génériques et les `<textarea>` avec des paragraphes (utile pour tester le responsive/overflow).
- **Cocher cases & radios** : sélectionne automatiquement des cases à cocher et boutons radio.

## Ce que ça gère

- Détection intelligente : prénom, nom, email, téléphone, mot de passe, adresse, ville, code postal, pays, entreprise, âge, site web, date, couleur, nombre/range, select, checkbox, radio, textarea.
- Compatible React / Vue / Angular : les valeurs sont injectées via les setters natifs du DOM puis les événements `input`/`change`/`blur` sont déclenchés, donc les frameworks réactifs détectent bien le changement.
- Fichiers factices générés à la volée (Blob → File), aucun fichier réel n'est stocké ni envoyé.

## Moteur de détection (v1.1)

FormPop ne fait plus un simple `regex.test()` par mot-clé. Chaque champ est comparé
à un dictionnaire de synonymes multilingues (FR/EN) par catégorie, avec :

- **Tokenisation intelligente** : `propertyName` → `property Name`, `nom_du_quartier` → `nom du quartier`.
- **Tolérance aux fautes de frappe** (distance de Levenshtein) sur les mots de 4+ lettres.
- **Attribut `autocomplete` standard** utilisé en priorité absolue quand il est présent (c'est l'info la plus fiable qui existe).
- **Filtrage des mots vides** (de, du, le, the, of...) pour éviter les faux positifs.
- Les synonymes à plusieurs mots (ex: "type de bien") n'accordent un score que si la phrase entière ou tous ses mots sont présents — jamais sur un seul mot générique partagé.

Ce n'est pas un réseau de neurones (ça nécessiterait de télécharger des poids
externes, ce qui casserait le "100% local"), mais un système de règles nettement
plus robuste qu'un simple `includes()`.

**Pour aller plus loin (embeddings réels) :** si tu veux un vrai matching sémantique
par IA, il faudrait embarquer un petit modèle (type MiniLM, ~25 Mo) via `transformers.js`,
en le téléchargeant toi-même depuis Hugging Face et en le plaçant dans un dossier
`models/` du projet — le code peut être adapté pour le détecter et l'utiliser
automatiquement s'il est présent, avec repli sur le moteur actuel sinon.

## Limites connues (V1)

- Ne remplit pas les champs à l'intérieur d'iframes cross-origin (restriction du navigateur).
- Ne gère pas les éléments `contenteditable` personnalisés (rich text editors type Quill/TipTap) — prévu pour une prochaine version.
- La détection de champ est basée sur des heuristiques (name/id/placeholder/label) — certains formulaires très custom peuvent nécessiter des ajustements.

## Confidentialité

FormPop ne fait aucun appel réseau. Toute la génération de données et de fichiers se fait localement dans le navigateur, dans le contexte de l'onglet actif (`activeTab`).

---

Fais par toi, pour toi ☕ — un lien vers le site officiel et une page de don (Ko-fi) sont dans le footer du popup ; remplace les URLs placeholder par les tiennes dans `popup.html` quand ton site sera prêt.
