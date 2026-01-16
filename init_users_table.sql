-- Script para crear la tabla de usuarios en PostgreSQL
-- Ejecutar en pgAdmin o psql

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Crear índice para búsquedas rápidas por email
CREATE INDEX idx_users_email ON users(email);

-- Insertar un usuario de prueba
INSERT INTO users (email, password) 
VALUES ('test@example.com', 'hashed_password_here');
