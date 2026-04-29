import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAttacks, getHoneypots } from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Shield, Activity, Globe, Clock, ChevronLeft, ExternalLink, Cpu, Lock, Network } from 'lucide-react'

const HP_META = {
  cowrie:    { label: 'Cowrie Tactical Node',   icon: Lock,     desc: 'Capa de emulación avanzada de SSH y Telnet. Monitoriza intentos de fuerza bruta, interacciones de sesión y secuencias de comandos post-explotación.', accent: 'rgba(255,255,255,0.8)', border: 'rgba(255,255,255,0.1)', bg: 'rgba(255,255,255,0.05)', ports: '2222 SSH, 2323 Telnet' },
  dionaea:   { label: 'Dionaea Multi-Threat',   icon: Activity, desc: 'Sensor multi-protocolo de alta interacción. Atrapa exploits complejos, propagación de malware y vectores de escaneo de red automatizados.', accent: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.07)', bg: 'rgba(255,255,255,0.04)', ports: '21 FTP, 445 SMB, 3306 MySQL' },
  glastopf:  { label: 'Glastopf Web Ingress',  icon: Globe,    desc: 'Emulador dinámico de vulnerabilidades web. Clasifica ataques LFI, RFI, inyección SQL y patrones especializados de crawlers y botnets.', accent: '#FBBF24', border: 'rgba(251,191,36,0.2)', bg: 'rgba(251,191,36,0.06)', ports: '8080 HTTP' },
  conpot:    { label: 'Conpot Industrial ICS',  icon: Cpu,      desc: 'Simulador de sistemas de control industrial. Imita infraestructura PLC para identificar reconocimiento contra redes de energía y utilities críticos.', accent: '#fb7185', border: 'rgba(251,113,133,0.2)', bg: 'rgba(251,113,133,0.06)', ports: '102 S7, 502 Modbus' },
  honeytrap: { label: 'Honeytrap Global Sink',  icon: Shield,   desc: 'Arquitectura de escucha TCP/UDP genérica. Actúa como sumidero para tráfico de red inesperado en cualquier rango de puertos no asignados.', accent: '#FCD34D', border: 'rgba(252,211,77,0.2)', bg: 'rgba(252,211,77,0.06)', ports: 'TCP/UDP wildcard' },
  honeyd:    { label: 'Honeyd Virtual Fabric',  icon: Network,  desc: 'Motor de topología de red virtual. Simula estructuras de subred completas para monitorizar movimiento lateral y comunicaciones internas de botnets.', accent: 'rgba(148,163,184,0.7)', border: 'rgba(148,163,184,0.1)', bg: 'rgba(148,163,184,0.05)', ports: 'Múltiples puertos virtuales' },
}

function getFlagEmoji(countryCode) {
  if (!countryCode) return '🌐'
  return String.fromCodePoint(...countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt()))
}

export default function HoneypotDetail() {
  const { name } = useParams()
  const meta = HP_META[name] ?? { label: name, icon: Shield, desc: '', accent: 'rgba(255,255,255,0.7)', border: 'rgba(255,255,255,0.08)', bg: 'rgba(255,255,255,0.04)', ports: '—' }

  const [attacks, setAttacks] = useState([])
  const [hpStats, setHpStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
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
      setHpStats(hRes.data.find(h => h.honeypot === name) ?? { honeypot: name, count: 0 })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [name, page])

  useEffect(() => { setPage(1) }, [name])
  useEffect(() => { load() }, [load])

  const uniqueIPs = [...new Set(attacks.map(a => a.source_ip))].length
  const countries = [...new Set(attacks.map(a => a.country).filter(Boolean))].length
  const lastSeen  = attacks[0]?.timestamp

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-7 max-w-7xl mx-auto p-2 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
          <ChevronLeft className="w-4 h-4" />
          Volver al panel
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Operacional</span>
        </div>
      </div>

      {/* Hero card */}
      <div className="glass-card overflow-hidden relative" style={{ borderColor: meta.border }}>
        <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none"
          style={{ background: `linear-gradient(to left, ${meta.bg}, transparent)`, opacity: 0.5 }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                <meta.icon className="w-7 h-7" style={{ color: meta.accent }} />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-white tracking-tight mb-1">{meta.label}</h2>
                <div className="flex items-center gap-2">
                  <span className="badge-premium text-[10px]"
                    style={{ color: meta.accent, background: meta.bg, borderColor: meta.border }}>
                    {meta.ports}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Escucha activa
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'rgba(255,255,255,0.4)' }}>{meta.desc}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { label: 'Total hits', value: hpStats?.count?.toLocaleString() ?? '—', color: meta.accent },
              { label: 'Regiones',   value: countries || '—',                         color: 'white'      },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-2xl min-w-[130px]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="label-sm mb-1">{s.label}</p>
                <p className="text-2xl font-display font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Vectores de ataque únicos', value: uniqueIPs, icon: Globe,     color: meta.accent },
          { label: 'Disponibilidad del sistema', value: '99.9%',  icon: Activity,  color: 'rgba(255,255,255,0.8)' },
          { label: 'Último registro',            value: lastSeen ? formatDistanceToNow(new Date(lastSeen), { locale: es, addSuffix: true }) : '—', icon: Clock, color: 'rgba(255,255,255,0.6)' },
        ].map(s => (
          <div key={s.label} className="glass-card flex items-center gap-4 p-5">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <s.icon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </div>
            <div>
              <p className="label-sm mb-0.5">{s.label}</p>
              <p className="text-lg font-display font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Attack log */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Activity className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white tracking-tight">Registro de ataques</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Filtrado por nodo: {name}
              </p>
            </div>
          </div>
          <span className="badge-premium" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.08)' }}>
            {total.toLocaleString()} entradas totales
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4" style={{ opacity: 0.35 }}>
            <div className="w-10 h-10 rounded-full animate-spin"
              style={{ border: '3px solid rgba(251,191,36,0.15)', borderTopColor: '#FBBF24' }} />
            <p className="text-xs font-bold uppercase tracking-widest">Accediendo a registros...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['IP origen','Región','Clasificación','Protocolo','Puerto','Usuario','Hace'].map((h, i) => (
                      <th key={h} className={`pb-4 px-3 label-sm ${i === 4 ? 'text-center' : ''} ${i === 6 ? 'text-right' : ''} ${i === 3 || i === 5 ? 'hidden md:table-cell' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attacks.map(a => (
                    <tr key={a.id} className="group transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="py-3.5 px-3">
                        <Link to={`/attacks/${a.id}`}
                          className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group/link">
                          {a.source_ip}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span>{getFlagEmoji(a.country_code)}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {a.country_code || '??'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                          {a.attack_type || 'Sin clasificar'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 hidden md:table-cell">
                        <span className="badge-premium font-mono tracking-normal capitalize text-[10px]"
                          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.07)' }}>
                          {a.protocol || 'Desconocido'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {a.dest_port || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 hidden md:table-cell">
                        <span className="text-xs font-mono truncate max-w-[100px] block"
                          style={{ color: 'rgba(251,191,36,0.5)' }}>
                          {a.username || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="text-[10px] font-bold uppercase whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          {formatDistanceToNow(new Date(a.timestamp), { locale: es, addSuffix: true })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {total > LIMIT && (
              <div className="flex items-center justify-between mt-7 pt-7" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-outline text-xs font-bold uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed">
                  Anterior
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Página</span>
                  <span className="px-3 py-1 rounded-lg font-mono font-bold text-xs text-amber-400"
                    style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    {page} / {Math.ceil(total / LIMIT)}
                  </span>
                </div>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}
                  className="btn-outline text-xs font-bold uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed">
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
