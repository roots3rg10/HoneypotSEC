import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const HP_STYLE = {
  cowrie:    { bg: 'bg-blue-500/10',    text: 'text-blue-300',    dot: 'bg-blue-500'    },
  dionaea:   { bg: 'bg-violet-500/10',  text: 'text-violet-300',  dot: 'bg-violet-500'  },
  honeytrap: { bg: 'bg-amber-500/10',   text: 'text-amber-300',   dot: 'bg-amber-500'   },
  glastopf:  { bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-500' },
  conpot:    { bg: 'bg-rose-500/10',    text: 'text-rose-300',    dot: 'bg-rose-500'    },
  honeyd:    { bg: 'bg-pink-500/10',    text: 'text-pink-300',    dot: 'bg-pink-500'    },
}

const DEFAULT_STYLE = { bg: 'bg-gray-700/30', text: 'text-gray-300', dot: 'bg-gray-500' }

export default function RecentAttacks({ attacks }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <p className="section-title mb-0">Ataques recientes</p>
        {attacks?.length > 0 && (
          <span className="text-xs text-gray-500">{attacks.length} eventos</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700/60">
              {['Honeypot', 'IP origen', 'País', 'Tipo de ataque', 'Puerto', 'Hace'].map(h => (
                <th key={h} className="pb-3 text-left label-muted font-medium pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attacks?.map(a => {
              const s = HP_STYLE[a.honeypot] ?? DEFAULT_STYLE
              return (
                <tr key={a.id} className="table-row">
                  <td className="py-3 pr-4">
                    <span className={`badge ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {a.honeypot}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <Link
                      to={`/attacks/${a.id}`}
                      className="font-mono text-cyan-400 hover:text-cyan-300 hover:underline text-xs transition-colors"
                    >
                      {a.source_ip}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-gray-300 text-xs">
                    {a.country_code
                      ? <span title={a.country}>{a.country_code}</span>
                      : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-3 pr-4 text-gray-300 text-xs max-w-[200px] truncate" title={a.attack_type}>
                    {a.attack_type ?? <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-3 pr-4 font-mono text-gray-400 text-xs">
                    {a.dest_port ?? <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-3 text-gray-600 text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(a.timestamp), { locale: es, addSuffix: true })}
                  </td>
                </tr>
              )
            })}
            {!attacks?.length && (
              <tr>
                <td colSpan={6} className="text-center text-gray-600 py-12 text-sm">
                  Sin ataques registrados todavía
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
