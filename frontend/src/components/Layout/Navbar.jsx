import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

const HP_LABELS = {
  cowrie: 'Cowrie — SSH / Telnet',
  dionaea: 'Dionaea — Multi-protocolo',
  glastopf: 'Glastopf — Web App',
  conpot: 'Conpot — ICS / SCADA',
  honeytrap: 'Honeytrap — TCP / UDP',
  honeyd: 'Honeyd — Red virtual',
}

function getTitle(pathname) {
  if (pathname.startsWith('/honeypots/')) {
    const name = pathname.split('/')[2]
    return HP_LABELS[name] ?? 'Honeypot'
  }
  const map = {
    '/dashboard': 'Dashboard',
    '/education': 'Centro Educativo',
    '/attacks':   'Detalle de ataque',
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
    <header className="h-14 bg-gray-900 border-b border-gray-700/50 flex items-center justify-between px-6 shrink-0">
      <h1 className="font-semibold text-gray-100 text-sm tracking-wide">{title}</h1>
      <div className="flex items-center gap-5 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sistema activo</span>
        </div>
        <span className="font-mono text-gray-500">
          {time.toLocaleTimeString('es-ES')}
        </span>
      </div>
    </header>
  )
}
