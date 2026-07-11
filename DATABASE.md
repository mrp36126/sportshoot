# Ultimate Shooting Tracker
# Database Schema

---

# Overview

This document defines the complete database schema for the Ultimate Shooting Tracker application.

The database is hosted on **Supabase (PostgreSQL)** with Row Level Security (RLS) enabled on all tables.

---

# Conventions

- All table names use **snake_case** and are **pluralized**
- All primary keys are **UUID** type with `gen_random_uuid()` default
- All tables include `created_at` and `updated_at` timestamps
- Soft deletes use an `active` boolean column where applicable
- Foreign keys are named `{referenced_table}_id`
- Indexes are created on all foreign keys and frequently queried columns

---

# Table: profiles

Stores extended user information linked to Supabase Auth.

```sql
CREATE TABLE profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL,
  avatar_url      TEXT,
  country         TEXT,
  province        TEXT,
  city            TEXT,
  club_name       TEXT,
  role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'trainer')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
```

### RLS Policies

```sql
-- Users can read their own profile
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can read all profiles
CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Admins can update any profile
CREATE POLICY "Admins update any profile"
  ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: shooting_ranges

Administrator-managed master data for shooting ranges.

```sql
CREATE TABLE shooting_ranges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  country         TEXT NOT NULL,
  province        TEXT,
  city            TEXT NOT NULL,
  indoor_outdoor  TEXT NOT NULL CHECK (indoor_outdoor IN ('indoor', 'outdoor')),
  num_lanes       INTEGER,
  notes           TEXT,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shooting_ranges_active ON shooting_ranges(active);
CREATE INDEX idx_shooting_ranges_name ON shooting_ranges(name);
CREATE INDEX idx_shooting_ranges_country ON shooting_ranges(country);
```

### RLS Policies

```sql
-- All authenticated users can read active ranges
CREATE POLICY "All users read active ranges"
  ON shooting_ranges FOR SELECT
  USING (active = true OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Only admins can insert
CREATE POLICY "Admins insert ranges"
  ON shooting_ranges FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Only admins can update
CREATE POLICY "Admins update ranges"
  ON shooting_ranges FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Only admins can delete (soft)
CREATE POLICY "Admins delete ranges"
  ON shooting_ranges FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: manufacturers

Administrator-managed master data for firearm manufacturers.

```sql
CREATE TABLE manufacturers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_manufacturers_name ON manufacturers(name);
```

### RLS Policies

```sql
-- All authenticated users can read
CREATE POLICY "All users read manufacturers"
  ON manufacturers FOR SELECT
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins insert manufacturers"
  ON manufacturers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Only admins can update
CREATE POLICY "Admins update manufacturers"
  ON manufacturers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Only admins can delete
CREATE POLICY "Admins delete manufacturers"
  ON manufacturers FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: firearm_models

Administrator-managed master data for firearm models, linked to manufacturers.

```sql
CREATE TABLE firearm_models (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id   UUID NOT NULL REFERENCES manufacturers(id) ON DELETE RESTRICT,
  name              TEXT NOT NULL,
  created_by        UUID NOT NULL REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(manufacturer_id, name)
);

CREATE INDEX idx_firearm_models_manufacturer ON firearm_models(manufacturer_id);
CREATE INDEX idx_firearm_models_name ON firearm_models(name);
```

### RLS Policies

```sql
-- All authenticated users can read
CREATE POLICY "All users read firearm models"
  ON firearm_models FOR SELECT
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins insert firearm models"
  ON firearm_models FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Only admins can update
CREATE POLICY "Admins update firearm models"
  ON firearm_models FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Only admins can delete
CREATE POLICY "Admins delete firearm models"
  ON firearm_models FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: calibres

Administrator-managed master data for calibres.

```sql
CREATE TABLE calibres (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calibres_name ON calibres(name);
```

### RLS Policies

```sql
-- All authenticated users can read
CREATE POLICY "All users read calibres"
  ON calibres FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins insert calibres"
  ON calibres FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins update calibres"
  ON calibres FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins delete calibres"
  ON calibres FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: firearm_types

Seeded reference data (not user-managed).

```sql
CREATE TABLE firearm_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed data
INSERT INTO firearm_types (name) VALUES
  ('Handgun'),
  ('Rifle'),
  ('Shotgun'),
  ('Air Rifle'),
  ('Air Pistol');
```

### RLS Policies

```sql
-- All authenticated users can read
CREATE POLICY "All users read firearm types"
  ON firearm_types FOR SELECT
  USING (true);
```

---

# Table: sight_types

Seeded reference data.

```sql
CREATE TABLE sight_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed data
INSERT INTO sight_types (name) VALUES
  ('Iron Sights'),
  ('Red Dot'),
  ('Holographic'),
  ('Scope'),
  ('Prism Scope'),
  ('LPVO'),
  ('Open Sights');
```

### RLS Policies

```sql
-- All authenticated users can read
CREATE POLICY "All users read sight types"
  ON sight_types FOR SELECT
  USING (true);
```

---

# Table: target_types

Administrator-managed master data for target types.

```sql
CREATE TABLE target_types (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL UNIQUE,
  image_template_url  TEXT,
  physical_width      NUMERIC NOT NULL,        -- in cm
  physical_height     NUMERIC NOT NULL,         -- in cm
  ring_definitions    JSONB NOT NULL DEFAULT '[]',  -- Array of ring radii and scores
  max_score           INTEGER NOT NULL,
  created_by          UUID NOT NULL REFERENCES profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_target_types_name ON target_types(name);
```

### ring_definitions JSON Structure

```json
[
  { "ring": 1, "radius_mm": 100, "score": 1 },
  { "ring": 2, "radius_mm": 90,  "score": 2 },
  { "ring": 3, "radius_mm": 80,  "score": 3 },
  { "ring": 4, "radius_mm": 70,  "score": 4 },
  { "ring": 5, "radius_mm": 60,  "score": 5 },
  { "ring": 6, "radius_mm": 50,  "score": 6 },
  { "ring": 7, "radius_mm": 40,  "score": 7 },
  { "ring": 8, "radius_mm": 30,  "score": 8 },
  { "ring": 9, "radius_mm": 20,  "score": 9 },
  { "ring": 10, "radius_mm": 10, "score": 10 },
  { "ring": "X", "radius_mm": 5, "score": 10, "is_x_ring": true }
]
```

### RLS Policies

```sql
-- All authenticated users can read
CREATE POLICY "All users read target types"
  ON target_types FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins insert target types"
  ON target_types FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins update target types"
  ON target_types FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins delete target types"
  ON target_types FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: distances

Administrator-managed master data for shooting distances.

```sql
CREATE TABLE distances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label           TEXT NOT NULL UNIQUE,         -- e.g. "10m", "25m"
  value_meters    NUMERIC NOT NULL,             -- e.g. 10, 25
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_distances_value ON distances(value_meters);

-- Seed default distances
INSERT INTO distances (label, value_meters, created_by) VALUES
  ('5m', 5, (SELECT id FROM profiles LIMIT 1)),
  ('7m', 7, (SELECT id FROM profiles LIMIT 1)),
  ('10m', 10, (SELECT id FROM profiles LIMIT 1)),
  ('15m', 15, (SELECT id FROM profiles LIMIT 1)),
  ('20m', 20, (SELECT id FROM profiles LIMIT 1)),
  ('25m', 25, (SELECT id FROM profiles LIMIT 1)),
  ('50m', 50, (SELECT id FROM profiles LIMIT 1)),
  ('75m', 75, (SELECT id FROM profiles LIMIT 1)),
  ('100m', 100, (SELECT id FROM profiles LIMIT 1)),
  ('200m', 200, (SELECT id FROM profiles LIMIT 1)),
  ('300m', 300, (SELECT id FROM profiles LIMIT 1));
```

### RLS Policies

```sql
-- All authenticated users can read
CREATE POLICY "All users read distances"
  ON distances FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins insert distances"
  ON distances FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins update distances"
  ON distances FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins delete distances"
  ON distances FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: user_firearms

User-owned firearms referencing master data.

```sql
CREATE TABLE user_firearms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manufacturer_id   UUID NOT NULL REFERENCES manufacturers(id),
  model_id          UUID NOT NULL REFERENCES firearm_models(id),
  firearm_type_id   UUID NOT NULL REFERENCES firearm_types(id),
  calibre_id        UUID NOT NULL REFERENCES calibres(id),
  sight_type_id     UUID NOT NULL REFERENCES sight_types(id),
  barrel_length     NUMERIC,                    -- in inches, optional
  nickname          TEXT,
  notes             TEXT,
  active            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_firearms_user ON user_firearms(user_id);
CREATE INDEX idx_user_firearms_active ON user_firearms(active);
CREATE INDEX idx_user_firearms_manufacturer ON user_firearms(manufacturer_id);
CREATE INDEX idx_user_firearms_model ON user_firearms(model_id);
CREATE INDEX idx_user_firearms_calibre ON user_firearms(calibre_id);
```

### RLS Policies

```sql
-- Users can read their own firearms
CREATE POLICY "Users read own firearms"
  ON user_firearms FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own firearms
CREATE POLICY "Users insert own firearms"
  ON user_firearms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own firearms
CREATE POLICY "Users update own firearms"
  ON user_firearms FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own firearms
CREATE POLICY "Users delete own firearms"
  ON user_firearms FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all
CREATE POLICY "Admins read all firearms"
  ON user_firearms FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: sessions

Core shooting session records.

```sql
CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shooting_range_id UUID NOT NULL REFERENCES shooting_ranges(id),
  firearm_id        UUID NOT NULL REFERENCES user_firearms(id),
  distance_id       UUID NOT NULL REFERENCES distances(id),
  target_type_id    UUID NOT NULL REFERENCES target_types(id),
  expected_shots    INTEGER NOT NULL CHECK (expected_shots > 0),
  detected_shots    INTEGER,                    -- Set after CV processing
  total_score       NUMERIC,                    -- Set after scoring
  average_score     NUMERIC,                    -- total_score / detected_shots
  accuracy          NUMERIC,                    -- percentage
  group_size_mm     NUMERIC,                    -- size of tightest group in mm
  before_image_url  TEXT,
  after_image_url   TEXT,
  annotated_image_url TEXT,
  status            TEXT NOT NULL DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress', 'processing', 'validating', 'completed', 'rejected')),
  shot_datetime     TIMESTAMPTZ,                -- When the shooting occurred
  timezone          TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_range ON sessions(shooting_range_id);
CREATE INDEX idx_sessions_firearm ON sessions(firearm_id);
CREATE INDEX idx_sessions_distance ON sessions(distance_id);
CREATE INDEX idx_sessions_created ON sessions(created_at DESC);
CREATE INDEX idx_sessions_user_date ON sessions(user_id, shot_datetime DESC);
```

### RLS Policies

```sql
-- Users can read their own sessions
CREATE POLICY "Users read own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all sessions
CREATE POLICY "Admins read all sessions"
  ON sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Admins can update any session
CREATE POLICY "Admins update any session"
  ON sessions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: shots

Individual shot records within a session.

```sql
CREATE TABLE shots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  shot_number       INTEGER NOT NULL,
  x_coordinate      NUMERIC,                    -- relative to target center (mm)
  y_coordinate      NUMERIC,                    -- relative to target center (mm)
  ring_score        INTEGER,                    -- 0-10 or X
  is_x_ring         BOOLEAN NOT NULL DEFAULT false,
  is_detected       BOOLEAN NOT NULL DEFAULT true,  -- false if manually entered
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shots_session ON shots(session_id);
CREATE INDEX idx_shots_session_number ON shots(session_id, shot_number);

-- Ensure shot numbers are unique per session
ALTER TABLE shots ADD CONSTRAINT unique_shot_per_session
  UNIQUE (session_id, shot_number);
```

### RLS Policies

```sql
-- Users can read shots from their own sessions
CREATE POLICY "Users read own shots"
  ON shots FOR SELECT
  USING (EXISTS (SELECT 1 FROM sessions WHERE id = shots.session_id AND user_id = auth.uid()));

-- Users can insert shots to their own sessions
CREATE POLICY "Users insert own shots"
  ON shots FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sessions WHERE id = shots.session_id AND user_id = auth.uid()));

-- Users can update shots in their own sessions
CREATE POLICY "Users update own shots"
  ON shots FOR UPDATE
  USING (EXISTS (SELECT 1 FROM sessions WHERE id = shots.session_id AND user_id = auth.uid()));

-- Users can delete shots from their own sessions
CREATE POLICY "Users delete own shots"
  ON shots FOR DELETE
  USING (EXISTS (SELECT 1 FROM sessions WHERE id = shots.session_id AND user_id = auth.uid()));

-- Admins can read all shots
CREATE POLICY "Admins read all shots"
  ON shots FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: session_images

Stores metadata about images captured during a session.

```sql
CREATE TABLE session_images (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  image_type        TEXT NOT NULL CHECK (image_type IN ('before', 'after', 'annotated')),
  storage_path      TEXT NOT NULL,              -- Path in Supabase Storage
  public_url        TEXT NOT NULL,
  width             INTEGER,
  height            INTEGER,
  file_size_bytes   INTEGER,
  captured_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_images_session ON session_images(session_id);
CREATE INDEX idx_session_images_type ON session_images(image_type);
```

### RLS Policies

```sql
-- Users can read images from their own sessions
CREATE POLICY "Users read own images"
  ON session_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM sessions WHERE id = session_images.session_id AND user_id = auth.uid()));

-- Users can insert images to their own sessions
CREATE POLICY "Users insert own images"
  ON session_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sessions WHERE id = session_images.session_id AND user_id = auth.uid()));

-- Admins can read all images
CREATE POLICY "Admins read all images"
  ON session_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: competitions

Administrator-managed competitions.

```sql
CREATE TABLE competitions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  competition_type  TEXT NOT NULL CHECK (competition_type IN ('accuracy', 'speed', 'precision', 'custom')),
  target_type_id    UUID NOT NULL REFERENCES target_types(id),
  distance_id       UUID NOT NULL REFERENCES distances(id),
  start_date        TIMESTAMPTZ NOT NULL,
  end_date          TIMESTAMPTZ NOT NULL,
  max_entries       INTEGER,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  rules             JSONB,
  created_by        UUID NOT NULL REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date > start_date)
);

CREATE INDEX idx_competitions_active ON competitions(is_active);
CREATE INDEX idx_competitions_dates ON competitions(start_date, end_date);
```

### RLS Policies

```sql
-- All authenticated users can read active competitions
CREATE POLICY "All users read competitions"
  ON competitions FOR SELECT
  USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Only admins can insert/update/delete
CREATE POLICY "Admins manage competitions"
  ON competitions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins update competitions"
  ON competitions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins delete competitions"
  ON competitions FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: competition_entries

Links user sessions to competitions.

```sql
CREATE TABLE competition_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id    UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  session_id        UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score             NUMERIC,                    -- Copied from session total_score
  rank              INTEGER,                    -- Calculated position
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(competition_id, session_id),
  UNIQUE(competition_id, user_id)              -- One entry per user per competition
);

CREATE INDEX idx_competition_entries_competition ON competition_entries(competition_id);
CREATE INDEX idx_competition_entries_user ON competition_entries(user_id);
CREATE INDEX idx_competition_entries_score ON competition_entries(score DESC);
```

### RLS Policies

```sql
-- Users can read their own entries
CREATE POLICY "Users read own entries"
  ON competition_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own entries
CREATE POLICY "Users insert own entries"
  ON competition_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- All users can read all entries for leaderboard
CREATE POLICY "All users read all entries"
  ON competition_entries FOR SELECT
  USING (true);
```

---

# Table: leaderboards

Materialized or computed leaderboard data.

```sql
CREATE TABLE leaderboards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type  TEXT NOT NULL CHECK (leaderboard_type IN
                    ('global', 'distance', 'firearm', 'calibre', 'monthly', 'weekly', 'club')),
  reference_id      UUID,                      -- distance_id, firearm_id, calibre_id, etc.
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score             NUMERIC NOT NULL,
  accuracy          NUMERIC,
  total_sessions    INTEGER NOT NULL DEFAULT 0,
  total_shots       INTEGER NOT NULL DEFAULT 0,
  rank              INTEGER,
  period_start      TIMESTAMPTZ,
  period_end        TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(leaderboard_type, reference_id, user_id, period_start)
);

CREATE INDEX idx_leaderboards_type ON leaderboards(leaderboard_type);
CREATE INDEX idx_leaderboards_rank ON leaderboards(rank);
CREATE INDEX idx_leaderboards_score ON leaderboards(score DESC);
```

### RLS Policies

```sql
-- All authenticated users can read leaderboards
CREATE POLICY "All users read leaderboards"
  ON leaderboards FOR SELECT
  USING (true);
```

---

# Table: achievements

Administrator-managed achievement definitions.

```sql
CREATE TABLE achievements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,
  description       TEXT NOT NULL,
  icon_url          TEXT,
  criteria_type     TEXT NOT NULL CHECK (criteria_type IN
                    ('total_sessions', 'total_shots', 'accuracy_threshold',
                     'perfect_score', 'streak', 'competition_win', 'custom')),
  criteria_value    JSONB NOT NULL,             -- e.g. {"threshold": 100, "count": 1}
  points            INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_by        UUID NOT NULL REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_achievements_active ON achievements(is_active);
```

### RLS Policies

```sql
-- All authenticated users can read
CREATE POLICY "All users read achievements"
  ON achievements FOR SELECT
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins manage achievements"
  ON achievements FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins update achievements"
  ON achievements FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins delete achievements"
  ON achievements FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

# Table: user_achievements

Tracks which achievements each user has earned.

```sql
CREATE TABLE user_achievements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id    UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  session_id        UUID REFERENCES sessions(id) ON DELETE SET NULL,  -- When earned
  progress          JSONB,                     -- Current progress toward achievement
  earned_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
```

### RLS Policies

```sql
-- Users can read their own achievements
CREATE POLICY "Users read own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- All users can read all achievements (for profiles)
CREATE POLICY "All users read all achievements"
  ON user_achievements FOR SELECT
  USING (true);
```

---

# Table: user_statistics

Materialized user statistics for fast dashboard loading.

```sql
CREATE TABLE user_statistics (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_sessions    INTEGER NOT NULL DEFAULT 0,
  total_shots       INTEGER NOT NULL DEFAULT 0,
  current_accuracy  NUMERIC,                    -- Average accuracy across all sessions
  personal_best_score NUMERIC,
  personal_best_session_id UUID REFERENCES sessions(id),
  current_ranking   INTEGER,
  total_achievements INTEGER NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_statistics_ranking ON user_statistics(current_ranking);
```

### RLS Policies

```sql
-- Users can read their own statistics
CREATE POLICY "Users read own statistics"
  ON user_statistics FOR SELECT
  USING (auth.uid() = user_id);

-- All users can read all statistics (for leaderboards)
CREATE POLICY "All users read all statistics"
  ON user_statistics FOR SELECT
  USING (true);
```

---

# Table: personal_bests

Tracks personal best records per category.

```sql
CREATE TABLE personal_bests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category          TEXT NOT NULL CHECK (category IN
                    ('overall', 'distance', 'firearm', 'calibre', 'target_type')),
  reference_id      UUID,                      -- distance_id, firearm_id, etc.
  session_id        UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  score             NUMERIC NOT NULL,
  accuracy          NUMERIC,
  group_size_mm     NUMERIC,
  achieved_at       TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, reference_id)
);

CREATE INDEX idx_personal_bests_user ON personal_bests(user_id);
CREATE INDEX idx_personal_bests_category ON personal_bests(category);
```

### RLS Policies

```sql
-- Users can read their own personal bests
CREATE POLICY "Users read own personal bests"
  ON personal_bests FOR SELECT
  USING (auth.uid() = user_id);

-- All users can read all personal bests (for profiles)
CREATE POLICY "All users read all personal bests"
  ON personal_bests FOR SELECT
  USING (true);
```

---

# Database Functions & Triggers

## Function: update_user_statistics

Triggered after a session is completed.

```sql
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert user_statistics
  INSERT INTO user_statistics (user_id, total_sessions, total_shots, current_accuracy,
    personal_best_score, total_achievements, updated_at)
  VALUES (
    NEW.user_id,
    1,
    NEW.detected_shots,
    NEW.accuracy,
    NEW.total_score,
    (SELECT COUNT(*) FROM user_achievements WHERE user_id = NEW.user_id),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_sessions = user_statistics.total_sessions + 1,
    total_shots = user_statistics.total_shots + COALESCE(NEW.detected_shots, 0),
    current_accuracy = (
      SELECT AVG(s.accuracy) FROM sessions s
      WHERE s.user_id = NEW.user_id AND s.status = 'completed'
    ),
    personal_best_score = GREATEST(user_statistics.personal_best_score, NEW.total_score),
    total_achievements = (SELECT COUNT(*) FROM user_achievements WHERE user_id = NEW.user_id),
    updated_at = now();

  -- Update personal bests
  INSERT INTO personal_bests (user_id, category, session_id, score, accuracy, group_size_mm, achieved_at)
  VALUES (NEW.user_id, 'overall', NEW.id, NEW.total_score, NEW.accuracy, NEW.group_size_mm, NEW.shot_datetime)
  ON CONFLICT (user_id, category, reference_id) DO UPDATE SET
    score = GREATEST(personal_bests.score, NEW.total_score),
    accuracy = GREATEST(personal_bests.accuracy, NEW.accuracy),
    session_id = CASE WHEN NEW.total_score > personal_bests.score THEN NEW.id ELSE personal_bests.session_id END,
    achieved_at = CASE WHEN NEW.total_score > personal_bests.score THEN NEW.shot_datetime ELSE personal_bests.achieved_at END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_session_completed
  AFTER UPDATE OF status ON sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_user_statistics();
```

## Function: update_leaderboard

Recalculates leaderboard positions.

```sql
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Update global leaderboard
  DELETE FROM leaderboards WHERE leaderboard_type = 'global' AND user_id = NEW.user_id;

  INSERT INTO leaderboards (leaderboard_type, user_id, score, accuracy,
    total_sessions, total_shots, rank, updated_at)
  SELECT
    'global',
    us.user_id,
    us.personal_best_score,
    us.current_accuracy,
    us.total_sessions,
    us.total_shots,
    ROW_NUMBER() OVER (ORDER BY us.personal_best_score DESC),
    now()
  FROM user_statistics us
  WHERE us.personal_best_score IS NOT NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_statistics_updated
  AFTER UPDATE ON user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard();
```

---

# Storage Structure (Supabase Storage)

```
avatars/
  {user_id}/
    avatar.jpg

targets/
  before/
    {session_id}/
      {timestamp}.jpg
  after/
    {session_id}/
      {timestamp}.jpg
  annotated/
    {session_id}/
      {timestamp}.jpg

competition-images/
  {competition_id}/
    {image_name}.jpg
```

### Storage Bucket Policies

```sql
-- Bucket: targets
-- Users can upload to their own session folders
CREATE POLICY "Users upload target images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'targets'
    AND (storage.foldername(name))[1] IN ('before', 'after', 'annotated')
  );

-- Users can read their own target images
CREATE POLICY "Users read own target images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'targets');

-- Bucket: avatars
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own avatar"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

---

# Entity Relationship Summary

```
auth.users
  ├── profiles (1:1)
  ├── user_firearms (1:N)
  ├── sessions (1:N)
  ├── competition_entries (1:N)
  ├── user_achievements (1:N)
  ├── user_statistics (1:1)
  └── personal_bests (1:N)

shooting_ranges
  └── sessions (1:N)

manufacturers
  └── firearm_models (1:N)
  └── user_firearms (1:N)

firearm_models
  └── user_firearms (1:N)

firearm_types
  └── user_firearms (1:N)

calibres
  └── user_firearms (1:N)

sight_types
  └── user_firearms (1:N)

target_types
  ├── sessions (1:N)
  └── competitions (1:N)

distances
  ├── sessions (1:N)
  └── competitions (1:N)

sessions
  ├── shots (1:N)
  ├── session_images (1:N)
  ├── competition_entries (1:N)
  └── personal_bests (1:N)

competitions
  └── competition_entries (1:N)

achievements
  └── user_achievements (1:N)
```

---

# Index Summary

| Table | Indexes |
|---|---|
| profiles | user_id, role |
| shooting_ranges | active, name, country |
| manufacturers | name |
| firearm_models | manufacturer_id, name |
| calibres | name |
| target_types | name |
| distances | value_meters |
| user_firearms | user_id, active, manufacturer_id, model_id, calibre_id |
| sessions | user_id, status, shooting_range_id, firearm_id, distance_id, created_at, (user_id, shot_datetime) |
| shots | session_id, (session_id, shot_number) |
| session_images | session_id, image_type |
| competitions | active, (start_date, end_date) |
| competition_entries | competition_id, user_id, score DESC |
| leaderboards | leaderboard_type, rank, score DESC |
| achievements | active |
| user_achievements | user_id |
| user_statistics | current_ranking |
| personal_bests | user_id, category |