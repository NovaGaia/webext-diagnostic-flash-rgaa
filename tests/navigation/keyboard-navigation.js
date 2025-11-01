// Test: La navigation peut s'effectuer entièrement au clavier

function testKeyboardNavigation() {
  const testId = 'keyboard-navigation';
  const content = document.getElementById('category-navigation');
  
  // Créer l'élément de test
  const testItem = document.createElement('div');
  testItem.className = 'test-item';
  testItem.id = `test-${testId}`;
  
  testItem.innerHTML = `
    <div class="test-name">La navigation et l'utilisation du site peuvent s'effectuer entièrement au clavier</div>
    <div class="test-description">Visualisation de l'ordre de tabulation (TAB) pour vérifier la navigation au clavier</div>
    <div class="test-results" id="test-${testId}-results">
      <div class="auto-check" id="test-${testId}-info">
        ℹ️ Activez la visualisation pour voir l'ordre de tabulation des éléments interactifs
      </div>
    </div>
    <div class="test-actions">
      <div class="test-controls">
        <button class="button-small" id="test-${testId}-toggle">Activer la visualisation</button>
        <label class="checkbox-label">
          <input type="checkbox" id="test-${testId}-show-hidden">
          <span>Afficher les éléments masqués</span>
        </label>
      </div>
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
  
  let isVisualizationActive = false;
  let showHiddenElements = false;
  
  // Fonction pour mettre à jour la visualisation avec les paramètres actuels
  const updateVisualization = () => {
    if (isVisualizationActive) {
      toggleKeyboardVisualization(testId, true, showHiddenElements);
    }
  };
  
  // Écouteur pour le bouton toggle
  const toggleBtn = document.getElementById(`test-${testId}-toggle`);
  toggleBtn.addEventListener('click', () => {
    isVisualizationActive = !isVisualizationActive;
    toggleKeyboardVisualization(testId, isVisualizationActive, showHiddenElements);
    toggleBtn.textContent = isVisualizationActive ? 'Désactiver la visualisation' : 'Activer la visualisation';
  });
  
  // Écouteur pour la checkbox d'éléments masqués
  const showHiddenCheckbox = document.getElementById(`test-${testId}-show-hidden`);
  showHiddenCheckbox.addEventListener('change', () => {
    showHiddenElements = showHiddenCheckbox.checked;
    updateVisualization();
  });
  
  // Écouteurs pour les options de validation
  const validationInputs = document.querySelectorAll(`input[name="test-${testId}-validation"]`);
  validationInputs.forEach(input => {
    input.addEventListener('change', () => {
      updateKeyboardTestStatus(testId, input.value);
    });
  });
}

// Mettre à jour le statut du test de navigation clavier
function updateKeyboardTestStatus(testId, validationValue) {
  const testItem = document.getElementById(`test-${testId}`);
  if (!testItem) return;
  
  let status = '';
  let resultsMessage = '';
  
  if (validationValue === 'passed') {
    testItem.className = 'test-item passed';
    status = 'passed';
    resultsMessage = 'Test réussi';
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
    name: 'La navigation et l\'utilisation du site peuvent s\'effectuer entièrement au clavier',
    status: status,
    results: resultsMessage
  };
  
  // Trouver ou créer l'entrée dans categories
  const existingIndex = categories.navigation.tests.findIndex(t => t.name === testData.name);
  
  if (validationValue === 'not-tested') {
    if (existingIndex >= 0) {
      categories.navigation.tests.splice(existingIndex, 1);
    }
  } else {
    if (existingIndex >= 0) {
      categories.navigation.tests[existingIndex] = testData;
    } else {
      categories.navigation.tests.push(testData);
    }
  }
  
  updateStats();
}

