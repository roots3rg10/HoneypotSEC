import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const titles = {
  '/dashboard': 'Dashboard de Ataques',
  '/education': 'Centro Educativo',
}

export default function Navbar() {
  const location = useLocation()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const title = Object.entries(titles).find(([k]) => location.pathname.startsWith(k))?.[1] ?? 'HoneyWatch'

  return (
    <header className="h-14 bg-dark-800 border-b border-dark-600 flex items-center justify-between px-6">
      <h1 className="font-semibold text-gray-100">{title}</h1>
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Sistema activo
        </span>
        <span>{time.toLocaleTimeString('es-ES')}</span>
      </div>
    </header>
  )
}
