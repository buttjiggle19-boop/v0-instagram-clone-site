-- Fix the reels relationship issue and ensure bot engagement works
-- This script addresses the core issues preventing engagement

-- First, ensure the reels table references profiles correctly
ALTER TABLE reels DROP CONSTRAINT IF EXISTS reels_user_id_fkey;
ALTER TABLE reels ADD CONSTRAINT reels_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix all reel-related tables to reference profiles
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

-- Add is_bot column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE;

-- Create some bot users for engagement (only if they don't exist)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'bot1@picpopper.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false, 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'bot2@picpopper.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false, 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'bot3@picpopper.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false, 'authenticated'),
  ('44444444-4444-4444-4444-444444444444', 'bot4@picpopper.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false, 'authenticated'),
  ('55555555-5555-5555-5555-555555555555', 'bot5@picpopper.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false, 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Create bot profiles
INSERT INTO profiles (id, username, full_name, bio, avatar_url, is_bot, followers_count, following_count, posts_count)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'picpopper_fan1', 'Sarah Johnson', 'Love amazing content! 📸✨', '/placeholder.svg?height=150&width=150', true, 1250, 890, 45),
  ('22222222-2222-2222-2222-222222222222', 'content_lover', 'Mike Chen', 'Always here for the best posts! 🔥', '/placeholder.svg?height=150&width=150', true, 2100, 1200, 67),
  ('33333333-3333-3333-3333-333333333333', 'aesthetic_queen', 'Emma Davis', 'Aesthetic vibes only! 🌟💕', '/placeholder.svg?height=150&width=150', true, 3400, 1800, 89),
  ('44444444-4444-4444-4444-444444444444', 'photo_enthusiast', 'Alex Rivera', 'Photography is life! 📷🎨', '/placeholder.svg?height=150&width=150', true, 1890, 950, 123),
  ('55555555-5555-5555-5555-555555555555', 'trend_spotter', 'Zoe Kim', 'Spotting the best trends! 👀💯', '/placeholder.svg?height=150&width=150', true, 2750, 1450, 78)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_bot ON profiles(is_bot);
CREATE INDEX IF NOT EXISTS idx_reels_user_id ON reels(user_id);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON reels(created_at DESC);
