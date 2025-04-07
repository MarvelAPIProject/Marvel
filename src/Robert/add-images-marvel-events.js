const fs = require('fs');
const xml2js = require('xml2js');

// Función para parsear XML a objeto JavaScript
async function parseXML(filePath) {
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`Error: El archivo ${filePath} no existe.`);
      return null;
    }
    
    const xmlData = fs.readFileSync(filePath, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);
    
    return result;
  } catch (error) {
    console.error(`Error al parsear el archivo XML ${filePath}:`, error);
    throw error;
  }
}

// Función para convertir objeto JavaScript a XML
function convertToXML(jsObject) {
  const builder = new xml2js.Builder();
  return builder.buildObject(jsObject);
}

// URLs de imágenes para eventos populares de Marvel
const eventImages = {
  // Eventos importantes con URLs de imágenes
  "Civil War": "https://i.annihil.us/u/prod/marvel/i/mg/2/d0/51cb5356c2063.jpg",
  "Secret Invasion": "https://i.annihil.us/u/prod/marvel/i/mg/6/40/51ca1749980ae.jpg",
  "Infinity Gauntlet": "https://i.annihil.us/u/prod/marvel/i/mg/5/70/5d5aa20b4a5b8.jpg",
  "Avengers Disassembled": "https://i.annihil.us/u/prod/marvel/i/mg/c/10/51cb5a5e51154.jpg",
  "Age of Ultron": "https://i.annihil.us/u/prod/marvel/i/mg/c/10/51ca13db7521b.jpg",
  "Secret Wars": "https://i.annihil.us/u/prod/marvel/i/mg/9/d0/51ca12d2dfec2.jpg",
  "Secret Wars (2015)": "https://i.annihil.us/u/prod/marvel/i/mg/0/03/54eebc49b57e7.jpg",
  "House of M": "https://i.annihil.us/u/prod/marvel/i/mg/f/00/51ca1748a6310.jpg",
  "Infinity War": "https://i.annihil.us/u/prod/marvel/i/mg/a/f0/5cc074c96ec68.jpg",
  "Avengers VS X-Men": "https://i.annihil.us/u/prod/marvel/i/mg/3/20/51ca14cb3f047.jpg",
  "X-Men: Schism": "https://i.annihil.us/u/prod/marvel/i/mg/9/d0/511307e2e615a.jpg",
  "Fear Itself": "https://i.annihil.us/u/prod/marvel/i/mg/f/03/51ca16ae71c92.jpg",
  "World War Hulk": "https://i.annihil.us/u/prod/marvel/i/mg/3/00/51ca11b231062.jpg",
  "Siege": "https://i.annihil.us/u/prod/marvel/i/mg/6/20/51ca15086cf17.jpg"
};

// Imagen por defecto para eventos sin imagen específica
const defaultEventImage = "https://i.annihil.us/u/prod/marvel/i/mg/9/30/51c9f0766a0a7.jpg";

// Función principal para añadir imágenes a los eventos
async function addImagesToEvents() {
  try {
    // Parsear el archivo XML de eventos
    const marvelData = await parseXML('marvel_events.xml');
    
    if (!marvelData || !marvelData.marvel || !marvelData.marvel.events) {
      console.error('Error: Estructura XML no válida o archivo no encontrado');
      return;
    }
    
    // Convertir a array si no lo es
    let eventsArray = Array.isArray(marvelData.marvel.events) 
      ? marvelData.marvel.events 
      : [marvelData.marvel.events];
    
    // Añadir campo URL_imagen a cada evento
    eventsArray.forEach(event => {
      // Buscar imagen específica por nombre o usar la predeterminada
      const eventName = event.nombre;
      event.URL_imagen = eventImages[eventName] || defaultEventImage;
      
      console.log(`Añadida imagen para evento: ${eventName}`);
    });
    
    // Si eventsArray era un solo elemento, convertirlo de nuevo
    if (!Array.isArray(marvelData.marvel.events)) {
      marvelData.marvel.events = eventsArray[0];
    } else {
      marvelData.marvel.events = eventsArray;
    }
    
    // Convertir a XML y guardar
    const xmlResult = convertToXML(marvelData);
    fs.writeFileSync('marvel_events_with_images.xml', xmlResult);
    
    console.log('Proceso completado: Añadidas imágenes a todos los eventos');
    console.log('Archivo guardado como: marvel_events_with_images.xml');
    
  } catch (error) {
    console.error('Error en el proceso:', error);
  }
}

// Ejecutar la función principal
addImagesToEvents().catch(err => console.error('Error fatal:', err));