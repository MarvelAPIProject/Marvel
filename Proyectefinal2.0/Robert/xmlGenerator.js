// Importar las librerías necesarias
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const xml2js = require('xml2js');

// Configuración de la API de Marvel
// Necesitas registrarte en https://developer.marvel.com/ para obtener estas claves
const MARVEL_PUBLIC_KEY = 'dd0b4fdacdd0b53c744fb36389d154db';
const MARVEL_PRIVATE_KEY = '360fa86fb66f723c45b84fb38e08c7477fbf29f2';

// Limite máximo de la API por petición
const MAX_LIMIT = 100;

// Función para generar el hash requerido por la API de Marvel
function generateMarvelHash(timestamp) {
  return crypto
    .createHash('md5')
    .update(timestamp + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY)
    .digest('hex');
}

// Función para realizar peticiones a la API de Marvel
async function fetchAllMarvelData(endpoint, batchSize = 100) {
  console.log(`Obteniendo todos los datos de ${endpoint}...`);
  
  const timestamp = Date.now().toString();
  const hash = generateMarvelHash(timestamp);
  const url = `https://gateway.marvel.com/v1/public/${endpoint}`;
  
  try {
    // Primera petición para obtener el total de resultados
    const initialResponse = await axios.get(url, {
      params: {
        apikey: MARVEL_PUBLIC_KEY,
        ts: timestamp,
        hash: hash,
        limit: 1
      }
    });
    
    const total = initialResponse.data.data.total;
    console.log(`Total de registros en ${endpoint}: ${total}`);
    
    // Calcular cuántas peticiones necesitamos
    const numRequests = Math.ceil(total / batchSize);
    console.log(`Se realizarán ${numRequests} peticiones para obtener todos los datos`);
    
    // Array para almacenar todos los resultados
    let allResults = [];
    
    // Realizar múltiples peticiones para obtener todos los datos
    for (let i = 0; i < numRequests; i++) {
      const offset = i * batchSize;
      console.log(`Obteniendo datos de ${endpoint}: ${offset + 1} a ${Math.min(offset + batchSize, total)} de ${total}`);
      
      const response = await axios.get(url, {
        params: {
          apikey: MARVEL_PUBLIC_KEY,
          ts: timestamp,
          hash: hash,
          limit: batchSize,
          offset: offset
        }
      });
      
      // Agregar resultados al array
      allResults = [...allResults, ...response.data.data.results];
      
      // Pequeña pausa para no sobrecargar la API
      if (i < numRequests - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`Se obtuvieron ${allResults.length} registros de ${endpoint}`);
    return allResults;
  } catch (error) {
    console.error(`Error al obtener datos de ${endpoint}:`, error.message);
    return [];
  }
}

// Función para convertir datos a XML y guardarlos en un archivo
function saveToXML(data, filename) {
  const builder = new xml2js.Builder({
    rootName: 'marvel',
    headless: true,
    renderOpts: { pretty: true, indent: '  ', newline: '\n' }
  });
  
  const xml = builder.buildObject(data);
  
  fs.writeFileSync(filename, xml);
  console.log(`Archivo XML guardado como ${filename}`);
}

// Función para transformar los datos de cómics al formato requerido por la base de datos
function transformComicsData(comics) {
  console.log(`Transformando ${comics.length} cómics al formato de la base de datos...`);
  
  return comics.map(comic => {
    // Extraer la fecha de publicación (onsaleDate)
    let fechaPublicacion = null;
    if (comic.dates && Array.isArray(comic.dates)) {
      const onSaleDate = comic.dates.find(date => date.type === 'onsaleDate');
      if (onSaleDate && onSaleDate.date) {
        fechaPublicacion = onSaleDate.date.substring(0, 10); // Formato YYYY-MM-DD
      }
    }
    
    // Extraer ID de la serie
    let idSerie = null;
    if (comic.series && comic.series.resourceURI) {
      const seriesUriParts = comic.series.resourceURI.split('/');
      idSerie = seriesUriParts[seriesUriParts.length - 1];
    }
    
    // Estructura del cómic adaptada al esquema de la base de datos
    return {
      id_comic: comic.id,
      titulo: comic.title || 'Sin título',
      descripcion: comic.description || null,
      numero_edicion: comic.issueNumber || 0,
      fecha_publicacion: fechaPublicacion,
      URL_imagen: comic.thumbnail ? `${comic.thumbnail.path}.${comic.thumbnail.extension}` : null,
      id_serie: idSerie,
      // Incluir creadores si están disponibles
      creadores: comic.creators && comic.creators.items ? 
        comic.creators.items.map(creador => ({
          id: creador.resourceURI.split('/').pop(),
          nombre: creador.name,
          rol: creador.role
        })) : []
    };
  });
}

// Función para transformar los datos de personajes
function transformCharactersData(characters) {
  console.log(`Transformando ${characters.length} personajes al formato de la base de datos...`);
  
  return characters.map(character => {
    return {
      id_personaje: character.id,
      nombre: character.name || 'Sin nombre',
      descripcion: character.description || null,
      URL_imagen: character.thumbnail ? `${character.thumbnail.path}.${character.thumbnail.extension}` : null
    };
  });
}

// Función para transformar los datos de series
function transformSeriesData(series) {
  console.log(`Transformando ${series.length} series al formato de la base de datos...`);
  
  return series.map(serie => {
    // Extraer fechas
    let fechaInicio = null;
    let fechaFin = null;
    
    if (serie.startYear) {
      fechaInicio = `${serie.startYear}-01-01`;
    }
    
    if (serie.endYear && serie.endYear !== 2099) { // 2099 suele ser el valor por defecto para series en curso
      fechaFin = `${serie.endYear}-12-31`;
    }
    
    return {
      id_serie: serie.id,
      nombre: serie.title || serie.name || 'Sin nombre',
      descripcion: serie.description || null,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      URL_imagen: serie.thumbnail ? `${serie.thumbnail.path}.${serie.thumbnail.extension}` : null
    };
  });
}

// Función para transformar los datos de eventos
function transformEventsData(events) {
  console.log(`Transformando ${events.length} eventos al formato de la base de datos...`);
  
  return events.map(event => {
    // Extraer fechas
    let fechaInicio = null;
    let fechaFin = null;
    
    if (event.start) {
      fechaInicio = event.start.substring(0, 10); // Formato YYYY-MM-DD
    }
    
    if (event.end) {
      fechaFin = event.end.substring(0, 10); // Formato YYYY-MM-DD
    }
    
    return {
      id_evento: event.id,
      nombre: event.title || 'Sin nombre',
      descripcion: event.description || null,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      // Incluir relaciones con personajes
      personajes: event.characters && event.characters.items ? 
        event.characters.items.map(personaje => ({
          id: personaje.resourceURI.split('/').pop(),
          nombre: personaje.name
        })) : [],
      // Incluir relaciones con cómics
      comics: event.comics && event.comics.items ? 
        event.comics.items.map(comic => ({
          id: comic.resourceURI.split('/').pop(),
          nombre: comic.name
        })) : []
    };
  });
}

// Función principal para obtener todos los datos y convertirlos a XML
async function marvelDataToXML() {
  try {
    console.log('Iniciando descarga de datos de la API de Marvel...');
    
    // Objeto que contendrá todos los datos
    const marvelData = {
      characters: [],
      comics: [],
      series: [],
      events: [],
      movies: [] // Nota: Marvel API no tiene endpoint específico para películas
    };
    
    // Obtener todos los personajes
    console.log('Obteniendo todos los personajes...');
    const characters = await fetchAllMarvelData('characters', MAX_LIMIT);
    marvelData.characters = transformCharactersData(characters);
    
    // Obtener todos los cómics
    console.log('Obteniendo todos los cómics...');
    const comics = await fetchAllMarvelData('comics', MAX_LIMIT);
    marvelData.comics = transformComicsData(comics);
    
    // Obtener todas las series
    console.log('Obteniendo todas las series...');
    const series = await fetchAllMarvelData('series', MAX_LIMIT);
    marvelData.series = transformSeriesData(series);
    
    // Obtener todos los eventos
    console.log('Obteniendo todos los eventos...');
    const events = await fetchAllMarvelData('events', MAX_LIMIT);
    marvelData.events = transformEventsData(events);
    
    // Guardar todos los datos en un archivo XML
    console.log('Guardando todos los datos en archivos XML...');
    saveToXML(marvelData, 'marvel_data.xml');
    
    // Opcionalmente, guardar cada tipo de datos en archivos separados
    saveToXML({ characters: marvelData.characters }, 'marvel_characters.xml');
    saveToXML({ comics: marvelData.comics }, 'marvel_comics.xml');
    saveToXML({ series: marvelData.series }, 'marvel_series.xml');
    saveToXML({ events: marvelData.events }, 'marvel_events.xml');
    
    console.log('Proceso completado con éxito.');
    console.log(`Total de personajes: ${marvelData.characters.length}`);
    console.log(`Total de cómics: ${marvelData.comics.length}`);
    console.log(`Total de series: ${marvelData.series.length}`);
    console.log(`Total de eventos: ${marvelData.events.length}`);
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar la función principal
marvelDataToXML();