export default function StatsCards({ stats }) {
  if (!stats) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="card animate-pulse h-24 bg-dark-700" />
    ))}
  </div>

  const cards = [
    {
      label: 'Ataques totales',
      value: stats.total_attacks?.toLocaleString() ?? '—',
      icon: '⚡',
      color: 'text-danger',
    },
    {
      label: 'IPs únicas',
      value: stats.unique_ips?.toLocaleString() ?? '—',
      icon: '🌐',
      color: 'text-accent-500',
    },
    {
      label: 'Ataques hoy',
      value: stats.attacks_today?.toLocaleString() ?? '—',
      icon: '📅',
      color: 'text-warning',
    },
    {
      label: 'Top país atacante',
      value: stats.top_country ?? '—',
      icon: '🏴',
      color: 'text-purple-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="card">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{c.label}</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl">{c.icon}</span>
            <span className={`text-2xl font-bold ${c.color}`}>{c.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
