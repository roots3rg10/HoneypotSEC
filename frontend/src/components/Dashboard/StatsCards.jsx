import { motion } from 'framer-motion'
import { Zap, Globe, Calendar, Flag, TrendingUp } from 'lucide-react'

const CARDS = [
  { key: 'total_attacks', label: 'Total de ataques', icon: Zap,      accent: '#FBBF24' },
  { key: 'unique_ips',    label: 'IPs únicas',       icon: Globe,    accent: '#ffffff' },
  { key: 'attacks_today', label: 'Actividad (24h)',  icon: Calendar, accent: '#FBBF24' },
  { key: 'top_country',   label: 'País principal',   icon: Flag,     accent: '#ffffff' },
]

const container = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function StatsCards({ stats }) {
  if (!stats) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 rounded-2xl animate-pulse"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
      ))}
    </div>
  )

  return (
    <motion.div
      variants={container} initial="hidden" animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {CARDS.map(c => (
        <motion.div
          key={c.key}
          variants={item}
          className="glass-card-accent"
        >
          <div className="flex items-center justify-between mb-5">
            <span className="label-sm">{c.label}</span>
            <div className="p-2 rounded-xl" style={{ background: `${c.accent}10`, border: `1px solid ${c.accent}18` }}>
              <c.icon className="w-4 h-4" style={{ color: c.accent }} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="stat-value" style={{ color: c.accent }}>
                {stats[c.key]?.toLocaleString('es-ES') ?? '—'}
              </h3>
              <div className="flex items-center gap-1 mt-1.5">
                <TrendingUp className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 tracking-wider">+12.5%</span>
              </div>
            </div>
            <div className="w-12 h-7 flex items-end gap-[2px] opacity-20">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{ height: `${25 + Math.random() * 75}%`, background: c.accent }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
