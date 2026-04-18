-- =============================================
-- PomoDota Database Schema — FULL SETUP
-- Safe to run multiple times (idempotent)
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- ─────────────────────────────────────────────
-- 1. PROFILES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username             TEXT,
  avatar_url           TEXT,
  total_xp             INTEGER NOT NULL DEFAULT 0,
  level                INTEGER NOT NULL DEFAULT 1,
  current_streak       INTEGER NOT NULL DEFAULT 0,
  longest_streak       INTEGER NOT NULL DEFAULT 0,
  last_active_date     DATE,
  pomodoros_completed  INTEGER NOT NULL DEFAULT 0,
  dota_games_earned    INTEGER NOT NULL DEFAULT 0,
  dota_games_redeemed  INTEGER NOT NULL DEFAULT 0,
  dota_games_played    INTEGER NOT NULL DEFAULT 0,
  gsi_token            UUID DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add columns if they don't exist yet (safe for existing installs)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dota_games_played INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gsi_token UUID DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS profiles_gsi_token_idx ON public.profiles(gsi_token);

-- ─────────────────────────────────────────────
-- 2. SESSIONS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label        TEXT NOT NULL DEFAULT 'Work',
  duration     INTEGER NOT NULL DEFAULT 25,
  notes        TEXT,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  xp_earned    INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS paused_remaining_seconds INTEGER;

CREATE INDEX IF NOT EXISTS sessions_user_id_idx           ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_started_at_idx        ON public.sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS sessions_user_completed_idx    ON public.sessions(user_id, completed, started_at DESC);

-- ─────────────────────────────────────────────
-- 3. ACHIEVEMENTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON public.achievements(user_id);

-- ─────────────────────────────────────────────
-- 4. DOTA SESSIONS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dota_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id         TEXT,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at         TIMESTAMPTZ,
  duration_minutes INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dota_sessions_user_id_idx  ON public.dota_sessions(user_id);
CREATE INDEX IF NOT EXISTS dota_sessions_match_id_idx ON public.dota_sessions(match_id);

-- ─────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dota_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can view own profile') THEN
    CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Sessions policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sessions' AND policyname='Users can view own sessions') THEN
    CREATE POLICY "Users can view own sessions"   ON sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sessions' AND policyname='Users can insert own sessions') THEN
    CREATE POLICY "Users can insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sessions' AND policyname='Users can update own sessions') THEN
    CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Achievements policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='achievements' AND policyname='Users can view own achievements') THEN
    CREATE POLICY "Users can view own achievements"   ON achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='achievements' AND policyname='Users can insert own achievements') THEN
    CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Dota sessions policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dota_sessions' AND policyname='Users can view own dota sessions') THEN
    CREATE POLICY "Users can view own dota sessions"   ON dota_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dota_sessions' AND policyname='Users can insert own dota sessions') THEN
    CREATE POLICY "Users can insert own dota sessions" ON dota_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dota_sessions' AND policyname='Users can update own dota sessions') THEN
    CREATE POLICY "Users can update own dota sessions" ON dota_sessions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 6. AUTO-CREATE PROFILE ON SIGN-UP
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- 7. UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─────────────────────────────────────────────
-- 8. CREATE PROFILE FOR EXISTING USERS
-- (in case you signed up before running this)
-- ─────────────────────────────────────────────
INSERT INTO public.profiles (id, username, avatar_url)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
