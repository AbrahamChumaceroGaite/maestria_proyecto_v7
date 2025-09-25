export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  TAG_LENGTH: 16,
  SALT_LENGTH: 32,
} as const;

export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  BCRYPT_ROUNDS: 12,
  DEFAULT_GENERATED_LENGTH: 16,
} as const;

export const JWT_CONFIG = {
  SECRET_MIN_LENGTH: 32,
  EXPIRES_IN: '24h',
  ALGORITHM: 'HS256',
} as const;

export const DATABASE_CONFIG = {
  FILENAME: 'passwords.db',
  TIMEOUT: 5000,
  BACKUP_INTERVAL: 24 * 60 * 60 * 1000,
} as const;

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email es requerido',
  EMAIL_INVALID: 'Formato de email inválido',
  PASSWORD_REQUIRED: 'Contraseña es requerida',
  PASSWORD_MIN_LENGTH: `Contraseña debe tener al menos ${PASSWORD_CONFIG.MIN_LENGTH} caracteres`,
  PASSWORD_MAX_LENGTH: `Contraseña debe tener máximo ${PASSWORD_CONFIG.MAX_LENGTH} caracteres`,
  SERVICE_REQUIRED: 'Servicio es requerido',
  USERNAME_REQUIRED: 'Usuario es requerido',
  MASTER_PASSWORD_REQUIRED: 'Contraseña maestra es requerida',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_EXISTS: 'El usuario ya existe',
  USER_NOT_FOUND: 'Usuario no encontrado',
  UNAUTHORIZED: 'No autorizado',
  SERVER_ERROR: 'Error del servidor',
  PASSWORD_NOT_FOUND: 'Contraseña no encontrada',
} as const;

export const UI_CONFIG = {
  ITEMS_PER_PAGE: 10,
  SEARCH_DEBOUNCE: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
} as const;

export const PASSWORD_GENERATOR_PRESETS = {
  WEAK: {
    length: 8,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: false,
    includeSymbols: false,
    excludeSimilar: false,
  },
  MEDIUM: {
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false,
    excludeSimilar: true,
  },
  STRONG: {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  },
  PARANOID: {
    length: 32,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  },
} as const;

export const CHARACTER_SETS = {
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  NUMBERS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  SIMILAR: 'il1Lo0O',
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
  PASSWORDS: {
    BASE: '/api/passwords',
    BY_ID: (id: string) => `/api/passwords/${id}`,
  },
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
} as const;