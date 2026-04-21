import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAttacks, getHoneypots } from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const HP_META = {
  cowrie:    { label: 'Cowrie',    desc: 'Honeypot SSH y Telnet. Captura intentos de login por fuerza bruta, credenciales y comandos ejecutados.',      color: 'cyan-400',    border: 'border-blue-500/30',    bg: 'bg-blue-500/10',    ports: '2222 SSH, 2323 Telnet' },
  dionaea:   { label: 'Dionaea',   desc: 'Honeypot multi-protocolo. Captura exploits, malware y conexiones a servicios como SMB, MySQL o FTP.',          color: 'violet-400',  border: 'border-violet-500/30',  bg: 'bg-violet-500/10',  ports: '21 FTP, 445 SMB, 3306 MySQL, 1433 MSSQL' },
  glastopf:  { label: 'Glastopf',  desc: 'Honeypot web. Captura peticiones HTTP maliciosas: SQLi, RFI, LFI, XSS, bots y scrapers.',                    color: 'emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', ports: '8080 HTTP' },
  conpot:    { label: 'Conpot',    desc: 'Honeypot ICS/SCADA. Simula un PLC industrial y captura atacantes que sondean infraestructura crítica.',        color: 'rose-400',    border: 'border-rose-500/30',    bg: 'bg-rose-500/10',    ports: '102 S7, 502 Modbus, 44818 EtherNet/IP' },
  honeytrap: { label: 'Honeytrap', desc: 'Trampa TCP/UDP genérica. Registra cualquier conexión inesperada en puertos configurados.',                     color: 'amber-400',   border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   ports: 'TCP/UDP configurable' },
  honeyd:    { label: 'Honeyd',    desc: 'Honeypot de red virtual. Simula múltiples hosts y captura sondeos, conexiones Telnet y SMTP.',                 color: 'pink-400',    border: 'border-pink-500/30',    bg: 'bg-pink-500/10',    ports: '23 Telnet, 25 SMTP, 80 HTTP' },
}

export default function HoneypotDetail() {
  const { name } = useParams()
  const meta = HP_META[name] ?? { label: name, desc: '', color: 'gray-400', border: 'border-gray-600', bg: 'bg-gray-700/20', ports: '—' }

  const [attacks, setAttacks]   = useState([])
  const [hpStats, setHpStats]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const LIMIT = 50

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [aRes, hRes] = await Promise.all([
        getAttacks({ honeypot: name, page, limit: LIMIT }),
        getHoneypots(),
      ])
      setAttacks(aRes.data.items)
      setTotal(aRes.data.total)
      const stat = hRes.data.find(h => h.honeypot === name)
      setHpStats(stat ?? { honeypot: name, count: 0 })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [name, page])

  useEffect(() => { setPage(1) }, [name])
  useEffect(() => { load() }, [load])

  const uniqueIPs  = [...new Set(attacks.map(a => a.source_ip))].length
  const countries  = [...new Set(attacks.map(a => a.country).filter(Boolean))].length
  const lastSeen   = attacks[0]?.timestamp

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Cabecera */}
      <div className={`card border ${meta.border}`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${meta.bg} to-transparent rounded-2xl opacity-50 pointer-events-none`} />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-3 h-3 rounded-full bg-${meta.color} animate-pulse`} />
              <h2 className={`text-xl font-bold text-${meta.color}`}>{meta.label}</h2>
              <span className="badge bg-gray-700/50 text-gray-400 text-xs">{meta.ports}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{meta.desc}</p>
          </div>
          <Link to="/dashboard" className="text-gray-500 hover:text-gray-300 text-xs shrink-0 transition-colors">
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total ataques', value: hpStats?.count?.toLocaleString() ?? '—', color: `text-${meta.color}` },
          { label: 'IPs únicas (último lote)', value: uniqueIPs, color: 'text-cyan-400' },
          { label: 'Países detectados', value: countries || '—', color: 'text-violet-400' },
          { label: 'Último ataque', value: lastSeen ? formatDistanceToNow(new Date(lastSeen), { locale: es, addSuffix: true }) : '—', color: 'text-gray-300' },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="label-muted mb-2">{s.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla de ataques */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="section-title mb-0">Ataques capturados</p>
          <span className="text-xs text-gray-500">
            {total.toLocaleString()} eventos totales
          </span>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Cargando...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/60">
                    {['IP origen', 'País', 'Tipo de ataque', 'Proto', 'Puerto', 'Usuario', 'Hace'].map(h => (
                      <th key={h} className="pb-3 text-left label-muted font-medium pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attacks.map(a => (
                    <tr key={a.id} className="table-row">
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
                      <td className="py-3 pr-4 text-gray-300 text-xs max-w-[180px] truncate" title={a.attack_type}>
                        {a.attack_type ?? <span className="text-gray-600">—</span>}
                      </td>
                      <td className="py-3 pr-4 font-mono text-gray-500 text-xs">{a.protocol ?? '—'}</td>
                      <td className="py-3 pr-4 font-mono text-gray-400 text-xs">{a.dest_port ?? '—'}</td>
                      <td className="py-3 pr-4 font-mono text-amber-400/80 text-xs max-w-[120px] truncate" title={a.username}>
                        {a.username ?? <span className="text-gray-600">—</span>}
                      </td>
                      <td className="py-3 text-gray-600 text-xs whitespace-nowrap">
                        {formatDistanceToNow(new Date(a.timestamp), { locale: es, addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                  {!attacks.length && (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-600 py-12">
                        Sin ataques registrados para este honeypot todavía
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {total > LIMIT && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/60">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-xs text-gray-400 hover:text-gray-200 disabled:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-750 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <span className="text-xs text-gray-500">
                  Página {page} de {Math.ceil(total / LIMIT)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / LIMIT)}
                  className="text-xs text-gray-400 hover:text-gray-200 disabled:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-750 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
