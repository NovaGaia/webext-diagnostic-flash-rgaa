// Analyse de la hiérarchie des titres et des landmarks

/**
 * Analyser la hiérarchie des titres et les landmarks de la page
 * @param {Function} callback - Callback avec les résultats
 */
function analyzeHeadingsHierarchy(callback) {
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      const results = {
        headings: [],
        landmarks: []
      };
      
      // Fonction pour obtenir le texte d'un élément (limité à 100 caractères)
      const getHeadingText = (element) => {
        let text = element.textContent || element.innerText || '';
        text = text.trim().replace(/\\s+/g, ' ');
        if (text.length > 100) {
          text = text.substring(0, 97) + '...';
        }
        return text;
      };
      
      // Analyser tous les titres (h1 à h6)
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingsData = [];
      
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const text = getHeadingText(heading);
        const id = heading.id || '';
        
        headingsData.push({
          index: index + 1,
          level: level,
          text: text,
          id: id,
          element: heading
        });
      });
      
      // Valider la hiérarchie des titres
      // Règle 1: Erreur si pas de h1 initial
      // Règle 2: Erreur si les titres ne sont pas imbriqués correctement (h1>h2>h3...)
      // Règle 3: Erreur si les titres ne se suivent pas (ex: h1>h3 au lieu de h1>h2)
      
      if (headingsData.length > 0) {
        // Analyser la séquence des titres pour détecter les erreurs
        for (let i = 0; i < headingsData.length; i++) {
          const currentHeading = headingsData[i];
          const previousHeading = i > 0 ? headingsData[i - 1] : null;
          
          // Initialiser les erreurs
          currentHeading.hasError = false;
          currentHeading.errors = [];
          
          // Règle 1: Erreur si pas de h1 initial
          // Le premier titre du document doit être un h1
          if (i === 0 && currentHeading.level !== 1) {
            currentHeading.hasError = true;
            currentHeading.errors.push('no-initial-h1');
          }
          
          // Règles 2 et 3: Vérifier la séquence et l'imbrication
          if (previousHeading) {
            const previousLevel = previousHeading.level;
            const currentLevel = currentHeading.level;
            
            // Règle 3: Erreur si les titres ne se suivent pas (ex: h1>h3 au lieu de h1>h2)
            // Un titre ne peut pas sauter des niveaux
            if (currentLevel > previousLevel + 1) {
              currentHeading.hasError = true;
              currentHeading.errors.push('level-skip');
            }
            
            // Note: Un retour en arrière (h3>h2) est généralement acceptable
            // car il indique un retour à un niveau parent dans la hiérarchie
            // On ne le marque donc pas comme erreur
          }
        }
      }
      
      // Ajouter les titres avec leurs erreurs
      results.headings = headingsData.map(h => ({
        index: h.index,
        level: h.level,
        text: h.text,
        id: h.id,
        hasError: h.hasError || false,
        errors: h.errors || []
      }));
      
      // Analyser les landmarks
      // Les landmarks peuvent être définis par :
      // - Les éléments HTML5 sémantiques (header, nav, main, aside, footer, section, article)
      // - Les attributs role ARIA (banner, navigation, main, complementary, contentinfo, etc.)
      
      const getLandmarkInfo = (element) => {
        const tagName = element.tagName.toLowerCase();
        let role = element.getAttribute('role');
        let label = '';
        let landmarkType = '';
        let hasExplicitLabel = false;
        
        // Fonction pour obtenir le label explicite (aria-label ou aria-labelledby)
        const getExplicitLabel = () => {
          const ariaLabel = element.getAttribute('aria-label');
          if (ariaLabel && ariaLabel.trim()) {
            return ariaLabel.trim();
          }
          const ariaLabelledBy = element.getAttribute('aria-labelledby');
          if (ariaLabelledBy) {
            const labelEl = document.getElementById(ariaLabelledBy);
            if (labelEl) {
              const text = getHeadingText(labelEl);
              if (text && text.trim()) {
                return text.trim();
              }
            }
          }
          return null;
        };
        
        // Déterminer le type de landmark selon le tag ou le role
        if (tagName === 'header' || role === 'banner') {
          landmarkType = 'banner';
          const explicitLabel = getExplicitLabel();
          if (explicitLabel) {
            label = explicitLabel;
            hasExplicitLabel = true;
          } else {
            label = 'Banner';
          }
        } else if (tagName === 'nav' || role === 'navigation') {
          landmarkType = 'navigation';
          const explicitLabel = getExplicitLabel();
          if (explicitLabel) {
            label = explicitLabel;
            hasExplicitLabel = true;
          } else {
            // Chercher un titre dans le nav comme label implicite
            const firstHeading = element.querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
            if (firstHeading) {
              label = getHeadingText(firstHeading);
            } else {
              const links = element.querySelectorAll('a');
              if (links.length > 0) {
                label = links.length === 1 ? 'Navigation' : 'Main Navigation';
              } else {
                label = 'Navigation';
              }
            }
          }
        } else if (tagName === 'main' || role === 'main') {
          landmarkType = 'main';
          const explicitLabel = getExplicitLabel();
          if (explicitLabel) {
            label = explicitLabel;
            hasExplicitLabel = true;
          } else {
            label = 'Main';
          }
        } else if (tagName === 'aside' || role === 'complementary') {
          landmarkType = 'complementary';
          const explicitLabel = getExplicitLabel();
          if (explicitLabel) {
            label = explicitLabel;
            hasExplicitLabel = true;
          } else {
            const firstHeading = element.querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
            if (firstHeading) {
              label = getHeadingText(firstHeading);
          } else {
            // Utiliser le contenu textuel significatif pour différencier les landmarks
            // Prendre les 30 premiers mots significatifs
            let textContent = element.textContent || element.innerText || '';
            textContent = textContent.trim().replace(/\\s+/g, ' ');
            // Extraire les premiers mots significatifs (au moins 3 caractères)
            const words = textContent.split(' ').filter(w => w.length >= 3).slice(0, 10);
            if (words.length > 0) {
              label = words.join(' ').substring(0, 50);
            } else {
              // Si pas de mots significatifs, utiliser un label basé sur la position ou le contenu
              label = 'Complementary';
            }
          }
          }
        } else if (tagName === 'footer' || role === 'contentinfo') {
          landmarkType = 'contentinfo';
          const explicitLabel = getExplicitLabel();
          if (explicitLabel) {
            label = explicitLabel;
            hasExplicitLabel = true;
          } else {
            const firstHeading = element.querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
            if (firstHeading) {
              label = getHeadingText(firstHeading);
            } else {
              // Pour les footer, utiliser le contenu textuel si disponible
              let textContent = element.textContent || element.innerText || '';
              textContent = textContent.trim().replace(/\\s+/g, ' ');
              // Extraire les premiers mots significatifs
              const words = textContent.split(' ').filter(w => w.length >= 3).slice(0, 10);
              if (words.length > 0) {
                label = words.join(' ').substring(0, 50);
              } else {
                label = 'Footer';
              }
            }
          }
        } else if (tagName === 'form' && role === 'search') {
          landmarkType = 'search';
          const explicitLabel = getExplicitLabel();
          if (explicitLabel) {
            label = explicitLabel;
            hasExplicitLabel = true;
          } else {
            label = 'Search';
          }
        } else {
          return null;
        }
        
        return {
          type: landmarkType,
          label: label,
          tag: tagName,
          role: role || '',
          hasExplicitLabel: hasExplicitLabel
        };
      };
      
      // Fonction pour vérifier si un élément est dans un landmark parent
      const getParentLandmark = (element) => {
        let parent = element.parentElement;
        while (parent && parent !== document.body && parent !== document.documentElement) {
          const parentTag = parent.tagName.toLowerCase();
          const parentRole = parent.getAttribute('role');
          
          if (parentTag === 'header' || parentRole === 'banner') {
            return { type: 'banner', element: parent };
          }
          if (parentTag === 'nav' || parentRole === 'navigation') {
            return { type: 'navigation', element: parent };
          }
          if (parentTag === 'main' || parentRole === 'main') {
            return { type: 'main', element: parent };
          }
          if (parentTag === 'aside' || parentRole === 'complementary') {
            return { type: 'complementary', element: parent };
          }
          if (parentTag === 'footer' || parentRole === 'contentinfo') {
            return { type: 'contentinfo', element: parent };
          }
          if (parentRole === 'search') {
            return { type: 'search', element: parent };
          }
          
          parent = parent.parentElement;
        }
        return null;
      };
      
      // Fonction pour calculer le niveau d'imbrication d'un landmark (comme HeadingsMap)
      const calculateNestedLevel = (element) => {
        let level = 1;
        let parent = element.parentElement;
        
        while (parent && parent !== document.body && parent !== document.documentElement) {
          const parentTag = parent.tagName.toLowerCase();
          const parentRole = parent.getAttribute('role');
          
          // Vérifier si le parent est un landmark
          if (parentTag === 'header' || parentRole === 'banner' ||
              parentTag === 'nav' || parentRole === 'navigation' ||
              parentTag === 'main' || parentRole === 'main' ||
              parentTag === 'aside' || parentRole === 'complementary' ||
              parentTag === 'footer' || parentRole === 'contentinfo' ||
              parentRole === 'search' ||
              (parentTag === 'form' && parentRole === 'search') ||
              (parentTag === 'section' && parentRole === 'region')) {
            level++;
          }
          
          parent = parent.parentElement;
        }
        
        return level;
      };
      
      // Analyser tous les landmarks et construire la hiérarchie
      const allLandmarks = [];
      
      // Analyser les landmarks HTML5 sémantiques
      const semanticElements = document.querySelectorAll('header, nav, main, aside, footer, form[role="search"]');
      semanticElements.forEach(element => {
        const info = getLandmarkInfo(element);
        if (info) {
          const nestedLevel = calculateNestedLevel(element);
          allLandmarks.push({
            ...info,
            element: element,
            nestedLevel: nestedLevel,
            nested: nestedLevel > 1
          });
        }
      });
      
      // Analyser les landmarks ARIA (attributs role)
      const ariaLandmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"], [role="search"], [role="region"]');
      ariaLandmarks.forEach(element => {
        const tagName = element.tagName.toLowerCase();
        // Ne pas traiter si c'est déjà un élément sémantique (déjà compté)
        if (!['header', 'nav', 'main', 'aside', 'footer'].includes(tagName)) {
          const info = getLandmarkInfo(element);
          if (info) {
            const nestedLevel = calculateNestedLevel(element);
            allLandmarks.push({
              ...info,
              element: element,
              nestedLevel: nestedLevel,
              nested: nestedLevel > 1
            });
          }
        }
      });
      
      // Trier les landmarks : les parents d'abord, puis les enfants
      // Pour cela, on va construire un ordre basé sur la position DOM
      allLandmarks.sort((a, b) => {
        // Comparer les positions dans le DOM
        const posA = a.element.compareDocumentPosition(b.element);
        if (posA & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1; // a vient avant b
        }
        if (posA & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1; // b vient avant a
        }
        return 0;
      });
      
      // Appliquer les règles de validation pour détecter les erreurs (comme HeadingsMap)
      // Règle 1: banner, complementary, contentinfo, main doivent être top-level (niveau 1)
      const topLevelTypes = ['banner', 'complementary', 'contentinfo', 'main'];
      
      // Règle 2: Compter UNIQUEMENT les landmarks top-level (niveau 1) pour banner, contentinfo, main
      const topLevelTypeCounts = {
        banner: 0,
        contentinfo: 0,
        main: 0
      };
      
      // Première passe : compter uniquement les landmarks top-level
      allLandmarks.forEach(landmark => {
        // Compter seulement les landmarks de niveau 1 (top-level)
        if (landmark.nestedLevel === 1) {
          if (landmark.type === 'banner') topLevelTypeCounts.banner++;
          if (landmark.type === 'contentinfo') topLevelTypeCounts.contentinfo++;
          if (landmark.type === 'main') topLevelTypeCounts.main++;
        }
      });
      
      // Deuxième passe : marquer les erreurs
      const landmarksWithErrors = allLandmarks.map(landmark => {
        let errors = [];
        const isTopLevel = landmark.nestedLevel === 1;
        
        // Erreur 1: banner, complementary, contentinfo, main doivent être top-level
        // Seulement si le landmark est de niveau 1 (top-level) ET qu'il est imbriqué
        // En fait, si nestedLevel === 1, il ne peut pas être imbriqué
        // Donc l'erreur est : si c'est un top-level type ET qu'il est nestedLevel > 1
        if (topLevelTypes.includes(landmark.type) && !isTopLevel) {
          errors.push('must-be-top-level');
        }
        
        // Erreur 2: Plus d'un banner, contentinfo, ou main AU TOP-LEVEL uniquement
        // Seulement marquer comme erreur si le landmark est top-level (niveau 1)
        if (isTopLevel) {
          if (landmark.type === 'banner' && topLevelTypeCounts.banner > 1) {
            errors.push('duplicate-top-level');
          }
          if (landmark.type === 'contentinfo' && topLevelTypeCounts.contentinfo > 1) {
            errors.push('duplicate-top-level');
          }
          if (landmark.type === 'main' && topLevelTypeCounts.main > 1) {
            errors.push('duplicate-top-level');
          }
        }
        
        // Erreur 3: Landmarks répétés avec même label au MÊME NIVEAU d'imbrication
        // IMPORTANT : Ne vérifier que si les landmarks sont au même niveau (même parent dans la hiérarchie)
        // Pour cela, on doit trouver les landmarks qui partagent le même chemin de parents
        
        // Trouver tous les landmarks du même type
        const sameTypeLandmarks = allLandmarks.filter(l => 
          l.type === landmark.type && 
          l !== landmark
        );
        
        if (sameTypeLandmarks.length > 0) {
          // Pour chaque landmark du même type, vérifier s'ils sont au même niveau hiérarchique
          // Deux landmarks sont au même niveau s'ils ont le même nestedLevel
          const sameLevelLandmarks = sameTypeLandmarks.filter(l => 
            l.nestedLevel === landmark.nestedLevel
          );
          
          if (sameLevelLandmarks.length > 0) {
            // Si plusieurs landmarks du même type au même niveau existent
            // Erreur seulement si aucun n'a de label explicite OU si deux ont le même label explicite
            const hasExplicitLabels = sameLevelLandmarks.some(l => l.hasExplicitLabel) || landmark.hasExplicitLabel;
            
            if (!hasExplicitLabels) {
              // Tous n'ont pas de label explicite → erreur
              errors.push('duplicate-label');
            } else {
              // Au moins un a un label explicite → vérifier si deux ont le même label
              const sameExplicitLabelCount = sameLevelLandmarks.filter(l => 
                l.hasExplicitLabel && l.label === landmark.label
              ).length;
              
              // Si ce landmark a un label explicite et qu'un autre au même niveau a le même
              if (landmark.hasExplicitLabel && sameExplicitLabelCount > 0) {
                errors.push('duplicate-label');
              }
            }
          }
        }
        
        return {
          ...landmark,
          hasError: errors.length > 0,
          errors: errors
        };
      });
      
      // Ajouter les landmarks avec les erreurs détectées
      results.landmarks = landmarksWithErrors.map(l => ({
        type: l.type,
        label: l.label,
        tag: l.tag,
        role: l.role,
        nested: l.nested,
        nestedLevel: l.nestedLevel,
        hasError: l.hasError,
        errors: l.errors
      }));
      
      return results;
    })()
  `, (results, isException) => {
    if (isException) {
      const errorMsg = isException.value || isException.description || isException.message || String(isException);
      callback({ error: errorMsg });
      return;
    }
    
    callback(results);
  });
}

