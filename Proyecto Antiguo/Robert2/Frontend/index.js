/**
 * MARVEL APP - INTEGRACIÓN COMPLETA
 * 
 * Este archivo sirve como punto de entrada para la aplicación de Marvel
 * que conecta la interfaz de usuario con la base de datos local.
 */

// Cargar dependencias en orden específico
document.addEventListener('DOMContentLoaded', function() {
  // 1. Configuración inicial (ya existente)
  
  // 2. Inicializar favoritos
  if (typeof loadFavorites === 'function') {
    loadFavorites();
  }
  
  // 3. Inicializar conexión con la base de datos
  initializeDb();
  
  // 4. Configurar eventos para la interfaz de usuario
  setupUIEvents();
});

/**
 * Inicializa la conexión con la base de datos local
 */
function initializeDb() {
  // Verificar si la API está funcionando
  fetch('http://localhost:3000/api')
    .then(response => {
      if (!response.ok) {
        throw new Error('API no disponible');
      }
      return response.json();
    })
    .then(data => {
      console.log('API de Marvel conectada:', data.message);
      // La API está funcionando, cargamos los contenidos
      loadContent();
    })
    .catch(error => {
      console.error('Error al conectar con la API local:', error);
      showApiError();
    });
}

/**
 * Muestra un error si la API no está disponible
 */
function showApiError() {
  const container = document.getElementById('card-container');
  if (!container) return;
  
  container.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--rojito);">
      <h2>Error de conexión</h2>
      <p>No se pudo conectar con la API de Marvel. Por favor verifica que el servidor está en ejecución en http://localhost:3000</p>
      <p>Para iniciar el servidor, ejecuta: <code>node server.js</code> en la carpeta del proyecto.</p>
      <button id="retry-connection" class="action-btn" style="margin-top: 20px; padding: 10px 20px; background-color: var(--rojito); border: none; color: white; border-radius: 4px; cursor: pointer;">
        Reintentar conexión
      </button>
    </div>
  `;
  
  // Configurar botón para reintentar
  const retryButton = document.getElementById('retry-connection');
  if (retryButton) {
    retryButton.addEventListener('click', initializeDb);
  }
}

/**
 * Carga el contenido inicial
 */
function loadContent() {
  // Obtener parámetros de la URL si existen
  const urlParams = new URLSearchParams(window.location.search);
  const contentType = urlParams.get('type') || 'characters';
  const searchTerm = urlParams.get('search') || '';
  const page = parseInt(urlParams.get('page')) || 1;
  
  // Establecer filtro de contenido activo
  const contentBtn = document.querySelector(`.content-filter-button[data-content="${contentType}"]`);
  if (contentBtn) {
    document.querySelectorAll('.content-filter-button').forEach(btn => {
      btn.classList.remove('active');
    });
    contentBtn.classList.add('active');
    
    // Actualizar variable global
    if (typeof currentContentFilter !== 'undefined') {
      currentContentFilter = contentType;
    }
  }
  
  // Establecer término de búsqueda si existe
  if (searchTerm) {
    const searchInput = document.getElementById('buscador');
    if (searchInput) {
      searchInput.value = searchTerm;
    }
    
    // Actualizar variable global
    if (typeof currentSearchTerm !== 'undefined') {
      currentSearchTerm = searchTerm;
    }
  }
  
  // Establecer página actual
  if (typeof currentPage !== 'undefined') {
    currentPage = page;
  }
  
  // Cargar items
  if (typeof loadItems === 'function') {
    loadItems();
  }
}

/**
 * Configura eventos para la interfaz de usuario
 */
function setupUIEvents() {
  // Asegurar que el botón "Ver más" siempre tenga el mismo texto
  document.addEventListener('click', function(e) {
    // Cuando se cambia de página o filtro, actualizar botones
    if (e.target.closest('.pagination-button') || 
        e.target.closest('.filter-button') || 
        e.target.closest('.content-filter-button')) {
      
      setTimeout(() => {
        const currentLang = document.getElementById('language-selector')?.value || 'es';
        updateViewMoreButtons(currentLang);
      }, 500);
    }
  });
  
  // Observar cambios en el DOM para mantener consistencia
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          const currentLang = document.getElementById('language-selector')?.value || 'es';
          updateViewMoreButtons(currentLang);
        }
      }
    });
    
    // Observar cambios en el contenedor de tarjetas
    const container = document.getElementById('card-container');
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    }
  }
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
