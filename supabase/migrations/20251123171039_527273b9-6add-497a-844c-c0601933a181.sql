-- Create docs table
CREATE TABLE public.docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content_markdown text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  author_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Create tutorials table
CREATE TABLE public.tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  content text NOT NULL,
  steps_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Create tutorial_progress table
CREATE TABLE public.tutorial_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tutorial_id uuid REFERENCES public.tutorials(id) ON DELETE CASCADE NOT NULL,
  percent_complete integer DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
  last_step integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, tutorial_id)
);

-- Create roadmap_items table
CREATE TABLE public.roadmap_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('planned', 'in_progress', 'released')),
  votes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create roadmap_votes table
CREATE TABLE public.roadmap_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES public.roadmap_items(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS on all tables
ALTER TABLE public.docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for docs (public read, authenticated write)
CREATE POLICY "Anyone can read docs"
  ON public.docs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create docs"
  ON public.docs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their docs"
  ON public.docs FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- RLS Policies for tutorials (public read, authenticated write)
CREATE POLICY "Anyone can read tutorials"
  ON public.tutorials FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tutorials"
  ON public.tutorials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for tutorial_progress
CREATE POLICY "Users can view own progress"
  ON public.tutorial_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress"
  ON public.tutorial_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.tutorial_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for roadmap_items (public read, authenticated write)
CREATE POLICY "Anyone can read roadmap items"
  ON public.roadmap_items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create roadmap items"
  ON public.roadmap_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for roadmap_votes
CREATE POLICY "Anyone can read votes"
  ON public.roadmap_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.roadmap_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON public.roadmap_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger for tutorial_progress updated_at
CREATE TRIGGER update_tutorial_progress_updated_at
  BEFORE UPDATE ON public.tutorial_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Add trigger for docs updated_at
CREATE TRIGGER update_docs_updated_at
  BEFORE UPDATE ON public.docs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();