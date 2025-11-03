// Gestion des statistiques et des catégories

// Structure des catégories
const categories = {
  navigation: {
    name: t('categoryNavigation'),
    icon: '🧭',
    tests: []
  },
  langage: {
    name: t('categoryLangage'),
    icon: '🌐',
    tests: []
  },
  structuration: {
    name: t('categoryStructuration'),
    icon: '📋',
    tests: []
  }
};

// Mettre à jour les statistiques
function updateStats() {
  const TOTAL_CRITERIA = 15; // Nombre total de critères RGAA
  
  let total = 0;
  let passed = 0;
  let failed = 0;
  let notApplicable = 0;
  
  Object.keys(categories).forEach(categoryId => {
    const categoryTests = categories[categoryId].tests;
    total += categoryTests.length;
    categoryTests.forEach(test => {
      if (test.status === 'passed') {
        passed++;
      } else if (test.status === 'failed') {
        failed++;
      } else if (test.status === 'not-applicable') {
        notApplicable++;
      }
      // Les tests avec status 'warning' sont comptés dans total mais pas dans passed/failed
    });
  });
  
  // Calcul du score sur 100
  // Algorithme: (nb total de critères (15) - nb de critères non applicables) / nb de critères validés
  // Score = (nb_validés / (15 - nb_non_applicables)) * 100
  let score = 0;
  const applicableCriteria = TOTAL_CRITERIA - notApplicable;
  if (applicableCriteria > 0) {
    score = Math.round((passed / applicableCriteria) * 100);
  } else {
    // Si tous les critères sont non applicables, score = 0 ou non défini
    score = 0;
  }
  
  const totalEl = document.getElementById('totalTests');
  const passedEl = document.getElementById('passedTests');
  const failedEl = document.getElementById('failedTests');
  const notApplicableEl = document.getElementById('notApplicableTests');
  const scoreEl = document.getElementById('scoreValue');
  
  if (totalEl) {
    totalEl.textContent = total;
  } else {
    console.warn(t('warningTotalTestsNotFound'));
  }
  if (passedEl) {
    passedEl.textContent = passed;
  } else {
    console.warn(t('warningPassedTestsNotFound'));
  }
  if (failedEl) {
    failedEl.textContent = failed;
  } else {
    console.warn(t('warningFailedTestsNotFound'));
  }
  if (notApplicableEl) {
    notApplicableEl.textContent = notApplicable;
  }
  if (scoreEl) {
    scoreEl.textContent = score;
    // Changer la couleur selon le score
    if (score >= 90) {
      scoreEl.style.color = '#4caf50'; // Vert pour excellent
    } else if (score >= 75) {
      scoreEl.style.color = '#8bc34a'; // Vert clair pour bon
    } else if (score >= 50) {
      scoreEl.style.color = '#ff9800'; // Orange pour moyen
    } else {
      scoreEl.style.color = '#f44336'; // Rouge pour faible
    }
  }
  
  // Mettre à jour le diagramme circulaire
  updatePieChart(passed, failed, notApplicable);
}

// Mettre à jour le diagramme circulaire
function updatePieChart(passed, failed, notApplicable) {
  const svg = document.getElementById('pieChart');
  const legend = document.getElementById('pieChartLegend');
  
  if (!svg || !legend) return;
  
  // Vider le SVG et la légende
  svg.innerHTML = '';
  legend.innerHTML = '';
  
  const total = passed + failed + notApplicable;
  
  // Si aucun test validé, afficher un cercle gris
  if (total === 0) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '100');
    circle.setAttribute('cy', '100');
    circle.setAttribute('r', '80');
    circle.setAttribute('fill', '#e0e0e0');
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '2');
    svg.appendChild(circle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '100');
    text.setAttribute('y', '110');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '12');
    text.setAttribute('fill', '#999');
    text.textContent = t('emptyState');
    svg.appendChild(text);
    return;
  }
  
  const centerX = 100;
  const centerY = 100;
  const radius = 80;
  
  // Calculer les angles pour chaque catégorie
  const passedAngle = (passed / total) * 360;
  const failedAngle = (failed / total) * 360;
  const notApplicableAngle = (notApplicable / total) * 360;
  
  // Couleurs
  const colors = {
    passed: '#4caf50',
    failed: '#f44336',
    notApplicable: '#9e9e9e'
  };
  
  // Dessiner les arcs
  let currentAngle = -90; // Commencer en haut
  
  function createArc(startAngle, endAngle, color) {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    path.setAttribute('d', d);
    path.setAttribute('fill', color);
    path.setAttribute('stroke', '#fff');
    path.setAttribute('stroke-width', '2');
    svg.appendChild(path);
  }
  
  // Dessiner les arcs dans l'ordre
  if (passed > 0) {
    createArc(currentAngle, currentAngle + passedAngle, colors.passed);
    currentAngle += passedAngle;
  }
  
  if (failed > 0) {
    createArc(currentAngle, currentAngle + failedAngle, colors.failed);
    currentAngle += failedAngle;
  }
  
  if (notApplicable > 0) {
    createArc(currentAngle, currentAngle + notApplicableAngle, colors.notApplicable);
  }
  
  // Créer la légende
  const legendItems = [
    { label: t('statsPassed'), color: colors.passed, count: passed },
    { label: t('statsFailed'), color: colors.failed, count: failed },
    { label: t('statsNotApplicable'), color: colors.notApplicable, count: notApplicable }
  ].filter(item => item.count > 0);
  
  legendItems.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.className = 'pie-chart-legend-item';
    
    const colorBox = document.createElement('span');
    colorBox.className = 'pie-chart-legend-color';
    colorBox.style.backgroundColor = item.color;
    
    const label = document.createElement('span');
    label.textContent = `${item.label}: ${item.count}`;
    
    legendItem.appendChild(colorBox);
    legendItem.appendChild(label);
    legend.appendChild(legendItem);
  });
}

// Réinitialiser les résultats
function resetResults() {
  Object.keys(categories).forEach(categoryId => {
    const content = document.getElementById(`category-${categoryId}`);
    content.innerHTML = `<div class="empty-state">${t('emptyState')}</div>`;
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

