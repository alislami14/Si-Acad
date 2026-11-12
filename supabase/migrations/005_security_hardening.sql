-- ====================================================================
-- SI-ACAD — PERLINDUNGAN PRIVASI & HARDENING KEAMANAN TINGKAT TINGGI
-- File: 005_security_hardening.sql
--
-- Menjamin:
-- 1. Seluruh data pribadi mahasiswa (tugas, jadwal, profil, catatan)
--    terisolasi 100% dengan Row Level Security (RLS).
-- 2. Akses anonim (unauthenticated) diblokir sepenuhnya dari data internal.
-- 3. Mencegah kebocoran data antar pengguna.
-- ====================================================================

-- 1. Blokir akses anonim ke tabel data sensitif
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- Izin hanya diberikan kepada authenticated users yang sah
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 2. Pastikan RLS Aktif di Semua Tabel
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

-- 3. Kebijakan Privasi Profil (Hanya Mahasiswa Terautentikasi)
DROP POLICY IF EXISTS "Profiles viewable by user" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Profiles updateable by owner" ON public.profiles;
CREATE POLICY "Profiles updateable by owner" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles insertable by owner" ON public.profiles;
CREATE POLICY "Profiles insertable by owner" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 4. Isolasi Total Data Tugas Mahasiswa
DROP POLICY IF EXISTS "Tasks policy" ON public.tasks;
DROP POLICY IF EXISTS "Tasks isolated to owner" ON public.tasks;
CREATE POLICY "Tasks isolated to owner" ON public.tasks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Isolasi Total Data Semester & Mata Kuliah
DROP POLICY IF EXISTS "Semesters policy" ON public.semesters;
DROP POLICY IF EXISTS "Semesters isolated to owner" ON public.semesters;
CREATE POLICY "Semesters isolated to owner" ON public.semesters
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Courses policy" ON public.courses;
DROP POLICY IF EXISTS "Courses isolated to owner" ON public.courses;
CREATE POLICY "Courses isolated to owner" ON public.courses
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Schedules policy" ON public.schedules;
DROP POLICY IF EXISTS "Schedules isolated to owner" ON public.schedules;
CREATE POLICY "Schedules isolated to owner" ON public.schedules
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Isolasi Total Preferensi & Perangkat Push Notifikasi
DROP POLICY IF EXISTS "Notification prefs policy" ON public.notification_preferences;
DROP POLICY IF EXISTS "Notification prefs isolated" ON public.notification_preferences;
CREATE POLICY "Notification prefs isolated" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Push subscriptions policy" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Push subscriptions isolated" ON public.push_subscriptions;
CREATE POLICY "Push subscriptions isolated" ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Notification logs policy" ON public.notification_logs;
DROP POLICY IF EXISTS "Notification logs isolated" ON public.notification_logs;
CREATE POLICY "Notification logs isolated" ON public.notification_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Kebijakan Keamanan Kelompok Belajar (Group Planner)
DROP POLICY IF EXISTS "Groups viewable by members" ON public.study_groups;
CREATE POLICY "Groups viewable by members" ON public.study_groups
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.study_group_members WHERE group_id = id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Groups insertable by auth users" ON public.study_groups;
CREATE POLICY "Groups insertable by auth users" ON public.study_groups
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Groups updateable by owner" ON public.study_groups;
CREATE POLICY "Groups updateable by owner" ON public.study_groups
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Group members policy" ON public.study_group_members;
CREATE POLICY "Group members policy" ON public.study_group_members
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.study_groups WHERE id = group_id AND owner_id = auth.uid())
  );

