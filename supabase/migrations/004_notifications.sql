-- Notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_reminder_enabled BOOLEAN DEFAULT true,
  class_first_reminder_minutes INTEGER DEFAULT 120,
  class_second_reminder_minutes INTEGER DEFAULT 5,
  task_reminder_enabled BOOLEAN DEFAULT true,
  task_first_reminder_minutes INTEGER DEFAULT 1440,
  task_second_reminder_minutes INTEGER DEFAULT 120,
  task_deadline_reminder BOOLEAN DEFAULT true,
  group_reminder_enabled BOOLEAN DEFAULT true,
  group_day_before BOOLEAN DEFAULT true,
  group_day_of BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_name TEXT DEFAULT 'Unknown Device',
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Notification jobs queue
CREATE TABLE notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('class', 'task', 'group')),
  source_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
  idempotency_key TEXT UNIQUE NOT NULL,
  sent_at TIMESTAMPTZ,
  payload JSONB DEFAULT '{}',
  action_url TEXT DEFAULT '/',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notification logs
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES notification_jobs(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('delivered', 'failed', 'expired')),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  action_url TEXT DEFAULT '/'
);

-- Indexes
CREATE INDEX idx_nj_scheduled ON notification_jobs(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_nj_user ON notification_jobs(user_id);
CREATE INDEX idx_nj_source ON notification_jobs(source_type, source_id);
CREATE INDEX idx_nl_user ON notification_logs(user_id);
CREATE INDEX idx_nl_read ON notification_logs(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_ps_user ON push_subscriptions(user_id);

-- RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON push_subscriptions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notification jobs" ON notification_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notification logs" ON notification_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notification logs" ON notification_logs FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for auto-creating profile on signup (now that notification_preferences exists)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function: Create notification jobs for a task
CREATE OR REPLACE FUNCTION create_task_notification_jobs()
RETURNS TRIGGER AS $$
DECLARE
  v_prefs notification_preferences%ROWTYPE;
BEGIN
  -- Only create jobs if task has a deadline and is not done
  IF NEW.deadline IS NULL OR NEW.status = 'done' THEN
    RETURN NEW;
  END IF;

  -- Get user preferences
  SELECT * INTO v_prefs FROM notification_preferences WHERE user_id = NEW.user_id;
  
  IF v_prefs IS NULL OR NOT v_prefs.task_reminder_enabled THEN
    RETURN NEW;
  END IF;

  -- Cancel any existing pending jobs for this task
  UPDATE notification_jobs 
  SET status = 'cancelled' 
  WHERE source_type = 'task' AND source_id = NEW.id AND status = 'pending';

  -- 1 day before deadline
  IF NEW.deadline - INTERVAL '1 day' > now() THEN
    INSERT INTO notification_jobs (user_id, source_type, source_id, notification_type, title, body, scheduled_at, idempotency_key, action_url)
    VALUES (
      NEW.user_id, 'task', NEW.id, 'task_1day',
      'Deadline Besok!',
      'Tugas "' || NEW.title || '" deadline besok ' || to_char(NEW.deadline AT TIME ZONE COALESCE(v_prefs.timezone, 'Asia/Jakarta'), 'HH24:MI') || '.',
      NEW.deadline - INTERVAL '1 day',
      'task_' || NEW.id || '_1day_' || NEW.deadline::text,
      '/tasks'
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  -- 2 hours before deadline
  IF NEW.deadline - INTERVAL '2 hours' > now() THEN
    INSERT INTO notification_jobs (user_id, source_type, source_id, notification_type, title, body, scheduled_at, idempotency_key, action_url)
    VALUES (
      NEW.user_id, 'task', NEW.id, 'task_2hr',
      'Deadline 2 Jam Lagi!',
      'Tugas "' || NEW.title || '" deadline pukul ' || to_char(NEW.deadline AT TIME ZONE COALESCE(v_prefs.timezone, 'Asia/Jakarta'), 'HH24:MI') || '.',
      NEW.deadline - INTERVAL '2 hours',
      'task_' || NEW.id || '_2hr_' || NEW.deadline::text,
      '/tasks'
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  -- At deadline
  IF NEW.deadline > now() THEN
    INSERT INTO notification_jobs (user_id, source_type, source_id, notification_type, title, body, scheduled_at, idempotency_key, action_url)
    VALUES (
      NEW.user_id, 'task', NEW.id, 'task_deadline',
      'Deadline Sekarang!',
      'Tugas "' || NEW.title || '" sudah mencapai deadline!',
      NEW.deadline,
      'task_' || NEW.id || '_deadline_' || NEW.deadline::text,
      '/tasks'
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_notification_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION create_task_notification_jobs();

-- Cancel task notifications when task is marked done
CREATE OR REPLACE FUNCTION cancel_done_task_notifications()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS NULL OR OLD.status != 'done') THEN
    UPDATE notification_jobs 
    SET status = 'cancelled' 
    WHERE source_type = 'task' AND source_id = NEW.id AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_done_cancel_notifications
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION cancel_done_task_notifications();

-- Process due notification jobs (called by pg_cron)
CREATE OR REPLACE FUNCTION process_due_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Mark due jobs for processing with row-level locking
  UPDATE notification_jobs
  SET status = 'sent', sent_at = now()
  WHERE id IN (
    SELECT id FROM notification_jobs
    WHERE status = 'pending'
    AND scheduled_at <= now()
    ORDER BY scheduled_at
    LIMIT 100
    FOR UPDATE SKIP LOCKED
  );
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
