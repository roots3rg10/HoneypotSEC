-- ════════════════════════════════════════════════════════════
--  Contenido educativo inicial
-- ════════════════════════════════════════════════════════════

INSERT INTO education_articles (title, slug, category, difficulty, summary, content, honeypot_rel, tags) VALUES

-- ─── Artículo 1: Fuerza bruta SSH ────────────────────────────────
(
  'Ataques de fuerza bruta SSH: qué son y cómo protegerse',
  'fuerza-bruta-ssh',
  'Ataques de red',
  'principiante',
  'Los ataques de fuerza bruta SSH son uno de los más comunes en internet. Aprende cómo funcionan y qué puedes hacer para que tu empresa esté protegida.',
  E'## ¿Qué es SSH?\n
SSH (Secure Shell) es el protocolo que los administradores de sistemas usan para conectarse de forma remota y segura a servidores. Funciona como una "puerta trasera segura" para gestionar máquinas sin estar físicamente delante de ellas.\n\n
## ¿En qué consiste el ataque?\n
Un ataque de **fuerza bruta SSH** ocurre cuando un atacante intenta acceder a un servidor probando miles o millones de combinaciones de usuario y contraseña automáticamente, hasta dar con la correcta. No requiere conocimientos técnicos avanzados: existen herramientas gratuitas (como Hydra o Medusa) que automatizan el proceso completo.\n\n
**Ejemplo real:** Nuestro honeypot Cowrie registra a diario intentos como estos:\n
- Usuario: `root`, Contraseña: `123456`\n
- Usuario: `admin`, Contraseña: `admin`\n
- Usuario: `ubuntu`, Contraseña: `ubuntu`\n\n
Los atacantes usan listas de contraseñas comunes con millones de entradas.\n\n
## ¿Qué puede pasar si el atacante entra?\n
Si logra acceder, puede:\n
- Robar datos confidenciales de la empresa\n
- Instalar malware o ransomware\n
- Usar el servidor para atacar a terceros\n
- Espiar las comunicaciones internas\n\n
## ¿Cómo protegerse?\n
1. **Usa contraseñas largas y complejas** — Mínimo 16 caracteres con mayúsculas, números y símbolos.\n
2. **Autenticación por clave SSH** — En lugar de contraseña, usa un par de claves criptográficas. Es mucho más seguro.\n
3. **Cambia el puerto por defecto** — SSH escucha en el puerto 22. Cambiarlo a otro reduce el ruido de ataques automatizados.\n
4. **Limita los intentos de login** — Herramientas como `fail2ban` bloquean una IP tras varios intentos fallidos.\n
5. **Deshabilita el login de root** — El usuario `root` nunca debería poder conectarse directamente por SSH.\n
6. **Firewall** — Solo permite conexiones SSH desde IPs conocidas si es posible.\n\n
## Lo que debes recordar como empleado\n
- Nunca uses contraseñas simples para acceder a sistemas de la empresa.\n
- Si administras servidores, usa siempre autenticación por clave.\n
- Reporta inmediatamente si detectas accesos sospechosos.',
  'cowrie',
  ARRAY['SSH', 'fuerza bruta', 'contraseñas', 'acceso remoto']
),

-- ─── Artículo 2: Ataques web ─────────────────────────────────────
(
  'Ataques a aplicaciones web: SQL Injection y XSS explicados',
  'ataques-aplicaciones-web',
  'Ataques web',
  'principiante',
  'Las aplicaciones web son el objetivo favorito de los atacantes. Conoce los dos ataques más frecuentes y cómo evitar que afecten a tu empresa.',
  E'## ¿Por qué atacan las webs de las empresas?\n
Las aplicaciones web (la web de tu empresa, el portal de empleados, el sistema de gestión interno) suelen contener datos valiosos: información de clientes, credenciales, datos financieros. Por eso son un objetivo prioritario.\n\n
## SQL Injection\n
Una base de datos guarda la información de tu aplicación. El lenguaje SQL es el que se usa para consultarla. Un ataque de **SQL Injection** ocurre cuando un atacante introduce código SQL malicioso en un campo de formulario (usuario, contraseña, búsqueda) para manipular la base de datos.\n\n
**Ejemplo sencillo:** Imagina un formulario de login. Si el sistema no valida bien la entrada, el atacante puede escribir en el campo usuario:\n
```\n'' OR 1=1 --\n```\nEsto puede hacer que el sistema acepte el login sin conocer la contraseña real.\n\n
**Consecuencias:** robo de toda la base de datos, eliminación de datos, acceso como administrador.\n\n
## Cross-Site Scripting (XSS)\n
El **XSS** permite a un atacante inyectar código JavaScript malicioso en una página web que luego ejecutan otros usuarios. Si la web de tu empresa no valida los datos que los usuarios introducen (comentarios, formularios, búsquedas), un atacante puede incrustar código que:\n
- Robe las cookies de sesión de otros usuarios\n
- Redirija a páginas de phishing\n
- Muestre contenido falso\n\n
## ¿Cómo nos protegemos?\n
**Como empresa:**\n
- Los desarrolladores deben validar y sanitizar siempre los datos de entrada.\n
- Usar consultas preparadas (prepared statements) en lugar de SQL dinámico.\n
- Mantener el software actualizado.\n
- Realizar auditorías de seguridad periódicas.\n\n
**Como empleado:**\n
- Sospecha si una web de la empresa muestra comportamiento extraño.\n
- No introduzcas datos sensibles en páginas que no reconozcas.\n
- Reporta formularios o páginas que parezcan modificadas.',
  'glastopf',
  ARRAY['web', 'SQL injection', 'XSS', 'aplicaciones web']
),

-- ─── Artículo 3: Malware y propagación ───────────────────────────
(
  'Cómo se propaga el malware por la red: SMB, FTP y más',
  'propagacion-malware-red',
  'Malware',
  'intermedio',
  'El malware no llega solo por email. Aprende cómo los atacantes usan protocolos de red como SMB y FTP para extenderse por toda la infraestructura de una empresa.',
  E'## ¿Qué es el malware?\n
El **malware** (software malicioso) es cualquier programa diseñado para dañar, robar información o tomar control de sistemas. Incluye virus, ransomware, troyanos, gusanos y spyware.\n\n
## Propagación por SMB\n
SMB (Server Message Block) es el protocolo que usan los sistemas Windows para compartir archivos e impresoras en red. Es el que hace funcionar las carpetas compartidas de tu oficina.\n\n
El **ransomware WannaCry** (2017) infectó más de 200.000 ordenadores en 150 países en pocas horas explotando una vulnerabilidad en SMB. Una vez dentro de una sola máquina, se extendía automáticamente a todas las demás de la red sin que ningún usuario hiciera clic en nada.\n\n
## Propagación por FTP\n
FTP es un protocolo para transferir archivos. Muchos servidores antiguos tienen FTP habilitado con credenciales débiles o anónimas. Los atacantes lo usan para:\n
- Subir archivos maliciosos al servidor\n
- Descargar datos confidenciales\n
- Usarlo como punto de apoyo para atacar otros sistemas\n\n
## La cadena de infección típica\n
1. El atacante entra por un punto débil (contraseña débil, vulnerabilidad sin parchear)\n
2. Instala herramientas de propagación\n
3. Escanea la red interna en busca de otros sistemas vulnerables\n
4. Se extiende de máquina en máquina\n
5. Activa el payload final (ransomware, robo de datos, etc.)\n\n
## Cómo proteger tu empresa\n
- **Actualiza siempre** el sistema operativo y el software. La mayoría de ataques explotan vulnerabilidades ya conocidas y parcheadas.\n
- **Segmenta la red**: los equipos de administración no deberían estar en la misma red que los puestos de trabajo.\n
- **Deshabilita SMB v1** si no lo necesitas (es la versión vulnerable que explotó WannaCry).\n
- **No uses FTP**: usa SFTP o FTPS en su lugar.\n
- **Backups regulares y desconectados**: si sufres ransomware, poder restaurar desde backup marca la diferencia.\n\n
## Lo que puedes hacer tú\n
- No conectes dispositivos desconocidos (USBs, discos duros) a equipos de la empresa.\n
- Si tu ordenador empieza a ir muy lento sin razón aparente, avisa al departamento de IT.\n
- No instales software no autorizado.',
  'dionaea',
  ARRAY['malware', 'ransomware', 'SMB', 'FTP', 'propagación']
),

-- ─── Artículo 4: ICS/SCADA ───────────────────────────────────────
(
  'Ciberataques a infraestructuras críticas: ICS y SCADA',
  'ataques-ics-scada',
  'Infraestructuras críticas',
  'avanzado',
  'Las plantas industriales, eléctricas y de agua son objetivos de ciberataques. Descubre cómo funcionan estos sistemas y por qué son tan vulnerables.',
  E'## ¿Qué son los sistemas ICS y SCADA?\n
Los sistemas de **Control Industrial (ICS)** y **SCADA** (Supervisory Control and Data Acquisition) son los que controlan infraestructuras físicas críticas: plantas eléctricas, redes de agua, oleoductos, fábricas, hospitales.\n\n
Históricamente estaban completamente aislados de internet. Hoy, por necesidades de monitorización remota y eficiencia, muchos están conectados, creando un enorme riesgo de seguridad.\n\n
## Ataques históricos reales\n
**Stuxnet (2010):** El primer ciberarma conocida. Un gusano que saboteó centrifugadoras de enriquecimiento de uranio en Irán haciéndolas girar a velocidades anómalas mientras mostraba lecturas normales a los operadores. Fue tan sofisticado que tardó años en descubrirse.\n\n
**Ataque a la red eléctrica de Ucrania (2015):** Dejó sin luz a 230.000 personas durante horas. Los atacantes usaron malware para tomar control de los sistemas SCADA y desconectar subestaciones eléctricas.\n\n
**Oleoducto Colonial Pipeline (2021):** Un ataque de ransomware paralizó el mayor oleoducto de la costa este de EE.UU., causando escasez de combustible en varios estados. La empresa pagó 4,4 millones de dólares de rescate.\n\n
## ¿Por qué son tan vulnerables?\n
- Muchos sistemas llevan décadas funcionando y no fueron diseñados con seguridad en mente.\n
- Actualizar o parchear puede requerir parar la producción, algo que muchas empresas evitan.\n
- Los protocolos industriales (Modbus, S7, DNP3) no tienen autenticación ni cifrado.\n
- A menudo los equipos de IT y OT (Operational Technology) trabajan separados, sin coordinación de seguridad.\n\n
## Cómo proteger estos entornos\n
- **Segmentación de red estricta** entre la red corporativa y la red industrial.\n
- **Inventario completo** de todos los dispositivos conectados.\n
- **Monitorización continua** de tráfico anómalo.\n
- **Formación específica** para el personal de operaciones.\n
- **Plan de respuesta a incidentes** adaptado a entornos OT.',
  'conpot',
  ARRAY['ICS', 'SCADA', 'infraestructura crítica', 'industrial', 'Stuxnet']
),

-- ─── Artículo 5: Ingeniería social ───────────────────────────────
(
  'Ingeniería social: cuando el eslabón más débil eres tú',
  'ingenieria-social-phishing',
  'Factor humano',
  'principiante',
  'El 90% de los ciberataques exitosos comienzan con un engaño a una persona, no con un fallo técnico. Aprende a reconocer las técnicas más usadas.',
  E'## El ataque más efectivo no es técnico\n
Puedes tener el firewall más caro, el antivirus más potente y todos los sistemas actualizados. Si un empleado recibe un email convincente y hace clic en un enlace malicioso, toda esa protección puede quedar en nada.\n\n
La **ingeniería social** es la manipulación psicológica de personas para que realicen acciones o revelen información confidencial. No explota vulnerabilidades de software: explota vulnerabilidades humanas.\n\n
## Phishing\n
El **phishing** es el ataque de ingeniería social más común. El atacante envía un email que parece legítimo (de tu banco, de Microsoft, de tu jefe, de Correos) con un enlace o adjunto malicioso.\n\n
**Señales de alerta:**\n
- El remitente tiene un dominio ligeramente diferente: `soporte@micr0soft.com` en vez de `microsoft.com`\n
- Urgencia artificial: "Tu cuenta será bloqueada en 24 horas"\n
- Errores ortográficos o de formato extraño\n
- Te piden credenciales, datos bancarios o que descargues algo\n\n
## Spear Phishing\n
Es un phishing **dirigido específicamente a ti**. El atacante investiga tu empresa, tus compañeros, tus proyectos (en LinkedIn, redes sociales, la web de la empresa) y construye un mensaje muy convincente y personalizado.\n\n
**Ejemplo:** Recibes un email que parece de tu director financiero: "Hola [tu nombre], necesito que hagas una transferencia urgente a este proveedor antes del cierre de hoy. Estoy en reunión y no puedo llamar. [Adjunto factura.pdf]"\n\n
## Vishing y Smishing\n
- **Vishing:** Phishing por llamada telefónica. Alguien llama haciéndose pasar por soporte técnico, el banco o la Seguridad Social.\n
- **Smishing:** Phishing por SMS. "Tu paquete está retenido, verifica aquí: [enlace]"\n\n
## Cómo protegerte\n
- **Verifica siempre** la identidad del remitente antes de hacer clic o responder.\n
- Ante cualquier solicitud urgente de dinero o datos, **llama directamente** a la persona por un canal conocido.\n
- **No abras adjuntos** inesperados aunque vengan de conocidos (su cuenta puede estar comprometida).\n
- Activa el **doble factor de autenticación (2FA)** en todos tus accesos.\n
- En caso de duda, **consulta con IT** antes de actuar.\n\n
## La regla de oro\n
Ninguna empresa legítima te pedirá tu contraseña por email, teléfono o mensaje. Si alguien lo hace, es un ataque.',
  NULL,
  ARRAY['phishing', 'ingeniería social', 'factor humano', 'spear phishing', 'vishing']
),

-- ─── Artículo 6: Contraseñas ──────────────────────────────────────
(
  'Guía práctica de contraseñas seguras para empleados',
  'guia-contrasenas-seguras',
  'Buenas prácticas',
  'principiante',
  'Una contraseña débil puede comprometer toda la empresa. Esta guía te enseña a crear y gestionar contraseñas seguras de forma sencilla.',
  E'## ¿Por qué importa tu contraseña?\n
Cada día, miles de sistemas en todo el mundo son comprometidos porque alguien usaba `123456`, `password` o el nombre de su mascota como contraseña. Los datos de nuestro honeypot lo confirman: los atacantes prueban primero siempre las contraseñas más comunes.\n\n
## Las contraseñas más usadas (y más peligrosas)\n
Año tras año, las contraseñas más usadas en el mundo son:\n
1. 123456\n
2. password\n
3. 123456789\n
4. qwerty\n
5. abc123\n\n
Si usas alguna de estas, cámbiala **ahora mismo**.\n\n
## ¿Qué hace una contraseña segura?\n
Una buena contraseña tiene:\n
- **Longitud:** Mínimo 12-16 caracteres. A mayor longitud, mayor seguridad.\n
- **Variedad:** Mezcla mayúsculas, minúsculas, números y símbolos (`@`, `#`, `!`, `$`).\n
- **Sin información personal:** Nada de tu nombre, fecha de nacimiento, nombre de mascota o empresa.\n
- **Única por cuenta:** Nunca reutilices la misma contraseña en varios sitios.\n\n
## El truco de la frase de contraseña\n
En lugar de una palabra difícil de recordar, usa una **frase**:\n
`MiPerroSeLlamaMax2019!` → fácil de recordar, difícil de adivinar.\n
O mejor, una frase aleatoria: `CieloAzul$Tren#Montaña7`\n\n
## Gestores de contraseñas\n
La solución más práctica es usar un **gestor de contraseñas** (como Bitwarden, 1Password o KeePass). Solo necesitas recordar una contraseña maestra; el gestor crea y guarda contraseñas únicas y complejas para cada servicio.\n\n
## Doble factor de autenticación (2FA)\n
El 2FA añade una segunda capa de seguridad: incluso si alguien roba tu contraseña, necesita también tu teléfono para entrar. Actívalo en todos los servicios que lo permitan, especialmente:\n
- Email corporativo\n
- VPN\n
- Sistemas de gestión\n
- Redes sociales corporativas\n\n
## Reglas básicas\n
- **Nunca compartas** tu contraseña con nadie, ni con IT (ellos no la necesitan).\n
- **Cambia inmediatamente** cualquier contraseña si sospechas que ha sido comprometida.\n
- **No escribas** contraseñas en post-its ni en documentos sin cifrar.',
  NULL,
  ARRAY['contraseñas', '2FA', 'buenas prácticas', 'autenticación']
),

-- ─── Artículo 7: Escaneo de puertos ──────────────────────────────
(
  'Escaneo de puertos: cómo los atacantes exploran tu red',
  'escaneo-puertos-reconocimiento',
  'Ataques de red',
  'intermedio',
  'Antes de atacar, los ciberdelincuentes realizan un reconocimiento de la red. El escaneo de puertos es el primer paso de casi cualquier ataque.',
  E'## La fase de reconocimiento\n
Ningún ataque serio ocurre sin preparación. Antes de intentar explotar un sistema, los atacantes dedican tiempo a **reconocer el objetivo**: qué servicios tiene activos, qué puertos están abiertos, qué versiones de software usa, qué vulnerabilidades conocidas existen.\n\n
## ¿Qué es un puerto?\n
Imagina un edificio (tu servidor) con muchas puertas numeradas. Cada puerta (puerto) corresponde a un servicio diferente:\n
- Puerto 22: SSH (acceso remoto)\n
- Puerto 80: HTTP (web sin cifrar)\n
- Puerto 443: HTTPS (web cifrada)\n
- Puerto 3306: MySQL (base de datos)\n
- Puerto 445: SMB (archivos compartidos Windows)\n\n
## Cómo funciona el escaneo\n
Herramientas como **Nmap** envían paquetes a cada puerto del servidor y analizan la respuesta para determinar si está abierto, cerrado o filtrado. Un escaneo completo puede analizar los 65.535 puertos en segundos.\n\n
Con la información obtenida, el atacante busca:\n
- Servicios con versiones antiguas y vulnerables\n
- Puertos que no deberían estar expuestos a internet\n
- Configuraciones por defecto sin cambiar\n\n
## ¿Qué hace tu empresa con esta información?\n
Nuestro honeypot Honeytrap registra estos escaneos y nos permite ver:\n
- Qué IPs están explorando nuestra red\n
- Qué puertos son los más sondeados\n
- Con qué frecuencia ocurre\n\n
## Cómo reducir la exposición\n
- **Principio de mínimo privilegio:** Solo exponer a internet los puertos estrictamente necesarios.\n
- **Firewall bien configurado:** Bloquear todo el tráfico entrante excepto lo explícitamente permitido.\n
- **Port knocking:** Técnica que mantiene puertos cerrados hasta que se recibe una secuencia secreta de conexiones.\n
- **Monitorización:** Detectar escaneos masivos y bloquear automáticamente las IPs que los realizan.\n
- **Actualizaciones:** Un puerto abierto con software actualizado es mucho menos peligroso.',
  'honeytrap',
  ARRAY['puertos', 'reconocimiento', 'Nmap', 'firewall', 'escaneo']
),

-- ─── Artículo 8: Qué es un honeypot ──────────────────────────────
(
  '¿Qué es un honeypot y para qué sirve?',
  'que-es-un-honeypot',
  'Conceptos básicos',
  'principiante',
  'Un honeypot es una trampa para atacantes. Descubre cómo esta plataforma funciona y qué información nos proporciona para mejorar la seguridad.',
  E'## La trampa perfecta\n
Un **honeypot** (en español, "tarro de miel") es un sistema informático configurado deliberadamente para parecer vulnerable y atraer a los atacantes. No contiene datos reales ni presta servicios legítimos: su único propósito es ser atacado.\n\n
Cuando un atacante interactúa con un honeypot, registramos todo lo que hace: qué herramientas usa, qué vulnerabilidades intenta explotar, qué credenciales prueba, qué comandos ejecuta.\n\n
## ¿Para qué sirve esta información?\n
1. **Conocer las amenazas reales:** Sabemos exactamente qué tipos de ataques están activos en internet ahora mismo.\n
2. **Mejorar las defensas:** Si vemos que muchos atacantes prueban una vulnerabilidad concreta, podemos parchearla antes de que afecte a sistemas reales.\n
3. **Investigación:** Los datos permiten estudiar patrones, orígenes y técnicas de los atacantes.\n
4. **Formación:** Como en esta plataforma, los datos reales hacen el aprendizaje mucho más efectivo.\n\n
## Los honeypots de esta plataforma\n
| Honeypot | Simula | Captura |\n
|----------|--------|---------|\n
| **Cowrie** | Servidor SSH/Telnet | Intentos de login, comandos ejecutados |\n
| **Dionaea** | Servicios SMB, FTP, MySQL | Malware, exploits, credenciales |\n
| **Honeytrap** | Cualquier puerto TCP/UDP | Escaneos, sondas de reconocimiento |\n
| **Glastopf** | Aplicación web vulnerable | Ataques SQLi, XSS, LFI |\n
| **Conpot** | Sistema industrial ICS/SCADA | Ataques a infraestructura crítica |\n
| **Honeyd** | Red completa con múltiples hosts | Escaneos de red, propagación de gusanos |\n\n
## ¿Son seguros?\n
Sí, si están bien configurados. Los honeypots están completamente aislados de los sistemas reales mediante redes virtuales (Docker en este caso). Un atacante que "comprometa" un honeypot solo accede a un entorno controlado sin datos reales.\n\n
## El valor de los datos reales\n
Los ataques que ves en esta plataforma son **reales**. No son simulaciones ni ejemplos inventados. Son intentos de intrusión que ocurren continuamente en internet, capturados y analizados para que puedas aprender de ellos y proteger mejor tu organización.',
  NULL,
  ARRAY['honeypot', 'conceptos básicos', 'seguridad defensiva', 'introducción']
);
