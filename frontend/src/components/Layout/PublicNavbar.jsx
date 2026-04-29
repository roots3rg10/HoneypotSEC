import { Link, useLocation } from 'react-router-dom'
import { Lock, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = [
  { to: '/honeypots', label: 'Honeypots' },
  { to: '/news',      label: 'Noticias'  },
]

export default function PublicNavbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(5,5,5,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <span className="font-display font-black text-sm text-white tracking-tight leading-none block">
              HONEYPOT
            </span>
            <span className="font-bold text-[9px] tracking-[0.2em] leading-none block" style={{ color: '#FBBF24' }}>
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                pathname.startsWith(to)
                  ? 'text-white bg-white/6 border border-white/10'
                  : 'text-white/40 hover:text-white hover:bg-white/4'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150"
            style={{
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.2)',
              color: '#FBBF24',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(251,191,36,0.18)'
              e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(251,191,36,0.1)'
              e.currentTarget.style.borderColor = 'rgba(251,191,36,0.2)'
            }}
          >
            <Lock className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-white/40 hover:text-white transition-colors"
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 py-4 flex flex-col gap-1.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(5,5,5,0.95)' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname.startsWith(to) ? 'text-white bg-white/6' : 'text-white/40 hover:text-white hover:bg-white/4'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold mt-1"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#FBBF24' }}
          >
            <Lock className="w-3.5 h-3.5" />
            Acceder al Dashboard
          </Link>
        </div>
      )}
    </header>
  )
}
