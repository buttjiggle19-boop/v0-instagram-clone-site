-- Create likes table
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- Enable RLS for likes
alter table public.likes enable row level security;

-- RLS policies for likes
create policy "Likes are viewable by everyone" 
  on public.likes for select 
  using (true);

create policy "Users can insert their own likes" 
  on public.likes for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes" 
  on public.likes for delete 
  using (auth.uid() = user_id);

-- Create comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for comments
alter table public.comments enable row level security;

-- RLS policies for comments
create policy "Comments are viewable by everyone" 
  on public.comments for select 
  using (true);

create policy "Users can insert their own comments" 
  on public.comments for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own comments" 
  on public.comments for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own comments" 
  on public.comments for delete 
  using (auth.uid() = user_id);

-- Create follows table
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- Enable RLS for follows
alter table public.follows enable row level security;

-- RLS policies for follows
create policy "Follows are viewable by everyone" 
  on public.follows for select 
  using (true);

create policy "Users can insert their own follows" 
  on public.follows for insert 
  with check (auth.uid() = follower_id);

create policy "Users can delete their own follows" 
  on public.follows for delete 
  using (auth.uid() = follower_id);
