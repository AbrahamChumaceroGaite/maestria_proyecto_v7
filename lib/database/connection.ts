import Database from 'better-sqlite3';
import { DATABASE_CONFIG } from '../utils/constants';
import path from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', DATABASE_CONFIG.FILENAME);
    
    db = new Database(dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
      timeout: DATABASE_CONFIG.TIMEOUT,
    });
    
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = -64000');
    db.pragma('temp_store = MEMORY');
    
    initializeTables();
  }
  
  return db;
}

function initializeTables(): void {
  if (!db) return;
  
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      master_password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const createPasswordsTable = `
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
  `;
  
  const createUsersEmailIndex = `
    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)
  `;
  
  const createPasswordsUserIdIndex = `
    CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords (user_id)
  `;
  
  const createPasswordsServiceIndex = `
    CREATE INDEX IF NOT EXISTS idx_passwords_service ON passwords (service)
  `;
  
  db.exec(createUsersTable);
  db.exec(createPasswordsTable);
  db.exec(createUsersEmailIndex);
  db.exec(createPasswordsUserIdIndex);
  db.exec(createPasswordsServiceIndex);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function beginTransaction() {
  return getDatabase().transaction((fn: () => void) => fn());
}

process.on('exit', closeDatabase);
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);