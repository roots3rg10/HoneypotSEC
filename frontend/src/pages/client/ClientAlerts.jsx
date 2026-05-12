import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Filter, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { getAttacks } from '../../services/api'

const HIGH_TYPES = ['sql_injection', 'xss', 'path_traversal', 'rce', 'command_injection', 'smb_exploit', 'ics_attack']
const MED_TYPES  = ['ssh_bruteforce', 'ftp_login', 'telnet_login', 'web_scan']

function getSeverity(attack) {
  const t = (attack.attack_type || '').toLowerCase()
  if (HIGH_TYPES.some(h => t.includes(h))) return 'high'
  if (MED_TYPES.some(m => t.includes(m))) return 'medium'
  return 'low'
}

const SEV_CONFIG = {
  high:   { label: 'Alta',   icon: AlertTriangle, color: '#fb7185', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.2)' },
  medium: { label: 'Media',  icon: AlertCircle,   color: '#FBBF24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)' },
  low:    { label: 'Baja',   icon: Info,          color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.15)' },
}

const FILTER_OPTIONS = ['Todas', 'Alta', 'Media', 'Baja']

export default function ClientAlerts() {
  const [attacks, setAttacks] = useState([])
  const [filter,  setFilter]  = useState('Todas')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAttacks({ limit: 50, order: 'desc' })
      .then(r => setAttacks(r.data?.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = attacks
    .map(a => ({ ...a, _sev: getSeverity(a) }))
    .filter(a => filter === 'Todas' || SEV_CONFIG[a._sev]?.label === filter)

  const counts = { high: 0, medium: 0, low: 0 }
  attacks.forEach(a => counts[getSeverity(a)]++)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>Alertas</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--txt-2)' }}>Actividad de amenazas detectada por tus sensores</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {(['high', 'medium', 'low'] ).map(sev => {
          const cfg = SEV_CONFIG[sev]
          const Icon = cfg.icon
          return (
            <div key={sev} className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <Icon className="w-5 h-5 shrink-0" style={{ color: cfg.color }} />
              <div>
                <p className="font-display font-black text-xl" style={{ color: cfg.color }}>{counts[sev]}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color + 'aa' }}>
                  Severidad {cfg.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--txt-3)' }} />
        {FILTER_OPTIONS.map(opt => (
          <button key={opt} onClick={() => setFilter(opt)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-150"
            style={{
              background: filter === opt ? 'rgba(251,191,36,0.1)' : 'var(--surface)',
              border: `1px solid ${filter === opt ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
              color: filter === opt ? '#FBBF24' : 'var(--txt-2)',
            }}>
            {opt}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {loading && (
          <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--txt-3)' }}>Cargando alertas...</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--txt-3)' }}>
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
            Sin alertas para este filtro
          </p>
        )}
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.map((a, i) => {
            const cfg = SEV_CONFIG[a._sev]
            const Icon = cfg.icon
            return (
              <motion.div key={a.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="px-5 py-4 flex items-start gap-4">
                <div className="p-2 rounded-lg mt-0.5 shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold" style={{ color: 'var(--txt-1)' }}>
                      {a.attack_type || 'Intento de acceso'} — <span style={{ color: 'var(--txt-2)' }}>{a.honeypot}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    <span className="text-xs" style={{ color: 'var(--txt-3)' }}>IP: {a.source_ip}</span>
                    {a.country && <span className="text-xs" style={{ color: 'var(--txt-3)' }}>País: {a.country}</span>}
                    {a.dest_port && <span className="text-xs" style={{ color: 'var(--txt-3)' }}>Puerto: {a.dest_port}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    {cfg.label}
                  </span>
                  <p className="text-[10px] mt-1.5" style={{ color: 'var(--txt-3)' }}>
                    {new Date(a.timestamp).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
