import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Lock, CheckCircle, AlertCircle, Shield, Zap, Building2,
  ChevronRight, ArrowLeft,
} from 'lucide-react'
import { registerApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PLAN_META = {
  basico: {
    name: 'Plan Básico',
    price: '5,00',
    period: 'mes',
    icon: Shield,
    color: 'rgba(148,163,184,0.9)',
    bg: 'rgba(148,163,184,0.06)',
    border: 'rgba(148,163,184,0.2)',
    features: ['2 sensores honeypot', 'Dashboard de amenazas', 'Alertas por email'],
  },
  profesional: {
    name: 'Plan Profesional',
    price: '30,00',
    period: 'mes',
    icon: Zap,
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.06)',
    border: 'rgba(251,191,36,0.25)',
    features: ['6 sensores honeypot', 'Tiempo real', 'Informes PDF', 'API de acceso'],
  },
  empresarial: {
    name: 'Plan Empresarial',
    price: '50,00',
    period: 'mes',
    icon: Building2,
    color: '#fb7185',
    bg: 'rgba(251,113,133,0.06)',
    border: 'rgba(251,113,133,0.25)',
    features: ['Sensores ilimitados', 'SLA 99.9%', 'Soporte 24/7', 'Account manager'],
  },
}

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

function inputCls(focused) {
  return {
    color: 'white',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused ? 'rgba(251,191,36,0.45)' : 'rgba(255,255,255,0.08)'}`,
    boxShadow: focused ? '0 0 0 3px rgba(251,191,36,0.08)' : 'none',
    caretColor: '#FBBF24',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }
}

export default function Payment() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()

  const state = location.state
  useEffect(() => {
    if (!state?.plan || !PLAN_META[state.plan]) {
      navigate('/pricing', { replace: true })
    }
  }, [state, navigate])

  if (!state?.plan || !PLAN_META[state.plan]) return null

  const meta    = PLAN_META[state.plan]
  const PlanIcon = meta.icon

  const [form,    setForm]    = useState({ titular: '', card: '', expiry: '', cvv: '' })
  const [focused, setFocused] = useState({})
  const [error,   setError]   = useState('')
  const [step,    setStep]    = useState('form') // 'form' | 'processing' | 'success'

  const focusProps = (name) => ({
    onFocus: () => setFocused(f => ({ ...f, [name]: true })),
    onBlur:  () => setFocused(f => ({ ...f, [name]: false })),
  })

  function handleChange(e) {
    const { name, value } = e.target
    let v = value
    if (name === 'card')   v = formatCard(value)
    if (name === 'expiry') v = formatExpiry(value)
    if (name === 'cvv')    v = value.replace(/\D/g, '').slice(0, 4)
    setForm(f => ({ ...f, [name]: v }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const rawCard = form.card.replace(/\s/g, '')
    if (rawCard.length < 16)    { setError('Número de tarjeta incompleto'); return }
    if (form.expiry.length < 5) { setError('Fecha de caducidad inválida'); return }
    if (form.cvv.length < 3)    { setError('CVV incorrecto'); return }
    if (!form.titular.trim())   { setError('Indica el titular de la tarjeta'); return }

    setStep('processing')
    try {
      // Simular latencia de pasarela de pago
      await new Promise(r => setTimeout(r, 1800))

      await registerApi({
        username:       state.username,
        email:          state.email,
        password:       state.password,
        company_name:   state.company_name,
        company_sector: state.company_sector,
        plan:           state.plan,
      })
      await login(state.username, state.password)
      setStep('success')
      setTimeout(() => navigate('/client/dashboard', { replace: true }), 2200)
    } catch (err) {
      setStep('form')
      setError(err?.response?.data?.detail || 'Error al procesar el registro. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#050505' }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 40% at 50% -5%, ${meta.bg.replace('0.06', '0.08')} 0%, transparent 70%)`,
      }} />

      <AnimatePresence mode="wait">
        {step === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl text-white mb-2">¡Pago completado!</h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Redirigiendo a tu dashboard...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg relative"
          >
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <img src="/logo.jpeg" alt="Logo"
                className="w-12 h-12 rounded-xl object-cover mb-3"
                style={{ border: '1px solid rgba(251,191,36,0.2)' }} />
              <h1 className="font-display font-black text-xl text-white">HONEYPOT</h1>
              <p className="font-bold text-xs tracking-[0.22em] mt-0.5" style={{ color: '#FBBF24' }}>CYBERSECURITY</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

              {/* Resumen del plan */}
              <div className="md:col-span-2 rounded-2xl p-5 flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Resumen
                  </p>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 rounded-lg" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                      <PlanIcon className="w-4 h-4" style={{ color: meta.color }} />
                    </div>
                    <span className="font-display font-bold text-sm text-white">{meta.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-display font-black text-3xl" style={{ color: meta.color }}>
                      €{meta.price}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>/{meta.period}</span>
                  </div>
                  <div className="space-y-2">
                    {meta.features.map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full" style={{ background: meta.color }} />
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    <Lock className="w-3 h-3" />
                    Pago seguro · SSL cifrado
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    <Shield className="w-3 h-3" />
                    Cancela cuando quieras
                  </div>
                </div>
              </div>

              {/* Formulario de pago */}
              <div className="md:col-span-3 rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.07)' }}>

                <p className="text-[10px] font-black uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Datos de pago
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Titular */}
                  <div>
                    <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Titular de la tarjeta
                    </label>
                    <input
                      name="titular" type="text" required
                      value={form.titular} onChange={handleChange}
                      placeholder="Nombre tal como aparece en la tarjeta"
                      className="w-full rounded-xl px-4 py-3 text-sm"
                      style={inputCls(focused.titular)}
                      {...focusProps('titular')}
                    />
                  </div>

                  {/* Número de tarjeta */}
                  <div>
                    <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Número de tarjeta
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'rgba(255,255,255,0.18)' }} />
                      <input
                        name="card" type="text" inputMode="numeric" required
                        value={form.card} onChange={handleChange}
                        placeholder="0000 0000 0000 0000"
                        className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-mono tracking-wider"
                        style={inputCls(focused.card)}
                        {...focusProps('card')}
                      />
                    </div>
                  </div>

                  {/* Caducidad + CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Caducidad
                      </label>
                      <input
                        name="expiry" type="text" inputMode="numeric" required
                        value={form.expiry} onChange={handleChange}
                        placeholder="MM/AA"
                        className="w-full rounded-xl px-4 py-3 text-sm font-mono"
                        style={inputCls(focused.expiry)}
                        {...focusProps('expiry')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        CVV
                      </label>
                      <input
                        name="cvv" type="text" inputMode="numeric" required
                        value={form.cvv} onChange={handleChange}
                        placeholder="•••"
                        className="w-full rounded-xl px-4 py-3 text-sm font-mono tracking-widest"
                        style={inputCls(focused.cvv)}
                        {...focusProps('cvv')}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl"
                        style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={step === 'processing'}
                    className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                    style={{
                      background: step === 'processing'
                        ? 'rgba(251,191,36,0.15)'
                        : 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                      color: '#000',
                      boxShadow: step === 'processing' ? 'none' : '0 4px 28px rgba(251,191,36,0.3)',
                    }}
                  >
                    {step === 'processing' ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                        Procesando pago...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pagar €{meta.price}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.18)' }}>
                    Entorno de demostración · No se realizarán cargos reales
                  </p>
                </form>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <Link to={`/register?plan=${state.plan}`} className="flex items-center gap-1 hover:text-white transition-colors">
                <ArrowLeft className="w-3 h-3" />
                Volver al registro
              </Link>
              <span>·</span>
              <Link to="/pricing" className="hover:text-white transition-colors">Ver planes</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
