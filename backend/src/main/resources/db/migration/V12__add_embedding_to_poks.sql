-- V12__add_embedding_to_poks.sql
-- Add vector embedding column for semantic search.
-- Model: paraphrase-multilingual-MiniLM-L12-v2 (HuggingFace), 384 dimensions.
-- The column is nullable: POKs without embeddings are excluded from semantic
-- search but remain fully available for keyword search.

ALTER TABLE poks
    ADD COLUMN embedding vector(384);

-- IVFFlat approximate nearest-neighbor index using cosine distance.
-- lists=100 is appropriate for up to ~1M rows; tune upward if the table grows.
-- Partial index (WHERE embedding IS NOT NULL) keeps the index lean —
-- unembedded POKs are never candidates for vector search anyway.
CREATE INDEX idx_poks_embedding_ivfflat
    ON poks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100)
    WHERE embedding IS NOT NULL;

COMMENT ON COLUMN poks.embedding IS
    'paraphrase-multilingual-MiniLM-L12-v2 embedding (384 dims). '
    'NULL until generated asynchronously after POK create/update. '
    'Cleared on content update and regenerated async. '
    'Excluded from semantic search when NULL.';
