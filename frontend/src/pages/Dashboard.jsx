import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getSummary, getTimeline, getHoneypots, getCountries, getAttacks } from '../services/api'
import { connectWS, onAttack, offAttack } from '../services/websocket'
import StatsCards    from '../components/Dashboard/StatsCards'
import TimelineChart from '../components/Dashboard/TimelineChart'
import HoneypotChart from '../components/Dashboard/HoneypotChart'
import AttackMap     from '../components/Dashboard/AttackMap'
import RecentAttacks from '../components/Dashboard/RecentAttacks'
import { Shield, Activity, Search, Filter } from 'lucide-react'

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-2 pb-20"
    >
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-white tracking-tight mb-2">
            Global Intelligence <span className="text-glow-cyan text-cyan-400">Dashboard</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl">
            Real-time analysis of decentralized honeypot nodes. Monitoring global threat vectors, 
            ingress patterns, and classification of automated attack frameworks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
          </button>
          <button className="btn-premium">
            <Search className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-bold">Search Assets</span>
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <AttackMap countries={countries} />
        </div>
        <div className="space-y-8">
          <HoneypotChart data={honeypots} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <TimelineChart data={timeline} />
        </div>
        <div className="glass-card flex flex-col justify-center gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Shield className="w-32 h-32 text-cyan-400" />
          </div>
          <div className="relative z-10">
            <div className="p-3 rounded-2xl bg-cyan-500/10 w-fit mb-4">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">Security Posture</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              All sensors are reporting active telemetry. Network latency is within nominal parameters (14ms avg).
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-slate-500">Sensor Uptime</span>
                <span className="text-emerald-500">99.98%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="w-[99%] h-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecentAttacks attacks={attacks} />
    </motion.div>
  )
}
