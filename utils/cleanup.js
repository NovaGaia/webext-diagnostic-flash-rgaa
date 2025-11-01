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
      
      // Ajouter ici d'autres nettoyages pour les futurs tests avec indicateurs
      // Exemple: document.getElementById('rgaa-other-visualization')?.remove();
      
      return { cleaned: true };
    })()
  `);
}

