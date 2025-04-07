const fs = require('fs');
const xml2js = require('xml2js');
const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',     // Reemplaza con tu usuario de MySQL
  password: 'mysqlrootpassword1!', // Reemplaza con tu contraseña de MySQL
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

// Función para verificar si una URL de imagen es válida
function esImagenValida(urlImagen) {
  // Si no hay URL, no es válida
  if (!urlImagen) {
    return false;
  }
  
  // Verificar si contiene "image_not_available" en cualquier formato
  if (urlImagen.includes('image_not_available')) {
    console.log(`Rechazando imagen no válida: ${urlImagen}`);
    return false;
  }
  
  // Verificar si termina en .jpg (case insensitive)
  const extensionJpg = /\.jpe?g$/i.test(urlImagen);
  if (!extensionJpg) {
    console.log(`Rechazando imagen por extensión no válida: ${urlImagen}`);
    return false;
  }
  
  return true;
}

// Función para extraer el ID de un recurso URI
function extractIdFromResourceURI(resourceURI) {
  if (!resourceURI) return null;
  const parts = resourceURI.split('/');
  return parts[parts.length - 1];
}

// Función para importar personajes
async function importarPersonajes(connection) {
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
      personajesArray = [data.marvel.characters];
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
      const id = personaje.id_personaje;
      const nombre = personaje.nombre || 'Sin nombre';
      const descripcion = personaje.descripcion || null;
      const urlImagen = personaje.URL_imagen;
      
      if (!id) {
        console.log('Omitiendo personaje sin ID');
        continue;
      }
      
      // Verificar si la URL de imagen es válida
      if (!esImagenValida(urlImagen)) {
        console.log(`Omitiendo personaje ${id} sin imagen válida`);
        stats.omitidos++;
        continue;
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
        
        const params = [id, nombre, descripcion, urlImagen];
        
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
async function importarSeries(connection) {
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
      seriesArray = [data.marvel.series];
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
      
      // Adaptar a tu estructura XML
      const id = serie.id_serie;
      const nombre = serie.nombre || 'Sin título';
      const descripcion = serie.descripcion || null;
      const fechaInicio = serie.fecha_inicio || null;
      const fechaFin = serie.fecha_fin || null;
      const urlImagen = serie.URL_imagen;
      
      if (!id) {
        console.log('Omitiendo serie sin ID');
        continue;
      }
      
      // Verificar si la URL de imagen es válida
      if (!esImagenValida(urlImagen)) {
        console.log(`Omitiendo serie ${id} sin imagen válida`);
        stats.omitidos++;
        continue;
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
        
        const params = [id, nombre, descripcion, fechaInicio, fechaFin, urlImagen];
        
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
async function importarComics(connection) {
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
      comicsArray = [data.marvel.comics];
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
      
      // Adaptar a tu estructura XML
      const id = comic.id_comic;
      const titulo = comic.titulo || 'Sin título';
      const descripcion = comic.descripcion || null;
      const numeroEdicion = comic.numero_edicion || 0;
      const fechaPublicacion = comic.fecha_publicacion || null;
      const urlImagen = comic.URL_imagen;
      const idSerie = comic.id_serie || null;
      
      if (!id) {
        console.log('Omitiendo cómic sin ID');
        continue;
      }
      
      // Verificar si la URL de imagen es válida
      if (!esImagenValida(urlImagen)) {
        console.log(`Omitiendo cómic ${id} sin imagen válida`);
        stats.omitidos++;
        continue;
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
        
        const params = [id, titulo, descripcion, numeroEdicion, fechaPublicacion, urlImagen, idSerie];
        
        await connection.execute(query, params);
        stats.importados++;
        
        // Procesamiento de relaciones (si existen en tu estructura XML)
        // Esto dependerá de cómo estén estructuradas las relaciones en tu XML
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
async function importarEventos(connection) {
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
      eventosArray = [data.marvel.events];
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
      
      // Adaptar a tu estructura XML específica de eventos
      const id = evento.id_evento;
      const nombre = evento.nombre || 'Sin título';
      const descripcion = evento.descripcion || null;
      const fechaInicio = evento.fecha_inicio || null;
      const fechaFin = evento.fecha_fin || null;
      const urlImagen = evento.URL_imagen || null; // Campo de imagen para eventos
      
      if (!id) {
        console.log('Omitiendo evento sin ID');
        continue;
      }
      
      // Verificar si hay imagen, pero no rechazar eventos sin imagen
      const tieneImagen = urlImagen && esImagenValida(urlImagen);
      if (urlImagen && !tieneImagen) {
        console.log(`Evento ${id} tiene imagen inválida, pero será importado sin imagen`);
      }
      
      try {
        // Verificar si la tabla EVENTO tiene la columna URL_imagen
        let query = `
          SHOW COLUMNS FROM EVENTO LIKE 'URL_imagen'
        `;
        
        let [columnasUrlImagen] = await connection.execute(query);
        
        // Si la columna URL_imagen no existe, la añadimos
        if (columnasUrlImagen.length === 0) {
          console.log('Añadiendo columna URL_imagen a la tabla EVENTO');
          try {
            await connection.execute('ALTER TABLE EVENTO ADD COLUMN URL_imagen VARCHAR(255)');
            console.log('Columna URL_imagen añadida con éxito');
          } catch (alterError) {
            console.error('Error al añadir columna URL_imagen:', alterError);
          }
        }
        
        // Intentar insertar en la tabla EVENTO incluyendo URL_imagen
        query = `
          INSERT INTO EVENTO (id_evento, nombre, descripcion, fecha_inicio, fecha_fin, URL_imagen) 
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
          nombre = VALUES(nombre), 
          descripcion = VALUES(descripcion),
          fecha_inicio = VALUES(fecha_inicio),
          fecha_fin = VALUES(fecha_fin),
          URL_imagen = VALUES(URL_imagen)
        `;
        
        const params = [id, nombre, descripcion, fechaInicio, fechaFin, tieneImagen ? urlImagen : null];
        
        await connection.execute(query, params);
        stats.importados++;
        
        // Procesar personajes relacionados
        if (evento.personajes) {
          const personajesArray = Array.isArray(evento.personajes) 
            ? evento.personajes 
            : [evento.personajes];
          
          for (const personaje of personajesArray) {
            if (!personaje.id) continue;
            
            try {
              // Insertar relación personaje-evento
              await connection.execute(
                `INSERT IGNORE INTO PERSONAJE_EVENTO (id_personaje, id_evento) 
                 VALUES (?, ?)`,
                [personaje.id, id]
              );
            } catch (relError) {
              console.error(`Error al insertar relación personaje-evento ${personaje.id}-${id}:`, relError);
            }
          }
        }
        
        // Procesar cómics relacionados
        if (evento.comics) {
          const comicsArray = Array.isArray(evento.comics) 
            ? evento.comics 
            : [evento.comics];
          
          for (const comic of comicsArray) {
            if (!comic.id) continue;
            
            try {
              // Insertar relación cómic-evento
              await connection.execute(
                `INSERT IGNORE INTO COMIC_EVENTO (id_comic, id_evento) 
                 VALUES (?, ?)`,
                [comic.id, id]
              );
            } catch (relError) {
              console.error(`Error al insertar relación comic-evento ${comic.id}-${id}:`, relError);
            }
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

// Función principal para importar datos
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
      console.log("¿Has ejecutado antes el script para generar los archivos XML?");
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
    
    // Importar personajes
    console.log('\n=== IMPORTANDO PERSONAJES ===');
    try {
      stats.personajes = await importarPersonajes(connection);
    } catch (persError) {
      console.error('Error al importar personajes:', persError);
    }
    
    // Importar series
    console.log('\n=== IMPORTANDO SERIES ===');
    try {
      stats.series = await importarSeries(connection);
    } catch (seriesError) {
      console.error('Error al importar series:', seriesError);
    }
    
    // Importar cómics
    console.log('\n=== IMPORTANDO CÓMICS ===');
    try {
      stats.comics = await importarComics(connection);
    } catch (comicsError) {
      console.error('Error al importar cómics:', comicsError);
    }
    
    // Importar eventos
    console.log('\n=== IMPORTANDO EVENTOS ===');
    try {
      stats.eventos = await importarEventos(connection);
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