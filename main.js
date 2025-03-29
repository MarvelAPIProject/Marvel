
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
    "footer.educational": "Este sitio es un proyecto educativo sin fines comerciales."
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
    "footer.educational": "This site is an educational project with no commercial purpose."
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
    "footer.educational": "Ce site est un projet éducatif sans but commercial."
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
    "footer.educational": "Acest site este un proiect educațional fără scop comercial."
  }
};

// Style for the language selector
const style = document.createElement('style');

document.head.appendChild(style);

// Create improved language selector
function createLanguageSelector() {
  // Get existing language selector and its parent
  const existingSelector = document.getElementById('language-selector');
  const parent = existingSelector.parentNode;
  
  // Create new container
  const container = document.createElement('div');
  container.className = 'language-selector-container';
  
  // Create label
  const label = document.createElement('label');
  label.className = 'language-label';
  label.setAttribute('for', 'language-selector-improved');
  
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
}

// Initialize language selector when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create the improved language selector
  const languageSelector = createLanguageSelector();
  
  // Check if there's a saved language preference
  const savedLanguage = localStorage.getItem('selectedLanguage') || 'es';
  languageSelector.value = savedLanguage;
  
  // Apply the saved language
  updateLanguage(savedLanguage);
  
  // Add change event listener
  languageSelector.addEventListener('change', (e) => {
    updateLanguage(e.target.value);
  });
});


// Configuración
const CONFIG = {
  publicKey: '4efc99263ca737e15328c189af7dc0b0', // Reemplaza con tu clave real
  privateKey: 'c13b1561dc18f4872a6db81c50629e5674dc137d', // Reemplaza con tu clave real
  baseUrl: 'https://gateway.marvel.com/v1/public',
  fallbackUrl: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json',
  defaultLimit: 20
};

// Función para generar el hash
function generateHash(ts) {
  return CryptoJS.MD5(ts + CONFIG.privateKey + CONFIG.publicKey).toString();
}

// Función mejorada para obtener personajes
async function fetchAllCharacters() {
  const ts = Date.now().toString(); // Timestamp actual
  // Generar el hash usando CryptoJS
  const hash = generateHash(ts);
  const url = `${CONFIG.baseUrl}/characters?limit=${CONFIG.defaultLimit}&ts=${ts}&apikey=${CONFIG.publicKey}&hash=${hash}`;

  console.log(url);

  try {
    // Intenta con la API Marvel primero
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.results || [];
  } catch (error) {
    console.error("Error con Marvel API:", error);
    // Fallback a datos de prueba si Marvel API falla
    return await fetchFallbackData();
  }
}

// Función de fallback
async function fetchFallbackData() {
  try {
    const response = await fetch(CONFIG.fallbackUrl);
    const data = await response.json();
    return data.slice(0, CONFIG.defaultLimit).map(character => ({
      id: character.id,
      name: character.name,
      thumbnail: {
        path: character.images?.lg || character.images?.md || character.images?.sm,
        extension: 'jpg'
      },
      comics: {
        available: character.comics?.available || 0
      }
    }));
  } catch (fallbackError) {
    console.error("Error con datos de fallback:", fallbackError);
    return []; // Retorna array vacío si todo falla
  }
}

// Función para mostrar personajes (ahora más robusta)
function displayCharacters(characters) {
  const cardsGrid = document.querySelector('.cards-grid');
  const errorMessage = document.getElementById('error-message');
  
  // Limpiar contenido previo
  cardsGrid.innerHTML = '';
  errorMessage.textContent = '';

  // Verificar si hay personajes
  if (!characters || characters.length === 0) {
    errorMessage.textContent = 'No se pudieron cargar los personajes. Intenta recargar la página.';
    return;
  }

  // Mostrar cada personaje
  characters.forEach(character => {
    // Validación de datos
    if (!character || !character.name) return;

    const card = document.createElement('div');
    card.className = 'character-card';

    // Imagen (con validación)
    const img = document.createElement('img');
    img.className = 'character-image';
    img.alt = character.name;
    
    if (character.thumbnail) {
      img.src = `${character.thumbnail.path || ''}.${character.thumbnail.extension || 'jpg'}`.replace('http://', 'https://');
    } else {
      img.src = 'https://via.placeholder.com/300x450?text=No+Image';
    }

    // Información del personaje
    const info = document.createElement('div');
    info.className = 'character-info';

    const name = document.createElement('h3');
    name.className = 'character-name';
    name.textContent = character.name;

    const comicsCount = document.createElement('p');
    comicsCount.className = 'character-comics';
    comicsCount.textContent = `${character.comics?.available || 0} cómics disponibles`;

    info.appendChild(name);
    info.appendChild(comicsCount);
    card.appendChild(img);
    card.appendChild(info);
    cardsGrid.appendChild(card);
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const characters = await fetchAllCharacters();
    displayCharacters(characters);
  } catch (error) {
    console.error("Error al inicializar:", error);
    document.getElementById('error-message').textContent = 
      'Error al cargar los personajes. Por favor, inténtalo más tarde.';
  }
});