// Gestion de l'interface utilisateur (catégories, toggles, etc.)

// Initialisation des événements de catégories
function initCategories() {
  document.querySelectorAll('[data-category-toggle]').forEach(header => {
    header.addEventListener('click', (e) => {
      const categoryId = header.getAttribute('data-category-toggle');
      toggleCategory(categoryId);
    });
  });
}

// Toggle d'une catégorie (ouvrir/fermer)
function toggleCategory(categoryId) {
  const header = document.querySelector(`[data-category-toggle="${categoryId}"]`);
  const content = document.getElementById(`category-${categoryId}`);
  
  const isActive = header.classList.contains('active');
  
  // Fermer toutes les catégories
  document.querySelectorAll('.category-header').forEach(h => {
    h.classList.remove('active');
  });
  document.querySelectorAll('.category-content').forEach(c => {
    c.classList.remove('active');
  });
  
  // Ouvrir la catégorie sélectionnée si elle était fermée
  if (!isActive) {
    header.classList.add('active');
    content.classList.add('active');
  }
}

