import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Activity, Newspaper, ChevronRight, Lock, Globe, Radio, Server, Zap, Check, Building2, ArrowRight } from 'lucide-react'
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
    accent: 'var(--accent)',
  },
  {
    to:    '/news',
    icon:  Newspaper,
    label: 'Noticias',
    desc:  'Últimas alertas y análisis de ciberseguridad de fuentes especializadas como The Hacker News, BleepingComputer y más.',
    cta:   'Leer noticias',
    badge: null,
    accent: 'var(--txt-1)',
  },
  {
    to:    '/login',
    icon:  Activity,
    label: 'Dashboard',
    desc:  'Panel de control completo: mapas de ataques globales, análisis forense, timelines y gestión avanzada de la red.',
    cta:   'Acceder',
    badge: 'Privado',
    accent: 'var(--accent)',
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
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg)', color: 'var(--txt)', transition: 'background 0.3s ease, color 0.2s ease' }}
    >
      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-36 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Live badge */}
          <div
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Red activa · 6 honeypots
            </span>
          </div>

          <h1 className="font-display font-black text-5xl md:text-6xl leading-[1.08] mb-6"
            style={{ color: 'var(--txt)' }}>
            Inteligencia de amenazas<br />
            <span style={{ color: 'var(--accent)' }}>
              en tiempo real
            </span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed mb-14"
            style={{ color: 'var(--txt-2)' }}>
            Plataforma de honeypots dockerizada que captura ataques reales contra múltiples
            protocolos. Datos abiertos para empresas, investigadores y entusiastas de la seguridad.
          </p>

          {/* Live stats */}
          <div
            className="inline-flex flex-wrap justify-center items-stretch gap-px mb-20 rounded-2xl overflow-hidden"
            style={{ background: 'var(--border)', border: '1px solid var(--border)' }}
          >
            {[
              { label: 'Ataques totales', value: stats?.total_attacks, accent: true  },
              { label: 'IPs únicas',      value: stats?.unique_ips,    accent: false },
              { label: 'Hoy',             value: stats?.attacks_today, accent: true  },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className="px-9 py-5 flex flex-col items-center min-w-[140px]"
                style={{ background: 'var(--surface)' }}
              >
                <span
                  className="font-display font-black text-2xl"
                  style={{ color: accent ? 'var(--accent)' : 'var(--txt)' }}
                >
                  {value != null ? value.toLocaleString('es-ES') : '—'}
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
                  style={{ color: 'var(--txt-3)' }}
                >
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
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-strong)'
                e.currentTarget.style.background = 'var(--surface-2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'var(--surface)'
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-12 h-12 p-3 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
                >
                  <Icon className="w-6 h-6" style={{ color: accent === 'var(--txt-1)' ? 'var(--txt-2)' : 'var(--accent)' }} />
                </div>
                {badge && (
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--txt-3)' }}
                  >
                    <Lock className="w-2.5 h-2.5" />
                    {badge}
                  </span>
                )}
              </div>
              <h2 className="font-display font-bold text-xl mb-2.5" style={{ color: 'var(--txt)' }}>{label}</h2>
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--txt-2)' }}>{desc}</p>
              <div className="flex items-center gap-1.5 mt-6 text-sm font-bold" style={{ color: 'var(--accent)' }}>
                {cta}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* Features strip */}
      <section className="py-12" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-medium leading-snug" style={{ color: 'var(--txt-2)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing B2B section */}
      <section className="py-24" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.45 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
              <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                Portal B2B · Protección para empresas
              </span>
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl mb-5" style={{ color: 'var(--txt)' }}>
              Inteligencia de amenazas<br />
              <span style={{ color: 'var(--accent)' }}>adaptada a tu negocio</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--txt-2)' }}>
              Desde startups hasta grandes corporaciones. Sin infraestructura que gestionar,
              activo en menos de 5 minutos.
            </p>
          </motion.div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            {[
              {
                id: 'basico',
                name: 'Básico',
                price: 'Gratis',
                priceNum: null,
                icon: Shield,
                color: 'rgba(148,163,184,0.9)',
                border: 'rgba(148,163,184,0.15)',
                bg: 'rgba(148,163,184,0.05)',
                features: ['2 sensores activos', 'Dashboard de amenazas', 'Historial 7 días'],
                locked: ['Mapa geográfico', 'Alertas en tiempo real', 'Informes PDF'],
                cta: 'Empezar gratis',
                ctaStyle: 'btn-outline',
              },
              {
                id: 'profesional',
                name: 'Profesional',
                price: '30',
                priceNum: '30',
                icon: Zap,
                color: '#FBBF24',
                border: 'rgba(251,191,36,0.35)',
                bg: 'rgba(251,191,36,0.06)',
                badge: 'Más popular',
                features: ['6 sensores activos', 'Mapa geográfico completo', 'Alertas tiempo real', 'Informes PDF mensuales', 'Historial 30 días'],
                locked: [],
                cta: 'Empezar 14 días gratis',
                ctaStyle: 'btn-premium',
              },
              {
                id: 'empresarial',
                name: 'Empresarial',
                price: '50',
                priceNum: '50',
                icon: Building2,
                color: '#fb7185',
                border: 'rgba(251,113,133,0.25)',
                bg: 'rgba(251,113,133,0.05)',
                features: ['Sensores ilimitados', 'API de acceso completa', 'Alertas + SMS', 'Informes personalizados', 'SLA 99.9% · Soporte 24/7', 'Account manager dedicado'],
                locked: [],
                cta: 'Contactar ventas',
                ctaStyle: 'btn-outline',
              },
            ].map((plan, i) => {
              const Icon = plan.icon
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-2xl p-7 flex flex-col relative"
                  style={{
                    background: plan.badge ? plan.bg : 'var(--surface)',
                    border: `1px solid ${plan.badge ? plan.border : 'var(--border)'}`,
                    boxShadow: plan.badge ? `0 0 40px ${plan.bg}` : 'none',
                  }}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{ background: '#FBBF24', color: '#000' }}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-xl" style={{ background: plan.bg, border: `1px solid ${plan.border}` }}>
                      <Icon className="w-5 h-5" style={{ color: plan.color }} />
                    </div>
                    <span className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>{plan.name}</span>
                  </div>

                  <div className="mb-6">
                    {plan.priceNum
                      ? <div className="flex items-baseline gap-1">
                          <span className="font-display font-black text-4xl" style={{ color: plan.color }}>€{plan.price}</span>
                          <span className="text-sm" style={{ color: 'var(--txt-3)' }}>/mes</span>
                        </div>
                      : <span className="font-display font-black text-4xl" style={{ color: plan.color }}>Gratis</span>
                    }
                  </div>

                  <div className="space-y-2 flex-1 mb-7">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2.5">
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: plan.color }} />
                        <span className="text-sm" style={{ color: 'var(--txt-1)' }}>{f}</span>
                      </div>
                    ))}
                    {plan.locked.map(f => (
                      <div key={f} className="flex items-center gap-2.5 opacity-30">
                        <Lock className="w-3 h-3 shrink-0" style={{ color: 'var(--txt-3)' }} />
                        <span className="text-sm" style={{ color: 'var(--txt-3)' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/register"
                    className={`w-full py-3 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 transition-all duration-150 ${plan.ctaStyle}`}>
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center"
          >
            <p className="text-sm mb-4" style={{ color: 'var(--txt-3)' }}>
              ¿Tienes dudas? Consulta todos los detalles y preguntas frecuentes.
            </p>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 text-sm font-bold transition-colors duration-150"
              style={{ color: 'var(--accent)' }}>
              Ver comparativa completa de planes
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--txt-3)' }}>HONEYPOT CYBERSECURITY — Plataforma de Inteligencia de Amenazas</p>
        <p className="text-xs mt-1" style={{ color: 'var(--txt-4)' }}>Todos los datos son capturas reales de ataques a honeypots activos</p>
      </footer>
    </div>
  )
}
