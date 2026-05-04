-- ════════════════════════════════════════════════════════════
--  Preguntas de quiz para cada módulo formativo
-- ════════════════════════════════════════════════════════════

INSERT INTO quiz_questions (article_slug, question, options, correct_index, order_num) VALUES

-- ─── Fuerza bruta SSH ────────────────────────────────────────
('fuerza-bruta-ssh',
 '¿En qué consiste un ataque de fuerza bruta SSH?',
 '["Interceptar el tráfico cifrado de SSH","Probar miles de combinaciones de usuario/contraseña automáticamente","Explotar una vulnerabilidad del protocolo SSH","Suplantar la identidad del servidor SSH"]',
 1, 1),

('fuerza-bruta-ssh',
 '¿Qué puerto usa SSH por defecto?',
 '["21","80","22","443"]',
 2, 2),

('fuerza-bruta-ssh',
 '¿Qué herramienta de ataque de fuerza bruta se menciona en el artículo?',
 '["Nmap","Metasploit","Hydra o Medusa","Wireshark"]',
 2, 3),

('fuerza-bruta-ssh',
 'Si un atacante consigue acceso SSH a tu servidor, ¿qué puede hacer?',
 '["Solo leer archivos, no modificarlos","Robar datos, instalar malware y usar el servidor para atacar a terceros","Únicamente ver los logs del sistema","Nada, SSH está cifrado"]',
 1, 4),

('fuerza-bruta-ssh',
 '¿Cuál es la medida MÁS efectiva contra ataques de fuerza bruta SSH?',
 '["Cambiar el puerto SSH a otro número","Usar autenticación por clave pública en lugar de contraseña","Instalar un antivirus en el servidor","Reiniciar el servidor frecuentemente"]',
 1, 5),

-- ─── Ataques web ─────────────────────────────────────────────
('ataques-aplicaciones-web',
 '¿Qué lenguaje explota un ataque SQL Injection?',
 '["HTML","JavaScript","SQL","PHP"]',
 2, 1),

('ataques-aplicaciones-web',
 '¿Qué permite hacer un ataque XSS exitoso?',
 '["Acceder directamente a la base de datos","Inyectar código JavaScript malicioso que ejecutan otros usuarios","Descifrar el tráfico HTTPS","Reiniciar el servidor web"]',
 1, 2),

('ataques-aplicaciones-web',
 '¿Cuál de los siguientes es un ejemplo típico de SQL Injection?',
 '["<script>alert(1)</script>","SELECT * FROM users","'' OR 1=1 --","DROP TABLE users;"]',
 2, 3),

('ataques-aplicaciones-web',
 '¿Qué técnica de programación evita los ataques SQL Injection?',
 '["Cifrar la base de datos","Consultas preparadas (prepared statements)","Usar contraseñas largas","Activar el firewall"]',
 1, 4),

('ataques-aplicaciones-web',
 'Como empleado, ¿qué deberías hacer si la web interna de tu empresa muestra comportamiento extraño?',
 '["Ignorarlo, probablemente es un bug","Refrescar la página varias veces","Reportarlo al departamento de IT inmediatamente","Cerrar el navegador y no volver a entrar"]',
 2, 5),

-- ─── Propagación de malware ───────────────────────────────────
('propagacion-malware-red',
 '¿Qué protocolo explotó el ransomware WannaCry para propagarse?',
 '["HTTP","FTP","SMB","SSH"]',
 2, 1),

('propagacion-malware-red',
 '¿A cuántos países afectó WannaCry en 2017?',
 '["15","50","150","200"]',
 2, 2),

('propagacion-malware-red',
 '¿Por qué se recomienda deshabilitar SMB v1?',
 '["Consume demasiado ancho de banda","Es la versión vulnerable explotada por WannaCry","No es compatible con Windows 10","Es más lento que SMB v2"]',
 1, 3),

('propagacion-malware-red',
 '¿Qué alternativa segura existe para el protocolo FTP?',
 '["HTTP","SFTP o FTPS","Telnet","RDP"]',
 1, 4),

('propagacion-malware-red',
 'Ves que tu ordenador va muy lento sin razón aparente. ¿Qué deberías hacer?',
 '["Reiniciar el ordenador y continuar trabajando","Formatear el disco duro inmediatamente","Avisar al departamento de IT","Instalar más RAM"]',
 2, 5),

-- ─── ICS / SCADA ─────────────────────────────────────────────
('ataques-ics-scada',
 '¿Qué significan las siglas SCADA?',
 '["Secure Control And Data Analysis","Supervisory Control And Data Acquisition","System Control And Device Administration","Software Control Architecture and Design"]',
 1, 1),

('ataques-ics-scada',
 '¿Qué atacó el virus Stuxnet en 2010?',
 '["La red eléctrica de Ucrania","El oleoducto Colonial Pipeline","Centrifugadoras de enriquecimiento de uranio en Irán","Plantas de tratamiento de agua en Israel"]',
 2, 2),

('ataques-ics-scada',
 '¿Cuántas personas se quedaron sin luz en el ataque a la red eléctrica de Ucrania en 2015?',
 '["23.000","230.000","2.300.000","23.000.000"]',
 1, 3),

('ataques-ics-scada',
 '¿Por qué los protocolos industriales como Modbus son vulnerables?',
 '["Son demasiado modernos y complejos","No tienen autenticación ni cifrado","Solo funcionan en redes locales","Son propiedad de empresas privadas"]',
 1, 4),

('ataques-ics-scada',
 '¿Cuál es la medida de protección más importante en entornos ICS/SCADA?',
 '["Instalar antivirus en todos los PLCs","Segmentación estricta de red entre la red corporativa y la industrial","Usar contraseñas más largas","Actualizar el firmware cada mes"]',
 1, 5),

-- ─── Ingeniería social ────────────────────────────────────────
('ingenieria-social-phishing',
 '¿Qué porcentaje de ciberataques exitosos comienzan con un engaño a una persona?',
 '["40%","60%","75%","90%"]',
 3, 1),

('ingenieria-social-phishing',
 '¿Qué diferencia al spear phishing del phishing normal?',
 '["Usa SMS en lugar de email","Está dirigido específicamente a una persona o empresa concreta","Ataca solo a directivos","Es más fácil de detectar"]',
 1, 2),

('ingenieria-social-phishing',
 '¿Cuál de las siguientes es una señal clara de phishing?',
 '["El email viene de @microsoft.com","El email pide que actualices tu contraseña con urgencia: ''Tu cuenta será bloqueada en 24h''","El email tiene el logo correcto de la empresa","El email está bien redactado sin errores"]',
 1, 3),

('ingenieria-social-phishing',
 'Recibes una llamada de alguien que dice ser del soporte técnico de tu empresa pidiendo tu contraseña. ¿Qué haces?',
 '["Dársela, es el soporte técnico","Pedirle que te envíe un email primero","Colgar y llamar directamente al departamento de IT para verificar","Darle solo parte de la contraseña"]',
 2, 4),

('ingenieria-social-phishing',
 '¿Qué NUNCA hará una empresa legítima?',
 '["Enviarte newsletters","Pedirte tu contraseña por email, teléfono o mensaje","Enviarte facturas por email","Pedirte que actualices tu perfil"]',
 1, 5),

-- ─── Contraseñas seguras ──────────────────────────────────────
('guia-contrasenas-seguras',
 '¿Cuál es la contraseña más usada (y peligrosa) del mundo según el artículo?',
 '["password","qwerty","123456","admin"]',
 2, 1),

('guia-contrasenas-seguras',
 '¿Cuántos caracteres mínimo debe tener una contraseña segura?',
 '["6-8","8-10","12-16","20-24"]',
 2, 2),

('guia-contrasenas-seguras',
 '¿Qué es un gestor de contraseñas?',
 '["Un cuaderno donde anotar tus contraseñas","Software que crea y guarda contraseñas únicas y complejas por servicio","Un servicio que resetea tus contraseñas automáticamente","Una extensión que rellena formularios web"]',
 1, 3),

('guia-contrasenas-seguras',
 '¿Para qué sirve el doble factor de autenticación (2FA)?',
 '["Para tener una contraseña más larga","Para acceder más rápido sin contraseña","Para añadir una segunda capa de seguridad aunque roben tu contraseña","Para sincronizar contraseñas entre dispositivos"]',
 2, 4),

('guia-contrasenas-seguras',
 '¿Con quién deberías compartir tu contraseña corporativa?',
 '["Con tu jefe directo si lo pide","Con el departamento de IT si lo necesitan","Con un compañero de confianza","Con nadie, ni siquiera con IT"]',
 3, 5),

-- ─── Escaneo de puertos ───────────────────────────────────────
('escaneo-puertos-reconocimiento',
 '¿Qué herramienta de escaneo de puertos se menciona en el artículo?',
 '["Wireshark","Metasploit","Nmap","Burp Suite"]',
 2, 1),

('escaneo-puertos-reconocimiento',
 '¿Qué servicio usa el puerto 22 por defecto?',
 '["HTTP","FTP","SSH","MySQL"]',
 2, 2),

('escaneo-puertos-reconocimiento',
 '¿Cuántos puertos tiene un sistema informático en total?',
 '["1.024","8.192","32.767","65.535"]',
 3, 3),

('escaneo-puertos-reconocimiento',
 '¿Qué significa el principio de mínimo privilegio aplicado a puertos de red?',
 '["Usar los puertos más bajos posibles","Solo exponer a internet los puertos estrictamente necesarios","Cambiar todos los puertos por defecto","Bloquear todos los puertos excepto el 443"]',
 1, 4),

('escaneo-puertos-reconocimiento',
 '¿Qué honeypot de esta plataforma registra escaneos de puertos?',
 '["Cowrie","Glastopf","Honeytrap","Conpot"]',
 2, 5),

-- ─── Qué es un honeypot ───────────────────────────────────────
('que-es-un-honeypot',
 '¿Qué es un honeypot?',
 '["Un sistema de backup automático","Un sistema configurado para parecer vulnerable y atraer atacantes","Un tipo de firewall avanzado","Un protocolo de cifrado de red"]',
 1, 1),

('que-es-un-honeypot',
 '¿Qué honeypot de la plataforma simula un servidor SSH?',
 '["Glastopf","Dionaea","Honeytrap","Cowrie"]',
 3, 2),

('que-es-un-honeypot',
 '¿Qué tecnología aísla los honeypots de los sistemas reales en esta plataforma?',
 '["VPN","Docker","VLAN","Firewall hardware"]',
 1, 3),

('que-es-un-honeypot',
 '¿Los ataques registrados en esta plataforma son simulaciones?',
 '["Sí, todos son generados artificialmente","Solo algunos son reales","No, son ataques reales capturados de internet","Depende del honeypot"]',
 2, 4),

('que-es-un-honeypot',
 '¿Cuál es el propósito principal de un honeypot?',
 '["Almacenar datos sensibles de forma segura","Servir como backup del servidor principal","Ser atacado para aprender sobre amenazas reales y mejorar defensas","Aumentar la velocidad de la red"]',
 2, 5);
