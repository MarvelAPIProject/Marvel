const fs = require('fs');
const xml2js = require('xml2js');
const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',     // Reemplaza con tu usuario de MySQL
  password: 'Roccerte12!', // Reemplaza con tu contraseña de MySQL
  database: 'Marvel_BBDD'
};

// Función para parsear XML a objeto JavaScript con mejor manejo de errores
async function parseXML(filePath) {
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`Error: El archivo ${filePath} no existe.`);
      return null;
    }
    
    const xmlData = fs.readFileSync(filePath, 'utf-8');
    console.log(`Leyendo archivo ${filePath}, tamaño: ${xmlData.length} bytes`);
    
    // Mostrar los primeros 200 caracteres para verificar el contenido
    console.log(`Primeros 200 caracteres del archivo: ${xmlData.substring(0, 200)}`);
    
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);
    
    // Verificar la estructura del objeto resultante
    console.log(`Estructura del objeto parseado de ${filePath}:`, JSON.stringify(Object.keys(result), null, 2));
    
    return result;
  } catch (error) {
    console.error(`Error detallado al parsear el archivo XML ${filePath}:`, error);
    throw error;
  }
}

// Función modificada para verificar si un elemento tiene imagen válida
// Ahora con opción para omitir la verificación
function tieneImagen(elemento, omitirVerificacion = false) {
  if (omitirVerificacion) {
    return true; // Si omitimos la verificación, siempre retornamos verdadero
  }
  
  // Verificar si tiene propiedades de imagen
  const tieneThumbnail = !!elemento.thumbnail;
  const tienePath = tieneThumbnail && !!elemento.thumbnail.path;
  const tieneExtension = tieneThumbnail && !!elemento.thumbnail.extension;
  
  // Verificar si no es una imagen predeterminada
  const noEsImagenPredeterminada = tienePath && 
    elemento.thumbnail.path !== 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available' && 
    elemento.thumbnail.path !== 'http://i.annihil.us/u/prod/marvel/i/mg/f/60/4c002e0305708';
  
  // Resultado final
  return tieneThumbnail && tienePath && tieneExtension && noEsImagenPredeterminada;
}

// Función para extraer el ID de un recurso URI
function extractIdFromResourceURI(resourceURI) {
  if (!resourceURI) return null;
  const parts = resourceURI.split('/');
  return parts[parts.length - 1];
}

// Función para importar personajes con más logs
async function importarPersonajes(connection, omitirVerificacionImagen = false) {
  let stats = { total: 0, importados: 0, omitidos: 0 };
  
  try {
    const data = await parseXML('marvel_characters.xml');
    if (!data || !data.marvel || !data.marvel.characters) {
      console.error('Error: Estructura inesperada en el archivo XML de personajes o archivo no encontrado');
      return stats;
    }
    
    // Intentar diferentes estructuras posibles
    let personajesArray = [];
    
    if (Array.isArray(data.marvel.characters)) {
      personajesArray = data.marvel.characters;
    } else if (typeof data.marvel.characters === 'object') {
      // Si es un objeto con propiedades numeradas
      if (data.marvel.characters.character) {
        personajesArray = Array.isArray(data.marvel.characters.character) 
          ? data.marvel.characters.character 
          : [data.marvel.characters.character];
      } else {
        personajesArray = [data.marvel.characters];
      }
    }
    
    stats.total = personajesArray.length;
    console.log(`Total de personajes encontrados: ${stats.total}`);
    
    // Verificar si hay personajes
    if (stats.total === 0) {
      console.error('Error: No se encontraron personajes en el archivo XML');
      return stats;
    }
    
    // Mostrar muestra de un personaje para depuración
    console.log('Ejemplo de personaje:', JSON.stringify(personajesArray[0], null, 2));
    
    let procesados = 0;
    
    for (const personaje of personajesArray) {
      procesados++;
      if (procesados % 100 === 0) {
        console.log(`Procesando personaje ${procesados}/${stats.total}`);
      }
      
      // Trabajamos con las propiedades originales del XML
      const id = personaje.id || personaje.id_personaje;
      
      if (!id) {
        console.log('Omitiendo personaje sin ID');
        continue;
      }
      
      // Verificar si tiene imagen válida
      if (!tieneImagen(personaje, omitirVerificacionImagen)) {
        stats.omitidos++;
        continue;
      }
      
      // Preparar URL de imagen
      let urlImagen = null;
      if (personaje.thumbnail && personaje.thumbnail.path && personaje.thumbnail.extension) {
        urlImagen = `${personaje.thumbnail.path}.${personaje.thumbnail.extension}`;
      }
      
      try {
        // Intentar insertar en la tabla PERSONAJE
        const query = `
          INSERT INTO PERSONAJE (id_personaje, nombre, descripcion, URL_imagen) 
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
          nombre = VALUES(nombre), 
          descripcion = VALUES(descripcion),
          URL_imagen = VALUES(URL_imagen)
        `;
        
        const params = [
          id,
          personaje.name || personaje.nombre || 'Sin nombre',
          personaje.description || personaje.descripcion || null,
          urlImagen
        ];
        
        await connection.execute(query, params);
        stats.importados++;
      } catch (insertError) {
        console.error(`Error al insertar personaje ${id}:`, insertError);
      }
    }
    
    console.log(`Personajes importados: ${stats.importados}, omitidos: ${stats.omitidos}`);
    return stats;
  } catch (error) {
    console.error('Error detallado al importar personajes:', error);
    return stats;
  }
}

// Función para importar series
async function importarSeries(connection, omitirVerificacionImagen = false) {
  let stats = { total: 0, importados: 0, omitidos: 0 };
  
  try {
    const data = await parseXML('marvel_series.xml');
    if (!data || !data.marvel || !data.marvel.series) {
      console.error('Error: Estructura inesperada en el archivo XML de series o archivo no encontrado');
      return stats;
    }
    
    // Intentar diferentes estructuras posibles
    let seriesArray = [];
    
    if (Array.isArray(data.marvel.series)) {
      seriesArray = data.marvel.series;
    } else if (typeof data.marvel.series === 'object') {
      if (data.marvel.series.serie) {
        seriesArray = Array.isArray(data.marvel.series.serie) 
          ? data.marvel.series.serie 
          : [data.marvel.series.serie];
      } else {
        seriesArray = [data.marvel.series];
      }
    }
    
    stats.total = seriesArray.length;
    console.log(`Total de series encontradas: ${stats.total}`);
    
    if (stats.total === 0) {
      console.error('Error: No se encontraron series en el archivo XML');
      return stats;
    }
    
    // Mostrar muestra de una serie para depuración
    console.log('Ejemplo de serie:', JSON.stringify(seriesArray[0], null, 2));
    
    let procesados = 0;
    
    for (const serie of seriesArray) {
      procesados++;
      if (procesados % 100 === 0) {
        console.log(`Procesando serie ${procesados}/${stats.total}`);
      }
      
      // Trabajamos con las propiedades originales del XML
      const id = serie.id || serie.id_serie;
      
      if (!id) {
        console.log('Omitiendo serie sin ID');
        continue;
      }
      
      // Verificar si tiene imagen válida
      if (!tieneImagen(serie, omitirVerificacionImagen)) {
        stats.omitidos++;
        continue;
      }
      
      // Preparar URL de imagen
      let urlImagen = null;
      if (serie.thumbnail && serie.thumbnail.path && serie.thumbnail.extension) {
        urlImagen = `${serie.thumbnail.path}.${serie.thumbnail.extension}`;
      }
      
      // Preparar fechas
      let fechaInicio = null;
      let fechaFin = null;
      
      if (serie.startYear) {
        fechaInicio = `${serie.startYear}-01-01`;
      }
      
      if (serie.endYear && serie.endYear !== 2099) { // 2099 suele ser el valor por defecto para series en curso
        fechaFin = `${serie.endYear}-12-31`;
      }
      
      try {
        // Intentar insertar en la tabla SERIE
        const query = `
          INSERT INTO SERIE (id_serie, nombre, descripcion, fecha_inicio, fecha_fin, URL_imagen) 
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
          nombre = VALUES(nombre), 
          descripcion = VALUES(descripcion),
          fecha_inicio = VALUES(fecha_inicio),
          fecha_fin = VALUES(fecha_fin),
          URL_imagen = VALUES(URL_imagen)
        `;
        
        const params = [
          id,
          serie.title || serie.nombre || 'Sin título',
          serie.description || serie.descripcion || null,
          fechaInicio,
          fechaFin,
          urlImagen
        ];
        
        await connection.execute(query, params);
        stats.importados++;
      } catch (insertError) {
        console.error(`Error al insertar serie ${id}:`, insertError);
      }
    }
    
    console.log(`Series importadas: ${stats.importados}, omitidas: ${stats.omitidos}`);
    return stats;
  } catch (error) {
    console.error('Error detallado al importar series:', error);
    return stats;
  }
}

// Función para importar cómics
async function importarComics(connection, omitirVerificacionImagen = false) {
  let stats = { total: 0, importados: 0, omitidos: 0 };
  
  try {
    const data = await parseXML('marvel_comics.xml');
    if (!data || !data.marvel || !data.marvel.comics) {
      console.error('Error: Estructura inesperada en el archivo XML de cómics o archivo no encontrado');
      return stats;
    }
    
    // Intentar diferentes estructuras posibles
    let comicsArray = [];
    
    if (Array.isArray(data.marvel.comics)) {
      comicsArray = data.marvel.comics;
    } else if (typeof data.marvel.comics === 'object') {
      if (data.marvel.comics.comic) {
        comicsArray = Array.isArray(data.marvel.comics.comic) 
          ? data.marvel.comics.comic 
          : [data.marvel.comics.comic];
      } else {
        comicsArray = [data.marvel.comics];
      }
    }
    
    stats.total = comicsArray.length;
    console.log(`Total de cómics encontrados: ${stats.total}`);
    
    if (stats.total === 0) {
      console.error('Error: No se encontraron cómics en el archivo XML');
      return stats;
    }
    
    // Mostrar muestra de un cómic para depuración
    console.log('Ejemplo de cómic:', JSON.stringify(comicsArray[0], null, 2));
    
    let procesados = 0;
    
    for (const comic of comicsArray) {
      procesados++;
      if (procesados % 100 === 0) {
        console.log(`Procesando cómic ${procesados}/${stats.total}`);
      }
      
      // Trabajamos con las propiedades originales del XML
      const id = comic.id || comic.id_comic;
      
      if (!id) {
        console.log('Omitiendo cómic sin ID');
        continue;
      }
      
      // Verificar si tiene imagen válida
      if (!tieneImagen(comic, omitirVerificacionImagen)) {
        stats.omitidos++;
        continue;
      }
      
      // Preparar URL de imagen
      let urlImagen = null;
      if (comic.thumbnail && comic.thumbnail.path && comic.thumbnail.extension) {
        urlImagen = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
      }
      
      // Preparar fecha de publicación
      let fechaPublicacion = null;
      if (comic.dates && Array.isArray(comic.dates)) {
        const onSaleDate = comic.dates.find(date => date.type === 'onsaleDate');
        if (onSaleDate && onSaleDate.date) {
          fechaPublicacion = onSaleDate.date.substring(0, 10); // Formato YYYY-MM-DD
        }
      }
      
      // Determinar ID de serie
      let idSerie = null;
      if (comic.series && comic.series.resourceURI) {
        idSerie = extractIdFromResourceURI(comic.series.resourceURI);
      }
      
      try {
        // Intentar insertar en la tabla COMIC
        const query = `
          INSERT INTO COMIC (id_comic, titulo, descripcion, numero_edicion, fecha_publicacion, URL_imagen, id_serie) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
          titulo = VALUES(titulo), 
          descripcion = VALUES(descripcion),
          numero_edicion = VALUES(numero_edicion),
          fecha_publicacion = VALUES(fecha_publicacion),
          URL_imagen = VALUES(URL_imagen),
          id_serie = VALUES(id_serie)
        `;
        
        const params = [
          id,
          comic.title || comic.titulo || 'Sin título',
          comic.description || comic.descripcion || null,
          comic.issueNumber || comic.numero_edicion || 0,
          fechaPublicacion,
          urlImagen,
          idSerie
        ];
        
        await connection.execute(query, params);
        stats.importados++;
        
        // Procesar creadores si existen
        if (comic.creators && comic.creators.items && Array.isArray(comic.creators.items)) {
          for (const creador of comic.creators.items) {
            if (!creador.resourceURI) continue;
            
            // Extraer ID del creador
            const idCreador = extractIdFromResourceURI(creador.resourceURI);
            
            // Insertar creador si no existe
            await connection.execute(
              `INSERT IGNORE INTO CREADOR (id_creador, nombre, rol, URL_imagen) 
               VALUES (?, ?, ?, NULL)`,
              [
                idCreador,
                creador.name || 'Desconocido',
                creador.role || 'No especificado'
              ]
            );
            
            // Insertar relación cómic-creador
            await connection.execute(
              `INSERT IGNORE INTO COMIC_CREADOR (id_comic, id_creador) 
               VALUES (?, ?)`,
              [id, idCreador]
            );
          }
        }
        
        // Procesar personajes si existen
        if (comic.characters && comic.characters.items && Array.isArray(comic.characters.items)) {
          for (const personaje of comic.characters.items) {
            if (!personaje.resourceURI) continue;
            
            // Extraer ID del personaje
            const idPersonaje = extractIdFromResourceURI(personaje.resourceURI);
            
            // Insertar relación cómic-personaje
            await connection.execute(
              `INSERT IGNORE INTO COMIC_PERSONAJE (id_comic, id_personaje) 
               VALUES (?, ?)`,
              [id, idPersonaje]
            );
          }
        }
      } catch (insertError) {
        console.error(`Error al insertar cómic ${id}:`, insertError);
      }
    }
    
    console.log(`Cómics importados: ${stats.importados}, omitidos: ${stats.omitidos}`);
    return stats;
  } catch (error) {
    console.error('Error detallado al importar cómics:', error);
    return stats;
  }
}

// Función para importar eventos
async function importarEventos(connection, omitirVerificacionImagen = false) {
  let stats = { total: 0, importados: 0, omitidos: 0 };
  
  try {
    const data = await parseXML('marvel_events.xml');
    if (!data || !data.marvel || !data.marvel.events) {
      console.error('Error: Estructura inesperada en el archivo XML de eventos o archivo no encontrado');
      return stats;
    }
    
    // Intentar diferentes estructuras posibles
    let eventosArray = [];
    
    if (Array.isArray(data.marvel.events)) {
      eventosArray = data.marvel.events;
    } else if (typeof data.marvel.events === 'object') {
      if (data.marvel.events.event) {
        eventosArray = Array.isArray(data.marvel.events.event) 
          ? data.marvel.events.event 
          : [data.marvel.events.event];
      } else {
        eventosArray = [data.marvel.events];
      }
    }
    
    stats.total = eventosArray.length;
    console.log(`Total de eventos encontrados: ${stats.total}`);
    
    if (stats.total === 0) {
      console.error('Error: No se encontraron eventos en el archivo XML');
      return stats;
    }
    
    // Mostrar muestra de un evento para depuración
    console.log('Ejemplo de evento:', JSON.stringify(eventosArray[0], null, 2));
    
    let procesados = 0;
    
    for (const evento of eventosArray) {
      procesados++;
      if (procesados % 10 === 0) {
        console.log(`Procesando evento ${procesados}/${stats.total}`);
      }
      
      // Trabajamos con las propiedades originales del XML
      const id = evento.id || evento.id_evento;
      
      if (!id) {
        console.log('Omitiendo evento sin ID');
        continue;
      }
      
      // Los eventos pueden no tener imagen, así que es opcional la verificación
      if (!omitirVerificacionImagen && !tieneImagen(evento, false)) {
        stats.omitidos++;
        continue;
      }
      
      // Preparar fechas
      let fechaInicio = null;
      let fechaFin = null;
      
      if (evento.start) {
        fechaInicio = evento.start.substring(0, 10); // Formato YYYY-MM-DD
      }
      
      if (evento.end) {
        fechaFin = evento.end.substring(0, 10); // Formato YYYY-MM-DD
      }
      
      try {
        // Intentar insertar en la tabla EVENTO
        const query = `
          INSERT INTO EVENTO (id_evento, nombre, descripcion, fecha_inicio, fecha_fin) 
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
          nombre = VALUES(nombre), 
          descripcion = VALUES(descripcion),
          fecha_inicio = VALUES(fecha_inicio),
          fecha_fin = VALUES(fecha_fin)
        `;
        
        const params = [
          id,
          evento.title || evento.nombre || 'Sin título',
          evento.description || evento.descripcion || null,
          fechaInicio,
          fechaFin
        ];
        
        await connection.execute(query, params);
        stats.importados++;
        
        // Procesar personajes relacionados
        if (evento.characters && evento.characters.items && Array.isArray(evento.characters.items)) {
          for (const personaje of evento.characters.items) {
            if (!personaje.resourceURI) continue;
            
            // Extraer ID del personaje
            const idPersonaje = extractIdFromResourceURI(personaje.resourceURI);
            
            // Insertar relación personaje-evento
            await connection.execute(
              `INSERT IGNORE INTO PERSONAJE_EVENTO (id_personaje, id_evento) 
               VALUES (?, ?)`,
              [idPersonaje, id]
            );
          }
        }
        
        // Procesar cómics relacionados
        if (evento.comics && evento.comics.items && Array.isArray(evento.comics.items)) {
          for (const comic of evento.comics.items) {
            if (!comic.resourceURI) continue;
            
            // Extraer ID del cómic
            const idComic = extractIdFromResourceURI(comic.resourceURI);
            
            // Insertar relación cómic-evento
            await connection.execute(
              `INSERT IGNORE INTO COMIC_EVENTO (id_comic, id_evento) 
               VALUES (?, ?)`,
              [idComic, id]
            );
          }
        }
      } catch (insertError) {
        console.error(`Error al insertar evento ${id}:`, insertError);
      }
    }
    
    console.log(`Eventos importados: ${stats.importados}, omitidos: ${stats.omitidos}`);
    return stats;
  } catch (error) {
    console.error('Error detallado al importar eventos:', error);
    return stats;
  }
}

// Función principal para importar datos con mejor manejo de errores
async function importarDatosMarvel() {
  let connection;
  let stats = {
    personajes: { total: 0, importados: 0, omitidos: 0 },
    series: { total: 0, importados: 0, omitidos: 0 },
    comics: { total: 0, importados: 0, omitidos: 0 },
    eventos: { total: 0, importados: 0, omitidos: 0 }
  };
  
  try {
    // Verificar que los archivos XML existen
    const archivosRequeridos = [
      'marvel_characters.xml',
      'marvel_comics.xml',
      'marvel_series.xml',
      'marvel_events.xml'
    ];
    
    let archivosExistentes = true;
    for (const archivo of archivosRequeridos) {
      if (!fs.existsSync(archivo)) {
        console.error(`Error: El archivo ${archivo} no existe.`);
        archivosExistentes = false;
      }
    }
    
    if (!archivosExistentes) {
      console.log("¿Has ejecutado antes el script para generar los archivos XML? (paste-2.txt)");
      return;
    }
    
    // Conectar a la base de datos
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log('Conectado a la base de datos Marvel_BBDD');
      
      // Verificar la conexión
      const [rows] = await connection.execute('SELECT 1');
      console.log('Verificación de conexión exitosa');
    } catch (connError) {
      console.error('Error al conectar a la base de datos:', connError);
      return;
    }
    
    // Preguntar al usuario si desea omitir la verificación de imágenes
    const omitirVerificacionImagen = true; // Cambiar a false si quieres filtrar por imagen
    console.log(`Omitiendo verificación de imágenes: ${omitirVerificacionImagen ? 'SÍ' : 'NO'}`);
    
    // Importar personajes
    console.log('\n=== IMPORTANDO PERSONAJES ===');
    try {
      stats.personajes = await importarPersonajes(connection, omitirVerificacionImagen);
    } catch (persError) {
      console.error('Error al importar personajes:', persError);
    }
    
    // Importar series
    console.log('\n=== IMPORTANDO SERIES ===');
    try {
      stats.series = await importarSeries(connection, omitirVerificacionImagen);
    } catch (seriesError) {
      console.error('Error al importar series:', seriesError);
    }
    
    // Importar cómics
    console.log('\n=== IMPORTANDO CÓMICS ===');
    try {
      stats.comics = await importarComics(connection, omitirVerificacionImagen);
    } catch (comicsError) {
      console.error('Error al importar cómics:', comicsError);
    }
    
    // Importar eventos
    console.log('\n=== IMPORTANDO EVENTOS ===');
    try {
      stats.eventos = await importarEventos(connection, omitirVerificacionImagen);
    } catch (eventosError) {
      console.error('Error al importar eventos:', eventosError);
    }
    
    // Mostrar estadísticas completas
    console.log('\n===== RESUMEN DE IMPORTACIÓN =====');
    console.log(`Personajes: ${stats.personajes.importados} importados, ${stats.personajes.omitidos} omitidos de ${stats.personajes.total} totales`);
    console.log(`Series: ${stats.series.importados} importadas, ${stats.series.omitidos} omitidas de ${stats.series.total} totales`);
    console.log(`Cómics: ${stats.comics.importados} importados, ${stats.comics.omitidos} omitidos de ${stats.comics.total} totales`);
    console.log(`Eventos: ${stats.eventos.importados} importados, ${stats.eventos.omitidos} omitidos de ${stats.eventos.total} totales`);
    console.log('==================================');
    
    console.log('Importación completada con éxito');
  } catch (error) {
    console.error('Error general durante la importación:', error);
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('Conexión a la base de datos cerrada');
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
}

// Ejecutar la función principal
importarDatosMarvel().catch(err => console.error('Error fatal:', err));