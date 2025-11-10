// Test: Les images, les vidéos et les fichiers audio ont une alternative textuelle

function testMediaAlternatives() {
  const testId = 'media-alternatives';
  const content = document.getElementById('category-langage');
  
  // Créer l'élément de test
  const testItem = document.createElement('div');
  testItem.className = 'test-item';
  testItem.id = `test-${testId}`;
  
  testItem.innerHTML = `
    <div class="test-name">${t('testMediaAlternativesName')}</div>
    <div class="test-description">${t('testMediaAlternativesDesc')}</div>
    <div class="test-results" id="test-${testId}-results">
      <div class="auto-check" id="test-${testId}-info">
        ${replaceEmojisInMessage(t('testMediaAlternativesInfo'))}
      </div>
      <button class="button-small" id="test-${testId}-analyze" style="margin-top: 10px;">Analyser les alternatives textuelles (beta)</button>
    </div>
    <div class="test-actions">
      <div class="test-validation">
        <div class="validation-option">
          <input type="radio" name="test-${testId}-validation" id="test-${testId}-passed" value="passed">
          <label for="test-${testId}-passed">${t('validationPassed')}</label>
        </div>
        <div class="validation-option">
          <input type="radio" name="test-${testId}-validation" id="test-${testId}-failed" value="failed">
          <label for="test-${testId}-failed">${t('validationFailed')}</label>
        </div>
        <div class="validation-option">
          <input type="radio" name="test-${testId}-validation" id="test-${testId}-not-tested" value="not-tested" checked>
          <label for="test-${testId}-not-tested">${t('validationNotTested')}</label>
        </div>
              <div class="validation-option">
          <input type="radio" name="test-${testId}-validation" id="test-${testId}-not-applicable" value="not-applicable">
          <label for="test-${testId}-not-applicable">${t('validationNotApplicable')}</label>
        </div>
</div>
    </div>
    ${createDocumentationBlock(testId, false)}
  `;
  
  content.appendChild(testItem);
  
  // Initialiser le bloc de documentation
  initDocumentationBlocks();
  
  // Écouteur pour le bouton d'analyse
  const analyzeBtn = document.getElementById(`test-${testId}-analyze`);
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      analyzeMediaAlternatives(testId);
    });
  }
  
  // Écouteurs pour les options de validation
  const validationInputs = document.querySelectorAll(`input[name="test-${testId}-validation"]`);
  validationInputs.forEach(input => {
    input.addEventListener('change', () => {
      updateMediaAlternativesStatus(testId, input.value);
    });
  });
}

// Analyser les alternatives textuelles et afficher la visualisation
function analyzeMediaAlternatives(testId) {
  const analyzeBtn = document.getElementById(`test-${testId}-analyze`);
  if (!analyzeBtn) return;
  
  // Toggle de l'état actif
  const isActive = analyzeBtn.classList.contains('active');
  
  if (isActive) {
    // Désactiver la visualisation
    cleanupMediaAlternativesVisualization();
    analyzeBtn.classList.remove('active');
    analyzeBtn.textContent = 'Analyser les alternatives textuelles (beta)';
  } else {
    // Activer la visualisation
    analyzeBtn.classList.add('active');
    analyzeBtn.textContent = 'Désactiver l\'analyse';
    showMediaAlternativesVisualization(testId);
  }
}


// Mettre à jour le statut du test
function updateMediaAlternativesStatus(testId, validationValue) {
  const testItem = document.getElementById(`test-${testId}`);
  if (!testItem) return;
  
  let status = '';
  let resultsMessage = '';
  
  if (validationValue === 'passed') {
    testItem.className = 'test-item passed';
    status = 'passed';
    resultsMessage = t('statusPassed');
  } else if (validationValue === 'failed') {
    testItem.className = 'test-item failed';
    status = 'failed';
    resultsMessage = t('statusFailed');
  } else if (validationValue === 'not-applicable') {
    testItem.className = 'test-item not-applicable';
    status = 'not-applicable';
    resultsMessage = t('validationNotApplicable');
  } else {
    // not-tested
    testItem.className = 'test-item';
    status = '';
    resultsMessage = t('statusPending');
  }
  
  // Mettre à jour les stats
  const testData = {
    name: t('testMediaAlternativesNameForStats'),
    status: status,
    results: resultsMessage
  };
  
  // Trouver ou créer l'entrée dans categories
  const existingIndex = categories.langage.tests.findIndex(t => t.name === testData.name);
  
  if (validationValue === 'not-tested') {
    if (existingIndex >= 0) {
      categories.langage.tests.splice(existingIndex, 1);
    }
  } else {
    if (existingIndex >= 0) {
      categories.langage.tests[existingIndex] = testData;
    } else {
      categories.langage.tests.push(testData);
    }
  }
  
  updateStats();
}

