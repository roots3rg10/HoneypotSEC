import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, ChevronRight, AlertCircle, BookOpen } from 'lucide-react'
import { registerFreeApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form,    setForm]    = useState({ username: '', password: '', confirm: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6)       { setError('La contraseña debe tener al menos 6 caracteres'); return }

    setLoading(true)
    try {
      await registerFreeApi({ username: form.username, password: form.password })
      await login(form.username, form.password)
      navigate('/academy', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Error al crear la cuenta. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#050505' }}>

      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(251,191,36,0.07) 0%, transparent 70%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-5"
          >
            <div style={{
              position: 'absolute', inset: -12, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)',
            }} />
            <img src="/logo.jpeg" alt="Logo"
              className="w-16 h-16 rounded-2xl object-cover relative z-10"
              style={{ border: '1px solid rgba(251,191,36,0.2)', boxShadow: '0 8px 32px rgba(251,191,36,0.1)' }} />
          </motion.div>
          <h1 className="font-display font-black text-2xl text-white tracking-tight">HONEYPOT</h1>
          <p className="font-bold text-xs tracking-[0.22em] mt-1" style={{ color: '#FBBF24' }}>CYBERSECURITY</p>
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
          {/* Cabecera */}
          <div className="flex items-center gap-3 mb-7 pb-5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="p-2 rounded-xl" style={{ background: 'rgba(251,191,36,0.1)' }}>
              <BookOpen className="w-4 h-4" style={{ color: '#FBBF24' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Cuenta gratuita</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Tests · Artículos · Resultados guardados
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'rgba(255,255,255,0.18)' }} />
                <input
                  name="username" type="text" autoComplete="username"
                  required value={form.username} onChange={handleChange}
                  placeholder="elige un usuario"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={{ color: 'white', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', caretColor: '#FBBF24' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(251,191,36,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(251,191,36,0.08)' }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'rgba(255,255,255,0.18)' }} />
                <input
                  name="password" type="password" autoComplete="new-password"
                  required value={form.password} onChange={handleChange}
                  placeholder="mínimo 6 caracteres"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={{ color: 'white', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', caretColor: '#FBBF24' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(251,191,36,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(251,191,36,0.08)' }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'rgba(255,255,255,0.18)' }} />
                <input
                  name="confirm" type="password" autoComplete="new-password"
                  required value={form.confirm} onChange={handleChange}
                  placeholder="repite la contraseña"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={{ color: 'white', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', caretColor: '#FBBF24' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(251,191,36,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(251,191,36,0.08)' }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Error */}
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
                background: loading ? 'rgba(251,191,36,0.15)' : 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                color: '#000',
                boxShadow: loading ? 'none' : '0 4px 28px rgba(251,191,36,0.3)',
              }}
            >
              {loading ? 'Creando cuenta...' : <> Crear cuenta <ChevronRight className="w-4 h-4" /> </>}
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-bold transition-colors hover:underline" style={{ color: '#FBBF24' }}>
            Iniciar sesión
          </Link>
        </p>
        <p className="text-center mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
          <Link to="/" className="hover:text-white transition-colors">← Volver a la web</Link>
        </p>
      </motion.div>
    </div>
  )
}
