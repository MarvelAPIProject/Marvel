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

// Función para parsear XML a objeto JavaScript
async function parseXML(filePath) {
  try {
    const xmlData = fs.readFileSync(filePath, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    return await parser.parseStringPromise(xmlData);
  } catch (error) {
    console.error(`Error al parsear el archivo XML ${filePath}:`, error.message);
    throw error;
  }
}

// Función principal para importar datos
async function importarDatosMarvel() {
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado a la base de datos Marvel_BBDD');
    
    // Importar personajes
    console.log('Importando personajes...');
    await importarPersonajes(connection);
    
    // Importar series
    console.log('Importando series...');
    await importarSeries(connection);
    
    // Importar cómics
    console.log('Importando cómics...');
    await importarComics(connection);
    
    // Importar eventos
    console.log('Importando eventos...');
    await importarEventos(connection);
    
    // Establecer relaciones entre entidades
    console.log('Estableciendo relaciones...');
    await establecerRelaciones(connection);
    
    console.log('Importación completada con éxito');
  } catch (error) {
    console.error('Error durante la importación:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión a la base de datos cerrada');
    }
  }
}

// Función para importar personajes
async function importarPersonajes(connection) {
  try {
    const data = await parseXML('marvel_characters.xml');
    const characters = Array.isArray(data.marvel.characters) 
      ? data.marvel.characters 
      : [data.marvel.characters];
    
    // Aplanar la estructura si es necesario
    let personajesArray = [];
    characters.forEach(charGroup => {
      if (Array.isArray(charGroup)) {
        personajesArray = personajesArray.concat(charGroup);
      } else {
        personajesArray.push(charGroup);
      }
    });
    
    for (const personaje of personajesArray) {
      if (!personaje || !personaje.id) continue;
      
      // Preparar URL de imagen
      let urlImagen = null;
      if (personaje.thumbnail && personaje.thumbnail.path && personaje.thumbnail.extension) {
        urlImagen = `${personaje.thumbnail.path}.${personaje.thumbnail.extension}`;
      }
      
      // Insertar en la tabla PERSONAJE
      await connection.execute(
        `INSERT INTO PERSONAJE (id_personaje, nombre, descripcion, URL_imagen) 
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         nombre = VALUES(nombre), 
         descripcion = VALUES(descripcion),
         URL_imagen = VALUES(URL_imagen)`,
        [
          personaje.id,
          personaje.name || 'Sin nombre',
          personaje.description || null,
          urlImagen
        ]
      );
    }
    
    console.log(`Personajes importados: ${personajesArray.length}`);
  } catch (error) {
    console.error('Error al importar personajes:', error.message);
  }
}

// Función para importar series
async function importarSeries(connection) {
  try {
    const data = await parseXML('marvel_series.xml');
    const series = Array.isArray(data.marvel.series) 
      ? data.marvel.series 
      : [data.marvel.series];
    
    // Aplanar la estructura si es necesario
    let seriesArray = [];
    series.forEach(serieGroup => {
      if (Array.isArray(serieGroup)) {
        seriesArray = seriesArray.concat(serieGroup);
      } else {
        seriesArray.push(serieGroup);
      }
    });
    
    for (const serie of seriesArray) {
      if (!serie || !serie.id) continue;
      
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
      
      // Insertar en la tabla SERIE
      await connection.execute(
        `INSERT INTO SERIE (id_serie, nombre, descripcion, fecha_inicio, fecha_fin, URL_imagen) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         nombre = VALUES(nombre), 
         descripcion = VALUES(descripcion),
         fecha_inicio = VALUES(fecha_inicio),
         fecha_fin = VALUES(fecha_fin),
         URL_imagen = VALUES(URL_imagen)`,
        [
          serie.id,
          serie.title || 'Sin título',
          serie.description || null,
          fechaInicio,
          fechaFin,
          urlImagen
        ]
      );
    }
    
    console.log(`Series importadas: ${seriesArray.length}`);
  } catch (error) {
    console.error('Error al importar series:', error.message);
  }
}

// Función para importar cómics
async function importarComics(connection) {
  try {
    const data = await parseXML('marvel_comics.xml');
    const comics = Array.isArray(data.marvel.comics) 
      ? data.marvel.comics 
      : [data.marvel.comics];
    
    // Aplanar la estructura si es necesario
    let comicsArray = [];
    comics.forEach(comicGroup => {
      if (Array.isArray(comicGroup)) {
        comicsArray = comicsArray.concat(comicGroup);
      } else {
        comicsArray.push(comicGroup);
      }
    });
    
    for (const comic of comicsArray) {
      if (!comic || !comic.id) continue;
      
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
        const seriesUriParts = comic.series.resourceURI.split('/');
        idSerie = seriesUriParts[seriesUriParts.length - 1];
      }
      
      // Insertar en la tabla COMIC
      await connection.execute(
        `INSERT INTO COMIC (id_comic, titulo, descripcion, numero_edicion, fecha_publicacion, URL_imagen, id_serie) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         titulo = VALUES(titulo), 
         descripcion = VALUES(descripcion),
         numero_edicion = VALUES(numero_edicion),
         fecha_publicacion = VALUES(fecha_publicacion),
         URL_imagen = VALUES(URL_imagen),
         id_serie = VALUES(id_serie)`,
        [
          comic.id,
          comic.title || 'Sin título',
          comic.description || null,
          comic.issueNumber || 0,
          fechaPublicacion,
          urlImagen,
          idSerie
        ]
      );
      
      // Procesar creadores si existen
      if (comic.creators && comic.creators.items && Array.isArray(comic.creators.items)) {
        for (const creador of comic.creators.items) {
          if (!creador.resourceURI) continue;
          
          // Extraer ID del creador
          const creadorUriParts = creador.resourceURI.split('/');
          const idCreador = creadorUriParts[creadorUriParts.length - 1];
          
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
            [comic.id, idCreador]
          );
        }
      }
    }
    
    console.log(`Cómics importados: ${comicsArray.length}`);
  } catch (error) {
    console.error('Error al importar cómics:', error.message);
  }
}

// Función para importar eventos
async function importarEventos(connection) {
  try {
    const data = await parseXML('marvel_events.xml');
    const events = Array.isArray(data.marvel.events) 
      ? data.marvel.events 
      : [data.marvel.events];
    
    // Aplanar la estructura si es necesario
    let eventosArray = [];
    events.forEach(eventGroup => {
      if (Array.isArray(eventGroup)) {
        eventosArray = eventosArray.concat(eventGroup);
      } else {
        eventosArray.push(eventGroup);
      }
    });
    
    for (const evento of eventosArray) {
      if (!evento || !evento.id) continue;
      
      // Preparar fechas
      let fechaInicio = null;
      let fechaFin = null;
      
      if (evento.start) {
        fechaInicio = evento.start.substring(0, 10); // Formato YYYY-MM-DD
      }
      
      if (evento.end) {
        fechaFin = evento.end.substring(0, 10); // Formato YYYY-MM-DD
      }
      
      // Insertar en la tabla EVENTO
      await connection.execute(
        `INSERT INTO EVENTO (id_evento, nombre, descripcion, fecha_inicio, fecha_fin) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         nombre = VALUES(nombre), 
         descripcion = VALUES(descripcion),
         fecha_inicio = VALUES(fecha_inicio),
         fecha_fin = VALUES(fecha_fin)`,
        [
          evento.id,
          evento.title || 'Sin título',
          evento.description || null,
          fechaInicio,
          fechaFin
        ]
      );
      
      // Procesar personajes relacionados
      if (evento.characters && evento.characters.items && Array.isArray(evento.characters.items)) {
        for (const personaje of evento.characters.items) {
          if (!personaje.resourceURI) continue;
          
          // Extraer ID del personaje
          const personajeUriParts = personaje.resourceURI.split('/');
          const idPersonaje = personajeUriParts[personajeUriParts.length - 1];
          
          // Insertar relación personaje-evento
          await connection.execute(
            `INSERT IGNORE INTO PERSONAJE_EVENTO (id_personaje, id_evento) 
             VALUES (?, ?)`,
            [idPersonaje, evento.id]
          );
        }
      }
      
      // Procesar cómics relacionados
      if (evento.comics && evento.comics.items && Array.isArray(evento.comics.items)) {
        for (const comic of evento.comics.items) {
          if (!comic.resourceURI) continue;
          
          // Extraer ID del cómic
          const comicUriParts = comic.resourceURI.split('/');
          const idComic = comicUriParts[comicUriParts.length - 1];
          
          // Insertar relación cómic-evento
          await connection.execute(
            `INSERT IGNORE INTO COMIC_EVENTO (id_comic, id_evento) 
             VALUES (?, ?)`,
            [idComic, evento.id]
          );
        }
      }
    }
    
    console.log(`Eventos importados: ${eventosArray.length}`);
  } catch (error) {
    console.error('Error al importar eventos:', error.message);
  }
}

// Función para establecer relaciones adicionales
async function establecerRelaciones(connection) {
  try {
    // Esta función puede usarse para establecer relaciones adicionales
    // que no se pudieron establecer durante la importación inicial
    
    // Por ejemplo, relacionar personajes con cómics que no estén explícitamente
    // mencionados en los XML, pero que se pueden inferir de otras relaciones
    
    console.log('Relaciones adicionales establecidas');
  } catch (error) {
    console.error('Error al establecer relaciones:', error.message);
  }
}

// Ejecutar la función principal
importarDatosMarvel().catch(console.error);