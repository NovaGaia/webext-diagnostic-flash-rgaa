# 🚀 Démarrage rapide

## Installation immédiate (sans icônes)

L'extension est prête à être testée ! Suivez ces étapes :

### Chrome

1. Ouvrez `chrome://extensions/`
2. Activez le **Mode développeur** (toggle en haut à droite)
3. Cliquez sur **Charger l'extension non empaquetée**
4. Sélectionnez ce dossier du projet
5. ✅ L'extension est chargée !

### Firefox

1. Ouvrez `about:debugging`
2. Cliquez sur **Ce Firefox** dans le menu de gauche
3. Cliquez sur **Charger un module complémentaire temporaire**
4. Naviguez jusqu'à ce dossier et sélectionnez `manifest.json`
5. ✅ L'extension est chargée !

## Tester l'extension

1. Ouvrez n'importe quelle page web (ex: https://example.com)
2. Ouvrez les **DevTools** (F12 ou Cmd+Option+I / Ctrl+Shift+I)
3. Cherchez l'onglet **"Diagnostic Flash RGAA"** dans les DevTools
4. Cliquez dessus pour voir le panneau de l'extension
5. Cliquez sur le bouton **"Analyser la page"** pour tester

## Notes

- Les icônes sont optionnelles pour le moment (l'extension fonctionne sans)
- Pour ajouter des icônes plus tard, voir le README.md
- Le panneau DevTools s'affichera même sans icônes (il utilisera l'icône par défaut du navigateur)

## Prochaines étapes

- Implémenter les analyses d'accessibilité dans `panel.js`
- Ajouter des icônes personnalisées
- Configurer le contenu script pour analyser la page
