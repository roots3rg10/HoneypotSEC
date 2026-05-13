import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Globe, Cpu, Activity, Zap, Layers, TrendingUp, CheckCircle2, Lock } from 'lucide-react'
import { getHoneypots } from '../../services/api'
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

export default function ClientSensors() {
  const { user: authUser } = useAuth()
  const previewUser = usePreviewUser()
  const user = previewUser ?? authUser
  const plan = user?.plan || 'basico'
  const activeSensors = ACTIVE_BY_PLAN[plan] || ACTIVE_BY_PLAN.basico
  const isPro = hasPlan(plan, 'profesional')

  const [data, setData] = useState([])

  useEffect(() => {
    getHoneypots().then(r => setData(r.data || [])).catch(() => {})
  }, [])

  const activeCount = activeSensors.length
  const totalCount  = Object.keys(SENSOR_META).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>Mis Sensores</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--txt-2)' }}>
          {activeCount} de {totalCount} honeypots activos en tu plan
        </p>
      </div>

      {/* Summary bar */}
      <div className="rounded-2xl px-6 py-4 flex items-center gap-6"
        style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: '#34d399' }}>
            {activeCount} sensor{activeCount !== 1 ? 'es' : ''} operativo{activeCount !== 1 ? 's' : ''}
          </p>
          <p className="text-xs" style={{ color: 'var(--txt-3)' }}>
            {activeCount} de {totalCount} activos · última verificación hace &lt;1 min
          </p>
        </div>
        {!isPro && (
          <Link to="/pricing"
            className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
            style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
            Activar {totalCount - activeCount} más →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(SENSOR_META).map(([key, meta], i) => {
          const Icon = meta.icon
          const stats   = data.find(d => d.name?.toLowerCase() === key) || {}
          const attacks = stats.attacks_24h ?? stats.count ?? 0
          const isActive = activeSensors.includes(key)

          if (!isActive) {
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.5 }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10"
                  style={{ background: 'rgba(5,5,5,0.6)', backdropFilter: 'blur(2px)' }}>
                  <Lock className="w-5 h-5" style={{ color: '#FBBF24' }} />
                  <span className="text-xs font-bold" style={{ color: '#FBBF24' }}>Plan Profesional</span>
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
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
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
  )
}
