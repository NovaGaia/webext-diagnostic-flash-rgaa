# webext-dagnostic-flash-rgaa

Une extension navigateur pour réaliser les diagnostics flash d'accessibilité RGAA.

## 🚀 Installation pour le développement

### Prérequis
- Chrome ou Firefox (version récente)
- Node.js (optionnel, pour la gestion du projet)

### Installation dans Chrome

1. Ouvrez Chrome et allez dans `chrome://extensions/`
2. Activez le "Mode développeur" (en haut à droite)
3. Cliquez sur "Charger l'extension non empaquetée"
4. Sélectionnez le dossier du projet
5. L'extension devrait maintenant apparaître dans la liste

### Installation dans Firefox

1. Ouvrez Firefox et allez dans `about:debugging`
2. Cliquez sur "Ce Firefox" dans le menu de gauche
3. Cliquez sur "Charger un module complémentaire temporaire"
4. Naviguez jusqu'au dossier du projet et sélectionnez le fichier `manifest.json`
5. L'extension devrait maintenant être chargée

### Utilisation

1. Ouvrez n'importe quelle page web
2. Ouvrez les DevTools (F12 ou Cmd+Option+I / Ctrl+Shift+I)
3. Vous devriez voir un nouvel onglet "Diagnostic Flash RGAA" dans les DevTools
4. Cliquez dessus pour voir le panneau de l'extension

## 📁 Structure du projet

```
.
├── manifest.json          # Configuration de l'extension (Manifest V3)
├── background.js          # Service worker de l'extension
├── devtools.html          # Point d'entrée pour les DevTools
├── devtools.js            # Script de création du panneau DevTools
├── panel.html             # Interface du panneau DevTools
├── panel.js               # Logique du panneau DevTools
├── icons/                 # Icônes de l'extension (à créer)
└── README.md              # Ce fichier
```

## 🎨 Création des icônes

Les icônes sont requises pour que l'extension fonctionne correctement. Deux options :

### Option 1 : Utiliser le manifest sans icônes (pour tester rapidement)

Renommez temporairement les fichiers :
```bash
mv manifest.json manifest-with-icons.json
mv manifest-no-icons.json manifest.json
```

### Option 2 : Générer des icônes

1. **Avec ImageMagick** (si installé) :
   ```bash
   npm run generate-icons
   ```

2. **Manuellement** : Créez des images PNG de :
   - `icon-16.png` (16x16 pixels)
   - `icon-48.png` (48x48 pixels)
   - `icon-128.png` (128x128 pixels)
   
   Placez-les dans le dossier `icons/`

## 🔧 Développement

Le projet utilise JavaScript vanilla et est compatible avec Manifest V3, ce qui permet un fonctionnement sur Chrome et Firefox.

### Scripts disponibles

```bash
# Créer un package de l'extension
npm run package
```

## 📝 Notes

- L'extension utilise Manifest V3 pour la compatibilité avec Chrome et Firefox
- Le panneau DevTools permet d'analyser la page courante
- Les futures fonctionnalités d'analyse seront implémentées dans `panel.js`

## 🐛 Dépannage

Si l'extension ne s'affiche pas dans les DevTools :
1. Vérifiez la console pour les erreurs (Console des DevTools)
2. Assurez-vous que les fichiers sont correctement chargés
3. Rechargez l'extension dans `chrome://extensions/` ou `about:debugging`
4. Vérifiez que les icônes existent (ou commentez-les dans le manifest)

## 📄 Licence

Voir le fichier LICENSE pour plus d'informations.