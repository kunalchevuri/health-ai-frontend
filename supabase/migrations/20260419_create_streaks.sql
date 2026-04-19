CREATE TABLE IF NOT EXISTS streaks (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak       INT  NOT NULL DEFAULT 1,
  best_streak          INT  NOT NULL DEFAULT 1,
  last_submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);

-- Row-level security: each user can only read/write their own row
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "streaks_select_own" ON streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "streaks_insert_own" ON streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "streaks_update_own" ON streaks
  FOR UPDATE USING (auth.uid() = user_id);
