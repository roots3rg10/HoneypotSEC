import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ShieldCheck, Bell, LogOut } from 'lucide-react'
import ThemeToggle from '../ThemeToggle'

const HP_LABELS = {
  cowrie:    'Cowrie Tactical Node',
  dionaea:   'Dionaea Multi-Threat',
  glastopf:  'Glastopf Web Ingress',
  conpot:    'Conpot Industrial ICS',
  honeytrap: 'Honeytrap Global Sink',
  honeyd:    'Honeyd Virtual Fabric',
}

function getTitle(pathname) {
  if (pathname.startsWith('/honeypots/')) {
    const name = pathname.split('/')[2]
    return HP_LABELS[name] ?? 'Nodo Activo'
  }
  const map = {
    '/dashboard': 'Mando de Inteligencia',
    '/education': 'Base de Conocimiento',
    '/attacks':   'Análisis de Amenazas',
  }
  return Object.entries(map).find(([k]) => pathname.startsWith(k))?.[1] ?? 'HoneyWatch'
}

export default function Navbar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const [time, setTime] = useState(new Date())

  function handleLogout() {
    localStorage.removeItem('auth')
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const title = getTitle(location.pathname)

  return (
    <header
      className="flex items-center justify-between px-8 shrink-0 z-40"
      style={{
        height: '68px',
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--card-header-border)',
        transition: 'background 0.3s ease, border-color 0.2s ease',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-5">
        <AnimatePresence mode="wait">
          <motion.h1
            key={title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="font-display font-bold text-lg tracking-tight"
            style={{ color: 'var(--txt)' }}
          >
            {title}
          </motion.h1>
        </AnimatePresence>
        <div
          className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold"
          style={{ color: 'var(--txt-3)' }}
        >
          <div className="w-px h-3" style={{ background: 'var(--border-strong)' }} />
          <ShieldCheck className="w-3 h-3 text-amber-400" />
          <span>Protección activa en tiempo real</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* Botones de acción */}
        <div className="flex items-center gap-1" style={{ color: 'var(--txt-2)' }}>
          <button
            className="relative p-2 rounded-xl transition-all duration-150"
            style={{ border: '1px solid transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--inset)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            <Bell className="w-4 h-4" />
            <span
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400"
              style={{ boxShadow: '0 0 4px rgba(251,191,36,0.6)' }}
            />
          </button>

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 rounded-xl transition-all duration-150"
            style={{ border: '1px solid transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-dim)'; e.currentTarget.style.borderColor = 'var(--danger-border)'; e.currentTarget.style.color = 'var(--danger)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--txt-2)' }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle de tema */}
        <ThemeToggle />

        {/* Divisor */}
        <div className="w-px h-6" style={{ background: 'var(--border-strong)' }} />

        {/* Reloj */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-mono font-medium tracking-wider" style={{ color: 'var(--txt)' }}>
              {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt-3)' }}>
              Hora del sistema
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
          >
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
