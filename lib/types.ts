 
export interface User {
  id: string;
  email: string;
  masterPasswordHash: string;
  salt: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Password {
  id: string;
  userId: string;
  service: string;
  username: string;
  encryptedPassword: string;
  iv: string;
  url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePasswordRequest {
  service: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface UpdatePasswordRequest extends Partial<CreatePasswordRequest> {
  id: string;
}

export interface LoginRequest {
  email: string;
  masterPassword: string;
}

export interface RegisterRequest {
  email: string;
  masterPassword: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'masterPasswordHash' | 'salt'>;
}

export interface GeneratePasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

export interface PasswordStrength {
  score: number;
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export interface DatabaseConfig {
  filename: string;
  options: {
    verbose?: boolean;
    timeout?: number;
  };
}

export interface EncryptionResult {
  encrypted: string;
  iv: string;
}

export interface DecryptionParams {
  encrypted: string;
  iv: string;
  key: string;
}