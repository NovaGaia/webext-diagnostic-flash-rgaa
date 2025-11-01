// Utilitaires pour l'analyse des contrastes

/**
 * Calculer le ratio de contraste entre deux couleurs (WCAG)
 * @param {string} color1 - Couleur au format hex (#RRGGBB)
 * @param {string} color2 - Couleur au format hex (#RRGGBB)
 * @returns {number} Ratio de contraste (1 à 21)
 */
function calculateContrastRatio(color1, color2) {
  // Convertir hex en RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  // Calculer la luminance relative
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  // Ratio de contraste
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convertir hex en RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Calculer la luminance relative
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Vérifier si un ratio respecte WCAG AA
 * @param {number} ratio - Ratio de contraste
 * @param {string} size - 'small' ou 'large'
 * @returns {boolean}
 */
function meetsWCAGAA(ratio, size) {
  // AA: 4.5:1 pour texte normal, 3:1 pour texte large
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Vérifier si un ratio respecte WCAG AAA
 * @param {number} ratio - Ratio de contraste
 * @param {string} size - 'small' ou 'large'
 * @returns {boolean}
 */
function meetsWCAGAAA(ratio, size) {
  // AAA: 7:1 pour texte normal, 4.5:1 pour texte large
  return size === 'large' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Vérifier si un ratio respecte WCAG 1.4.11 Non-text Contrast (AA)
 * @param {number} ratio - Ratio de contraste
 * @returns {boolean}
 */
function meetsNonTextContrast(ratio) {
  // 1.4.11: 3:1 minimum pour les composants UI et objets graphiques non-textuels
  // S'applique aux bordures des boutons/inputs, icônes, objets graphiques nécessaires
  return ratio >= 3;
}

/**
 * Créer un élément de couleur (cercle coloré)
 */
function createColorSwatch(color) {
  const swatch = document.createElement('span');
  swatch.className = 'color-swatch';
  swatch.style.backgroundColor = color;
  swatch.style.border = '1px solid #ccc';
  return swatch;
}

/**
 * Compter les tags dans un groupe d'éléments (compatible textuels et non-textuels)
 */
function countTags(elements) {
  const tagCounts = {};
  elements.forEach(el => {
    // Pour les éléments non-textuels, utiliser le tag directement
    // Pour les textuels, utiliser el.tag
    const tag = el.isNonText ? el.tag : el.tag;
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  
  // Trier par nombre décroissant puis par nom
  const tags = Object.keys(tagCounts).sort((a, b) => {
    if (tagCounts[b] !== tagCounts[a]) {
      return tagCounts[b] - tagCounts[a];
    }
    return a.localeCompare(b);
  });
  
  if (tags.length === 0) return '';
  if (tags.length === 1) {
    return `${tagCounts[tags[0]]} ${tags[0]}`;
  }
  
  // Si tous les éléments sont du même tag, retourner juste le nombre
  if (tags.length === 1 || (tags.length > 0 && tagCounts[tags[0]] === elements.length)) {
    return `${elements.length} ${tags[0]}`;
  }
  
  // Afficher les tags principaux ou tous s'il y en a peu (comme WCAG)
  // WCAG affiche souvent sous la forme "X [tag1, tag2, tag3]" quand il y a plusieurs tags
  if (tags.length <= 5) {
    // Si peu de tags différents, tous les lister
    const totalCount = elements.length;
    const tagList = tags.map(t => tagCounts[t] > 1 ? `${tagCounts[t]} ${t}` : t).join(', ');
    // Format WCAG : "X [tag1, tag2]" ou juste "X tag1" si un seul
    if (tags.length === 1) {
      return `${totalCount} ${tags[0]}`;
    }
    return `${totalCount} [${tags.join(', ')}]`;
  } else {
    // Beaucoup de tags : afficher le total et les principaux
    const totalCount = elements.length;
    const mainTags = tags.filter(t => tagCounts[t] > 1).slice(0, 5);
    if (mainTags.length > 0) {
      return `${totalCount} [${mainTags.join(', ')}]`;
    }
    // Sinon, juste les 3 premiers
    return `${totalCount} [${tags.slice(0, 3).join(', ')}]`;
  }
}

/**
 * Obtenir la couleur moyenne d'un groupe d'éléments (compatible textuels et non-textuels)
 */
function getAverageColor(elements, type) {
  // Pour simplifier, prendre la première couleur ou la plus fréquente
  if (elements.length === 0) return '#000000';
  
  // Grouper par couleur
  const colorCounts = {};
  elements.forEach(el => {
    let color;
    if (el.isNonText) {
      // Pour les éléments non-textuels : color1 = foreground/border, color2 = background
      color = type === 'fg' ? el.fgColor || el.color1 : el.bgColor || el.color2;
    } else {
      // Pour les éléments textuels : fgColor = foreground, bgColor = background
      color = type === 'fg' ? el.fgColor : el.bgColor;
    }
    if (color) {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
  });
  
  if (Object.keys(colorCounts).length === 0) {
    return type === 'fg' ? '#000000' : '#FFFFFF';
  }
  
  // Retourner la couleur la plus fréquente
  return Object.keys(colorCounts).reduce((a, b) => 
    colorCounts[a] > colorCounts[b] ? a : b
  );
}

