import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Activity, Newspaper, ChevronRight, Lock, Globe, Radio, Server, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getSummary } from '../services/api'
import PublicNavbar from '../components/Layout/PublicNavbar'

const CARDS = [
  {
    to:    '/honeypots',
    icon:  Shield,
    label: 'Honeypots',
    desc:  'Explora nuestra red de trampas activas. Documentación técnica de cada sensor y actividad capturada en tiempo real.',
    cta:   'Explorar red',
    badge: null,
    accent: '#FBBF24',
  },
  {
    to:    '/news',
    icon:  Newspaper,
    label: 'Noticias',
    desc:  'Últimas alertas y análisis de ciberseguridad de fuentes especializadas como The Hacker News, BleepingComputer y más.',
    cta:   'Leer noticias',
    badge: null,
    accent: 'rgba(255,255,255,0.7)',
  },
  {
    to:    '/login',
    icon:  Activity,
    label: 'Dashboard',
    desc:  'Panel de control completo: mapas de ataques globales, análisis forense, timelines y gestión avanzada de la red.',
    cta:   'Acceder',
    badge: 'Privado',
    accent: '#FBBF24',
  },
]

const HIGHLIGHTS = [
  { icon: Radio,  text: 'SSH · HTTP · SMB · ICS/SCADA · FTP · TCP/UDP' },
  { icon: Globe,  text: 'Geolocalización de cada ataque en tiempo real' },
  { icon: Server, text: 'Logs con payloads, credenciales y fingerprints' },
  { icon: Zap,    text: 'Clasificación automática por tipo de amenaza' },
]

export default function Landing() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getSummary().then(r => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen text-white" style={{ background: '#050505' }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-36 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Red activa · 6 honeypots</span>
          </div>

          <h1 className="font-display font-black text-5xl md:text-6xl leading-[1.08] mb-6 text-white">
            Inteligencia de amenazas<br />
            <span className="text-amber-400" style={{ textShadow: '0 0 40px rgba(251,191,36,0.35)' }}>
              en tiempo real
            </span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed mb-14"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            Plataforma de honeypots dockerizada que captura ataques reales contra múltiples
            protocolos. Datos abiertos para empresas, investigadores y entusiastas de la seguridad.
          </p>

          {/* Live stats */}
          <div className="inline-flex flex-wrap justify-center items-stretch gap-px mb-20 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { label: 'Ataques totales', value: stats?.total_attacks, color: '#FBBF24' },
              { label: 'IPs únicas',      value: stats?.unique_ips,    color: 'white'   },
              { label: 'Hoy',             value: stats?.attacks_today, color: '#FBBF24' },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-9 py-5 flex flex-col items-center min-w-[140px]"
                style={{ background: 'rgba(0,0,0,0.4)' }}>
                <span className="font-display font-black text-2xl" style={{ color }}>
                  {value != null ? value.toLocaleString('es-ES') : '—'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Nav cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {CARDS.map(({ to, icon: Icon, label, desc, cta, badge, accent }) => (
            <Link
              key={to}
              to={to}
              className="group relative rounded-2xl p-7 flex flex-col text-left cursor-pointer transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${accent}25`
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 p-3 rounded-xl flex items-center justify-center"
                  style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
                  <Icon className="w-6 h-6" style={{ color: accent }} />
                </div>
                {badge && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    <Lock className="w-2.5 h-2.5" />
                    {badge}
                  </span>
                )}
              </div>
              <h2 className="font-display font-bold text-xl text-white mb-2.5">{label}</h2>
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
              <div className="flex items-center gap-1.5 mt-6 text-sm font-bold" style={{ color: accent }}>
                {cta}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* Features strip */}
      <section className="py-12" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-medium leading-snug" style={{ color: 'rgba(255,255,255,0.35)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>HONEYPOT CYBERSECURITY — Plataforma de Inteligencia de Amenazas</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.12)' }}>Todos los datos son capturas reales de ataques a honeypots activos</p>
      </footer>
    </div>
  )
}
