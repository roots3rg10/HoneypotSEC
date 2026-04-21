import { NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: <IconGrid /> },
  { to: '/education', label: 'Centro Educativo', icon: <IconBook /> },
]

const HONEYPOTS = [
  { name: 'cowrie',    label: 'Cowrie',    desc: 'SSH / Telnet',   color: 'bg-blue-500',    text: 'text-blue-400',   border: 'border-blue-500/30'   },
  { name: 'dionaea',   label: 'Dionaea',   desc: 'Multi-protocolo',color: 'bg-violet-500',  text: 'text-violet-400', border: 'border-violet-500/30' },
  { name: 'glastopf',  label: 'Glastopf',  desc: 'Web App',        color: 'bg-emerald-500', text: 'text-emerald-400',border: 'border-emerald-500/30'},
  { name: 'conpot',    label: 'Conpot',    desc: 'ICS / SCADA',    color: 'bg-rose-500',    text: 'text-rose-400',   border: 'border-rose-500/30'   },
  { name: 'honeytrap', label: 'Honeytrap', desc: 'TCP / UDP',      color: 'bg-amber-500',   text: 'text-amber-400',  border: 'border-amber-500/30'  },
  { name: 'honeyd',    label: 'Honeyd',    desc: 'Red virtual',    color: 'bg-pink-500',    text: 'text-pink-400',   border: 'border-pink-500/30'   },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700/50 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <span className="text-cyan-400 text-base">⬡</span>
          </div>
          <div>
            <p className="text-gray-100 font-bold text-sm tracking-wide">HoneyWatch</p>
            <p className="text-gray-500 text-xs">Plataforma de Honeypots</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Navegación principal */}
        <p className="label-muted px-3 mb-2">Navegación</p>
        {NAV_LINKS.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <span className="w-4 h-4 shrink-0 text-gray-400">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}

        {/* Honeypots */}
        <p className="label-muted px-3 pt-5 pb-2">Honeypots activos</p>
        {HONEYPOTS.map(h => (
          <NavLink
            key={h.name}
            to={`/honeypots/${h.name}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-150 group
               ${isActive
                 ? `bg-gray-750 border ${h.border} ${h.text}`
                 : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'}`
            }
          >
            <span className={`w-2 h-2 rounded-full ${h.color} shrink-0 animate-pulse`} />
            <span className="font-medium flex-1">{h.label}</span>
            <span className="text-gray-600 text-xs group-hover:text-gray-400 transition-colors">{h.desc}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-700/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-gray-500 text-xs">11 contenedores activos</span>
        </div>
      </div>
    </aside>
  )
}

function IconGrid() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M2 2.5A1.5 1.5 0 013.5 1h9A1.5 1.5 0 0114 2.5v11a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 13.5v-11z" />
      <path d="M5 5h6M5 8h6M5 11h4" />
    </svg>
  )
}
