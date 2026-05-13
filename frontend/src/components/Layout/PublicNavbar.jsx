import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Menu, X, ChevronDown, LogOut, LayoutDashboard, GraduationCap, Building2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import ThemeToggle from '../ThemeToggle'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { to: '/honeypots', label: 'Honeypots' },
  { to: '/news',      label: 'Noticias'  },
  { to: '/academy',   label: 'Academia'  },
]

const ROLE_META = {
  admin:    { label: 'Admin',    color: '#fb7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.25)', icon: LayoutDashboard, dest: '/dashboard',        destLabel: 'Dashboard'      },
  client:   { label: 'Empresa',  color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  icon: Building2,        dest: '/client/dashboard', destLabel: 'Portal empresa' },
  employee: { label: 'Empleado', color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.25)', icon: GraduationCap,    dest: '/academy',          destLabel: 'Mi Academia'   },
}

function UserChip() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()
  const [open, setOpen]   = useState(false)
  const ref               = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const meta     = ROLE_META[user.role] || ROLE_META.employee
  const initials = user.username.slice(0, 2).toUpperCase()
  const DestIcon = meta.icon

  function handleLogout() {
    logout()
    navigate('/')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-150"
        style={{
          background: open ? meta.bg : 'var(--inset)',
          border: `1px solid ${open ? meta.border : 'var(--border)'}`,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background   = meta.bg
          e.currentTarget.style.borderColor  = meta.border
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.background  = 'var(--inset)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }
        }}
      >
        {/* Avatar */}
        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
          style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
          {initials}
        </div>
        {/* Name */}
        <span className="text-xs font-bold max-w-[90px] truncate" style={{ color: 'var(--txt)' }}>
          {user.username}
        </span>
        {/* Role badge */}
        <span className="hidden sm:inline-flex text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
          style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
          {meta.label}
        </span>
        <ChevronDown className="w-3 h-3 shrink-0 transition-transform duration-150"
          style={{ color: 'var(--txt-3)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl py-1.5 z-50 shadow-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>

          {/* User info header */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: 'var(--txt)' }}>{user.username}</p>
                <span className="text-[9px] font-black uppercase tracking-wider"
                  style={{ color: meta.color }}>{meta.label}</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="py-1.5">
            <Link to={meta.dest} onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-colors"
              style={{ color: 'var(--txt-2)' }}
              onMouseEnter={e => { e.currentTarget.style.color = meta.color; e.currentTarget.style.background = meta.bg }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt-2)'; e.currentTarget.style.background = 'transparent' }}>
              <DestIcon className="w-3.5 h-3.5 shrink-0" />
              {meta.destLabel}
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t pt-1.5" style={{ borderColor: 'var(--border)' }}>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-colors"
              style={{ color: 'var(--txt-3)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fb7185'; e.currentTarget.style.background = 'rgba(251,113,133,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt-3)'; e.currentTarget.style.background = 'transparent' }}>
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PublicNavbar() {
  const { pathname } = useLocation()
  const { isDark }   = useTheme()
  const { user }     = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.3s ease, border-color 0.2s ease',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <span className="font-display font-black text-sm tracking-tight leading-none block"
              style={{ color: 'var(--txt)' }}>HONEYPOT</span>
            <span className="font-bold text-[9px] tracking-[0.2em] leading-none block"
              style={{ color: 'var(--accent)' }}>CYBERSECURITY</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={
                pathname.startsWith(to)
                  ? { color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }
                  : { color: 'var(--txt-2)', border: '1px solid transparent' }
              }
              onMouseEnter={e => { if (!pathname.startsWith(to)) { e.currentTarget.style.color = 'var(--txt)'; e.currentTarget.style.background = 'var(--inset)' } }}
              onMouseLeave={e => { if (!pathname.startsWith(to)) { e.currentTarget.style.color = 'var(--txt-2)'; e.currentTarget.style.background = 'transparent' } }}
            >{label}</Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <UserChip />
          ) : (
            <Link to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
              onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(251,191,36,0.18)' : 'rgba(217,119,6,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)' }}
            >
              <Lock className="w-3.5 h-3.5" />
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          {user && <UserChip />}
          <button className="p-2 rounded-lg transition-colors" style={{ color: 'var(--txt-2)' }} onClick={() => setOpen(o => !o)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 py-4 flex flex-col gap-1.5"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--navbar-bg)' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={pathname.startsWith(to) ? { color: 'var(--accent)', background: 'var(--accent-dim)' } : { color: 'var(--txt-2)' }}>
              {label}
            </Link>
          ))}
          {!user && (
            <Link to="/login" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold mt-1"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
              <Lock className="w-3.5 h-3.5" />
              Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
