import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Shield, Activity, Globe, Lock, Network, Cpu, RefreshCw, Wifi } from 'lucide-react'
import { getHoneypots, getAttacks } from '../services/api'
import PublicNavbar from '../components/Layout/PublicNavbar'

const HP_META = {
  cowrie: {
    label: 'Cowrie SSH/Telnet', icon: Lock,
    accent: 'rgba(255,255,255,0.8)', border: 'rgba(255,255,255,0.12)', bg: 'rgba(255,255,255,0.05)', bar: '#ffffff',
    ports: '22 SSH · 23 Telnet', category: 'Acceso remoto',
    desc: 'Emulador de alto nivel de SSH y Telnet. Captura intentos de fuerza bruta, sesiones interactivas y comandos post-explotación ejecutados por atacantes reales.',
  },
  dionaea: {
    label: 'Dionaea Multi-Protocolo', icon: Activity,
    accent: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.08)', bg: 'rgba(255,255,255,0.04)', bar: 'rgba(255,255,255,0.6)',
    ports: '21 FTP · 445 SMB · 3306 MySQL', category: 'Multi-protocolo',
    desc: 'Sensor multi-protocolo de alta interacción. Atrapa exploits complejos, propagación de malware y vectores de escaneo de red automatizados.',
  },
  glastopf: {
    label: 'Glastopf Web', icon: Globe,
    accent: '#FBBF24', border: 'rgba(251,191,36,0.2)', bg: 'rgba(251,191,36,0.06)', bar: '#FBBF24',
    ports: '80 HTTP · 8080 HTTP alt', category: 'Aplicaciones web',
    desc: 'Emulador dinámico de vulnerabilidades web. Clasifica ataques LFI, RFI, inyección SQL y patrones de crawlers y botnets maliciosos.',
  },
  conpot: {
    label: 'Conpot ICS/SCADA', icon: Cpu,
    accent: '#fb7185', border: 'rgba(251,113,133,0.2)', bg: 'rgba(251,113,133,0.06)', bar: '#fb7185',
    ports: '102 S7 · 502 Modbus', category: 'Infraestructura crítica',
    desc: 'Simulador de sistemas de control industrial. Imita infraestructuras PLC para identificar reconocimiento contra redes de energía y utilities.',
  },
  honeytrap: {
    label: 'Honeytrap TCP/UDP', icon: Shield,
    accent: '#FCD34D', border: 'rgba(252,211,77,0.2)', bg: 'rgba(252,211,77,0.06)', bar: '#FCD34D',
    ports: 'TCP/UDP Wildcard', category: 'Escáner genérico',
    desc: 'Arquitectura de escucha TCP/UDP genérica. Actúa como sumidero para tráfico inesperado en cualquier rango de puertos no asignados.',
  },
  honeyd: {
    label: 'Honeyd Red Virtual', icon: Network,
    accent: 'rgba(148,163,184,0.7)', border: 'rgba(148,163,184,0.12)', bg: 'rgba(148,163,184,0.05)', bar: 'rgba(148,163,184,0.7)',
    ports: 'Múltiples virtuales', category: 'Red virtual',
    desc: 'Motor de topología de red virtual. Simula subredes completas para monitorizar movimiento lateral y comunicaciones internas de botnets.',
  },
}

const SOURCE_BADGE = {
  cowrie:    { color: 'rgba(255,255,255,0.7)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
  dionaea:   { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
  glastopf:  { color: '#FBBF24',              bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.18)'  },
  conpot:    { color: '#fb7185',              bg: 'rgba(251,113,133,0.08)',border: 'rgba(251,113,133,0.18)' },
  honeytrap: { color: '#FCD34D',              bg: 'rgba(252,211,77,0.08)', border: 'rgba(252,211,77,0.18)'  },
  honeyd:    { color: 'rgba(148,163,184,0.6)',bg: 'rgba(148,163,184,0.05)',border: 'rgba(148,163,184,0.1)'  },
}

function getFlagEmoji(cc) {
  if (!cc) return '🌐'
  return String.fromCodePoint(...cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt()))
}

export default function Honeypots() {
  const [hpStats, setHpStats]   = useState([])
  const [feed,    setFeed]      = useState([])
  const [lastSeen,setLastSeen]  = useState(null)
  const [spinning,setSpinning]  = useState(false)
  const timerRef = useRef(null)

  const loadStats = async () => {
    try { setHpStats((await getHoneypots()).data) } catch (_) {}
  }
  const loadFeed = async () => {
    setSpinning(true)
    try { setFeed((await getAttacks({ limit: 20 })).data.items ?? []); setLastSeen(new Date()) } catch (_) {}
    setSpinning(false)
  }

  useEffect(() => {
    loadStats(); loadFeed()
    timerRef.current = setInterval(loadFeed, 10000)
    return () => clearInterval(timerRef.current)
  }, [])

  const maxCount    = Math.max(1, ...hpStats.map(h => h.count))
  const totalAttacks = hpStats.reduce((s, h) => s + h.count, 0)

  return (
    <div className="min-h-screen text-white" style={{ background: '#050505' }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-14 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Wifi className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">6 sensores activos</span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
            Red de{' '}
            <span className="text-amber-400" style={{ textShadow: '0 0 32px rgba(251,191,36,0.4)' }}>
              Honeypots
            </span>
          </h1>
          <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Trampas activas que simulan servicios reales para atraer, detectar y registrar
            ataques automatizados y manuales en tiempo real.
          </p>
          <div className="inline-flex items-center gap-6 rounded-xl px-6 py-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-center">
              <p className="font-display font-black text-xl text-amber-400">{totalAttacks.toLocaleString('es-ES')}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Ataques capturados</p>
            </div>
            <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="text-center">
              <p className="font-display font-black text-xl text-white">{hpStats.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Honeypots activos</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Honeypot cards */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {Object.entries(HP_META).map(([key, meta], idx) => {
            const stat  = hpStats.find(h => h.honeypot === key)
            const count = stat?.count ?? 0
            const pct   = Math.round((count / maxCount) * 100)
            const Icon  = meta.icon
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04 * idx }}
                className="rounded-2xl p-6 flex flex-col gap-5 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${meta.border}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                    <Icon className="w-6 h-6" style={{ color: meta.accent }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                    {meta.category}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white mb-1">{meta.label}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{meta.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {meta.ports.split(' · ').map(p => (
                    <span key={p} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                      style={{ background: meta.bg, color: meta.accent, border: `1px solid ${meta.border}` }}>
                      {p}
                    </span>
                  ))}
                </div>
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Actividad
                    </span>
                    <span className="font-display font-black text-sm" style={{ color: meta.accent }}>
                      {count.toLocaleString('es-ES')} ataques
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: meta.bar }} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Live feed */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </div>
              <h2 className="font-display font-bold text-base text-white">Actividad en tiempo real</h2>
            </div>
            <div className="flex items-center gap-4">
              {lastSeen && (
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Actualizado {formatDistanceToNow(lastSeen, { addSuffix: true, locale: es })}
                </span>
              )}
              <button onClick={loadFeed} className="p-1.5 rounded-lg transition-all"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent' }}>
                <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {feed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ opacity: 0.3 }}>
              <div className="w-8 h-8 rounded-full animate-spin mb-3"
                style={{ border: '2px solid rgba(251,191,36,0.15)', borderTopColor: '#FBBF24' }} />
              <p className="text-xs font-bold uppercase tracking-widest">Cargando...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="px-6 py-3 label-sm">Honeypot</th>
                    <th className="px-4 py-3 label-sm">País</th>
                    <th className="px-4 py-3 label-sm">Tipo de ataque</th>
                    <th className="px-4 py-3 label-sm hidden md:table-cell">Protocolo</th>
                    <th className="px-4 py-3 label-sm text-right">Hace</th>
                  </tr>
                </thead>
                <tbody>
                  {feed.map(a => {
                    const s = SOURCE_BADGE[a.honeypot] ?? { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' }
                    return (
                      <tr key={a.id} className="transition-colors"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td className="px-6 py-3">
                          <span className="badge-premium text-[10px]"
                            style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                            {a.honeypot}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{getFlagEmoji(a.country_code)}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              {a.country_code || '??'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            {a.attack_type || 'Sin clasificar'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="font-mono text-[10px] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {a.protocol || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {formatDistanceToNow(new Date(a.timestamp), { locale: es })}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Actualización automática cada 10 segundos
            </span>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Mostrando los 20 ataques más recientes
            </span>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>HONEYPOT CYBERSECURITY — Plataforma de Inteligencia de Amenazas</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.1)' }}>Todos los datos son capturas reales de ataques a honeypots activos</p>
      </footer>
    </div>
  )
}
