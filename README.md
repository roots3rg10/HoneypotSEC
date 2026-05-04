# Honeypot Platform

Plataforma de concienciación en ciberseguridad para PYMEs. Muestra ataques reales capturados por honeypots y forma a los empleados sobre cómo funcionan, con datos propios de la empresa.

---

## Requisitos

- Docker Engine 24+ y Docker Compose v2 (`docker compose version`)
- `openssl` disponible en el sistema (para generar el certificado TLS)
- Puerto 80 y 443 accesibles desde la red local o internet

---

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone <url-del-repo> honeypot-platform
cd honeypot-platform
```

### 2. Crear el fichero `.env`

```bash
cp .env.example .env
```

Edita `.env` y **cambia todos los valores marcados con ⚠ CAMBIAR ESTO**:

```bash
nano .env   # o el editor que prefieras
```

Variables obligatorias a cambiar:
- `POSTGRES_PASSWORD` — contraseña segura para la base de datos
- `DATABASE_URL` y `DATABASE_SYNC_URL` — actualizar con la nueva contraseña
- `SECRET_KEY` — clave aleatoria: `openssl rand -hex 32`
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` — credenciales del primer administrador
- `DOMAIN` — IP o dominio del servidor (ej: `192.168.1.10` o `honeypot.empresa.com`)
- `ALLOWED_ORIGINS` — igual que DOMAIN pero con `https://` delante

### 3. Generar certificado TLS

Para **desarrollo / demo** (certificado auto-firmado):
```bash
bash nginx/generate-cert.sh
```

Para **producción con Let's Encrypt** (dominio público necesario):
```bash
# Instala certbot si no lo tienes
sudo apt install certbot
sudo certbot certonly --standalone -d tu.dominio.com

# Copia los certificados
sudo cp /etc/letsencrypt/live/tu.dominio.com/fullchain.pem nginx/certs/cert.pem
sudo cp /etc/letsencrypt/live/tu.dominio.com/privkey.pem   nginx/certs/key.pem
sudo chmod 644 nginx/certs/cert.pem
sudo chmod 600 nginx/certs/key.pem
```

### 4. Arrancar la plataforma

**Producción** (con honeypots reales):
```bash
docker compose up -d
```

**Demo** (sin honeypots, con datos simulados):
```bash
docker compose -f docker-compose.demo.yml up -d
```

### 5. Verificar que todo está healthy

```bash
docker compose ps
```

Todos los servicios deben mostrar `healthy` o `running`. La primera vez que arranca el backend puede tardar 30-60 segundos en crear el usuario admin.

---

## Primer acceso

Abre el navegador en `https://<IP-o-dominio>` (acepta la advertencia del certificado auto-firmado si usas uno en desarrollo).

- **URL:** `https://<tu-dominio>`
- **Usuario:** el valor de `ADMIN_USERNAME` en tu `.env` (por defecto `admin`)
- **Contraseña:** el valor de `ADMIN_PASSWORD` en tu `.env`

**Crea empleados** desde la interfaz de administración con rol `employee`. Los empleados solo ven los módulos formativos y su progreso.

---

## Cómo actualizar

```bash
git pull
docker compose down
docker compose up -d --build
```

Los datos de la base de datos se conservan en el volumen `postgres_data`.

---

## Troubleshooting

**El backend no arranca / error de conexión a BD**
```bash
docker compose logs backend
docker compose logs db
```
Comprueba que `DATABASE_URL` en `.env` tiene el mismo usuario y contraseña que `POSTGRES_USER` / `POSTGRES_PASSWORD`.

**No puedo acceder a la web (timeout)**
- Verifica que los puertos 80 y 443 no están bloqueados por el firewall del servidor.
- Comprueba que nginx está en `running`: `docker compose ps nginx`.

**El certificado da error en el navegador**
- Con certificado auto-firmado es normal en desarrollo: haz clic en "Avanzado → Continuar".
- En producción, asegúrate de que el certificado de Let's Encrypt es válido y no ha expirado.

**Error 401 al hacer login**
- Verifica que `ADMIN_PASSWORD` en `.env` es la que pusiste en el primer arranque.
- Si cambiaste la contraseña después del primer arranque, necesitas actualizar el hash en la BD:
  ```bash
  docker compose exec backend python3 -c "
  from security import hash_password; print(hash_password('nueva_contraseña'))
  "
  # Luego actualiza en la BD con el hash resultante
  docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB \
    -c "UPDATE users SET hashed_password='<hash>' WHERE username='admin';"
  ```

**Los honeypots no capturan ataques**
- Comprueba los logs del collector: `docker compose logs collector -f`
- Revisa que los volúmenes de logs están montados correctamente: `docker compose exec collector ls /logs/`

**Quiero resetear la base de datos (datos de producción incluidos)**
```bash
docker compose down -v   # ⚠ borra TODOS los volúmenes
docker compose up -d
```

---

## Para demo vs producción

| Aspecto               | `docker-compose.yml`         | `docker-compose.demo.yml`     |
|-----------------------|------------------------------|-------------------------------|
| Honeypots activos     | Sí (capturan ataques reales) | No                            |
| Datos de ataques      | Reales                       | Simulados (20 ataques)        |
| Puertos expuestos     | 80, 443                      | 80, 443                       |
| Ideal para            | Instalación en cliente       | Presentaciones, evaluaciones  |
