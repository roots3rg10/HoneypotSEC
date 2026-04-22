import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAttack } from '../services/api'
import { 
  ChevronLeft, 
  Terminal, 
  Database, 
  Fingerprint, 
  MapPin, 
  ShieldAlert,
  Hash,
  Clock
} from 'lucide-react'

const HP_COLOR = {
  cowrie:    'text-blue-400',
  dionaea:   'text-indigo-400',
  glastopf:  'text-emerald-400',
  conpot:    'text-rose-400',
  honeytrap: 'text-amber-400',
  honeyd:    'text-pink-400',
}

export default function AttackDetail() {
  const { id } = useParams()
  const [attack, setAttack] = useState(null)

  useEffect(() => {
    getAttack(id).then(r => setAttack(r.data)).catch(console.error)
  }, [id])

  if (!attack) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
      <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Retrieving intelligence packet...</p>
    </div>
  )

  const hpColor = HP_COLOR[attack.honeypot] ?? 'text-slate-300'

  const fields = [
    { label: 'Honeypot Source', value: attack.honeypot,                               color: hpColor,       icon: ShieldAlert },
    { label: 'Source Vector',    value: attack.source_ip,                              color: 'text-cyan-400', icon: Hash, mono: true },
    { label: 'Ingress Port',     value: attack.dest_port ?? '—',                       color: 'text-white',    icon: Database, mono: true },
    { label: 'Protocol Stack',   value: attack.protocol ?? '—',                        color: 'text-slate-300', icon: Terminal, mono: true },
    { label: 'Classification',   value: attack.attack_type ?? 'Unclassified',          color: 'text-rose-400', icon: Fingerprint },
    { label: 'Geo Origin',       value: `${attack.country || 'Unknown'} (${attack.city || '—'})`, color: 'text-slate-300', icon: MapPin },
    { label: 'Auth Attempt',     value: attack.username ? `${attack.username} : ${attack.password || '****'}` : '—', color: 'text-amber-400', icon: Lock, mono: true },
    { label: 'Packet Time',      value: new Date(attack.timestamp).toLocaleString('es-ES'), color: 'text-slate-400', icon: Clock, mono: true },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-8 p-2 pb-20"
    >
      <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
        <ChevronLeft className="w-4 h-4" />
        Return to Intelligence Grid
      </Link>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-slate-800/50">
              <Fingerprint className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white tracking-tight">
                Threat Packet <span className="text-cyan-400 font-mono">#{attack.id.toString().padStart(6, '0')}</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">High-Interaction Telemetry</p>
            </div>
          </div>
          <div className={`badge-premium ${hpColor} border-current/20 bg-current/5 px-4 py-2 uppercase`}>
            {attack.honeypot}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ label, value, color, icon: Icon, mono }) => (
            <div key={label} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                <dt className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</dt>
              </div>
              <dd className={`text-sm break-all ${color} ${mono ? 'font-mono' : 'font-bold'}`}>{value}</dd>
            </div>
          ))}
        </div>
      </div>

      {attack.payload && (
        <div className="glass-card border-emerald-500/10">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Captured Payload</h3>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-emerald-500/10 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
            <pre className="relative text-xs text-emerald-400/90 bg-slate-950 border border-slate-800 rounded-xl p-6 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed custom-scrollbar">
              {attack.payload}
            </pre>
          </div>
        </div>
      )}

      {attack.raw_data && (
        <div className="glass-card">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Raw Packet Data</h3>
          </div>
          <pre className="text-[10px] text-slate-400 bg-slate-950 border border-slate-800 rounded-xl p-6 overflow-x-auto font-mono leading-relaxed custom-scrollbar max-h-80">
            {JSON.stringify(attack.raw_data, null, 2)}
          </pre>
        </div>
      )}
    </motion.div>
  )
}
