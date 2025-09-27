-- Create profiles table that extends Supabase auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  bio text,
  avatar_url text,
  website text,
  is_private boolean default false,
  followers_count integer default 0,
  following_count integer default 0,
  posts_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS policies for profiles
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Create posts table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caption text,
  image_url text not null,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for posts
alter table public.posts enable row level security;

-- RLS policies for posts
create policy "Posts are viewable by everyone" 
  on public.posts for select 
  using (true);

create policy "Users can insert their own posts" 
  on public.posts for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own posts" 
  on public.posts for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own posts" 
  on public.posts for delete 
  using (auth.uid() = user_id);
