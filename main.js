
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




const publicKey = 'dd0b4fdacdd0b53c744fb36389d154db'; // Tu clave pública
const privateKey = '360fa86fb66f723c45b84fb38e08c7477fbf29f2'; // Tu clave privada
const baseUrl = 'https://gateway.marvel.com/v1/public';

// Función para generar el hash MD5 correctamente
function generateHash(ts) {
    return CryptoJS.MD5(ts + privateKey + publicKey).toString();
}

// Obtener y mostrar personajes
async function fetchAllCharacters() {
  const ts = Date.now().toString(); // Genera un timestamp único
  const hash = generateHash(ts); // Genera el hash correcto
  const url = `${baseUrl}/characters?limit=20&ts=${ts}&apikey=${publicKey}&hash=${hash}`; // Usar limit=5

  console.log("🟢 URL de la petición:", url);

  try {
      const response = await fetch(url);
      console.log("🔍 Respuesta del servidor:", response);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("✅ Personajes recibidos:", data);
      return data.data.results;
  } catch (error) {
      console.error("❌ Error obteniendo personajes:", error);
      displayError('Error al cargar los personajes. Por favor, inténtalo más tarde.');
      return [];
  }
}

// Mostrar los personajes en pantalla
function displayCharacters(characters) {
    const cardsGrid = document.querySelector('.cards-grid');
    const errorMessage = document.getElementById('error-message');
    cardsGrid.innerHTML = ''; 
    errorMessage.textContent = ''; 

    if (characters.length === 0) {
        errorMessage.textContent = 'No se encontraron personajes.';
        return;
    }

    characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card';

        const img = document.createElement('img');
        img.src = `${character.thumbnail.path}.${character.thumbnail.extension}`;
        img.alt = character.name;
        img.className = 'character-image';

        const info = document.createElement('div');
        info.className = 'character-info';

        const name = document.createElement('h3');
        name.className = 'character-name';
        name.textContent = character.name;

        const comicsCount = document.createElement('p');
        comicsCount.className = 'character-comics';
        comicsCount.textContent = `${character.comics.available} cómics disponibles`;

        info.appendChild(name);
        info.appendChild(comicsCount);
        card.appendChild(img);
        card.appendChild(info);
        cardsGrid.appendChild(card);
    });
}

// Cargar personajes al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    const characters = await fetchAllCharacters();
    displayCharacters(characters);
});

// Función para mostrar errores en la página
function displayError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
}

// Evento de búsqueda (corrigiendo la función que se usa)
document.getElementById('search').addEventListener('click', async () => {
    const searchTerm = document.getElementById('buscador').value.trim();
    if (searchTerm) {
        // Puedes agregar lógica aquí para realizar una búsqueda por nombre de personaje
        const characters = await fetchAllCharacters(); // Aquí debería llamarse `fetchAllCharacters` si no estás haciendo una búsqueda más avanzada
        displayCharacters(characters);
    } else {
        displayError('Por favor, ingresa un nombre de personaje.');
    }
});
