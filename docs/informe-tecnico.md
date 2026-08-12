# Informe Técnico — Dental Dashboard

## 1. Introducción

El presente informe documenta el diseño, desarrollo y despliegue de **Dental Dashboard**, una aplicación web de demostración académica que integra autenticación, una vista protegida con consumo de datos en tiempo real y un flujo completo de contenerización y despliegue en la nube. El proyecto se mantuvo deliberadamente simple —un Login, un Dashboard protegido y un logout— para poder explicar con claridad cada concepto técnico solicitado.

## 2. Metodología ágil

### 2.1 Selección: Kanban

Se seleccionó **Kanban** en lugar de Scrum porque:

- El proyecto tiene alcance fijo y pequeño (tres funcionalidades: login, dashboard, logout).
- No hay un equipo con roles formales (Scrum Master, Product Owner) ni necesidad de sprints con fechas cerradas.
- Kanban prioriza la **visibilidad continua del flujo de trabajo** y limita el trabajo en progreso, lo cual se ajusta mejor a un desarrollo individual o de equipo pequeño con entregas incrementales.

### 2.2 Flujo de trabajo

```text
Backlog → To Do → In Progress → Testing → Done
```

- **Backlog:** ideas y tareas identificadas pero no priorizadas todavía (por ejemplo, "documentar despliegue en Cloud Run").
- **To Do:** tareas priorizadas y listas para iniciarse.
- **In Progress:** tareas en desarrollo activo (límite de 1-2 tareas simultáneas).
- **Testing:** funcionalidad terminada, en validación manual o mediante pruebas automatizadas.
- **Done:** tarea completada, integrada a `main` mediante Pull Request.

### 2.3 Ejemplo de tarjetas utilizadas

| Tarjeta | Columna final |
|---|---|
| Configurar cliente de Supabase (`lib/supabase.js`) | Done |
| Implementar `AuthContext` con Context Pattern | Done |
| Crear formulario de Login con validaciones | Done |
| Implementar `ProtectedRoute` | Done |
| Crear `dashboardRepository` (Repository Pattern) | Done |
| Escribir pruebas con Vitest y Testing Library | Done |
| Crear `Dockerfile` multi-stage | Done |
| Configurar GitHub Actions | Done |
| Redactar README e informe técnico | Done |

## 3. Arquitectura

### 3.1 Componentes

El sistema sigue una arquitectura de **cliente único (SPA) contra un Backend-as-a-Service**, sin backend propio:

```text
project/
├── src/
│   ├── components/
│   │   ├── Navbar/            → barra superior, muestra usuario y logout
│   │   └── ProtectedRoute/    → guarda de rutas privadas
│   ├── context/
│   │   └── AuthContext.jsx    → estado global de sesión (Context Pattern)
│   ├── pages/
│   │   ├── Login/             → formulario de autenticación
│   │   └── Dashboard/         → vista protegida, consume dashboard_data
│   ├── services/
│   │   └── dashboardRepository.js → acceso a datos (Repository Pattern)
│   ├── lib/
│   │   └── supabase.js        → cliente único de Supabase
│   ├── App.jsx                → definición de rutas (React Router)
│   └── main.jsx                → punto de entrada, monta providers
└── supabase/
    └── schema.sql              → tabla, RLS y datos de ejemplo
```

### 3.2 Comunicación entre componentes

1. `main.jsx` monta `BrowserRouter` y `AuthProvider`, dando a toda la aplicación acceso al router y al contexto de autenticación.
2. `AuthContext` se suscribe a `supabase.auth.onAuthStateChange` y expone `user`, `isAuthenticated`, `loading`, `signIn` y `signOut`.
3. `App.jsx` define las rutas `/login` (pública) y `/dashboard` (envuelta en `ProtectedRoute`).
4. `ProtectedRoute` consulta `useAuth()`; si no hay sesión, redirige a `/login` con `<Navigate>`.
5. `Login` llama a `signIn(email, password)`, que internamente invoca `supabase.auth.signInWithPassword`.
6. `Dashboard`, ya dentro de la ruta protegida, llama a `getDashboardItems()` del repositorio, que consulta la tabla `dashboard_data` vía la API REST de Supabase, respetando las políticas de RLS definidas para el rol `authenticated`.
7. `Navbar` lee `user` e `isAuthenticated` del contexto para mostrar el correo del usuario y el botón de `signOut`.

### 3.3 Diagrama textual de comunicación

```text
┌────────────┐      supabase.auth        ┌──────────────────┐
│   Login    │ ─────────────────────────▶│  Supabase Auth    │
└────────────┘                            └──────────────────┘
      │ actualiza sesión (onAuthStateChange)
      ▼
┌────────────────┐   useAuth()   ┌──────────────────┐
│  AuthContext    │◀─────────────│  ProtectedRoute   │
└────────────────┘               └──────────────────┘
      │                                   │ permite acceso
      ▼                                   ▼
┌────────────────┐  dashboardRepository ┌──────────────────┐
│   Dashboard     │ ────────────────────▶│  Supabase REST   │
└────────────────┘                       │  (PostgREST)      │
                                          └──────────────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │   PostgreSQL      │
                                          └──────────────────┘
```

## 4. Patrones de diseño

### 4.1 Repository Pattern

Implementado en `src/services/dashboardRepository.js`. Centraliza toda consulta relacionada con la tabla `dashboard_data` en una única función, `getDashboardItems()`, que encapsula el uso del cliente de Supabase. Esto permite:

- Que los componentes de UI (`Dashboard.jsx`) no conozcan detalles de la fuente de datos.
- Sustituir fácilmente la implementación (por ejemplo, para pruebas, usando un mock del módulo) sin tocar la interfaz visual.

### 4.2 Context Pattern

Implementado en `src/context/AuthContext.jsx`, mediante `createContext`, un `AuthProvider` y un hook `useAuth()`. Resuelve el problema de compartir el estado de sesión (usuario autenticado, estado de carga) entre componentes que no tienen una relación directa padre-hijo (`Navbar`, `ProtectedRoute`, `Login`, `Dashboard`), evitando pasar props manualmente por cada nivel del árbol.

### 4.3 Justificación

Ambos patrones son nativos del ecosistema de React/JavaScript y no requieren librerías adicionales, lo cual mantiene el proyecto simple. No se incorporaron patrones adicionales (por ejemplo, Factory, Singleton explícito, Observer) porque no aportarían valor real a un proyecto de este alcance; agregarlos solo para aumentar la cantidad de patrones habría ido en contra del principio de simplicidad exigido.

## 5. Frameworks y tecnologías

- **React 18:** biblioteca de UI basada en componentes; se usa junto con Hooks (`useState`, `useEffect`, `useContext`) sin necesidad de clases.
- **Vite 5:** herramienta de build y servidor de desarrollo, elegida por su velocidad de arranque y su integración simple con variables de entorno (`import.meta.env`).
- **Supabase como Backend-as-a-Service:** provee autenticación (Supabase Auth), base de datos PostgreSQL administrada y una API REST automática (PostgREST) sobre cada tabla, eliminando la necesidad de escribir y mantener un backend propio.

## 6. Versionamiento

- **Git:** control de versiones local.
- **GitHub:** alojamiento remoto del repositorio, gestión de Issues y Pull Requests.
- **Trunk-Based Development:** una única rama de larga duración (`main`), siempre en estado desplegable, y ramas cortas `feature/*` para cada funcionalidad, que se integran rápidamente mediante Pull Requests para evitar divergencias largas.
- **Ramas usadas en este proyecto:** `feature/login`, `feature/dashboard`, `feature/docker`, `feature/tests`.
- **Commits:** mensajes descriptivos con prefijo semántico (`feat`, `test`, `build`, `ci`, `docs`), lo que facilita generar un historial legible y, potencialmente, un changelog automático.
- **Issues:** utilizados para registrar tareas y errores encontrados durante el desarrollo, vinculables al tablero Kanban.
- **Pull Requests:** cada `feature/*` se revisa antes de integrarse a `main`, permitiendo control de calidad incluso en proyectos pequeños.

## 7. Seguridad

| Principio | Implementación |
|---|---|
| Autenticación delegada | Supabase Auth gestiona el hashing y almacenamiento seguro de contraseñas; la aplicación nunca las procesa manualmente. |
| Row Level Security (RLS) | Activado en `dashboard_data`, con una política que solo permite `SELECT` al rol `authenticated`. |
| Variables de entorno | `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` se inyectan vía `.env` / `--build-arg`, nunca hardcodeadas. |
| HTTPS | Tanto Supabase como Google Cloud Run exponen únicamente endpoints HTTPS en producción. |
| Validación de entrada | El formulario de Login valida formato de correo y longitud mínima de contraseña antes de llamar a la API. |
| Mínimo privilegio | Solo se usa la clave pública `anon`, que respeta RLS; la `service_role key` nunca se expone en el frontend. |
| Protección de secretos | `.env` está excluido mediante `.gitignore`; solo se versiona `.env.example` sin valores reales. |
| Manejo de errores | Los mensajes de error de autenticación son genéricos, evitando revelar si el correo o la contraseña fue lo incorrecto. |

## 8. Web Services

La aplicación consume exclusivamente **Web Services REST**, provistos automáticamente por Supabase mediante PostgREST:

```text
React → Supabase Client (@supabase/supabase-js) → REST API (PostgREST) → PostgreSQL
```

No se implementa SOAP ni se integran APIs externas de terceros. Toda la superficie de datos del proyecto se limita a la tabla `dashboard_data` y a los endpoints de autenticación de Supabase.

## 9. Despliegue

### 9.1 Docker

- **Dockerfile multi-stage:** una etapa `build` (Node 20) instala dependencias y genera el bundle de producción con `vite build`; una etapa `production` (Nginx 1.27 Alpine) sirve únicamente los archivos estáticos resultantes, reduciendo drásticamente el tamaño final de la imagen.
- **nginx.conf:** configura `try_files $uri /index.html;` para que las rutas de React Router (`/dashboard`, `/login`) funcionen correctamente incluso al refrescar el navegador directamente sobre esas URLs.

### 9.2 Docker Hub

Registro de imágenes utilizado para publicar la imagen construida (`dental-dashboard`), de forma que pueda ser referenciada por su nombre completo (`TU_USUARIO/dental-dashboard:latest`) desde Google Cloud Run sin necesidad de reconstruirla en la nube.

### 9.3 Google Cloud Run

Se seleccionó Cloud Run porque:

- Es un servicio **serverless de contenedores**: no requiere administrar máquinas virtuales ni clústeres de Kubernetes.
- Escala automáticamente, incluso a cero instancias cuando no hay tráfico, optimizando costos para un proyecto académico de bajo uso.
- Expone automáticamente HTTPS y una URL pública, sin configuración adicional de certificados.
- Acepta directamente una imagen de contenedor Docker, que es exactamente el artefacto que este proyecto ya produce.

### 9.4 URL pública

Tras el despliegue, Cloud Run asigna una URL pública única al servicio (formato `https://<servicio>-<hash>-<región>.a.run.app`). Esta URL es generada por Google en el momento del despliegue y no puede anticiparse ni inventarse en este informe.

### 9.5 Beneficios de contenedores y de la nube

- **Contenedores:** empaquetan la aplicación junto con su entorno de ejecución (Nginx + archivos estáticos), garantizando que funcione igual en cualquier máquina o proveedor de nube.
- **Cloud:** elimina la necesidad de mantener infraestructura propia, ofrece alta disponibilidad, HTTPS gestionado y facturación por uso real.

## 10. Pruebas

Se implementaron pruebas **unitarias y de integración de componentes** con Vitest y React Testing Library:

- **Unitarias/funcionales:** validación de campos del formulario de Login (correo vacío, formato inválido).
- **Integración:** renderizado del Dashboard con mocks del `AuthContext` y del `dashboardRepository`, verificando que los datos obtenidos se muestren correctamente en pantalla.
- **Funcionales de enrutamiento:** comportamiento de `ProtectedRoute` ante los tres estados posibles (cargando, autenticado, no autenticado).

En total, 8 pruebas automatizadas distribuidas en 3 archivos (`Login.test.jsx`, `Dashboard.test.jsx`, `ProtectedRoute.test.jsx`), ejecutables con:

```bash
npm run test
```

## 11. Liberación (release)

La liberación del software se gestiona mediante **GitHub Actions**. El workflow definido en `.github/workflows/ci.yml` se ejecuta automáticamente en cada `push` o Pull Request hacia `main`, realizando: instalación de dependencias, lint, pruebas automatizadas, build de producción y, como paso adicional de validación, la construcción de la imagen Docker. Solo cuando estos pasos son exitosos se considera que el código de `main` está listo para desplegarse manualmente en Google Cloud Run.

## 12. Conclusiones

El desarrollo de Dental Dashboard permitió aplicar, en un alcance controlado, la totalidad del ciclo de vida de una aplicación web moderna: desde la autenticación segura y el consumo de datos vía REST, hasta la contenerización y el despliegue en un entorno serverless de nube, respaldado por un pipeline de integración continua. La decisión de mantener el alcance funcional mínimo (login, dashboard, logout) permitió profundizar en la correcta implementación de cada concepto —seguridad, patrones de diseño, pruebas, Docker y CI/CD— sin la complejidad adicional que introducirían módulos de negocio no solicitados.
