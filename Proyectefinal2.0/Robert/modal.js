// Enhanced modal functionality for all content types
document.addEventListener('DOMContentLoaded', function() {
  // Make sure the modal exists
  if (!document.getElementById('character-modal')) {
    // Create the modal if it doesn't exist
    const modalContainer = document.createElement('div');
    modalContainer.id = 'character-modal';
    modalContainer.className = 'modal';
    modalContainer.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <div class="modal-body">
          <div class="modal-left">
            <img id="modal-image" src="" alt="Character Image">
            <h2 id="modal-name"></h2>
            <div id="modal-favorite-btn" class="modal-favorite-btn">
              <i class="far fa-star"></i> <span data-i18n="modal.addToFavorites">Add to favorites</span>
            </div>
            <div id="modal-view-more-btn" class="modal-view-more-btn">
              <i class="fas fa-external-link-alt"></i> <span data-i18n="modal.viewMore">Ver más</span>
            </div>
          </div>
          <div class="modal-right">
            <div class="modal-info-section">
              <h3 id="modal-universe-title">Universe</h3>
              <p id="modal-universe"></p>
            </div>
            <div class="modal-info-section">
              <h3 id="modal-comics-title">Comics</h3>
              <p id="modal-comics"></p>
            </div>
            <div class="modal-info-section">
              <h3 id="modal-description-title">Description</h3>
              <p id="modal-description"></p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalContainer);
  }
});

// Function to open character modal with details
function openCharacterModal(character, lang) {
  const modal = document.getElementById('character-modal');
  if (!modal) return;
  
  // Set modal data attributes
  modal.setAttribute('data-id', character.id);
  modal.setAttribute('data-type', 'characters');
  
  // Get modal elements
  const modalImage = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalUniverse = document.getElementById('modal-universe');
  const modalComics = document.getElementById('modal-comics');
  const modalDescription = document.getElementById('modal-description');
  const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
  const modalViewMoreBtn = document.getElementById('modal-view-more-btn');
  
  // Set modal content
  if (character.thumbnail) {
    modalImage.src = `${character.thumbnail.path}.${character.thumbnail.extension}`;
    modalImage.alt = character.name;
  }
  
  modalName.textContent = character.name;
  
  // Set universe
  let universeText;
  if (character.universe === '616') {
    universeText = translations[lang]['filters.universe616'] || 'Universe 616 (Main)';
  } else if (character.universe === '1610') {
    universeText = translations[lang]['filters.ultimate'] || 'Ultimate (1610)';
  } else if (character.universe === '199999') {
    universeText = translations[lang]['filters.mcu'] || 'MCU (199999)';
  } else if (character.universe === '10005') {
    universeText = translations[lang]['filters.xmen'] || 'X-Men (10005)';
  } else if (character.universe === '1048') {
    universeText = translations[lang]['filters.spider'] || 'Spider-Verse (1048)';
  } else if (character.universe === '90214') {
    universeText = translations[lang]['filters.noir'] || 'Marvel Noir (90214)';
  } else {
    universeText = translations[lang]['character.universe616'] || 'Universe 616';
  }
  
  modalUniverse.textContent = universeText;
  
  // Set comics count with proper translation
  const comicsAvailable = character.comics?.available || Math.floor(Math.random() * 15) + 5;
  // Crear un elemento span para el contador con estilo destacado
  modalComics.innerHTML = '';
  const comicsLabel = document.createElement('span');
  comicsLabel.classList.add('comics-label');
  
  const comicsCounter = document.createElement('span');
  comicsCounter.classList.add('comics-counter');
  
  if (translations[lang]['character.comicsCount']) {
    const template = translations[lang]['character.comicsCount'];
    comicsCounter.textContent = template.replace('{count}', comicsAvailable);
  } else {
    comicsLabel.textContent = comicsAvailable === 1 ? 'Cómic disponible: ' : 'Cómics disponibles: ';
    comicsCounter.textContent = comicsAvailable;
  }
  
  modalComics.appendChild(comicsLabel);
  modalComics.appendChild(comicsCounter);
  
  // Set description
  if (character.description && character.description.trim() !== '') {
    modalDescription.textContent = character.description;
  } else {
    // Localized "no description available" message
    const noDescriptionText = {
      'es': 'No hay descripción disponible para este personaje.',
      'en': 'No description available for this character.',
      'fr': 'Aucune description disponible pour ce personnage.',
      'ro': 'Nu există descriere disponibilă pentru acest personaj.'
    };
    modalDescription.textContent = noDescriptionText[lang] || noDescriptionText['es'];
  }
  
  // Translate modal labels based on language
  document.getElementById('modal-universe-title').textContent = {
    'es': 'Universo',
    'en': 'Universe',
    'fr': 'Univers',
    'ro': 'Univers'
  }[lang] || 'Universe';
  
  document.getElementById('modal-comics-title').textContent = {
    'es': 'Cómics',
    'en': 'Comics',
    'fr': 'Bandes Dessinées',
    'ro': 'Benzi Desenate'
  }[lang] || 'Comics';
  
  document.getElementById('modal-description-title').textContent = {
    'es': 'Descripción',
    'en': 'Description',
    'fr': 'Description',
    'ro': 'Descriere'
  }[lang] || 'Description';
  
  // Update favorite button
  const isFavorite = isInFavorites(character.id, 'characters');
  if (modalFavoriteBtn) {
    if (isFavorite) {
      modalFavoriteBtn.classList.add('active');
      modalFavoriteBtn.querySelector('i').classList.remove('far');
      modalFavoriteBtn.querySelector('i').classList.add('fas');
      modalFavoriteBtn.querySelector('span').textContent = translations[lang]['modal.removeFromFavorites'] || 'Remove from favorites';
    } else {
      modalFavoriteBtn.classList.remove('active');
      modalFavoriteBtn.querySelector('i').classList.remove('fas');
      modalFavoriteBtn.querySelector('i').classList.add('far');
      modalFavoriteBtn.querySelector('span').textContent = translations[lang]['modal.addToFavorites'] || 'Add to favorites';
    }
  }

  // Set up View More button
  if (modalViewMoreBtn) {
    // Translate view more text based on language
    modalViewMoreBtn.querySelector('span').textContent = {
      'es': 'Ver más',
      'en': 'View more',
      'fr': 'Voir plus',
      'ro': 'Vezi mai mult'
    }[lang] || 'View more';
    
    // Remove existing click listeners to prevent duplicates
    const newViewMoreBtn = modalViewMoreBtn.cloneNode(true);
    modalViewMoreBtn.parentNode.replaceChild(newViewMoreBtn, modalViewMoreBtn);
    
    // Add click listener to open character details in new tab
    newViewMoreBtn.addEventListener('click', function() {
      const characterId = modal.getAttribute('data-id');
      window.open(`/character-details.html?id=${characterId}`, '_blank');
    });
  }
  
  // Show modal with animation
  modal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
  
  // Setup event listeners
  setupModalEventListeners();
}

// Function to open comic modal with details (also used for series and events)
function openComicModal(comic, lang) {
  const modal = document.getElementById('character-modal');
  if (!modal) return;
  
  // Set modal data attributes
  modal.setAttribute('data-id', comic.id);
  modal.setAttribute('data-type', 'comics');
  
  // Get modal elements
  const modalImage = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalUniverse = document.getElementById('modal-universe');
  const modalComics = document.getElementById('modal-comics');
  const modalDescription = document.getElementById('modal-description');
  const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
  const modalViewMoreBtn = document.getElementById('modal-view-more-btn');
  
  // Set modal content
  if (comic.thumbnail) {
    modalImage.src = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
    modalImage.alt = comic.title || comic.name;
  }
  
  modalName.textContent = comic.title || comic.name;
  
  // Get universe (from series or universe property)
  let universeText = 'Unknown';
  if (comic.series && comic.series.name) {
    universeText = comic.series.name;
  } else if (comic.universe) {
    // Map universe code to display text
    if (comic.universe === '616') {
      universeText = translations[lang]['filters.universe616'] || 'Universe 616 (Main)';
    } else if (comic.universe === '1610') {
      universeText = translations[lang]['filters.ultimate'] || 'Ultimate (1610)';
    } else if (comic.universe === '199999') {
      universeText = translations[lang]['filters.mcu'] || 'MCU (199999)';
    } else if (comic.universe === '10005') {
      universeText = translations[lang]['filters.xmen'] || 'X-Men (10005)';
    } else if (comic.universe === '1048') {
      universeText = translations[lang]['filters.spider'] || 'Spider-Verse (1048)';
    } else if (comic.universe === '90214') {
      universeText = translations[lang]['filters.noir'] || 'Marvel Noir (90214)';
    }
  }
  
  modalUniverse.textContent = universeText;
  
  // Show issue number or year instead of comics count
  let detailsText = '';
  if (comic.issueNumber) {
    if (lang === 'es') detailsText = `Número ${comic.issueNumber}`;
    else if (lang === 'en') detailsText = `Issue ${comic.issueNumber}`;
    else if (lang === 'fr') detailsText = `Numéro ${comic.issueNumber}`;
    else if (lang === 'ro') detailsText = `Numărul ${comic.issueNumber}`;
  } else if (comic.startYear) {
    if (lang === 'es') detailsText = `Año ${comic.startYear}`;
    else if (lang === 'en') detailsText = `Year ${comic.startYear}`;
    else if (lang === 'fr') detailsText = `Année ${comic.startYear}`;
    else if (lang === 'ro') detailsText = `Anul ${comic.startYear}`;
  } else if (comic.year) {
    if (lang === 'es') detailsText = `Año ${comic.year}`;
    else if (lang === 'en') detailsText = `Year ${comic.year}`;
    else if (lang === 'fr') detailsText = `Année ${comic.year}`;
    else if (lang === 'ro') detailsText = `Anul ${comic.year}`;
  }
  
  modalComics.textContent = detailsText;
  
  // Change the title of the comics section
  const contentType = modal.getAttribute('data-type');
  if (contentType === 'comics') {
    document.getElementById('modal-comics-title').textContent = {
      'es': 'Detalles',
      'en': 'Details',
      'fr': 'Détails',
      'ro': 'Detalii'
    }[lang] || 'Details';
  } else if (contentType === 'series') {
    document.getElementById('modal-comics-title').textContent = {
      'es': 'Años',
      'en': 'Years',
      'fr': 'Années',
      'ro': 'Ani'
    }[lang] || 'Years';
  } else if (contentType === 'events') {
    document.getElementById('modal-comics-title').textContent = {
      'es': 'Fechas',
      'en': 'Dates',
      'fr': 'Dates',
      'ro': 'Date'
    }[lang] || 'Dates';
  } else if (contentType === 'movies') {
    document.getElementById('modal-comics-title').textContent = {
      'es': 'Año',
      'en': 'Year',
      'fr': 'Année',
      'ro': 'An'
    }[lang] || 'Year';
  }
  
  // Set description
  if (comic.description && comic.description.trim() !== '') {
    modalDescription.textContent = comic.description;
  } else {
    // Localized "no description available" message
    const noDescriptionText = {
      'es': 'No hay descripción disponible.',
      'en': 'No description available.',
      'fr': 'Aucune description disponible.',
      'ro': 'Nu există descriere disponibilă.'
    };
    modalDescription.textContent = noDescriptionText[lang] || noDescriptionText['es'];
  }
  
  // Translate modal labels for universe and description
  document.getElementById('modal-universe-title').textContent = {
    'es': 'Universo',
    'en': 'Universe',
    'fr': 'Univers',
    'ro': 'Univers'
  }[lang] || 'Universe';
  
  document.getElementById('modal-description-title').textContent = {
    'es': 'Descripción',
    'en': 'Description',
    'fr': 'Description',
    'ro': 'Descriere'
  }[lang] || 'Description';
  
  // Update favorite button
  const isFavorite = isInFavorites(comic.id, 'comics');
  if (modalFavoriteBtn) {
    if (isFavorite) {
      modalFavoriteBtn.classList.add('active');
      modalFavoriteBtn.querySelector('i').classList.remove('far');
      modalFavoriteBtn.querySelector('i').classList.add('fas');
      modalFavoriteBtn.querySelector('span').textContent = translations[lang]['modal.removeFromFavorites'] || 'Remove from favorites';
    } else {
      modalFavoriteBtn.classList.remove('active');
      modalFavoriteBtn.querySelector('i').classList.remove('fas');
      modalFavoriteBtn.querySelector('i').classList.add('far');
      modalFavoriteBtn.querySelector('span').textContent = translations[lang]['modal.addToFavorites'] || 'Add to favorites';
    }
  }

  // Set up View More button
  if (modalViewMoreBtn) {
    // Translate view more text based on language
    modalViewMoreBtn.querySelector('span').textContent = {
      'es': 'Ver más',
      'en': 'View more',
      'fr': 'Voir plus',
      'ro': 'Vezi mai mult'
    }[lang] || 'View more';
    
    // Remove existing click listeners to prevent duplicates
    const newViewMoreBtn = modalViewMoreBtn.cloneNode(true);
    modalViewMoreBtn.parentNode.replaceChild(newViewMoreBtn, modalViewMoreBtn);
    
    // Add click listener to open comic details in new tab
    newViewMoreBtn.addEventListener('click', function() {
      const comicId = modal.getAttribute('data-id');
      const contentType = modal.getAttribute('data-type');
      window.open(`/${contentType}-details.html?id=${comicId}`, '_blank');
    });
  }
  
  // Show modal with animation
  modal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
  
  // Setup event listeners
  setupModalEventListeners();
}

// Function to open any content modal based on type
function openContentModal(item, lang, type) {
  // Set the item's type if not specified
  if (!type) {
    if (item.name && !item.title) {
      type = 'characters';
    } else if (item.title && item.issueNumber) {
      type = 'comics';
    } else if (item.title && item.startYear) {
      type = 'series';
    } else if (item.title && item.year) {
      type = 'movies';
    } else {
      type = 'events';
    }
  }
  
  // Call the appropriate modal opener
  if (type === 'characters') {
    openCharacterModal(item, lang);
  } else {
    // Comics, series, events and movies all use the comic modal
    openComicModal(item, lang);
  }
}

// Setup event listeners for modal
function setupModalEventListeners() {
  const modal = document.getElementById('character-modal');
  const closeBtn = document.querySelector('.close-modal');
  
  if (!modal || !closeBtn) return;
  
  // Remove existing listeners to prevent duplicates
  const newCloseBtn = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
  
  // Close modal when clicking the X button
  newCloseBtn.addEventListener('click', closeModal);
  
  // Close modal when clicking outside the modal content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
}

// Function to close modal
function closeModal() {
  const modal = document.getElementById('character-modal');
  if (!modal) return;
  
  modal.classList.remove('show');
  document.body.style.overflow = ''; // Restore scrolling
}
