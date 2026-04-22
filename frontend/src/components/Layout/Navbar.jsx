import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ShieldCheck, Search, Bell } from 'lucide-react'

const HP_LABELS = {
  cowrie: 'Cowrie Tactical Node',
  dionaea: 'Dionaea Multi-Threat',
  glastopf: 'Glastopf Web Ingress',
  conpot: 'Conpot Industrial ICS',
  honeytrap: 'Honeytrap Global Sink',
  honeyd: 'Honeyd Virtual Fabric',
}

function getTitle(pathname) {
  if (pathname.startsWith('/honeypots/')) {
    const name = pathname.split('/')[2]
    return HP_LABELS[name] ?? 'Active Node'
  }
  const map = {
    '/dashboard': 'Intelligence Command',
    '/education': 'Knowledge Base',
    '/attacks':   'Threat Analysis',
  }
  return Object.entries(map).find(([k]) => pathname.startsWith(k))?.[1] ?? 'HoneyWatch'
}

export default function Navbar() {
  const location = useLocation()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const title = getTitle(location.pathname)

  return (
    <header className="h-20 bg-slate-950/20 backdrop-blur-sm flex items-center justify-between px-10 shrink-0 z-40">
      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.h1 
            key={title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="font-display font-bold text-xl text-white tracking-tight"
          >
            {title}
          </motion.h1>
        </AnimatePresence>
        <div className="h-4 w-[1px] bg-slate-800 hidden md:block" />
        <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Real-time protection active</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search & Notifications (Mockup) */}
        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-cyan-400 transition-colors"><Search className="w-5 h-5" /></button>
          <button className="relative hover:text-cyan-400 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950" />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-mono font-medium text-white tracking-wider">
              {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">System Time</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
