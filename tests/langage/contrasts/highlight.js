/**
 * Nettoyer toutes les mises en évidence de contraste
 */
function cleanupContrastHighlighting() {
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      const highlighted = document.querySelectorAll('[data-contrast-highlight]');
      highlighted.forEach(el => {
        el.style.removeProperty('outline');
        el.style.removeProperty('outline-offset');
        el.style.removeProperty('z-index');
        el.removeAttribute('data-contrast-highlight');
      });
      return { cleaned: highlighted.length };
    })()
  `, (result, isException) => {
    if (isException) {
      const errorMsg = isException.value || isException.description || isException.message || String(isException);
      console.error('[Contrasts] Erreur lors du nettoyage:', errorMsg);
    } else if (result && result.cleaned !== undefined) {
      console.log(`[Contrasts] ${result.cleaned} éléments nettoyés`);
    }
  });
}

/**
 * Mettre en évidence les éléments correspondant à un ratio de contraste
 */
function highlightContrastElements(ratio, isVisible, size, fgColor, bgColor) {
  chrome.devtools.inspectedWindow.eval(`
    (function(ratio, isVisible, size, fgColor, bgColor) {
      // Convertir hex en rgb pour comparaison
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };
      
      const rgbToHex = (rgbStr) => {
        if (!rgbStr) return null;
        if (rgbStr.startsWith('#')) return rgbStr.toLowerCase();
        const match = rgbStr.match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\)/);
        if (match) {
          const r = parseInt(match[1]);
          const g = parseInt(match[2]);
          const b = parseInt(match[3]);
          return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('');
        }
        return null;
      };
      
      const getLuminance = (r, g, b) => {
        const [rs, gs, bs] = [r, g, b].map(val => {
          val = val / 255;
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };
      
      const calculateContrastRatio = (color1, color2) => {
        const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
        const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;
        if (!rgb1 || !rgb2) {
          return 0;
        }
        
        try {
          const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
          const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
          
          const lighter = Math.max(lum1, lum2);
          const darker = Math.min(lum1, lum2);
          
          if (darker === 0) return 21; // Maximum contrast
          
          return (lighter + 0.05) / (darker + 0.05);
        } catch (e) {
          console.warn('Erreur calcul luminance:', e, color1, color2);
          return 0;
        }
      };
      
      const getForegroundColor = (element) => {
        const style = window.getComputedStyle(element);
        return rgbToHex(style.color);
      };
      
      const getBackgroundColor = (element) => {
        let el = element;
        const visited = new Set();
        
        while (el && el !== document.documentElement && !visited.has(el)) {
          visited.add(el);
          const style = window.getComputedStyle(el);
          const bgColor = style.backgroundColor;
          
          const rgbaMatch = bgColor.match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\)/);
          
          if (rgbaMatch) {
            const r = parseInt(rgbaMatch[1]);
            const g = parseInt(rgbaMatch[2]);
            const b = parseInt(rgbaMatch[3]);
            const alpha = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
            
            if (alpha > 0.5 && (r > 0 || g > 0 || b > 0)) {
              const hex = rgbToHex(bgColor);
              if (hex && hex !== '#000000') {
                return hex;
              }
            }
          } else if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'rgb(0, 0, 0)') {
            const hex = rgbToHex(bgColor);
            if (hex && hex !== '#000000') {
              return hex;
            }
          }
          
          el = el.parentElement;
        }
        
        if (document.body) {
          const bodyStyle = window.getComputedStyle(document.body);
          const bodyBg = bodyStyle.backgroundColor;
          const hex = rgbToHex(bodyBg);
          if (hex && hex !== '#000000' && bodyBg !== 'transparent' && bodyBg !== 'rgba(0, 0, 0, 0)') {
            return hex;
          }
        }
        
        return '#FFFFFF';
      };
      
      const isElementVisible = (element) => {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               parseFloat(style.opacity) > 0 &&
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
      };
      
      // Déterminer si un élément est "large" selon WCAG
      const isLarge = (element) => {
        const style = window.getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = parseFloat(style.fontWeight) || 400;
        return fontSize >= 18.66 || (fontSize >= 14 && fontWeight >= 700);
      };
      
      const targetRatio = parseFloat(ratio);
      const targetFg = fgColor.toLowerCase();
      const targetBg = bgColor.toLowerCase();
      const shouldShowVisible = isVisible === true || isVisible === 'true';
      
      let highlightedCount = 0;
      let errorCount = 0;
      let firstElement = null;
      
      // Tags qui peuvent contenir directement du texte
      const textTags = ['p', 'span', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 'label', 'button', 'code', 'strong', 'em', 'abbr', 'cite', 'time', 'dfn', 'dt', 'dd', 'sup', 'sub', 'small', 'mark', 'del', 'ins', 'b', 'i', 'u', 's'];
      // Tags conteneurs qu'on ignore systématiquement
      const containerTags = ['div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'form', 'figure'];
      
      // Parcourir tous les éléments EN ORDRE INVERSÉ (du plus profond au moins profond)
      // Cela permet de traiter d'abord les enfants, puis de vérifier les parents
      const allElements = Array.from(document.querySelectorAll('*'));
      
      // Inverser l'ordre pour traiter les éléments les plus profonds en premier
      allElements.reverse();
      
      // Set pour suivre les éléments qui doivent être mis en évidence
      const elementsToHighlight = new Set();
      
      try {
        allElements.forEach(element => {
          try {
            const tagName = element.tagName.toLowerCase();
            if (['html', 'head', 'script', 'style', 'noscript', 'meta', 'link', 'title'].includes(tagName)) {
              return;
            }
            
            if (!element.textContent || element.textContent.trim().length === 0) {
              return;
            }
            
            const visible = isElementVisible(element);
            if ((shouldShowVisible && !visible) || (!shouldShowVisible && visible)) {
              return;
            }
            
            // Vérifier la taille de l'élément
            const elementSize = isLarge(element) ? 'large' : 'small';
            if (size && elementSize !== size) {
              return;
            }
            
            const elFgColor = getForegroundColor(element);
            const elBgColor = getBackgroundColor(element);
            
            if (!elFgColor || !elBgColor) return;
            
            // Calculer le ratio pour cet élément
            try {
              const elRatio = calculateContrastRatio(elFgColor, elBgColor);
              if (elRatio > 0) {
                const ratioDiff = Math.abs(elRatio - targetRatio);
                if (ratioDiff < 0.01) {
                  // EXCLURE les conteneurs (div, nav, header, footer, etc.) SAUF s'ils ont du texte direct sans enfants textuels
                  if (containerTags.includes(tagName)) {
                    // Vérifier si le conteneur a des enfants qui sont des éléments textuels
                    const hasTextChildren = Array.from(element.children).some(child => {
                      const childTag = child.tagName.toLowerCase();
                      return textTags.includes(childTag) && child.textContent && child.textContent.trim().length > 0;
                    });
                    
                    // Si le conteneur a des enfants textuels, l'exclure (les enfants seront traités)
                    if (hasTextChildren) {
                      return;
                    }
                    
                    // Vérifier s'il y a du texte direct dans le conteneur
                    const hasDirectText = Array.from(element.childNodes).some(node => 
                      node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
                    );
                    
                    // Si pas de texte direct, exclure le conteneur
                    if (!hasDirectText) {
                      return;
                    }
                  }
                  
                  // Vérifier si cet élément a des descendants directs (enfants) qui correspondent aussi
                  // Si oui, ne pas mettre en évidence le parent pour éviter les doublons
                  const hasMatchingChildren = Array.from(element.children).some(child => {
                    // Vérifier si l'enfant est déjà dans le set
                    if (elementsToHighlight.has(child)) {
                      return true;
                    }
                    // Vérifier si l'enfant correspond aussi au ratio
                    try {
                      const childVisible = isElementVisible(child);
                      if ((shouldShowVisible && !childVisible) || (!shouldShowVisible && childVisible)) {
                        return false;
                      }
                      const childSize = isLarge(child) ? 'large' : 'small';
                      if (size && childSize !== size) {
                        return false;
                      }
                      const childFg = getForegroundColor(child);
                      const childBg = getBackgroundColor(child);
                      if (!childFg || !childBg) return false;
                      const childRatio = calculateContrastRatio(childFg, childBg);
                      const childRatioDiff = Math.abs(childRatio - targetRatio);
                      
                      // Si l'enfant correspond ET qu'il contient du texte significatif
                      if (childRatioDiff < 0.01 && child.textContent && child.textContent.trim().length > 0) {
                        // Vérifier que l'enfant est un élément textuel ou a du texte direct
                        const childTag = child.tagName.toLowerCase();
                        const textTags = ['p', 'span', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 'label', 'button', 'code', 'strong', 'em', 'abbr', 'cite', 'time', 'dfn', 'dt', 'dd', 'sup', 'sub'];
                        const hasDirectText = Array.from(child.childNodes).some(node => 
                          node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
                        );
                        
                        // Si c'est un tag textuel ou a du texte direct, c'est un enfant pertinent
                        return textTags.includes(childTag) || hasDirectText;
                      }
                      return false;
                    } catch (e) {
                      return false;
                    }
                  });
                  
                  // Ne pas mettre en évidence le parent si un de ses enfants directs correspond
                  // Cela évite d'avoir des bordures sur les conteneurs
                  if (!hasMatchingChildren) {
                    elementsToHighlight.add(element);
                  }
                }
              }
            } catch (e) {
              errorCount++;
            }
          } catch (e) {
            errorCount++;
          }
        });
        
        // Maintenant mettre en évidence tous les éléments sélectionnés
        elementsToHighlight.forEach(element => {
          try {
            element.style.setProperty('outline', '2px solid #f44336', 'important');
            element.style.setProperty('outline-offset', '2px', 'important');
            element.style.setProperty('z-index', '999999', 'important');
            element.setAttribute('data-contrast-highlight', 'true');
            highlightedCount++;
            
            // Garder une référence au premier élément pour le scroll
            if (!firstElement) {
              firstElement = element;
            }
          } catch (e) {
            errorCount++;
          }
        });
      } catch (e) {
        return { 
          highlighted: highlightedCount, 
          error: String(e),
          errorCount: errorCount,
          firstElement: null
        };
      }
      
      // Retourner l'ID ou une référence au premier élément pour le scroll
      let firstElementId = null;
      if (firstElement) {
        // Créer un ID unique si l'élément n'en a pas
        if (!firstElement.id) {
          firstElement.id = 'rgaa-contrast-first-' + Date.now();
        }
        firstElementId = firstElement.id;
      }
      
      return { 
        highlighted: highlightedCount,
        errorCount: errorCount,
        firstElementId: firstElementId
      };
    })(${JSON.stringify(ratio)}, ${JSON.stringify(isVisible)}, ${JSON.stringify(size)}, ${JSON.stringify(fgColor)}, ${JSON.stringify(bgColor)})
  `, (result, isException) => {
    if (isException) {
      // isException peut être un objet avec des propriétés value, description, etc.
      const errorMsg = isException.value || isException.description || isException.message || String(isException);
      console.error('[Contrasts] Erreur lors de la mise en évidence:', errorMsg);
      console.error('[Contrasts] Détails de l\'erreur:', isException);
    } else if (result && result.highlighted !== undefined) {
      console.log(`[Contrasts] ${result.highlighted} éléments mis en évidence`);
      
      // Faire scroller vers le premier élément
      if (result.firstElementId) {
        chrome.devtools.inspectedWindow.eval(`
          (function(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
              // Calculer la position avec un offset pour ne pas coller en haut
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
              const offsetPosition = elementPosition - 100; // 100px depuis le haut
              
              // Scroller en douceur
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
              
              return { scrolled: true, elementId: elementId };
            }
            return { scrolled: false, reason: 'Element not found' };
          })(${JSON.stringify(result.firstElementId)})
        `, (scrollResult, scrollException) => {
          if (scrollException) {
            console.warn('[Contrasts] Erreur lors du scroll:', scrollException);
          } else if (scrollResult && scrollResult.scrolled) {
            console.log('[Contrasts] Page scrollée vers le premier élément');
          }
        });
      }
    } else {
      console.warn('[Contrasts] Résultat inattendu:', result);
    }
  });
}

/**
 * Mettre en évidence les éléments non-textuels correspondant à un ratio de contraste (1.4.11)
 */
function highlightNonTextElements(ratio, isVisible, color1, color2) {
  chrome.devtools.inspectedWindow.eval(`
    (function(ratio, isVisible, color1, color2) {
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };
      
      const rgbToHex = (rgbStr) => {
        if (!rgbStr) return null;
        if (rgbStr.startsWith('#')) return rgbStr.toLowerCase();
        const match = rgbStr.match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\)/);
        if (match) {
          const r = parseInt(match[1]);
          const g = parseInt(match[2]);
          const b = parseInt(match[3]);
          return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('');
        }
        return null;
      };
      
      const getLuminance = (r, g, b) => {
        const [rs, gs, bs] = [r, g, b].map(val => {
          val = val / 255;
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };
      
      const calculateContrastRatio = (color1, color2) => {
        const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
        const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;
        if (!rgb1 || !rgb2) return 0;
        try {
          const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
          const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
          const lighter = Math.max(lum1, lum2);
          const darker = Math.min(lum1, lum2);
          if (darker === 0) return 21;
          return (lighter + 0.05) / (darker + 0.05);
        } catch (e) {
          return 0;
        }
      };
      
      const getBackgroundColor = (element) => {
        let el = element;
        const visited = new Set();
        while (el && el !== document.documentElement && !visited.has(el)) {
          visited.add(el);
          const style = window.getComputedStyle(el);
          const bgColor = style.backgroundColor;
          const rgbaMatch = bgColor.match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\)/);
          if (rgbaMatch) {
            const r = parseInt(rgbaMatch[1]);
            const g = parseInt(rgbaMatch[2]);
            const b = parseInt(rgbaMatch[3]);
            const alpha = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
            if (alpha > 0.1 && (r > 0 || g > 0 || b > 0)) {
              const hex = rgbToHex(bgColor);
              if (hex && hex !== '#000000') return hex;
            }
          } else if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'rgb(0, 0, 0)') {
            const hex = rgbToHex(bgColor);
            if (hex && hex !== '#000000') return hex;
          }
          el = el.parentElement;
        }
        if (document.body) {
          const bodyStyle = window.getComputedStyle(document.body);
          const bodyBg = bodyStyle.backgroundColor;
          const hex = rgbToHex(bodyBg);
          if (hex && hex !== '#000000' && bodyBg !== 'transparent' && bodyBg !== 'rgba(0, 0, 0, 0)') {
            return hex;
          }
        }
        return '#FFFFFF';
      };
      
      const getBorderColor = (element) => {
        const style = window.getComputedStyle(element);
        const borderColor = style.borderColor || style.borderTopColor;
        if (!borderColor || borderColor === 'transparent' || borderColor === 'rgba(0, 0, 0, 0)') return null;
        const borderWidth = parseFloat(style.borderWidth) || parseFloat(style.borderTopWidth) || 0;
        if (borderWidth <= 0) return null;
        return rgbToHex(borderColor);
      };
      
      const isElementVisible = (element) => {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               parseFloat(style.opacity) > 0 &&
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
      };
      
      const isInteractiveComponent = (element) => {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        return tagName === 'button' || 
               tagName === 'input' || 
               tagName === 'select' || 
               tagName === 'textarea' || 
               (tagName === 'a' && element.hasAttribute('href')) ||
               role === 'button' || 
               role === 'checkbox' || 
               role === 'radio' || 
               role === 'switch' ||
               role === 'tab' ||
               element.hasAttribute('tabindex');
      };
      
      const targetRatio = parseFloat(ratio);
      const shouldShowVisible = isVisible === true || isVisible === 'true';
      let highlightedCount = 0;
      let firstElement = null;
      
      // Parcourir tous les éléments
      const allElements = Array.from(document.querySelectorAll('*'));
      
      try {
        allElements.forEach(element => {
          try {
            const tagName = element.tagName.toLowerCase();
            if (['html', 'head', 'script', 'style', 'noscript', 'meta', 'link', 'title'].includes(tagName)) {
              return;
            }
            
            const visible = isElementVisible(element);
            if ((shouldShowVisible && !visible) || (!shouldShowVisible && visible)) {
              return;
            }
            
            // Vérifier les bordures des composants interactifs
            if (isInteractiveComponent(element)) {
              const borderColor = getBorderColor(element);
              if (borderColor) {
                const bgColor = getBackgroundColor(element);
                if (bgColor && borderColor !== bgColor) {
                  const elRatio = calculateContrastRatio(borderColor, bgColor);
                  const ratioDiff = Math.abs(elRatio - targetRatio);
                  
                  // Comparer avec les couleurs cibles (avec tolérance)
                  const color1Hex = color1.toLowerCase();
                  const color2Hex = color2.toLowerCase();
                  const borderHex = borderColor.toLowerCase();
                  const bgHex = bgColor.toLowerCase();
                  
                  const colorsMatch = (ratioDiff < 0.01) && 
                    ((borderHex === color1Hex && bgHex === color2Hex) || 
                     (borderHex === color2Hex && bgHex === color1Hex));
                  
                  if (colorsMatch) {
                    element.style.setProperty('outline', '2px solid #f44336', 'important');
                    element.style.setProperty('outline-offset', '2px', 'important');
                    element.style.setProperty('z-index', '999999', 'important');
                    element.setAttribute('data-contrast-highlight', 'true');
                    highlightedCount++;
                    if (!firstElement) firstElement = element;
                  }
                }
              }
            }
            
            // Vérifier les icônes SVG
            if (tagName === 'svg' || (tagName === 'use' && element.closest('svg'))) {
              const style = window.getComputedStyle(element);
              const fillColor = style.fill;
              if (fillColor && fillColor !== 'none' && fillColor !== 'transparent' && fillColor !== 'rgba(0, 0, 0, 0)') {
                const svgFill = rgbToHex(fillColor);
                if (svgFill && svgFill !== '#000000') {
                  const bgColor = getBackgroundColor(element);
                  if (bgColor && svgFill !== bgColor) {
                    const elRatio = calculateContrastRatio(svgFill, bgColor);
                    const ratioDiff = Math.abs(elRatio - targetRatio);
                    
                    const color1Hex = color1.toLowerCase();
                    const color2Hex = color2.toLowerCase();
                    const fillHex = svgFill.toLowerCase();
                    const bgHex = bgColor.toLowerCase();
                    
                    const colorsMatch = (ratioDiff < 0.01) && 
                      ((fillHex === color1Hex && bgHex === color2Hex) || 
                       (fillHex === color2Hex && bgHex === color1Hex));
                    
                    if (colorsMatch) {
                      element.style.setProperty('outline', '2px solid #f44336', 'important');
                      element.style.setProperty('outline-offset', '2px', 'important');
                      element.style.setProperty('z-index', '999999', 'important');
                      element.setAttribute('data-contrast-highlight', 'true');
                      highlightedCount++;
                      if (!firstElement) firstElement = element;
                    }
                  }
                }
              }
            }
          } catch (e) {
            // Ignorer les erreurs
          }
        });
      } catch (e) {
        return { 
          highlighted: highlightedCount, 
          error: String(e),
          firstElementId: null
        };
      }
      
      let firstElementId = null;
      if (firstElement) {
        if (!firstElement.id) {
          firstElement.id = 'rgaa-contrast-first-' + Date.now();
        }
        firstElementId = firstElement.id;
      }
      
      return { 
        highlighted: highlightedCount,
        firstElementId: firstElementId
      };
    })(${JSON.stringify(ratio)}, ${JSON.stringify(isVisible)}, ${JSON.stringify(color1)}, ${JSON.stringify(color2)})
  `, (result, isException) => {
    if (isException) {
      const errorMsg = isException.value || isException.description || isException.message || String(isException);
      console.error('[Contrasts] Erreur lors de la mise en évidence non-textuelle:', errorMsg);
      return;
    }
    
    if (result && result.highlighted !== undefined) {
      console.log(`[Contrasts] ${result.highlighted} éléments non-textuels mis en évidence`);
      
      // Scroller vers le premier élément si disponible
      if (result.firstElementId) {
        chrome.devtools.inspectedWindow.eval(`
          (function(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
              const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - 100;
              window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
          })(${JSON.stringify(result.firstElementId)})
        `, () => {});
      }
    }
  });
}
