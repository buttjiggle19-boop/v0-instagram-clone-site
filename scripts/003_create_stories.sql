-- Create stories table
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  caption text,
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '24 hours') not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for stories
alter table public.stories enable row level security;

-- RLS policies for stories
create policy "Active stories are viewable by everyone" 
  on public.stories for select 
  using (expires_at > timezone('utc'::text, now()));

create policy "Users can insert their own stories" 
  on public.stories for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own stories" 
  on public.stories for delete 
  using (auth.uid() = user_id);

-- Create story views table
create table if not exists public.story_views (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(story_id, user_id)
);

-- Enable RLS for story views
alter table public.story_views enable row level security;

-- RLS policies for story views
create policy "Story views are viewable by story owner" 
  on public.story_views for select 
  using (
    exists (
      select 1 from public.stories 
      where stories.id = story_views.story_id 
      and stories.user_id = auth.uid()
    )
  );

create policy "Users can insert their own story views" 
  on public.story_views for insert 
  with check (auth.uid() = user_id);
