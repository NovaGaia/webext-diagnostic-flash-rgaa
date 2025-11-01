// Gestion des statistiques et des catégories

// Structure des catégories
const categories = {
  navigation: {
    name: 'Navigation & utilisation',
    icon: '🧭',
    tests: []
  },
  langage: {
    name: 'Langage & interface',
    icon: '🌐',
    tests: []
  },
  structuration: {
    name: 'Structuration de l\'information',
    icon: '📋',
    tests: []
  }
};

// Mettre à jour les statistiques
function updateStats() {
  let total = 0;
  let passed = 0;
  let failed = 0;
  
  Object.keys(categories).forEach(categoryId => {
    const categoryTests = categories[categoryId].tests;
    total += categoryTests.length;
    categoryTests.forEach(test => {
      if (test.status === 'passed') {
        passed++;
      } else if (test.status === 'failed') {
        failed++;
      }
      // Les tests avec status 'warning' sont comptés dans total mais pas dans passed/failed
    });
  });
  
  const totalEl = document.getElementById('totalTests');
  const passedEl = document.getElementById('passedTests');
  const failedEl = document.getElementById('failedTests');
  
  if (totalEl) {
    totalEl.textContent = total;
  } else {
    console.warn('Élément totalTests non trouvé');
  }
  if (passedEl) {
    passedEl.textContent = passed;
  } else {
    console.warn('Élément passedTests non trouvé');
  }
  if (failedEl) {
    failedEl.textContent = failed;
  } else {
    console.warn('Élément failedTests non trouvé');
  }
}

// Réinitialiser les résultats
function resetResults() {
  Object.keys(categories).forEach(categoryId => {
    const content = document.getElementById(`category-${categoryId}`);
    content.innerHTML = '<div class="empty-state">Aucun test effectué pour cette catégorie</div>';
    categories[categoryId].tests = [];
  });
  updateStats();
}

// Afficher un test dans une catégorie
function displayTest(categoryId, testData) {
  const content = document.getElementById(`category-${categoryId}`);
  const emptyState = content.querySelector('.empty-state');
  
  if (emptyState) {
    content.innerHTML = '';
  }
  
  const testItem = document.createElement('div');
  testItem.className = `test-item ${testData.status || ''}`;
  
  testItem.innerHTML = `
    <div class="test-name">${testData.name || 'Test'}</div>
    ${testData.description ? `<div class="test-description">${testData.description}</div>` : ''}
    ${testData.results ? `<div class="test-results">${testData.results}</div>` : ''}
  `;
  
  content.appendChild(testItem);
  categories[categoryId].tests.push(testData);
  updateStats();
}

// Afficher une erreur
function showError(message) {
  console.error(message);
  // Afficher l'erreur dans la première catégorie
  displayTest('navigation', {
    name: 'Erreur',
    description: message,
    status: 'failed'
  });
}

