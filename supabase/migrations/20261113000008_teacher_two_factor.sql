-- ============================================================================
-- Migration 008: Teacher Two-Factor Authentication & Recovery
-- Description: Stores TOTP secrets and recovery keys securely per faculty account
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.teacher_two_factor (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  totp_secret TEXT NOT NULL,
  totp_enabled BOOLEAN NOT NULL DEFAULT false,
  recovery_codes TEXT[] NOT NULL DEFAULT '{}',
  last_verified_step BIGINT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for rapid lookups
CREATE INDEX IF NOT EXISTS idx_teacher_two_factor_email ON public.teacher_two_factor(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.teacher_two_factor ENABLE ROW LEVEL SECURITY;

-- Policy: Faculty can only read and manage their own 2FA credentials
CREATE POLICY "Users can view their own 2FA status"
  ON public.teacher_two_factor
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA status"
  ON public.teacher_two_factor
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 2FA status"
  ON public.teacher_two_factor
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_teacher_two_factor_updated_at ON public.teacher_two_factor;
CREATE TRIGGER trg_teacher_two_factor_updated_at
  BEFORE UPDATE ON public.teacher_two_factor
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();
