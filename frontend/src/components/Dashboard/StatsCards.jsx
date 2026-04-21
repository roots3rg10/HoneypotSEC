const CARDS = [
  {
    key:   'total_attacks',
    label: 'Ataques totales',
    icon:  '⚡',
    gradient: 'from-rose-500/10 to-transparent',
    border:   'border-rose-500/20',
    color:    'text-rose-400',
    glow:     'shadow-[0_0_20px_rgba(244,63,94,0.1)]',
  },
  {
    key:   'unique_ips',
    label: 'IPs únicas',
    icon:  '🌐',
    gradient: 'from-cyan-500/10 to-transparent',
    border:   'border-cyan-500/20',
    color:    'text-cyan-400',
    glow:     'shadow-[0_0_20px_rgba(6,182,212,0.1)]',
  },
  {
    key:   'attacks_today',
    label: 'Ataques hoy',
    icon:  '📅',
    gradient: 'from-amber-500/10 to-transparent',
    border:   'border-amber-500/20',
    color:    'text-amber-400',
    glow:     'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
  },
  {
    key:   'top_country',
    label: 'Top país atacante',
    icon:  '🏴',
    gradient: 'from-violet-500/10 to-transparent',
    border:   'border-violet-500/20',
    color:    'text-violet-400',
    glow:     'shadow-[0_0_20px_rgba(139,92,246,0.1)]',
  },
]

export default function StatsCards({ stats }) {
  if (!stats) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card animate-pulse h-28" />
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(c => (
        <div key={c.key} className={`stat-card border ${c.border} ${c.glow}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} rounded-2xl pointer-events-none`} />
          <div className="relative">
            <p className="label-muted mb-3">{c.label}</p>
            <div className="flex items-end justify-between">
              <span className={`text-3xl font-bold ${c.color} tabular-nums`}>
                {stats[c.key]?.toLocaleString() ?? '—'}
              </span>
              <span className="text-2xl opacity-60">{c.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
