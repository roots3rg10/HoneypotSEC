-- ════════════════════════════════════════════════════════════
--  Preguntas adicionales (orden 6-10) para cada módulo
-- ════════════════════════════════════════════════════════════

INSERT INTO quiz_questions (article_slug, question, options, correct_index, order_num) VALUES

-- ─── Fuerza bruta SSH (6-10) ─────────────────────────────────
('fuerza-bruta-ssh',
 '¿Qué es el "credential stuffing"?',
 '["Crear contraseñas muy largas","Usar credenciales robadas de un servicio para atacar otros servicios","Forzar el reinicio del servidor SSH","Robar el certificado SSL del servidor"]',
 1, 6),

('fuerza-bruta-ssh',
 '¿Cuál de estos usuarios es habitualmente el más atacado en SSH según los honeypots?',
 '["administrator","ubuntu","root","deploy"]',
 2, 7),

('fuerza-bruta-ssh',
 '¿Qué hace la herramienta fail2ban?',
 '["Cifra las conexiones SSH","Bloquea automáticamente IPs con demasiados intentos fallidos","Cambia el puerto SSH periódicamente","Audita los comandos ejecutados en la sesión"]',
 1, 8),

('fuerza-bruta-ssh',
 '¿Qué es una clave pública SSH?',
 '["Una contraseña muy larga guardada en el servidor","Una parte de un par de claves criptográficas que se guarda en el servidor y no es secreta","El certificado SSL del servidor","Una contraseña que nunca caduca"]',
 1, 9),

('fuerza-bruta-ssh',
 'Tu empresa detecta miles de intentos de login SSH desde una misma IP. ¿Cuál es la primera acción?',
 '["Enviar un email al atacante","Apagar el servidor SSH","Bloquear la IP en el firewall y revisar si hubo acceso exitoso","Cambiar la contraseña de todos los usuarios"]',
 2, 10),

-- ─── Ataques web (6-10) ──────────────────────────────────────
('ataques-aplicaciones-web',
 '¿Qué es un ataque CSRF?',
 '["Inyección de código en la base de datos","Forzar al navegador de la víctima a ejecutar acciones no autorizadas en otro sitio","Interceptar el tráfico HTTPS","Adivinar tokens de sesión por fuerza bruta"]',
 1, 6),

('ataques-aplicaciones-web',
 '¿Qué cabecera HTTP ayuda a prevenir ataques XSS?',
 '["Content-Type","Authorization","Content-Security-Policy (CSP)","X-Forwarded-For"]',
 2, 7),

('ataques-aplicaciones-web',
 '¿Qué significa OWASP?',
 '["Open Web Application Security Project","Online Worldwide Application Safety Protocol","Open Wireless And Security Platform","Official Web Application Scanning Procedure"]',
 0, 8),

('ataques-aplicaciones-web',
 '¿Qué es una vulnerabilidad de "Path Traversal" o LFI?',
 '["Inyectar código SQL en una URL","Acceder a archivos del sistema manipulando rutas como ../../etc/passwd","Robar cookies de sesión con JavaScript","Forzar un redireccionamiento a un sitio falso"]',
 1, 9),

('ataques-aplicaciones-web',
 'Un formulario de tu web no valida los datos antes de guardarlos en BD. ¿Qué vulnerabilidad introduce?',
 '["Solo un problema de rendimiento","XSS y/o SQL Injection, porque los datos maliciosos llegan sin filtrar","Un problema de privacidad GDPR","Solo afecta si hay un firewall mal configurado"]',
 1, 10),

-- ─── Propagación de malware (6-10) ───────────────────────────
('propagacion-malware-red',
 '¿Qué es una botnet?',
 '["Un sistema de backup automático","Una red de ordenadores infectados controlados remotamente por un atacante","Un tipo de firewall distribuido","Un protocolo de comunicación seguro"]',
 1, 6),

('propagacion-malware-red',
 '¿Qué es el movimiento lateral en un ciberataque?',
 '["Cambiar el dominio de ataque","Desplazarse de un sistema a otro dentro de la red comprometida usando credenciales robadas","Atacar desde múltiples países simultáneamente","Rotar las IPs de origen del ataque"]',
 1, 7),

('propagacion-malware-red',
 '¿Qué es un "zero-day" en el contexto del malware?',
 '["Un malware que se activa exactamente a las 00:00h","Una vulnerabilidad desconocida para el fabricante, por lo que no existe parche","Un ataque que dura menos de 24 horas","Un malware que borra registros de fecha"]',
 1, 8),

('propagacion-malware-red',
 '¿Por qué es importante segmentar la red (VLANs) ante un brote de malware?',
 '["Mejora el rendimiento de la red","Reduce la cantidad de logs generados","Limita la propagación del malware al contener el brote en un segmento","Dificulta el acceso remoto al equipo infectado"]',
 2, 9),

('propagacion-malware-red',
 'Un compañero recibe un USB de origen desconocido. ¿Cuál es la acción correcta?',
 '["Conectarlo y escanear con el antivirus","No conectarlo y entregarlo al departamento IT para análisis seguro","Formatearlo y reutilizarlo","Conectarlo solo en un ordenador que no tenga datos importantes"]',
 1, 10),

-- ─── ICS / SCADA (6-10) ──────────────────────────────────────
('ataques-ics-scada',
 '¿Qué significa PLC en el contexto industrial?',
 '["Public Local Connection","Programmable Logic Controller","Protected Layer Communication","Physical Layer Configuration"]',
 1, 6),

('ataques-ics-scada',
 '¿Qué fue el ataque al Colonial Pipeline en 2021?',
 '["Un ataque físico a tuberías en Texas","Un ataque ransomware que paralizó el suministro de combustible en la costa este de EE.UU.","Un fallo técnico mal atribuido a un ciberataque","Un ataque de denegación de servicio sin impacto real"]',
 1, 7),

('ataques-ics-scada',
 '¿Qué es un "air gap" en infraestructura crítica?',
 '["Un tipo de firewall para redes industriales","La separación física total de una red industrial de internet y otras redes","Un protocolo de comunicación seguro entre PLCs","Un sistema de detección de intrusiones para SCADA"]',
 1, 8),

('ataques-ics-scada',
 '¿Qué honeypot de esta plataforma simula infraestructura ICS/SCADA?',
 '["Cowrie","Glastopf","Conpot","Honeyd"]',
 2, 9),

('ataques-ics-scada',
 'Un técnico de planta quiere conectar su portátil personal a la red SCADA para mayor comodidad. ¿Qué deberías hacer?',
 '["Permitirlo si tiene antivirus actualizado","Permitirlo solo si usa VPN","Prohibirlo y reportarlo, ya que viola la política de segmentación de red","Permitirlo en horario laboral exclusivamente"]',
 2, 10),

-- ─── Ingeniería social (6-10) ────────────────────────────────
('ingenieria-social-phishing',
 '¿Qué es el vishing?',
 '["Phishing por email con adjuntos maliciosos","Ataques de ingeniería social por llamada de voz o teléfono","Phishing mediante mensajes en redes sociales","Ataques contra sistemas de voz sobre IP"]',
 1, 6),

('ingenieria-social-phishing',
 '¿Qué es el smishing?',
 '["Phishing por correo electrónico corporativo","Ingeniería social mediante mensajes SMS o WhatsApp","Ataque de denegación de servicio a servidores de email","Phishing dirigido a directivos"]',
 1, 7),

('ingenieria-social-phishing',
 '¿Qué es el "pretexting"?',
 '["Enviar emails antes del ataque principal","Crear una identidad o historia falsa para ganarse la confianza de la víctima","Falsificar el asunto del email","Registrar un dominio parecido al de la empresa"]',
 1, 8),

('ingenieria-social-phishing',
 'Recibes un email de ''rrhh@tuempresa-nominas.com'' pidiendo confirmar tus datos bancarios. ¿Qué señal de alerta ves?',
 '["El email no tiene adjuntos","El dominio es similar pero no es el oficial de tu empresa","El email está bien redactado","El email tiene el logo de la empresa"]',
 1, 9),

('ingenieria-social-phishing',
 '¿Cuál es el objetivo final más común del phishing en empresas?',
 '["Curiosidad intelectual del atacante","Obtener credenciales o instalar malware para acceder a sistemas corporativos","Bloquear el acceso al email","Destruir datos sin beneficio económico"]',
 1, 10),

-- ─── Contraseñas seguras (6-10) ───────────────────────────────
('guia-contrasenas-seguras',
 '¿Cuánto tiempo tarda aproximadamente en crackearse una contraseña de 8 caracteres solo números?',
 '["Años","Meses","Horas","Milisegundos"]',
 3, 6),

('guia-contrasenas-seguras',
 '¿Qué tipo de 2FA es más seguro?',
 '["SMS al móvil","Código generado por una app autenticadora (TOTP)","Email de confirmación","Pregunta secreta"]',
 1, 7),

('guia-contrasenas-seguras',
 '¿Qué es un ataque de diccionario?',
 '["Intentar todas las combinaciones posibles de caracteres","Probar contraseñas de listas de palabras comunes y contraseñas filtradas","Interceptar la contraseña en tránsito","Adivinar la contraseña por información pública de la víctima"]',
 1, 8),

('guia-contrasenas-seguras',
 '¿Para qué sirve ''Have I Been Pwned'' (haveibeenpwned.com)?',
 '["Generar contraseñas seguras automáticamente","Comprobar si tu email o contraseña han sido filtrados en alguna brecha de datos","Evaluar la fortaleza de una contraseña","Almacenar contraseñas cifradas en la nube"]',
 1, 9),

('guia-contrasenas-seguras',
 'Tu contraseña corporativa es ''Empresa2024!''. ¿Por qué sigue siendo débil?',
 '["Tiene más de 8 caracteres","Sigue un patrón predecible (nombre+año+símbolo) que las herramientas de ataque prueban primero","No tiene caracteres especiales","Es demasiado corta"]',
 1, 10),

-- ─── Escaneo de puertos (6-10) ────────────────────────────────
('escaneo-puertos-reconocimiento',
 '¿Qué tipo de escaneo de Nmap envía paquetes SYN sin completar el handshake TCP?',
 '["Escaneo UDP","Escaneo de versiones (-sV)","Escaneo SYN sigiloso (-sS)","Escaneo de ping (-sn)"]',
 2, 6),

('escaneo-puertos-reconocimiento',
 '¿Qué herramienta se usa para capturar y analizar el tráfico de red en tiempo real?',
 '["Nmap","Metasploit","Wireshark","Burp Suite"]',
 2, 7),

('escaneo-puertos-reconocimiento',
 '¿Qué puerto usa HTTPS por defecto?',
 '["80","8080","443","8443"]',
 2, 8),

('escaneo-puertos-reconocimiento',
 '¿Qué es el "banner grabbing" en escaneo de reconocimiento?',
 '["Capturar el tráfico de red completo","Obtener información del servicio (versión, sistema) que un puerto expone al conectarse","Listar todos los puertos abiertos de un host","Detectar si un firewall está bloqueando puertos"]',
 1, 9),

('escaneo-puertos-reconocimiento',
 'Tu IDS alerta de un escaneo masivo de puertos desde una IP externa. ¿Qué implica esto?',
 '["Nada, es tráfico normal de internet","Un atacante está realizando reconocimiento previo a un posible ataque","Solo puede ser un scanner de seguridad legítimo","El firewall ha fallado y debes apagarlo"]',
 1, 10),

-- ─── Qué es un honeypot (6-10) ────────────────────────────────
('que-es-un-honeypot',
 '¿Cuál es la diferencia principal entre un honeypot de baja y alta interacción?',
 '["El precio del hardware","Los de baja interacción simulan servicios limitados; los de alta interacción emulan sistemas completos y capturan más detalle","Los de alta interacción son más fáciles de mantener","Solo los de baja interacción son legales"]',
 1, 6),

('que-es-un-honeypot',
 '¿Qué es una honeynet?',
 '["Un único honeypot muy potente","Una red de múltiples honeypots que simulan una infraestructura completa","Un firewall especializado en detectar honeypots","Un protocolo de comunicación entre sensores"]',
 1, 7),

('que-es-un-honeypot',
 '¿Qué tipo de información captura Cowrie de los atacantes SSH?',
 '["Solo la IP de origen","Solo si la conexión fue exitosa o no","Comandos ejecutados, credenciales probadas, archivos descargados y toda la sesión interactiva","Solo el timestamp de cada intento"]',
 2, 8),

('que-es-un-honeypot',
 '¿Qué ventaja tiene un honeypot frente a un sistema IDS/IPS tradicional?',
 '["Es más barato de mantener","No genera falsos positivos porque cualquier tráfico hacia él es sospechoso por definición","Protege activamente los sistemas reales bloqueando ataques","Es compatible con más protocolos de red"]',
 1, 9),

('que-es-un-honeypot',
 '¿Qué riesgo existe si un honeypot de alta interacción es comprometido por el atacante?',
 '["Ninguno, está diseñado para eso y es completamente seguro","El atacante podría usarlo como plataforma para atacar otros sistemas, si el aislamiento falla","Solo puede leer logs del propio honeypot","El honeypot se apagará automáticamente"]',
 1, 10);
