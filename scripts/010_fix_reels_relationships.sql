-- Fix reels table to reference profiles instead of auth.users
-- This ensures proper relationships for frontend queries

-- Drop existing foreign key constraint
ALTER TABLE reels DROP CONSTRAINT IF EXISTS reels_user_id_fkey;

-- Add new foreign key constraint to profiles
ALTER TABLE reels ADD CONSTRAINT reels_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update other reel-related tables to also reference profiles
ALTER TABLE reel_likes DROP CONSTRAINT IF EXISTS reel_likes_user_id_fkey;
ALTER TABLE reel_likes ADD CONSTRAINT reel_likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE reel_comments DROP CONSTRAINT IF EXISTS reel_comments_user_id_fkey;
ALTER TABLE reel_comments ADD CONSTRAINT reel_comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE reel_comment_likes DROP CONSTRAINT IF EXISTS reel_comment_likes_user_id_fkey;
ALTER TABLE reel_comment_likes ADD CONSTRAINT reel_comment_likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE reel_shares DROP CONSTRAINT IF EXISTS reel_shares_user_id_fkey;
ALTER TABLE reel_shares ADD CONSTRAINT reel_shares_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reels_user_id ON reels(user_id);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON reels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reel_likes_reel_id ON reel_likes(reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_comments_reel_id ON reel_comments(reel_id);
