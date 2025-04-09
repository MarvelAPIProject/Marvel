CREATE DATABASE Marvel_BBDD;

use Marvel_BBDD;

-- Tabla USUARIO
CREATE TABLE USUARIO (
    id_usuario INT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100)
);

-- Tabla HISTORIAL_BUSQUEDA
CREATE TABLE HISTORIAL_BUSQUEDA (
    id_historial INT PRIMARY KEY,
    id_usuario INT,
    termino_busqueda VARCHAR(255),
    fecha_busqueda TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

-- Tabla IDIOMA
CREATE TABLE IDIOMA (
    id_idioma INT PRIMARY KEY,
    nombre VARCHAR(100),
    codigo VARCHAR(10)
);

-- Tabla SERIE
CREATE TABLE SERIE (
    id_serie INT PRIMARY KEY,
    nombre VARCHAR(255),
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    URL_imagen VARCHAR(255)
);

-- Tabla COMIC
CREATE TABLE COMIC (
    id_comic INT PRIMARY KEY,
    titulo VARCHAR(255),
    descripcion TEXT,
    numero_edicion INT,
    fecha_publicacion DATE,
    URL_imagen VARCHAR(255),
    id_serie INT,
    FOREIGN KEY (id_serie) REFERENCES SERIE(id_serie)
);

-- Tabla CREADOR
CREATE TABLE CREADOR (
    id_creador INT PRIMARY KEY,
    nombre VARCHAR(255),
    rol VARCHAR(100),
    URL_imagen VARCHAR(255)
);

-- Tabla COMIC_CREADOR
CREATE TABLE COMIC_CREADOR (
    id_comic INT,
    id_creador INT,
    PRIMARY KEY (id_comic, id_creador),
    FOREIGN KEY (id_comic) REFERENCES COMIC(id_comic),
    FOREIGN KEY (id_creador) REFERENCES CREADOR(id_creador)
);

-- Tabla PERSONAJE
CREATE TABLE PERSONAJE (
    id_personaje INT PRIMARY KEY,
    nombre VARCHAR(75),
    descripcion TEXT,
    URL_imagen VARCHAR(255)
);

-- Tabla EVENTO
CREATE TABLE EVENTO (
    id_evento INT PRIMARY KEY,
    nombre VARCHAR(255),
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    url_imagen VARCHAR(200)
);


-- Tabla FAVORITOS
CREATE TABLE FAVORITOS (
	id_favoritos INT PRIMARY KEY,
    id_usuario INT,
    id_serie INT,
    id_personaje INT,
    id_comic INT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
    FOREIGN KEY (id_serie) REFERENCES SERIE(id_serie),
    FOREIGN KEY (id_personaje) REFERENCES PERSONAJE(id_personaje),
    FOREIGN KEY (id_comic) REFERENCES COMIC(id_comic)
);

-- Tabla PERSONAJE_EVENTO
CREATE TABLE PERSONAJE_EVENTO (
    id_personaje INT,
    id_evento INT,
    PRIMARY KEY (id_personaje, id_evento),
    FOREIGN KEY (id_personaje) REFERENCES PERSONAJE(id_personaje),
    FOREIGN KEY (id_evento) REFERENCES EVENTO(id_evento)
);

-- Tabla COMIC_EVENTO
CREATE TABLE COMIC_EVENTO (
    id_comic INT,
    id_evento INT,
    PRIMARY KEY (id_comic, id_evento),
    FOREIGN KEY (id_comic) REFERENCES COMIC(id_comic),
    FOREIGN KEY (id_evento) REFERENCES EVENTO(id_evento)
);




-- Crear la tabla de relación entre cómics y personajes si no existe
CREATE TABLE COMIC_PERSONAJE (
    id_comic INT,
    id_personaje INT,
    PRIMARY KEY (id_comic, id_personaje),
    FOREIGN KEY (id_comic) REFERENCES COMIC(id_comic),
    FOREIGN KEY (id_personaje) REFERENCES PERSONAJE(id_personaje)
);

-- Modificar la tabla FAVORITOS para permitir que id_personaje, id_comic e id_serie sean NULL
-- (así podemos tener diferentes tipos de favoritos para un mismo usuario)

-- Primero eliminar las restricciones de clave externa
ALTER TABLE FAVORITOS
    DROP FOREIGN KEY FAVORITOS_ibfk_2,
    DROP FOREIGN KEY FAVORITOS_ibfk_3,
    DROP FOREIGN KEY FAVORITOS_ibfk_4;

-- Luego cambiar las columnas para permitir NULL
ALTER TABLE FAVORITOS
    MODIFY id_personaje INT NULL,
    MODIFY id_comic INT NULL,
    MODIFY id_serie INT NULL;

-- Volver a añadir las restricciones de clave externa
ALTER TABLE FAVORITOS
    ADD CONSTRAINT FAVORITOS_ibfk_2 FOREIGN KEY (id_personaje) REFERENCES PERSONAJE(id_personaje),
    ADD CONSTRAINT FAVORITOS_ibfk_3 FOREIGN KEY (id_comic) REFERENCES COMIC(id_comic),
    ADD CONSTRAINT FAVORITOS_ibfk_4 FOREIGN KEY (id_serie) REFERENCES SERIE(id_serie);

-- Asegurarse de tener un auto_increment en id_favoritos
ALTER TABLE FAVORITOS
    MODIFY id_favoritos INT AUTO_INCREMENT;

-- Agregar índices para mejorar el rendimiento
CREATE INDEX idx_favoritos_usuario ON FAVORITOS(id_usuario);
CREATE INDEX idx_favoritos_personaje ON FAVORITOS(id_personaje);
CREATE INDEX idx_favoritos_comic ON FAVORITOS(id_comic);
CREATE INDEX idx_favoritos_serie ON FAVORITOS(id_serie);
CREATE INDEX idx_comic_personaje_comic ON COMIC_PERSONAJE(id_comic);
CREATE INDEX idx_comic_personaje_personaje ON COMIC_PERSONAJE(id_personaje);

-- Insertar algunas relaciones de ejemplo entre cómics y personajes
-- (ajusta los IDs según los datos reales de tu base de datos)
INSERT IGNORE INTO COMIC_PERSONAJE (id_comic, id_personaje)
SELECT c.id_comic, p.id_personaje
FROM COMIC c 
CROSS JOIN PERSONAJE p 
WHERE (c.id_comic % 5 = p.id_personaje % 5)
LIMIT 50;

-- Asegurar que todos los personajes tengan al menos un cómic relacionado
INSERT IGNORE INTO COMIC_PERSONAJE (id_comic, id_personaje)
SELECT 
    (SELECT id_comic FROM COMIC ORDER BY RAND() LIMIT 1) as id_comic,
    p.id_personaje
FROM PERSONAJE p
WHERE p.id_personaje NOT IN (
    SELECT DISTINCT id_personaje FROM COMIC_PERSONAJE
);

-- Añadir más relaciones para que cada personaje tenga varios cómics
INSERT IGNORE INTO COMIC_PERSONAJE (id_comic, id_personaje)
SELECT 
    c.id_comic,
    p.id_personaje
FROM 
    PERSONAJE p
CROSS JOIN 
    (SELECT id_comic FROM COMIC ORDER BY RAND() LIMIT 20) c
WHERE 
    (p.id_personaje % 10) = (c.id_comic % 10)
ON DUPLICATE KEY IGNORE;

-- Actualizar URLs de imágenes para los personajes si están vacías
UPDATE PERSONAJE
SET URL_imagen = CASE 
    WHEN id_personaje % 5 = 0 THEN 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/003cap_ons_inl_01.jpg'
    WHEN id_personaje % 5 = 1 THEN 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/002irm_ons_inl_01.jpg'
    WHEN id_personaje % 5 = 2 THEN 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/009thor_ons_inl_01.jpg'
    WHEN id_personaje % 5 = 3 THEN 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/006hbb_ons_inl_01.jpg'
    ELSE 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/005smp_ons_inl_01.jpg'
END
WHERE URL_imagen IS NULL OR URL_imagen = '';

-- Actualizar URLs de imágenes para los cómics si están vacías
UPDATE COMIC
SET URL_imagen = CASE 
    WHEN id_comic % 4 = 0 THEN 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/avengers_01.jpg'
    WHEN id_comic % 4 = 1 THEN 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/spider-man_01.jpg'
    WHEN id_comic % 4 = 2 THEN 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/x-men_01.jpg'
    ELSE 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/fantastic_four_01.jpg'
END
WHERE URL_imagen IS NULL OR URL_imagen = '';

-- Actualizar URLs de imágenes para las series si están vacías
UPDATE SERIE
SET URL_imagen = CASE 
    WHEN id_serie % 3 = 0 THEN 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/avengers_series.jpg'
    WHEN id_serie % 3 = 1 THEN 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/spider-man_series.jpg'
    ELSE 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/x-men_series.jpg'
END
WHERE URL_imagen IS NULL OR URL_imagen = '';

-- Asegurarse de que existe al menos un usuario
INSERT IGNORE INTO USUARIO (id_usuario, nombre, email)
VALUES (1, 'Usuario Demo', 'usuario@ejemplo.com');

-- Actualizar URLs de imágenes para los eventos si están vacías
UPDATE EVENTO
SET url_imagen = CASE 
    WHEN id_evento % 12 = 0 THEN 'https://cdn.marvel.com/content/1x/civil_war_01.jpg'
    WHEN id_evento % 12 = 1 THEN 'https://cdn.marvel.com/content/1x/infinity_01.jpg'
    WHEN id_evento % 12 = 2 THEN 'https://cdn.marvel.com/content/1x/secret_wars_01.jpg'
    WHEN id_evento % 12 = 3 THEN 'https://cdn.marvel.com/content/1x/age_of_apocalypse_01.jpg'
    WHEN id_evento % 12 = 4 THEN 'https://cdn.marvel.com/content/1x/house_of_m_01.jpg'
    WHEN id_evento % 12 = 5 THEN 'https://cdn.marvel.com/content/1x/dark_phoenix_saga_01.jpg'
    WHEN id_evento % 12 = 6 THEN 'https://cdn.marvel.com/content/1x/secret_invasion_01.jpg'
    WHEN id_evento % 12 = 7 THEN 'https://cdn.marvel.com/content/1x/avengers_vs_xmen_01.jpg'
    WHEN id_evento % 12 = 8 THEN 'https://cdn.marvel.com/content/1x/king_in_black_01.jpg'
    WHEN id_evento % 12 = 9 THEN 'https://cdn.marvel.com/content/1x/inferno_01.jpg'
    WHEN id_evento % 12 = 10 THEN 'https://cdn.marvel.com/content/1x/empyre_01.jpg'
    ELSE 'https://cdn.marvel.com/content/1x/annihilation_01.jpg'
END
WHERE url_imagen IS NULL OR url_imagen = '';

