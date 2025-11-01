// Fonctions de nettoyage des visualisations

// Fonction générique pour nettoyer tous les indicateurs visuels
function cleanupAllVisualizations() {
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      // Nettoyer la visualisation clavier
      if (window._rgaaKeyboardUpdate) {
        window.removeEventListener('scroll', window._rgaaKeyboardUpdate, true);
        window.removeEventListener('resize', window._rgaaKeyboardUpdate);
        delete window._rgaaKeyboardUpdate;
      }
      if (window._rgaaKeyboardDrawLines) {
        delete window._rgaaKeyboardDrawLines;
      }
      
      // Supprimer tous les overlays et SVG des visualisations
      const overlay = document.getElementById('rgaa-keyboard-overlay');
      const svg = document.getElementById('rgaa-keyboard-svg');
      if (overlay) overlay.remove();
      if (svg) svg.remove();
      
      // Nettoyer la mise en évidence des contrastes
      const highlighted = document.querySelectorAll('[data-contrast-highlight]');
      highlighted.forEach(el => {
        el.style.outline = '';
        el.style.outlineOffset = '';
        el.removeAttribute('data-contrast-highlight');
      });
      
      return { cleaned: true };
    })()
  `, (result, isException) => {
    if (isException) {
      console.error('Erreur lors du nettoyage:', isException);
    }
  });
  
  // Retirer les classes highlight-active des lignes de contraste dans le panneau
  if (typeof document !== 'undefined') {
    setTimeout(() => {
      document.querySelectorAll('.contrast-row.highlight-active').forEach(row => {
        row.classList.remove('highlight-active');
      });
    }, 100);
  }
  
  // Arrêter le MutationObserver des contrastes s'il est actif
  if (typeof stopContrastMutationObserver === 'function') {
    stopContrastMutationObserver();
  }
}

