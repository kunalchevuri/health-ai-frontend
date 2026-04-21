-- Prevent duplicate check-ins on the same UTC calendar day.
-- Using a partial unique index on an expression avoids the need for a generated column.
-- Note: DATE(created_at) is evaluated in UTC; the client query uses local-midnight UTC
-- boundaries so the two always agree on which "day" a submission belongs to.
CREATE UNIQUE INDEX IF NOT EXISTS unique_daily_checkin_per_user
    ON daily_checkins (user_id, (created_at::date));
