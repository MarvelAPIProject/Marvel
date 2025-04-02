// Add modal functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add modal HTML to the page
    const modalHTML = document.getElementById('character-modal');
    if (!modalHTML) {
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
  
    // Update displayCharacters function to replace comics count with View More button
    const originalDisplayCharacters = window.displayCharacters;
    
    window.displayCharacters = function(characters) {
      const cardContainer = document.getElementById("card-container");
      
      if (!cardContainer) {
        console.error("Card container element not found");
        return;
      }
      
      const template = document.getElementById("card-template");
      
      if (!template) {
        console.error("Card template element not found");
        createCardTemplate();
        return displayCharacters(characters);
      }
      
      const errorContainer = document.getElementById("error-message");
      
      // Clear error message
      if (errorContainer) {
        errorContainer.textContent = "";
      }
  
      // Store the current applied styles before clearing
      const currentStyles = getComputedStyle(cardContainer);
      const gridStyle = {
        display: currentStyles.display,
        gridTemplateColumns: currentStyles.gridTemplateColumns,
        gap: currentStyles.gap
      };
  
      cardContainer.innerHTML = ""; // Clear container before adding new cards
      
      // Reapply grid styles if they were set
      if (gridStyle.display.includes('grid')) {
        cardContainer.style.display = gridStyle.display;
        cardContainer.style.gridTemplateColumns = gridStyle.gridTemplateColumns;
        cardContainer.style.gap = gridStyle.gap;
      } else {
        // Default grid style if not set
        cardContainer.style.display = 'grid';
        cardContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        cardContainer.style.gap = '20px';
      }
  
      if (characters.length === 0) {
        displayError("No se encontraron personajes.");
        return;
      }
  
      characters.forEach(character => {
        // --- VERIFICAR IMAGEN ANTES DE MOSTRAR ---
        const noImageAvailable = 
          !character.thumbnail || 
          !character.thumbnail.path || 
          character.thumbnail.path.includes('image_not_available');
  
        // Si NO tiene imagen, ignoramos este personaje (no se muestra)
        if (noImageAvailable) {
          return; // <- Esto hace que el bucle pase al siguiente personaje
        }
  
        // Choose the correct way to clone based on whether it's a <template> or a regular element
        let cardClone;
        
        if (template.content) {
          // It's a proper <template> element
          cardClone = template.content.cloneNode(true);
          cardClone = cardClone.firstElementChild;
        } else {
          // It's a regular DOM element
          cardClone = template.cloneNode(true);
          
          // If the template has the 'display: none' style, remove it for the clone
          if (template.style.display === 'none') {
            cardClone.style.display = 'block';
          }
        }
        
        if (!cardClone) {
          console.error("Failed to clone card template");
          return;
        }
        
        cardClone.removeAttribute('id'); // Remove duplicate ID
        
        // Card elements
        const img = cardClone.querySelector(".character-image");
        const name = cardClone.querySelector(".character-name");
        const comicsCount = cardClone.querySelector(".character-comics");
        const universeBadge = cardClone.querySelector(".universe-badge");
        
        if (!img || !name || !comicsCount || !universeBadge) {
          console.error("Missing elements in card template", {img, name, comicsCount, universeBadge});
          return;
        }
  
        // Configure image
        if (character.thumbnail && character.thumbnail.path) {
          img.src = `${character.thumbnail.path}.${character.thumbnail.extension}`;
          img.alt = character.name || "Personaje Marvel";
          
          if (character.thumbnail.path.includes('image_not_available')) {
            img.classList.add('no-image');
          }
        } else {
          // If no image available
          img.classList.add('no-image');
          img.alt = "Imagen no disponible";
        }
  
        // Configure name
        name.textContent = character.name || "Nombre desconocido";
  
        // Get the current language and apply the correct text format
        const languageSelector = document.getElementById('language-selector-improved');
        const currentLang = languageSelector ? languageSelector.value : 'es';
        
        // Store comics count as data attribute for use in modal
        const comicsAvailable = character.comics?.available || 0;
        comicsCount.setAttribute('data-comics', comicsAvailable);
        
        // Replace comics count with "View More" button
        comicsCount.classList.replace('character-comics', 'view-more-btn');
        
        // Set button text based on language
        const viewMoreText = {
          'es': 'Ver más',
          'en': 'View more',
          'fr': 'Voir plus',
          'ro': 'Vezi mai mult'
        };
        
        comicsCount.textContent = viewMoreText[currentLang] || viewMoreText['es'];
        
        // Add click event to open modal
        comicsCount.addEventListener('click', function(e) {
          e.stopPropagation();
          openCharacterModal(character, currentLang);
        });
  
        // Configure universe
        let universeText;
        
        // Map universe code to display text based on filter translations
        if (character.universe === '616') {
          universeText = translations[currentLang]['filters.universe616']?.split(' ')[0] || 'Universo 616';
        } else if (character.universe === '1610') {
          universeText = translations[currentLang]['filters.ultimate']?.split(' ')[0] || 'Ultimate';
        } else if (character.universe === '199999') {
          universeText = 'MCU';
        } else if (character.universe === '10005') {
          universeText = 'X-Men';
        } else if (character.universe === '1048') {
          universeText = translations[currentLang]['filters.spider']?.split(' ')[0] || 'Spider-Verse';
        } else if (character.universe === '90214') {
          universeText = translations[currentLang]['filters.noir']?.split(' ')[0] || 'Noir';
        } else {
          universeText = translations[currentLang]['character.universe616'] || 'Universo 616';
        }
        
        universeBadge.textContent = universeText;
        
        // Store character data for modal access
        cardClone.setAttribute('data-character-id', character.id);
        
        cardContainer.appendChild(cardClone);
      });
      
      // Add event listeners for modal interactions
      setupModalEventListeners();
    };
  
    // Function to open character modal with details
    function openCharacterModal(character, lang) {
      const modal = document.getElementById('character-modal');
      if (!modal) return;
      
      // Get modal elements
      const modalImage = document.getElementById('modal-image');
      const modalName = document.getElementById('modal-name');
      const modalUniverse = document.getElementById('modal-universe');
      const modalComics = document.getElementById('modal-comics');
      const modalDescription = document.getElementById('modal-description');
      
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
      const comicsAvailable = character.comics?.available || 0;
      if (translations[lang]['character.comicsCount']) {
        const template = translations[lang]['character.comicsCount'];
        modalComics.textContent = template.replace('{count}', comicsAvailable);
      } else {
        modalComics.textContent = `${comicsAvailable} ${comicsAvailable === 1 ? 'cómic' : 'cómics'}`;
      }
      
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
      
      // Show modal with animation
      modal.classList.add('show');
      document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    }
  
    // Setup event listeners for modal
    function setupModalEventListeners() {
      const modal = document.getElementById('character-modal');
      const closeBtn = document.querySelector('.close-modal');
      
      if (!modal || !closeBtn) return;
      
      // Close modal when clicking the X button
      closeBtn.addEventListener('click', closeModal);
      
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
  
    // Add CSS styles for modal if they don't exist
    if (!document.getElementById('marvel-modal-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'marvel-modal-styles';
      styleElement.textContent = `
        /* Modal Styles */
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(5px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
  
        .modal.show {
          display: block;
          opacity: 1;
        }
  
        .modal-content {
          background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
          margin: 5% auto;
          width: 80%;
          max-width: 900px;
          border-radius: 16px;
          box-shadow: 0 15px 50px rgba(230, 36, 41, 0.4), 
                      0 5px 20px rgba(0, 0, 0, 0.7);
          border: 2px solid var(--rojito);
          overflow: hidden;
          position: relative;
          transform: translateY(-30px);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
  
        .modal.show .modal-content {
          transform: translateY(0);
          opacity: 1;
        }
  
        .close-modal {
          position: absolute;
          top: 15px;
          right: 20px;
          color: var(--blanquito);
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s ease;
        }
  
        .close-modal:hover {
          color: var(--rojito);
          transform: scale(1.2);
        }
  
        .modal-body {
          display: flex;
          flex-direction: row;
          padding: 0;
        }
  
        .modal-left {
          flex: 0 0 40%;
          position: relative;
          display: flex;
          flex-direction: column;
        }
  
        .modal-left img {
          width: 100%;
          height: 400px;
          object-fit: cover;
          object-position: top center;
        }
  
        .modal-left h2 {
          background-color: rgba(0, 0, 0, 0.7);
          color: var(--blanquito);
          padding: 15px;
          margin: 0;
          font-size: 1.8rem;
          position: absolute;
          bottom: 0;
          width: 100%;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          border-left: 4px solid var(--rojito);
        }
  
        .modal-right {
          flex: 0 0 60%;
          padding: 25px;
          color: var(--blanquito);
          max-height: 500px;
          overflow-y: auto;
        }
  
        .modal-info-section {
          margin-bottom: 20px;
        }
  
        .modal-info-section h3 {
          color: var(--rojito);
          font-size: 1.3rem;
          margin-bottom: 5px;
          position: relative;
          display: inline-block;
        }
  
        .modal-info-section h3::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--rojito);
        }
  
        .modal-info-section p {
          line-height: 1.6;
          margin: 8px 0;
        }
  
        /* Style for "View More" button replacing comics count */
        .view-more-btn {
          background-color: var(--rojito);
          color: var(--blanquito);
          padding: 8px 15px;
          border: none;
          border-radius: 20px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
  
        .view-more-btn:hover {
          background-color: #c41f24;
          transform: translateY(-2px);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
        }
  
        .view-more-btn::after {
          content: '→';
          margin-left: 5px;
          font-size: 1rem;
          transition: transform 0.2s ease;
        }
  
        .view-more-btn:hover::after {
          transform: translateX(3px);
        }
  
        /* Responsive design for modal */
        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            margin: 10% auto;
          }
          
          .modal-body {
            flex-direction: column;
          }
          
          .modal-left, .modal-right {
            flex: 0 0 100%;
          }
          
          .modal-left img {
            height: 300px;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }
  });