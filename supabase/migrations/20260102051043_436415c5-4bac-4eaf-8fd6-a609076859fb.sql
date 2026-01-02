-- Drop the existing embedding index
DROP INDEX IF EXISTS amt_chunks_embedding_idx;

-- Alter the embedding column to use 1536 dimensions (OpenAI text-embedding-3-small default)
ALTER TABLE public.amt_chunks 
ALTER COLUMN embedding TYPE vector(1536);

-- Recreate the index with the new dimensions
CREATE INDEX amt_chunks_embedding_idx ON public.amt_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Update the search function to use 1536 dimensions
CREATE OR REPLACE FUNCTION public.search_amt_knowledge(
  query_embedding vector(1536),
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity double precision
)
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.amt_chunks c
  WHERE 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;