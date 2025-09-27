-- Create bot profiles and engagement system
-- Add is_bot column to profiles
alter table public.profiles add column if not exists is_bot boolean default false;

-- Create comment likes table for comment engagement
create table if not exists public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, comment_id)
);

-- Enable RLS for comment likes
alter table public.comment_likes enable row level security;

-- RLS policies for comment likes
create policy "Comment likes are viewable by everyone" 
  on public.comment_likes for select 
  using (true);

create policy "Users can insert their own comment likes" 
  on public.comment_likes for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own comment likes" 
  on public.comment_likes for delete 
  using (auth.uid() = user_id);

-- Add likes_count to comments table
alter table public.comments add column if not exists likes_count integer default 0;

-- Function to update comment likes count
create or replace function public.update_comment_likes_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.comments 
    set likes_count = likes_count + 1 
    where id = NEW.comment_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.comments 
    set likes_count = likes_count - 1 
    where id = OLD.comment_id;
    return OLD;
  end if;
  return null;
end;
$$;

-- Trigger for comment likes count
drop trigger if exists comment_likes_count_trigger on public.comment_likes;
create trigger comment_likes_count_trigger
  after insert or delete on public.comment_likes
  for each row
  execute function public.update_comment_likes_count();
