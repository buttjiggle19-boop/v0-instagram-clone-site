-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update post counts
create or replace function public.update_posts_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles 
    set posts_count = posts_count + 1 
    where id = NEW.user_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.profiles 
    set posts_count = posts_count - 1 
    where id = OLD.user_id;
    return OLD;
  end if;
  return null;
end;
$$;

-- Triggers for post counts
drop trigger if exists posts_count_trigger on public.posts;
create trigger posts_count_trigger
  after insert or delete on public.posts
  for each row
  execute function public.update_posts_count();

-- Function to update likes count
create or replace function public.update_likes_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts 
    set likes_count = likes_count + 1 
    where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.posts 
    set likes_count = likes_count - 1 
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$;

-- Triggers for likes count
drop trigger if exists likes_count_trigger on public.likes;
create trigger likes_count_trigger
  after insert or delete on public.likes
  for each row
  execute function public.update_likes_count();

-- Function to update comments count
create or replace function public.update_comments_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts 
    set comments_count = comments_count + 1 
    where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.posts 
    set comments_count = comments_count - 1 
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$;

-- Triggers for comments count
drop trigger if exists comments_count_trigger on public.comments;
create trigger comments_count_trigger
  after insert or delete on public.comments
  for each row
  execute function public.update_comments_count();

-- Function to update followers/following counts
create or replace function public.update_follow_counts()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    -- Increase follower count for the user being followed
    update public.profiles 
    set followers_count = followers_count + 1 
    where id = NEW.following_id;
    
    -- Increase following count for the user doing the following
    update public.profiles 
    set following_count = following_count + 1 
    where id = NEW.follower_id;
    
    return NEW;
  elsif TG_OP = 'DELETE' then
    -- Decrease follower count for the user being unfollowed
    update public.profiles 
    set followers_count = followers_count - 1 
    where id = OLD.following_id;
    
    -- Decrease following count for the user doing the unfollowing
    update public.profiles 
    set following_count = following_count - 1 
    where id = OLD.follower_id;
    
    return OLD;
  end if;
  return null;
end;
$$;

-- Triggers for follow counts
drop trigger if exists follow_counts_trigger on public.follows;
create trigger follow_counts_trigger
  after insert or delete on public.follows
  for each row
  execute function public.update_follow_counts();
