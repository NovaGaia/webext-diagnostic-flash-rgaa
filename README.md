# Diagnostic Flash RGAA - Extension Navigateur

Extension Chrome et Firefox pour réaliser les diagnostics flash d'accessibilité selon le référentiel RGAA.

## Installation

### Développement

1. Cloner le dépôt
2. Charger l'extension non empaquetée dans Chrome/Firefox :
   - **Chrome** : `chrome://extensions/` → Mode développeur → Charger l'extension non empaquetée
   - **Firefox** : `about:debugging` → Ce Firefox → Charger un module complémentaire temporaire

### Production

Générer le package :

```bash
npm run package
```

Cela créera un fichier `extension.zip` contenant l'extension prête à être publiée.

## Génération des icônes

Générer les icônes depuis un fichier SVG source :

```bash
npm run generate-icons
```

## Versioning

La version de l'extension est gérée dans `manifest.json` et `package.json`. La version s'affiche automatiquement dans l'interface du panneau DevTools.

### Mise à jour de la version

Pour mettre à jour la version, modifier le champ `version` dans :
- `manifest.json`
- `package.json`

Le format utilisé est le [Semantic Versioning](https://semver.org/) : `MAJOR.MINOR.PATCH`

Exemples :
- `1.0.0` : Version initiale
- `1.1.0` : Nouvelle fonctionnalité (minor)
- `1.1.1` : Correction de bug (patch)
- `2.0.0` : Changement majeur (major)

## Structure du projet

```
.
├── manifest.json          # Manifest de l'extension (Manifest V3)
├── package.json          # Configuration Node.js et scripts
├── background.js         # Service worker (background)
├── devtools.html         # Page d'entrée DevTools
├── devtools.js           # Création du panneau DevTools
├── panel.html            # Interface du panneau DevTools
├── panel.js              # Orchestration principale
├── utils/                # Utilitaires
│   ├── i18n.js          # Système de traduction
│   ├── ui.js            # Fonctions UI
│   ├── stats.js         # Gestion des statistiques
│   └── cleanup.js       # Nettoyage des visualisations
└── tests/               # Tests d'accessibilité
    ├── navigation/      # Tests de navigation
    ├── langage/        # Tests de langage & interface
    └── structuration/  # Tests de structuration
```

## Tests d'accessibilité

L'extension vérifie plusieurs critères d'accessibilité :

### Navigation & utilisation
- Le site est optimisé pour toutes les tailles d'écran
- La navigation et l'utilisation du site peuvent s'effectuer entièrement au clavier
- Deux moyens de navigation sont présents
- Les fichiers bureautiques téléchargeables sont proposés dans un format ouvert

### Langage & interface
- Les contrastes sont suffisants (beta)
- Aucune information n'est véhiculée uniquement par la couleur
- Les images, les vidéos et les fichiers audio ont une alternative textuelle
- La langue principale du site est bien définie
- Les liens sont explicites
- Le contenu reste lisible à 200% de la taille par défaut
- Les animations, clignotements et sons sont contrôlables

### Structuration de l'information
- Le titre de la page est unique et pertinent
- La hiérarchie des titres est complète et cohérente (beta)
- Chaque champ de formulaire est clairement associé à son intitulé
- Les informations relatives aux fichiers proposés en téléchargement sont indiquées

## Utilisation

1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet "Diagnostic Flash RGAA"
3. Les tests s'exécutent automatiquement au chargement
4. Valider manuellement chaque test selon les critères RGAA

## Licence

MIT
