-- Create wiki_cache table for caching Wikipedia lookups
CREATE TABLE public.wiki_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create wiki_usage table for tracking daily usage
CREATE TABLE public.wiki_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.wiki_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for wiki_cache (public read, no write for users)
CREATE POLICY "Anyone can read wiki cache"
  ON public.wiki_cache
  FOR SELECT
  USING (true);

-- RLS policies for wiki_usage (users can only see their own usage)
CREATE POLICY "Users can view own wiki usage"
  ON public.wiki_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_wiki_cache_term ON public.wiki_cache(term);
CREATE INDEX idx_wiki_usage_user_date ON public.wiki_usage(user_id, date);