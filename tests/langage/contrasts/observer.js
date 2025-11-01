// Variables pour gérer le MutationObserver d'auto-refresh
let contrastMutationObserver = null;
let contrastRefreshTimeout = null;
let currentContrastTestId = null;

/**
 * Démarrer le MutationObserver pour auto-refresh des contrastes
 * @param {string} testId - ID du test de contraste
 */
function startContrastMutationObserver(testId) {
  // Arrêter l'observer existant s'il y en a un
  stopContrastMutationObserver();
  
  currentContrastTestId = testId;
  
  // Injecter le MutationObserver dans la page inspectée
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      // Supprimer l'observer existant s'il y en a un
      if (window._rgaaContrastMutationObserver) {
        window._rgaaContrastMutationObserver.disconnect();
        window._rgaaContrastMutationObserver = null;
      }
      
      // Créer un nouvel observer
      const observer = new MutationObserver(function(mutations) {
        // Signaler qu'un changement a été détecté
        window._rgaaContrastDOMChanged = true;
        window._rgaaContrastLastChange = Date.now();
      });
      
      // Observer les changements du DOM
      // Observer les ajouts/suppressions d'éléments et les changements d'attributs (comme les classes)
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'] // Observer les changements de classes
      });
      
      window._rgaaContrastMutationObserver = observer;
      
      return { started: true };
    })()
  `, (result, isException) => {
    if (isException) {
      const errorMsg = isException.value || isException.description || isException.message || String(isException);
      console.error('[Contrasts] Erreur lors du démarrage du MutationObserver:', errorMsg);
    } else {
      console.log('[Contrasts] MutationObserver démarré pour auto-refresh');
      
      // Vérifier périodiquement les changements du DOM et relancer l'analyse si nécessaire
      const checkInterval = setInterval(() => {
        chrome.devtools.inspectedWindow.eval(`
          (function() {
            if (window._rgaaContrastDOMChanged && window._rgaaContrastLastChange) {
              const timeSinceChange = Date.now() - window._rgaaContrastLastChange;
              // Attendre 500ms après le dernier changement pour éviter trop de relances
              if (timeSinceChange >= 500) {
                window._rgaaContrastDOMChanged = false;
                return { changed: true };
              }
            }
            return { changed: false };
          })()
        `, (checkResult, checkException) => {
          if (!checkException && checkResult && checkResult.changed) {
            // Relancer l'analyse
            const wcagSelect = document.getElementById('contrast-wcag-level');
            const wcagLevel = wcagSelect ? wcagSelect.value : 'AA';
            
            // Utiliser currentContrastTestId pour être sûr que le testId est correct
            const testIdToUse = currentContrastTestId || testId;
            
            console.log('[Contrasts] Changement DOM détecté, re-analyse en cours...');
            
            analyzeContrasts(wcagLevel, (newResults) => {
              if (newResults && !newResults.error) {
                displayContrastAnalysis(testIdToUse, newResults, wcagLevel);
              }
            });
          }
        });
      }, 1000); // Vérifier toutes les secondes
      
      // Stocker l'interval ID pour pouvoir l'arrêter
      contrastRefreshTimeout = checkInterval;
    }
  });
}

/**
 * Arrêter le MutationObserver pour auto-refresh des contrastes
 */
function stopContrastMutationObserver() {
  // Arrêter l'interval de vérification
  if (contrastRefreshTimeout) {
    clearInterval(contrastRefreshTimeout);
    contrastRefreshTimeout = null;
  }
  
  // Arrêter l'observer dans la page inspectée
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      if (window._rgaaContrastMutationObserver) {
        window._rgaaContrastMutationObserver.disconnect();
        window._rgaaContrastMutationObserver = null;
      }
      window._rgaaContrastDOMChanged = false;
      window._rgaaContrastLastChange = null;
      return { stopped: true };
    })()
  `, (result, isException) => {
    if (isException) {
      const errorMsg = isException.value || isException.description || isException.message || String(isException);
      console.error('[Contrasts] Erreur lors de l\'arrêt du MutationObserver:', errorMsg);
    } else {
      console.log('[Contrasts] MutationObserver arrêté');
    }
  });
  
  currentContrastTestId = null;
}

