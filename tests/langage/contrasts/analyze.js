// Analyse des contrastes de la page

/**
 * Analyser les contrastes de la page
 * @param {string} wcagLevel - 'AA' ou 'AAA'
 * @param {Function} callback - Callback avec les résultats
 */
function analyzeContrasts(wcagLevel = 'AA', callback) {
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      const results = {
        visible: [], // Éléments textuels visibles (1.4.3 / 1.4.6)
        hidden: [], // Éléments textuels masqués (1.4.3 / 1.4.6)
        nonText: {
          visible: [], // Éléments non-textuels visibles (1.4.11)
          hidden: [] // Éléments non-textuels masqués (1.4.11)
        }
      };
      
      // Convertir rgb/rgba en hex
      const rgbToHex = (rgbStr) => {
        if (!rgbStr) return '#000000';
        if (rgbStr.startsWith('#')) return rgbStr;
        
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
        return '#000000';
      };
      
      // Déterminer la taille du texte (14px ou 18.66px+ pour 'large', ou bold >= 700 et >= 14px)
      const isLarge = (element) => {
        const style = window.getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = parseFloat(style.fontWeight) || 400;
        return fontSize >= 18.66 || (fontSize >= 14 && fontWeight >= 700);
      };
      
      // Obtenir la couleur de premier plan
      const getForegroundColor = (element) => {
        const style = window.getComputedStyle(element);
        return rgbToHex(style.color);
      };
      
      // Obtenir la couleur de fond (en remontant la hiérarchie jusqu'au body)
      const getBackgroundColor = (element) => {
        let el = element;
        const visited = new Set();
        
        // Remonter jusqu'au body ou jusqu'à trouver un fond opaque
        while (el && el !== document.documentElement && !visited.has(el)) {
          visited.add(el);
          const style = window.getComputedStyle(el);
          const bgColor = style.backgroundColor;
          
          // Extraire les valeurs RGB et alpha
          const rgbaMatch = bgColor.match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\)/);
          
          if (rgbaMatch) {
            const r = parseInt(rgbaMatch[1]);
            const g = parseInt(rgbaMatch[2]);
            const b = parseInt(rgbaMatch[3]);
            const alpha = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
            
            // Si l'alpha est > 0.1 (au lieu de 0.5), considérer la couleur comme visible
            // Cela permet de détecter des fonds légèrement transparents qui sont tout de même visibles
            if (alpha > 0.1 && (r > 0 || g > 0 || b > 0)) {
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
        
        // Vérifier le fond du body
        if (document.body) {
          const bodyStyle = window.getComputedStyle(document.body);
          const bodyBg = bodyStyle.backgroundColor;
          const hex = rgbToHex(bodyBg);
          if (hex && hex !== '#000000' && bodyBg !== 'transparent' && bodyBg !== 'rgba(0, 0, 0, 0)') {
            return hex;
          }
        }
        
        // Par défaut, fond blanc
        return '#FFFFFF';
      };
      
      // Vérifier si un élément est visible (logique alignée sur WCAG extension)
      // WCAG utilise une fonction en(e) qui remonte la hiérarchie et vérifie plusieurs conditions
      const isVisible = (element) => {
        // Vérifier si l'élément ou un parent est script/style/noscript
        const E = (e) => {
          const tag = e.tagName ? e.tagName.toLowerCase() : '';
          return tag === 'script' || tag === 'style' || tag === 'noscript';
        };
        
        if (!element || element.nodeType !== 1 || E(element) || E(element.parentNode)) {
          return false;
        }
        
        // Remonter la hiérarchie jusqu'au body en vérifiant chaque niveau
        let el = element;
        let o = true; // o = isVisible
        
        while (el && el.tagName && el.tagName.toLowerCase() !== 'body' && o) {
          const style = window.getComputedStyle(el);
          const display = style.getPropertyValue('display');
          const visibility = style.getPropertyValue('visibility');
          const position = style.getPropertyValue('position');
          const top = style.getPropertyValue('top').replace('px', '');
          const left = style.getPropertyValue('left').replace('px', '');
          const zIndex = style.getPropertyValue('z-index');
          
          // Vérifier display: none
          if (display === 'none') {
            o = false;
            break;
          }
          
          // Vérifier visibility: hidden
          if (visibility === 'hidden') {
            o = false;
            break;
          }
          
          // Vérifier l'attribut hidden
          if (el.hasAttribute && el.hasAttribute('hidden')) {
            o = false;
            break;
          }
          
          // Vérifier les éléments déplacés hors écran (position absolute/relative avec coordonnées très négatives)
          const isOffScreen = (position === 'relative' || position === 'absolute') &&
            ((top.indexOf('-') === 0 && parseInt(top) < -1000) ||
             (left.indexOf('-') === 0 && parseInt(left) < -1000) ||
             (zIndex.indexOf('-') === 0 && parseInt(zIndex) < -1000));
          
          if (isOffScreen) {
            o = false;
            break;
          }
          
          // Vérifier les éléments dans un <details> fermé
          const tagName = el.tagName ? el.tagName.toLowerCase() : '';
          const details = tagName === 'details' ? el : el.closest('details');
          const summary = tagName === 'summary' ? el : el.closest('summary');
          
          if (details && !summary && details.open !== true) {
            o = false;
            break;
          }
          
          // Passer au parent
          el = el.parentNode || el._parentNode;
        }
        
        return o;
      };
      
      // Tags conteneurs qu'on ignore systématiquement (jamais dans les résultats WCAG)
      const containerTags = ['div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'form'];
      
      // Obtenir la couleur de bordure
      const getBorderColor = (element) => {
        const style = window.getComputedStyle(element);
        const borderColor = style.borderColor || style.borderTopColor;
        if (!borderColor || borderColor === 'transparent' || borderColor === 'rgba(0, 0, 0, 0)') {
          return null;
        }
        const borderWidth = parseFloat(style.borderWidth) || parseFloat(style.borderTopWidth) || 0;
        // Seulement considérer si la bordure est visible (width > 0)
        if (borderWidth <= 0) {
          return null;
        }
        return rgbToHex(borderColor);
      };
      
      // Vérifier si un élément est un composant UI interactif
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
      
      // Approche exhaustive : parcourir TOUS les éléments du DOM
      const allElements = document.querySelectorAll('*');
      
      // Compteur pour tous les éléments cachés (comme l'extension WCAG)
      // Ce compteur inclut TOUS les éléments cachés, même ceux qui ne passent pas les filtres
      let totalHiddenCount = 0;
      
      // Fonction pour extraire le texte d'un élément (comme WCAG)
      const getElementText = (element) => {
        // Si c'est un node texte
        if (element.nodeType === Node.TEXT_NODE) {
          // Échapper les caractères HTML et remplacer les guillemets par des apostrophes simples
          let text = element.nodeValue || '';
          text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          // Remplacer les différents types de guillemets par des apostrophes simples
          text = text.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, "'");
          return text;
        }
        
        // Si c'est une image avec alt
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        if ((tagName === 'img' || tagName === 'area') && element.getAttribute('alt')) {
          return element.getAttribute('alt');
        }
        if (tagName === 'input' && element.getAttribute('type') && element.getAttribute('type').toLowerCase() === 'image' && element.getAttribute('alt')) {
          return element.getAttribute('alt');
        }
        
        // Sinon, concaténer le texte de tous les enfants
        const childNodes = element.childNodes;
        let text = '';
        for (let i = 0; i < childNodes.length; i++) {
          text += getElementText(childNodes[i]);
        }
        // Normaliser les espaces blancs (utiliser String.fromCharCode pour éviter les problèmes d'échappement)
        const newline = String.fromCharCode(10);
        const tab = String.fromCharCode(9);
        const carriage = String.fromCharCode(13);
        text = text.split(newline).join(' ').split(tab).join(' ').split(carriage).join(' ');
        return text.replace(/[ ]+/g, ' ');
      };
      
      // Analyse des éléments TEXTUELS (1.4.3 et 1.4.6) - Logique alignée sur WCAG
      // IMPORTANT : Dans WCAG, le comptage des éléments cachés se fait AVANT les filtres
      // On doit compter TOUS les éléments cachés, même ceux qui seront exclus par les filtres
      allElements.forEach(element => {
        const tagName = element.tagName.toLowerCase();
        
        // Filtres WCAG exacts : exclure ces éléments (du code minifié)
        // y={elements:["script","noscript","hr","br","table","tbody","thead","tfoot","tr","option","ul","ol","dl","style","link","iframe","frameset","frame","object","meta","area","img"]
        const excludedTags = ['script', 'noscript', 'hr', 'br', 'table', 'tbody', 'thead', 'tfoot', 'tr', 'option', 'ul', 'ol', 'dl', 'style', 'link', 'iframe', 'frameset', 'frame', 'object', 'meta', 'area', 'img', 'html', 'head', 'title', 'canvas', 'embed', 'video', 'audio', 'source', 'track'];
        
        // Vérifier la visibilité AVANT les filtres (comme WCAG)
        // Dans WCAG : en(e) ? (...) : c++
        // Si l'élément n'est pas visible, on le compte comme caché, même s'il sera exclu par les filtres
        const visible = isVisible(element);
        
        if (!visible) {
          // Compter TOUS les éléments cachés (comme WCAG fait c++)
          totalHiddenCount++;
          // Ne pas continuer le traitement pour cet élément
          return;
        }
        
        // Maintenant appliquer les filtres pour les éléments visibles uniquement
        if (excludedTags.includes(tagName)) {
          return;
        }
        
        // Exclure les éléments avec type="hidden" ou type="color" (comme WCAG)
        if (element.getAttribute('type') === 'hidden' || element.getAttribute('type') === 'color') {
          return;
        }
        
        // Ignorer les éléments SVG (traités séparément pour 1.4.11)
        if (tagName === 'svg' || element.closest('svg')) {
          return;
        }
        
        // Extraire le texte comme WCAG (gère img alt, etc.)
        const elementText = getElementText(element);
        if (!elementText || elementText.trim().length === 0) {
          return;
        }
        
        // Exclure les inputs avec une valeur (comme WCAG : !e.value)
        if (tagName === 'input' && element.value && element.value.trim().length > 0) {
          return;
        }
        
        // Obtenir les styles calculés
        const style = window.getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = parseFloat(style.fontWeight) || 400;
        
        // Ignorer les éléments avec une taille de police de 0 ou transparent
        if (fontSize === 0 || style.display === 'none' || style.visibility === 'hidden') {
          return;
        }
        
        // FILTRER LES CONTENEURS : Exclure TOUS les conteneurs génériques (comme WCAG)
        // WCAG n'inclut JAMAIS 'div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'form'
        if (containerTags.includes(tagName)) {
          return;
        }
        
        const fgColor = getForegroundColor(element);
        const bgColor = getBackgroundColor(element);
        const size = isLarge(element) ? 'large' : 'small';
        
        const elementInfo = {
          element: tagName,
          visible: true, // On sait qu'il est visible car on a vérifié avant
          size: size,
          fgColor: fgColor,
          bgColor: bgColor
        };
        
        // L'élément est visible et a passé tous les filtres
        results.visible.push(elementInfo);
      });
      
      // Analyse des éléments NON-TEXTUELS pour 1.4.11 (bordures, icônes, etc.)
      allElements.forEach(element => {
        const tagName = element.tagName.toLowerCase();
        
        // Ignorer certains éléments
        if (['html', 'head', 'script', 'style', 'noscript', 'meta', 'link', 'title'].includes(tagName)) {
          return;
        }
        
        const visible = isVisible(element);
        // Compter les éléments cachés pour 1.4.11 aussi
        if (!visible) {
          return; // Les éléments cachés non-textuels seront comptés plus tard
        }
        
        const style = window.getComputedStyle(element);
        
        // 1. Analyser les BORDURES des composants UI interactifs (1.4.11)
        if (isInteractiveComponent(element)) {
          const borderColor = getBorderColor(element);
          if (borderColor) {
            const bgColor = getBackgroundColor(element);
            if (bgColor && borderColor !== bgColor) {
              // Vérifier le contraste bordure/background
              const borderInfo = {
                element: tagName,
                type: 'border',
                borderColor: borderColor,
                bgColor: bgColor,
                visible: visible
              };
              
              if (visible) {
                results.nonText.visible.push(borderInfo);
              } else {
                results.nonText.hidden.push(borderInfo);
              }
            }
          }
        }
        
        // 2. Analyser les ICÔNES SVG (1.4.11)
        if (tagName === 'svg' || (tagName === 'use' && element.closest('svg'))) {
          // Obtenir la couleur de remplissage (fill) du SVG
          const fillColor = style.fill;
          if (fillColor && fillColor !== 'none' && fillColor !== 'transparent' && fillColor !== 'rgba(0, 0, 0, 0)') {
            const svgFill = rgbToHex(fillColor);
            if (svgFill && svgFill !== '#000000') {
              // Obtenir le fond derrière le SVG
              const bgColor = getBackgroundColor(element);
              if (bgColor && svgFill !== bgColor) {
                const iconInfo = {
                  element: 'svg',
                  type: 'icon',
                  iconColor: svgFill,
                  bgColor: bgColor,
                  visible: visible
                };
                
                if (visible) {
                  results.nonText.visible.push(iconInfo);
                } else {
                  results.nonText.hidden.push(iconInfo);
                }
              }
            }
          }
        }
        
      // 3. Analyser les IMAGES avec rôle décoratif mais nécessaires (à vérifier manuellement)
      // Pour l'instant, on ne les traite pas automatiquement car cela nécessite une analyse sémantique
      });
      
      // Compter aussi les éléments non-textuels cachés (comme l'extension WCAG)
      if (results.nonText && results.nonText.hidden) {
        totalHiddenCount += results.nonText.hidden.length;
      }
      
      // Ajouter le compteur total d'éléments cachés (comme l'extension WCAG)
      results.totalHiddenCount = totalHiddenCount;
      
      return results;
    })()
  `, (results, isException) => {
    if (isException) {
      // Extraire un message d'erreur descriptif de l'exception
      let errorMessage = 'Erreur inconnue';
      if (typeof isException === 'string') {
        errorMessage = isException;
      } else if (isException && typeof isException === 'object') {
        errorMessage = isException.value || isException.description || isException.message || isException.toString() || JSON.stringify(isException);
      } else {
        errorMessage = String(isException);
      }
      console.error('[Contrasts] Erreur lors de l\'analyse:', errorMessage);
      if (isException && typeof isException === 'object' && isException.stack) {
        console.error('[Contrasts] Stack trace:', isException.stack);
      }
      callback({ error: errorMessage });
      return;
    }
    
    if (!results || !results.visible) {
      callback({ error: 'Aucun résultat retourné' });
      return;
    }
    
    // Calculer les ratios de contraste et grouper
    // Structure: grouped[visible/hidden][ratio][size] = [elements] pour le texte
    const grouped = {
      visible: {},
      hidden: {},
      nonText: {
        visible: {},
        hidden: {}
      }
    };
    
    // Traiter les éléments visibles
    if (results.visible && results.visible.length > 0) {
      results.visible.forEach(el => {
        // Calculer le ratio avec précision
        const ratio = calculateContrastRatio(el.fgColor, el.bgColor);
        
        // Filtrer les ratios invalides :
        // - <= 1.01 suggère une erreur de détection (couleurs identiques = ratio théorique de 1.0)
        // - Exactement 1.0 (ou très proche) indique que foreground = background (impossible à lire)
        // - Les ratios non finis
        if (!isFinite(ratio) || ratio <= 1.01) {
          return;
        }
        
        // Arrondir à 2 décimales pour le groupement
        const ratioKey = ratio.toFixed(2);
        
        if (!grouped.visible[ratioKey]) {
          grouped.visible[ratioKey] = {
            ratio: parseFloat(ratioKey),
            small: [],
            large: []
          };
        }
        
        // Grouper par taille aussi
        const sizeKey = el.size === 'large' ? 'large' : 'small';
        grouped.visible[ratioKey][sizeKey].push({
          fgColor: el.fgColor,
          bgColor: el.bgColor,
          tag: el.element
        });
      });
      
      console.log(`[Contrasts] Found ${results.visible.length} visible elements, grouped into ${Object.keys(grouped.visible).length} contrast ratios`);
    }
    
    // Traiter les éléments masqués
    if (results.hidden && results.hidden.length > 0) {
      results.hidden.forEach(el => {
        const ratio = calculateContrastRatio(el.fgColor, el.bgColor);
        
        // Filtrer les ratios invalides (même logique que pour les éléments visibles)
        if (!isFinite(ratio) || ratio <= 1.01) {
          return;
        }
        
        const ratioKey = ratio.toFixed(2);
        
        if (!grouped.hidden[ratioKey]) {
          grouped.hidden[ratioKey] = {
            ratio: parseFloat(ratioKey),
            small: [],
            large: []
          };
        }
        
        const sizeKey = el.size === 'large' ? 'large' : 'small';
        grouped.hidden[ratioKey][sizeKey].push({
          fgColor: el.fgColor,
          bgColor: el.bgColor,
          tag: el.element
        });
      });
      
      console.log(`[Contrasts] Found ${results.hidden.length} hidden text elements, grouped into ${Object.keys(grouped.hidden).length} contrast ratios`);
    }
    
    // Traiter les éléments NON-TEXTUELS visibles (1.4.11)
    if (results.nonText && results.nonText.visible && results.nonText.visible.length > 0) {
      results.nonText.visible.forEach(el => {
        let ratio;
        let color1, color2;
        
        if (el.type === 'border') {
          color1 = el.borderColor;
          color2 = el.bgColor;
        } else if (el.type === 'icon') {
          color1 = el.iconColor;
          color2 = el.bgColor;
        } else {
          return; // Type non reconnu
        }
        
        ratio = calculateContrastRatio(color1, color2);
        
        // Filtrer les ratios invalides pour les éléments non-textuels aussi
        if (!isFinite(ratio) || ratio <= 1.01) {
          return;
        }
        
        const ratioKey = ratio.toFixed(2);
        
        if (!grouped.nonText.visible[ratioKey]) {
          grouped.nonText.visible[ratioKey] = {
            ratio: parseFloat(ratioKey),
            elements: []
          };
        }
        
        grouped.nonText.visible[ratioKey].elements.push({
          type: el.type,
          element: el.element,
          color1: color1,
          color2: color2
        });
      });
      console.log(`[Contrasts] Found ${results.nonText.visible.length} visible non-text elements, grouped into ${Object.keys(grouped.nonText.visible).length} contrast ratios`);
    }
    
    // Traiter les éléments NON-TEXTUELS masqués (1.4.11)
    if (results.nonText && results.nonText.hidden && results.nonText.hidden.length > 0) {
      results.nonText.hidden.forEach(el => {
        let ratio;
        let color1, color2;
        
        if (el.type === 'border') {
          color1 = el.borderColor;
          color2 = el.bgColor;
        } else if (el.type === 'icon') {
          color1 = el.iconColor;
          color2 = el.bgColor;
        } else {
          return; // Type non reconnu
        }
        
        ratio = calculateContrastRatio(color1, color2);
        
        // Filtrer les ratios invalides pour les éléments non-textuels aussi
        if (!isFinite(ratio) || ratio <= 1.01) {
          return;
        }
        
        const ratioKey = ratio.toFixed(2);
        
        if (!grouped.nonText.hidden[ratioKey]) {
          grouped.nonText.hidden[ratioKey] = {
            ratio: parseFloat(ratioKey),
            elements: []
          };
        }
        
        grouped.nonText.hidden[ratioKey].elements.push({
          type: el.type,
          element: el.element,
          color1: color1,
          color2: color2
        });
      });
    }
    
    // Transmettre le totalHiddenCount dans l'objet grouped (comme l'extension WCAG)
    grouped.totalHiddenCount = results.totalHiddenCount || 0;
    
    callback(grouped);
  });
}

