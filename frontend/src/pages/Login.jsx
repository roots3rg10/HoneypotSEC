import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, User, AlertCircle } from 'lucide-react'

const CREDENTIALS = { username: 'usuario', password: 'honeypot' }

export default function Login() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (form.username === CREDENTIALS.username && form.password === CREDENTIALS.password) {
        localStorage.setItem('auth', 'true')
        navigate('/dashboard', { replace: true })
      } else {
        setError('Usuario o contraseña incorrectos.')
        setLoading(false)
      }
    }, 400)
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
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.jpeg" alt="Logo" className="w-16 h-16 rounded-2xl object-cover mb-5"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
          <h1 className="font-display font-black text-2xl text-white tracking-tight">HONEYPOT</h1>
          <p className="font-bold text-xs tracking-[0.2em] mt-1" style={{ color: '#FBBF24' }}>CYBERSECURITY</p>
          <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Acceso al panel de control</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-sm block mb-2">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={form.username}
                  onChange={handleChange}
                  placeholder="usuario"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white transition-colors outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    caretColor: '#FBBF24',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(251,191,36,0.4)'
                    e.target.style.boxShadow   = '0 0 0 3px rgba(251,191,36,0.08)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.boxShadow   = 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="label-sm block mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white transition-colors outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    caretColor: '#FBBF24',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(251,191,36,0.4)'
                    e.target.style.boxShadow   = '0 0 0 3px rgba(251,191,36,0.08)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.boxShadow   = 'none'
                  }}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full py-3 rounded-xl text-sm mt-2 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <Link to="/" className="hover:text-white transition-colors">← Volver a la web</Link>
        </p>
      </motion.div>
    </div>
  )
}
