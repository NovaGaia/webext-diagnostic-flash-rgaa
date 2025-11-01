// Test: Le titre de la page est unique et pertinent

function testPageTitle() {
  const testId = 'page-title';
  const content = document.getElementById('category-structuration');
  // Vider le contenu pour cette catégorie au premier test
  content.innerHTML = '';
  
  // Créer l'élément de test
  const testItem = document.createElement('div');
  testItem.className = 'test-item';
  testItem.id = `test-${testId}`;
  
  testItem.innerHTML = `
    <div class="test-name">${t('testPageTitleName')}</div>
    <div class="test-description">${t('testPageTitleDesc')}</div>
    <div class="test-results" id="test-${testId}-results">
      <div class="auto-check" id="test-${testId}-info">
        ${t('testPageTitleInfo')}
      </div>
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
      </div>
    </div>
    ${createDocumentationBlock(testId, false)}
  `;
  
  content.appendChild(testItem);
  
  // Initialiser le bloc de documentation
  initDocumentationBlocks();
  
  // Récupérer et afficher le titre et le H1 de la page
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      const titleElement = document.querySelector('title');
      const h1Element = document.querySelector('h1');
      
      return {
        title: titleElement ? titleElement.textContent.trim() : null,
        h1: h1Element ? h1Element.textContent.trim() : null
      };
    })()
  `, (result, isException) => {
    const infoElement = document.getElementById(`test-${testId}-info`);
    if (infoElement) {
      if (isException) {
        const errorMsg = isException.value || isException.description || isException.message || String(isException);
        infoElement.textContent = '✗ ' + t('errorPageAnalysis') + ': ' + errorMsg;
        infoElement.className = 'auto-check failed';
      } else if (result) {
        let html = t('testPageTitleInfo');
        
        if (result.title || result.h1) {
          html += '<div style="margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 4px; font-size: 13px;">';
          
          if (result.title) {
            html += `<div style="margin-bottom: 8px;"><strong>${t('testPageTitleLabel')}</strong> <code style="background-color: #e0e0e0; padding: 2px 6px; border-radius: 3px;">${escapeHtml(result.title)}</code></div>`;
          } else {
            html += `<div style="margin-bottom: 8px; color: #999;"><strong>${t('testPageTitleLabel')}</strong> <em>${t('testPageTitleNotFound')}</em></div>`;
          }
          
          if (result.h1) {
            html += `<div><strong>${t('testPageTitleH1Label')}</strong> <code style="background-color: #e0e0e0; padding: 2px 6px; border-radius: 3px;">${escapeHtml(result.h1)}</code></div>`;
          } else {
            html += `<div style="color: #999;"><strong>${t('testPageTitleH1Label')}</strong> <em>${t('testPageTitleH1NotFound')}</em></div>`;
          }
          
          html += '</div>';
        }
        
        infoElement.innerHTML = html;
        infoElement.className = 'auto-check';
      }
    }
  });
  
  // Écouteurs pour les options de validation
  const validationInputs = document.querySelectorAll(`input[name="test-${testId}-validation"]`);
  validationInputs.forEach(input => {
    input.addEventListener('change', () => {
      updatePageTitleStatus(testId, input.value);
    });
  });
}

// Fonction utilitaire pour échapper le HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Mettre à jour le statut du test
function updatePageTitleStatus(testId, validationValue) {
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
  } else {
    // not-tested
    testItem.className = 'test-item';
    status = '';
    resultsMessage = t('statusPending');
  }
  
  // Mettre à jour les stats
  const testData = {
    name: t('testPageTitleNameForStats'),
    status: status,
    results: resultsMessage
  };
  
  // Trouver ou créer l'entrée dans categories
  const existingIndex = categories.structuration.tests.findIndex(t => t.name === testData.name);
  
  if (validationValue === 'not-tested') {
    if (existingIndex >= 0) {
      categories.structuration.tests.splice(existingIndex, 1);
    }
  } else {
    if (existingIndex >= 0) {
      categories.structuration.tests[existingIndex] = testData;
    } else {
      categories.structuration.tests.push(testData);
    }
  }
  
  updateStats();
}

