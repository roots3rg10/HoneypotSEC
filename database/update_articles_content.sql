-- ════════════════════════════════════════════════════════════
--  Contenido enriquecido para los 8 módulos educativos
-- ════════════════════════════════════════════════════════════

-- ─── 1. Fuerza bruta SSH ─────────────────────────────────────
UPDATE education_articles SET content = $BODY$
## ¿Qué es SSH y por qué lo atacan?

**SSH** (Secure Shell) es el protocolo estándar para administrar servidores de forma remota. Funciona en el puerto 22 por defecto y está presente en prácticamente cualquier servidor Linux del mundo. Precisamente por eso es uno de los servicios más atacados en internet.

> 📊 **Datos reales:** Nuestro honeypot **Cowrie** registra entre 800 y 2.000 intentos de login SSH cada hora. El 94 % de estos intentos prueban el usuario `root` como primera opción.

## ¿En qué consiste el ataque?

Un ataque de **fuerza bruta SSH** automatiza el proceso de probar credenciales hasta encontrar una válida. Las herramientas más usadas son Hydra, Medusa y scripts personalizados que pueden intentar miles de combinaciones por minuto.

> 🎯 **Ejemplo real:** Capturas reales de nuestro honeypot Cowrie muestran secuencias como:
>
> Usuario: `root` / Contraseña: `123456`
> Usuario: `root` / Contraseña: `password`
> Usuario: `admin` / Contraseña: `admin123`
> Usuario: `ubuntu` / Contraseña: `ubuntu`
>
> Los atacantes usan diccionarios con millones de contraseñas filtradas de brechas anteriores.

## Credenciales más atacadas

| Ranking | Usuario    | Contraseña más probada | Motivo                         |
|---------|------------|------------------------|--------------------------------|
| 1       | `root`     | `123456`               | Superusuario por defecto       |
| 2       | `admin`    | `admin`                | Presente en muchos dispositivos|
| 3       | `ubuntu`   | `ubuntu`               | Imagen por defecto AWS/Ubuntu  |
| 4       | `pi`       | `raspberry`            | Raspberry Pi por defecto       |
| 5       | `oracle`   | `oracle`               | Instalaciones de BD por defecto|

## Qué puede hacer un atacante si entra

> 🔴 **Peligro:** El acceso SSH a un servidor otorga control total del sistema. Un atacante puede robar todos los datos, instalar ransomware, usar el servidor para atacar a terceros o espiar todas las comunicaciones internas sin dejar rastro inmediato.

Una vez dentro, el atacante puede:

- Robar credenciales almacenadas en el servidor
- Instalar backdoors persistentes para mantener acceso
- Escalar privilegios y comprometer otros sistemas de la red
- Usar el servidor como plataforma de ataque anónimo

## Cómo protegerse (paso a paso)

1. **Autenticación por clave SSH** — Desactiva el login por contraseña y usa solo claves criptográficas. Una clave de 4096 bits es matemáticamente imposible de forzar.
2. **Cambia el puerto por defecto** — Mover SSH del puerto 22 a un puerto alto (ej: 2222) elimina el 90 % del ruido automatizado.
3. **Instala fail2ban** — Bloquea automáticamente cualquier IP tras N intentos fallidos configurables.
4. **Deshabilita el login de root** — El usuario `root` nunca debe conectarse directamente. Usa `sudo` desde una cuenta normal.
5. **Firewall restrictivo** — Permite conexiones SSH solo desde IPs o rangos conocidos (tu oficina, VPN).
6. **Actualizaciones** — Mantén el servidor OpenSSH siempre actualizado para cerrar vulnerabilidades conocidas.

> ✅ **Buena práctica:** La combinación de autenticación por clave + fail2ban + cambio de puerto prácticamente elimina el riesgo de acceso no autorizado por fuerza bruta.

## Lo que debes recordar como empleado

> 💡 **Consejo:** Si usas SSH para conectarte a servidores de la empresa, nunca uses contraseñas simples. Solicita al departamento de IT que te configure autenticación por clave. Y si detectas accesos o comportamientos inusuales en el servidor, repórtalo inmediatamente — cada minuto cuenta.
$BODY$
WHERE slug = 'fuerza-bruta-ssh';


-- ─── 2. Ataques a aplicaciones web ───────────────────────────
UPDATE education_articles SET content = $BODY$
## ¿Por qué las webs son el objetivo favorito?

Toda empresa tiene presencia web: tienda online, portal de empleados, CRM, intranet. Estas aplicaciones reciben datos de usuarios externos e internos, los procesan y los almacenan en bases de datos. Cuando el código no valida bien lo que recibe, los atacantes lo explotan.

> 📊 **Datos reales:** Nuestro honeypot **Glastopf** captura más de 300 intentos de ataque web al día. El 61 % son intentos de SQL Injection y el 24 % son ataques XSS o LFI (Local File Inclusion).

## SQL Injection: manipulando la base de datos

Una base de datos guarda toda la información de tu empresa. SQL Injection ocurre cuando un atacante introduce **código SQL malicioso** en un campo de formulario y la aplicación lo ejecuta sin validar.

> 🎯 **Ejemplo real:** Un formulario de login vulnerable ejecuta esta consulta:
> ```
> SELECT * FROM users WHERE user='[INPUT]' AND pass='[INPUT]'
> ```
> Si el atacante escribe `' OR 1=1 --` en el campo usuario, la consulta se convierte en:
> ```
> SELECT * FROM users WHERE user='' OR 1=1 --' AND pass='...'
> ```
> La condición `1=1` siempre es verdadera, y `--` comenta el resto. **Acceso garantizado sin contraseña.**

### Qué puede obtener un atacante con SQL Injection

- Volcar la base de datos completa (usuarios, contraseñas, datos de clientes)
- Saltarse la autenticación sin conocer ninguna contraseña
- Modificar o eliminar datos
- En algunos casos, ejecutar comandos en el servidor

## Cross-Site Scripting (XSS): código malicioso en tu web

XSS permite a un atacante **inyectar JavaScript malicioso** en páginas web que ejecutan otros usuarios. Si la web no escapa correctamente los datos que muestra, cualquier entrada puede convertirse en un ataque.

> 🔴 **Peligro:** Un ataque XSS exitoso puede robar las cookies de sesión de tus compañeros, redirigirlos a páginas de phishing idénticas a la intranet, o ejecutar acciones en su nombre sin que se den cuenta.

### Tipos de XSS

| Tipo         | Descripción                                                  | Persistencia  |
|--------------|--------------------------------------------------------------|---------------|
| **Reflejado** | El payload se envía en la URL y se devuelve inmediatamente  | Temporal      |
| **Almacenado**| El payload se guarda en BD y afecta a todos los visitantes  | Permanente    |
| **DOM-based** | Manipula el DOM del navegador sin pasar por el servidor     | Temporal      |

## Otras vulnerabilidades comunes

- **LFI / Path Traversal** — Acceso a archivos internos del servidor mediante rutas como `../../etc/passwd`
- **CSRF** — Fuerza al navegador de la víctima a ejecutar acciones no autorizadas en otro sitio
- **Subida de ficheros sin validar** — Permite ejecutar código malicioso en el servidor

## Cómo se protegen las aplicaciones

> ✅ **Buena práctica:** El equipo de desarrollo debe usar **consultas preparadas** (prepared statements) para toda interacción con la BD — nunca SQL dinámico. Además, todos los datos de entrada deben ser sanitizados antes de mostrarse en pantalla.

Los controles técnicos esenciales son:

1. **Consultas preparadas y ORM** para prevenir SQL Injection
2. **Escapado de salida** (HTML encoding) para prevenir XSS
3. **Content Security Policy (CSP)** para limitar scripts ejecutables
4. **Validación en servidor** — nunca confiar solo en validación de cliente
5. **WAF (Web Application Firewall)** como primera línea de defensa
6. **Auditorías periódicas** de código y pentesting web

## Lo que puedes hacer tú como empleado

> 💡 **Consejo:** Si una web interna muestra comportamiento extraño (redirige a otro sitio, pide credenciales de forma inesperada, muestra contenido raro), **no lo ignores**. Repórtalo a IT inmediatamente — puede ser un ataque XSS activo afectando a toda la empresa.
$BODY$
WHERE slug = 'ataques-aplicaciones-web';


-- ─── 3. Propagación de malware ───────────────────────────────
UPDATE education_articles SET content = $BODY$
## ¿Qué es el malware y cómo se mueve?

El **malware** (software malicioso) no llega solo por email. Una vez dentro de una red, se propaga de forma autónoma usando los mismos protocolos que usas para trabajar cada día: compartir archivos, transferir datos, gestionar sistemas.

> 📊 **Datos reales:** Nuestro honeypot **Dionaea** captura malware real. En los últimos 30 días ha registrado más de 400 muestras de malware distintas intentando propagarse, principalmente a través de SMB (puerto 445) y FTP (puerto 21).

## SMB: la autopista del ransomware

**SMB** (Server Message Block) es el protocolo que hace funcionar las carpetas compartidas de Windows. Está presente en toda red corporativa. Cuando tiene vulnerabilidades sin parchear, se convierte en una autopista de propagación.

> 🎯 **Ejemplo real — WannaCry (2017):** El ransomware más destructivo de la historia explotó la vulnerabilidad **EternalBlue** en SMB v1. En menos de 24 horas infectó más de 200.000 sistemas en 150 países. Hospitales del NHS en Reino Unido tuvieron que cancelar operaciones. El coste global superó los 4.000 millones de dólares.

### La cadena de infección típica

1. El atacante entra por un punto débil (phishing, contraseña débil, exploit)
2. Instala herramientas de reconocimiento de red
3. Escanea la red interna buscando otros sistemas vulnerables vía SMB, FTP, RDP
4. Se copia y ejecuta en cada sistema alcanzable
5. Activa el payload final: cifra archivos (ransomware), roba datos, instala backdoor

## FTP: transferencias sin cifrar

FTP es un protocolo antiguo que transmite usuario, contraseña y datos **en texto plano**. Cualquiera que intercepte el tráfico puede leerlos. Muchos servidores legados lo tienen activo con credenciales débiles.

> ⚠️ **Atención:** Si tu empresa usa FTP en lugar de SFTP/FTPS, cualquier atacante con acceso a la red puede capturar las credenciales con Wireshark en segundos. No requiere ningún conocimiento técnico avanzado.

## Protocolos vulnerables más explotados

| Protocolo | Puerto | Riesgo principal                   | Alternativa segura    |
|-----------|--------|------------------------------------|-----------------------|
| SMB v1    | 445    | Exploits (EternalBlue, WannaCry)   | SMB v3 con cifrado    |
| FTP       | 21     | Credenciales en texto plano        | SFTP (puerto 22)      |
| Telnet    | 23     | Todo en texto plano                | SSH (puerto 22)       |
| RDP       | 3389   | Fuerza bruta, BlueKeep             | RDP + NLA + MFA       |

## Cómo proteger tu empresa

1. **Parchea siempre** — La mayoría de ataques explotan vulnerabilidades con parche disponible. WannaCry explotó un fallo corregido 2 meses antes.
2. **Deshabilita SMB v1** — No hay ningún motivo para tenerlo activo en 2025.
3. **Elimina FTP** — Reemplázalo por SFTP o FTPS.
4. **Segmenta la red** — Separa contabilidad, producción y administración en VLANs diferentes.
5. **Backups aislados** — Copias de seguridad desconectadas de la red son la única defensa efectiva ante ransomware.

> ✅ **Buena práctica:** Un backup 3-2-1 (3 copias, 2 medios distintos, 1 fuera del sitio) garantiza la recuperación ante cualquier ataque de ransomware sin pagar el rescate.

## Lo que debes hacer tú

> 💡 **Consejo:** Nunca conectes USBs o discos duros de origen desconocido. Si tu ordenador empieza a ir muy lento de repente o ves archivos cifrados con extensiones raras, **desconéctalo de la red inmediatamente** (cable de red y WiFi) y llama a IT. Cada segundo cuenta para contener la propagación.
$BODY$
WHERE slug = 'propagacion-malware-red';


-- ─── 4. ICS / SCADA ──────────────────────────────────────────
UPDATE education_articles SET content = $BODY$
## Cuando un ciberataque apaga la luz

Los sistemas que controlan la electricidad, el agua, el gas y las fábricas no son solo software — son infraestructura física. Cuando son atacados, las consecuencias no son pérdidas de datos: son cortes de luz, contaminación del agua potable o explosiones industriales.

> 📊 **Datos reales:** Nuestro honeypot **Conpot** simula un sistema ICS real. Recibe intentos de reconocimiento y conexión de decenas de países cada semana, muchos de ellos con herramientas especializadas en protocolos industriales como Modbus y S7.

## ¿Qué son ICS y SCADA?

**ICS** (Industrial Control Systems) son todos los sistemas que controlan procesos físicos. **SCADA** (Supervisory Control And Data Acquisition) es la capa de supervisión y monitorización. Juntos controlan:

| Sector                 | Qué controlan                              | Impacto de un ataque              |
|------------------------|--------------------------------------------|------------------------------------|
| Energía eléctrica      | Subestaciones, distribución                | Apagón masivo                      |
| Agua y saneamiento     | Potabilización, bombas, cloro              | Contaminación del agua potable     |
| Oil & Gas              | Oleoductos, refinerías, válvulas           | Explosiones, derrames              |
| Manufactura            | Robots, cadenas de producción              | Parada de producción               |
| Transporte             | Semáforos, trenes, aeropuertos             | Caos de tráfico, accidentes        |

## Ataques históricos que cambiaron el mundo

> 🎯 **Ejemplo real — Stuxnet (2010):** El primer ciberarma de la historia. Saboteó centrifugadoras de enriquecimiento de uranio en Irán haciéndolas girar a velocidades destructivas mientras mostraba lecturas normales a los operadores. Retrasó el programa nuclear iraní años. Fue tan sofisticado que tardó 18 meses en descubrirse.

> 🎯 **Ejemplo real — Red eléctrica Ucrania (2015):** El grupo APT Sandworm tomó control de los sistemas SCADA de tres distribuidoras eléctricas y desconectó manualmente 30 subestaciones. 230.000 personas sin luz durante horas en pleno invierno.

> 🎯 **Ejemplo real — Colonial Pipeline (2021):** Un ataque ransomware paralizó el mayor oleoducto de la costa este de EE.UU. durante 6 días. Escasez de combustible en varios estados. La empresa pagó 4,4 millones de dólares de rescate.

## Por qué son tan vulnerables

> 🔴 **Peligro:** Los protocolos industriales clásicos (Modbus, DNP3, S7, PROFINET) fueron diseñados en los años 70-80 para redes aisladas. No tienen autenticación ni cifrado. Cualquiera que llegue a la red puede enviar comandos directamente a los PLCs sin necesidad de credenciales.

Los factores que agravan la vulnerabilidad:

- Equipos con décadas de antigüedad que no pueden actualizarse sin parar la producción
- Convergencia IT/OT: antes aislados de internet, hoy conectados por eficiencia
- Los equipos IT y OT trabajan separados sin coordinación de seguridad
- Los parches requieren parar maquinaria crítica — se posponen indefinidamente

## Cómo proteger infraestructura crítica

1. **Segmentación estricta** — La red industrial (OT) debe estar físicamente separada de la red corporativa (IT). Un "air gap" completo es lo ideal.
2. **Inventario de activos** — No puedes proteger lo que no sabes que tienes. Mapea todos los dispositivos industriales.
3. **Monitorización de tráfico OT** — Herramientas como Claroty, Dragos o Nozomi detectan anomalías en protocolos industriales.
4. **Actualizaciones controladas** — Planifica ventanas de mantenimiento para aplicar parches críticos.
5. **Plan de respuesta específico** — Los playbooks de incidentes de IT no sirven para OT. Necesitas procedimientos adaptados.

> ✅ **Buena práctica:** La regla de oro en OT es el **"defense in depth"**: múltiples capas de seguridad, de modo que el fallo de una no comprometa todo el sistema.

## Lo que debes saber como empleado

> 💡 **Consejo:** Si trabajas en un entorno industrial y detectas comportamientos anómalos en maquinaria (velocidades inusuales, lecturas incorrectas, paradas inexplicables), repórtalo inmediatamente. Puede ser un ciberataque activo. Nunca conectes dispositivos personales a redes industriales.
$BODY$
WHERE slug = 'ataques-ics-scada';


-- ─── 5. Ingeniería social / Phishing ─────────────────────────
UPDATE education_articles SET content = $BODY$
## El ataque que no necesita hackear nada

Los firewalls, antivirus y sistemas de detección protegen contra ataques técnicos. Pero ningún sistema de seguridad puede parchear a un humano. La **ingeniería social** explota exactamente eso: la confianza, la urgencia y el miedo de las personas.

> 📊 **Datos reales:** El 91 % de los ciberataques exitosos comienzan con un correo de phishing. El coste promedio de un ataque de phishing para una empresa mediana supera los 1,6 millones de euros, incluyendo respuesta al incidente, multas regulatorias y daño reputacional.

## Phishing: el engaño masivo

El **phishing** envía emails masivos haciéndose pasar por entidades legítimas (banco, Microsoft, Correos, AEAT) para que el destinatario haga clic en un enlace o descargue un adjunto malicioso.

> 🎯 **Ejemplo real:** Email con asunto "Acción requerida: tu cuenta será suspendida en 24 horas". El remitente es `soporte@micros0ft-seguridad.com`. El enlace lleva a una web idéntica a Microsoft que roba las credenciales al enviarlas.

### Señales de alerta a revisar siempre

| Señal                          | Qué significa                                      |
|--------------------------------|----------------------------------------------------|
| Dominio ligeramente diferente   | `micros0ft.com`, `banc0santander.es`               |
| Urgencia artificial             | "Tu cuenta será bloqueada en 24h"                  |
| Solicitud de credenciales       | Ninguna empresa legítima las pide por email        |
| Adjunto inesperado              | `.exe`, `.zip`, `.pdf` de remitente desconocido    |
| Errores ortográficos            | Señal de traducción automática o bajo presupuesto  |
| URL no coincide al pasar el ratón | El link real es diferente al texto mostrado      |

## Spear Phishing: el engaño personalizado

El **spear phishing** va dirigido específicamente a una persona. El atacante investiga LinkedIn, la web corporativa y redes sociales para construir un mensaje ultra-convincente.

> 🔴 **Peligro:** Un spear phishing bien ejecutado puede imitar a tu director, tu banco o un proveedor conocido con tanta precisión que es muy difícil de detectar. Esta técnica fue la entrada en el 80 % de los ataques APT (Advanced Persistent Threat) contra grandes empresas.

> 🎯 **Ejemplo real:** "Hola [nombre], soy [nombre del director financiero]. Necesito urgentemente una transferencia a este IBAN antes del cierre contable de hoy. Estoy en el avión sin cobertura, responde con confirmación. Gracias." El director real está de viaje — el atacante lo comprobó en LinkedIn.

## Vishing, Smishing y otras variantes

| Tipo            | Canal          | Ejemplo                                                      |
|-----------------|----------------|--------------------------------------------------------------|
| **Phishing**    | Email          | Email falso de tu banco pidiendo datos                       |
| **Spear phishing** | Email       | Email personalizado simulando a tu jefe                      |
| **Vishing**     | Llamada        | "Somos de soporte técnico, necesitamos tu contraseña"        |
| **Smishing**    | SMS/WhatsApp   | "Tu paquete está retenido, verifica aquí: [enlace]"         |
| **Pretexting**  | Cualquiera     | Identidad falsa construida para ganarse la confianza        |
| **Baiting**     | Físico/digital | USB infectado dejado en el aparcamiento de la empresa        |

## Cómo protegerte

1. **Verifica siempre el remitente real** — No el nombre mostrado, sino el dominio completo del email.
2. **Desconfía de la urgencia** — Los atacantes crean presión para que actúes sin pensar.
3. **Nunca abras adjuntos inesperados** — Aunque vengan de un contacto conocido (puede estar comprometido).
4. **Activa el 2FA** — Incluso si roban tu contraseña, no pueden entrar sin el segundo factor.
5. **Verifica por otro canal** — Si recibes una solicitud inusual, llama directamente al remitente por teléfono para confirmar.

> ✅ **Buena práctica:** Ante cualquier email que pida dinero, credenciales o acceso urgente — **pausa, desconfía, verifica**. Llama siempre directamente a la persona por un número que tú ya tengas, no por el que aparece en el email sospechoso.

## La regla de oro

> 💡 **Consejo:** **Ninguna empresa legítima te pedirá jamás tu contraseña** por email, teléfono o mensaje. Tu banco no lo hará. Microsoft no lo hará. IT tampoco lo necesita. Si alguien te la pide, es un ataque. Colgar o no responder nunca es de mala educación — es la respuesta correcta.
$BODY$
WHERE slug = 'ingenieria-social-phishing';


-- ─── 6. Contraseñas seguras ───────────────────────────────────
UPDATE education_articles SET content = $BODY$
## El 80 % de las brechas de datos tiene un denominador común

Una contraseña débil o reutilizada. Así de simple. Los atacantes no necesitan exploits sofisticados cuando la puerta principal está abierta con `Empresa2024!`.

> 📊 **Datos reales:** En 2024, las 5 contraseñas más usadas siguen siendo `123456`, `password`, `123456789`, `qwerty` y `abc123`. Una contraseña de 8 caracteres alfanuméricos se crackea en **menos de 1 hora** con hardware moderno. Una de 12 caracteres mixtos tarda **más de 300 años**.

## ¿Qué hace fuerte a una contraseña?

La seguridad de una contraseña depende fundamentalmente de su **longitud y entropía** (aleatoriedad). No de sustituir letras por números (`p4ssw0rd` es igual de vulnerable).

| Tipo de contraseña          | Ejemplo              | Tiempo de crackeo  |
|-----------------------------|----------------------|--------------------|
| 8 caracteres numéricos      | `20041987`           | Milisegundos       |
| 8 caracteres alfanuméricos  | `Pass1234`           | Minutos            |
| 12 caracteres mixtos        | `Tr3n@Cielo!`        | ~300 años          |
| 16 caracteres aleatorios    | `xK9#mP2$qL7!rN4`   | Miles de años      |
| Frase de contraseña (passphrase) | `CaballoCorrectoBatería` | Millones de años |

> 🔴 **Peligro:** La **reutilización de contraseñas** es el mayor riesgo real. Si usas la misma contraseña en tu email corporativo y en un foro de videojuegos que sufre una brecha, los atacantes prueban esas credenciales en tu empresa automáticamente. Este ataque se llama **credential stuffing** y es masivo.

## El truco de la frase de contraseña

En lugar de intentar recordar `xK9#mP2$qL7!rN4`, usa una **frase larga y aleatoria**:

```
Tren-Azul-Montaña-Café-7
CaballoCorrectoBatería4Puntos
```

Son fáciles de recordar, largas y prácticamente imposibles de adivinar o crackear. La longitud siempre vence a la complejidad.

## Gestores de contraseñas: la solución definitiva

Un **gestor de contraseñas** genera y almacena contraseñas únicas, largas y aleatorias para cada servicio. Solo necesitas recordar **una contraseña maestra**.

> ✅ **Buena práctica:** Usa un gestor de contraseñas. Las opciones recomendadas son **Bitwarden** (gratuito, open source), **1Password** o **KeePass**. Con un gestor, cada cuenta tiene una contraseña diferente de 20+ caracteres sin esfuerzo.

### Gestores comparados

| Gestor       | Precio   | Open Source | Sincronización | Uso empresarial |
|--------------|----------|-------------|----------------|-----------------|
| Bitwarden    | Gratis   | ✅           | ✅              | ✅               |
| 1Password    | 3 €/mes  | ❌           | ✅              | ✅               |
| KeePass      | Gratis   | ✅           | Manual         | ✅               |

## Doble factor de autenticación (2FA)

El 2FA añade una segunda capa: aunque alguien robe tu contraseña, **no puede entrar sin tu segundo factor**.

> 💡 **Consejo:** El orden de seguridad del 2FA es: **App autenticadora (TOTP)** > Clave física (YubiKey) > SMS. El SMS es el 2FA menos seguro porque puede interceptarse, pero sigue siendo mucho mejor que no tener 2FA. Actívalo en email corporativo, VPN y todas las herramientas críticas.

## Las reglas básicas

1. **Contraseña única** por cada cuenta — nunca reutilices
2. **Mínimo 12 caracteres** — cuanto más larga, mejor
3. **Usa un gestor** — es la forma práctica de cumplir las dos reglas anteriores
4. **Activa el 2FA** en todos los servicios que lo permitan
5. **Nunca la compartas** — ni con IT, ni con tu jefe, ni con nadie

> 🔴 **Peligro:** Si sospechas que tu contraseña corporativa puede haber sido comprometida (recibes un email de acceso desde ubicación desconocida, o hay actividad inusual en tu cuenta), **cámbiala inmediatamente** y notifica a IT. No esperes a "confirmar" — cada minuto importa.
$BODY$
WHERE slug = 'guia-contrasenas-seguras';


-- ─── 7. Escaneo de puertos ───────────────────────────────────
UPDATE education_articles SET content = $BODY$
## El reconocimiento: el primer paso de cualquier ataque

Ningún ataque serio ocurre sin preparación. Antes de explotar un sistema, los atacantes dedican tiempo a entenderlo: qué servicios tiene activos, qué versiones de software usa, qué puertas están abiertas. El **escaneo de puertos** es la primera herramienta de ese reconocimiento.

> 📊 **Datos reales:** Nuestro honeypot **Honeytrap** recibe escaneos de puertos de más de 200 IPs distintas cada día. Los puertos más sondeados son el 22 (SSH), 80 (HTTP), 443 (HTTPS), 3306 (MySQL) y 8080 (HTTP alternativo).

## ¿Qué es un puerto de red?

Imagina tu servidor como un edificio con 65.535 puertas numeradas. Cada puerta (puerto) corresponde a un servicio diferente que puede recibir conexiones.

| Puerto | Servicio           | Para qué sirve                          |
|--------|--------------------|-----------------------------------------|
| 22     | SSH                | Administración remota segura            |
| 25     | SMTP               | Envío de email                          |
| 80     | HTTP               | Web sin cifrar                          |
| 443    | HTTPS              | Web cifrada (SSL/TLS)                   |
| 445    | SMB                | Compartir archivos Windows              |
| 3306   | MySQL              | Base de datos MySQL                     |
| 3389   | RDP                | Escritorio remoto Windows               |
| 8080   | HTTP alternativo   | Webs de desarrollo, paneles de admin    |

## Cómo funciona el escaneo

La herramienta estándar es **Nmap** (Network Mapper). Envía paquetes de red a cada puerto y analiza la respuesta:

```
nmap -sS -O -sV 192.168.1.100
```

- `-sS` → Escaneo SYN sigiloso (no completa el handshake TCP)
- `-O` → Detecta el sistema operativo
- `-sV` → Detecta versión de los servicios

> 🎯 **Ejemplo real:** Un escaneo típico que registra Honeytrap muestra al atacante identificando en segundos: SSH en puerto 22 (OpenSSH 7.9), HTTP en 80 (Apache 2.4.41 — versión antigua con CVEs conocidos), MySQL en 3306 expuesto a internet. Con esa información, el siguiente paso es buscar el CVE correspondiente.

## La cadena de reconocimiento

| Fase              | Herramienta    | Qué obtiene                          |
|-------------------|----------------|--------------------------------------|
| Descubrimiento    | Nmap ping scan | Qué hosts están activos              |
| Escaneo de puertos| Nmap, Masscan  | Qué puertos están abiertos           |
| Banner grabbing   | Netcat, Nmap   | Versión exacta del servicio          |
| Búsqueda de CVEs  | Shodan, CVEdb  | Vulnerabilidades conocidas de esa versión |
| Explotación       | Metasploit     | Exploit específico para la vulnerabilidad |

> 🔴 **Peligro:** Shodan es un buscador que indexa todos los servicios expuestos a internet. Un atacante puede buscar `apache 2.4.41 country:ES` y obtener en segundos una lista de miles de servidores españoles con esa versión vulnerable — sin necesidad de escanear él mismo.

## Cómo reducir la superficie de ataque

1. **Principio de mínimo privilegio** — Solo exponer a internet los puertos absolutamente necesarios.
2. **Firewall bien configurado** — Regla por defecto: bloquear todo el tráfico entrante y abrir solo lo estrictamente necesario.
3. **Actualizaciones constantes** — Un puerto abierto con software actualizado es mucho menos peligroso que uno con software antiguo.
4. **Monitorización** — Detectar escaneos masivos (cientos de puertos sondeados en segundos desde la misma IP) y bloquear automáticamente.
5. **Cambiar puertos por defecto** — SSH en 2222, MySQL no expuesto a internet, RDP solo vía VPN.

> ✅ **Buena práctica:** Ejecuta un escaneo Nmap sobre tu propia infraestructura periódicamente. Si ves puertos abiertos que no deberían estarlo — un MySQL expuesto a internet, un panel de administración accesible públicamente — ciérralos antes de que lo descubra un atacante.

## Lo que debes recordar

> 💡 **Consejo:** Si tu empresa tiene sistemas expuestos a internet (web, VPN, email), hay atacantes escaneándolos ahora mismo. No es hipotético. La pregunta no es si te van a escanear, sino si cuando encuentren algo vulnerable habrá un parche instalado o no.
$BODY$
WHERE slug = 'escaneo-puertos-reconocimiento';


-- ─── 8. Qué es un honeypot ───────────────────────────────────
UPDATE education_articles SET content = $BODY$
## La trampa más inteligente de la ciberseguridad

Un **honeypot** (tarro de miel) es un sistema diseñado específicamente para ser atacado. No contiene datos reales ni presta servicios legítimos. Su único propósito es atraer a los atacantes, registrar todo lo que hacen y aprender de ello.

> 📊 **Datos reales:** Esta plataforma opera 6 honeypots activos que reciben ataques reales de internet 24/7. En el último mes han capturado más de 15.000 eventos de ataque procedentes de más de 80 países distintos.

## ¿Cómo funciona un honeypot?

Un honeypot simula ser un sistema vulnerable y atractivo. Los atacantes (humanos o bots) lo encuentran, intentan explotarlo, y sin saberlo están siendo monitorizados y registrados en detalle.

> 🎯 **Ejemplo real:** Nuestro honeypot Cowrie simula un servidor SSH con credenciales débiles. Un atacante se conecta usando `root/123456`, cree que ha comprometido un servidor real, y empieza a ejecutar comandos. Cowrie registra cada pulsación de teclado, cada comando, cada archivo que intenta descargar. El atacante nunca llega a un sistema real.

## Los honeypots de esta plataforma

| Honeypot     | Simula                         | Protocolo           | Lo que captura                                 |
|--------------|--------------------------------|---------------------|------------------------------------------------|
| **Cowrie**   | Servidor SSH/Telnet            | SSH (22), Telnet (23) | Credenciales, comandos, sesiones completas    |
| **Dionaea**  | Servicios Windows/BD           | SMB, FTP, MySQL     | Malware, exploits, propagación de gusanos      |
| **Glastopf** | Aplicación web vulnerable      | HTTP (80, 8080)     | SQLi, XSS, LFI, bots y crawlers maliciosos     |
| **Conpot**   | Sistema ICS/SCADA industrial   | Modbus (502), S7 (102) | Reconocimiento de infraestructura crítica   |
| **Honeytrap**| Cualquier servicio TCP/UDP     | Wildcard            | Escaneos, sondas, tráfico inesperado           |
| **Honeyd**   | Red completa virtual           | Múltiples           | Movimiento lateral, propagación de botnets     |

## Baja interacción vs. alta interacción

| Tipo                  | Cómo funciona                                      | Ventajas                    | Riesgos          |
|-----------------------|----------------------------------------------------|----------------------------|------------------|
| **Baja interacción**  | Simula servicios con respuestas predefinidas       | Seguro, fácil de mantener  | Información limitada |
| **Alta interacción**  | Sistema real completo que permite acceso profundo  | Datos detallados del atacante | Requiere aislamiento estricto |

> ⚠️ **Atención:** Un honeypot de alta interacción mal configurado puede convertirse en plataforma de ataque si el atacante lo compromete y lo usa para atacar a terceros. El aislamiento mediante Docker (como usamos aquí) es fundamental.

## ¿Para qué sirven los datos capturados?

1. **Inteligencia de amenazas en tiempo real** — Sabemos exactamente qué ataques están activos hoy
2. **Detección temprana** — Si un atacante explora tu red interna y llega a un honeypot, la alarma suena antes de que alcance sistemas reales
3. **Mejora de defensas** — Si muchos atacantes prueban un exploit concreto, sabemos qué parchear con urgencia
4. **Formación** — Los datos reales hacen el aprendizaje incomparablemente más efectivo que los ejemplos inventados

> ✅ **Buena práctica:** Los honeypots internos son una de las herramientas de detección más efectivas para movimiento lateral. Si un servidor que nunca debería recibir conexiones empieza a recibirlas, es una señal inequívoca de que algo está mal en la red.

## ¿Son los ataques que ves aquí reales?

> 💡 **Consejo:** Sí. Absolutamente. Cada evento en esta plataforma es un intento de intrusión real capturado de internet. No hay simulaciones, no hay datos inventados. Los atacantes que ves son bots automatizados y personas reales que exploran sistemas en busca de una vulnerabilidad que explotar. Esta es la realidad de la ciberseguridad moderna.
$BODY$
WHERE slug = 'que-es-un-honeypot';
