import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  GraduationCap,
  Shield,
  Activity,
  Globe,
  Cpu,
  Layers,
  Zap,
  ChevronRight,
  Network,
} from 'lucide-react'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/education', label: 'Academia',   icon: GraduationCap   },
]

const HONEYPOTS = [
  { name: 'cowrie',    label: 'Cowrie',    desc: 'SSH / Telnet',   icon: Shield,   color: 'text-white',            bg: 'bg-white/8'  },
  { name: 'dionaea',   label: 'Dionaea',   desc: 'Multi-proto',    icon: Layers,   color: 'text-slate-300',        bg: 'bg-white/5'  },
  { name: 'glastopf',  label: 'Glastopf',  desc: 'Aplicación web', icon: Globe,    color: 'text-amber-400',        bg: 'bg-amber-400/8'  },
  { name: 'conpot',    label: 'Conpot',    desc: 'ICS / SCADA',    icon: Cpu,      color: 'text-rose-400',         bg: 'bg-rose-400/8'   },
  { name: 'honeytrap', label: 'Honeytrap', desc: 'TCP / UDP',      icon: Activity, color: 'text-amber-300',        bg: 'bg-amber-300/8'  },
  { name: 'honeyd',    label: 'Honeyd',    desc: 'Red virtual',    icon: Zap,      color: 'text-slate-400',        bg: 'bg-white/4'  },
]

export default function Sidebar() {
  return (
    <aside className="w-68 flex flex-col shrink-0 z-50"
      style={{ width: '272px', background: 'rgba(0,0,0,0.6)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="px-7 py-7 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <img src="/logo.jpeg" alt="Logo" className="w-9 h-9 rounded-lg object-cover" style={{ imageRendering: 'crisp-edges' }} />
          <div>
            <h2 className="font-display font-black text-base leading-none tracking-tight text-white">
              HONEYPOT
            </h2>
            <p className="text-[10px] font-bold tracking-[0.2em] mt-0.5" style={{ color: '#FBBF24' }}>
              CYBERSECURITY
            </p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-7 overflow-y-auto custom-scrollbar">
        <div>
          <p className="label-sm px-3 mb-3">Monitor principal</p>
          <div className="space-y-0.5">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium ${
                    isActive
                      ? 'text-amber-400 bg-amber-400/8 border border-amber-400/15'
                      : 'text-white/35 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 -translate-x-1 group-hover:opacity-30 group-hover:translate-x-0 transition-all" />
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <p className="label-sm px-3 mb-3">Nodos honeypot</p>
          <div className="space-y-0.5">
            {HONEYPOTS.map((hp) => (
              <NavLink
                key={hp.name}
                to={`/honeypots/${hp.name}`}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                    isActive
                      ? `bg-white/5 border border-white/10 ${hp.color}`
                      : 'text-white/35 hover:text-white hover:bg-white/4 border border-transparent'
                  }`
                }
              >
                <div className={`p-1.5 rounded-lg ${hp.bg} transition-colors`}>
                  <hp.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-none mb-0.5">{hp.label}</p>
                  <p className="text-[10px] text-white/25">{hp.desc}</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 shrink-0" />
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Status footer */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5 mb-2.5">
            <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-white uppercase tracking-wider">Estado de la red</p>
              <p className="text-[10px] text-white/30">Operacional estable</p>
            </div>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: '2px', background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FBBF24, #F59E0B)' }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
