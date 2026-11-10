/**
 * SI-Acad Database Types
 * Complete TypeScript interfaces for all Supabase tables
 */

export interface Profile {
  id: string;
  full_name: string;
  university: string;
  major: string;
  student_id: string;
  timezone: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: string;
  user_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  semester_id: string;
  name: string;
  code: string;
  lecturer: string;
  credits: number;
  room: string;
  color: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  user_id: string;
  course_id: string;
  semester_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  notes: string;
  is_cancelled: boolean;
  created_at: string;
  // Joined
  course?: Course;
}

export interface Task {
  id: string;
  user_id: string;
  semester_id: string | null;
  course_id: string | null;
  title: string;
  description: string;
  deadline: string | null;
  priority: 'low' | 'normal' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  notes: string;
  created_at: string;
  updated_at: string;
  // Joined
  course?: Course;
}

export interface StudyGroup {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  invite_code: string;
  created_at: string;
  // Joined
  members?: StudyGroupMember[];
  member_count?: number;
}

export interface StudyGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  // Joined
  profile?: Profile;
}

export interface GroupRotationSlot {
  id: string;
  group_id: string;
  rotation_order: number;
  start_date: string;
  end_date: string;
  notes: string;
}

export interface GroupEvent {
  id: string;
  group_id: string;
  semester_id: string | null;
  course_id: string | null;
  rotation_slot_id: string | null;
  title: string;
  event_type: string;
  event_date: string;
  description: string;
  created_at: string;
  // Joined
  course?: Course;
  rotation_slot?: GroupRotationSlot;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  class_reminder_enabled: boolean;
  class_first_reminder_minutes: number;
  class_second_reminder_minutes: number;
  task_reminder_enabled: boolean;
  task_first_reminder_minutes: number;
  task_second_reminder_minutes: number;
  task_deadline_reminder: boolean;
  group_reminder_enabled: boolean;
  group_day_before: boolean;
  group_day_of: boolean;
  sound_enabled: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  device_name: string;
  created_at: string;
  last_used_at: string;
}

export interface NotificationJob {
  id: string;
  user_id: string;
  source_type: 'class' | 'task' | 'group';
  source_id: string;
  notification_type: string;
  title: string;
  body: string;
  scheduled_at: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  idempotency_key: string;
  sent_at: string | null;
  payload: Record<string, unknown>;
  action_url: string;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  job_id: string | null;
  user_id: string;
  notification_type: string;
  title: string;
  body: string;
  status: 'delivered' | 'failed' | 'expired';
  error_message: string | null;
  sent_at: string;
  read_at: string | null;
  action_url: string;
}
