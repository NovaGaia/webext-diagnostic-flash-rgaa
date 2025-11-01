// Création du panneau DevTools
chrome.devtools.panels.create(
  "Diagnostic Flash RGAA",
  "icons/icon-48.png", // Icône du panneau
  "panel.html",
  (panel) => {
    console.log("Panneau DevTools créé avec succès");
    
    // Détecter quand le panneau est caché/fermé
    panel.onShown.addListener((window) => {
      console.log("Panneau DevTools affiché");
    });
    
    panel.onHidden.addListener(() => {
      console.log("Panneau DevTools caché - nettoyage des indicateurs");
      // Nettoyer tous les indicateurs visuels quand le panneau est fermé
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
    });
  }
);
