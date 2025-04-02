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
    fecha_fin DATE
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
