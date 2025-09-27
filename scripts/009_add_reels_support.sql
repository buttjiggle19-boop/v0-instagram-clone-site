-- Add reels table for video content
CREATE TABLE IF NOT EXISTS reels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for reels
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reels are viewable by everyone" ON reels
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reels" ON reels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reels" ON reels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reels" ON reels
  FOR DELETE USING (auth.uid() = user_id);

-- Add reel likes table
CREATE TABLE IF NOT EXISTS reel_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reel_id UUID REFERENCES reels(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, reel_id)
);

ALTER TABLE reel_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reel likes are viewable by everyone" ON reel_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reel likes" ON reel_likes
  FOR ALL USING (auth.uid() = user_id);

-- Add reel comments table
CREATE TABLE IF NOT EXISTS reel_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reel_id UUID REFERENCES reels(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE reel_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reel comments are viewable by everyone" ON reel_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert reel comments" ON reel_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reel comments" ON reel_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reel comments" ON reel_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Add reel comment likes table
CREATE TABLE IF NOT EXISTS reel_comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES reel_comments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, comment_id)
);

ALTER TABLE reel_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reel comment likes are viewable by everyone" ON reel_comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reel comment likes" ON reel_comment_likes
  FOR ALL USING (auth.uid() = user_id);

-- Add reel shares table
CREATE TABLE IF NOT EXISTS reel_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reel_id UUID REFERENCES reels(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE reel_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reel shares are viewable by everyone" ON reel_shares
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reel shares" ON reel_shares
  FOR ALL USING (auth.uid() = user_id);

-- Update triggers for reels
CREATE OR REPLACE FUNCTION update_reel_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'reel_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE reels SET likes_count = likes_count + 1 WHERE id = NEW.reel_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE reels SET likes_count = likes_count - 1 WHERE id = OLD.reel_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'reel_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE reels SET comments_count = comments_count + 1 WHERE id = NEW.reel_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE reels SET comments_count = comments_count - 1 WHERE id = OLD.reel_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'reel_shares' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE reels SET shares_count = shares_count + 1 WHERE id = NEW.reel_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE reels SET shares_count = shares_count - 1 WHERE id = OLD.reel_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'reel_comment_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE reel_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE reel_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for reel counts
CREATE TRIGGER update_reel_likes_count
  AFTER INSERT OR DELETE ON reel_likes
  FOR EACH ROW EXECUTE FUNCTION update_reel_counts();

CREATE TRIGGER update_reel_comments_count
  AFTER INSERT OR DELETE ON reel_comments
  FOR EACH ROW EXECUTE FUNCTION update_reel_counts();

CREATE TRIGGER update_reel_shares_count
  AFTER INSERT OR DELETE ON reel_shares
  FOR EACH ROW EXECUTE FUNCTION update_reel_counts();

CREATE TRIGGER update_reel_comment_likes_count
  AFTER INSERT OR DELETE ON reel_comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_reel_counts();
