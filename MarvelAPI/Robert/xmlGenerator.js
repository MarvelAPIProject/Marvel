// Importar las librerías necesarias
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const xml2js = require('xml2js');

// Configuración de la API de Marvel
// Necesitas registrarte en https://developer.marvel.com/ para obtener estas claves
const MARVEL_PUBLIC_KEY = 'dd0b4fdacdd0b53c744fb36389d154db';
const MARVEL_PRIVATE_KEY = '360fa86fb66f723c45b84fb38e08c7477fbf29f2';

// Función para generar el hash requerido por la API de Marvel
function generateMarvelHash(timestamp) {
  return crypto
    .createHash('md5')
    .update(timestamp + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY)
    .digest('hex');
}

// Función para realizar peticiones a la API de Marvel
async function fetchMarvelData(endpoint, params = {}) {
  const timestamp = Date.now().toString();
  const hash = generateMarvelHash(timestamp);
  
  const url = `https://gateway.marvel.com/v1/public/${endpoint}`;
  
  try {
    const response = await axios.get(url, {
      params: {
        ...params,
        apikey: MARVEL_PUBLIC_KEY,
        ts: timestamp,
        hash: hash
      }
    });
    
    return response.data.data.results;
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

// Función principal para obtener todos los datos y convertirlos a XML
async function marvelDataToXML() {
  try {
    // Objeto que contendrá todos los datos
    const marvelData = {
      characters: [],
      comics: [],
      series: [],
      events: [],
      movies: [] // Nota: Marvel API no tiene endpoint específico para películas
    };
    
    // Obtener personajes (limit=100 para obtener más resultados)
    console.log('Obteniendo personajes...');
    marvelData.characters = await fetchMarvelData('characters', { limit: 100 });
    
    // Obtener cómics
    console.log('Obteniendo cómics...');
    marvelData.comics = await fetchMarvelData('comics', { limit: 100 });
    
    // Obtener series
    console.log('Obteniendo series...');
    marvelData.series = await fetchMarvelData('series', { limit: 100 });
    
    // Obtener eventos
    console.log('Obteniendo eventos...');
    marvelData.events = await fetchMarvelData('events', { limit: 100 });
    
    // Nota: Para películas tendrías que usar otra fuente ya que la API de Marvel
    // no tiene un endpoint específico para películas del MCU
    
    // Guardar todos los datos en un archivo XML
    saveToXML(marvelData, 'marvel_data.xml');
    
    // Opcionalmente, guardar cada tipo de datos en archivos separados
    saveToXML({ characters: marvelData.characters }, 'marvel_characters.xml');
    saveToXML({ comics: marvelData.comics }, 'marvel_comics.xml');
    saveToXML({ series: marvelData.series }, 'marvel_series.xml');
    saveToXML({ events: marvelData.events }, 'marvel_events.xml');
    
    console.log('Proceso completado con éxito.');
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar la función principal
marvelDataToXML();