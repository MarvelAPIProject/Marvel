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
    "character.comicsCount": "{count} cómics disponibles",
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
    "character.comicsCount": "{count} comics available",
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
    "character.comicsCount": "{count} bandes dessinées disponibles",
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
    "character.comicsCount": "{count} benzi desenate disponibile",
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

// Almacena el diseño original de las tarjetas capturado al iniciar
let originalGridStyle = null;

// Marvel API configuration
const publicKey = 'dd0b4fdacdd0b53c744fb36389d154db';
const privateKey = '360fa86fb66f723c45b84fb38e08c7477fbf29f2';
const baseUrl = 'https://gateway.marvel.com/v1/public';

// Variables para paginación y filtrado
let currentPage = 1;
const charactersPerPage = 12;
let totalCharacters = 0;
let currentSearchTerm = '';
let currentUniverseFilter = 'all';

// Mapeo de universos Marvel
const universeMapping = {
  'all': null,
  'universe616': '616',
  'ultimate': '1610',
  'mcu': '199999',
  'xmen': '10005',
  'spider': '1048',
  'noir': '90214'
};

// === FUNCIONES DE UTILIDAD ===

// Captura el estilo original del contenedor de tarjetas
function captureGridStyle() {
  const container = document.getElementById('card-container');
  if (!container) return;
  
  const computed = getComputedStyle(container);
  originalGridStyle = {
    display: computed.display,
    gridTemplateColumns: computed.gridTemplateColumns,
    gap: computed.gap,
    padding: computed.padding,
    margin: computed.margin,
    className: container.className
  };
  
  console.log('Estilo original de tarjetas capturado:', originalGridStyle);
}

// Aplica el estilo original a un contenedor
function applyOriginalStyle(container) {
  if (!container || !originalGridStyle) return;
  
  container.className = originalGridStyle.className;
  container.style.display = originalGridStyle.display;
  container.style.gridTemplateColumns = originalGridStyle.gridTemplateColumns;
  container.style.gap = originalGridStyle.gap;
  container.style.padding = originalGridStyle.padding;
  container.style.margin = originalGridStyle.margin;
}

// Carga CryptoJS si no está disponible
function loadCryptoJS() {
  return new Promise((resolve, reject) => {
    if (window.CryptoJS) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load CryptoJS'));
    document.head.appendChild(script);
  });
}

// Genera hash para autenticación de la API
async function generateHash(ts) {
  await loadCryptoJS();
  return CryptoJS.MD5(ts.toString() + privateKey + publicKey).toString();
}

// Crea un selector de idioma mejorado
function createLanguageSelector() {
  if (document.getElementById('language-selector-improved')) {
    return document.getElementById('language-selector-improved');
  }
  
  const existingSelector = document.getElementById('language-selector');
  let parent = existingSelector ? existingSelector.parentNode : null;
  
  if (!parent) {
    const header = document.querySelector('header');
    const newContainer = document.createElement('div');
    newContainer.id = 'language-selector';
    newContainer.className = 'language-selector-wrapper';
    
    if (header) {
      header.appendChild(newContainer);
    } else {
      document.body.insertBefore(newContainer, document.body.firstChild);
    }
    
    parent = newContainer.parentNode;
  }
  
  const container = document.createElement('div');
  container.className = 'language-selector-container';
  
  const select = document.createElement('select');
  select.id = 'language-selector-improved';
  select.className = 'language-selector';
  
  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ro', name: 'Română', flag: '🇷🇴' }
  ];
  
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = `${lang.flag} ${lang.name}`;
    
    const savedLanguage = localStorage.getItem('selectedLanguage');
    option.selected = lang.code === (savedLanguage || 'es');
    
    select.appendChild(option);
  });
  
  container.appendChild(select);
  
  if (existingSelector) {
    parent.replaceChild(container, existingSelector);
  } else {
    const wrapper = document.getElementById('language-selector');
    if (wrapper) {
      wrapper.appendChild(container);
    }
  }
  
  return select;
}



// Función para redimensionar automáticamente elementos según el tamaño de ventana
function setupResponsiveBehavior() {
  // Ajustar layout según el ancho de la ventana
  function adjustLayout() {
    const width = window.innerWidth;
    const cardContainer = document.getElementById('card-container');
    
    if (!cardContainer) return;
    
    // Adaptar las columnas del grid según el ancho de pantalla
    if (width < 576) {
      cardContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
      cardContainer.style.gap = '12px';
    } else if (width < 768) {
      cardContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
      cardContainer.style.gap = '15px';
    } else {
      cardContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
      cardContainer.style.gap = '20px';
    }
    
    // Ajustar número de botones de paginación visible según ancho
    const paginationButtons = document.querySelectorAll('.pagination-button:not(.prev-button):not(.next-button)');
    const maxVisibleButtons = width < 576 ? 3 : (width < 768 ? 5 : 7);
    
    if (paginationButtons.length > maxVisibleButtons) {
      // Lógica para mostrar solo botones importantes (primera, última, actual y cercanos)
      // Esta función se llamará cada vez que se actualice la paginación
    }
  }
  
  // Escuchar cambios de tamaño de la ventana
  window.addEventListener('resize', adjustLayout);
  
  // Aplicar ajustes iniciales
  adjustLayout();
}

// Crea template de tarjeta si no existe
function createCardTemplate() {
  if (document.getElementById('card-template')) return;
  
  const template = document.createElement('template');
  template.id = 'card-template';
  
  template.innerHTML = `
    <div class="character-card">
      <span class="universe-badge"></span>
      <img class="character-image" src="" alt="Marvel Character">
      <div class="character-info">
        <h3 class="character-name"></h3>
      </div>
    </div>
  `;
  
  document.body.appendChild(template);
  
  // Crear contenedor si no existe
  if (!document.getElementById('card-container')) {
    const main = document.querySelector('main') || document.body.appendChild(document.createElement('main'));
    
    const container = document.createElement('div');
    container.id = 'card-container';
    container.className = 'cards-grid';
    
    // No aplicamos estilos directamente ya que lo haremos con CSS
    main.appendChild(container);
  }
}

// Actualiza texto de paginación según el idioma actual
function updatePaginationText() {
  const pageInfo = document.querySelector('.pagination-info');
  const langSelector = document.getElementById('language-selector-improved');
  
  if (!pageInfo || !langSelector) return;
  
  const currentLang = langSelector.value || 'es';
  const totalPages = Math.ceil(totalCharacters / charactersPerPage) || 1;
  
  if (translations[currentLang] && 
      translations[currentLang]['pagination.page'] && 
      translations[currentLang]['pagination.of'] && 
      translations[currentLang]['pagination.characters']) {
    
    pageInfo.textContent = `${translations[currentLang]['pagination.page']} ${currentPage} ${translations[currentLang]['pagination.of']} ${totalPages} (${totalCharacters} ${translations[currentLang]['pagination.characters']})`;
  } else {
    const fallbackTexts = {
      'es': `Página ${currentPage} de ${totalPages} (${totalCharacters} personajes)`,
      'en': `Page ${currentPage} of ${totalPages} (${totalCharacters} characters)`,
      'fr': `Page ${currentPage} sur ${totalPages} (${totalCharacters} personnages)`,
      'ro': `Pagina ${currentPage} din ${totalPages} (${totalCharacters} personaje)`
    };
    
    pageInfo.textContent = fallbackTexts[currentLang] || fallbackTexts['es'];
  }
  
  // Ajustamos el tamaño de fuente si hay mucho texto y la pantalla es pequeña
  if (window.innerWidth < 768 && pageInfo.textContent.length > 40) {
    pageInfo.style.fontSize = '0.8rem';
  } else {
    pageInfo.style.fontSize = '0.9rem';
  }
}

// Actualizar función de inicialización
function initApp() {
  // Agregar funcionalidad responsive
  setupResponsiveBehavior();
  
  // Resto de la inicialización original
  try {
    // Inicializar selector de idioma
    const langSelector = createLanguageSelector();
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'es';
    langSelector.value = savedLanguage;
    updateLanguage(savedLanguage);
    
    // Configurar cambio de idioma
    langSelector.addEventListener('change', (e) => {
      updateLanguage(e.target.value);
      updatePaginationText();
      updateUniverseBadges(e.target.value);
      
      // Actualizar conteo de cómics
      document.querySelectorAll('[data-comics]').forEach(element => {
        const count = element.getAttribute('data-comics');
        if (translations[e.target.value]['character.comicsCount']) {
          element.textContent = translations[e.target.value]['character.comicsCount']
            .replace('{count}', count);
        }
      });
    });
    
    // Configurar filtros y búsqueda
    setupUniverseFilters();
    setupSearch();
    
    // Cargar personajes iniciales
    currentPage = 1;
    fetchCharacters('', currentPage, 'all')
      .then(characters => {
        displayCharacters(characters);
        createPagination();
        
        // Capturar estilo original después de cargar
        setTimeout(captureGridStyle, 500);
      })
      .catch(error => {
        console.error("Error fetching characters:", error);
        displayError("Error al cargar personajes. Por favor, recarga la página.");
      });
    
  } catch (error) {
    console.error("Error inicializando la aplicación:", error);
    displayError("Error al inicializar la aplicación. Por favor, recarga la página.");
  }
}

// Reemplazar el event listener original con el nuevo
document.addEventListener('DOMContentLoaded', initApp);

// Actualiza textos basados en el idioma seleccionado
function updateLanguage(lang) {
  if (!translations[lang]) {
    console.error(`Translation not found for: ${lang}`);
    return;
  }
  
  localStorage.setItem('selectedLanguage', lang);
  
  // Actualiza elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang][key]) {
      if (translations[lang][key].includes('<')) {
        element.innerHTML = translations[lang][key];
      } else {
        element.textContent = translations[lang][key];
      }
    }
  });
  
  // Actualiza placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      element.placeholder = translations[lang][key];
    }
  });
  
  // Actualiza contador de cómics
  document.querySelectorAll('[data-comics]').forEach(element => {
    const count = element.getAttribute('data-comics');
    if (translations[lang]['character.comicsCount']) {
      element.textContent = translations[lang]['character.comicsCount'].replace('{count}', count);
    }
  });
  
  // Actualiza título del documento
  document.title = 'Marvel Universe Explorer';
  
  // Actualiza información de paginación
  updatePaginationText();
}

// Actualiza texto de paginación según el idioma actual
// Actualiza texto de paginación según el idioma actual
function updatePaginationText() {
  const pageInfo = document.querySelector('.pagination-info');
  const langSelector = document.getElementById('language-selector-improved');
  
  if (!pageInfo || !langSelector) return;
  
  const currentLang = langSelector.value || 'es';
  const totalPages = Math.ceil(totalCharacters / charactersPerPage) || 1;
  
  if (translations[currentLang] && 
      translations[currentLang]['pagination.page'] && 
      translations[currentLang]['pagination.of'] && 
      translations[currentLang]['pagination.characters']) {
    
    pageInfo.textContent = `${translations[currentLang]['pagination.page']} ${currentPage} ${translations[currentLang]['pagination.of']} ${totalPages} (${totalCharacters} ${translations[currentLang]['pagination.characters']})`;
  } else {
    const fallbackTexts = {
      'es': `Página ${currentPage} de ${totalPages} (${totalCharacters} personajes)`,
      'en': `Page ${currentPage} of ${totalPages} (${totalCharacters} characters)`,
      'fr': `Page ${currentPage} sur ${totalPages} (${totalCharacters} personnages)`,
      'ro': `Pagina ${currentPage} din ${totalPages} (${totalCharacters} personaje)`
    };
    
    pageInfo.textContent = fallbackTexts[currentLang] || fallbackTexts['es'];
  }
}

// Crea controles de paginación
function createPagination() {
  const totalPages = Math.ceil(totalCharacters / charactersPerPage) || 1;
  
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
    
    const cardsGrid = document.getElementById('card-container');
    if (cardsGrid && cardsGrid.parentNode) {
      cardsGrid.parentNode.insertBefore(paginationContainer, cardsGrid.nextSibling);
    } else {
      document.body.appendChild(paginationContainer);
    }
  } else {
    paginationContainer.innerHTML = '';
  }
  
  // Ocultar paginación si solo hay una página
  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';
    return;
  } else {
    paginationContainer.style.display = 'flex';
  }
  
  // Botón "Anterior"
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-button prev-button';
  prevButton.textContent = '❮';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  });
  paginationContainer.appendChild(prevButton);
  
  // Botones de página
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  
  // Primera página y elipsis
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
  
  // Páginas intermedias
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = 'pagination-button';
    if (i === currentPage) pageButton.classList.add('active');
    pageButton.textContent = i.toString();
    pageButton.addEventListener('click', () => goToPage(i));
    paginationContainer.appendChild(pageButton);
  }
  
  // Última página y elipsis
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
  
  // Botón "Siguiente"
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-button next-button';
  nextButton.textContent = '❯';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  });
  paginationContainer.appendChild(nextButton);
  
  // Información de página - asegura que esté antes de llamar a updatePaginationText
  const pageInfo = document.createElement('div');
  pageInfo.className = 'pagination-info';
  paginationContainer.appendChild(pageInfo);
  
  // Llama a updatePaginationText después de que pageInfo esté en el DOM
  setTimeout(() => updatePaginationText(), 0);
}

// Actualiza etiquetas de universo con traducción
function updateUniverseBadges(currentLang) {
  document.querySelectorAll('.universe-badge').forEach(badge => {
    const text = badge.textContent;
    
    if (text.includes('616') || text.includes('Universo') || text.includes('Universe') || text.includes('Univers') || text.includes('Universul')) {
      badge.textContent = translations[currentLang]['filters.universe616']?.split(' ')[0] || 'Universo 616';
    } else if (text.includes('Ultimate')) {
      badge.textContent = translations[currentLang]['filters.ultimate']?.split(' ')[0] || 'Ultimate';
    } else if (text.includes('Spider') || text.includes('Verse')) {
      badge.textContent = translations[currentLang]['filters.spider']?.split(' ')[0] || 'Spider-Verse';
    } else if (text.includes('Noir')) {
      badge.textContent = translations[currentLang]['filters.noir']?.split(' ')[0] || 'Noir';
    }
  });
}

// === FUNCIONES PRINCIPALES DE LA API ===

// Obtiene personajes con filtros
async function fetchCharacters(searchTerm = '', page = 1, universeFilter = 'all') {
  try {
    await loadCryptoJS();
    
    // Pedir más personajes para compensar los que no tienen imagen
    const fetchLimit = charactersPerPage * 3;
    
    const ts = Math.floor(Date.now() / 1000);
    const hash = await generateHash(ts);
    
    const params = new URLSearchParams({
      ts: ts.toString(),
      apikey: publicKey,
      hash: hash,
      limit: fetchLimit.toString(),
      offset: ((page - 1) * charactersPerPage).toString()
    });

    if (searchTerm) {
      params.append('nameStartsWith', searchTerm);
    }

    const url = `${baseUrl}/characters?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      totalCharacters = data.data.total;
      
      // Añadir información de universo a los personajes
      let characters = data.data.results.map(character => {
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
      
      // Filtrar por universo si es necesario
      if (universeFilter !== 'all' && universeMapping[universeFilter]) {
        characters = characters.filter(character => 
          character.universe === universeMapping[universeFilter]
        );
      }
      
      // Filtrar personajes sin imagen
      const validCharacters = characters.filter(character => 
        character.thumbnail && 
        character.thumbnail.path && 
        !character.thumbnail.path.includes('image_not_available')
      );
      
      // Ajustar el total si hay un filtro aplicado
      if (universeFilter !== 'all' || validCharacters.length < characters.length) {
        const ratio = characters.length > 0 ? validCharacters.length / characters.length : 0;
        totalCharacters = Math.max(Math.ceil(totalCharacters * ratio), validCharacters.length);
      }
      
      // Asegurar que devolvemos el número correcto de personajes por página
      return validCharacters.slice(0, charactersPerPage);
      
    } catch (error) {
      console.error("Error fetching characters:", error);
      totalCharacters = mockCharacters.length;
      return mockCharacters;
    }
  } catch (error) {
    console.error("CryptoJS error:", error);
    totalCharacters = mockCharacters.length;
    return mockCharacters;
  }
}

// Muestra personajes en la interfaz

function displayCharacters(characters) {
  const cardContainer = document.getElementById("card-container");
  
  if (!cardContainer) {
    console.error("Card container element not found");
    
    // Try to create a card container if it doesn't exist
    const main = document.querySelector('main');
    if (main) {
      const newContainer = document.createElement('div');
      newContainer.id = 'card-container';
      newContainer.className = 'character-grid';
      main.appendChild(newContainer);
      
      // Try again with the new container
      return displayCharacters(characters);
    }
    return;
  }
  
  const template = document.getElementById("card-template");
  
  if (!template) {
    console.error("Card template element not found");
    // Create a basic template if it doesn't exist
    createCardTemplate();
    return displayCharacters(characters); // Try again
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
    
    // Store comics count as data attribute
    const comicsAvailable = character.comics?.available || 0;
    comicsCount.setAttribute('data-comics', comicsAvailable);
    
    // CAMBIO AQUÍ: Reemplazar el contador de cómics con un botón "Ver más"
    comicsCount.innerHTML = '';  // Limpiar el contenido actual
    
    // Crear botón "Ver más" y agregar clase para estilos
    comicsCount.classList.add('view-more-btn');
    
    // Establecer el texto del botón según el idioma
    const viewMoreText = {
      'es': 'Ver más',
      'en': 'View more',
      'fr': 'Voir plus',
      'ro': 'Vezi mai mult'
    };
    
    comicsCount.textContent = viewMoreText[currentLang] || viewMoreText['es'];
    
    // Agregar evento de clic para mostrar detalles del personaje
    comicsCount.addEventListener('click', function(e) {
      e.stopPropagation();
      // Almacenar datos del personaje para usar en el modal
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
    
    cardContainer.appendChild(cardClone);
  });
}

// Función para abrir el modal con los detalles del personaje
function openCharacterModal(character, currentLang) {
  // Verificar si ya existe el modal, si no, crearlo
  let modal = document.getElementById('character-modal');
  
  if (!modal) {
    // Crear el modal
    modal = document.createElement('div');
    modal.id = 'character-modal';
    modal.className = 'modal';
    
    modal.innerHTML = `
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
    
    document.body.appendChild(modal);
    
    // Agregar estilos si no existen
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
  }
  
  // Obtener elementos del modal
  const modalImage = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalUniverse = document.getElementById('modal-universe');
  const modalComics = document.getElementById('modal-comics');
  const modalDescription = document.getElementById('modal-description');
  
  // Configurar el contenido del modal
  if (character.thumbnail) {
    modalImage.src = `${character.thumbnail.path}.${character.thumbnail.extension}`;
    modalImage.alt = character.name;
  }
  
  modalName.textContent = character.name;
  
  // Configurar el universo
  let universeText;
  if (character.universe === '616') {
    universeText = translations[currentLang]['filters.universe616'] || 'Universe 616 (Main)';
  } else if (character.universe === '1610') {
    universeText = translations[currentLang]['filters.ultimate'] || 'Ultimate (1610)';
  } else if (character.universe === '199999') {
    universeText = translations[currentLang]['filters.mcu'] || 'MCU (199999)';
  } else if (character.universe === '10005') {
    universeText = translations[currentLang]['filters.xmen'] || 'X-Men (10005)';
  } else if (character.universe === '1048') {
    universeText = translations[currentLang]['filters.spider'] || 'Spider-Verse (1048)';
  } else if (character.universe === '90214') {
    universeText = translations[currentLang]['filters.noir'] || 'Marvel Noir (90214)';
  } else {
    universeText = translations[currentLang]['character.universe616'] || 'Universe 616';
  }
  
  modalUniverse.textContent = universeText;
  
  // Configurar el contador de cómics con la traducción adecuada
  const comicsAvailable = character.comics?.available || 0;
  if (translations[currentLang]['character.comicsCount']) {
    const template = translations[currentLang]['character.comicsCount'];
    modalComics.textContent = template.replace('{count}', comicsAvailable);
  } else {
    modalComics.textContent = `${comicsAvailable} ${comicsAvailable === 1 ? 'cómic' : 'cómics'}`;
  }
  
  // Configurar la descripción
  if (character.description && character.description.trim() !== '') {
    modalDescription.textContent = character.description;
  } else {
    // Mensaje de "sin descripción" según el idioma
    const noDescriptionText = {
      'es': 'No hay descripción disponible para este personaje.',
      'en': 'No description available for this character.',
      'fr': 'Aucune description disponible pour ce personnage.',
      'ro': 'Nu există descriere disponibilă pentru acest personaj.'
    };
    modalDescription.textContent = noDescriptionText[currentLang] || noDescriptionText['es'];
  }
  
  // Traducir etiquetas del modal según el idioma
  document.getElementById('modal-universe-title').textContent = {
    'es': 'Universo',
    'en': 'Universe',
    'fr': 'Univers',
    'ro': 'Univers'
  }[currentLang] || 'Universe';
  
  document.getElementById('modal-comics-title').textContent = {
    'es': 'Cómics',
    'en': 'Comics',
    'fr': 'Bandes Dessinées',
    'ro': 'Benzi Desenate'
  }[currentLang] || 'Comics';
  
  document.getElementById('modal-description-title').textContent = {
    'es': 'Descripción',
    'en': 'Description',
    'fr': 'Description',
    'ro': 'Descriere'
  }[currentLang] || 'Description';
  
  // Mostrar el modal con animación
  modal.classList.add('show');
  setTimeout(() => {
    modal.querySelector('.modal-content').style.opacity = '1';
    modal.querySelector('.modal-content').style.transform = 'translateY(0)';
  }, 10);
  
  document.body.style.overflow = 'hidden'; // Evitar scroll detrás del modal
  
  // Configurar eventos para cerrar el modal
  setupModalEventListeners();
}

// Configurar los event listeners para el modal
function setupModalEventListeners() {
  const modal = document.getElementById('character-modal');
  const closeBtn = modal.querySelector('.close-modal');
  
  // Eliminar listeners existentes para evitar duplicados
  const newCloseBtn = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
  
  // Cerrar modal al hacer clic en el botón X
  newCloseBtn.addEventListener('click', closeModal);
  
  // Cerrar modal al hacer clic fuera del contenido
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Cerrar modal con la tecla Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
}

// Función para cerrar el modal
function closeModal() {
  const modal = document.getElementById('character-modal');
  if (!modal) return;
  
  modal.classList.remove('show');
  document.body.style.overflow = ''; // Restaurar scroll
}

// Muestra mensaje de error
function displayError(message) {
  let errorContainer = document.getElementById('error-container');
  let errorMessage = document.getElementById('error-message');
  
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    errorContainer.className = 'error-container';
    
    const cardContainer = document.getElementById('card-container');
    if (cardContainer && cardContainer.parentNode) {
      cardContainer.parentNode.insertBefore(errorContainer, cardContainer);
    } else {
      let main = document.querySelector('main');
      if (!main) {
        main = document.createElement('main');
        document.body.appendChild(main);
      }
      main.insertBefore(errorContainer, main.firstChild);
    }
  }
  
  if (!errorMessage) {
    errorMessage = document.createElement('p');
    errorMessage.id = 'error-message';
    errorMessage.style.margin = '0';
    errorContainer.appendChild(errorMessage);
  }
  
  // Traducir error común
  if (message === 'No se encontraron personajes.') {
    const currentLang = document.getElementById('language-selector-improved')?.value;
    if (currentLang === 'en') message = 'No characters found.';
    else if (currentLang === 'fr') message = 'Aucun personnage trouvé.';
    else if (currentLang === 'ro') message = 'Nu s-au găsit personaje.';
  }
  
  errorMessage.textContent = message;
  errorContainer.style.display = "block";
}

// === FUNCIONES DE NAVEGACIÓN Y PAGINACIÓN ===

// Crea controles de paginación
function createPagination() {

  
  if (typeof totalCharacters === 'undefined') return;
  
  const totalPages = Math.ceil(totalCharacters / charactersPerPage);
  
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
    
    const cardsGrid = document.getElementById('card-container');
    if (cardsGrid && cardsGrid.parentNode) {
      cardsGrid.parentNode.insertBefore(paginationContainer, cardsGrid.nextSibling);
    } else {
      document.body.appendChild(paginationContainer);
    }
  } else {
    paginationContainer.innerHTML = '';
  }
  
  // Ocultar paginación si solo hay una página
  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';
    return;
  } else {
    paginationContainer.style.display = 'flex';
  }
  
  // Botón "Anterior"
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-button prev-button';
  prevButton.textContent = '❮';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  });
  paginationContainer.appendChild(prevButton);
  
  // Botones de página
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  
  // Primera página y elipsis
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
  
  // Páginas intermedias
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = 'pagination-button';
    if (i === currentPage) pageButton.classList.add('active');
    pageButton.textContent = i.toString();
    pageButton.addEventListener('click', () => goToPage(i));
    paginationContainer.appendChild(pageButton);
  }
  
  // Última página y elipsis
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
  
  // Botón "Siguiente"
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-button next-button';
  nextButton.textContent = '❯';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  });
  paginationContainer.appendChild(nextButton);
  
  // Información de página
  const pageInfo = document.createElement('div');
  pageInfo.className = 'pagination-info';
  updatePaginationText();
  paginationContainer.appendChild(pageInfo);
}

  // Navega a una página específica
async function goToPage(page) {
  currentPage = page;
  
  const cardContainer = document.getElementById("card-container");
  if (!cardContainer) return;
  
  // Clonar contenedor para preservar estilo
  const newContainer = cardContainer.cloneNode(false);
  const parent = cardContainer.parentNode;
  
  if (parent) {
    parent.replaceChild(newContainer, cardContainer);
    applyOriginalStyle(newContainer);
    
    // Mostrar indicador de carga
    const langSelector = document.getElementById('language-selector-improved');
    const currentLang = langSelector?.value || 'es';
    
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-spinner';
    loadingEl.style.gridColumn = '1 / -1';
    loadingEl.style.textAlign = 'center';
    loadingEl.style.padding = '20px';
    newContainer.appendChild(loadingEl);
    
    try {
      // Cargar personajes para la página seleccionada
      const characters = await fetchCharacters(currentSearchTerm, page, currentUniverseFilter);
      displayCharacters(characters);
      createPagination();
      
      // Aplicar idioma
      const langSelector = document.getElementById('language-selector-improved');
      if (langSelector) updateLanguage(langSelector.value);
      
      // Scroll suave al inicio de resultados
      const mainElement = document.querySelector('main');
      if (mainElement) mainElement.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error("Error navegando a la página:", error);
      
      // Mensaje de error traducido
      const langSelector = document.getElementById('language-selector-improved');
      const currentLang = langSelector?.value || 'es';
      
      const errorMessages = {
        'es': 'Error al cargar la página. Inténtalo de nuevo.',
        'en': 'Error loading page. Please try again.',
        'fr': 'Erreur lors du chargement de la page. Veuillez réessayer.',
        'ro': 'Eroare la încărcarea paginii. Încercați din nou.'
      };
      
      displayError(errorMessages[currentLang] || errorMessages['es']);
    }
  }
}

// Configura filtros de universo
function setupUniverseFilters() {
  const filterButtons = document.querySelectorAll('.filter-button');
  if (filterButtons.length === 0) return;
  
  filterButtons.forEach(button => {
    // Reemplazar el botón para eliminar listeners antiguos
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', async function() {
      // Actualizar clases activas
      document.querySelectorAll('.filter-button').forEach(btn => 
        btn.classList.remove('active')
      );
      this.classList.add('active');
      
      // Obtener valor del filtro y aplicarlo
      const filterValue = this.getAttribute('data-universe') || 'all';
      currentUniverseFilter = filterValue;
      currentPage = 1;
      
      // Aplicar filtro y actualizar vista
      await applyFilter();
    });
  });
}

// Aplica filtros actuales y actualiza la interfaz
async function applyFilter() {
  const cardContainer = document.getElementById("card-container");
  if (!cardContainer) return;
  
  // Clonar para preservar estilo
  const newContainer = cardContainer.cloneNode(false);
  const parent = cardContainer.parentNode;
  
  if (parent) {
    parent.replaceChild(newContainer, cardContainer);
    applyOriginalStyle(newContainer);
    
    // Mostrar indicador de carga
    const langSelector = document.getElementById('language-selector-improved');
    const currentLang = langSelector?.value || 'es';
    
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-spinner';
    loadingEl.style.gridColumn = '1 / -1';
    loadingEl.style.textAlign = 'center';
    loadingEl.style.padding = '20px';
    newContainer.appendChild(loadingEl);
    
    try {
      // Cargar personajes con filtros actuales
      const characters = await fetchCharacters(currentSearchTerm, currentPage, currentUniverseFilter);
      displayCharacters(characters);
      createPagination();
      
      // Aplicar idioma
      if (langSelector) updateLanguage(langSelector.value);
    } catch (error) {
      console.error("Error al aplicar filtro:", error);
      displayError("Error al aplicar el filtro. Inténtalo de nuevo.");
    }
  }
}

// Configura funcionalidad de búsqueda
function setupSearch() {
  // Configurar botón de búsqueda
  const searchButton = document.getElementById('search');
  if (searchButton) searchButton.addEventListener('click', performSearch);
  
  // Configurar búsqueda con tecla Enter
  const searchInput = document.getElementById('buscador');
  if (searchInput) {
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') performSearch();
    });
  }
}

// Ejecuta búsqueda
async function performSearch() {
  const searchInput = document.getElementById('buscador');
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.trim();
  
  // Validar término de búsqueda
  if (searchTerm === '') {
    const langSelector = document.getElementById('language-selector-improved');
    const currentLang = langSelector?.value || 'es';
    
    const errorMsg = {
      'es': 'Por favor, ingresa un nombre de personaje.',
      'en': 'Please enter a character name.',
      'fr': 'Veuillez saisir un nom de personnage.',
      'ro': 'Te rog să introduci un nume de personaj.'
    }[currentLang] || 'Por favor, ingresa un nombre de personaje.';
    
    displayError(errorMsg);
    return;
  }
  
  // Actualizar término de búsqueda y resetear página
  currentSearchTerm = searchTerm;
  currentPage = 1;
  
  // Aplicar búsqueda
  await applyFilter();
}

// Crea template de tarjeta si no existe
function createCardTemplate() {
  if (document.getElementById('card-template')) return;
  
  const template = document.createElement('template');
  template.id = 'card-template';
  
  template.innerHTML = `
    <div class="character-card">
      <span class="universe-badge"></span>
      <img class="character-image" src="" alt="Marvel Character">
      <div class="character-info">
        <h3 class="character-name"></h3>
        <p class="character-comics" data-comics="0"></p>
      </div>
    </div>
  `;
  
  document.body.appendChild(template);
  
  // Crear contenedor si no existe
  if (!document.getElementById('card-container')) {
    const main = document.querySelector('main') || document.body.appendChild(document.createElement('main'));
    
    const container = document.createElement('div');
    container.id = 'card-container';
    container.className = 'cards-grid';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    container.style.gap = '20px';
    
    main.appendChild(container);
  }
}

// Agrega estilos por defecto
function addDefaultStyles() {
  if (document.querySelector('#marvel-default-styles')) return;
  
  const styleElement = document.createElement('style');
  styleElement.id = 'marvel-default-styles';
  styleElement.textContent = `
    #card-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      padding: 20px;
    }
    
    .loading-spinner {
      display: block;
      text-align: center;
      padding: 20px;
      grid-column: 1 / -1;
    }
  `;
  
  document.head.appendChild(styleElement);
}

// === INICIALIZACIÓN Y EVENTOS ===

// Inicializar aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Agregar estilos por defecto
    addDefaultStyles();
    
    // Inicializar selector de idioma
    const langSelector = createLanguageSelector();
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'es';
    langSelector.value = savedLanguage;
    updateLanguage(savedLanguage);
    
    // Configurar cambio de idioma
    langSelector.addEventListener('change', (e) => {
      updateLanguage(e.target.value);
      updatePaginationText();
      updateUniverseBadges(e.target.value);
      
      // Actualizar conteo de cómics
      document.querySelectorAll('[data-comics]').forEach(element => {
        const count = element.getAttribute('data-comics');
        if (translations[e.target.value]['character.comicsCount']) {
          element.textContent = translations[e.target.value]['character.comicsCount']
            .replace('{count}', count);
        }
      });
    });
    
    // Configurar filtros y búsqueda
    setupUniverseFilters();
    setupSearch();
    
    // Cargar personajes iniciales
    currentPage = 1;
    const characters = await fetchCharacters('', currentPage, 'all');
    displayCharacters(characters);
    createPagination();
    
    // Capturar estilo original después de cargar
    setTimeout(captureGridStyle, 500);
    
  } catch (error) {
    console.error("Error inicializando la aplicación:", error);
    displayError("Error al inicializar la aplicación. Por favor, recarga la página.");
  }
});