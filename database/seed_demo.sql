-- ════════════════════════════════════════════════════════════
--  Datos simulados para el perfil DEMO
--  Solo se carga en docker-compose.demo.yml
-- ════════════════════════════════════════════════════════════

INSERT INTO attacks (timestamp, honeypot, source_ip, source_port, dest_port, protocol, country, country_code, city, latitude, longitude, attack_type, username, password) VALUES
  (NOW() - INTERVAL '2 hours',  'cowrie',    '185.220.101.5',  45231, 22,   'TCP', 'Alemania',      'DE', 'Frankfurt',   50.11,  8.68,  'brute_force_ssh',  'root',    'root'),
  (NOW() - INTERVAL '2 hours',  'cowrie',    '185.220.101.5',  45232, 22,   'TCP', 'Alemania',      'DE', 'Frankfurt',   50.11,  8.68,  'brute_force_ssh',  'admin',   'admin123'),
  (NOW() - INTERVAL '3 hours',  'cowrie',    '45.33.32.156',   61000, 22,   'TCP', 'Estados Unidos','US', 'Fremont',     37.54, -121.9, 'brute_force_ssh',  'ubuntu',  'ubuntu'),
  (NOW() - INTERVAL '4 hours',  'glastopf',  '91.108.4.10',    54200, 80,   'TCP', 'Rusia',         'RU', 'Moscú',       55.75,  37.62, 'web_scan',         NULL,      NULL),
  (NOW() - INTERVAL '4 hours',  'glastopf',  '91.108.4.10',    54201, 80,   'TCP', 'Rusia',         'RU', 'Moscú',       55.75,  37.62, 'rfi',              NULL,      NULL),
  (NOW() - INTERVAL '5 hours',  'dionaea',   '101.32.85.200',  50100, 445,  'TCP', 'China',         'CN', 'Shanghái',    31.22, 121.45, 'smb_exploit',      NULL,      NULL),
  (NOW() - INTERVAL '6 hours',  'dionaea',   '101.32.85.200',  50101, 445,  'TCP', 'China',         'CN', 'Shanghái',    31.22, 121.45, 'smb_exploit',      NULL,      NULL),
  (NOW() - INTERVAL '7 hours',  'conpot',    '5.188.62.14',    60001, 502,  'TCP', 'Rusia',         'RU', 'San Petersburgo', 59.93, 30.32, 'modbus_scan',  NULL,      NULL),
  (NOW() - INTERVAL '8 hours',  'honeytrap', '103.77.192.100', 55000, 3389, 'TCP', 'India',         'IN', 'Bombay',      19.07,  72.87, 'rdp_scan',         NULL,      NULL),
  (NOW() - INTERVAL '9 hours',  'cowrie',    '198.98.56.125',  43100, 23,   'TCP', 'Estados Unidos','US', 'Phoenix',     33.44, -112.07,'brute_force_telnet','admin',  'password'),
  (NOW() - INTERVAL '10 hours', 'glastopf',  '77.88.55.60',    51000, 80,   'TCP', 'Rusia',         'RU', 'Moscú',       55.75,  37.62, 'sql_injection',    NULL,      NULL),
  (NOW() - INTERVAL '11 hours', 'dionaea',   '222.186.30.111', 52200, 21,   'TCP', 'China',         'CN', 'Pekín',       39.90, 116.39, 'ftp_brute',        'ftp',     'ftp'),
  (NOW() - INTERVAL '12 hours', 'cowrie',    '185.220.101.6',  45300, 22,   'TCP', 'Países Bajos',  'NL', 'Ámsterdam',   52.37,   4.89, 'brute_force_ssh',  'pi',      'raspberry'),
  (NOW() - INTERVAL '13 hours', 'conpot',    '176.111.174.26', 58000, 102,  'TCP', 'Ucrania',       'UA', 'Kiev',        50.45,  30.52, 'siemens_s7_scan',  NULL,      NULL),
  (NOW() - INTERVAL '14 hours', 'honeytrap', '23.19.227.150',  60200, 8080, 'TCP', 'Estados Unidos','US', 'Los Ángeles', 34.05, -118.24,'http_scan',        NULL,      NULL),
  (NOW() - INTERVAL '18 hours', 'glastopf',  '89.248.167.131', 53100, 80,   'TCP', 'Países Bajos',  'NL', 'Ámsterdam',   52.37,   4.89, 'web_scan',         NULL,      NULL),
  (NOW() - INTERVAL '20 hours', 'cowrie',    '141.98.81.35',   44100, 22,   'TCP', 'Países Bajos',  'NL', 'Ámsterdam',   52.37,   4.89, 'brute_force_ssh',  'root',    '123456'),
  (NOW() - INTERVAL '22 hours', 'dionaea',   '58.218.211.6',   51500, 3306, 'TCP', 'China',         'CN', 'Shanghái',    31.22, 121.45, 'mysql_brute',      'root',    ''),
  (NOW() - INTERVAL '23 hours', 'cowrie',    '185.180.143.40', 45500, 22,   'TCP', 'Bulgaria',      'BG', 'Sofía',       42.70,  23.32, 'brute_force_ssh',  'admin',   'admin'),
  (NOW() - INTERVAL '24 hours', 'glastopf',  '209.141.38.197', 56000, 80,   'TCP', 'Estados Unidos','US', 'Las Vegas',   36.17, -115.14,'lfi',              NULL,      NULL);
