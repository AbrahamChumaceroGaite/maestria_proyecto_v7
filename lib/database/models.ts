import { getDatabase } from './connection';
import type { User, Password, CreatePasswordRequest, UpdatePasswordRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  static create(data: {
    email: string;
    masterPasswordHash: string;
    salt: string;
  }): User {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date();
    
    const stmt = db.prepare(`
      INSERT INTO users (id, email, master_password_hash, salt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, data.email, data.masterPasswordHash, data.salt, now.toISOString(), now.toISOString());
    
    return {
      id,
      email: data.email,
      masterPasswordHash: data.masterPasswordHash,
      salt: data.salt,
      createdAt: now,
      updatedAt: now,
    };
  }
  
  static findByEmail(email: string): User | null {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, email, master_password_hash, salt, created_at, updated_at
      FROM users WHERE email = ?
    `);
    
    const row = stmt.get(email) as any;
    if (!row) return null;
    
    return {
      id: row.id,
      email: row.email,
      masterPasswordHash: row.master_password_hash,
      salt: row.salt,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
  
  static findById(id: string): User | null {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, email, master_password_hash, salt, created_at, updated_at
      FROM users WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      id: row.id,
      email: row.email,
      masterPasswordHash: row.master_password_hash,
      salt: row.salt,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export class PasswordModel {
  static create(userId: string, data: CreatePasswordRequest, encryptedData: {
    encryptedPassword: string;
    iv: string;
  }): Password {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date();
    
    const stmt = db.prepare(`
      INSERT INTO passwords (id, user_id, service, username, encrypted_password, iv, url, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      userId,
      data.service,
      data.username,
      encryptedData.encryptedPassword,
      encryptedData.iv,
      data.url || null,
      data.notes || null,
      now.toISOString(),
      now.toISOString()
    );
    
    return {
      id,
      userId,
      service: data.service,
      username: data.username,
      encryptedPassword: encryptedData.encryptedPassword,
      iv: encryptedData.iv,
      url: data.url,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
  }
  
  static findByUserId(userId: string): Password[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, user_id, service, username, encrypted_password, iv, url, notes, created_at, updated_at
      FROM passwords WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    
    const rows = stmt.all(userId) as any[];
    
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      service: row.service,
      username: row.username,
      encryptedPassword: row.encrypted_password,
      iv: row.iv,
      url: row.url,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }
  
  static findById(id: string, userId: string): Password | null {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, user_id, service, username, encrypted_password, iv, url, notes, created_at, updated_at
      FROM passwords WHERE id = ? AND user_id = ?
    `);
    
    const row = stmt.get(id, userId) as any;
    if (!row) return null;
    
    return {
      id: row.id,
      userId: row.user_id,
      service: row.service,
      username: row.username,
      encryptedPassword: row.encrypted_password,
      iv: row.iv,
      url: row.url,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
  
  static update(id: string, userId: string, data: Partial<UpdatePasswordRequest>, encryptedData?: {
    encryptedPassword: string;
    iv: string;
  }): boolean {
    const db = getDatabase();
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.service) {
      updates.push('service = ?');
      values.push(data.service);
    }
    
    if (data.username) {
      updates.push('username = ?');
      values.push(data.username);
    }
    
    if (encryptedData) {
      updates.push('encrypted_password = ?, iv = ?');
      values.push(encryptedData.encryptedPassword, encryptedData.iv);
    }
    
    if (data.url !== undefined) {
      updates.push('url = ?');
      values.push(data.url || null);
    }
    
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes || null);
    }
    
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    
    values.push(id, userId);
    
    const stmt = db.prepare(`
      UPDATE passwords SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(...values);
    return result.changes > 0;
  }
  
  static delete(id: string, userId: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM passwords WHERE id = ? AND user_id = ?');
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
  
  static search(userId: string, query: string): Password[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, user_id, service, username, encrypted_password, iv, url, notes, created_at, updated_at
      FROM passwords 
      WHERE user_id = ? AND (
        service LIKE ? OR 
        username LIKE ? OR 
        url LIKE ? OR 
        notes LIKE ?
      )
      ORDER BY created_at DESC
    `);
    
    const searchPattern = `%${query}%`;
    const rows = stmt.all(userId, searchPattern, searchPattern, searchPattern, searchPattern) as any[];
    
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      service: row.service,
      username: row.username,
      encryptedPassword: row.encrypted_password,
      iv: row.iv,
      url: row.url,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }
}