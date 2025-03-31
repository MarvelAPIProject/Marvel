// Agrega este objeto de traducción después de tu objeto de traducción actual
const apiTranslations = {
    // Géneros de personajes
    en: {
        // Géneros
        "male": "male",
        "female": "female",
        "n/a": "n/a",
        "none": "none",
        "unknown": "unknown",
        // Colores de pelo
        "black": "black",
        "brown": "brown",
        "blonde": "blonde",
        "white": "white",
        "grey": "grey",
        "auburn": "auburn",
        "n/a": "n/a",
        // Colores de ojos
        "blue": "blue",
        "brown": "brown",
        "yellow": "yellow",
        "red": "red",
        "green": "green",
        "orange": "orange",
        "hazel": "hazel",
        // Climas de planetas
        "arid": "arid",
        "temperate": "temperate",
        "tropical": "tropical",
        "frozen": "frozen",
        "murky": "murky",
        // Terrenos de planetas
        "desert": "desert",
        "grasslands": "grasslands",
        "mountains": "mountains",
        "jungle": "jungle",
        "forests": "forests",
        "cityscape": "cityscape",
        "ocean": "ocean",
        "swamp": "swamp",
        // Tipos de recursos
        "people": "Character",
        "planets": "Planet",
        "starships": "Starship",
        "vehicles": "Vehicle",
        "species": "Species",
        "films": "Film"
    },
    es: {
        // Géneros
        "male": "masculino",
        "female": "femenino",
        "n/a": "n/a",
        "none": "ninguno",
        "unknown": "desconocido",
        // Colores de pelo
        "black": "negro",
        "brown": "castaño",
        "blonde": "rubio",
        "white": "blanco",
        "grey": "gris",
        "auburn": "pelirrojo",
        "n/a": "n/a",
        // Colores de ojos
        "blue": "azul",
        "brown": "marrón",
        "yellow": "amarillo",
        "red": "rojo",
        "green": "verde",
        "orange": "naranja",
        "hazel": "avellana",
        // Climas de planetas
        "arid": "árido",
        "temperate": "templado",
        "tropical": "tropical",
        "frozen": "helado",
        "murky": "turbio",
        // Terrenos de planetas
        "desert": "desierto",
        "grasslands": "praderas",
        "mountains": "montañas",
        "jungle": "selva",
        "forests": "bosques",
        "cityscape": "paisaje urbano",
        "ocean": "océano",
        "swamp": "pantano",
        // Tipos de recursos
        "people": "Personaje",
        "planets": "Planeta",
        "starships": "Nave",
        "vehicles": "Vehículo",
        "species": "Especie",
        "films": "Película"
    },
    fr: {
        // Géneros
        "male": "masculin",
        "female": "féminin",
        "n/a": "n/a",
        "none": "aucun",
        "unknown": "inconnu",
        // Colores de pelo
        "black": "noir",
        "brown": "brun",
        "blonde": "blond",
        "white": "blanc",
        "grey": "gris",
        "auburn": "auburn",
        "n/a": "n/a",
        // Colores de ojos
        "blue": "bleu",
        "brown": "marron",
        "yellow": "jaune",
        "red": "rouge",
        "green": "vert",
        "orange": "orange",
        "hazel": "noisette",
        // Climas de planetas
        "arid": "aride",
        "temperate": "tempéré",
        "tropical": "tropical",
        "frozen": "gelé",
        "murky": "trouble",
        // Terrenos de planetas
        "desert": "désert",
        "grasslands": "prairies",
        "mountains": "montagnes",
        "jungle": "jungle",
        "forests": "forêts",
        "cityscape": "paysage urbain",
        "ocean": "océan",
        "swamp": "marécage",
        // Tipos de recursos
        "people": "Personnage",
        "planets": "Planète",
        "starships": "Vaisseau",
        "vehicles": "Véhicule",
        "species": "Espèce",
        "films": "Film"
    },
    ro: {
        // Géneros
        "male": "masculin",
        "female": "feminin",
        "n/a": "n/a",
        "none": "niciunul",
        "unknown": "necunoscut",
        // Colores de pelo
        "black": "negru",
        "brown": "maro",
        "blonde": "blond",
        "white": "alb",
        "grey": "gri",
        "auburn": "roșcat",
        "n/a": "n/a",
        // Colores de ojos
        "blue": "albastru",
        "brown": "maro",
        "yellow": "galben",
        "red": "roșu",
        "green": "verde",
        "orange": "portocaliu",
        "hazel": "căprui",
        // Climas de planetas
        "arid": "arid",
        "temperate": "temperat",
        "tropical": "tropical",
        "frozen": "înghețat",
        "murky": "tulbure",
        // Terrenos de planetas
        "desert": "deșert",
        "grasslands": "pășuni",
        "mountains": "munți",
        "jungle": "junglă",
        "forests": "păduri",
        "cityscape": "peisaj urban",
        "ocean": "ocean",
        "swamp": "mlaștină",
        // Tipos de recursos
        "people": "Personaj",
        "planets": "Planetă",
        "starships": "Navă spațială",
        "vehicles": "Vehicul",
        "species": "Specie",
        "films": "Film"
    }
};

// Función para traducir un valor específico
function translateApiValue(value, language) {
    if (!value) return value;
    
    // Intenta traducir el valor directamente
    if (apiTranslations[language] && apiTranslations[language][value.toLowerCase()]) {
        return apiTranslations[language][value.toLowerCase()];
    }
    
    // Para valores que contienen comas (como "rocky, volcanic")
    if (typeof value === 'string' && value.includes(',')) {
        const parts = value.split(',').map(part => part.trim());
        const translatedParts = parts.map(part => {
            return apiTranslations[language] && apiTranslations[language][part.toLowerCase()] 
                ? apiTranslations[language][part.toLowerCase()] 
                : part;
        });
        return translatedParts.join(', ');
    }
    
    // Si no hay traducción, devuelve el valor original
    return value;
}

// Modifica la función displayResults para usar las traducciones
function displayResults(results) {
    cardContainer.innerHTML = '';
    
    results.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Traduce el tipo de recurso para el badge
        const resourceType = translateApiValue(item.resourceType, currentLanguage);
        
        // Diferentes contenidos de tarjeta según el tipo de recurso
        switch(item.resourceType) {
            case 'people':
                // Traduce los valores antes de mostrarlos
                const gender = translateApiValue(item.gender, currentLanguage);
                const hairColor = translateApiValue(item.hair_color, currentLanguage);
                const eyeColor = translateApiValue(item.eye_color, currentLanguage);
                
                card.innerHTML = `
                    <img class="card-image" src="/api/placeholder/280/200" alt="${item.name}">
                    <div class="universe-badge">${resourceType}</div>
                    <h3 class="card-name">${item.name}</h3>
                    <div class="card-description">
                        <p>Gender: ${gender}</p>
                        <p>Birth Year: ${item.birth_year}</p>
                        <p>Height: ${item.height} cm</p>
                        <p>Hair Color: ${hairColor}</p>
                        <p>Eye Color: ${eyeColor}</p>
                    </div>
                    <div class="card-films">${translations[currentLanguage]['card.films']} ${item.films.length}</div>
                `;
                break;
            
            case 'planets':
                // Traduce los valores antes de mostrarlos
                const terrain = translateApiValue(item.terrain, currentLanguage);
                const climate = translateApiValue(item.climate, currentLanguage);
                
                card.innerHTML = `
                    <img class="card-image" src="/api/placeholder/280/200" alt="${item.name}">
                    <div class="universe-badge">${resourceType}</div>
                    <h3 class="card-name">${item.name}</h3>
                    <div class="card-description">
                        <p>Terrain: ${terrain}</p>
                        <p>Climate: ${climate}</p>
                        <p>${translations[currentLanguage]['card.population']} ${item.population}</p>
                        <p>Gravity: ${item.gravity}</p>
                        <p>Diameter: ${item.diameter} km</p>
                    </div>
                    <div class="card-films">${translations[currentLanguage]['card.films']} ${item.films.length}</div>
                `;
                break;
            
            case 'starships':
                // Traduce los valores antes de mostrarlos
                const shipClass = translateApiValue(item.starship_class, currentLanguage);
                
                card.innerHTML = `
                    <img class="card-image" src="/api/placeholder/280/200" alt="${item.name}">
                    <div class="universe-badge">${resourceType}</div>
                    <h3 class="card-name">${item.name}</h3>
                    <div class="card-description">
                        <p>${translations[currentLanguage]['card.model']} ${item.model}</p>
                        <p>${translations[currentLanguage]['card.manufacturer']} ${item.manufacturer}</p>
                        <p>${translations[currentLanguage]['card.class']} ${shipClass}</p>
                        <p>Crew: ${item.crew}</p>
                        <p>Passengers: ${item.passengers}</p>
                    </div>
                    <div class="card-films">${translations[currentLanguage]['card.films']} ${item.films.length}</div>
                `;
                break;
            
            case 'vehicles':
                // Traduce los valores antes de mostrarlos
                const vehicleClass = translateApiValue(item.vehicle_class, currentLanguage);
                
                card.innerHTML = `
                    <img class="card-image" src="/api/placeholder/280/200" alt="${item.name}">
                    <div class="universe-badge">${resourceType}</div>
                    <h3 class="card-name">${item.name}</h3>
                    <div class="card-description">
                        <p>${translations[currentLanguage]['card.model']} ${item.model}</p>
                        <p>${translations[currentLanguage]['card.manufacturer']} ${item.manufacturer}</p>
                        <p>${translations[currentLanguage]['card.class']} ${vehicleClass}</p>
                        <p>Crew: ${item.crew}</p>
                        <p>Passengers: ${item.passengers}</p>
                    </div>
                    <div class="card-films">${translations[currentLanguage]['card.films']} ${item.films.length}</div>
                `;
                break;
            
            case 'species':
                // Traduce los valores antes de mostrarlos
                const classification = translateApiValue(item.classification, currentLanguage);
                const designation = translateApiValue(item.designation, currentLanguage);
                
                card.innerHTML = `
                    <img class="card-image" src="/api/placeholder/280/200" alt="${item.name}">
                    <div class="universe-badge">${resourceType}</div>
                    <h3 class="card-name">${item.name}</h3>
                    <div class="card-description">
                        <p>${translations[currentLanguage]['card.classification']} ${classification}</p>
                        <p>Designation: ${designation}</p>
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
                    <div class="universe-badge">${resourceType}</div>
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