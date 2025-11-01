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

// Créer le bloc de documentation pour un test
function createDocumentationBlock(testId, hasKeyboardInstructions = false) {
  const docId = `doc-${testId}`;
  const buttonId = `doc-${testId}-toggle`;
  const contentId = `doc-${testId}-content`;
  
  // Récupérer le contenu spécifique pour chaque test
  const content = getDocumentationContent(testId);
  
  let keyboardSection = '';
  if (hasKeyboardInstructions && content.howKeyboard) {
    keyboardSection = `
      <div class="doc-section">
        <h4 class="doc-section-title">${t('docHowToNavigateKeyboard')}</h4>
        <div class="doc-section-content" id="${testId}-how-keyboard">
          ${content.howKeyboard}
        </div>
      </div>
    `;
  }
  
  return `
    <div class="test-documentation" id="${docId}">
      <button class="doc-toggle" id="${buttonId}" type="button" aria-expanded="false">
        <span class="doc-toggle-icon">▼</span>
        <span class="doc-toggle-text">${t('docShowDocumentation')}</span>
      </button>
      <div class="doc-content" id="${contentId}" style="display: none;">
        <div class="doc-section">
          <h4 class="doc-section-title">${t('docHowToCheck')}</h4>
          <div class="doc-section-content" id="${testId}-how-check">
            ${content.howToCheck}
          </div>
        </div>
        ${keyboardSection}
        <div class="doc-section">
          <h4 class="doc-section-title">${t('docWhy')}</h4>
          <div class="doc-section-content" id="${testId}-why">
            ${content.why}
          </div>
        </div>
        <div class="doc-section">
          <h4 class="doc-section-title">${t('docRGAACriteria')}</h4>
          <div class="doc-section-content" id="${testId}-rgaa-criteria">
            ${content.rgaaCriteria}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Récupérer le contenu de documentation pour un test spécifique
function getDocumentationContent(testId) {
  const contents = {
    'responsive-design': {
      howToCheck: `<p>Sur l'échantillon, tester les différents formats d'écran avec un smartphone ou en modifiant la taille de la fenêtre sur ordinateur.</p>`,
      why: `<p>Depuis fin 2016, le trafic internet mobile a officiellement dépassé celui du trafic internet fixe dans le monde. En 2018, alors que 95 % des ménages sont équipés en téléphone portable, seuls 82 % ont un ordinateur (y compris tablette), les ménages les plus modestes étant les moins équipés (source : Insee). De ce fait, il est indispensable de développer des services en ligne dont l'affichage s'adapte selon la taille de l'écran utilisé.</p>
<p>La conception de sites web adaptatifs (responsive web design en anglais) contribue à :</p>
<ul>
  <li>une meilleure inclusion de tous les usagers ;</li>
  <li>une audience supérieure ;</li>
  <li>une rapidité d'accès à l'information, quel que soit l'endroit où se trouve l'utilisateur ;</li>
  <li>une interactivité avec des fonctionnalités enrichies (mode tactile, capteurs, etc.) ;</li>
  <li>une amélioration du référencement.</li>
</ul>`,
      rgaaCriteria: `<div class="rgaa-criteria-list">
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-13" target="_blank" rel="noopener" class="rgaa-badge">13.9<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
</div>`
    },
    'keyboard-navigation': {
      howToCheck: `<ul>
  <li>Le focus clavier (qui permet à l'usager de savoir sur quel élément interactif il se trouve) est clairement visible ;</li>
  <li>Chaque page comporte des liens d'accès rapides vers le contenu principal, le menu (et le moteur de recherche s'il existe) : ces liens sont au tout début de la page, ils sont de préférence visibles en permanence mais peuvent éventuellement ne s'afficher qu'au cours de la navigation au clavier (rafraîchir la page puis actionner la touche de tabulation pour les faire apparaître) ;</li>
  <li>La navigation et l'utilisation peuvent s'effectuer entièrement au clavier dans un ordre prévisible.</li>
</ul>`,
      howKeyboard: `<ul>
  <li>La touche <code>Tab</code> permet de <strong>voir le focus</strong> (le curseur dans la page), de le faire avancer et de <strong>naviguer</strong> entre les éléments interactifs d'une page (liens, boutons, champs de formulaires, onglets, modales, etc.)</li>
  <li>La combinaison <code>Shift</code> + <code>Tab</code> permet de faire reculer le focus</li>
  <li>La touche <code>Entrée</code> permet d'activer l'élément qui a le focus (lien, bouton, menu, etc.)</li>
  <li>La barre <code>Espace</code> permet de cocher ou décocher une case</li>
  <li>Les flèches <code>Haut</code>, <code>Bas</code>, <code>Droite</code> et <code>Gauche</code> permettent de faire défiler l'affichage, se déplacer dans un menu ou des onglets, modifier un choix de bouton radio</li>
</ul>`,
      why: `<p>La navigation au clavier est un des critères centraux de l'accessibilité numérique. De nombreux utilisateurs, souffrant de handicap ou non, naviguent sans souris, avec les touches de leur clavier.</p>
<p>De plus, les dispositifs qui ne reposent pas sur la souris doivent être pris en compte ; notamment, les contenus et l'utilisation des services doivent être accessibles aux utilisateurs d'aides techniques (lecteurs d'écran par exemple) qui n'utilisent que le clavier ou un périphérique plus spécifique reposant sur les mêmes mécanismes que le clavier.</p>
<p><a href="https://www.youtube.com/watch?v=example" target="_blank" rel="noopener" class="external-link">Utilisation de la plage braille et de la synthèse vocale par une personne aveugle (vidéo, 3 minutes 54)<span class="external-link-icon-inline" aria-label="Lien externe">↗</span></a></p>`,
      rgaaCriteria: `<div class="rgaa-criteria-list">
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-4" target="_blank" rel="noopener" class="rgaa-badge">4.11<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-4" target="_blank" rel="noopener" class="rgaa-badge">4.12<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-7" target="_blank" rel="noopener" class="rgaa-badge">7.1<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-7" target="_blank" rel="noopener" class="rgaa-badge">7.3<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-10" target="_blank" rel="noopener" class="rgaa-badge">10.7<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-10" target="_blank" rel="noopener" class="rgaa-badge">10.13<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-10" target="_blank" rel="noopener" class="rgaa-badge">10.14<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.6<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.7<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.8<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.9<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.10<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.11<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
</div>`
    },
    'two-navigation-means': {
      howToCheck: `<p>Vérifier qu'il existe deux moyens de navigation parmi les trois suivants : menu principal, plan du site et moteur de recherche.</p>`,
      why: `<p>Le fait de proposer plusieurs moyens de naviguer permet aux utilisateurs de procéder selon leur préférence ou leur besoin. L'alternative est également importante pour les utilisateurs si l'un des moyens utilisés ne donne pas le résultat attendu.</p>`,
      rgaaCriteria: `<div class="rgaa-criteria-list">
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.1<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.2<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.3<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.4<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.5<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-12" target="_blank" rel="noopener" class="rgaa-badge">12.6<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
</div>`
    },
    'downloadable-files': {
      howToCheck: `<p>Sur l'échantillon, contrôler que :</p>
<ul>
  <li>pour mettre à disposition des documents que le destinataire n'a pas besoin de modifier, il faut utiliser le format PDF ;</li>
  <li>pour diffuser un document de type texte, le format recommandé est ODT ;</li>
  <li>pour diffuser un document de type présentation, le format recommandé est ODP ;</li>
  <li>pour diffuser un document de type feuille de calcul, le format recommandé est ODS.</li>
</ul>
<p>La suite Office n'est pas interdite mais les alternatives ci-dessus doivent être proposées.</p>`,
      why: `<p>Lors de la mise en ligne de fichiers en téléchargement (traitement de texte, images, audio, vidéo, etc.), il est nécessaire de proposer les formats ouverts afin que tout le monde puisse y avoir accès sans avoir à payer pour accéder à un format propriétaire.</p>
<p>Vous pouvez vous référer aux <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/" target="_blank" rel="noopener" class="external-link">guides pour rédiger des documents bureautiques accessibles<span class="external-link-icon-inline" aria-label="Lien externe">↗</span></a></p>`,
      rgaaCriteria: `<div class="rgaa-criteria-list">
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-13" target="_blank" rel="noopener" class="rgaa-badge">13.3<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
  <a href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#criteres-13" target="_blank" rel="noopener" class="rgaa-badge">13.4<span class="external-link-icon" aria-label="Lien externe">↗</span></a>
</div>`
    }
  };
  
  return contents[testId] || {
    howToCheck: t('docHowToCheckContent'),
    why: t('docWhyContent'),
    rgaaCriteria: t('docRGAACriteriaContent')
  };
}

// Initialiser les blocs de documentation
function initDocumentationBlocks() {
  document.querySelectorAll('.doc-toggle').forEach(button => {
    // Éviter les doubles événements
    if (button.hasAttribute('data-doc-initialized')) {
      return;
    }
    button.setAttribute('data-doc-initialized', 'true');
    
    button.addEventListener('click', () => {
      const contentId = button.getAttribute('id').replace('-toggle', '-content');
      const content = document.getElementById(contentId);
      const icon = button.querySelector('.doc-toggle-icon');
      const textSpan = button.querySelector('.doc-toggle-text');
      
      if (content) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
          content.style.display = 'none';
          button.setAttribute('aria-expanded', 'false');
          if (icon) icon.textContent = '▼';
          if (textSpan) textSpan.textContent = t('docShowDocumentation');
        } else {
          content.style.display = 'block';
          button.setAttribute('aria-expanded', 'true');
          if (icon) icon.textContent = '▲';
          if (textSpan) textSpan.textContent = t('docHideDocumentation');
        }
      }
    });
  });
}

