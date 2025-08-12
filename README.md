Recipe Browser — prêt pour GitHub Pages
======================================

Contenu
-------
Ce dépôt statique contient:
- `index.html` — page principale (React via CDN + Babel)
- `app.js` — application React (JSX, chargé et transpilé dans le navigateur)
- `styles.css` — styles simples
- `recipes.json` — vos recettes extraites du fichier importé
- `README.md` — ceci

Déployer sur GitHub Pages
-------------------------
1. Créez un nouveau dépôt GitHub (ex: `recipe-browser`).
2. Poussez tous les fichiers du dossier `recipe-browser-ghpages` au dépôt (`main` branch).
3. Dans les settings du dépôt → Pages, choisissez la branche `main` et le dossier `/` (root).
4. Enregistrez — GitHub Pages publiera votre app (URL: `https://<votre-username>.github.io/<repo>/`).

Notes
-----
- L'app utilise `fetch('recipes.json')` pour charger les recettes. Assurez-vous que `recipes.json` est présent à la racine du site.
- Le projet est volontairement sans build system pour un déploiement facile sur GitHub Pages. Pour production (meilleure performance), vous pouvez transformer en projet Vite/CRA et faire un build.
