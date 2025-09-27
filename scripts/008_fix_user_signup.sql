-- Fix user signup issues and ensure proper bot system integration

-- First, ensure the is_bot column exists
alter table public.profiles add column if not exists is_bot boolean default false;

-- Drop the existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create or replace the handle_new_user function with better error handling
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
  username_value text;
  full_name_value text;
begin
  -- Extract username and full_name from metadata
  username_value := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));
  full_name_value := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));
  
  -- Create user profile with error handling
  begin
    insert into public.profiles (id, username, full_name, is_bot)
    values (new.id, username_value, full_name_value, false);
  exception when others then
    -- If insert fails, try to update existing profile
    update public.profiles 
    set username = username_value, 
        full_name = full_name_value,
        is_bot = false
    where id = new.id;
  end;

  -- Generate random follower count between 172K and 6.2M
  random_followers := floor(random() * (6200000 - 172000 + 1) + 172000);
  
  -- Update the user's follower count
  update public.profiles 
  set followers_count = random_followers 
  where id = new.id;

  -- Get bot IDs (only if bots exist)
  select array_agg(id) into bot_ids 
  from public.profiles 
  where is_bot = true
  limit 50; -- Limit to prevent performance issues

  -- Only proceed if we have bots
  if bot_ids is not null and array_length(bot_ids, 1) > 0 then
    -- Determine how many bots should follow this user (3-8 bots)
    num_bot_followers := floor(random() * 6 + 3);

    -- Make random bots follow the new user
    for i in 1..least(num_bot_followers, array_length(bot_ids, 1)) loop
      bot_id := bot_ids[floor(random() * array_length(bot_ids, 1) + 1)];
      
      -- Insert follow relationship (bot follows user) with error handling
      begin
        insert into public.follows (follower_id, following_id)
        values (bot_id, new.id)
        on conflict (follower_id, following_id) do nothing;
      exception when others then
        -- Skip this bot if there's an error
        continue;
      end;
    end loop;
  end if;

  return new;
exception when others then
  -- If anything fails, still return new to allow user creation
  return new;
end;
$$;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.profiles to anon, authenticated;
grant all on public.follows to anon, authenticated;
