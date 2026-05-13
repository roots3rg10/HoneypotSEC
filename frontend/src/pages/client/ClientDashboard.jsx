import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, Activity, Globe, Cpu, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { getSummary, getOverview, getAttacks } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { usePreviewUser } from '../../context/PreviewUserContext'
import AttackMap from '../../components/Dashboard/AttackMap'
import PlanGate, { hasPlan } from '../../components/PlanGate'

function KpiCard({ icon: Icon, label, value, sub, trend, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
      className="rounded-2xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
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

function ThreatLevel({ score }) {
  const level = score > 70 ? { label: 'ALTO', color: '#fb7185' }
              : score > 40 ? { label: 'MEDIO', color: '#FBBF24' }
              : { label: 'BAJO', color: '#34d399' }
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

export default function ClientDashboard() {
  const { user: authUser } = useAuth()
  const previewUser = usePreviewUser()
  const user = previewUser ?? authUser
  const plan = user?.plan || 'basico'
  const isPro = hasPlan(plan, 'profesional')

  const [summary,  setSummary]  = useState(null)
  const [overview, setOverview] = useState(null)
  const [alerts,   setAlerts]   = useState([])

  useEffect(() => {
    getSummary().then(r => setSummary(r.data)).catch(() => {})
    getOverview().then(r => setOverview(r.data)).catch(() => {})
    getAttacks({ limit: isPro ? 8 : 3, order: 'desc' }).then(r => setAlerts(r.data?.items || [])).catch(() => {})
  }, [isPro])

  const attacks24h = summary?.attacks_24h ?? '—'
  const totalIPs   = overview?.top_ips?.length ?? '—'
  const score      = summary ? Math.max(0, 100 - Math.min(100, Math.floor((summary.attacks_24h || 0) / 3))) : 50

  const sensoresLabel = plan === 'basico' ? '2 / 6' : '6 / 6'
  const sensoresSub   = plan === 'basico' ? 'Amplía con plan Pro' : 'Todos operativos'

  function getFlagEmoji(code) {
    if (!code) return '🌐'
    return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt()))
  }

  const severityColor = { high: '#fb7185', medium: '#FBBF24', low: '#34d399' }
  function severity(a) {
    if (['sql_injection','xss','path_traversal','rce','command_injection'].includes(a.attack_type?.toLowerCase())) return 'high'
    if (['ssh_bruteforce','ftp_login','smb_exploit'].includes(a.attack_type?.toLowerCase())) return 'medium'
    return 'low'
  }

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

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={ShieldAlert} label="Nivel de amenaza" value={score > 70 ? 'Alto' : score > 40 ? 'Medio' : 'Bajo'}
          color={score > 70 ? '#fb7185' : score > 40 ? '#FBBF24' : '#34d399'} delay={0} />
        <KpiCard icon={Activity} label="Ataques (24h)" value={attacks24h} sub="vs ayer"
          trend={summary ? 12 : undefined} color="#FBBF24" delay={0.05} />
        <KpiCard icon={Globe} label="IPs únicas detectadas" value={typeof totalIPs === 'number' ? totalIPs : '—'}
          sub="últimas 24 horas" color="#60a5fa" delay={0.1} />
        <KpiCard icon={Cpu} label="Sensores activos" value={sensoresLabel}
          sub={sensoresSub} color="#34d399" delay={0.15} />
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
          <PlanGate
            requires="profesional"
            title="Mapa geográfico"
            description="Visualiza el origen de cada ataque en tiempo real en el plan Profesional."
          >
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
          </div>
          <ThreatLevel score={score} />
          <p className="text-[11px] text-center mt-3" style={{ color: 'var(--txt-3)' }}>
            Calculado en base a la actividad de las últimas 24h
          </p>
        </motion.div>
      </div>

      {/* Alertas recientes */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--card-header-border)' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>Alertas recientes</span>
          </div>
          {!isPro && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
              Últimas 3 · Plan Básico
            </span>
          )}
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {alerts.length === 0 && (
            <p className="px-5 py-6 text-sm text-center" style={{ color: 'var(--txt-3)' }}>Sin alertas recientes</p>
          )}
          {alerts.map(a => {
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
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
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
