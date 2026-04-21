import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAttack } from '../services/api'

export default function AttackDetail() {
  const { id } = useParams()
  const [attack, setAttack] = useState(null)

  useEffect(() => {
    getAttack(id).then(r => setAttack(r.data)).catch(console.error)
  }, [id])

  if (!attack) return <div className="card text-center text-gray-400 py-16">Cargando...</div>

  const rows = [
    ['Honeypot',      attack.honeypot],
    ['IP origen',     attack.source_ip],
    ['Puerto origen', attack.source_port ?? '—'],
    ['Puerto destino',attack.dest_port ?? '—'],
    ['Protocolo',     attack.protocol ?? '—'],
    ['Tipo de ataque',attack.attack_type ?? '—'],
    ['País',          attack.country ?? '—'],
    ['Ciudad',        attack.city ?? '—'],
    ['Usuario',       attack.username ?? '—'],
    ['Contraseña',    attack.password ?? '—'],
    ['Timestamp',     new Date(attack.timestamp).toLocaleString('es-ES')],
  ]

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/dashboard" className="text-accent-500 hover:underline text-sm">← Volver al dashboard</Link>

      <div className="card">
        <h2 className="font-bold text-lg mb-4">Detalle del ataque #{attack.id}</h2>
        <dl className="grid grid-cols-2 gap-3">
          {rows.map(([k, v]) => (
            <div key={k} className="bg-dark-700 rounded-lg p-3">
              <dt className="text-xs text-gray-500 uppercase mb-1">{k}</dt>
              <dd className="font-mono text-sm text-gray-100 break-all">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {attack.payload && (
        <div className="card">
          <p className="text-xs text-gray-500 uppercase mb-2">Payload</p>
          <pre className="text-xs text-gray-300 bg-dark-900 rounded p-3 overflow-x-auto whitespace-pre-wrap">
            {attack.payload}
          </pre>
        </div>
      )}

      {attack.raw_data && (
        <div className="card">
          <p className="text-xs text-gray-500 uppercase mb-2">Datos raw (JSON)</p>
          <pre className="text-xs text-gray-400 bg-dark-900 rounded p-3 overflow-x-auto">
            {JSON.stringify(attack.raw_data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
