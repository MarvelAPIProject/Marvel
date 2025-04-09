// Favorites Management
const FAVORITES_STORAGE_KEY = 'marvel_favorites';

// Structure to keep track of favorites
let userFavorites = {
    characters: [],
    comics: [],
    series: [],
    events: []
};

// Load favorites from localStorage on startup
function loadFavorites() {
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (storedFavorites) {
        try {
            userFavorites = JSON.parse(storedFavorites);
        } catch (e) {
            console.error('Error parsing favorites:', e);
            // Reset to default if corrupted
            userFavorites = {
                characters: [],
                comics: [],
                series: [],
                events: []
            };
        }
    }
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(userFavorites));
}

// Check if an item is in favorites
function isInFavorites(id, type) {
    if (!userFavorites[type]) return false;
    return userFavorites[type].includes(parseInt(id));
}

// Toggle favorite status (add/remove)
function toggleFavorite(id, type, name) {
    id = parseInt(id);
    
    if (!userFavorites[type]) {
        userFavorites[type] = [];
    }
    
    const index = userFavorites[type].indexOf(id);
    let action;
    
    if (index === -1) {
        // Add to favorites
        userFavorites[type].push(id);
        action = 'add';
    } else {
        // Remove from favorites
        userFavorites[type].splice(index, 1);
        action = 'remove';
    }
    
    // Save to localStorage
    saveFavorites();
    
    // Show toast message
    showFavoriteToast(name, action, type);
    
    return action === 'add';
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
        if (isInFavorites(id, type)) {
            newIcon.classList.add('active');
            newIcon.querySelector('i').classList.remove('far');
            newIcon.querySelector('i').classList.add('fas');
        }
        
        // Add click handler
        newIcon.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent opening modal
            
            const isNowFavorite = toggleFavorite(id, type, name);
            
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
            
            const isNowFavorite = toggleFavorite(id, type, name);
            
            // Update button appearance
            if (isNowFavorite) {
                newBtn.classList.add('active');
                newBtn.querySelector('i').classList.remove('far');
                newBtn.querySelector('i').classList.add('fas');
            } else {
                newBtn.classList.remove('active');
                newBtn.querySelector('i').classList.remove('fas');
                newBtn.querySelector('i').classList.add('far');
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
        });
    }
}

// Initialize favorites on document load
document.addEventListener('DOMContentLoaded', function() {
    loadFavorites();
    setupFavoriteEventHandlers();
});

// Fetch and display user's favorites
async function fetchAndDisplayFavorites() {
    try {
        // Display loading spinner
        const cardContainer = document.getElementById('card-container');
        cardContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        // Get favorites from local storage
        const favorites = userFavorites[currentContentFilter] || [];
        
        // If no favorites, show message
        if (favorites.length === 0) {
            showNoFavoritesMessage();
            return;
        }
        
        // Get corresponding items using the API
        const items = [];
        const promises = [];
        
        // For each favorite ID, fetch the corresponding item
        for (const id of favorites) {
            promises.push(
                fetchItemById(id, currentContentFilter)
                .then(item => {
                    if (item) items.push(item);
                })
            );
        }
        
        // Wait for all fetches to complete
        await Promise.all(promises);
        
        // Display the items
        if (items.length === 0) {
            showNoFavoritesMessage();
            return;
        }
        
        // Display the favorites based on content type
        if (currentContentFilter === 'characters') {
            displayCharacters(items);
        } else if (currentContentFilter === 'comics') {
            displayComics(items);
        } else if (currentContentFilter === 'series') {
            displaySeries(items);
        } else if (currentContentFilter === 'events') {
            displayEvents(items);
        } else {
            displayCharacters(items);
        }
        
        // Add favorites icons and bind event handlers
        setupFavoriteEventHandlers();
        
    } catch (error) {
        console.error('Error fetching favorites:', error);
        showNoFavoritesMessage();
    }
}

// Fetch a specific item by ID and type
async function fetchItemById(id, type) {
    try {
        // Generate Marvel API authentication parameters
        const ts = Date.now();
        const hash = await generateHash(ts);
        
        // Determine API endpoint based on type
        let endpoint;
        switch (type) {
            case 'characters':
                endpoint = 'characters';
                break;
            case 'comics':
                endpoint = 'comics';
                break;
            case 'series':
                endpoint = 'series';
                break;
            case 'events':
                endpoint = 'events';
                break;
            default:
                endpoint = 'characters';
        }
        
        // Build the API URL
        const url = `${baseUrl}/${endpoint}/${id}?ts=${ts}&apikey=${publicKey}&hash=${hash}`;
        
        // Make the API request
        const response = await fetch(url);
        
        if (!response.ok) {
            console.warn(`Item not found: ${type} ${id}`);
            return null;
        }
        
        const data = await response.json();
        
        // If results are returned, process the first item
        if (data.data && data.data.results && data.data.results.length > 0) {
            const item = data.data.results[0];
            
            // Add universe field (simulated)
            const universeId = item.id % 6;
            switch(universeId) {
                case 0: item.universe = '616'; break;
                case 1: item.universe = '1610'; break;
                case 2: item.universe = '199999'; break;
                case 3: item.universe = '10005'; break;
                case 4: item.universe = '1048'; break;
                case 5: item.universe = '90214'; break;
                default: item.universe = '616';
            }
            
            return item;
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching ${type} with ID ${id}:`, error);
        return null;
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