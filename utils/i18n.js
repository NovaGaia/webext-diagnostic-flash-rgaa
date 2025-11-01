// Système de traduction pour l'extension

// Langue par défaut
let currentLanguage = 'fr';

// Traductions
const translations = {
  fr: {
    // Catégories
    categoryNavigation: 'Navigation & utilisation',
    categoryLangage: 'Langage & interface',
    categoryStructuration: 'Structuration de l\'information',
    
    // Statistiques
    statsTotal: 'Total',
    statsPassed: 'Réussis',
    statsFailed: 'Échoués',
    statsReset: 'Réinitialiser tous les tests',
    
    // Messages généraux
    emptyState: 'Aucun test effectué pour cette catégorie',
    testsNotImplemented: '⚠️ Tests non implémentés',
    testsNotImplementedDesc: 'Les tests pour cette catégorie seront implémentés prochainement.',
    
    // Test: Responsive design
    testResponsiveDesignName: 'Le site est optimisé pour toutes les tailles d\'écran',
    testResponsiveDesignDesc: 'Vérification que le site est utilisable sur mobile (viewport 390 × 844 pixels)',
    testResponsiveDesignSimulate: 'Simuler mobile (390×844)',
    testResponsiveDesignCheckViewport: '🔍 Vérification en cours...',
    testResponsiveDesignCheckOverflow: '🔍 Vérification en cours...',
    testResponsiveDesignCheckElements: '🔍 Vérification en cours...',
    testResponsiveDesignViewportPresent: '✓ Meta viewport présente',
    testResponsiveDesignViewportMisconfigured: '✗ Meta viewport présente mais mal configurée',
    testResponsiveDesignViewportMissing: '✗ Meta viewport manquante',
    testResponsiveDesignNoOverflow: '✓ Pas de débordement horizontal détecté',
    testResponsiveDesignOverflowDetected: '⚠ Débordement horizontal possible (largeur: {width}px)',
    testResponsiveDesignNoInteractiveElements: '✓ Aucun élément interactif à vérifier',
    testResponsiveDesignAllAccessible: '✓ Tous les éléments interactifs sont accessibles ({count} éléments)',
    testResponsiveDesignSomeHidden: '⚠ Certains éléments peuvent être cachés ({hidden} sur {total})',
    testResponsiveDesignMobileInstructions: 'Pour tester le responsive design:\\n\\n1. Ouvrez les DevTools (F12)\\n2. Activez le mode "Device Toolbar" (Cmd+Shift+M / Ctrl+Shift+M)\\n3. Sélectionnez "iPhone 12 Pro" ou définissez 390 × 844 pixels\\n4. Vérifiez visuellement que le site reste utilisable\\n5. Cochez la case de validation dans le panneau Diagnostic Flash RGAA',
    testResponsiveDesignNameForStats: 'Le site est optimisé pour toutes les tailles d\'écran',
    
    // Test: Keyboard navigation
    testKeyboardNavigationName: 'La navigation et l\'utilisation du site peuvent s\'effectuer entièrement au clavier',
    testKeyboardNavigationDesc: 'Visualisation de l\'ordre de tabulation (TAB) pour vérifier la navigation au clavier',
    testKeyboardNavigationInfo: 'ℹ️ Activez la visualisation pour voir l\'ordre de tabulation des éléments interactifs',
    testKeyboardNavigationToggle: 'Activer la visualisation',
    testKeyboardNavigationToggleOff: 'Désactiver la visualisation',
    testKeyboardNavigationShowHidden: 'Afficher les éléments masqués',
    testKeyboardNavigationActive: 'Visualisation active',
    testKeyboardNavigationInactive: 'Visualisation désactivée',
    testKeyboardNavigationElementsFound: 'éléments interactifs trouvés',
    testKeyboardNavigationVisible: 'visibles',
    testKeyboardNavigationHidden: 'masqués en orange',
    testKeyboardNavigationHiddenNotDisplayed: 'éléments masqués non affichés',
    testKeyboardNavigationDisplayedCount: 'éléments affichés',
    testKeyboardNavigationTotalCount: 'sur {total} total',
    testKeyboardNavigationNameForStats: 'La navigation et l\'utilisation du site peuvent s\'effectuer entièrement au clavier',
    
    // Test: Two navigation means
    testTwoNavigationMeansName: 'Deux moyens de navigation sont présents',
    testTwoNavigationMeansDesc: 'Vérifiez manuellement que le site propose au moins deux moyens de navigation différents (menu, plan du site, moteur de recherche, fil d\'Ariane, etc.)',
    testTwoNavigationMeansInfo: 'ℹ️ Test à valider manuellement',
    testTwoNavigationMeansNameForStats: 'Deux moyens de navigation sont présents',
    
    // Test: Downloadable files
    testDownloadableFilesName: 'Les fichiers bureautiques téléchargeables sur le site sont proposés dans un format ouvert et sont accessibles',
    testDownloadableFilesDesc: 'Vérifiez que les fichiers téléchargeables (PDF, DOC, etc.) sont disponibles dans un format ouvert (ODT, ODS, PDF/A, HTML, etc.) et sont accessibles',
    testDownloadableFilesSearching: '🔍 Recherche des fichiers téléchargeables en cours...',
    testDownloadableFilesNone: 'Aucun fichier bureautique détecté sur la page',
    testDownloadableFilesFound: '📄 {count} fichier(s) bureautique(s) détecté(s)',
    testDownloadableFilesOpenFormat: ' ({openCount} en format ouvert: {formats})',
    testDownloadableFilesClosedFormat: ' - {closedCount} en format fermé: {formats}',
    testDownloadableFilesNameForStats: 'Les fichiers bureautiques téléchargeables sur le site sont proposés dans un format ouvert et sont accessibles',
    
    // Validation
    validationPassed: '✓ Réussi',
    validationFailed: '✗ Échoué',
    validationNotTested: 'Non testé',
    
    // Statuts
    statusPending: 'En attente de validation',
    statusPassed: 'Test réussi',
    statusFailed: 'Test échoué',
    statusWarning: 'Validé manuellement (certaines vérifications automatiques peuvent échouer)',
    
    // Erreurs
    errorPageAnalysis: 'Erreur lors de l\'analyse de la page',
    errorReset: 'Erreur lors de la réinitialisation',
    errorUnknown: 'Erreur inconnue',
    errorInjectedScript: 'Erreur dans le script injecté',
    errorVisualization: 'Erreur lors de la visualisation clavier',
    errorDetection: 'Erreur lors de la détection',
    errorCleanup: 'Erreur lors du nettoyage',
    errorMessageExtraction: 'Erreur lors de la gestion du message d erreur',
    
    // Titre du panneau
    panelTitle: 'Diagnostic Flash RGAA',
    panelInitialized: 'Panneau DevTools initialisé avec les catégories RGAA',
    
    // Warnings console
    warningTotalTestsNotFound: 'Élément totalTests non trouvé',
    warningPassedTestsNotFound: 'Élément passedTests non trouvé',
    warningFailedTestsNotFound: 'Élément failedTests non trouvé',
    warningInfoNotFound: 'Élément info non trouvé pour le test',
    
    // Documentation
    docShowDocumentation: 'Afficher la documentation',
    docHideDocumentation: 'Masquer la documentation',
    docHowToCheck: 'Comment contrôler ?',
    docHowToCheckContent: 'Contenu à définir',
    docHowToNavigateKeyboard: 'Comment navigue-t-on au clavier ?',
    docHowToNavigateKeyboardContent: 'Contenu à définir',
    docWhy: 'Pourquoi ?',
    docWhyContent: 'Contenu à définir',
    docRGAACriteria: 'Critère(s) RGAA concerné(s)',
    docRGAACriteriaContent: 'Contenu à définir',
  },
  
  en: {
    // Catégories
    categoryNavigation: 'Navigation & usage',
    categoryLangage: 'Language & interface',
    categoryStructuration: 'Information structure',
    
    // Statistiques
    statsTotal: 'Total',
    statsPassed: 'Passed',
    statsFailed: 'Failed',
    statsReset: 'Reset all tests',
    
    // Messages généraux
    emptyState: 'No tests performed for this category',
    testsNotImplemented: '⚠️ Tests not implemented',
    testsNotImplementedDesc: 'Tests for this category will be implemented soon.',
    
    // Test: Responsive design
    testResponsiveDesignName: 'The site is optimized for all screen sizes',
    testResponsiveDesignDesc: 'Verification that the site is usable on mobile (viewport 390 × 844 pixels)',
    testResponsiveDesignSimulate: 'Simulate mobile (390×844)',
    testResponsiveDesignCheckViewport: '🔍 Checking...',
    testResponsiveDesignCheckOverflow: '🔍 Checking...',
    testResponsiveDesignCheckElements: '🔍 Checking...',
    
    // Test: Keyboard navigation
    testKeyboardNavigationName: 'Site navigation and usage can be done entirely with the keyboard',
    testKeyboardNavigationDesc: 'Visualization of tab order (TAB) to check keyboard navigation',
    testKeyboardNavigationInfo: 'ℹ️ Activate visualization to see the tab order of interactive elements',
    testKeyboardNavigationToggle: 'Activate visualization',
    testKeyboardNavigationToggleOff: 'Deactivate visualization',
    testKeyboardNavigationShowHidden: 'Show hidden elements',
    testKeyboardNavigationActive: 'Visualization active',
    testKeyboardNavigationInactive: 'Visualization deactivated',
    testKeyboardNavigationElementsFound: 'interactive elements found',
    testKeyboardNavigationVisible: 'visible',
    testKeyboardNavigationHidden: 'hidden in orange',
    testKeyboardNavigationHiddenNotDisplayed: 'hidden elements not displayed',
    
    // Test: Two navigation means
    testTwoNavigationMeansName: 'Two navigation means are present',
    testTwoNavigationMeansDesc: 'Manually verify that the site offers at least two different navigation means (menu, sitemap, search engine, breadcrumb, etc.)',
    testTwoNavigationMeansInfo: 'ℹ️ Test to be manually validated',
    
    // Test: Downloadable files
    testDownloadableFilesName: 'Office files downloadable from the site are provided in an open format and are accessible',
    testDownloadableFilesDesc: 'Verify that downloadable files (PDF, DOC, etc.) are available in an open format (ODT, ODS, PDF/A, HTML, etc.) and are accessible',
    testDownloadableFilesSearching: '🔍 Searching for downloadable files...',
    testDownloadableFilesNone: 'No office files detected on the page',
    testDownloadableFilesFound: '📄 {count} office file(s) detected',
    testDownloadableFilesOpenFormat: ' ({openCount} in open format: {formats})',
    testDownloadableFilesClosedFormat: ' - {closedCount} in closed format: {formats}',
    
    // Validation
    validationPassed: '✓ Passed',
    validationFailed: '✗ Failed',
    validationNotTested: 'Not tested',
    
    // Statuts
    statusPending: 'Pending validation',
    statusPassed: 'Test passed',
    statusFailed: 'Test failed',
    statusWarning: 'Manually validated (some automatic checks may fail)',
    
    // Erreurs
    errorPageAnalysis: 'Error during page analysis',
    errorReset: 'Error during reset',
    errorUnknown: 'Unknown error',
    errorInjectedScript: 'Error in injected script',
    errorVisualization: 'Error during keyboard visualization',
    errorDetection: 'Error during detection',
    errorCleanup: 'Error during cleanup',
    errorMessageExtraction: 'Error during error message handling',
    
    // Titre du panneau
    panelTitle: 'RGAA Flash Diagnostic',
    panelInitialized: 'DevTools panel initialized with RGAA categories',
    
    // Warnings console
    warningTotalTestsNotFound: 'totalTests element not found',
    warningPassedTestsNotFound: 'passedTests element not found',
    warningFailedTestsNotFound: 'failedTests element not found',
    warningInfoNotFound: 'Info element not found for test',
    
    // Documentation
    docShowDocumentation: 'Show documentation',
    docHideDocumentation: 'Hide documentation',
    docHowToCheck: 'How to check?',
    docHowToCheckContent: 'Content to be defined',
    docHowToNavigateKeyboard: 'How to navigate with keyboard?',
    docHowToNavigateKeyboardContent: 'Content to be defined',
    docWhy: 'Why?',
    docWhyContent: 'Content to be defined',
    docRGAACriteria: 'RGAA criteria concerned',
    docRGAACriteriaContent: 'Content to be defined',
  }
};

/**
 * Récupère une traduction
 * @param {string} key - Clé de traduction
 * @param {object} params - Paramètres optionnels pour remplacer dans la chaîne
 * @returns {string} Texte traduit
 */
function t(key, params = {}) {
  const translation = translations[currentLanguage]?.[key] || translations.fr[key] || key;
  
  // Remplacer les paramètres dans la chaîne
  if (Object.keys(params).length > 0) {
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  }
  
  return translation;
}

/**
 * Définit la langue courante
 * @param {string} lang - Code de langue ('fr' ou 'en')
 */
function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
  }
}

/**
 * Récupère la langue courante
 * @returns {string} Code de langue
 */
function getLanguage() {
  return currentLanguage;
}

