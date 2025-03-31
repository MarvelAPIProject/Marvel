// Constants for API endpoints
const API_BASE_URL = 'https://anapioficeandfire.com/api';
const CHARACTERS_ENDPOINT = `${API_BASE_URL}/characters`;
const HOUSES_ENDPOINT = `${API_BASE_URL}/houses`;
const BOOKS_ENDPOINT = `${API_BASE_URL}/books`;

// Image APIs
const BOOK_COVER_API = 'https://covers.openlibrary.org/b/isbn/';
const CHARACTER_IMAGE_API = 'https://thronesapi.com/api/v2/Characters';
const HOUSE_IMAGE_API = 'https://www.anapioficeandfire.com/house-images/'; // Ficticio, para propósito de demostración

// Cache for storing fetched data
const dataCache = {
    characters: [],
    houses: [],
    books: [],
    allData: [],
    characterImages: {},
    houseImages: {}
};

// Pagination settings
const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let totalPages = 1;
let currentDisplayData = [];

// Translation dictionary
const translations = {
    es: {
        "header.title": "GAME OF THRONES",
        "header.subtitle": "Explora el mundo de hielo y fuego",
        "search.placeholder": "Buscar personajes, casas o libros...",
        "search.button": "BUSCAR",
        "filters.title": "Explorar por categoría",
        "filters.all": "Todos",
        "filters.characters": "Personajes",
        "filters.houses": "Casas",
        "filters.books": "Libros",
        "footer.developed": "Desarrollado por el grupo CSS",
        "footer.rights": "© 2025 Game of Thrones Explorer",
        "footer.info": "La información proviene de An API of Ice and Fire.",
        "footer.educational": "Esta aplicación tiene fines educativos.",
        "idioma": "Idioma:",
        "character.titles": "Títulos",
        "character.allegiance": "Casa",
        "house.words": "Lema",
        "house.region": "Región",
        "book.author": "Autor",
        "book.released": "Publicado",
        "error.loading": "Error al cargar datos. Inténtalo de nuevo.",
        "no.data": "No se encontraron resultados.",
        "loading": "Cargando datos...",
        "pagination.prev": "Anterior",
        "pagination.next": "Siguiente",
        "pagination.page": "Página",
        "pagination.of": "de"
    },
    en: {
        "header.title": "GAME OF THRONES",
        "header.subtitle": "Explore the world of ice and fire",
        "search.placeholder": "Search characters, houses or books...",
        "search.button": "SEARCH",
        "filters.title": "Explore by category",
        "filters.all": "All",
        "filters.characters": "Characters",
        "filters.houses": "Houses",
        "filters.books": "Books",
        "footer.developed": "Developed by CSS Group",
        "footer.rights": "© 2025 Game of Thrones Explorer",
        "footer.info": "Information comes from An API of Ice and Fire.",
        "footer.educational": "This application is for educational purposes.",
        "idioma": "Language:",
        "character.titles": "Titles",
        "character.allegiance": "House",
        "house.words": "Words",
        "house.region": "Region",
        "book.author": "Author",
        "book.released": "Released",
        "error.loading": "Error loading data. Please try again.",
        "no.data": "No results found.",
        "loading": "Loading data...",
        "pagination.prev": "Previous",
        "pagination.next": "Next",
        "pagination.page": "Page",
        "pagination.of": "of"
    },
    fr: {
        "header.title": "GAME OF THRONES",
        "header.subtitle": "Explorez le monde de glace et de feu",
        "search.placeholder": "Rechercher personnages, maisons ou livres...",
        "search.button": "RECHERCHER",
        "filters.title": "Explorer par catégorie",
        "filters.all": "Tous",
        "filters.characters": "Personnages",
        "filters.houses": "Maisons",
        "filters.books": "Livres",
        "footer.developed": "Développé par le groupe CSS",
        "footer.rights": "© 2025 Game of Thrones Explorer",
        "footer.info": "Les informations proviennent de An API of Ice and Fire.",
        "footer.educational": "Cette application est à des fins éducatives.",
        "idioma": "Langue:",
        "character.titles": "Titres",
        "character.allegiance": "Maison",
        "house.words": "Devise",
        "house.region": "Région",
        "book.author": "Auteur",
        "book.released": "Publié",
        "error.loading": "Erreur lors du chargement des données. Veuillez réessayer.",
        "no.data": "Aucun résultat trouvé.",
        "loading": "Chargement des données...",
        "pagination.prev": "Précédent",
        "pagination.next": "Suivant",
        "pagination.page": "Page",
        "pagination.of": "sur"
    },
    ro: {
        "header.title": "GAME OF THRONES",
        "header.subtitle": "Explorează lumea de gheață și foc",
        "search.placeholder": "Caută personaje, case sau cărți...",
        "search.button": "CAUTĂ",
        "filters.title": "Explorează după categorie",
        "filters.all": "Toate",
        "filters.characters": "Personaje",
        "filters.houses": "Case",
        "filters.books": "Cărți",
        "footer.developed": "Dezvoltat de grupul CSS",
        "footer.rights": "© 2025 Game of Thrones Explorer",
        "footer.info": "Informațiile provin din An API of Ice and Fire.",
        "footer.educational": "Această aplicație este în scopuri educaționale.",
        "idioma": "Limbă:",
        "character.titles": "Titluri",
        "character.allegiance": "Casă",
        "house.words": "Deviza",
        "house.region": "Regiune",
        "book.author": "Autor",
        "book.released": "Publicat",
        "error.loading": "Eroare la încărcarea datelor. Încercați din nou.",
        "no.data": "Nu s-au găsit rezultate.",
        "loading": "Se încarcă datele...",
        "pagination.prev": "Anterior",
        "pagination.next": "Următor",
        "pagination.page": "Pagina",
        "pagination.of": "din"
    }
};

// Current language
let currentLanguage = 'es';

// DOM elements
const cardContainer = document.getElementById('card-container');
const searchInput = document.getElementById('buscador');
const searchButton = document.getElementById('search');
const errorContainer = document.getElementById('error-container');
const filterButtons = document.querySelectorAll('.filter-button');
const languageSelector = document.getElementById('language-selector');
const paginationContainer = document.getElementById('pagination-container');

// Current filter category
let currentCategory = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
    
    // Apply initial language
    applyLanguage(currentLanguage);
});

// Set up event listeners
function setupEventListeners() {
    // Search button click
    searchButton.addEventListener('click', handleSearch);
    
    // Search input enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            applyFilter(category);
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Language selector
    languageSelector.addEventListener('change', () => {
        currentLanguage = languageSelector.value;
        applyLanguage(currentLanguage);
    });
}

// Load initial data from API
async function loadInitialData() {
    showLoading();
    
    try {
        // Fetch data from all endpoints with pagination
        await Promise.all([
            fetchAllPages(CHARACTERS_ENDPOINT + '?pageSize=50'),
            fetchAllPages(HOUSES_ENDPOINT + '?pageSize=50'),
            fetchAllPages(BOOKS_ENDPOINT),
            fetchCharacterImages()
        ]).then(([characters, houses, books, characterImages]) => {
            // Filter characters with names only (API returns many unnamed characters)
            dataCache.characters = characters.filter(char => char.name.trim() !== '');
            dataCache.houses = houses;
            dataCache.books = books;
            
            // Store character images
            dataCache.characterImages = characterImages;
            
            // Generate house images (mock data for demonstration)
            dataCache.houses.forEach(house => {
                // Simplify house name for image search
                const simpleName = house.name.replace(/House\s+/i, '').toLowerCase();
                dataCache.houseImages[house.url] = `${HOUSE_IMAGE_API}${simpleName}.jpg`;
            });
            
            // Combine all data
            dataCache.allData = [
                ...dataCache.characters.map(item => ({ ...item, type: 'characters' })),
                ...dataCache.houses.map(item => ({ ...item, type: 'houses' })),
                ...dataCache.books.map(item => ({ ...item, type: 'books' }))
            ];
            
            // Display all data initially
            applyFilter(currentCategory);
        });
    } catch (error) {
        console.error('Error loading data:', error);
        showError(getTranslation('error.loading'));
    }
}

// Fetch character images from an alternative API
async function fetchCharacterImages() {
    try {
        const response = await fetch(CHARACTER_IMAGE_API);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        const imageMap = {};
        
        // Create a map of character names to image URLs
        data.forEach(character => {
            // Normalize character names for better matching
            const normalizedName = character.fullName.toLowerCase().replace(/\s+/g, ' ').trim();
            imageMap[normalizedName] = character.imageUrl;
            
            // Also map first name only for better matching chances
            const firstName = character.firstName.toLowerCase();
            if (!imageMap[firstName]) {
                imageMap[firstName] = character.imageUrl;
            }
        });
        
        return imageMap;
    } catch (error) {
        console.error('Error fetching character images:', error);
        return {};
    }
}

// Fetch all pages from paginated API endpoints
async function fetchAllPages(url, allResults = []) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        const combinedResults = [...allResults, ...data];
        
        // Check for pagination link in headers
        const linkHeader = response.headers.get('Link');
        if (linkHeader && linkHeader.includes('rel="next"')) {
            const nextUrl = linkHeader.split(',')
                .find(part => part.includes('rel="next"'))
                .split(';')[0]
                .trim()
                .replace(/<|>/g, '');
            
            // Recursively fetch next page
            return fetchAllPages(nextUrl, combinedResults);
        }
        
        return combinedResults;
    } catch (error) {
        console.error('Error fetching data:', error);
        showError(getTranslation('error.loading'));
        return allResults;
    }
}

// Display data in card grid with pagination
function displayData(data) {
    // Store current display data for pagination
    currentDisplayData = [...data];
    
    // Calculate total pages
    totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    
    // Reset to page 1 if necessary
    if (currentPage > totalPages) {
        currentPage = 1;
    }
    
    // Get current page data
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageData = data.slice(startIndex, endIndex);
    
    // Clear container
    cardContainer.innerHTML = '';
    
    // Show message if no data
    if (data.length === 0) {
        const noDataElement = document.createElement('p');
        noDataElement.textContent = getTranslation('no.data');
        noDataElement.style.gridColumn = '1 / -1';
        noDataElement.style.textAlign = 'center';
        noDataElement.style.padding = '2rem';
        noDataElement.style.fontSize = '1.2rem';
        noDataElement.style.color = 'var(--gris-hielo)';
        cardContainer.appendChild(noDataElement);
        
        // Hide pagination
        paginationContainer.style.display = 'none';
        return;
    }
    
    // Create and append cards for current page
    currentPageData.forEach(item => {
        let card;
        
        switch(item.type) {
            case 'characters':
                card = createCharacterCard(item);
                break;
            case 'houses':
                card = createHouseCard(item);
                break;
            case 'books':
                card = createBookCard(item);
                break;
        }
        
        if (card) cardContainer.appendChild(card);
    });
    
    // Update pagination
    updatePagination();
}

// Update pagination controls
function updatePagination() {
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    paginationContainer.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-button';
    prevButton.textContent = getTranslation('pagination.prev');
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayData(currentDisplayData);
        }
    });
    paginationContainer.appendChild(prevButton);
    
    // Page info
    const pageInfo = document.createElement('div');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `${getTranslation('pagination.page')} ${currentPage} ${getTranslation('pagination.of')} ${totalPages}`;
    paginationContainer.appendChild(pageInfo);
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-button';
    nextButton.textContent = getTranslation('pagination.next');
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayData(currentDisplayData);
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Create character card element with image
function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card';
    
    // Extract house name from allegiance URL if available
    let houseName = '';
    if (character.allegiance && character.allegiance.length > 0) {
        const houseId = character.allegiance[0].split('/').pop();
        const house = dataCache.houses.find(h => h.url.endsWith(`/${houseId}`));
        houseName = house ? house.name : '';
    }
    
    // Try to find character image
    let imageUrl = '';
    const normalizedName = character.name.toLowerCase().replace(/\s+/g, ' ').trim();
    const firstName = normalizedName.split(' ')[0];
    
    if (dataCache.characterImages[normalizedName]) {
        imageUrl = dataCache.characterImages[normalizedName];
    } else if (dataCache.characterImages[firstName]) {
        imageUrl = dataCache.characterImages[firstName];
    }
    
    // Create initial for placeholder if no image
    const initial = character.name.charAt(0);
    
    const imageElement = imageUrl ? 
        `<img src="${imageUrl}" alt="${character.name}" class="character-image">` :
        `<div class="placeholder-image" data-initial="${initial}"></div>`;
    
    card.innerHTML = `
        ${imageElement}
        <div class="character-info">
            <h3 class="character-name">${character.name}</h3>
            <p class="character-titles">${character.titles && character.titles.length > 0 && character.titles[0] !== '' ? 
                character.titles.join(', ') : getTranslation('character.titles') + ': ' + getTranslation('no.data')}</p>
            <p class="character-allegiance">${getTranslation('character.allegiance')}: ${houseName || getTranslation('no.data')}</p>
        </div>
        ${houseName ? `<div class="house-badge">${houseName}</div>` : ''}
    `;
    
    return card;
}

// Create house card element with image
function createHouseCard(house) {
    const card = document.createElement('div');
    card.className = 'house-card';
    
    // Try to get house image or use placeholder
    let imageUrl = dataCache.houseImages[house.url];
    
    // Create initial for placeholder if no image
    const initial = house.name.charAt(0);
    
    const imageElement = imageUrl ? 
        `<img src="${imageUrl}" alt="${house.name}" class="house-image" onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\'placeholder-image\' data-initial=\'${initial}\'></div>';">` :
        `<div class="placeholder-image" data-initial="${initial}"></div>`;
    
    card.innerHTML = `
        ${imageElement}
        <div class="house-info">
            <h3 class="house-name">${house.name}</h3>
            <p class="house-words">${house.words || getTranslation('house.words') + ': ' + getTranslation('no.data')}</p>
            <p class="house-region">${getTranslation('house.region')}: ${house.region || getTranslation('no.data')}</p>
        </div>
        ${house.region ? `<div class="region-badge">${house.region}</div>` : ''}
    `;
    
    return card;
}

// Create book card element with cover image
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    // Try to get an ISBN from the book
    // This is mock functionality since the API doesn't provide ISBNs
    const mockISBN = generateMockISBN(book.name);
    const coverUrl = `${BOOK_COVER_API}${mockISBN}.jpg`;
    
    // Create initial for placeholder if no image
    const initial = book.name.charAt(0);
    
    const imageElement = `
        <img src="${coverUrl}" alt="${book.name}" class="book-image" 
             onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\'placeholder-image\' data-initial=\'${initial}\'></div>';">
    `;
    
    // Format release date
    let releasedDate = getTranslation('no.data');
    if (book.released) {
        const date = new Date(book.released);
        releasedDate = new Intl.DateTimeFormat(currentLanguage, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }).format(date);
    }
    
    card.innerHTML = `
        ${imageElement}
        <div class="book-info">
            <h3 class="book-name">${book.name}</h3>
            <p class="book-author">${book.authors.join(', ')}</p>
            <p class="book-released">${getTranslation('book.released')}: ${releasedDate}</p>
        </div>
    `;
    
    return card;
}

// Generate a mock ISBN from book name for cover images
function generateMockISBN(bookName) {
    // Create a deterministic mock ISBN based on the book name
    let isbn = '978';
    for (let i = 0; i < 10; i++) {
        isbn += Math.floor((bookName.charCodeAt(i % bookName.length) % 10));
    }
    return isbn;
}

// Handle search functionality
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        // If search is empty, just apply current filter
        applyFilter(currentCategory);
        return;
    }
    
    // Reset to first page when searching
    currentPage = 1;
    
    // Filter data based on search term and current category
    let filteredData;
    
    if (currentCategory === 'all') {
        filteredData = dataCache.allData.filter(item => {
            if (item.type === 'characters') {
                return item.name.toLowerCase().includes(searchTerm) || 
                       (item.titles && item.titles.some(title => title.toLowerCase().includes(searchTerm)));
            } else if (item.type === 'houses') {
                return item.name.toLowerCase().includes(searchTerm) || 
                       (item.words && item.words.toLowerCase().includes(searchTerm)) || 
                       (item.region && item.region.toLowerCase().includes(searchTerm));
            } else if (item.type === 'books') {
                return item.name.toLowerCase().includes(searchTerm) || 
                       (item.authors && item.authors.some(author => author.toLowerCase().includes(searchTerm)));
            }
            return false;
        });
    } else {
        filteredData = dataCache[currentCategory].filter(item => {
            if (currentCategory === 'characters') {
                return item.name.toLowerCase().includes(searchTerm) || 
                       (item.titles && item.titles.some(title => title.toLowerCase().includes(searchTerm)));
            } else if (currentCategory === 'houses') {
                return item.name.toLowerCase().includes(searchTerm) || 
                       (item.words && item.words.toLowerCase().includes(searchTerm)) || 
                       (item.region && item.region.toLowerCase().includes(searchTerm));
            } else if (currentCategory === 'books') {
                return item.name.toLowerCase().includes(searchTerm) || 
                       (item.authors && item.authors.some(author => author.toLowerCase().includes(searchTerm)));
            }
            return false;
        }).map(item => ({ ...item, type: currentCategory }));
    }
    
    // Display filtered results
    displayData(filteredData);
}

// Apply category filter
function applyFilter(category) {
    currentCategory = category;
    
    // Reset to first page when changing categories
    currentPage = 1;
    
    // Apply filter
    if (category === 'all') {
        displayData(dataCache.allData);
    } else {
        displayData(dataCache[category].map(item => ({ ...item, type: category })));
    }
    
    // Clear search input
    searchInput.value = '';
}

// Show loading state
function showLoading() {
    cardContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
            <p style="font-size: 1.2rem; color: var(--dorado);">${getTranslation('loading')}</p>
        </div>
    `;
    paginationContainer.style.display = 'none';
}

// Show error message
function showError(message) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

// Apply language to all elements with data-i18n attribute
function applyLanguage(lang) {
    // Set language in select
    languageSelector.value = lang;
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = getTranslation(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = getTranslation(key);
    });
    
    // Refresh displayed data to update translations
    if (dataCache.allData.length > 0) {
        if (currentCategory === 'all') {
            displayData(dataCache.allData);
        } else {
            displayData(dataCache[currentCategory].map(item => ({ ...item, type: currentCategory })));
        }
    }
}

// Get translation for key
function getTranslation(key) {
    return translations[currentLanguage][key] || key;
}

