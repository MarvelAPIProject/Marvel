-- Crear la tabla de relación entre cómics y personajes si no existe
CREATE TABLE IF NOT EXISTS COMIC_PERSONAJE (
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
    DROP FOREIGN KEY IF EXISTS FAVORITOS_ibfk_2,
    DROP FOREIGN KEY IF EXISTS FAVORITOS_ibfk_3,
    DROP FOREIGN KEY IF EXISTS FAVORITOS_ibfk_4;

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
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON FAVORITOS(id_usuario);
CREATE INDEX IF NOT EXISTS idx_favoritos_personaje ON FAVORITOS(id_personaje);
CREATE INDEX IF NOT EXISTS idx_favoritos_comic ON FAVORITOS(id_comic);
CREATE INDEX IF NOT EXISTS idx_favoritos_serie ON FAVORITOS(id_serie);
CREATE INDEX IF NOT EXISTS idx_comic_personaje_comic ON COMIC_PERSONAJE(id_comic);
CREATE INDEX IF NOT EXISTS idx_comic_personaje_personaje ON COMIC_PERSONAJE(id_personaje);

-- Insertar algunas relaciones de ejemplo entre cómics y personajes
-- (ajusta los IDs según los datos reales de tu base de datos)
INSERT IGNORE INTO COMIC_PERSONAJE (id_comic, id_personaje)
SELECT c.id_comic, p.id_personaje
FROM COMIC c 
CROSS JOIN PERSONAJE p 
WHERE (c.id_comic % 5 = p.id_personaje % 5)
LIMIT 50;

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