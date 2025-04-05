// Favorites Management with API integration
const API_BASE_URL = 'http://localhost:8080/api';

// Check if an item is in favorites
async function isInFavorites(id, type) {
  try {
    // Por defecto usando el usuario 1
    const userId = 1;
    
    const params = new URLSearchParams({
      userId: userId.toString(),
      type: type
    });
    
    const url = `${API_BASE_URL}/favorites?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    
    if (!data.data || !data.data.results) {
      return false;
    }
    
    return data.data.results.some(item => item.id === parseInt(id));
  } catch (error) {
    console.error("Error checking favorites:", error);
    return false;
  }
}

// Toggle favorite status (add/remove)
async function toggleFavorite(id, type, name) {
  id = parseInt(id);
  
  // Verificar si ya está en favoritos
  const isFavorite = await isInFavorites(id, type);
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
    const response = await fetch(`${API_BASE_URL}/favorites`, {
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
    const response = await fetch(`${API_BASE_URL}/favorites`, {
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
    isInFavorites(id, type).then(isFavorite => {
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

// Fetch and display user's favorites
async function fetchAndDisplayFavorites() {
  try {
    // Display loading spinner
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = '<div class="loading-spinner"></div>';
    
    // Get favorites from API
    const type = currentContentFilter === 'favorites' ? 'characters' : currentContentFilter;
    const userId = 1; // Por defecto usuario 1
    
    const params = new URLSearchParams({
      userId: userId.toString(),
      type: type
    });
    
    const url = `${API_BASE_URL}/favorites?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    const favorites = data.data.results;
    
    // If no favorites, show message
    if (!favorites || favorites.length === 0) {
      showNoFavoritesMessage();
      return;
    }
    
    // Display the favorites based on type
    if (type === 'characters') {
      displayCharacters(favorites);
    } else if (type === 'comics') {
      displayComics(favorites);
    } else if (type === 'series') {
      displaySeries(favorites);
    } else if (type === 'events') {
      displayEvents(favorites);
    } else {
      displayCharacters(favorites);
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
  if (currentContentFilter === 'characters' || currentContentFilter === 'favorites') {
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

// Initialize favorites on document load
document.addEventListener('DOMContentLoaded', function() {
  setupFavoriteEventHandlers();
});