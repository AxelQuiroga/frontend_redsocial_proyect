# Red Social Frontend

Aplicación frontend de red social construida con React, TypeScript y Vite.

## Características

- **Autenticación completa**: Login, registro y protección de rutas
- **Gestión de posts**: Visualización de posts del usuario logueado
- **Arquitectura modular**: Separación de responsabilidades con hooks y services
- **Routing SPA**: Navegación sin recarga de página con React Router
- **Estilos profesionales**: CSS modular con variables y componentes reutilizables

## Tecnologías

- React 19 + TypeScript
- Vite (build tool)
- React Router DOM (routing)
- Axios (HTTP client)
- CSS vanilla con variables CSS

## Estructura

```
src/
├── components/      # Componentes UI reutilizables
├── hooks/          # Custom hooks (useAuth, etc.)
├── infrastructure/ # Configuración HTTP (Axios)
├── pages/          # Páginas (Login, Register, Home)
├── services/       # Llamadas a API
├── styles/         # CSS global y componentes
└── types/          # Interfaces TypeScript
```

## Instalación

```bash
cd front
npm install
```

## Configuración

1. Copiar el archivo de entorno:
```bash
cp .env.example .env
```

2. Editar `.env` con la URL del backend:
```bash
VITE_API_URL=http://localhost:3000
```

## Desarrollo

```bash
npm run dev
```

La aplicación corre en `http://localhost:5173`

## Flujo de autenticación

1. Usuario accede a `/login` o `/register`
2. Al autenticarse, el token JWT se almacena en localStorage
3. Axios interceptor agrega el token a cada request
4. Rutas protegidas verifican autenticación vía `useAuth` hook
5. Al recibir 401, el interceptor redirige a login

## Características de seguridad

- Protección CSRF vía JWT en headers
- Rutas protegidas con verificación de token
- Sanitización implícita vía React (escapado de JSX)
- Variables de entorno para URLs sensibles

## Posibles mejoras

| Mejora | Prioridad | Descripción |
|--------|-----------|-------------|
| Crear posts desde UI | Alta | Formulario para crear nuevo post |
| Feed público | Alta | Página con todos los posts (no solo los míos) |
| Like/Comentarios | Media | Interacción social en posts |
| Avatar upload | Media | Subir imagen de perfil |
| Dark mode | Baja | Toggle tema oscuro |
| Tests E2E | Baja | Playwright o Cypress |
| PWA | Baja | Service worker para app instalable |

## API Backend

Esta aplicación consume `http://localhost:3000` con endpoints:

- `POST /users/login` - Autenticación
- `POST /users/register` - Registro
- `GET /users/me` - Datos del usuario
- `GET /posts/posts/me` - Posts del usuario
- `POST /posts/new` - Crear post
- `DELETE /posts/posts/:id` - Eliminar post

## Convenciones

- **Components**: PascalCase, export nombrado
- **Hooks**: camelCase, prefijo `use`
- **Services**: camelCase, objeto con métodos
- **Types**: PascalCase, interfaces sobre types
