-- V1__enable_extensions.sql
-- Enable required PostgreSQL extensions for Engineering Daybook

-- Enable pgvector for semantic search embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
