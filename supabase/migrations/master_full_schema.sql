-- ====================================================================
-- SI-ACAD — MASTER DATABASE SCHEMA & MIGRATIONS (SUPABASE)
-- Salin seluruh isi query ini dan tempel di Supabase SQL Editor, lalu klik RUN.
-- Menjamin pendaftaran user tidak akan error "Database error saving new user".
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Izin Skema Public
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- ====================================================================
-- 2. TABEL PROFIL, SEMESTER, MATA KULIAH & JADWAL KULIAH
-- ====================================================================

-- Tabel Profil Pengguna (relasi 1-to-1 dengan auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  university TEXT DEFAULT 'Fakultas Teknik',
  major TEXT DEFAULT 'Teknik Informatika',
  student_id TEXT DEFAULT '',
  timezone TEXT DEFAULT 'Asia/Jakarta',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Multi-Semester
CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Mata Kuliah
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT DEFAULT '',
  lecturer TEXT DEFAULT '',
  credits INTEGER DEFAULT 0,
  room TEXT DEFAULT '',
  color TEXT DEFAULT '#7C9A76',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Jadwal Kuliah Mingguan
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  is_cancelled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 3. TABEL TUGAS & CATATAN AKADEMIK (MODUL 1)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  deadline TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- ====================================================================
-- 4. TABEL GROUP PLANNER & ROTASI KELOMPOK (MODUL 2)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_rotation_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  rotation_order INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.group_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  rotation_slot_id UUID REFERENCES public.group_rotation_slots(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  event_type TEXT DEFAULT 'presentation',
  event_date TIMESTAMPTZ NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 5. TABEL PENGINGAT CERDAS & WEB PUSH (MODUL 3)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
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

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_name TEXT DEFAULT 'Browser Web',
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

CREATE TABLE IF NOT EXISTS public.notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('class', 'task', 'group')),
  source_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'cancelled', 'failed')),
  idempotency_key TEXT UNIQUE NOT NULL,
  sent_at TIMESTAMPTZ,
  payload JSONB DEFAULT '{}',
  action_url TEXT DEFAULT '/',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.notification_jobs(id) ON DELETE SET NULL,
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

-- ====================================================================
-- 6. AMAN DARI ERROR: TRIGGER AUTO PROFIL SAAT USER MENDAFTAR
-- ====================================================================

-- Fungsi ini dirancang dengan EXCEPTION handling agar registrasi user TIDAK PERNAH gagal
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Buat data profil
  BEGIN
    INSERT INTO public.profiles (id, full_name, student_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Mahasiswa Baru'),
      COALESCE(NEW.raw_user_meta_data->>'student_id', '')
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Abaikan jika tabel profil sedang dikunci/belum siap
    NULL;
  END;

  -- 2. Buat preferensi notifikasi default
  BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang Trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_rotation_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles viewable by user" ON public.profiles;
CREATE POLICY "Profiles viewable by user" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Profiles updateable by owner" ON public.profiles;
CREATE POLICY "Profiles updateable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Profiles insertable by owner" ON public.profiles;
CREATE POLICY "Profiles insertable by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Semesters Policies
DROP POLICY IF EXISTS "Semesters policy" ON public.semesters;
CREATE POLICY "Semesters policy" ON public.semesters FOR ALL USING (auth.uid() = user_id);

-- Courses Policies
DROP POLICY IF EXISTS "Courses policy" ON public.courses;
CREATE POLICY "Courses policy" ON public.courses FOR ALL USING (auth.uid() = user_id);

-- Schedules Policies
DROP POLICY IF EXISTS "Schedules policy" ON public.schedules;
CREATE POLICY "Schedules policy" ON public.schedules FOR ALL USING (auth.uid() = user_id);

-- Tasks Policies
DROP POLICY IF EXISTS "Tasks policy" ON public.tasks;
CREATE POLICY "Tasks policy" ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- Study Groups Policies
DROP POLICY IF EXISTS "Groups viewable by members" ON public.study_groups;
CREATE POLICY "Groups viewable by members" ON public.study_groups FOR SELECT USING (
  owner_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.study_group_members WHERE group_id = id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "Groups insertable by auth users" ON public.study_groups;
CREATE POLICY "Groups insertable by auth users" ON public.study_groups FOR INSERT WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Groups updateable by owner" ON public.study_groups;
CREATE POLICY "Groups updateable by owner" ON public.study_groups FOR UPDATE USING (auth.uid() = owner_id);

-- Study Group Members Policies
DROP POLICY IF EXISTS "Group members policy" ON public.study_group_members;
CREATE POLICY "Group members policy" ON public.study_group_members FOR ALL USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.study_groups WHERE id = group_id AND owner_id = auth.uid())
);

-- Rotation Slots Policies
DROP POLICY IF EXISTS "Rotation slots policy" ON public.group_rotation_slots;
CREATE POLICY "Rotation slots policy" ON public.group_rotation_slots FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.study_group_members WHERE group_id = group_rotation_slots.group_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.study_groups WHERE id = group_rotation_slots.group_id AND owner_id = auth.uid()
  )
);

-- Group Events Policies
DROP POLICY IF EXISTS "Group events policy" ON public.group_events;
CREATE POLICY "Group events policy" ON public.group_events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.study_group_members WHERE group_id = group_events.group_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.study_groups WHERE id = group_events.group_id AND owner_id = auth.uid()
  )
);

-- Notification Preferences Policies
DROP POLICY IF EXISTS "Notification prefs policy" ON public.notification_preferences;
CREATE POLICY "Notification prefs policy" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);

-- Notification Logs Policies
DROP POLICY IF EXISTS "Notification logs policy" ON public.notification_logs;
CREATE POLICY "Notification logs policy" ON public.notification_logs FOR ALL USING (auth.uid() = user_id);

-- Push Subscriptions Policies
DROP POLICY IF EXISTS "Push subscriptions policy" ON public.push_subscriptions;
CREATE POLICY "Push subscriptions policy" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Izin Akses Tabel ke Authenticated Users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
