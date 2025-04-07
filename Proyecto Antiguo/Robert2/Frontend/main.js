// ESTE ARCHIVO ES UNA VERSIÓN MODIFICADA DEL ORIGINAL PARA USAR LA API LOCAL JAVA

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
      "pagination.loading": "Cargando personajes...",
      "contentFilters.title": "Filtrar por Tipo",
      "contentFilters.characters": "Personajes",
      "contentFilters.comics": "Comics",
      "contentFilters.series": "Series",
      "contentFilters.events": "Eventos",
      "contentFilters.movies": "Películas",
      "contentFilters.favorites": "Favoritos",
      "modal.addToFavorites": "Añadir a favoritos",
      "modal.removeFromFavorites": "Quitar de favoritos"
    },
    // El resto de tus traducciones ...
  };
  
  // Almacena el diseño original de las tarjetas capturado al iniciar
  let originalGridStyle = null;
  
  // ----- NUEVA CONFIGURACIÓN PARA API LOCAL -----
  // Comentar o eliminar estas líneas que ya no se usarán
  // const publicKey = 'dd0b4fdacdd0b53c744fb36389d154db';
  // const privateKey = '360fa86fb66f723c45b84fb38e08c7477fbf29f2';
  // const baseUrl = 'https://gateway.marvel.com/v1/public';
  
  // Reemplazar con:
  const baseUrl = 'http://localhost:8080/api';
  // ----- FIN NUEVA CONFIGURACIÓN -----
  
  // Variables para paginación y filtrado
  let currentPage = 1;
  const charactersPerPage = 12;
  let totalCharacters = 0;
  let currentSearchTerm = '';
  let currentUniverseFilter = 'all';
  let currentContentFilter = 'characters'; // Variable para rastrear el tipo de contenido
  
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
  
  // ----- FUNCIONES SIMPLIFICADAS PARA LA NUEVA API -----
  // Ya no necesitamos CryptoJS ni generateHash, pero para evitar errores:
  function loadCryptoJS() {
    // Esta función ya no hace nada, pero mantenemos para compatibilidad
    return Promise.resolve();
  }
  
  async function generateHash() {
    // Esta función ya no hace nada, pero mantenemos para compatibilidad
    return "";
  }
  // ----- FIN FUNCIONES SIMPLIFICADAS -----
  
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
        <div class="favorite-icon"><i class="far fa-star"></i></div>
        <span class="universe-badge"></span>
        <img class="character-image" src="" alt="Marvel Character">
        <div class="character-info">
          <h3 class="character-name"></h3>
          <div class="character-meta">
            <span class="character-comics" data-comics="0"></span>
          </div>
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
    
    let itemsLabel;
    if (currentContentFilter === 'characters') {
      itemsLabel = translations[currentLang]['pagination.characters'] || 'personajes';
    } else if (currentContentFilter === 'comics') {
      itemsLabel = 'comics';
    } else if (currentContentFilter === 'series') {
      itemsLabel = 'series';
    } else if (currentContentFilter === 'events') {
      itemsLabel = currentLang === 'es' ? 'eventos' : 
                   currentLang === 'en' ? 'events' :
                   currentLang === 'fr' ? 'événements' : 'evenimente';
    } else if (currentContentFilter === 'movies') {
      itemsLabel = currentLang === 'es' ? 'películas' : 
                   currentLang === 'en' ? 'movies' :
                   currentLang === 'fr' ? 'films' : 'filme';
    } else {
      itemsLabel = translations[currentLang]['pagination.characters'] || 'personajes';
    }
    
    if (translations[currentLang] && 
        translations[currentLang]['pagination.page'] && 
        translations[currentLang]['pagination.of']) {
      
      pageInfo.textContent = `${translations[currentLang]['pagination.page']} ${currentPage} ${translations[currentLang]['pagination.of']} ${totalPages} (${totalCharacters} ${itemsLabel})`;
    } else {
      const fallbackTexts = {
        'es': `Página ${currentPage} de ${totalPages} (${totalCharacters} ${itemsLabel})`,
        'en': `Page ${currentPage} of ${totalPages} (${totalCharacters} ${itemsLabel})`,
        'fr': `Page ${currentPage} sur ${totalPages} (${totalCharacters} ${itemsLabel})`,
        'ro': `Pagina ${currentPage} din ${totalPages} (${totalCharacters} ${itemsLabel})`
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
  
  // Función para inicializar los filtros
  function initFilters() {
    // 1. Ocultar inicialmente el filtro de universo
    const universeFilters = document.querySelector('.universe-filters');
    if (universeFilters) {
      universeFilters.style.display = 'none';
    }
    
    // 2. Configurar los filtros de contenido
    setupContentFilters();
  }
  
  // Actualizar función de inicialización
  function initApp() {
    // Reorganizar elementos - mover filtros de universo después de filtros de contenido
    const mainContainer = document.querySelector('main.container');
    if (mainContainer) {
      const universeFilters = document.querySelector('.universe-filters');
      const contentFilters = document.querySelector('.content-filters');
      
      if (universeFilters && contentFilters) {
        // Quitar del DOM
        universeFilters.parentNode.removeChild(universeFilters);
        
        // Insertar después de los filtros de contenido
        contentFilters.insertAdjacentElement('afterend', universeFilters);
      }
    }
    
    // Inicializar filtros
    initFilters();
    
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
      
      // Configurar filtros de universo
      setupUniverseFilters();
      
      // Configurar búsqueda
      setupSearch();
      
      // Cargar personajes iniciales
      currentPage = 1;
      fetchItems(currentContentFilter, '', currentPage, 'all')
        .then(items => {
          displayItems(items);
          createPagination();
          
          // Inicializar favoritos
          setupFavoriteEventHandlers();
          
          // Capturar estilo original después de cargar
          setTimeout(captureGridStyle, 500);
        })
        .catch(error => {
          console.error("Error fetching items:", error);
          displayError("Error al cargar datos. Por favor, recarga la página.");
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
    
    // Actualiza texto del botón de favoritos en el modal
    const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
    if (modalFavoriteBtn) {
      const span = modalFavoriteBtn.querySelector('span');
      if (span) {
        if (modalFavoriteBtn.classList.contains('active')) {
          span.textContent = translations[lang]['modal.removeFromFavorites'] || 'Remove from favorites';
        } else {
          span.textContent = translations[lang]['modal.addToFavorites'] || 'Add to favorites';
        }
      }
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
  
  // === FUNCIONES DE API Y DATOS ===
  
  // Función genérica para obtener ítems desde nuestra API
  async function fetchItems(contentType, searchTerm = '', page = 1, universeFilter = 'all') {
    try {
      // Si es "favorites", llamamos a la función específica
      if (contentType === 'favorites') {
        return fetchFavorites();
      }
      
      // Si es "movies", simulamos datos ya que la API de Marvel no tiene películas
      if (contentType === 'movies') {
        return fetchMovies(searchTerm, page);
      }
  
      // Para el resto de tipos (characters, comics, series, events)
      
      // Construir los parámetros de consulta
      const params = new URLSearchParams({
        page: page.toString(),
        limit: charactersPerPage.toString()
      });
      
      if (searchTerm) {
        params.append('searchTerm', searchTerm);
      }
      
      if (universeFilter !== 'all') {
        params.append('universe', universeFilter);
      }
  
      const url = `${baseUrl}/${contentType}?${params.toString()}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        totalCharacters = data.data.total;
        
        // Filtrar items sin imagen si es necesario
        const validItems = data.data.results.filter(item => 
          item.thumbnail && 
          item.thumbnail.path && 
          !item.thumbnail.path.includes('image_not_available')
        );
        
        // Ajustar el total si hay un filtro aplicado
        if (universeFilter !== 'all' || validItems.length < data.data.results.length) {
          const ratio = data.data.results.length > 0 ? validItems.length / data.data.results.length : 0;
          totalCharacters = Math.max(Math.ceil(totalCharacters * ratio), validItems.length);
        }
        
        return validItems;
        
      } catch (error) {
        console.error(`Error fetching ${contentType}:`, error);
        displayError(`Error al cargar ${contentType}. Por favor, intenta de nuevo.`);
        return [];
      }
    } catch (error) {
      console.error("Error:", error);
      displayError("Error al realizar la consulta. Por favor, intenta de nuevo.");
      return [];
    }
  }
  
  // Obtener favoritos del usuario de la API
  async function fetchFavorites() {
    try {
      // En lugar de obtener los favoritos de localStorage, los obtenemos de la API
      const userId = 1; // Por defecto usando el usuario 1
      const type = currentContentFilter === 'favorites' ? 'characters' : currentContentFilter;
      
      const params = new URLSearchParams({
        userId: userId.toString(),
        type: type
      });
      
      const url = `${baseUrl}/favorites?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      totalCharacters = data.data.total || data.data.results.length;
      
      return data.data.results;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      displayError("Error al cargar favoritos. Por favor, intenta de nuevo.");
      return [];
    }
  }
  
  // Función para simular datos de películas (no están en la API de Marvel)
  function fetchMovies(searchTerm = '', page = 1) {
    // Lista simulada de películas del MCU
    const moviesData = [
      { id: 1, title: "Iron Man", year: 2008, phase: 1, 
        description: "Tony Stark builds an armored suit to fight the throes of evil", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/ironman_lob_crd_01", extension: "jpg" } },
      { id: 2, title: "The Incredible Hulk", year: 2008, phase: 1, 
        description: "Bruce Banner transforms into a raging green monster", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/theincrediblehulk_lob_crd_01", extension: "jpg" } },
      { id: 3, title: "Iron Man 2", year: 2010, phase: 1, 
        description: "Tony Stark faces enemies who want his technology", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/ironman2_lob_crd_01", extension: "jpg" } },
      { id: 4, title: "Thor", year: 2011, phase: 1, 
        description: "Thor learns humility and protects Earth", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/thor_lob_crd_01", extension: "jpg" } },
      { id: 5, title: "Captain America: The First Avenger", year: 2011, phase: 1, 
        description: "Steve Rogers becomes Captain America", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/captainamericathefirstavenger_lob_crd_01", extension: "jpg" } },
      { id: 6, title: "The Avengers", year: 2012, phase: 1, 
        description: "Earth's mightiest heroes come together", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/theavengers_lob_crd_03", extension: "jpg" } },
      { id: 7, title: "Iron Man 3", year: 2013, phase: 2, 
        description: "Tony Stark battles the Mandarin", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/ironman3_lob_crd_01", extension: "jpg" } },
      { id: 8, title: "Thor: The Dark World", year: 2013, phase: 2, 
        description: "Thor battles Malekith to save the universe", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/thorthedarkworld_lob_crd_01", extension: "jpg" } },
      { id: 9, title: "Captain America: The Winter Soldier", year: 2014, phase: 2, 
        description: "Captain America faces a Soviet agent", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/captainamericathewintersoldier_lob_crd_01", extension: "jpg" } },
      { id: 10, title: "Guardians of the Galaxy", year: 2014, phase: 2, 
        description: "A group of intergalactic misfits band together", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/guardiansofthegalaxy_lob_crd_03", extension: "jpg" } },
      { id: 11, title: "Avengers: Age of Ultron", year: 2015, phase: 2, 
        description: "The Avengers battle against Ultron", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/avengersageofultron_lob_crd_03", extension: "jpg" } },
      { id: 12, title: "Ant-Man", year: 2015, phase: 2, 
        description: "Scott Lang becomes Ant-Man", 
        thumbnail: { path: "https://terrigen-cdn-dev.marvel.com/content/prod/1x/antman_lob_crd_01", extension: "jpg" } }
    ];
    
    // Filtrar por término de búsqueda si existe
    let filteredMovies = moviesData;
    if (searchTerm) {
      filteredMovies = moviesData.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Paginar resultados
    totalCharacters = filteredMovies.length;
    const start = (page - 1) * charactersPerPage;
    const end = start + charactersPerPage;
    
    return filteredMovies.slice(start, end);
  }
  
  // Muestra ítems en la interfaz (personajes, comics, etc.)
  function displayItems(items) {
    // Determinar qué función de visualización usar según el tipo de contenido
    if (currentContentFilter === 'characters') {
      displayCharacters(items);
    } else if (currentContentFilter === 'comics') {
      displayComics(items);
    } else if (currentContentFilter === 'series') {
      displaySeries(items);
    } else if (currentContentFilter === 'events') {
      displayEvents(items);
    } else if (currentContentFilter === 'movies') {
      displayMovies(items);
    } else if (currentContentFilter === 'favorites') {
      // displayFavorites se maneja en la función fetchAndDisplayFavorites
    }
  }
  
  // Muestra personajes en la interfaz
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
      
      // Add data attributes for identification
      cardClone.setAttribute('data-id', character.id);
      cardClone.setAttribute('data-type', 'characters');
      
      // Card elements
      const img = cardClone.querySelector(".character-image");
      const name = cardClone.querySelector(".character-name");
      const comicsCount = cardClone.querySelector(".character-comics");
      const universeBadge = cardClone.querySelector(".universe-badge");
      const favoriteIcon = cardClone.querySelector(".favorite-icon");
      
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
      
      // Make sure the character has a universe assigned
      if (!character.universe) {
        const universeId = character.id % 6;
        switch(universeId) {
          case 0: character.universe = '616'; break;
          case 1: character.universe = '1610'; break;
          case 2: character.universe = '199999'; break;
          case 3: character.universe = '10005'; break;
          case 4: character.universe = '1048'; break;
          case 5: character.universe = '90214'; break;
          default: character.universe = '616';
        }
      }
      
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
      
      // Configure favorite icon if it exists
      if (favoriteIcon) {
        // Ahora comprobamos si está en favoritos haciendo una petición a la API
        checkIsInFavorites(character.id, 'characters')
          .then(isFavorite => {
            if (isFavorite) {
              favoriteIcon.classList.add('active');
              favoriteIcon.querySelector('i').classList.remove('far');
              favoriteIcon.querySelector('i').classList.add('fas');
            } else {
              favoriteIcon.classList.remove('active');
              favoriteIcon.querySelector('i').classList.remove('fas');
              favoriteIcon.querySelector('i').classList.add('far');
            }
          });
      }
      
      cardContainer.appendChild(cardClone);
    });
    
    // Setup favorite event handlers if function exists
    setupFavoriteEventHandlers();
  }
  
  // Función para comprobar si un item está en favoritos
  async function checkIsInFavorites(itemId, type) {
    try {
      // Por defecto usando el usuario 1
      const userId = 1;
      
      const params = new URLSearchParams({
        userId: userId.toString(),
        type: type
      });
      
      const url = `${baseUrl}/favorites?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      
      if (!data.data || !data.data.results) {
        return false;
      }
      
      return data.data.results.some(item => item.id === parseInt(itemId));
    } catch (error) {
      console.error("Error checking favorites:", error);
      return false;
    }
  }
  
  // Función para mostrar comics
  function displayComics(comics) {
    const cardContainer = document.getElementById("card-container");
    
    if (!cardContainer) {
      console.error("Card container element not found");
      return;
    }
    
    const template = document.getElementById("card-template");
    
    if (!template) {
      console.error("Card template element not found");
      createCardTemplate();
      return displayComics(comics);
    }
    
    // Clear error messages and apply styles (similar to displayCharacters)
    const errorContainer = document.getElementById("error-message");
    if (errorContainer) errorContainer.textContent = "";
    
    const currentStyles = getComputedStyle(cardContainer);
    const gridStyle = {
      display: currentStyles.display,
      gridTemplateColumns: currentStyles.gridTemplateColumns,
      gap: currentStyles.gap
    };
  
    cardContainer.innerHTML = "";
    
    if (gridStyle.display.includes('grid')) {
      cardContainer.style.display = gridStyle.display;
      cardContainer.style.gridTemplateColumns = gridStyle.gridTemplateColumns;
      cardContainer.style.gap = gridStyle.gap;
    } else {
      cardContainer.style.display = 'grid';
      cardContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
      cardContainer.style.gap = '20px';
    }
  
    if (comics.length === 0) {
      displayError("No se encontraron cómics.");
      return;
    }
  
    comics.forEach(comic => {
      // Check for image
      const noImageAvailable = 
        !comic.thumbnail || 
        !comic.thumbnail.path || 
        comic.thumbnail.path.includes('image_not_available');
  
      if (noImageAvailable) {
        return;
      }
  
      // Clone card
      let cardClone;
      if (template.content) {
        cardClone = template.content.cloneNode(true);
        cardClone = cardClone.firstElementChild;
      } else {
        cardClone = template.cloneNode(true);
        if (template.style.display === 'none') {
          cardClone.style.display = 'block';
        }
      }
      
      if (!cardClone) {
        console.error("Failed to clone card template");
        return;
      }
      
      cardClone.removeAttribute('id');
      
      // Add data attributes
      cardClone.setAttribute('data-id', comic.id);
      cardClone.setAttribute('data-type', 'comics');
      
      // Get card elements
      const img = cardClone.querySelector(".character-image");
      const name = cardClone.querySelector(".character-name");
      const comicsCount = cardClone.querySelector(".character-comics");
      const universeBadge = cardClone.querySelector(".universe-badge");
      const favoriteIcon = cardClone.querySelector(".favorite-icon");
      
      if (!img || !name || !comicsCount || !universeBadge) {
        console.error("Missing elements in card template");
        return;
      }
  
      // Configure image
      if (comic.thumbnail && comic.thumbnail.path) {
        img.src = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
        img.alt = comic.title || "Comic Marvel";
      } else {
        img.classList.add('no-image');
        img.alt = "Imagen no disponible";
      }
  
      // Configure title (using name element)
      name.textContent = comic.title || "Título desconocido";
  
      // Get language
      const languageSelector = document.getElementById('language-selector-improved');
      const currentLang = languageSelector ? languageSelector.value : 'es';
      
      // Configure "View More" button
      comicsCount.classList.add('view-more-btn');
      
      const viewMoreText = {
        'es': 'Ver más',
        'en': 'View more',
        'fr': 'Voir plus',
        'ro': 'Vezi mai mult'
      };
      
      comicsCount.textContent = viewMoreText[currentLang] || viewMoreText['es'];
      
      // Add click event for modal
      comicsCount.addEventListener('click', function(e) {
        e.stopPropagation();
        openComicModal(comic, currentLang);
      });
  
      // Configure universe badge (use series or random universe)
      let universeText;
      if (comic.series && comic.series.name) {
        universeText = comic.series.name;
      } else {
        // Assign random universe based on ID
        if (!comic.universe) {
          const universeId = comic.id % 6;
          switch(universeId) {
            case 0: comic.universe = '616'; break;
            case 1: comic.universe = '1610'; break;
            case 2: comic.universe = '199999'; break;
            case 3: comic.universe = '10005'; break;
            case 4: comic.universe = '1048'; break;
            case 5: comic.universe = '90214'; break;
            default: comic.universe = '616';
          }
        }
        
        if (comic.universe === '616') {
          universeText = translations[currentLang]['filters.universe616']?.split(' ')[0] || 'Universo 616';
        } else if (comic.universe === '1610') {
          universeText = translations[currentLang]['filters.ultimate']?.split(' ')[0] || 'Ultimate';
        } else if (comic.universe === '199999') {
          universeText = 'MCU';
        } else if (comic.universe === '10005') {
          universeText = 'X-Men';
        } else if (comic.universe === '1048') {
          universeText = translations[currentLang]['filters.spider']?.split(' ')[0] || 'Spider-Verse';
        } else if (comic.universe === '90214') {
          universeText = translations[currentLang]['filters.noir']?.split(' ')[0] || 'Noir';
        } else {
          universeText = translations[currentLang]['character.universe616'] || 'Universo 616';
        }
      }
      
      universeBadge.textContent = universeText;
      
      // Configure favorite icon if it exists
      if (favoriteIcon) {
        // Ahora comprobamos si está en favoritos haciendo una petición a la API
        checkIsInFavorites(comic.id, 'comics')
          .then(isFavorite => {
            if (isFavorite) {
              favoriteIcon.classList.add('active');
              favoriteIcon.querySelector('i').classList.remove('far');
              favoriteIcon.querySelector('i').classList.add('fas');
            } else {
              favoriteIcon.classList.remove('active');
              favoriteIcon.querySelector('i').classList.remove('fas');
              favoriteIcon.querySelector('i').classList.add('far');
            }
          });
      }
      
      cardContainer.appendChild(cardClone);
    });
    
    // Setup favorite event handlers if function exists
    setupFavoriteEventHandlers();
  }
  
  // Función para mostrar series
  function displaySeries(series) {
    // Similar to displayComics but for series
    console.log("Displaying series:", series);
    // For now, just reuse the comics display with minor modifications
    displayComics(series.map(item => ({
      ...item,
      title: item.title || item.name,
      id: item.id,
      description: item.description,
      thumbnail: item.thumbnail,
      universe: item.universe || '616'
    })));
  }
  
  // Función para mostrar eventos
  function displayEvents(events) {
    // Similar to displayComics but for events
    console.log("Displaying events:", events);
    // For now, just reuse the comics display with minor modifications
    displayComics(events.map(item => ({
      ...item,
      title: item.title || item.name,
      id: item.id,
      description: item.description,
      thumbnail: item.thumbnail,
      universe: item.universe || '616'
    })));
  }
  
  // Función para mostrar películas
  function displayMovies(movies) {
    // Similar to displayComics but for movies
    console.log("Displaying movies:", movies);
    // For now, just reuse the comics display with minor modifications
    displayComics(movies.map(movie => ({
      ...movie,
      title: movie.title,
      id: movie.id,
      description: movie.description,
      thumbnail: movie.thumbnail,
      universe: '199999' // All MCU movies are in universe 199999
    })));
  }
  
  // Función para abrir el modal con los detalles del personaje
  function openCharacterModal(character, currentLang) {
    // Verificar si ya existe el modal, si no, crearlo
    let modal = document.getElementById('character-modal');
    
    if (!modal) {
      console.error("Modal not found");
      return;
    }
    
    // Set modal data attributes
    modal.setAttribute('data-id', character.id);
    modal.setAttribute('data-type', 'characters');
    
    // Obtener elementos del modal
    const modalImage = document.getElementById('modal-image');
    const modalName = document.getElementById('modal-name');
    const modalUniverse = document.getElementById('modal-universe');
    const modalComics = document.getElementById('modal-comics');
    const modalDescription = document.getElementById('modal-description');
    const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
    
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
  
    // Update favorite button if it exists
    if (modalFavoriteBtn) {
      // Comprobar si está en favoritos
      checkIsInFavorites(character.id, 'characters')
        .then(isFavorite => {
          if (isFavorite) {
            modalFavoriteBtn.classList.add('active');
            modalFavoriteBtn.querySelector('i').classList.remove('far');
            modalFavoriteBtn.querySelector('i').classList.add('fas');
            
            // Update text
            const textSpan = modalFavoriteBtn.querySelector('span');
            if (textSpan) {
              textSpan.textContent = translations[currentLang]['modal.removeFromFavorites'] || 'Remove from favorites';
            }
          } else {
            modalFavoriteBtn.classList.remove('active');
            modalFavoriteBtn.querySelector('i').classList.remove('fas');
            modalFavoriteBtn.querySelector('i').classList.add('far');
            
            // Update text
            const textSpan = modalFavoriteBtn.querySelector('span');
            if (textSpan) {
              textSpan.textContent = translations[currentLang]['modal.addToFavorites'] || 'Add to favorites';
            }
          }
        });
    }
    
    // Mostrar el modal con animación
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Evitar scroll detrás del modal
    
    // Configurar eventos para cerrar el modal
    setupModalEventListeners();
  }
  
  // Function to open comic/series/event modal with details
  function openComicModal(comic, currentLang) {
    // Check if modal exists
    let modal = document.getElementById('character-modal');
    
    if (!modal) {
      console.error("Modal not found");
      return;
    }
    
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
    
    // Set modal content
    if (comic.thumbnail) {
      modalImage.src = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
      modalImage.alt = comic.title || comic.name;
    }
    
    modalName.textContent = comic.title || comic.name;
    
    // Set universe (from series or universe property)
    let universeText = 'Unknown';
    if (comic.series && comic.series.name) {
      universeText = comic.series.name;
    } else if (comic.universe) {
      // Map universe code to display text
      if (comic.universe === '616') {
        universeText = translations[currentLang]['filters.universe616'] || 'Universe 616 (Main)';
      } else if (comic.universe === '1610') {
        universeText = translations[currentLang]['filters.ultimate'] || 'Ultimate (1610)';
      } else if (comic.universe === '199999') {
        universeText = translations[currentLang]['filters.mcu'] || 'MCU (199999)';
      } else if (comic.universe === '10005') {
        universeText = translations[currentLang]['filters.xmen'] || 'X-Men (10005)';
      } else if (comic.universe === '1048') {
        universeText = translations[currentLang]['filters.spider'] || 'Spider-Verse (1048)';
      } else if (comic.universe === '90214') {
        universeText = translations[currentLang]['filters.noir'] || 'Marvel Noir (90214)';
      }
    }
    
    modalUniverse.textContent = universeText;
    
    // Show issue number or year instead of comics count
    let detailsText = '';
    if (comic.issueNumber) {
      if (currentLang === 'es') detailsText = `Número ${comic.issueNumber}`;
      else if (currentLang === 'en') detailsText = `Issue ${comic.issueNumber}`;
      else if (currentLang === 'fr') detailsText = `Numéro ${comic.issueNumber}`;
      else if (currentLang === 'ro') detailsText = `Numărul ${comic.issueNumber}`;
    } else if (comic.startYear) {
      if (currentLang === 'es') detailsText = `Año ${comic.startYear}`;
      else if (currentLang === 'en') detailsText = `Year ${comic.startYear}`;
      else if (currentLang === 'fr') detailsText = `Année ${comic.startYear}`;
      else if (currentLang === 'ro') detailsText = `Anul ${comic.startYear}`;
    } else if (comic.year) {
      if (currentLang === 'es') detailsText = `Año ${comic.year}`;
      else if (currentLang === 'en') detailsText = `Year ${comic.year}`;
      else if (currentLang === 'fr') detailsText = `Année ${comic.year}`;
      else if (currentLang === 'ro') detailsText = `Anul ${comic.year}`;
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
      }[currentLang] || 'Details';
    } else if (contentType === 'series') {
      document.getElementById('modal-comics-title').textContent = {
        'es': 'Años',
        'en': 'Years',
        'fr': 'Années',
        'ro': 'Ani'
      }[currentLang] || 'Years';
    } else if (contentType === 'events') {
      document.getElementById('modal-comics-title').textContent = {
        'es': 'Fechas',
        'en': 'Dates',
        'fr': 'Dates',
        'ro': 'Date'
      }[currentLang] || 'Dates';
    } else if (contentType === 'movies') {
      document.getElementById('modal-comics-title').textContent = {
        'es': 'Año',
        'en': 'Year',
        'fr': 'Année',
        'ro': 'An'
      }[currentLang] || 'Year';
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
      modalDescription.textContent = noDescriptionText[currentLang] || noDescriptionText['es'];
    }
    
    // Translate modal labels for universe and description
    document.getElementById('modal-universe-title').textContent = {
      'es': 'Universo',
      'en': 'Universe',
      'fr': 'Univers',
      'ro': 'Univers'
    }[currentLang] || 'Universe';
    
    document.getElementById('modal-description-title').textContent = {
      'es': 'Descripción',
      'en': 'Description',
      'fr': 'Description',
      'ro': 'Descriere'
    }[currentLang] || 'Description';
    
    // Update favorite button if it exists
    if (modalFavoriteBtn) {
      // Comprobar si está en favoritos
      checkIsInFavorites(comic.id, 'comics')
        .then(isFavorite => {
          if (isFavorite) {
            modalFavoriteBtn.classList.add('active');
            modalFavoriteBtn.querySelector('i').classList.remove('far');
            modalFavoriteBtn.querySelector('i').classList.add('fas');
            
            // Update text
            const textSpan = modalFavoriteBtn.querySelector('span');
            if (textSpan) {
              textSpan.textContent = translations[currentLang]['modal.removeFromFavorites'] || 'Remove from favorites';
            }
          } else {
            modalFavoriteBtn.classList.remove('active');
            modalFavoriteBtn.querySelector('i').classList.remove('fas');
            modalFavoriteBtn.querySelector('i').classList.add('far');
            
            // Update text
            const textSpan = modalFavoriteBtn.querySelector('span');
            if (textSpan) {
              textSpan.textContent = translations[currentLang]['modal.addToFavorites'] || 'Add to favorites';
            }
          }
        });
    }
    
    // Show modal with animation
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    
    // Setup event listeners
    setupModalEventListeners();
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
  
  // Muestra mensaje de error
  function displayError(message) {
    let errorContainer = document.getElementById('error-container');
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.id = 'error-container';
      errorContainer.className = 'error-container';
      errorContainer.style.display = 'block';
      
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
    
    if (!errorContainer.querySelector('#error-message')) {
      const errorMessage = document.createElement('p');
      errorMessage.id = 'error-message';
      errorMessage.style.margin = '0';
      errorContainer.appendChild(errorMessage);
    }
    
    const errorMessage = errorContainer.querySelector('#error-message');
    
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
      
      const loadingText = translations[currentLang]['pagination.loading'] || 'Cargando...';
      
      const loadingEl = document.createElement('div');
      loadingEl.className = 'loading-spinner';
      loadingEl.style.gridColumn = '1 / -1';
      loadingEl.style.textAlign = 'center';
      loadingEl.style.padding = '20px';
      newContainer.appendChild(loadingEl);
      
      try {
        // If in favorites mode, handle that specially
        if (currentContentFilter === 'favorites') {
          fetchAndDisplayFavorites();
          return;
        }
        
        // Cargar items para la página seleccionada
        const items = await fetchItems(currentContentFilter, currentSearchTerm, page, currentUniverseFilter);
        displayItems(items);
        createPagination();
        
        // Aplicar idioma
        const langSelector = document.getElementById('language-selector-improved');
        if (langSelector) updateLanguage(langSelector.value);
        
        // Setup favorites after loading
        if (typeof setupFavoriteEventHandlers === 'function') {
          setupFavoriteEventHandlers();
        }
        
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
  
  // Configura filtros de contenido (personajes, comics, etc.)
  function setupContentFilters() {
    const contentFilterButtons = document.querySelectorAll('.content-filter-button');
    if (contentFilterButtons.length === 0) return;
    
    contentFilterButtons.forEach(button => {
      // Reemplazar el botón para eliminar listeners antiguos
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      newButton.addEventListener('click', async function() {
        // Actualizar clases activas
        document.querySelectorAll('.content-filter-button').forEach(btn => 
          btn.classList.remove('active')
        );
        this.classList.add('active');
        
        // Obtener valor del filtro y aplicarlo
        const filterValue = this.getAttribute('data-content') || 'characters';
        
        // Mostrar u ocultar filtros de universo según el tipo seleccionado
        const universeFilters = document.querySelector('.universe-filters');
        if (universeFilters) {
          if (filterValue === 'characters') {
            universeFilters.style.display = 'block';
          } else {
            universeFilters.style.display = 'none';
          }
        }
        
        // Si cambiamos de tipo de contenido, resetear página
        if (filterValue !== currentContentFilter) {
          currentPage = 1;
          currentContentFilter = filterValue;
          
          // Actualizar placeholder del buscador según el tipo de contenido
          updateSearchPlaceholder(filterValue);
          
          // Si es favoritos, usar la función específica
          if (filterValue === 'favorites') {
            fetchAndDisplayFavorites();
          } else {
            // Aplicar filtro y actualizar vista
            await applyFilter();
          }
        }
      });
    });
  }
  
  // Actualiza el placeholder del buscador según el tipo de contenido
  function updateSearchPlaceholder(contentType) {
    const searchInput = document.getElementById('buscador');
    if (!searchInput) return;
    
    const currentLang = document.getElementById('language-selector-improved')?.value || 'es';
    
    let placeholder = '';
    
    if (contentType === 'characters') {
      placeholder = translations[currentLang]['search.placeholder'] || '¿Qué superhéroe buscas?';
    } else if (contentType === 'comics') {
      if (currentLang === 'es') placeholder = '¿Qué cómic buscas?';
      else if (currentLang === 'en') placeholder = 'Which comic are you looking for?';
      else if (currentLang === 'fr') placeholder = 'Quel comic cherchez-vous?';
      else if (currentLang === 'ro') placeholder = 'Ce benzi desenate cauți?';
    } else if (contentType === 'series') {
      if (currentLang === 'es') placeholder = '¿Qué serie buscas?';
      else if (currentLang === 'en') placeholder = 'Which series are you looking for?';
      else if (currentLang === 'fr') placeholder = 'Quelle série cherchez-vous?';
      else if (currentLang === 'ro') placeholder = 'Ce serie cauți?';
    } else if (contentType === 'events') {
      if (currentLang === 'es') placeholder = '¿Qué evento buscas?';
      else if (currentLang === 'en') placeholder = 'Which event are you looking for?';
      else if (currentLang === 'fr') placeholder = 'Quel événement cherchez-vous?';
      else if (currentLang === 'ro') placeholder = 'Ce eveniment cauți?';
    } else if (contentType === 'movies') {
      if (currentLang === 'es') placeholder = '¿Qué película buscas?';
      else if (currentLang === 'en') placeholder = 'Which movie are you looking for?';
      else if (currentLang === 'fr') placeholder = 'Quel film cherchez-vous?';
      else if (currentLang === 'ro') placeholder = 'Ce film cauți?';
    } else if (contentType === 'favorites') {
      if (currentLang === 'es') placeholder = 'Buscar en tus favoritos';
      else if (currentLang === 'en') placeholder = 'Search in your favorites';
      else if (currentLang === 'fr') placeholder = 'Rechercher dans vos favoris';
      else if (currentLang === 'ro') placeholder = 'Caută în favoritele tale';
    }
    
    searchInput.placeholder = placeholder;
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
        // Cargar items con filtros actuales
        const items = await fetchItems(currentContentFilter, currentSearchTerm, currentPage, currentUniverseFilter);
        displayItems(items);
        createPagination();
        
        // Aplicar idioma
        if (langSelector) updateLanguage(langSelector.value);
        
        // Setup favorites if function exists
        if (typeof setupFavoriteEventHandlers === 'function') {
          setupFavoriteEventHandlers();
        }
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
    
    // No validamos término vacío para permitir volver a todos los resultados
    
    // Actualizar término de búsqueda y resetear página
    currentSearchTerm = searchTerm;
    currentPage = 1;
    
    // Aplicar búsqueda
    await applyFilter();
  }
  
  // Asegurar que los filtros se inicialicen correctamente
  window.addEventListener('load', function() {
    // Verificar si los filtros de universo están correctamente ubicados
    const contentFilters = document.querySelector('.content-filters');
    const universeFilters = document.querySelector('.universe-filters');
    
    if (contentFilters && universeFilters) {
      // Verificar si el filtro de personajes está seleccionado
      const characterFilterButton = document.querySelector('.content-filter-button[data-content="characters"]');
      if (characterFilterButton && characterFilterButton.classList.contains('active')) {
        universeFilters.style.display = 'block';
      } else {
        universeFilters.style.display = 'none';
      }
    }
  });
  
  // Fetch and display user's favorites
  async function fetchAndDisplayFavorites() {
    try {
      // Display loading spinner
      const cardContainer = document.getElementById('card-container');
      cardContainer.innerHTML = '<div class="loading-spinner"></div>';
      
      // Get favorites from API
      const favorites = await fetchFavorites();
      
      // If no favorites, show message
      if (!favorites || favorites.length === 0) {
        showNoFavoritesMessage();
        return;
      }
      
      // Display the favorites based on content type
      if (currentContentFilter === 'favorites') {
        displayCharacters(favorites);
      } else {
        // This handles displaying favorites of other types
        displayItems(favorites);
      }
      
      // Add favorites icons and bind event handlers
      setupFavoriteEventHandlers();
      
    } catch (error) {
      console.error('Error fetching favorites:', error);
      showNoFavoritesMessage();
    }
  }
  
  // Show message when no favorites are found
  function showNoFavoritesMessage() {
    const cardContainer = document.getElementById('card-container');
    const currentLang = document.getElementById('language-selector-improved')?.value || 'es';
    
    let message = '';
    if (currentLang === 'es') message = 'No tienes favoritos aún';
    else if (currentLang === 'en') message = 'You have no favorites yet';
    else if (currentLang === 'fr') message = "Vous n'avez pas encore de favoris";
    else if (currentLang === 'ro') message = 'Nu ai încă favorite';
    
    let typeName = '';
    if (currentContentFilter === 'characters') {
      if (currentLang === 'es') typeName = 'personajes';
      else if (currentLang === 'en') typeName = 'characters';
      else if (currentLang === 'fr') typeName = 'personnages';
      else if (currentLang === 'ro') typeName = 'personaje';
    } else if (currentContentFilter === 'comics') {
      typeName = 'comics';
    } else if (currentContentFilter === 'series') {
      typeName = 'series';
    } else if (currentContentFilter === 'events') {
      if (currentLang === 'es') typeName = 'eventos';
      else if (currentLang === 'en') typeName = 'events';
      else if (currentLang === 'fr') typeName = 'événements';
      else if (currentLang === 'ro') typeName = 'evenimente';
    } else if (currentContentFilter === 'movies') {
      if (currentLang === 'es') typeName = 'películas';
      else if (currentLang === 'en') typeName = 'movies';
      else if (currentLang === 'fr') typeName = 'films';
      else if (currentLang === 'ro') typeName = 'filme';
    }
    
    if (typeName) {
      message += ` (${typeName})`;
    }
    
    cardContainer.innerHTML = `
      <div class="no-favorites-message" style="text-align: center; padding: 50px; color: #aaa;">
        <div style="font-size: 60px; margin-bottom: 20px;">
          <i class="far fa-star"></i>
        </div>
        <p style="font-size: 18px; margin-bottom: 20px;">${message}</p>
        <p>
          <button class="filter-button discover-button" data-content="characters" style="cursor: pointer;">
            ${currentLang === 'es' ? 'Descubrir personajes' : 
             currentLang === 'en' ? 'Discover characters' :
             currentLang === 'fr' ? 'Découvrir des personnages' :
             'Descoperă personaje'}
          </button>
        </p>
      </div>
    `;
    
    // Add event listener to discovery button
    const discoverButton = document.querySelector('.discover-button');
    if (discoverButton) {
      discoverButton.addEventListener('click', function() {
        // Go to characters tab
        document.querySelector('.content-filter-button[data-content="characters"]').click();
      });
    }
  }
  
  // Funciones para gestionar favoritos (ahora usando la API en lugar de localStorage)
  async function toggleFavorite(id, type, name) {
    id = parseInt(id);
    
    // Verificar si ya está en favoritos
    const isFavorite = await checkIsInFavorites(id, type);
    let action;
    
    if (!isFavorite) {
      // Añadir a favoritos
      action = await addToFavorites(id, type);
    } else {
      // Eliminar de favoritos
      action = await removeFromFavorites(id, type);
    }
    
    // Show toast message
    if (action) {
      showFavoriteToast(name, action, type);
    }
    
    return action === 'add';
  }
  
  // Añadir a favoritos
  async function addToFavorites(itemId, type) {
    try {
      const response = await fetch(`${baseUrl}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 1, // Por defecto usuario 1
          itemId: itemId,
          type: type
        })
      });
      
      if (response.ok) {
        return 'add';
      } else {
        console.error('Error adding to favorites:', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return null;
    }
  }
  
  // Eliminar de favoritos
  async function removeFromFavorites(itemId, type) {
    try {
      const response = await fetch(`${baseUrl}/favorites`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 1, // Por defecto usuario 1
          itemId: itemId,
          type: type
        })
      });
      
      if (response.ok) {
        return 'remove';
      } else {
        console.error('Error removing from favorites:', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return null;
    }
  }
  
  // Show toast message when adding/removing favorites
  function showFavoriteToast(name, action, type) {
    const toast = document.getElementById('favorite-toast');
    const message = document.getElementById('favorite-toast-message');
    
    // Get the current language for i18n
    const currentLang = document.getElementById('language-selector-improved')?.value || 'es';
    
    let messageText = '';
    if (action === 'add') {
      if (currentLang === 'es') messageText = `${name} añadido a favoritos`;
      else if (currentLang === 'en') messageText = `${name} added to favorites`;
      else if (currentLang === 'fr') messageText = `${name} ajouté aux favoris`;
      else if (currentLang === 'ro') messageText = `${name} adăugat la favorite`;
    } else {
      if (currentLang === 'es') messageText = `${name} eliminado de favoritos`;
      else if (currentLang === 'en') messageText = `${name} removed from favorites`;
      else if (currentLang === 'fr') messageText = `${name} supprimé des favoris`;
      else if (currentLang === 'ro') messageText = `${name} eliminat din favorite`;
    }
    
    message.textContent = messageText;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  
  // Add event handlers for favorite buttons
  function setupFavoriteEventHandlers() {
    // For all favorite icons in character cards
    document.querySelectorAll('.favorite-icon').forEach(icon => {
      // Remove existing event listeners to prevent duplicates
      const newIcon = icon.cloneNode(true);
      icon.parentNode.replaceChild(newIcon, icon);
      
      // Get character data from the parent card
      const card = newIcon.closest('.character-card');
      if (!card) return;
      
      const id = card.getAttribute('data-id');
      const type = card.getAttribute('data-type') || 'characters';
      const name = card.querySelector('.character-name').textContent;
      
      // Set initial active state
      checkIsInFavorites(id, type).then(isFavorite => {
        if (isFavorite) {
          newIcon.classList.add('active');
          newIcon.querySelector('i').classList.remove('far');
          newIcon.querySelector('i').classList.add('fas');
        } else {
          newIcon.classList.remove('active');
          newIcon.querySelector('i').classList.remove('fas');
          newIcon.querySelector('i').classList.add('far');
        }
      });
      
      // Add click handler
      newIcon.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent opening modal
        
        toggleFavorite(id, type, name).then(isNowFavorite => {
          // Update icon appearance
          if (isNowFavorite) {
            newIcon.classList.add('active');
            newIcon.querySelector('i').classList.remove('far');
            newIcon.querySelector('i').classList.add('fas');
          } else {
            newIcon.classList.remove('active');
            newIcon.querySelector('i').classList.remove('fas');
            newIcon.querySelector('i').classList.add('far');
          }
          
          // If we're in the favorites view, remove the card
          if (currentContentFilter === 'favorites' && !isNowFavorite) {
            card.classList.add('removing');
            setTimeout(() => {
              card.remove();
              
              // Check if we need to display "no favorites" message
              const remainingCards = document.querySelectorAll('.character-card:not(#card-template)');
              if (remainingCards.length === 0) {
                showNoFavoritesMessage();
              }
            }, 500);
          }
        });
      });
    });
    
    // Setup favorite button in modal
    const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
    if (modalFavoriteBtn) {
      // Remove existing event listeners
      const newBtn = modalFavoriteBtn.cloneNode(true);
      modalFavoriteBtn.parentNode.replaceChild(newBtn, modalFavoriteBtn);
      
      newBtn.addEventListener('click', function() {
        const modal = document.getElementById('character-modal');
        const id = modal.getAttribute('data-id');
        const type = modal.getAttribute('data-type') || 'characters';
        const name = document.getElementById('modal-name').textContent;
        
        toggleFavorite(id, type, name).then(isNowFavorite => {
          // Update button appearance
          if (isNowFavorite) {
            newBtn.classList.add('active');
            newBtn.querySelector('i').classList.remove('far');
            newBtn.querySelector('i').classList.add('fas');
            
            // Update text
            const currentLang = document.getElementById('language-selector-improved')?.value || 'es';
            const textSpan = newBtn.querySelector('span');
            if (textSpan) {
              textSpan.textContent = translations[currentLang]['modal.removeFromFavorites'] || 'Remove from favorites';
            }
          } else {
            newBtn.classList.remove('active');
            newBtn.querySelector('i').classList.remove('fas');
            newBtn.querySelector('i').classList.add('far');
            
            // Update text
            const currentLang = document.getElementById('language-selector-improved')?.value || 'es';
            const textSpan = newBtn.querySelector('span');
            if (textSpan) {
              textSpan.textContent = translations[currentLang]['modal.addToFavorites'] || 'Add to favorites';
            }
          }
          
          // Also update the card's favorite icon if it exists
          const card = document.querySelector(`.character-card[data-id="${id}"][data-type="${type}"]`);
          if (card) {
            const icon = card.querySelector('.favorite-icon');
            if (icon) {
                if (isNowFavorite) {
                  icon.classList.add('active');
                  icon.querySelector('i').classList.remove('far');
                  icon.querySelector('i').classList.add('fas');
                } else {
                  icon.classList.remove('active');
                  icon.querySelector('i').classList.remove('fas');
                  icon.querySelector('i').classList.add('far');
                }
              }
            }
            
            // If we're in the favorites view and removed a favorite, close the modal and refresh the view
            if (currentContentFilter === 'favorites' && !isNowFavorite) {
              closeModal();
              setTimeout(() => {
                fetchAndDisplayFavorites();
              }, 300);
            }
          });
        });
      }
    }
    
    // Initialize favorites on document load
    document.addEventListener('DOMContentLoaded', function() {
      // Setup event listeners for favorites
      setupFavoriteEventHandlers();
    });