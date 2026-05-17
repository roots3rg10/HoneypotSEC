import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Mail, Building2, Briefcase, ChevronRight,
  AlertCircle, BookOpen, Shield, Zap, ArrowRight,
} from 'lucide-react'
import { registerFreeApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PLAN_META = {
  freemium: {
    name: 'Cuenta gratuita',
    desc: 'Tests · Artículos · Preview del dashboard',
    icon: BookOpen,
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.06)',
    border: 'rgba(96,165,250,0.2)',
    price: null,
  },
  basico: {
    name: 'Plan Básico',
    desc: '2 sensores · Dashboard · Alertas email',
    icon: Shield,
    color: 'rgba(148,163,184,0.9)',
    bg: 'rgba(148,163,184,0.06)',
    border: 'rgba(148,163,184,0.2)',
    price: '5 € / mes',
  },
  profesional: {
    name: 'Plan Profesional',
    desc: '6 sensores · Tiempo real · Informes PDF',
    icon: Zap,
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.06)',
    border: 'rgba(251,191,36,0.25)',
    price: '30 € / mes',
  },
  empresarial: {
    name: 'Plan Empresarial',
    desc: 'Sensores ilimitados · SLA 99.9% · 24/7',
    icon: Building2,
    color: '#fb7185',
    bg: 'rgba(251,113,133,0.06)',
    border: 'rgba(251,113,133,0.25)',
    price: '50 € / mes · contrato anual',
  },
}

const SECTORS = [
  'Tecnología y Software',
  'Banca y Finanzas',
  'Salud y Farmacéutica',
  'Energía e Infraestructuras',
  'Retail y E-commerce',
  'Educación',
  'Administración Pública',
  'Industria y Manufactura',
  'Telecomunicaciones',
  'Legal y Consultoría',
  'Transporte y Logística',
  'Otro',
]

const PAID_PLANS = ['basico', 'profesional', 'empresarial']

function inputStyle(focused) {
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

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10"
            style={{ color: 'rgba(255,255,255,0.18)' }} />
        )}
        {children}
      </div>
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [params] = useSearchParams()
  const plan = PAID_PLANS.includes(params.get('plan')) ? params.get('plan') : 'freemium'
  const isPaid = PAID_PLANS.includes(plan)
  const meta = PLAN_META[plan] || PLAN_META.freemium
  const PlanIcon = meta.icon

  const [form, setForm] = useState({
    username: '', password: '', confirm: '',
    email: '', company_name: '', company_sector: '',
  })
  const [focused, setFocused] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6)       { setError('La contraseña debe tener al menos 6 caracteres'); return }

    if (!isPaid) {
      // Registro freemium directo
      setLoading(true)
      try {
        await registerFreeApi({ username: form.username, password: form.password })
        await login(form.username, form.password)
        navigate('/client/dashboard', { replace: true })
      } catch (err) {
        setError(err?.response?.data?.detail || 'Error al crear la cuenta.')
      } finally {
        setLoading(false)
      }
      return
    }

    // Planes de pago — pasar datos al checkout
    if (!form.company_name.trim()) { setError('El nombre de empresa es obligatorio'); return }
    if (!form.company_sector)      { setError('Selecciona un sector'); return }
    if (!form.email.trim())        { setError('El email es obligatorio'); return }

    navigate('/payment', {
      state: {
        plan,
        username:       form.username,
        email:          form.email,
        password:       form.password,
        company_name:   form.company_name,
        company_sector: form.company_sector,
      },
    })
  }

  const focusProps = (name) => ({
    onFocus: () => setFocused(f => ({ ...f, [name]: true })),
    onBlur:  () => setFocused(f => ({ ...f, [name]: false })),
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#050505' }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 70% 45% at 50% -5%, ${meta.bg.replace('0.06', '0.09')} 0%, transparent 70%)`,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-4"
          >
            <div style={{
              position: 'absolute', inset: -12, borderRadius: '50%',
              background: `radial-gradient(circle, ${meta.bg.replace('0.06', '0.15')} 0%, transparent 70%)`,
            }} />
            <img src="/logo.jpeg" alt="Logo"
              className="w-14 h-14 rounded-2xl object-cover relative z-10"
              style={{ border: `1px solid ${meta.border}`, boxShadow: `0 8px 32px ${meta.bg}` }} />
          </motion.div>
          <h1 className="font-display font-black text-2xl text-white tracking-tight">HONEYPOT</h1>
          <p className="font-bold text-xs tracking-[0.22em] mt-0.5" style={{ color: '#FBBF24' }}>CYBERSECURITY</p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-7"
          style={{
            background: 'rgba(255,255,255,0.028)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.85)',
          }}
        >
          {/* Plan badge */}
          <div className="flex items-center justify-between gap-3 mb-7 pb-5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                <PlanIcon className="w-4 h-4" style={{ color: meta.color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{meta.name}</p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{meta.desc}</p>
              </div>
            </div>
            {meta.price && (
              <span className="text-xs font-black px-3 py-1 rounded-full shrink-0"
                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                {meta.price}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {isPaid && (
              <>
                {/* Empresa */}
                <Field label="Empresa" icon={Building2}>
                  <input
                    name="company_name" type="text" required
                    value={form.company_name} onChange={handleChange}
                    placeholder="Nombre de tu empresa"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                    style={inputStyle(focused.company_name)}
                    {...focusProps('company_name')}
                  />
                </Field>

                {/* Sector */}
                <Field label="Sector" icon={Briefcase}>
                  <select
                    name="company_sector" required
                    value={form.company_sector} onChange={handleChange}
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm appearance-none"
                    style={{ ...inputStyle(focused.company_sector), color: form.company_sector ? 'white' : 'rgba(255,255,255,0.3)' }}
                    {...focusProps('company_sector')}
                  >
                    <option value="" disabled>Selecciona tu sector</option>
                    {SECTORS.map(s => <option key={s} value={s} style={{ background: '#111', color: 'white' }}>{s}</option>)}
                  </select>
                </Field>

                {/* Email */}
                <Field label="Email corporativo" icon={Mail}>
                  <input
                    name="email" type="email" required
                    value={form.email} onChange={handleChange}
                    placeholder="correo@empresa.com"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                    style={inputStyle(focused.email)}
                    {...focusProps('email')}
                  />
                </Field>
              </>
            )}

            {/* Usuario */}
            <Field label="Usuario" icon={User}>
              <input
                name="username" type="text" autoComplete="username" required
                value={form.username} onChange={handleChange}
                placeholder="elige un nombre de usuario"
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                style={inputStyle(focused.username)}
                {...focusProps('username')}
              />
            </Field>

            {/* Contraseña */}
            <Field label="Contraseña" icon={Lock}>
              <input
                name="password" type="password" autoComplete="new-password" required
                value={form.password} onChange={handleChange}
                placeholder="mínimo 6 caracteres"
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                style={inputStyle(focused.password)}
                {...focusProps('password')}
              />
            </Field>

            {/* Confirmar */}
            <Field label="Confirmar contraseña" icon={Lock}>
              <input
                name="confirm" type="password" autoComplete="new-password" required
                value={form.confirm} onChange={handleChange}
                placeholder="repite la contraseña"
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                style={inputStyle(focused.confirm)}
                {...focusProps('confirm')}
              />
            </Field>

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
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-black mt-2 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
              style={{
                background: loading
                  ? 'rgba(251,191,36,0.15)'
                  : 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                color: '#000',
                boxShadow: loading ? 'none' : '0 4px 28px rgba(251,191,36,0.3)',
              }}
            >
              {loading ? 'Procesando...' : isPaid
                ? <><span>Continuar al pago</span><ArrowRight className="w-4 h-4" /></>
                : <><span>Crear cuenta</span><ChevronRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        </motion.div>

        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-bold hover:underline" style={{ color: '#FBBF24' }}>
            Iniciar sesión
          </Link>
        </p>
        <p className="text-center mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
          <Link to="/pricing" className="hover:text-white transition-colors">← Ver todos los planes</Link>
        </p>
      </motion.div>
    </div>
  )
}
