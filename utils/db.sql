CREATE DATABASE weezprestas;

USE weezprestas;

CREATE TABLE Events (
	id INT AUTO_INCREMENT UNIQUE,
	name VARCHAR(255) NOT NULL,
	description TEXT,
	start TEXT,
	end TEXT,
	edit_key VARCHAR(32),

PRIMARY KEY (id)
);

CREATE TABLE Prestas (
	id INT AUTO_INCREMENT UNIQUE,
	event_id INT NOT NULL,
	type VARCHAR(50),
	name VARCHAR(255) NOT NULL,
	description TEXT,
	edit_key VARCHAR(32),
	slots INT,

FOREIGN KEY (event_id) REFERENCES Events(id) ON DELETE CASCADE,
PRIMARY KEY (id)
);

CREATE TABLE Shotguns (
	id INT AUTO_INCREMENT UNIQUE,
	presta_id INT NOT NULL,
	name VARCHAR(75) NOT NULL,
	mail VARCHAR(100) NOT NULL,
	status VARCHAR(1) NOT NULL,
	validate_key VARCHAR(32) NOT NULL,

FOREIGN KEY (presta_id) REFERENCES Prestas(id) ON DELETE CASCADE,
PRIMARY KEY (id)
);