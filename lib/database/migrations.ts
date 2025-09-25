import { getDatabase } from './connection';

interface Migration {
  version: number;
  name: string;
  up: () => void;
  down: () => void;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: () => {
      const db = getDatabase();
      
      db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          master_password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      db.exec(`
        CREATE TABLE IF NOT EXISTS passwords (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          service TEXT NOT NULL,
          username TEXT NOT NULL,
          encrypted_password TEXT NOT NULL,
          iv TEXT NOT NULL,
          url TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);
      
      db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords (user_id)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_passwords_service ON passwords (service)`);
    },
    down: () => {
      const db = getDatabase();
      db.exec('DROP TABLE IF EXISTS passwords');
      db.exec('DROP TABLE IF EXISTS users');
      db.exec('DROP TABLE IF EXISTS schema_migrations');
    },
  },
  {
    version: 2,
    name: 'add_password_strength_tracking',
    up: () => {
      const db = getDatabase();
      db.exec(`
        ALTER TABLE passwords ADD COLUMN password_strength INTEGER DEFAULT 0;
        CREATE INDEX IF NOT EXISTS idx_passwords_strength ON passwords (password_strength);
      `);
    },
    down: () => {
      const db = getDatabase();
      db.exec('DROP INDEX IF EXISTS idx_passwords_strength');
    },
  },
];

function getCurrentVersion(): number {
  const db = getDatabase();
  
  try {
    const stmt = db.prepare('SELECT MAX(version) as version FROM schema_migrations');
    const result = stmt.get() as { version: number | null };
    return result.version || 0;
  } catch {
    return 0;
  }
}

function recordMigration(version: number): void {
  const db = getDatabase();
  const stmt = db.prepare('INSERT INTO schema_migrations (version) VALUES (?)');
  stmt.run(version);
}

function rollbackMigration(version: number): void {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM schema_migrations WHERE version = ?');
  stmt.run(version);
}

export function runMigrations(): void {
  const currentVersion = getCurrentVersion();
  const pendingMigrations = migrations.filter(m => m.version > currentVersion);
  
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    return;
  }
  
  console.log(`Running ${pendingMigrations.length} migrations`);
  
  const db = getDatabase();
  const transaction = db.transaction(() => {
    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.version}: ${migration.name}`);
      migration.up();
      recordMigration(migration.version);
    }
  });
  
  transaction();
  console.log('Migrations completed successfully');
}

export function rollbackToVersion(targetVersion: number): void {
  const currentVersion = getCurrentVersion();
  
  if (targetVersion >= currentVersion) {
    console.log('Target version is current or higher');
    return;
  }
  
  const migrationsToRollback = migrations
    .filter(m => m.version > targetVersion && m.version <= currentVersion)
    .sort((a, b) => b.version - a.version);
  
  console.log(`Rolling back ${migrationsToRollback.length} migrations`);
  
  const db = getDatabase();
  const transaction = db.transaction(() => {
    for (const migration of migrationsToRollback) {
      console.log(`Rolling back migration ${migration.version}: ${migration.name}`);
      migration.down();
      rollbackMigration(migration.version);
    }
  });
  
  transaction();
  console.log('Rollback completed successfully');
}

export function getMigrationStatus(): { version: number; applied: string }[] {
  const db = getDatabase();
  
  try {
    const stmt = db.prepare('SELECT version, applied_at FROM schema_migrations ORDER BY version');
    return stmt.all() as { version: number; applied: string }[];
  } catch {
    return [];
  }
}