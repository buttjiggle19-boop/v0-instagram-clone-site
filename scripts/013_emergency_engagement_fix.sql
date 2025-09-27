-- Emergency fix: Create bot users and add immediate engagement to existing posts

-- First, ensure we have bot users
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'bot1@picpopper.com', NOW(), NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'bot2@picpopper.com', NOW(), NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'bot3@picpopper.com', NOW(), NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'bot4@picpopper.com', NOW(), NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'bot5@picpopper.com', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create profiles for bot users
INSERT INTO profiles (id, username, full_name, bio, avatar_url, followers_count, following_count)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'sarah_lifestyle', 'Sarah Johnson', 'Lifestyle & Fashion ✨', '/placeholder.svg?height=150&width=150', 45000, 1200),
  ('22222222-2222-2222-2222-222222222222', 'mike_fitness', 'Mike Rodriguez', 'Fitness Coach 💪', '/placeholder.svg?height=150&width=150', 32000, 800),
  ('33333333-3333-3333-3333-333333333333', 'emma_foodie', 'Emma Chen', 'Food Blogger 🍕', '/placeholder.svg?height=150&width=150', 28000, 950),
  ('44444444-4444-4444-4444-444444444444', 'alex_travel', 'Alex Thompson', 'Travel Photographer 📸', '/placeholder.svg?height=150&width=150', 67000, 2100),
  ('55555555-5555-5555-5555-555555555555', 'luna_art', 'Luna Martinez', 'Digital Artist 🎨', '/placeholder.svg?height=150&width=150', 19000, 600)
ON CONFLICT (id) DO NOTHING;

-- Add immediate engagement to ALL existing posts
DO $$
DECLARE
    post_record RECORD;
    bot_ids UUID[] := ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222', 
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555'
    ];
    bot_id UUID;
    like_count INTEGER;
    comment_count INTEGER;
    view_count INTEGER;
    i INTEGER;
BEGIN
    -- Loop through all posts
    FOR post_record IN SELECT id, user_id FROM posts LOOP
        -- Calculate realistic engagement (30-60% like rate, 8-15% comment rate)
        like_count := 25 + (RANDOM() * 50)::INTEGER;
        comment_count := 8 + (RANDOM() * 12)::INTEGER;
        view_count := like_count * (3 + (RANDOM() * 5)::INTEGER);
        
        -- Add likes from random bot users
        FOR i IN 1..like_count LOOP
            bot_id := bot_ids[1 + (RANDOM() * 4)::INTEGER];
            INSERT INTO likes (user_id, post_id, created_at)
            VALUES (bot_id, post_record.id, NOW() - (RANDOM() * INTERVAL '1 hour'))
            ON CONFLICT (user_id, post_id) DO NOTHING;
        END LOOP;
        
        -- Add comments from random bot users
        FOR i IN 1..comment_count LOOP
            bot_id := bot_ids[1 + (RANDOM() * 4)::INTEGER];
            INSERT INTO comments (user_id, post_id, content, created_at)
            VALUES (
                bot_id, 
                post_record.id, 
                CASE (RANDOM() * 10)::INTEGER
                    WHEN 0 THEN 'Amazing! 🔥'
                    WHEN 1 THEN 'Love this! ❤️'
                    WHEN 2 THEN 'So cool! 😍'
                    WHEN 3 THEN 'Incredible shot! 📸'
                    WHEN 4 THEN 'This is perfect! ✨'
                    WHEN 5 THEN 'Wow! 🤩'
                    WHEN 6 THEN 'Beautiful! 💫'
                    WHEN 7 THEN 'Stunning! 🌟'
                    WHEN 8 THEN 'Goals! 💯'
                    ELSE 'Epic! 🚀'
                END,
                NOW() - (RANDOM() * INTERVAL '1 hour')
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        -- Update post with view count
        UPDATE posts 
        SET views_count = view_count
        WHERE id = post_record.id;
        
    END LOOP;
END $$;

-- Refresh all materialized views and update counts
REFRESH MATERIALIZED VIEW CONCURRENTLY post_stats;
