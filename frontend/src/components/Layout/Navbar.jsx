import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ShieldCheck, Search, Bell, LogOut } from 'lucide-react'

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
  const location = useLocation()
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
    <header className="h-18 flex items-center justify-between px-8 shrink-0 z-40"
      style={{
        height: '68px',
        background: 'rgba(5,5,5,0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>

      <div className="flex items-center gap-5">
        <AnimatePresence mode="wait">
          <motion.h1
            key={title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="font-display font-bold text-lg text-white tracking-tight"
          >
            {title}
          </motion.h1>
        </AnimatePresence>
        <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <ShieldCheck className="w-3 h-3 text-amber-400" />
          <span>Protección activa en tiempo real</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <button className="hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <Search className="w-4 h-4" />
          </button>
          <button className="relative hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </button>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-400/5"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.07)' }} />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-mono font-medium text-white tracking-wider">
              {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Hora del sistema
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
