-- =============================================
-- Seed: Credit 4 hours of Clockify work (8 × 30-min Pomodoros)
--       + mark 1 game as played (balance = 3)
--
-- HOW TO RUN:
--   1. First run 002_add_dota_tracking.sql (if not done yet)
--   2. Go to Supabase Dashboard → SQL Editor → New query
--   3. Paste this entire file and click Run
-- =============================================

-- ─── Step 1: Run migration 002 (idempotent — safe to run again) ──────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gsi_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS dota_games_played INTEGER NOT NULL DEFAULT 0;

UPDATE public.profiles
  SET dota_games_played = dota_games_redeemed
  WHERE dota_games_played = 0 AND dota_games_redeemed > 0;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_gsi_token_idx ON public.profiles(gsi_token);

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

ALTER TABLE public.dota_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dota_sessions' AND policyname = 'Users can view own dota sessions'
  ) THEN
    CREATE POLICY "Users can view own dota sessions"
      ON dota_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dota_sessions' AND policyname = 'Users can insert own dota sessions'
  ) THEN
    CREATE POLICY "Users can insert own dota sessions"
      ON dota_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dota_sessions' AND policyname = 'Users can update own dota sessions'
  ) THEN
    CREATE POLICY "Users can update own dota sessions"
      ON dota_sessions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;


-- ─── Step 2: Seed 8 completed Pomodoros + update profile ─────────────────────
DO $$
DECLARE
  v_user_id          UUID;
  v_current_pomodoros INTEGER;
  v_current_xp        INTEGER;
  v_current_longest   INTEGER;
  v_new_pomodoros     INTEGER;
  v_new_xp            INTEGER;
  v_new_games_earned  INTEGER;
  v_new_level         INTEGER;
  v_new_streak        INTEGER := 1;
BEGIN
  -- Find the user (only user, or filter by email if needed)
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found — make sure you have signed in at least once.';
  END IF;

  -- Get current profile stats
  SELECT pomodoros_completed, total_xp, longest_streak
  INTO v_current_pomodoros, v_current_xp, v_current_longest
  FROM public.profiles
  WHERE id = v_user_id;

  -- Calculate new values
  -- 8 sessions × 50 XP = 400 XP added (no streak bonus for historical seeding)
  v_new_pomodoros    := v_current_pomodoros + 8;
  v_new_xp           := v_current_xp + 400;
  v_new_games_earned := FLOOR(v_new_pomodoros::numeric / 2);
  v_new_level        := FLOOR(v_new_xp::numeric / 500) + 1;
  v_new_streak       := GREATEST(1, v_current_longest);

  -- Insert 8 × 30-min "Deep Work" sessions spread across today (UTC)
  -- Adjust the timestamps below if you want a different timezone offset
  INSERT INTO public.sessions
    (id, user_id, label, duration, notes, completed, started_at, completed_at, xp_earned)
  VALUES
    (gen_random_uuid(), v_user_id, 'Deep Work', 30, 'Clockify work', true, '2026-04-08T09:00:00Z', '2026-04-08T09:30:00Z', 50),
    (gen_random_uuid(), v_user_id, 'Deep Work', 30, 'Clockify work', true, '2026-04-08T09:35:00Z', '2026-04-08T10:05:00Z', 50),
    (gen_random_uuid(), v_user_id, 'Deep Work', 30, 'Clockify work', true, '2026-04-08T10:10:00Z', '2026-04-08T10:40:00Z', 50),
    (gen_random_uuid(), v_user_id, 'Deep Work', 30, 'Clockify work', true, '2026-04-08T10:45:00Z', '2026-04-08T11:15:00Z', 50),
    (gen_random_uuid(), v_user_id, 'Deep Work', 30, 'Clockify work', true, '2026-04-08T11:20:00Z', '2026-04-08T11:50:00Z', 50),
    (gen_random_uuid(), v_user_id, 'Deep Work', 30, 'Clockify work', true, '2026-04-08T12:30:00Z', '2026-04-08T13:00:00Z', 50),
    (gen_random_uuid(), v_user_id, 'Deep Work', 30, 'Clockify work', true, '2026-04-08T13:05:00Z', '2026-04-08T13:35:00Z', 50),
    (gen_random_uuid(), v_user_id, 'Deep Work', 30, 'Clockify work', true, '2026-04-08T14:00:00Z', '2026-04-08T14:30:00Z', 50);

  -- Update profile with new totals
  UPDATE public.profiles
  SET
    pomodoros_completed = v_new_pomodoros,
    total_xp            = v_new_xp,
    dota_games_earned   = v_new_games_earned,
    dota_games_played   = 1,          -- 1 game spent
    current_streak      = v_new_streak,
    longest_streak      = GREATEST(v_current_longest, v_new_streak),
    last_active_date    = '2026-04-08',
    level               = v_new_level,
    updated_at          = NOW()
  WHERE id = v_user_id;

  RAISE NOTICE '✅ Done! User: %', v_user_id;
  RAISE NOTICE '   Pomodoros: % → %', v_current_pomodoros, v_new_pomodoros;
  RAISE NOTICE '   XP: % → %  (level %)', v_current_xp, v_new_xp, v_new_level;
  RAISE NOTICE '   Games earned: %  |  played: 1  |  balance: %',
    v_new_games_earned, v_new_games_earned - 1;
END $$;
