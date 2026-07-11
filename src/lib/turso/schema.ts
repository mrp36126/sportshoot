/**
 * Turso SQLite Database Schema
 * 
 * This file contains all SQL statements for creating and migrating
 * the database schema. Run `migrate()` to initialize the database.
 */

const MIGRATIONS = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    profile_image_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    country TEXT,
    province TEXT,
    city TEXT,
    club_name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Shooting ranges table
  `CREATE TABLE IF NOT EXISTS shooting_ranges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    province TEXT,
    city TEXT NOT NULL,
    indoor_outdoor TEXT NOT NULL DEFAULT 'indoor' CHECK(indoor_outdoor IN ('indoor', 'outdoor')),
    num_lanes INTEGER,
    notes TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Firearm manufacturers
  `CREATE TABLE IF NOT EXISTS manufacturers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Firearm models
  `CREATE TABLE IF NOT EXISTS firearm_models (
    id TEXT PRIMARY KEY,
    manufacturer_id TEXT NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Calibres
  `CREATE TABLE IF NOT EXISTS calibres (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Firearm types
  `CREATE TABLE IF NOT EXISTS firearm_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Sight types
  `CREATE TABLE IF NOT EXISTS sight_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Target types
  `CREATE TABLE IF NOT EXISTS target_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    max_score INTEGER NOT NULL DEFAULT 100,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // User firearms
  `CREATE TABLE IF NOT EXISTS user_firearms (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manufacturer TEXT NOT NULL,
    model TEXT NOT NULL,
    firearm_type TEXT NOT NULL,
    calibre TEXT NOT NULL,
    sight_type TEXT,
    barrel_length REAL,
    nickname TEXT,
    notes TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Shooting sessions
  `CREATE TABLE IF NOT EXISTS shooting_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shooting_range_id TEXT NOT NULL REFERENCES shooting_ranges(id),
    firearm_id TEXT NOT NULL REFERENCES user_firearms(id),
    calibre TEXT NOT NULL,
    shooting_distance REAL NOT NULL,
    number_of_shots INTEGER NOT NULL,
    raw_target_score REAL,
    distance_multiplier REAL,
    group_size_mm REAL,
    grouping_bonus INTEGER,
    final_score REAL,
    before_image_url TEXT,
    after_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('completed', 'rejected')),
    shot_datetime TEXT,
    timezone TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Indexes for performance
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_shooting_sessions_user_id ON shooting_sessions(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_shooting_sessions_created_at ON shooting_sessions(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_shooting_sessions_distance ON shooting_sessions(shooting_distance)`,
  `CREATE INDEX IF NOT EXISTS idx_shooting_sessions_final_score ON shooting_sessions(final_score)`,
  `CREATE INDEX IF NOT EXISTS idx_shooting_sessions_calibre ON shooting_sessions(calibre)`,
  `CREATE INDEX IF NOT EXISTS idx_user_firearms_user_id ON user_firearms(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_shooting_ranges_active ON shooting_ranges(active)`,

  // Seed data: shooting ranges
  `INSERT OR IGNORE INTO shooting_ranges (id, name, country, city, indoor_outdoor) VALUES 
    ('range-1', 'Indoor Range Alpha', 'United States', 'New York', 'indoor'),
    ('range-2', 'Outdoor Range Bravo', 'United States', 'Los Angeles', 'outdoor'),
    ('range-3', 'Precision Range Charlie', 'United Kingdom', 'London', 'outdoor')
  `,

  // Seed data: manufacturers
  `INSERT OR IGNORE INTO manufacturers (id, name) VALUES 
    ('mfr-1', 'Glock'),
    ('mfr-2', 'Smith & Wesson'),
    ('mfr-3', 'Sig Sauer'),
    ('mfr-4', 'Beretta'),
    ('mfr-5', 'Colt'),
    ('mfr-6', 'Walther'),
    ('mfr-7', 'Heckler & Koch'),
    ('mfr-8', 'CZ'),
    ('mfr-9', 'Ruger'),
    ('mfr-10', 'Taurus')
  `,

  // Seed data: models
  `INSERT OR IGNORE INTO firearm_models (id, manufacturer_id, name) VALUES 
    ('mdl-1', 'mfr-1', 'G17'),
    ('mdl-2', 'mfr-1', 'G19'),
    ('mdl-3', 'mfr-1', 'G34'),
    ('mdl-4', 'mfr-2', 'Model 686'),
    ('mdl-5', 'mfr-2', 'Model 629'),
    ('mdl-6', 'mfr-3', 'P320'),
    ('mdl-7', 'mfr-3', 'P226'),
    ('mdl-8', 'mfr-3', 'P365'),
    ('mdl-9', 'mfr-4', '92FS'),
    ('mdl-10', 'mfr-4', 'PX4 Storm'),
    ('mdl-11', 'mfr-5', '1911'),
    ('mdl-12', 'mfr-5', 'Python'),
    ('mdl-13', 'mfr-6', 'PDP'),
    ('mdl-14', 'mfr-6', 'PPQ'),
    ('mdl-15', 'mfr-7', 'VP9'),
    ('mdl-16', 'mfr-7', 'USP'),
    ('mdl-17', 'mfr-8', 'Shadow 2'),
    ('mdl-18', 'mfr-8', 'P-10 C'),
    ('mdl-19', 'mfr-9', 'Mark IV'),
    ('mdl-20', 'mfr-10', 'TX22')
  `,

  // Seed data: calibres
  `INSERT OR IGNORE INTO calibres (id, name) VALUES 
    ('cal-1', '9mm Parabellum'),
    ('cal-2', '.22 LR'),
    ('cal-3', '.38 Special'),
    ('cal-4', '.357 Magnum'),
    ('cal-5', '.45 ACP'),
    ('cal-6', '.40 S&W'),
    ('cal-7', '.380 ACP'),
    ('cal-8', '.44 Magnum'),
    ('cal-9', '5.56x45mm NATO'),
    ('cal-10', '7.62x39mm')
  `,

  // Seed data: firearm types
  `INSERT OR IGNORE INTO firearm_types (id, name) VALUES 
    ('ft-1', 'Pistol'),
    ('ft-2', 'Revolver'),
    ('ft-3', 'Rifle'),
    ('ft-4', 'Shotgun'),
    ('ft-5', 'Air Pistol'),
    ('ft-6', 'Air Rifle')
  `,

  // Seed data: sight types
  `INSERT OR IGNORE INTO sight_types (id, name) VALUES 
    ('st-1', 'Iron Sights'),
    ('st-2', 'Red Dot'),
    ('st-3', 'Holographic'),
    ('st-4', 'Telescopic'),
    ('st-5', 'Open Sights'),
    ('st-6', 'Aperture Sights')
  `,

  // Seed data: target types
  `INSERT OR IGNORE INTO target_types (id, name, max_score) VALUES 
    ('tt-1', 'ISSF 10m Air Pistol', 100),
    ('tt-2', 'ISSF 25m Pistol', 100),
    ('tt-3', 'ISSF 50m Pistol', 100),
    ('tt-4', 'ISSF 10m Air Rifle', 100),
    ('tt-5', 'ISSF 50m Rifle', 100),
    ('tt-6', 'IPSC Standard', 100),
    ('tt-7', 'NRA B-8', 100),
    ('tt-8', 'NRA B-16', 100),
    ('tt-9', 'B-27 Silhouette', 100),
    ('tt-10', 'B-29 Center', 100)
  `,
];

/**
 * Run all database migrations.
 * Safe to call multiple times (uses IF NOT EXISTS).
 */
export async function migrate(): Promise<void> {
  const { executeStatement } = await import('./client');
  
  for (const sql of MIGRATIONS) {
    try {
      await executeStatement(sql);
    } catch (error) {
      console.error('Migration failed:', sql.substring(0, 80), error);
      throw error;
    }
  }
}