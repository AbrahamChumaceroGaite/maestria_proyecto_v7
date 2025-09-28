# Gestor de Contraseñas Seguro MAESTRIA MODULO 7 - ALTA SEGURIDAD POLENTA

## Descripción

Sistema web para el almacenamiento y gestión segura de contraseñas desarrollado con Next.js para tener tanto Frontend como Backend en un mismo proyecto ¿Viste?

## Tecnologías Empleadas

### Frontend
- **Next.js 14.2.25**: Framework React para aplicaciones web
- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático para JavaScript
- **Tailwind CSS**: Framework de estilos utilitarios
- **React Hook Form**: Gestión de formularios
- **Zod**: Validación de esquemas

### Backend
- **Next.js API Routes**: Endpoints del servidor
- **Better SQLite3**: Base de datos local embebida
- **bcrypt**: Hash de contraseñas maestras
- **jsonwebtoken**: Autenticación mediante JWT

### Criptografía y Seguridad
- **AES-256-GCM**: Cifrado simétrico para contraseñas
- **PBKDF2**: Derivación de claves criptográficas
- **bcrypt**: Hash seguro para contraseñas maestras
- **Crypto (Node.js)**: Generación de valores aleatorios seguros

### Componentes UI
- **Radix UI**: Componentes accesibles
- **Lucide React**: Iconografía
- **class-variance-authority**: Gestión de variantes CSS

## Instalación y Configuración

### Prerrequisitos
- Node.js 18.0 o superior
- npm o yarn

### Pasos de Instalación

1. Configurar variables de entorno:
Crear archivo `.env` con:
```
JWT_SECRET=tu_clave_secreta_jwt_minimo_32_caracteres
NODE_ENV=development
```

2. Ejecutar en modo desarrollo:
```bash
npm run build
npm run dev
```

3. Abrir navegador en: http://localhost:3000

## Funcionalidades Principales

### Autenticación
- **Auto-registro**: Creación automática de cuentas al primer login
- **Contraseña maestra**: Protección con hash bcrypt
- **Sesiones JWT**: Tokens seguros con expiración de 24 horas

### Gestión de Contraseñas
- **Crear**: Agregar nuevas contraseñas con metadatos
- **Listar**: Visualizar contraseñas almacenadas
- **Buscar**: Filtrado por servicio, usuario o URL
- **Editar**: Modificar contraseñas existentes
- **Eliminar**: Borrado seguro con confirmación

### Seguridad
- **Cifrado AES-256-GCM**: Todas las contraseñas se almacenan cifradas
- **Claves únicas**: IV (Vector de Inicialización) único por contraseña
- **Derivación PBKDF2**: 100,000 iteraciones con sal única por usuario
- **Autenticación de datos**: Verificación de integridad con GCM

### Utilidades
- **Generador de contraseñas**: Múltiples opciones de configuración
- **Exportar datos**: Respaldo en formato JSON encriptado
- **Importar datos**: Restauración desde archivos de respaldo
- **Copia segura**: Funcionalidad clipboard para contraseñas

## Arquitectura de Seguridad

### Flujo de Cifrado
1. **Derivación de clave**: PBKDF2(contraseña_maestra, sal_usuario, 100000, SHA-256)
2. **Generación IV**: 12 bytes aleatorios por contraseña
3. **Cifrado**: AES-256-GCM con autenticación
4. **Almacenamiento**: Solo datos cifrados en base de datos

### Protección de Datos
- **Sin texto plano**: Contraseñas jamás almacenadas sin cifrar
- **Integridad**: Verificación automática al descifrar
- **Claves efímeras**: Derivación por sesión desde contraseña maestra
- **Salting**: Sal única por usuario previene ataques de diccionario

### Autenticación
- **JWT firmado**: Tokens con HMAC-SHA256
- **Expiración**: Sesiones limitadas a 24 horas
- **HttpOnly cookies**: Prevención de acceso XSS
- **Validación**: Verificación en cada request protegido

## Base de Datos

### Esquema SQLite
```sql
-- Usuarios
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  master_password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Contraseñas
CREATE TABLE passwords (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  service TEXT NOT NULL,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  iv TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## Decisiones Técnicas Relevantes

### 1. Arquitectura de Cifrado Híbrida
Se implementó derivación de claves PBKDF2 combinada con AES-256-GCM para balancear seguridad y rendimiento. PBKDF2 previene ataques de fuerza bruta mientras GCM garantiza autenticidad.

### 2. SQLite como Base de Datos
Selección de SQLite para simplicidad de despliegue manteniendo transacciones ACID y soporte de claves foráneas. Apropiado para aplicación monousuario local.

### 3. Auto-registro Simplificado
Implementación de registro automático en primer login para reducir fricción del usuario manteniendo seguridad mediante validación robusta.

### 4. Gestión de Estado Cliente
Uso de React Hook Form con Zod para validación tipada y mejor experiencia de usuario. Separación clara entre validación cliente y servidor.

### 5. Middleware de Autenticación
Sistema centralizado de verificación JWT que protege todas las rutas sensibles con manejo consistente de errores y expiración.

## Consideraciones de Seguridad

### Implementadas
- Cifrado AES-256-GCM con IV únicos
- Hash bcrypt para contraseñas maestras
- Derivación PBKDF2 con 100,000 iteraciones
- Validación exhaustiva de entrada
- Cookies HttpOnly para tokens
- Prevención de ataques de timing

### Limitaciones Actuales
- Contraseña maestra no persiste en sesión (requiere reingreso)
- Sin implementación de 2FA
- Respaldos no incluyen re-cifrado con nueva clave
