import { motion } from 'framer-motion'
import { Zap, Globe, Calendar, Flag, TrendingUp, ShieldAlert } from 'lucide-react'

const CARDS = [
  {
    key:   'total_attacks',
    label: 'Total Ingress',
    icon:  Zap,
    color: 'text-rose-400',
    bg:    'bg-rose-500/10',
    border:'border-rose-500/20',
    glow:  'shadow-rose-500/10'
  },
  {
    key:   'unique_ips',
    label: 'Unique Vectors',
    icon:  Globe,
    color: 'text-cyan-400',
    bg:    'bg-cyan-500/10',
    border:'border-cyan-500/20',
    glow:  'shadow-cyan-500/10'
  },
  {
    key:   'attacks_today',
    label: '24h Activity',
    icon:  Calendar,
    color: 'text-amber-400',
    bg:    'bg-amber-500/10',
    border:'border-amber-500/20',
    glow:  'shadow-amber-500/10'
  },
  {
    key:   'top_country',
    label: 'Primary Origin',
    icon:  Flag,
    color: 'text-indigo-400',
    bg:    'bg-indigo-500/10',
    border:'border-indigo-500/20',
    glow:  'shadow-indigo-500/10'
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function StatsCards({ stats }) {
  if (!stats) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
      ))}
    </div>
  )

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {CARDS.map(c => (
        <motion.div 
          key={c.key} 
          variants={item}
          className={`glass-card-accent border ${c.border} shadow-xl ${c.glow}`}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="label-sm">{c.label}</span>
              <div className={`p-2 rounded-xl ${c.bg}`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <h3 className={`stat-value ${c.color}`}>
                  {stats[c.key]?.toLocaleString() ?? '—'}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-500 tracking-wider">+12.5%</span>
                </div>
              </div>
              
              <div className="w-12 h-6 flex items-end gap-[2px]">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-t-sm ${c.color} opacity-20`}
                    style={{ height: `${20 + Math.random() * 80}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
