# Changelog — HoneypotSEC

Registro de todos los cambios, mejoras y correcciones del proyecto.

---

## [Unreleased]

_(próximas implementaciones)_

---

## [0.6.0] — 2026-05-12

### Documentación técnica

- **`docs/arquitectura.drawio`** — Diagrama de arquitectura del sistema reescrito desde cero: 4 zonas diferenciadas (Honeypots Layer, Data Pipeline, Backend API, Frontend React), integraciones externas (RSS, Email, Slack), 3 tipos de usuario (Admin / Employee / Client B2B), leyenda de colores por tipo de flujo y 12 contenedores Docker documentados con sus puertos y tecnologías.

### Portal B2B cliente (frontend)

- **`components/Layout/ClientSidebar.jsx`** — Sidebar exclusivo para clientes empresa: muestra nombre de empresa, badge de plan (Básico/Pro/Enterprise), navegación (Dashboard, Mis Sensores, Alertas, Informes, Mi Cuenta) y botón de logout con nombre de usuario.
- **`pages/client/ClientDashboard.jsx`** — Dashboard del área cliente: 4 KPI cards (Nivel Amenaza, Ataques 24h, IPs únicas, Sensores activos), mapa de ataques en vivo reutilizando `AttackMap`, score de seguridad circular (0–100) calculado desde actividad reciente, y feed de alertas recientes con badge de severidad.
- **`pages/client/ClientSensors.jsx`** — Vista de los 6 honeypots activos (Cowrie, Dionaea, Glastopf, Conpot, Honeytrap, Honeyd) como tarjetas de estado: indicador Online, puerto(s), ataques del día y tendencia.
- **`pages/client/ClientAlerts.jsx`** — Feed de amenazas detectadas con clasificación automática de severidad (Alta/Media/Baja), contadores por nivel y filtro interactivo.
- **`pages/client/ClientReports.jsx`** — Informe mensual imprimible: KPIs, top 5 IPs atacantes con barra de proporción, estado de sensores y botón `window.print()`.
- **`pages/client/ClientAccount.jsx`** — Ficha de empresa (nombre, sector, usuario, email) y detalle del plan activo con sus características incluidas.
- **`App.jsx`** — Añadido `ClientLayout` (ClientSidebar + main) y rutas `/register`, `/pricing`, `/client/dashboard`, `/client/sensors`, `/client/alerts`, `/client/reports`, `/client/account`, todas protegidas con `requiredRole="client"`.

---

## [0.5.0] — 2026-05-08  _(commit fcc5f83)_

### Configuración y UI

- Mejora en la configuración del Honeypot (ajustes Docker/entorno).
- Integración del botón de cambio de tema oscuro/claro en la página.

---

## [0.4.0] — 2026-05-08  _(commits 686b395 / 5f7811d)_

### Portal B2B — backend + auth frontend

**Backend:**
- **`models.py`** — Añadidos campos `company_name`, `company_sector`, `plan` al modelo `User` (nullable, compatibles con usuarios existentes).
- **`schemas.py`** — Nuevo schema `ClientRegisterIn` (empresa, sector, usuario, email, contraseña, plan). `UserOut` actualizado con los nuevos campos.
- **`routers/auth.py`** — Nuevo endpoint `POST /api/auth/register`: valida unicidad de username/email, crea usuario con `role="client"` y devuelve token JWT (auto-login).

**Frontend:**
- **`context/AuthContext.jsx`** — Helper `isClient()` añadido al contexto. Expuesto en el provider.
- **`components/ProtectedRoute.jsx`** — Lógica de redirección consciente del rol `client`: si es cliente accede a ruta no-cliente → `/client/dashboard`; si es admin/employee accede a ruta cliente → `/dashboard`.
- **`pages/Login.jsx`** — Post-login redirige según rol: `client` → `/client/dashboard`, resto → `/dashboard`. Enlace a `/register` en el footer del formulario.
- **`services/api.js`** — Añadida función `registerApi(data)` → `POST /api/auth/register`.
- **`pages/Register.jsx`** _(nuevo)_ — Formulario de registro de empresa en 3 pasos (Empresa → Cuenta → Plan) con stepper animado, validación por paso y selección de plan con radio buttons visuales.
- **`pages/Pricing.jsx`** _(nuevo)_ — Página pública de planes: Básico (gratis), Profesional (€49/mes, destacado), Empresarial (€149/mes). Incluye sección FAQ con 4 preguntas frecuentes.

---

## [0.3.0] — 2026-05-07  _(commit fa1286c)_

### Correcciones

- **Fix crash bcrypt** — Solucionado error de arranque por incompatibilidad de versión de bcrypt.
- **Orden de noticias** — Las noticias del feed RSS ahora se ordenan correctamente por fecha descendente.
- **Logo actualizado** — Nuevo logo aplicado en sidebar, login y favicon.

---

## [0.2.0] — 2026-05-07  _(commit 6cc712b)_

### Sistema de autenticación y módulo educativo

- **Auth JWT** — Login/logout con tokens HS256 (8h expiración). Payload: `{sub: user_id, role}`. Roles: `admin`, `employee`.
- **ProtectedRoute** — Componente React que bloquea rutas según token y rol.
- **Módulo quiz** — Quiz por artículo educativo: preguntas en BD, submit de respuestas, score y resultados. Vista admin en `/admin/quiz-results`.
- **Hardening de producción** — Variables de entorno, secretos en `.env`, CORS restringido, HTTPS con certificado auto-firmado.

---

## [0.1.0] — fechas anteriores  _(commits iniciales)_

### Base del proyecto

- **Infraestructura Docker** — 11 contenedores: Cowrie, Dionaea, Conpot, Glastopf, Honeytrap, Honeyd, PostgreSQL, FastAPI, React, Collector, Nginx.
- **Collector** — Parsers para los 6 honeypots, inserción en PostgreSQL, geolocalización con GeoIP.
- **Backend FastAPI** — Endpoints: `/api/stats/summary`, `/api/stats/honeypots`, `/api/stats/timeline`, `/api/stats/overview` (top IPs, puertos, países, protocolos), `/api/attacks`, `/api/education`, `/api/news`.
- **News feed** — RSS de The Hacker News, BleepingComputer, Krebs on Security y Dark Reading con caché de 30 min.
- **Timeline filtrado** — Endpoint `?honeypot=NAME` para filtrar actividad por sensor.
- **Clasificación Glastopf** — Detección automática de SQLi, XSS, Path Traversal, RCE y Command Injection en ataques web.
- **Frontend React** — Glassmorphism + Framer Motion. Páginas: Landing, Login, Dashboard, Education, ArticlePage, HoneypotDetail, AttackDetail, Honeypots, News.
- **Sistema de alertas** — `collector/alerts.py` detecta eventos críticos (ICS/SCADA, exploits SMB, malware, shells SSH) y notifica por SMTP y/o Slack webhook.
- **Rediseño UI premium** — Estética glassmorphism completa, animaciones con Framer Motion, modo oscuro/claro.
