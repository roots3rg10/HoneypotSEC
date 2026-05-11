import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Zap, Shield, Building2, ArrowRight } from 'lucide-react'
import PublicNavbar from '../components/Layout/PublicNavbar'

const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    price: '0',
    period: 'Gratis para siempre',
    icon: Shield,
    color: 'rgba(148,163,184,0.8)',
    border: 'rgba(148,163,184,0.15)',
    bg: 'rgba(148,163,184,0.05)',
    features: [
      '2 sensores honeypot activos',
      'Dashboard de amenazas',
      'Alertas por email (24h delay)',
      'Mapa de ataques global',
      'Soporte comunidad',
    ],
    missing: ['Alertas en tiempo real', 'Informes PDF', 'API de acceso', 'SLA garantizado'],
    cta: 'Empezar gratis',
    ctaLink: '/register',
  },
  {
    id: 'profesional',
    name: 'Profesional',
    price: '49',
    period: '€ / mes · facturación mensual',
    icon: Zap,
    color: '#FBBF24',
    border: 'rgba(251,191,36,0.3)',
    bg: 'rgba(251,191,36,0.06)',
    highlight: true,
    badge: 'Más popular',
    features: [
      '6 sensores honeypot activos',
      'Dashboard completo en tiempo real',
      'Alertas push y email instantáneas',
      'Mapa de ataques con filtros',
      'Informes PDF mensuales',
      'API de lectura (1.000 req/día)',
      'Soporte prioritario (8h respuesta)',
    ],
    missing: ['SLA garantizado', 'Onboarding personalizado'],
    cta: 'Empezar 14 días gratis',
    ctaLink: '/register',
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    price: '149',
    period: '€ / mes · contrato anual',
    icon: Building2,
    color: '#fb7185',
    border: 'rgba(251,113,133,0.3)',
    bg: 'rgba(251,113,133,0.06)',
    features: [
      'Sensores ilimitados',
      'Dashboard multi-sede',
      'Alertas en tiempo real + SMS',
      'Informes PDF personalizados',
      'API completa sin límites',
      'SLA 99.9% garantizado',
      'Onboarding y formación incluidos',
      'Account manager dedicado',
      'Soporte 24/7 teléfono y chat',
    ],
    missing: [],
    cta: 'Contactar ventas',
    ctaLink: '/register',
  },
]

const FAQ = [
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí. Los planes mensuales se pueden cancelar sin penalización. Los anuales tienen reembolso proporcional durante los primeros 30 días.',
  },
  {
    q: '¿Qué significa "sensor honeypot activo"?',
    a: 'Cada sensor es un servicio trampa (SSH, HTTP, SMB, ICS…) que detecta intentos de acceso no autorizados y los registra en tu dashboard.',
  },
  {
    q: '¿Los datos son de mi red o globales?',
    a: 'En el plan MVP recibes inteligencia global de nuestra red de honeypots. La integración de sensores en tu propia red está disponible en el plan Empresarial.',
  },
  {
    q: '¿Necesito instalar software?',
    a: 'No. El acceso es 100% web. Los sensores corren en nuestra infraestructura. Para integración en tu red se facilita un agente Docker.',
  },
]

export default function Pricing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Planes y precios</span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl mb-4" style={{ color: 'var(--txt)' }}>
            Protección que{' '}
            <span className="text-amber-400">escala con tu empresa</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--txt-2)' }}>
            Sin sorpresas. Sin infraestructura que gestionar. Activa la protección
            de tu red en menos de 5 minutos.
          </p>
        </motion.div>
      </section>

      {/* Plans */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {PLANS.map((plan, i) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="rounded-2xl p-7 flex flex-col relative"
                style={{
                  background: plan.highlight ? plan.bg : 'var(--surface)',
                  border: `1px solid ${plan.highlight ? plan.border : 'var(--border)'}`,
                  boxShadow: plan.highlight ? `0 0 40px ${plan.bg}, var(--shadow)` : 'var(--shadow)',
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

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl" style={{ background: plan.bg, border: `1px solid ${plan.border}` }}>
                    <Icon className="w-5 h-5" style={{ color: plan.color }} />
                  </div>
                  <span className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>{plan.name}</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    {plan.price !== '0'
                      ? <>
                          <span className="font-display font-black text-4xl" style={{ color: plan.color }}>€{plan.price}</span>
                          <span className="text-sm" style={{ color: 'var(--txt-3)' }}>/mes</span>
                        </>
                      : <span className="font-display font-black text-4xl" style={{ color: plan.color }}>Gratis</span>
                    }
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--txt-3)' }}>{plan.period}</p>
                </div>

                <div className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: plan.color }} />
                      <span className="text-sm" style={{ color: 'var(--txt-1)' }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map(f => (
                    <div key={f} className="flex items-center gap-2.5 opacity-35">
                      <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                        <div className="w-3 h-px rounded" style={{ background: 'var(--txt-3)' }} />
                      </div>
                      <span className="text-sm" style={{ color: 'var(--txt-3)' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={plan.ctaLink}
                  className={`w-full py-3 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 transition-all duration-150 ${plan.highlight ? 'btn-premium' : 'btn-outline'}`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="font-display font-black text-2xl text-center mb-10" style={{ color: 'var(--txt)' }}>
          Preguntas frecuentes
        </h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="rounded-xl p-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 className="font-display font-bold text-sm mb-2" style={{ color: 'var(--txt)' }}>{q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--txt-2)' }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--txt-3)' }}>HONEYPOT CYBERSECURITY — Precios sin IVA · IVA 21% aplicable en España</p>
      </footer>
    </div>
  )
}
