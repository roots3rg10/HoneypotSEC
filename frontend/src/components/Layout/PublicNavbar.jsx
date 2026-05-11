import { Link, useLocation } from 'react-router-dom'
import { Lock, Menu, X } from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from '../ThemeToggle'
import { useTheme } from '../../context/ThemeContext'

const NAV_LINKS = [
  { to: '/honeypots', label: 'Honeypots' },
  { to: '/news',      label: 'Noticias'  },
]

export default function PublicNavbar() {
  const { pathname } = useLocation()
  const { isDark } = useTheme()
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
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <span className="font-display font-black text-sm tracking-tight leading-none block"
              style={{ color: 'var(--txt)' }}>
              HONEYPOT
            </span>
            <span className="font-bold text-[9px] tracking-[0.2em] leading-none block"
              style={{ color: 'var(--accent)' }}>
              CYBERSECURITY
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={
                pathname.startsWith(to)
                  ? { color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }
                  : { color: 'var(--txt-2)', border: '1px solid transparent' }
              }
              onMouseEnter={e => {
                if (!pathname.startsWith(to)) {
                  e.currentTarget.style.color = 'var(--txt)'
                  e.currentTarget.style.background = 'var(--inset)'
                }
              }}
              onMouseLeave={e => {
                if (!pathname.startsWith(to)) {
                  e.currentTarget.style.color = 'var(--txt-2)'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: toggle + CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150"
            style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = isDark ? 'rgba(251,191,36,0.18)' : 'rgba(217,119,6,0.18)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--accent-dim)'
            }}
          >
            <Lock className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--txt-2)' }}
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-6 py-4 flex flex-col gap-1.5"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--navbar-bg)' }}
        >
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={
                pathname.startsWith(to)
                  ? { color: 'var(--accent)', background: 'var(--accent-dim)' }
                  : { color: 'var(--txt-2)' }
              }
            >
              {label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold mt-1"
            style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent)',
            }}
          >
            <Lock className="w-3.5 h-3.5" />
            Acceder al Dashboard
          </Link>
        </div>
      )}
    </header>
  )
}
