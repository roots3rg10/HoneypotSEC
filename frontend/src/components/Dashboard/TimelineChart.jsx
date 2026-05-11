import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { Activity, TrendingUp } from 'lucide-react'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from 'chart.js'
import { useTheme } from '../../context/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function TimelineChart({ data }) {
  const { isDark } = useTheme()

  const tick    = isDark ? 'rgba(255,255,255,0.2)'  : 'rgba(0,0,0,0.35)'
  const grid    = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)'
  const tooltipBg   = isDark ? '#0a0a0a' : '#ffffff'
  const tooltipBody = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'
  const tooltipBorder = isDark ? 'rgba(251,191,36,0.2)' : 'rgba(180,83,9,0.2)'
  const accentColor   = isDark ? '#FBBF24' : '#B45309'
  const pointHoverBg  = isDark ? '#050505' : '#ffffff'

  const peak = data?.length ? Math.max(...data.map(d => d.count)) : 0

  const chartData = useMemo(() => ({
    labels: (data ?? []).map(d => d.hour.slice(11, 16)),
    datasets: [{
      label: 'Hits',
      data:  (data ?? []).map(d => d.count),
      borderColor: accentColor,
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 240)
        gradient.addColorStop(0,   isDark ? 'rgba(251,191,36,0.2)' : 'rgba(180,83,9,0.15)')
        gradient.addColorStop(0.6, isDark ? 'rgba(251,191,36,0.04)' : 'rgba(180,83,9,0.03)')
        gradient.addColorStop(1,   'rgba(0,0,0,0)')
        return gradient
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: pointHoverBg,
      pointHoverBorderColor: accentColor,
      pointHoverBorderWidth: 2,
      borderWidth: 2,
    }],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data, isDark])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        ticks: { color: tick, maxTicksLimit: 12, font: { size: 10, weight: '600' } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: { color: tick, font: { size: 10, weight: '600' }, maxTicksLimit: 5 },
        grid: { color: grid, drawBorder: false },
        border: { display: false },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleFont: { family: 'Outfit', size: 12, weight: 'bold' },
        bodyFont:  { family: 'JetBrains Mono', size: 11 },
        titleColor: accentColor,
        bodyColor: tooltipBody,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
  }), [isDark])

  if (!data?.length) return (
    <div className="glass-card flex flex-col items-center justify-center h-56 gap-3"
      style={{ color: 'var(--txt-3)' }}>
      <Activity className="w-7 h-7 opacity-20" />
      <p className="text-[10px] font-bold uppercase tracking-widest">Sin datos de actividad disponibles</p>
    </div>
  )

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--txt)' }}>Velocidad de amenazas</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt-3)' }}>
              Distribución temporal (24h)
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-display font-black leading-none" style={{ color: 'var(--txt)' }}>{peak.toLocaleString('es-ES')}</p>
          <p className="text-[10px] font-bold uppercase tracking-tighter text-amber-400">Pico de ataques / hora</p>
        </div>
      </div>

      <div className="h-[240px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
