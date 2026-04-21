import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const HONEYPOT_COLORS = {
  cowrie:    'bg-blue-500/20 text-blue-300',
  dionaea:   'bg-purple-500/20 text-purple-300',
  honeytrap: 'bg-yellow-500/20 text-yellow-300',
  glastopf:  'bg-green-500/20 text-green-300',
  conpot:    'bg-red-500/20 text-red-300',
  honeyd:    'bg-pink-500/20 text-pink-300',
}

export default function RecentAttacks({ attacks }) {
  return (
    <div className="card">
      <p className="text-sm font-semibold text-gray-300 mb-4">Ataques recientes</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-dark-600">
              <th className="pb-2 text-left">Honeypot</th>
              <th className="pb-2 text-left">IP origen</th>
              <th className="pb-2 text-left">País</th>
              <th className="pb-2 text-left">Tipo de ataque</th>
              <th className="pb-2 text-left">Puerto</th>
              <th className="pb-2 text-left">Hace</th>
            </tr>
          </thead>
          <tbody>
            {attacks?.map(a => (
              <tr key={a.id} className="border-b border-dark-700 hover:bg-dark-700/50 transition-colors">
                <td className="py-2 pr-3">
                  <span className={`badge ${HONEYPOT_COLORS[a.honeypot] ?? 'bg-gray-700 text-gray-300'}`}>
                    {a.honeypot}
                  </span>
                </td>
                <td className="py-2 pr-3 font-mono text-accent-500">
                  <Link to={`/attacks/${a.id}`} className="hover:underline">{a.source_ip}</Link>
                </td>
                <td className="py-2 pr-3 text-gray-300">{a.country ?? '—'}</td>
                <td className="py-2 pr-3 text-gray-300">{a.attack_type ?? '—'}</td>
                <td className="py-2 pr-3 text-gray-400">{a.dest_port ?? '—'}</td>
                <td className="py-2 text-gray-500 text-xs whitespace-nowrap">
                  {formatDistanceToNow(new Date(a.timestamp), { locale: es, addSuffix: true })}
                </td>
              </tr>
            ))}
            {!attacks?.length && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-8">Sin ataques registrados aún</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
