import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getSummary, getTimeline, getHoneypots, getCountries, getAttacks } from '../services/api'
import { connectWS, onAttack, offAttack } from '../services/websocket'
import StatsCards    from '../components/Dashboard/StatsCards'
import TimelineChart from '../components/Dashboard/TimelineChart'
import HoneypotChart from '../components/Dashboard/HoneypotChart'
import AttackMap     from '../components/Dashboard/AttackMap'
import RecentAttacks from '../components/Dashboard/RecentAttacks'
import { Shield, Activity, Search, SlidersHorizontal } from 'lucide-react'

export default function Dashboard() {
  const [stats,     setStats]     = useState(null)
  const [timeline,  setTimeline]  = useState([])
  const [honeypots, setHoneypots] = useState([])
  const [countries, setCountries] = useState([])
  const [attacks,   setAttacks]   = useState([])

  const load = useCallback(async () => {
    try {
      const [s, t, h, c, a] = await Promise.all([
        getSummary(), getTimeline(), getHoneypots(), getCountries(),
        getAttacks({ limit: 30 }),
      ])
      setStats(s.data)
      setTimeline(t.data)
      setHoneypots(h.data)
      setCountries(c.data)
      setAttacks(a.data.items)
    } catch (e) {
      console.error('Error cargando datos:', e)
    }
  }, [])

  useEffect(() => {
    load()
    connectWS()
    const handler = (newAttack) => {
      setAttacks(prev => [newAttack, ...prev].slice(0, 30))
      setStats(prev => prev ? { ...prev, total_attacks: prev.total_attacks + 1 } : prev)
    }
    onAttack(handler)
    const interval = setInterval(load, 30_000)
    return () => { offAttack(handler); clearInterval(interval) }
  }, [load])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-7 p-2 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h2 className="text-3xl font-display font-black text-white tracking-tight mb-1.5">
            Panel de inteligencia{' '}
            <span className="text-amber-400" style={{ textShadow: '0 0 24px rgba(251,191,36,0.4)' }}>
              global
            </span>
          </h2>
          <p className="text-sm font-medium max-w-2xl" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Análisis en tiempo real de los nodos honeypot distribuidos. Monitorización de vectores
            de amenaza globales, patrones de ataque y clasificación de frameworks automatizados.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button className="btn-outline">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Filtros</span>
          </button>
          <button className="btn-premium">
            <Search className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-bold">Buscar assets</span>
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
        <div className="xl:col-span-2"><AttackMap countries={countries} /></div>
        <div><HoneypotChart data={honeypots} /></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
        <div className="xl:col-span-2"><TimelineChart data={timeline} /></div>
        <div className="glass-card flex flex-col justify-center gap-5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Shield className="w-36 h-36 text-white" />
          </div>
          <div className="relative z-10">
            <div className="p-2.5 rounded-xl w-fit mb-4"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.12)' }}>
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">Estado de seguridad</h3>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Todos los sensores reportan telemetría activa. Latencia de red dentro de parámetros
              nominales (14ms media).
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>Disponibilidad de sensores</span>
                <span className="text-amber-400">99.98%</span>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="w-[99%] h-full rounded-full" style={{ background: 'linear-gradient(90deg, #FBBF24, #F59E0B)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecentAttacks attacks={attacks} />
    </motion.div>
  )
}
