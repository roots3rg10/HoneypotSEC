import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAttack } from '../services/api'
import { ChevronLeft, Terminal, Database, Fingerprint, MapPin, ShieldAlert, Hash, Clock, Lock } from 'lucide-react'

export default function AttackDetail() {
  const { id }     = useParams()
  const [attack, setAttack] = useState(null)

  useEffect(() => {
    getAttack(id).then(r => setAttack(r.data)).catch(console.error)
  }, [id])

  if (!attack) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4" style={{ opacity: 0.35 }}>
      <div className="w-10 h-10 rounded-full animate-spin"
        style={{ border: '3px solid rgba(251,191,36,0.15)', borderTopColor: '#FBBF24' }} />
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Cargando datos del ataque...
      </p>
    </div>
  )

  const fields = [
    { label: 'Honeypot origen',          value: attack.honeypot,                                           color: 'rgba(255,255,255,0.8)', icon: ShieldAlert },
    { label: 'IP origen',                value: attack.source_ip,                                          color: '#FBBF24',               icon: Hash,       mono: true },
    { label: 'Puerto destino',           value: attack.dest_port ?? '—',                                   color: 'rgba(255,255,255,0.8)', icon: Database,   mono: true },
    { label: 'Protocolo',                value: attack.protocol ?? '—',                                    color: 'rgba(255,255,255,0.6)', icon: Terminal,   mono: true },
    { label: 'Clasificación',            value: attack.attack_type ?? 'Sin clasificar',                    color: '#fb7185',               icon: Fingerprint },
    { label: 'Origen geográfico',        value: `${attack.country || 'Desconocido'} (${attack.city || '—'})`, color: 'rgba(255,255,255,0.7)', icon: MapPin },
    { label: 'Intento de autenticación', value: attack.username ? `${attack.username} : ${attack.password || '****'}` : '—', color: 'rgba(251,191,36,0.7)', icon: Lock, mono: true },
    { label: 'Timestamp',                value: new Date(attack.timestamp).toLocaleString('es-ES'),        color: 'rgba(255,255,255,0.4)', icon: Clock,      mono: true },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-7 p-2 pb-20"
    >
      <Link to="/dashboard"
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
        style={{ color: 'rgba(255,255,255,0.3)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'white'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
        <ChevronLeft className="w-4 h-4" />
        Volver al panel
      </Link>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between mb-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.12)' }}>
              <Fingerprint className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white tracking-tight">
                Ataque{' '}
                <span className="text-amber-400 font-mono">#{attack.id.toString().padStart(6, '0')}</span>
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Telemetría de alta interacción
              </p>
            </div>
          </div>
          <span className="badge-premium badge-amber uppercase">{attack.honeypot}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map(({ label, value, color, icon: Icon, mono }) => (
            <div key={label} className="p-4 rounded-2xl transition-colors"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <dt className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {label}
                </dt>
              </div>
              <dd className={`text-sm break-all ${mono ? 'font-mono' : 'font-bold'}`} style={{ color }}>{value}</dd>
            </div>
          ))}
        </div>
      </div>

      {attack.payload && (
        <div className="glass-card" style={{ borderColor: 'rgba(251,191,36,0.1)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Payload capturado</h3>
          </div>
          <pre className="text-xs bg-black border rounded-xl p-6 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed custom-scrollbar"
            style={{ color: 'rgba(251,191,36,0.8)', borderColor: 'rgba(255,255,255,0.07)' }}>
            {attack.payload}
          </pre>
        </div>
      )}

      {attack.raw_data && (
        <div className="glass-card">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Datos crudos del paquete</h3>
          </div>
          <pre className="text-[10px] bg-black border rounded-xl p-6 overflow-x-auto font-mono leading-relaxed custom-scrollbar max-h-80"
            style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.07)' }}>
            {JSON.stringify(attack.raw_data, null, 2)}
          </pre>
        </div>
      )}
    </motion.div>
  )
}
