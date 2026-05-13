import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Globe, Cpu, Activity, Zap, Layers, Lock,
  Terminal, Copy, Check, CheckCircle2, TrendingUp, Wifi, WifiOff,
} from 'lucide-react'
import { getHoneypots, getMySensors } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { usePreviewUser } from '../../context/PreviewUserContext'
import { hasPlan } from '../../components/PlanGate'
import { Link } from 'react-router-dom'

const SENSOR_META = {
  cowrie:    { label: 'Cowrie',    desc: 'SSH / Telnet',   icon: Shield,   color: '#e2e8f0', port: '2222 / 2323' },
  dionaea:   { label: 'Dionaea',   desc: 'Multi-proto',    icon: Layers,   color: '#94a3b8', port: '21 / 445 / 3306' },
  glastopf:  { label: 'Glastopf',  desc: 'Aplicación web', icon: Globe,    color: '#FBBF24', port: '8080' },
  conpot:    { label: 'Conpot',    desc: 'ICS / SCADA',    icon: Cpu,      color: '#fb7185', port: '102 / 502' },
  honeytrap: { label: 'Honeytrap', desc: 'TCP / UDP',      icon: Activity, color: '#fde68a', port: 'dinámico' },
  honeyd:    { label: 'Honeyd',    desc: 'Red virtual',    icon: Zap,      color: '#94a3b8', port: 'múltiple' },
}

const ACTIVE_BY_PLAN = {
  basico:      ['cowrie', 'dionaea'],
  profesional: Object.keys(SENSOR_META),
  empresarial: Object.keys(SENSOR_META),
}

const INSTALL_STEPS = [
  { n: '1', text: 'El equipo de HoneypotSEC genera tu comando personalizado desde el panel de administración.' },
  { n: '2', text: 'Recibes el comando por email. Solo necesitas un servidor Linux con acceso a Internet.' },
  { n: '3', text: 'Ejecutas el comando como root. El instalador configura todo automáticamente.' },
  { n: '4', text: 'Los ataques detectados aparecen en este panel en cuestión de minutos.' },
]

function timeAgo(dateStr) {
  if (!dateStr) return 'Nunca'
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)   return 'Hace menos de 1 min'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400)return `Hace ${Math.floor(diff / 3600)} h`
  return `Hace ${Math.floor(diff / 86400)} días`
}

export default function ClientSensors() {
  const { user: authUser } = useAuth()
  const previewUser  = usePreviewUser()
  const user         = previewUser ?? authUser
  const plan         = user?.plan || 'basico'
  const activeSensors = ACTIVE_BY_PLAN[plan] || ACTIVE_BY_PLAN.basico
  const isPro        = hasPlan(plan, 'profesional')

  const [data,      setData]      = useState([])
  const [sensors,   setSensors]   = useState([])
  const [copied,    setCopied]    = useState(false)

  const INSTALL_CMD = `curl -s https://honeypotsec.duckdns.org/install | sudo bash -s -- --token <TU_TOKEN>`

  useEffect(() => {
    getHoneypots().then(r => setData(r.data || [])).catch(() => {})
    getMySensors().then(r => setSensors(r.data || [])).catch(() => {})
  }, [])

  function copyCmd() {
    navigator.clipboard.writeText(INSTALL_CMD).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const activeCount  = activeSensors.length
  const totalCount   = Object.keys(SENSOR_META).length
  const installedOk  = sensors.filter(s => s.status === 'active').length

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>Mis Sensores</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--txt-2)' }}>
          {activeCount} honeypot{activeCount !== 1 ? 's' : ''} incluidos en tu plan · {installedOk} servidor{installedOk !== 1 ? 'es' : ''} conectado{installedOk !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Sección instalación ─────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.03)' }}>

        {/* Cabecera de la sección */}
        <div className="px-6 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(251,191,36,0.12)', background: 'rgba(251,191,36,0.05)' }}>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.12)' }}>
            <Terminal className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Instalar sensor en tu servidor</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Un solo comando instala y configura todos los honeypots de tu plan
            </p>
          </div>
          {installedOk > 0 && (
            <div className="ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {installedOk} activo{installedOk !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Comando de instalación */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Comando de instalación
            </p>
            <div className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-4 py-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>bash</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-amber-400 font-mono text-sm select-none">$</span>
                <code className="flex-1 font-mono text-xs text-green-300 break-all">
                  {INSTALL_CMD}
                </code>
                <button
                  onClick={copyCmd}
                  className="shrink-0 p-1.5 rounded-lg transition-all duration-150"
                  style={{ background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
                           border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}` }}
                  title="Copiar comando"
                >
                  {copied
                    ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                    : <Copy  className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />}
                </button>
              </div>
            </div>
            <p className="mt-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              El token personalizado lo recibirás del equipo de HoneypotSEC. Sustitúyelo en <code className="text-amber-400/70">&lt;TU_TOKEN&gt;</code>
            </p>
          </div>

          {/* Pasos del proceso */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              ¿Cómo funciona?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INSTALL_STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                    style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
                    {step.n}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {step.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sensores registrados ────────────────────────────────── */}
      {sensors.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Servidores conectados
          </p>
          <div className="space-y-3">
            {sensors.map((s, i) => {
              const isOnline = s.status === 'active'
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl px-5 py-4 flex items-center gap-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="p-2 rounded-lg"
                    style={{ background: isOnline ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
                             border: `1px solid ${isOnline ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                    {isOnline
                      ? <Wifi    className="w-4 h-4 text-emerald-400" />
                      : <WifiOff className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--txt)' }}>
                      {s.hostname || s.name || `Sensor #${s.id}`}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--txt-3)' }}>
                      {s.ip_address && <span className="font-mono mr-3">{s.ip_address}</span>}
                      Último contacto: {timeAgo(s.last_seen)}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${isOnline ? '' : ''}`}
                    style={{
                      background: isOnline ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
                      color:      isOnline ? '#34d399' : 'rgba(255,255,255,0.3)',
                      border:     `1px solid ${isOnline ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    {isOnline ? '● Online' : '○ Offline'}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Estado de honeypots por plan ────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Honeypots de tu plan
          </p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold" style={{ color: '#34d399' }}>
              {activeCount} activos
            </span>
            {!isPro && (
              <Link to="/pricing"
                className="text-xs font-bold px-3 py-1 rounded-lg ml-2"
                style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.18)' }}>
                Activar {totalCount - activeCount} más →
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(SENSOR_META).map(([key, meta], i) => {
            const Icon     = meta.icon
            const stats    = data.find(d => d.name?.toLowerCase() === key) || {}
            const attacks  = stats.attacks_24h ?? stats.count ?? 0
            const isActive = activeSensors.includes(key)

            if (!isActive) {
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.5 }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10"
                    style={{ background: 'rgba(5,5,5,0.65)', backdropFilter: 'blur(2px)' }}>
                    <Lock className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">Plan Profesional</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl" style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}20` }}>
                      <Icon className="w-4 h-4" style={{ color: meta.color }} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>{meta.label}</p>
                      <p className="text-[10px]" style={{ color: 'var(--txt-3)' }}>{meta.desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                      <p className="font-display font-black text-xl" style={{ color: meta.color }}>—</p>
                      <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--txt-3)' }}>ataques hoy</p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                      <p className="font-display font-black text-sm" style={{ color: 'var(--txt-1)' }}>{meta.port}</p>
                      <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--txt-3)' }}>puerto(s)</p>
                    </div>
                  </div>
                </motion.div>
              )
            }

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-2xl p-5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl" style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}20` }}>
                      <Icon className="w-4 h-4" style={{ color: meta.color }} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>{meta.label}</p>
                      <p className="text-[10px]" style={{ color: 'var(--txt-3)' }}>{meta.desc}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full"
                    style={{ background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                    <p className="font-display font-black text-xl" style={{ color: meta.color }}>{attacks}</p>
                    <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--txt-3)' }}>ataques hoy</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                    <p className="font-display font-black text-sm" style={{ color: 'var(--txt-1)' }}>{meta.port}</p>
                    <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--txt-3)' }}>puerto(s)</p>
                  </div>
                </div>
                {attacks > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--txt-3)' }}>
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    Actividad detectada en las últimas 24h
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
