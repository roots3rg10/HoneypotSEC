# Tareas para Gerard — HoneypotSEC

**Repositorio:** https://github.com/roots3rg10/HoneypotSEC  
**Web del proyecto:** http://192.168.1.40  
**Última actualización del repo:** 22 abril 2026
**Estado de las tareas:** ✅ TODAS COMPLETADAS (Timeline filter, Stats overview, Glastopf classifier)

---

## Cómo empezar

```bash
git clone https://github.com/roots3rg10/HoneypotSEC.git
cd HoneypotSEC
```

Para ver la web abre en el navegador: `http://192.168.1.40`

---

## Estado actual del proyecto

El stack está funcionando con 11 contenedores Docker:

- **6 honeypots** capturando ataques: Cowrie (SSH), Dionaea (SMB/FTP/MySQL), Glastopf (Web), Conpot (ICS/SCADA), Honeytrap (TCP/UDP), Honeyd (red virtual)
- **Collector** que lee los logs de los honeypots y los inserta en la base de datos
- **Base de datos** PostgreSQL con los ataques registrados
- **Backend** API REST con FastAPI (Python)
- **Frontend** dashboard en React con mapa, gráficas y tabla de ataques
- **Nginx** como proxy inverso en el puerto 80

El pipeline completo funciona: honeypot → log → collector → PostgreSQL → API → dashboard.

---

## Tus ficheros — zona de trabajo

Tus tareas están todas en estas carpetas. **No toques `frontend/`** (lo lleva Sergio):

```
backend/
  routers/
    stats.py        ← Tareas 1 y 2
collector/
  parsers/
    glastopf.py     ← Tarea 3
```

---

## Tarea 1 — Timeline filtrado por honeypot

**Fichero:** `backend/routers/stats.py`  
**Rama:** `gerard/timeline-honeypot`

### Qué hay ahora

El endpoint `/api/stats/timeline` devuelve la actividad de las últimas 24 horas de **todos** los honeypots juntos.

### Qué necesitamos

Que acepte un parámetro opcional `?honeypot=NAME` para filtrar por honeypot concreto. Sergio lo usará en la página de detalle de cada honeypot para mostrar su propia gráfica.

### Cómo hacerlo

Busca esta función en `backend/routers/stats.py`:

```python
@router.get("/timeline", response_model=list[TimelinePoint])
async def timeline(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(text("""
        SELECT to_char(date_trunc('hour', timestamp), 'YYYY-MM-DD HH24:00') AS hour,
               count(*) AS count
        FROM attacks
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
        GROUP BY hour
        ORDER BY hour
    """))).all()
    return [TimelinePoint(hour=r[0], count=r[1]) for r in rows]
```

Cámbiala para que quede así:

```python
@router.get("/timeline", response_model=list[TimelinePoint])
async def timeline(
    honeypot: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    if honeypot:
        rows = (await db.execute(text("""
            SELECT to_char(date_trunc('hour', timestamp), 'YYYY-MM-DD HH24:00') AS hour,
                   count(*) AS count
            FROM attacks
            WHERE timestamp >= NOW() - INTERVAL '24 hours'
              AND honeypot = :honeypot
            GROUP BY hour
            ORDER BY hour
        """), {"honeypot": honeypot})).all()
    else:
        rows = (await db.execute(text("""
            SELECT to_char(date_trunc('hour', timestamp), 'YYYY-MM-DD HH24:00') AS hour,
                   count(*) AS count
            FROM attacks
            WHERE timestamp >= NOW() - INTERVAL '24 hours'
            GROUP BY hour
            ORDER BY hour
        """))).all()
    return [TimelinePoint(hour=r[0], count=r[1]) for r in rows]
```

### Verificar que funciona

```bash
curl http://localhost/api/stats/timeline
curl http://localhost/api/stats/timeline?honeypot=glastopf
```

Ambos deben devolver una lista JSON con `hour` y `count`.

---

## Tarea 2 — Endpoint de resumen global

**Fichero:** `backend/routers/stats.py`  
**Rama:** `gerard/stats-overview`

### Qué necesitamos

Un endpoint nuevo `/api/stats/overview` que devuelva en **una sola llamada** los datos para una futura página de estadísticas globales. Ahora mismo el frontend tiene que hacer 4 llamadas separadas para obtener top IPs, top puertos, top países y distribución por protocolo.

### Cómo hacerlo

Añade al final de `backend/routers/stats.py`:

```python
@router.get("/overview")
async def overview(db: AsyncSession = Depends(get_db)):
    top_ips = (await db.execute(
        select(Attack.source_ip, func.count(Attack.id).label("c"), Attack.country)
        .group_by(Attack.source_ip, Attack.country)
        .order_by(desc("c")).limit(10)
    )).all()

    top_ports = (await db.execute(
        select(Attack.dest_port, func.count(Attack.id).label("c"))
        .where(Attack.dest_port.isnot(None))
        .group_by(Attack.dest_port)
        .order_by(desc("c")).limit(10)
    )).all()

    top_countries = (await db.execute(
        select(Attack.country, Attack.country_code, func.count(Attack.id).label("c"))
        .where(Attack.country.isnot(None))
        .group_by(Attack.country, Attack.country_code)
        .order_by(desc("c")).limit(5)
    )).all()

    protocols = (await db.execute(
        select(Attack.protocol, func.count(Attack.id).label("c"))
        .where(Attack.protocol.isnot(None))
        .group_by(Attack.protocol)
        .order_by(desc("c"))
    )).all()

    return {
        "top_ips":       [{"ip": r[0], "count": r[1], "country": r[2]} for r in top_ips],
        "top_ports":     [{"port": r[0], "count": r[1]} for r in top_ports],
        "top_countries": [{"country": r[0], "code": r[1], "count": r[2]} for r in top_countries],
        "protocols":     [{"protocol": r[0], "count": r[1]} for r in protocols],
    }
```

### Verificar que funciona

```bash
curl http://localhost/api/stats/overview
```

Debe devolver un JSON con las cuatro secciones.

---

## Tarea 3 — Clasificar mejor los ataques web

**Fichero:** `collector/parsers/glastopf.py`  
**Rama:** `gerard/glastopf-classifier`

### Qué hay ahora

Todos los ataques de Glastopf aparecen como `"Petición web GET"` sin importar lo que pida el atacante.

### Qué necesitamos

Detectar el tipo de ataque según la URL que llega y clasificarlo correctamente.

### Cómo hacerlo

Reemplaza la función `parse_line` de `collector/parsers/glastopf.py` con esta versión mejorada:

```python
import re

ATTACK_PATTERNS = [
    (re.compile(r"(\bselect\b|\bunion\b|\bdrop\b|\binsert\b|\bor\s+1=1\b|'--|%27)", re.I), "SQL Injection"),
    (re.compile(r"\.\./|\.\.\\|%2e%2e%2f|etc/passwd|etc/shadow|proc/self", re.I),         "Path Traversal"),
    (re.compile(r"<script|javascript:|onerror=|onload=|alert\(|%3cscript", re.I),          "XSS"),
    (re.compile(r"(https?|ftp)://[^/]+/.*\.(php|asp|sh|py)", re.I),                       "Remote File Inclusion"),
    (re.compile(r"\.(php|asp|aspx|jsp|cgi)\?.*=.*(http|ftp|//)", re.I),                   "Remote File Inclusion"),
    (re.compile(r"wp-login|wp-admin|xmlrpc\.php|wp-config", re.I),                        "WordPress Scan"),
    (re.compile(r"/admin|/administrator|/manager|/panel|/console|/phpmyadmin", re.I),      "Admin Panel Scan"),
    (re.compile(r"\.(env|git|svn|htaccess|htpasswd|bak|backup|sql|conf|cfg|ini)$", re.I), "Config File Scan"),
    (re.compile(r"(wget|curl|python|nikto|sqlmap|nmap|masscan|zgrab)", re.I),              "Scanner/Bot"),
    (re.compile(r"/shell|/cmd|/exec|system\(|passthru\(|eval\(|base64_decode", re.I),     "Remote Code Execution"),
]

def classify(path: str, query: str, payload: str) -> str:
    text = f"{path}?{query} {payload}".lower()
    for pattern, label in ATTACK_PATTERNS:
        if pattern.search(text):
            return label
    return "Petición web genérica"
```

Luego en la función `parse_line`, cambia la línea que asigna `attack_type`:

```python
# Antes:
attack_type = f"Petición web {method}"

# Después:
attack_type = classify(path, data.get("query", ""), data.get("payload", ""))
```

### Verificar que funciona

Reinicia el collector y lanza estas peticiones de prueba:

```bash
curl "http://localhost:8080/index.php?id=1 OR 1=1--"
curl "http://localhost:8080/../../etc/passwd"
curl "http://localhost:8080/wp-login.php"
curl "http://localhost:8080/admin"
```

Luego comprueba en la base de datos:

```bash
docker exec honeypot_db psql -U honeypot_user -d honeypot_db \
  -c "SELECT attack_type, payload FROM attacks ORDER BY timestamp DESC LIMIT 10;"
```

Deberías ver `SQL Injection`, `Path Traversal`, `WordPress Scan`, `Admin Panel Scan` en vez de `Petición web GET`.

---

## Workflow Git

```bash
# Antes de empezar cada tarea
git checkout main
git pull
git checkout -b gerard/nombre-tarea

# Mientras trabajas
git add .
git commit -m "descripción del cambio"
git push -u origin gerard/nombre-tarea

# Cuando acabas: crear Pull Request en GitHub
# Sergio lo revisa y mergea a main
```

---

## Aplicar cambios en el servidor

Cuando un Pull Request se mergea a `main`, hay que actualizar el servidor manualmente:

```bash
cd /home/proyecto
git pull
docker compose build backend   # si cambiaste backend/
docker compose build collector # si cambiaste collector/
docker compose up -d
```

---

## Comandos útiles para depurar

```bash
# Ver logs del backend en tiempo real
docker compose logs -f backend

# Ver logs del collector (muestra cada ataque que procesa)
docker compose logs -f collector

# Consultar la base de datos
docker exec -it honeypot_db psql -U honeypot_user -d honeypot_db

# Reiniciar un servicio concreto
docker compose restart backend
docker compose restart collector

# Ver todos los endpoints disponibles de la API
http://192.168.1.40/api/docs
```

---

*Cualquier duda, pregunta a Sergio o abre una Issue en el repositorio de GitHub.*
