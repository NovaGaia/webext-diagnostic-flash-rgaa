/**
 * Afficher l'analyse des contrastes dans le panneau
 */
function displayContrastAnalysis(testId, results, wcagLevel = 'AA') {
  const resultsElement = document.getElementById(`test-${testId}-results`);
  if (!resultsElement) return;
  
  // Stocker le nombre total d'éléments masqués pour l'affichage du compteur
  // results.hidden est un objet groupé, donc on comptera après le traitement
  
  // Créer une liste plate avec taille séparée pour l'affichage
  const visibleRatios = [];
  const hiddenRatios = [];
  
  // Traiter les éléments visibles - créer une entrée par ratio ET par taille
  Object.keys(results.visible).forEach(ratioKey => {
    const ratioData = results.visible[ratioKey];
    
    // Si il y a des éléments small, créer une entrée
    if (ratioData.small && ratioData.small.length > 0) {
      visibleRatios.push({
        key: ratioKey,
        ratio: ratioData.ratio,
        size: 'small',
        elements: ratioData.small
      });
    }
    
    // Si il y a des éléments large, créer une entrée
    if (ratioData.large && ratioData.large.length > 0) {
      visibleRatios.push({
        key: ratioKey,
        ratio: ratioData.ratio,
        size: 'large',
        elements: ratioData.large
      });
    }
  });
  
  // Trier par ratio croissant
  visibleRatios.sort((a, b) => a.ratio - b.ratio);
  
  // Traiter les éléments masqués
  Object.keys(results.hidden).forEach(ratioKey => {
    const ratioData = results.hidden[ratioKey];
    
    if (ratioData.small && ratioData.small.length > 0) {
      hiddenRatios.push({
        key: ratioKey,
        ratio: ratioData.ratio,
        size: 'small',
        elements: ratioData.small
      });
    }
    
    if (ratioData.large && ratioData.large.length > 0) {
      hiddenRatios.push({
        key: ratioKey,
        ratio: ratioData.ratio,
        size: 'large',
        elements: ratioData.large
      });
    }
  });
  
  hiddenRatios.sort((a, b) => a.ratio - b.ratio);
  
  // Utiliser le compteur total d'éléments cachés depuis l'analyse (comme l'extension WCAG)
  // Ce compteur inclut TOUS les éléments cachés détectés, même ceux sans ratio valide
  const totalHiddenCount = results.totalHiddenCount || 0;
  console.log('[Contrasts] Total hidden elements count:', totalHiddenCount, 'from results.totalHiddenCount:', results.totalHiddenCount);
  
  // Fusionner les éléments NON-TEXTUELS visibles avec les éléments visibles (comme WCAG)
  // Les éléments non-textuels doivent être ajoutés à visibleRatios pour un affichage unifié
  if (results.nonText && results.nonText.visible) {
    Object.keys(results.nonText.visible).forEach(ratioKey => {
      const ratioData = results.nonText.visible[ratioKey];
      if (ratioData.elements && ratioData.elements.length > 0) {
        // Grouper tous les éléments non-textuels de ce ratio ensemble
        // Pour les non-textuels, on considère qu'ils sont "large" par défaut (1.4.11 = composants UI)
        const sizeKey = 'large';
        
        // Chercher si un ratio identique existe déjà avec size="large"
        let found = false;
        visibleRatios.forEach(vr => {
          if (Math.abs(vr.ratio - ratioData.ratio) < 0.01 && vr.size === sizeKey) {
            // Ajouter tous les éléments non-textuels à l'entrée existante
            ratioData.elements.forEach(el => {
              vr.elements.push({
                fgColor: el.color1,
                bgColor: el.color2,
                tag: el.element,
                type: el.type, // Garder le type pour distinguer
                isNonText: true
              });
            });
            found = true;
          }
        });
        
        if (!found) {
          // Créer une nouvelle entrée avec tous les éléments non-textuels de ce ratio
          visibleRatios.push({
            key: ratioKey,
            ratio: ratioData.ratio,
            size: sizeKey,
            elements: ratioData.elements.map(el => ({
              fgColor: el.color1,
              bgColor: el.color2,
              tag: el.element,
              type: el.type,
              isNonText: true
            }))
          });
        }
      }
    });
  }
  
  // Re-trier après l'ajout des éléments non-textuels
  visibleRatios.sort((a, b) => a.ratio - b.ratio);
  
  // Créer le HTML
  let html = `
    <div class="contrast-analysis">
      <div class="contrast-controls">
        <label class="control-label">
          <span>WCAG level:</span>
          <select id="contrast-wcag-level" class="control-select">
            <option value="AA" ${wcagLevel === 'AA' ? 'selected' : ''}>AA</option>
            <option value="AAA" ${wcagLevel === 'AAA' ? 'selected' : ''}>AAA</option>
          </select>
        </label>
        <label class="control-label">
          <span>Refresh on DOM updates:</span>
          <select id="contrast-auto-refresh" class="control-select">
            <option value="off">off</option>
            <option value="on">on</option>
          </select>
        </label>
        <button class="button-small" id="contrast-reanalyze" style="margin-left: 10px;">${t('testContrastsReanalyze')}</button>
      </div>
      
      <div class="contrast-sections">
        <div class="contrast-section">
          <h4 class="contrast-section-title">Visible elements</h4>
          <div class="contrast-table">
            <div class="contrast-table-header">
              <div class="contrast-col">Contrast</div>
              <div class="size-col">Size</div>
              <div class="elements-col">Elements</div>
            </div>
            <div class="contrast-table-body" id="contrast-visible-body">
              ${visibleRatios.length > 0 ? visibleRatios.map(item => {
                const ratio = item.ratio;
                const elements = item.elements;
                const size = item.size;
                
                // Vérifier s'il y a des éléments non-textuels dans ce groupe
                const hasNonText = elements.some(el => el.isNonText);
                const wcagLevelVal = wcagLevel === 'AA' ? 'AA' : 'AAA';
                
                // Pour les éléments non-textuels, utiliser meetsNonTextContrast
                // Pour les textuels, utiliser meetsWCAGAA/AAA selon la taille
                const meetsStandard = hasNonText 
                  ? meetsNonTextContrast(ratio)
                  : (wcagLevelVal === 'AA' 
                      ? meetsWCAGAA(ratio, size)
                      : meetsWCAGAAA(ratio, size));
                
                const avgFg = getAverageColor(elements, 'fg');
                const avgBg = getAverageColor(elements, 'bg');
                
                // Déterminer si c'est un élément non-textuel pour le data-attribute
                const isNonTextRow = hasNonText;
                
                return `
                  <div class="contrast-row" data-contrast-ratio="${ratio.toFixed(2)}" data-visible="true" data-size="${size}" data-nontext="${isNonTextRow ? 'true' : 'false'}" data-fg-color="${avgFg}" data-bg-color="${avgBg}" style="cursor: pointer;" title="Cliquer pour mettre en évidence les éléments dans la page">
                    <div class="contrast-col">
                      ${meetsStandard ? '<span class="check-icon">✓</span>' : '<span class="fail-icon">✗</span>'}
                      <span class="contrast-ratio">${ratio.toFixed(2)}</span>
                    </div>
                    <div class="size-col">
                      <span class="element-size">${size}</span>
                    </div>
                    <div class="elements-col">
                      ${createColorSwatch(avgFg).outerHTML}
                      ${createColorSwatch(avgBg).outerHTML}
                      <span class="element-info">
                        <span class="element-tags">${countTags(elements)}</span>
                      </span>
                    </div>
                  </div>
                `;
              }).join('') : '<div class="contrast-row"><div class="contrast-col" style="grid-column: 1 / -1; color: #999; padding: 20px; text-align: center;">Aucun élément visible détecté</div></div>'}
            </div>
          </div>
        </div>
        
        <div class="contrast-section">
          <h4 class="contrast-section-title">Hidden elements</h4>
          ${(() => {
            // Comme l'extension WCAG : afficher UNIQUEMENT un compteur pour les éléments cachés
            // Pas de tableau détaillé, car les éléments sont invisibles (pas importants)
            // Le totalHiddenCount inclut tous les éléments cachés (ceux avec ratio valide + ceux sans ratio)
            if (totalHiddenCount > 0) {
              return `<div style="padding: 10px 15px; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0; display: flex; align-items: center; gap: 6px;"><span style="opacity: 0.6;">👁</span><span>${totalHiddenCount} hidden elements (not reviewed)</span></div>`;
            }
            return '<div style="padding: 10px 15px; color: #999; font-size: 12px;">Aucun élément masqué détecté</div>';
          })()}
        </div>
        
      </div>
      
      <div class="contrast-summary">
        <div class="contrast-summary-title">Summary</div>
        <div class="contrast-summary-table">
          <div class="summary-row header">
            <div>Size</div>
            <div>Contrast</div>
            <div>AA</div>
            <div>AAA</div>
          </div>
          ${(() => {
            // Calculer les résumés pour small et large
            // La nouvelle structure est : results.visible[ratio] = { ratio, small: [], large: [] }
            const allRatios = [];
            
            // Collecter tous les ratios des éléments visibles
            Object.keys(results.visible || {}).forEach(ratioKey => {
              const ratioData = results.visible[ratioKey];
              if (ratioData.small && ratioData.small.length > 0) {
                allRatios.push({ ratio: ratioData.ratio, size: 'small' });
              }
              if (ratioData.large && ratioData.large.length > 0) {
                allRatios.push({ ratio: ratioData.ratio, size: 'large' });
              }
            });
            
            // Collecter tous les ratios des éléments masqués
            Object.keys(results.hidden || {}).forEach(ratioKey => {
              const ratioData = results.hidden[ratioKey];
              if (ratioData.small && ratioData.small.length > 0) {
                allRatios.push({ ratio: ratioData.ratio, size: 'small' });
              }
              if (ratioData.large && ratioData.large.length > 0) {
                allRatios.push({ ratio: ratioData.ratio, size: 'large' });
              }
            });
            
            // Trouver le ratio minimum pour small et large
            const smallRatios = allRatios.filter(item => item.size === 'small').map(item => item.ratio);
            const largeRatios = allRatios.filter(item => item.size === 'large').map(item => item.ratio);
            
            const minSmallRatio = smallRatios.length > 0 ? Math.min(...smallRatios) : null;
            const minLargeRatio = largeRatios.length > 0 ? Math.min(...largeRatios) : null;
            
            const smallMeetsAA = minSmallRatio !== null ? meetsWCAGAA(minSmallRatio, 'small') : null;
            const smallMeetsAAA = minSmallRatio !== null ? meetsWCAGAAA(minSmallRatio, 'small') : null;
            const largeMeetsAA = minLargeRatio !== null ? meetsWCAGAA(minLargeRatio, 'large') : null;
            const largeMeetsAAA = minLargeRatio !== null ? meetsWCAGAAA(minLargeRatio, 'large') : null;
            
            return `
              <div class="summary-row">
                <div>small</div>
                <div>${minSmallRatio !== null ? minSmallRatio.toFixed(2) : '-'}</div>
                <div>${smallMeetsAA !== null ? (smallMeetsAA ? '<span class="check-icon">✓</span>' : '<span class="fail-icon">✗</span>') : '-'}</div>
                <div>${smallMeetsAAA !== null ? (smallMeetsAAA ? '<span class="check-icon">✓</span>' : '<span class="fail-icon">✗</span>') : '-'}</div>
              </div>
              <div class="summary-row">
                <div>Large</div>
                <div>${minLargeRatio !== null ? minLargeRatio.toFixed(2) : '-'}</div>
                <div>${largeMeetsAA !== null ? (largeMeetsAA ? '<span class="check-icon">✓</span>' : '<span class="fail-icon">✗</span>') : '-'}</div>
                <div>${largeMeetsAAA !== null ? (largeMeetsAAA ? '<span class="check-icon">✓</span>' : '<span class="fail-icon">✗</span>') : '-'}</div>
              </div>
            `;
          })()}
        </div>
      </div>
    </div>
  `;
  
  resultsElement.innerHTML = html;
  
  // Ajouter les écouteurs
  const wcagSelect = document.getElementById('contrast-wcag-level');
  if (wcagSelect) {
    wcagSelect.addEventListener('change', () => {
      // Nettoyer les visualisations avant de re-analyser
      cleanupContrastHighlighting();
      // Re-analyser avec le nouveau niveau
      analyzeContrasts(wcagSelect.value, (newResults) => {
        displayContrastAnalysis(testId, newResults, wcagSelect.value);
      });
    });
  }
  
  // Écouteur pour l'auto-refresh (Refresh on DOM updates)
  const autoRefreshSelect = document.getElementById('contrast-auto-refresh');
  if (autoRefreshSelect) {
    autoRefreshSelect.addEventListener('change', () => {
      const isEnabled = autoRefreshSelect.value === 'on';
      if (isEnabled) {
        startContrastMutationObserver(testId);
      } else {
        stopContrastMutationObserver();
      }
    });
    
    // Si l'auto-refresh est activé par défaut, le démarrer
    if (autoRefreshSelect.value === 'on') {
      startContrastMutationObserver(testId);
    }
  }
  
  // Écouteur pour le bouton de relance
  const reanalyzeBtn = document.getElementById('contrast-reanalyze');
  if (reanalyzeBtn) {
    reanalyzeBtn.addEventListener('click', () => {
      reanalyzeBtn.textContent = t('testContrastsAnalyzing');
      reanalyzeBtn.disabled = true;
      
      // Nettoyer les visualisations avant de re-analyser
      cleanupContrastHighlighting();
      
      // Re-analyser avec le niveau WCAG actuel
      analyzeContrasts(wcagLevel, (newResults) => {
        reanalyzeBtn.disabled = false;
        reanalyzeBtn.textContent = t('testContrastsReanalyze');
        
        if (newResults && !newResults.error) {
          displayContrastAnalysis(testId, newResults, wcagLevel);
        } else if (newResults && newResults.error) {
          console.error('[Contrasts] Erreur lors de la re-analyse:', newResults.error);
        }
      });
    });
  }
  
  // Ajouter les écouteurs de clic sur les lignes (avec délai pour s'assurer que le DOM est prêt)
  setTimeout(() => {
    document.querySelectorAll('.contrast-row[data-contrast-ratio]').forEach(row => {
      row.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const ratio = row.getAttribute('data-contrast-ratio');
        const isVisible = row.getAttribute('data-visible') === 'true';
        const isNonText = row.getAttribute('data-nontext') === 'true';
        
        // Si la ligne est déjà active (highlighted), désactiver
        if (row.classList.contains('highlight-active')) {
          cleanupContrastHighlighting();
          row.classList.remove('highlight-active');
          document.querySelectorAll('.contrast-row').forEach(r => r.classList.remove('highlight-active'));
        } else {
          // Désactiver toutes les autres lignes
          document.querySelectorAll('.contrast-row').forEach(r => {
            r.classList.remove('highlight-active');
          });
          // Activer cette ligne
          row.classList.add('highlight-active');
          
          if (isNonText) {
            // Pour les éléments non-textuels (1.4.11)
            const color1 = row.getAttribute('data-color1');
            const color2 = row.getAttribute('data-color2');
            console.log('[Contrasts] Clic sur ligne non-textuelle:', { ratio, isVisible, color1, color2 });
            highlightNonTextElements(ratio, isVisible, color1, color2);
          } else {
            // Pour les éléments textuels (1.4.3 / 1.4.6)
            const size = row.getAttribute('data-size');
            const fgColor = row.getAttribute('data-fg-color');
            const bgColor = row.getAttribute('data-bg-color');
            console.log('[Contrasts] Clic sur ligne textuelle:', { ratio, isVisible, size, fgColor, bgColor });
            highlightContrastElements(ratio, isVisible, size, fgColor, bgColor);
          }
        }
      });
    });
    
    console.log(`[Contrasts] ${document.querySelectorAll('.contrast-row[data-contrast-ratio]').length} lignes de contraste initialisées`);
  }, 100);
}
