
DROP DATABASE IF EXISTS private_place_db;

CREATE DATABASE private_place_db;

DROP USER IF EXISTS 'pp_admin'@'localhost';

CREATE USER IF NOT EXISTS 'pp_admin'@'localhost' IDENTIFIED BY '********';
GRANT SELECT, INSERT, UPDATE, DELETE ON private_place_db.* TO 'pp_admin'@'localhost';

FLUSH PRIVILEGES;

USE private_place_db;

CREATE TABLE IF NOT EXISTS app_user (
    user_id INT AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    PRIMARY KEY (user_id)
);



CREATE TABLE IF NOT EXISTS category (
    category_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL,

    PRIMARY KEY (category_name)
);

CREATE TABLE IF NOT EXISTS exploitation_type (
    exploitation_type_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL,

    PRIMARY KEY (exploitation_type_name)
);

CREATE TABLE IF NOT EXISTS place (
    place_id INT AUTO_INCREMENT,
    slug VARCHAR(50) UNIQUE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    additional_information TEXT,
    status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    category_name VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL,

    PRIMARY KEY (place_id),

    FOREIGN KEY (category_name)
        REFERENCES category (category_name)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS image (
    image_id INT AUTO_INCREMENT,
    url VARCHAR(255) NOT NULL UNIQUE,
    alt VARCHAR(255),
    is_main BOOLEAN NOT NULL DEFAULT false,
    place_id INT,

    PRIMARY KEY (image_id),

    FOREIGN KEY (place_id)
        REFERENCES place (place_id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS place_exploitation_type (
    place_id INT NOT NULL,
    exploitation_type_name VARCHAR(50) NOT NULL,

    PRIMARY KEY (place_id, exploitation_type_name),

    FOREIGN KEY (place_id)
        REFERENCES place (place_id)
        ON DELETE CASCADE,

    FOREIGN KEY (exploitation_type_name)
        REFERENCES exploitation_type (exploitation_type_name)
        ON DELETE CASCADE
);