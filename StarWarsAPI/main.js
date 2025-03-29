document.addEventListener('DOMContentLoaded', () => {
    // Language translations
    const translations = {
        en: {
            "header.title": "Star Wars Universe Explorer",
            "header.subtitle": "Discover characters, planets, and more from the Star Wars universe",
            "idioma": "Language:",
            "search.placeholder": "Search in the Star Wars universe...",
            "search.button": "Search",
            "filters.title": "Choose a category to explore",
            "filters.all": "All",
            "filters.people": "Characters",
            "filters.planets": "Planets",
            "filters.starships": "Starships",
            "filters.vehicles": "Vehicles",
            "filters.species": "Species",
            "filters.films": "Movies",
            "loading": "Loading data from a galaxy far, far away...",
            "pagination.prev": "Previous",
            "pagination.next": "Next",
            "footer.developed": "Developed with the Force",
            "footer.rights": "Star Wars and all related characters are property of Lucasfilm Ltd. and Disney.",
            "footer.starwarsInfo": "Information obtained from SWAPI (Star Wars API).",
            "footer.educational": "This website is for educational purposes only.",
            "error.api": "Error accessing the Star Wars API. May the Force guide you to try again later.",
            "error.notFound": "No results found. Try a different search or category.",
            "card.films": "Appears in:",
            "card.homeworld": "Homeworld:",
            "card.population": "Population:",
            "card.class": "Class:",
            "card.model": "Model:",
            "card.manufacturer": "Manufacturer:",
            "card.classification": "Classification:",
            "card.director": "Director:",
            "card.release": "Release date:"
        },
        es: {
            "header.title": "Explorador del Universo Star Wars",
            "header.subtitle": "Descubre personajes, planetas y más del universo Star Wars",
            "idioma": "Idioma:",
            "search.placeholder": "Buscar en el universo Star Wars...",
            "search.button": "Buscar",
            "filters.title": "Elige una categoría para explorar",
            "filters.all": "Todos",
            "filters.people": "Personajes",
            "filters.planets": "Planetas",
            "filters.starships": "Naves",
            "filters.vehicles": "Vehículos",
            "filters.species": "Especies",
            "filters.films": "Películas",
            "loading": "Cargando datos de una galaxia muy, muy lejana...",
            "pagination.prev": "Anterior",
            "pagination.next": "Siguiente",
            "footer.developed": "Desarrollado con la Fuerza",
            "footer.rights": "Star Wars y todos sus personajes son propiedad de Lucasfilm Ltd. y Disney.",
            "footer.starwarsInfo": "Información obtenida de SWAPI (Star Wars API).",
            "footer.educational": "Este sitio web es solo para fines educativos.",
            "error.api": "Error al acceder a la API de Star Wars. Que la Fuerza te guíe para intentarlo más tarde.",
            "error.notFound": "No se encontraron resultados. Prueba con una búsqueda o categoría diferente.",
            "card.films": "Aparece en:",
            "card.homeworld": "Planeta natal:",
            "card.population": "Población:",
            "card.class": "Clase:",
            "card.model": "Modelo:",
            "card.manufacturer": "Fabricante:",
            "card.classification": "Clasificación:",
            "card.director": "Director:",
            "card.release": "Fecha de estreno:"
        },
        fr: {
            "header.title": "Explorateur de l'Univers Star Wars",
            "header.subtitle": "Découvrez des personnages, des planètes et plus de l'univers Star Wars",
            "idioma": "Langue:",
            "search.placeholder": "Rechercher dans l'univers Star Wars...",
            "search.button": "Rechercher",
            "filters.title": "Choisissez une catégorie à explorer",
            "filters.all": "Tous",
            "filters.people": "Personnages",
            "filters.planets": "Planètes",
            "filters.starships": "Vaisseaux",
            "filters.vehicles": "Véhicules",
            "filters.species": "Espèces",
            "filters.films": "Films",
            "loading": "Chargement des données d'une galaxie très, très lointaine...",
            "pagination.prev": "Précédent",
            "pagination.next": "Suivant",
            "footer.developed": "Développé avec la Force",
            "footer.rights": "Star Wars et tous les personnages associés sont la propriété de Lucasfilm Ltd. et Disney.",
            "footer.starwarsInfo": "Informations obtenues de SWAPI (Star Wars API).",
            "footer.educational": "Ce site est uniquement à des fins éducatives.",
            "error.api": "Erreur d'accès à l'API Star Wars. Que la Force vous guide pour réessayer plus tard.",
            "error.notFound": "Aucun résultat trouvé. Essayez une recherche ou une catégorie différente.",
            "card.films": "Apparaît dans:",
            "card.homeworld": "Planète d'origine:",
            "card.population": "Population:",
            "card.class": "Classe:",
            "card.model": "Modèle:",
            "card.manufacturer": "Fabricant:",
            "card.classification": "Classification:",
            "card.director": "Réalisateur:",
            "card.release": "Date de sortie:"
        },
        ro: {
            "header.title": "Exploratorul Universului Star Wars",
            "header.subtitle": "Descoperă personaje, planete și mai multe din universul Star Wars",
            "idioma": "Limbă:",
            "search.placeholder": "Caută în universul Star Wars...",
            "search.button": "Caută",
            "filters.title": "Alege o categorie pentru a explora",
            "filters.all": "Toate",
            "filters.people": "Personaje",
            "filters.planets": "Planete",
            "filters.starships": "Nave spațiale",
            "filters.vehicles": "Vehicule",
            "filters.species": "Specii",
            "filters.films": "Filme",
            "loading": "Se încarcă date dintr-o galaxie foarte, foarte îndepărtată...",
            "pagination.prev": "Anterior",
            "pagination.next": "Următor",
            "footer.developed": "Dezvoltat cu Forța",
            "footer.rights": "Star Wars și toate personajele asociate sunt proprietatea Lucasfilm Ltd. și Disney.",
            "footer.starwarsInfo": "Informații obținute de la SWAPI (Star Wars API).",
            "footer.educational": "Acest site web este doar în scopuri educaționale.",
            "error.api": "Eroare la accesarea API-ului Star Wars. Fie ca Forța să te ghideze să încerci din nou mai târziu.",
            "error.notFound": "Nu s-au găsit rezultate. Încercați o căutare sau o categorie diferită.",
            "card.films": "Apare în:",
            "card.homeworld": "Planeta natală:",
            "card.population": "Populație:",
            "card.class": "Clasă:",
            "card.model": "Model:",
            "card.manufacturer": "Producător:",
            "card.classification": "Clasificare:",
            "card.director": "Regizor:",
            "card.release": "Data lansării:"
        }
    };

    // State variables
    let currentLanguage = 'es';
    let currentResource = 'all';
    let currentPage = 1;
    let nextPageUrl = null;
    let prevPageUrl = null;
    let searchTerm = '';

    // DOM elements
    const cardContainer = document.getElementById('card-container');
    const errorContainer = document.getElementById('error-container');
    const loadingElement = document.getElementById('loading');
    const searchInput = document.getElementById('buscador');
    const searchButton = document.getElementById('search');
    const filterButtons = document.querySelectorAll('.filter-button');
    const languageSelector = document.getElementById('language-selector');
    const nextPageButton = document.getElementById('next-page');
    const prevPageButton = document.getElementById('prev-page');

    // Set initial language
    updateLanguage(currentLanguage);

    // API base URL
    const API_BASE_URL = 'https://swapi.dev/api/';

    // Event listeners
    languageSelector.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        updateLanguage(currentLanguage);
    });

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update current resource and fetch data
            currentResource = button.dataset.resource;
            currentPage = 1;
            fetchData();
        });
    });

    nextPageButton.addEventListener('click', () => {
        if (nextPageUrl) {
            fetchFromUrl(nextPageUrl);
        }
    });

    prevPageButton.addEventListener('click', () => {
        if (prevPageUrl) {
            fetchFromUrl(prevPageUrl);
        }
    });

    // Initial data fetch
    fetchData();

    // Functions
    function updateLanguage(lang) {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                element.placeholder = translations[lang][key];
            }
        });
    }

    function performSearch() {
        searchTerm = searchInput.value.trim();
        currentPage = 1;
        fetchData();
    }

    function fetchData() {
        showLoading(true);
        clearError();
        cardContainer.innerHTML = '';
        
        if (currentResource === 'all') {
            // If 'all' is selected, fetch from multiple resources
            Promise.all([
                fetch(`${API_BASE_URL}people/?search=${searchTerm}&page=${currentPage}`).then(res => res.json()).catch(() => ({ results: [] })),
                fetch(`${API_BASE_URL}planets/?search=${searchTerm}&page=${currentPage}`).then(res => res.json()).catch(() => ({ results: [] })),
                fetch(`${API_BASE_URL}starships/?search=${searchTerm}&page=${currentPage}`).then(res => res.json()).catch(() => ({ results: [] })),
                fetch(`${API_BASE_URL}vehicles/?search=${searchTerm}&page=${currentPage}`).then(res => res.json()).catch(() => ({ results: [] })),
                fetch(`${API_BASE_URL}species/?search=${searchTerm}&page=${currentPage}`).then(res => res.json()).catch(() => ({ results: [] })),
                fetch(`${API_BASE_URL}films/?search=${searchTerm}&page=${currentPage}`).then(res => res.json()).catch(() => ({ results: [] }))
            ])
            .then(([people, planets, starships, vehicles, species, films]) => {
                const allResults = [
                    ...people.results.map(item => ({ ...item, resourceType: 'people' })),
                    ...planets.results.map(item => ({ ...item, resourceType: 'planets' })),
                    ...starships.results.map(item => ({ ...item, resourceType: 'starships' })),
                    ...vehicles.results.map(item => ({ ...item, resourceType: 'vehicles' })),
                    ...species.results.map(item => ({ ...item, resourceType: 'species' })),
                    ...films.results.map(item => ({ ...item, resourceType: 'films' }))
                ];
                
                if (allResults.length > 0) {
                    displayResults(allResults);
                    // Use people for pagination since 'all' doesn't have a single next/prev
                    nextPageUrl = people.next;
                    prevPageUrl = people.previous;
                    updatePaginationButtons();
                } else {
                    showError(translations[currentLanguage]['error.notFound']);
                }
                showLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                showError(translations[currentLanguage]['error.api']);
                showLoading(false);
            });
        } else {
            // Fetch from a specific resource
            fetch(`${API_BASE_URL}${currentResource}/?search=${searchTerm}&page=${currentPage}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        // Add resource type to each result
                        const resultsWithType = data.results.map(item => ({
                            ...item,
                            resourceType: currentResource
                        }));
                        displayResults(resultsWithType);
                        
                        // Update pagination
                        nextPageUrl = data.next;
                        prevPageUrl = data.previous;
                        updatePaginationButtons();
                    } else {
                        showError(translations[currentLanguage]['error.notFound']);
                    }
                    showLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    showError(translations[currentLanguage]['error.api']);
                    showLoading(false);
                });
        }
    }

    function fetchFromUrl(url) {
        showLoading(true);
        clearError();
        cardContainer.innerHTML = '';
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.results && data.results.length > 0) {
                    // Add resource type to each result
                    const resultsWithType = data.results.map(item => ({
                        ...item,
                        resourceType: currentResource
                    }));
                    displayResults(resultsWithType);
                    
                    // Update pagination
                    nextPageUrl = data.next;
                    prevPageUrl = data.previous;
                    updatePaginationButtons();
                } else {
                    showError(translations[currentLanguage]['error.notFound']);
                }
                showLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                showError(translations[currentLanguage]['error.api']);
                showLoading(false);
            });
    }

    function displayResults(results) {
        cardContainer.innerHTML = '';
        
        results.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Different card content based on resource type
            switch(item.resourceType) {
                case 'people':
                    card.innerHTML = `
                        <img class="card-image" src="/api/placeholder/280/200" alt="${item.name}">
                        <div class="universe-badge">Character</div>
                        <h3 class="card-name">${item.name}</h3>
                        <div class="card-description">
                            <p>Gender: ${item.gender}</p>
                            <p>Birth Year: ${item.birth_year}</p>
                            <p>Height: ${item.height} cm</p>
                            <p>Hair Color: ${item.hair_color}</p>
                            <p>Eye Color: ${item.eye_color}</p>
                        </div>
                        <div class="card-films">${translations[currentLanguage]['card.films']} ${item.films.length}</div>
                    `;
                    break;
                
                case 'planets':
                    card.innerHTML = `
                        <img class="card-image" src="/api/placeholder/280/200" alt="${item.name}">
                        <div class="universe-badge">Planet</div>
                        <h3 class="card-name">${item.name}</h3>
                        <div class="card-description">
                            <p>Terrain: ${item.terrain}</p>
                            <p>Climate: ${item.climate}</p>
                            <p>${translations[currentLanguage]['card.population']} ${item.population}</p>
                            <p>Gravity: ${item.gravity}</p>
                            <p>Diameter: ${item.diameter} km</p>
                        </div>
                        <div class="card-films">${translations[currentLanguage]['card.films']} ${item.films.length}</div>
                    `;
                    break;
                
                case 'starships':
                    card.innerHTML = `
                        <img class="card-image" src="/api/placeholder/280/200" alt="${item.name}">
                        <div class="universe-badge">Starship</div>
                        <h3 class="card-name">${item.name}</h3>
                        <div class="card-description">
                            <p>${translations[currentLanguage]['card.model']} ${item.model}</p>
                            <p>${translations[currentLanguage]['card.manufacturer']} ${item.manufacturer}</p>
                            <p>${translations[currentLanguage]['card.class']} ${item.starship_class}</p>
                            <p>Crew: ${item.crew}</p>
                            <p>Passengers: ${item.passengers}</p>
                        </div>
                        <div class="card-films">${translations[currentLanguage]['card.films']} ${item.films.length}</div>
                    `;
                    break;
                
                case 'vehicles':
                    card.innerHTML = `
                        <img class="card-image" src="/api/placeholder/280/200" alt="${item.name}">
                        <div class="universe-badge">Vehicle</div>
                        <h3 class="card-name">${item.name}</h3>
                        <div class="card-description">
                            <p>${translations[currentLanguage]['card.model']} ${item.model}</p>
                            <p>${translations[currentLanguage]['card.manufacturer']} ${item.manufacturer}</p>
                            <p>${translations[currentLanguage]['card.class']} ${item.vehicle_class}</p>
                            <p>Crew: ${item.crew}</p>
                            <p>Passengers: ${item.passengers}</p>
                        </div>
                        <div class="card-films">${translations[currentLanguage]['card.films']} ${item.films.length}</div>
                    `;
                    break;
                
                case 'species':
                    card.innerHTML = `
                        <img class="card-image" src="/api/placeholder/280/200" alt="${item.name}">
                        <div class="universe-badge">Species</div>
                        <h3 class="card-name">${item.name}</h3>
                        <div class="card-description">
                            <p>${translations[currentLanguage]['card.classification']} ${item.classification}</p>
                            <p>Designation: ${item.designation}</p>
                            <p>Language: ${item.language}</p>
                            <p>Average Height: ${item.average_height} cm</p>
                            <p>Average Lifespan: ${item.average_lifespan} years</p>
                        </div>
                        <div class="card-films">${translations[currentLanguage]['card.films']} ${item.films.length}</div>
                    `;
                    break;
                
                case 'films':
                    card.innerHTML = `
                        <img class="card-image" src="/api/placeholder/280/200" alt="${item.title}">
                        <div class="universe-badge">Film</div>
                        <h3 class="card-name">${item.title}</h3>
                        <div class="card-description">
                            <p>Episode: ${item.episode_id}</p>
                            <p>${translations[currentLanguage]['card.director']} ${item.director}</p>
                            <p>Producer: ${item.producer}</p>
                            <p>${translations[currentLanguage]['card.release']} ${item.release_date}</p>
                            <p>Characters: ${item.characters.length}</p>
                        </div>
                    `;
                    break;
                
                default:
                    card.innerHTML = `
                        <img class="card-image" src="/api/placeholder/280/200" alt="${item.name || item.title}">
                        <h3 class="card-name">${item.name || item.title}</h3>
                        <div class="card-description">
                            <p>Unknown resource type</p>
                        </div>
                    `;
            }
            
            cardContainer.appendChild(card);
        });
    }

    function updatePaginationButtons() {
        nextPageButton.style.display = nextPageUrl ? 'block' : 'none';
        prevPageButton.style.display = prevPageUrl ? 'block' : 'none';
    }

    function showLoading(isLoading) {
        loadingElement.style.display = isLoading ? 'block' : 'none';
    }

    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }

    function clearError() {
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
    }
});