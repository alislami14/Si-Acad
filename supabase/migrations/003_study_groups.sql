-- Study groups
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Group members
CREATE TABLE study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Rotation slots
CREATE TABLE group_rotation_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  rotation_order INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT DEFAULT ''
);

-- Group events
CREATE TABLE group_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  rotation_slot_id UUID REFERENCES group_rotation_slots(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  event_type TEXT DEFAULT 'presentation',
  event_date TIMESTAMPTZ NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sgm_group_id ON study_group_members(group_id);
CREATE INDEX idx_sgm_user_id ON study_group_members(user_id);
CREATE INDEX idx_grs_group_id ON group_rotation_slots(group_id);
CREATE INDEX idx_ge_group_id ON group_events(group_id);
CREATE INDEX idx_ge_event_date ON group_events(event_date);

-- RLS
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_rotation_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_events ENABLE ROW LEVEL SECURITY;

-- Study groups: viewable by members, creatable by any authenticated user
CREATE POLICY "Members can view groups" ON study_groups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = id AND study_group_members.user_id = auth.uid())
    OR owner_id = auth.uid()
  );

CREATE POLICY "Authenticated users can create groups" ON study_groups
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update groups" ON study_groups
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete groups" ON study_groups
  FOR DELETE USING (auth.uid() = owner_id);

-- Allow anyone to view a group by invite_code (for joining)
CREATE POLICY "Anyone can view group by invite code" ON study_groups
  FOR SELECT USING (true);
-- Note: We use a function for secure joining instead

-- Group members
CREATE POLICY "Members can view group members" ON study_group_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM study_group_members sgm WHERE sgm.group_id = study_group_members.group_id AND sgm.user_id = auth.uid())
  );

CREATE POLICY "Members can insert themselves" ON study_group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and owners can update members" ON study_group_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM study_group_members sgm 
      WHERE sgm.group_id = study_group_members.group_id 
      AND sgm.user_id = auth.uid() 
      AND sgm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins and owners can delete members" ON study_group_members
  FOR DELETE USING (
    auth.uid() = user_id  -- members can leave
    OR EXISTS (
      SELECT 1 FROM study_group_members sgm 
      WHERE sgm.group_id = study_group_members.group_id 
      AND sgm.user_id = auth.uid() 
      AND sgm.role IN ('owner', 'admin')
    )
  );

-- Rotation slots: viewable by group members, managed by owner/admin
CREATE POLICY "Members can view rotation slots" ON group_rotation_slots
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = group_rotation_slots.group_id AND study_group_members.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage rotation slots" ON group_rotation_slots
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = group_rotation_slots.group_id AND study_group_members.user_id = auth.uid() AND study_group_members.role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can update rotation slots" ON group_rotation_slots
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = group_rotation_slots.group_id AND study_group_members.user_id = auth.uid() AND study_group_members.role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can delete rotation slots" ON group_rotation_slots
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = group_rotation_slots.group_id AND study_group_members.user_id = auth.uid() AND study_group_members.role IN ('owner', 'admin'))
  );

-- Group events: same pattern as rotation slots
CREATE POLICY "Members can view group events" ON group_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = group_events.group_id AND study_group_members.user_id = auth.uid())
  );

CREATE POLICY "Admins can insert group events" ON group_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = group_events.group_id AND study_group_members.user_id = auth.uid() AND study_group_members.role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can update group events" ON group_events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = group_events.group_id AND study_group_members.user_id = auth.uid() AND study_group_members.role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can delete group events" ON group_events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = group_events.group_id AND study_group_members.user_id = auth.uid() AND study_group_members.role IN ('owner', 'admin'))
  );

-- Secure function to join a group by invite code
CREATE OR REPLACE FUNCTION join_group_by_invite(p_invite_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_group_id UUID;
  v_member_id UUID;
BEGIN
  -- Find group by invite code
  SELECT id INTO v_group_id FROM study_groups WHERE invite_code = p_invite_code;
  
  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  
  -- Check if already a member
  IF EXISTS (SELECT 1 FROM study_group_members WHERE group_id = v_group_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Already a member of this group';
  END IF;
  
  -- Insert member
  INSERT INTO study_group_members (group_id, user_id, role)
  VALUES (v_group_id, auth.uid(), 'member')
  RETURNING id INTO v_member_id;
  
  RETURN v_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to regenerate invite code (owner only)
CREATE OR REPLACE FUNCTION regenerate_invite_code(p_group_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_new_code TEXT;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM study_groups WHERE id = p_group_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  v_new_code := encode(gen_random_bytes(6), 'hex');
  
  UPDATE study_groups SET invite_code = v_new_code WHERE id = p_group_id;
  
  RETURN v_new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
