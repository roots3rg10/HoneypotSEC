import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Shield, Activity, Globe, Lock, Network, Cpu,
  RefreshCw, Wifi, Eye, ArrowRight, ServerCrash,
} from 'lucide-react'
import { getHoneypots, getPublicAttacks } from '../services/api'
import PublicNavbar from '../components/Layout/PublicNavbar'
import { useTheme } from '../context/ThemeContext'

function getFlagEmoji(cc) {
  if (!cc) return '🌐'
  return String.fromCodePoint(...cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt()))
}

export default function Honeypots() {
  const [hpStats,        setHpStats]        = useState([])
  const [feed,           setFeed]           = useState([])
  const [feedLoaded,     setFeedLoaded]     = useState(false)
  const [lastSeen,       setLastSeen]       = useState(null)
  const [spinning,       setSpinning]       = useState(false)
  const [filterHoneypot, setFilterHoneypot] = useState('all')
  const timerRef = useRef(null)
  const { isDark } = useTheme()

  const HP_META = {
    cowrie: {
      label: 'Cowrie SSH/Telnet', icon: Lock,
      accent: isDark ? 'rgba(255,255,255,0.8)' : '#334155',
      border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.18)',
      bg:     isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      bar:    isDark ? '#ffffff' : '#334155',
      ports: '22 SSH · 23 Telnet', category: 'Acceso remoto',
      desc: 'Emulador de alto nivel de SSH y Telnet. Captura intentos de fuerza bruta, sesiones interactivas y comandos post-explotación ejecutados por atacantes reales.',
    },
    dionaea: {
      label: 'Dionaea Multi-Protocolo', icon: Activity,
      accent: isDark ? 'rgba(255,255,255,0.6)' : '#475569',
      border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.14)',
      bg:     isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      bar:    isDark ? 'rgba(255,255,255,0.6)' : '#475569',
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
      accent: isDark ? 'rgba(148,163,184,0.7)' : '#64748b',
      border: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(0,0,0,0.14)',
      bg:     isDark ? 'rgba(148,163,184,0.05)' : 'rgba(0,0,0,0.03)',
      bar:    isDark ? 'rgba(148,163,184,0.7)' : '#64748b',
      ports: 'Múltiples virtuales', category: 'Red virtual',
      desc: 'Motor de topología de red virtual. Simula subredes completas para monitorizar movimiento lateral y comunicaciones internas de botnets.',
    },
  }

  const SOURCE_BADGE = {
    cowrie:    { color: isDark ? 'rgba(255,255,255,0.7)' : '#334155', bg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)' },
    dionaea:   { color: isDark ? 'rgba(255,255,255,0.5)' : '#475569', bg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)' },
    glastopf:  { color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.18)' },
    conpot:    { color: '#fb7185', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.18)' },
    honeytrap: { color: '#FCD34D', bg: 'rgba(252,211,77,0.08)', border: 'rgba(252,211,77,0.18)' },
    honeyd:    { color: isDark ? 'rgba(148,163,184,0.6)' : '#64748b', bg: isDark ? 'rgba(148,163,184,0.05)' : 'rgba(0,0,0,0.03)', border: isDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.12)' },
  }

  const loadStats = async () => {
    try { setHpStats((await getHoneypots()).data) } catch (_) {}
  }

  const loadFeed = async () => {
    setSpinning(true)
    try {
      const items = (await getPublicAttacks(25)).data ?? []
      setFeed(items)
      setLastSeen(new Date())
    } catch (_) {
      // leave feed as-is, just stop spinning
    } finally {
      setSpinning(false)
      setFeedLoaded(true)
    }
  }

  useEffect(() => {
    loadStats()
    loadFeed()
    timerRef.current = setInterval(loadFeed, 15000)
    return () => clearInterval(timerRef.current)
  }, [])

  const maxCount     = Math.max(1, ...hpStats.map(h => h.count))
  const totalAttacks = hpStats.reduce((s, h) => s + h.count, 0)
  const filteredFeed = filterHoneypot === 'all' ? feed : feed.filter(a => a.honeypot === filterHoneypot)
  const honeypotKeys = Object.keys(HP_META)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
      <PublicNavbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-10 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Wifi className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">6 sensores activos</span>
          </div>

          <h1 className="font-display font-black text-4xl md:text-5xl mb-4" style={{ color: 'var(--txt)' }}>
            Nuestros{' '}
            <span className="text-amber-400" style={{ textShadow: '0 0 32px rgba(251,191,36,0.4)' }}>
              Honeypots
            </span>
            {' '}Centrales
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--txt-2)' }}>
            Infraestructura real desplegada en producción. Los datos que ves son capturas auténticas
            de ataques activos — no simulaciones, no demos.
          </p>

          {/* Stats */}
          <div className="inline-flex items-center gap-6 rounded-xl px-6 py-3 mb-8"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-center">
              <p className="font-display font-black text-xl text-amber-400">{totalAttacks.toLocaleString('es-ES')}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt-3)' }}>Ataques capturados</p>
            </div>
            <div className="w-px h-8" style={{ background: 'var(--border)' }} />
            <div className="text-center">
              <p className="font-display font-black text-xl" style={{ color: 'var(--txt)' }}>6</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt-3)' }}>Honeypots activos</p>
            </div>
            <div className="w-px h-8" style={{ background: 'var(--border)' }} />
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="font-display font-black text-xl text-emerald-400">LIVE</p>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt-3)' }}>Actualización 15 s</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Preview callout ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl p-6 flex flex-col md:flex-row gap-5 items-start md:items-center"
          style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.18)' }}>
          <div className="flex-shrink-0 p-3 rounded-xl"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Eye className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm mb-1" style={{ color: 'var(--txt)' }}>
              Vista previa de tu futuro panel de control
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--txt-2)' }}>
              Esto es exactamente lo que verás en tu plataforma: los mismos honeypots, el mismo feed de actividad
              y los mismos análisis, pero aplicados a <strong style={{ color: 'var(--txt)' }}>tu red y tus activos</strong>.
              Los sensores que ves aquí son nuestra infraestructura central de inteligencia de amenazas.
            </p>
          </div>
          <a href="/login"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 text-amber-400 whitespace-nowrap"
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.12)'}>
            Acceder al panel
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </section>

      {/* ── Honeypot cards ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>Sensores desplegados</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--txt-3)' }}>
              Honeypots activos en nuestra infraestructura de producción
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
            Infraestructura real
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
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
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                    <Icon className="w-6 h-6" style={{ color: meta.accent }} />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ color: 'var(--txt-3)', border: '1px solid var(--border)', background: 'var(--inset)' }}>
                      {meta.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      activo
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base mb-1" style={{ color: 'var(--txt)' }}>{meta.label}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--txt-2)' }}>{meta.desc}</p>
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
                    <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--txt-3)' }}>
                      Actividad acumulada
                    </span>
                    <span className="font-display font-black text-sm" style={{ color: meta.accent }}>
                      {count.toLocaleString('es-ES')} ataques
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--inset)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: meta.bar }} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ── Live feed ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

          {/* Header */}
          <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                </div>
                <h2 className="font-display font-bold text-base" style={{ color: 'var(--txt)' }}>
                  Actividad en tiempo real
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#FBBF24' }}>
                  Datos reales
                </span>
              </div>
              <div className="flex items-center gap-4">
                {lastSeen && (
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt-3)' }}>
                    Actualizado {formatDistanceToNow(lastSeen, { addSuffix: true, locale: es })}
                  </span>
                )}
                <button onClick={loadFeed} disabled={spinning}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'var(--txt-3)', opacity: spinning ? 0.5 : 1 }}
                  onMouseEnter={e => { if (!spinning) { e.currentTarget.style.color = 'var(--txt)'; e.currentTarget.style.background = 'var(--inset)' } }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt-3)'; e.currentTarget.style.background = 'transparent' }}>
                  <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterHoneypot('all')}
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all duration-150"
                style={{
                  background: filterHoneypot === 'all' ? 'rgba(251,191,36,0.12)' : 'var(--inset)',
                  border: `1px solid ${filterHoneypot === 'all' ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
                  color: filterHoneypot === 'all' ? '#FBBF24' : 'var(--txt-3)',
                }}>
                Todos
              </button>
              {honeypotKeys.map(key => {
                const isActive = filterHoneypot === key
                const s = SOURCE_BADGE[key] ?? {}
                return (
                  <button key={key}
                    onClick={() => setFilterHoneypot(isActive ? 'all' : key)}
                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all duration-150"
                    style={{
                      background: isActive ? (s.bg ?? 'var(--inset)') : 'var(--inset)',
                      border: `1px solid ${isActive ? (s.border ?? 'var(--border)') : 'var(--border)'}`,
                      color: isActive ? (s.color ?? 'var(--txt-2)') : 'var(--txt-3)',
                    }}>
                    {key}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Body */}
          {!feedLoaded ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ opacity: 0.45 }}>
              <div className="w-8 h-8 rounded-full animate-spin"
                style={{ border: '2px solid rgba(251,191,36,0.15)', borderTopColor: '#FBBF24' }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--txt)' }}>Cargando feed…</p>
            </div>
          ) : feed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ opacity: 0.5 }}>
              <ServerCrash className="w-8 h-8" style={{ color: 'var(--txt-3)' }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--txt)' }}>
                Sin datos disponibles
              </p>
            </div>
          ) : filteredFeed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ opacity: 0.4 }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--txt)' }}>
                Sin eventos para este filtro
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="px-6 py-3 label-sm">Sensor</th>
                    <th className="px-4 py-3 label-sm">País</th>
                    <th className="px-4 py-3 label-sm">Tipo de ataque</th>
                    <th className="px-4 py-3 label-sm hidden md:table-cell">Protocolo</th>
                    <th className="px-4 py-3 label-sm text-right">Hace</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeed.map(a => {
                    const s = SOURCE_BADGE[a.honeypot] ?? { color: 'var(--txt-2)', bg: 'var(--inset)', border: 'var(--border)' }
                    return (
                      <tr key={a.id} className="transition-colors"
                        style={{ borderTop: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--inset)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td className="px-6 py-3">
                          <span className="badge-premium text-[10px]"
                            style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                            {a.honeypot}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base leading-none">{getFlagEmoji(a.country_code)}</span>
                            <span className="text-xs font-medium" style={{ color: 'var(--txt-2)' }}>
                              {a.country || a.country_code || 'Desconocido'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium" style={{ color: 'var(--txt-1)' }}>
                            {a.attack_type || 'Sin clasificar'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="font-mono text-[10px] font-bold uppercase" style={{ color: 'var(--txt-3)' }}>
                            {a.protocol || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--txt-3)' }}>
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

          <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-[10px] font-medium" style={{ color: 'var(--txt-3)' }}>
              Actualización automática cada 15 segundos · Datos reales anonimizados
            </span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--txt-3)' }}>
              {filterHoneypot === 'all'
                ? `Últimos ${feed.length} eventos`
                : `${filteredFeed.length} de ${feed.length} — filtrado por ${filterHoneypot}`}
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl p-10 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-3">Tu infraestructura</p>
          <h3 className="font-display font-black text-2xl md:text-3xl mb-4" style={{ color: 'var(--txt)' }}>
            ¿Listo para tener tu propio panel de control?
          </h3>
          <p className="text-sm max-w-lg mx-auto mb-8" style={{ color: 'var(--txt-2)' }}>
            Todo lo que ves aquí — sensores, feed de actividad, alertas e informes — disponible para tu organización
            con sensores desplegados en tu red.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="/login"
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 bg-amber-400 text-slate-900"
              onMouseEnter={e => e.currentTarget.style.background = '#fbbf24cc'}
              onMouseLeave={e => e.currentTarget.style.background = '#FBBF24'}>
              Acceder al portal
            </a>
            <a href="/#pricing"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200"
              style={{ border: '1px solid var(--border)', color: 'var(--txt-2)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--txt)'; e.currentTarget.style.background = 'var(--inset)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt-2)'; e.currentTarget.style.background = 'transparent' }}>
              Ver planes
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </section>

      <footer className="py-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--txt-3)' }}>HONEYPOT CYBERSECURITY — Plataforma de Inteligencia de Amenazas</p>
        <p className="text-xs mt-1" style={{ color: 'var(--txt-4)' }}>Todos los datos son capturas reales de ataques a honeypots activos · IPs anonimizadas en la vista pública</p>
      </footer>
    </div>
  )
}
