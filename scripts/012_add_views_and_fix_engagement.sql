-- Add views_count to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Create function to generate realistic view counts based on follower count
CREATE OR REPLACE FUNCTION generate_realistic_views(follower_count INTEGER, likes_count INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_views INTEGER;
  random_multiplier DECIMAL;
BEGIN
  -- Views should be 3-8x the likes count, with some randomness
  random_multiplier := 3.0 + (RANDOM() * 5.0); -- 3.0 to 8.0
  base_views := GREATEST(likes_count * random_multiplier, 50); -- Minimum 50 views
  
  -- Add some follower-based bonus views
  base_views := base_views + (follower_count * 0.02 * RANDOM()); -- 0-2% of followers as bonus views
  
  RETURN base_views::INTEGER;
END;
$$;

-- Update existing posts with realistic view counts
UPDATE posts 
SET views_count = generate_realistic_views(
  COALESCE((SELECT followers_count FROM profiles WHERE id = posts.user_id), 1000),
  likes_count
)
WHERE views_count = 0;

-- Create function to update views count
CREATE OR REPLACE FUNCTION update_views_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.posts 
  SET views_count = views_count + 1 
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

-- Create a post_views table to track individual views (optional, for analytics)
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for post_views
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_views
CREATE POLICY "Post views are viewable by post owner" 
  ON post_views FOR SELECT 
  USING (
    post_id IN (
      SELECT id FROM posts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert post views" 
  ON post_views FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_created_at ON post_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON posts(views_count DESC);

-- Update bot users with more realistic follower counts for better engagement calculation
UPDATE profiles 
SET followers_count = CASE 
  WHEN username = 'picpopper_fan1' THEN 15000 + (RANDOM() * 5000)::INTEGER
  WHEN username = 'content_lover' THEN 25000 + (RANDOM() * 10000)::INTEGER  
  WHEN username = 'aesthetic_queen' THEN 45000 + (RANDOM() * 15000)::INTEGER
  WHEN username = 'photo_enthusiast' THEN 35000 + (RANDOM() * 12000)::INTEGER
  WHEN username = 'trend_spotter' THEN 55000 + (RANDOM() * 20000)::INTEGER
  ELSE followers_count
END
WHERE is_bot = true;
