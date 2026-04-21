import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAttack } from '../services/api'

const HP_COLOR = {
  cowrie:    'text-blue-400',
  dionaea:   'text-violet-400',
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
    <div className="card text-center text-gray-500 py-16">Cargando...</div>
  )

  const hpColor = HP_COLOR[attack.honeypot] ?? 'text-gray-300'

  const fields = [
    { label: 'Honeypot',       value: attack.honeypot,                               color: hpColor,       mono: false },
    { label: 'IP origen',      value: attack.source_ip,                              color: 'text-cyan-400', mono: true },
    { label: 'Puerto origen',  value: attack.source_port ?? '—',                     color: 'text-gray-300', mono: true },
    { label: 'Puerto destino', value: attack.dest_port ?? '—',                       color: 'text-gray-300', mono: true },
    { label: 'Protocolo',      value: attack.protocol ?? '—',                        color: 'text-gray-300', mono: true },
    { label: 'Tipo de ataque', value: attack.attack_type ?? '—',                     color: 'text-amber-400',mono: false },
    { label: 'País',           value: attack.country ?? '—',                         color: 'text-gray-300', mono: false },
    { label: 'Ciudad',         value: attack.city ?? '—',                            color: 'text-gray-300', mono: false },
    { label: 'Usuario',        value: attack.username ?? '—',                        color: 'text-rose-400', mono: true },
    { label: 'Contraseña',     value: attack.password ?? '—',                        color: 'text-rose-400', mono: true },
    { label: 'Timestamp',      value: new Date(attack.timestamp).toLocaleString('es-ES'), color: 'text-gray-400', mono: true },
  ]

  return (
    <div className="max-w-3xl space-y-5">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs transition-colors">
        ← Volver al dashboard
      </Link>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-100">
            Ataque <span className="font-mono text-cyan-400">#{attack.id}</span>
          </h2>
          <span className={`badge bg-gray-700/40 ${hpColor} capitalize`}>{attack.honeypot}</span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map(({ label, value, color, mono }) => (
            <div key={label} className="bg-gray-800/60 border border-gray-700/40 rounded-xl p-3">
              <dt className="label-muted mb-1">{label}</dt>
              <dd className={`text-sm break-all ${color} ${mono ? 'font-mono' : 'font-medium'}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {attack.payload && (
        <div className="card">
          <p className="label-muted mb-3">Payload capturado</p>
          <pre className="text-xs text-emerald-400 bg-gray-950 border border-gray-700/40 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
            {attack.payload}
          </pre>
        </div>
      )}

      {attack.raw_data && (
        <div className="card">
          <p className="label-muted mb-3">Datos raw (JSON)</p>
          <pre className="text-xs text-gray-400 bg-gray-950 border border-gray-700/40 rounded-xl p-4 overflow-x-auto font-mono leading-relaxed">
            {JSON.stringify(attack.raw_data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
