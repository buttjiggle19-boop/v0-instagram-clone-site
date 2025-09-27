-- Create bot users with realistic profiles
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
values 
  ('11111111-1111-1111-1111-111111111111', 'bot1@punsta.com', crypt('botpassword', gen_salt('bf')), now(), now(), now(), '{"username": "sarah_lifestyle", "full_name": "Sarah Johnson"}'),
  ('22222222-2222-2222-2222-222222222222', 'bot2@punsta.com', crypt('botpassword', gen_salt('bf')), now(), now(), now(), '{"username": "mike_adventures", "full_name": "Mike Chen"}'),
  ('33333333-3333-3333-3333-333333333333', 'bot3@punsta.com', crypt('botpassword', gen_salt('bf')), now(), now(), now(), '{"username": "emma_creative", "full_name": "Emma Rodriguez"}'),
  ('44444444-4444-4444-4444-444444444444', 'bot4@punsta.com', crypt('botpassword', gen_salt('bf')), now(), now(), now(), '{"username": "alex_fitness", "full_name": "Alex Thompson"}'),
  ('55555555-5555-5555-5555-555555555555', 'bot5@punsta.com', crypt('botpassword', gen_salt('bf')), now(), now(), now(), '{"username": "zoe_travel", "full_name": "Zoe Williams"}'),
  ('66666666-6666-6666-6666-666666666666', 'bot6@punsta.com', crypt('botpassword', gen_salt('bf')), now(), now(), now(), '{"username": "ryan_tech", "full_name": "Ryan Davis"}'),
  ('77777777-7777-7777-7777-777777777777', 'bot7@punsta.com', crypt('botpassword', gen_salt('bf')), now(), now(), now(), '{"username": "lily_fashion", "full_name": "Lily Martinez"}'),
  ('88888888-8888-8888-8888-888888888888', 'bot8@punsta.com', crypt('botpassword', gen_salt('bf')), now(), now(), now(), '{"username": "james_food", "full_name": "James Wilson"}'),
  ('99999999-9999-9999-9999-999999999999', 'bot9@punsta.com', crypt('botpassword', gen_salt('bf')), now(), now(), now(), '{"username": "maya_art", "full_name": "Maya Patel"}'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bot10@punsta.com', crypt('botpassword', gen_salt('bf')), now(), now(), now(), '{"username": "noah_music", "full_name": "Noah Brown"}');

-- Update bot profiles with realistic data
update public.profiles set 
  is_bot = true,
  bio = case username
    when 'sarah_lifestyle' then '✨ Living my best life | Coffee addict ☕ | Yoga enthusiast 🧘‍♀️'
    when 'mike_adventures' then '🏔️ Adventure seeker | Travel photographer 📸 | Always exploring'
    when 'emma_creative' then '🎨 Digital artist | Creative soul | Spreading good vibes ✨'
    when 'alex_fitness' then '💪 Fitness coach | Healthy living advocate | Transform your life'
    when 'zoe_travel' then '✈️ World traveler | 47 countries and counting | Wanderlust forever'
    when 'ryan_tech' then '👨‍💻 Tech enthusiast | Coding life | Building the future'
    when 'lily_fashion' then '👗 Fashion lover | Style inspiration | Vintage collector'
    when 'james_food' then '🍕 Food blogger | Chef at heart | Sharing delicious moments'
    when 'maya_art' then '🖼️ Contemporary artist | Gallery exhibitions | Art is life'
    when 'noah_music' then '🎵 Music producer | Sound engineer | Creating beats daily'
  end,
  avatar_url = case username
    when 'sarah_lifestyle' then '/placeholder.svg?height=150&width=150'
    when 'mike_adventures' then '/placeholder.svg?height=150&width=150'
    when 'emma_creative' then '/placeholder.svg?height=150&width=150'
    when 'alex_fitness' then '/placeholder.svg?height=150&width=150'
    when 'zoe_travel' then '/placeholder.svg?height=150&width=150'
    when 'ryan_tech' then '/placeholder.svg?height=150&width=150'
    when 'lily_fashion' then '/placeholder.svg?height=150&width=150'
    when 'james_food' then '/placeholder.svg?height=150&width=150'
    when 'maya_art' then '/placeholder.svg?height=150&width=150'
    when 'noah_music' then '/placeholder.svg?height=150&width=150'
  end
where is_bot = true;
