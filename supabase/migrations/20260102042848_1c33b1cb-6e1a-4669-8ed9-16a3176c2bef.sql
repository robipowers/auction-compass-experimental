-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for storing AMT knowledge documents
CREATE TABLE public.amt_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  total_chunks INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing document chunks with embeddings
CREATE TABLE public.amt_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.amt_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768), -- Gemini embeddings are 768 dimensions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX amt_chunks_embedding_idx ON public.amt_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for document lookup
CREATE INDEX amt_chunks_document_id_idx ON public.amt_chunks(document_id);

-- Enable RLS (but allow public read for the knowledge base)
ALTER TABLE public.amt_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amt_chunks ENABLE ROW LEVEL SECURITY;

-- Allow public read access (this is reference material)
CREATE POLICY "AMT documents are publicly readable" 
ON public.amt_documents 
FOR SELECT 
USING (true);

CREATE POLICY "AMT chunks are publicly readable" 
ON public.amt_chunks 
FOR SELECT 
USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage AMT documents" 
ON public.amt_documents 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage AMT chunks" 
ON public.amt_chunks 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('amt-documents', 'amt-documents', false);

-- Storage policies - only service role can upload
CREATE POLICY "Service role can upload AMT documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'amt-documents' AND auth.role() = 'service_role');

CREATE POLICY "Service role can read AMT documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'amt-documents');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_amt_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_amt_documents_updated_at
BEFORE UPDATE ON public.amt_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_amt_documents_updated_at();

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION public.search_amt_knowledge(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
SET search_path = public
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