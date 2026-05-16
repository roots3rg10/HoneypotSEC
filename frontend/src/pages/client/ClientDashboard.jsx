import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldAlert, Activity, Globe, Cpu, TrendingUp, TrendingDown,
  AlertTriangle, WifiOff, Terminal, RefreshCw, Clock, Wifi, Server,
} from 'lucide-react'
import { getClientSummary, getClientOverview, getMyAttacks, getMySensors } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { usePreviewUser } from '../../context/PreviewUserContext'
import AttackMap from '../../components/Dashboard/AttackMap'
import PlanGate, { hasPlan } from '../../components/PlanGate'

const ONLINE_THRESHOLD_MS = 3 * 60 * 1000  // 3 minutos = 3 heartbeats perdidos

function isSensorOnline(lastSeen) {
  if (!lastSeen) return false
  return (Date.now() - new Date(lastSeen).getTime()) < ONLINE_THRESHOLD_MS
}

function lastSeenLabel(lastSeen) {
  if (!lastSeen) return 'Sin contacto'
  const s = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000)
  if (s < 60)   return `hace ${s}s`
  if (s < 3600) return `hace ${Math.floor(s / 60)}min`
  if (s < 86400)return `hace ${Math.floor(s / 3600)}h`
  return `hace ${Math.floor(s / 86400)}d`
}

// ── Subcomponentes ────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, trend, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
      className="rounded-2xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: `${color}14`, border: `1px solid ${color}25` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className="flex items-center gap-1 text-xs font-bold"
            style={{ color: trend >= 0 ? '#fb7185' : '#34d399' }}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>{value}</div>
      <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--txt-2)' }}>{label}</div>
      {sub && <div className="text-[10px] mt-1" style={{ color: 'var(--txt-3)' }}>{sub}</div>}
    </motion.div>
  )
}

function ThreatLevel({ score, noAttacks }) {
  // Sin ataques en las últimas 24h → estado tranquilo
  if (noAttacks) return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#34d399" strokeWidth="10"
            strokeDasharray="0 251" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-2xl">✓</span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-xs font-black tracking-widest uppercase" style={{ color: '#34d399' }}>
          Sin amenazas
        </span>
        <p className="text-[10px] mt-1" style={{ color: 'var(--txt-3)' }}>
          Ningún ataque en 24h
        </p>
      </div>
    </div>
  )

  // Score de amenaza: 0 ataques = 0, crece con los ataques
  const level = score >= 70 ? { label: 'ALTO',  color: '#fb7185' }
              : score >= 40 ? { label: 'MEDIO', color: '#FBBF24' }
              :                { label: 'BAJO',  color: '#34d399' }
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={level.color} strokeWidth="10"
            strokeDasharray={`${score * 2.51} 251`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-black text-2xl" style={{ color: level.color }}>{score}</span>
          <span className="text-[9px] font-bold" style={{ color: 'var(--txt-3)' }}>/ 100</span>
        </div>
      </div>
      <span className="text-xs font-black tracking-widest uppercase" style={{ color: level.color }}>
        Nivel {level.label}
      </span>
    </div>
  )
}

// ── Estado vacío: sin sensor instalado ────────────────────────

function NoSensorState({ company }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="space-y-5">

      {/* Hero card */}
      <div className="rounded-2xl p-10 flex flex-col items-center gap-6 text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
            <WifiOff className="w-9 h-9 text-amber-400" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
            <span className="text-[8px] font-black text-black">!</span>
          </span>
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="font-display font-black text-xl" style={{ color: 'var(--txt)' }}>
            Sensor no instalado
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--txt-3)' }}>
            La cuenta de <strong style={{ color: 'var(--txt)' }}>{company}</strong> está activa
            pero aún no hay ningún sensor desplegado en tu infraestructura.
            Los datos aparecerán aquí en tiempo real una vez esté instalado.
          </p>
        </div>
      </div>

      {/* Pasos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            num: '1',
            title: 'Solicita tu token',
            desc:  'Contacta con tu gestor de cuenta en HoneypotSEC para obtener el token de instalación personalizado.',
            color: '#60a5fa',
          },
          {
            num: '2',
            title: 'Ejecuta el instalador',
            desc:  'En tu servidor Linux, ejecuta el comando que te proporcionaremos. Requiere acceso root.',
            color: '#FBBF24',
            code:  'curl -sL .../install | sudo bash',
          },
          {
            num: '3',
            title: 'Datos en tiempo real',
            desc:  'En minutos los honeypots estarán activos y los ataques comenzarán a aparecer en este panel.',
            color: '#34d399',
          },
        ].map(step => (
          <div key={step.num} className="rounded-2xl p-5 space-y-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: `${step.color}15`, color: step.color, border: `1px solid ${step.color}25` }}>
                {step.num}
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>{step.title}</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--txt-3)' }}>{step.desc}</p>
            {step.code && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Terminal className="w-3 h-3 shrink-0 text-amber-400" />
                <code className="text-[10px] font-mono text-green-300 truncate">{step.code}</code>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nota de actualización */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs"
        style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', color: 'rgba(96,165,250,0.8)' }}>
        <RefreshCw className="w-3.5 h-3.5 shrink-0" />
        Este panel se actualiza automáticamente. No es necesario recargar la página cuando el sensor se conecte.
      </div>
    </motion.div>
  )
}

// ── Dashboard principal ───────────────────────────────────────

function getFlagEmoji(code) {
  if (!code) return '🌐'
  return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt()))
}

const severityColor = { high: '#fb7185', medium: '#FBBF24', low: '#34d399' }
function severity(a) {
  const t = a.attack_type?.toLowerCase() || ''
  if (['sql_injection','xss','path_traversal','rce','command_injection'].some(x => t.includes(x))) return 'high'
  if (['brute_force','ssh','ftp','smb','mysql'].some(x => t.includes(x))) return 'medium'
  return 'low'
}

export default function ClientDashboard() {
  const { user: authUser } = useAuth()
  const previewUser        = usePreviewUser()
  const user               = previewUser ?? authUser
  const plan               = user?.plan || 'basico'
  const isPro              = hasPlan(plan, 'profesional')
  const tenantId           = user?.id

  const [summary,     setSummary]     = useState(null)
  const [overview,    setOverview]    = useState(null)
  const [alerts,      setAlerts]      = useState([])
  const [sensors,     setSensors]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  function markUpdated() {
    setLastUpdated(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  }

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)

    Promise.all([
      getClientSummary(tenantId, 7).then(r => setSummary(r.data)).catch(() => {}),
      getClientOverview(tenantId).then(r => setOverview(r.data)).catch(() => {}),
      getMyAttacks({ limit: isPro ? 8 : 3, tenant_id: tenantId, days: 7 })
        .then(r => setAlerts(r.data?.items || [])).catch(() => {}),
      getMySensors(tenantId).then(r => setSensors(r.data || [])).catch(() => {}),
    ]).finally(() => { setLoading(false); markUpdated() })

    // Polling cada 30 s para actualizar en tiempo real
    const interval = setInterval(() => {
      getClientSummary(tenantId, 7).then(r => setSummary(r.data)).catch(() => {})
      getMyAttacks({ limit: isPro ? 8 : 3, tenant_id: tenantId, days: 7 })
        .then(r => setAlerts(r.data?.items || [])).catch(() => {})
      getMySensors(tenantId).then(r => setSensors(r.data || [])).catch(() => {})
      markUpdated()
    }, 30000)

    return () => clearInterval(interval)
  }, [tenantId, isPro])

  // ── Loading ──────────────────────────────────────────────
  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="w-7 h-7 rounded-full animate-spin"
        style={{ border: '2px solid rgba(251,191,36,0.15)', borderTopColor: '#FBBF24' }} />
    </div>
  )

  // ── Sin sensor instalado ─────────────────────────────────
  if (summary?.sensor_count === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>
            Bienvenido, {user?.company_name || user?.username}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--txt-2)' }}>
            Resumen de seguridad · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <NoSensorState company={user?.company_name || user?.username} />
      </div>
    )
  }

  // ── Con sensores: datos reales ───────────────────────────
  const attacks24h  = summary?.attacks_period ?? 0
  const totalIPs    = summary?.unique_ips     ?? 0
  const sensorCount = summary?.sensor_count   ?? 0
  const score       = Math.min(100, Math.floor(attacks24h * 2))

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>
          Bienvenido, {user?.company_name || user?.username}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--txt-2)' }}>
          Resumen de seguridad · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Barra de estado — ventana 24h */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
        className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 rounded-xl"
        style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)' }}>
        {/* Live dot */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: '#34d399' }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#34d399' }} />
          </span>
          <span className="text-[11px] font-black tracking-wider" style={{ color: '#34d399' }}>EN VIVO</span>
        </div>
        <span className="h-3 w-px hidden sm:block" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Ventana de análisis:{' '}
          <strong style={{ color: '#FBBF24' }}>últimos 7 días</strong>
        </span>
        <span className="h-3 w-px hidden sm:block" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <span className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <RefreshCw className="w-3 h-3" />
          Actualización automática cada 30s
        </span>
        {lastUpdated && (
          <>
            <span className="h-3 w-px hidden md:block ml-auto" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              <Clock className="w-3 h-3" />
              Última sync: {lastUpdated}
            </span>
          </>
        )}
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={ShieldAlert} label="Nivel de amenaza"
          value={attacks24h === 0 ? 'Ninguno' : score >= 70 ? 'Alto' : score >= 40 ? 'Medio' : 'Bajo'}
          color={attacks24h === 0 ? '#34d399' : score >= 70 ? '#fb7185' : score >= 40 ? '#FBBF24' : '#34d399'} delay={0} />
        <KpiCard icon={Activity} label="Ataques (7d)" value={attacks24h}
          sub="últimos 7 días" color="#FBBF24" delay={0.05} />
        <KpiCard icon={Globe} label="IPs únicas" value={totalIPs}
          sub="en total" color="#60a5fa" delay={0.1} />
        <KpiCard icon={Cpu} label="Sensores activos" value={sensorCount}
          sub="conectados" color="#34d399" delay={0.15} />
      </div>

      {/* Mapa + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', minHeight: '300px' }}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--card-header-border)' }}>
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>Mapa de ataques en vivo</span>
          </div>
          <PlanGate requires="profesional" title="Mapa geográfico"
            description="Visualiza el origen de cada ataque en tiempo real en el plan Profesional.">
            <div style={{ height: '280px' }}>
              <AttackMap />
            </div>
          </PlanGate>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--card-header-border)' }}>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>Score de seguridad</span>
            <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
              7D
            </span>
          </div>
          <ThreatLevel score={score} noAttacks={attacks24h === 0} />
          <p className="text-[11px] text-center mt-3" style={{ color: 'var(--txt-3)' }}>
            Basado en ataques de los últimos 7 días
          </p>
        </motion.div>
      </div>

      {/* Estado de servidores */}
      {sensors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.28 }}
          className="rounded-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--card-header-border)' }}>
            <Server className="w-4 h-4 text-amber-400" />
            <span className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>
              Estado de servidores
            </span>
            <span className="ml-auto text-[10px]" style={{ color: 'var(--txt-3)' }}>
              {sensors.filter(s => isSensorOnline(s.last_seen)).length} / {sensors.length} en línea
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {sensors.map(s => {
              const online = isSensorOnline(s.last_seen)
              return (
                <div key={s.id} className="px-5 py-3 flex items-center gap-4">
                  {/* Indicador online/offline */}
                  <div className="shrink-0 relative">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: online ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${online ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      {online
                        ? <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                        : <WifiOff className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />}
                    </div>
                    {online && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400"
                        style={{ boxShadow: '0 0 6px #34d399' }} />
                    )}
                  </div>

                  {/* Nombre + hostname */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--txt)' }}>
                      {s.hostname || s.name || `Sensor #${s.id}`}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--txt-3)' }}>
                      {lastSeenLabel(s.last_seen)}
                    </p>
                  </div>

                  {/* IP */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-semibold" style={{ color: online ? 'var(--txt-1)' : 'var(--txt-3)' }}>
                      {s.ip_address || '—'}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--txt-3)' }}>IP pública</p>
                  </div>

                  {/* Badge estado */}
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
                    style={{
                      background: online ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
                      color:      online ? '#34d399' : 'rgba(255,255,255,0.3)',
                      border:     `1px solid ${online ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}`,
                      minWidth: '64px', textAlign: 'center',
                    }}>
                    {online ? '● Online' : '○ Offline'}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Alertas recientes */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--card-header-border)' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>Alertas recientes</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.08)', color: 'rgba(251,191,36,0.7)', border: '1px solid rgba(251,191,36,0.15)' }}>
              7D
            </span>
          </div>
          {!isPro && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
              Últimas 3 · Plan Básico
            </span>
          )}
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {alerts.length === 0 ? (
            <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--txt-3)' }}>
              Sin alertas recientes — tu infraestructura está tranquila
            </p>
          ) : alerts.map(a => {
            const sev = severity(a)
            const col = severityColor[sev]
            return (
              <div key={a.id} className="px-5 py-3 flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--txt-1)' }}>
                    {a.attack_type || 'Intento de acceso'} — {a.honeypot}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--txt-3)' }}>
                    {a.source_ip} · {getFlagEmoji(a.country_code)} {a.country || 'Desconocido'} · {new Date(a.timestamp).toLocaleTimeString('es-ES')}
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: `${col}15`, color: col }}>
                  {sev === 'high' ? 'Alta' : sev === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
            )
          })}
        </div>

        {!isPro && alerts.length > 0 && (
          <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <PlanGate requires="profesional" compact
              title="Historial completo de alertas"
              description="Accede al feed completo con filtros y tiempo real." />
          </div>
        )}
      </motion.div>
    </div>
  )
}
