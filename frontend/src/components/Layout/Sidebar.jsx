import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/education', icon: '📚', label: 'Centro Educativo' },
]

const honeypots = [
  { name: 'Cowrie',    color: 'bg-blue-500',   desc: 'SSH/Telnet' },
  { name: 'Dionaea',   color: 'bg-purple-500',  desc: 'Multi-protocolo' },
  { name: 'Honeytrap', color: 'bg-yellow-500',  desc: 'TCP/UDP' },
  { name: 'Glastopf',  color: 'bg-green-500',   desc: 'Web App' },
  { name: 'Conpot',    color: 'bg-red-500',      desc: 'ICS/SCADA' },
  { name: 'Honeyd',    color: 'bg-pink-500',     desc: 'Red virtual' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-dark-800 border-r border-dark-600 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-dark-600">
        <span className="text-accent-500 font-bold text-xl tracking-wide">🍯 HoneyWatch</span>
        <p className="text-gray-500 text-xs mt-1">Plataforma de Honeypots</p>
      </div>

      {/* Navegación */}
      <nav className="p-3 flex-1">
        <p className="text-gray-500 text-xs uppercase tracking-widest px-2 mb-2">Navegación</p>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 transition-colors
               ${isActive
                 ? 'bg-accent-500 text-dark-900 font-semibold'
                 : 'text-gray-300 hover:bg-dark-700'}`
            }
          >
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}

        {/* Honeypots activos */}
        <p className="text-gray-500 text-xs uppercase tracking-widest px-2 mt-5 mb-2">Honeypots</p>
        {honeypots.map(h => (
          <div key={h.name} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400">
            <span className={`w-2 h-2 rounded-full ${h.color} animate-pulse`} />
            <span className="font-medium text-gray-200">{h.name}</span>
            <span className="text-gray-500 text-xs ml-auto">{h.desc}</span>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-600 text-xs text-gray-500 text-center">
        Proyecto Final de Curso
      </div>
    </aside>
  )
}
