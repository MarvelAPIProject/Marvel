const translations = {
  "es": {
    "header.title": "Marvel",
    "header.subtitle": "Explora el vasto universo de personajes, cómics y series de Marvel",
    "idioma": "Idioma:",
    "search.placeholder": "¿Qué superhéroe buscas?",
    "search.button": "Buscar",
    "filters.title": "Filtrar por Universo",
    "filters.all": "Todos",
    "filters.universe616": "Universo 616 (Principal)",
    "filters.ultimate": "Ultimate (1610)",
    "filters.mcu": "MCU (199999)",
    "filters.xmen": "X-Men (10005)",
    "filters.spider": "Spider-Verse (1048)",
    "filters.noir": "Marvel Noir (90214)",
    "character.universe616": "Universo 616",
    "character.comicsCount": "{count} cómics ",
    "footer.developed": "Desarrollado por el grupo CSS",
    "footer.rights": "© 2025 MARVEL. Todos los derechos reservados.",
    "footer.marvelInfo": "Los personajes y logotipos de Marvel son propiedad de <a href=\"https://developer.marvel.com/\" target=\"_blank\">Marvel Entertainment</a>",
    "footer.educational": "Este sitio es un proyecto educativo sin fines comerciales.",
    "pagination.page": "Página",
    "pagination.of": "de",
    "pagination.characters": "personajes",
    "pagination.loading": "Cargando personajes..."
  },
  "en": {
    "header.title": "Marvel",
    "header.subtitle": "Explore the vast universe of Marvel characters, comics and series",
    "idioma": "Language:",
    "search.placeholder": "Which superhero are you looking for?",
    "search.button": "Search",
    "filters.title": "Filter by Universe",
    "filters.all": "All",
    "filters.universe616": "Universe 616 (Main)",
    "filters.ultimate": "Ultimate (1610)",
    "filters.mcu": "MCU (199999)",
    "filters.xmen": "X-Men (10005)",
    "filters.spider": "Spider-Verse (1048)",
    "filters.noir": "Marvel Noir (90214)",
    "character.universe616": "Universe 616",
    "character.comicsCount": "{count} comics ",
    "footer.developed": "Developed by CSS group",
    "footer.rights": "© 2025 MARVEL. All rights reserved.",
    "footer.marvelInfo": "Marvel characters and logos are property of <a href=\"https://developer.marvel.com/\" target=\"_blank\">Marvel Entertainment</a>",
    "footer.educational": "This site is an educational project with no commercial purpose.",
    "pagination.page": "Page",
    "pagination.of": "of",
    "pagination.characters": "characters",
    "pagination.loading": "Loading characters..."
  },
  "fr": {
    "header.title": "Marvel",
    "header.subtitle": "Explorez le vaste univers des personnages, bandes dessinées et séries Marvel",
    "idioma": "Langue:",
    "search.placeholder": "Quel super-héros cherchez-vous?",
    "search.button": "Rechercher",
    "filters.title": "Filtrer par Univers",
    "filters.all": "Tous",
    "filters.universe616": "Univers 616 (Principal)",
    "filters.ultimate": "Ultimate (1610)",
    "filters.mcu": "MCU (199999)",
    "filters.xmen": "X-Men (10005)",
    "filters.spider": "Spider-Verse (1048)",
    "filters.noir": "Marvel Noir (90214)",
    "character.universe616": "Univers 616",
    "character.comicsCount": "{count} bandes dessinées ",
    "footer.developed": "Développé par le groupe CSS",
    "footer.rights": "© 2025 MARVEL. Tous droits réservés.",
    "footer.marvelInfo": "Les personnages et logos Marvel sont la propriété de <a href=\"https://developer.marvel.com/\" target=\"_blank\">Marvel Entertainment</a>",
    "footer.educational": "Ce site est un projet éducatif sans but commercial.",
    "pagination.page": "Page",
    "pagination.of": "de",
    "pagination.characters": "personnages",
    "pagination.loading": "Chargement des personnages..."
  },
  "ro": {
    "header.title": "Marvel",
    "header.subtitle": "Explorează universul vast de personaje, benzi desenate și serii Marvel",
    "idioma": "Limbă:",
    "search.placeholder": "Ce super-erou cauți?",
    "search.button": "Caută",
    "filters.title": "Filtrează după Univers",
    "filters.all": "Toate",
    "filters.universe616": "Universul 616 (Principal)",
    "filters.ultimate": "Ultimate (1610)",
    "filters.mcu": "MCU (199999)",
    "filters.xmen": "X-Men (10005)",
    "filters.spider": "Spider-Verse (1048)",
    "filters.noir": "Marvel Noir (90214)",
    "character.universe616": "Universul 616",
    "character.comicsCount": "{count} benzi desenate ",
    "footer.developed": "Dezvoltat de grupul CSS",
    "footer.rights": "© 2025 MARVEL. Toate drepturile rezervate.",
    "footer.marvelInfo": "Personajele și logo-urile Marvel sunt proprietatea <a href=\"https://developer.marvel.com/\" target=\"_blank\">Marvel Entertainment</a>",
    "footer.educational": "Acest site este un proiect educațional fără scop comercial.",
    "pagination.page": "Pagina",
    "pagination.of": "din",
    "pagination.characters": "personaje",
    "pagination.loading": "Se încarcă personajele..."
  }
};

// Function to load CryptoJS library if it's not already available
function loadCryptoJS() {
  return new Promise((resolve, reject) => {
    if (window.CryptoJS) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load CryptoJS'));
    document.head.appendChild(script);
  });
}

// Style for the language selector
const style = document.createElement('style');
style.textContent = `
  .language-selector-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 0;
  }
  
  .language-selector {
    padding: 6px 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
    background-color: white;
    cursor: pointer;
    font-size: 14px;
  }
  
  .language-label {
    font-weight: 500;
  }
`;
document.head.appendChild(style);

// Create improved language selector
function createLanguageSelector() {
  // Get existing language selector and its parent
  const existingSelector = document.getElementById('language-selector');
  if (!existingSelector) {
    console.error('Language selector element not found');
    // Create a new element if it doesn't exist
    const header = document.querySelector('header') || document.body;
    const container = document.createElement('div');
    container.id = 'language-selector';
    container.className = 'language-selector-wrapper';
    header.appendChild(container);
    return createLanguageSelector(); // Try again
  }
  
  const parent = existingSelector.parentNode;
  
  // Create new container
  const container = document.createElement('div');
  container.className = 'language-selector-container';
  
  // Create label
  const label = document.createElement('label');
  label.className = 'language-label';
  label.setAttribute('for', 'language-selector-improved');
  label.textContent = translations['es']['idioma']; // Default to Spanish
  label.setAttribute('data-i18n', 'idioma');
  
  // Create new select element
  const select = document.createElement('select');
  select.id = 'language-selector-improved';
  select.className = 'language-selector';
  
  // Languages with their display names and flag codes
  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ro', name: 'Română', flag: '🇷🇴' }
  ];
  
  // Create options
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = `${lang.flag} ${lang.name}`;
    option.selected = lang.code === 'es'; // Default to Spanish
    select.appendChild(option);
  });
  
  // Build the selector
  container.appendChild(label);
  container.appendChild(select);
  
  // Replace the old selector
  parent.replaceChild(container, existingSelector);
  
  return select;
}

// Function to update text content based on selected language
function updateLanguage(lang) {
  if (!translations[lang]) {
    console.error(`Translation for language "${lang}" not found`);
    return;
  }
  
  // Save selected language to localStorage for persistence
  localStorage.setItem('selectedLanguage', lang);
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang][key]) {
      // Check if the translation contains HTML
      if (translations[lang][key].includes('<')) {
        element.innerHTML = translations[lang][key];
      } else {
        element.textContent = translations[lang][key];
      }
    }
  });
  
  // Update placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      element.placeholder = translations[lang][key];
    }
  });
  
  // Handle special case for comics count
  document.querySelectorAll('[data-comics]').forEach(element => {
    const count = element.getAttribute('data-comics');
    const template = translations[lang]['character.comicsCount'];
    element.textContent = template.replace('{count}', count);
  });
  
  // Update document title
  if (translations[lang]['header.title']) {
    document.title = 'Marvel Universe Explorer'; // Keep the same title across languages
  }
  
  // Update pagination text if it exists
  updatePaginationText();
}

// Function to update pagination text based on current language
function updatePaginationText() {
  const pageInfo = document.querySelector('.pagination-info');
  const languageSelector = document.getElementById('language-selector-improved');
  
  if (pageInfo && languageSelector && typeof totalCharacters !== 'undefined' && typeof currentPage !== 'undefined' && typeof charactersPerPage !== 'undefined') {
    const currentLang = languageSelector.value || 'es';
    const totalPages = Math.ceil(totalCharacters / charactersPerPage);
    
    const paginationTranslations = {
      'es': `Página ${currentPage} de ${totalPages} (${totalCharacters} personajes)`,
      'en': `Page ${currentPage} of ${totalPages} (${totalCharacters} characters)`,
      'fr': `Page ${currentPage} sur ${totalPages} (${totalCharacters} personnages)`,
      'ro': `Pagina ${currentPage} din ${totalPages} (${totalCharacters} personaje)`
    };
    
    pageInfo.textContent = paginationTranslations[currentLang];
  }
}

// Marvel API configuration
const publicKey = 'dd0b4fdacdd0b53c744fb36389d154db';
const privateKey = '360fa86fb66f723c45b84fb38e08c7477fbf29f2';
const baseUrl = 'https://gateway.marvel.com/v1/public';

// Function to generate hash
async function generateHash(ts) {
  await loadCryptoJS(); // Ensure CryptoJS is loaded
  
  const tsString = ts.toString();
  return CryptoJS.MD5(tsString + privateKey + publicKey).toString();
}

// Pagination and filter variables
let currentPage = 1;
const charactersPerPage = 10;
let totalCharacters = 0;
let currentSearchTerm = '';
let currentUniverseFilter = 'all';

// Marvel universe mapping - this maps filter IDs to actual Marvel universe identifiers
const universeMapping = {
  'all': null,
  'universe616': '616',
  'ultimate': '1610',
  'mcu': '199999',
  'xmen': '10005',
  'spider': '1048',
  'noir': '90214'
};

// Mock data for when the API call fails or for testing
const mockCharacters = [
  {
    id: 1009610,
    name: "Spider-Man",
    description: "Bitten by a radioactive spider, high school student Peter Parker gained the speed, strength and powers of a spider.",
    thumbnail: {
      path: "https://i.annihil.us/u/prod/marvel/i/mg/3/50/526548a343e4b",
      extension: "jpg"
    },
    comics: { available: 4747 },
    universe: "616"
  },
  {
    id: 1009368,
    name: "Iron Man",
    description: "Wounded, captured and forced to build a weapon by his enemies, billionaire industrialist Tony Stark instead created an advanced suit of armor to save his life and escape captivity.",
    thumbnail: {
      path: "https://i.annihil.us/u/prod/marvel/i/mg/9/c0/527bb7b37ff55",
      extension: "jpg"
    },
    comics: { available: 2610 },
    universe: "616"
  },
  {
    id: 1009220,
    name: "Captain America",
    description: "Vowing to serve his country any way he could, young Steve Rogers took the super soldier serum to become America's one-man army.",
    thumbnail: {
      path: "https://i.annihil.us/u/prod/marvel/i/mg/3/50/537ba56d31087",
      extension: "jpg"
    },
    comics: { available: 2305 },
    universe: "616"
  }
];

// Fetch characters with filters
async function fetchCharacters(searchTerm = '', page = 1, universeFilter = 'all') {
  try {
    await loadCryptoJS(); // Ensure CryptoJS is loaded
    
    const ts = Math.floor(Date.now() / 1000);
    const hash = await generateHash(ts);
    
    const params = new URLSearchParams({
      ts: ts.toString(),
      apikey: publicKey,
      hash: hash,
      limit: charactersPerPage.toString(),
      offset: ((page - 1) * charactersPerPage).toString()
    });

    if (searchTerm) {
      params.append('nameStartsWith', searchTerm);
    }
    
    // Add additional parameters for universe filter if not "all"
    if (universeFilter !== 'all' && universeMapping[universeFilter]) {
      // Note: Marvel API doesn't directly support filtering by universe in their REST API
      // In a real implementation, you might need to fetch all and filter client-side,
      // or use a custom API endpoint that supports this filtering
      // For now, we'll add a theoretical parameter
      params.append('universe', universeMapping[universeFilter]);
    }

    const url = `${baseUrl}/characters?${params.toString()}`;
    
    console.group('🕵️ Marvel API Debug');
    console.log("🟢 URL de la petición:", url);
    console.log("Timestamp:", ts);
    console.log("Hash generado:", hash);
    console.log("Filtro de universo:", universeFilter);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log("Estado de la respuesta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Detalles del error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("✅ Datos recibidos:", data);
      console.groupEnd();

      // Update total characters count for pagination
      totalCharacters = data.data.total;
      
      let characters = data.data.results;
      
      // Apply universe filter client-side if the API doesn't support it
      // This is a workaround since Marvel API doesn't support universe filtering directly
      if (universeFilter !== 'all' && universeMapping[universeFilter]) {
        // In a real implementation, you'd map characters to their universes based on your data
        // For now, we'll simulate this by assigning a universe to each character
        characters = characters.map(character => {
          // Simulate universe assignment based on character ID
          const universeId = character.id % 6;
          let universe;
          
          switch(universeId) {
            case 0: universe = '616'; break;
            case 1: universe = '1610'; break;
            case 2: universe = '199999'; break;
            case 3: universe = '10005'; break;
            case 4: universe = '1048'; break;
            case 5: universe = '90214'; break;
            default: universe = '616';
          }
          
          return {...character, universe};
        });
        
        // Filter characters by selected universe
        characters = characters.filter(character => character.universe === universeMapping[universeFilter]);
        
        // Update total for client-side filtering
        totalCharacters = characters.length;
      } else {
        // Add universe info to all characters
        characters = characters.map(character => {
          // Simulate universe assignment based on character ID
          const universeId = character.id % 6;
          let universe;
          
          switch(universeId) {
            case 0: universe = '616'; break;
            case 1: universe = '1610'; break;
            case 2: universe = '199999'; break;
            case 3: universe = '10005'; break;
            case 4: universe = '1048'; break;
            case 5: universe = '90214'; break;
            default: universe = '616';
          }
          
          return {...character, universe};
        });
      }
      
      return characters;
    } catch (error) {
      console.error("❌ Error completo:", error);
      console.groupEnd();
      
      displayError('Error al cargar los personajes. Usando datos de muestra.');
      // Return mock data for testing or when API call fails
      totalCharacters = mockCharacters.length;
      return mockCharacters;
    }
  } catch (error) {
    console.error("Error loading CryptoJS or generating hash:", error);
    displayError('Error en la configuración. Usando datos de muestra.');
    // Return mock data as fallback
    totalCharacters = mockCharacters.length;
    return mockCharacters;
  }
}

function displayCharacters(characters) {
  const cardContainer = document.getElementById("card-container");
  
  if (!cardContainer) {
    console.error("Card container element not found");
    return;
  }
  
  const template = document.getElementById("card-template");
  
  if (!template) {
    console.error("Card template element not found");
    // Create a basic template if it doesn't exist
    createCardTemplate();
    displayCharacters(characters); // Try again
    return;
  }
  
  const errorContainer = document.getElementById("error-message");
  
  // Clear error message
  if (errorContainer) {
    errorContainer.textContent = "";
  }

  cardContainer.innerHTML = ""; // Clear container before adding new cards

  if (characters.length === 0) {
    displayError("No se encontraron personajes.");
    return;
  }

  characters.forEach(character => {
    const cardClone = template.content ? template.content.cloneNode(true).firstElementChild : template.cloneNode(true);
    cardClone.style.display = "block";
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

    // Configure comics count
    const comicsAvailable = character.comics?.available || 0;
    comicsCount.textContent = `${comicsAvailable} ${comicsAvailable === 1 ? 'cómic' : 'cómics'}`;
    comicsCount.setAttribute('data-comics', comicsAvailable);

    // Configure universe
    let universeText;
    const languageSelector = document.getElementById('language-selector-improved');
    const currentLang = languageSelector ? languageSelector.value : 'es';
    
    // Map universe code to display text based on filter translations
    if (character.universe === '616') {
      universeText = translations[currentLang]['filters.universe616'].split(' ')[0];
    } else if (character.universe === '1610') {
      universeText = translations[currentLang]['filters.ultimate'].split(' ')[0];
    } else if (character.universe === '199999') {
      universeText = 'MCU';
    } else if (character.universe === '10005') {
      universeText = 'X-Men';
    } else if (character.universe === '1048') {
      universeText = translations[currentLang]['filters.spider'].split(' ')[0];
    } else if (character.universe === '90214') {
      universeText = translations[currentLang]['filters.noir'].split(' ')[0];
    } else {
      universeText = translations[currentLang]['character.universe616'];
    }
    
    universeBadge.textContent = universeText;
    
    cardContainer.appendChild(cardClone);
  });
}

// Create a basic card template if it doesn't exist
function createCardTemplate() {
  if (document.getElementById('card-template')) {
    return; // Template already exists
  }
  
  const template = document.createElement('template');
  template.id = 'card-template';
  
  template.innerHTML = `
    <div class="character-card">
      <img class="character-image" src="" alt="Marvel Character">
      <div class="character-info">
        <h3 class="character-name"></h3>
        <p class="character-comics" data-comics="0"></p>
        <span class="universe-badge"></span>
      </div>
    </div>
  `;
  
  document.body.appendChild(template);
}

// Function to display errors
function displayError(message) {
  // Try to find error container
  let errorContainer = document.getElementById('error-container');
  let errorMessage = document.getElementById('error-message');
  
  // Create error elements if they don't exist
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    errorContainer.className = 'error-container';
    errorContainer.style.padding = '10px';
    errorContainer.style.margin = '10px 0';
    errorContainer.style.backgroundColor = '#ffebee';
    errorContainer.style.color = '#b71c1c';
    errorContainer.style.borderRadius = '4px';
    
    // Find a good place to insert it
    const cardContainer = document.getElementById('card-container');
    if (cardContainer) {
      cardContainer.parentNode.insertBefore(errorContainer, cardContainer);
    } else {
      // Fallback to body
      document.body.appendChild(errorContainer);
    }
  }
  
  if (!errorMessage) {
    errorMessage = document.createElement('p');
    errorMessage.id = 'error-message';
    errorContainer.appendChild(errorMessage);
  }
  
  errorMessage.textContent = message;
  errorContainer.style.display = "block";
}

// Create pagination controls
function createPagination() {
  if (typeof totalCharacters === 'undefined' || typeof charactersPerPage === 'undefined' || typeof currentPage === 'undefined') {
    console.error("Pagination variables not defined");
    return;
  }
  
  const totalPages = Math.ceil(totalCharacters / charactersPerPage);
  
  // Create pagination container if it doesn't exist
  let paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.className = 'pagination';
    paginationContainer.style.display = 'flex';
    paginationContainer.style.justifyContent = 'center';
    paginationContainer.style.alignItems = 'center';
    paginationContainer.style.gap = '10px';
    paginationContainer.style.margin = '20px 0';
    
    // Add pagination container after the cards grid
    const cardsGrid = document.getElementById('card-container');
    if (cardsGrid) {
      cardsGrid.parentNode.insertBefore(paginationContainer, cardsGrid.nextSibling);
    } else {
      // Fallback to body
      document.body.appendChild(paginationContainer);
    }
  } else {
    paginationContainer.innerHTML = '';
  }
  
  // Don't show pagination if there's only one page or no results
  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';
    return;
  } else {
    paginationContainer.style.display = 'flex';
  }
  
  // Create "Previous" button
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-button prev-button';
  prevButton.textContent = '❮';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  });
  paginationContainer.appendChild(prevButton);
  
  // Create page number buttons
  const maxButtons = 5; // Maximum number of page buttons to show
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  
  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  
  // Show first page and ellipsis if needed
  if (startPage > 1) {
    const firstPageButton = document.createElement('button');
    firstPageButton.className = 'pagination-button';
    firstPageButton.textContent = '1';
    firstPageButton.addEventListener('click', () => goToPage(1));
    paginationContainer.appendChild(firstPageButton);
    
    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination-ellipsis';
      ellipsis.textContent = '...';
      paginationContainer.appendChild(ellipsis);
    }
  }
  
  // Create page number buttons
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = 'pagination-button';
    if (i === currentPage) {
      pageButton.classList.add('active');
    }
    pageButton.textContent = i.toString();
    pageButton.addEventListener('click', () => goToPage(i));
    paginationContainer.appendChild(pageButton);
  }
  
  // Show last page and ellipsis if needed
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination-ellipsis';
      ellipsis.textContent = '...';
      paginationContainer.appendChild(ellipsis);
    }
    
    const lastPageButton = document.createElement('button');
    lastPageButton.className = 'pagination-button';
    lastPageButton.textContent = totalPages.toString();
    lastPageButton.addEventListener('click', () => goToPage(totalPages));
    paginationContainer.appendChild(lastPageButton);
  }
  
  // Create "Next" button
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-button next-button';
  nextButton.textContent = '❯';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  });
  paginationContainer.appendChild(nextButton);
  
  // Add page info text
  const pageInfo = document.createElement('div');
  pageInfo.className = 'pagination-info';
  const languageSelector = document.getElementById('language-selector-improved');
  const currentLang = languageSelector ? languageSelector.value : 'es';
  
  // Create translations for pagination
  const paginationTranslations = {
    'es': `Página ${currentPage} de ${totalPages} (${totalCharacters} personajes)`,
    'en': `Page ${currentPage} of ${totalPages} (${totalCharacters} characters)`,
    'fr': `Page ${currentPage} sur ${totalPages} (${totalCharacters} personnages)`,
    'ro': `Pagina ${currentPage} din ${totalPages} (${totalCharacters} personaje)`
  };
  
  pageInfo.textContent = paginationTranslations[currentLang];
  paginationContainer.appendChild(pageInfo);
}

// Function to handle page navigation
async function goToPage(page) {
  currentPage = page;
  
  // Show loading indicator
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = '<div class="loading-spinner"></div>';
  
  // Fetch characters for the selected page with current filters
  const characters = await fetchCharacters(currentSearchTerm, page, currentUniverseFilter);
  
  // Display characters and update pagination
  displayCharacters(characters);
  createPagination();
  
  // Scroll to top of results
  const mainElement = document.querySelector('main');
  if (mainElement) {
    mainElement.scrollIntoView({ behavior: 'smooth' });
  }
}

// Function to set up universe filters
function setupUniverseFilters() {
  const filterButtons = document.querySelectorAll('.universe-filter');
  
  if (filterButtons.length === 0) {
    console.warn('No universe filter buttons found');
    return;
  }
  
  filterButtons.forEach(button => {
    button.addEventListener('click', async function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Get filter value from data attribute
      const filterValue = this.getAttribute('data-filter') || 'all';
      currentUniverseFilter = filterValue;
      
      // Reset to first page with new filter
      currentPage = 1;
      
      // Show loading indicator
      const cardContainer = document.getElementById("card-container");
      cardContainer.innerHTML = '<div class="loading-spinner"></div>';
      
      // Fetch characters with current search term and new filter
      const characters = await fetchCharacters(currentSearchTerm, currentPage, filterValue);
      
      // Display characters and update pagination
      displayCharacters(characters);
      createPagination();
    });
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Create language selector
  const languageSelector = createLanguageSelector();
  
  // Check if there's a saved language preference
  const savedLanguage = localStorage.getItem('selectedLanguage') || 'es';
  languageSelector.value = savedLanguage;
  
  // Apply the saved language
  updateLanguage(savedLanguage);
  
  // Add language change event listener
  languageSelector.addEventListener('change', (e) => {
    updateLanguage(e.target.value);
  });
  
  // Initialize universe filters
  setupUniverseFilters();
  
  // Initial page load - fetch characters
  currentPage = 1;
  const characters = await fetchCharacters('', currentPage, 'all');
  displayCharacters(characters);
  createPagination();
  
  // Add search button event listener
  const searchButton = document.getElementById('search');
  if (searchButton) {
    searchButton.addEventListener('click', async () => {
      const searchTerm = document.getElementById('buscador').value.trim();
      currentSearchTerm = searchTerm;
      
      if (searchTerm !== '') {
        currentPage = 1; // Reset to first page on new search
        const characters = await fetchCharacters(searchTerm, currentPage, currentUniverseFilter);
        displayCharacters(characters);
        createPagination();
      } else {
        displayError('Por favor, ingresa un nombre de personaje.');
      }
    });
  }
  
  // Allow search with Enter key
  const searchInput = document.getElementById('buscador');
  if (searchInput) {
    searchInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        currentSearchTerm = searchTerm;
        
        if (searchTerm !== '') {
          currentPage = 1; // Reset to first page on new search
          const characters = await fetchCharacters(searchTerm, currentPage, currentUniverseFilter);
          displayCharacters(characters);
          createPagination();
        } else {
          displayError('Por favor, ingresa un nombre de personaje.');
        }
      }
    });
  }
});