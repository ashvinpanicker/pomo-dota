-- =============================================
-- Migration 002: Dota 2 GSI auto-tracking
-- Run this in Supabase SQL Editor
-- =============================================

-- Add GSI token and played counter to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gsi_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS dota_games_played INTEGER NOT NULL DEFAULT 0;

-- Seed played count from existing manual redeems
UPDATE public.profiles
  SET dota_games_played = dota_games_redeemed
  WHERE dota_games_played = 0 AND dota_games_redeemed > 0;

-- Make gsi_token unique so we can look up users by token
CREATE UNIQUE INDEX IF NOT EXISTS profiles_gsi_token_idx ON public.profiles(gsi_token);

-- ─────────────────────────────────────────────
-- Dota game session tracking table
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

CREATE INDEX IF NOT EXISTS dota_sessions_user_id_idx ON public.dota_sessions(user_id);
CREATE INDEX IF NOT EXISTS dota_sessions_match_id_idx ON public.dota_sessions(match_id);

-- RLS
ALTER TABLE public.dota_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dota sessions"
  ON dota_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dota sessions"
  ON dota_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dota sessions"
  ON dota_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- The GSI API route uses service role key so it bypasses RLS — no extra policy needed.
