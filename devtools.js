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
          
          // Nettoyer la visualisation des titres
          const headingsOverlay = document.getElementById('rgaa-headings-overlay');
          if (headingsOverlay) headingsOverlay.remove();
          
          const headings = document.querySelectorAll('[data-rgaa-heading-border]');
          headings.forEach(h => {
            h.style.outline = '';
            h.style.outlineOffset = '';
            h.removeAttribute('data-rgaa-heading-border');
          });
          
          if (window._rgaaHeadingsUpdate) {
            window.removeEventListener('scroll', window._rgaaHeadingsUpdate, true);
            window.removeEventListener('resize', window._rgaaHeadingsUpdate);
            delete window._rgaaHeadingsUpdate;
          }
          
          // Nettoyer la visualisation des landmarks
          const landmarksOverlay = document.getElementById('rgaa-landmarks-overlay');
          if (landmarksOverlay) landmarksOverlay.remove();
          
          const landmarks = document.querySelectorAll('[data-rgaa-landmark-border]');
          landmarks.forEach(l => {
            l.style.outline = '';
            l.style.outlineOffset = '';
            l.removeAttribute('data-rgaa-landmark-border');
          });
          
          if (window._rgaaLandmarksUpdate) {
            window.removeEventListener('scroll', window._rgaaLandmarksUpdate, true);
            window.removeEventListener('resize', window._rgaaLandmarksUpdate);
            delete window._rgaaLandmarksUpdate;
          }
          
          return { cleaned: true };
        })()
      `);
    });
  }
);
