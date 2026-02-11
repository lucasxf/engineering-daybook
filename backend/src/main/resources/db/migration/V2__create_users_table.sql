-- V2__create_users_table.sql
-- Create users table for authentication

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    display_name  VARCHAR(100) NOT NULL,
    handle        VARCHAR(30)  NOT NULL,
    locale        VARCHAR(10)  NOT NULL DEFAULT 'EN',
    theme         VARCHAR(10)  NOT NULL DEFAULT 'dark',
    auth_provider VARCHAR(20)  NOT NULL DEFAULT 'local',
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users (LOWER(email));
CREATE UNIQUE INDEX idx_users_handle ON users (handle);
