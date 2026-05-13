import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, User, AlertCircle, Building2, Shield, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_TABS = [
  {
    id:    'empresa',
    label: 'Portal empresa',
    icon:  Building2,
    desc:  'Accede al panel de monitorización de tu infraestructura',
    accent: '#FBBF24',
    hint:  'Clientes con contrato activo',
  },
  {
    id:    'interno',
    label: 'Acceso interno',
    icon:  Shield,
    desc:  'Área reservada para el equipo de HoneypotSEC',
    accent: '#60a5fa',
    hint:  'Administradores y analistas',
  },
]

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [tab,     setTab]     = useState('empresa')
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const activeTab = ROLE_TABS.find(t => t.id === tab)
  const accent    = activeTab.accent

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const me = await login(form.username, form.password)
      if (me.role === 'client')        navigate('/client/dashboard', { replace: true })
      else if (me.role === 'employee') navigate('/academy',          { replace: true })
      else                             navigate('/dashboard',        { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Usuario o contraseña incorrectos.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#050505' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.jpeg" alt="Logo"
            className="w-16 h-16 rounded-2xl object-cover mb-5"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
          <h1 className="font-display font-black text-2xl text-white tracking-tight">HONEYPOT</h1>
          <p className="font-bold text-xs tracking-[0.2em] mt-1" style={{ color: '#FBBF24' }}>CYBERSECURITY</p>
        </div>

        {/* Selector de tipo de acceso */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {ROLE_TABS.map(t => {
            const Icon    = t.icon
            const active  = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError('') }}
                className="rounded-xl p-3 text-left transition-all duration-200 outline-none"
                style={{
                  background: active ? `${t.accent}10` : 'rgba(255,255,255,0.025)',
                  border:     active ? `1px solid ${t.accent}40` : '1px solid rgba(255,255,255,0.07)',
                  boxShadow:  active ? `0 0 20px ${t.accent}10` : 'none',
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg"
                    style={{ background: active ? `${t.accent}18` : 'rgba(255,255,255,0.04)' }}>
                    <Icon className="w-3.5 h-3.5"
                      style={{ color: active ? t.accent : 'rgba(255,255,255,0.3)' }} />
                  </div>
                  <span className="text-xs font-bold"
                    style={{ color: active ? t.accent : 'rgba(255,255,255,0.4)' }}>
                    {t.label}
                  </span>
                </div>
                <p className="text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {t.hint}
                </p>
              </button>
            )
          })}
        </div>

        {/* Descripción del acceso seleccionado */}
        <AnimatePresence mode="wait">
          <motion.p
            key={tab}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-center mb-6"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {activeTab.desc}
          </motion.p>
        </AnimatePresence>

        {/* Card del formulario */}
        <div className="rounded-2xl p-7 transition-all duration-300"
          style={{
            background:  'rgba(255,255,255,0.025)',
            border:      `1px solid ${accent}20`,
            boxShadow:   `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px ${accent}08`,
          }}>

          {/* Franja de color superior según rol */}
          <div className="flex items-center gap-2 mb-6 pb-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="p-1.5 rounded-lg" style={{ background: `${accent}15` }}>
              {tab === 'empresa'
                ? <Building2 className="w-3.5 h-3.5" style={{ color: accent }} />
                : <Shield    className="w-3.5 h-3.5" style={{ color: accent }} />}
            </div>
            <span className="text-xs font-bold" style={{ color: accent }}>
              {tab === 'empresa' ? 'Portal cliente' : 'Acceso restringido'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="label-sm block mb-1.5">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'rgba(255,255,255,0.2)' }} />
                <input
                  name="username" type="text" autoComplete="username"
                  required value={form.username} onChange={handleChange}
                  placeholder="usuario"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', caretColor: accent }}
                  onFocus={e => { e.target.style.borderColor = `${accent}50`; e.target.style.boxShadow = `0 0 0 3px ${accent}10` }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="label-sm block mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'rgba(255,255,255,0.2)' }} />
                <input
                  name="password" type="password" autoComplete="current-password"
                  required value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', caretColor: accent }}
                  onFocus={e => { e.target.style.borderColor = `${accent}50`; e.target.style.boxShadow = `0 0 0 3px ${accent}10` }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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
              className="w-full py-3 rounded-xl text-sm font-bold mt-1 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
              style={{
                background:  loading ? `${accent}20` : `linear-gradient(135deg, ${accent}ee, ${accent}bb)`,
                color:       tab === 'empresa' ? '#000' : '#fff',
                boxShadow:   loading ? 'none' : `0 4px 20px ${accent}30`,
              }}
            >
              {loading ? 'Verificando...' : (
                <>
                  {tab === 'empresa' ? 'Acceder al portal' : 'Entrar'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          ¿Eres empresa y no tienes cuenta?{' '}
          <Link to="/register" className="font-bold hover:underline transition-colors"
            style={{ color: '#FBBF24' }}>
            Crear cuenta gratuita
          </Link>
        </p>
        <p className="text-center mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
          <Link to="/" className="hover:text-white transition-colors">← Volver a la web</Link>
        </p>
      </motion.div>
    </div>
  )
}
