import { useEffect, useState, useCallback } from 'react'
import { getSummary, getTimeline, getHoneypots, getCountries, getAttacks } from '../services/api'
import { connectWS, onAttack, offAttack } from '../services/websocket'
import StatsCards    from '../components/Dashboard/StatsCards'
import TimelineChart from '../components/Dashboard/TimelineChart'
import HoneypotChart from '../components/Dashboard/HoneypotChart'
import AttackMap     from '../components/Dashboard/AttackMap'
import RecentAttacks from '../components/Dashboard/RecentAttacks'

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
    <div className="space-y-6">
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><AttackMap countries={countries} /></div>
        <HoneypotChart data={honeypots} />
      </div>

      <TimelineChart data={timeline} />

      <RecentAttacks attacks={attacks} />
    </div>
  )
}
