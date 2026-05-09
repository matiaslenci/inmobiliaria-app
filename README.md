# Aplicación de Tasas Inmobiliarias

Aplicación web para el cálculo y consulta de tasas inmobiliarias con sistema de autenticación integrado con Supabase.

## 🚀 Características

- **Sistema de Autenticación Completo**: Login, registro y gestión de usuarios
- **Integración con Supabase**: Base de datos y autenticación segura
- **Interfaz Moderna**: Diseño responsive con FontAwesome
- **Validaciones**: Formularios con validación del lado cliente y servidor
- **Gestión de Sesiones**: Cookies seguras y manejo de tokens

## 📋 Prerrequisitos

- Node.js (versión 16 o superior)
- pnpm (recomendado) o npm
- Cuenta en Supabase

## 🛠️ Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repositorio>
   cd inmobiliaria-app
   ```

2. **Instalar dependencias**

   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**

   Crear el archivo `env/.env.development` con las siguientes variables:

   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Cookie Configuration
   COOKIE_SECRET=your_cookie_secret_here
   ```

## 🔧 Configuración de Supabase

### 1. Crear proyecto en Supabase

- Ve a [supabase.com](https://supabase.com)
- Crea una nueva cuenta o inicia sesión
- Crea un nuevo proyecto

### 2. Configurar autenticación

- En tu proyecto de Supabase, ve a **Authentication > Settings**
- Configura las siguientes opciones:
  - **Site URL**: `http://localhost:3000`
  - **Redirect URLs**: `http://localhost:3000/auth/confirm`
  - **Enable email confirmations**: Activado
  - **Enable sign ups**: Activado

### 3. Obtener credenciales

- Ve a **Settings > API**
- Copia la **Project URL** y **anon public** key
- Pégales en tu archivo `.env.development`

## 🚀 Ejecutar la aplicación

### Modo desarrollo

```bash
pnpm run dev
```

### Modo producción

```bash
pnpm run start
```

La aplicación estará disponible en `http://localhost:3000`

## 📱 Funcionalidades del Sistema de Autenticación

### Usuarios no autenticados

- ✅ Ver página de inicio
- ✅ Registrarse
- ✅ Iniciar sesión

### Usuarios autenticados

- ✅ Acceder a perfil personal
- ✅ Ver información de la cuenta
- ✅ Cerrar sesión
- ✅ Navegar por la aplicación

## 🔐 Rutas de Autenticación

- `GET /login` - Página de inicio de sesión
- `POST /login` - Procesar inicio de sesión
- `GET /register` - Página de registro
- `POST /register` - Procesar registro
- `GET /profile` - Perfil del usuario (protegido)
- `POST /logout` - Cerrar sesión
- `GET /auth/confirm` - Confirmar email

## 🎨 Estructura del Proyecto

```
inmobiliaria-app/
├── env/                    # Variables de entorno
├── public/                 # Archivos estáticos
│   ├── css/
│   └── assets/
├── src/
│   ├── controllers/        # Controladores de autenticación
│   ├── routes/            # Rutas de la aplicación
│   ├── utils/             # Cliente de Supabase
│   ├── views/             # Vistas EJS
│   └── app.js             # Configuración principal
├── server.js              # Punto de entrada
└── package.json
```

## 🐛 Solución de Problemas (Supabase)

### Error: "Variables de entorno de Supabase no encontradas"

- Verifica que el archivo `.env.development` existe en la carpeta `env/`
- Confirma que las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY` están definidas

### Error: "Invalid login credentials"

- Verifica que el usuario existe en Supabase
- Confirma que el email ha sido verificado
- Revisa que la contraseña sea correcta

### Error: "Email not confirmed"

- El usuario debe verificar su email antes de iniciar sesión
- Revisa la carpeta de spam del usuario
- Puedes reenviar el email de confirmación desde Supabase

### Endpoints Tasas

**Santo Tome**: https://servicios.santotome.gob.ar:8443/liquidacionesweb/buscarLiquidaciones.do
**Sauce Viejo**: https://sauceviejo.gob.ar/sauceonline
**Santa Fe**: _Próximamente_

---

**Nota**: Asegúrate de configurar correctamente Supabase antes de ejecutar la aplicación. El sistema de autenticación no funcionará sin las credenciales correctas.

 1. Descargar el binario de Electron:

  npm rebuild electron

  Tarda 1-2 minutos (~120 MB).

  2. Probar que arranca (modo desarrollo, sin instalar nada):

  npm run electron

  Debería abrirse una ventana con tu app. Cerrala cuando confirmes que funciona.

  3. Generar el instalador .exe:

  npm run electron:build

  Tarda 2-5 minutos. Cuando termine vas a tener:

  dist\Tasas Inmobiliarias Setup 1.0.0.exe

  Ese es el instalador. Hacés doble clic, te deja elegir carpeta, te crea acceso directo en escritorio y menú Inicio.
  Eso es lo que distribuís a tus usuarios — lo descargan, lo ejecutan, queda instalada como cualquier otra app de
  Windows.

  Si querés probarlo vos mismo: ejecutá ese .exe y la app queda instalada en tu PC también.

Para futuras instalaciones en este proyecto, el binario ya está en node_modules/electron/dist/ y no
necesitará descargarse de nuevo.

 Solo tenés que correr:

  npm run electron:build

  Eso usa electron-builder y genera un instalador .exe (NSIS) en la carpeta dist/. El cliente solo necesita
  ese archivo para instalar la app.

  Lo que va a generar:
  - dist/Tasas Inmobiliarias Setup 1.0.0.exe — instalador para el cliente
  - Crea acceso directo en el escritorio y menú inicio
  - El cliente puede elegir dónde instalar

  Aviso importante: el mismo problema de red puede ocurrir durante el build porque electron-builder también
  descarga binarios de GitHub (el builder mismo). Si falla, avisame y lo solucionamos igual que antes con
  PowerShell.