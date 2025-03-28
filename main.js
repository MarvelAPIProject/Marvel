/* The above code defines a JavaScript object named `translations` that contains language-specific
translations for a Marvel-themed website. Each language (Spanish, English, French, and Romanian) has
its own set of key-value pairs for various text elements such as headers, subtitles, search
placeholders, button texts, filters, character information, footer details, and more. These
translations allow the website to display content in multiple languages based on the user's language
preference. */

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



/* The above code is setting up variables for a Marvel API integration in JavaScript. It defines a
public key, a private key, and a base URL for making requests to the Marvel API. These keys are
typically used for authentication and authorization when accessing the Marvel API endpoints. */

const publicKey = 'dd0b4fdacdd0b53c744fb36389d154db'; // Tu clave pública
const privateKey = '360fa86fb66f723c45b84fb38e08c7477fbf29f2'; // Tu clave privada
const baseUrl = 'https://gateway.marvel.com/v1/public';

// Función para generar el hash MD5 correctamente
function generateHash(ts) {
    return CryptoJS.MD5(ts + privateKey + publicKey).toString();
}

/* The above code is a JavaScript function that fetches a list of characters from a remote API. Here is
a breakdown of what the code does: */
// Obtener y mostrar personajes
async function fetchAllCharacters() {
  const ts = Date.now().toString(); // Genera un timestamp único
  const hash = generateHash(ts); // Genera el hash correcto
  const url = `${baseUrl}/characters?limit=5&ts=${ts}&apikey=${publicKey}&hash=${hash}`;

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
/**
 * The function `displayCharacters` takes an array of character objects, creates HTML cards for each
 * character, and displays them in a specified container on a web page.
 * @param characters - The `characters` parameter is an array containing objects representing different
 * characters. Each character object has properties like `name`, `thumbnail` (which is an object
 * containing `path` and `extension` properties for the image URL), and `description`. The
 * `displayCharacters` function takes this array of character
 * @returns If the `characters` array is empty, the function will return early after setting the error
 * message "No se encontraron personajes." in the element with id "error-message". Otherwise, if there
 * are characters in the array, the function will display each character's information in a card format
 * on the webpage.
 */
function displayCharacters(characters) {
  const cardContainer = document.getElementById("card-container");
  const template = document.getElementById("card-template");

  cardContainer.innerHTML = ""; // Limpiar contenedor antes de agregar nuevas tarjetas

  if (characters.length === 0) {
      document.getElementById("error-message").textContent = "No se encontraron personajes.";
      return;
  }

  characters.forEach(character => {
      const cardClone = template.cloneNode(true);
      cardClone.style.display = "block"; // Hacer visible la tarjeta clonada
      cardClone.querySelector(".card-image").src = `${character.thumbnail.path}.${character.thumbnail.extension}`;
      cardClone.querySelector(".card-image").alt = character.name;
      cardClone.querySelector(".card-name").textContent = character.name;
      cardClone.querySelector(".card-description").textContent = character.description || "No hay descripción disponible.";
      cardClone.querySelector(".card-comics").textContent = character.comics.available || 0;
      cardClone.querySelector(".card-universe").textContent = character.universe || translations['es']['character.universe616'];
      
      cardContainer.appendChild(cardClone);
  });
}
/* The above code is written in JavaScript and it is loading characters when the page is loaded. It is
using an event listener to wait for the DOM content to be fully loaded, then it is fetching all
characters asynchronously using the `fetchAllCharacters` function and displaying them on the page
using the `displayCharacters` function. */

// Cargar personajes al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    const characters = await fetchAllCharacters();
    displayCharacters(characters);
});

/**
 * The function `displayError` is used to show error messages on a webpage with appropriate styling.
 * @param message - The `message` parameter in the `displayError` function is a string that represents
 * the error message that you want to display on the webpage. This message will be shown to the user
 * when an error occurs and is passed as an argument to the function when calling it.
 */
// Función para mostrar errores en la página
function displayError(message) {
  const errorContainer = document.getElementById('error-container');
  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = message;
  errorContainer.style.display = "block"; // Mostrar el error con estilos adecuados
}



/* The above code is adding an event listener to a search button with the id 'search'. When the button
is clicked, it retrieves the value entered in an input field with the id 'buscador', trims any
whitespace from the value, and stores it in the searchTerm variable. If the searchTerm is not empty,
it then fetches all characters asynchronously using the fetchAllCharacters function and displays the
characters using the displayCharacters function. If the searchTerm is empty, it displays an error
message saying "Por favor, ingresa un nombre de personaje." */
// Evento de búsqueda (corrigiendo la función que se usa)
document.getElementById('search').addEventListener('click', async () => {
    const searchTerm = document.getElementById('buscador').value.trim();
    if (searchTerm) {
        const characters = await fetchAllCharacters(); 
        displayCharacters(characters);
    } else {
        displayError('Por favor, ingresa un nombre de personaje.');
    }
});
