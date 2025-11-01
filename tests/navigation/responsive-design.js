// Test: Le site est optimisé pour toutes les tailles d'écran

function testResponsiveDesign() {
  const testId = 'responsive-design';
  const content = document.getElementById('category-navigation');
  content.innerHTML = '';
  
  // Créer l'élément de test
  const testItem = document.createElement('div');
  testItem.className = 'test-item';
  testItem.id = `test-${testId}`;
  
  testItem.innerHTML = `
    <div class="test-name">Le site est optimisé pour toutes les tailles d'écran</div>
    <div class="test-description">Vérification que le site est utilisable sur mobile (viewport 390 × 844 pixels)</div>
    <div class="test-results" id="test-${testId}-results">
      <div class="auto-check" id="test-${testId}-viewport">
        🔍 Vérification en cours...
      </div>
      <div class="auto-check" id="test-${testId}-overflow">
        🔍 Vérification en cours...
      </div>
      <div class="auto-check" id="test-${testId}-elements">
        🔍 Vérification en cours...
      </div>
    </div>
    <div class="test-actions">
      <button class="button-small" id="test-${testId}-simulate">Simuler mobile (390×844)</button>
      <div class="test-validation">
        <div class="validation-option">
          <input type="radio" name="test-${testId}-validation" id="test-${testId}-passed" value="passed">
          <label for="test-${testId}-passed">✓ Réussi</label>
        </div>
        <div class="validation-option">
          <input type="radio" name="test-${testId}-validation" id="test-${testId}-failed" value="failed">
          <label for="test-${testId}-failed">✗ Échoué</label>
        </div>
        <div class="validation-option">
          <input type="radio" name="test-${testId}-validation" id="test-${testId}-not-tested" value="not-tested" checked>
          <label for="test-${testId}-not-tested">Non testé</label>
        </div>
      </div>
    </div>
  `;
  
  content.appendChild(testItem);
  
  // Lancer les vérifications automatiques
  runResponsiveDesignChecks(testId);
  
  // Écouteur pour le bouton de simulation
  document.getElementById(`test-${testId}-simulate`).addEventListener('click', () => {
    simulateMobileViewport();
  });
  
  // Écouteurs pour les options de validation
  const validationInputs = document.querySelectorAll(`input[name="test-${testId}-validation"]`);
  validationInputs.forEach(input => {
    input.addEventListener('change', () => {
      updateTestStatus(testId, input.value);
    });
  });
}

// Exécuter les vérifications automatiques du responsive design
function runResponsiveDesignChecks(testId) {
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      const results = {
        viewport: { passed: false, message: '' },
        overflow: { passed: false, message: '' },
        elements: { passed: false, message: '' }
      };
      
      // Vérification 1: Meta viewport
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const content = viewportMeta.getAttribute('content') || '';
        if (content.includes('width') || content.includes('device-width')) {
          results.viewport.passed = true;
          results.viewport.message = '✓ Meta viewport présente';
        } else {
          results.viewport.passed = false;
          results.viewport.message = '✗ Meta viewport présente mais mal configurée';
        }
      } else {
        results.viewport.passed = false;
        results.viewport.message = '✗ Meta viewport manquante';
      }
      
      // Vérification 2: Débordement horizontal (avec viewport mobile simulé)
      const body = document.body;
      const html = document.documentElement;
      const bodyWidth = body.scrollWidth;
      const htmlWidth = html.scrollWidth;
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      
      // Vérifier si la largeur dépasse le viewport (simulation mobile 390px)
      const mobileWidth = 390;
      if (bodyWidth <= mobileWidth && htmlWidth <= mobileWidth) {
        results.overflow.passed = true;
        results.overflow.message = '✓ Pas de débordement horizontal détecté';
      } else {
        results.overflow.passed = false;
        results.overflow.message = '⚠ Débordement horizontal possible (largeur: ' + Math.max(bodyWidth, htmlWidth) + 'px)';
      }
      
      // Vérification 3: Éléments critiques accessibles
      const links = document.querySelectorAll('a');
      const buttons = document.querySelectorAll('button, [role="button"]');
      const inputs = document.querySelectorAll('input, textarea, select');
      
      let accessibleElements = 0;
      let totalElements = links.length + buttons.length + inputs.length;
      
      [...links, ...buttons, ...inputs].forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          accessibleElements++;
        }
      });
      
      if (totalElements === 0) {
        results.elements.passed = true;
        results.elements.message = '✓ Aucun élément interactif à vérifier';
      } else if (accessibleElements === totalElements) {
        results.elements.passed = true;
        results.elements.message = '✓ Tous les éléments interactifs sont accessibles (' + totalElements + ' éléments)';
      } else {
        results.elements.passed = false;
        results.elements.message = '⚠ Certains éléments peuvent être cachés (' + (totalElements - accessibleElements) + ' sur ' + totalElements + ')';
      }
      
      return results;
    })()
  `, (results, isException) => {
    if (isException) {
      updateCheckResult(testId, 'viewport', false, 'Erreur: ' + isException);
      updateCheckResult(testId, 'overflow', false, 'Erreur: ' + isException);
      updateCheckResult(testId, 'elements', false, 'Erreur: ' + isException);
      return;
    }
    
    // Mettre à jour chaque vérification
    updateCheckResult(testId, 'viewport', results.viewport.passed, results.viewport.message);
    updateCheckResult(testId, 'overflow', results.overflow.passed, results.overflow.message);
    updateCheckResult(testId, 'elements', results.elements.passed, results.elements.message);
  });
}

// Mettre à jour le résultat d'une vérification automatique
function updateCheckResult(testId, checkType, passed, message) {
  const checkElement = document.getElementById(`test-${testId}-${checkType}`);
  if (checkElement) {
    checkElement.className = `auto-check ${passed ? 'passed' : (checkType === 'overflow' ? 'warning' : 'failed')}`;
    checkElement.textContent = message;
  }
}

// Simuler le viewport mobile
function simulateMobileViewport() {
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      // Instructions pour l'utilisateur
      alert('Pour tester le responsive design:\\n\\n' +
            '1. Ouvrez les DevTools (F12)\\n' +
            '2. Activez le mode "Device Toolbar" (Cmd+Shift+M / Ctrl+Shift+M)\\n' +
            '3. Sélectionnez "iPhone 12 Pro" ou définissez 390 × 844 pixels\\n' +
            '4. Vérifiez visuellement que le site reste utilisable\\n' +
            '5. Cochez la case de validation dans le panneau Diagnostic Flash RGAA');
      
      return { message: 'Instructions affichées' };
    })()
  `, (result, isException) => {
    console.log('Simulation mobile:', result);
  });
}

// Mettre à jour le statut du test selon la validation manuelle
function updateTestStatus(testId, validationValue) {
  const testItem = document.getElementById(`test-${testId}`);
  if (!testItem) return;
  
  // Vérifier aussi les résultats automatiques
  const viewportCheck = document.getElementById(`test-${testId}-viewport`);
  const overflowCheck = document.getElementById(`test-${testId}-overflow`);
  const elementsCheck = document.getElementById(`test-${testId}-elements`);
  
  const autoChecksPassed = 
    viewportCheck?.classList.contains('passed') &&
    (overflowCheck?.classList.contains('passed') || overflowCheck?.classList.contains('warning')) &&
    elementsCheck?.classList.contains('passed');
  
  let status = '';
  let resultsMessage = '';
  
  if (validationValue === 'passed') {
    // L'utilisateur a validé manuellement, donc on marque comme "passed"
    // même si les vérifications automatiques n'ont pas toutes réussi
    testItem.className = 'test-item passed';
    status = 'passed';
    if (autoChecksPassed) {
      resultsMessage = 'Test réussi';
    } else {
      resultsMessage = 'Validé manuellement (certaines vérifications automatiques peuvent échouer)';
    }
  } else if (validationValue === 'failed') {
    testItem.className = 'test-item failed';
    status = 'failed';
    resultsMessage = 'Test échoué';
  } else {
    // not-tested
    testItem.className = 'test-item';
    status = '';
    resultsMessage = 'En attente de validation';
  }
  
  // Mettre à jour les stats
  const testData = {
    name: 'Le site est optimisé pour toutes les tailles d\'écran',
    status: status,
    results: resultsMessage
  };
  
  // Trouver ou créer l'entrée dans categories
  const existingIndex = categories.navigation.tests.findIndex(t => t.name === testData.name);
  
  if (validationValue === 'not-tested') {
    // Si on revient à "non testé", retirer le test du tableau pour qu'il ne soit pas compté
    if (existingIndex >= 0) {
      categories.navigation.tests.splice(existingIndex, 1);
    }
  } else {
    // Sinon, mettre à jour ou ajouter le test
    if (existingIndex >= 0) {
      categories.navigation.tests[existingIndex] = testData;
    } else {
      categories.navigation.tests.push(testData);
    }
  }
  
  updateStats();
}

