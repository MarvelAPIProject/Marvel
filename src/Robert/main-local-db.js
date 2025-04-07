/**
 * Marvel App - Cliente para Base de Datos Local
 * Conecta directamente con la API local para mostrar los datos de la base de datos Marvel_BBDD.
 */

// Configuración global
const API_BASE_URL = 'http://localhost:3000/api';

// Variables para paginación y filtrado
let currentPage = 1;
const itemsPerPage = 12;
let totalItems = 0;
let currentSearchTerm = '';
let currentUniverseFilter = 'all';
let currentContentFilter = 'characters';

// Mapa para convertir tipos de contenido a endpoints de la API
const apiEndpoints = {
  'characters': 'personajes',
  'comics': 'comics',
  'series': 'series',
  'events': 'eventos',
  'favorites': 'favoritos'
};

// Inicialización al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar la aplicación
  initApp();
  
  // Configurar eventos
  setupSearch();
  setupContentFilters();
  setupUniverseFilters();
  
  // Cargar favoritos si existe la función
  if (typeof loadFavorites === 'function') {
    loadFavorites();
  }
});

/**
 * Inicializa la aplicación
 */
function initApp() {
  // Gestionar visibilidad de filtros
  const universeFilters = document.querySelector('.universe-filters');
  if (universeFilters) {
    if (currentContentFilter === 'characters') {
      universeFilters.style.display = 'block';
    } else {
      universeFilters.style.display = 'none';
    }
  }
  
  // Inicializar selector de idioma
  const langSelector = document.getElementById('language-selector');
  if (langSelector) {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'es';
    langSelector.value = savedLanguage;
    updateLanguage(savedLanguage);
    
    langSelector.addEventListener('change', (e) => {
      updateLanguage(e.target.value);
      updateViewMoreButtons(e.target.value);
    });
  }
  
  // Cargar elementos iniciales
  loadItems();
}

/**
 * Actualiza textos basados en el idioma seleccionado
 */
function updateLanguage(lang) {
  if (!translations[lang]) {
    console.error(`No se encontró traducción para: ${lang}`);
    return;
  }
  
  localStorage.setItem('selectedLanguage', lang);
  
  // Actualizar elementos con data-i18n
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
  
  // Actualizar placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      element.placeholder = translations[lang][key];
    }
  });
  
  // Actualizar botones "Ver más"
  updateViewMoreButtons(lang);
}

/**
 * Actualiza el texto de los botones "Ver más" para mantener consistencia
 */
function updateViewMoreButtons(lang) {
  const viewMoreText = {
    'es': 'Ver más',
    'en': 'View more',
    'fr': 'Voir plus',
    'ro': 'Vezi mai mult'
  };
  
  document.querySelectorAll('.view-more-btn').forEach(btn => {
    btn.textContent = viewMoreText[lang] || viewMoreText['es'];
  });
}

/**
 * Muestra un indicador de carga mientras se obtienen los datos
 */
function showLoader() {
  const container = document.getElementById('card-container');
  if (!container) return;
  
  // Crear indicador de carga
  const loader = document.createElement('div');
  loader.className = 'loading-spinner';
  loader.style.gridColumn = '1 / -1';
  loader.style.justifySelf = 'center';
  
  // Limpiar contenedor y agregar loader
  container.innerHTML = '';
  container.appendChild(loader);
}

/**
 * Oculta el indicador de carga
 */
function hideLoader() {
  const loader = document.querySelector('.loading-spinner');
  if (loader) {
    loader.remove();
  }
}

/**
 * Muestra un mensaje de error
 */
function displayError(message) {
  const errorContainer = document.getElementById('error-container');
  if (!errorContainer) return;
  
  const errorMessage = document.getElementById('error-message') || document.createElement('p');
  if (!errorMessage.id) {
    errorMessage.id = 'error-message';
    errorContainer.appendChild(errorMessage);
  }
  
  errorMessage.textContent = message;
  errorContainer.style.display = 'block';
}

/**
 * Oculta mensajes de error
 */
function hideError() {
  const errorContainer = document.getElementById('error-container');
  if (errorContainer) {
    errorContainer.style.display = 'none';
  }
}

/**
 * Carga elementos desde la API local
 */
async function loadItems() {
  try {
    showLoader();
    hideError();
    
    // Manejar favoritos de forma especial
    if (currentContentFilter === 'favorites') {
      if (typeof fetchAndDisplayFavorites === 'function') {
        await fetchAndDisplayFavorites();
      } else {
        displayError('La función de favoritos no está disponible');
      }
      hideLoader();
      return;
    }
    
    // Obtener el endpoint correspondiente
    const endpoint = apiEndpoints[currentContentFilter] || 'personajes';
    
    // Construir URL base
    let url = `${API_BASE_URL}/${endpoint}`;
    
    // Agregar parámetros de búsqueda si existen
    if (currentSearchTerm) {
      url = `${API_BASE_URL}/buscar?termino=${encodeURIComponent(currentSearchTerm)}`;
    }
    
    // Realizar la petición a la API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error de red: ${response.status}`);
    }
    
    // Procesar respuesta
    const data = await response.json();
    
    // Determinar los items según el tipo de contenido y estructura de respuesta
    let items = [];
    
    if (currentSearchTerm && typeof data === 'object' && !Array.isArray(data)) {
      // Respuesta de búsqueda (estructura diferente)
      items = data[endpoint] || [];
    } else {
      // Respuesta normal
      items = Array.isArray(data) ? data : [];
    }
    
    // Filtrar elementos que tengan URL de imagen
    items = items.filter(item => {
      const imageUrl = item.URL_imagen || 
                      (item.thumbnail && (
                        typeof item.thumbnail === 'string' ? 
                        item.thumbnail : 
                        item.thumbnail.path + '.' + item.thumbnail.extension
                      ));
      return imageUrl && !imageUrl.includes('image_not_available');
    });
    
    // Aplicar filtro de universo si es necesario y estamos en personajes
    if (currentContentFilter === 'characters' && currentUniverseFilter !== 'all') {
      // Este filtro se aplicaría si tuvieras un campo "universe" en tu base de datos
      // Como probablemente no existe en tu DB, esto es solo para mantener la funcionalidad
    }
    
    // Establecer total de items para paginación
    totalItems = items.length;
    
    // Paginar resultados
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    // Mostrar elementos
    displayItems(paginatedItems);
    
    // Crear paginación
    createPagination();
    
    // Mantener consistencia en botones "Ver más"
    const currentLang = document.getElementById('language-selector')?.value || 'es';
    updateViewMoreButtons(currentLang);
    
    // Configurar eventos de favoritos si existe la función
    if (typeof setupFavoriteEventHandlers === 'function') {
      setupFavoriteEventHandlers();
    }
    
  } catch (error) {
    console.error('Error al cargar elementos:', error);
    displayError(`Error al cargar datos: ${error.message}`);
  } finally {
    hideLoader();
  }
}

/**
 * Función para mostrar elementos según su tipo
 */
function displayItems(items) {
  switch (currentContentFilter) {
    case 'characters':
      displayCharacters(items);
      break;
    case 'comics':
      displayComics(items);
      break;
    case 'series':
      displaySeries(items);
      break;
    case 'events':
      displayEvents(items);
      break;
    default:
      displayCharacters(items);
  }
}

/**
 * Muestra personajes en la interfaz
 */
function displayCharacters(characters) {
  const cardContainer = document.getElementById('card-container');
  if (!cardContainer) return;
  
  // Limpiar contenedor
  cardContainer.innerHTML = '';
  
  if (characters.length === 0) {
    displayError('No se encontraron personajes.');
    return;
  }
  
  const template = document.getElementById('card-template');
  const currentLang = document.getElementById('language-selector')?.value || 'es';
  
  characters.forEach(character => {
    let card;
    
    if (template) {
      card = template.cloneNode(true);
      card.style.display = 'flex';
      card.removeAttribute('id');
    } else {
      // Crear estructura de tarjeta si no hay template
      card = document.createElement('div');
      card.className = 'character-card';
      card.innerHTML = `
        <div class="favorite-icon"><i class="far fa-star"></i></div>
        <div class="character-image-container">
          <img src="" alt="" class="character-image">
        </div>
        <div class="character-info">
          <h3 class="character-name"></h3>
          <div class="character-meta">
            <span class="character-comics view-more-btn"></span>
          </div>
        </div>
        <div class="universe-badge"></div>
      `;
    }
    
    // Configurar atributos de datos
    card.setAttribute('data-id', character.id_personaje || character.id);
    card.setAttribute('data-type', 'characters');
    
    // Configurar elementos de la tarjeta
    const img = card.querySelector('.character-image');
    const name = card.querySelector('.character-name');
    const viewMoreBtn = card.querySelector('.character-comics');
    const universeBadge = card.querySelector('.universe-badge');
    const favoriteIcon = card.querySelector('.favorite-icon');
    
    // Configurar nombre
    name.textContent = character.nombre || character.name || 'Sin nombre';
    
    // Configurar imagen
    const imageUrl = character.URL_imagen || 
                    (character.thumbnail && (
                      typeof character.thumbnail === 'string' ? 
                      character.thumbnail : 
                      character.thumbnail.path + '.' + character.thumbnail.extension
                    ));
    
    if (imageUrl) {
      img.src = imageUrl;
      img.alt = name.textContent;
    } else {
      img.src = 'assets/images/no-image.jpg';
      img.alt = 'Imagen no disponible';
      img.classList.add('no-image');
    }
    
    // Configurar botón "Ver más" (siempre con texto consistente)
    const viewMoreText = {
      'es': 'Ver más',
      'en': 'View more',
      'fr': 'Voir plus',
      'ro': 'Vezi mai mult'
    };
    
    viewMoreBtn.classList.add('view-more-btn');
    viewMoreBtn.textContent = viewMoreText[currentLang] || viewMoreText['es'];
    
    // Agregar evento para abrir modal
    viewMoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCharacterModal(character, currentLang);
    });
    
    // Configurar insignia de universo (simulada basada en ID)
    let universeText = translations[currentLang]['character.universe616'] || 'Universo 616';
    universeBadge.textContent = universeText;
    
    // Configurar icono de favoritos si existe la función
    if (favoriteIcon && typeof isInFavorites === 'function') {
      const id = character.id_personaje || character.id;
      if (isInFavorites(id, 'characters')) {
        favoriteIcon.classList.add('active');
        favoriteIcon.querySelector('i').classList.remove('far');
        favoriteIcon.querySelector('i').classList.add('fas');
      }
    }
    
    // Agregar tarjeta al contenedor
    cardContainer.appendChild(card);
  });
}

/**
 * Muestra cómics en la interfaz
 */
function displayComics(comics) {
  const cardContainer = document.getElementById('card-container');
  if (!cardContainer) return;
  
  // Limpiar contenedor
  cardContainer.innerHTML = '';
  
  if (comics.length === 0) {
    displayError('No se encontraron cómics.');
    return;
  }
  
  const template = document.getElementById('card-template');
  const currentLang = document.getElementById('language-selector')?.value || 'es';
  
  comics.forEach(comic => {
    let card;
    
    if (template) {
      card = template.cloneNode(true);
      card.style.display = 'flex';
      card.removeAttribute('id');
    } else {
      // Crear estructura de tarjeta si no hay template
      card = document.createElement('div');
      card.className = 'character-card';
      card.innerHTML = `
        <div class="favorite-icon"><i class="far fa-star"></i></div>
        <div class="character-image-container">
          <img src="" alt="" class="character-image">
        </div>
        <div class="character-info">
          <h3 class="character-name"></h3>
          <div class="character-meta">
            <span class="character-comics view-more-btn"></span>
          </div>
        </div>
        <div class="universe-badge"></div>
      `;
    }
    
    // Configurar atributos de datos
    card.setAttribute('data-id', comic.id_comic || comic.id);
    card.setAttribute('data-type', 'comics');
    
    // Configurar elementos de la tarjeta
    const img = card.querySelector('.character-image');
    const name = card.querySelector('.character-name');
    const viewMoreBtn = card.querySelector('.character-comics');
    const universeBadge = card.querySelector('.universe-badge');
    const favoriteIcon = card.querySelector('.favorite-icon');
    
    // Configurar título
    name.textContent = comic.titulo || comic.title || 'Sin título';
    
    // Configurar imagen
    const imageUrl = comic.URL_imagen || 
                    (comic.thumbnail && (
                      typeof comic.thumbnail === 'string' ? 
                      comic.thumbnail : 
                      comic.thumbnail.path + '.' + comic.thumbnail.extension
                    ));
    
    if (imageUrl) {
      img.src = imageUrl;
      img.alt = name.textContent;
    } else {
      img.src = 'assets/images/no-image.jpg';
      img.alt = 'Imagen no disponible';
      img.classList.add('no-image');
    }
    
    // Configurar botón "Ver más" (siempre con texto consistente)
    const viewMoreText = {
      'es': 'Ver más',
      'en': 'View more',
      'fr': 'Voir plus',
      'ro': 'Vezi mai mult'
    };
    
    viewMoreBtn.classList.add('view-more-btn');
    viewMoreBtn.textContent = viewMoreText[currentLang] || viewMoreText['es'];
    
    // Agregar evento para abrir modal
    viewMoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openComicModal(comic, currentLang);
    });
    
    // Configurar insignia de universo (nombre de serie si está disponible)
    let universeText = '';
    if (comic.id_serie) {
      universeText = 'Serie #' + comic.id_serie;
    } else {
      universeText = translations[currentLang]['character.universe616'] || 'Universo 616';
    }
    universeBadge.textContent = universeText;
    
    // Configurar icono de favoritos si existe la función
    if (favoriteIcon && typeof isInFavorites === 'function') {
      const id = comic.id_comic || comic.id;
      if (isInFavorites(id, 'comics')) {
        favoriteIcon.classList.add('active');
        favoriteIcon.querySelector('i').classList.remove('far');
        favoriteIcon.querySelector('i').classList.add('fas');
      }
    }
    
    // Agregar tarjeta al contenedor
    cardContainer.appendChild(card);
  });
}

/**
 * Muestra series en la interfaz
 */
function displaySeries(series) {
  const cardContainer = document.getElementById('card-container');
  if (!cardContainer) return;
  
  // Limpiar contenedor
  cardContainer.innerHTML = '';
  
  if (series.length === 0) {
    displayError('No se encontraron series.');
    return;
  }
  
  const template = document.getElementById('card-template');
  const currentLang = document.getElementById('language-selector')?.value || 'es';
  
  series.forEach(serie => {
    let card;
    
    if (template) {
      card = template.cloneNode(true);
      card.style.display = 'flex';
      card.removeAttribute('id');
    } else {
      // Crear estructura de tarjeta si no hay template
      card = document.createElement('div');
      card.className = 'character-card';
      card.innerHTML = `
        <div class="favorite-icon"><i class="far fa-star"></i></div>
        <div class="character-image-container">
          <img src="" alt="" class="character-image">
        </div>
        <div class="character-info">
          <h3 class="character-name"></h3>
          <div class="character-meta">
            <span class="character-comics view-more-btn"></span>
          </div>
        </div>
        <div class="universe-badge"></div>
      `;
    }
    
    // Configurar atributos de datos
    card.setAttribute('data-id', serie.id_serie || serie.id);
    card.setAttribute('data-type', 'series');
    
    // Configurar elementos de la tarjeta
    const img = card.querySelector('.character-image');
    const name = card.querySelector('.character-name');
    const viewMoreBtn = card.querySelector('.character-comics');
    const universeBadge = card.querySelector('.universe-badge');
    const favoriteIcon = card.querySelector('.favorite-icon');
    
    // Configurar nombre
    name.textContent = serie.nombre || serie.name || serie.title || 'Sin nombre';
    
    // Configurar imagen
    const imageUrl = serie.URL_imagen || 
                    (serie.thumbnail && (
                      typeof serie.thumbnail === 'string' ? 
                      serie.thumbnail : 
                      serie.thumbnail.path + '.' + serie.thumbnail.extension
                    ));
    
    if (imageUrl) {
      img.src = imageUrl;
      img.alt = name.textContent;
    } else {
      img.src = 'assets/images/no-image.jpg';
      img.alt = 'Imagen no disponible';
      img.classList.add('no-image');
    }
    
    // Configurar botón "Ver más" (siempre con texto consistente)
    const viewMoreText = {
      'es': 'Ver más',
      'en': 'View more',
      'fr': 'Voir plus',
      'ro': 'Vezi mai mult'
    };
    
    viewMoreBtn.classList.add('view-more-btn');
    viewMoreBtn.textContent = viewMoreText[currentLang] || viewMoreText['es'];
    
    // Agregar evento para abrir modal
    viewMoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof openSerieModal === 'function') {
        openSerieModal(serie, currentLang);
      } else {
        // Fallback a openComicModal si no existe la función específica
        openComicModal(serie, currentLang);
      }
    });
    
    // Configurar insignia de universo (años si están disponibles)
    let universeText = '';
    if (serie.fecha_inicio) {
      const startYear = new Date(serie.fecha_inicio).getFullYear();
      const endYear = serie.fecha_fin ? new Date(serie.fecha_fin).getFullYear() : 'Presente';
      universeText = `${startYear}-${endYear}`;
    } else {
      universeText = translations[currentLang]['character.universe616'] || 'Universo 616';
    }
    universeBadge.textContent = universeText;
    
    // Configurar icono de favoritos si existe la función
    if (favoriteIcon && typeof isInFavorites === 'function') {
      const id = serie.id_serie || serie.id;
      if (isInFavorites(id, 'series')) {
        favoriteIcon.classList.add('active');
        favoriteIcon.querySelector('i').classList.remove('far');
        favoriteIcon.querySelector('i').classList.add('fas');
      }
    }
    
    // Agregar tarjeta al contenedor
    cardContainer.appendChild(card);
  });
}

/**
 * Muestra eventos en la interfaz
 */
function displayEvents(events) {
  const cardContainer = document.getElementById('card-container');
  if (!cardContainer) return;
  
  // Limpiar contenedor
  cardContainer.innerHTML = '';
  
  if (events.length === 0) {
    displayError('No se encontraron eventos.');
    return;
  }
  
  const template = document.getElementById('card-template');
  const currentLang = document.getElementById('language-selector')?.value || 'es';
  
  events.forEach(event => {
    let card;
    
    if (template) {
      card = template.cloneNode(true);
      card.style.display = 'flex';
      card.removeAttribute('id');
    } else {
      // Crear estructura de tarjeta si no hay template
      card = document.createElement('div');
      card.className = 'character-card';
      card.innerHTML = `
        <div class="favorite-icon"><i class="far fa-star"></i></div>
        <div class="character-image-container">
          <img src="" alt="" class="character-image">
        </div>
        <div class="character-info">
          <h3 class="character-name"></h3>
          <div class="character-meta">
            <span class="character-comics view-more-btn"></span>
          </div>
        </div>
        <div class="universe-badge"></div>
      `;
    }
    
    // Configurar atributos de datos
    card.setAttribute('data-id', event.id_evento || event.id);
    card.setAttribute('data-type', 'events');
    
    // Configurar elementos de la tarjeta
    const img = card.querySelector('.character-image');
    const name = card.querySelector('.character-name');
    const viewMoreBtn = card.querySelector('.character-comics');
    const universeBadge = card.querySelector('.universe-badge');
    const favoriteIcon = card.querySelector('.favorite-icon');
    
    // Configurar nombre
    name.textContent = event.nombre || event.name || event.title || 'Sin nombre';
    
    // Configurar imagen (los eventos generalmente no tienen imagen, usar placeholder)
    const imageUrl = event.URL_imagen || 
                    (event.thumbnail && (
                      typeof event.thumbnail === 'string' ? 
                      event.thumbnail : 
                      event.thumbnail.path + '.' + event.thumbnail.extension
                    ));
    
    if (imageUrl) {
      img.src = imageUrl;
      img.alt = name.textContent;
    } else {
      img.src = 'assets/images/event-default.jpg';
      img.alt = 'Imagen de evento';
    }
    
    // Configurar botón "Ver más" (siempre con texto consistente)
    const viewMoreText = {
      'es': 'Ver más',
      'en': 'View more',
      'fr': 'Voir plus',
      'ro': 'Vezi mai mult'
    };
    
    viewMoreBtn.classList.add('view-more-btn');
    viewMoreBtn.textContent = viewMoreText[currentLang] || viewMoreText['es'];
    
    // Agregar evento para abrir modal
    viewMoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof openEventModal === 'function') {
        openEventModal(event, currentLang);
      } else {
        // Fallback a openComicModal si no existe la función específica
        openComicModal(event, currentLang);
      }
    });
    
    // Configurar insignia de universo (fechas si están disponibles)
    let universeText = '';
    if (event.fecha_inicio) {
      const startDate = new Date(event.fecha_inicio).toLocaleDateString();
      const endDate = event.fecha_fin ? new Date(event.fecha_fin).toLocaleDateString() : 'Presente';
      universeText = `${startDate} - ${endDate}`;
    } else {
      universeText = translations[currentLang]['character.universe616'] || 'Universo 616';
    }
    universeBadge.textContent = universeText;
    
    // Configurar icono de favoritos si existe la función
    if (favoriteIcon && typeof isInFavorites === 'function') {
      const id = event.id_evento || event.id;
      if (isInFavorites(id, 'events')) {
        favoriteIcon.classList.add('active');
        favoriteIcon.querySelector('i').classList.remove('far');
        favoriteIcon.querySelector('i').classList.add('fas');
      }
    }
    
    // Agregar tarjeta al contenedor
    cardContainer.appendChild(card);
  });
}

/**
 * Crea controles de paginación
 */
function createPagination() {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  let paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.className = 'pagination';
    
    const cardContainer = document.getElementById('card-container');
    if (cardContainer && cardContainer.parentNode) {
      cardContainer.parentNode.insertBefore(paginationContainer, cardContainer.nextSibling);
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
  
  const currentLang = document.getElementById('language-selector')?.value || 'es';
  
  // Obtener texto para el tipo de contenido actual
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
  }
  
  // Construir texto de información de página
  pageInfo.textContent = `${translations[currentLang]['pagination.page'] || 'Página'} ${currentPage} ${translations[currentLang]['pagination.of'] || 'de'} ${totalPages} (${totalItems} ${itemsLabel})`;
  
  paginationContainer.appendChild(pageInfo);
}

/**
 * Navega a una página específica
 */
async function goToPage(page) {
  currentPage = page;
  await loadItems();
  
  // Hacer scroll suave al inicio de los resultados
  const mainElement = document.querySelector('main');
  if (mainElement) {
    mainElement.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Configura filtros de contenido (personajes, comics, etc.)
 */
function setupContentFilters() {
  const contentFilterButtons = document.querySelectorAll('.content-filter-button');
  if (!contentFilterButtons.length) return;
  
  contentFilterButtons.forEach(button => {
    // Crear nuevo botón para evitar duplicación de eventos
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', async function() {
      // Actualizar clases activas
      document.querySelectorAll('.content-filter-button').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Obtener tipo de contenido
      const contentType = this.getAttribute('data-content');
      
      // Mostrar/ocultar filtros de universo según corresponda
      const universeFilters = document.querySelector('.universe-filters');
      if (universeFilters) {
        universeFilters.style.display = contentType === 'characters' ? 'block' : 'none';
      }
      
      // Actualizar tipo de contenido actual y reiniciar página
      if (contentType !== currentContentFilter) {
        currentContentFilter = contentType || 'characters';
        currentPage = 1;
        currentSearchTerm = '';
        
        // Limpiar búsqueda
        const searchInput = document.getElementById('buscador');
        if (searchInput) {
          searchInput.value = '';
        }
        
        // Actualizar placeholder del buscador según tipo de contenido
        updateSearchPlaceholder(contentType);
        
        // Cargar nuevos elementos
        await loadItems();
      }
    });
  });
}

/**
 * Actualiza el placeholder del buscador según el tipo de contenido
 */
function updateSearchPlaceholder(contentType) {
  const searchInput = document.getElementById('buscador');
  if (!searchInput) return;
  
  const currentLang = document.getElementById('language-selector')?.value || 'es';
  
  if (contentType === 'characters') {
    searchInput.placeholder = translations[currentLang]['search.placeholder'] || '¿Qué superhéroe buscas?';
  } else if (contentType === 'comics') {
    searchInput.placeholder = currentLang === 'es' ? '¿Qué cómic buscas?' :
                             currentLang === 'en' ? 'Which comic are you looking for?' :
                             currentLang === 'fr' ? 'Quel comic cherchez-vous?' :
                             'Ce benzi desenate cauți?';
  } else if (contentType === 'series') {
    searchInput.placeholder = currentLang === 'es' ? '¿Qué serie buscas?' :
                             currentLang === 'en' ? 'Which series are you looking for?' :
                             currentLang === 'fr' ? 'Quelle série cherchez-vous?' :
                             'Ce serie cauți?';
  } else if (contentType === 'events') {
    searchInput.placeholder = currentLang === 'es' ? '¿Qué evento buscas?' :
                             currentLang === 'en' ? 'Which event are you looking for?' :
                             currentLang === 'fr' ? 'Quel événement cherchez-vous?' :
                             'Ce eveniment cauți?';
  } else if (contentType === 'favorites') {
    searchInput.placeholder = currentLang === 'es' ? 'Buscar en tus favoritos' :
                             currentLang === 'en' ? 'Search in your favorites' :
                             currentLang === 'fr' ? 'Rechercher dans vos favoris' :
                             'Caută în favoritele tale';
  }
}

/**
 * Configura filtros de universo
 */
function setupUniverseFilters() {
  const filterButtons = document.querySelectorAll('.filter-button');
  if (!filterButtons.length) return;
  
  filterButtons.forEach(button => {
    // Crear nuevo botón para evitar duplicación de eventos
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', async function() {
      // Actualizar clases activas
      document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Actualizar filtro de universo y reiniciar página
      const filterValue = this.getAttribute('data-universe') || 'all';
      if (filterValue !== currentUniverseFilter) {
        currentUniverseFilter = filterValue;
        currentPage = 1;
        
        // Cargar nuevos elementos con el filtro aplicado
        await loadItems();
      }
    });
  });
}

/**
 * Configura la funcionalidad de búsqueda
 */
function setupSearch() {
  const searchButton = document.getElementById('search');
  const searchInput = document.getElementById('buscador');
  
  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
}

/**
 * Ejecuta la búsqueda
 */
async function performSearch() {
  const searchInput = document.getElementById('buscador');
  if (!searchInput) return;
  
  // Actualizar término de búsqueda y reiniciar página
  currentSearchTerm = searchInput.value.trim();
  currentPage = 1;
  
  // Cargar elementos con la búsqueda aplicada
  await loadItems();
}

/**
 * Función para abrir el modal de personaje
 */
function openCharacterModal(character, currentLang) {
  // Verificar si existe el modal
  let modal = document.getElementById('character-modal');
  if (!modal) {
    console.error('Modal no encontrado');
    return;
  }
  
  // Configurar atributos del modal
  modal.setAttribute('data-id', character.id_personaje || character.id);
  modal.setAttribute('data-type', 'characters');
  
  // Obtener elementos del modal
  const modalImage = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalUniverse = document.getElementById('modal-universe');
  const modalComics = document.getElementById('modal-comics');
  const modalDescription = document.getElementById('modal-description');
  const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
  
  // Configurar imagen
  const imageUrl = character.URL_imagen || 
                  (character.thumbnail && (
                    typeof character.thumbnail === 'string' ? 
                    character.thumbnail : 
                    character.thumbnail.path + '.' + character.thumbnail.extension
                  ));
  
  if (imageUrl) {
    modalImage.src = imageUrl;
  } else {
    modalImage.src = 'assets/images/no-image.jpg';
  }
  
  modalImage.alt = character.nombre || character.name || 'Personaje Marvel';
  
  // Configurar nombre
  modalName.textContent = character.nombre || character.name || 'Sin nombre';
  
  // Configurar universo (simulado)
  modalUniverse.textContent = translations[currentLang]['filters.universe616'] || 'Universo 616 (Principal)';
  
  // Configurar cómics disponibles
  const comicsCount = character.comics?.available || 0;
  
  // Usar plantilla de traducción si existe
  if (translations[currentLang]['character.comicsCount']) {
    modalComics.textContent = translations[currentLang]['character.comicsCount'].replace('{count}', comicsCount);
  } else {
    modalComics.textContent = `${comicsCount} cómics disponibles`;
  }
  
  // Configurar descripción
  if (character.descripcion || character.description) {
    modalDescription.textContent = character.descripcion || character.description;
  } else {
    // Mensaje de "sin descripción" según idioma
    const noDescriptionText = {
      'es': 'No hay descripción disponible para este personaje.',
      'en': 'No description available for this character.',
      'fr': 'Aucune description disponible pour ce personnage.',
      'ro': 'Nu există descriere disponibilă pentru acest personaj.'
    };
    modalDescription.textContent = noDescriptionText[currentLang] || noDescriptionText['es'];
  }
  
  // Traducir etiquetas del modal
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
  
  // Configurar botón de favoritos
  if (modalFavoriteBtn && typeof isInFavorites === 'function') {
    const id = character.id_personaje || character.id;
    const isFavorite = isInFavorites(id, 'characters');
    
    if (isFavorite) {
      modalFavoriteBtn.classList.add('active');
      modalFavoriteBtn.querySelector('i').classList.remove('far');
      modalFavoriteBtn.querySelector('i').classList.add('fas');
      
      const textSpan = modalFavoriteBtn.querySelector('span');
      if (textSpan) {
        textSpan.textContent = translations[currentLang]['modal.removeFromFavorites'] || 'Remove from favorites';
      }
    } else {
      modalFavoriteBtn.classList.remove('active');
      modalFavoriteBtn.querySelector('i').classList.remove('fas');
      modalFavoriteBtn.querySelector('i').classList.add('far');
      
      const textSpan = modalFavoriteBtn.querySelector('span');
      if (textSpan) {
        textSpan.textContent = translations[currentLang]['modal.addToFavorites'] || 'Add to favorites';
      }
    }
  }
  
  // Mostrar modal con animación
  modal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Evitar scroll detrás del modal
  
  // Configurar eventos de cierre
  setupModalEventListeners();
}

/**
 * Función para abrir modal de cómic
 */
function openComicModal(comic, currentLang) {
  // Verificar si existe el modal
  let modal = document.getElementById('character-modal');
  if (!modal) {
    console.error('Modal no encontrado');
    return;
  }
  
  // Configurar atributos del modal
  modal.setAttribute('data-id', comic.id_comic || comic.id);
  modal.setAttribute('data-type', 'comics');
  
  // Obtener elementos del modal
  const modalImage = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalUniverse = document.getElementById('modal-universe');
  const modalComics = document.getElementById('modal-comics');
  const modalDescription = document.getElementById('modal-description');
  const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
  
  // Configurar imagen
  const imageUrl = comic.URL_imagen || 
                  (comic.thumbnail && (
                    typeof comic.thumbnail === 'string' ? 
                    comic.thumbnail : 
                    comic.thumbnail.path + '.' + comic.thumbnail.extension
                  ));
  
  if (imageUrl) {
    modalImage.src = imageUrl;
  } else {
    modalImage.src = 'assets/images/no-image.jpg';
  }
  
  modalImage.alt = comic.titulo || comic.title || 'Comic Marvel';
  
  // Configurar título
  modalName.textContent = comic.titulo || comic.title || 'Sin título';
  
  // Configurar universo/serie
  if (comic.id_serie) {
    modalUniverse.textContent = `Serie #${comic.id_serie}`;
  } else {
    modalUniverse.textContent = translations[currentLang]['filters.universe616'] || 'Universo 616 (Principal)';
  }
  
  // Configurar detalles (número de edición)
  if (comic.numero_edicion || comic.issueNumber) {
    if (currentLang === 'es') modalComics.textContent = `Número ${comic.numero_edicion || comic.issueNumber}`;
    else if (currentLang === 'en') modalComics.textContent = `Issue ${comic.numero_edicion || comic.issueNumber}`;
    else if (currentLang === 'fr') modalComics.textContent = `Numéro ${comic.numero_edicion || comic.issueNumber}`;
    else if (currentLang === 'ro') modalComics.textContent = `Numărul ${comic.numero_edicion || comic.issueNumber}`;
  } else if (comic.fecha_publicacion) {
    const publishDate = new Date(comic.fecha_publicacion).toLocaleDateString();
    if (currentLang === 'es') modalComics.textContent = `Publicado: ${publishDate}`;
    else if (currentLang === 'en') modalComics.textContent = `Published: ${publishDate}`;
    else if (currentLang === 'fr') modalComics.textContent = `Publié: ${publishDate}`;
    else if (currentLang === 'ro') modalComics.textContent = `Publicat: ${publishDate}`;
  } else {
    modalComics.textContent = '';
  }
  
  // Configurar descripción
  if (comic.descripcion || comic.description) {
    modalDescription.textContent = comic.descripcion || comic.description;
  } else {
    // Mensaje de "sin descripción" según idioma
    const noDescriptionText = {
      'es': 'No hay descripción disponible.',
      'en': 'No description available.',
      'fr': 'Aucune description disponible.',
      'ro': 'Nu există descriere disponibilă.'
    };
    modalDescription.textContent = noDescriptionText[currentLang] || noDescriptionText['es'];
  }
  
  // Traducir etiquetas del modal
  document.getElementById('modal-universe-title').textContent = {
    'es': 'Serie',
    'en': 'Series',
    'fr': 'Série',
    'ro': 'Serie'
  }[currentLang] || 'Series';
  
  document.getElementById('modal-comics-title').textContent = {
    'es': 'Detalles',
    'en': 'Details',
    'fr': 'Détails',
    'ro': 'Detalii'
  }[currentLang] || 'Details';
  
  document.getElementById('modal-description-title').textContent = {
    'es': 'Descripción',
    'en': 'Description',
    'fr': 'Description',
    'ro': 'Descriere'
  }[currentLang] || 'Description';
  
  // Configurar botón de favoritos
  if (modalFavoriteBtn && typeof isInFavorites === 'function') {
    const id = comic.id_comic || comic.id;
    const isFavorite = isInFavorites(id, 'comics');
    
    if (isFavorite) {
      modalFavoriteBtn.classList.add('active');
      modalFavoriteBtn.querySelector('i').classList.remove('far');
      modalFavoriteBtn.querySelector('i').classList.add('fas');
      
      const textSpan = modalFavoriteBtn.querySelector('span');
      if (textSpan) {
        textSpan.textContent = translations[currentLang]['modal.removeFromFavorites'] || 'Remove from favorites';
      }
    } else {
      modalFavoriteBtn.classList.remove('active');
      modalFavoriteBtn.querySelector('i').classList.remove('fas');
      modalFavoriteBtn.querySelector('i').classList.add('far');
      
      const textSpan = modalFavoriteBtn.querySelector('span');
      if (textSpan) {
        textSpan.textContent = translations[currentLang]['modal.addToFavorites'] || 'Add to favorites';
      }
    }
  }
  
  // Mostrar modal con animación
  modal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Evitar scroll detrás del modal
  
  // Configurar eventos de cierre
  setupModalEventListeners();
}

/**
 * Configurar eventos para el modal
 */
function setupModalEventListeners() {
  const modal = document.getElementById('character-modal');
  const closeBtn = document.querySelector('.close-modal');
  
  if (!modal || !closeBtn) return;
  
  // Cerrar al hacer clic en el botón X
  closeBtn.addEventListener('click', closeModal);
  
  // Cerrar al hacer clic fuera del contenido
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Cerrar con tecla Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
  
  // Configurar botón de favoritos en el modal
  const favoriteBtn = document.getElementById('modal-favorite-btn');
  if (favoriteBtn && typeof toggleFavorite === 'function') {
    favoriteBtn.addEventListener('click', function() {
      const modal = document.getElementById('character-modal');
      const id = modal.getAttribute('data-id');
      const type = modal.getAttribute('data-type');
      const name = document.getElementById('modal-name').textContent;
      
      // Llamar a la función de alternar favorito
      toggleFavorite(id, type, name);
      
      // Actualizar interfaz
      loadItems();
    });
  }
}

/**
 * Cerrar modal
 */
function closeModal() {
  const modal = document.getElementById('character-modal');
  if (!modal) return;
  
  modal.classList.remove('show');
  document.body.style.overflow = ''; // Restaurar scroll
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);