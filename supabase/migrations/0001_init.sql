-- Enable required extensions
create extension if not exists pgcrypto;

-- Create base tables needed by the app
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  content text,
  created_at timestamptz default now()
);

-- Enable realtime on messages (if replication publication exists)
-- Note: In Supabase dashboard, also enable Realtime for this table.
