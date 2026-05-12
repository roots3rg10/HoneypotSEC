import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Cpu,
  Bell,
  FileText,
  User,
  LogOut,
  Building2,
  Headphones,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { hasPlan } from '../PlanGate'

const NAV = [
  { to: '/client/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/client/sensors',   label: 'Mis Sensores',  icon: Cpu },
  { to: '/client/alerts',    label: 'Alertas',       icon: Bell },
  { to: '/client/reports',   label: 'Informes',      icon: FileText },
  { to: '/client/account',   label: 'Mi Cuenta',     icon: User },
]

export default function ClientSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const planBadge = { basico: 'Básico', profesional: 'Pro', empresarial: 'Enterprise' }
  const planColor = {
    basico:      { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
    profesional: { bg: 'rgba(251,191,36,0.15)',  color: '#FBBF24' },
    empresarial: { bg: 'rgba(251,113,133,0.15)', color: '#fb7185' },
  }
  const badge = planColor[user?.plan] || planColor.basico
  const isEnterprise = hasPlan(user?.plan, 'empresarial')

  return (
    <aside className="w-68 flex flex-col shrink-0 z-50"
      style={{ width: '272px', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', transition: 'background 0.3s ease' }}>

      {/* Logo + empresa */}
      <div className="px-7 py-7 border-b" style={{ borderColor: 'var(--card-header-border)' }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-black text-sm leading-none tracking-tight text-white truncate">
              {user?.company_name || 'Mi Empresa'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: badge.bg, color: badge.color }}>
                {planBadge[user?.plan] || 'Básico'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'text-amber-400'
                  : 'text-white/50 hover:text-white/80'
              }`
            }
            style={({ isActive }) => isActive
              ? { background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }
              : { background: 'transparent', border: '1px solid transparent' }
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Soporte dedicado — solo Enterprise */}
      {isEnterprise && (
        <div className="px-4 pb-3">
          <a href="mailto:soporte@honeypotsec.io"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 w-full"
            style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}>
            <Headphones className="w-4 h-4 shrink-0" />
            Soporte dedicado
          </a>
        </div>
      )}

      {/* User + logout */}
      <div className="px-4 py-5 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
            style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24' }}>
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white/80 truncate">{user?.username}</p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-white/40 hover:text-rose-400"
          style={{ border: '1px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.06)'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}>
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
