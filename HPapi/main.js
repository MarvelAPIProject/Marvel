// Constants and state management
const API_BASE_URL = 'https://hp-api.onrender.com/api';
let allItems = [];
let filteredItems = [];
let currentPage = 1;
const itemsPerPage = 12;
let currentFilter = 'all';
let currentLanguage = 'es';

// DOM Elements
const cardsContainer = document.getElementById('cards-container');
const errorContainer = document.getElementById('error-container');
const searchButton = document.getElementById('search');
const searchInput = document.getElementById('buscador');
const filterButtons = document.querySelectorAll('.filter-button');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');
const languageSelector = document.getElementById('language-selector');
const currentYearSpan = document.getElementById('current-year');

// Translations for multilingual support
const translations = {
    'en': {
        'searchPlaceholder': 'Search the Wizarding World...',
        'searchButton': 'Search',
        'filters': {
            'all': 'All',
            'characters': 'Characters',
            'houses': 'Houses',
            'books': 'Books'
        },
        'pagination': {
            'prev': 'Previous',
            'next': 'Next',
            'page': 'Page',
            'of': 'of'
        },
        'error': 'Error retrieving data from the magical realm!',
        'footer': {
            'copyright': 'The Wizarding World of Harry Potter',
            'createdBy': 'Created by',
            'dataProvided': 'Data provided by'
        }
    },
    'es': {
        'searchPlaceholder': 'Buscar en el Mundo Mágico...',
        'searchButton': 'Buscar',
        'filters': {
            'all': 'Todos',
            'characters': 'Personajes',
            'houses': 'Casas',
            'books': 'Libros'
        },
        'pagination': {
            'prev': 'Anterior',
            'next': 'Siguiente',
            'page': 'Página',
            'of': 'de'
        },
        'error': '¡Error al recuperar datos del reino mágico!',
        'footer': {
            'copyright': 'El Mundo Mágico de Harry Potter',
            'createdBy': 'Creado por',
            'dataProvided': 'Datos proporcionados por'
        }
    },
    'fr': {
        'searchPlaceholder': 'Rechercher dans le monde des sorciers...',
        'searchButton': 'Rechercher',
        'filters': {
            'all': 'Tous',
            'characters': 'Personnages',
            'houses': 'Maisons',
            'books': 'Livres'
        },
        'pagination': {
            'prev': 'Précédent',
            'next': 'Suivant',
            'page': 'Page',
            'of': 'sur'
        },
        'error': 'Erreur lors de la récupération des données du royaume magique !',
        'footer': {
            'copyright': 'Le Monde Magique de Harry Potter',
            'createdBy': 'Créé par',
            'dataProvided': 'Données fournies par'
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    updateCurrentYear();
    initEventListeners();
    await fetchAllData();
    updateLanguage();
});

// Set current year in footer
function updateCurrentYear() {
    const currentYear = new Date().getFullYear();
    currentYearSpan.textContent = currentYear;
}

// Initialize all event listeners
function initEventListeners() {
    // Search functionality
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            applyFilter(filter);
            
            // Update active button state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Pagination
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderItems();
        }
    });
    
    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderItems();
        }
    });

    // Language selector
    languageSelector.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        updateLanguage();
    });
}

// Fetch all data from the API
async function fetchAllData() {
    try {
        // Show loading state
        cardsContainer.innerHTML = '<div class="loading">Loading magical data...</div>';
        
        // Fetch characters
        const charactersResponse = await fetch(`${API_BASE_URL}/characters`);
        const charactersData = await charactersResponse.json();
        const characters = charactersData.map(character => ({
            ...character,
            type: 'characters'
        }));

        // We'll simulate houses and books data since they're not in the API
        const houses = [
            {
                id: 'gryffindor',
                name: 'Gryffindor',
                image: 'https://via.placeholder.com/280x160?text=Gryffindor',
                words: 'Courage, bravery, nerve, and chivalry',
                region: 'Hogwarts School',
                type: 'houses',
                colors: 'Scarlet and Gold',
                founder: 'Godric Gryffindor',
                animal: 'Lion'
            },
            {
                id: 'hufflepuff',
                name: 'Hufflepuff',
                image: 'https://via.placeholder.com/280x160?text=Hufflepuff',
                words: 'Hard work, patience, loyalty, and fair play',
                region: 'Hogwarts School',
                type: 'houses',
                colors: 'Yellow and Black',
                founder: 'Helga Hufflepuff',
                animal: 'Badger'
            },
            {
                id: 'ravenclaw',
                name: 'Ravenclaw',
                image: 'https://via.placeholder.com/280x160?text=Ravenclaw',
                words: 'Wit, learning, wisdom, and intellect',
                region: 'Hogwarts School',
                type: 'houses',
                colors: 'Blue and Bronze',
                founder: 'Rowena Ravenclaw',
                animal: 'Eagle'
            },
            {
                id: 'slytherin',
                name: 'Slytherin',
                image: 'https://via.placeholder.com/280x160?text=Slytherin',
                words: 'Ambition, cunning, leadership, and resourcefulness',
                region: 'Hogwarts School',
                type: 'houses',
                colors: 'Green and Silver',
                founder: 'Salazar Slytherin',
                animal: 'Serpent'
            }
        ];

        const books = [
            {
                id: 'book1',
                name: 'Harry Potter and the Philosopher\'s Stone',
                image: 'https://via.placeholder.com/280x160?text=Book+1',
                author: 'J.K. Rowling',
                released: '1997',
                type: 'books',
                pages: '223',
                summary: 'Harry Potter discovers his magical heritage on his 11th birthday.'
            },
            {
                id: 'book2',
                name: 'Harry Potter and the Chamber of Secrets',
                image: 'https://via.placeholder.com/280x160?text=Book+2',
                author: 'J.K. Rowling',
                released: '1998',
                type: 'books',
                pages: '251',
                summary: 'Harry returns to Hogwarts for his second year to discover a dark force threatening the students.'
            },
            {
                id: 'book3',
                name: 'Harry Potter and the Prisoner of Azkaban',
                image: 'https://via.placeholder.com/280x160?text=Book+3',
                author: 'J.K. Rowling',
                released: '1999',
                type: 'books',
                pages: '317',
                summary: 'Harry learns more about his past and meets his godfather.'
            },
            {
                id: 'book4',
                name: 'Harry Potter and the Goblet of Fire',
                image: 'https://via.placeholder.com/280x160?text=Book+4',
                author: 'J.K. Rowling',
                released: '2000',
                type: 'books',
                pages: '636',
                summary: 'Harry competes in the dangerous Triwizard Tournament.'
            },
            {
                id: 'book5',
                name: 'Harry Potter and the Order of the Phoenix',
                image: 'https://via.placeholder.com/280x160?text=Book+5',
                author: 'J.K. Rowling',
                released: '2003',
                type: 'books',
                pages: '766',
                summary: 'Harry forms a secret group to oppose Voldemort and the Ministry\'s control over Hogwarts.'
            },
            {
                id: 'book6',
                name: 'Harry Potter and the Half-Blood Prince',
                image: 'https://via.placeholder.com/280x160?text=Book+6',
                author: 'J.K. Rowling',
                released: '2005',
                type: 'books',
                pages: '607',
                summary: 'Harry learns more about Voldemort\'s past through memories with Dumbledore.'
            },
            {
                id: 'book7',
                name: 'Harry Potter and the Deathly Hallows',
                image: 'https://via.placeholder.com/280x160?text=Book+7',
                author: 'J.K. Rowling',
                released: '2007',
                type: 'books',
                pages: '607',
                summary: 'The final confrontation between Harry and Voldemort.'
            }
        ];

        // Combine all data
        allItems = [...characters, ...houses, ...books];
        filteredItems = [...allItems];
        
        // Initial render
        renderItems();
        errorContainer.style.display = 'none';
    } catch (error) {
        console.error('Error fetching data:', error);
        errorContainer.style.display = 'block';
        cardsContainer.innerHTML = '';
    }
}

// Handle search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm === '') {
        // If search is empty, just apply the current filter
        applyFilter(currentFilter);
        return;
    }

    // Filter items by search term across all types
    filteredItems = allItems.filter(item => {
        if (currentFilter !== 'all' && item.type !== currentFilter) {
            return false;
        }
        
        // Check various properties depending on item type
        const name = item.name ? item.name.toLowerCase() : '';
        const house = item.house ? item.house.toLowerCase() : '';
        const words = item.words ? item.words.toLowerCase() : '';
        const author = item.author ? item.author.toLowerCase() : '';
        
        return name.includes(searchTerm) || 
               house.includes(searchTerm) || 
               words.includes(searchTerm) || 
               author.includes(searchTerm);
    });
    
    currentPage = 1;
    renderItems();
}

// Apply category filter
function applyFilter(filter) {
    currentFilter = filter;
    
    if (filter === 'all') {
        filteredItems = [...allItems];
    } else {
        filteredItems = allItems.filter(item => item.type === filter);
    }
    
    currentPage = 1;
    renderItems();
}

// Render items with pagination
function renderItems() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToRender = filteredItems.slice(startIndex, endIndex);
    
    // Clear container
    cardsContainer.innerHTML = '';
    
    if (itemsToRender.length === 0) {
        cardsContainer.innerHTML = '<div class="no-results">No magical items found</div>';
        return;
    }
    
    // Render each item
    itemsToRender.forEach(item => {
        const cardHTML = createCardHTML(item);
        cardsContainer.innerHTML += cardHTML;
    });
    
    // Update pagination
    updatePagination();
}

// Create HTML for different card types
function createCardHTML(item) {
    const type = item.type;
    
    switch (type) {
        case 'characters':
            return createCharacterCard(item);
        case 'houses':
            return createHouseCard(item);
        case 'books':
            return createBookCard(item);
        default:
            return '';
    }
}

// Create character card HTML
function createCharacterCard(character) {
    const image = character.image || `https://via.placeholder.com/280x160?text=${character.name.charAt(0)}`;
    const house = character.house || 'Unknown House';
    const titles = character.alternate_names?.join(', ') || 'No known titles';
    
    return `
        <div class="character-card">
            <img class="character-image" src="${image}" alt="${character.name}" onerror="this.src='https://via.placeholder.com/280x160?text=${character.name.charAt(0)}'">
            <div class="house-badge">${house}</div>
            <div class="character-info">
                <h3 class="character-name">${character.name}</h3>
                <p class="character-titles">${titles}</p>
                <p class="character-allegiance">${character.alive ? 'Alive' : 'Deceased'}</p>
            </div>
        </div>
    `;
}

// Create house card HTML
function createHouseCard(house) {
    return `
        <div class="house-card">
            <img class="house-image" src="${house.image}" alt="${house.name}">
            <div class="region-badge">${house.region}</div>
            <div class="house-info">
                <h3 class="house-name">${house.name}</h3>
                <p class="house-words">"${house.words}"</p>
                <p class="house-region">Founded by ${house.founder}</p>
            </div>
        </div>
    `;
}

// Create book card HTML
function createBookCard(book) {
    return `
        <div class="book-card">
            <img class="book-image" src="${book.image}" alt="${book.name}">
            <div class="book-info">
                <h3 class="book-name">${book.name}</h3>
                <p class="book-author">by ${book.author}</p>
                <p class="book-released">Released: ${book.released}</p>
            </div>
        </div>
    `;
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    
    // Enable/disable pagination buttons
    prevPageButton.disabled = currentPage <= 1;
    nextPageButton.disabled = currentPage >= totalPages;
}

// Update language across the UI
function updateLanguage() {
    const lang = translations[currentLanguage] || translations['en'];
    
    // Update search
    searchInput.placeholder = lang.searchPlaceholder;
    searchButton.textContent = lang.searchButton;
    
    // Update filters
    filterButtons.forEach(button => {
        const filterType = button.getAttribute('data-filter');
        button.textContent = lang.filters[filterType] || filterType;
    });
    
    // Update pagination
    prevPageButton.textContent = lang.pagination.prev;
    nextPageButton.textContent = lang.pagination.next;
    
    // Update error message
    errorContainer.textContent = lang.error;
    
    // Re-render items to apply language changes
    renderItems();
}