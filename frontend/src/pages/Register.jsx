import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, User, Mail, Lock, ChevronRight, Check, AlertCircle } from 'lucide-react'
import { registerApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const SECTORS = [
  'Tecnología y Software', 'Banca y Finanzas', 'Salud y Farmacia',
  'Industria y Manufactura', 'Energía e Infraestructura', 'Retail y eCommerce',
  'Educación', 'Administración Pública', 'Telecomunicaciones', 'Otro',
]

const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    price: 'Gratis',
    features: ['2 sensores activos', 'Dashboard de amenazas', 'Alertas por email', 'Soporte comunidad'],
  },
  {
    id: 'profesional',
    name: 'Profesional',
    price: '€49/mes',
    highlight: true,
    features: ['6 sensores activos', 'Dashboard completo', 'Alertas en tiempo real', 'Informes mensuales', 'Soporte prioritario'],
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    price: '€149/mes',
    features: ['Sensores ilimitados', 'API de acceso', 'SLA 99.9%', 'Soporte dedicado 24/7', 'Onboarding personalizado'],
  },
]

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step,    setStep]    = useState(1) // 1: empresa, 2: cuenta, 3: plan
  const [form,    setForm]    = useState({
    company_name: '', company_sector: '', username: '', email: '', password: '', plan: 'profesional',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await registerApi(form)
      const { access_token } = res.data
      localStorage.setItem('token', access_token)
      // Refrescar contexto auth con el nuevo token
      await login(form.username, form.password)
      navigate('/client/dashboard', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error al crear la cuenta. Inténtalo de nuevo.'
      setError(msg)
      setLoading(false)
    }
  }

  const inputCls = "w-full rounded-xl px-4 py-3 text-sm transition-colors outline-none"
  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f8fafc',
    caretColor: '#FBBF24',
  }
  function focusStyle(e) {
    e.target.style.borderColor = 'rgba(251,191,36,0.45)'
    e.target.style.boxShadow   = '0 0 0 3px rgba(251,191,36,0.08)'
  }
  function blurStyle(e) {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
    e.target.style.boxShadow   = 'none'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#050505' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.jpeg" alt="Logo" className="w-14 h-14 rounded-2xl object-cover mb-4"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
          <h1 className="font-display font-black text-2xl text-white tracking-tight">Crear cuenta empresa</h1>
          <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Protección de ciberseguridad para tu organización
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Empresa', 'Cuenta', 'Plan'].map((label, i) => {
            const n = i + 1
            const done = step > n
            const active = step === n
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: done ? '#FBBF24' : active ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${done || active ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      color: done ? '#000' : active ? '#FBBF24' : 'rgba(255,255,255,0.3)',
                    }}>
                    {done ? <Check className="w-3.5 h-3.5" /> : n}
                  </div>
                  <span className="text-xs font-bold"
                    style={{ color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div className="w-8 h-px mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>

          {/* Step 1: Empresa */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <label className="label-sm block mb-2">Nombre de la empresa</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input
                    type="text" placeholder="Acme Corporation"
                    value={form.company_name}
                    onChange={e => set('company_name', e.target.value)}
                    className={`${inputCls} pl-10`} style={inputStyle}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </div>
              <div>
                <label className="label-sm block mb-2">Sector</label>
                <select
                  value={form.company_sector}
                  onChange={e => set('company_sector', e.target.value)}
                  className={inputCls} style={{ ...inputStyle, paddingLeft: '16px' }}
                  onFocus={focusStyle} onBlur={blurStyle}
                >
                  <option value="" style={{ background: '#111' }}>Selecciona tu sector</option>
                  {SECTORS.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
                </select>
              </div>
              <button
                onClick={() => {
                  if (!form.company_name.trim() || !form.company_sector) { setError('Completa todos los campos'); return }
                  setError(''); setStep(2)
                }}
                className="btn-premium w-full py-3 mt-2"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Cuenta */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <label className="label-sm block mb-2">Nombre de usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input
                    type="text" placeholder="admin_empresa"
                    value={form.username}
                    onChange={e => set('username', e.target.value)}
                    className={`${inputCls} pl-10`} style={inputStyle}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </div>
              <div>
                <label className="label-sm block mb-2">Email corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input
                    type="email" placeholder="admin@empresa.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className={`${inputCls} pl-10`} style={inputStyle}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </div>
              <div>
                <label className="label-sm block mb-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input
                    type="password" placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className={`${inputCls} pl-10`} style={inputStyle}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← Atrás</button>
                <button
                  onClick={() => {
                    if (!form.username.trim() || !form.email.trim() || form.password.length < 8) {
                      setError('Completa todos los campos (contraseña mínimo 8 caracteres)'); return
                    }
                    setError(''); setStep(3)
                  }}
                  className="btn-premium flex-[2] py-3"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Plan */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
              <div className="space-y-3 mb-6">
                {PLANS.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => set('plan', plan.id)}
                    className="rounded-xl p-4 cursor-pointer transition-all duration-150 relative"
                    style={{
                      background: form.plan === plan.id
                        ? 'rgba(251,191,36,0.07)'
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${form.plan === plan.id ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    {plan.highlight && (
                      <span className="absolute -top-2.5 left-4 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                        style={{ background: '#FBBF24', color: '#000' }}>
                        Recomendado
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: form.plan === plan.id ? '#FBBF24' : 'rgba(255,255,255,0.2)' }}>
                          {form.plan === plan.id && (
                            <div className="w-2 h-2 rounded-full" style={{ background: '#FBBF24' }} />
                          )}
                        </div>
                        <span className="font-display font-bold text-sm text-white">{plan.name}</span>
                      </div>
                      <span className="font-display font-black text-sm" style={{ color: '#FBBF24' }}>{plan.price}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 pl-7">
                      {plan.features.map(f => (
                        <span key={f} className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl mb-4"
                  style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline flex-1 py-3">← Atrás</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-premium flex-[2] py-3 disabled:opacity-50"
                >
                  {loading ? 'Creando cuenta...' : 'Activar cuenta →'}
                </button>
              </div>
            </motion.div>
          )}

          {error && step < 3 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl mt-4"
              style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </motion.div>
          )}
        </div>

        <p className="text-center mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-bold text-amber-400 hover:text-amber-300 transition-colors">
            Iniciar sesión
          </Link>
          {' · '}
          <Link to="/" className="hover:text-white transition-colors">Volver a la web</Link>
        </p>
      </motion.div>
    </div>
  )
}
