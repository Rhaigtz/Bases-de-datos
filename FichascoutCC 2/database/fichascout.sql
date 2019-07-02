CREATE DATABASE fichascout;

USE fichascout;

CREATE TABLE users (
  id VARCHAR(60) NOT NULL UNIQUE,
  username VARCHAR(16) NOT NULL UNIQUE,
  password VARCHAR(60) NOT NULL,
  fullname VARCHAR(100) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE Region (
    distrito_nombre VARCHAR(60) NOT NULL,
    region VARCHAR(60),
    num_region VARCHAR(3),
    PRIMARY KEY (distrito_nombre)
);

CREATE TABLE Especifique (
    rut VARCHAR(60) NOT NULL,
    tipo VARCHAR(60) NOT NULL,
    opcion VARCHAR(60) NOT NULL,
    especifique VARCHAR(255),
    PRIMARY KEY (rut,opcion)
);

CREATE TABLE Personas (
    rut VARCHAR(60) NOT NULL UNIQUE ,
    nombre VARCHAR(60) NOT NULL,
    apellido VARCHAR(60) NOT NULL,
    sexo VARCHAR(12) NOT NULL,
    poblacion VARCHAR(90) NOT NULL,
    calle VARCHAR(60) NOT NULL,
    numero_c int(8) NOT NULL,
    ciudad VARCHAR(60) NOT NULL,   
    fecha_nac VARCHAR(60) NOT NULL,
    lugar_nac VARCHAR(60) NOT NULL,
    unidad VARCHAR(60) NOT NULL,
    grupo VARCHAR(60) NOT NULL,
    ciudad_grupo VARCHAR(60) NOT NULL,
    distrito VARCHAR(60) NOT NULL,
    rut_dirigente1 VARCHAR(60),
    rut_dirigente2 VARCHAR(60),
    rut_dirigente3 VARCHAR(60),
    PRIMARY KEY (rut),
    FOREIGN KEY (rut) REFERENCES users(id),
    FOREIGN KEY (distrito) REFERENCES region(distrito_nombre)
);

CREATE TABLE Ficha (
    rut VARCHAR(60) NOT NULL UNIQUE,
    sangre VARCHAR(60) NOT NULL,
    sangregrupo VARCHAR(60) NOT NULL,
    telefono_eme VARCHAR(60) NOT NULL,
    nombre_tel_eme VARCHAR(60) NOT NULL,
    estatura VARCHAR(60) NOT NULL,
    peso VARCHAR(60) NOT NULL,
    prevision VARCHAR(60) NOT NULL,
    grupo_prevision VARCHAR(60) NOT NULL,
    seguro VARCHAR(60) NOT NULL,
    institucion VARCHAR(60) NOT NULL,
    fecha_u_cd VARCHAR(60) ,
    contacto_medi VARCHAR(60) ,
    nombre_medi VARCHAR(60) ,
    consultorio VARCHAR(60),
    embarazada VARCHAR(60) DEFAULT 'NO',
    semanas VARCHAR(60) DEFAULT 'NO',
    embarazo_ant VARCHAR(2) DEFAULT 'NO',
    fur VARCHAR(60),
    PRIMARY KEY (rut)
);




