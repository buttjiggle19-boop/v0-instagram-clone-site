-- Enhanced user signup function with bot followers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  random_followers integer;
  bot_ids uuid[];
  bot_id uuid;
  num_bot_followers integer;
begin
  -- Create user profile
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );

  -- Generate random follower count between 172K and 6.2M
  random_followers := floor(random() * (6200000 - 172000 + 1) + 172000);
  
  -- Update the user's follower count
  update public.profiles 
  set followers_count = random_followers 
  where id = new.id;

  -- Get all bot IDs
  select array_agg(id) into bot_ids 
  from public.profiles 
  where is_bot = true;

  -- Determine how many bots should follow this user (3-8 bots)
  num_bot_followers := floor(random() * 6 + 3);

  -- Make random bots follow the new user
  for i in 1..least(num_bot_followers, array_length(bot_ids, 1)) loop
    bot_id := bot_ids[floor(random() * array_length(bot_ids, 1) + 1)];
    
    -- Insert follow relationship (bot follows user)
    insert into public.follows (follower_id, following_id)
    values (bot_id, new.id)
    on conflict (follower_id, following_id) do nothing;
  end loop;

  return new;
end;
$$;
