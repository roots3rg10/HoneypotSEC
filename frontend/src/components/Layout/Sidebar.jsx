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
  ChevronRight
} from 'lucide-react'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/education', label: 'Academy', icon: GraduationCap },
]

const HONEYPOTS = [
  { name: 'cowrie',    label: 'Cowrie',    desc: 'SSH / Telnet',   icon: Shield,   color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  { name: 'dionaea',   label: 'Dionaea',   desc: 'Multi-proto',    icon: Layers,   color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { name: 'glastopf',  label: 'Glastopf',  desc: 'Web App',        icon: Globe,    color: 'text-emerald-400',bg: 'bg-emerald-400/10' },
  { name: 'conpot',    label: 'Conpot',    desc: 'ICS / SCADA',    icon: Cpu,      color: 'text-rose-400',   bg: 'bg-rose-400/10' },
  { name: 'honeytrap', label: 'Honeytrap', desc: 'TCP / UDP',      icon: Activity, color: 'text-amber-400',  bg: 'bg-amber-400/10' },
  { name: 'honeyd',    label: 'Honeyd',    desc: 'Virtual Net',    icon: Zap,      color: 'text-pink-400',   bg: 'bg-pink-400/10' },
]

export default function Sidebar() {
  return (
    <aside className="w-72 bg-slate-950/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col shrink-0 z-50">
      {/* Logo Section */}
      <div className="px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg leading-tight tracking-tight text-white">
              Honey<span className="text-cyan-400">SEC</span>
            </h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Tactical Intelligence</p>
          </div>
        </motion.div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
        <div>
          <p className="label-sm px-4 mb-4">Main Monitor</p>
          <div className="space-y-1">
            {NAV_LINKS.map((link, idx) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium tracking-wide">{link.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all" />
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <p className="label-sm px-4 mb-4">Honeypot Nodes</p>
          <div className="space-y-1">
            {HONEYPOTS.map((hp) => (
              <NavLink
                key={hp.name}
                to={`/honeypots/${hp.name}`}
                className={({ isActive }) => `
                  group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive 
                    ? `bg-slate-900 border border-slate-700/50 shadow-lg shadow-black/20 ${hp.color}` 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <div className={`p-2 rounded-lg transition-colors ${hp.bg}`}>
                  <hp.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold tracking-wide leading-none mb-1">{hp.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{hp.desc}</p>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse`} />
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-6 mt-auto">
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Network Health</p>
              <p className="text-[10px] text-slate-500">Operational Stable</p>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '92%' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
